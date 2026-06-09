
import { motion } from 'framer-motion'
import PageWrapper from '@components/layout/PageWrapper'
import styles from './Login.module.css'

import { useAuthStore } from '@store/useAuthStore'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const login = useAuthStore(state => state.login)
  const navigate = useNavigate()

  const handleLocalLogin = async (e) => {
    e.preventDefault()
    const email = e.target.email.value
    const password = e.target.password.value
    const success = await login(email, password)
    if (success) navigate('/shop')
    else alert('Login failed. Please check your credentials.')
  }

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google'
  }

  const handleGithubLogin = () => {
    window.location.href = '/api/auth/github'
  }

  return (
    <PageWrapper>
      <div className={styles.loginPage}>
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.loginCard}
          >
            <div className={styles.header}>
              <span className={styles.logoIcon}>✦</span>
              <h1>Welcome to <span className="gradient-text">EgireRobatics</span></h1>
              <p>Sign in to access your academy courses and saved cart.</p>
            </div>

            {/* Mock Credentials Alert */}
            <div className={styles.mockAlert}>
              <h3>🛠 Testing Credentials</h3>
              <ul>
                <li><strong>Admin</strong>: admin@fpv.com / admin123</li>
                <li><strong>Power User</strong>: power@fpv.com / power123</li>
                <li><strong>Student</strong>: student@fpv.com / student123</li>
                <li><strong>Buyer</strong>: buyer@fpv.com / buyer123</li>
              </ul>
            </div>

            <form className={styles.localForm} onSubmit={handleLocalLogin}>
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input type="email" name="email" required placeholder="pilot@egirerobatics.com" />
              </div>
              <div className={styles.formGroup}>
                <label>Password</label>
                <input type="password" name="password" required placeholder="••••••••" />
              </div>
              <button type="submit" className={styles.submitBtn}>Login Now</button>
            </form>

            <div className={styles.divider}>
              <span>OR</span>
            </div>

            <div className={styles.authButtons}>
              <button className={styles.googleBtn} onClick={handleGoogleLogin}>
                <img src="https://www.google.com/favicon.ico" alt="Google" />
                Continue with Google
              </button>
              
              <button className={styles.githubBtn} onClick={handleGithubLogin}>
                <img src="https://github.com/favicon.ico" alt="GitHub" />
                Continue with GitHub
              </button>

              <button className={styles.instagramBtn} disabled title="Coming soon">
                Continue with Instagram
              </button>
            </div>

            <div className={styles.footer}>
              <p>By signing in, you agree to our Terms of Service.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  )
}
