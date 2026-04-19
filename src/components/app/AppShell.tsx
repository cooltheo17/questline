import { Suspense, useEffect } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { useTheme } from '../../theme/themeContext'
import { ToastStack } from './ToastStack'
import styles from './AppShell.module.css'
import { TodayPage } from '../../pages/TodayPage'
import { Card } from '../primitives/Primitives'
import {
  ManagePageRoute,
  preloadManagePage,
  preloadQuestPage,
  preloadRewardsPage,
  QuestPageRoute,
  RewardsPageRoute,
} from '../../app/routeLoaders'

function navClassName({ isActive }: { isActive: boolean }): string {
  return [styles.navLink, isActive ? styles.navLinkActive : ''].filter(Boolean).join(' ')
}

function prefetchRoute(loadRoute: () => Promise<void>): void {
  void loadRoute()
}

function RouteLoadingFallback() {
  return <Card>Loading…</Card>
}

export function AppShell() {
  const { theme } = useTheme()

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const warmRoutes = () => {
      prefetchRoute(preloadRewardsPage)
      prefetchRoute(preloadManagePage)
      prefetchRoute(preloadQuestPage)
    }

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(warmRoutes, { timeout: 1500 })
      return () => window.cancelIdleCallback(idleId)
    }

    const timeoutId = globalThis.setTimeout(warmRoutes, 800)
    return () => globalThis.clearTimeout(timeoutId)
  }, [])

  return (
    <div className={styles.app} data-slot="app-shell">
      <div className={styles.container} data-slot="app-shell-container">
        <header className={styles.hero} data-slot="app-shell-header">
          <div className={styles.masthead} data-slot="app-shell-masthead">
            <div className={styles.identity} data-slot="app-shell-identity">
              <h1 className={styles.title} data-slot="app-shell-title">{theme.copy.appTitle}</h1>
            </div>
            <nav className={styles.nav} aria-label="Primary" data-slot="app-shell-nav">
              <NavLink className={navClassName} data-slot="app-shell-nav-link" to="/today">
                Today
              </NavLink>
              <NavLink
                className={navClassName}
                data-slot="app-shell-nav-link"
                to="/rewards"
                onMouseEnter={() => prefetchRoute(preloadRewardsPage)}
                onFocus={() => prefetchRoute(preloadRewardsPage)}
                onTouchStart={() => prefetchRoute(preloadRewardsPage)}
              >
                Rewards
              </NavLink>
              <NavLink
                className={navClassName}
                data-slot="app-shell-nav-link"
                to="/manage"
                onMouseEnter={() => prefetchRoute(preloadManagePage)}
                onFocus={() => prefetchRoute(preloadManagePage)}
                onTouchStart={() => prefetchRoute(preloadManagePage)}
              >
                Manage
              </NavLink>
            </nav>
          </div>
          <div className={styles.heroArt} data-slot="app-shell-art">
            <img src={theme.assets.hero} alt={`${theme.meta.name} illustration`} />
          </div>
        </header>

        <main className={styles.content} data-slot="app-shell-content">
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              <Route path="/" element={<Navigate replace to="/today" />} />
              <Route path="/today" element={<TodayPage />} />
              <Route path="/rewards" element={<RewardsPageRoute />} />
              <Route path="/manage" element={<ManagePageRoute />} />
              <Route path="/quests/:questId" element={<QuestPageRoute />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <ToastStack />
    </div>
  )
}
