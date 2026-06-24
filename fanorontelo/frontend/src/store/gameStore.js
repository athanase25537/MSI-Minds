import { create } from 'zustand'
import { gameService } from '../services/gameService'
import { ADJACENCY, WIN_CASES } from '../utils/constants'

export const useGameStore = create((set, get) => ({
  // État du jeu
  board: 0,
  currentPlayer: 1,
  phase: 1,
  p1PiecesLeft: 3,
  p2PiecesLeft: 3,
  selectedCase: null,
  validMoves: [],
  winner: null,
  gameMode: 'human-vs-human',
  difficulty: 'medium',
  aiThinking: false,
  history: [],
  historyIndex: -1,

  // Initialisation
  initializeGame: async () => {
    try {
      const response = await gameService.newGame()
      set({
        board: response.board || 0,
        currentPlayer: 1,
        phase: 1,
        p1PiecesLeft: 3,
        p2PiecesLeft: 3,
        selectedCase: null,
        validMoves: [],
        winner: null,
        history: [],
        historyIndex: -1
      })
    } catch (error) {
      console.error('Erreur initialisation:', error)
      // Fallback local
      set({
        board: 0,
        currentPlayer: 1,
        phase: 1,
        p1PiecesLeft: 3,
        p2PiecesLeft: 3,
        selectedCase: null,
        validMoves: [],
        winner: null,
        history: [],
        historyIndex: -1
      })
    }
  },

  // Helpers pour manipuler le bitboard
  getCase: (board, caseIndex) => {
    return (board >> (caseIndex * 2)) & 0b11
  },

  setCase: (board, caseIndex, value) => {
    const mask = 0b11 << (caseIndex * 2)
    return (board & ~mask) | (value << (caseIndex * 2))
  },

  checkWin: (board, player) => {
    for (const line of WIN_CASES) {
      if (line.every(c => get().getCase(board, c) === player)) {
        return true
      }
    }
    return false
  },

  getValidMoves: (board, fromCase, phase, currentPlayer, p1PiecesLeft, p2PiecesLeft) => {
    const caseValue = get().getCase(board, fromCase)
    
    if (phase === 1) {
      // Phase 1 : toutes les cases vides sont valides
      const moves = []
      for (let i = 0; i < 9; i++) {
        if (get().getCase(board, i) === 0) {
          moves.push(i)
        }
      }
      return moves
    } else {
      // Phase 2 : cases adjacentes libres
      if (caseValue !== currentPlayer) return []
      
      const occupied = []
      for (let i = 0; i < 9; i++) {
        if (get().getCase(board, i) !== 0) {
          occupied.push(i)
        }
      }
      
      return ADJACENCY[fromCase].filter(adj => !occupied.includes(adj))
    }
  },

  // Gestion de la sélection de case
  handleCaseClick: async (caseIndex) => {
    const state = get()
    const { board, currentPlayer, phase, selectedCase, validMoves } = state

    if (state.aiThinking || state.winner) return

    // Phase 1 : Placement
    if (phase === 1) {
      if (get().getCase(board, caseIndex) !== 0) return
      
      try {
        const response = await gameService.makeMove({
          to_case: caseIndex,
          player: currentPlayer
        })
        
        set({
          board: response.board,
          currentPlayer: response.current_player,
          phase: response.phase,
          p1PiecesLeft: response.p1_pieces_left,
          p2PiecesLeft: response.p2_pieces_left,
          winner: response.winner,
          selectedCase: null,
          validMoves: [],
          history: [...state.history.slice(0, state.historyIndex + 1), response],
          historyIndex: state.historyIndex + 1
        })
      } catch (error) {
        console.error('Erreur placement:', error)
      }
      return
    }

    // Phase 2 : Mouvement
    if (phase === 2) {
      // Sélectionner un pion
      if (selectedCase === null) {
        if (get().getCase(board, caseIndex) !== currentPlayer) return
        
        const moves = get().getValidMoves(board, caseIndex, phase, currentPlayer, state.p1PiecesLeft, state.p2PiecesLeft)
        set({ selectedCase: caseIndex, validMoves: moves })
        return
      }

      // Déplacer le pion
      if (validMoves.includes(caseIndex)) {
        try {
          const response = await gameService.makeMove({
            from_case: selectedCase,
            to_case: caseIndex,
            player: currentPlayer
          })
          
          set({
            board: response.board,
            currentPlayer: response.current_player,
            phase: response.phase,
            winner: response.winner,
            selectedCase: null,
            validMoves: [],
            history: [...state.history.slice(0, state.historyIndex + 1), response],
            historyIndex: state.historyIndex + 1
          })
        } catch (error) {
          console.error('Erreur mouvement:', error)
        }
      } else {
        // Désélectionner
        set({ selectedCase: null, validMoves: [] })
      }
    }
  },

  // Coup de l'IA
  makeAIMove: async (move) => {
    const state = get()
    
    try {
      const response = await gameService.makeMove({
        from_case: move.from_case,
        to_case: move.to_case,
        player: state.currentPlayer
      })
      
      set({
        board: response.board,
        currentPlayer: response.current_player,
        phase: response.phase,
        p1PiecesLeft: response.p1_pieces_left,
        p2PiecesLeft: response.p2_pieces_left,
        winner: response.winner,
        selectedCase: null,
        validMoves: [],
        history: [...state.history.slice(0, state.historyIndex + 1), response],
        historyIndex: state.historyIndex + 1
      })
    } catch (error) {
      console.error('Erreur coup IA:', error)
    }
  },

  // Undo
  undo: async () => {
    const state = get()
    if (state.historyIndex < 0) return

    try {
      const response = await gameService.undo()
      set({
        board: response.board,
        currentPlayer: response.current_player,
        phase: response.phase,
        p1PiecesLeft: response.p1_pieces_left,
        p2PiecesLeft: response.p2_pieces_left,
        winner: response.winner,
        historyIndex: state.historyIndex - 1,
        selectedCase: null,
        validMoves: []
      })
    } catch (error) {
      console.error('Erreur undo:', error)
    }
  },

  // Redo
  redo: async () => {
    const state = get()
    if (state.historyIndex >= state.history.length - 1) return

    try {
      const response = await gameService.redo()
      set({
        board: response.board,
        currentPlayer: response.current_player,
        phase: response.phase,
        p1PiecesLeft: response.p1_pieces_left,
        p2PiecesLeft: response.p2_pieces_left,
        winner: response.winner,
        historyIndex: state.historyIndex + 1,
        selectedCase: null,
        validMoves: []
      })
    } catch (error) {
      console.error('Erreur redo:', error)
    }
  },

  // Reset
  resetGame: () => {
    get().initializeGame()
  },

  // Setters
  setGameMode: (mode) => set({ gameMode: mode }),
  setDifficulty: (diff) => set({ difficulty: diff }),
  setAiThinking: (thinking) => set({ aiThinking: thinking }),

  // Computed
  canUndo: (state) => state.historyIndex >= 0,
  canRedo: (state) => state.historyIndex < state.history.length - 1
}))