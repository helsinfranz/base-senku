"use client"

import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { baseSepolia } from "@reown/appkit/networks";
import { WalletProvider } from "@/contexts/wallet-context"

const projectId = "21bb9c0171a2f74f3e49b81e06e26220";

const metadata = {
    name: "Senku's Elixir",
    description: "A puzzle game inspired by Dr. Stone - Science will save the world, one drop at a time.",
    url: "https://www.senkuselixir.xyz",
    icons: ["https://www.senkuselixir.xyz/android-chrome-512x512.png"],
};

createAppKit({
    adapters: [new EthersAdapter()],
    metadata: metadata,
    networks: [baseSepolia],
    projectId: projectId,
    features: {
        analytics: true,
    },
});

export function AppKit({ children }) {
    return (
        <WalletProvider>
            {children}
        </WalletProvider>
    );
}