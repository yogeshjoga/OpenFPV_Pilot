// ================================
// Page — FPV Parts Encyclopedia
// ================================

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '@components/layout/PageWrapper'
import { PART_CATEGORIES } from '@data/parts'
import styles from './Catalog.module.css'

export default function Catalog() {
  const [activeId, setActiveId] = useState(PART_CATEGORIES[0].id)
  const category = PART_CATEGORIES.find((c) => c.id === activeId)

  return (
    <PageWrapper>
      <div className={styles.layout}>

        {/* ===== SIDEBAR ===== */}
        <aside className={styles.sidebar}>
          <p className={styles.sidebarLabel}>// Components</p>
          <nav className={styles.sidebarNav} aria-label="Part categories">
            {PART_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.sidebarItem} ${activeId === cat.id ? styles.sidebarActive : ''}`}
                onClick={() => setActiveId(cat.id)}
                style={{ '--cat-color': cat.color }}
              >
                <span className={styles.sidebarIcon}>{cat.icon}</span>
                <span className={styles.sidebarName}>{cat.label}</span>
                {activeId === cat.id && (
                  <motion.span
                    className={styles.activeIndicator}
                    layoutId="sidebar-active"
                    style={{ background: cat.color }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Quick-jump within page */}
          <div className={styles.tocBox}>
            <p className={styles.tocLabel}>On this page</p>
            {category.sections.map((s, i) => (
              <a
                key={i}
                href={`#section-${i}`}
                className={styles.tocLink}
                style={{ '--cat-color': category.color }}
              >
                {s.title}
              </a>
            ))}
          </div>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className={styles.main}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Category header */}
              <header className={styles.catHeader}>
                <div className={styles.catIconWrap} style={{ background: category.color + '22', border: `1px solid ${category.color}44` }}>
                  <span className={styles.catIcon}>{category.icon}</span>
                </div>
                <div>
                  <p className={styles.catEyebrow} style={{ color: category.color }}>
                    // FPV Parts
                  </p>
                  <h1 className={styles.catTitle}>{category.label}</h1>
                  <p className={styles.catTagline}>{category.tagline}</p>
                </div>
              </header>

              {/* Intro paragraph */}
              <div className={styles.introBox} style={{ borderLeftColor: category.color }}>
                <p className={styles.introText}>{category.intro}</p>
              </div>

              {/* ===== SECTIONS ===== */}
              {category.sections.map((section, i) => (
                <section key={i} id={`section-${i}`} className={styles.section}>
                  <h2 className={styles.sectionTitle} style={{ '--sec-color': category.color }}>
                    {section.title}
                  </h2>

                  {/* TYPE CARDS */}
                  {section.type === 'cards' && (
                    <div className={styles.cardsGrid}>
                      {section.items.map((item, j) => (
                        <TypeCard key={j} item={item} color={category.color} />
                      ))}
                    </div>
                  )}

                  {/* EXPLAINER + TABLE */}
                  {section.type === 'explainer' && (
                    <div className={styles.explainerBlock}>
                      <p className={styles.explainerText}>{section.content}</p>
                      {section.table && (
                        <div className={styles.tableWrap}>
                          <table className={styles.specTable}>
                            <thead>
                              <tr>
                                {section.table.headers.map((h) => (
                                  <th key={h} style={{ color: category.color }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {section.table.rows.map((row, ri) => (
                                <tr key={ri}>
                                  {row.map((cell, ci) => (
                                    <td key={ci}>{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TIPS LIST */}
                  {section.type === 'tips' && (
                    <ul className={styles.tipsList}>
                      {section.items.map((tip, j) => (
                        <motion.li
                          key={j}
                          className={styles.tipItem}
                          initial={{ opacity: 0, x: -12 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: j * 0.06 }}
                          style={{ borderLeftColor: category.color + '55' }}
                        >
                          <span className={styles.tipIcon}>{tip.icon}</span>
                          <span className={styles.tipText}>{tip.tip}</span>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              {/* ===== CATEGORY NAV FOOTER ===== */}
              <div className={styles.catNav}>
                {PART_CATEGORIES.map((cat) => (
                  cat.id !== activeId && (
                    <button
                      key={cat.id}
                      className={styles.catNavBtn}
                      onClick={() => { setActiveId(cat.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      style={{ '--cat-color': cat.color }}
                    >
                      <span>{cat.icon}</span>
                      <span>Learn about {cat.label}</span>
                      <span className={styles.catNavArrow}>→</span>
                    </button>
                  )
                ))}
              </div>

            </motion.div>
          </AnimatePresence>
        </main>

        {/* ===== RIGHT IMAGE COLUMN ===== */}
        <aside className={styles.imageCol}>
          {category.image && (
            <div className={styles.imageColWrap}>
              <img
                src={category.image}
                alt={category.label}
                className={styles.imageColImg}
              />
              <span className={styles.imageColLabel}>{category.label}</span>
            </div>
          )}
        </aside>

      </div>
    </PageWrapper>
  )
}

/* ===========================
   TypeCard sub-component
=========================== */
function TypeCard({ item, color }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      className={`${styles.typeCard} ${open ? styles.typeCardOpen : ''}`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.3 }}
      style={{ '--card-color': color }}
    >
      {/* Card top */}
      <div className={styles.typeCardTop}>
        <div className={styles.typeCardLeft}>
          <span className={styles.typeCardIcon}>{item.icon}</span>
          <div>
            <div className={styles.typeCardNameRow}>
              <h3 className={styles.typeCardName}>{item.name}</h3>
              <span className={styles.typeCardBadge} style={{ background: item.badgeColor + '22', color: item.badgeColor, borderColor: item.badgeColor + '44' }}>
                {item.badge}
              </span>
            </div>
            <p className={styles.typeCardDesc}>{item.desc}</p>
          </div>
        </div>
        <button
          className={styles.typeCardToggle}
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Collapse' : 'Expand specs'}
        >
          <span style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', display: 'inline-block', transition: 'transform 0.25s' }}>▼</span>
        </button>
      </div>

      {/* Expandable specs */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={styles.typeCardBody}
          >
            <div className={styles.typeCardBodyInner}>
              <div>
                <p className={styles.typeCardBodyLabel}>Key Specs</p>
                <ul className={styles.specsList}>
                  {item.specs.map((s, i) => (
                    <li key={i} className={styles.specItem}>
                      <span style={{ color }}>▸</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className={styles.typeCardBodyLabel}>Best Used For</p>
                <p className={styles.useText}>{item.use}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
