// SQLite Database Manager using sql.js (pure JavaScript - no C++ required!)
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const DB_PATH = path.join(__dirname, 'faucet.db');

class FaucetDatabase {
  constructor() {
    this.db = null;
    this.SQL = null;
  }

  async initialize() {
    // Initialize SQL.js
    this.SQL = await initSqlJs();

    // Load existing database or create new
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      this.db = new this.SQL.Database(buffer);
    } else {
      this.db = new this.SQL.Database();
    }

    this.initDatabase();
    this.saveDatabase();
  }

  // Initialize database tables
  initDatabase() {
    // Create transactions table with type field
    this.db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        address TEXT NOT NULL,
        amount INTEGER NOT NULL,
        tx_hash TEXT,
        status TEXT DEFAULT 'pending',
        type TEXT DEFAULT 'faucet_claim',
        ip_address TEXT,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create claims table for rate limiting
    this.db.run(`
      CREATE TABLE IF NOT EXISTS claims (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        address TEXT NOT NULL,
        ip_address TEXT,
        claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create deposits table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS deposits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_address TEXT,
        to_address TEXT NOT NULL,
        amount INTEGER NOT NULL,
        tx_hash TEXT UNIQUE,
        confirmations INTEGER DEFAULT 0,
        detected_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database initialized successfully (sql.js)');
  }

  // Save database to file
  saveDatabase() {
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }

  // Check if address can claim
  canClaim(address, ipAddress) {
    const cooldown = config.faucet.cooldownPeriod;
    const cutoffTime = new Date(Date.now() - cooldown).toISOString();

    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM claims 
      WHERE (address = ? OR ip_address = ?) AND claimed_at > ?
    `);

    stmt.bind([address, ipAddress, cutoffTime]);
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();

    return result.count === 0;
  }

  // Get time until next claim
  getTimeUntilNextClaim(address, ipAddress) {
    const cooldown = config.faucet.cooldownPeriod;

    const stmt = this.db.prepare(`
      SELECT claimed_at FROM claims 
      WHERE (address = ? OR ip_address = ?)
      ORDER BY claimed_at DESC 
      LIMIT 1
    `);

    stmt.bind([address, ipAddress]);
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();

    if (!result.claimed_at) return 0;

    const claimedAt = new Date(result.claimed_at).getTime();
    const nextClaimTime = claimedAt + cooldown;
    const now = Date.now();

    return Math.max(0, nextClaimTime - now);
  }

  // Record a faucet claim
  recordClaim(address, ipAddress) {
    this.db.run(`
      INSERT INTO claims (address, ip_address) VALUES (?, ?)
    `, [address, ipAddress]);
    this.saveDatabase();
  }

  // Add transaction record
  addTransaction(address, amount, txHash, status, ipAddress, type = 'faucet_claim', note = null) {
    this.db.run(`
      INSERT INTO transactions (address, amount, tx_hash, status, ip_address, type, note) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [address, amount, txHash, status, ipAddress, type, note]);
    this.saveDatabase();
  }

  // Update transaction status
  updateTransactionStatus(id, status, txHash = null) {
    if (txHash) {
      this.db.run(`UPDATE transactions SET status = ?, tx_hash = ? WHERE id = ?`, [status, txHash, id]);
    } else {
      this.db.run(`UPDATE transactions SET status = ? WHERE id = ?`, [status, id]);
    }
    this.saveDatabase();
  }

  // Get all transactions
  getAllTransactions(limit = 100, offset = 0, type = null) {
    let query = `SELECT * FROM transactions `;
    let params = [];

    if (type) {
      query += `WHERE type = ? `;
      params.push(type);
    }

    query += `ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const stmt = this.db.prepare(query);
    stmt.bind(params);

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();

    return results;
  }

  // Get transaction statistics
  getStatistics() {
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total_claims,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful_claims,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_sent,
        SUM(CASE WHEN type = 'faucet_claim' AND status = 'completed' THEN 1 ELSE 0 END) as faucet_claims,
        SUM(CASE WHEN type = 'admin_send' AND status = 'completed' THEN 1 ELSE 0 END) as admin_sends,
        SUM(CASE WHEN type = 'faucet_claim' AND status = 'completed' THEN amount ELSE 0 END) as faucet_sent,
        SUM(CASE WHEN type = 'admin_send' AND status = 'completed' THEN amount ELSE 0 END) as admin_sent,
        MAX(created_at) as last_claim
      FROM transactions
    `);

    stmt.step();
    const stats = stmt.getAsObject();
    stmt.free();

    // Get deposit statistics
    const depositStmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total_deposits,
        SUM(amount) as total_received
      FROM deposits
      WHERE confirmations >= 1
    `);

    depositStmt.step();
    const depositStats = depositStmt.getAsObject();
    depositStmt.free();

    return {
      ...stats,
      total_deposits: depositStats.total_deposits || 0,
      total_received: depositStats.total_received || 0
    };
  }

  // Get recent transactions
  getRecentTransactions(limit = 10, type = null) {
    let query = `SELECT * FROM transactions WHERE status = 'completed'`;
    let params = [];

    if (type) {
      query += ` AND type = ?`;
      params.push(type);
    }

    query += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(limit);

    const stmt = this.db.prepare(query);
    stmt.bind(params);

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();

    return results;
  }

  // Search transactions
  searchTransactions(address) {
    const stmt = this.db.prepare(`
      SELECT * FROM transactions 
      WHERE address LIKE ?
      ORDER BY created_at DESC
    `);

    stmt.bind([`%${address}%`]);

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();

    return results;
  }

  // Add deposit record
  addDeposit(fromAddress, toAddress, amount, txHash, confirmations = 0) {
    try {
      this.db.run(`
        INSERT OR IGNORE INTO deposits (from_address, to_address, amount, tx_hash, confirmations)
        VALUES (?, ?, ?, ?, ?)
      `, [fromAddress, toAddress, amount, txHash, confirmations]);
      this.saveDatabase();
      return { changes: this.db.getRowsModified() };
    } catch (error) {
      return { changes: 0 };
    }
  }

  // Update deposit confirmations
  updateDepositConfirmations(txHash, confirmations) {
    this.db.run(`
      UPDATE deposits 
      SET confirmations = ?
      WHERE tx_hash = ?
    `, [confirmations, txHash]);
    this.saveDatabase();
  }

  // Get all deposits
  getAllDeposits(limit = 100, offset = 0) {
    const stmt = this.db.prepare(`
      SELECT * FROM deposits 
      ORDER BY detected_at DESC 
      LIMIT ? OFFSET ?
    `);

    stmt.bind([limit, offset]);

    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();

    return results;
  }

  // Get deposit by hash
  getDepositByHash(txHash) {
    const stmt = this.db.prepare(`SELECT * FROM deposits WHERE tx_hash = ?`);
    stmt.bind([txHash]);
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();
    return result;
  }

  // Get total received
  getTotalReceived() {
    const stmt = this.db.prepare(`
      SELECT SUM(amount) as total FROM deposits WHERE confirmations >= 1
    `);
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();
    return result.total || 0;
  }

  // Close database
  close() {
    if (this.db) {
      this.saveDatabase();
      this.db.close();
    }
  }
}

module.exports = FaucetDatabase;
