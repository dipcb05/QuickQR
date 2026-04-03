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
import { Scan, History, Settings as SettingsIcon, Camera, FileText } from 'lucide-react'
import { SplashScreen } from '@/components/SplashScreen'
import { PermissionModal } from '@/components/PermissionModal'
import { toast } from 'sonner'
import { Html5Qrcode } from 'html5-qrcode'

export default function Page() {
  const [activeTab, setActiveTab] = useState('scan')
  const [isResultModalOpen, setIsResultModalOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [hasStartedScanning, setHasStartedScanning] = useState(false)
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Hooks
  const { 
    videoRef: cameraVideoRef, 
    startCamera, 
    stopCamera, 
    pauseCamera, 
    resumeCamera, 
    toggleCamera, 
    hasMultipleCameras, 
    error: cameraError, 
    isCameraActive,
    isPaused,
    zoom,
    setZoom,
    zoomRange
  } = useCamera()
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
    
    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
    
    if (isStandalone) {
      setIsInstallable(false)
    } else if (isIOS) {
      // On iOS, native prompt doesn't exist, but we show instructions anyway
      setIsInstallable(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [isIOS])

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setIsInstallable(false)
      }
    } else if (isIOS) {
      toast.info('On iOS, tap the share icon below and select "Add to Home Screen"', {
        duration: 8000,
        id: 'ios-install-inst'
      })
    } else {
      toast.info('Use your browser menu to "Install" or "Add to Home Screen"', {
        id: 'generic-install-inst'
      })
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

  // Start camera if started scanning
  useEffect(() => {
    if (hasStartedScanning && activeTab === 'scan') {
      startCamera()
    }
    return () => {
      stopCamera()
    }
  }, [hasStartedScanning, activeTab, startCamera, stopCamera])

  // Continuous Scanning Logic (Supports scanning even when paused/frozen)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    const html5QrCode = new Html5Qrcode("reader-hidden")

    if (hasStartedScanning && activeTab === 'scan' && isCameraActive && cameraVideoRef.current) {
      interval = setInterval(async () => {
        if (!cameraVideoRef.current || isResultModalOpen) return

        try {
          // Capture current frame from video (works even if video.pause() was called)
          const canvas = document.createElement('canvas')
          canvas.width = cameraVideoRef.current.videoWidth
          canvas.height = cameraVideoRef.current.videoHeight
          const ctx = canvas.getContext('2d')
          if (!ctx) return
          ctx.drawImage(cameraVideoRef.current, 0, 0)
          
          canvas.toBlob(async (blob) => {
            if (!blob) return
            const file = new File([blob], 'scan.jpg', { type: 'image/jpeg' })
            try {
              const decodedText = await html5QrCode.scanFile(file, false)
              handleScanSuccess({
                text: decodedText,
                format: 'QR_CODE',
                timestamp: new Date()
              })
            } catch (err) {
              // No QR code found in this frame, ignore
            }
          }, 'image/jpeg', 0.8)
        } catch (err) {
          console.error('Scan loop error:', err)
        }
      }, 500) // Scan every 500ms
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [hasStartedScanning, activeTab, isCameraActive, isResultModalOpen])

  const handleStartScanningClick = async () => {
    try {
      // Check if permission API is supported
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
        if (result.state === 'granted') {
          setHasStartedScanning(true)
          return
        }
      }
      
      // If not granted or API not supported, show the modal
      setIsPermissionModalOpen(true)
    } catch (err) {
      console.error('Error checking permissions:', err)
      setIsPermissionModalOpen(true)
    }
  }

  const handleCameraPermissionRequest = async () => {
    setIsPermissionModalOpen(false)
    try {
      await startCamera()
      setHasStartedScanning(true)
    } catch (err) {
      toast.error('Failed to access camera. Please check your browser settings.')
    }
  }

  const handleFileAccessRequest = () => {
    setIsPermissionModalOpen(false)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const html5QrCode = new Html5Qrcode("reader-hidden")
    try {
      toast.loading('Scanning image...', { id: 'file-scan' })
      const decodedText = await html5QrCode.scanFile(file, true)
      toast.success('QR Code found!', { id: 'file-scan' })
      
      handleScanSuccess({
        text: decodedText,
        format: 'QR_CODE',
        timestamp: new Date()
      })
      setHasStartedScanning(true)
    } catch (err) {
      toast.error('No QR code found in this image.', { id: 'file-scan' })
    } finally {
      // Reset input
      e.target.value = ''
    }
  }

  if (!hasStartedScanning) {
    return (
      <>
        <SplashScreen 
          onStartClick={handleStartScanningClick} 
          isInstallable={isInstallable}
          onInstall={handleInstallApp}
        />
        <PermissionModal 
          isOpen={isPermissionModalOpen}
          onClose={() => setIsPermissionModalOpen(false)}
          onCameraClick={handleCameraPermissionRequest}
          onFileClick={handleFileAccessRequest}
        />
        {/* These will be rendered below as well, but for early return we need them here or move them to layout */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
        />
        <div id="reader-hidden" className="hidden" />
      </>
    )
  }

  return (
    <div className="w-screen h-screen fixed inset-0 bg-background overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          {/* Content Area */}
          <TabsContent value="scan" className="flex-1 m-0 data-[state=inactive]:hidden">
            <CameraScanner
              isScanning={activeTab === 'scan' && !isPaused}
              onStartScan={async () => {
                if (isPaused) {
                  resumeCamera()
                } else {
                  await startCamera()
                }
              }}
              onStopScan={pauseCamera}
              onToggleCamera={toggleCamera}
              isFlashlightOn={isFlashlightOn}
              onToggleFlashlight={toggleFlashlight}
              flashlightSupported={flashlightSupported}
              cameraError={cameraError}
              videoRef={cameraVideoRef}
              hasMultipleCameras={hasMultipleCameras}
              onFileSelect={handleFileAccessRequest}
              onBack={() => {
                stopCamera()
                setHasStartedScanning(false)
              }}
              zoom={zoom}
              onZoomChange={setZoom}
              zoomRange={zoomRange}
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

      {/* Hidden input and reader for file scanning - Available globally */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <div id="reader-hidden" className="hidden" />

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
