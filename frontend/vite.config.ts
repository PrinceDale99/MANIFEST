
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'


export default defineConfig({ envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
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
