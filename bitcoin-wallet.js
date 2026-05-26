// Enhanced Bitcoin Wallet - Supports ALL address types!
// Automatically detects and uses funds from P2PKH, P2WPKH, and P2SH-P2WPKH addresses
const bitcoin = require('bitcoinjs-lib');
const ECPairFactory = require('ecpair').default;
const ecc = require('tiny-secp256k1');
const axios = require('axios');
const config = require('./config');

const ECPair = ECPairFactory(ecc);
const TESTNET = bitcoin.networks.testnet;

class BitcoinWallet {
    constructor(privateKeyWIF) {
        this.keyPair = ECPair.fromWIF(privateKeyWIF, TESTNET);

        // Generate ALL address types from the same private key
        this.addresses = this.generateAllAddresses();

        // Primary address (for display)
        this.primaryAddress = this.addresses[0].address;
    }

    // Generate all address types
    generateAllAddresses() {
        const addresses = [];

        // 1. P2PKH (Legacy - 'm' or 'n')
        const p2pkh = bitcoin.payments.p2pkh({
            pubkey: this.keyPair.publicKey,
            network: TESTNET
        });
        addresses.push({
            type: 'p2pkh',
            address: p2pkh.address,
            payment: p2pkh
        });

        // 2. P2WPKH (Native SegWit - 'tb1')
        const p2wpkh = bitcoin.payments.p2wpkh({
            pubkey: this.keyPair.publicKey,
            network: TESTNET
        });
        addresses.push({
            type: 'p2wpkh',
            address: p2wpkh.address,
            payment: p2wpkh
        });

        // 3. P2SH-P2WPKH (Nested SegWit - '2')
        const p2sh = bitcoin.payments.p2sh({
            redeem: bitcoin.payments.p2wpkh({
                pubkey: this.keyPair.publicKey,
                network: TESTNET
            }),
            network: TESTNET
        });
        addresses.push({
            type: 'p2sh',
            address: p2sh.address,
            payment: p2sh,
            redeem: p2sh.redeem
        });

        return addresses;
    }

    getAddress() {
        return this.primaryAddress;
    }

    // Get all addresses (for display)
    getAllAddresses() {
        return this.addresses.map(a => a.address);
    }

    // Get UTXOs from ALL addresses
    async getUTXOs() {
        try {
            let allUtxos = [];

            // Check each address type for UTXOs
            for (const addrInfo of this.addresses) {
                const url = `${config.mempool.baseUrl}/address/${addrInfo.address}/utxo`;
                try {
                    const response = await axios.get(url);
                    const utxos = response.data;

                    // Add address info to each UTXO
                    utxos.forEach(utxo => {
                        utxo.addressType = addrInfo.type;
                        utxo.addressInfo = addrInfo;
                    });

                    allUtxos = allUtxos.concat(utxos);
                } catch (error) {
                    // Address might not have UTXOs, continue
                    console.log(`No UTXOs for ${addrInfo.type} address`);
                }
            }

            return allUtxos;
        } catch (error) {
            console.error('Failed to fetch UTXOs:', error.message);
            throw new Error('Failed to fetch UTXOs');
        }
    }

    // Get total balance from ALL addresses
    async getBalance() {
        try {
            let totalConfirmed = 0;
            let totalUnconfirmed = 0;

            // Check balance for each address
            for (const addrInfo of this.addresses) {
                const url = `${config.mempool.baseUrl}/address/${addrInfo.address}`;
                try {
                    const response = await axios.get(url);

                    const confirmed = response.data.chain_stats.funded_txo_sum - response.data.chain_stats.spent_txo_sum;
                    const unconfirmed = response.data.mempool_stats.funded_txo_sum - response.data.mempool_stats.spent_txo_sum;

                    totalConfirmed += confirmed;
                    totalUnconfirmed += unconfirmed;
                } catch (error) {
                    // Address might not exist, continue
                    console.log(`No balance for ${addrInfo.type} address`);
                }
            }

            return {
                confirmed: totalConfirmed,
                unconfirmed: totalUnconfirmed,
                total: totalConfirmed + totalUnconfirmed
            };
        } catch (error) {
            console.error('Failed to fetch balance:', error.message);
            throw new Error('Failed to fetch balance');
        }
    }

    // Create and sign transaction using UTXOs from ANY address
    async createTransaction(toAddress, amountSatoshis) {
        const utxos = await this.getUTXOs();

        if (utxos.length === 0) {
            throw new Error('No UTXOs available. Wallet may be empty.');
        }

        let totalInput = 0;
        const selectedUTXOs = [];

        const estimatedFee = config.networkFee.estimatedFee; // Configurable from admin panel
        const totalNeeded = amountSatoshis + estimatedFee;

        // Select UTXOs until we have enough
        for (const utxo of utxos) {
            selectedUTXOs.push(utxo);
            totalInput += utxo.value;

            if (totalInput >= totalNeeded) {
                break;
            }
        }

        if (totalInput < totalNeeded) {
            throw new Error(`Insufficient funds. Need ${totalNeeded}, have ${totalInput}`);
        }

        const change = totalInput - amountSatoshis - estimatedFee;
        const psbt = new bitcoin.Psbt({ network: TESTNET });

        // Add inputs from various address types
        for (const utxo of selectedUTXOs) {
            const txHex = await this.getTransactionHex(utxo.txid);

            const inputData = {
                hash: utxo.txid,
                index: utxo.vout,
                nonWitnessUtxo: Buffer.from(txHex, 'hex')
            };

            // Add witness UTXO for SegWit inputs
            if (utxo.addressType === 'p2wpkh') {
                const tx = bitcoin.Transaction.fromHex(txHex);
                inputData.witnessUtxo = {
                    script: tx.outs[utxo.vout].script,
                    value: utxo.value
                };
            }

            // Add redeem script for P2SH-P2WPKH
            if (utxo.addressType === 'p2sh' && utxo.addressInfo.redeem) {
                inputData.redeemScript = utxo.addressInfo.redeem.output;
                const tx = bitcoin.Transaction.fromHex(txHex);
                inputData.witnessUtxo = {
                    script: tx.outs[utxo.vout].script,
                    value: utxo.value
                };
            }

            psbt.addInput(inputData);
        }

        // Add output to recipient
        psbt.addOutput({
            address: toAddress,
            value: amountSatoshis
        });

        // Add change output if significant
        if (change > 1000) {
            psbt.addOutput({
                address: this.primaryAddress, // Send change to primary address
                value: change
            });
        }

        // Sign all inputs
        for (let i = 0; i < selectedUTXOs.length; i++) {
            psbt.signInput(i, this.keyPair);
        }

        // Finalize and extract
        psbt.finalizeAllInputs();
        const tx = psbt.extractTransaction();

        return {
            txHex: tx.toHex(),
            txId: tx.getId(),
            fee: estimatedFee,
            change: change > 1000 ? change : 0
        };
    }

    // Get transaction hex from mempool.space
    async getTransactionHex(txid) {
        try {
            const url = `${config.mempool.baseUrl}/tx/${txid}/hex`;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch transaction ${txid}:`, error.message);
            throw new Error('Failed to fetch transaction data');
        }
    }

    // Broadcast transaction
    async broadcastTransaction(txHex) {
        try {
            const url = `${config.mempool.baseUrl}/tx`;
            const response = await axios.post(url, txHex, {
                headers: { 'Content-Type': 'text/plain' }
            });
            return response.data;
        } catch (error) {
            const errorMsg = error.response?.data || error.message;
            console.error('Failed to broadcast transaction:', errorMsg);
            throw new Error(`Broadcast failed: ${errorMsg}`);
        }
    }

    // Send Bitcoin
    async sendBitcoin(toAddress, amountSatoshis) {
        try {
            if (!this.validateAddress(toAddress)) {
                throw new Error('Invalid recipient address');
            }

            const tx = await this.createTransaction(toAddress, amountSatoshis);
            const txid = await this.broadcastTransaction(tx.txHex);

            return {
                txid: txid,
                amount: amountSatoshis,
                fee: tx.fee,
                change: tx.change,
                explorerUrl: `https://mempool.space/testnet/tx/${txid}`
            };
        } catch (error) {
            throw error;
        }
    }

    // Validate address
    validateAddress(address) {
        try {
            bitcoin.address.toOutputScript(address, TESTNET);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Get transaction history from ALL addresses
    async getTransactionHistory(limit = 50) {
        try {
            let allTxs = [];

            for (const addrInfo of this.addresses) {
                const url = `${config.mempool.baseUrl}/address/${addrInfo.address}/txs`;
                try {
                    const response = await axios.get(url);
                    allTxs = allTxs.concat(response.data);
                } catch (error) {
                    // Address might not have transactions
                    continue;
                }
            }

            // Remove duplicates and sort by time
            const uniqueTxs = Array.from(new Set(allTxs.map(tx => tx.txid)))
                .map(txid => allTxs.find(tx => tx.txid === txid))
                .sort((a, b) => (b.status.block_time || 0) - (a.status.block_time || 0))
                .slice(0, limit);

            return uniqueTxs;
        } catch (error) {
            console.error('Failed to fetch transaction history:', error.message);
            return [];
        }
    }

    // Scan for deposits
    async scanForDeposits() {
        try {
            const transactions = await this.getTransactionHistory();
            const deposits = [];

            for (const tx of transactions) {
                for (const output of tx.vout) {
                    // Check if output is to any of our addresses
                    if (this.addresses.some(a => a.address === output.scriptpubkey_address)) {
                        deposits.push({
                            txid: tx.txid,
                            amount: output.value,
                            confirmations: tx.status.confirmed ? tx.status.block_height : 0,
                            timestamp: tx.status.block_time || Date.now() / 1000
                        });
                    }
                }
            }

            return deposits;
        } catch (error) {
            console.error('Failed to scan for deposits:', error.message);
            return [];
        }
    }
}

module.exports = BitcoinWallet;
