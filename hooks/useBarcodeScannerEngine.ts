import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode'

export interface ScanResult {
  text: string
  format: string
  timestamp: Date
}

interface UseBarcodeScannerEngineReturn {
  isScanning: boolean
  scanResult: ScanResult | null
  error: string | null
  startScanning: () => void
  stopScanning: () => void
  setScanResult: (result: ScanResult | null) => void
  setError: (error: string | null) => void
}

export const useBarcodeScannerEngine = (
  elementId: string,
  onScanSuccess?: (result: ScanResult) => void
): UseBarcodeScannerEngineReturn => {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  const startScanning = useCallback(async () => {
    if (isScanning || !document.getElementById(elementId)) return

    try {
      setError(null)
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        formatsToSupport: [
          'QR_CODE',
          'UPC_A',
          'UPC_E',
          'EAN_13',
          'EAN_8',
          'CODE_128',
          'CODE_39',
          'CODABAR',
          'ITF',
          'RSS_14',
          'RSS_EXPANDED',
          'PDF_417',
          'DATAMATRIX',
          'AZTEC',
        ],
      }

      const scanner = new Html5QrcodeScanner(elementId, config, false)

      scanner.render(
        (decodedText) => {
          const result: ScanResult = {
            text: decodedText,
            format: 'UNKNOWN',
            timestamp: new Date(),
          }
          setScanResult(result)
          onScanSuccess?.(result)
        },
        (errorMessage) => {
          if (!error) {
            setError(null)
          }
        }
      )

      scannerRef.current = scanner
      setIsScanning(true)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start scanner'
      setError(errorMsg)
      setIsScanning(false)
    }
  }, [elementId, isScanning, error, onScanSuccess])

  const stopScanning = useCallback(async () => {
    if (!isScanning || !scannerRef.current) return

    try {
      await scannerRef.current.clear()
      scannerRef.current = null
      setIsScanning(false)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to stop scanner'
      setError(errorMsg)
    }
  }, [isScanning])

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
      }
    }
  }, [])

  return {
    isScanning,
    scanResult,
    error,
    startScanning,
    stopScanning,
    setScanResult,
    setError,
  }
}
