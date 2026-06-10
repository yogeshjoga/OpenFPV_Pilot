import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'

const Home = lazy(() => import('@pages/Home'))
const Catalog = lazy(() => import('@pages/Catalog'))
const ProductDetail = lazy(() => import('@pages/ProductDetail'))
const About = lazy(() => import('@pages/About'))
const Training = lazy(() => import('@pages/Training'))
const Builder = lazy(() => import('@pages/Builder'))
const Physics = lazy(() => import('@pages/Physics'))
const PhysicsDetail = lazy(() => import('@pages/PhysicsDetail'))
const Shop = lazy(() => import('@pages/Shop'))
const Gallery = lazy(() => import('@pages/Gallery'))
const Simulator = lazy(() => import('@pages/Simulator'))
const Assembly3D = lazy(() => import('@pages/Assembly3D'))
const IntroToDrones = lazy(() => import('@pages/IntroToDrones'))

const Login = lazy(() => import('@pages/Auth/Login'))
const Unauthorized = lazy(() => import('@pages/Auth/Unauthorized'))
const AdminDashboard = lazy(() => import('@pages/Admin/AdminDashboard'))
const Workshops = lazy(() => import('@pages/Workshops'))

import ProtectedRoute from '@components/auth/ProtectedRoute'
import { useAuthStore } from '@store/useAuthStore'


function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function PageLoader() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-primary)',
        fontFamily: 'var(--font-mono)',
        color: 'var(--color-accent-primary)',
        letterSpacing: '0.1em',
        fontSize: '0.875rem',
      }}
    >
      Loading...
    </div>
  )
}

export default function AppRouter() {
  const fetchUser = useAuthStore(state => state.fetchUser)
  const { user } = useAuthStore()

  useEffect(() => {
    fetchUser()
  }, [fetchUser])


  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/training" element={<Training />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/physics" element={<Physics />} />
          <Route path="/physics/:sectionId/:topicId" element={<PhysicsDetail />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/assembly-3d" element={<Assembly3D />} />
          <Route path="/intro" element={<IntroToDrones />} />
          <Route path="/shop" element={<Shop />} />

          <Route path="/admin" element={
            <ProtectedRoute requiredLevel={4}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/about" element={<About />} />
          <Route path="/workshops" element={<Workshops />} />
          <Route
            path="*"
            element={
              <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'var(--color-accent-primary)' }}>404</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>Page not found</p>
                <a href="/" style={{ color: 'var(--color-accent-primary)' }}>← Go Home</a>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
