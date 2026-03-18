import { lazy, Suspense } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { useTheme } from '../../theme/themeContext'
import { ToastStack } from './ToastStack'
import styles from './AppShell.module.css'

const TodayPage = lazy(() => import('../../pages/TodayPage').then((module) => ({ default: module.TodayPage })))
const RewardsPage = lazy(() =>
  import('../../pages/RewardsPage').then((module) => ({ default: module.RewardsPage }))
)
const ManagePage = lazy(() =>
  import('../../pages/ManagePage').then((module) => ({ default: module.ManagePage }))
)

function navClassName({ isActive }: { isActive: boolean }): string {
  return [styles.navLink, isActive ? styles.navLinkActive : ''].filter(Boolean).join(' ')
}

export function AppShell() {
  const { theme } = useTheme()

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <header className={styles.hero}>
          <div className={styles.masthead}>
            <div>
              <h1 className={styles.title}>{theme.copy.appTitle}</h1>
            </div>
            <nav className={styles.nav} aria-label="Primary">
              <NavLink className={navClassName} to="/today">
                Today
              </NavLink>
              <NavLink className={navClassName} to="/rewards">
                Rewards
              </NavLink>
              <NavLink className={navClassName} to="/manage">
                Manage
              </NavLink>
            </nav>
          </div>
          <div className={styles.heroArt}>
            <img src={theme.assets.hero} alt={`${theme.meta.name} illustration`} />
          </div>
        </header>

        <main className={styles.content}>
          <Suspense fallback={<div className={styles.masthead}>Loading…</div>}>
            <Routes>
              <Route path="/" element={<Navigate replace to="/today" />} />
              <Route path="/today" element={<TodayPage />} />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/manage" element={<ManagePage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <ToastStack />
    </div>
  )
}
