import { create } from 'zustand'

export interface AppToast {
  id: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  duration?: number
}

interface UiState {
  toasts: AppToast[]
  pushToast: (toast: Omit<AppToast, 'id'>) => void
  dismissToast: (id: string) => void
}

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  pushToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))
