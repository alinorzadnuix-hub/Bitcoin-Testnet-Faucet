// Configuration for Bitcoin Testnet Faucet
require('dotenv').config();

module.exports = {
  // Server Configuration
  port: process.env.PORT || 2500,

  // Mempool.space API Configuration (Testnet)
  mempool: {
    baseUrl: 'https://mempool.space/testnet/api'
  },

  // Faucet Configuration
  faucet: {
    // Random amount range
    minAmount: parseInt(process.env.FAUCET_AMOUNT_MIN) || 5000,
    maxAmount: parseInt(process.env.FAUCET_AMOUNT_MAX) || 15000,
    // Fixed amount (fallback)
    payoutAmount: parseInt(process.env.FAUCET_AMOUNT) || 10000,
    // Use random amounts?
    useRandomAmount: process.env.FAUCET_AMOUNT_MIN && process.env.FAUCET_AMOUNT_MAX,

    // Cooldown period in milliseconds (24 hours)
    cooldownPeriod: 24 * 60 * 60 * 1000,

    // Faucet private key (for testnet only!)
    // Generate one at: https://privatekeys.pw/keys/bitcoin/testnet
    privateKey: process.env.FAUCET_PRIVATE_KEY || '',

    // Faucet address (derived from private key)
    address: process.env.FAUCET_ADDRESS || ''
  },

  // Network Fee Configuration
  networkFee: {
    estimatedFee: parseInt(process.env.NETWORK_FEE) || 300, // satoshis
    feeType: process.env.FEE_TYPE || 'fixed', // 'fixed' or 'dynamic'
  },

  // Custom Send API Configuration (Public API)
  customSend: {
    enabled: process.env.CUSTOM_SEND_ENABLED !== 'false', // Enable/disable custom amount API
    enforceMinMax: process.env.ENFORCE_MIN_MAX === 'true', // NEW: Optional enforcement of limits
    minAmount: parseInt(process.env.CUSTOM_SEND_MIN) || 1000, // Minimum 1000 satoshis (0.00001 BTC)
    maxAmount: parseInt(process.env.CUSTOM_SEND_MAX) || 1000000, // Maximum 1000000 satoshis (0.01 BTC)
    cooldownPeriod: 24 * 60 * 60 * 1000 // 24 hours (same as faucet)
  },

  // Admin Configuration
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'changeme123'
  },

  // Rate Limiting (DISABLED - set to unlimited)
  rateLimit: {
    windowMs: 60 * 1000,      // 1 minute window
    maxRequests: 999999        // Effectively unlimited
  },

  // Database
  database: {
    path: './faucet.db'
  }
};
