// ================================
// Routes — AppRouter
// ================================

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'

const Home = lazy(() => import('@pages/Home'))
const Catalog = lazy(() => import('@pages/Catalog'))
const ProductDetail = lazy(() => import('@pages/ProductDetail'))
const About = lazy(() => import('@pages/About'))
const Training = lazy(() => import('@pages/Training'))
const Builder = lazy(() => import('@pages/Builder'))
const Physics = lazy(() => import('@pages/Physics'))
const PhysicsDetail = lazy(() => import('@pages/PhysicsDetail'))
const Shop = lazy(() => import('@pages/Shop'))
const Cart = lazy(() => import('@pages/Cart'))

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
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/training" element={<Training />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/physics" element={<Physics />} />
          <Route path="/physics/:sectionId/:topicId" element={<PhysicsDetail />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />
          <Route
            path="*"
            element={
              <div
                style={{
                  minHeight: '100dvh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <h1
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '4rem',
                    color: 'var(--color-accent-primary)',
                  }}
                >
                  404
                </h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>Page not found</p>
                <a href="/" style={{ color: 'var(--color-accent-primary)' }}>
                  ← Go Home
                </a>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
