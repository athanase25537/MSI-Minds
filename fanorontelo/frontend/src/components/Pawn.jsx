import React from 'react'

function Pawn({ player }) {
  const pawnClass = player === 1 ? 'pawn-blue' : 'pawn-pink'
  const pawnImage = player === 1 ? '/assets/pawn-blue.svg' : '/assets/pawn-pink.svg'

  return (
    <div className={`pawn ${pawnClass}`}>
      <img src={pawnImage} alt={`Pion joueur ${player}`} />
    </div>
  )
}

export default Pawn