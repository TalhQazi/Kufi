import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import { pathToHash } from './utils/seoRoutes.js'

/**
 * Accept clean, crawlable URLs before the app boots.
 *
 * The router is hash-based, so a crawler (or anyone opening a shared/emailed link) that
 * requests `/activity/<id>` would otherwise land on the home page. Translating the path
 * to the equivalent hash here — before React mounts — means public URLs resolve to the
 * right screen while the existing navigation is left untouched.
 *
 * Uses replaceState so the clean URL is not left behind in the history stack.
 */
function adoptCleanPathUrl() {
  const { pathname, search, hash } = window.location
  if (hash) return // already a hash route; nothing to translate
  if (!pathname || pathname === '/') return

  const target = pathToHash(pathname)
  if (!target) return

  window.history.replaceState(window.history.state, '', `/${search || ''}#${target}`)
}

adoptCleanPathUrl()

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
