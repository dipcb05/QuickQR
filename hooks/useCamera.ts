import { useEffect, useRef, useState, useCallback } from 'react'

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>
  isCameraActive: boolean
  cameraFacingMode: 'user' | 'environment'
  error: string | null
  startCamera: () => Promise<void>
  stopCamera: () => void
  toggleCamera: () => Promise<void>
  hasMultipleCameras: boolean
}

export const useCamera = (): UseCameraReturn => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment')
  const [error, setError] = useState<string | null>(null)
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)

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
    cameraFacingMode,
    error,
    startCamera,
    stopCamera,
    toggleCamera,
    hasMultipleCameras,
  }
}
