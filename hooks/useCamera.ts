import { useState, useCallback, useRef, useMemo, useEffect } from 'react'

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>
  startCamera: () => Promise<void>
  stopCamera: () => void
  pauseCamera: () => void
  resumeCamera: () => void
  toggleCamera: () => Promise<void>
  hasMultipleCameras: boolean
  error: string | null
  isCameraActive: boolean
  isPaused: boolean
  zoom: number
  setZoom: (value: number) => void
  zoomRange: { min: number; max: number } | null
  streamRef: React.RefObject<MediaStream | null>
}

export const useCamera = (): UseCameraReturn => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)
  const [zoom, setZoomState] = useState(1)
  const [zoomRange, setZoomRange] = useState<{ min: number; max: number } | null>(null)

  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices()
      .then((devices) => {
        const cameras = devices.filter((d) => d.kind === 'videoinput')
        setHasMultipleCameras(cameras.length > 1)
      })
      .catch(() => {})
  }, [])

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      const track = stream.getVideoTracks()[0]
      const capabilities = (track.getCapabilities?.() || {}) as Record<string, any>
      if (capabilities.zoom) {
        setZoomRange({ min: capabilities.zoom.min, max: capabilities.zoom.max })
        setZoomState(capabilities.zoom.min)
      }

      setIsCameraActive(true)
      setIsPaused(false)
      setError(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Camera access failed'
      if (msg.includes('Permission denied') || msg.includes('NotAllowedError')) {
        setError('Camera permission denied. Please allow camera access in your browser settings.')
      } else {
        setError(msg)
      }
      throw err
    }
  }, [facingMode])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setIsCameraActive(false)
    setIsPaused(false)
  }, [])

  const pauseCamera = useCallback(() => {
    setIsPaused(true)
  }, [])

  const resumeCamera = useCallback(() => {
    setIsPaused(false)
  }, [])

  const toggleCamera = useCallback(async () => {
    setFacingMode((prev) => {
      const next = prev === 'environment' ? 'user' : 'environment'
      return next
    })
    setTimeout(() => {
      startCamera()
    }, 100)
  }, [startCamera])

  const setZoom = useCallback(
    (value: number) => {
      if (!streamRef.current || !zoomRange) return
      const clamped = Math.max(zoomRange.min, Math.min(zoomRange.max, value))
      const track = streamRef.current.getVideoTracks()[0]
      try {
        track.applyConstraints({ advanced: [{ zoom: clamped } as any] })
        setZoomState(clamped)
      } catch { }
    },
    [zoomRange]
  )

  return useMemo(
    () => ({
      videoRef,
      startCamera,
      stopCamera,
      pauseCamera,
      resumeCamera,
      toggleCamera,
      hasMultipleCameras,
      error,
      isCameraActive,
      isPaused,
      zoom,
      setZoom,
      zoomRange,
      streamRef,
    }),
    [
      startCamera, stopCamera, pauseCamera, resumeCamera,
      toggleCamera, hasMultipleCameras, error, isCameraActive,
      isPaused, zoom, setZoom, zoomRange,
    ]
  )
}
