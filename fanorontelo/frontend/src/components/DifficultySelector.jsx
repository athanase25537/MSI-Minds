import React from 'react'
import { useGameStore } from '../store/gameStore'

function DifficultySelector() {
  const { difficulty, setDifficulty } = useGameStore()

  const difficulties = [
    { id: 'easy', label: 'Facile', icon: '🌱' },
    { id: 'medium', label: 'Moyen', icon: '⚡' },
    { id: 'hard', label: 'Difficile', icon: '' }
  ]

  return (
    <div className="difficulty-selector">
      <h3>🎚️ Difficulté IA</h3>
      
      <div className="difficulty-options">
        {difficulties.map(diff => (
          <button
            key={diff.id}
            className={`difficulty-btn ${difficulty === diff.id ? 'active' : ''}`}
            onClick={() => setDifficulty(diff.id)}
          >
            <span className="diff-icon">{diff.icon}</span>
            <span className="diff-label">{diff.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default DifficultySelector