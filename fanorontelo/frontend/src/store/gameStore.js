import { create } from 'zustand'
import { ADJACENCY, WIN_CASES } from '../utils/constants'
import { gameService } from '../services/gameService'
import { aiService } from '../services/aiService'

// === LOGIQUE LOCALE (Fallback) ===
const getCase = (board, i) => (board >> (i * 2)) & 0b11
const setCase = (board, i, val) => {
  const mask = 0b11 << (i * 2)
  return (board & ~mask) | (val << (i * 2))
}

const checkWin = (board, player) => {
  for (const line of WIN_CASES) {
    if (line.every(c => getCase(board, c) === player)) return true
  }
  return false
}

const getWinningLine = (board, player) => {
  for (const line of WIN_CASES) {
    if (line.every(c => getCase(board, c) === player)) return line
  }
  return null
}

const getValidMoves = (board, fromCase, player) => {
  if (getCase(board, fromCase) !== player) return []
  return ADJACENCY[fromCase].filter(a => getCase(board, a) === 0)
}

// === IA LOCALE (Fallback) ===
const evaluateBoard = (board, player) => {
  const opponent = player === 1 ? 2 : 1
  let score = 0
  
  if (checkWin(board, player)) return 10000
  if (checkWin(board, opponent)) return -10000
  
  for (const line of WIN_CASES) {
    const playerCount = line.filter(c => getCase(board, c) === player).length
    const opponentCount = line.filter(c => getCase(board, c) === opponent).length
    const emptyCount = line.filter(c => getCase(board, c) === 0).length
    
    if (playerCount === 2 && emptyCount === 1) score += 50
    if (opponentCount === 2 && emptyCount === 1) score -= 50
    if (playerCount === 1 && emptyCount === 2) score += 10
    if (opponentCount === 1 && emptyCount === 2) score -= 10
  }
  
  if (getCase(board, 4) === player) score += 20
  if (getCase(board, 4) === opponent) score -= 20
  
  return score
}

const minimax = (board, depth, alpha, beta, maximizing, player) => {
  const opponent = player === 1 ? 2 : 1
  const currentPlayer = maximizing ? player : opponent
  
  if (checkWin(board, player)) return 10000 - depth
  if (checkWin(board, opponent)) return -10000 + depth
  if (depth === 0) return evaluateBoard(board, player)
  
  const moves = []
  for (let i = 0; i < 9; i++) {
    if (getCase(board, i) === 0) moves.push(i)
  }
  
  if (moves.length === 0) return 0
  
  if (maximizing) {
    let maxEval = -Infinity
    for (const move of moves) {
      const newBoard = setCase(board, move, currentPlayer)
      const eval_ = minimax(newBoard, depth - 1, alpha, beta, false, player)
      maxEval = Math.max(maxEval, eval_)
      alpha = Math.max(alpha, eval_)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of moves) {
      const newBoard = setCase(board, move, currentPlayer)
      const eval_ = minimax(newBoard, depth - 1, alpha, beta, true, player)
      minEval = Math.min(minEval, eval_)
      beta = Math.min(beta, eval_)
      if (beta <= alpha) break
    }
    return minEval
  }
}

const getLocalAIMove = (state, difficulty) => {
  const { board, currentPlayer, phase } = state
  
  if (phase === 1) {
    const validMoves = []
    for (let i = 0; i < 9; i++) {
      if (getCase(board, i) === 0) validMoves.push(i)
    }
    
    if (difficulty === 'easy') {
      return { to_case: validMoves[Math.floor(Math.random() * validMoves.length)], from_case: null }
    }
    
    const depth = difficulty === 'medium' ? 2 : 4
    let bestMove = validMoves[0]
    let bestScore = -Infinity
    
    for (const move of validMoves) {
      const newBoard = setCase(board, move, currentPlayer)
      const score = minimax(newBoard, depth, -Infinity, Infinity, false, currentPlayer)
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }
    
    return { to_case: bestMove, from_case: null }
  } else {
    const allMoves = []
    for (let from = 0; from < 9; from++) {
      if (getCase(board, from) === currentPlayer) {
        const validTo = getValidMoves(board, from, currentPlayer)
        for (const to of validTo) {
          allMoves.push({ from_case: from, to_case: to })
        }
      }
    }
    
    if (allMoves.length === 0) return null
    
    if (difficulty === 'easy') {
      return allMoves[Math.floor(Math.random() * allMoves.length)]
    }
    
    const depth = difficulty === 'medium' ? 2 : 3
    let bestMove = allMoves[0]
    let bestScore = -Infinity
    
    for (const move of allMoves) {
      let newBoard = setCase(board, move.from_case, 0)
      newBoard = setCase(newBoard, move.to_case, currentPlayer)
      const score = minimax(newBoard, depth, -Infinity, Infinity, false, currentPlayer)
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }
    
    return bestMove
  }
}

// === STORE ZUSTAND ===
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
  winningLine: null,
  gameMode: 'human-vs-human',
  difficulty: 'medium',
  aiThinking: false,
  history: [],
  historyIndex: -1,
  lastMove: null,
  moveCount: 0,
  backendAvailable: false,
  useLocalLogic: true, // Fallback par défaut
  connectionStatus: 'checking', // 'checking', 'online', 'offline'

  // Initialisation
  initializeGame: async () => {
    set({ connectionStatus: 'checking' })
    
    // Tester la connexion au backend
    try {
      const test = await gameService.testConnection()
      if (test.success) {
        console.log('✅ Backend connecté')
        set({ 
          backendAvailable: true, 
          useLocalLogic: false,
          connectionStatus: 'online'
        })
        
        // Essayer de créer une partie via le backend
        try {
          const response = await gameService.newGame()
          set({
            board: response.board || 0,
            currentPlayer: response.current_player || 1,
            phase: response.phase || 1,
            p1PiecesLeft: response.p1_pieces_left || 3,
            p2PiecesLeft: response.p2_pieces_left || 3,
            winner: null,
            winningLine: null,
            selectedCase: null,
            validMoves: [],
            history: [],
            historyIndex: -1,
            lastMove: null,
            moveCount: 0
          })
          return
        } catch (error) {
          console.warn('⚠️ Impossible de créer une partie via backend, fallback local')
        }
      }
    } catch (error) {
      console.warn('⚠️ Backend non disponible, utilisation de la logique locale')
    }
    
    // Fallback local
    set({ 
      backendAvailable: false, 
      useLocalLogic: true,
      connectionStatus: 'offline',
      board: 0,
      currentPlayer: 1,
      phase: 1,
      p1PiecesLeft: 3,
      p2PiecesLeft: 3,
      selectedCase: null,
      validMoves: [],
      winner: null,
      winningLine: null,
      history: [],
      historyIndex: -1,
      lastMove: null,
      moveCount: 0
    })
  },

  // Sauvegarder l'état dans l'historique
  saveState: () => {
    const state = get()
    const snapshot = {
      board: state.board,
      currentPlayer: state.currentPlayer,
      phase: state.phase,
      p1PiecesLeft: state.p1PiecesLeft,
      p2PiecesLeft: state.p2PiecesLeft,
      winner: state.winner,
      winningLine: state.winningLine
    }
    const newHistory = state.history.slice(0, state.historyIndex + 1)
    newHistory.push(snapshot)
    set({ history: newHistory, historyIndex: newHistory.length - 1 })
  },

  // Clic sur une case
  handleCaseClick: async (caseIndex) => {
    const state = get()
    if (state.aiThinking || state.winner) return
    
    const caseValue = getCase(state.board, caseIndex)

    // === PHASE 1 : PLACEMENT ===
    if (state.phase === 1) {
      if (caseValue !== 0) return
      
      // Essayer le backend d'abord
      if (!state.useLocalLogic && state.backendAvailable) {
        try {
          const response = await gameService.makeMove({
            to_case: caseIndex,
            player: state.currentPlayer,
            board: state.board,
            phase: state.phase,
            p1_pieces_left: state.p1PiecesLeft,
            p2_pieces_left: state.p2PiecesLeft
          })
          
          set({
            board: response.board,
            currentPlayer: response.current_player,
            phase: response.phase,
            p1PiecesLeft: response.p1_pieces_left,
            p2PiecesLeft: response.p2_pieces_left,
            winner: response.winner,
            winningLine: response.winning_line || null,
            lastMove: { to_case: caseIndex, player: state.currentPlayer },
            moveCount: state.moveCount + 1
          })
          get().saveState()
          
          setTimeout(() => get().triggerAI(), 300)
          return
        } catch (error) {
          console.warn('⚠️ Backend failed, fallback local')
          set({ useLocalLogic: true })
        }
      }
      
      // Logique locale
      let newBoard = setCase(state.board, caseIndex, state.currentPlayer)
      const newP1Left = state.currentPlayer === 1 ? state.p1PiecesLeft - 1 : state.p1PiecesLeft
      const newP2Left = state.currentPlayer === 1 ? state.p2PiecesLeft : state.p2PiecesLeft - 1
      
      const winLine = getWinningLine(newBoard, state.currentPlayer)
      if (winLine) {
        set({
          board: newBoard,
          p1PiecesLeft: newP1Left,
          p2PiecesLeft: newP2Left,
          winner: state.currentPlayer,
          winningLine: winLine,
          lastMove: { to_case: caseIndex, player: state.currentPlayer },
          moveCount: state.moveCount + 1
        })
        get().saveState()
        return
      }
      
      const nextPlayer = state.currentPlayer === 1 ? 2 : 1
      const newPhase = (newP1Left === 0 && newP2Left === 0) ? 2 : 1
      
      set({
        board: newBoard,
        currentPlayer: nextPlayer,
        phase: newPhase,
        p1PiecesLeft: newP1Left,
        p2PiecesLeft: newP2Left,
        selectedCase: null,
        validMoves: [],
        lastMove: { to_case: caseIndex, player: state.currentPlayer },
        moveCount: state.moveCount + 1
      })
      get().saveState()
      
      setTimeout(() => get().triggerAI(), 300)
      return
    }

    // === PHASE 2 : MOUVEMENT ===
    if (state.phase === 2) {
      if (state.selectedCase === null) {
        if (caseValue !== state.currentPlayer) return
        const moves = getValidMoves(state.board, caseIndex, state.currentPlayer)
        if (moves.length === 0) return
        set({ selectedCase: caseIndex, validMoves: moves })
        return
      }

      if (state.validMoves.includes(caseIndex)) {
        // Essayer le backend
        if (!state.useLocalLogic && state.backendAvailable) {
          try {
            const response = await gameService.makeMove({
              from_case: state.selectedCase,
              to_case: caseIndex,
              player: state.currentPlayer,
              board: state.board,
              phase: state.phase
            })
            
            set({
              board: response.board,
              currentPlayer: response.current_player,
              phase: response.phase,
              winner: response.winner,
              winningLine: response.winning_line || null,
              selectedCase: null,
              validMoves: [],
              lastMove: { from_case: state.selectedCase, to_case: caseIndex, player: state.currentPlayer },
              moveCount: state.moveCount + 1
            })
            get().saveState()
            
            setTimeout(() => get().triggerAI(), 300)
            return
          } catch (error) {
            console.warn('⚠️ Backend failed, fallback local')
            set({ useLocalLogic: true })
          }
        }
        
        // Logique locale
        let newBoard = setCase(state.board, state.selectedCase, 0)
        newBoard = setCase(newBoard, caseIndex, state.currentPlayer)
        
        const winLine = getWinningLine(newBoard, state.currentPlayer)
        if (winLine) {
          set({
            board: newBoard,
            winner: state.currentPlayer,
            winningLine: winLine,
            selectedCase: null,
            validMoves: [],
            lastMove: { from_case: state.selectedCase, to_case: caseIndex, player: state.currentPlayer },
            moveCount: state.moveCount + 1
          })
          get().saveState()
          return
        }
        
        const nextPlayer = state.currentPlayer === 1 ? 2 : 1
        
        set({
          board: newBoard,
          currentPlayer: nextPlayer,
          selectedCase: null,
          validMoves: [],
          lastMove: { from_case: state.selectedCase, to_case: caseIndex, player: state.currentPlayer },
          moveCount: state.moveCount + 1
        })
        get().saveState()
        
        setTimeout(() => get().triggerAI(), 300)
      } else {
        if (caseValue === state.currentPlayer) {
          const moves = getValidMoves(state.board, caseIndex, state.currentPlayer)
          set({ selectedCase: caseIndex, validMoves: moves })
        } else {
          set({ selectedCase: null, validMoves: [] })
        }
      }
    }
  },

  // Déclencher le coup de l'IA
  triggerAI: async () => {
    const state = get()
    
    const isAITurn = 
      (state.gameMode === 'human-vs-ai' && state.currentPlayer === 2) ||
      (state.gameMode === 'ai-vs-ai')
    
    if (!isAITurn || state.winner) return
    
    set({ aiThinking: true })
    
    setTimeout(async () => {
      let move = null
      
      // Essayer le backend d'abord
      if (!state.useLocalLogic && state.backendAvailable) {
        try {
          move = await aiService.getAIMove({
            board: state.board,
            currentPlayer: state.currentPlayer,
            phase: state.phase,
            p1PiecesLeft: state.p1PiecesLeft,
            p2PiecesLeft: state.p2PiecesLeft
          }, state.difficulty)
        } catch (error) {
          console.warn('⚠️ IA backend failed, fallback local')
          set({ useLocalLogic: true })
        }
      }
      
      // Fallback local
      if (!move) {
        move = getLocalAIMove(state, state.difficulty)
      }
      
      if (!move) {
        set({ aiThinking: false })
        return
      }
      
      // Appliquer le coup
      if (state.phase === 1) {
        const newBoard = setCase(state.board, move.to_case, state.currentPlayer)
        const newP1Left = state.currentPlayer === 1 ? state.p1PiecesLeft - 1 : state.p1PiecesLeft
        const newP2Left = state.currentPlayer === 1 ? state.p2PiecesLeft : state.p2PiecesLeft - 1
        
        const winLine = getWinningLine(newBoard, state.currentPlayer)
        if (winLine) {
          set({
            board: newBoard,
            p1PiecesLeft: newP1Left,
            p2PiecesLeft: newP2Left,
            winner: state.currentPlayer,
            winningLine: winLine,
            aiThinking: false,
            lastMove: { to_case: move.to_case, player: state.currentPlayer },
            moveCount: state.moveCount + 1
          })
          get().saveState()
          return
        }
        
        const nextPlayer = state.currentPlayer === 1 ? 2 : 1
        const newPhase = (newP1Left === 0 && newP2Left === 0) ? 2 : 1
        
        set({
          board: newBoard,
          currentPlayer: nextPlayer,
          phase: newPhase,
          p1PiecesLeft: newP1Left,
          p2PiecesLeft: newP2Left,
          aiThinking: false,
          lastMove: { to_case: move.to_case, player: state.currentPlayer },
          moveCount: state.moveCount + 1
        })
        get().saveState()
        
        if (state.gameMode === 'ai-vs-ai') {
          setTimeout(() => get().triggerAI(), 800)
        }
      } else {
        let newBoard = setCase(state.board, move.from_case, 0)
        newBoard = setCase(newBoard, move.to_case, state.currentPlayer)
        
        const winLine = getWinningLine(newBoard, state.currentPlayer)
        if (winLine) {
          set({
            board: newBoard,
            winner: state.currentPlayer,
            winningLine: winLine,
            aiThinking: false,
            lastMove: { from_case: move.from_case, to_case: move.to_case, player: state.currentPlayer },
            moveCount: state.moveCount + 1
          })
          get().saveState()
          return
        }
        
        const nextPlayer = state.currentPlayer === 1 ? 2 : 1
        
        set({
          board: newBoard,
          currentPlayer: nextPlayer,
          aiThinking: false,
          lastMove: { from_case: move.from_case, to_case: move.to_case, player: state.currentPlayer },
          moveCount: state.moveCount + 1
        })
        get().saveState()
        
        if (state.gameMode === 'ai-vs-ai') {
          setTimeout(() => get().triggerAI(), 800)
        }
      }
    }, 500)
  },

  // Undo
  undo: async () => {
    const state = get()
    
    // Essayer le backend
    if (!state.useLocalLogic && state.backendAvailable) {
      try {
        const response = await gameService.undo()
        set({
          board: response.board,
          currentPlayer: response.current_player,
          phase: response.phase,
          p1PiecesLeft: response.p1_pieces_left,
          p2PiecesLeft: response.p2_pieces_left,
          winner: response.winner,
          winningLine: response.winning_line || null,
          selectedCase: null,
          validMoves: []
        })
        return
      } catch (error) {
        console.warn('⚠️ Backend undo failed, fallback local')
      }
    }
    
    // Fallback local
    if (state.historyIndex <= 0) return
    
    const prevIndex = state.historyIndex - 1
    const prev = state.history[prevIndex]
    
    set({
      board: prev.board,
      currentPlayer: prev.currentPlayer,
      phase: prev.phase,
      p1PiecesLeft: prev.p1PiecesLeft,
      p2PiecesLeft: prev.p2PiecesLeft,
      winner: prev.winner,
      winningLine: prev.winningLine,
      historyIndex: prevIndex,
      selectedCase: null,
      validMoves: []
    })
  },

  // Redo
  redo: async () => {
    const state = get()
    
    // Essayer le backend
    if (!state.useLocalLogic && state.backendAvailable) {
      try {
        const response = await gameService.redo()
        set({
          board: response.board,
          currentPlayer: response.current_player,
          phase: response.phase,
          p1PiecesLeft: response.p1_pieces_left,
          p2PiecesLeft: response.p2_pieces_left,
          winner: response.winner,
          winningLine: response.winning_line || null,
          selectedCase: null,
          validMoves: []
        })
        return
      } catch (error) {
        console.warn('⚠️ Backend redo failed, fallback local')
      }
    }
    
    // Fallback local
    if (state.historyIndex >= state.history.length - 1) return
    
    const nextIndex = state.historyIndex + 1
    const next = state.history[nextIndex]
    
    set({
      board: next.board,
      currentPlayer: next.currentPlayer,
      phase: next.phase,
      p1PiecesLeft: next.p1PiecesLeft,
      p2PiecesLeft: next.p2PiecesLeft,
      winner: next.winner,
      winningLine: next.winningLine,
      historyIndex: nextIndex,
      selectedCase: null,
      validMoves: []
    })
  },

  // Reset
  resetGame: () => {
    get().initializeGame()
  },

  // Setters
  setGameMode: (mode) => {
    set({ gameMode: mode })
    get().initializeGame()
  },
  setDifficulty: (diff) => set({ difficulty: diff }),
  setAiThinking: (thinking) => set({ aiThinking: thinking })
}))