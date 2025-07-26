import { Inter } from "next/font/google"
import "./globals.css"
import { WalletProvider } from "@/contexts/wallet-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Senku's Elixir - Kingdom of Science",
  description: "A puzzle game inspired by Dr. Stone - Science will save the world, one drop at a time.",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  )
}
