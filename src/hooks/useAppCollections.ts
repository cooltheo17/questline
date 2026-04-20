import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../data/db'

export interface CollectionState<T> {
  data: T[]
  isReady: boolean
}

function toCollectionState<T>(value: T[] | undefined): CollectionState<T> {
  return {
    data: value ?? [],
    isReady: value !== undefined,
  }
}

export function useCategoriesCollection() {
  return toCollectionState(useLiveQuery(() => db.categories.orderBy('sortOrder').toArray(), [], undefined))
}

export function useTasksCollection() {
  return toCollectionState(useLiveQuery(() => db.tasks.orderBy('sortOrder').toArray(), [], undefined))
}

export function useQuestsCollection() {
  return toCollectionState(useLiveQuery(() => db.quests.orderBy('sortOrder').toArray(), [], undefined))
}

export function useCompletionsCollection() {
  return toCollectionState(useLiveQuery(() => db.completions.toArray(), [], undefined))
}

export function useRewardsCollection() {
  return toCollectionState(useLiveQuery(() => db.rewards.orderBy('createdAt').reverse().toArray(), [], undefined))
}

export function useWalletTransactionsCollection() {
  return toCollectionState(
    useLiveQuery(() => db.walletTransactions.orderBy('createdAt').reverse().toArray(), [], undefined),
  )
}

export function useAppCollections() {
  const categories = useCategoriesCollection()
  const tasks = useTasksCollection()
  const quests = useQuestsCollection()
  const completions = useCompletionsCollection()
  const rewards = useRewardsCollection()
  const walletTransactions = useWalletTransactionsCollection()

  const isReady =
    categories.isReady &&
    tasks.isReady &&
    quests.isReady &&
    completions.isReady &&
    rewards.isReady &&
    walletTransactions.isReady

  return {
    isReady,
    categories: categories.data,
    tasks: tasks.data,
    quests: quests.data,
    completions: completions.data,
    rewards: rewards.data,
    walletTransactions: walletTransactions.data,
  }
}
