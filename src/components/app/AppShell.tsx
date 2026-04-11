import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { useTheme } from '../../theme/themeContext'
import { ToastStack } from './ToastStack'
import styles from './AppShell.module.css'
import { TodayPage } from '../../pages/TodayPage'
import { RewardsPage } from '../../pages/RewardsPage'
import { ManagePage } from '../../pages/ManagePage'
import { QuestPage } from '../../pages/QuestPage'

function navClassName({ isActive }: { isActive: boolean }): string {
  return [styles.navLink, isActive ? styles.navLinkActive : ''].filter(Boolean).join(' ')
}

export function AppShell() {
  const { theme } = useTheme()

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
              <NavLink className={navClassName} data-slot="app-shell-nav-link" to="/rewards">
                Rewards
              </NavLink>
              <NavLink className={navClassName} data-slot="app-shell-nav-link" to="/manage">
                Manage
              </NavLink>
            </nav>
          </div>
          <div className={styles.heroArt} data-slot="app-shell-art">
            <img src={theme.assets.hero} alt={`${theme.meta.name} illustration`} />
          </div>
        </header>

        <main className={styles.content} data-slot="app-shell-content">
          <Routes>
            <Route path="/" element={<Navigate replace to="/today" />} />
            <Route path="/today" element={<TodayPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/manage" element={<ManagePage />} />
            <Route path="/quests/:questId" element={<QuestPage />} />
          </Routes>
        </main>
      </div>
      <ToastStack />
    </div>
  )
}
