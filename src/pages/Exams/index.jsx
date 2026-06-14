import { useState, useEffect } from 'react'
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
  const [certVersion, setCertVersion] = useState('v1')

  const examData = EXAM_BANKS[categoryId] || EXAM_BANKS['esc']

  const getGradeColor = (letter) => {
    if (letter === 'Level 3') return '#10b981';
    if (letter === 'Level 2') return '#f97316';
    if (letter === 'Level 1') return '#ef4444';
    if (letter === 'Level 0') return '#ef4444';
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
    if (pct >= 0.90) setGrade({ letter: 'Level 3', feedback: 'Master / Expert Level' })
    else if (pct >= 0.80) setGrade({ letter: 'Level 3', feedback: 'Advanced Professional' })
    else if (pct >= 0.70) setGrade({ letter: 'Level 2', feedback: 'Intermediate Operator' })
    else if (pct >= 0.50) setGrade({ letter: 'Level 1', feedback: 'Beginner / Novice' })
    else if (pct >= 0.35) setGrade({ letter: 'Level 0', feedback: 'Needs More Practice' })
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
        <div style={{ padding: '4rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center', color: 'var(--color-text-primary)' }}>
            FPV Certification Exams
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '4rem', textAlign: 'center', fontSize: '1.2rem' }}>
            Test your knowledge and earn certifications across various FPV drone disciplines.
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem' 
          }}>
            {Object.values(EXAM_BANKS).map((exam) => (
              <div 
                key={exam.id}
                onClick={() => navigate(`/exams/${exam.id}`)}
                style={{
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '2rem',
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
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-accent-primary)' }}>
                  {exam.title.replace(' Certification Exam', '')}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
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
        <div style={{ padding: '4rem', textAlign: 'center' }}>Exam category not found.</div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      {examState === 'intro' && (
        <div style={{ padding: '4rem 1rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{examData.title}</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '3rem' }}>FPV Drone Certification Exam</p>
          
          <div style={{ background: 'var(--color-bg-card)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            {categoryId === 'all' ? (
              <>
                <p style={{ marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  This section is the final exam for the FPV Drone Certification.<br/>
                  It contains randomly pooled questions from all other exam categories.<br/>
                  <strong>Total:</strong> 50 questions | <strong>Max Score:</strong> 120 points | <strong>Time:</strong> 2 hours<br/><br/>
                  <em>Topics covered: piloting, building, ESC, FC, motor, wiring, soldering, safety, battery maintenance, VTX, goggles, controller, and all related systems.</em><br/><br/>
                  Once you clear this exam, you will receive an official certification from <strong>Egirerobatics</strong>!
                </p>
                <div style={{ marginBottom: '2rem', textAlign: 'left', background: 'var(--color-bg-secondary)', padding: '1.5rem', borderRadius: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Full Name for Certification:</label>
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', marginBottom: '1rem' }}
                  />
                  <button 
                    onClick={() => setShowPreview(!showPreview)}
                    style={{ background: 'var(--color-accent-primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    {showPreview ? 'Hide Preview' : 'Preview Certificate'}
                  </button>
                </div>
                
                {showPreview && studentName.trim() && (
                  <div style={{ marginBottom: '3rem', padding: '1.5rem', background: 'var(--color-bg-primary)', borderRadius: '12px', border: '1px dashed var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', margin: 0 }}>Certificate Preview</h3>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setCertVersion('v1')} style={{ padding: '0.4rem 0.8rem', background: certVersion === 'v1' ? 'var(--color-accent-primary)' : 'var(--color-bg-secondary)', border: `1px solid var(--color-border)`, color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Classic V1</button>
                        <button onClick={() => setCertVersion('v2')} style={{ padding: '0.4rem 0.8rem', background: certVersion === 'v2' ? 'var(--color-accent-primary)' : 'var(--color-bg-secondary)', border: `1px solid var(--color-border)`, color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Modern V2</button>
                      </div>
                    </div>
                    {certVersion === 'v1' ? <Certificate studentName={studentName} isPreview={true} /> : <CertificateV2 studentName={studentName} isPreview={true} grade="Level 3" />}
                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                      <button onClick={() => handleDownloadCertificate(true)} style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid var(--color-border)', cursor: 'pointer', fontWeight: 'bold' }}>Download Preview (Watermarked)</button>
                      <button onClick={() => handleDownloadCertificate(false)} style={{ background: 'var(--color-accent-primary)', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Download Official (Requires Password)</button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
                  This exam consists of 20 randomly selected multiple-choice questions.<br/>
                  Total possible score is 50 points.
                </p>
                {examData.topicsCovered && (
                  <div style={{ textAlign: 'left', background: 'var(--color-bg-secondary)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--color-border)' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: 'var(--color-text-primary)' }}>Topics Covered:</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                      {examData.topicsCovered.map((topic, i) => (
                        <span 
                          key={i} 
                          style={{
                            background: 'var(--color-bg-card)',
                            color: 'var(--color-text-secondary)',
                            padding: '0.4rem 1rem',
                            borderRadius: '9999px',
                            fontSize: '0.85rem',
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
                <div style={{ padding: '0.5rem 1rem', background: timeRemaining < 300 ? '#ef4444' : 'var(--color-bg-secondary)', color: timeRemaining < 300 ? 'white' : 'var(--color-text-primary)', borderRadius: '6px', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.2rem', marginLeft: '1rem' }}>
                  ⏱ {Math.floor(timeRemaining / 3600)}:{String(Math.floor((timeRemaining % 3600) / 60)).padStart(2, '0')}:{String(timeRemaining % 60).padStart(2, '0')}
                </div>
              )}
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
          <div className={styles.resultsView} style={{ overflowY: 'auto', padding: '2rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: (grade.letter === 'Failed' || grade.letter === 'Level 0') ? '#ef4444' : 'var(--color-text-primary)' }}>
              {(grade.letter === 'Failed' || grade.letter === 'Level 0') ? 'Exam Failed' : 'Exam Complete!'}
            </h2>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', width: '100%', maxWidth: '1000px', alignItems: 'stretch' }}>
              
              {/* Left Side: Score & Grade */}
              <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-card)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                <div className={styles.scoreCircle} style={{ borderColor: getGradeColor(grade.letter), color: getGradeColor(grade.letter) }}>
                  {score}/{reportCard?.maxPossible || 50}
                </div>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: getGradeColor(grade.letter), marginBottom: '1rem' }}>
                  {grade.letter}
                </div>
                <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>{grade.feedback}</p>
                
                <button 
                  className={styles.finishBtn} 
                  style={{ margin: 'auto 0 0 0' }}
                  onClick={() => { setExamState('intro'); setCurrentView('all'); }}
                >
                  Retake Exam
                </button>
              </div>

              {/* Right Side: Report Card & Roadmap */}
              <div style={{ flex: '1.5', minWidth: '350px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {reportCard && (
                  <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '2rem', width: '100%', textAlign: 'left' }}>
                    <h3 style={{ color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Exam Report Card</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                      <span>Total Questions:</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{reportCard.total}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                      <span>Attempted:</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{reportCard.attempted}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                      <span>Unattempted:</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{reportCard.unattempted}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                      <span>Correct Answers:</span>
                      <span style={{ fontWeight: 'bold', color: '#10b981' }}>{reportCard.correct}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                      <span>Incorrect Answers:</span>
                      <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{reportCard.incorrect}</span>
                    </div>
                  </div>
                )}
                
                {(grade.letter === 'Failed' || grade.letter === 'Level 0') && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1.5rem', borderRadius: '12px', textAlign: 'left' }}>
                    <h3 style={{ color: '#b91c1c', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>📚</span> Study Roadmap
                    </h3>
                    <p style={{ color: '#7f1d1d', marginBottom: '1rem', fontSize: '0.9rem' }}>Review the core concepts in the <strong>Catalog</strong> before retaking the exam.</p>
                    <ul style={{ color: '#991b1b', marginLeft: '1.5rem', marginBottom: '1.5rem', lineHeight: '1.4', fontSize: '0.9rem' }}>
                      <li>Read up on <strong>{examData.title.replace(' Certification Exam', '')}</strong>.</li>
                      <li>Understand basic terminology (e.g. KV, Back EMF).</li>
                      <li>Review the wiring, specifications, and safety guidelines.</li>
                    </ul>
                    <button 
                      onClick={() => navigate('/catalog')} 
                      style={{ background: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
                    >
                      Go to Catalog →
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Certificate Generation Section */}
            {categoryId === 'all' && grade.letter !== 'Failed' && grade.letter !== 'Level 0' && (
              <div style={{ marginTop: '4rem', padding: '2rem', background: 'var(--color-bg-card)', borderRadius: '12px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', color: 'var(--color-accent-primary)', marginBottom: '1rem' }}>🏆 Official Certification</h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Congratulations, <strong>{studentName}</strong>! Here is your official FPV Master Pilot Certification.</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                  <button onClick={() => setCertVersion('v1')} style={{ padding: '0.6rem 1.5rem', background: certVersion === 'v1' ? 'var(--color-accent-primary)' : 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Classic V1 Certificate</button>
                  <button onClick={() => setCertVersion('v2')} style={{ padding: '0.6rem 1.5rem', background: certVersion === 'v2' ? 'var(--color-accent-primary)' : 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Modern V2 Certificate</button>
                </div>

                {certVersion === 'v1' ? <Certificate studentName={studentName} isPreview={false} /> : <CertificateV2 studentName={studentName} isPreview={false} grade={grade.letter} />}
                
                <div style={{ marginTop: '2rem' }}>
                  <button onClick={() => handleDownloadCertificate(false)} style={{ background: 'var(--color-accent-primary)', color: 'white', padding: '0.8rem 2rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}>Download PDF Certificate</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
