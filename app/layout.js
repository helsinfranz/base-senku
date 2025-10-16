import { Inter } from "next/font/google"
import "./globals.css"
import { ToastProvider } from "@/components/toast"
import { AppKit } from "../contexts/appkit"
import { Analytics } from "@vercel/analytics/next"

const APP_NAME = "Senku's Elixir - Kingdom of Science";
const APP_DEFAULT_TITLE = "Senku's Elixir - Kingdom of Science";
const APP_TITLE_TEMPLATE = "%s - Senku's Elixir - Kingdom of Science";
const APP_DESCRIPTION = "A puzzle game inspired by Dr. Stone - Science will save the world, one drop at a time.";

export const metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport = {
  themeColor: "#4ade80",
};

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <AppKit>
            <ToastProvider>{children}</ToastProvider>
            <Analytics />
          </AppKit>
      </body>
    </html >
  )
}
