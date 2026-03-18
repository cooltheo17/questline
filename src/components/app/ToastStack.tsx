import { Toast, ToastViewport } from '../primitives/Primitives'
import { useUiStore } from '../../state/uiStore'

export function ToastStack() {
  const toasts = useUiStore((state) => state.toasts)
  const dismissToast = useUiStore((state) => state.dismissToast)

  return (
    <ToastViewport>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          open
          onOpenChange={(open) => {
            if (!open) {
              dismissToast(toast.id)
            }
          }}
          title={toast.title}
          description={`${toast.xp} XP and ${toast.coins} coins secured.`}
        />
      ))}
    </ToastViewport>
  )
}
