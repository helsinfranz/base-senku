"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import ParticleBackground from "@/components/particle-background"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowDownUp, Wallet, ExternalLink, RefreshCw } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { useToast } from "@/components/toast"

export default function SwapPage() {
    const { isConnected, walletAddress, fluorBalance, loadPlayerData } = useWallet()
    const router = useRouter()
    const toast = useToast()

    const [swapAmount, setSwapAmount] = useState("")
    const [isSwapping, setIsSwapping] = useState(false)
    const [txHash, setTxHash] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)

    // Redirect if not connected
    useEffect(() => {
        if (!isConnected) {
            router.push("/")
        }
    }, [isConnected, router])

    const handleSwap = async () => {
        if (!swapAmount || Number.parseFloat(swapAmount) <= 0) {
            toast.error("Please enter a valid amount to swap")
            return
        }

        if (!walletAddress) {
            toast.error("Wallet not connected")
            return
        }

        setIsSwapping(true)

        try {
            // Here you would implement the actual token payment logic
            // For now, we'll simulate the process
            toast.info("Please confirm the transaction in your wallet...")

            // Simulate transaction
            await new Promise((resolve) => setTimeout(resolve, 2000))

            // Mock transaction hash - in real implementation, this would come from the actual transaction
            const mockTxHash = "0x" + Math.random().toString(16).substr(2, 64)
            setTxHash(mockTxHash)

            toast.success("Transaction submitted! Processing swap...")
            setIsProcessing(true)

            // Send transaction details to backend for verification and FLUOR minting
            const response = await fetch("/api/swap/process", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    walletAddress,
                    amount: swapAmount,
                    txHash: mockTxHash,
                }),
            })

            const data = await response.json()

            if (data.success) {
                toast.success(`Successfully swapped ${swapAmount} MDS for ${swapAmount} FLUOR!`)
                setSwapAmount("")
                setTxHash("")
                await loadPlayerData(true) // Refresh balance
            } else {
                toast.error(data.message || "Swap failed. Please try again.")
            }
        } catch (error) {
            console.error("Swap error:", error)
            toast.error("Swap failed. Please try again.")
        } finally {
            setIsSwapping(false)
            setIsProcessing(false)
        }
    }

    const handleMaxClick = () => {
        // In a real implementation, you'd get the user's actual token balance
        // For now, we'll use a mock balance
        setSwapAmount("100")
    }

    if (!isConnected) {
        return (
            <div className="min-h-screen relative overflow-hidden">
                <ParticleBackground />
                <Header />
                <main className="relative z-10 flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
                        <p className="text-white">Redirecting...</p>
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
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Token Swap</h1>
                        <p className="text-gray-400 text-lg">Convert your utility tokens to FLUOR</p>
                    </div>

                    <Card className="bg-gray-900/60 backdrop-blur-md border border-gray-700/50">
                        <CardContent className="p-6 md:p-8">
                            {/* Current MDS Balance */}
                            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Current MDS Balance:</span>
                                    <span className="text-blue-400 font-bold text-xl">100 MDS</span>
                                </div>
                            </div>

                            {/* Current FLUOR Balance */}
                            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Current FLUOR Balance:</span>
                                    <span className="text-blue-400 font-bold text-xl">{fluorBalance} FLUOR</span>
                                </div>
                            </div>

                            {/* Swap Interface */}
                            <div className="space-y-4">
                                {/* From Token */}
                                <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-sm">From</span>
                                        <button
                                            onClick={handleMaxClick}
                                            className="text-green-400 text-sm hover:text-green-300 transition-colors"
                                        >
                                            MAX
                                        </button>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="number"
                                            value={swapAmount}
                                            onChange={(e) => setSwapAmount(e.target.value)}
                                            placeholder="0.0"
                                            className="flex-1 bg-transparent text-white text-2xl font-bold outline-none placeholder-gray-500"
                                            disabled={isSwapping || isProcessing}
                                        />
                                        <div className="flex items-center space-x-2 bg-gray-700/50 rounded-lg px-3 py-2">
                                            <Wallet className="w-5 h-5 text-gray-400" />
                                            <span className="text-white font-semibold">MDS</span>
                                        </div>
                                    </div>
                                    <div className="text-gray-500 text-sm mt-2">Balance: 100.00 MDS</div>
                                </div>

                                {/* Swap Arrow */}
                                <div className="flex justify-center">
                                    <div className="bg-gray-800/50 rounded-full p-2 border border-gray-600/50">
                                        <ArrowDownUp className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>

                                {/* To Token */}
                                <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-sm">To</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="text"
                                            value={swapAmount}
                                            placeholder="0.0"
                                            className="flex-1 bg-transparent text-white text-2xl font-bold outline-none placeholder-gray-500"
                                            disabled
                                        />
                                        <div className="flex items-center space-x-2 bg-blue-700/50 rounded-lg px-3 py-2">
                                            <div className="w-5 h-5 bg-blue-400 rounded-full"></div>
                                            <span className="text-white font-semibold">FLUOR</span>
                                        </div>
                                    </div>
                                    <div className="text-gray-500 text-sm mt-2">1 MDS = 1 FLUOR</div>
                                </div>
                            </div>

                            {/* Swap Details */}
                            {swapAmount && Number.parseFloat(swapAmount) > 0 && (
                                <div className="bg-gray-800/30 rounded-lg p-4 mt-6 border border-gray-600/30">
                                    <h3 className="text-white font-semibold mb-3">Swap Details</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Exchange Rate:</span>
                                            <span className="text-white">1 MDS = 1 FLUOR</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">You Pay:</span>
                                            <span className="text-white">{swapAmount} MDS</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">You Receive:</span>
                                            <span className="text-green-400 font-semibold">{swapAmount} FLUOR</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Transaction Hash Display */}
                            {txHash && (
                                <div className="bg-blue-900/20 rounded-lg p-4 mt-6 border border-blue-500/30">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-blue-400 font-semibold mb-1">Transaction Submitted</h4>
                                            <p className="text-gray-400 text-sm">
                                                Hash: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {isProcessing && <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />}
                                            <button className="text-blue-400 hover:text-blue-300 transition-colors">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Swap Button */}
                            <Button
                                onClick={handleSwap}
                                disabled={!swapAmount || Number.parseFloat(swapAmount) <= 0 || isSwapping || isProcessing}
                                className={`w-full text-lg py-3 mt-6 font-semibold rounded-lg transition-all duration-300 ${!swapAmount || Number.parseFloat(swapAmount) <= 0 || isSwapping || isProcessing
                                    ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white"
                                    }`}
                            >
                                {isSwapping ? "Confirming Transaction..." : isProcessing ? "Processing Swap..." : "Swap Tokens"}
                            </Button>

                            {/* Info Section */}
                            <div className="mt-6 p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                                <h4 className="text-yellow-400 font-semibold mb-2">How it works:</h4>
                                <ul className="text-gray-300 text-sm space-y-1">
                                    <li>• Send your MDS tokens to our address</li>
                                    <li>• We verify the transaction on the blockchain</li>
                                    <li>• User receives the same amount in FLUOR tokens</li>
                                    <li>• Use FLUOR to play levels and unlock NFTs</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
