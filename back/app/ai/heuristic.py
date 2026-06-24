from ..core.constants import *
from ..core.rules import check_winner, get_adjacent_positions

def evaluate_board(board, player):
    """
    Heuristique pour la position du joueur 'player'.
    Retourne un score positif si le joueur est avantagé.
    """
    opponent = PLAYER2 if player == PLAYER1 else PLAYER1

    # 1. Alignements potentiels (lignes avec 2 pions + 1 vide)
    player_lines = 0
    opponent_lines = 0
    for line in WINNING_LINES:
        cells = [board[r][c] for r, c in line]
        if cells.count(player) == 2 and cells.count(EMPTY) == 1:
            player_lines += 1
        if cells.count(opponent) == 2 and cells.count(EMPTY) == 1:
            opponent_lines += 1

    # 2. Contrôle du centre (b2)
    center_bonus = 2 if board[1][1] == player else 0
    center_penalty = 2 if board[1][1] == opponent else 0

    # 3. Mobilité (nombre de mouvements disponibles)
    # Pour évaluer la mobilité on simule rapidement ?
    # On peut compter les mouvements possibles pour chaque joueur.
    player_mobility = 0
    opponent_mobility = 0
    for r in range(3):
        for c in range(3):
            if board[r][c] == player:
                for nr, nc in get_adjacent_positions(r, c):
                    if board[nr][nc] == EMPTY:
                        player_mobility += 1
            elif board[r][c] == opponent:
                for nr, nc in get_adjacent_positions(r, c):
                    if board[nr][nc] == EMPTY:
                        opponent_mobility += 1

    # Score final
    score = (10 * player_lines - 10 * opponent_lines) + center_bonus - center_penalty + (3 * player_mobility - 3 * opponent_mobility)
    return score