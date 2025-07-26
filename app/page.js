"use client"
import { useState, useEffect } from "react"
import Header from "@/components/header"
import ParticleBackground from "@/components/particle-background"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useWallet } from "@/contexts/wallet-context"
import { Atom, Beaker, Trophy, Zap, Gem, TrendingUp, Gift } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  const { isConnected } = useWallet()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />
      <Header />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
        <div className="max-w-7xl mx-auto w-full">
          {/* Hero Section - Asymmetrical Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 md:mb-16">
            {/* Left Side - Text Content */}
            <div className="text-left lg:pr-8">
              <Card className="bg-gray-900/60 backdrop-blur-md border border-gray-700/50">
                <CardContent className="p-6 md:p-8">
                  <h1 className="text-3xl md:text-5xl lg:text-5xl font-bold mb-4 text-white leading-tight">
                    Science Will Save the World
                    <span className="block text-green-400 text-2xl md:text-3xl lg:text-4xl mt-2 font-light">
                      One Drop at a Time
                    </span>
                  </h1>

                  <p className="text-base md:text-lg text-gray-300 mb-8 leading-relaxed">
                    Master the art of liquid alchemy. Sort, combine, and perfect your formulas to rebuild civilization.{" "}
                    <span className="text-green-400 font-semibold">Ten billion points says you'll be captivated.</span>
                  </p>

                  {isConnected ? (
                    <Link href="/game">
                      <Button className="text-lg md:text-xl px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white font-semibold rounded-lg shadow-2xl transform hover:scale-105 transition-all duration-1500 animate-pulse">
                        Enter the Lab
                      </Button>
                    </Link>
                  ) : (
                    <p className="text-yellow-400 font-semibold text-base md:text-lg">
                      Connect your wallet to begin your scientific journey!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Hero Image */}
            <div className="relative flex justify-center lg:justify-end">
              <div
                className="relative w-80 h-80 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px]"
                style={{
                  transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
                  transition: "transform 0.1s ease-out",
                }}
              >
                {/* Dramatic Glow Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 via-green-400/40 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/20 to-green-400/40 rounded-full blur-2xl animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                ></div>
                <div
                  className="absolute inset-0 bg-gradient-to-t from-blue-500/20 via-transparent to-green-300/30 rounded-full blur-xl animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>

                {/* Hero Image */}
                <div className="relative w-full h-full">
                  <Image
                    src="/hero.png"
                    alt="Senku - Master of Science"
                    fill
                    className="object-contain drop-shadow-2xl rounded-[24px]"
                    style={{
                      filter: "drop-shadow(0 0 30px rgba(34, 197, 94, 0.3))",
                    }}
                    priority
                  />
                </div>

                {/* Additional Light Rays */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent rotate-45 animate-pulse"></div>
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent -rotate-45 animate-pulse"
                    style={{ animationDelay: "0.7s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
            <Card className="bg-gray-900/40 backdrop-blur-md border border-gray-700/30 hover:border-green-500/50 transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-4 md:p-6 text-center">
                <Atom className="w-8 h-8 md:w-12 md:h-12 text-green-400 mx-auto mb-3 md:mb-4" />
                <h3 className="text-white font-semibold text-sm md:text-base mb-2">Liquid Alchemy</h3>
                <p className="text-gray-400 text-xs md:text-sm">
                  Master the art of sorting and combining chemical compounds
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/40 backdrop-blur-md border border-gray-700/30 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-4 md:p-6 text-center">
                <Beaker className="w-8 h-8 md:w-12 md:h-12 text-blue-400 mx-auto mb-3 md:mb-4" />
                <h3 className="text-white font-semibold text-sm md:text-base mb-2">FLUOR Tokens</h3>
                <p className="text-gray-400 text-xs md:text-sm">
                  Earn tokens for successful experiments and discoveries
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/40 backdrop-blur-md border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-4 md:p-6 text-center">
                <Trophy className="w-8 h-8 md:w-12 md:h-12 text-purple-400 mx-auto mb-3 md:mb-4" />
                <h3 className="text-white font-semibold text-sm md:text-base mb-2">NFT Blueprints</h3>
                <p className="text-gray-400 text-xs md:text-sm">
                  Unlock rare Kingdom of Science blueprint collectibles
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/40 backdrop-blur-md border border-gray-700/30 hover:border-yellow-500/50 transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-4 md:p-6 text-center">
                <Zap className="w-8 h-8 md:w-12 md:h-12 text-yellow-400 mx-auto mb-3 md:mb-4" />
                <h3 className="text-white font-semibold text-sm md:text-base mb-2">Lisk Network</h3>
                <p className="text-gray-400 text-xs md:text-sm">Built on Lisk Sepolia for fast, secure transactions</p>
              </CardContent>
            </Card>
          </div>

          {/* Game Guide Section */}
          <Card className="bg-gray-900/60 backdrop-blur-md border border-gray-700/50">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">How to Play Senku's Elixir</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Game Rules */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-green-400 mb-4 flex items-center">
                      <Beaker className="w-5 h-5 mr-2" />
                      Game Rules
                    </h3>
                    <div className="space-y-3 text-sm md:text-base text-gray-300">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Sort colored liquids by pouring them between test tubes</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p>You can only pour liquid onto the same color or into empty tubes</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Each tube can hold a maximum of 4 liquid units</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Complete the level by sorting all colors into separate tubes</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-blue-400 mb-4 flex items-center">
                      <Gem className="w-5 h-5 mr-2" />
                      Token Economics
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 rounded-lg p-4 border border-green-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Gift className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-semibold">Initial Grant</span>
                          </div>
                          <span className="text-white font-bold text-lg">5 FLUOR</span>
                        </div>
                        <p className="text-xs text-gray-300">Free tokens to start your scientific journey</p>
                      </div>

                      <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 rounded-lg p-4 border border-yellow-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Beaker className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400 font-semibold">Level Cost</span>
                          </div>
                          <span className="text-white font-bold text-lg">1 FLUOR</span>
                        </div>
                        <p className="text-xs text-gray-300">Required to start each new experiment</p>
                      </div>

                      <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 rounded-lg p-4 border border-purple-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Trophy className="w-4 h-4 text-purple-400" />
                            <span className="text-purple-400 font-semibold">NFT Unlock</span>
                          </div>
                          <span className="text-white font-bold text-lg">10 FLUOR</span>
                        </div>
                        <p className="text-xs text-gray-300">Mint rare Kingdom of Science blueprints</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rewards & Progression */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-orange-400 mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Incremental Rewards
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-lg p-4 border border-orange-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-orange-400 font-semibold">Every 5 Levels</span>
                          <span className="text-white font-bold">Reward Set</span>
                        </div>
                        <div className="space-y-1 text-xs text-gray-300">
                          <p>
                            • Levels 1-5: <span className="text-green-400 font-semibold">6 FLUOR</span>
                          </p>
                          <p>
                            • Levels 6-10: <span className="text-green-400 font-semibold">7 FLUOR</span>
                          </p>
                          <p>
                            • Levels 11-15: <span className="text-green-400 font-semibold">8 FLUOR</span>
                          </p>
                          <p>
                            • Levels 16-20: <span className="text-green-400 font-semibold">9 FLUOR</span>
                          </p>
                          <p className="text-yellow-400">+1 FLUOR per reward set!</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-purple-400 mb-4 flex items-center">
                      <Trophy className="w-5 h-5 mr-2" />
                      Progression System
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-lg p-3 border border-green-500/30">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="text-lg">🧪</div>
                          <h4 className="text-green-400 font-semibold text-sm">Complete Levels</h4>
                        </div>
                        <p className="text-xs text-gray-300">Solve puzzles to progress and unlock rewards</p>
                      </div>

                      <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 rounded-lg p-3 border border-blue-500/30">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="text-lg">💎</div>
                          <h4 className="text-blue-400 font-semibold text-sm">Claim Rewards</h4>
                        </div>
                        <p className="text-xs text-gray-300">Get increasing FLUOR rewards every 5 levels</p>
                      </div>

                      <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 rounded-lg p-3 border border-purple-500/30">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="text-lg">🧬</div>
                          <h4 className="text-purple-400 font-semibold text-sm">Mint NFTs</h4>
                        </div>
                        <p className="text-xs text-gray-300">Collect rare scientific blueprint NFTs</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Getting Started */}
              <div className="mt-8 pt-6 border-t border-gray-700/50 text-center">
                <h3 className="text-lg md:text-xl font-semibold text-yellow-400 mb-4">Ready to Begin?</h3>
                <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg p-6 border border-yellow-500/30">
                  <p className="text-gray-300 text-sm md:text-base mb-4">
                    Connect your wallet to receive <span className="text-green-400 font-bold">5 free FLUOR tokens</span>{" "}
                    and start your scientific journey in the Kingdom of Science!
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>Powered by Lisk Sepolia Network</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
