import api from './api'

export const gameService = {
  // Tester la connexion au backend
  testConnection: async () => {
    try {
      const response = await api.get('/')
      return { success: true, data: response.data }
    } catch (error) {
      console.warn('⚠️ Backend non disponible:', error.message)
      return { success: false, error: error.message }
    }
  },

  // Créer une nouvelle partie
  newGame: async () => {
    try {
      const response = await api.post('/game/new')
      return response.data
    } catch (error) {
      console.error('Erreur newGame:', error)
      throw error
    }
  },

  // Faire un coup (placement ou mouvement)
  makeMove: async (moveData) => {
    try {
      const response = await api.post('/game/move', moveData)
      return response.data
    } catch (error) {
      console.error('Erreur makeMove:', error)
      throw error
    }
  },

  // Obtenir le coup de l'IA
  getAIMove: async (gameState, difficulty) => {
    try {
      const response = await api.post('/ai/move', {
        ...gameState,
        difficulty
      })
      return response.data
    } catch (error) {
      console.error('Erreur getAIMove:', error)
      throw error
    }
  },

  // Annuler le dernier coup
  undo: async () => {
    try {
      const response = await api.post('/game/undo')
      return response.data
    } catch (error) {
      console.error('Erreur undo:', error)
      throw error
    }
  },

  // Refaire un coup annulé
  redo: async () => {
    try {
      const response = await api.post('/game/redo')
      return response.data
    } catch (error) {
      console.error('Erreur redo:', error)
      throw error
    }
  },

  // Obtenir l'état actuel
  getGameState: async () => {
    try {
      const response = await api.get('/game/state')
      return response.data
    } catch (error) {
      console.error('Erreur getGameState:', error)
      throw error
    }
  }
}