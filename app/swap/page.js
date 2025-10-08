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
import Image from "next/image"

// Solana Imports

import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
    Connection,
    PublicKey,
    Transaction,
} from "@solana/web3.js";
import {
    getAssociatedTokenAddress,
    getAccount,
    createTransferInstruction,
} from "@solana/spl-token";

export default function SwapPage() {
    const solanaWallet = useSolanaWallet();

    // Solana Wallet Context Above.

    const { isConnected, walletAddress, fluorBalance, loadPlayerData } = useWallet()
    const router = useRouter()
    const toast = useToast()

    const connection = new Connection("https://api.devnet.solana.com", "confirmed");

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

    useEffect(() => {
        if (solanaWallet.connected && solanaWallet.publicKey) {
            console.log("Wallet connected:", solanaWallet.publicKey.toString());
        } else {
            console.log("Wallet not connected");
            setMdsBalance(0);
        }
    }, [solanaWallet])

    // Load MDS balance
    useEffect(() => {
        if (isConnected && walletAddress && solanaWallet.connected && solanaWallet.publicKey) {
            loadMdsBalance()
        }
    }, [isConnected, walletAddress, solanaWallet])

    const loadMdsBalance = async () => {
        if (!solanaWallet.connected || !solanaWallet.publicKey) return

        setIsLoadingBalance(true)
        try {
            // 1️⃣ Get associated token account for user
            const ata = await getAssociatedTokenAddress(new PublicKey("C5hkCo3nE6F9K6z67tzridUnbNGXfs8HBxxanFzCm58K"), solanaWallet.publicKey);

            // 2️⃣ Fetch token account info
            const tokenAccount = await getAccount(connection, ata);

            const decimals = 8;

            const formattedBalance =
                Number(tokenAccount.amount) / 10 ** decimals;
            setMdsBalance(formattedBalance)
        } catch (error) {
            console.error("Error loading MDS balance:", error)
        } finally {
            setIsLoadingBalance(false)
        }
    }

    const handleSwap = async () => {
        setIsSwapping(true)

        try {
            const TREASURY_WALLET = new PublicKey("uKQ77M8ee7Jq2TKoZSyUUWDbxv9Eva8rv8DZn2DVLXm"); // treasury wallet
            const TOKEN_MINT_ADDRESS = new PublicKey("C5hkCo3nE6F9K6z67tzridUnbNGXfs8HBxxanFzCm58K"); // e.g. USDC on Solana

            const amount = Number(swapAmount * 10 ** 8); // Convert to smallest unit (e.g., if 8 decimals)

            if (!solanaWallet.connected || !solanaWallet.publicKey) throw new Error("Solana wallet not connected");
            if (isNaN(amount) || Number(amount) <= 0) throw new Error("Invalid swap amount");

            const userWallet = solanaWallet.publicKey;

            // Get the associated token accounts for both wallets
            const userATA = await getAssociatedTokenAddress(
                TOKEN_MINT_ADDRESS,
                userWallet
            );

            const treasuryATA = await getAssociatedTokenAddress(
                TOKEN_MINT_ADDRESS,
                TREASURY_WALLET
            );

            // Create transfer instruction
            const transferInstruction = createTransferInstruction(
                userATA,
                treasuryATA,
                userWallet,
                amount
            );

            // Create transaction and add the transfer instruction
            const transaction = new Transaction().add(transferInstruction);

            transaction.feePayer = userWallet;

            const latest = await connection.getLatestBlockhash("finalized");
            transaction.recentBlockhash = latest.blockhash;
            transaction.lastValidBlockHeight = latest.lastValidBlockHeight;

            if (!transaction || !solanaWallet.signTransaction) {
                throw new Error("Failed to create transaction or wallet cannot sign");
            }

            const signature = await solanaWallet.sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'finalized');

            // // Sign the transaction
            // const signedTransaction = await solanaWallet.signTransaction(
            //     transaction
            // );

            // // Send and confirm the transaction
            // const signature = await connection.sendRawTransaction(
            //     signedTransaction.serialize()
            // );

            console.log("Transaction successful with signature:", signature);
            setTxHash(signature)

            toast.success("MDS transfer submitted! Processing swap...")
            setIsProcessing(true)
            await loadMdsBalance() // Refresh MDS balance

            // Call backend API to credit FLUOR
            const response = await fetch("/api/payment/swap", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    playerAddress: walletAddress,
                    userWallet: userWallet.toString(),
                    amount: amount,
                    txHash: signature,
                }),
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.message || "Swap API call failed")
            }

            toast.success(`Successfully swapped ${swapAmount} MDS for ${swapAmount} FLUOR!`)
            setSwapAmount("")
            setTxHash(data.txHash || "")
            await loadPlayerData(true) // Refresh FLUOR balance
            await loadMdsBalance() // Refresh MDS balance
        } catch (error) {
            console.error("Swap error:", error.message)
            if (error.message?.includes("User rejected the request.")) {
                toast.warning("User rejected the request.")
            } else {
                toast.error("Swap failed. Please try again or contact us.")
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

                            {/* Wallet Connect Button */}
                            <div className="flex justify-end mb-6">
                                <WalletMultiButton className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-[#9945FF]/90 hover:to-[#14F195]/90 justify-center" />
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
                                            type="text"
                                            value={swapAmount}
                                            onChange={(e) => setSwapAmount(e.target.value)}
                                            placeholder="0.0"
                                            className="flex-1 bg-transparent text-white text-2xl font-bold outline-none placeholder-gray-500 appearance-none"
                                            disabled={isSwapping || isProcessing}
                                            max={mdsBalance}
                                        />
                                        <div className="flex items-center space-x-2 bg-purple-700/50 rounded-lg px-3 py-2">
                                            <div className="relative w-6 h-6">
                                                <Image src="/logo.png" alt="MDS" width={24} height={24} className="rounded-full" />
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
                                                <Image src="/logo.png" alt="FLUOR" width={24} height={24} className="rounded-full" />
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
                                                href={isProcessing ? `https://explorer.solana.com/tx/${txHash}?cluster=devnet` : `https://base-sepolia.blockscout.com/tx/${txHash}`}
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
                            <Button
                                onClick={handleSwap}
                                disabled={isSwapping || isProcessing || !swapAmount || Number.parseFloat(swapAmount) <= 0 || Number.parseFloat(swapAmount) > mdsBalance || !solanaWallet.connected}
                                className={`w-full text-lg py-3 mt-6 font-semibold rounded-lg transition-all duration-300 ${isSwapping || isProcessing
                                    ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white"
                                    }`}
                            >
                                {isSwapping ? "Confirming Transaction..." : isProcessing ? "Processing Swap..." : "Swap Tokens"}
                            </Button>

                            {/* Info Section */}
                            <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                                <h4 className="text-blue-400 font-semibold mb-2">Swap Process:</h4>
                                <ul className="text-gray-300 text-sm space-y-1">
                                    <li>• Input the amount of MDS you wish to swap</li>
                                    <li>• Sign the transaction in your wallet</li>
                                    <li>• MDS tokens will be converted to FLUOR at a 1:1 rate</li>
                                    <li>• Use FLUOR to enhance your gaming experience</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
