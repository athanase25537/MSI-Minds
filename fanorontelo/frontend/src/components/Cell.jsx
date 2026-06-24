import React from 'react'
import Pawn from './Pawn'

function Cell({ index, position, value, isValidMove, isSelected, isWinning, isLastMove, onClick }) {
  const style = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: 'translate(-50%, -50%)'
  }

  const className = [
    'cell',
    isValidMove && 'valid-move',
    isSelected && 'selected',
    isWinning && 'winning'
  ].filter(Boolean).join(' ')

  return (
    <div className={className} style={style} onClick={onClick}>
      {value !== 0 && <Pawn player={value} />}
      {isValidMove && value === 0 && <div className="move-indicator"></div>}
    </div>
  )
}

export default Cell