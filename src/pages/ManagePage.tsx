import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useObservable } from 'dexie-react-hooks'
import { Tabs, TabPanel } from '../components/primitives/Primitives'
import { exportSnapshot } from '../data/backup'
import {
  SYNC_INTERVAL_MS,
  cloudDatabaseHost,
  enableCloudSyncOnDevice,
  formatSyncPhase,
  isCloudAvailable,
  isCloudEnabledForDevice,
  loginToCloud,
  logoutFromCloud,
  setBackgroundSyncEnabled,
  syncNow,
} from '../data/cloud'
import { db } from '../data/db'
import { importSnapshot } from '../data/repository'
import { useAppCollectionsContext } from '../hooks/AppCollectionsContext'
import { useSyncStore } from '../state/syncStore'
import { useTheme } from '../theme/themeContext'
import type { Quest, RewardItem, Task } from '../domain/types'
import styles from './Page.module.css'
import { ManageAppearanceSection } from './manage/ManageAppearanceSection'
import { ManageCategoriesSection } from './manage/ManageCategoriesSection'
import { ManageDataSection } from './manage/ManageDataSection'
import { ManageQuestsSection } from './manage/ManageQuestsSection'
import { ManageRewardsSection } from './manage/ManageRewardsSection'
import { ManageTasksSection } from './manage/ManageTasksSection'
import { QuestEditorDialog } from './manage/QuestEditorDialog'
import { RewardEditorDialog } from './manage/RewardEditorDialog'
import { TaskEditorDialog } from './manage/TaskEditorDialog'
import {
  createQuestFormState,
  formatDateTimeLabel,
  getBulkImportSummaries,
  toTaskUpdateInput,
} from './manage/managePageUtils'
import { updateTask, resetAllData } from '../data/repository'

export function ManagePage() {
  const { categories, tasks, quests, rewards } = useAppCollectionsContext()
  const { theme, themes, setThemeId } = useTheme()
  const currentUser = useObservable(db.cloud.currentUser)
  const syncState = useObservable(db.cloud.syncState)
  const cloudSyncEnabled = useSyncStore((state) => state.cloudSyncEnabled)
  const backgroundSyncEnabled = useSyncStore((state) => state.backgroundSyncEnabled)
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt)
  const syncKind = useSyncStore((state) => state.syncKind)
  const syncError = useSyncStore((state) => state.error)
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === 'undefined') {
      return 'categories'
    }

    return new URLSearchParams(window.location.search).get('tab') ?? 'categories'
  })
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('slate')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingReward, setEditingReward] = useState<RewardItem | null>(null)
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null)
  const [message, setMessage] = useState('')
  const [newQuest, setNewQuest] = useState(() => createQuestFormState())
  const importInputRef = useRef<HTMLInputElement>(null)
  const scrollPositionRef = useRef(0)
  const hasMountedTabRef = useRef(false)
  const categoryOptions = categories.filter((category) => !category.archived)
  const isSignedInToCloud = Boolean(currentUser?.isLoggedIn)
  const cloudEnabledForDevice = cloudSyncEnabled || isCloudEnabledForDevice()
  const sortedTasks = [...tasks].sort((left, right) => {
    const createdAtComparison = left.createdAt.localeCompare(right.createdAt)

    if (createdAtComparison !== 0) {
      return createdAtComparison
    }

    return left.sortOrder - right.sortOrder
  })
  const bulkImportBatches = getBulkImportSummaries(tasks, quests, categories)
  const cloudStatusLabel = !cloudEnabledForDevice
    ? 'Local-only mode'
    : syncKind === 'manual'
      ? 'Manual sync in progress'
      : syncKind === 'background'
        ? 'Refreshing from cloud'
        : formatSyncPhase(syncState)
  const lastSyncLabel = cloudEnabledForDevice
    ? formatDateTimeLabel(lastSyncedAt, 'Never')
    : 'Cloud sync not enabled on this device'
  const accountLabel = isSignedInToCloud
    ? currentUser?.email ?? currentUser?.userId ?? 'Signed in'
    : 'Not signed in'

  useEffect(() => {
    if (!hasMountedTabRef.current) {
      hasMountedTabRef.current = true
      return
    }

    const frame = window.requestAnimationFrame(() => {
      try {
        window.scrollTo({ top: scrollPositionRef.current })
      } catch {
        // jsdom does not implement scrolling
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [activeTab])

  async function handleExport() {
    const snapshot = await exportSnapshot()
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `questline-backup-${snapshot.exportedAt.slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    setMessage('Backup exported.')
  }

  function retireTask(task: Task) {
    return updateTask({
      ...toTaskUpdateInput(task),
      active: false,
    })
  }

  function handleImportFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    void file.text().then(importSnapshot).then(() => setMessage('Backup imported.'))
  }

  function handlePrimaryCloudAction() {
    if (!cloudEnabledForDevice) {
      enableCloudSyncOnDevice()
      return
    }

    void loginToCloud()
      .then(() => setMessage('Signed in and synced with Dexie Cloud.'))
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : 'Could not sign in to Dexie Cloud.')
      })
  }

  function handleSignOut() {
    void logoutFromCloud()
      .then(() => setMessage('Signed out from Dexie Cloud.'))
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : 'Could not sign out from Dexie Cloud.')
      })
  }

  function handleSyncNow() {
    void syncNow().then((didSync) => {
      if (didSync) {
        setMessage('Cloud sync complete.')
      }
    })
  }

  function handleReset() {
    if (window.confirm('Reset all local data? This cannot be undone.')) {
      void resetAllData().then(() => setMessage('All local data reset.'))
    }
  }

  return (
    <div data-slot="page" className={styles.page}>
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          scrollPositionRef.current = window.scrollY
          setActiveTab(value)
        }}
        items={[
          { label: 'Categories', value: 'categories' },
          { label: 'Tasks', value: 'tasks' },
          { label: 'Quests', value: 'quests' },
          { label: 'Rewards', value: 'rewards' },
          { label: 'Appearance', value: 'appearance' },
          { label: 'Data', value: 'data' },
        ]}
      >
        <TabPanel value="categories">
          <ManageCategoriesSection
            categories={categories}
            newCategoryName={newCategoryName}
            newCategoryColor={newCategoryColor}
            onNewCategoryNameChange={setNewCategoryName}
            onNewCategoryColorChange={setNewCategoryColor}
          />
        </TabPanel>

        <TabPanel value="tasks">
          <ManageTasksSection
            bulkImportBatches={bulkImportBatches}
            sortedTasks={sortedTasks}
            onEditTask={setEditingTask}
            onRetireTask={(task) => void retireTask(task)}
          />
        </TabPanel>

        <TabPanel value="quests">
          <ManageQuestsSection
            quests={quests}
            newQuest={newQuest}
            onNewQuestChange={setNewQuest}
            onEditQuest={setEditingQuest}
          />
        </TabPanel>

        <TabPanel value="rewards">
          <ManageRewardsSection rewards={rewards} onEditReward={setEditingReward} />
        </TabPanel>

        <TabPanel value="appearance">
          <ManageAppearanceSection theme={theme} themes={themes} onSelectTheme={setThemeId} />
        </TabPanel>

        <TabPanel value="data">
          <ManageDataSection
            tasksCount={tasks.length}
            categoriesCount={categories.length}
            questsCount={quests.length}
            rewardsCount={rewards.length}
            isCloudAvailable={isCloudAvailable}
            cloudDatabaseHost={cloudDatabaseHost}
            accountLabel={accountLabel}
            statusLabel={cloudStatusLabel}
            lastSyncLabel={lastSyncLabel}
            backgroundSyncLabel={`Background sync every ${Math.round(SYNC_INTERVAL_MS / 1000)} seconds`}
            cloudEnabledForDevice={cloudEnabledForDevice}
            backgroundSyncEnabled={backgroundSyncEnabled}
            isSignedInToCloud={isSignedInToCloud}
            isSyncNowDisabled={!cloudEnabledForDevice || !isSignedInToCloud || syncKind === 'manual'}
            syncError={syncError}
            message={message}
            importInputRef={importInputRef}
            primaryCloudActionLabel={cloudEnabledForDevice ? 'Sign in' : 'Enable cloud sync'}
            onBackgroundSyncChange={(checked) => {
              void setBackgroundSyncEnabled(checked)
            }}
            onPrimaryCloudAction={handlePrimaryCloudAction}
            onSignOut={handleSignOut}
            onSyncNow={handleSyncNow}
            onImportFileChange={handleImportFileChange}
            onReset={handleReset}
            onExport={() => void handleExport()}
          />
        </TabPanel>
      </Tabs>

      <TaskEditorDialog
        task={editingTask}
        categories={categoryOptions}
        quests={quests}
        onClose={() => setEditingTask(null)}
      />
      <RewardEditorDialog reward={editingReward} onClose={() => setEditingReward(null)} />
      <QuestEditorDialog quest={editingQuest} onClose={() => setEditingQuest(null)} />
    </div>
  )
}
