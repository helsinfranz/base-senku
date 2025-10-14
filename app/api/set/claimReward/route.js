import { NextResponse } from "next/server"
import { findKeyBySolanaAddress } from "@/lib/key-utils"
import { initializeContracts } from "../../../../lib/contract-util"
import { decryptPrivateKey } from "../../../../lib/key-utils"

export async function POST(request) {
  try {
    const { solanaAddress } = await request.json()
    if (!solanaAddress) return NextResponse.json({ error: "Missing solanaAddress" }, { status: 400 })

    // Check existing
    const existing = await findKeyBySolanaAddress(solanaAddress)
    if (existing) {
      const contracts = initializeContracts(decryptPrivateKey(existing.encryptedPrivateKey)) // ensure contracts are initialized

      const tx = await contracts.gameController.claimReward()
      const receipt = await tx.wait()

      return NextResponse.json({ success: true, receipt }, { status: 200 })
    }

    return NextResponse.json({ error: "Key not found" }, { status: 404 })
  } catch (err) {
    console.error("Error generating key:", err)
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 })
  }
}
