'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Copy,
  Search,
  Share2,
  Plus,
  X,
  Check,
  Clock,
  Tag,
} from 'lucide-react'
import { HistoryItem } from '@/hooks/useScanHistory'

interface ScanResultModalProps {
  isOpen: boolean
  result: {
    text: string
    format: string
    timestamp: Date
  } | null
  onClose: () => void
  onAddToHistory: () => void
  onCopyToClipboard: () => void
  isCopied: boolean
}

export function ScanResultModal({
  isOpen,
  result,
  onClose,
  onAddToHistory,
  onCopyToClipboard,
  isCopied,
}: ScanResultModalProps) {
  const [showCopiedFeedback, setShowCopiedFeedback] = useState(false)

  const handleCopy = () => {
    onCopyToClipboard()
    setShowCopiedFeedback(true)
    setTimeout(() => setShowCopiedFeedback(false), 2000)
  }

  const handleShare = async () => {
    if (!result) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Scanned Barcode',
          text: `Barcode: ${result.text}\nFormat: ${result.format}`,
          url: window.location.href,
        })
      } else {
        handleCopy()
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err)
      }
    }
  }

  const handleGoogleSearch = () => {
    if (!result) return
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(result.text)}`
    window.open(searchUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-3xl shadow-2xl"
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-4">
              <div className="w-12 h-1 bg-muted rounded-full" />
            </div>

            {/* Content */}
            {result && (
              <div className="px-6 pb-8 max-w-2xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      Scan Result
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Tag className="w-3 h-3" />
                      <span>{result.format}</span>
                      <Clock className="w-3 h-3 ml-2" />
                      <span>
                        {result.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Barcode Display */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-secondary/50 border border-primary/20 rounded-2xl p-4 mb-6 backdrop-blur-sm"
                >
                  <p
                    className="text-center font-mono text-sm text-foreground break-all leading-relaxed"
                    aria-label={`Barcode content: ${result.text}`}
                  >
                    {result.text}
                  </p>
                </motion.div>

                {/* Copy Feedback */}
                <AnimatePresence>
                  {showCopiedFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-2 mb-4 text-primary text-sm"
                    >
                      <Check className="w-4 h-4" />
                      Copied to clipboard
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="border-primary/20 hover:bg-primary/10 gap-2"
                    aria-label={`Copy barcode${isCopied ? ' (copied)' : ''}`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleGoogleSearch}
                    variant="outline"
                    className="border-primary/20 hover:bg-primary/10 gap-2"
                    aria-label="Search on Google"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </Button>

                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="border-primary/20 hover:bg-primary/10 gap-2"
                    aria-label="Share barcode"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>

                  <Button
                    onClick={onAddToHistory}
                    variant="outline"
                    className="border-primary/20 hover:bg-primary/10 gap-2"
                    aria-label="Add to history"
                  >
                    <Plus className="w-4 h-4" />
                    History
                  </Button>
                </div>

                {/* Close Button */}
                <Button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary text-primary-foreground"
                  aria-label="Close result modal"
                >
                  Continue Scanning
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
