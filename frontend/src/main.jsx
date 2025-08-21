import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// 👇 Ajout Laravel Echo avec gestion d'erreurs
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

// Configuration Echo avec gestion d'erreurs
try {
  window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'local', // ou ta clé dans config/broadcasting.php
    cluster: 'mt1', // seulement si tu utilises Pusher officiel
    wsHost: window.location.hostname,
    wsPort: 6001,
    forceTLS: false,
    disableStats: true,
    // avec authentification :
    // authEndpoint: "/broadcasting/auth",
    // auth: {
    //   headers: {
    //     Authorization: `Bearer ${token}`
    //   }
    // }
  })
} catch (error) {
  console.warn('Echo configuration failed:', error)
  // Fallback: créer un objet Echo vide pour éviter les erreurs
  window.Echo = {
    channel: () => ({
      listen: () => ({ stop: () => {} }),
      subscribe: () => ({ stop: () => {} })
    }),
    private: () => ({
      listen: () => ({ stop: () => {} }),
      subscribe: () => ({ stop: () => {} })
    })
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)
