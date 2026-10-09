import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '@components/layout/PageWrapper'
import { BookOpen } from 'lucide-react'
import { BLOGS } from '@data/blogs.jsx'
import { fetchBlogPosts } from '@lib/siteApi'
import Markdown from 'react-markdown'
import styles from './Blog.module.css'

export default function Blog() {
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [feed, setFeed] = useState({ status: 'loading', posts: [] })

  useEffect(() => {
    let live = true
    fetchBlogPosts()
      .then((posts) => live && setFeed({ status: 'ready', posts }))
      .catch(() => live && setFeed({ status: 'ready', posts: BLOGS }))
    return () => {
      live = false
    }
  }, [])

  return (
    <PageWrapper>
      <div className={styles.container}>
        <div className={styles.header}>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.title}
          >
            EGIRE <span className="gradient-text">Journal</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={styles.subtitle}
          >
            Insights, guides, and tactical knowledge from the FPV frontlines.
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {selectedBlog ? (
            <motion.div
              key="article"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={styles.articleView}
            >
              <button 
                className={styles.backButton}
                onClick={() => setSelectedBlog(null)}
              >
                ← Back to Articles
              </button>
              <div className={styles.articleContent}>
                {selectedBlog.cover && <img src={selectedBlog.cover} alt="" className={styles.articleCover} />}
                <div className={styles.articleMeta}>
                  <span className={styles.category}>{selectedBlog.category}</span>
                  <span className={styles.readTime}>{selectedBlog.readTime}</span>
                </div>
                <div className={styles.markdown}>
                  <Markdown>
                    {selectedBlog.content}
                  </Markdown>
                </div>
                <div className={styles.articleFooter}>
                  <p>Written by: <strong>{selectedBlog.author}</strong></p>
                  <p>{selectedBlog.date}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.grid}
            >
              {feed.status === 'loading' && <p className={styles.feedNote}>Loading articles…</p>}
              {feed.status === 'ready' && feed.posts.length === 0 && (
                <p className={styles.feedNote}>No articles published yet. Check back soon.</p>
              )}
              {feed.posts.map((blog, index) => {
                const Icon = blog.icon ?? BookOpen
                return (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={styles.card}
                    onClick={() => setSelectedBlog(blog)}
                  >
                    {blog.cover && <img src={blog.cover} alt="" loading="lazy" className={styles.cardCover} />}
                    <div className={styles.cardHeader}>
                      <div className={styles.iconWrapper}>
                        <Icon size={24} />
                      </div>
                      <span className={styles.category}>{blog.category}</span>
                    </div>
                    <h2 className={styles.cardTitle}>{blog.title}</h2>
                    <p className={styles.cardExcerpt}>{blog.excerpt}</p>
                    <div className={styles.cardMeta}>
                      <span>{blog.author}</span>
                      <span>•</span>
                      <span>{blog.readTime}</span>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  )
}
