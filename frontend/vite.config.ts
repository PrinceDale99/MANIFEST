import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({ 
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  plugins: [
    react(), 
    // @ts-ignore
    wasm(), 
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@midnight-ntwrk/onchain-runtime-v3': path.resolve(__dirname, 'node_modules/@midnight-ntwrk/onchain-runtime-v3/midnight_onchain_runtime_wasm.js'),
      '@midnight-ntwrk/ledger-v8': path.resolve(__dirname, 'node_modules/@midnight-ntwrk/ledger-v8/midnight_ledger_wasm.js'),
    }
  },
  build: {
    target: 'esnext'
  }
})
