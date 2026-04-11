/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react'
import { getThemeById, themes } from './themeRegistry'
import type { AppTheme } from './types'

const THEME_STORAGE_KEY = 'questline-theme'
const THEME_STYLE_ELEMENT_ID = 'questline-theme-styles'

interface ThemeContextValue {
  theme: AppTheme
  themes: AppTheme[]
  setThemeId: (themeId: string) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function toCssToken(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

function applyTheme(theme: AppTheme): void {
  const root = document.documentElement
  root.style.colorScheme = theme.meta.colorScheme
  root.dataset.theme = theme.id

  for (const [key, value] of Object.entries(theme.primitives.color)) {
    root.style.setProperty(`--theme-color-${toCssToken(key)}`, value)
  }

  root.style.setProperty('--theme-font-body', theme.primitives.font.body)
  root.style.setProperty('--theme-font-display', theme.primitives.font.display)
  root.style.setProperty('--theme-font-mono', theme.primitives.font.mono)

  for (const [key, value] of Object.entries(theme.primitives.radius)) {
    root.style.setProperty(`--theme-radius-${toCssToken(key)}`, value)
  }

  for (const [key, value] of Object.entries(theme.primitives.shadow)) {
    root.style.setProperty(`--theme-shadow-${toCssToken(key)}`, value)
  }

  for (const [key, value] of Object.entries(theme.primitives.spacingScale)) {
    root.style.setProperty(`--theme-space-${toCssToken(key)}`, value)
  }

  for (const [key, value] of Object.entries(theme.primitives.motion)) {
    root.style.setProperty(`--theme-motion-${toCssToken(key)}`, value)
  }

  for (const [key, value] of Object.entries(theme.semantic)) {
    root.style.setProperty(`--theme-semantic-${toCssToken(key)}`, value)
  }

  for (const [group, tokens] of Object.entries(theme.components)) {
    for (const [key, value] of Object.entries(tokens)) {
      root.style.setProperty(`--theme-${toCssToken(group)}-${toCssToken(key)}`, value)
    }
  }

  const existingStyleElement = document.getElementById(THEME_STYLE_ELEMENT_ID)
  if (theme.styles?.trim()) {
    const styleElement = existingStyleElement ?? document.createElement('style')
    styleElement.id = THEME_STYLE_ELEMENT_ID
    styleElement.textContent = theme.styles

    if (!existingStyleElement) {
      document.head.appendChild(styleElement)
    }
  } else if (existingStyleElement) {
    existingStyleElement.remove()
  }
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [themeId, setThemeId] = useState(() => localStorage.getItem(THEME_STORAGE_KEY) ?? themes[0].id)
  const theme = getThemeById(themeId)

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme.id)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, themes, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }

  return context
}
