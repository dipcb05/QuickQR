'use client'

import { SettingsTab } from '@/components/SettingsTab'
import { useScanSettings } from '@/hooks/useScanSettings'
import { useFolderStorage } from '@/hooks/useFolderStorage'
import { useScanHistory } from '@/hooks/useScanHistory'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { settings, updateSetting, resetSettings } = useScanSettings()
  const { isFolderConnected, folderName, connectFolder, saveScanToFolder } = useFolderStorage()
  const { history } = useScanHistory()

  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const handleConnectFolder = useCallback(async () => {
    const success = await connectFolder()
    if (success && history.length > 0) {
      toast.loading('Syncing history to folder...', { id: 'settings-sync' })
      let count = 0
      for (const item of history) {
        const saved = await saveScanToFolder({
          id: item.id,
          text: item.text,
          format: item.format,
          timestamp: item.timestamp,
        })
        if (saved) count++
      }
      if (count > 0) {
        toast.success(`Synced ${count} items`, { id: 'settings-sync' })
      } else {
        toast.dismiss('settings-sync')
      }
    }
  }, [connectFolder, history, saveScanToFolder])

  const handleInstallApp = useCallback(async () => {
    if (deferredPrompt) {
      (deferredPrompt as any).prompt()
      const { outcome } = await (deferredPrompt as any).userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setIsInstallable(false)
      }
    }
  }, [deferredPrompt])

  return (
    <div className="h-full bg-background">
      <SettingsTab
        settings={settings}
        onUpdateSetting={updateSetting}
        onResetSettings={resetSettings}
        isInstallable={isInstallable}
        onInstall={handleInstallApp}
        isFolderConnected={isFolderConnected}
        folderName={folderName}
        onConnectFolder={handleConnectFolder}
      />
    </div>
  )
}
