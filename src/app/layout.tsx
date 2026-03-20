import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { AdScript } from '@/components/AdScript'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'WordSmart – Myanmar English Learning',
  description: 'Daily word learning system for Myanmar students',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>

        {/* 1. Load the SDK */}
        <Script
          src="//libtl.com/sdk.js"
          data-zone="10753145"
          data-sdk="show_10753145"
          strategy="afterInteractive"
        />

        {/* 2. Initialize with your settings */}
        <AdScript />
      </body>
    </html>
  )
}
