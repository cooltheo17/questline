import { useEffect, useRef, useState } from 'react'
import { Toast, ToastViewport } from '../primitives/Primitives'
import { useUiStore } from '../../state/uiStore'

export function ToastStack() {
  const toasts = useUiStore((state) => state.toasts)
  const dismissToast = useUiStore((state) => state.dismissToast)

  return (
    <ToastViewport>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </ToastViewport>
  )
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: { id: string; title: string; xp: number; coins: number }
  onDismiss: (id: string) => void
}) {
  const [open, setOpen] = useState(true)
  const dismissTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (dismissTimeoutRef.current !== null) {
        window.clearTimeout(dismissTimeoutRef.current)
      }
    }
  }, [])

  return (
    <Toast
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)

        if (!nextOpen && dismissTimeoutRef.current === null) {
          dismissTimeoutRef.current = window.setTimeout(() => {
            onDismiss(toast.id)
          }, 240)
        }
      }}
      title={toast.title}
      description={`${toast.xp} XP and ${toast.coins} coins secured.`}
    />
  )
}
