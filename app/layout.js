import { Inter } from "next/font/google"
import "./globals.css"
import { ToastProvider } from "@/components/toast"
import { AppKit } from "../contexts/appkit"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Senku's Elixir - Kingdom of Science",
  description: "A puzzle game inspired by Dr. Stone - Science will save the world, one drop at a time.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppKit>
          <ToastProvider>{children}</ToastProvider>
        </AppKit>
        <Analytics />
      </body>
    </html>
  )
}
