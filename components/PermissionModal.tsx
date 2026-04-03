'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Camera, FileText, X, ShieldAlert } from 'lucide-react'

interface PermissionModalProps {
  isOpen: boolean
  onClose: () => void
  onCameraClick: () => void
  onFileClick: () => void
}

export function PermissionModal({
  isOpen,
  onClose,
  onCameraClick,
  onFileClick,
}: PermissionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-card border border-border/50 rounded-3xl shadow-2xl w-[90%] max-w-sm overflow-hidden"
          >
            {/* Header with Icon */}
            <div className="bg-primary/10 p-8 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">Access Required</h2>
                <p className="text-sm text-muted-foreground px-4">
                  Please provide access to your camera or files to start scanning barcodes.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 grid grid-cols-1 gap-3">
              <Button
                onClick={onCameraClick}
                size="lg"
                className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground gap-3 text-base font-semibold shadow-lg shadow-primary/20"
              >
                <Camera className="w-5 h-5" />
                Access Camera
              </Button>

              <Button
                onClick={onFileClick}
                variant="outline"
                size="lg"
                className="h-14 rounded-2xl border-primary/20 hover:bg-primary/5 gap-3 text-base font-semibold transition-all"
              >
                <FileText className="w-5 h-5 text-primary" />
                Upload from Files
              </Button>

              <Button
                onClick={onClose}
                variant="ghost"
                className="mt-2 text-muted-foreground hover:text-foreground"
              >
                Maybe later
              </Button>
            </div>

            {/* Close Button Trigger */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground/50 hover:text-foreground transition-colors p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
