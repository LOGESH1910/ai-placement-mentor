import api from './api'

export const generateRoadmap = (targetRole, currentSkills) =>
  api.post('/roadmap/generate', { targetRole, currentSkills }).then(r => r.data.data)

export const getRoadmapHistory = () =>
  api.get('/roadmap/history').then(r => r.data.data)
