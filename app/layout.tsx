import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Tiro_Bangla } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"

import localFont from "next/font/local"

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
})

const tiroBangla = Tiro_Bangla({
  subsets: ["bengali"],
  display: "swap",
  variable: "--font-tiro-bangla",
  weight: ["400"],
})

// Define the local font
const liShobujNolua = localFont({
  src: "../Li Shobuj Nolua Unicode.ttf", // Path to the font file
  display: "swap",
  variable: "--font-li-shobuj-nolua", // CSS variable for the font
})

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${tiroBangla.variable} ${liShobujNolua.variable} antialiased`}>
      {/* Add the new font variable */}
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
