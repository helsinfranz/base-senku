import { NextResponse } from "next/server";
import { Connection } from "@solana/web3.js";
import { ethers } from "ethers";
import { MongoClient } from "mongodb";
import { CONTRACT_ADDRESSES, FLUORITE_TOKEN_ABI } from "@/utils/contracts";

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "SenkusElixir";
const COLLECTION_NAME = "swaps";

async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  return client.db(DB_NAME);
}

export async function POST(request) {
  try {
    const { playerAddress, userWallet, amount, txHash } = await request.json();

    if (!playerAddress || !userWallet || !amount || !txHash) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    // Connect to DB
    const db = await connectDB();
    const swaps = db.collection(COLLECTION_NAME);

    // Check duplicate
    const existingTx = await swaps.findOne({ txHash });
    if (existingTx) {
      return NextResponse.json({ error: "Transaction already processed" }, { status: 409 });
    }

    const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";
    const TREASURE_ADDRESS = "91QcDikPgwVCUMmxBqu61vXnhrs9DqE7VHSiNbvSwS4M";
    const MINT_ADDRESS = "Dria68ScNfmRrvL7K1nx5cEkND6V6V5yUGkFr7gcyai";

    const conn = new Connection(SOLANA_RPC_URL, "finalized");
    const parsedTx = await conn.getParsedTransaction(txHash, "finalized");

    if (!parsedTx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const blocktime = parsedTx.blockTime;
    if (!blocktime || Date.now() / 1000 - blocktime > 3600) {
      return NextResponse.json({ error: "Transaction too old" }, { status: 400 });
    }

    const mintFetched = parsedTx.meta?.postTokenBalances?.[0]?.mint?.toLowerCase() || null;
    if (mintFetched !== MINT_ADDRESS.toLowerCase()) {
      return NextResponse.json({ error: "Invalid SPL token" }, { status: 400 });
    }

    const instructions = parsedTx.transaction.message.instructions || [];

    function scanParsedInstruction(instr) {
      const p = instr.parsed;
      if (!p) return null;
      if (p.type !== "transfer" && p.type !== "transferChecked") return null;

      const info = p.info || {};
      const source = info.source || info.owner || null;
      const destination = info.destination || info.account || null;
      const tokenAmount = info.tokenAmount || null;

      let uiAmount = null;
      if (tokenAmount) {
        uiAmount =
          tokenAmount.uiAmount ??
          (tokenAmount.uiAmountString ? Number(tokenAmount.uiAmountString) : null);
      }
      if (uiAmount === null && info.amount && typeof info.decimals === "number") {
        uiAmount = Number(info.amount) / Math.pow(10, info.decimals);
      }

      return { source, destination, uiAmount, rawInfo: info };
    }

    const candidates = instructions.map(scanParsedInstruction).filter(Boolean);
    if (!candidates.length) {
      return NextResponse.json({ error: "No SPL token transfer found" }, { status: 400 });
    }

    const c = candidates[0];
    if (
      c.rawInfo.authority.toLowerCase() !== userWallet.toLowerCase() ||
      c.destination.toLowerCase() !== TREASURE_ADDRESS.toLowerCase() ||
      c.rawInfo.amount !== amount.toString()
    ) {
      return NextResponse.json({ error: "Transfer details mismatch" }, { status: 400 });
    }

    // --- STEP 1: Insert pending record BEFORE ERC-20 transfer ---
    const pendingDoc = {
      txHash,
      playerAddress,
      userWallet,
      amount,
      status: "pending",
      createdAt: new Date(),
    };
    await swaps.insertOne(pendingDoc);

    // --- STEP 2: Ethereum Transfer ---
    const ETH_RPC_URL = "https://sepolia.base.org";
    const ETH_PRIVATE_KEY = process.env.BACKEND_PRIVATE_KEY;
    const ERC20_CONTRACT_ADDRESS = CONTRACT_ADDRESSES.FLUORITE_TOKEN;

    if (!ETH_RPC_URL || !ETH_PRIVATE_KEY || !ERC20_CONTRACT_ADDRESS) {
      return NextResponse.json({ error: "Ethereum config missing" }, { status: 500 });
    }

    const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);
    const wallet = new ethers.Wallet(ETH_PRIVATE_KEY, provider);
    const token = new ethers.Contract(ERC20_CONTRACT_ADDRESS, FLUORITE_TOKEN_ABI, wallet);

    const tokenDecimals = 18;
    const amountToSend = ethers.parseUnits(String(amount / 10 ** 9), tokenDecimals);

    let txResponse;
    try {
      txResponse = await token.transfer(playerAddress, amountToSend);
      const receipt = await txResponse.wait();

      // --- STEP 3: Update MongoDB record with ethTxHash ---
      await swaps.updateOne(
        { txHash },
        {
          $set: {
            ethTxHash: receipt.hash,
            status: "completed",
            completedAt: new Date(),
          },
        }
      );

      return NextResponse.json({ success: true, txHash: receipt.hash }, { status: 200 });
    } catch (err) {
      console.error("Failed to send Ethereum transfer:", err);

      // --- STEP 4: Mark failure in DB ---
      await swaps.updateOne(
        { txHash },
        {
          $set: {
            status: "failed",
            error: err.message,
            failedAt: new Date(),
          },
        }
      );

      return NextResponse.json({ error: "Failed to send Ethereum transfer" }, { status: 500 });
    }
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}