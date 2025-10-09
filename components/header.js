"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Gem, FileText, LogOut, Menu, X } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"
import Image from "next/image"

export default function Header() {
  const { isConnected, walletAddress, fluorBalance, nftCount, connectWallet, disconnectWallet, isConnecting } =
    useWallet()
  const pathname = usePathname()

  const [mobileOpen, setMobileOpen] = useState(false)

  const isActivePage = (path) => pathname === path

  const formatAddress = (address) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // close mobile menu when navigation changes
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/20 backdrop-blur-md border-b border-green-500/30">
      <div className="max-w-7xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
        {/* Logo - Fixed width */}
        <div className="flex items-center space-x-2 text-white hover:text-green-400 transition-colors w-48">
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative w-8 h-8 md:w-10 md:h-10">
              <Image src="/logo.png" alt="Senku's Elixir Logo" fill className="object-contain rounded-lg" priority />
            </div>
            <span className="text-lg md:text-xl font-bold hidden sm:block">Senku's Elixir</span>
            {/* <span className="text-lg md:text-xl font-bold sm:hidden">Senku</span> */}
          </Link>
        </div>

        {/* Navigation - Centered */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 absolute left-1/2 transform -translate-x-1/2">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${isActivePage("/") ? "text-green-400" : "text-white hover:text-green-400"
              }`}
          >
            Home
          </Link>
          <Link
            href="/game"
            className={`text-sm font-medium transition-colors ${isActivePage("/game") ? "text-green-400" : "text-white hover:text-green-400"
              }`}
          >
            Game
          </Link>
          <Link
            href="/swap"
            className={`text-sm font-medium transition-colors ${isActivePage("/swap") ? "text-green-400" : "text-white hover:text-green-400"
              }`}
          >
            Buy
          </Link>
          <Link
            href="/profile"
            className={`text-sm font-medium transition-colors ${isActivePage("/profile") ? "text-green-400" : "text-white hover:text-green-400"
              }`}
          >
            Profile
          </Link>
        </nav>

        {/* Mobile menu button (visible on small screens) + Wallet Widget - Fixed width */}
        <div className="flex items-center space-x-2">

          <div className="flex items-center justify-end w-48">
            {!isConnected ? (
              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white font-semibold px-4 md:px-6 py-2 rounded-lg transition-all duration-300 text-sm md:text-base"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            ) : (
              <div className="flex items-center space-x-2 md:space-x-4">
                {/* Mobile Layout */}
                <div className="md:hidden flex items-center space-x-2 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-lg px-2 py-1">
                  <span className="text-white font-mono text-xs">{formatAddress(walletAddress)}</span>
                  <div className="flex items-center space-x-1">
                    <div className="flex items-center space-x-1 text-blue-400">
                      <Gem className="w-3 h-3" />
                      <span className="text-xs font-semibold">{fluorBalance}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-purple-400">
                      <FileText className="w-3 h-3" />
                      <span className="text-xs font-semibold">{nftCount}</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex items-center space-x-4 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-lg px-4 py-2">
                  <span className="text-white font-mono text-sm">{formatAddress(walletAddress)}</span>
                  <div className="flex items-center space-x-1 text-blue-400">
                    <Gem className="w-4 h-4" />
                    <span className="text-sm font-semibold">{fluorBalance}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-purple-400">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-semibold">{nftCount}</span>
                  </div>
                </div>

                <Button
                  onClick={disconnectWallet}
                  variant="outline"
                  size="sm"
                  className="bg-gray-800/50 border-gray-600/50 text-white hover:bg-gray-700/50 p-2"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileOpen((s) => !s)}
              className="text-white hover:text-green-400 p-2"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown nav - visible when hamburger toggled */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-md border-t border-green-500/30">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
            <nav className="flex flex-col space-y-1">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActivePage("/") ? "text-green-400" : "text-white hover:text-green-400"}`}
              >
                Home
              </Link>
              <Link
                href="/game"
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActivePage("/game") ? "text-green-400" : "text-white hover:text-green-400"}`}
              >
                Game
              </Link>
              <Link
                href="/swap"
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActivePage("/swap") ? "text-green-400" : "text-white hover:text-green-400"}`}
              >
                Buy
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${isActivePage("/profile") ? "text-green-400" : "text-white hover:text-green-400"}`}
              >
                Profile
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
