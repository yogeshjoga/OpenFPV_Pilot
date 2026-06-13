import React from 'react';
import styles from '../Exams.module.css';

export default function ExamTable({ questions, answers, onSolve }) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.examTable}>
        <thead>
          <tr>
            <th>Name of the Problem</th>
            <th>Difficulty</th>
            <th>Score</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            const pts = q.difficulty === 'hard' ? 3 : q.difficulty === 'medium' ? 2 : 1;
            
            return (
              <tr key={q.id}>
                <td>Q{idx + 1}. {q.question.substring(0, 50)}...</td>
                <td style={{ color: q.difficulty === 'hard' ? '#ef4444' : q.difficulty === 'medium' ? '#f59e0b' : '#10b981' }}>
                  {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
                </td>
                <td>{isAnswered ? pts : 0}.0/{pts}</td>
                <td>
                  {isAnswered ? (
                    <span className={styles.statusSolved}>✓ Solved</span>
                  ) : (
                    <span className={styles.statusUnsolved}>Unsolved</span>
                  )}
                </td>
                <td>
                  <button className={styles.solveBtn} onClick={() => onSolve(idx)}>
                    Solve
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
