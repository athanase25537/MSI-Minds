import React from 'react'
import Pawn from './Pawn'

function Cell({ index, position, value, isValidMove, isSelected, onClick }) {
  const getCellStyle = () => {
    let style = {
      left: `${position.x}%`,
      top: `${position.y}%`,
      transform: 'translate(-50%, -50%)'
    }

    if (isSelected) {
      style.border = '3px solid #FFD700'
      style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.8)'
    } else if (isValidMove) {
      style.border = '3px dashed #4CAF50'
      style.cursor = 'pointer'
    }

    return style
  }

  const handleClick = (e) => {
    e.stopPropagation()
    onClick()
  }

  return (
    <div 
      className={`cell ${isValidMove ? 'valid-move' : ''} ${isSelected ? 'selected' : ''}`}
      style={getCellStyle()}
      onClick={handleClick}
    >
      {value !== 0 && <Pawn player={value} />}
      {isValidMove && value === 0 && (
        <div className="move-indicator"></div>
      )}
    </div>
  )
}

export default Cell