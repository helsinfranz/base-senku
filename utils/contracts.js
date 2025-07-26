import { ethers } from "ethers"

// Contract addresses
export const CONTRACT_ADDRESSES = {
    FLUORITE_TOKEN: "0x3c0EDC63b641C52b89092978E2E945B65321D73C",
    KINGDOM_NFT: "0xFE47b9052A4D83c9B597a976ca650AB00DF210Bc",
    GAME_CONTROLLER: "0x1bdF540431F1b715Bf5f5a393E6b9d4F1d42B9A3",
}

// Contract ABIs
export const FLUORITE_TOKEN_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
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
    const kingdomNFT = new ethers.Contract(CONTRACT_ADDRESSES.KINGDOM_NFT, KINGDOM_NFT_ABI, signer)
    const gameController = new ethers.Contract(CONTRACT_ADDRESSES.GAME_CONTROLLER, GAME_CONTROLLER_ABI, signer)

    return {
        fluoriteToken,
        kingdomNFT,
        gameController,
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
export const getProvider = () => {
    if (typeof window !== "undefined" && window.ethereum) {
        return new ethers.BrowserProvider(window.ethereum)
    }
    return null
}

// Helper functions
export const getReadProvider = () => {
    return new ethers.JsonRpcProvider("https://rpc.sepolia-api.lisk.com")
}

export const getSigner = async () => {
    const provider = getProvider()
    if (provider) {
        return await provider.getSigner()
    }
    return null
}
