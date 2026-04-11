import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import { ensureSeedData } from '../data/repository'
import { ThemeProvider } from '../theme/themeContext'
import { AppShell } from '../components/app/AppShell'
import { AppCollectionsProvider } from '../hooks/AppCollectionsContext'

function AppBootstrap() {
  useEffect(() => {
    void ensureSeedData()
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
