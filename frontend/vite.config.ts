
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'


export default defineConfig({
  plugins: [
    react(), 
    // @ts-ignore
    wasm(), 
    
  ],
  resolve: {
    alias: {
      '@': '/src',
    }
  },
  build: {
    target: 'esnext'
  }
})
