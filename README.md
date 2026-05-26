<div align="center">

# ⚡ Bitcoin Testnet Faucet

### A powerful, self-hosted Bitcoin Testnet Faucet with a full Admin Dashboard

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Bitcoin](https://img.shields.io/badge/Bitcoin-Testnet-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white)](https://bitcoin.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Stars](https://img.shields.io/github/stars/alinorzadnuix-hub/bitcoin-testnet-faucet?style=for-the-badge)](https://github.com/alinorzadnuix-hub/bitcoin-testnet-faucet/stargazers)

> Distribute free Bitcoin testnet coins instantly — no Bitcoin Core, no complex setup, just plug and play.

</div>

---

## 📖 About

**Bitcoin Testnet Faucet** is a fully open-source, self-hosted web application designed to help blockchain developers and testers get free Bitcoin testnet coins without any friction. Whether you are building a new DeFi product, testing a smart contract, experimenting with Bitcoin scripting, or simply learning how Bitcoin transactions work under the hood — this faucet gives you the testnet funds you need, instantly.

Unlike many faucets that rely on centralized third-party APIs or require you to register for API keys, this project uses the **mempool.space** public API, which is completely free and requires zero sign-up. Transactions are built and signed locally using **bitcoinjs-lib**, meaning your private key never leaves your own server.

The project ships with a **beautiful dark-themed UI** featuring glassmorphism effects, a fully responsive layout, and a real-time balance display. On the backend, all claims are stored in a **SQLite database** — no PostgreSQL, no MySQL, no DevOps overhead. Just a single file that works out of the box.

For operators, the built-in **Admin Dashboard** provides a complete overview of all transactions, user addresses, payout amounts, and timestamps. Admins can also trigger custom payouts to any testnet address directly from the dashboard — perfect for sending test funds to your team.

The faucet supports **configurable payout ranges**, so each user receives a random amount between your defined minimum and maximum, making the experience feel more authentic. Rate limiting ensures fair usage across all users.

Designed for **Windows Server deployment** with one-click `.bat` startup scripts, but works equally well on Linux and macOS. Production-ready with PM2 support for zero-downtime operation.

> **Built for the Bitcoin developer community — because good tooling should be free and open.**

---

## ✨ Features

| Feature | Description |
|---|---|
| ⚡ **Instant Payouts** | Sends testnet BTC to any valid address in seconds |
| 🎨 **Modern Dark UI** | Glassmorphism design, fully responsive on all devices |
| 🔒 **Secure Admin Panel** | Password-protected dashboard with full transaction history |
| 🎲 **Random Payout Amounts** | Configurable min/max range to keep it interesting |
| 📡 **No API Key Needed** | Uses `mempool.space` public API — zero registration required |
| �️ **Custom Send Support** | Admin can send custom amounts directly from the dashboard |
| 💾 **SQLite Database** | Lightweight, zero-config database — no external DB server |
| 🌐 **Self-Hosted** | Full control over your faucet, run it on any server |
| 🖥️ **Windows Ready** | One-click `.bat` startup scripts included |
| 🔗 **Transaction Tracking** | Every claim recorded with TXID, address, amount, and timestamp |

---

## � Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A Bitcoin **testnet** wallet (private key + address)

### 1. Clone the Repository

```bash
git clone https://github.com/alinorzadnuix-hub/bitcoin-testnet-faucet.git
cd bitcoin-testnet-faucet
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
copy .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=3000

# Random payout range (satoshis)
FAUCET_AMOUNT_MIN=5000
FAUCET_AMOUNT_MAX=15000

# Your testnet wallet (WIF private key + address)
FAUCET_PRIVATE_KEY=your_testnet_private_key_here
FAUCET_ADDRESS=your_testnet_address_here

# Admin panel credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourSecurePassword123!
```

> 💡 Generate a free testnet wallet at [privatekeys.pw](https://privatekeys.pw/keys/bitcoin/testnet)

### 4. Fund Your Faucet Wallet

Get free testnet coins from these sources:
- https://testnet-faucet.com/btc-testnet/
- https://bitcoinfaucet.uo1.net/
- https://coinfaucet.eu/en/btc-testnet/

### 5. Start the Server

**Windows (easiest):** double-click `start.bat`

**Or via terminal:**
```bash
npm start
```

Then open: **http://localhost:3000**

---

## 🌐 Pages

| URL | Description |
|---|---|
| `http://localhost:3000` | Public faucet — users claim testnet BTC here |
| `http://localhost:3000/admin` | Admin dashboard — transactions, stats, custom sends |

---

## 📁 Project Structure

```
bitcoin-testnet-faucet/
├── server.js           # Express server & API routes
├── bitcoin-wallet.js   # Bitcoin transaction signing (bitcoinjs-lib)
├── database.js         # SQLite database manager
├── config.js           # Central configuration
├── package.json        # Dependencies
├── .env.example        # Environment variable template
├── start.bat           # Windows one-click start
├── public/
│   ├── index.html      # Faucet homepage
│   ├── admin.html      # Admin dashboard
│   └── css/
│       └── style.css   # Styles
└── faucet.db           # Auto-created SQLite database
```

---

## ⚙️ Configuration Reference

All settings live in `.env`:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `FAUCET_AMOUNT_MIN` | `5000` | Min payout in satoshis |
| `FAUCET_AMOUNT_MAX` | `15000` | Max payout in satoshis |
| `NETWORK_FEE` | `300` | Transaction fee in satoshis |
| `ENFORCE_MIN_MAX` | `false` | Enforce custom send limits |
| `FAUCET_PRIVATE_KEY` | — | Testnet wallet WIF private key |
| `FAUCET_ADDRESS` | — | Testnet wallet address |
| `ADMIN_USERNAME` | `admin` | Admin panel username |
| `ADMIN_PASSWORD` | — | Admin panel password |

---

## 📊 How It Works

```
User submits address
        │
        ▼
  Validate address format
        │
        ▼
  Check cooldown (24h per address/IP)
        │
        ▼
  Fetch UTXOs from mempool.space
        │
        ▼
  Build & sign transaction (bitcoinjs-lib)
        │
        ▼
  Broadcast to Bitcoin Testnet
        │
        ▼
  Save to SQLite database → Return TXID
```

---

## 🖥️ Production Deployment

### Keep it Running with PM2

```bash
npm install -g pm2
pm2 start server.js --name bitcoin-faucet
pm2 save
pm2 startup
```

### Open Firewall Port (Windows)

```powershell
New-NetFirewallRule -DisplayName "Bitcoin Faucet" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### Access Remotely

- Local network: `http://YOUR_SERVER_IP:3000`
- Public: configure port forwarding on your router or use a reverse proxy (nginx)

---

## 🔒 Security

> [!WARNING]
> **This project is for TESTNET only. Never use real Bitcoin (mainnet) private keys.**

- Change the default `ADMIN_PASSWORD` before deploying
- The `.env` file is in `.gitignore` — never commit it
- Regularly backup `faucet.db`
- Do not expose the `/admin` route publicly without HTTPS

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---|---|
| `Module not found` | Run `npm install` |
| `.env not found` | Copy `.env.example` to `.env` |
| `Insufficient funds` | Fund your faucet wallet from a testnet faucet |
| `Transaction not showing` | Check TXID on [mempool.space/testnet](https://mempool.space/testnet) |
| `Admin panel login fails` | Double-check `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env` |
| `Database locked` | Only one server instance can run at a time — kill other processes |

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## � License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## � Acknowledgements

- [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) — Bitcoin transaction signing
- [mempool.space](https://mempool.space) — Free public Bitcoin API
- [Express.js](https://expressjs.com/) — Web framework
- [sql.js](https://github.com/sql-js/sql.js) — SQLite in Node.js

---

<div align="center">

**Built for the Bitcoin developer community** ⚡

If this project helped you, please consider giving it a ⭐ — it means a lot!

</div>
