"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import ParticleBackground from "@/components/particle-background"
import GameBoard from "@/components/game-board"
import GameControls from "@/components/game-controls"
// import LevelCompleteModal from "@/components/level-complete-modal"
import InitialTokensModal from "@/components/initial-tokens-modal"
import RouteGuard from "@/components/route-guard"
import { useWallet } from "@/contexts/wallet-context"

function GameArenaContent() {
  const {
    fluorBalance,
    nftCount,
    playerData,
    isLoading: walletLoading,
    claimInitialTokens,
    payToPlay,
    claimReward,
    unlockNft,
    loadPlayerData,
    walletAddress,
  } = useWallet()

  const [gameState, setGameState] = useState({
    showLevelComplete: false,
    showInitialTokens: false,
    needsPayment: false,
    isPayingToPlay: false,
    isClaimingReward: false,
  })

  const [currentLevelId, setCurrentLevelId] = useState(1)

  const [tubes, setTubes] = useState([])
  const [selectedTube, setSelectedTube] = useState(null)
  const [moveHistory, setMoveHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingCompletion, setIsCheckingCompletion] = useState(false)

  useEffect(() => {
    if (!walletLoading && playerData) {
      determineCurrentLevel()
    }
  }, [playerData, walletLoading])

  useEffect(() => {
    // Show initial tokens modal for first-time players
    // Only show if they haven't claimed initial tokens AND they have 0 balance AND wallet is not loading
    if (!playerData.hasClaimedInitialTokens && fluorBalance === 0 && !walletLoading) {
      setGameState((prev) => ({ ...prev, showInitialTokens: true }))
    }
    // Don't automatically hide the modal here - let the claim success handle it
  }, [playerData.hasClaimedInitialTokens, fluorBalance, walletLoading])

  const determineCurrentLevel = () => {
    let levelToLoad = 1
    let needsPayment = false

    if (playerData.currentLevel > 0) {
      // User has paid for a level and is currently playing it
      levelToLoad = playerData.currentLevel
      needsPayment = false
    } else if (playerData.levelsCompleted > 0) {
      // User has completed some levels, next level needs payment
      levelToLoad = playerData.levelsCompleted + 1
      needsPayment = true
    } else {
      // New user, first level needs payment
      levelToLoad = 1
      needsPayment = true
    }

    setCurrentLevelId(levelToLoad)
    setGameState((prev) => ({ ...prev, needsPayment }))

    if (!needsPayment) {
      loadLevel(levelToLoad)
    }
  }

  const loadLevel = async (levelId) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/game/level/${levelId}?playerAddress=${walletAddress}`)
      const data = await response.json()

      if (data.success) {
        setTubes(data.level.tubes)
        setSelectedTube(null)
        setMoveHistory([])
      } else {
        console.error("Failed to load level:", data.error)
        if (data.error === "Unauthorized access to this level") {
          alert("You don't have access to this level. Please complete previous levels first.")
          // Redirect to appropriate level
          await loadPlayerData(true) // Force refresh
          return
        }
        // Fallback to default level if API fails
        setTubes([
          [
            { color: "#FFD700", id: 1 },
            { color: "#FF6B35", id: 2 },
            { color: "#DC143C", id: 3 },
          ],
          [
            { color: "#FF6B35", id: 2 },
            { color: "#DC143C", id: 3 },
            { color: "#FFD700", id: 1 },
          ],
          [],
          [],
        ])
      }
    } catch (error) {
      console.error("Error loading level:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    setIsCheckingCompletion(true)
    try {
      const response = await fetch("/api/game/record-completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerAddress: walletAddress,
          tubes: tubes,
          levelId: currentLevelId,
        }),
      })

      const data = await response.json()

      if (data.success && data.isCompleted) {
        setGameState((prev) => ({
          ...prev,
          showLevelComplete: true,
        }))
        // Force reload player data to get updated stats
        await loadPlayerData(true)
      } else if (data.isCompleted && !data.success) {
        // Solution is correct but blockchain failed - don't allow progression
        alert(
          `Your solution is correct, but we couldn't record it on the blockchain. Please try submitting again to proceed to the next level.`,
        )
      } else {
        alert(data.message || "Level not complete yet! Keep sorting the liquids.")
      }
    } catch (error) {
      console.error("Error checking completion:", error)
      alert("Error checking completion. Please try again.")
    } finally {
      setIsCheckingCompletion(false)
    }
  }

  const handleClaimInitialTokens = async () => {
    const success = await claimInitialTokens()
    if (success) {
      // Explicitly hide the modal and reload player data
      setGameState((prev) => ({ ...prev, showInitialTokens: false }))
      // After claiming tokens, determine the current level
      setTimeout(() => {
        determineCurrentLevel()
      }, 2000) // Longer delay to ensure blockchain state is updated
    }
  }

  const handlePayToPlay = async () => {
    const success = await payToPlay()
    if (success) {
      setGameState((prev) => ({
        ...prev,
        showLevelComplete: false,
      }))
      // Load the next level
      const nextLevel = playerData.levelsCompleted + 1
      await loadLevel(nextLevel)
    }
  }

  const handleClaimReward = async () => {
    setGameState((prev) => ({ ...prev, isClaimingReward: true }))
    const success = await claimReward()
    if (success) {
      // After claiming rewards, check if user can now afford to play
      setTimeout(() => {
        determineCurrentLevel()
      }, 2000) // Longer delay to ensure blockchain state is updated
    }
    setGameState((prev) => ({ ...prev, isClaimingReward: false }))
  }

  // Calculate if NFT minting would cause a stuck situation
  const calculateNftMintingSafety = () => {
    const nftCost = 10
    const levelCost = 1

    if (fluorBalance < nftCost) {
      return { canMint: false, reason: "Insufficient FLUOR for NFT minting" }
    }

    const balanceAfterMint = fluorBalance - nftCost
    const levelsCompleted = playerData.levelsCompleted

    // Calculate potential future rewards
    // Reward formula: 5 + (completedSets * 1) where completedSets = floor(levelsCompleted / 5)
    const currentRewardSets = Math.floor(levelsCompleted / 5)
    const nextRewardAt = (currentRewardSets + 1) * 5
    const levelsUntilNextReward = nextRewardAt - levelsCompleted

    // If user can't afford to play until next reward, they'll be stuck
    if (balanceAfterMint < levelsUntilNextReward * levelCost) {
      const nextRewardAmount = 5 + currentRewardSets + 1 // Next reward will be 1 more than current
      return {
        canMint: false,
        reason: `Minting NFT would leave you with ${balanceAfterMint.toFixed(2)} FLUOR. You need ${levelsUntilNextReward} FLUOR to reach your next reward (${nextRewardAmount} FLUOR at level ${nextRewardAt}).`,
      }
    }

    return { canMint: true, reason: "Safe to mint NFT" }
  }

  const handleUnlockNft = async () => {
    const safety = calculateNftMintingSafety()
    if (!safety.canMint) {
      alert(`Cannot mint NFT: ${safety.reason}`)
      return
    }

    if (
      window.confirm(
        `Are you sure you want to spend 10 FLUOR to mint an NFT? You'll have ${(fluorBalance - 10).toFixed(2)} FLUOR remaining.`,
      )
    ) {
      await unlockNft()
    }
  }

  const resetGame = () => {
    const currentLevel = playerData.currentLevel > 0 ? playerData.currentLevel : playerData.levelsCompleted + 1
    loadLevel(currentLevel)
  }

  const undoMove = () => {
    if (moveHistory.length > 0) {
      const lastMove = moveHistory[moveHistory.length - 1]
      setTubes(lastMove)
      setMoveHistory((prev) => prev.slice(0, -1))
    }
  }

  const handleTubeClick = (tubeIndex) => {
    if (isCheckingCompletion || walletLoading) return

    if (selectedTube === null) {
      if (tubes[tubeIndex].length > 0) {
        setSelectedTube(tubeIndex)
      }
    } else if (selectedTube === tubeIndex) {
      setSelectedTube(null)
    } else {
      const fromTube = tubes[selectedTube]
      const toTube = tubes[tubeIndex]

      if (
        fromTube.length > 0 &&
        (toTube.length === 0 ||
          (toTube.length < 4 && toTube[toTube.length - 1].color === fromTube[fromTube.length - 1].color))
      ) {
        setMoveHistory((prev) => [...prev, JSON.parse(JSON.stringify(tubes))])

        const newTubes = JSON.parse(JSON.stringify(tubes))
        const liquid = newTubes[selectedTube].pop()
        newTubes[tubeIndex].push(liquid)

        setTubes(newTubes)
      }
      setSelectedTube(null)
    }
  }

  const canClaimReward = playerData.claimableRewardSets > 0
  const nftSafety = calculateNftMintingSafety()
  const canUnlockNft = nftSafety.canMint
  const currentLevel = playerData.currentLevel > 0 ? playerData.currentLevel : playerData.levelsCompleted + 1

  const handlePayToPlayCurrent = async () => {
    setGameState((prev) => ({ ...prev, isPayingToPlay: true }))
    const success = await payToPlay()
    if (success) {
      setGameState((prev) => ({
        ...prev,
        needsPayment: false,
        isPayingToPlay: false,
      }))
      await loadLevel(currentLevelId)
    } else {
      setGameState((prev) => ({ ...prev, isPayingToPlay: false }))
    }
  }

  if ((isLoading || walletLoading) && !gameState.showInitialTokens && !gameState.needsPayment) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <ParticleBackground />
        <Header />
        <main className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p className="text-white text-xl">Loading Laboratory...</p>
            <p className="text-gray-400 text-sm mt-2">Preparing Level {currentLevelId}</p>
          </div>
        </main>
      </div>
    )
  }

  // Show initial tokens modal first if needed
  if (gameState.showInitialTokens) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <ParticleBackground />
        <Header />
        <main className="relative z-10 pt-24 pb-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Laboratory Arena</h1>
              <p className="text-gray-400 text-base">Welcome to the Kingdom of Science!</p>
            </div>
          </div>
        </main>
        <InitialTokensModal onClaim={handleClaimInitialTokens} isLoading={walletLoading} />
      </div>
    )
  }

  // Show payment screen if user needs to pay for current level
  if (gameState.needsPayment) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <ParticleBackground />
        <Header />
        <main className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-lg p-8 text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">🧪</div>
                <h2 className="text-3xl font-bold text-white mb-2">Level {currentLevelId}</h2>
                <p className="text-gray-300">Ready to start your next experiment?</p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Cost to Play:</span>
                  <span className="text-yellow-400 font-bold text-xl">1 FLUOR</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-400">Your Balance:</span>
                  <span className="text-blue-400 font-bold text-xl">{fluorBalance.toFixed(2)} FLUOR</span>
                </div>
                {canClaimReward && (
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-600/50">
                    <span className="text-gray-400">Claimable Rewards:</span>
                    <span className="text-green-400 font-bold text-xl">{playerData.claimableRewardSets} Sets</span>
                  </div>
                )}
              </div>

              {/* Claim Rewards Section */}
              {canClaimReward && (
                <div className="mb-4">
                  <button
                    onClick={handleClaimReward}
                    disabled={gameState.isClaimingReward}
                    className="w-full text-lg py-3 font-semibold rounded-lg transition-all duration-300 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white mb-3"
                  >
                    {gameState.isClaimingReward
                      ? "Claiming Rewards..."
                      : `Claim ${playerData.claimableRewardSets} Reward Sets`}
                  </button>
                  <p className="text-green-400 text-sm mb-4">
                    Each reward set gives you FLUOR tokens to continue playing!
                  </p>
                </div>
              )}

              {/* Pay to Play Button */}
              <button
                onClick={handlePayToPlayCurrent}
                disabled={fluorBalance < 1 || gameState.isPayingToPlay}
                className={`w-full text-lg py-3 font-semibold rounded-lg transition-all duration-300 ${fluorBalance >= 1 && !gameState.isPayingToPlay
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white"
                    : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                  }`}
              >
                {gameState.isPayingToPlay
                  ? "Processing Payment..."
                  : fluorBalance >= 1
                    ? "Pay & Start Level"
                    : "Insufficient FLUOR"}
              </button>

              {fluorBalance < 1 && !canClaimReward && (
                <p className="text-red-400 text-sm mt-4">
                  You need more FLUOR tokens to play. Complete previous levels or claim rewards to earn more.
                </p>
              )}

              {fluorBalance < 1 && canClaimReward && (
                <p className="text-yellow-400 text-sm mt-4">
                  Claim your reward sets above to get FLUOR tokens and continue playing!
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />
      <Header />

      <main className="relative z-10 pt-24 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Laboratory Arena</h1>
            <p className="text-green-400 text-base md:text-lg">Level {currentLevelId}</p>
            <div className="text-sm text-gray-400 mt-2">
              <p>Levels Completed: {playerData.levelsCompleted}</p>
              {playerData.currentLevel > 0 && (
                <p className="text-yellow-400">Currently Playing Level {playerData.currentLevel}</p>
              )}
            </div>
            {isCheckingCompletion && (
              <p className="text-yellow-400 text-sm mt-2 animate-pulse">Analyzing solution...</p>
            )}
          </div>

          <GameBoard tubes={tubes} selectedTube={selectedTube} onTubeClick={handleTubeClick} />

          <GameControls
            onReset={resetGame}
            onUndo={undoMove}
            onClaimReward={handleClaimReward}
            onUnlockNft={handleUnlockNft}
            onSubmit={handleSubmit}
            canClaimReward={canClaimReward}
            canUnlockNft={canUnlockNft}
            canUndo={moveHistory.length > 0}
            isCheckingCompletion={isCheckingCompletion}
          />
        </div>
      </main>

      {/* {gameState.showLevelComplete && (
        <LevelCompleteModal onNextLevel={handlePayToPlay} canAfford={fluorBalance >= 1} isLoading={walletLoading} />
      )} */}
    </div>
  )
}

export default function GameArena() {
  return (
    <RouteGuard>
      <GameArenaContent />
    </RouteGuard>
  )
}
