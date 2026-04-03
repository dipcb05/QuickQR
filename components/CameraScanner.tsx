'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Zap, ZapOff, RotateCw, Pause, Play, Image as ImageIcon, FileText, ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'

interface CameraScannerProps {
  isScanning: boolean
  onStartScan: () => void
  onStopScan: () => void
  onToggleCamera: () => Promise<void>
  isFlashlightOn: boolean
  onToggleFlashlight: () => Promise<void>
  flashlightSupported: boolean
  cameraError: string | null
  videoRef: React.RefObject<HTMLVideoElement | null>
  hasMultipleCameras: boolean
  onFileSelect: () => void
  onBack: () => void
  zoom: number
  onZoomChange: (value: number) => void
  zoomRange: { min: number; max: number } | null
}

export function CameraScanner({
  isScanning,
  onStartScan,
  onStopScan,
  onToggleCamera,
  isFlashlightOn,
  onToggleFlashlight,
  flashlightSupported,
  cameraError,
  videoRef,
  hasMultipleCameras,
  onFileSelect,
  onBack,
  zoom,
  onZoomChange,
  zoomRange,
}: CameraScannerProps) {
  const scannerContainerRef = useRef<HTMLDivElement>(null)
  const lastTouchDistance = useRef<number | null>(null)

  useEffect(() => {
    if (videoRef.current && isScanning) {
      videoRef.current.play().catch((err) => console.error('Video play error:', err))
    }
  }, [isScanning, videoRef])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      )
      lastTouchDistance.current = distance
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance.current && zoomRange) {
      const distance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      )
      const delta = (distance - lastTouchDistance.current) / 100
      const newZoom = Math.max(zoomRange.min, Math.min(zoomRange.max, zoom + delta))
      onZoomChange(newZoom)
      lastTouchDistance.current = distance
    }
  }

  const handleTouchEnd = () => {
    lastTouchDistance.current = null
  }

  if (cameraError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-background to-secondary p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-destructive/10 mx-auto flex items-center justify-center">
            <span className="text-2xl">📷</span>
          </div>
          <h2 className="text-lg font-semibold text-foreground">Camera Access Required</h2>
          <p className="text-sm text-muted-foreground">{cameraError}</p>
          <p className="text-xs text-muted-foreground">
            Please ensure you've granted camera permissions to use the barcode scanner.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-background overflow-hidden">
      {/* Video Element */}
      <div 
        className="absolute inset-0 w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          aria-label="Camera preview"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />

      {/* Scanning Frame Animation */}
      {(isScanning || !isScanning) && ( /* Keep frame even when paused as requested */
        <div
          ref={scannerContainerRef}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            className="w-72 h-72 border-2 border-primary rounded-lg"
            animate={isScanning ? {
              boxShadow: [
                '0 0 0 0 rgba(102, 169, 255, 0.4)',
                '0 0 0 20px rgba(102, 169, 255, 0)',
              ],
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            aria-label="Scanning indicator"
          >
            {/* Corner marks */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-primary" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-primary" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-primary" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-primary" />

            {/* Scanning line */}
            {isScanning && (
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-b from-primary/0 via-primary to-primary/0"
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity }}
                aria-hidden="true"
              />
            )}
          </motion.div>
        </div>
      )}

      {/* Zoom Controls */}
      {zoomRange && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6 z-20 bg-black/30 backdrop-blur-md p-3 rounded-full border border-white/10">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onZoomChange(zoom + 0.5)}
            className="w-10 h-10 rounded-full text-white hover:bg-white/20"
            disabled={zoom >= (zoomRange?.max ?? 10)}
          >
            <span className="text-xl font-bold">+</span>
          </Button>

          <div className="h-32 w-1.5 bg-white/10 rounded-full relative overflow-hidden">
             <motion.div 
               className="absolute bottom-0 left-0 right-0 bg-primary"
               animate={{ height: `${((zoom - (zoomRange?.min ?? 1)) / ((zoomRange?.max ?? 10) - (zoomRange?.min ?? 1))) * 100}%` }}
             />
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => onZoomChange(zoom - 0.5)}
            className="w-10 h-10 rounded-full text-white hover:bg-white/20"
            disabled={zoom <= (zoomRange?.min ?? 1)}
          >
            <span className="text-xl font-bold">-</span>
          </Button>
          
          <span className="text-[10px] text-white/60 font-mono mt-1">{zoom.toFixed(1)}x</span>
        </div>
      )}

      {/* Back Button */}
      <div className="absolute top-8 left-6 z-20">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="icon"
            variant="ghost"
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/10 shadow-lg"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </motion.div>
      </div>

      {/* Status Text */}
      {isScanning && (
        <motion.div
          className="absolute top-8 left-0 right-0 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-primary font-medium backdrop-blur-sm bg-black/30 inline-block px-4 py-2 rounded-full border border-primary/20">
            Position barcode in frame
          </p>
        </motion.div>
      )}

      {/* Floating Action Buttons */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-between items-center px-8">
        {/* Left Side: Files Button */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="lg"
            variant="ghost"
            onClick={onFileSelect}
            className="w-14 h-14 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-lg"
            aria-label="Upload from files"
          >
            <ImageIcon className="w-6 h-6" />
          </Button>
        </motion.div>

        {/* Center: Main Scan Button and Flashlight */}
        <div className="flex items-center gap-4">
          {/* Flashlight Button */}
          {flashlightSupported && (
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="ghost"
                onClick={onToggleFlashlight}
                className="w-14 h-14 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-lg"
                aria-label={`Turn ${isFlashlightOn ? 'off' : 'on'} flashlight`}
              >
                {isFlashlightOn ? (
                  <ZapOff className="w-6 h-6" />
                ) : (
                  <Zap className="w-6 h-6" />
                )}
              </Button>
            </motion.div>
          )}

          {/* Main Scan Button */}
          <motion.div
            animate={!isScanning ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              onClick={isScanning ? onStopScan : onStartScan}
              className={`w-16 h-16 rounded-full shadow-2xl border-4 border-background flex items-center justify-center transition-all ${
                isScanning ? 'bg-primary hover:bg-primary/90' : 'bg-amber-500 hover:bg-amber-600 animate-pulse'
              }`}
              aria-label={isScanning ? 'Freeze frame for steady scan' : 'Resume live scan'}
            >
              {isScanning ? (
                <Pause className="w-8 h-8 font-bold fill-current" />
              ) : (
                <Play className="w-8 h-8 ml-1 fill-current" />
              )}
            </Button>
          </motion.div>
        </div>

        {/* Right Side: Camera Toggle Button */}
        {hasMultipleCameras ? (
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              variant="ghost"
              onClick={onToggleCamera}
              className="w-14 h-14 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-lg"
              aria-label="Switch camera"
            >
              <RotateCw className="w-6 h-6" />
            </Button>
          </motion.div>
        ) : (
          <div className="w-14 h-14" /> /* Empty space for balance */
        )}
      </div>
    </div>
  )
}
