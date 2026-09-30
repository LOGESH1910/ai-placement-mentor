import api from './api'

export const analyzeResume = (skills, resumeText) =>
  api.post('/resume/analyze', { skills, resumeText }).then(r => r.data.data)

export const getResumeHistory = () =>
  api.get('/resume/history').then(r => r.data.data)
