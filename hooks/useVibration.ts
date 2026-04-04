import { useCallback, useState, useEffect } from 'react'

interface UseVibrationReturn {
  isSupported: boolean
  vibrate: (pattern?: number | number[]) => void
}

export const useVibration = (): UseVibrationReturn => {
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported(typeof navigator !== 'undefined' && !!navigator.vibrate)
  }, [])

  const vibrate = useCallback((pattern: number | number[] = 200) => {
    if (isSupported && navigator.vibrate) {
      navigator.vibrate(pattern)
    }
  }, [isSupported])

  return { isSupported, vibrate }
}
