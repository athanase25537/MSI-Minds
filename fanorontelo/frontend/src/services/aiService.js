import api from './api'

export const aiService = {
  // Obtenir le coup de l'IA
  getAIMove: async (gameState, difficulty) => {
    try {
      const response = await api.post('/ai/move', {
        board: gameState.board,
        current_player: gameState.currentPlayer,
        phase: gameState.phase,
        p1_pieces_left: gameState.p1PiecesLeft,
        p2_pieces_left: gameState.p2PiecesLeft,
        difficulty: difficulty
      })
      return response.data
    } catch (error) {
      console.error('Erreur aiService.getAIMove:', error)
      throw error
    }
  },

  // Analyser une position
  analyzePosition: async (board) => {
    try {
      const response = await api.post('/ai/analyze', { board })
      return response.data
    } catch (error) {
      console.error('Erreur analyzePosition:', error)
      throw error
    }
  }
}