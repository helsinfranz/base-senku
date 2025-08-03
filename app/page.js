"use client"
import { useState, useEffect } from "react"
import Header from "@/components/header"
import ParticleBackground from "@/components/particle-background"
import PoweredBySection from "@/components/powered-by-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { useWallet } from "@/contexts/wallet-context"
import {
  Atom,
  Beaker,
  Trophy,
  Zap,
  Gem,
  TrendingUp,
  Gift,
  ArrowRightLeft,
  AlertTriangle,
  Calendar,
  Target,
  Users,
  Coins,
  PieChart,
} from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  const { isConnected } = useWallet()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [hoveredSegment, setHoveredSegment] = useState(null)

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

  // Tokenomics data
  const tokenomicsData = [
    {
      label: "Public Sale",
      percentage: 37.5,
      color: "#16a34a", // green-500
      hoverColor: "#22c55e", // green-600
      description: "Available for public purchase and trading",
    },
    {
      label: "Liquidity Pool",
      percentage: 12.5,
      color: "#2563eb", // blue-500
      hoverColor: "#3b82f6", // blue-600
      description: "Reserved for DEX liquidity provision",
    },
    {
      label: "KOLs & Marketing",
      percentage: 16.7,
      color: "#d97706", // amber-500
      hoverColor: "#f59e0b", // amber-600
      description: "Key Opinion Leaders and marketing initiatives",
    },
    {
      label: "Development Team",
      percentage: 16.7,
      color: "#7c3aed", // violet-500
      hoverColor: "#8b5cf6", // violet-600
      description: "Core development team allocation",
    },
    {
      label: "Ecosystem Growth",
      percentage: 16.6,
      color: "#db2777", // pink-500
      hoverColor: "#ec4899", // pink-600
      description: "Future partnerships and ecosystem expansion",
    },
  ]

  // Roadmap phases
  const roadmapPhases = [
    {
      quarter: "Q3 2025",
      phase: "PHASE 1: ECONOMIC EXPANSION",
      color: "from-green-500 to-emerald-600",
      items: [
        "Launch of $MDS Token",
        "$MDS to FLUOR One-Way Swap System",
        "Enhanced Gameplay Integration",
        "New Level Additions & User Experience Testing",
      ],
    },
    {
      quarter: "Q4 2025",
      phase: "PHASE 2: THE FORGE CREATION",
      color: "from-blue-500 to-cyan-600",
      items: [
        "KOSB to Ranked NFT Conversion System",
        "Legendary & Epic Tier NFT Minting",
        "NFT Marketplace Integration",
        "Advanced Collectible Trading Features",
      ],
    },
    {
      quarter: "Q1 2026",
      phase: "PHASE 3: COMPETITIVE ECOSYSTEM",
      color: "from-purple-500 to-violet-600",
      items: [
        "Global Leaderboard System",
        "High-Ranking Player Rewards",
        "FLUOR-Based DAO Governance",
        "FORGE NFT Utility Expansion",
      ],
    },
    {
      quarter: "Q2 2026",
      phase: "PHASE 4: ARC SEASONS & STONE WORLD",
      color: "from-orange-500 to-red-600",
      items: [
        "Dr. Stone Storyline Integration",
        "Multi-Difficulty Level Campaigns",
        "Educational Material Cards System",
        "Interactive Science Learning Quizzes",
        "Stone Age Civilization Building Narrative",
      ],
    },
    {
      quarter: "Q3 2026",
      phase: "PHASE 5: COMMUNITY MARKETPLACE",
      color: "from-pink-500 to-rose-600",
      items: [
        "In-Game Store System Launch",
        "FLUOR & MDS Token Item Purchases",
        "DAO-Governed Item Catalog",
        "Community-Driven Store Features",
        "Premium Cosmetics & Utility Items",
      ],
    },
  ]

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
                <h3 className="text-white font-semibold text-sm md:text-base mb-2">Base Network</h3>
                <p className="text-gray-400 text-xs md:text-sm">Built on Base Sepolia for fast, secure transactions</p>
              </CardContent>
            </Card>
          </div>

          {/* Token Swap Feature Highlight */}
          <Card className="bg-gradient-to-r from-indigo-900/100 to-purple-900/100 backdrop-blur-md border border-indigo-500/50 mb-12 md:mb-16">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                  <div className="bg-indigo-500/30 rounded-full p-3 border border-indigo-400/50">
                    <ArrowRightLeft className="w-8 h-8 text-indigo-300" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">MDS to FLUOR Swap</h3>
                    <p className="text-gray-200 text-sm md:text-base">
                      Convert your Medusa Shards (MDS) tokens to FLUOR at a 1:1 ratio
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center md:items-end space-y-2">
                  <div className="bg-orange-900/40 rounded-lg px-3 py-1 border border-orange-400/50">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-orange-300" />
                      <span className="text-orange-200 text-sm font-semibold">One-Way Swap</span>
                    </div>
                  </div>
                  {isConnected ? (
                    <Link href="/swap">
                      <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 shadow-lg">
                        Swap Tokens
                      </Button>
                    </Link>
                  ) : (
                    <p className="text-gray-300 text-sm">Connect wallet to swap</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Powered By Section */}
          <Card className="bg-gray-900/40 backdrop-blur-md border border-gray-700/30 mb-12 md:mb-16">
            <CardContent className="p-6 md:p-8">
              <PoweredBySection />
            </CardContent>
          </Card>

          {/* Game Guide Section */}
          <Card className="bg-gray-900/60 backdrop-blur-md border border-gray-700/50 mb-12 md:mb-16">
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

                      <div className="bg-gradient-to-r from-indigo-900/20 to-purple-800/20 rounded-lg p-3 border border-indigo-500/30">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="text-lg">🔄</div>
                          <h4 className="text-indigo-400 font-semibold text-sm">Token Swap</h4>
                        </div>
                        <p className="text-xs text-gray-300">Convert MDS tokens to FLUOR for gameplay</p>
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
                    <span>Powered by Base Sepolia Network</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roadmap Section */}
          <Card className="bg-gray-900/60 backdrop-blur-md border border-gray-700/50 mb-12 md:mb-16">
            <CardContent className="p-6 md:p-8">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center justify-center">
                  <Calendar className="w-8 h-8 mr-3 text-green-400" />
                  Development Roadmap
                </h2>
                <p className="text-gray-400 text-base md:text-lg">Our journey to revolutionize science gaming</p>
              </div>

              <div className="relative">
                {/* Main timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 via-blue-400 via-purple-400 via-orange-400 to-pink-400 hidden md:block"></div>

                <div className="space-y-8">
                  {roadmapPhases.map((phase, index) => (
                    <div key={index} className="relative">
                      <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                        {/* Quarter Badge */}
                        <div
                          className={`flex-shrink-0 bg-gradient-to-r ${phase.color} rounded-full p-3 border-2 border-white/20 hover:scale-110 hover:brightness-125 transition-all duration-300 relative z-20`}
                        >
                          <Target className="w-6 h-6 text-white" />
                        </div>

                        {/* Phase Content */}
                        <div className="flex-1">
                          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                              <div>
                                <h3 className="text-lg md:text-xl font-bold text-white mb-1">{phase.phase}</h3>
                                <p
                                  className={`text-sm font-semibold bg-gradient-to-r ${phase.color} bg-clip-text text-transparent`}
                                >
                                  {phase.quarter}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {phase.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-start space-x-3">
                                  <div
                                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-gradient-to-r ${phase.color}`}
                                  ></div>
                                  <p className="text-gray-300 text-sm">{item}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tokenomics Section */}
          <Card className="bg-gray-900/60 backdrop-blur-md border border-gray-700/50 mb-12 md:mb-16">
            <CardContent className="p-6 md:p-8">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center justify-center">
                  <PieChart className="w-8 h-8 mr-3 text-blue-400" />
                  MDS Tokenomics
                </h2>
                <p className="text-gray-400 text-base md:text-lg">Token distribution and allocation breakdown</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Pie Chart */}
                <div className="flex justify-center">
                  <div className="relative w-80 h-80">
                    <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                      {tokenomicsData.map((segment, index) => {
                        const startAngle = tokenomicsData
                          .slice(0, index)
                          .reduce((sum, s) => sum + s.percentage * 3.6, 0)
                        const endAngle = startAngle + segment.percentage * 3.6
                        const largeArcFlag = segment.percentage > 50 ? 1 : 0

                        const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180)
                        const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180)
                        const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180)
                        const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180)

                        const pathData = [
                          `M 100 100`,
                          `L ${x1} ${y1}`,
                          `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                          `Z`,
                        ].join(" ")

                        return (
                          <path
                            key={index}
                            d={pathData}
                            fill={hoveredSegment === index ? segment.hoverColor : segment.color}
                            stroke="#1f2937"
                            strokeWidth="2"
                            className="transition-all duration-300 cursor-pointer hover:opacity-90"
                            onMouseEnter={() => setHoveredSegment(index)}
                            onMouseLeave={() => setHoveredSegment(null)}
                          />
                        )
                      })}
                    </svg>

                    {/* Center circle */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-gray-900 rounded-full w-24 h-24 flex items-center justify-center border-4 border-gray-700">
                        <Coins className="w-8 h-8 text-yellow-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-4">
                  {tokenomicsData.map((segment, index) => (
                    <div
                      key={index}
                      className={`bg-gray-800/30 rounded-lg p-4 border transition-all duration-300 cursor-pointer ${hoveredSegment === index
                          ? "border-gray-500/50 bg-gray-800/50 transform scale-105"
                          : "border-gray-700/30"
                        }`}
                      onMouseEnter={() => setHoveredSegment(index)}
                      onMouseLeave={() => setHoveredSegment(null)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: hoveredSegment === index ? segment.hoverColor : segment.color }}
                          ></div>
                          <h4 className="text-white font-semibold">{segment.label}</h4>
                        </div>
                        <span className="text-xl font-bold text-white">{segment.percentage}%</span>
                      </div>
                      <p className="text-gray-400 text-sm ml-7">{segment.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-6 border-t border-gray-700/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-lg p-4 border border-green-500/30 text-center">
                    <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <h4 className="text-green-400 font-semibold mb-1">Community First</h4>
                    <p className="text-gray-300 text-sm">37.5% allocated for public participation</p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 rounded-lg p-4 border border-blue-500/30 text-center">
                    <Zap className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <h4 className="text-blue-400 font-semibold mb-1">Liquidity Secured</h4>
                    <p className="text-gray-300 text-sm">12.5% ensures stable trading</p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 rounded-lg p-4 border border-purple-500/30 text-center">
                    <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <h4 className="text-purple-400 font-semibold mb-1">Long-term Vision</h4>
                    <p className="text-gray-300 text-sm">50% for sustainable development</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Footer */}
          <div className="text-center py-8">
            <div className="flex justify-center items-center space-x-6">
              {/* Twitter/X */}
              <a
                href="https://twitter.com/senkuselixir"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full p-3 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-110"
              >
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition-colors duration-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Discord */}
              <a
                href="https://discord.gg/9rF8hU6M35"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full p-3 hover:border-indigo-500/50 transition-all duration-300 transform hover:scale-110"
              >
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-indigo-400 transition-colors duration-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189Z" />
                </svg>
              </a>

              {/* Telegram */}
              <a
                href="https://t.me/senkuselixir"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full p-3 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-110"
              >
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition-colors duration-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>

              {/* Whitepaper */}
              <a
                href="/whitepaper.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-full p-3 hover:border-green-500/50 transition-all duration-300 transform hover:scale-110"
              >
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-green-400 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </a>

              {/* Telegram */}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
