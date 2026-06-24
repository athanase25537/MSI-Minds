import React from 'react'
import { useGameStore } from '../store/gameStore'

function GameControls() {
  const { undo, redo, resetGame, historyIndex, history } = useGameStore()
  
  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  return (
    <div className="game-controls">
      <h3>🎮 Contrôles</h3>
      
      <div className="controls-buttons">
        <button 
          onClick={undo} 
          disabled={!canUndo}
          className="control-btn"
          title="Annuler le dernier coup"
        >
          <span>↩️</span>
          <span>Annuler</span>
        </button>

        <button 
          onClick={redo} 
          disabled={!canRedo}
          className="control-btn"
          title="Refaire le coup annulé"
        >
          <span>️</span>
          <span>Refaire</span>
        </button>

        <button 
          onClick={resetGame}
          className="control-btn reset-btn"
          title="Recommencer la partie"
        >
          <span></span>
          <span>Nouvelle Partie</span>
        </button>
      </div>
    </div>
  )
}

export default GameControls