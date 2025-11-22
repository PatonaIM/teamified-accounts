import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { CountryProvider } from './contexts/CountryContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CountryProvider>
        <App />
      </CountryProvider>
    </AuthProvider>
  </StrictMode>,
)
