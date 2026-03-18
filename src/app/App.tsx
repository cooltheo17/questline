import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import { ensureSeedData } from '../data/repository'
import { ThemeProvider } from '../theme/themeContext'
import { AppShell } from '../components/app/AppShell'

function AppBootstrap() {
  useEffect(() => {
    void ensureSeedData()
  }, [])

  return <AppShell />
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
