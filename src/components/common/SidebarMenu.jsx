import { motion } from 'framer-motion'
import styles from './SidebarMenu.module.css'

export default function SidebarMenu({
  items,
  activeId,
  onSelect,
  layoutIdPrefix,
  label,
  children
}) {
  return (
    <aside className={styles.sidebar}>
      {label && <p className={styles.sidebarLabel}>{label}</p>}
      
      <nav className={styles.sidebarNav} aria-label="Sidebar navigation">
        {items.map((item) => (
          <button
            key={item.id}
            className={`${styles.sidebarItem} ${activeId === item.id ? styles.sidebarActive : ''}`}
            onClick={() => onSelect(item.id)}
            style={{ '--item-color': item.color }}
          >
            <span className={styles.sidebarIcon}>{item.icon}</span>
            <span className={styles.sidebarName}>{item.label}</span>
            
            {item.badge && (
              <span 
                className={styles.sidebarBadge} 
                style={{ 
                  background: item.color + '22', 
                  color: item.color, 
                  borderColor: item.color + '44' 
                }}
              >
                {item.badge}
              </span>
            )}

            {activeId === item.id && (
              <motion.span
                className={styles.activeIndicator}
                layoutId={`${layoutIdPrefix}-sidebar-active`}
                style={{ background: item.color }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </nav>

      {children}
    </aside>
  )
}
