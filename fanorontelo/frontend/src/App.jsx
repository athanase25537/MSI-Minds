import React, { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import Board from './components/Board'
import StatusPanel from './components/StatusPanel'
import GameControls from './components/GameControls'
import ModeSelector from './components/ModeSelector'
import DifficultySelector from './components/DifficultySelector'
import AIThinking from './components/AIThinking'
import './styles/board.css'
import './styles/animations.css'

function App() {
  const { 
    gameMode, 
    difficulty, 
    aiThinking, 
    winner,
    initializeGame 
  } = useGameStore()

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🎮 Fanoron-telo</h1>
        <p className="subtitle">Hackathon IA - ISP Madagascar</p>
      </header>

      <main className="game-container">
        <div className="game-sidebar">
          <ModeSelector />
          {gameMode === 'human-vs-ai' && <DifficultySelector />}
          <StatusPanel />
          <GameControls />
        </div>

        <div className="game-board-wrapper">
          {aiThinking && <AIThinking />}
          <Board />
          {winner && (
            <div className="winner-overlay">
              <div className="winner-card">
                <h2>🏆 Victoire !</h2>
                <p>Joueur {winner === 1 ? 'Bleu' : 'Pink'} gagne !</p>
                <button onClick={() => initializeGame()}>
                  Nouvelle Partie
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
