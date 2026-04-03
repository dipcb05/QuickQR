import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'ScanHub - Barcode Scanner PWA',
  description: 'Fast, offline-capable barcode and QR code scanner for iOS, Android, and desktop with full-featured history and settings management.',
  manifest: '/manifest.json',
  generator: 'v0.app',
  keywords: ['barcode', 'qr code', 'scanner', 'pwa', 'offline'],
  authors: [{ name: 'ScanHub' }],
  icons: {
    icon: [
      {
        url: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: '/apple-icon-180x180.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ScanHub',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#0d0013',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ScanHub" />
        <meta name="msapplication-TileColor" content="#0d0013" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className="font-sans antialiased dark">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
