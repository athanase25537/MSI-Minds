import copy
import uuid
from .constants import *
from .rules import *

class GameState:
    def __init__(self, mode="hvh", level="medium", human_first=True):
        self.game_id = str(uuid.uuid4())
        self.mode = mode
        self.level = level
        self.board = [[EMPTY]*3 for _ in range(3)]
        self.phase = PHASE_PLACEMENT
        self.turn = PLAYER1
        self.winner = None
        self.status = "playing"

        # Compteurs de pions restants à placer (Phase 1)
        self.pieces_left = {PLAYER1: 3, PLAYER2: 3}

        # Qui est humain / IA ? (pour hvia et viavia)
        self.players = {}
        if mode == "hvh":
            self.players = {PLAYER1: "human", PLAYER2: "human"}
        elif mode == "hvia":
            if human_first:
                self.players = {PLAYER1: "human", PLAYER2: "ai"}
            else:
                self.players = {PLAYER1: "ai", PLAYER2: "human"}
        elif mode == "viavia":
            self.players = {PLAYER1: "ai", PLAYER2: "ai"}

    def get_legal_moves(self, player=None):
        """Retourne la liste des coups légaux pour le joueur donné (ou self.turn)."""
        if player is None:
            player = self.turn
        moves = []
        if self.phase == PHASE_PLACEMENT:
            # Placement : toutes les cases vides
            for r in range(3):
                for c in range(3):
                    if self.board[r][c] == EMPTY:
                        moves.append({"row": r, "col": c})
        else:  # PHASE_MOVEMENT
            # Mouvement : pour chaque pion du joueur, cases adjacentes vides
            for r in range(3):
                for c in range(3):
                    if self.board[r][c] == player:
                        for nr, nc in get_adjacent_positions(r, c):
                            if self.board[nr][nc] == EMPTY:
                                moves.append({"from_row": r, "from_col": c, "to_row": nr, "to_col": nc})
        return moves

    def apply_move(self, move):
        """
        Applique un coup (dict). Retourne True si coup valide, False sinon.
        Le dict doit être de la forme :
          - Phase 1 : {"row": r, "col": c}
          - Phase 2 : {"from_row": r, "from_col": c, "to_row": nr, "to_col": nc}
        """
        player = self.turn

        # Vérifier légalité
        if self.phase == PHASE_PLACEMENT:
            if "row" not in move or "col" not in move:
                return False
            r, c = move["row"], move["col"]
            if not is_on_board(r, c) or self.board[r][c] != EMPTY:
                return False
            # Placer le pion
            self.board[r][c] = player
            self.pieces_left[player] -= 1

            # Vérifier victoire immédiate
            if check_winner(self.board, player):
                self.winner = player
                self.status = "finished"
                return True

            # Changer de tour
            self.turn = PLAYER2 if player == PLAYER1 else PLAYER1

            # Vérifier si on passe en Phase 2
            if self.pieces_left[PLAYER1] == 0 and self.pieces_left[PLAYER2] == 0:
                self.phase = PHASE_MOVEMENT

        else:  # PHASE_MOVEMENT
            if "from_row" not in move or "from_col" not in move or "to_row" not in move or "to_col" not in move:
                return False
            fr, fc, tr, tc = move["from_row"], move["from_col"], move["to_row"], move["to_col"]
            if not is_on_board(fr, fc) or not is_on_board(tr, tc):
                return False
            if self.board[fr][fc] != player or self.board[tr][tc] != EMPTY:
                return False
            if (tr, tc) not in get_adjacent_positions(fr, fc):
                return False

            # Déplacer le pion
            self.board[fr][fc] = EMPTY
            self.board[tr][tc] = player

            # Vérifier victoire
            if check_winner(self.board, player):
                self.winner = player
                self.status = "finished"
                return True

            # Changer de tour
            self.turn = PLAYER2 if player == PLAYER1 else PLAYER1

            # Vérifier si le nouveau joueur a des mouvements
            if not self.get_legal_moves(self.turn):
                # Perd par forfait
                self.winner = player  # le joueur précédent gagne
                self.status = "finished"
                return True

        return True

    def get_state_dict(self):
        """Retourne un dictionnaire sérialisable pour l'API."""
        legal = self.get_legal_moves(self.turn)
        # Pour la phase 2, on simplifie en renvoyant seulement les destinations possibles ?
        # On va garder le format complet pour le frontend.
        return {
            "game_id": self.game_id,
            "board": self.board,
            "phase": self.phase,
            "turn": self.turn,
            "status": self.status,
            "winner": self.winner,
            "players": self.players,
            "legal_moves": legal
        }