'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CameraScanner } from '@/components/CameraScanner'
import { ScanResultModal } from '@/components/ScanResultModal'
import { HistoryTab } from '@/components/HistoryTab'
import { SettingsTab } from '@/components/SettingsTab'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBarcodeScannerEngine, ScanResult } from '@/hooks/useBarcodeScannerEngine'
import { useCamera } from '@/hooks/useCamera'
import { useFlashlight } from '@/hooks/useFlashlight'
import { useVibration } from '@/hooks/useVibration'
import { useScanHistory } from '@/hooks/useScanHistory'
import { useScanSettings } from '@/hooks/useScanSettings'
import { Scan, History, Settings as SettingsIcon } from 'lucide-react'

export default function Page() {
  const [activeTab, setActiveTab] = useState('scan')
  const [isResultModalOpen, setIsResultModalOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  // Hooks
  const { videoRef: cameraVideoRef, startCamera, stopCamera, toggleCamera, hasMultipleCameras, error: cameraError } = useCamera()
  const scannerRef = useRef<MediaStream | null>(null)
  const { isFlashlightOn, toggleFlashlight, isSupported: flashlightSupported } = useFlashlight(scannerRef)
  const { vibrate } = useVibration()
  const { history, addToHistory, deleteFromHistory, clearHistory, searchHistory, exportToCSV, incrementCopyCount } = useScanHistory()
  const { settings, updateSetting, resetSettings } = useScanSettings()

  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null)

  // Handle scanner results
  const handleScanSuccess = (result: ScanResult) => {
    setCurrentScan(result)
    setIsResultModalOpen(true)

    if (settings.vibrationEnabled) {
      vibrate([200, 100, 200])
    }
  }

  // Add scan to history
  const handleAddToHistory = () => {
    if (currentScan) {
      addToHistory({
        text: currentScan.text,
        format: currentScan.format,
        timestamp: new Date().toISOString(),
      })
    }
  }

  // Copy to clipboard
  const handleCopyToClipboard = () => {
    if (currentScan && navigator.clipboard) {
      navigator.clipboard.writeText(currentScan.text).catch((err) => {
        console.error('Failed to copy:', err)
      })
      setIsCopied(true)
      incrementCopyCount(currentScan.text)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  // PWA Install handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setIsInstallable(false)
      }
    }
  }

  // Register service worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Service worker registration failed:', err)
      })
    }
  }, [])

  // Start camera on mount
  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="w-screen h-screen fixed inset-0 bg-background overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          {/* Content Area */}
          <TabsContent value="scan" className="flex-1 m-0 data-[state=inactive]:hidden">
            <CameraScanner
              isScanning={activeTab === 'scan'}
              onStartScan={async () => {
                await startCamera()
              }}
              onStopScan={stopCamera}
              onToggleCamera={toggleCamera}
              isFlashlightOn={isFlashlightOn}
              onToggleFlashlight={toggleFlashlight}
              flashlightSupported={flashlightSupported}
              cameraError={cameraError}
              videoRef={cameraVideoRef}
              hasMultipleCameras={hasMultipleCameras}
            />
          </TabsContent>

          <TabsContent value="history" className="flex-1 m-0 data-[state=inactive]:hidden">
            <HistoryTab
              history={history}
              onDelete={deleteFromHistory}
              onClear={clearHistory}
              onExport={exportToCSV}
              onCopy={(text, id) => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(text)
                  incrementCopyCount(id)
                }
              }}
            />
          </TabsContent>

          <TabsContent value="settings" className="flex-1 m-0 data-[state=inactive]:hidden">
            <SettingsTab
              settings={settings}
              onUpdateSetting={updateSetting}
              onResetSettings={resetSettings}
              isInstallable={isInstallable}
              onInstall={handleInstallApp}
            />
          </TabsContent>

          {/* Bottom Tab Navigation */}
          <div className="bg-card border-t border-border">
            <TabsList className="w-full grid grid-cols-3 h-16 bg-transparent border-0 rounded-none p-0">
              <TabsTrigger
                value="scan"
                className="rounded-none border-0 data-[state=active]:border-t-2 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
              >
                <div className="flex flex-col items-center gap-1">
                  <Scan className="w-5 h-5" />
                  <span className="text-xs font-medium">Scan</span>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="history"
                className="rounded-none border-0 data-[state=active]:border-t-2 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
              >
                <div className="flex flex-col items-center gap-1">
                  <History className="w-5 h-5" />
                  <span className="text-xs font-medium">History</span>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="settings"
                className="rounded-none border-0 data-[state=active]:border-t-2 data-[state=active]:border-primary data-[state=active]:bg-primary/5"
              >
                <div className="flex flex-col items-center gap-1">
                  <SettingsIcon className="w-5 h-5" />
                  <span className="text-xs font-medium">Settings</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Result Modal */}
      <ScanResultModal
        isOpen={isResultModalOpen}
        result={currentScan}
        onClose={() => {
          setIsResultModalOpen(false)
          setCurrentScan(null)
        }}
        onAddToHistory={handleAddToHistory}
        onCopyToClipboard={handleCopyToClipboard}
        isCopied={isCopied}
      />
    </div>
  )
}
