import type { SyncState } from 'dexie-cloud-addon'
import { db, DEXIE_CLOUD_DATABASE_URL, DEXIE_CLOUD_ENABLED } from './db'
import { useSyncStore } from '../state/syncStore'
import { useUiStore } from '../state/uiStore'

export const SYNC_INTERVAL_MS = 60_000
export const isCloudAvailable = DEXIE_CLOUD_ENABLED
export const cloudDatabaseHost = DEXIE_CLOUD_DATABASE_URL ? new URL(DEXIE_CLOUD_DATABASE_URL).host : ''

let backgroundSyncIntervalId: number | undefined
let hasInitializedCloudSync = false
let lastKnownLoginState = false
let hasConfiguredCloud = false
let activeSyncPromise: Promise<boolean> | null = null
let activeSyncKind: 'manual' | 'background' | null = null
let activeSyncToken: symbol | null = null
let hasShownUnsignedToast = false
let hasShownOfflineToast = false

function pushSyncToast(title: string, description: string): void {
  useUiStore.getState().pushToast({
    title,
    description,
    duration: 5000,
  })
}

function maybeShowUnsignedToast(): void {
  if (hasShownUnsignedToast || typeof window === 'undefined' || !isCloudAvailable) {
    return
  }

  hasShownUnsignedToast = true
  pushSyncToast('Cloud sync is off', 'You are not signed in yet, so syncing will not happen until you sign in on this device.')
}

export function isCloudEnabledForDevice(): boolean {
  return useSyncStore.getState().cloudSyncEnabled
}

function ensureCloudConfigured(): boolean {
  if (!isCloudAvailable) {
    return false
  }

  if (!hasConfiguredCloud) {
    db.cloud.configure({
      databaseUrl: DEXIE_CLOUD_DATABASE_URL,
      requireAuth: false,
      disableEagerSync: true,
      disableWebSocket: true,
    })

    hasConfiguredCloud = true
  }

  return true
}

function stopBackgroundSyncLoop() {
  if (backgroundSyncIntervalId !== undefined) {
    window.clearInterval(backgroundSyncIntervalId)
    backgroundSyncIntervalId = undefined
  }
}

function isLoggedIn(): boolean {
  return Boolean(db.cloud.currentUser.getValue()?.isLoggedIn)
}

function updateBackgroundSyncLoop(): void {
  if (typeof window === 'undefined') {
    return
  }

  stopBackgroundSyncLoop()

  if (!isCloudEnabledForDevice() || !useSyncStore.getState().backgroundSyncEnabled || !isLoggedIn()) {
    return
  }

  backgroundSyncIntervalId = window.setInterval(() => {
    void syncNow()
  }, SYNC_INTERVAL_MS)
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Sync failed.'
}

async function runPullSync(): Promise<void> {
  await db.cloud.sync({ wait: true, purpose: 'pull' })
}

async function runManagedSync(
  kind: 'manual' | 'background',
  runner: () => Promise<void>,
): Promise<boolean> {
  if (!isCloudEnabledForDevice() || !isLoggedIn()) {
    return false
  }

  if (activeSyncPromise) {
    if (kind === 'background') {
      return false
    }

    if (activeSyncKind === 'background') {
      await activeSyncPromise
    } else {
      return false
    }
  }

  const { setError, setLastSyncedAt, setSyncActivity } = useSyncStore.getState()
  setSyncActivity({ isSyncing: true, syncKind: kind })
  setError(undefined)

  const syncToken = Symbol(kind)
  const syncPromise = (async () => {
    try {
      await runner()
      setLastSyncedAt(new Date().toISOString())
      return true
    } catch (error) {
      setError(toErrorMessage(error))
      return false
    } finally {
      if (activeSyncToken === syncToken) {
        activeSyncPromise = null
        activeSyncKind = null
        activeSyncToken = null
        setSyncActivity({ isSyncing: false, syncKind: undefined })
      }
    }
  })()

  activeSyncPromise = syncPromise
  activeSyncKind = kind
  activeSyncToken = syncToken

  return syncPromise
}

async function pullFromCloud(): Promise<boolean> {
  return runManagedSync('background', async () => {
    await runPullSync()
  })
}

export function formatSyncPhase(syncState: SyncState | undefined): string {
  if (!syncState) {
    return 'Not started'
  }

  switch (syncState.phase) {
    case 'initial':
      return 'Ready to sync'
    case 'not-in-sync':
      return 'Changes pending'
    case 'pushing':
      return 'Uploading changes'
    case 'pulling':
      return 'Downloading changes'
    case 'in-sync':
      return 'In sync'
    case 'offline':
      return 'Offline'
    case 'error':
      return 'Sync error'
    default:
      return syncState.phase
  }
}

export async function syncNow(): Promise<boolean> {
  return runManagedSync('manual', async () => {
    await db.cloud.sync({ wait: true, purpose: 'push' })
    await runPullSync()
  })
}

export async function loginToCloud(): Promise<void> {
  if (!ensureCloudConfigured()) {
    return
  }

  useSyncStore.getState().setCloudSyncEnabled(true)
  initializeCloudSync()
  useSyncStore.getState().setError(undefined)
  await db.cloud.login()
  updateBackgroundSyncLoop()
  await syncNow()
}

export async function logoutFromCloud(): Promise<void> {
  if (!isCloudAvailable) {
    return
  }

  useSyncStore.getState().setCloudSyncEnabled(false)
  useSyncStore.getState().setError(undefined)
  useSyncStore.getState().setSyncActivity({ isSyncing: false, syncKind: undefined })
  useSyncStore.getState().setLastSyncedAt(undefined)
  stopBackgroundSyncLoop()

  if (hasConfiguredCloud && isLoggedIn()) {
    await db.cloud.logout()
  }

  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}

export async function setBackgroundSyncEnabled(enabled: boolean): Promise<void> {
  useSyncStore.getState().setBackgroundSyncEnabled(enabled)
  updateBackgroundSyncLoop()

  if (enabled && isCloudEnabledForDevice()) {
    await syncNow()
  }
}

export function initializeCloudSync(): void {
  if (typeof window === 'undefined') {
    return
  }

  if (!isCloudEnabledForDevice()) {
    maybeShowUnsignedToast()
    return
  }

  if (hasInitializedCloudSync) {
    return
  }

  if (!ensureCloudConfigured()) {
    return
  }

  hasInitializedCloudSync = true
  lastKnownLoginState = isLoggedIn()

  if (!lastKnownLoginState) {
    maybeShowUnsignedToast()
  }

  db.cloud.events.syncComplete.subscribe(() => {
    useSyncStore.getState().setLastSyncedAt(new Date().toISOString())
    useSyncStore.getState().setError(undefined)
  })

  db.cloud.currentUser.subscribe((user) => {
    const nextLoginState = Boolean(user?.isLoggedIn)
    updateBackgroundSyncLoop()

    if (nextLoginState && !lastKnownLoginState && useSyncStore.getState().backgroundSyncEnabled) {
      hasShownUnsignedToast = false
      void syncNow()
    }

    if (!nextLoginState && lastKnownLoginState) {
      pushSyncToast('Signed out from cloud', 'You are no longer signed in, so syncing will stay paused until you sign in again.')
    }

    lastKnownLoginState = nextLoginState
  })

  db.cloud.syncState.subscribe((syncState) => {
    if (syncState.phase === 'error' || syncState.status === 'error') {
      useSyncStore.getState().setError(syncState.error ? toErrorMessage(syncState.error) : 'Sync failed.')
    }
  })

  window.addEventListener('online', () => {
    hasShownOfflineToast = false

    if (useSyncStore.getState().backgroundSyncEnabled) {
      void pullFromCloud()
    }
  })

  window.addEventListener('offline', () => {
    if (hasShownOfflineToast) {
      return
    }

    hasShownOfflineToast = true
    pushSyncToast('You are offline', 'Cloud syncing is paused until your internet connection comes back.')
  })

  window.addEventListener('focus', () => {
    if (useSyncStore.getState().backgroundSyncEnabled) {
      void pullFromCloud()
    }
  })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && useSyncStore.getState().backgroundSyncEnabled) {
      void pullFromCloud()
    }
  })

  updateBackgroundSyncLoop()

  if (lastKnownLoginState && useSyncStore.getState().backgroundSyncEnabled) {
    void syncNow()
  }
}
