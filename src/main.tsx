import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AppContextProvider } from './provider/AppContextProvider.tsx'
import ErrorBoundry from './components/ErrorBoudry.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundry fallback={<>Error.</>} >
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </ErrorBoundry>
  </React.StrictMode>,
)
