import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { analyzeResume, getResumeHistory } from '../services/resumeService'
import { uploadResume } from '../services/profileService'
import TagInput from '../components/ui/TagInput'
import Loader from '../components/ui/Loader'
import ErrorAlert from '../components/ui/ErrorAlert'
import EmptyState from '../components/ui/EmptyState'

const SECTIONS = [
  { key: 'strengths',               icon: '💪', label: 'Strengths',            color: '#10b981' },
  { key: 'weaknesses',              icon: '⚠️',  label: 'Areas to Improve',     color: '#f59e0b' },
  { key: 'missingSkills',           icon: '🎯', label: 'Missing Skills',        color: '#ef4444' },
  { key: 'recommendedTechnologies', icon: '🛠️', label: 'Recommended Tech',      color: '#00d4ff' },
  { key: 'suggestedProjects',       icon: '💡', label: 'Suggested Projects',    color: '#a78bfa' },
  { key: 'learningPlan',            icon: '📚', label: 'Learning Plan',         color: '#0ea5e9' },
]

function AnalysisResult({ data }) {
  const totalItems = SECTIONS.reduce((acc, s) => acc + (data[s.key]?.length || 0), 0)
  const score = Math.min(100, Math.round(((data.strengths?.length || 0) / Math.max(totalItems, 1)) * 100))
  const scoreColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
  const circumference = 2 * Math.PI * 34

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Score banner */}
      <div className="card glow-border" style={{
        display: 'flex', alignItems: 'center', gap: '1.75rem', padding: '1.5rem 2rem', flexWrap: 'wrap',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #060d1a 100%)',
      }}>
        <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
          <svg width="88" height="88" viewBox="0 0 88 88">
            <circle cx="44" cy="44" r="36" fill="none" stroke="#0d1b2e" strokeWidth="7" />
            <circle cx="44" cy="44" r="36" fill="none" stroke={scoreColor} strokeWidth="7"
              strokeDasharray={`${circumference * score / 100} ${circumference * (1 - score / 100)}`}
              strokeDashoffset={circumference * 0.25} strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${scoreColor}99)` }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{score}%</span>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#e2f0ff', marginBottom: '0.2rem' }}>Profile Strength Score</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
            Based on {totalItems} analysis points across {SECTIONS.length} categories
          </div>
          <div className="progress-bar" style={{ height: 4 }}>
            <div className="progress-fill" style={{ width: `${score}%` }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {SECTIONS.slice(0, 3).map(s => (
            <div key={s.key} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{data[s.key]?.length || 0}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {s.label.split(' ')[0]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Result cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {SECTIONS.map(({ key, icon, label, color }) => (
          data[key]?.length > 0 && (
            <div key={key} className="result-card">
              <div className="result-card-accent" style={{ background: color }} />
              <div className="result-card-header">
                <div className="result-card-title">
                  <span style={{ fontSize: '1.15rem' }}>{icon}</span>
                  <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.07em', color, fontWeight: 700 }}>{label}</span>
                </div>
                <span className="badge" style={{ background: `${color}18`, color, border: `1px solid ${color}40`, fontSize: '0.7rem' }}>
                  {data[key].length}
                </span>
              </div>
              <div>
                {data[key].map((item, i) => (
                  <div key={i} className="result-item">
                    <div className="result-item-dot" style={{ background: color, boxShadow: `0 0 5px ${color}80` }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  )
}

export default function ResumeAnalysisPage() {
  const { user } = useAuth()
  const [skills, setSkills] = useState([])
  const [resumeText, setResumeText] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [histLoading, setHistLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('analyze')

  useEffect(() => {
    if (user?.skills) setSkills(user.skills)
    getResumeHistory().then(setHistory).catch(() => {}).finally(() => setHistLoading(false))
  }, [user])

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setResumeFile(file)
    setUploadStatus('uploading')
    setError('')
    try {
      await uploadResume(file)
      setUploadStatus('success')
      setResumeText('')
    } catch (err) {
      setUploadStatus('error')
      setError('Upload failed: ' + err.message)
    }
  }

  const analyze = async (e) => {
    e.preventDefault()
    if (!skills.length) { setError('Please add at least one skill'); return }
    setError(''); setLoading(true); setResult(null)
    try {
      const data = await analyzeResume(skills, resumeText)
      setResult(data)
      setHistory(h => [data, ...h])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 className="page-title">Resume Analysis</h2>
        <p className="page-subtitle">AI-powered skill gap analysis and personalized recommendations</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        {['analyze', 'history'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`}>
            {t === 'analyze' ? '🔍 Analyze' : `📋 History (${history.length})`}
          </button>
        ))}
      </div>

      {tab === 'analyze' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }} />
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#e2f0ff' }}>Analyze Your Profile</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.15)', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                AI-Powered
              </span>
            </div>

            <ErrorAlert message={error} onDismiss={() => setError('')} />

            <form onSubmit={analyze} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Your Skills (press Enter to add)</label>
                <TagInput value={skills} onChange={setSkills} placeholder="Java, React, MongoDB…" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Upload Resume</label>
                  <label className={`upload-zone ${uploadStatus === 'success' ? 'success' : uploadStatus === 'uploading' ? 'active' : ''}`}
                    style={{ height: '100%', minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <input type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }} onChange={handleFileChange} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.8rem' }}>
                        {uploadStatus === 'success' ? '✅' : uploadStatus === 'uploading' ? '⏳' : '📄'}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'center' }}>
                        {uploadStatus === 'success' ? `${resumeFile?.name} ✓`
                          : uploadStatus === 'uploading' ? 'Uploading…'
                          : resumeFile ? resumeFile.name
                          : user?.resumeFileName ? `Current: ${user.resumeFileName}`
                          : 'Click to upload PDF, DOCX, TXT'}
                      </span>
                    </div>
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">Or paste resume text</label>
                  <textarea className="form-input form-textarea" rows={5}
                    placeholder="Paste your resume content here…"
                    style={{ height: '100%', minHeight: 120, resize: 'none' }}
                    value={resumeText} onChange={e => setResumeText(e.target.value)} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ alignSelf: 'flex-start', minWidth: 180 }}>
                {loading ? <><span className="spinner" /> Analyzing…</> : '🔍 Analyze Now'}
              </button>
            </form>
          </div>

          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div className="spinner-lg" style={{ margin: '0 auto 1rem' }} />
              <div style={{ color: 'var(--primary)', fontWeight: 700 }}>AI is analyzing your profile…</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.4rem' }}>This may take a few seconds</div>
            </div>
          )}

          {result && <AnalysisResult data={result} />}
        </div>
      )}

      {tab === 'history' && (
        histLoading ? <Loader text="Loading history…" fullPage /> :
        history.length === 0
          ? <EmptyState icon="📄" title="No analyses yet" subtitle="Run your first resume analysis to see results here" />
          : history.map((h, i) => (
              <div key={h.id ?? i}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--primary)' }}>◈</span>
                  {h.createdAt ? new Date(h.createdAt).toLocaleString() : `Analysis #${i + 1}`}
                </p>
                <AnalysisResult data={h} />
                {i < history.length - 1 && <div className="divider" style={{ margin: '1.5rem 0' }} />}
              </div>
            ))
      )}
    </div>
  )
}
