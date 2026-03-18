import { create } from 'zustand'

export interface CompletionToast {
  id: string
  title: string
  xp: number
  coins: number
}

interface UiState {
  toasts: CompletionToast[]
  pushToast: (toast: Omit<CompletionToast, 'id'>) => void
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
