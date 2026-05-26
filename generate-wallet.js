// Bitcoin Testnet Wallet Generator
// This script generates a new Bitcoin testnet wallet locally
// More secure than using online generators

const crypto = require('crypto');
const axios = require('axios');

// Bitcoin Base58 encoding
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Encode(buffer) {
    let num = BigInt('0x' + buffer.toString('hex'));
    let encoded = '';

    while (num > 0n) {
        const remainder = num % 58n;
        num = num / 58n;
        encoded = ALPHABET[Number(remainder)] + encoded;
    }

    // Add '1' for each leading zero byte
    for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
        encoded = '1' + encoded;
    }

    return encoded;
}

function sha256(data) {
    return crypto.createHash('sha256').update(data).digest();
}

function hash160(buffer) {
    const sha = sha256(buffer);
    return crypto.createHash('ripemd160').update(sha).digest();
}

// Generate Private Key
function generatePrivateKey() {
    // Generate random 32 bytes for private key
    return crypto.randomBytes(32);
}

// Get Public Key from Private Key using secp256k1
function getPublicKey(privateKey) {
    const EC = require('elliptic').ec;
    const ec = new EC('secp256k1');
    const keyPair = ec.keyFromPrivate(privateKey);
    const publicKey = keyPair.getPublic();

    // Compressed public key (33 bytes)
    const x = publicKey.x.toBuffer('be', 32);
    const prefix = publicKey.y.isEven() ? Buffer.from([0x02]) : Buffer.from([0x03]);

    return Buffer.concat([prefix, x]);
}

// Generate P2PKH Address (Legacy format)
function generateAddress(publicKey, testnet = true) {
    const pubKeyHash = hash160(publicKey);

    // Testnet prefix: 0x6f, Mainnet: 0x00
    const version = Buffer.from([testnet ? 0x6f : 0x00]);
    const payload = Buffer.concat([version, pubKeyHash]);

    // Double SHA256 checksum
    const checksum = sha256(sha256(payload)).slice(0, 4);
    const address = Buffer.concat([payload, checksum]);

    return base58Encode(address);
}

// Generate WIF (Wallet Import Format) for private key
function generateWIF(privateKey, testnet = true) {
    // Testnet prefix: 0xef, Mainnet: 0x80
    const version = Buffer.from([testnet ? 0xef : 0x80]);
    const compressed = Buffer.from([0x01]); // Compressed format

    const payload = Buffer.concat([version, privateKey, compressed]);
    const checksum = sha256(sha256(payload)).slice(0, 4);
    const wif = Buffer.concat([payload, checksum]);

    return base58Encode(wif);
}

// Main wallet generation
async function generateWallet() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  🪙  Bitcoin Testnet Wallet Generator');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('⏳ Generating new wallet...\n');

    // Generate keys
    const privateKey = generatePrivateKey();
    const publicKey = getPublicKey(privateKey);
    const address = generateAddress(publicKey, true);
    const wif = generateWIF(privateKey, true);

    console.log('✅ Wallet Generated Successfully!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  SAVE THIS INFORMATION SECURELY!');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📍 Bitcoin Testnet Address:');
    console.log('   ' + address);
    console.log('');

    console.log('🔑 Private Key (WIF format):');
    console.log('   ' + wif);
    console.log('');

    console.log('🔐 Private Key (HEX format):');
    console.log('   ' + privateKey.toString('hex'));
    console.log('');

    console.log('📢 Public Key (Compressed):');
    console.log('   ' + publicKey.toString('hex'));
    console.log('');

    console.log('═══════════════════════════════════════════════════════');
    console.log('  IMPORTANT NOTES:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('⚠️  This is a TESTNET wallet - for testing only!');
    console.log('⚠️  Keep your private key secure and never share it!');
    console.log('⚠️  Save this information in a safe place!');
    console.log('');

    console.log('📝 To use this wallet in your faucet:');
    console.log('   1. Copy the values above');
    console.log('   2. Edit your .env file:');
    console.log('      FAUCET_PRIVATE_KEY=' + wif);
    console.log('      FAUCET_ADDRESS=' + address);
    console.log('');

    // Check balance
    console.log('⏳ Checking wallet balance...\n');
    try {
        const response = await axios.get(
            `https://api.blockcypher.com/v1/btc/test3/addrs/${address}/balance`
        );

        const balance = response.data.balance || 0;
        const balanceBTC = (balance / 100000000).toFixed(8);

        console.log(`💰 Current Balance: ${balanceBTC} BTC (testnet)`);

        if (balance === 0) {
            console.log('');
            console.log('💡 Your wallet is empty. Get free testnet coins from:');
            console.log('   • https://testnet-faucet.com/btc-testnet/');
            console.log('   • https://bitcoinfaucet.uo1.net/');
            console.log('   • https://coinfaucet.eu/en/btc-testnet/');
        }
    } catch (error) {
        console.log('⚠️  Could not check balance (check your internet connection)');
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════\n');
}

// Check if elliptic library is available
try {
    require.resolve('elliptic');
    generateWallet();
} catch (e) {
    console.log('⚠️  Installing required dependencies...\n');
    console.log('Please run: npm install elliptic\n');
    console.log('Then run this script again: node generate-wallet.js');
}
