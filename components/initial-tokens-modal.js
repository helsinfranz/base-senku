"use client"

import { Button } from "@/components/ui/button"

export default function InitialTokensModal({ onClaim, isLoading }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-lg max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">⚗️</div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome to the Kingdom of Science!</h2>
          <p className="text-gray-300">
            Every great scientist needs a research grant to begin their journey. Accept these FLUOR tokens to start your
            experiments!
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg p-4 mb-6 border border-green-500/30">
          <p className="text-green-400 font-bold text-xl">5 FLUOR Tokens</p>
          <p className="text-gray-400 text-sm">Starting Research Grant</p>
        </div>

        <Button
          onClick={onClaim}
          disabled={isLoading}
          className="w-full text-lg py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
        >
          {isLoading ? "Processing Transaction..." : "Claim 5 Free FLUOR"}
        </Button>

        <p className="text-gray-400 text-xs mt-4">
          {isLoading
            ? "Please wait while your transaction is being processed..."
            : "This will execute a blockchain transaction to mint your initial tokens."}
        </p>
      </div>
    </div>
  )
}
