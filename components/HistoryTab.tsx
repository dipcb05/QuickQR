'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Download, Copy, Search as SearchIcon } from 'lucide-react'
import { HistoryItem } from '@/hooks/useScanHistory'

interface HistoryTabProps {
  history: HistoryItem[]
  onDelete: (id: string) => void
  onClear: () => void
  onExport: () => void
  onCopy: (text: string, id: string) => void
}

export function HistoryTab({
  history,
  onDelete,
  onClear,
  onExport,
  onCopy,
}: HistoryTabProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredHistory = useMemo(() => {
    if (!searchQuery) return history

    const lowerQuery = searchQuery.toLowerCase()
    return history.filter(
      (item) =>
        item.text.toLowerCase().includes(lowerQuery) ||
        item.format.toLowerCase().includes(lowerQuery)
    )
  }, [history, searchQuery])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Scan History</h1>
          {history.length > 0 && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onExport}
                className="border-primary/20 hover:bg-primary/10 gap-2"
                aria-label="Export history to CSV"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClear}
                className="text-destructive hover:bg-destructive/10"
                aria-label="Clear all history"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search scans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50 border-primary/20 placeholder:text-muted-foreground"
            aria-label="Search history"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3 px-4">
              <div className="w-16 h-16 rounded-full bg-secondary/50 mx-auto flex items-center justify-center">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {history.length === 0 ? 'No Scans Yet' : 'No Matches'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {history.length === 0
                  ? 'Scanned barcodes will appear here'
                  : 'Try a different search term'}
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="p-4 space-y-2"
          >
            {filteredHistory.map((historyItem) => (
              <motion.div
                key={historyItem.id}
                variants={item}
                className="bg-card/50 border border-border rounded-xl p-4 backdrop-blur-sm hover:bg-card/80 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                        {historyItem.format}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(historyItem.timestamp).toLocaleTimeString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground break-all font-mono leading-relaxed">
                      {historyItem.text}
                    </p>
                    {historyItem.copyCount > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Copied {historyItem.copyCount} time{historyItem.copyCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onCopy(historyItem.text, historyItem.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      aria-label={`Copy "${historyItem.text}"`}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(historyItem.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      aria-label={`Delete "${historyItem.text}"`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
