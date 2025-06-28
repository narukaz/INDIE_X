# 🎮 IndieHeaven – Empowering Indie Game Developers with Web3 Magic ✨

> 🚀 Indie games, NFT skins, lootboxes & rental economy – all trustless, secure, and fee-free. Built by **Omveer Naruka**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Chainlink](https://img.shields.io/badge/powered%20by-Chainlink-blueviolet)
![Built With](https://img.shields.io/badge/built%20with-React%20%7C%20Node%20%7C%20Solidity-green)

**Master Contract:** `0x7Ce0542F446725fFceccEF0739F632DE4f49c401`
**Live Demo:** [https://indie-x.vercel.app/](https://indie-x.vercel.app/)
**Demo Video:** [https://youtu.be/7Tx8yv7jV6g](https://youtu.be/7Tx8yv7jV6g)
**Network:** Sepolia Testnet

---

## 🧠 What Is IndieHeaven?

- Publish indie games with **0% royalty fee**
- Mint, buy, rent & trade **NFT skins**
- Open **lootboxes** with provable randomness
- Earn **passive income** through NFT rentals

---

## 🕹️ Platform Workflow

1. **Deploy Game** via `GameFactory.sol`
2. **Mint NFTs** (skins, lootbox tickets)
3. **Buy Games & NFTs** (true on‑chain ownership)
4. **Rent NFTs** → passive earnings
5. **Open Lootboxes** → win random rarities

---

## 🔮 Chainlink Services (Markdown Details)

### 1. 🌀 VRF (Verifiable Randomness)

- **What it does:** Provides cryptographically secure random numbers on‑chain.
- **In IndieHeaven:**

  - Registers each deployed game as a VRF consumer
  - Powers lootbox draws for fair Common/Rare/Legendary drops

### 2. 🤖 Keepers (Automation)

- **What it does:** Automates on‑chain tasks via upkeeps.
- **In IndieHeaven:**

  - Creates & funds an upkeep job when an NFT rental starts
  - Monitors rental expiry timestamps
  - Auto‑returns NFTs to owners at end of rental period

### 3. 💱 Price Feeds

- **What it does:** Delivers live asset price data (ETH/USD, etc.).
- **In IndieHeaven:**

  - Fetches current ETH/USD rates for pricing
  - Calculates dynamic game prices, rental fees, lootbox costs
  - Shields creators & players from volatility

---

## 📦 Pinata (IPFS Storage)

- **What it does:** Decentralized file & metadata storage on IPFS via Pinata.
- **In IndieHeaven:**

  - `POST /metadata` uploads JSON to Pinata → returns CID
  - `POST /image` uploads images to Pinata → returns CID

---

---

## 🛠️ Tech Stack & Integrations

- **Frontend:** React (Vite)
- **Backend:** Node.js / Express
- **Blockchain:** Solidity on Ethereum (Sepolia)
- **Storage:** IPFS via Pinata
- **Chainlink Services:** VRF · Keepers · Price Feeds

---

## 🔗 API Routes

| Route            | Description                               |
| ---------------- | ----------------------------------------- |
| `GET /get`       | Server health check / trigger cronjob     |
| `POST /metadata` | Upload JSON metadata → returns Pinata CID |
| `POST /image`    | Upload image file → returns Pinata CID    |

---

## 🚀 Quick Start

```bash
git clone https://github.com/narukaz/sui_amm_pool.git
cd sui_amm_pool
npm install
npm run dev
```

---

## 🔐 License

Released under the **MIT License**.
