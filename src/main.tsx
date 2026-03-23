import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { PackingProvider } from './context/PackingContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PackingProvider>
      <App />
    </PackingProvider>
  </StrictMode>,
)
