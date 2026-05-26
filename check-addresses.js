// Check all addresses from a private key and find balances
const bitcoin = require('bitcoinjs-lib');
const ECPairFactory = require('ecpair').default;
const ecc = require('tiny-secp256k1');
const axios = require('axios');
require('dotenv').config();

const ECPair = ECPairFactory(ecc);
const TESTNET = bitcoin.networks.testnet;

async function checkAllAddresses() {
    console.log('════════════════════════════════════════════════════════');
    console.log('  🔍 Checking All Addresses From Your Private Key');
    console.log('════════════════════════════════════════════════════════\n');

    const privateKeyWIF = process.env.FAUCET_PRIVATE_KEY;

    if (!privateKeyWIF) {
        console.log('❌ Error: FAUCET_PRIVATE_KEY not found in .env file!');
        return;
    }

    try {
        // Import private key
        const keyPair = ECPair.fromWIF(privateKeyWIF, TESTNET);

        // Generate all types of addresses
        const addresses = [];

        // 1. P2PKH (Legacy - starts with 'm' or 'n')
        const p2pkh = bitcoin.payments.p2pkh({
            pubkey: keyPair.publicKey,
            network: TESTNET
        });
        addresses.push({
            type: 'P2PKH (Legacy)',
            address: p2pkh.address,
            description: 'Old format, higher fees'
        });

        // 2. P2WPKH (Native SegWit - starts with 'tb1')
        const p2wpkh = bitcoin.payments.p2wpkh({
            pubkey: keyPair.publicKey,
            network: TESTNET
        });
        addresses.push({
            type: 'P2WPKH (SegWit)',
            address: p2wpkh.address,
            description: 'New format, lower fees - RECOMMENDED'
        });

        // 3. P2SH-P2WPKH (Nested SegWit - starts with '2')
        const p2sh = bitcoin.payments.p2sh({
            redeem: bitcoin.payments.p2wpkh({
                pubkey: keyPair.publicKey,
                network: TESTNET
            }),
            network: TESTNET
        });
        addresses.push({
            type: 'P2SH-P2WPKH (Nested SegWit)',
            address: p2sh.address,
            description: 'Compatible format'
        });

        console.log('Your wallet has 3 different address types:\n');

        let totalBalance = 0;
        let bestAddress = null;
        let maxBalance = 0;

        // Check balance for each address
        for (const addr of addresses) {
            try {
                const response = await axios.get(
                    `https://mempool.space/testnet/api/address/${addr.address}`
                );

                const funded = response.data.chain_stats.funded_txo_sum || 0;
                const spent = response.data.chain_stats.spent_txo_sum || 0;
                const balance = funded - spent;

                addr.balance = balance;
                totalBalance += balance;

                console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
                console.log(`📍 ${addr.type}`);
                console.log(`   ${addr.description}`);
                console.log(`   Address: ${addr.address}`);
                console.log(`   Balance: ${balance} satoshis (${(balance / 100000000).toFixed(8)} BTC)`);

                if (balance > 0) {
                    console.log(`   ✅ HAS FUNDS!`);
                    if (balance > maxBalance) {
                        maxBalance = balance;
                        bestAddress = addr;
                    }
                } else {
                    console.log(`   ❌ Empty`);
                }
                console.log('');

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error) {
                console.log(`❌ Error checking ${addr.type}: ${error.message}\n`);
                addr.balance = 0;
            }
        }

        console.log('════════════════════════════════════════════════════════');
        console.log('  📊 SUMMARY');
        console.log('════════════════════════════════════════════════════════\n');
        console.log(`Total Balance: ${totalBalance} satoshis (${(totalBalance / 100000000).toFixed(8)} BTC)`);
        console.log('');

        if (bestAddress) {
            console.log('✅ FUNDS FOUND!\n');
            console.log(`💰 Address with most funds:`);
            console.log(`   Type: ${bestAddress.type}`);
            console.log(`   Address: ${bestAddress.address}`);
            console.log(`   Balance: ${bestAddress.balance} sats\n`);

            console.log('════════════════════════════════════════════════════════');
            console.log('  ⚙️ RECOMMENDED ACTION');
            console.log('════════════════════════════════════════════════════════\n');

            console.log('Update your .env file:');
            console.log('');
            console.log(`FAUCET_ADDRESS=${bestAddress.address}`);
            console.log('');
            console.log('This will use the address that has your funds!');
            console.log('');
        } else {
            console.log('❌ NO FUNDS FOUND in any address!');
            console.log('');
            console.log('📥 Send testnet BTC to one of these addresses:');
            console.log('');
            console.log('RECOMMENDED (lowest fees):');
            console.log(addresses.find(a => a.type.includes('SegWit') && !a.type.includes('Nested')).address);
            console.log('');
        }

        console.log('════════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkAllAddresses();
