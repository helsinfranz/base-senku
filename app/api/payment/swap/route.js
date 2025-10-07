import { NextResponse } from "next/server"
import { Connection } from "@solana/web3.js"
import { ethers } from "ethers"
import { CONTRACT_ADDRESSES, FLUORITE_TOKEN_ABI } from "@/utils/contracts"

export async function POST(request) {
    try {
        const { playerAddress, userWallet, amount, txHash } = await request.json()

        if (!playerAddress || !userWallet || !amount || !txHash) {
            return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
        }
        const SOLANA_RPC_URL = "https://api.devnet.solana.com"; // or mainnet URL
        const TREASURE_ADDRESS = "7ziZFc6zh2U1jxpYxzrA2HL77UZo8TLt9X65pNtW6EPp";
        const MINT_ADDRESS = "C5hkCo3nE6F9K6z67tzridUnbNGXfs8HBxxanFzCm58K";

        // 1) Fetch parsed transaction from Solana
        const conn = new Connection(SOLANA_RPC_URL, "finalized");

        const parsedTx = await conn.getParsedTransaction(txHash, "finalized");
        if (!parsedTx) {
            return NextResponse.json({ error: "Transaction not found on Solana (or not finalized)" }, { status: 404 });
        }
        const blocktime = parsedTx.blockTime;
        if (!blocktime || (Date.now() / 1000 - blocktime) > 3600) { // older than 1 hour
            return NextResponse.json({ error: "Transaction is too old (must be within the last hour)" }, { status: 400 });
        }
        const mint_address_fetched = parsedTx.meta?.postTokenBalances?.[0]?.mint?.toLowerCase() || null;
        if (mint_address_fetched !== MINT_ADDRESS.toLowerCase()) {
            return NextResponse.json({ error: `Transaction does not involve the expected SPL token mint (${MINT_ADDRESS})` }, { status: 400 });
        }

        const instructions = parsedTx.transaction.message.instructions || [];

        // helper to inspect parsed instructions for SPL token transfers
        function scanParsedInstruction(instr) {
            // instr may be parsed or a compiled instruction; prefer parsed
            const p = instr.parsed;
            if (!p) return null;
            // type could be 'transfer' or 'transferChecked'
            const typ = p.type;
            if (typ !== "transfer" && typ !== "transferChecked") return null;


            const info = p.info || {};
            // info should include source, destination and amount/tokenAmount
            const source = info.source || info.owner || null;
            const destination = info.destination || info.account || null;


            // tokenAmount may have uiAmount or amount+decimals
            const tokenAmount = info.tokenAmount || null;


            let uiAmount = null;
            if (tokenAmount) {
                // tokenAmount.uiAmount is a numeric or null. uiAmountString is string.
                uiAmount = tokenAmount.uiAmount ?? (tokenAmount.uiAmountString ? Number(tokenAmount.uiAmountString) : null);
            }


            // some parsed forms put 'amount' directly (raw integer) and 'decimals'
            if (uiAmount === null && info.amount && typeof info.decimals === 'number') {
                uiAmount = Number(info.amount) / Math.pow(10, info.decimals);
            }


            return { source, destination, uiAmount, rawInfo: info };
        }

        // collect candidate transfers
        const candidates = [];

        // scan top-level instructions
        for (const instr of instructions) {
            const found = scanParsedInstruction(instr);
            if (found) candidates.push(found);
        }

        if (candidates.length === 0) {
            return NextResponse.json({ error: "No parsed SPL token transfer found in transaction" }, { status: 400 });
        }

        let matched = null;
        const c = candidates[0];

        // compare addresses case-sensitively (Solana addresses are base58, case-sensitive by content)
        if (c.rawInfo.authority.toLowerCase() === userWallet.toLowerCase() && c.destination.toLowerCase() === TREASURE_ADDRESS.toLowerCase() && c.rawInfo.amount === amount.toString()) {
            matched = c;
        }

        if (!matched) {
            return NextResponse.json({ error: "No matching SPL transfer found (source/destination/amount mismatch)", candidates }, { status: 400 });
        }

        // Paying the User.

        const ETH_RPC_URL = "https://sepolia.base.org";
        const ETH_PRIVATE_KEY = process.env.BACKEND_PRIVATE_KEY;
        const ERC20_CONTRACT_ADDRESS = CONTRACT_ADDRESSES.FLUORITE_TOKEN;

        if (!ETH_RPC_URL || !ETH_PRIVATE_KEY || !ERC20_CONTRACT_ADDRESS) {
            return NextResponse.json({ error: "Server not configured for Ethereum transfers (missing ETH_RPC_URL or ETH_PRIVATE_KEY or ERC20_CONTRACT_ADDRESS)" }, { status: 500 });
        }

        const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);
        const wallet = new ethers.Wallet(ETH_PRIVATE_KEY, provider);
        const token = new ethers.Contract(ERC20_CONTRACT_ADDRESS, FLUORITE_TOKEN_ABI, wallet);

        // read decimals and compute amount in smallest units
        const tokenDecimals = 18;

        // parse amount (numericAmount) into token units
        const amountToSend = ethers.parseUnits(String(amount / 10 ** 8), tokenDecimals);

        // Finally send transfer
        let txResponse;
        try {
            txResponse = await token.transfer(playerAddress, amountToSend);
            // wait for 1 confirmation (optional)
            const receipt = await txResponse.wait();

            return NextResponse.json({
                success: true,
                txHash: receipt.hash,
            }, { status: 200 });
        } catch (err) {
            console.error("Failed to send transfer:", err);
            return NextResponse.json({ error: "Failed to send transfer" }, { status: 500 });
        }
    } catch (blockchainError) {
        console.error("Blockchain error:", blockchainError);

        // Return failure for blockchain recording
        return NextResponse.json(
            {
                success: false,
                blockchainError: blockchainError.message,
            },
            { status: 500 },
        );
    }
}