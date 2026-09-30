import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Icon from '../components/ui/Icon'
import { getTopic } from '../data/learnContent'
import { QUESTIONS } from '../data/practiceData'
import Markdown from '../utils/markdown'
import { readLessonProgress, writeLessonProgress } from '../utils/learnProgress'

export default function LearnTopicPage() {
  const { topicId } = useParams()
  const topic = getTopic(topicId)

  const [openLesson, setOpenLesson] = useState(null)
  const [progress, setProgress] = useState(readLessonProgress)

  useEffect(() => {
    window.scrollTo({ top: 0 })
    if (topic) document.title = `${topic.name} · Learn · AI Placement Mentor`
  }, [topic])

  useEffect(() => {
    writeLessonProgress(progress)
  }, [progress])

  const doneCount = useMemo(
    () => (topic ? topic.lessons.filter((_, i) => progress[`${topic.id}:${i}`]).length : 0),
    [topic, progress]
  )

  /* Related practice questions for this topic */
  const related = useMemo(() => {
    if (!topic) return []
    const id = topic.id
    const map = { java: 'java', python: 'python', sql: 'sql', dsa: 'dsa', algorithms: 'coding', c: 'coding', cpp: 'coding' }
    return QUESTIONS.filter((q) => q.category === (map[id] ?? 'mcq')).slice(0, 4)
  }, [topic])

  if (!topic) {
    return (
      <div className="empty-state card card-pad anim-fade-in">
        <span className="empty-icon"><Icon name="alert" size={22} /></span>
        <p className="empty-title">Topic not found</p>
        <p className="empty-desc">The learning track you’re looking for doesn’t exist.</p>
        <Link to="/learn" className="btn btn-primary btn-sm">Back to all topics</Link>
      </div>
    )
  }

  const pct = Math.round((doneCount / topic.lessons.length) * 100)
  const isDone = (i) => Boolean(progress[`${topic.id}:${i}`])

  const toggleDone = (i) =>
    setProgress((p) => ({ ...p, [`${topic.id}:${i}`]: !p[`${topic.id}:${i}`] }))

  return (
    <div className="anim-slide-up">
      {/* Breadcrumb + header */}
      <nav aria-label="Breadcrumb" className="caption" style={{ marginBottom: 12 }}>
        <Link to="/learn" style={{ color: 'var(--primary)', fontWeight: 600 }}>Learn</Link>
        {' / '}{topic.name}
      </nav>

      <div className="card card-pad" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <span className="topic-icon" style={{ background: `${topic.tint}16`, color: topic.tint, width: 52, height: 52, fontSize: '1.5rem' }}>
          {topic.icon}
        </span>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{topic.name}</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 2 }}>{topic.blurb}</p>
          <div className="spread caption" style={{ marginTop: 10, maxWidth: 420 }}>
            <span>{doneCount}/{topic.lessons.length} lessons complete</span><span>{pct}%</span>
          </div>
          <div className="progress-track" style={{ maxWidth: 420 }}>
            <div className={`progress-fill${pct === 100 ? ' success' : ''}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Lessons */}
      <div className="dash-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) 300px' }}>
        <section aria-label="Lessons">
          <div className="lesson-list">
            {topic.lessons.map((lesson, i) => {
              const open = openLesson === i
              return (
                <div key={i}>
                  <button
                    className="lesson-row"
                    onClick={() => setOpenLesson(open ? null : i)}
                    aria-expanded={open}
                  >
                    <span className={`lesson-num${isDone(i) ? ' done' : ''}`}>
                      {isDone(i) ? <Icon name="check" size={13} strokeWidth={3} /> : i + 1}
                    </span>
                    <span className="lesson-body" style={{ flex: 1, minWidth: 0 }}>
                      <h4>{lesson.title}</h4>
                      <p>{lesson.summary}</p>
                    </span>
                    <span className="caption row" style={{ gap: 6, whiteSpace: 'nowrap' }}>
                      <Icon name="clock" size={12} /> {lesson.minutes} min
                      <Icon name={open ? 'chevronDown' : 'chevronRight'} size={15} />
                    </span>
                  </button>

                  {open && (
                    <div style={{
                      padding: '0.35rem 1.25rem 1.25rem',
                      background: 'var(--bg-card)',
                      borderBottom: i < topic.lessons.length - 1 ? '1px solid var(--border)' : undefined,
                      borderTop: '1px dashed var(--border)',
                      animation: 'drop-in 0.18s ease',
                    }}>
                      <article className="prose">
                        {lesson.content.map((para, n) => (
                          <Markdown key={n} text={para} />
                        ))}

                        {lesson.code && (
                          <pre style={{
                            background: '#101828', color: '#dbe4f5', borderRadius: 8,
                            padding: '1rem 1.1rem', overflowX: 'auto',
                            fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem', lineHeight: 1.7,
                            border: '1px solid #24304d',
                          }}>
                            <code>{lesson.code}</code>
                          </pre>
                        )}

                        {lesson.keyPoints?.length > 0 && (
                          <div style={{
                            background: 'var(--bg-subtle)', border: '1px solid var(--border)',
                            borderRadius: 10, padding: '0.9rem 1.05rem', marginTop: '1rem',
                          }}>
                            <span className="label" style={{ color: 'var(--primary)' }}>Interview key points</span>
                            <ul style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {lesson.keyPoints.map((k, n) => (
                                <li key={n} className="row small" style={{ gap: 8, color: 'var(--text-secondary)' }}>
                                  <span style={{ color: 'var(--success)' }}><Icon name="check" size={13} strokeWidth={2.5} /></span>
                                  {k}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </article>

                      <div className="row" style={{ marginTop: '1rem', justifyContent: 'flex-end' }}>
                        <button
                          className={`btn btn-sm ${isDone(i) ? 'btn-secondary' : 'btn-primary'}`}
                          onClick={() => toggleDone(i)}
                        >
                          {isDone(i) ? (<><Icon name="refresh" size={13} /> Mark as unread</>) : (<><Icon name="check" size={13} /> Mark as complete</>)}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Sidebar */}
        <aside className="flex-col" style={{ gap: '1.25rem', position: 'sticky', top: 'calc(var(--topnav-h) + 16px)' }}>
          <div className="card card-pad">
            <h3 className="section-title" style={{ marginBottom: '0.85rem' }}>Track contents</h3>
            <ol style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topic.lessons.map((l, i) => (
                <li key={i}>
                  <button
                    onClick={() => setOpenLesson(i)}
                    className="row small"
                    style={{ textAlign: 'left', color: openLesson === i ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: openLesson === i ? 650 : 500 }}
                  >
                    <span className={`lesson-num${isDone(i) ? ' done' : ''}`} style={{ width: 22, height: 22, fontSize: '0.62rem' }}>
                      {isDone(i) ? <Icon name="check" size={11} strokeWidth={3} /> : i + 1}
                    </span>
                    <span style={{ minWidth: 0 }}>{l.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {related.length > 0 && (
            <div className="card card-pad">
              <h3 className="section-title" style={{ marginBottom: '0.85rem' }}>Practice this topic</h3>
              <div className="flex-col" style={{ gap: 8 }}>
                {related.map((q) => (
                  <Link key={q.id} to={`/practice?q=${encodeURIComponent(q.title)}`} className="row" style={{ justifyContent: 'space-between', fontSize: '0.81rem', fontWeight: 550 }}>
                    <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.title}</span>
                    <span className={`diff-${q.difficulty.toUpperCase()}`} style={{ fontWeight: 700 }}>{q.difficulty}</span>
                  </Link>
                ))}
              </div>
              <Link to={`/practice?category=${topic.id === 'algorithms' || topic.id === 'dsa' ? 'coding' : topic.id}`} className="btn btn-secondary btn-sm btn-block" style={{ marginTop: '0.9rem' }}>
                Open practice set
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
