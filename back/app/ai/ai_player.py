import random
from .minimax import minimax
from ..core.game import GameState

def get_ai_move(state, level="medium"):
    """
    Retourne un coup (dict) pour le joueur dont c'est le tour.
    """
    if level == "easy":
        moves = state.get_legal_moves()
        if moves:
            return random.choice(moves)
        return None
    elif level == "medium":
        # Minimax profondeur 3
        _, move = minimax(state, depth=3, is_maximizing=True, player=state.turn, use_alpha_beta=False)
        return move
    elif level == "hard":
        # Alpha-Beta profondeur 6
        _, move = minimax(state, depth=6, is_maximizing=True, player=state.turn, use_alpha_beta=True)
        return move
    else:
        # fallback
        moves = state.get_legal_moves()
        if moves:
            return random.choice(moves)
        return None