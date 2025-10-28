import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES, FLUORITE_TOKEN_ABI } from "@/utils/contracts";
import { X402PaymentHandler } from '@payai/x402-solana/server';

const x402 = new X402PaymentHandler({
  network: 'solana',
  treasuryAddress: "uKQ77M8ee7Jq2TKoZSyUUWDbxv9Eva8rv8DZn2DVLXm",
  facilitatorUrl: 'https://facilitator.payai.network',
});

export async function POST(request) {
  try {
    const { playerAddress, userWallet, amount } = await request.json();

    if (!playerAddress || !userWallet || !amount) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    // 1. Extract payment header
    const paymentHeader = x402.extractPayment(request.headers);

    // 2. Create payment requirements using x402 RouteConfig format
    const paymentRequirements = await x402.createPaymentRequirements({
      price: {
        amount: amount.toString(),
        asset: {
          address: "Dria68ScNfmRrvL7K1nx5cEkND6V6V5yUGkFr7gcyai",
          decimals: 9,
        }
      },
      network: 'solana',
      config: {
        description: 'Buy FLUOR using MDS tokens',
        resource: `${process.env.NEXTAUTH_URL}/api/payment/swap`,
      }
    });

    if (!paymentHeader) {
      // Return 402 with payment requirements
      const response = x402.create402Response(paymentRequirements);
      return NextResponse.json(response.body, { status: response.status });
    }

    // 3. Verify payment
    const verified = await x402.verifyPayment(paymentHeader, paymentRequirements);
    if (!verified) {
      return NextResponse.json({ error: 'Invalid payment' }, { status: 402 });
    }

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
      await x402.settlePayment(paymentHeader, paymentRequirements);

      return NextResponse.json({ success: true, txHash: receipt.hash }, { status: 200 });
    } catch (err) {
      console.error("Failed to send Ethereum transfer:", err);
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