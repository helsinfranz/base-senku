import { NextResponse } from "next/server"
import { ethers } from "ethers"
import { CONTRACT_ADDRESSES, GAME_CONTROLLER_ABI } from "@/utils/contracts"
import gameLevels from "@/data/game-levels.json"

// This would be your backend private key for the owner account
// In production, use environment variables and proper key management
const BACKEND_PRIVATE_KEY = process.env.BACKEND_PRIVATE_KEY || "your-private-key-here"

export async function POST(request) {
    try {
        const { playerAddress, tubes, levelId } = await request.json()

        if (!playerAddress || !tubes || !Array.isArray(tubes) || !levelId) {
            return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
        }

        // Get the original level data
        const originalLevel = gameLevels.levels[levelId.toString()]
        if (!originalLevel) {
            return NextResponse.json({ error: "Level not found" }, { status: 404 })
        }

        // Check if the game is completed
        const isCompleted = checkGameCompletion(tubes)

        if (!isCompleted) {
            return NextResponse.json({
                success: false,
                isCompleted: false,
                message: "Level not completed yet!",
            })
        }

        // Validate that the solution matches the original level
        const isValidSolution = validateSolution(tubes, originalLevel.tubes)

        if (!isValidSolution) {
            return NextResponse.json({
                success: false,
                isCompleted: false,
                message: "Solution doesn't match the original level data!",
            })
        }

        // Try to record completion on blockchain
        try {
            // Initialize provider and signer for backend
            const provider = new ethers.JsonRpcProvider("https://rpc.sepolia-api.lisk.com")
            const signer = new ethers.Wallet(BACKEND_PRIVATE_KEY, provider)

            // Create contract instance
            const gameController = new ethers.Contract(CONTRACT_ADDRESSES.GAME_CONTROLLER, GAME_CONTROLLER_ABI, signer)

            // Record level completion on blockchain - using the correct function name
            const tx = await gameController.recordLevelComplete(playerAddress)
            await tx.wait()

            return NextResponse.json({
                success: true,
                isCompleted: true,
                message: "Level completed successfully and recorded on blockchain!",
                transactionHash: tx.hash,
            })
        } catch (blockchainError) {
            console.error("Blockchain error:", blockchainError)

            // Return failure for blockchain recording
            return NextResponse.json(
                {
                    success: false,
                    isCompleted: true,
                    message: "Your solution is correct, but we couldn't record it on the blockchain. Please try again.",
                    blockchainError: blockchainError.message,
                },
                { status: 500 },
            )
        }
    } catch (error) {
        console.error("Error recording completion:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

function checkGameCompletion(tubes) {
    const nonEmptyTubes = tubes.filter((tube) => tube.length > 0)

    if (nonEmptyTubes.length === 0) {
        return false
    }

    const colorCounts = {}
    tubes.forEach((tube) => {
        tube.forEach((liquid) => {
            const key = `${liquid.color}-${liquid.id}`
            colorCounts[key] = (colorCounts[key] || 0) + 1
        })
    })

    for (const tube of nonEmptyTubes) {
        if (tube.length === 0) continue

        const firstColor = tube[0].color
        const firstId = tube[0].id

        const allSameColor = tube.every((liquid) => liquid.color === firstColor && liquid.id === firstId)

        if (!allSameColor) {
            return false
        }
    }

    const colorKeys = Object.keys(colorCounts)

    for (const colorKey of colorKeys) {
        const [color, id] = colorKey.split("-")
        const totalCount = colorCounts[colorKey]

        const tubesWithThisColor = tubes.filter((tube) =>
            tube.some((liquid) => liquid.color === color && liquid.id.toString() === id),
        )

        let foundCount = 0
        for (const tube of tubesWithThisColor) {
            const colorCountInTube = tube.filter((liquid) => liquid.color === color && liquid.id.toString() === id).length

            if (colorCountInTube > 0) {
                const hasOnlyThisColor = tube.every((liquid) => liquid.color === color && liquid.id.toString() === id)

                if (!hasOnlyThisColor) {
                    return false
                }

                foundCount += colorCountInTube
            }
        }

        if (foundCount !== totalCount) {
            return false
        }
    }

    return true
}

function validateSolution(solvedTubes, originalTubes) {
    // Count all liquids in the original level
    const originalLiquids = {}
    originalTubes.forEach((tube) => {
        tube.forEach((liquid) => {
            const key = `${liquid.color}-${liquid.id}`
            originalLiquids[key] = (originalLiquids[key] || 0) + 1
        })
    })

    // Count all liquids in the solved state
    const solvedLiquids = {}
    solvedTubes.forEach((tube) => {
        tube.forEach((liquid) => {
            const key = `${liquid.color}-${liquid.id}`
            solvedLiquids[key] = (solvedLiquids[key] || 0) + 1
        })
    })

    // Check if the counts match exactly
    const originalKeys = Object.keys(originalLiquids).sort()
    const solvedKeys = Object.keys(solvedLiquids).sort()

    if (originalKeys.length !== solvedKeys.length) {
        return false
    }

    for (let i = 0; i < originalKeys.length; i++) {
        if (originalKeys[i] !== solvedKeys[i] || originalLiquids[originalKeys[i]] !== solvedLiquids[originalKeys[i]]) {
            return false
        }
    }

    return true
}
