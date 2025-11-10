import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@tauri-apps/api/tauri': path.resolve(__dirname, 'tests/mocks/tauri.ts'),
      '@tauri-apps/api/core': path.resolve(__dirname, 'tests/mocks/tauri.ts'),
      '@tauri-apps/api/event': path.resolve(__dirname, 'tests/mocks/tauri-event.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
})
