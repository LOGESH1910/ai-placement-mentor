import api from './api'

export const getCodingRecommendations = (topic, targetRole, easyCount = 3, mediumCount = 3, hardCount = 3) =>
  api.post('/coding/recommend', { topic, targetRole, easyCount, mediumCount, hardCount })
     .then(r => r.data.data)

export const getCodingHistory = () =>
  api.get('/coding/history').then(r => r.data.data)
