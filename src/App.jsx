import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useThemeStore from './store/themeStore'
import './styles/global.css'

const LandingPage    = lazy(() => import('./pages/Landing/LandingPage'))
const DashboardPage  = lazy(() => import('./pages/Dashboard/DashboardPage'))

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          width: 10, height: 10, background: '#fff',
          borderRadius: '50%', display: 'block',
        }} />
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Loading Dopra...</p>
    </div>
  )
}

export default function App() {
  const init = useThemeStore(s => s.init)

  useEffect(() => {
    init()
  }, [init])

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/"             element={<LandingPage />} />
          <Route path="/dashboard"    element={<DashboardPage />} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}