import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './frontend/src'),
      '@midnight-ntwrk/ledger-v8': path.resolve(__dirname, './frontend/node_modules/@midnight-ntwrk/ledger-v8'),
      '@midnight-ntwrk/compact-runtime': path.resolve(__dirname, './frontend/node_modules/@midnight-ntwrk/compact-runtime'),
      '@midnight-ntwrk/onchain-runtime-v3': path.resolve(__dirname, './frontend/node_modules/@midnight-ntwrk/onchain-runtime-v3'),
    }
  }
})
