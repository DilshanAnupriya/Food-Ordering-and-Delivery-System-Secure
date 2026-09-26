import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './services/auth/httpAuth' // must run first: attaches JWT to axios + fetch
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
