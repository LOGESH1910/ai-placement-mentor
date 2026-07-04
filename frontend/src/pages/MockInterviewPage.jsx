import { useState, useEffect } from 'react'
import { submitMockAnswer, getMockHistory } from '../services/interviewService'
import { generateQuestions } from '../services/interviewService'
import ScoreCard from '../components/ui/ScoreCard'
import Loader from '../components/ui/Loader'
import ErrorAlert from '../components/ui/ErrorAlert'
import EmptyState from '../components/ui/EmptyState'

function EvaluationResult({ data }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Score row */}
      <div className="card">
        <h4 style={{ fontWeight: 700, marginBottom: '1.25rem', textAlign: 'center' }}>Your Scores</h4>
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem' }}>
          <ScoreCard label="Technical"     score={data.technicalScore}     color="#6366f1" />
          <ScoreCard label="Communication" score={data.communicationScore} color="#10b981" />
          <ScoreCard label="Grammar"       score={data.grammarScore}       color="#f59e0b" />
          <ScoreCard label="Confidence"    score={data.confidenceScore}    color="#8b5cf6" />
        </div>
      </div>

      {/* Feedback */}
      <div className="card">
        <h4 style={{ fontWeight: 700, marginBottom: '0.6rem' }}>📝 Overall Feedback</h4>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{data.overallFeedback}</p>
      </div>

      {/* Suggestions */}
      {data.suggestions?.length > 0 && (
        <div className="card">
          <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>💡 Suggestions</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {data.suggestions.map((s, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <span style={{ color: '#f59e0b', flexShrink: 0 }}>›</span>{s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improved answer */}
      {data.improvedAnswer && (
        <div className="card" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
          <h4 style={{ fontWeight: 700, marginBottom: '0.6rem', color: '#6ee7b7' }}>✨ Improved Answer</h4>
          <p style={{ color: 'var(--text)', lineHeight: 1.7, fontSize: '0.9rem' }}>{data.improvedAnswer}</p>
        </div>
      )}
    </div>
  )
}

function HistoryCard({ session }) {
  const [open, setOpen] = useState(false)
  const avg = Math.round(
    ((session.technicalScore ?? 0) + (session.communicationScore ?? 0) +
     (session.grammarScore ?? 0) + (session.confidenceScore ?? 0)) / 4
  )
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontWeight: 600 }}>{session.technology}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {session.createdAt ? new Date(session.createdAt).toLocaleString() : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className={`badge ${avg >= 70 ? 'badge-green' : avg >= 50 ? 'badge-yellow' : 'badge-red'}`}>
            Avg: {avg}%
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => setOpen(o => !o)}>
            {open ? '▲' : '▼'}
          </button>
        </div>
      </div>
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <strong>Q:</strong> {session.mockQuestion}
          </p>
          <EvaluationResult data={session} />
        </div>
      )}
    </div>
  )
}

const STEPS = { SETUP: 'SETUP', QUESTION: 'QUESTION', ANSWER: 'ANSWER', RESULT: 'RESULT' }

export default function MockInterviewPage() {
  const [step, setStep] = useState(STEPS.SETUP)
  const [tech, setTech]   = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)
  const [history, setHistory]   = useState([])
  const [histLoading, setHistLoading] = useState(true)
  const [error, setError]       = useState('')
  const [tab, setTab]           = useState('mock')

  useEffect(() => {
    getMockHistory().then(setHistory).catch(() => {}).finally(() => setHistLoading(false))
  }, [])

  const getQuestion = async (e) => {
    e.preventDefault()
    if (!tech.trim()) { setError('Enter a technology'); return }
    setError(''); setLoading(true)
    try {
      const session = await generateQuestions(tech, 'MEDIUM')
      const q = session.questions?.[0]?.question ?? 'Explain your approach to problem-solving.'
      setQuestion(q)
      setStep(STEPS.QUESTION)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = async (e) => {
    e.preventDefault()
    if (!answer.trim()) { setError('Please write your answer'); return }
    setError(''); setLoading(true)
    try {
      const data = await submitMockAnswer(tech, question, answer)
      setResult(data)
      setHistory(h => [data, ...h])
      setStep(STEPS.RESULT)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep(STEPS.SETUP); setTech(''); setQuestion(''); setAnswer(''); setResult(null); setError('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 className="page-title">Mock Interview</h2>
        <p className="page-subtitle">Practice answering questions and get detailed AI feedback</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        {['mock', 'history'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`}>
            {t === 'mock' ? '🎤 Practice' : `📋 History (${history.length})`}
          </button>
        ))}
      </div>

      {tab === 'mock' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 700 }}>
          <ErrorAlert message={error} onDismiss={() => setError('')} />

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {['Setup', 'Question', 'Answer', 'Result'].map((s, i) => {
              const idx = Object.values(STEPS).indexOf(step)
              const active = i <= idx
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: active ? 'var(--primary)' : 'var(--bg-card2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700,
                    color: active ? '#fff' : 'var(--text-muted)',
                  }}>{i + 1}</div>
                  <span style={{ fontSize: '0.8rem', color: active ? 'var(--text)' : 'var(--text-muted)' }}>{s}</span>
                  {i < 3 && <span style={{ color: 'var(--border)' }}>›</span>}
                </div>
              )
            })}
          </div>

          {step === STEPS.SETUP && (
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Choose Your Topic</h3>
              <form onSubmit={getQuestion} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
                  <label className="form-label">Technology / Role *</label>
                  <input className="form-input" placeholder="React, Java, System Design…"
                    value={tech} onChange={e => setTech(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><span className="spinner" /> Loading…</> : '🎤 Start Interview'}
                </button>
              </form>
            </div>
          )}

          {step === STEPS.QUESTION && (
            <div className="card" style={{ borderColor: 'rgba(99,102,241,0.3)' }}>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>❓</span>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>INTERVIEW QUESTION</p>
                  <p style={{ fontWeight: 600, fontSize: '1.05rem', lineHeight: 1.5 }}>{question}</p>
                </div>
              </div>
              <form onSubmit={submitAnswer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Your Answer</label>
                  <textarea className="form-input form-textarea" rows={8}
                    placeholder="Write your answer here. Be thorough — the AI evaluates technical accuracy, communication, and clarity."
                    value={answer} onChange={e => setAnswer(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <><span className="spinner" /> Evaluating…</> : '📊 Submit for Evaluation'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={reset}>↩ Start Over</button>
                </div>
              </form>
            </div>
          )}

          {loading && step !== STEPS.SETUP && <Loader text="AI is evaluating your answer…" fullPage />}

          {step === STEPS.RESULT && result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="alert alert-success">🎉 Evaluation complete! Review your scores below.</div>
              <EvaluationResult data={result} />
              <button className="btn btn-outline" onClick={reset} style={{ alignSelf: 'flex-start' }}>
                🔄 Try Another Question
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        histLoading ? <Loader text="Loading history…" fullPage /> :
        history.length === 0
          ? <EmptyState icon="🎤" title="No mock interviews yet"
              subtitle="Complete your first mock interview to see your history" />
          : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {history.map((s, i) => <HistoryCard key={s.id ?? i} session={s} />)}
            </div>
      )}
    </div>
  )
}
