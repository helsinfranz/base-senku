"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import ParticleBackground from "@/components/particle-background"
import GameBoard from "@/components/game-board"
import GameControls from "@/components/game-controls"
import InitialTokensModal from "@/components/initial-tokens-modal"
import RouteGuard from "@/components/route-guard"
import { useWallet } from "@/contexts/wallet-context"
import { useToast } from "@/components/toast"

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
    ethAddress,
  } = useWallet()
  const toast = useToast()

  const [gameState, setGameState] = useState({
    showLevelComplete: false,
    showInitialTokens: false,
    needsPayment: false,
    isPayingToPlay: false,
    isClaimingReward: false,
  })

  const [currentLevelId, setCurrentLevelId] = useState(1)
  const [showHelp, setShowHelp] = useState(false)
  const [showCongratulations, setShowCongratulations] = useState(false)

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

  useEffect(() => {
    if (playerData.levelsCompleted >= 100) {
      setShowCongratulations(true)
    }
  }, [playerData.levelsCompleted])

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
      const response = await fetch(`/api/game/level/${levelId}?playerAddress=${ethAddress}`)
      const data = await response.json()

      if (data.success) {
        setTubes(data.level.tubes)
        setSelectedTube(null)
        setMoveHistory([])
      } else {
        console.error("Failed to load level:", data.error)
        if (data.error === "Unauthorized access to this level") {
          toast.error("You don't have access to this level. Please complete previous levels first.")
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
      toast.error("Failed to load level. Please try again.")
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
          playerAddress: ethAddress,
          tubes: tubes,
          levelId: currentLevelId,
        }),
      })

      const data = await response.json()

      if (data.success && data.isCompleted) {
        toast.success("Level completed successfully! Recorded on blockchain.")
        setGameState((prev) => ({
          ...prev,
          showLevelComplete: true,
        }))
        // Force reload player data to get updated stats
        await loadPlayerData(true)
      } else if (data.isCompleted && !data.success) {
        // Solution is correct but blockchain failed - don't allow progression
        toast.error(
          "Your solution is correct, but we couldn't record it on the blockchain. Please try submitting again to proceed to the next level.",
        )
      } else {
        toast.warning(data.message || "Level not complete yet! Keep sorting the liquids.")
      }
    } catch (error) {
      console.error("Error checking completion:", error)
      toast.error("Error checking completion. Please try again.")
    } finally {
      setIsCheckingCompletion(false)
    }
  }

  const handleClaimInitialTokens = async () => {
    const success = await claimInitialTokens()
    if (success) {
      // Explicitly hide the modal and reload player data
      setGameState((prev) => ({ ...prev, showInitialTokens: false }))
      toast.success("Successfully claimed 5 FLUOR tokens!")
      // After claiming tokens, determine the current level
      setTimeout(() => {
        determineCurrentLevel()
      }, 2000) // Longer delay to ensure blockchain state is updated
    } else {
      toast.error("Failed to claim initial tokens. Please try again.")
    }
  }

  const handlePayToPlay = async () => {
    const success = await payToPlay()
    if (success) {
      toast.success("Payment successful! Level unlocked.")
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
      toast.success("Rewards claimed successfully!")
      // After claiming rewards, check if user can now afford to play
      setTimeout(() => {
        determineCurrentLevel()
      }, 2000) // Longer delay to ensure blockchain state is updated
    } else {
      toast.error("Failed to claim rewards. Please try again.")
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
      toast.error(`Cannot mint NFT: ${safety.reason}`)
      return
    }

    if (
      window.confirm(
        `Are you sure you want to spend 10 FLUOR to mint an NFT? You'll have ${(fluorBalance - 10).toFixed(2)} FLUOR remaining.`,
      )
    ) {
      const success = await unlockNft()
      if (success) {
        toast.success("NFT minted successfully!")
      } else {
        toast.error("Failed to mint NFT. Please try again.")
      }
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
      toast.success("Payment successful! Level unlocked.")
      setGameState((prev) => ({
        ...prev,
        needsPayment: false,
        isPayingToPlay: false,
      }))
      await loadLevel(currentLevelId)
    } else {
      toast.error("Payment failed. Please try again.")
      setGameState((prev) => ({ ...prev, isPayingToPlay: false }))
    }
  }

  if ((isLoading || walletLoading) && !gameState.showInitialTokens && !gameState.needsPayment && !showCongratulations) {
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

  // Show congratulations screen for completing level 100
  if (showCongratulations) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <ParticleBackground />
        <Header />
        <main className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-lg p-6 relative overflow-hidden">
              {/* Falling Confetti Animation */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-2xl animate-bounce"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `-20px`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${2 + Math.random() * 2}s`,
                      animationIterationCount: "infinite",
                      transform: `translateY(${Math.random() * 500 + 400}px)`,
                    }}
                  >
                    {["🎉", "🎊", "✨", "🏆", "🧪", "⚗️"][Math.floor(Math.random() * 6)]}
                  </div>
                ))}
              </div>

              <div className="relative z-10">
                <div className="text-6xl mb-4">🏆</div>
                <h1 className="text-3xl font-bold text-white mb-3">Congratulations!</h1>
                <p className="text-lg text-green-400 mb-4">You completed the first 100 levels!</p>
                <p className="text-gray-300 text-sm mb-6">Master Scientist of the Kingdom of Science</p>

                <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg p-4 mb-6 border border-green-500/30">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-400">100</div>
                      <div className="text-gray-300 text-xs">Levels</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{fluorBalance.toFixed(0)}</div>
                      <div className="text-gray-300 text-xs">FLUOR</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">{nftCount}</div>
                      <div className="text-gray-300 text-xs">NFTs</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const text =
                        "10 billion percent done! ✅ I've conquered all 100 levels of @SenkusElixir and mastered liquid alchemy. Think you can solve them faster? 🧪🏆 #SenkusElixir #Web3Gaming #PuzzleGames";
                      const url = "https://www.senkuselixir.xyz";
                      window.open(
                        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
                        "_blank",
                      );
                    }}
                    className="flex-1 bg-black hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share on X
                  </button>
                  {/* <button
                    onClick={() => setShowCongratulations(false)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-sm"
                  >
                    Close
                  </button> */}
                </div>

                <p className="text-gray-400 text-xs mt-4">More levels coming soon!</p>
              </div>
            </div>
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
                  <span className="text-blue-400 font-bold text-xl">{fluorBalance.toFixed(0)} FLUOR</span>
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
          <div className="text-center mb-6 md:mb-8 relative">
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

            {/* Help Button */}
            <button
              onClick={() => setShowHelp(true)}
              className="absolute top-0 right-0 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-full p-2 transition-all duration-300"
              title="How to Play"
            >
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
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

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-lg max-w-2xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white">How to Play</h2>
              <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Objective */}
              <div>
                <h3 className="text-xl font-semibold text-green-400 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Main Objective
                </h3>
                <p className="text-gray-300 text-base">
                  Sort all colored liquids so that each test tube contains only one color. Complete the level by
                  organizing all liquids into separate, single-colored tubes.
                </p>
              </div>

              {/* How to Play */}
              <div>
                <h3 className="text-xl font-semibold text-blue-400 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  How to Play
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <p className="text-gray-300">Click on a test tube to select it (it will glow and lift up)</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <p className="text-gray-300">
                      Click on another tube to pour the liquid from the first tube into the second
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <p className="text-gray-300">Continue sorting until each tube contains only one color</p>
                  </div>
                </div>
              </div>

              {/* Rules */}
              <div>
                <h3 className="text-xl font-semibold text-orange-400 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  Important Rules
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300">You can only pour liquid onto the same color or into empty tubes</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300">Each test tube can hold a maximum of 4 liquid units</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300">You can only move the top liquid from a tube</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300">Use the Undo button to reverse your last move</p>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div>
                <h3 className="text-xl font-semibold text-purple-400 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  Pro Tips
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300">Plan your moves ahead - think about which tubes you'll need empty</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300">Use empty tubes as temporary storage while sorting</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300">Start by identifying which colors have the most scattered pieces</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-300">Don't be afraid to use the Reset button if you get stuck</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700/50 text-center">
              <button
                onClick={() => setShowHelp(false)}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300"
              >
                Got it! Let's Play
              </button>
            </div>
          </div>
        </div>
      )}
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
