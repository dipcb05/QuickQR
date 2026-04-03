import { useState, useCallback, useEffect } from 'react'

export interface HistoryItem {
  id: string
  text: string
  format: string
  timestamp: string
  copyCount: number
}

interface UseScanHistoryReturn {
  history: HistoryItem[]
  addToHistory: (item: Omit<HistoryItem, 'id' | 'copyCount'>) => void
  deleteFromHistory: (id: string) => void
  clearHistory: () => void
  searchHistory: (query: string) => HistoryItem[]
  exportToCSV: () => void
  incrementCopyCount: (id: string) => void
}

const STORAGE_KEY = 'scan-history'

export const useScanHistory = (): UseScanHistoryReturn => {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setHistory(JSON.parse(stored))
      }
    } catch (err) {
      console.error('Failed to load history:', err)
    }
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
      } catch (err) {
        console.error('Failed to save history:', err)
      }
    }
  }, [history, isMounted])

  const addToHistory = useCallback((item: Omit<HistoryItem, 'id' | 'copyCount'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      copyCount: 0,
    }

    setHistory((prev) => [newItem, ...prev.slice(0, 999)])
  }, [])

  const deleteFromHistory = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const searchHistory = useCallback(
    (query: string): HistoryItem[] => {
      const lowerQuery = query.toLowerCase()
      return history.filter(
        (item) =>
          item.text.toLowerCase().includes(lowerQuery) ||
          item.format.toLowerCase().includes(lowerQuery)
      )
    },
    [history]
  )

  const incrementCopyCount = useCallback((id: string) => {
    setHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, copyCount: item.copyCount + 1 } : item
      )
    )
  }, [])

  const exportToCSV = useCallback(() => {
    const csv = [
      ['Timestamp', 'Barcode/QR', 'Format', 'Times Copied'],
      ...history.map((item) => [
        new Date(item.timestamp).toLocaleString(),
        item.text,
        item.format,
        item.copyCount.toString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `scan-history-${new Date().toISOString()}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [history])

  return {
    history,
    addToHistory,
    deleteFromHistory,
    clearHistory,
    searchHistory,
    exportToCSV,
    incrementCopyCount,
  }
}
