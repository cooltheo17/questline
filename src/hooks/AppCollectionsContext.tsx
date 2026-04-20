/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type Context, type PropsWithChildren } from 'react'
import type { Category, CompletionRecord, Quest, RewardItem, Task, WalletTransaction } from '../domain/types'
import {
  useCategoriesCollection,
  useCompletionsCollection,
  useQuestsCollection,
  useRewardsCollection,
  useTasksCollection,
  useWalletTransactionsCollection,
} from './useAppCollections'

const AppCollectionsReadyContext = createContext<boolean | null>(null)
const CategoriesCollectionContext = createContext<Category[] | null>(null)
const TasksCollectionContext = createContext<Task[] | null>(null)
const QuestsCollectionContext = createContext<Quest[] | null>(null)
const CompletionsCollectionContext = createContext<CompletionRecord[] | null>(null)
const RewardsCollectionContext = createContext<RewardItem[] | null>(null)
const WalletTransactionsCollectionContext = createContext<WalletTransaction[] | null>(null)

function useRequiredContext<T>(context: Context<T | null>, hookName: string) {
  const value = useContext(context)

  if (value === null) {
    throw new Error(`${hookName} must be used within AppCollectionsProvider`)
  }

  return value
}

export function AppCollectionsProvider({ children }: PropsWithChildren) {
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

  return (
    <AppCollectionsReadyContext.Provider value={isReady}>
      <CategoriesCollectionContext.Provider value={categories.data}>
        <TasksCollectionContext.Provider value={tasks.data}>
          <QuestsCollectionContext.Provider value={quests.data}>
            <CompletionsCollectionContext.Provider value={completions.data}>
              <RewardsCollectionContext.Provider value={rewards.data}>
                <WalletTransactionsCollectionContext.Provider value={walletTransactions.data}>
                  {children}
                </WalletTransactionsCollectionContext.Provider>
              </RewardsCollectionContext.Provider>
            </CompletionsCollectionContext.Provider>
          </QuestsCollectionContext.Provider>
        </TasksCollectionContext.Provider>
      </CategoriesCollectionContext.Provider>
    </AppCollectionsReadyContext.Provider>
  )
}

export function useAppCollectionsReady() {
  return useRequiredContext(AppCollectionsReadyContext, 'useAppCollectionsReady')
}

export function useCategoriesCollectionContext() {
  return useRequiredContext(CategoriesCollectionContext, 'useCategoriesCollectionContext')
}

export function useTasksCollectionContext() {
  return useRequiredContext(TasksCollectionContext, 'useTasksCollectionContext')
}

export function useQuestsCollectionContext() {
  return useRequiredContext(QuestsCollectionContext, 'useQuestsCollectionContext')
}

export function useCompletionsCollectionContext() {
  return useRequiredContext(CompletionsCollectionContext, 'useCompletionsCollectionContext')
}

export function useRewardsCollectionContext() {
  return useRequiredContext(RewardsCollectionContext, 'useRewardsCollectionContext')
}

export function useWalletTransactionsCollectionContext() {
  return useRequiredContext(WalletTransactionsCollectionContext, 'useWalletTransactionsCollectionContext')
}
