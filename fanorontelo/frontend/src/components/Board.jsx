import React from 'react'
import { useGameStore } from '../store/gameStore'
import Cell from './Cell'
import { CASE_POSITIONS } from '../utils/constants'

function Board() {
  const { board, selectedCase, handleCaseClick, validMoves, winningLine, lastMove } = useGameStore()

  const getCaseValue = (caseIndex) => (board >> (caseIndex * 2)) & 0b11

  return (
    <div className="board">
      <div className="board-grid">
        {CASE_POSITIONS.map((position, index) => {
          const value = getCaseValue(index)
          const isValidMove = validMoves.includes(index)
          const isSelected = selectedCase === index
          const isWinning = winningLine && winningLine.includes(index)
          const isLastMove = lastMove && (lastMove.to_case === index)

          return (
            <Cell
              key={index}
              index={index}
              position={position}
              value={value}
              isValidMove={isValidMove}
              isSelected={isSelected}
              isWinning={isWinning}
              isLastMove={isLastMove}
              onClick={() => handleCaseClick(index)}
            />
          )
        })}
      </div>
      <svg className="board-lines" viewBox="0 0 550 550" preserveAspectRatio="none">
        {/* Lignes horizontales */}
        <line x1="110" y1="110" x2="440" y2="110"/>
        <line x1="110" y1="275" x2="440" y2="275"/>
        <line x1="110" y1="440" x2="440" y2="440"/>
        
        {/* Lignes verticales */}
        <line x1="110" y1="110" x2="110" y2="440"/>
        <line x1="275" y1="110" x2="275" y2="440"/>
        <line x1="440" y1="110" x2="440" y2="440"/>
        
        {/* Diagonales */}
        <line x1="110" y1="110" x2="440" y2="440"/>
        <line x1="440" y1="110" x2="110" y2="440"/>
      </svg>
    </div>
  )
}

export default Board