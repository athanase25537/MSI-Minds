import copy
from ..core.game import GameState
from ..core.constants import *
from ..core.rules import check_winner
from .heuristic import evaluate_board

def minimax(state, depth, is_maximizing, player, alpha=-float('inf'), beta=float('inf'), use_alpha_beta=True):
    """
    Retourne (score, move) pour le joueur 'player'.
    """
    opponent = PLAYER2 if player == PLAYER1 else PLAYER1
    board = state.board

    # Vérifier les états terminaux (victoire ou défaite)
    if check_winner(board, player):
        return 1000 + depth, None
    if check_winner(board, opponent):
        return -1000 - depth, None

    # Vérifier le blocage : si le joueur n'a aucun coup, il perd
    # On peut détecter via get_legal_moves()
    if depth == 0:
        return evaluate_board(board, player), None

    # Générer les coups légaux pour le joueur courant
    # On clone l'état pour ne pas le modifier
    current_state = copy.deepcopy(state)
    # On ajuste le tour pour que les coups soient générés pour le joueur courant
    # Mais dans minimax, le joueur courant est celui dont c'est le tour.
    # On suppose que state.turn est celui qui doit jouer.
    # On va donc appeler get_legal_moves() sur state.
    moves = state.get_legal_moves(player)  # On passe le joueur explicitement

    # Si aucun coup, c'est une défaite
    if not moves:
        if player == state.turn:
            # C'est le joueur qui doit jouer et n'a pas de coup -> il perd
            return -1000 - depth, None
        else:
            return 1000 + depth, None

    best_move = moves[0]
    if is_maximizing:
        best_score = -float('inf')
        for move in moves:
            # Appliquer le coup sur une copie
            new_state = copy.deepcopy(state)
            new_state.apply_move(move)
            # Récursivité (le tour change, le joueur minimisant)
            score, _ = minimax(new_state, depth-1, False, player, alpha, beta, use_alpha_beta)
            if score > best_score:
                best_score = score
                best_move = move
            if use_alpha_beta:
                alpha = max(alpha, best_score)
                if beta <= alpha:
                    break
        return best_score, best_move
    else:
        best_score = float('inf')
        for move in moves:
            new_state = copy.deepcopy(state)
            new_state.apply_move(move)
            score, _ = minimax(new_state, depth-1, True, player, alpha, beta, use_alpha_beta)
            if score < best_score:
                best_score = score
                best_move = move
            if use_alpha_beta:
                beta = min(beta, best_score)
                if beta <= alpha:
                    break
        return best_score, best_move