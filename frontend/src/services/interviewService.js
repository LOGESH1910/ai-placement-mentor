import api from './api'

export const generateQuestions = (technology, difficulty = 'ALL', easyCount = 3, mediumCount = 3, hardCount = 3) =>
  api.post('/interview/questions', { technology, difficulty, easyCount, mediumCount, hardCount })
     .then(r => r.data.data)

export const getQuestionHistory = () =>
  api.get('/interview/questions/history').then(r => r.data.data)

export const submitMockAnswer = (technology, question, answer) =>
  api.post('/interview/mock', { technology, question, answer }).then(r => r.data.data)

export const getMockHistory = () =>
  api.get('/interview/mock/history').then(r => r.data.data)
