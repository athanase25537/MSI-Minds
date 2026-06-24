import axios from 'axios'

// URL du backend Render
const API_BASE_URL = 'https://fanoron-telo-backend.onrender.com'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 secondes (Render peut être lent au démarrage)
  headers: {
    'Content-Type': 'application/json'
  }
})

// Intercepteur pour logger les requêtes
api.interceptors.request.use(
  config => {
    console.log(`📡 ${config.method.toUpperCase()} ${config.url}`, config.data)
    return config
  },
  error => Promise.reject(error)
)

// Intercepteur pour logger les réponses
api.interceptors.response.use(
  response => {
    console.log(`✅ Réponse ${response.config.url}`, response.data)
    return response
  },
  error => {
    console.error(`❌ Erreur API:`, error.message)
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', error.response.data)
    }
    return Promise.reject(error)
  }
)

export default api