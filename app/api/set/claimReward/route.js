import { NextResponse } from "next/server"
import { findKeyBySolanaAddress } from "@/lib/key-utils"
import { initializeContracts } from "../../../../lib/contract-util"
import { decryptPrivateKey } from "../../../../lib/key-utils"

export async function POST(request) {
  try {
    const { solanaAddress, token } = await request.json()

    if (!solanaAddress || !token) return NextResponse.json({ error: "Missing solanaAddress or token" }, { status: 400 })

    // const meResp = await fetch(`https://api.web3modal.org/auth/v1/me?projectId=21bb9c0171a2f74f3e49b81e06e26220&st=appkit&sv=react-solana-1.8.9&includeAppKitAccount=true`, {
    //   method: 'GET',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   }
    // });
    // const me = await meResp.json();
    // if (me?.address?.toLowerCase() !== solanaAddress.toLowerCase()) {
    //   return NextResponse.json({ error: "User not signed in" }, { status: 401 })
    // }

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
