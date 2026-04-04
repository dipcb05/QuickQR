import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Suspense } from 'react'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Navigation } from '@/components/Navigation'
import { ProgressBar } from '@/components/ProgressBar'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], display: 'swap', variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: {
    default: 'Quick QR - Fast Barcode & QR Scanner PWA',
    template: '%s | Quick QR',
  },
  description: 'Scan, create, and share QR codes instantly. Fast, offline-capable barcode and QR code scanner for iOS, Android, and desktop. Ad-free and privacy-first.',
  manifest: '/manifest.json',
  keywords: ['barcode', 'qr code', 'scanner', 'pwa', 'offline', 'qr generator', 'privacy'],
  authors: [{ name: 'Quick QR', url: 'https://quickqr.app' }],
  openGraph: {
    type: 'website',
    title: 'Quick QR - Fast Barcode & QR Scanner',
    description: 'Scan, create, and share QR codes instantly. Ad-free, offline-capable, and privacy-first.',
    siteName: 'Quick QR',
    images: [{ url: '/icon-512x512.png', width: 512, height: 512, alt: 'Quick QR Logo' }],
  },
  twitter: {
    card: 'summary',
    title: 'Quick QR - Fast Barcode & QR Scanner',
    description: 'Scan, create, and share QR codes instantly. Ad-free, offline-capable, and privacy-first.',
    images: ['/icon-512x512.png'],
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-icon-180.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Quick QR',
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

const SW_REGISTER_SCRIPT = `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js')})}`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Quick QR" />
        <meta name="msapplication-TileColor" content="#0d0013" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="dns-prefetch" href="https://assets.mixkit.co" />
      </head>
      <body className="font-sans antialiased min-h-screen bg-background overscroll-none">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <ProgressBar />
          </Suspense>
          <div className="relative flex flex-col h-[100svh] overflow-hidden">
            <main className="flex-1 overflow-y-auto pb-28 sm:pb-32">
              {children}
            </main>
            <Navigation />
          </div>
          <Toaster closeButton richColors position="top-center" />
          <Analytics />
          {process.env.NODE_ENV === 'production' && (
            <script dangerouslySetInnerHTML={{ __html: SW_REGISTER_SCRIPT }} />
          )}
        </ThemeProvider>
      </body>
    </html>
  )
}
