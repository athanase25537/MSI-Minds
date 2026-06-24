import React from 'react'
import { useGameStore } from '../store/gameStore'

function GameControls() {
  const { undo, redo, resetGame, canUndo, canRedo } = useGameStore()

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
          ↩️ Undo
        </button>

        <button 
          onClick={redo} 
          disabled={!canRedo}
          className="control-btn"
          title="Refaire le coup annulé"
        >
          ↪️ Redo
        </button>

        <button 
          onClick={resetGame}
          className="control-btn reset-btn"
          title="Recommencer la partie"
        >
          🔄 Reset
        </button>
      </div>
    </div>
  )
}

export default GameControls