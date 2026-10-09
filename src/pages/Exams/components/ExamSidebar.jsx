import React from 'react';
import styles from '../Exams.module.css';
import { Check } from 'lucide-react'

export default function ExamSidebar({ questions, answers, currentView, onChangeView }) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>i</span>
      </div>
      
      <div 
        className={`${styles.sidebarItem} ${currentView === 'all' ? styles.sidebarItemActive : ''}`}
        onClick={() => onChangeView('all')}
      >
        All
      </div>

      {questions.map((q, idx) => {
        const isAnswered = answers[q.id] !== undefined;
        const isActive = currentView === idx;
        
        return (
          <div 
            key={q.id}
            className={`${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ''}`}
            onClick={() => onChangeView(idx)}
          >
            <div className={styles.sidebarIcon}>
              <span>Q{idx + 1}</span>
              {isAnswered && (
                <div className={styles.answeredTick}><Check size={10} aria-hidden="true" /></div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
