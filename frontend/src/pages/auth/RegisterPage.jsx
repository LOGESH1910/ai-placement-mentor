import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ErrorAlert from '../../components/ui/ErrorAlert'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', department: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #050810 0%, #0a0f1e 100%)' }}>
      {/* Left — Form */}
      <div style={{
        width: '100%', maxWidth: 520,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '2.5rem 3.5rem',
        background: 'rgba(10,15,30,0.95)',
        borderRight: '1px solid rgba(0,212,255,0.1)',
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #00d4ff, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 0 20px rgba(0,212,255,0.4)' }}>🎯</div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>AI Powered</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#e2f0ff', lineHeight: 1 }}>Placement Mentor</div>
            </div>
          </div>
        </div>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#e2f0ff', marginBottom: '0.3rem' }}>Create Account</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Start your placement journey today — it's free</p>

        <ErrorAlert message={error} onDismiss={() => setError('')} />

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input name="name" required className="form-input" placeholder="Logesh M" value={form.name} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input name="email" type="email" required className="form-input" placeholder="you@college.edu" value={form.email} onChange={handle} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input name="password" type="password" required className="form-input" placeholder="At least 6 characters" value={form.password} onChange={handle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">College</label>
              <input name="college" className="form-input" placeholder="Anna University" value={form.college} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input name="department" className="form-input" placeholder="IT / CSE" value={form.department} onChange={handle} />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '0.85rem', borderRadius: 8,
            background: 'linear-gradient(135deg, #00d4ff, #0ea5e9)',
            color: '#050810', fontWeight: 700, fontSize: '1rem',
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, boxShadow: '0 0 24px rgba(0,212,255,0.3)',
            marginTop: '0.25rem',
          }}>
            {loading ? '⏳ Creating account…' : 'Create Account →'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>

      {/* Right — Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #050c18 0%, #071422 50%, #050810 100%)' }}>
        <div style={{ position: 'absolute', top: '20%', left: '30%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 440 }}>
          <div style={{ width: 180, height: 180, margin: '0 auto 2rem', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(14,165,233,0.08))', border: '2px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 60px rgba(0,212,255,0.15)', fontSize: '5rem' }}>
            🚀
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem', background: 'linear-gradient(135deg, #e2f0ff 0%, #00d4ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Land Your Dream Job<br />With AI Guidance
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
            Join thousands of students who cracked placements at top companies using our AI mentor.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            {[['🏢', 'Google, Amazon, TCS'], ['📈', 'Track Progress'], ['🤖', 'AI Feedback']].map(([ic, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem' }}>{ic}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
