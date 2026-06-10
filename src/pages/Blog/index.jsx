import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '@components/layout/PageWrapper'
import { BLOGS } from '@data/blogs.jsx'
import Markdown from 'react-markdown'
import styles from './Blog.module.css'

export default function Blog() {
  const [selectedBlog, setSelectedBlog] = useState(null)

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
              {BLOGS.map((blog, index) => {
                const Icon = blog.icon
                return (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={styles.card}
                    onClick={() => setSelectedBlog(blog)}
                  >
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
