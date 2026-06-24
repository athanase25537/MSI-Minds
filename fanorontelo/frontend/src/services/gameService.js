import api from './api'

export const gameService = {
  // Créer une nouvelle partie
  newGame: async () => {
    const response = await api.post('/game/new')
    return response.data
  },

  // Faire un coup (placement ou mouvement)
  makeMove: async (moveData) => {
    const response = await api.post('/game/move', moveData)
    return response.data
  },

  // Annuler le dernier coup
  undo: async () => {
    const response = await api.post('/game/undo')
    return response.data
  },

  // Refaire un coup annulé
  redo: async () => {
    const response = await api.post('/game/redo')
    return response.data
  },

  // Obtenir l'état actuel du jeu
  getGameState: async () => {
    const response = await api.get('/game/state')
    return response.data
  }
}