
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

// Vercel Web Analytics: cookie-free page views. Loaded in production only, and records nothing until it is
// switched on in the Vercel project settings.
if (import.meta.env.PROD) {
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments) }
  const analytics = document.createElement('script')
  analytics.defer = true
  analytics.src = '/_vercel/insights/script.js'
  document.head.appendChild(analytics)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
