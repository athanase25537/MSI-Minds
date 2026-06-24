import React from 'react'
import { useGameStore } from '../store/gameStore'

function StatusPanel() {
  const { 
    currentPlayer, phase, p1PiecesLeft, p2PiecesLeft, 
    gameMode, moveCount, winner, connectionStatus,
    history, historyIndex
  } = useGameStore()

  const getPhaseText = () => {
    if (winner) return '🏆 Partie terminée'
    if (phase === 1) return ' Phase 1 : Placement'
    return '🔄 Phase 2 : Mouvement'
  }

  const getCurrentPlayerText = () => {
    if (winner) return winner === 1 ? ' bleu gagne !' : ' jaune gagne !'
    if (gameMode === 'ai-vs-ai') return ' IA vs IA'
    return currentPlayer === 1 ? 'Tour du bleu' : 'Tour du jaune'
  }

  const getConnectionStatus = () => {
    switch (connectionStatus) {
      case 'checking': return '🔄 Vérification...'
      case 'online': return '✅ Backend en ligne'
      case 'offline': return '⚠️ Mode local'
      default: return '❓ Inconnu'
    }
  }

  return (
    <div className="status-panel">
      <h3> État du Jeu</h3>
      
      <div className="status-item">
        <span className="label">Connexion :</span>
        <span className="value" style={{ fontSize: '0.9rem' }}>
          {getConnectionStatus()}
        </span>
      </div>
      
      <div className="status-item">
        <span className="label">Phase :</span>
        <span className="value">{getPhaseText()}</span>
      </div>

      <div className="status-item">
        <span className="label">Statut :</span>
        <span className={`value player-${currentPlayer}`}>
          {getCurrentPlayerText()}
        </span>
      </div>

      <div className="status-item">
        <span className="label">Coups joués :</span>
        <span className="value">{moveCount}</span>
      </div>

      <div className="status-item">
        <span className="label">Historique :</span>
        <span className="value">{historyIndex + 1} / {history.length}</span>
      </div>

      <div className="pieces-counter">
        <div className="piece-count blue">
           {p1PiecesLeft} pion(s) à placer
        </div>
        <div className="piece-count pink">
           {p2PiecesLeft} pion(s) à placer
        </div>
      </div>
    </div>
  )
}

export default StatusPanel