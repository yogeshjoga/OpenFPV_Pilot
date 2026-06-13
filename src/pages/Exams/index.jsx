import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageWrapper from '@components/layout/PageWrapper'
import { EXAM_BANKS } from '@data/exams'
import styles from './Exams.module.css'

import ExamSidebar from './components/ExamSidebar'
import ExamTable from './components/ExamTable'
import ExamQuestion from './components/ExamQuestion'

export default function ExamPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  
  const [examState, setExamState] = useState('intro') // 'intro', 'running', 'results'
  const [questions, setQuestions] = useState([])
  const [currentView, setCurrentView] = useState('all') // 'all' or question index
  const [answers, setAnswers] = useState({}) // { questionId: selectedOptionIndex }
  const [score, setScore] = useState(0)
  const [grade, setGrade] = useState({ letter: '', feedback: '' })

  const examData = EXAM_BANKS[categoryId] || EXAM_BANKS['esc']

  // Initialize and select random questions
  const startExam = () => {
    const allQs = examData.questions
    
    if (allQs.length < 20) {
      setQuestions(allQs)
      setExamState('running')
      setCurrentView('all')
      return
    }

    const easy = allQs.filter(q => q.difficulty === 'easy')
    const medium = allQs.filter(q => q.difficulty === 'medium')
    const hard = allQs.filter(q => q.difficulty === 'hard')

    const shuffle = (array) => [...array].sort(() => Math.random() - 0.5)

    const selected = [
      ...shuffle(hard).slice(0, 12),
      ...shuffle(medium).slice(0, 6),
      ...shuffle(easy).slice(0, 2)
    ]

    setQuestions(shuffle(selected))
    setCurrentView('all')
    setAnswers({})
    setExamState('running')
  }

  const handleSelectOption = (optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentView].id]: optionIndex
    }))
  }

  const handleNext = () => {
    if (currentView < questions.length - 1) {
      setCurrentView(currentView + 1)
    } else {
      finishExam()
    }
  }

  const finishExam = () => {
    let totalScore = 0
    
    questions.forEach(q => {
      const selected = answers[q.id]
      if (selected === q.answer) {
        if (q.difficulty === 'hard') totalScore += 3
        else if (q.difficulty === 'medium') totalScore += 2
        else totalScore += 1
      }
    })

    setScore(totalScore)
    
    if (totalScore >= 85) setGrade({ letter: 'A+', feedback: 'ESC Expert' })
    else if (totalScore >= 75) setGrade({ letter: 'A', feedback: 'Advanced FPV Builder' })
    else if (totalScore >= 60) setGrade({ letter: 'B', feedback: 'Intermediate Pilot' })
    else if (totalScore >= 45) setGrade({ letter: 'C', feedback: 'Beginner Builder' })
    else if (totalScore >= 30) setGrade({ letter: 'D', feedback: 'Needs More Practice' })
    else setGrade({ letter: 'F', feedback: 'Re-study ESC Fundamentals' })

    setExamState('results')
  }

  if (!examData) {
    return (
      <PageWrapper>
        <div style={{ padding: '4rem', textAlign: 'center' }}>Exam category not found.</div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      {examState === 'intro' && (
        <div style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{examData.title}</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '3rem' }}>FPV Drone Certification Exam</p>
          
          <div style={{ background: 'var(--color-bg-card)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            {categoryId === 'all' ? (
              <p style={{ marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                This section is the final exam for the FPV Drone Certification.<br/>
                It contains all component-related questions.<br/>
                <strong>Total:</strong> 50 questions | <strong>Time:</strong> 2 hours<br/><br/>
                <em>Topics covered: piloting, building, ESC, FC, motor, wiring, soldering, safety, battery maintenance, VTX, goggles, controller, and all related systems.</em><br/><br/>
                Once you clear this exam, you will receive an official certification from <strong>Egirerobatics</strong>!
              </p>
            ) : (
              <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
                This exam consists of 20 randomly selected multiple-choice questions.<br/>
                Total possible score is 50 points.
              </p>
            )}
            <button 
              onClick={startExam}
              style={{ background: '#4a90e2', color: 'white', border: 'none', padding: '1rem 3rem', fontSize: '1.2rem', borderRadius: '6px', cursor: 'pointer' }}
            >
              Start Exam
            </button>
          </div>
        </div>
      )}

      {examState === 'running' && questions.length > 0 && (
        <div className={styles.layout}>
          <ExamSidebar 
            questions={questions}
            answers={answers}
            currentView={currentView}
            onChangeView={setCurrentView}
          />
          
          <div className={styles.mainContent}>
            <div className={styles.topNav}>
              <div className={`${styles.navTab} ${styles.navTabActive}`}>
                Exam {Object.keys(answers).length}/{questions.length}
              </div>
              <div style={{ flex: 1 }} />
              <button onClick={finishExam} style={{ background: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                Finish Exam
              </button>
            </div>
            


            {currentView === 'all' ? (
              <ExamTable 
                questions={questions}
                answers={answers}
                onSolve={(idx) => setCurrentView(idx)}
              />
            ) : (
              <ExamQuestion 
                question={questions[currentView]}
                index={currentView}
                total={questions.length}
                answer={answers[questions[currentView].id]}
                onSelect={handleSelectOption}
                onNext={handleNext}
              />
            )}
          </div>
        </div>
      )}

      {examState === 'results' && (
        <div className={styles.layout}>
          <div className={styles.resultsView}>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#1e293b' }}>Exam Complete!</h2>
            <div className={styles.scoreCircle}>
              {score}/50
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>
              {grade.letter}
            </div>
            <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '2rem' }}>{grade.feedback}</p>
            <button 
              className={styles.finishBtn} 
              onClick={() => { setExamState('intro'); setCurrentView('all'); }}
            >
              Retake Exam
            </button>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
