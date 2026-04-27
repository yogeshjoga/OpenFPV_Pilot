// ================================
// App Root — with theme sync
// ================================

import { useEffect } from 'react'
import AppRouter from '@routes/AppRouter'
import useUIStore from '@store/useUIStore'

export default function App() {
  const theme = useUIStore((s) => s.theme)

  // Sync theme to <html data-theme="..."> for CSS variable switching
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return <AppRouter />
}
