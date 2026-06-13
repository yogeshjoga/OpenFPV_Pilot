import React from 'react';
import styles from '../Exams.module.css';

export default function ExamSidebar({ questions, answers, currentView, onChangeView }) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>i</span>
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
                <div className={styles.answeredTick}>✓</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
