"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import ParticleBackground from "@/components/particle-background"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowDownUp, ExternalLink, RefreshCw, AlertTriangle } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import { useToast } from "@/components/toast"
import { ethers } from "ethers"
import Image from "next/image"

// MDS Token Contract Address (Base Sepolia)
const MDS_TOKEN_ADDRESS = "0x1234567890123456789012345678901234567890" // Replace with actual MDS token address

export default function SwapPage() {
    const { isConnected, walletAddress, fluorBalance, loadPlayerData, contracts } = useWallet()
    const router = useRouter()
    const toast = useToast()

    const [swapAmount, setSwapAmount] = useState("")
    const [isSwapping, setIsSwapping] = useState(false)
    const [txHash, setTxHash] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [mdsBalance, setMdsBalance] = useState(0)
    const [isLoadingBalance, setIsLoadingBalance] = useState(false)

    // Redirect if not connected
    useEffect(() => {
        if (!isConnected) {
            router.push("/")
        }
    }, [isConnected, router])

    // Load MDS balance
    useEffect(() => {
        if (isConnected && walletAddress) {
            loadMdsBalance()
        }
    }, [isConnected, walletAddress])

    const loadMdsBalance = async () => {
        if (!walletAddress) return

        setIsLoadingBalance(true)
        try {
            const provider = new ethers.JsonRpcProvider("https://sepolia.base.org")
            const mdsContract = new ethers.Contract(
                MDS_TOKEN_ADDRESS,
                ["function balanceOf(address owner) view returns (uint256)"],
                provider,
            )

            const balance = await mdsContract.balanceOf(walletAddress)
            const balanceFormatted = Number(ethers.formatEther(balance))
            setMdsBalance(balanceFormatted)
        } catch (error) {
            console.error("Error loading MDS balance:", error)
            // Mock balance for demo
            setMdsBalance(100)
        } finally {
            setIsLoadingBalance(false)
        }
    }

    const handleSwap = async () => {
        if (!swapAmount || Number.parseFloat(swapAmount) <= 0) {
            toast.error("Please enter a valid amount to swap")
            return
        }

        if (Number.parseFloat(swapAmount) > mdsBalance) {
            toast.error("Insufficient MDS balance")
            return
        }

        if (!walletAddress || !contracts) {
            toast.error("Wallet not connected or contracts not initialized")
            return
        }

        setIsSwapping(true)

        try {
            toast.info("Please approve the MDS token transfer in your wallet...")

            // First, approve the MDS token transfer
            const mdsContract = new ethers.Contract(
                MDS_TOKEN_ADDRESS,
                [
                    "function approve(address spender, uint256 amount) returns (bool)",
                    "function transfer(address to, uint256 amount) returns (bool)",
                ],
                contracts.gameController.runner, // Use the signer from contracts
            )

            // For demo purposes, we'll simulate sending MDS to a backend address
            const backendAddress = "0x742d35Cc6634C0532925a3b8D0C9C0E0C0C0C0C0" // Replace with actual backend address
            const amountWei = ethers.parseEther(swapAmount)

            // Send MDS tokens to backend
            const tx = await mdsContract.transfer(backendAddress, amountWei)
            setTxHash(tx.hash)

            toast.success("MDS transfer submitted! Processing swap...")
            setIsProcessing(true)

            // Wait for transaction confirmation
            const receipt = await tx.wait()

            // Send transaction details to backend for verification and FLUOR transfer
            const response = await fetch("/api/swap/process", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    txHash: tx.hash,
                    amount: swapAmount,
                }),
            })

            const data = await response.json()

            if (data.success) {
                toast.success(`Successfully swapped ${swapAmount} MDS for ${swapAmount} FLUOR!`)
                setSwapAmount("")
                setTxHash("")
                await loadPlayerData(true) // Refresh FLUOR balance
                await loadMdsBalance() // Refresh MDS balance
            } else {
                toast.error(data.message || "Swap failed. Please contact support.")
            }
        } catch (error) {
            console.error("Swap error:", error)
            if (error.code === 4001) {
                toast.warning("Transaction cancelled by user")
            } else {
                toast.error("Swap failed. Please try again.")
            }
        } finally {
            setIsSwapping(false)
            setIsProcessing(false)
        }
    }

    const handleMaxClick = () => {
        setSwapAmount(mdsBalance.toString())
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
                        <p className="text-gray-400 text-lg">Convert your Medusa Shards (MDS) to FLUOR</p>
                    </div>

                    <Card className="bg-gray-900/60 backdrop-blur-md border border-gray-700/50">
                        <CardContent className="p-6 md:p-8">
                            {/* One-way swap notice */}
                            <div className="bg-yellow-900/20 rounded-lg p-4 mb-6 border border-yellow-500/30">
                                <div className="flex items-start space-x-3">
                                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-yellow-400 font-semibold mb-1">One-Way Swap Notice</h4>
                                        <p className="text-gray-300 text-sm">
                                            This is a one-way swap from MDS to FLUOR. Once converted, FLUOR cannot be swapped back to MDS.
                                            Please ensure you want to proceed with this conversion.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Current Balances */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-800/50 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">MDS Balance:</span>
                                        <span className="text-blue-400 font-bold text-xl">
                                            {isLoadingBalance ? "..." : `${mdsBalance.toFixed(2)} MDS`}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">FLUOR Balance:</span>
                                        <span className="text-green-400 font-bold text-xl">{fluorBalance.toFixed(2)} FLUOR</span>
                                    </div>
                                </div>
                            </div>

                            {/* Swap Interface */}
                            <div className="space-y-4">
                                {/* From Token - MDS */}
                                <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-sm">From</span>
                                        <button
                                            onClick={handleMaxClick}
                                            className="text-green-400 text-sm hover:text-green-300 transition-colors"
                                            disabled={isSwapping || isProcessing}
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
                                            max={mdsBalance}
                                        />
                                        <div className="flex items-center space-x-2 bg-purple-700/50 rounded-lg px-3 py-2">
                                            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">M</span>
                                            </div>
                                            <span className="text-white font-semibold">MDS</span>
                                        </div>
                                    </div>
                                    <div className="text-gray-500 text-sm mt-2">
                                        Balance: {isLoadingBalance ? "Loading..." : `${mdsBalance.toFixed(2)} MDS`}
                                    </div>
                                </div>

                                {/* Swap Arrow */}
                                <div className="flex justify-center">
                                    <div className="bg-gray-800/50 rounded-full p-2 border border-gray-600/50">
                                        <ArrowDownUp className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>

                                {/* To Token - FLUOR */}
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
                                            <div className="relative w-6 h-6">
                                                <Image
                                                    src="/android-chrome-192x192.png"
                                                    alt="FLUOR"
                                                    width={24}
                                                    height={24}
                                                    className="rounded-full"
                                                />
                                            </div>
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
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Network Fee:</span>
                                            <span className="text-gray-400">~$0.01 (Gas)</span>
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
                                            <a
                                                href={`https://base-sepolia.blockscout.com/tx/${txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Swap Button */}
                            <Button
                                onClick={handleSwap}
                                disabled={
                                    !swapAmount ||
                                    Number.parseFloat(swapAmount) <= 0 ||
                                    Number.parseFloat(swapAmount) > mdsBalance ||
                                    isSwapping ||
                                    isProcessing
                                }
                                className={`w-full text-lg py-3 mt-6 font-semibold rounded-lg transition-all duration-300 ${!swapAmount ||
                                        Number.parseFloat(swapAmount) <= 0 ||
                                        Number.parseFloat(swapAmount) > mdsBalance ||
                                        isSwapping ||
                                        isProcessing
                                        ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white"
                                    }`}
                            >
                                {isSwapping ? "Confirming Transaction..." : isProcessing ? "Processing Swap..." : "Swap Tokens"}
                            </Button>

                            {/* Info Section */}
                            <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                                <h4 className="text-blue-400 font-semibold mb-2">How it works:</h4>
                                <ul className="text-gray-300 text-sm space-y-1">
                                    <li>• Send your MDS tokens to our secure address</li>
                                    <li>• We verify the transaction on Base blockchain</li>
                                    <li>• Receive the same amount in FLUOR tokens instantly</li>
                                    <li>• Use FLUOR to play levels and unlock NFTs in the game</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
