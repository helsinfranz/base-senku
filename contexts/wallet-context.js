"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { getReadOnlyContracts, getReadProvider } from "@/utils/contracts"
import { useAppKit, useAppKitState } from "@reown/appkit/react";
import { useAppKitAccount, useDisconnect } from "@reown/appkit/react";
// import { useAppKitProvider } from "@reown/appkit/react";
// import { useAppKitSIWX } from '@reown/appkit-siwx/react'

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
  const [nftCount, setNftCount] = useState(0)
  const [ethAddress, setEthAddress] = useState(null)
  // const [sessionAccount, setSessionAccount] = useState(null)
  // const { walletProvider } = useAppKitProvider("solana");
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { loading } = useAppKitState();
  const { open } = useAppKit();
  // const siwx = useAppKitSIWX();

  // console.log("Session Account:", sessionAccount);

  useEffect(() => {
    setIsConnecting(loading)
  }, [loading])

  useEffect(() => {
    if (address && isConnected) {
      setWalletAddress(address)
      initializeContracts()
      loadUserWallet()
    }
  }, [address, isConnected])

  // useEffect(() => {
  //   if (!siwx) return

  //   siwx.getSessionAccount().then(setSessionAccount)
  // }, [siwx])

  useEffect(() => {
    if (isConnected && address && walletAddress && readOnlyContracts && ethAddress) {
      loadPlayerData()
    }
  }, [isConnected, address, walletAddress, readOnlyContracts, ethAddress])

  const loadUserWallet = async () => {
    if (!address) return
    const res = await fetch("/api/keys/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ solanaAddress: address }),
    })
    if (res.ok) {
      const data = await res.json()
      console.log("Derived ETH Address:", data.ethAddress);
      setEthAddress(data.ethAddress);
    } else {
      console.log("No derived key found for this Solana address.")
    }
  }

  const initializeContracts = async () => {
    try {
      // const signer = await getSigner(walletProvider)
      const readProvider = getReadProvider()
      if (readProvider) {
        // if (signer && readProvider) {
        // const contractInstances = getContracts(signer)
        const contractReadOnlyInstances = getReadOnlyContracts(readProvider)
        // setContracts(contractInstances)
        setReadOnlyContracts(contractReadOnlyInstances)
      }
    } catch (error) {
      console.error("Error initializing contracts:", error)
    }
  }

  const loadPlayerData = async (forceRefresh = false) => {
    if (!readOnlyContracts || !walletAddress || !ethAddress) return

    setIsLoading(true)
    try {
      // Add a small delay if forcing refresh to ensure blockchain state is updated
      if (forceRefresh) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      const playerInfo = await readOnlyContracts.gameController.getPlayerInfo(ethAddress)

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
    readOnlyContracts,
    isLoading,
    ethAddress,
    loadPlayerData,
    connectWallet: async () => {
      setIsConnecting(true)
      try {
        await open();
        // await open({ view: "Connect" })
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
        setReadOnlyContracts(null)
      } catch (error) {
        console.error("Error disconnecting wallet:", error)
      }
    },
    claimInitialTokens: async () => {
      if (!walletAddress || !readOnlyContracts) {
        console.error("Contracts not initialized")
        return false
      }

      try {
        setIsLoading(true)
        console.log("Claiming initial tokens...")

        await fetch("/api/set/claimInitial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ solanaAddress: address }),
        }).then(r => r.json());

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
      if (!walletAddress || !readOnlyContracts) return false

      try {
        setIsLoading(true)

        await fetch("/api/set/payToPlay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ solanaAddress: address }),
        }).then(r => r.json());
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
      if (!walletAddress || !readOnlyContracts) return false

      try {
        setIsLoading(true)

        await fetch("/api/set/claimReward", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ solanaAddress: address }),
        }).then(r => r.json());
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
      if (!readOnlyContracts || !walletAddress) return false

      try {
        setIsLoading(true)

        await fetch("/api/set/unlockNft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ solanaAddress: address }),
        }).then(r => r.json());

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
