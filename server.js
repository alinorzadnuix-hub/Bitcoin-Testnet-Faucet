// Enhanced Bitcoin Wallet Management Server
// Using native bitcoinjs-lib - NO third-party APIs for transactions!
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const FaucetDatabase = require('./database');
const BitcoinWallet = require('./bitcoin-wallet');

const app = express();
const db = new FaucetDatabase();

// Initialize database (async for sql.js)
async function initializeServer() {
    await db.initialize();

    // Initialize Bitcoin wallet
    let wallet = null;
    try {
        if (config.faucet.privateKey) {
            wallet = new BitcoinWallet(config.faucet.privateKey);
            console.log(`✅ Wallet initialized: ${wallet.getAddress()}`);
        }
    } catch (error) {
        console.error('❌ Failed to initialize wallet:', error.message);
    }

    return wallet;
}

let wallet = null;
initializeServer().then(w => { wallet = w; });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rate limiting DISABLED - all requests pass through without restriction
function checkRateLimit(req, res, next) {
    // No rate limiting - pass all requests through
    next();
}

// (Rate limit cleanup disabled - rate limiting is off)

// Get client IP address
function getClientIp(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] ||
        req.ip ||
        req.connection.remoteAddress ||
        'unknown';
}

// Format time remaining in human-readable format
function formatTimeRemaining(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}

// === PUBLIC API ROUTES ===

// Get faucet info and balance
app.get('/api/info', async (req, res) => {
    try {
        const stats = db.getStatistics();
        let balance = 0;

        // Get faucet balance using native wallet
        if (wallet) {
            try {
                const balanceData = await wallet.getBalance();
                balance = balanceData.confirmed;
            } catch (error) {
                console.error('Error fetching balance:', error.message);
            }
        }

        res.json({
            success: true,
            faucet: {
                payoutAmount: config.faucet.payoutAmount,
                balance: balance,
                cooldownHours: config.faucet.cooldownPeriod / (1000 * 60 * 60)
            },
            statistics: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch faucet info'
        });
    }
});

// Claim faucet (PUBLIC - NO LIMITS)
app.post('/api/claim', async (req, res) => {
    try {
        const { address } = req.body;
        const ipAddress = getClientIp(req);

        // Check wallet first (before any wallet method calls)
        if (!wallet) {
            return res.status(500).json({
                success: false,
                error: 'Wallet not initialized. Check FAUCET_PRIVATE_KEY in .env'
            });
        }

        // Validate address
        if (!address || !wallet.validateAddress(address)) {
            return res.status(400).json({
                success: false,
                error: `Invalid Bitcoin testnet address: "${address}"`
            });
        }

        // Calculate payout amount
        let payoutAmount;
        if (config.faucet.useRandomAmount) {
            payoutAmount = Math.floor(
                Math.random() * (config.faucet.maxAmount - config.faucet.minAmount + 1) + config.faucet.minAmount
            );
        } else {
            payoutAmount = config.faucet.payoutAmount;
        }

        console.log(`[CLAIM] address=${address} amount=${payoutAmount} ip=${ipAddress}`);

        // Send Bitcoin using native wallet
        const result = await wallet.sendBitcoin(address, payoutAmount);

        // Record claim and transaction
        db.recordClaim(address, ipAddress);
        db.addTransaction(
            address,
            payoutAmount,
            result.txid,
            'completed',
            ipAddress,
            'faucet_claim'
        );

        console.log(`[CLAIM] SUCCESS txid=${result.txid}`);

        res.json({
            success: true,
            message: 'Funds sent successfully!',
            txHash: result.txid,
            amount: payoutAmount,
            fee: result.fee,
            explorerUrl: result.explorerUrl
        });

    } catch (error) {
        console.error('[CLAIM] ERROR:', error.message);

        // Record failed transaction
        if (req.body.address) {
            const estimatedAmount = config.faucet.useRandomAmount
                ? Math.floor((config.faucet.minAmount + config.faucet.maxAmount) / 2)
                : config.faucet.payoutAmount;

            db.addTransaction(
                req.body.address,
                estimatedAmount,
                null,
                'failed',
                getClientIp(req),
                'faucet_claim'
            );
        }

        // Return full error message so client can display it
        res.status(500).json({
            success: false,
            error: error.message || 'Unknown server error',
            detail: error.stack ? error.stack.split('\n')[0] : ''
        });
    }
});

// Send custom amount (PUBLIC - NO LIMITS)
app.post('/api/send', async (req, res) => {
    try {
        const { address, amount } = req.body;
        const ipAddress = getClientIp(req);

        // Check if custom send is enabled
        if (!config.customSend.enabled) {
            return res.status(503).json({
                success: false,
                error: 'Custom send API is currently disabled'
            });
        }

        // Validate address
        if (!address || !wallet.validateAddress(address)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Bitcoin testnet address'
            });
        }

        // Validate and parse amount (support both satoshi and BTC)
        let amountInt;
        const amountValue = parseFloat(amount);

        if (!amountValue || amountValue <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid amount. Must be a positive number.'
            });
        }

        // Check if amount is in BTC format (has decimal point and value < 1)
        // Example: 0.001 BTC = 100,000 satoshi
        if (amount.toString().includes('.') && amountValue < 1) {
            // Convert BTC to satoshi (1 BTC = 100,000,000 satoshi)
            amountInt = Math.floor(amountValue * 100000000);
        } else {
            // Treat as satoshi
            amountInt = parseInt(amount);
        }

        // Validate final amount
        if (amountInt <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Amount too small. Minimum is 1 satoshi or 0.00000001 BTC.'
            });
        }

        // Check min/max amount (optional - can be disabled from admin panel)
        if (config.customSend.enforceMinMax) {
            if (amountInt < config.customSend.minAmount || amountInt > config.customSend.maxAmount) {
                return res.status(400).json({
                    success: false,
                    error: `Amount must be between ${config.customSend.minAmount} satoshis (${(config.customSend.minAmount / 100000000).toFixed(8)} BTC) and ${config.customSend.maxAmount} satoshis (${(config.customSend.maxAmount / 100000000).toFixed(8)} BTC)`
                });
            }
        }

        // Check if wallet is initialized
        if (!wallet) {
            return res.status(500).json({
                success: false,
                error: 'Wallet is not properly configured. Please contact administrator.'
            });
        }

        // Send Bitcoin using native wallet
        const result = await wallet.sendBitcoin(address, amountInt);

        // Record claim and transaction
        db.recordClaim(address, ipAddress);
        db.addTransaction(
            address,
            amountInt,
            result.txid,
            'completed',
            ipAddress,
            'custom_send'
        );

        res.json({
            success: true,
            message: 'Funds sent successfully!',
            txHash: result.txid,
            amount: amountInt,
            fee: result.fee,
            explorerUrl: result.explorerUrl
        });

    } catch (error) {
        console.error('Custom send error:', error.message);

        // Record failed transaction
        if (req.body.address) {
            db.addTransaction(
                req.body.address,
                parseInt(req.body.amount) || 0,
                null,
                'failed',
                getClientIp(req),
                'custom_send'
            );
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Failed to process transaction. Please try again later.'
        });
    }
});

// Get recent transactions (public)
app.get('/api/recent', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const transactions = db.getRecentTransactions(limit);

        // Remove sensitive info
        const publicTransactions = transactions.map(tx => ({
            address: tx.address.substring(0, 8) + '...' + tx.address.substring(tx.address.length - 8),
            amount: tx.amount,
            tx_hash: tx.tx_hash,
            type: tx.type,
            created_at: tx.created_at
        }));

        res.json({
            success: true,
            transactions: publicTransactions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recent transactions'
        });
    }
});

// === ADMIN API ROUTES ===

// Admin: Login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (username === config.admin.username && password === config.admin.password) {
        res.json({
            success: true,
            token: Buffer.from(`${username}:${password}`).toString('base64')
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }
});

// Admin: Verify token middleware
function verifyAdmin(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const token = authHeader.substring(6);
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');

    if (username === config.admin.username && password === config.admin.password) {
        next();
    } else {
        res.status(401).json({ success: false, error: 'Unauthorized' });
    }
}

// Admin: Get wallet balance
app.get('/api/admin/balance', verifyAdmin, async (req, res) => {
    try {
        if (!wallet) {
            return res.status(500).json({
                success: false,
                error: 'Wallet not configured'
            });
        }

        const balanceData = await wallet.getBalance();

        res.json({
            success: true,
            balance: balanceData.confirmed,
            unconfirmedBalance: balanceData.unconfirmed,
            address: wallet.getAddress()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch balance'
        });
    }
});

// Admin: Send Bitcoin to any address (NO RATE LIMITS!)
app.post('/api/admin/send', verifyAdmin, async (req, res) => {
    try {
        const { address, amount, note } = req.body;

        // Validate address
        if (!address || !wallet.validateAddress(address)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Bitcoin testnet address'
            });
        }

        // Validate amount
        const amountInt = parseInt(amount);
        if (!amountInt || amountInt <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid amount'
            });
        }

        // Check if wallet is initialized
        if (!wallet) {
            return res.status(500).json({
                success: false,
                error: 'Wallet is not properly configured.'
            });
        }

        // Send Bitcoin using native wallet
        const result = await wallet.sendBitcoin(address, amountInt);

        // Record transaction (NO rate limiting for admin)
        db.addTransaction(
            address,
            amountInt,
            result.txid,
            'completed',
            'admin',
            'admin_send',
            note || null
        );

        res.json({
            success: true,
            message: 'Bitcoin sent successfully!',
            txHash: result.txid,
            amount: amountInt,
            fee: result.fee,
            explorerUrl: result.explorerUrl
        });

    } catch (error) {
        console.error('Admin send error:', error.message);

        // Record failed transaction
        if (req.body.address) {
            db.addTransaction(
                req.body.address,
                parseInt(req.body.amount) || 0,
                null,
                'failed',
                'admin',
                'admin_send',
                req.body.note || null
            );
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Failed to send transaction. Please try again.'
        });
    }
});

// Helper function to update .env file
function updateEnvFile(updates) {
    const fs = require('fs');
    const envPath = require('path').join(__dirname, '.env');

    if (!fs.existsSync(envPath)) {
        return false;
    }

    let envContent = fs.readFileSync(envPath, 'utf8');

    // Map of config keys to env variable names
    const envMapping = {
        faucetAmount: 'FAUCET_AMOUNT',
        networkFee: 'NETWORK_FEE',
        feeType: 'FEE_TYPE',
        enforceMinMax: 'ENFORCE_MIN_MAX',
        customSendEnabled: 'CUSTOM_SEND_ENABLED',
        minAmount: 'CUSTOM_SEND_MIN',
        maxAmount: 'CUSTOM_SEND_MAX'
    };

    for (const [key, value] of Object.entries(updates)) {
        const envKey = envMapping[key];
        if (!envKey) continue;

        const regex = new RegExp(`${envKey}=.*`, 'g');
        const newLine = `${envKey}=${value}`;

        if (envContent.includes(`${envKey}=`)) {
            envContent = envContent.replace(regex, newLine);
        } else {
            envContent += `\n${newLine}`;
        }
    }

    fs.writeFileSync(envPath, envContent);
    return true;
}

// Admin: Get all settings
app.get('/api/admin/settings', verifyAdmin, (req, res) => {
    try {
        res.json({
            success: true,
            settings: {
                faucetAmount: config.faucet.payoutAmount,
                minFaucetAmount: config.faucet.minAmount,
                maxFaucetAmount: config.faucet.maxAmount,
                useRandomAmount: config.faucet.useRandomAmount,
                networkFee: config.networkFee.estimatedFee,
                feeType: config.networkFee.feeType,
                enforceMinMax: config.customSend.enforceMinMax,
                customSendEnabled: config.customSend.enabled,
                minAmount: config.customSend.minAmount,
                maxAmount: config.customSend.maxAmount,
                cooldownPeriod: config.faucet.cooldownPeriod,
                cooldownHours: config.faucet.cooldownPeriod / (1000 * 60 * 60)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch settings'
        });
    }
});

// Admin: Update faucet settings (legacy endpoint - for backward compatibility)
app.post('/api/admin/settings', verifyAdmin, (req, res) => {
    try {
        const { faucetAmount } = req.body;

        // Validate amount
        const amountInt = parseInt(faucetAmount);
        if (!amountInt || amountInt <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid amount'
            });
        }

        // Update config
        config.faucet.payoutAmount = amountInt;

        // Update .env file
        updateEnvFile({ faucetAmount: amountInt });

        res.json({
            success: true,
            message: 'Settings updated successfully',
            faucetAmount: amountInt
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to update settings'
        });
    }
});

// Admin: Update advanced settings (NEW)
app.post('/api/admin/settings/update', verifyAdmin, (req, res) => {
    try {
        const {
            networkFee,
            feeType,
            enforceMinMax,
            customSendEnabled,
            minAmount,
            maxAmount,
            faucetAmount
        } = req.body;

        const updates = {};

        // Update config values
        if (networkFee !== undefined) {
            const fee = parseInt(networkFee);
            if (fee > 0) {
                config.networkFee.estimatedFee = fee;
                updates.networkFee = fee;
            }
        }

        if (feeType && (feeType === 'fixed' || feeType === 'dynamic')) {
            config.networkFee.feeType = feeType;
            updates.feeType = feeType;
        }

        if (enforceMinMax !== undefined) {
            config.customSend.enforceMinMax = Boolean(enforceMinMax);
            updates.enforceMinMax = Boolean(enforceMinMax);
        }

        if (customSendEnabled !== undefined) {
            config.customSend.enabled = Boolean(customSendEnabled);
            updates.customSendEnabled = Boolean(customSendEnabled);
        }

        if (minAmount !== undefined) {
            const min = parseInt(minAmount);
            if (min > 0) {
                config.customSend.minAmount = min;
                updates.minAmount = min;
            }
        }

        if (maxAmount !== undefined) {
            const max = parseInt(maxAmount);
            if (max > 0) {
                config.customSend.maxAmount = max;
                updates.maxAmount = max;
            }
        }

        if (faucetAmount !== undefined) {
            const amount = parseInt(faucetAmount);
            if (amount > 0) {
                config.faucet.payoutAmount = amount;
                updates.faucetAmount = amount;
            }
        }

        // Save to .env file
        updateEnvFile(updates);

        res.json({
            success: true,
            message: 'Settings updated successfully',
            settings: updates
        });
    } catch (error) {
        console.error('Settings update error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update settings'
        });
    }
});

// Admin: Get all transactions with optional type filter
app.get('/api/admin/transactions', verifyAdmin, (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;
        const type = req.query.type || null;

        const transactions = db.getAllTransactions(limit, offset, type);
        const stats = db.getStatistics();

        res.json({
            success: true,
            transactions: transactions,
            statistics: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch transactions'
        });
    }
});

// Admin: Get all deposits
app.get('/api/admin/deposits', verifyAdmin, (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;

        const deposits = db.getAllDeposits(limit, offset);
        const totalReceived = db.getTotalReceived();

        res.json({
            success: true,
            deposits: deposits,
            totalReceived: totalReceived
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch deposits'
        });
    }
});

// Admin: Scan for new deposits using native wallet
app.post('/api/admin/scan-deposits', verifyAdmin, async (req, res) => {
    try {
        if (!wallet) {
            return res.status(500).json({
                success: false,
                error: 'Wallet not configured'
            });
        }

        // Scan blockchain using native wallet
        const deposits = await wallet.scanForDeposits();
        let newDeposits = 0;

        // Process deposits
        for (const deposit of deposits) {
            const result = db.addDeposit(
                'external',
                wallet.getAddress(),
                deposit.amount,
                deposit.txid,
                deposit.confirmations
            );

            if (result.changes > 0) {
                newDeposits++;
            }
        }

        res.json({
            success: true,
            message: `Scan complete. Found ${newDeposits} new deposit(s).`,
            newDeposits: newDeposits
        });

    } catch (error) {
        console.error('Deposit scan error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to scan for deposits'
        });
    }
});

// Admin: Search transactions
app.get('/api/admin/search', verifyAdmin, (req, res) => {
    try {
        const { address } = req.query;

        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'Address parameter required'
            });
        }

        const transactions = db.searchTransactions(address);

        res.json({
            success: true,
            transactions: transactions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Search failed'
        });
    }
});

// === PRIVACY PROXY — hides real user IP from the faucet logic ===
//
// The Unity app calls  POST /api/proxy-send  instead of /api/send directly.
// This endpoint strips all identifying headers and forwards the request
// to the local /api/send handler, so the faucet only ever sees 127.0.0.1.
//
app.post('/api/proxy-send', async (req, res) => {
    try {
        const { address, amount } = req.body;

        // Basic validation before forwarding
        if (!address || typeof address !== 'string' || address.trim().length < 10) {
            return res.status(400).json({ success: false, error: 'Invalid address' });
        }

        const forwardAmount = amount || 14000000; // default: 0.14 tBTC in satoshi

        console.log(`[PROXY] Forwarding claim for ${address.substring(0, 14)}... (real IP hidden)`);

        // Forward to internal /api/send using loopback — real IP never reaches the handler
        const http = require('http');
        const body = JSON.stringify({ address: address.trim(), amount: forwardAmount });

        const options = {
            hostname: '127.0.0.1',
            port: config.port,
            path: '/api/send',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                // Explicitly clear any forwarded-for headers so the inner handler
                // only sees the loopback source address
                'X-Forwarded-For': '',
                'X-Real-IP': '',
                'User-Agent': 'InternalProxy/1.0'
            }
        };

        const proxyReq = http.request(options, (proxyRes) => {
            let data = '';
            proxyRes.on('data', chunk => { data += chunk; });
            proxyRes.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    res.status(proxyRes.statusCode).json(parsed);
                } catch (e) {
                    res.status(502).json({ success: false, error: 'Invalid upstream response' });
                }
            });
        });

        proxyReq.on('error', (err) => {
            console.error('[PROXY] Internal forward error:', err.message);
            res.status(503).json({ success: false, error: 'Proxy forward failed: ' + err.message });
        });

        proxyReq.setTimeout(25000, () => {
            proxyReq.destroy();
            res.status(504).json({ success: false, error: 'Upstream timeout' });
        });

        proxyReq.write(body);
        proxyReq.end();

    } catch (err) {
        console.error('[PROXY] Unexpected error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// === STATIC PAGES ===

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// === START SERVER ===

const PORT = config.port;
app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  🪙  Bitcoin Wallet Management System');
    console.log('  ✨  Using Native bitcoinjs-lib');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  Server running on: http://localhost:${PORT}`);
    console.log(`  Faucet page:      http://localhost:${PORT}`);
    console.log(`  Admin panel:      http://localhost:${PORT}/admin`);
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  Payout amount:    ${config.faucet.payoutAmount} satoshis`);
    console.log(`  Cooldown period:  ${config.faucet.cooldownPeriod / (1000 * 60 * 60)} hours (faucet only)`);
    console.log('  Admin sends:      ✅ NO LIMITS');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  API Provider:     mempool.space (FREE, NO API KEY!)');
    console.log('  Transaction:      Native bitcoinjs-lib');
    console.log('  Signing:          Local (secure!)');
    console.log('═══════════════════════════════════════════════════════');

    if (!wallet) {
        console.log('  ⚠️  WARNING: Wallet private key not set!');
        console.log('  Please set FAUCET_PRIVATE_KEY in .env file');
    }

    console.log('═══════════════════════════════════════════════════════\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    db.close();
    process.exit(0);
});
