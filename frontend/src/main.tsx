import { Buffer } from 'buffer'
window.Buffer = window.Buffer || Buffer
if (typeof window.process === 'undefined') {
  window.process = { env: {} } as any
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
