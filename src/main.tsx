import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LoadingProvider } from './contexts/LoadingContext.tsx'
import GlobalSpinner from './components/GlobalSpinner.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoadingProvider>
    <GlobalSpinner />
      <App />
    </LoadingProvider>
  </StrictMode>,
)
