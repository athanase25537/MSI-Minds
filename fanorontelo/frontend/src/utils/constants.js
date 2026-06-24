// Positions des cases sur le plateau (en pourcentage)
export const CASE_POSITIONS = [
  { x: 16.67, y: 16.67 },  // Case 0 (haut-gauche)
  { x: 50, y: 16.67 },     // Case 1 (haut-centre)
  { x: 83.33, y: 16.67 },  // Case 2 (haut-droite)
  { x: 16.67, y: 50 },     // Case 3 (milieu-gauche)
  { x: 50, y: 50 },        // Case 4 (centre)
  { x: 83.33, y: 50 },     // Case 5 (milieu-droite)
  { x: 16.67, y: 83.33 },  // Case 6 (bas-gauche)
  { x: 50, y: 83.33 },     // Case 7 (bas-centre)
  { x: 83.33, y: 83.33 }   // Case 8 (bas-droite)
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

// Valeurs des cases
export const EMPTY = 0
export const PLAYER1 = 1
export const PLAYER2 = 2

// Configuration API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  TIMEOUT: 10000
}