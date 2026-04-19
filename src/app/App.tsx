import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import { ThemeProvider } from '../theme/themeContext'
import { AppShell } from '../components/app/AppShell'
import { AppCollectionsProvider } from '../hooks/AppCollectionsContext'

function AppBootstrap() {
  useEffect(() => {
    void import('../data/cloud').then(({ initializeCloudSync }) => {
      initializeCloudSync()
    })
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
