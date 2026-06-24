import { useEffect, useCallback } from 'react'
import { useGameStore } from '../store/gameStore'
import { aiService } from '../services/aiService'

export function useGameState() {
  const {
    gameMode,
    difficulty,
    currentPlayer,
    phase,
    board,
    setAiThinking,
    makeAIMove,
  } = useGameStore()

  const triggerAIMove = useCallback(async () => {
    if (gameMode !== 'human-vs-ai' && gameMode !== 'ai-vs-ai') return
    if (gameMode === 'human-vs-ai' && currentPlayer !== 2) return

    setAiThinking(true)

    try {
      const move = await aiService.getAIMove(board, difficulty)
      
      setTimeout(() => {
        makeAIMove(move)
        setAiThinking(false)
      }, 500) // Délai pour l'animation
    } catch (error) {
      console.error('Erreur IA:', error)
      setAiThinking(false)
    }
  }, [gameMode, difficulty, currentPlayer, board, setAiThinking, makeAIMove])

  useEffect(() => {
    if (gameMode === 'ai-vs-ai' || (gameMode === 'human-vs-ai' && currentPlayer === 2)) {
      triggerAIMove()
    }
  }, [currentPlayer, phase, gameMode, triggerAIMove])

  return {
    triggerAIMove
  }
}