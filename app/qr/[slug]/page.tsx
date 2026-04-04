'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Download, QrCode, ArrowLeft, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getQRBySlug, CreatedQRItem, QRType } from '@/hooks/useCreateHistory'
import Link from 'next/link'

const TYPE_COLORS: Record<QRType, string> = {
  text: 'from-violet-500 to-purple-600',
  url: 'from-blue-500 to-cyan-500',
  wifi: 'from-emerald-500 to-green-600',
  email: 'from-amber-500 to-orange-600',
  phone: 'from-pink-500 to-rose-600',
  sms: 'from-indigo-500 to-blue-600',
}

const TYPE_LABELS: Record<QRType, string> = {
  text: 'Text',
  url: 'URL',
  wifi: 'WiFi',
  email: 'Email',
  phone: 'Phone',
  sms: 'SMS',
}

export default function QRViewerPage() {
  const params = useParams()
  const slug = params.slug as string
  const [qrItem, setQrItem] = useState<CreatedQRItem | null | undefined>(undefined)

  useEffect(() => {
    const item = getQRBySlug(slug)
    setQrItem(item)
  }, [slug])

  const handleDownload = () => {
    const svg = document.getElementById('qr-viewer-svg') as unknown as SVGSVGElement
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new window.Image()
    img.onload = () => {
      const scale = 4
      const qrSize = img.width * scale
      const padding = Math.round(qrSize * 0.18)
      const labelText = qrItem?.customName || qrItem?.label
      const labelHeight = labelText ? Math.round(qrSize * 0.1) : 0
      const totalWidth = qrSize + padding * 2
      const totalHeight = qrSize + padding * 2 + labelHeight

      const canvas = document.createElement('canvas')
      canvas.width = totalWidth
      canvas.height = totalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, totalWidth, totalHeight)
      ctx.drawImage(img, padding, padding, qrSize, qrSize)

      if (labelText) {
        const fontSize = Math.max(16, Math.round(qrSize * 0.04))
        ctx.fillStyle = '#666666'
        ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const maxWidth = totalWidth - padding * 2
        const displayLabel = labelText.length > 60 ? labelText.slice(0, 57) + '...' : labelText
        ctx.fillText(displayLabel, totalWidth / 2, qrSize + padding + labelHeight / 2, maxWidth)
      }

      const brandSize = Math.max(10, Math.round(qrSize * 0.025))
      ctx.fillStyle = '#cccccc'
      ctx.font = `500 ${brandSize}px system-ui, -apple-system, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText('Quick QR', totalWidth / 2, totalHeight - brandSize * 0.8)

      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `quickqr-${slug}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  if (qrItem === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse">
            <QrCode className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading QR code...</p>
        </motion.div>
      </div>
    )
  }

  if (qrItem === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6 max-w-sm text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive/70" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">QR Code Not Found</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This QR code may have been deleted or the data has been cleared from the original device.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/create">
              <Button className="rounded-full gap-2" variant="outline">
                <QrCode className="w-4 h-4" /> Create New QR
              </Button>
            </Link>
            <Link href="/scan">
              <Button className="rounded-full gap-2">
                <ArrowLeft className="w-4 h-4" /> Go to Scanner
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }
  const typeColor = TYPE_COLORS[qrItem.type] || TYPE_COLORS.text
  const typeLabel = TYPE_LABELS[qrItem.type] || 'Text'
  const displayName = qrItem.customName || qrItem.label

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="flex flex-col items-center gap-6 max-w-md w-full"
      >
        <div className="flex items-center gap-2 text-muted-foreground/50">
          <QrCode className="w-4 h-4" />
          <span className="text-xs font-bold tracking-wider uppercase">Quick QR</span>
        </div>

        <div className="w-full bg-gradient-to-b from-card/80 to-card/30 border border-border/50 rounded-3xl backdrop-blur-sm p-6 flex flex-col items-center gap-5">
          {displayName && (
            <h1 className="text-xl font-bold text-foreground text-center break-words">
              {displayName}
            </h1>
          )}

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${typeColor} text-white text-xs font-bold shadow-md`}>
            {typeLabel}
          </div>
          <div className="p-6 bg-white rounded-3xl shadow-2xl shadow-black/10 dark:shadow-black/30">
            <QRCodeSVG
              id="qr-viewer-svg"
              value={qrItem.content}
              size={240}
              level="H"
              includeMargin={true}
              style={{ display: 'block' }}
            />
          </div>

          <p className="text-[11px] text-muted-foreground/50 font-medium">
            Created {new Date(qrItem.timestamp).toLocaleDateString(undefined, {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>

          <Button
            onClick={handleDownload}
            className={`w-full max-w-xs h-12 rounded-2xl text-sm font-bold bg-gradient-to-r ${typeColor} text-white border-0 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200`}
          >
            <Download className="w-4 h-4 mr-2" /> Download QR Code
          </Button>
        </div>

        <Link href="/create" className="text-xs text-primary hover:underline font-medium">
          Create your own QR code →
        </Link>
      </motion.div>
    </div>
  )
}
