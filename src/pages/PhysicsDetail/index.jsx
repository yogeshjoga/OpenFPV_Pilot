// ================================
// Page — PhysicsDetail (Blog Style)
// ================================

import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageWrapper from '@components/layout/PageWrapper'
import { PHYSICS_SECTIONS } from '@data/physicsData'
import styles from './PhysicsDetail.module.css'
import { useEffect } from 'react'

export default function PhysicsDetail() {
  const { sectionId, topicId } = useParams()
  const navigate = useNavigate()

  // Find the current topic
  const currentSection = PHYSICS_SECTIONS.find(s => s.id === sectionId)
  const currentTopic = currentSection?.topics.find(t => t.id === topicId)

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [topicId])

  if (!currentTopic) {
    return (
      <PageWrapper>
        <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}>
          <h2>Topic not found</h2>
          <Link to="/physics" className="gradient-text">← Back to Physics</Link>
        </div>
      </PageWrapper>
    )
  }

  // Find related topics (other topics in same section)
  const relatedTopics = currentSection.topics.filter(t => t.id !== topicId).slice(0, 3)

  return (
    <PageWrapper>
      <div className={styles.page}>
        {/* Breadcrumbs */}
        <nav className={styles.breadcrumbs}>
          <div className="container">
            <Link to="/physics">Physics</Link>
            <span className={styles.separator}>/</span>
            <span className={styles.currentSection}>{currentSection.title}</span>
          </div>
        </nav>

        {/* Article Header */}
        <header className={styles.header}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className={styles.title}>{currentTopic.title}</h1>
              <p className={styles.meta}>
                Section: <strong>{currentSection.title}</strong> • Reading Time: 4 mins
              </p>
            </motion.div>
          </div>
        </header>

        {/* Featured Image */}
        <section className={styles.featuredImageSection}>
          <div className="container">
            <motion.div 
              className={styles.imageContainer}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <img src={currentTopic.image} alt={currentTopic.title} className={styles.image} />
            </motion.div>
          </div>
        </section>

        {/* Blog Content */}
        <section className={styles.contentSection}>
          <div className="container">
            <div className={styles.contentGrid}>
              <article className={styles.article}>
                <div className={styles.richText}>
                  {currentTopic.longExplanation ? (
                    currentTopic.longExplanation.split('\n\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))
                  ) : (
                    <p>{currentTopic.explanation}</p>
                  )}
                </div>

                <div className={styles.callout}>
                  <h4>✦ Key Takeaway</h4>
                  <p>{currentTopic.explanation}</p>
                </div>

                <div className={styles.actions}>
                  <button onClick={() => navigate(-1)} className={styles.backBtn}>
                    ← Go Back
                  </button>
                  <Link to="/physics" className={styles.physicsBtn}>
                    Explore More Physics
                  </Link>
                </div>
              </article>

              {/* Sidebar */}
              <aside className={styles.sidebar}>
                <div className={styles.sidebarSection}>
                  <h3 className={styles.sidebarTitle}>Related in {currentSection.title}</h3>
                  <div className={styles.relatedList}>
                    {relatedTopics.map(topic => (
                      <Link 
                        key={topic.id} 
                        to={`/physics/${sectionId}/${topic.id}`}
                        className={styles.relatedCard}
                      >
                        <div className={styles.relatedThumb}>
                          <img src={topic.image} alt={topic.title} />
                        </div>
                        <span className={styles.relatedLabel}>{topic.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className={styles.expertNote}>
                  <h4>Expert Note</h4>
                  <p>
                    Mastering these concepts is 90% of the battle in achieving a "locked-in" flight feel. 
                    Refer back to the Academy for practical application.
                  </p>
                  <Link to="/training" className={styles.academyLink}>Visit Academy →</Link>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  )
}
