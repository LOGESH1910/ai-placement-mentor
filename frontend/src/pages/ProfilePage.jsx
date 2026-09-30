import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfile, uploadResume } from '../services/profileService'
import TagInput from '../components/ui/TagInput'
import ErrorAlert from '../components/ui/ErrorAlert'
import PageHeader from '../components/ui/PageHeader'
import ScoreRing from '../components/ui/ScoreRing'
import Icon from '../components/ui/Icon'

const EXTRAS_KEY = 'apm_profile_extras'

function loadExtras() {
  try {
    return JSON.parse(localStorage.getItem(EXTRAS_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const fileRef = useRef(null)

  const [form, setForm] = useState({ name: '', college: '', department: '', targetRole: '', skills: [] })
  const [extras, setExtras] = useState({ companies: [], goal: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [photo, setPhoto] = useState(() => localStorage.getItem('profilePhoto') || null)

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
    setExtras((e) => ({ ...loadExtras(), ...e }))
  }, [user])

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const saveProfile = async (e) => {
    e.preventDefault()
    setError(''); setSuccess(''); setSaving(true)
    try {
      await updateProfile(form)
      await refreshUser()
      localStorage.setItem(EXTRAS_KEY, JSON.stringify(extras))
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setError('Please choose an image file.')
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPhoto(ev.target.result)
      localStorage.setItem('profilePhoto', ev.target.result)
      setSuccess('Profile photo updated.')
    }
    reader.readAsDataURL(file)
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) return setError('Resume must be under 10 MB.')
    setError(''); setSuccess(''); setUploading(true)
    try {
      await uploadResume(file)
      await refreshUser()
      setSuccess('Resume uploaded and ready for analysis.')
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const initials = (user?.name ?? 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
  const score = user?.placementReadinessScore ?? 0

  return (
    <div className="anim-slide-up flex-col" style={{ gap: '1.25rem' }}>
      <PageHeader icon="user" title="My Profile" subtitle="Your identity, skills, goals and resume — everything recruiters ask about." />

      {/* ── Banner ─────────────────────────────────────────────────────── */}
      <section className="profile-banner" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          {photo ? (
            <img src={photo} alt="Your profile" className="profile-avatar" />
          ) : (
            <div className="profile-avatar">{initials}</div>
          )}
          <label
            title="Upload photo"
            style={{
              position: 'absolute', bottom: -4, right: -4, width: 28, height: 28,
              borderRadius: 99, background: 'var(--primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--bg-card)', cursor: 'pointer',
            }}
            aria-label="Upload profile photo"
          >
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            <Icon name="plus" size={13} strokeWidth={2.5} />
          </label>
        </div>

        <div style={{ flex: 1, minWidth: 220 }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{user?.name}</h2>
          <p className="small" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
          <div className="chip-row" style={{ marginTop: 10 }}>
            {user?.targetRole && <span className="badge badge-primary"><Icon name="target" size={11} /> {user.targetRole}</span>}
            {user?.college && <span className="badge badge-neutral"><Icon name="graduation" size={11} /> {user.college}{user?.department ? ` · ${user.department}` : ''}</span>}
            {form.skills.slice(0, 4).map((s) => <span key={s} className="badge badge-outline">{s}</span>)}
            {form.skills.length > 4 && <span className="badge badge-neutral">+{form.skills.length - 4} more</span>}
          </div>
        </div>

        <ScoreRing score={score} size={96} stroke={9} label="/ 100 readiness" />
      </section>

      <ErrorAlert message={error} onDismiss={() => setError('')} />
      {success && (
        <div className="alert alert-success" role="status">
          <Icon name="check" size={15} />
          <span style={{ flex: 1 }}>{success}</span>
          <button className="alert-dismiss" onClick={() => setSuccess('')} aria-label="Dismiss">✕</button>
        </div>
      )}

      {/* ── Edit form ──────────────────────────────────────────────────── */}
      <form onSubmit={saveProfile} className="card card-pad flex-col" style={{ gap: '1.25rem' }}>
        <h3 className="section-title">Personal & Academic Details</h3>

        <div className="grid grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="pf-name">Full name *</label>
            <input id="pf-name" name="name" required className="form-input" value={form.name} onChange={handle} placeholder="Your full name" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="pf-role">Target role</label>
            <input id="pf-role" name="targetRole" className="form-input" value={form.targetRole} onChange={handle} placeholder="e.g. Software Engineer at a product company" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="pf-college">College / University</label>
            <input id="pf-college" name="college" className="form-input" value={form.college} onChange={handle} placeholder="Anna University" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="pf-dept">Department / Branch</label>
            <input id="pf-dept" name="department" className="form-input" value={form.department} onChange={handle} placeholder="Computer Science & Engineering" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="pf-skills">
            Skills & programming languages
            <span className="caption" style={{ marginLeft: 8, fontWeight: 400 }}>(press Enter to add · {form.skills.length} added)</span>
          </label>
          <TagInput value={form.skills} onChange={(skills) => setForm((f) => ({ ...f, skills }))} placeholder="Java, Python, SQL, React…" />
        </div>

        <div className="grid grid-2">
          <TagExtrasField extras={extras} setExtras={setExtras} />
          <div className="form-group">
            <label className="form-label" htmlFor="pf-goal">Learning goal</label>
            <textarea
              id="pf-goal"
              className="form-textarea"
              style={{ minHeight: 66 }}
              placeholder="e.g. Solve 150 DSA problems and finish 2 mock interviews per week until placement season."
              value={extras.goal ?? ''}
              onChange={(e) => setExtras((x) => ({ ...x, goal: e.target.value }))}
            />
            <span className="form-hint">Saved on this device and shown on your dashboard plan.</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: 160 }}>
            {saving ? (<><span className="spinner" /> Saving…</>) : (<><Icon name="check" size={14} /> Save changes</>)}
          </button>
        </div>
      </form>

      {/* ── Resume ─────────────────────────────────────────────────────── */}
      <section className="card card-pad">
        <div className="spread" style={{ marginBottom: '1rem' }}>
          <h3 className="section-title">Resume</h3>
          {user?.resumeFileName && (
            <span className="badge badge-success"><Icon name="check" size={11} /> {user.resumeFileName}</span>
          )}
        </div>
        <label className="upload-zone">
          <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx" hidden onChange={handleResumeUpload} disabled={uploading} />
          <div className="flex-col" style={{ alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: 'var(--primary)' }}>
              <Icon name={uploading ? 'refresh' : 'fileText'} size={26} className={uploading ? 'spinner' : ''} />
            </span>
            <strong style={{ fontSize: '0.9rem' }}>
              {uploading ? 'Uploading…' : user?.resumeFileName ? 'Replace resume' : 'Upload your resume'}
            </strong>
            <span className="caption">PDF, DOCX or TXT · max 10 MB · powers AI resume analysis</span>
          </div>
        </label>
        <div className="row" style={{ marginTop: '0.9rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <span className="caption">Used by the AI Resume Analyzer to match skills against job requirements.</span>
          <a href="/resume" onClick={(e) => e.preventDefault()} style={{ display: 'none' }} aria-hidden="true" />
        </div>
      </section>
    </div>
  )
}

/* Preferred-companies TagInput wrapper */
function TagExtrasField({ extras, setExtras }) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor="pf-companies">
        Preferred companies
        <span className="caption" style={{ marginLeft: 8, fontWeight: 400 }}>(press Enter to add)</span>
      </label>
      <TagInput
        value={extras.companies ?? []}
        onChange={(companies) => setExtras((x) => ({ ...x, companies }))}
        placeholder="TCS, Infosys, Google…"
      />
      <span className="form-hint">Helps tailor interview practice to company patterns.</span>
    </div>
  )
}
