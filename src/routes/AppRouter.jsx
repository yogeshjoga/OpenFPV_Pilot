import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
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
const FpvPiloting = lazy(() => import('@pages/FpvPiloting'))
const DroneHardware = lazy(() => import('@pages/DroneHardware'))
const Presentation = lazy(() => import('@pages/Presentation'))
const DroneLab = lazy(() => import('@pages/DroneLab'))

/** The guides are now blog posts; old links keep working. */
function GuideRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/blog/${slug}`} replace />
}

const Login = lazy(() => import('@pages/Auth/Login'))
const AuthCallback = lazy(() => import('@pages/Auth/AuthCallback'))
const Unauthorized = lazy(() => import('@pages/Auth/Unauthorized'))
const AdminDashboard = lazy(() => import('@pages/Admin/AdminDashboard'))
const Workshops = lazy(() => import('@pages/Workshops'))

import ProtectedRoute from '@components/auth/ProtectedRoute'
import RequireMember from '@components/auth/RequireMember'
import { useAuthStore } from '@store/useAuthStore'
import { startAnalytics, trackPage } from '@lib/analytics'
import { ArrowLeft } from 'lucide-react'


function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// Counts the visit and each page after it. Nothing is stored in the browser and nothing is sent when Do Not Track is on.
function PageTracker() {
  const { pathname } = useLocation()
  useEffect(() => {
    startAnalytics()
    trackPage(pathname)
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

  // the sign-in client loads after the first screen, so it never slows the home page down
  useEffect(() => {
    const idle = window.requestIdleCallback ? window.requestIdleCallback(() => fetchUser()) : setTimeout(fetchUser, 600)
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(idle) : clearTimeout(idle))
  }, [fetchUser])


  return (
    <BrowserRouter>
      <ScrollToTop />
      <PageTracker />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<RequireMember gate="catalog"><Catalog /></RequireMember>} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/training" element={<RequireMember gate="training"><Training /></RequireMember>} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/physics" element={<RequireMember gate="physics"><Physics /></RequireMember>} />
          <Route path="/physics/:sectionId/:topicId" element={<RequireMember gate="physics"><PhysicsDetail /></RequireMember>} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery/:folder" element={<Gallery />} />
          <Route path="/gallery/:folder/:album" element={<Gallery />} />
          <Route path="/wiring-lab" element={<RequireMember gate="wiringLab"><WiringLab /></RequireMember>} />
          <Route path="/wiring-lab/:tab" element={<RequireMember gate="wiringLab"><WiringLab /></RequireMember>} />
          <Route path="/simulator" element={<Forward to="/wiring-lab/lessons" />} />
          <Route path="/wiring-builder" element={<Forward to="/wiring-lab/practice" />} />
          <Route path="/assembly-3d" element={<RequireMember gate="assembly"><Assembly3D /></RequireMember>} />
          <Route path="/intro" element={<RequireMember gate="intro"><IntroToDrones /></RequireMember>} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<Blog />} />
          <Route path="/pid-tuning" element={<RequireMember gate="pid"><PidTuning /></RequireMember>} />
          <Route path="/fpv-piloting" element={<RequireMember gate="piloting"><FpvPiloting /></RequireMember>} />
          <Route path="/drone-hardware" element={<RequireMember gate="hardware"><DroneHardware /></RequireMember>} />
          <Route path="/presentation" element={<Presentation />} />
          <Route path="/drone-lab" element={<RequireMember gate="droneLab"><DroneLab /></RequireMember>} />
          <Route path="/drone-lab/:tab" element={<RequireMember gate="droneLab"><DroneLab /></RequireMember>} />
          <Route path="/how-a-drone-works" element={<Forward to="/drone-lab/how-it-works" />} />
          <Route path="/drone-configurator" element={<Forward to="/drone-lab/configurator" />} />

          <Route path="/admin" element={
            <ProtectedRoute requiredLevel={4}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/about" element={<About />} />
          <Route path="/research" element={<Research />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/guides" element={<Navigate to="/blog" replace />} />
          <Route path="/guides/:slug" element={<GuideRedirect />} />
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
