import { useState, useEffect } from 'react'
import { BookOpen } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageWrapper from '@components/layout/PageWrapper'
import { EXAM_BANKS } from '@data/exams'
import styles from './Exams.module.css'

import ExamSidebar from './components/ExamSidebar'
import ExamTable from './components/ExamTable'
import ExamQuestion from './components/ExamQuestion'
import Certificate from './components/Certificate'
import CertificateV2 from './components/CertificateV2'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export default function ExamPage() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  
  const [examState, setExamState] = useState('intro') // 'intro', 'running', 'results'
  const [questions, setQuestions] = useState([])
  const [currentView, setCurrentView] = useState('all') // 'all' or question index
  const [answers, setAnswers] = useState({}) // { questionId: selectedOptionIndex }
  const [score, setScore] = useState(0)
  const [grade, setGrade] = useState({ letter: '', feedback: '' })
  const [reportCard, setReportCard] = useState(null)
  
  const [studentName, setStudentName] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [certVersion, setCertVersion] = useState('v2')

  const examData = EXAM_BANKS[categoryId] || EXAM_BANKS['esc']

  const getGradeColor = (letter) => {
    if (letter === 'Grade 1') return '#10b981';
    if (letter === 'Grade 2') return '#f97316';
    if (letter === 'Grade 3') return '#ef4444';
    if (letter === 'Grade 4') return '#ef4444';
    if (letter === 'Failed') return '#ef4444';
    return 'var(--color-text-primary)';
  };

  // Reset exam state when switching between categories in the navbar
  useEffect(() => {
    setExamState('intro')
    setQuestions([])
    setCurrentView('all')
    setAnswers({})
    setScore(0)
    setGrade({ letter: '', feedback: '' })
    setReportCard(null)
    setStudentName('')
    setTimeRemaining(0)
  }, [categoryId])

  // Timer logic
  useEffect(() => {
    let timer;
    if (examState === 'running' && categoryId === 'all') {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examState, categoryId]);

  const handleDownloadCertificate = async (watermarkEnabled) => {
    if (!watermarkEnabled && examState !== 'results') {
      const pwd = window.prompt("Enter admin password to download unwatermarked certificate:");
      if (pwd !== "7799250107@Yz") {
        alert("Incorrect password!");
        return;
      }
    }

    const element = document.getElementById("certificate-area");
    if (!element) return;

    let tmp = null;
    try {
      const isV2 = certVersion === 'v2';
      const targetWidth = isV2 ? 1056 : 860;

      // 1. Create a temporary container appended to <body>
      //    position:absolute, left way off screen, but NOT visibility:hidden / display:none
      //    html2canvas CANNOT render hidden elements — opacity:0 is also blocked in some browsers
      //    Solution: move it far left with overflow:hidden on body temporarily
      tmp = document.createElement("div");
      tmp.style.cssText = [
        "position: absolute",
        "left: -99999px",
        "top: 0",
        `width: ${targetWidth}px`,
        "z-index: -1",
        "pointer-events: none",
      ].join(";");

      const clone = element.cloneNode(true);
      clone.style.width = targetWidth + 'px';
      clone.style.maxWidth = targetWidth + 'px';
      clone.style.minWidth = targetWidth + 'px';
      clone.style.margin = "0";

      // Hide watermark in clone if not enabled
      const watermarkEl = clone.querySelector('.cert-watermark');
      if (watermarkEl && !watermarkEnabled) {
        watermarkEl.remove();
      }

      tmp.appendChild(clone);
      document.body.appendChild(tmp);

      // 2. Wait for fonts & layout
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 400));

      const W = clone.scrollWidth || targetWidth;
      const H = clone.scrollHeight;

      // 3. Capture — pass explicit windowWidth/windowHeight to match element size
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        width: W,
        height: H,
        windowWidth: W,
        windowHeight: H,
      });

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error("Canvas is empty — capture failed");
      }

      // 4. Build PDF — A4 landscape
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      
      const ratio = canvas.width / canvas.height;
      let imgW = pdfW;
      let imgH = pdfW / ratio;

      if (imgH > pdfH) {
        imgH = pdfH;
        imgW = pdfH * ratio;
      }

      const xOff = Math.max(0, (pdfW - imgW) / 2);
      const yOff = Math.max(0, (pdfH - imgH) / 2);

      const imgData = canvas.toDataURL("image/jpeg", 0.97);
      pdf.addImage(imgData, "JPEG", xOff, yOff, imgW, imgH);
      pdf.save(`${studentName.trim().replace(/\s+/g, '_')}_Certificate.pdf`);

    } catch (e) {
      console.error("PDF generation failed", e);
      alert("Failed to generate PDF:\n" + (e.message || e.toString()));
    } finally {
      // 5. Cleanup temp node
      if (tmp && tmp.parentNode) {
        tmp.parentNode.removeChild(tmp);
      }
    }
  };

  // Initialize and select random questions
  const startExam = () => {
    if (categoryId === 'all') {
      if (!studentName.trim()) return;
      let allHard = [];
      let allMedium = [];
      let allEasy = [];
      Object.entries(EXAM_BANKS).forEach(([key, bank]) => {
        if (key !== 'all') {
          allHard.push(...bank.questions.filter(q => q.difficulty === 'hard'));
          allMedium.push(...bank.questions.filter(q => q.difficulty === 'medium'));
          allEasy.push(...bank.questions.filter(q => q.difficulty === 'easy'));
        }
      });
      const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);
      const selected = [
        ...shuffle(allHard).slice(0, 30),
        ...shuffle(allMedium).slice(0, 10),
        ...shuffle(allEasy).slice(0, 10)
      ];
      setQuestions(shuffle(selected));
      setCurrentView('all');
      setAnswers({});
      setTimeRemaining(7200); // 2 hours
      setExamState('running');
      return;
    }

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
    let correct = 0
    let incorrect = 0
    let attempted = 0
    let unattempted = 0
    
    questions.forEach(q => {
      const selected = answers[q.id]
      if (selected !== undefined) {
        attempted++
        if (selected === q.answer) {
          correct++
          if (q.difficulty === 'hard') totalScore += 3
          else if (q.difficulty === 'medium') totalScore += 2
          else totalScore += 1
        } else {
          incorrect++
        }
      } else {
        unattempted++
      }
    })
    let maxScore = 0
    questions.forEach(q => {
      if (q.difficulty === 'hard') maxScore += 3
      else if (q.difficulty === 'medium') maxScore += 2
      else maxScore += 1
    })

    setScore(totalScore)
    setReportCard({ 
      total: questions.length, 
      attempted, 
      unattempted, 
      correct, 
      incorrect,
      maxPossible: maxScore
    })
    
    const pct = totalScore / maxScore
    if (pct >= 0.90) setGrade({ letter: 'Grade 1', feedback: 'Master / Expert Level' })
    else if (pct >= 0.80) setGrade({ letter: 'Grade 1', feedback: 'Advanced Professional' })
    else if (pct >= 0.70) setGrade({ letter: 'Grade 2', feedback: 'Intermediate Operator' })
    else if (pct >= 0.50) setGrade({ letter: 'Grade 3', feedback: 'Beginner / Novice' })
    else if (pct >= 0.35) setGrade({ letter: 'Grade 4', feedback: 'Needs More Practice' })
    else setGrade({ letter: 'Failed', feedback: 'Re-study Core Fundamentals' })

    setExamState('results')
  }

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (examState === 'running' && categoryId === 'all' && timeRemaining === 0) {
      finishExam();
    }
  }, [timeRemaining, examState, categoryId]); // eslint-disable-line

  if (!categoryId) {
    return (
      <PageWrapper>
        <div style={{ padding: 'var(--space-16) var(--space-4)', maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: 'var(--text-5xl)', marginBottom: 'var(--space-4)', textAlign: 'center', color: 'var(--color-text-primary)' }}>
            FPV Certification Exams
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-16)', textAlign: 'center', fontSize: 'var(--text-xl)' }}>
            Test your knowledge and earn certifications across various FPV drone disciplines.
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: 'var(--space-8)' 
          }}>
            {Object.values(EXAM_BANKS).map((exam) => (
              <div 
                key={exam.id}
                onClick={() => navigate(`/exams/${exam.id}`)}
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-8)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: '200px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent-primary)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <h3 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)', color: 'var(--color-accent-primary)' }}>
                  {exam.title.replace(' Certification Exam', '')}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', lineHeight: '1.5' }}>
                  {exam.id === 'all' 
                    ? 'The final 50-question master certification test.' 
                    : `Test your knowledge of FPV ${exam.id.toUpperCase()} systems.`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (!examData) {
    return (
      <PageWrapper>
        <div style={{ padding: 'var(--space-16)', textAlign: 'center' }}>Exam category not found.</div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      {examState === 'intro' && (
        <div style={{ padding: 'var(--space-16) var(--space-4)', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)' }}>{examData.title}</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-12)' }}>FPV Drone Certification Exam</p>
          
          <div style={{ background: 'var(--color-bg-card)', padding: 'var(--space-8)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            {categoryId === 'all' ? (
              <>
                <p style={{ marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)', lineHeight: '1.6' }}>
                  This section is the final exam for the FPV Drone Certification.<br/>
                  It contains randomly pooled questions from all other exam categories.<br/>
                  <strong>Total:</strong> 50 questions | <strong>Max Score:</strong> 120 points | <strong>Time:</strong> 2 hours<br/><br/>
                  <em>Topics covered: piloting, building, ESC, FC, motor, wiring, soldering, safety, battery maintenance, VTX, goggles, controller, and all related systems.</em><br/><br/>
                  Once you clear this exam, you will receive an official certification from <strong>Egirerobatics</strong>!
                </p>
                <div style={{ marginBottom: 'var(--space-8)', textAlign: 'left', background: 'var(--color-bg-secondary)', padding: 'var(--space-6)', borderRadius: 'var(--radius-md)' }}>
                  <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Full Name for Certification:</label>
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}
                  />
                  <button 
                    onClick={() => setShowPreview(!showPreview)}
                    style={{ background: 'var(--color-accent-primary)', color: 'white', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontSize: 'var(--text-sm)' }}
                  >
                    {showPreview ? 'Hide Preview' : 'Preview Certificate'}
                  </button>
                </div>
                
                {showPreview && studentName.trim() && (
                  <div style={{ marginBottom: 'var(--space-12)', padding: 'var(--space-6)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                      <h3 style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-base)', margin: 0 }}>Certificate Preview</h3>
                    </div>
                    {certVersion === 'v1' ? <Certificate studentName={studentName} isPreview={true} /> : <CertificateV2 studentName={studentName} isPreview={true} grade="Grade 1" />}
                    <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
                      <button onClick={() => handleDownloadCertificate(true)} style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', padding: 'var(--space-2) var(--space-5)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', cursor: 'pointer', fontWeight: 'bold' }}>Download Preview (Watermarked)</button>
                      <button onClick={() => handleDownloadCertificate(false)} style={{ background: 'var(--color-accent-primary)', color: 'white', padding: 'var(--space-2) var(--space-5)', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Download Official (Requires Password)</button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <p style={{ marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)' }}>
                  This exam consists of 20 randomly selected multiple-choice questions.<br/>
                  Total possible score is 50 points.
                </p>
                {examData.topicsCovered && (
                  <div style={{ textAlign: 'left', background: 'var(--color-bg-secondary)', padding: 'var(--space-6)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-8)', border: '1px solid var(--color-border)' }}>
                    <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-5)', color: 'var(--color-text-primary)' }}>Topics Covered:</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                      {examData.topicsCovered.map((topic, i) => (
                        <span 
                          key={i} 
                          style={{
                            background: 'var(--color-bg-card)',
                            color: 'var(--color-text-secondary)',
                            padding: 'var(--space-2) var(--space-4)',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--text-sm)',
                            border: '1px solid var(--color-border)',
                            display: 'inline-block'
                          }}
                        >
                          ✓ {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            <button 
              onClick={startExam}
              className={styles.startBtn}
              disabled={categoryId === 'all' && !studentName.trim()}
              style={{ opacity: (categoryId === 'all' && !studentName.trim()) ? 0.5 : 1, cursor: (categoryId === 'all' && !studentName.trim()) ? 'not-allowed' : 'pointer' }}
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
              {categoryId === 'all' && (
                <div style={{ padding: 'var(--space-2) var(--space-4)', background: timeRemaining < 300 ? 'var(--color-error)' : 'var(--color-bg-secondary)', color: timeRemaining < 300 ? 'white' : 'var(--color-text-primary)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', fontFamily: 'monospace', fontSize: 'var(--text-xl)', marginLeft: 'var(--space-4)' }}>
                  ⏱ {Math.floor(timeRemaining / 3600)}:{String(Math.floor((timeRemaining % 3600) / 60)).padStart(2, '0')}:{String(timeRemaining % 60).padStart(2, '0')}
                </div>
              )}
              <div style={{ flex: 1 }} />
              <button onClick={finishExam} style={{ background: 'var(--color-error)', color: 'white', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
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
          <div className={styles.resultsView} style={{ overflowY: 'auto', padding: 'var(--space-8)' }}>
            <h2 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-8)', color: (grade.letter === 'Failed' || grade.letter === 'Grade 4') ? 'var(--color-error)' : 'var(--color-text-primary)' }}>
              {(grade.letter === 'Failed' || grade.letter === 'Grade 4') ? 'Exam Failed' : 'Exam Complete!'}
            </h2>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-8)', justifyContent: 'center', width: '100%', maxWidth: '1000px', alignItems: 'stretch' }}>
              
              {/* Left Side: Score & Grade */}
              <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-card)', padding: 'var(--space-8)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div className={styles.scoreCircle} style={{ borderColor: getGradeColor(grade.letter), color: getGradeColor(grade.letter) }}>
                  {score}/{reportCard?.maxPossible || 50}
                </div>
                <div style={{ fontSize: 'var(--text-5xl)', fontWeight: 800, color: getGradeColor(grade.letter), marginBottom: 'var(--space-4)' }}>
                  {grade.letter}
                </div>
                <p style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>{grade.feedback}</p>
                
                <button 
                  className={styles.finishBtn} 
                  style={{ margin: 'auto 0 0 0' }}
                  onClick={() => { setExamState('intro'); setCurrentView('all'); }}
                >
                  Retake Exam
                </button>
              </div>

              {/* Right Side: Report Card & Roadmap */}
              <div style={{ flex: '1.5', minWidth: '350px', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {reportCard && (
                  <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-8)', width: '100%', textAlign: 'left' }}>
                    <h3 style={{ color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>Exam Report Card</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                      <span>Total Questions:</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{reportCard.total}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                      <span>Attempted:</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{reportCard.attempted}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                      <span>Unattempted:</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{reportCard.unattempted}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                      <span>Correct Answers:</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>{reportCard.correct}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                      <span>Incorrect Answers:</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--color-error)' }}>{reportCard.incorrect}</span>
                    </div>
                  </div>
                )}
                
                {(grade.letter === 'Failed' || grade.letter === 'Grade 4') && (
                  <div style={{ background: 'color-mix(in srgb, var(--color-error) 8%, var(--color-bg-card))', border: '1px solid color-mix(in srgb, var(--color-error) 30%, transparent)', padding: 'var(--space-6)', borderRadius: 'var(--radius-md)', textAlign: 'left' }}>
                    <h3 style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <BookOpen size={18} /> Study Roadmap
                    </h3>
                    <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>Review the core concepts in the <strong>Catalog</strong> before retaking the exam.</p>
                    <ul style={{ color: 'var(--color-error)', marginLeft: 'var(--space-6)', marginBottom: 'var(--space-6)', lineHeight: '1.4', fontSize: 'var(--text-sm)' }}>
                      <li>Read up on <strong>{examData.title.replace(' Certification Exam', '')}</strong>.</li>
                      <li>Understand basic terminology (e.g. KV, Back EMF).</li>
                      <li>Review the wiring, specifications, and safety guidelines.</li>
                    </ul>
                    <button 
                      onClick={() => navigate('/catalog')} 
                      style={{ background: 'var(--color-error)', color: 'white', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: 'var(--text-sm)' }}
                    >
                      Go to Catalog →
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Certificate Generation Section */}
            {categoryId === 'all' && grade.letter !== 'Failed' && grade.letter !== 'Grade 4' && (
              <div style={{ marginTop: 'var(--space-16)', padding: 'var(--space-8)', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                <h2 style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-accent-primary)', marginBottom: 'var(--space-4)' }}>Official Certification</h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>Congratulations, <strong>{studentName}</strong>! Here is your official FPV Master Pilot Certification.</p>
                
                {/* V1 deprecated */}

                {certVersion === 'v1' ? <Certificate studentName={studentName} isPreview={false} /> : <CertificateV2 studentName={studentName} isPreview={false} grade={grade.letter} />}
                
                <div style={{ marginTop: 'var(--space-8)' }}>
                  <button onClick={() => handleDownloadCertificate(false)} style={{ background: 'var(--color-accent-primary)', color: 'white', padding: 'var(--space-3) var(--space-8)', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontSize: 'var(--text-lg)', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}>Download PDF Certificate</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
