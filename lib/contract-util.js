import { getContracts } from "@/utils/contracts"
import { ethers } from "ethers";

export function initializeContracts(hexPrivateKey) {
    const ETH_RPC_URL = "https://sepolia.base.org";
    const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);
    const signer = new ethers.Wallet("0x" + hexPrivateKey, provider);
    if (signer) {
        const contractInstances = getContracts(signer)
        return contractInstances
    }
    return null
}