import { useEffect, useRef, useState, useCallback } from 'react'
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode'

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
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.RSS_14,
          Html5QrcodeSupportedFormats.RSS_EXPANDED,
          Html5QrcodeSupportedFormats.PDF_417,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
          Html5QrcodeSupportedFormats.AZTEC,
        ],
      }

      const scanner = new Html5QrcodeScanner(elementId, config, false)

      scanner.render(
        (decodedText, result) => {
          const scanResult: ScanResult = {
            text: decodedText,
            format: result.result.format?.formatName || 'UNKNOWN',
            timestamp: new Date(),
          }
          setScanResult(scanResult)
          onScanSuccess?.(scanResult)
        },
        () => {}
      )

      scannerRef.current = scanner
      setIsScanning(true)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start scanner'
      setError(errorMsg)
      setIsScanning(false)
    }
  }, [elementId, isScanning, onScanSuccess])

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
        scannerRef.current.clear().catch(() => {})
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
