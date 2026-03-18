import { db } from './db'
import type { AppSnapshot } from '../domain/types'

export async function exportSnapshot(): Promise<AppSnapshot> {
  const [categories, tasks, completions, rewards, walletTransactions] = await Promise.all([
    db.categories.toArray(),
    db.tasks.toArray(),
    db.completions.toArray(),
    db.rewards.toArray(),
    db.walletTransactions.toArray(),
  ])

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories,
    tasks,
    completions,
    rewards,
    walletTransactions,
  }
}

export function parseSnapshot(raw: string): AppSnapshot {
  const snapshot = JSON.parse(raw) as AppSnapshot

  if (snapshot.version !== 1) {
    throw new Error('Unsupported backup version.')
  }

  if (
    !Array.isArray(snapshot.categories) ||
    !Array.isArray(snapshot.tasks) ||
    !Array.isArray(snapshot.completions) ||
    !Array.isArray(snapshot.rewards) ||
    !Array.isArray(snapshot.walletTransactions)
  ) {
    throw new Error('Backup file is missing required collections.')
  }

  return snapshot
}
