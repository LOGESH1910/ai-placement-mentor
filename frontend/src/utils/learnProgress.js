/* Local lesson-progress persistence shared by Learn pages */

const PROGRESS_KEY = 'apm_lesson_progress'

export function readLessonProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function writeLessonProgress(progress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
}

/** Count completed lessons for a topic */
export function topicDoneCount(topicId, lessons) {
  const p = readLessonProgress()
  return lessons.filter((_, i) => p[`${topicId}:${i}`]).length
}
