import axios from 'axios'
import { clearSession } from '../auth/session'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

client.interceptors.request.use((config) => {
  if (config.params) {
    config.params = Object.fromEntries(
      Object.entries(config.params).filter(([, v]) => v !== '' && v !== undefined && v !== null),
    )
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession()
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)

export default client
