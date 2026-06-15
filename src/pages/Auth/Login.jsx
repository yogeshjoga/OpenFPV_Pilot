import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import styles from './Login.module.css'

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const navigate = useNavigate()

  const handleGoogleLogin = () => {
    // Simply route to Google OAuth flow
    window.location.href = '/api/auth/google'
  }

  const handleLocalSubmit = (e) => {
    e.preventDefault()
    // Mock successful navigation to represent flow completion without backend checks
    navigate('/')
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
                {isSignUp ? 'Join the next generation of FPV pilots' : 'Sign in to access your flight academy'}
              </p>
            </div>

            {/* Switch Tabs */}
            <div className={styles.tabGroup}>
              <button 
                type="button"
                className={`${styles.tabBtn} ${!isSignUp ? styles.activeTab : ''}`}
                onClick={() => setIsSignUp(false)}
              >
                Sign In
              </button>
              <button 
                type="button"
                className={`${styles.tabBtn} ${isSignUp ? styles.activeTab : ''}`}
                onClick={() => setIsSignUp(true)}
              >
                Create Account
              </button>
            </div>

            {/* OAuth Google Button (Highlighted) */}
            <div className={styles.oauthSection}>
              <button className={styles.googleOAuthBtn} onClick={handleGoogleLogin}>
                <svg className={styles.googleIcon} viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.99 5.99 0 0 1 8 12.5a5.99 5.99 0 0 1 5.99-6.002c1.478 0 2.822.54 3.86 1.428l3.14-3.14A10.024 10.024 0 0 0 13.99 2 9.99 9.99 0 0 0 4 12c0 5.52 4.48 10 9.99 10 5.768 0 9.61-4.053 9.61-9.771 0-.66-.06-1.296-.17-1.944H12.24Z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <div className={styles.dividerBlock}>
              <span className={styles.dividerText}>or use email</span>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleLocalSubmit} className={styles.formFlow}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSignUp ? 'signup-fields' : 'login-fields'}
                  initial={{ opacity: 0, x: isSignUp ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isSignUp ? -10 : 10 }}
                  transition={{ duration: 0.2 }}
                  className={styles.fieldsContainer}
                >
                  {isSignUp && (
                    <div className={styles.inputGroup}>
                      <label htmlFor="auth-name" className={styles.inputLabel}>Full Name</label>
                      <div className={styles.inputWrapper}>
                        <User size={18} className={styles.fieldIcon} />
                        <input 
                          id="auth-name"
                          type="text" 
                          placeholder="Yogesh Joga" 
                          className={styles.styledInput}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className={styles.inputGroup}>
                    <label htmlFor="auth-email" className={styles.inputLabel}>Email Address</label>
                    <div className={styles.inputWrapper}>
                      <Mail size={18} className={styles.fieldIcon} />
                      <input 
                        id="auth-email"
                        type="email" 
                        placeholder="pilot@egirerobotics.com" 
                        className={styles.styledInput}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <div className={styles.labelRow}>
                      <label htmlFor="auth-password" className={styles.inputLabel}>Password</label>
                      {!isSignUp && (
                        <button type="button" className={styles.forgotLink}>
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className={styles.inputWrapper}>
                      <Lock size={18} className={styles.fieldIcon} />
                      <input 
                        id="auth-password"
                        type="password" 
                        placeholder="••••••••" 
                        className={styles.styledInput}
                        required
                      />
                    </div>
                  </div>

                  {isSignUp && (
                    <div className={styles.checkboxWrapper}>
                      <input 
                        id="auth-agree"
                        type="checkbox" 
                        className={styles.styledCheckbox}
                        required
                      />
                      <label htmlFor="auth-agree" className={styles.checkboxLabel}>
                        I agree to the Terms of Service & Privacy Policy
                      </label>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <button type="submit" className={styles.primaryAuthSubmit}>
                <span>{isSignUp ? 'Create Account' : 'Sign In Now'}</span>
                <ArrowRight size={18} className={styles.btnArrow} />
              </button>
            </form>

            {/* Footer terms */}
            <div className={styles.authCardFooter}>
              <ShieldCheck size={14} className={styles.footerShield} />
              <span>Secure, encrypted authentication</span>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  )
}
