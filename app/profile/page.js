"use client"

import { useState } from "react"
import Header from "@/components/header"
import ParticleBackground from "@/components/particle-background"
import RouteGuard from "@/components/route-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/contexts/wallet-context"

function ProfileContent() {
  const { walletAddress, fluorBalance, nftCount, playerData, isLoading } = useWallet()

  // Remove the mock NFT state and replace with dynamic NFT generation
  const generateNftData = (count) => {
    const nfts = []
    for (let i = 1; i <= count; i++) {
      nfts.push({
        id: i,
        name: "Scientific Blueprint",
        description: "Blueprint for the Revival of Civilization",
        image:
          "https://rose-permanent-cricket-557.mypinata.cloud/ipfs/bafybeie7iiiwjxkucnzb2ut7fdmellhp7rmuicp3ubxbqia2wvzpoqeloe",
        rarity: "Common", // All NFTs are legendary
      })
    }
    return nfts
  }

  // Generate NFTs based on actual count
  const nfts = generateNftData(nftCount)

  const [selectedNft, setSelectedNft] = useState(null)

  const getRarityStyle = (rarity) => {
    const styles = {
      Common: "bg-gray-600/80 text-gray-200 border-gray-500",
      Rare: "bg-blue-600/80 text-blue-200 border-blue-500",
      Epic: "bg-purple-600/80 text-purple-200 border-purple-500",
      Legendary: "bg-yellow-600/80 text-yellow-200 border-yellow-500",
      Mythic: "bg-red-600/80 text-red-200 border-red-500",
    }
    return styles[rarity] || styles.Common
  }

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <ParticleBackground />
        <Header />
        <main className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p className="text-white text-xl">Loading Profile...</p>
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
          {/* Profile Header */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">Personal Laboratory</h1>
            <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-lg p-4 md:p-6 max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Scientist ID</p>
                  <p className="text-white font-mono text-sm md:text-lg break-all">
                    {walletAddress && walletAddress.length > 10
                      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                      : walletAddress}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Experiments Completed</p>
                  <p className="text-green-400 font-bold text-xl md:text-2xl">{playerData.levelsCompleted}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">FLUOR Balance</p>
                  <p className="text-blue-400 font-bold text-xl md:text-2xl">{fluorBalance.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">NFT Blueprints</p>
                  <p className="text-purple-400 font-bold text-xl md:text-2xl">{nftCount}</p>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-gray-400 text-xs md:text-sm">Current Level</p>
                    <p className="text-yellow-400 font-bold text-lg">
                      {playerData.currentLevel > 0 ? playerData.currentLevel : "Ready for Next"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs md:text-sm">Claimable Rewards</p>
                    <p className="text-orange-400 font-bold text-lg">{playerData.claimableRewardSets} Sets</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NFT Gallery */}
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 text-center">
              Kingdom of Science Blueprints
            </h2>

            {nftCount === 0 ? (
              <div className="text-center py-8 md:py-12">
                <p className="text-gray-400 text-base md:text-lg">No blueprints discovered yet.</p>
                <p className="text-gray-500 mt-2 text-sm md:text-base">
                  Complete experiments and unlock NFTs to build your collection!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {nfts.map((nft) => (
                  <Card
                    key={nft.id}
                    className="bg-gray-900/60 backdrop-blur-md border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 cursor-pointer transform hover:scale-105"
                    onClick={() => setSelectedNft(nft)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-lg mb-4 flex items-center justify-center border border-gray-600/30 overflow-hidden">
                        <img
                          src={nft.image || "/placeholder.svg"}
                          alt={nft.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            // Fallback to emoji if image fails to load
                            e.target.style.display = "none"
                            e.target.nextSibling.style.display = "flex"
                          }}
                        />
                        <div
                          className="w-full h-full items-center justify-center text-4xl md:text-6xl"
                          style={{ display: "none" }}
                        >
                          🧬
                        </div>
                      </div>
                      <h3 className="text-white font-semibold mb-2 text-sm md:text-base">{nft.name}</h3>
                      <Badge className={`text-xs ${getRarityStyle(nft.rarity)}`}>{nft.rarity}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* NFT Detail Modal */}
      {selectedNft && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-lg max-w-md w-full p-4 md:p-6">
            <div className="text-center mb-4">
              <div className="aspect-square bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded-lg mb-4 flex items-center justify-center border border-gray-600/30 overflow-hidden">
                <img
                  src={selectedNft.image || "/placeholder.svg"}
                  alt={selectedNft.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    // Fallback to emoji if image fails to load
                    e.target.style.display = "none"
                    e.target.nextSibling.style.display = "flex"
                  }}
                />
                <div
                  className="w-full h-full items-center justify-center text-6xl md:text-8xl"
                  style={{ display: "none" }}
                >
                  🧬
                </div>
              </div>
              <h3 className="text-white font-bold text-lg md:text-xl mb-2">{selectedNft.name}</h3>
              <Badge className={`mb-4 ${getRarityStyle(selectedNft.rarity)}`}>{selectedNft.rarity}</Badge>
              <p className="text-gray-300 text-xs md:text-sm">{selectedNft.description}</p>
            </div>
            <button
              onClick={() => setSelectedNft(null)}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-sm md:text-base"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Profile() {
  return (
    <RouteGuard>
      <ProfileContent />
    </RouteGuard>
  )
}
