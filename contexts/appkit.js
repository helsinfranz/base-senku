"use client"

import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { solana } from "@reown/appkit/networks";
import { WalletProvider } from "@/contexts/wallet-context";
// import { ReownAuthentication } from '@reown/appkit-siwx';

const metadata = {
    name: "Senku's Elixir",
    description: "A puzzle game inspired by Dr. Stone - Science will save the world, one drop at a time.",
    url: "https://www.senkuselixir.xyz",
    icons: ["https://www.senkuselixir.xyz/android-chrome-512x512.png"],
};

createAppKit({
    adapters: [new SolanaAdapter()],
    metadata: metadata,
    networks: [solana],
    projectId: "21bb9c0171a2f74f3e49b81e06e26220",
    features: {
        analytics: true,
    },
    // siwx: new ReownAuthentication()
});

export function AppKit({ children }) {
    return (
        <WalletProvider>
            {children}
        </WalletProvider>
    );
}