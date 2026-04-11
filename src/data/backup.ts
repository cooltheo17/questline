import { db } from './db'
import type { AppSnapshot } from '../domain/types'

export async function exportSnapshot(): Promise<AppSnapshot> {
  const [categories, tasks, quests, completions, rewards, walletTransactions] = await Promise.all([
    db.categories.toArray(),
    db.tasks.toArray(),
    db.quests.toArray(),
    db.completions.toArray(),
    db.rewards.toArray(),
    db.walletTransactions.toArray(),
  ])

  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    categories,
    tasks,
    quests,
    completions,
    rewards,
    walletTransactions,
  }
}

export function parseSnapshot(raw: string): AppSnapshot {
  const snapshot = JSON.parse(raw) as Partial<AppSnapshot> & { version: number }

  if (
    !Array.isArray(snapshot.categories) ||
    !Array.isArray(snapshot.tasks) ||
    !Array.isArray(snapshot.completions) ||
    !Array.isArray(snapshot.rewards) ||
    !Array.isArray(snapshot.walletTransactions)
  ) {
    throw new Error('Backup file is missing required collections.')
  }

  if (snapshot.version === 1) {
    return {
      version: 2,
      exportedAt: snapshot.exportedAt ?? new Date().toISOString(),
      categories: snapshot.categories,
      tasks: snapshot.tasks,
      quests: [],
      completions: snapshot.completions,
      rewards: snapshot.rewards,
      walletTransactions: snapshot.walletTransactions,
    }
  }

  if (snapshot.version === 2) {
    if (!Array.isArray(snapshot.quests)) {
      throw new Error('Backup file is missing quests.')
    }

    return snapshot as AppSnapshot
  }

  throw new Error('Unsupported backup version.')
}
