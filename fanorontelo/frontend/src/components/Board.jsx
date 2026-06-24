import React from 'react'
import { useGameStore } from '../store/gameStore'
import Cell from './Cell'
import { CASE_POSITIONS } from '../utils/constants'

function Board() {
  const { board, selectedCase, handleCaseClick, validMoves } = useGameStore()

  const getCaseValue = (caseIndex) => {
    return (board >> (caseIndex * 2)) & 0b11
  }

  return (
    <div className="board">
      <div className="board-grid">
        {CASE_POSITIONS.map((position, index) => {
          const value = getCaseValue(index)
          const isValidMove = validMoves.includes(index)
          const isSelected = selectedCase === index

          return (
            <Cell
              key={index}
              index={index}
              position={position}
              value={value}
              isValidMove={isValidMove}
              isSelected={isSelected}
              onClick={() => handleCaseClick(index)}
            />
          )
        })}
      </div>
      
      {/* Lignes du plateau (SVG overlay) */}
      <svg className="board-lines" viewBox="0 0 400 400">
        {/* Lignes horizontales */}
        <line x1="66.67" y1="66.67" x2="333.33" y2="66.67" stroke="#333" strokeWidth="3"/>
        <line x1="66.67" y1="200" x2="333.33" y2="200" stroke="#333" strokeWidth="3"/>
        <line x1="66.67" y1="333.33" x2="333.33" y2="333.33" stroke="#333" strokeWidth="3"/>
        
        {/* Lignes verticales */}
        <line x1="66.67" y1="66.67" x2="66.67" y2="333.33" stroke="#333" strokeWidth="3"/>
        <line x1="200" y1="66.67" x2="200" y2="333.33" stroke="#333" strokeWidth="3"/>
        <line x1="333.33" y1="66.67" x2="333.33" y2="333.33" stroke="#333" strokeWidth="3"/>
        
        {/* Diagonales */}
        <line x1="66.67" y1="66.67" x2="333.33" y2="333.33" stroke="#333" strokeWidth="3"/>
        <line x1="333.33" y1="66.67" x2="66.67" y2="333.33" stroke="#333" strokeWidth="3"/>
      </svg>
    </div>
  )
}

export default Board