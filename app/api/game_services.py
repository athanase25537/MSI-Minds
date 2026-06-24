from typing import Dict
from ..core.game import GameState, PLAYER1, PLAYER2
from ..ai.ai_player import get_ai_move
from ..models.schemas import NewGameRequest


class GameService:
    """In-memory game management service."""
    
    def __init__(self):
        self._games: Dict[str, GameState] = {}

    def create_game(self, request: NewGameRequest) -> str:
        """Create a new game and return its ID."""
        game = GameState(
            mode=request.mode,
            level=request.level,
            human_first=request.human_first
        )
        self._games[game.game_id] = game
        return game.game_id

    def get_game(self, game_id: str) -> GameState:
        """Retrieve a game by ID. Raises ValueError if not found."""
        game = self._games.get(game_id)
        if not game:
            raise ValueError("Game not found")
        return game

    def get_state_dict(self, game_id: str) -> dict:
        """Return the game state as a dictionary."""
        game = self.get_game(game_id)
        return game.get_state_dict()

    def make_move(self, game_id: str, move: dict) -> dict:
        """
        Apply a human move.
        Raises ValueError if game is finished, it's not human's turn, or move is invalid.
        """
        game = self.get_game(game_id)
        if game.status != "playing":
            raise ValueError("Game is already finished")
        if game.players[game.turn] != "human":
            raise ValueError("It's AI's turn, use AI move endpoint")
        success = game.apply_move(move)
        if not success:
            raise ValueError("Invalid move")
        return game.get_state_dict()

    def ai_move(self, game_id: str) -> dict:
        """
        Let the AI play a move.
        Raises ValueError if game is finished, it's not AI's turn, or AI produces an illegal move.
        """
        game = self.get_game(game_id)
        if game.status != "playing":
            raise ValueError("Game is already finished")
        if game.players[game.turn] != "ai":
            raise ValueError("It's human's turn, use move endpoint")

        move = get_ai_move(game, level=game.level)
        if move is None:
            # No legal move – opponent wins
            game.status = "finished"
            game.winner = PLAYER2 if game.turn == PLAYER1 else PLAYER1
            return game.get_state_dict()

        success = game.apply_move(move)
        if not success:
            raise ValueError("AI produced an illegal move")
        return game.get_state_dict()

    def reset_game(self, game_id: str) -> str:
        """
        Reset an existing game to a fresh state with the same parameters.
        Returns the new game ID (same as the old one).
        """
        old_game = self.get_game(game_id)
        new_game = GameState(
            mode=old_game.mode,
            level=old_game.level,
            human_first=(old_game.players[PLAYER1] == "human")
        )
        self._games[game_id] = new_game
        return game_id