import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '../theme/themeContext'
import { AppShell } from '../components/app/AppShell'
import { AppCollectionsProvider } from '../hooks/AppCollectionsContext'

function AppBootstrap() {
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
