import { NextResponse } from "next/server"
import { ethers } from "ethers"
import { deriveEthereumPrivateKey, encryptPrivateKey, saveDerivedKey, findKeyBySolanaAddress } from "@/lib/key-utils"

export async function POST(request) {
  try {
    const { solanaAddress } = await request.json()
    if (!solanaAddress) return NextResponse.json({ error: "Missing solanaAddress" }, { status: 400 })

    // Check existing
    const existing = await findKeyBySolanaAddress(solanaAddress)
    if (existing) {
      return NextResponse.json({ success: true, ethAddress: existing.ethAddress }, { status: 200 })
    }

    // Derive
    const hexPriv = deriveEthereumPrivateKey(solanaAddress)
    const wallet = new ethers.Wallet("0x" + hexPriv)

    // Encrypt and save
    const encrypted = encryptPrivateKey(hexPriv)
    await saveDerivedKey({ solanaAddress, ethAddress: wallet.address, encrypted })

    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const Bwallet = new ethers.Wallet(process.env.BACKEND_PRIVATE_KEY, provider);

    try {
      const tx = await Bwallet.sendTransaction({
        to: wallet.address,
        value: ethers.parseUnits("0.0001", "ether")
      })
      await tx.wait()
    } catch (err) {
      console.error("Error sending base sepolia:", err)
    }

    return NextResponse.json({ success: true, ethAddress: wallet.address }, { status: 201 })
  } catch (err) {
    console.error("Error generating key:", err)
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 })
  }
}
