import { create } from 'zustand'

const BACKGROUND_SYNC_STORAGE_KEY = 'questline-background-sync-enabled'
const CLOUD_SYNC_ENABLED_STORAGE_KEY = 'questline-cloud-sync-enabled'
const LAST_SYNC_AT_STORAGE_KEY = 'questline-last-sync-at'

function readBooleanStorage(key: string, fallback: boolean): boolean {
  if (typeof window === 'undefined') {
    return fallback
  }

  const value = window.localStorage.getItem(key)

  if (value === null) {
    return fallback
  }

  return value === 'true'
}

function readStringStorage(key: string): string | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  return window.localStorage.getItem(key) ?? undefined
}

function writeStorage(key: string, value: string | undefined): void {
  if (typeof window === 'undefined') {
    return
  }

  if (value === undefined) {
    window.localStorage.removeItem(key)
    return
  }

  window.localStorage.setItem(key, value)
}

interface SyncStateStore {
  cloudSyncEnabled: boolean
  backgroundSyncEnabled: boolean
  lastSyncedAt?: string
  isSyncing: boolean
  syncKind?: 'manual' | 'background'
  error?: string
  setCloudSyncEnabled: (enabled: boolean) => void
  setBackgroundSyncEnabled: (enabled: boolean) => void
  setLastSyncedAt: (value: string | undefined) => void
  setSyncActivity: (value: { isSyncing: boolean; syncKind?: 'manual' | 'background' }) => void
  setError: (value: string | undefined) => void
}

export const useSyncStore = create<SyncStateStore>((set) => ({
  cloudSyncEnabled: readBooleanStorage(CLOUD_SYNC_ENABLED_STORAGE_KEY, false),
  backgroundSyncEnabled: readBooleanStorage(BACKGROUND_SYNC_STORAGE_KEY, true),
  lastSyncedAt: readStringStorage(LAST_SYNC_AT_STORAGE_KEY),
  isSyncing: false,
  syncKind: undefined,
  error: undefined,
  setCloudSyncEnabled: (enabled) => {
    writeStorage(CLOUD_SYNC_ENABLED_STORAGE_KEY, String(enabled))
    set({ cloudSyncEnabled: enabled })
  },
  setBackgroundSyncEnabled: (enabled) => {
    writeStorage(BACKGROUND_SYNC_STORAGE_KEY, String(enabled))
    set({ backgroundSyncEnabled: enabled })
  },
  setLastSyncedAt: (value) => {
    writeStorage(LAST_SYNC_AT_STORAGE_KEY, value)
    set({ lastSyncedAt: value })
  },
  setSyncActivity: ({ isSyncing, syncKind }) => set({ isSyncing, syncKind }),
  setError: (value) => set({ error: value }),
}))
