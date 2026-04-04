import { useState, useCallback, useRef } from 'react'

interface UseFlashlightReturn {
  isFlashlightOn: boolean
  toggleFlashlight: () => Promise<void>
  isSupported: boolean
}

export const useFlashlight = (streamRef: React.RefObject<MediaStream | null>): UseFlashlightReturn => {
  const [isFlashlightOn, setIsFlashlightOn] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const trackRef = useRef<MediaStreamTrack | null>(null)

  const toggleFlashlight = useCallback(async () => {
    try {
      const stream = streamRef.current
      if (!stream) return

      const videoTrack = stream.getVideoTracks()[0]
      if (!videoTrack) return

      const capabilities = (videoTrack.getCapabilities?.() || {}) as Record<string, any>
      if (!capabilities.torch) {
        setIsSupported(false)
        return
      }

      setIsSupported(true)
      const newState = !isFlashlightOn

      await videoTrack.applyConstraints({
        advanced: [{ torch: newState } as any],
      })

      trackRef.current = videoTrack
      setIsFlashlightOn(newState)
    } catch {
      setIsFlashlightOn(false)
    }
  }, [streamRef, isFlashlightOn])

  return {
    isFlashlightOn,
    toggleFlashlight,
    isSupported,
  }
}
