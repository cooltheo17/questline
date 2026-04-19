import { lazy } from 'react'

const loadRewardsPageModule = () =>
  import('../pages/RewardsPage').then((module) => ({ default: module.RewardsPage }))

const loadManagePageModule = () =>
  import('../pages/ManagePage').then((module) => ({ default: module.ManagePage }))

const loadQuestPageModule = () =>
  import('../pages/QuestPage').then((module) => ({ default: module.QuestPage }))

export const RewardsPageRoute = lazy(loadRewardsPageModule)
export const ManagePageRoute = lazy(loadManagePageModule)
export const QuestPageRoute = lazy(loadQuestPageModule)

export function preloadRewardsPage(): Promise<void> {
  return loadRewardsPageModule().then(() => undefined)
}

export function preloadManagePage(): Promise<void> {
  return loadManagePageModule().then(() => undefined)
}

export function preloadQuestPage(): Promise<void> {
  return loadQuestPageModule().then(() => undefined)
}
