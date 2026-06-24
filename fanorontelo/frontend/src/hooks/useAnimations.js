import { useEffect, useRef } from 'react'

export function useAnimations() {
  const boardRef = useRef(null)

  useEffect(() => {
    if (boardRef.current) {
      boardRef.current.classList.add('animate-in')
    }
  }, [])

  const animateMove = (fromCase, toCase) => {
    // Animation de déplacement du pion
    console.log(`Animation: ${fromCase} -> ${toCase}`)
  }

  const animateWin = (winningLine) => {
    // Animation de victoire
    console.log('Victoire:', winningLine)
  }

  return {
    boardRef,
    animateMove,
    animateWin
  }
}