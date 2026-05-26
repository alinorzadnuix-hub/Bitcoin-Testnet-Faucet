# 🔑 Bitcoin Testnet Wallet Generator

## Generate Your Own Wallet Locally (More Secure!)

Instead of using online tools, you can generate your Bitcoin testnet wallet **locally on your computer**. This is more secure because your private key never leaves your machine.

---

## 🚀 How to Use

### Step 1: Install Dependencies

```powershell
cd C:\Users\Administrator\Desktop\Facet
npm install
```

This will install the required `elliptic` library for cryptography.

### Step 2: Run the Generator

```powershell
node generate-wallet.js
```

### Step 3: Save Your Wallet Info

The script will generate and display:

```
═══════════════════════════════════════════════════════
  🪙  Bitcoin Testnet Wallet Generator
═══════════════════════════════════════════════════════

✅ Wallet Generated Successfully!

═══════════════════════════════════════════════════════
  SAVE THIS INFORMATION SECURELY!
═══════════════════════════════════════════════════════

📍 Bitcoin Testnet Address:
   mxxx...xxxxx

🔑 Private Key (WIF format):
   cXXX...XXXX

🔐 Private Key (HEX format):
   xxxx...xxxx

📢 Public Key (Compressed):
   02xxxx...xxxx
```

### Step 4: Copy to .env File

The script will show you exactly what to put in your `.env` file:

```env
FAUCET_PRIVATE_KEY=cXXX...XXXX  # Copy from WIF format
FAUCET_ADDRESS=mxxx...xxxxx     # Copy from Address
```

---

## 🛡️ Security Advantages

✅ **Offline Generation** - Your private key is generated locally  
✅ **No Third Parties** - No need to trust external websites  
✅ **Full Control** - You have complete control over the process  
✅ **Open Source** - You can review the code yourself  

---

## 📝 What Each Output Means

| Field | Description | Use Case |
|-------|-------------|----------|
| **Address** | Your public Bitcoin testnet address | Share this to receive coins |
| **Private Key (WIF)** | Wallet Import Format - use this in `.env` | Keep this SECRET! |
| **Private Key (HEX)** | Raw hexadecimal format | For advanced usage |
| **Public Key** | Derived from private key | For verification |

---

## 💰 Getting Testnet Coins

After generating your wallet, get free testnet coins from:

1. **Testnet Faucet**: https://testnet-faucet.com/btc-testnet/
2. **Bitcoin Faucet**: https://bitcoinfaucet.uo1.net/
3. **Coin Faucet**: https://coinfaucet.eu/en/btc-testnet/

Just paste your **Address** (starts with 'm' or 'n') and claim!

---

## ⚠️ Important Security Notes

> [!CAUTION]
> **NEVER share your Private Key with anyone!**

> [!WARNING]
> **This is for TESTNET only** - Never use this for real Bitcoin!

> [!IMPORTANT]
> **Save your private key securely** - If you lose it, you lose access to the wallet!

---

## 🔄 Generate Multiple Wallets

You can run the script multiple times to generate different wallets:

```powershell
# Generate first wallet
node generate-wallet.js

# Generate another wallet
node generate-wallet.js

# Generate as many as you need!
node generate-wallet.js
```

Each time creates a completely new, unique wallet.

---

## 🎯 Quick Commands

```powershell
# Generate a new wallet
node generate-wallet.js

# Check if a wallet has balance (replace with your address)
curl https://api.blockcypher.com/v1/btc/test3/addrs/YOUR_ADDRESS/balance
```

---

## 📖 How It Works

The script:

1. Generates a random 32-byte private key using cryptographic randomness
2. Derives the public key using elliptic curve cryptography (secp256k1)
3. Creates a Bitcoin testnet address using Base58Check encoding
4. Formats the private key in WIF (Wallet Import Format)
5. Checks the balance via BlockCypher API

All of this happens **locally on your computer** - nothing is sent to external servers except the balance check (which only uses your public address).

---

**You now have a secure, locally-generated Bitcoin testnet wallet!** 🎉
