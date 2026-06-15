
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '@components/layout/PageWrapper'
import SidebarMenu from '@components/common/SidebarMenu'
import styles from './Catalog.module.css'
import { 
  AlertTriangle, Award, BarChart2, Battery, Brain, Bug, Camera, Check, CheckCircle2, Circle, 
  Construction, DollarSign, Eye, Fan, Film, Flag, Gamepad2, Hash, Hexagon, Leaf, 
  Lightbulb, Link, MoveHorizontal, Plug, Plus, Radio, RadioReceiver, RefreshCw, 
  Ruler, Scale, Settings, Shield, Square, Star, Target, Thermometer, Trash2, 
  TrendingDown, Tv, Wrench, X, Zap 
} from 'lucide-react'

const iconMap = {
  AlertTriangle: <AlertTriangle size={20} />,
  Award: <Award size={20} />,
  BarChart2: <BarChart2 size={20} />,
  Battery: <Battery size={20} />,
  Brain: <Brain size={20} />,
  Bug: <Bug size={20} />,
  Camera: <Camera size={20} />,
  Check: <Check size={20} />,
  CheckCircle2: <CheckCircle2 size={20} />,
  Circle: <Circle size={20} />,
  Construction: <Construction size={20} />,
  DollarSign: <DollarSign size={20} />,
  Eye: <Eye size={20} />,
  Fan: <Fan size={20} />,
  Film: <Film size={20} />,
  Flag: <Flag size={20} />,
  Gamepad2: <Gamepad2 size={20} />,
  Hash: <Hash size={20} />,
  Hexagon: <Hexagon size={20} />,
  Leaf: <Leaf size={20} />,
  Lightbulb: <Lightbulb size={20} />,
  Link: <Link size={20} />,
  MoveHorizontal: <MoveHorizontal size={20} />,
  Plug: <Plug size={20} />,
  Plus: <Plus size={20} />,
  Radio: <Radio size={20} />,
  RadioReceiver: <RadioReceiver size={20} />,
  RefreshCw: <RefreshCw size={20} />,
  Ruler: <Ruler size={20} />,
  Scale: <Scale size={20} />,
  Settings: <Settings size={20} />,
  Shield: <Shield size={20} />,
  Square: <Square size={20} />,
  Star: <Star size={20} />,
  Target: <Target size={20} />,
  Thermometer: <Thermometer size={20} />,
  Trash2: <Trash2 size={20} />,
  TrendingDown: <TrendingDown size={20} />,
  Tv: <Tv size={20} />,
  Wrench: <Wrench size={20} />,
  X: <X size={20} />,
  Zap: <Zap size={20} />
};

const resolveIcon = (name) => {
  return iconMap[name] || <Settings size={20} />;
};

export default function Catalog() {
  const [categories, setCategories] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/catalog')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch catalog data')
        }
        return res.json()
      })
      .then(data => {
        const parsedData = data.map(item => {
          const sections = typeof item.sections === 'string' ? JSON.parse(item.sections) : item.sections;
          const mappedSections = sections.map(sec => {
            if (sec.type === 'cards') {
              return {
                ...sec,
                items: sec.items.map(card => ({
                  ...card,
                  icon: resolveIcon(card.icon)
                }))
              };
            }
            if (sec.type === 'tips') {
              return {
                ...sec,
                items: sec.items.map(tip => ({
                  ...tip,
                  icon: resolveIcon(tip.icon)
                }))
              };
            }
            return sec;
          });
          
          return {
            ...item,
            sections: mappedSections,
            image: item.imageUrl,
            icon: resolveIcon(item.icon)
          };
        });
        
        setCategories(parsedData)
        if (parsedData.length > 0) {
          setActiveId(parsedData[0].id)
        }
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <PageWrapper>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--color-text-primary)' }}>
          <p>Loading FPV Parts Encyclopedia...</p>
        </div>
      </PageWrapper>
    )
  }

  if (error) {
    return (
      <PageWrapper>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#ef4444' }}>
          <p>Error loading catalog: {error}</p>
        </div>
      </PageWrapper>
    )
  }

  const category = categories.find((c) => c.id === activeId)
  if (!category) return null;


  return (
    <PageWrapper>
      <div className={styles.layout}>

        {/* ===== SIDEBAR ===== */}
        <SidebarMenu
          items={categories}
          activeId={activeId}
          onSelect={setActiveId}
          layoutIdPrefix="catalog"
          label="Components"
        >
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
        </SidebarMenu>

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
                  <p className={styles.catEyebrow} style={{ color: category.color }}>FPV Parts
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
                {categories.map((cat) => (
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
