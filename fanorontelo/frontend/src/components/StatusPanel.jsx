import React from 'react'
import { useGameStore } from '../store/gameStore'

function StatusPanel() {
  const { currentPlayer, phase, p1PiecesLeft, p2PiecesLeft, gameMode } = useGameStore()

  const getPhaseText = () => {
    if (phase === 1) return 'Phase 1 : Placement'
    return 'Phase 2 : Mouvement'
  }

  const getCurrentPlayerText = () => {
    if (gameMode === 'ai-vs-ai') return 'IA vs IA'
    return `Tour : Joueur ${currentPlayer} (${currentPlayer === 1 ? 'Bleu' : 'Pink'})`
  }

  return (
    <div className="status-panel">
      <h3>📊 État du Jeu</h3>
      
      <div className="status-item">
        <span className="label">Phase :</span>
        <span className="value">{getPhaseText()}</span>
      </div>

      <div className="status-item">
        <span className="label">Tour :</span>
        <span className={`value player-${currentPlayer}`}>
          {getCurrentPlayerText()}
        </span>
      </div>

      <div className="pieces-counter">
        <div className="piece-count blue">
          <span className="pawn-icon">🔵</span>
          <span>{p1PiecesLeft} pion(s) restant(s)</span>
        </div>
        <div className="piece-count pink">
          <span className="pawn-icon">🩷</span>
          <span>{p2PiecesLeft} pion(s) restant(s)</span>
        </div>
      </div>
    </div>
  )
}

export default StatusPanel