// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FluoriteToken.sol";
import "./KingdomBlueprintNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SenkuGameController is Ownable {
    FluoriteToken public token;
    KingdomBlueprintNFT public nft;

    uint256 public constant PLAY_FEE = 1 ether;
    uint256 public constant INITIAL_FREE_TOKENS = 5 ether;
    uint256 public constant NFT_UNLOCK_COST = 10 ether;
    uint256 public constant LEVELS_PER_REWARD_SET = 5;

    struct PlayerData {
        uint256 currentLevel; // Level currently being played (0 = none)
        uint256 levelsCompleted; // Total levels completed
        uint256 lastRewardClaimedSet; // Number of 5-level sets claimed
        bool hasClaimedInitialTokens;
    }

    mapping(address => PlayerData) public players;

    event LevelPlayed(address indexed player, uint256 currentLevel);
    event LevelCompleted(address indexed player, uint256 totalLevelsCompleted);
    event RewardClaimed(address indexed player, uint256 amount);
    event NftUnlocked(address indexed player);

    constructor(
        address _token,
        address _nft,
        address initialOwner
    ) Ownable(initialOwner) {
        token = FluoriteToken(_token);
        nft = KingdomBlueprintNFT(_nft);
    }

    /**
     * @notice Claim initial 5 FLUOR (only once).
     */
    function claimInitialTokens() external {
        PlayerData storage player = players[msg.sender];
        require(!player.hasClaimedInitialTokens, "Already claimed");
        player.hasClaimedInitialTokens = true;

        token.mint(msg.sender, INITIAL_FREE_TOKENS);
        emit RewardClaimed(msg.sender, INITIAL_FREE_TOKENS);
    }

    /**
     * @notice Start a level by paying 1 FLUOR.
     * Player must not already be in an active level.
     */
    function payToPlay() external {
        PlayerData storage player = players[msg.sender];
        require(player.currentLevel == 0, "Already in a level");

        token.burnFrom(msg.sender, PLAY_FEE);
        player.currentLevel = player.levelsCompleted + 1;

        emit LevelPlayed(msg.sender, player.currentLevel);
    }

    /**
     * @notice Mark current level complete (only backend can call).
     */
    function recordLevelComplete(address playerAddress) external onlyOwner {
        PlayerData storage player = players[playerAddress];
        require(player.currentLevel != 0, "Player not in a level");

        player.levelsCompleted = player.currentLevel;
        emit LevelCompleted(playerAddress, player.currentLevel);

        player.currentLevel = 0; // Require payment for next level
    }

    /**
     * @notice Claim FLUOR rewards for every 5 levels completed.
     */
    function claimReward() external {
        PlayerData storage player = players[msg.sender];
        uint256 setsCompleted = player.levelsCompleted / LEVELS_PER_REWARD_SET;

        require(setsCompleted > player.lastRewardClaimedSet, "No new sets");

        uint256 totalReward = 0;

        for (
            uint256 i = player.lastRewardClaimedSet + 1;
            i <= setsCompleted;
            i++
        ) {
            totalReward += (5 + i) * 1 ether;
        }

        player.lastRewardClaimedSet = setsCompleted;
        token.mint(msg.sender, totalReward);
        emit RewardClaimed(msg.sender, totalReward);
    }

    /**
     * @notice Spend 10 FLUOR to mint a new NFT blueprint.
     */
    function unlockNft() external {
        token.burnFrom(msg.sender, NFT_UNLOCK_COST);
        nft.safeMint(msg.sender);
        emit NftUnlocked(msg.sender);
    }

    /**
     * @notice View all player details.
     */
    function getPlayerInfo(
        address player
    )
        external
        view
        returns (
            uint256 fluorBalance,
            uint256 currentLevel,
            uint256 levelsCompleted,
            uint256 nftCount,
            uint256 claimableRewardSets
        )
    {
        PlayerData storage p = players[player];
        fluorBalance = token.balanceOf(player);
        currentLevel = p.currentLevel;
        levelsCompleted = p.levelsCompleted;
        nftCount = nft.balanceOf(player);

        uint256 completedSets = levelsCompleted / LEVELS_PER_REWARD_SET;
        claimableRewardSets = completedSets > p.lastRewardClaimedSet
            ? completedSets - p.lastRewardClaimedSet
            : 0;
    }
}
