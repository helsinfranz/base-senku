import crypto from "crypto"
import { MongoClient } from "mongodb"
import { ethers } from "ethers"

const MONGO_URI = process.env.MONGO_URI
const DB_NAME = "SenkusElixir"
const COLLECTION = "derived_keys"

export async function connectDB() {
    const client = new MongoClient(MONGO_URI)
    await client.connect()
    return client.db(DB_NAME)
}

function deriveKeyFromEnv() {
    const enc = process.env.ENCRYPTION_KEY || ""
    // Normalize to 32 bytes using sha256
    return crypto.createHash("sha256").update(enc).digest()
}

export function deriveEthereumPrivateKey(solanaAddress) {
    const secret = process.env.DERIVATION_SECRET || ""
    if (!secret) throw new Error("DERIVATION_SECRET not set in env")

    // Use HMAC-SHA256(secret, solanaAddress) -> 32 bytes
    const hmac = crypto.createHmac("sha256", secret).update(solanaAddress).digest()

    // Turn into hex and ensure it's a valid secp256k1 private key via ethers
    const hex = hmac.toString("hex")

    // ethers Wallet will validate the private key
    try {
        const wallet = new ethers.Wallet("0x" + hex)
        return wallet.privateKey.replace(/^0x/, "")
    } catch (err) {
        // In the unlikely event it's invalid, fallback to keccak256
        const keccak = ethers.keccak256(ethers.toUtf8Bytes(secret + solanaAddress))
        return keccak.replace(/^0x/, "").slice(0, 64)
    }
}

export function encryptPrivateKey(hexPrivateKey) {
    const key = deriveKeyFromEnv()
    const iv = crypto.randomBytes(12) // AES-GCM nonce

    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
    const ciphertext = Buffer.concat([cipher.update(Buffer.from(hexPrivateKey, "hex")), cipher.final()])
    const authTag = cipher.getAuthTag()

    return {
        iv: iv.toString("hex"),
        authTag: authTag.toString("hex"),
        data: ciphertext.toString("hex"),
    }
}

export function decryptPrivateKey(encObj) {
    const key = deriveKeyFromEnv()
    const iv = Buffer.from(encObj.iv, "hex")
    const authTag = Buffer.from(encObj.authTag, "hex")
    const data = Buffer.from(encObj.data, "hex")

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
    decipher.setAuthTag(authTag)
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()])
    return decrypted.toString("hex")
}

export async function findKeyBySolanaAddress(solanaAddress) {
    const db = await connectDB()
    const col = db.collection(COLLECTION)
    return col.findOne({ solanaAddress: solanaAddress.toLowerCase() })
}

export async function saveDerivedKey({ solanaAddress, ethAddress, encrypted }) {
    const db = await connectDB()
    const col = db.collection(COLLECTION)
    const now = new Date()
    const doc = {
        solanaAddress: solanaAddress.toLowerCase(),
        ethAddress: ethAddress.toLowerCase(),
        encryptedPrivateKey: encrypted,
        createdAt: now,
        updatedAt: now,
    }
    await col.updateOne({ solanaAddress: solanaAddress.toLowerCase() }, { $set: doc }, { upsert: true })
    return doc
}
