import api from './api'

export const aiService = {
  // Obtenir le coup de l'IA
  getAIMove: async (board, difficulty) => {
    const response = await api.post('/ai/move', {
      board,
      difficulty
    })
    return response.data
  },

  // Analyser la position (pour affichage)
  analyzePosition: async (board) => {
    const response = await api.post('/ai/analyze', {
      board
    })
    return response.data
  },

  // Lancer une démo IA vs IA
  startDemo: async (difficulty1, difficulty2) => {
    const response = await api.post('/demo/start', {
      difficulty1,
      difficulty2
    })
    return response.data
  }
}