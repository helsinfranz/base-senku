"use client"

import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { solana, solanaDevnet } from "@reown/appkit/networks";
import { WalletProvider } from "@/contexts/wallet-context";
import { ReownAuthentication } from '@reown/appkit-siwx';

const solanaWeb3JsAdapter = new SolanaAdapter();

const projectId = "21bb9c0171a2f74f3e49b81e06e26220";

if (!projectId) {
    throw new Error('Project ID is not defined')
}

const metadata = {
    name: "Senku's Elixir",
    description: "A puzzle game inspired by Dr. Stone - Science will save the world, one drop at a time.",
    url: "https://www.senkuselixir.xyz",
    icons: ["https://www.senkuselixir.xyz/android-chrome-512x512.png"],
};

createAppKit({
    adapters: [solanaWeb3JsAdapter],
    projectId,
    networks: [solana],
    metadata,
    features: {
        analytics: true,
    },
    siwx: new ReownAuthentication()
});

export function AppKit({ children }) {
    return (
        <WalletProvider>
            {children}
        </WalletProvider>
    );
}