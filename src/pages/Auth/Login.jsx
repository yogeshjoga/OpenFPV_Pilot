import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Box, Gamepad2, ClipboardCheck } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import MemberAuthCard from '@components/auth/MemberAuthCard'
import useDocumentMeta from '@lib/useDocumentMeta'
import { useAuthStore } from '@store/useAuthStore'
import styles from './Login.module.css'

// Only addresses inside this site are accepted as the place to go next
const safeNext = (value) => (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/')

export default function Login() {
  useDocumentMeta('Sign in | EGIRE Robotics', 'Sign in or register for free to open the EGIRE Robotics Academy: lessons, labs and simulations for FPV drones.')
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const init = useAuthStore((s) => s.init)
  const next = safeNext(params.get('next') || location.state?.from?.pathname)
  const done = useCallback(() => navigate(next, { replace: true }), [navigate, next])
  useEffect(() => { void init() }, [init])

  return (
    <PageWrapper hideFooter={true}>
      <div className={styles.authContainer}>
        <div className={styles.ambientGlow1} />
        <div className={styles.ambientGlow2} />

        <div className={`container ${styles.authGrid}`}>
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={styles.descriptionColumn}
          >
            <div className={styles.tagBadge}>FPV FLIGHT ACADEMY</div>
            <h1 className={styles.infoTitle}>
              Fly Beyond Limits with <br />
              <span className="gradient-text">EGIRE ROBOTICS</span>
            </h1>
            <p className={styles.infoText}>
              Register for free and the whole Academy opens: lessons on how a drone works, physics, FPV piloting, PID tuning, labs and simulators. Sign in with Google or with a short code we email you.
            </p>

            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <div className={styles.featureIconWrapper}><Box size={18} /></div>
                <div>
                  <h4 className={styles.featureTitle}>3D lessons and labs</h4>
                  <p className={styles.featureDesc}>Frames, motors, radio and flight physics, taught with live 3D animations.</p>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIconWrapper}><Gamepad2 size={18} /></div>
                <div>
                  <h4 className={styles.featureTitle}>Interactive simulators</h4>
                  <p className={styles.featureDesc}>Master flight and muscle memory before taking to the real skies.</p>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIconWrapper}><ClipboardCheck size={18} /></div>
                <div>
                  <h4 className={styles.featureTitle}>Workshops and groups</h4>
                  <p className={styles.featureDesc}>Tell us your college and workshop so your trainers can find you.</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <MemberAuthCard next={next} onSignedIn={done} />
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  )
}
