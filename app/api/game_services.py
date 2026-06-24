from typing import Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound
import json

from ..core.game import GameState
from ..models.schemas import NewGameRequest
from ..models.db_models import GameModel
from ..core.constants import PLAYER1, PLAYER2
from ..ai.ai_player import get_ai_move

class GameService:
    def __init__(self, db: Session):
        self.db = db

    def _model_to_game(self, model: GameModel) -> GameState:
        """Reconstruire un GameState à partir d'un modèle DB."""
        game = GameState.__new__(GameState)
        game.game_id = model.game_id
        game.mode = model.mode
        game.level = model.level
        game.board = model.board
        game.phase = model.phase
        game.turn = model.turn
        game.winner = model.winner
        game.status = model.status
        # Convertir les clés des JSON en int
        game.pieces_left = {int(k): v for k, v in model.pieces_left.items()} if model.pieces_left else {}
        game.players = {int(k): v for k, v in model.players.items()} if model.players else {}
        return game

    def _game_to_model(self, game: GameState, model: Optional[GameModel] = None) -> GameModel:
        """Convertir un GameState en modèle DB (création ou mise à jour)."""
        if model is None:
            model = GameModel(game_id=game.game_id)
        model.mode = game.mode
        model.level = game.level
        model.human_first = (game.players.get(PLAYER1) == "human")  # ou selon paramètre
        model.board = game.board
        model.phase = game.phase
        model.turn = game.turn
        model.winner = game.winner
        model.status = game.status
        model.pieces_left = game.pieces_left
        model.players = game.players
        return model

    def create_game(self, request: NewGameRequest) -> str:
        game = GameState(
            mode=request.mode,
            level=request.level,
            human_first=request.human_first
        )
        model = self._game_to_model(game)
        self.db.add(model)
        self.db.commit()
        return game.game_id

    def get_game(self, game_id: str) -> GameState:
        model = self.db.query(GameModel).filter(GameModel.game_id == game_id).first()
        if not model:
            raise ValueError("Game not found")
        return self._model_to_game(model)

    def get_state_dict(self, game_id: str) -> dict:
        game = self.get_game(game_id)
        return game.get_state_dict()

    def _save_game(self, game: GameState):
        """Mettre à jour le modèle DB à partir d'un GameState."""
        model = self.db.query(GameModel).filter(GameModel.game_id == game.game_id).first()
        if not model:
            raise ValueError("Game not found in DB")
        updated_model = self._game_to_model(game, model)
        self.db.merge(updated_model)
        self.db.commit()

    def make_move(self, game_id: str, move: dict) -> dict:
        game = self.get_game(game_id)
        if game.status != "playing":
            raise ValueError("Game is already finished")
        if game.players[game.turn] != "human":
            raise ValueError("It's AI's turn, use AI move endpoint")
        success = game.apply_move(move)
        if not success:
            raise ValueError("Invalid move")
        self._save_game(game)
        return game.get_state_dict()

    def ai_move(self, game_id: str) -> dict:
        game = self.get_game(game_id)
        if game.status != "playing":
            raise ValueError("Game is already finished")
        if game.players[game.turn] != "ai":
            raise ValueError("It's human's turn, use move endpoint")

        move = get_ai_move(game, level=game.level)
        if move is None:
            game.status = "finished"
            game.winner = PLAYER2 if game.turn == PLAYER1 else PLAYER1
            self._save_game(game)
            return game.get_state_dict()

        success = game.apply_move(move)
        if not success:
            raise ValueError("AI produced an illegal move")
        self._save_game(game)
        return game.get_state_dict()

    def reset_game(self, game_id: str) -> str:
        old = self.get_game(game_id)
        # Créer une nouvelle partie avec les mêmes paramètres
        request = NewGameRequest(
            mode=old.mode,
            level=old.level,
            human_first=(old.players[PLAYER1] == "human")
        )
        new_game = GameState(
            mode=request.mode,
            level=request.level,
            human_first=request.human_first
        )
        # Garder le même game_id en supprimant l'ancien et en créant un nouveau
        self.db.query(GameModel).filter(GameModel.game_id == game_id).delete()
        model = self._game_to_model(new_game)
        model.game_id = game_id  # on force le même ID
        self.db.add(model)
        self.db.commit()
        return game_id