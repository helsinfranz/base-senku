import { NextResponse } from "next/server"
import gameLevels from "@/data/game-levels.json"
import { ethers } from "ethers"
import { CONTRACT_ADDRESSES, GAME_CONTROLLER_ABI } from "@/utils/contracts"

export async function GET(request, { params }) {
    try {
        const { levelId } = await params
        const { searchParams } = new URL(request.url)
        const playerAddress = searchParams.get("playerAddress")

        if (!playerAddress) {
            return NextResponse.json({ error: "Player address is required" }, { status: 400 })
        }

        // Simulate network delay for loading state
        await new Promise((resolve) => setTimeout(resolve, 500))

        const level = gameLevels.levels[levelId]

        if (!level) {
            return NextResponse.json({ error: "Level not found" }, { status: 404 })
        }

        // Check if player is authorized to access this level
        try {
            const provider = new ethers.JsonRpcProvider("https://rpc.sepolia-api.lisk.com")
            const gameController = new ethers.Contract(CONTRACT_ADDRESSES.GAME_CONTROLLER, GAME_CONTROLLER_ABI, provider)

            const playerInfo = await gameController.getPlayerInfo(playerAddress)
            const currentLevel = Number(playerInfo.currentLevel)
            const levelsCompleted = Number(playerInfo.levelsCompleted)

            const requestedLevel = Number.parseInt(levelId)

            // Player can access level if:
            // 1. It's their current paid level (currentLevel > 0 and matches requested)
            // 2. It's the next level after their completed levels (levelsCompleted + 1)
            const canAccessLevel =
                (currentLevel > 0 && currentLevel === requestedLevel) ||
                (currentLevel === 0 && requestedLevel === levelsCompleted + 1)

            if (!canAccessLevel) {
                return NextResponse.json(
                    {
                        error: "Unauthorized access to this level",
                        currentLevel: currentLevel,
                        levelsCompleted: levelsCompleted,
                        requestedLevel: requestedLevel,
                    },
                    { status: 403 },
                )
            }
        } catch (blockchainError) {
            console.error("Blockchain verification error:", blockchainError)
            // If blockchain check fails, allow access but log the error
            // In production, you might want to be more strict
        }

        return NextResponse.json({
            success: true,
            level: level,
        })
    } catch (error) {
        console.error("Error fetching level:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
