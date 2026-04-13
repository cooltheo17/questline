import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import { ThemeProvider } from '../theme/themeContext'
import { AppShell } from '../components/app/AppShell'
import { AppCollectionsProvider } from '../hooks/AppCollectionsContext'
import { initializeCloudSync } from '../data/cloud'

function AppBootstrap() {
  useEffect(() => {
    initializeCloudSync()
  }, [])

  return (
    <AppCollectionsProvider>
      <AppShell />
    </AppCollectionsProvider>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppBootstrap />
      </ThemeProvider>
    </BrowserRouter>
  )
}
