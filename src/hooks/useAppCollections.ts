import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../data/db'

export function useAppCollections() {
  const categories = useLiveQuery(() => db.categories.orderBy('sortOrder').toArray(), [])
  const tasks = useLiveQuery(() => db.tasks.orderBy('sortOrder').toArray(), [])
  const completions = useLiveQuery(() => db.completions.toArray(), [])
  const rewards = useLiveQuery(() => db.rewards.orderBy('createdAt').reverse().toArray(), [])
  const walletTransactions = useLiveQuery(() => db.walletTransactions.orderBy('createdAt').reverse().toArray(), [])

  const isReady = Boolean(categories && tasks && completions && rewards && walletTransactions)

  return {
    isReady,
    categories: categories ?? [],
    tasks: tasks ?? [],
    completions: completions ?? [],
    rewards: rewards ?? [],
    walletTransactions: walletTransactions ?? [],
  }
}
