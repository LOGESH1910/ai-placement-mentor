import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfile, uploadResume } from '../services/profileService'
import TagInput from '../components/ui/TagInput'
import ErrorAlert from '../components/ui/ErrorAlert'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({ name: '', college: '', department: '', targetRole: '', skills: [] })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profilePhoto, setProfilePhoto] = useState(() => localStorage.getItem('profilePhoto') || null)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? '',
        college: user.college ?? '',
        department: user.department ?? '',
        targetRole: user.targetRole ?? '',
        skills: user.skills ?? [],
      })
    }
  }, [user])

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const saveProfile = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    setSaving(true)
    try {
      await updateProfile(form)
      await refreshUser()
      setSuccess('Profile updated successfully!')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setProfilePhoto(ev.target.result)
      localStorage.setItem('profilePhoto', ev.target.result)
      setSuccess('Profile photo updated!')
    }
    reader.readAsDataURL(file)
  }

  const handleResumeUpload = async (e) => {    const file = e.target.files[0]
    if (!file) return
    setError(''); setSuccess('')
    setUploading(true)
    try {
      await uploadResume(file)
      await refreshUser()
      setSuccess('Resume uploaded!')
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const score = user?.placementReadinessScore ?? 0
  const scoreColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
  const initials = (user?.name ?? 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const circumference = 2 * Math.PI * 32

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #060e1c 0%, #091525 60%, #050c18 100%)',
        border: '1px solid rgba(0,212,255,0.18)',
        borderRadius: 'var(--radius)',
        padding: '2rem 2.5rem',
        display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap',
        boxShadow: '0 0 40px rgba(0,212,255,0.07)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -20, right: -20,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Avatar with photo upload */}
        <div style={{
          position: 'relative', width: 88, height: 88, flexShrink: 0,
        }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: profilePhoto
              ? 'transparent'
              : 'linear-gradient(135deg, rgba(0,212,255,0.25), rgba(14,165,233,0.15))',
            border: '2px solid rgba(0,212,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(0,212,255,0.25)',
            overflow: 'hidden',
          }}>
            {profilePhoto
              ? <img src={profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>{initials}</span>
            }
          </div>
          {/* Camera icon overlay */}
          <label style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 26, height: 26, borderRadius: '50%',
            background: 'var(--primary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', border: '2px solid var(--bg-card)',
            boxShadow: '0 0 8px rgba(0,212,255,0.5)',
          }} title="Upload photo">
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            📷
          </label>
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: '1.5rem', fontWeight: 800,
            background: 'linear-gradient(135deg, #e2f0ff, #00d4ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', lineHeight: 1.2,
          }}>
            {user?.name || 'Your Name'}
          </h2>
          <div style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {user?.email}
          </div>
          {user?.targetRole && (
            <div style={{ marginTop: '0.3rem', fontSize: '0.85rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>🎯</span> {user.targetRole}
            </div>
          )}
          {user?.college && (
            <div style={{ marginTop: '0.2rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              🏫 {user.college}{user?.department ? ` · ${user.department}` : ''}
            </div>
          )}
        </div>

        <div style={{
          padding: '0.4rem 1rem', borderRadius: '999px',
          background: `${scoreColor}18`, border: `1px solid ${scoreColor}40`,
          color: scoreColor, fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
        }}>
          {score}% Ready
        </div>
      </div>

      {/* ── Stats row ───────────────────────────────────────────────────── */}
      <div className="grid-3">
        <div className="stat-card" style={{ alignItems: 'center', flexDirection: 'row', gap: '1rem' }}>
          <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="32" fill="none" stroke="#0d1b2e" strokeWidth="6" />
              <circle cx="36" cy="36" r="32" fill="none" stroke={scoreColor} strokeWidth="6"
                strokeDasharray={`${circumference * score / 100} ${circumference * (1 - score / 100)}`}
                strokeDashoffset={circumference * 0.25} strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 4px ${scoreColor}80)` }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: scoreColor }}>{score}</span>
            </div>
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.1rem' }}>Readiness</div>
            <div className="stat-label">Placement Score</div>
          </div>
        </div>

        <div className="stat-card" style={{ alignItems: 'center', flexDirection: 'row', gap: '1rem' }}>
          <div className="hex-badge" style={{ fontSize: '1.4rem' }}>🛠️</div>
          <div>
            <div className="stat-value">{form.skills.length}</div>
            <div className="stat-label">Skills Added</div>
          </div>
        </div>

        <div className="stat-card" style={{ alignItems: 'center', flexDirection: 'row', gap: '1rem' }}>
          <div className="hex-badge" style={{ fontSize: '1.4rem' }}>{user?.resumeFileName ? '✅' : '📄'}</div>
          <div>
            <div className="stat-value" style={{
              fontSize: '1rem',
              background: user?.resumeFileName ? 'linear-gradient(135deg, #e2f0ff, #10b981)' : 'linear-gradient(135deg, #e2f0ff, var(--primary))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {user?.resumeFileName ? 'Uploaded' : 'Not yet'}
            </div>
            <div className="stat-label">Resume</div>
          </div>
        </div>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />
      {success && <div className="alert alert-success">✅ {success}</div>}

      {/* ── Edit form ───────────────────────────────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }} />
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#e2f0ff' }}>Personal Details</span>
        </div>

        <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="grid-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input name="name" required className="form-input" placeholder="Your full name" value={form.name} onChange={handle} />
              </div>
              <div className="form-group">
                <label className="form-label">College</label>
                <input name="college" className="form-input" placeholder="Anna University" value={form.college} onChange={handle} />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input name="department" className="form-input" placeholder="Computer Science" value={form.department} onChange={handle} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Target Role</label>
                <input name="targetRole" className="form-input" placeholder="e.g. SDE at Google" value={form.targetRole} onChange={handle} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">
                  Skills (press Enter to add)
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>
                    {form.skills.length} added
                  </span>
                </label>
                <TagInput value={form.skills} onChange={(skills) => setForm(f => ({ ...f, skills }))} placeholder="Java, React, SQL…" />
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: 140 }}>
              {saving ? <><span className="spinner" /> Saving…</> : '💾 Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Resume upload ────────────────────────────────────────────────── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--secondary)', boxShadow: '0 0 8px var(--secondary)' }} />
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#e2f0ff' }}>Resume</span>
        </div>

        {user?.resumeFileName && (
          <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
            ✅ Current file: <strong>{user.resumeFileName}</strong>
          </div>
        )}

        <label className="upload-zone" style={{ display: 'block' }}>
          <input type="file" accept=".txt,.pdf,.doc,.docx" hidden onChange={handleResumeUpload} disabled={uploading} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1rem' }}>
            <span style={{ fontSize: '2.5rem' }}>{uploading ? '⏳' : user?.resumeFileName ? '📋' : '📤'}</span>
            <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9rem' }}>
              {uploading ? 'Uploading…' : user?.resumeFileName ? 'Replace resume' : 'Upload Resume'}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              PDF, DOCX, TXT — max 10 MB
            </span>
          </div>
        </label>
      </div>

    </div>
  )
}
