import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'

const Home = lazy(() => import('@pages/Home'))
const Catalog = lazy(() => import('@pages/Catalog'))
const ProductDetail = lazy(() => import('@pages/ProductDetail'))
const About = lazy(() => import('@pages/About'))
const Research = lazy(() => import('@pages/Research'))
const Training = lazy(() => import('@pages/Training'))
const Builder = lazy(() => import('@pages/Builder'))
const Physics = lazy(() => import('@pages/Physics'))
const PhysicsDetail = lazy(() => import('@pages/PhysicsDetail'))
const Shop = lazy(() => import('@pages/Shop'))
const Privacy = lazy(() => import('@pages/Privacy'))
const Enquire = lazy(() => import('@pages/Enquire'))
const Gallery = lazy(() => import('@pages/Gallery'))
const WiringLab = lazy(() => import('@pages/WiringLab'))
const Assembly3D = lazy(() => import('@pages/Assembly3D'))
const IntroToDrones = lazy(() => import('@pages/IntroToDrones'))
const Blog = lazy(() => import('@pages/Blog'))
const PidTuning = lazy(() => import('@pages/PidTuning'))
const Presentation = lazy(() => import('@pages/Presentation'))
const DroneLab = lazy(() => import('@pages/DroneLab'))

const Login = lazy(() => import('@pages/Auth/Login'))
const Unauthorized = lazy(() => import('@pages/Auth/Unauthorized'))
const AdminDashboard = lazy(() => import('@pages/Admin/AdminDashboard'))
const Workshops = lazy(() => import('@pages/Workshops'))

import ProtectedRoute from '@components/auth/ProtectedRoute'
import { useAuthStore } from '@store/useAuthStore'
import { ArrowLeft } from 'lucide-react'


function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// Old addresses keep working: they forward to the tab that now holds that page, keeping any ?query and #share link
function Forward({ to }) {
  const { search, hash } = useLocation()
  return <Navigate to={`${to}${search}${hash}`} replace />
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
        fontSize: 'var(--text-sm)',
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
          <Route path="/gallery/:folder" element={<Gallery />} />
          <Route path="/gallery/:folder/:album" element={<Gallery />} />
          <Route path="/wiring-lab" element={<WiringLab />} />
          <Route path="/wiring-lab/:tab" element={<WiringLab />} />
          <Route path="/simulator" element={<Forward to="/wiring-lab/lessons" />} />
          <Route path="/wiring-builder" element={<Forward to="/wiring-lab/practice" />} />
          <Route path="/assembly-3d" element={<Assembly3D />} />
          <Route path="/intro" element={<IntroToDrones />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/pid-tuning" element={<PidTuning />} />
          <Route path="/presentation" element={<Presentation />} />
          <Route path="/drone-lab" element={<DroneLab />} />
          <Route path="/drone-lab/:tab" element={<DroneLab />} />
          <Route path="/how-a-drone-works" element={<Forward to="/drone-lab/how-it-works" />} />
          <Route path="/drone-configurator" element={<Forward to="/drone-lab/configurator" />} />

          <Route path="/admin" element={
            <ProtectedRoute requiredLevel={4}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/about" element={<About />} />
          <Route path="/research" element={<Research />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/enquire" element={<Enquire />} />
          <Route path="/workshops" element={<Workshops />} />
          <Route
            path="*"
            element={
              <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-5xl)', color: 'var(--color-accent-primary)' }}>404</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>Page not found</p>
                <a href="/" style={{ color: 'var(--color-accent-primary)' }}><ArrowLeft size={16} aria-hidden="true" /> Go Home</a>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
