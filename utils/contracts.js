import { ethers } from "ethers"

// Contract addresses
export const CONTRACT_ADDRESSES = {
    MEDUSA_SHARD_TOKEN: "0xC50A09C0B9b3357DbEfCB06c219C31FB8e5D5C55",
    FLUORITE_TOKEN: "0xCe95F6042F0859c046Ab0CdF9aEf69237b096300",
    KINGDOM_NFT: "0x096991aCB60160EF7B2344F9739Cd80d87AD5cEc",
    GAME_CONTROLLER: "0x3A2CBB7F0A7Cfa7C16F8b15bCfFa5c7C0864375E",
    TOKEN_SWAP: "0x5EefdBd62Df837a4FE95D64583C7Ccf0e2ADe49f"
}

// Contract ABIs
export const FLUORITE_TOKEN_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
]

export const MEDUSA_SHARD_TOKEN_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
]

export const TOKEN_SWAP_ABI = [
    "function swapTokens(uint256 amount)",
]

export const KINGDOM_NFT_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
    "function tokenURI(uint256 tokenId) view returns (string)",
]

export const GAME_CONTROLLER_ABI = [
    "function claimInitialTokens()",
    "function payToPlay()",
    "function claimReward()",
    "function recordLevelComplete(address playerAddress)",
    "function unlockNft()",
    "function getPlayerInfo(address player) view returns (uint256 fluorBalance, uint256 currentLevel, uint256 levelsCompleted, uint256 nftCount, uint256 claimableRewardSets)",
    "event LevelPlayed(address indexed player, uint256 currentLevel)",
    "event LevelCompleted(address indexed player, uint256 totalLevelsCompleted)",
    "event RewardClaimed(address indexed player, uint256 amount)",
    "event NftUnlocked(address indexed player)",
]

// Contract instances
export const getContracts = (signer) => {
    const fluoriteToken = new ethers.Contract(CONTRACT_ADDRESSES.FLUORITE_TOKEN, FLUORITE_TOKEN_ABI, signer)
    const medusaShardToken = new ethers.Contract(CONTRACT_ADDRESSES.MEDUSA_SHARD_TOKEN, MEDUSA_SHARD_TOKEN_ABI, signer)
    const kingdomNFT = new ethers.Contract(CONTRACT_ADDRESSES.KINGDOM_NFT, KINGDOM_NFT_ABI, signer)
    const gameController = new ethers.Contract(CONTRACT_ADDRESSES.GAME_CONTROLLER, GAME_CONTROLLER_ABI, signer)
    const tokenSwap = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN_SWAP, TOKEN_SWAP_ABI, signer)

    return {
        fluoriteToken,
        medusaShardToken,
        kingdomNFT,
        gameController,
        tokenSwap,
    }
}

// Contract instances
export const getReadOnlyContracts = (provider) => {
    const fluoriteToken = new ethers.Contract(CONTRACT_ADDRESSES.FLUORITE_TOKEN, FLUORITE_TOKEN_ABI, provider)
    const kingdomNFT = new ethers.Contract(CONTRACT_ADDRESSES.KINGDOM_NFT, KINGDOM_NFT_ABI, provider)
    const gameController = new ethers.Contract(CONTRACT_ADDRESSES.GAME_CONTROLLER, GAME_CONTROLLER_ABI, provider)

    return {
        fluoriteToken,
        kingdomNFT,
        gameController,
    }
}

// Helper functions
export const getProvider = (walletProvider) => {
    if (walletProvider && typeof window !== "undefined") {
        return new ethers.BrowserProvider(walletProvider);
    }
    return null;
}

// Helper functions
export const getReadProvider = () => {
    return new ethers.JsonRpcProvider("https://sepolia.base.org")
}

export const getSigner = async (walletProvider) => {
    const provider = getProvider(walletProvider)
    if (provider) {
        return await provider.getSigner()
    }
    return null
}
