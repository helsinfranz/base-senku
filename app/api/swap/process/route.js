import { NextResponse } from "next/server"
import { ethers } from "ethers"
import { CONTRACT_ADDRESSES, FLUORITE_TOKEN_ABI } from "@/utils/contracts"

const BACKEND_PRIVATE_KEY = process.env.BACKEND_PRIVATE_KEY || "your-private-key-here"
const MDS_TOKEN_ADDRESS = "0x1234567890123456789012345678901234567890" // Replace with actual MDS token address
const BACKEND_ADDRESS = "0x742d35Cc6634C0532925a3b8D0C9C0E0C0C0C0C0" // Replace with actual backend address

export async function POST(request) {
  try {
    const { txHash, amount } = await request.json()

    if (!txHash || !amount) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Verify the transaction using Base Sepolia provider
    try {
      const provider = new ethers.JsonRpcProvider("https://sepolia.base.org")

      // Get transaction details
      const tx = await provider.getTransaction(txHash)
      if (!tx) {
        return NextResponse.json({ error: "Transaction not found" }, { status: 400 })
      }

      // Wait for transaction confirmation
      const receipt = await provider.getTransactionReceipt(txHash)
      if (!receipt) {
        return NextResponse.json({ error: "Transaction not confirmed yet" }, { status: 400 })
      }

      if (receipt.status !== 1) {
        return NextResponse.json({ error: "Transaction failed" }, { status: 400 })
      }

      // Verify transaction details
      const expectedAmount = ethers.parseEther(amount.toString())

      // Check if transaction is to our backend address
      if (tx.to.toLowerCase() !== MDS_TOKEN_ADDRESS.toLowerCase()) {
        return NextResponse.json({ error: "Invalid transaction recipient" }, { status: 400 })
      }

      // Decode transaction data to verify it's a transfer to our backend
      const mdsInterface = new ethers.Interface(["function transfer(address to, uint256 amount) returns (bool)"])

      let decodedData
      try {
        decodedData = mdsInterface.parseTransaction({ data: tx.data })
      } catch (error) {
        return NextResponse.json({ error: "Invalid transaction data" }, { status: 400 })
      }

      // Verify the transfer is to our backend address
      if (decodedData.args[0].toLowerCase() !== BACKEND_ADDRESS.toLowerCase()) {
        return NextResponse.json({ error: "Transfer not to correct address" }, { status: 400 })
      }

      // Verify the amount
      if (decodedData.args[1].toString() !== expectedAmount.toString()) {
        return NextResponse.json({ error: "Amount mismatch" }, { status: 400 })
      }

      // Get the sender from the transaction
      const senderAddress = tx.from

      // Check if this transaction has already been processed (implement your own logic)
      // For now, we'll skip this check

      // Send FLUOR tokens to the user
      const signer = new ethers.Wallet(BACKEND_PRIVATE_KEY, provider)
      const fluorContract = new ethers.Contract(CONTRACT_ADDRESSES.FLUORITE_TOKEN, FLUORITE_TOKEN_ABI, signer)

      // Transfer FLUOR tokens from backend to user
      const fluorTx = await fluorContract.transfer(senderAddress, expectedAmount)
      await fluorTx.wait()

      console.log(`Successfully swapped ${amount} MDS for ${amount} FLUOR for ${senderAddress}`)

      return NextResponse.json({
        success: true,
        message: `Successfully swapped ${amount} MDS for ${amount} FLUOR`,
        fluorTxHash: fluorTx.hash,
        senderAddress: senderAddress,
      })
    } catch (blockchainError) {
      console.error("Blockchain verification error:", blockchainError)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to verify transaction. Please ensure the transaction is valid and try again.",
          error: blockchainError.message,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Swap processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
