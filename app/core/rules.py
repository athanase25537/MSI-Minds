from .constants import *

def is_on_board(row, col):
    return 0 <= row < 3 and 0 <= col < 3

def get_adjacent_positions(row, col):
    """Retourne les cases adjacentes (8 directions) dans les limites."""
    result = []
    for dr, dc in DIRECTIONS:
        nr, nc = row + dr, col + dc
        if is_on_board(nr, nc):
            result.append((nr, nc))
    return result

def check_winner(board, player):
    """Vérifie si le joueur donné a un alignement gagnant."""
    for line in WINNING_LINES:
        if all(board[r][c] == player for r, c in line):
            return True
    return False

def is_board_full(board):
    return all(cell != EMPTY for row in board for cell in row)