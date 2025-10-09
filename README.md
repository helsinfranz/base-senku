# 🧪 Senku's Elixir

<div align="center">
  <a href="https://senkuselixir.xyz">
    <picture>
      <img alt="Senku's Elixir Logo" src="https://senkuselixir.xyz/android-chrome-512x512.png" height="128">
    </picture>
  </a>
  <br />
  <p><strong>A Web3 Puzzle Game Inspired by Dr. Stone</strong></p>
  <p>
    <a href="#features">Features</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#gameplay">Gameplay</a> •
    <a href="#tokenomics">Tokenomics</a> •
    <a href="#roadmap">Roadmap</a>
  </p>
</div>

## 📖 About

Senku's Elixir is an innovative blockchain-based puzzle game that combines strategic thinking with Web3 mechanics. Players solve increasingly challenging tube puzzles while earning FLUOR tokens and collecting unique Kingdom Blueprint NFTs.

## ✨ Features

- **100 Challenging Levels**: From Easy to Extremely Hard difficulties
- **Play-to-Earn Mechanics**: Earn FLUOR tokens for completing levels
- **NFT Integration**: Unlock special Kingdom Blueprint NFTs
- **Smart Contract Based**: Transparent and secure gameplay mechanics
- **Web3 Integration**: Built on Base Network, Token on Solana
- **Modern UI**: Built with Next.js and Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PNPM package manager
- MetaMask or any Web3 wallet

### Installation

1. Clone the repository:

```bash
git clone https://github.com/helsinfranz/base-senku.git
cd base-senku
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a .env file based on env.example:

```bash
cp env.example .env.local
```

4. Start the development server:

```bash
pnpm dev
```

Visit http://localhost:3000 to start playing!

## 🎮 Gameplay

1. Connect your Web3 wallet
2. Claim initial FLUOR tokens
3. Pay 1 FLUOR to start a level
4. Solve the tube puzzle by moving colored elements
5. Complete levels to earn rewards
6. Collect special NFTs using FLUOR tokens

## 💎 Token System

### FLUOR Token

- **Type**: Primary in-game utility token
- **Standard**: ERC-20
- **Network**: Base Sepolia
- **Address**: `0xCe95F6042F0859c046Ab0CdF9aEf69237b096300`
- **Use Cases**:
  - Start new levels (1 FLUOR per level)
  - Unlock special NFTs
  - Earn rewards for completing levels
  - New players receive 5 FLUOR for free

### MDS Token (Medusa Shards)

- **Type**: DEX Utility Token with swap utility
- **Standard**: SPL
- **Network**: Solana
- **Address**: `Coming Soon`
- **Use Cases**:
  - Purchasing FLUOR from $MDS
  - Future ecosystem utility

### Token Purchase System

Buy FLUOR from $MDS in buy section.
- **Features**:
  - Conversion from MDS to FLUOR
  - 1:1 swap ratio
  - No swap fees (only solana network gas)
  - One-click process

## 💎 Tokenomics

### MDS Distribution

- **Public Sale**: 37.5% - Available for public purchase and trading
- **Liquidity Pool**: 12.5% - Reserved for DEX liquidity provision
- **KOLs**: 10% - Amplify launch & shill
- **Development Team**: 25% - Core development team allocation
- **Airdrops**: 5% - Quests & community rewards
- **DcodeBlock**: 10% - Support, infra & ops

## 🗺️ Roadmap

### Q3 2025 - Economic Expansion

- Launch of $MDS Token
- $MDS to FLUOR Purchase System
- Enhanced Gameplay Integration
- New Level Additions

### Q4 2025 - The Forge Creation

- KOSB to Ranked NFT Conversion System
- Legendary & Epic Tier NFT Minting
- NFT Marketplace Integration

### Q1 2026 - Competitive Ecosystem

- Global Leaderboard System
- High-Ranking Player Rewards
- FLUOR-Based DAO Governance

### Q2 2026 - ARC Seasons & Stone World

- Dr. Stone Storyline Integration
- Multi-Difficulty Level Campaigns
- Educational Material Cards System

## 🛠 Built With

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Ethers.js](https://docs.ethers.org/v6/)
- [Solidity](https://soliditylang.org/)

## 📝 Smart Contracts

All our smart contracts are deployed on the Base Sepolia Testnet and verified on Blockscout..

### FluoriteToken (FLUOR)

- **Contract Address**: `0xCe95F6042F0859c046Ab0CdF9aEf69237b096300`
- [View on Basescout](https://base-sepolia.blockscout.com/address/0xCe95F6042F0859c046Ab0CdF9aEf69237b096300)
- ERC-20 token that powers the game economy
- Used for level entry, rewards, and NFT minting

### MedusaShardToken (MDS)

- **Contract Address**: `Coming Soon`
- SPL utility token for Senku's Elixir.
- Future ecosystem utility

### KingdomBlueprintNFT (KOSB)

- **Contract Address**: `0x096991aCB60160EF7B2344F9739Cd80d87AD5cEc`
- [View on Basescout](https://base-sepolia.blockscout.com/address/0x096991aCB60160EF7B2344F9739Cd80d87AD5cEc)
- ERC-721 collection representing unique Kingdom Blueprint NFTs
- Includes metadata for different rarity tiers and special abilities

### SenkuGameController

- **Contract Address**: `0x3A2CBB7F0A7Cfa7C16F8b15bCfFa5c7C0864375E`
- [View on Basescout](https://base-sepolia.blockscout.com/address/0x3A2CBB7F0A7Cfa7C16F8b15bCfFa5c7C0864375E)
- Main game logic controller
- Handles level completion verification and reward distribution
- Manages NFT minting and token interactions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/helsinfranz/base-senku/issues).

## 💫 Acknowledgments

- Built on Base Network
- $MDS Token on Solana
- Inspired by Dr. Stone
- Powered by modern Web3 technologies

---

<div align="center">
  <img src="https://senkuselixir.xyz/brands/solana.png" alt="Solana" height="45"/>
  <img src="https://senkuselixir.xyz/brands/dcb.jpg" alt="DCB" height="45"/>
  <img src="https://senkuselixir.xyz/brands/base.png" alt="Base Network" height="45"/>
  <img src="https://senkuselixir.xyz/brands/cyreneai.png" alt="CyreneAI" height="45"/>
  <img src="https://senkuselixir.xyz/brands/mds.png" alt="MDS" height="45"/>
</div>
