import { motion } from 'framer-motion'
import { ShieldCheck, Sparkles, ArrowRight } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import styles from './Login.module.css'

const CRM_LOGIN_URL = import.meta.env.VITE_CRM_LOGIN_URL

export default function Login() {
  const crmConfigured = Boolean(CRM_LOGIN_URL)

  const handleCrmLogin = () => {
    window.location.href = CRM_LOGIN_URL
  }

  return (
    <PageWrapper hideFooter={true}>
      <div className={styles.authContainer}>
        {/* Glow Effects */}
        <div className={styles.ambientGlow1} />
        <div className={styles.ambientGlow2} />

        <div className={`container ${styles.authGrid}`}>
          {/* Left Column: Academy Info/Description */}
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
              Welcome to the premier portal for FPV pilots. Whether you are learning drone basics, tuning PID loops, practicing on realistic physics-based simulators, or customizing quadcopters using our 3D Assembly Builder, our academy gives you the tools to go from zero to your first freestyle or racing flight.
            </p>

            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <div className={styles.featureIconWrapper}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className={styles.featureTitle}>3D Assembly Builder</h4>
                  <p className={styles.featureDesc}>Build and customize your virtual drone with real parts catalog specs.</p>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIconWrapper}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className={styles.featureTitle}>Interactive Simulators</h4>
                  <p className={styles.featureDesc}>Master flight physics and muscle memory before taking to the real skies.</p>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIconWrapper}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className={styles.featureTitle}>Certification Exams</h4>
                  <p className={styles.featureDesc}>Test your knowledge on electronics, battery safety, and flight rules.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Auth Card */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={styles.authCard}
          >
            {/* Logo/Branding Header */}
            <div className={styles.brandingHeader}>
              <div className={styles.logoBadge}>
                <Sparkles size={24} className={styles.logoSparkle} />
              </div>
              <h2 className={styles.brandingTitle}>
                EGIRE<span className="gradient-text">ROBOTICS</span>
              </h2>
              <p className={styles.brandingSubtitle}>
                Sign in through the FPV CRM to access your student account
              </p>
            </div>

            <button
              type="button"
              className={styles.primaryAuthSubmit}
              onClick={handleCrmLogin}
              disabled={!crmConfigured}
            >
              <span>{crmConfigured ? 'Continue to CRM Login' : 'CRM login not configured'}</span>
              <ArrowRight size={18} className={styles.btnArrow} />
            </button>

            {!crmConfigured && (
              <p className={styles.configHint}>
                Set <code>VITE_CRM_LOGIN_URL</code> in your .env file to enable this button.
              </p>
            )}

            {/* Footer terms */}
            <div className={styles.authCardFooter}>
              <ShieldCheck size={14} className={styles.footerShield} />
              <span>Managed by the FPV CRM</span>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  )
}
