'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Zap, ZapOff, RotateCw, Pause, Play } from 'lucide-react'
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
  videoRef: React.RefObject<HTMLVideoElement>
  hasMultipleCameras: boolean
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
}: CameraScannerProps) {
  const scannerContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (videoRef.current && isScanning) {
      videoRef.current.play().catch((err) => console.error('Video play error:', err))
    }
  }, [isScanning, videoRef])

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
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        aria-label="Camera preview"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />

      {/* Scanning Frame Animation */}
      {isScanning && (
        <div
          ref={scannerContainerRef}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            className="w-72 h-72 border-2 border-primary rounded-lg"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(102, 169, 255, 0.4)',
                '0 0 0 20px rgba(102, 169, 255, 0)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            aria-label="Scanning indicator"
          >
            {/* Corner marks */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-primary" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-primary" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-primary" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-primary" />

            {/* Scanning line */}
            <motion.div
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-b from-primary/0 via-primary to-primary/0"
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity }}
              aria-hidden="true"
            />
          </motion.div>
        </div>
      )}

      {/* Status Text */}
      {isScanning && (
        <motion.div
          className="absolute top-8 left-0 right-0 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-primary font-medium backdrop-blur-sm bg-black/30 inline-block px-4 py-2 rounded-full">
            Position barcode in frame
          </p>
        </motion.div>
      )}

      {/* Floating Action Buttons */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-4 px-4">
        {/* Flashlight Button */}
        {flashlightSupported && (
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              variant="ghost"
              onClick={onToggleFlashlight}
              className="w-14 h-14 rounded-full bg-secondary/80 hover:bg-secondary text-foreground backdrop-blur-md border border-primary/20 shadow-lg"
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
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="lg"
            onClick={isScanning ? onStopScan : onStartScan}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary text-primary-foreground shadow-xl"
            aria-label={isScanning ? 'Stop scanning' : 'Start scanning'}
          >
            {isScanning ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7 ml-0.5" />
            )}
          </Button>
        </motion.div>

        {/* Camera Toggle Button */}
        {hasMultipleCameras && (
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              variant="ghost"
              onClick={onToggleCamera}
              className="w-14 h-14 rounded-full bg-secondary/80 hover:bg-secondary text-foreground backdrop-blur-md border border-primary/20 shadow-lg"
              aria-label="Switch camera"
            >
              <RotateCw className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
