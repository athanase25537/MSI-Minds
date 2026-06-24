import React from 'react'
import { useGameStore } from '../store/gameStore'

function ModeSelector() {
  const { gameMode, setGameMode } = useGameStore()

  const modes = [
    { id: 'human-vs-human', label: 'Humain vs Humain', icon: '👥' },
    { id: 'human-vs-ai', label: 'Humain vs IA'},
    { id: 'ai-vs-ai', label: 'IA vs IA (Démo)'}
  ]

  return (
    <div className="mode-selector">
      <h3> Mode de Jeu</h3>
      
      <div className="mode-options">
        {modes.map(mode => (
          <button
            key={mode.id}
            className={`mode-btn ${gameMode === mode.id ? 'active' : ''}`}
            onClick={() => setGameMode(mode.id)}
          >
            <span className="mode-icon">{mode.icon}</span>
            <span className="mode-label">{mode.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ModeSelector