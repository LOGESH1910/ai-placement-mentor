import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ErrorAlert from '../../components/ui/ErrorAlert'

// Tech/study images from Unsplash (free to use)
const BG_IMAGES = [
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=60&fit=crop',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=60&fit=crop',
  'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=400&q=60&fit=crop',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=60&fit=crop',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&q=60&fit=crop',
  'https://images.unsplash.com/photo-1550439062-609e1531270e?w=400&q=60&fit=crop',
  'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=400&q=60&fit=crop',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=60&fit=crop',
  'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&q=60&fit=crop',
]

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif', overflow: 'hidden',
    }}>
      {/* Background image grid */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        zIndex: 0,
      }}>
        {BG_IMAGES.map((src, i) => (
          <div key={i} style={{
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }} />
        ))}
      </div>

      {/* Dark overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.68)', zIndex: 1 }} />

      {/* Centered form card */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: 420,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '2rem 1rem',
      }}>
        {/* Logo circle */}
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          border: '2px solid rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.75rem', marginBottom: '1.5rem',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 30px rgba(0,212,255,0.3)',
        }}>🎯</div>

        <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem', textAlign: 'center', letterSpacing: '0.02em' }}>
          AI Placement Mentor
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', marginBottom: '2rem' }}>Sign in to your account</p>

        <ErrorAlert message={error} onDismiss={() => setError('')} />

        {/* Form inputs */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1rem' }}>
          {/* Email */}
          <div style={{
            background: 'rgba(255,255,255,0.92)', borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0 1rem',
          }}>
            <span style={{ color: '#6b7280', fontSize: '1rem' }}>✉</span>
            <input name="email" type="email" required placeholder="Email Address"
              value={form.email} onChange={handle}
              style={{ flex: 1, padding: '0.85rem 0', background: 'transparent', border: 'none', outline: 'none', color: '#1f2937', fontSize: '0.95rem' }} />
          </div>

          {/* Password */}
          <div style={{
            background: 'rgba(255,255,255,0.92)', borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0 1rem',
          }}>
            <span style={{ color: '#6b7280', fontSize: '1rem' }}>🔒</span>
            <input name="password" type={showPwd ? 'text' : 'password'} required placeholder="Password"
              value={form.password} onChange={handle}
              style={{ flex: 1, padding: '0.85rem 0', background: 'transparent', border: 'none', outline: 'none', color: '#1f2937', fontSize: '0.95rem' }} />
            <button type="button" onClick={() => setShowPwd(v => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '0.9rem' }}>
              {showPwd ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        {/* Keep me logged in */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <input type="checkbox" id="keep" style={{ accentColor: '#00d4ff' }} />
          <label htmlFor="keep" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', cursor: 'pointer' }}>Keep Me Logged In</label>
        </div>

        {/* Login button */}
        <button type="button" onClick={submit} disabled={loading} style={{
          width: '100%', padding: '0.9rem',
          background: loading ? '#0284c7' : 'linear-gradient(135deg, #00d4ff, #0ea5e9)',
          color: '#fff', fontWeight: 700, fontSize: '1rem',
          border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          boxShadow: '0 4px 20px rgba(0,212,255,0.4)',
          transition: 'all 0.2s', marginBottom: '1.25rem',
        }}>
          {loading ? 'Logging in…' : 'LOG IN'}
        </button>

        {/* Forgot / Register */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', cursor: 'pointer' }}>FORGOT PASSWORD?</span>
          <Link to="/register" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', textDecoration: 'none', letterSpacing: '0.05em' }}>
            NEW USER? REGISTER
          </Link>
        </div>

        {/* Footer */}
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', textAlign: 'center' }}>
          © 2026 AI Placement Mentor. All rights reserved.
        </p>
      </div>
    </div>
  )
}
