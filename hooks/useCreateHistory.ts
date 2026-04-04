'use client'
import { useState, useCallback, useEffect } from 'react'

export type QRType = 'text' | 'url' | 'wifi' | 'email' | 'phone' | 'sms'

export interface CreatedQRItem {
  id: string
  content: string
  label: string
  customName: string
  slug: string
  type: QRType
  timestamp: string
}

const STORAGE_KEY = 'created-history'

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32)
  const suffix = Math.random().toString(36).substring(2, 6)
  return base ? `${base}-${suffix}` : suffix
}

export function getQRBySlug(slug: string): CreatedQRItem | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const items: CreatedQRItem[] = JSON.parse(stored)
    return items.find((item) => item.slug === slug) || null
  } catch {
    return null
  }
}

export const useCreateHistory = () => {
  const [history, setHistory] = useState<CreatedQRItem[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setHistory(JSON.parse(stored))
      }
    } catch (err) {
      console.error('Failed to load created history:', err)
    }
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
      } catch (err) {
        console.error('Failed to save created history:', err)
      }
    }
  }, [history, isMounted])

  const addToHistory = useCallback((content: string, type: QRType, label: string, customName: string) => {
    if (!content.trim()) return ''

    const slug = generateSlug(customName || label)

    const newItem: CreatedQRItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      label,
      customName,
      slug,
      type,
      timestamp: new Date().toISOString(),
    }

    setHistory((prev) => {
      if (prev.length > 0 && prev[0].content === content) {
        return prev
      }
      return [newItem, ...prev.slice(0, 99)]
    })

    return slug
  }, [])

  const findBySlug = useCallback((slug: string): CreatedQRItem | null => {
    return history.find((item) => item.slug === slug) || null
  }, [history])

  const deleteFromHistory = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    history,
    addToHistory,
    findBySlug,
    deleteFromHistory,
    clearHistory,
    isMounted
  }
}
