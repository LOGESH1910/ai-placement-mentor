import api from './api'

export const getProfile = () =>
  api.get('/profile').then(r => r.data.data)

export const updateProfile = (data) =>
  api.put('/profile', data).then(r => r.data.data)

export const uploadResume = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/profile/resume', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data.data)
}
