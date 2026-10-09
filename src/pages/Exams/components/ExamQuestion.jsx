import React from 'react';
import styles from '../Exams.module.css';
import { Check } from 'lucide-react'

export default function ExamQuestion({ question, index, total, answer, onSelect, onNext }) {
  const pts = question.difficulty === 'hard' ? 3 : question.difficulty === 'medium' ? 2 : 1;
  const isAnswered = answer !== undefined;

  return (
    <div className={styles.splitLayout}>
      <div className={styles.leftPane}>
        <div className={styles.qHeader}>
          <div className={styles.qTitle}>Q{index + 1}. {question.question.substring(0, 30)}...</div>
          <div className={isAnswered ? styles.statusSolved : styles.statusUnsolved}>
            {isAnswered ? <><Check size={14} aria-hidden="true" /> Solved</> : 'Unsolved'}
          </div>
        </div>
        
        <div className={styles.qText}>
          {question.question}
        </div>
      </div>
      
      <div className={styles.rightPane}>
        <div style={{ marginBottom: 'var(--space-6)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)' }}>
          Choose the correct answer from below:
        </div>
        
        <div className={styles.optionsList}>
          {question.options.map((option, idx) => {
            const isSelected = answer === idx;
            return (
              <div 
                key={idx}
                className={`${styles.optionCard} ${isSelected ? styles.optionCardSelected : ''}`}
                onClick={() => onSelect(idx)}
              >
                <div className={styles.radioCircle}>
                  <div className={styles.radioInner} />
                </div>
                <span>{option}</span>
              </div>
            );
          })}
        </div>
        
        <div className={styles.submitFooter}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            ⓘ Feel free to submit your answer. You can change it until final submission.
          </div>
          <button 
            className={styles.submitBtn} 
            onClick={onNext}
            disabled={!isAnswered}
          >
            {index === total - 1 ? 'Finish Exam' : 'Submit & Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
