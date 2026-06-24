# Constantes du jeu
EMPTY = 0
PLAYER1 = 1
PLAYER2 = 2

PHASE_PLACEMENT = 1
PHASE_MOVEMENT = 2

# Directions pour les déplacements (8 voisins)
DIRECTIONS = [
    (-1, -1), (-1, 0), (-1, 1),
    (0, -1),           (0, 1),
    (1, -1),  (1, 0),  (1, 1)
]

# Toutes les lignes gagnantes (3 lignes, 3 colonnes, 2 diagonales)
WINNING_LINES = [
    [(0,0), (0,1), (0,2)],
    [(1,0), (1,1), (1,2)],
    [(2,0), (2,1), (2,2)],
    [(0,0), (1,0), (2,0)],
    [(0,1), (1,1), (2,1)],
    [(0,2), (1,2), (2,2)],
    [(0,0), (1,1), (2,2)],
    [(0,2), (1,1), (2,0)]
]