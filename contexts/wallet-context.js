"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { getContracts, getReadOnlyContracts, getSigner, getReadProvider } from "@/utils/contracts"
import { useAppKit, useAppKitState } from "@reown/appkit/react";
import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";
import { useAppKitProvider } from "@reown/appkit/react";

const WalletContext = createContext()

export function WalletProvider({ children }) {
  const [playerData, setPlayerData] = useState({
    currentLevel: 0,
    levelsCompleted: 0,
    claimableRewardSets: 0,
    hasClaimedInitialTokens: false,
  })
  const [readOnlyContracts, setReadOnlyContracts] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [fluorBalance, setFluorBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [contracts, setContracts] = useState(null)
  const [nftCount, setNftCount] = useState(0)
  const { walletProvider } = useAppKitProvider("eip155");
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { loading } = useAppKitState();
  const { open } = useAppKit();

  useEffect(() => {
    setIsConnecting(loading)
  }, [loading])

  useEffect(() => {
    if (address && isConnected) {
      setWalletAddress(address)
      initializeContracts()
    }
  }, [address, isConnected])

  useEffect(() => {
    if (isConnected && address && walletAddress && contracts && readOnlyContracts) {
      loadPlayerData()
    }
  }, [isConnected, address, walletAddress, contracts, readOnlyContracts])

  const initializeContracts = async () => {
    try {
      const signer = await getSigner(walletProvider)
      const readProvider = getReadProvider()
      if (signer && readProvider) {
        const contractInstances = getContracts(signer)
        const contractReadOnlyInstances = getReadOnlyContracts(readProvider)
        setContracts(contractInstances)
        setReadOnlyContracts(contractReadOnlyInstances)
      }
    } catch (error) {
      console.error("Error initializing contracts:", error)
    }
  }

  const loadPlayerData = async (forceRefresh = false) => {
    if (!contracts || !readOnlyContracts || !walletAddress) return

    setIsLoading(true)
    try {
      // Add a small delay if forcing refresh to ensure blockchain state is updated
      if (forceRefresh) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      const playerInfo = await readOnlyContracts.gameController.getPlayerInfo(walletAddress)

      const fluorBalanceWei = Number(playerInfo.fluorBalance)
      const fluorBalanceEther = fluorBalanceWei / 1e18

      setFluorBalance(fluorBalanceEther)
      setPlayerData({
        currentLevel: Number(playerInfo.currentLevel),
        levelsCompleted: Number(playerInfo.levelsCompleted),
        claimableRewardSets: Number(playerInfo.claimableRewardSets),
        hasClaimedInitialTokens: fluorBalanceEther > 0 || Number(playerInfo.levelsCompleted) > 0, // If they have tokens or completed levels, they've claimed
      })
      setNftCount(Number(playerInfo.nftCount))
    } catch (error) {
      console.error("Error loading player data:", error)
      // Fallback to mock data if contract calls fail
      setFluorBalance(0)
      setNftCount(0)
      setPlayerData({
        currentLevel: 0,
        levelsCompleted: 0,
        claimableRewardSets: 0,
        hasClaimedInitialTokens: false,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    isConnected,
    walletAddress,
    isConnecting,
    fluorBalance,
    nftCount,
    playerData,
    contracts,
    readOnlyContracts,
    isLoading,
    loadPlayerData,
    connectWallet: async () => {
      setIsConnecting(true)
      try {
        await open({ view: "Connect", namespace: "eip155" })
      } catch (error) {
        console.error("Error connecting wallet:", error)
        setIsConnecting(false)
      }
    },
    disconnectWallet: async () => {
      try {
        await disconnect()
        setWalletAddress("")
        setFluorBalance(0)
        setNftCount(0)
        setPlayerData({
          currentLevel: 0,
          levelsCompleted: 0,
          claimableRewardSets: 0,
          hasClaimedInitialTokens: false,
        })
        setContracts(null)
        setReadOnlyContracts(null)
      } catch (error) {
        console.error("Error disconnecting wallet:", error)
      }
    },
    claimInitialTokens: async () => {
      if (!contracts || !walletAddress || !readOnlyContracts) {
        console.error("Contracts not initialized")
        return false
      }

      try {
        setIsLoading(true)
        console.log("Claiming initial tokens...")

        const tx = await contracts.gameController.claimInitialTokens()
        console.log("Transaction sent:", tx.hash)

        const receipt = await tx.wait()
        console.log("Transaction confirmed:", receipt)

        // Update player data immediately to reflect the change
        setPlayerData((prev) => ({
          ...prev,
          hasClaimedInitialTokens: true,
        }))

        // Reload all player data from blockchain with force refresh
        await loadPlayerData(true)

        return true
      } catch (error) {
        console.error("Error claiming initial tokens:", error)

        // Check if it's because they already claimed
        if (error.message && error.message.includes("Already claimed")) {
          setPlayerData((prev) => ({
            ...prev,
            hasClaimedInitialTokens: true,
          }))
          return true // Return true to close the modal
        }

        return false
      } finally {
        setIsLoading(false)
      }
    },
    payToPlay: async () => {
      if (!contracts || !walletAddress || !readOnlyContracts) return false

      try {
        setIsLoading(true)

        // Then pay to play
        const tx = await contracts.gameController.payToPlay()
        await tx.wait()
        await loadPlayerData(true) // Force refresh after payment
        return true
      } catch (error) {
        console.error("Error paying to play:", error)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    claimReward: async () => {
      if (!contracts || !walletAddress || !readOnlyContracts) return false

      try {
        setIsLoading(true)
        const tx = await contracts.gameController.claimReward()
        await tx.wait()
        await loadPlayerData(true) // Force refresh after claiming
        return true
      } catch (error) {
        console.error("Error claiming reward:", error)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    unlockNft: async () => {
      if (!contracts || !readOnlyContracts || !walletAddress) return false

      try {
        setIsLoading(true)
        const tx = await contracts.gameController.unlockNft()
        await tx.wait()
        await loadPlayerData(true) // Force refresh after NFT unlock
        return true
      } catch (error) {
        console.error("Error unlocking NFT:", error)
        return false
      } finally {
        setIsLoading(false)
      }
    },
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
