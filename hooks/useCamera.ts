import { useEffect, useRef, useState, useCallback } from 'react'

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>
  isCameraActive: boolean
  isPaused: boolean
  cameraFacingMode: 'user' | 'environment'
  error: string | null
  startCamera: () => Promise<void>
  stopCamera: () => void
  pauseCamera: () => void
  resumeCamera: () => void
  toggleCamera: () => Promise<void>
  hasMultipleCameras: boolean
  zoom: number
  setZoom: (value: number) => void
  zoomRange: { min: number; max: number } | null
}

export const useCamera = (): UseCameraReturn => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment')
  const [error, setError] = useState<string | null>(null)
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)
  const [zoom, setZoomValue] = useState(1)
  const [zoomRange, setZoomRange] = useState<{ min: number; max: number } | null>(null)

  const applyZoom = useCallback(async (value: number) => {
    if (!streamRef.current) return
    const track = streamRef.current.getVideoTracks()[0]
    if (!track) return

    try {
      const capabilities = track.getCapabilities() as any
      if (capabilities.zoom) {
        const min = capabilities.zoom.min || 1
        const max = capabilities.zoom.max || 1
        const zoomValue = Math.max(min, Math.min(max, value))
        await track.applyConstraints({
          advanced: [{ zoom: zoomValue }] as any[],
        })
        setZoomValue(zoomValue)
      } else {
        // Digital zoom fallback
        const zoomValue = Math.max(1, Math.min(5, value))
        if (videoRef.current) {
          videoRef.current.style.transform = `scale(${zoomValue})`
          videoRef.current.style.transformOrigin = 'center'
        }
        setZoomValue(zoomValue)
      }
    } catch (err) {
      console.error('Error applying zoom:', err)
    }
  }, [])

  const setZoom = useCallback((value: number) => {
    applyZoom(value)
  }, [applyZoom])

  const checkMultipleCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === 'videoinput')
      setHasMultipleCameras(videoDevices.length > 1)
    } catch (err) {
      console.error('Error enumerating devices:', err)
    }
  }, [])

  const startCamera = useCallback(async () => {
    try {
      setError(null)

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera access is not supported on this device')
        return
      }

      await checkMultipleCameras()

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCameraActive(true)
        setIsPaused(false)

        // Check for zoom capabilities
        const track = stream.getVideoTracks()[0]
        if (track) {
          const capabilities = track.getCapabilities() as any
          if (capabilities.zoom) {
            setZoomRange({ min: capabilities.zoom.min, max: capabilities.zoom.max })
            setZoomValue(capabilities.zoom.min || 1)
          } else {
            // Fallback for digital zoom
            setZoomRange({ min: 1, max: 5 })
            setZoomValue(1)
          }
        }
      }
    } catch (err) {
      let errorMsg = 'Failed to access camera'
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          errorMsg = 'Camera permission denied'
        } else if (err.name === 'NotFoundError') {
          errorMsg = 'No camera device found'
        }
      }
      setError(errorMsg)
      setIsCameraActive(false)
    }
  }, [cameraFacingMode, checkMultipleCameras])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsCameraActive(false)
    setIsPaused(false)
  }, [])

  const pauseCamera = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
    setIsPaused(true)
  }, [])

  const resumeCamera = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(console.error)
    }
    setIsPaused(false)
  }, [])

  const toggleCamera = useCallback(async () => {
    stopCamera()

    const newFacingMode = cameraFacingMode === 'environment' ? 'user' : 'environment'
    setCameraFacingMode(newFacingMode)

    setTimeout(() => {
      startCamera()
    }, 100)
  }, [cameraFacingMode, stopCamera, startCamera])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return {
    videoRef,
    isCameraActive,
    isPaused,
    cameraFacingMode,
    error,
    startCamera,
    stopCamera,
    pauseCamera,
    resumeCamera,
    toggleCamera,
    hasMultipleCameras,
    zoom,
    setZoom,
    zoomRange,
  }
}
