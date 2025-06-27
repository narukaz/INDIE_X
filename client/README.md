# 🎮 INDIX – Empowering Indie Game Developers with Web3 Magic ✨

> 🚀 Indie games, NFT skins, lootboxes & rental economy – all trustless, secure, and fee-free. Built by **Omveer Naruka**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Chainlink](https://img.shields.io/badge/powered%20by-Chainlink-blueviolet)
![Built With](https://img.shields.io/badge/built%20with-React%20%7C%20Node%20%7C%20Solidity-green)

---

## 🧠 What is INDIX?

**INDIX** is a decentralized platform built for **Indie Game Developers** to publish, monetize, and gamify their creations with **NFTs**, **lootboxes**, and **cosmetic rentals**.

🔸 **0% Fee on Game Sales**  
🔸 **NFT Rentals with Chainlink Automation**  
🔸 **Lootbox with VRF Randomization**  
🔸 **Creator-first Model with Profit Sharing**  
🔸 **Trustless. Secure. Open-source.**

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite)
- **Backend**: Node.js
- **Blockchain**: Solidity, Ethereum
- **Chainlink Tools**:
  - 🧠 Price Feeds
  - 🎲 VRF (Random Lootboxes)
  - 🤖 Automation (Rental Return System)
- **Storage**: Pinata (IPFS)

---

## 🕹️ How It Works

### 🎮 Game Creators

- Deploy your game using `GameFactory.sol`
- Add cosmetic NFTs (skins) with rarity (Common / Rare / Legendary)
- Enable lootboxes to offer randomized NFT rewards
- Game copies can be sold (but **not** traded/rented)

### 👤 Players

- Buy a game (one-time, non-tradable)
- Buy or **rent** skins from other players
- Rent your unused cosmetics to earn passive income
- Open lootboxes to win random skins

---

## 💎 NFT Renting System

- NFTs have **set durations**
- Rentals are **trustless** and **automated**
- When rental time ends, the NFT is **automatically returned** via Chainlink Automation
- 2% goes to the platform, **3% directly to the game creator**

---

## 📦 Lootbox System (Random NFTs)

- Fully decentralized randomness using **Chainlink VRF**
- Devs can create custom lootboxes for their games
- Players can randomly get any NFT skin from the pool

---

## 🔐 Smart Contract Architecture

```bash
📁 contracts/
│
├── GameFactory.sol          # Deploys new games & initializes VRF
├── GameInstance.sol         # Contains rental, lootbox, and automation logic
│
```
