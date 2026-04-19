import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return
          }

          if (id.includes('@phosphor-icons/react')) {
            return 'icons'
          }

          if (id.includes('react-router-dom') || id.includes('/react-dom/') || id.includes('/react/')) {
            return 'react-vendor'
          }

          if (
            id.includes('/dexie/') ||
            id.includes('/dexie-react-hooks/') ||
            id.includes('/dexie-cloud-addon/') ||
            id.includes('/zustand/')
          ) {
            return 'data-vendor'
          }

          if (id.includes('/framer-motion/') || id.includes('/@radix-ui/')) {
            return 'ui-vendor'
          }
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})
