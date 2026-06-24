import React from 'react'

function Pawn({ player }) {
  const pawnClass = player === 1 ? 'pawn-blue' : 'pawn-yellow'
  const pawnImage = player === 1 ? '/assets/pawn-blue.svg' : '/assets/pawn-yellow.svg'

  return (
    <div className={`pawn ${pawnClass}`}>
      <img src={pawnImage} alt={`Pion ${player}`} draggable={false} />
    </div>
  )
}

export default Pawn