import type { ChangeEvent, RefObject } from 'react'
import { DatabaseIcon } from '@phosphor-icons/react/dist/csr/Database'
import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/csr/DownloadSimple'
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash'
import { UploadSimpleIcon } from '@phosphor-icons/react/dist/csr/UploadSimple'
import {
  Button,
  Card,
  Checkbox,
} from '../../components/primitives/Primitives'
import sharedStyles from '../../components/app/Shared.module.css'
import { SectionHeading } from '../../components/app/SectionHeading'
import { ManageMetricList, ManageRailCard, ManageTabLayout } from './ManageTabLayout'

interface ManageDataSectionProps {
  tasksCount: number
  categoriesCount: number
  questsCount: number
  rewardsCount: number
  isCloudAvailable: boolean
  cloudDatabaseHost: string
  accountLabel: string
  statusLabel: string
  lastSyncLabel: string
  backgroundSyncLabel: string
  cloudEnabledForDevice: boolean
  backgroundSyncEnabled: boolean
  isSignedInToCloud: boolean
  isSyncNowDisabled: boolean
  syncError?: string
  message: string
  importInputRef: RefObject<HTMLInputElement | null>
  primaryCloudActionLabel: string
  onBackgroundSyncChange: (checked: boolean) => void
  onPrimaryCloudAction: () => void
  onSignOut: () => void
  onSyncNow: () => void
  onImportFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onReset: () => void
  onExport: () => void
}

export function ManageDataSection({
  tasksCount,
  categoriesCount,
  questsCount,
  rewardsCount,
  isCloudAvailable,
  cloudDatabaseHost,
  accountLabel,
  statusLabel,
  lastSyncLabel,
  backgroundSyncLabel,
  cloudEnabledForDevice,
  backgroundSyncEnabled,
  isSignedInToCloud,
  isSyncNowDisabled,
  syncError,
  message,
  importInputRef,
  primaryCloudActionLabel,
  onBackgroundSyncChange,
  onPrimaryCloudAction,
  onSignOut,
  onSyncNow,
  onImportFileChange,
  onReset,
  onExport,
}: ManageDataSectionProps) {
  return (
    <ManageTabLayout
      rail={
        <>
          <ManageRailCard
            title="Snapshot"
            description="Data tools now use the same stable shell as the rest of Manage, so this tab no longer widens or collapses differently."
          >
            <ManageMetricList
              items={[
                { label: 'Tasks', value: tasksCount },
                { label: 'Categories', value: categoriesCount },
                { label: 'Quests', value: questsCount },
                { label: 'Rewards', value: rewardsCount },
              ]}
            />
          </ManageRailCard>

          <ManageRailCard
            title="Sync status"
            description={
              !isCloudAvailable
                ? 'Cloud sync is not configured for this environment.'
                : !cloudEnabledForDevice
                  ? 'This device is still local-only.'
                  : `Last sync ${lastSyncLabel}.`
            }
          >
            <ManageMetricList
              items={[
                { label: 'Account', value: accountLabel },
                { label: 'Mode', value: cloudEnabledForDevice ? 'Cloud enabled' : 'Local-only' },
              ]}
            />
          </ManageRailCard>
        </>
      }
    >
      <Card>
        <div data-slot="section-panel" className={sharedStyles.panel}>
          <SectionHeading
            icon={<DatabaseIcon aria-hidden="true" size={20} weight="duotone" />}
            title="Cloud sync"
          />
          {isCloudAvailable ? (
            <>
              <p data-slot="muted-text" className={sharedStyles.muted}>
                Database: {cloudDatabaseHost}
              </p>
              <p data-slot="muted-text" className={sharedStyles.muted}>
                Account: {accountLabel}
              </p>
              <p data-slot="muted-text" className={sharedStyles.muted}>
                Status: {statusLabel}
              </p>
              <p data-slot="muted-text" className={sharedStyles.muted}>
                Last sync: {lastSyncLabel}
              </p>
              <Checkbox
                checked={backgroundSyncEnabled}
                disabled={!cloudEnabledForDevice}
                onCheckedChange={onBackgroundSyncChange}
                label={backgroundSyncLabel}
              />
              {!cloudEnabledForDevice ? (
                <p data-slot="muted-text" className={sharedStyles.muted}>
                  This device stays fully local until you sign in. No Dexie Cloud sync requests are made before that.
                </p>
              ) : null}
              <div data-slot="action-group" className={sharedStyles.actions}>
                {isSignedInToCloud ? (
                  <Button variant="secondary" onClick={onSignOut}>
                    Sign out
                  </Button>
                ) : (
                  <Button onClick={onPrimaryCloudAction}>{primaryCloudActionLabel}</Button>
                )}
                <Button variant="secondary" disabled={isSyncNowDisabled} onClick={onSyncNow}>
                  Sync now
                </Button>
              </div>
              {syncError ? (
                <p data-slot="muted-text" className={sharedStyles.muted}>
                  {syncError}
                </p>
              ) : null}
            </>
          ) : (
            <p data-slot="muted-text" className={sharedStyles.muted}>
              Set `VITE_DEXIE_CLOUD_DB_URL` to enable cloud sync in this app and on Vercel.
            </p>
          )}
        </div>
      </Card>

      <Card>
        <div data-slot="section-panel" className={sharedStyles.panel}>
          <SectionHeading
            icon={<DatabaseIcon aria-hidden="true" size={20} weight="duotone" />}
            title="Backups and reset"
          />
          <div data-slot="action-group" className={sharedStyles.actions}>
            <Button onClick={onExport}>
              <span className={sharedStyles.inlineLabel}>
                <DownloadSimpleIcon aria-hidden="true" size={16} weight="bold" />
                <span>Export JSON</span>
              </span>
            </Button>
            <Button variant="secondary" onClick={() => importInputRef.current?.click()}>
              <span className={sharedStyles.inlineLabel}>
                <UploadSimpleIcon aria-hidden="true" size={16} weight="bold" />
                <span>Import JSON</span>
              </span>
            </Button>
            <Button variant="secondary" onClick={onReset}>
              <span className={sharedStyles.inlineLabel}>
                <TrashIcon aria-hidden="true" size={16} weight="bold" />
                <span>Reset everything</span>
              </span>
            </Button>
          </div>
          {message ? (
            <p data-slot="muted-text" className={sharedStyles.muted}>
              {message}
            </p>
          ) : null}
          <input
            ref={importInputRef}
            hidden
            type="file"
            accept="application/json"
            onChange={onImportFileChange}
          />
        </div>
      </Card>
    </ManageTabLayout>
  )
}
