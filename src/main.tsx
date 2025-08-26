import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { LanguageInitializer } from './components/LanguageInitializer.tsx'
import './index.css'
import './lib/i18n' // Import i18n configuration
import App from './App.tsx'

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      <p className="text-white text-lg">Carregant...</p>
    </div>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <LanguageInitializer>
          <App />
        </LanguageInitializer>
      </Suspense>
    </ErrorBoundary>
  </StrictMode>,
)
