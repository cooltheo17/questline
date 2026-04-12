/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type PropsWithChildren } from 'react'
import { useAppCollections } from './useAppCollections'

const AppCollectionsContext = createContext<ReturnType<typeof useAppCollections> | null>(null)

export function AppCollectionsProvider({ children }: PropsWithChildren) {
  const collections = useAppCollections()

  return <AppCollectionsContext.Provider value={collections}>{children}</AppCollectionsContext.Provider>
}

export function useAppCollectionsContext() {
  const context = useContext(AppCollectionsContext)

  if (!context) {
    throw new Error('useAppCollectionsContext must be used within AppCollectionsProvider')
  }

  return context
}
