// Positions des cases en PIXELS (pour un plateau de 550x550)
// Centre du plateau = 275px, espacement = 165px
export const CASE_POSITIONS = [
  { x: 110, y: 110 },  // Case 0 (haut-gauche)
  { x: 275, y: 110 },  // Case 1 (haut-centre)
  { x: 440, y: 110 },  // Case 2 (haut-droite)
  { x: 110, y: 275 },  // Case 3 (milieu-gauche)
  { x: 275, y: 275 },  // Case 4 (centre)
  { x: 440, y: 275 },  // Case 5 (milieu-droite)
  { x: 110, y: 440 },  // Case 6 (bas-gauche)
  { x: 275, y: 440 },  // Case 7 (bas-centre)
  { x: 440, y: 440 }   // Case 8 (bas-droite)
]

// Masques de victoire (lignes de 3 cases)
export const WIN_CASES = [
  [0, 1, 2],  // Ligne 0
  [3, 4, 5],  // Ligne 1
  [6, 7, 8],  // Ligne 2
  [0, 3, 6],  // Colonne 0
  [1, 4, 7],  // Colonne 1
  [2, 5, 8],  // Colonne 2
  [0, 4, 8],  // Diagonale \
  [2, 4, 6]   // Diagonale /
]

// Cases adjacentes pour chaque case (Phase 2)
export const ADJACENCY = {
  0: [1, 3, 4],
  1: [0, 2, 4],
  2: [1, 4, 5],
  3: [0, 4, 6],
  4: [0, 1, 2, 3, 5, 6, 7, 8],
  5: [2, 4, 8],
  6: [3, 4, 7],
  7: [4, 6, 8],
  8: [4, 5, 7]
}