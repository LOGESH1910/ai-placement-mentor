import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 90000, // 90s — AI calls can be slow
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor — attach token ────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (err) => Promise.reject(err)
)

// ── Response interceptor — map errors to readable messages ───────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // No response at all = backend is down or CORS blocked
    if (!err.response) {
      const msg = err.code === 'ECONNABORTED'
        ? 'Request timed out. The AI is taking too long — please try again.'
        : 'Cannot reach the server. Make sure the backend is running on port 8080.'
      return Promise.reject(new Error(msg))
    }

    const status = err.response.status

    // 401 — token expired/invalid
    if (status === 401) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      window.location.href = '/login'
      return Promise.reject(new Error('Session expired. Please log in again.'))
    }

    // 429 — Groq rate limit
    if (status === 429) {
      return Promise.reject(new Error(
        'AI service is busy (rate limit). Please wait 10–15 seconds and try again.'
      ))
    }

    // 503 — AI service unavailable
    if (status === 503) {
      return Promise.reject(new Error(
        err.response?.data?.message || 'AI service is temporarily unavailable. Please try again.'
      ))
    }

    // 400 — validation error
    if (status === 400) {
      return Promise.reject(new Error(
        err.response?.data?.message || 'Invalid request. Please check your input.'
      ))
    }

    // 403 — forbidden (bad/missing JWT)
    if (status === 403) {
      return Promise.reject(new Error('Access denied. Please log in again.'))
    }

    // All other errors — use backend message if available
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Something went wrong. Please try again.'

    return Promise.reject(new Error(message))
  }
)

export default api
