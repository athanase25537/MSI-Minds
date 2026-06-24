from fastapi import APIRouter, HTTPException, Depends
from ..models.schemas import NewGameRequest, MoveRequest, GameStateResponse
from ..core.game import GameState
from ..ai.ai_player import get_ai_move
import copy

router = APIRouter()

# Stockage en mémoire (à remplacer par une base de données en production)
games = {}

@router.post("/game/new", response_model=dict)
async def new_game(request: NewGameRequest):
    game = GameState(
        mode=request.mode,
        level=request.level,
        human_first=request.human_first
    )
    games[game.game_id] = game
    return {"game_id": game.game_id}

@router.get("/game/{game_id}/state", response_model=dict)
async def get_state(game_id: str):
    game = games.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game.get_state_dict()

@router.post("/game/{game_id}/move", response_model=dict)
async def make_move(game_id: str, move: dict):  # Utilisation de dict pour supporter les deux formats
    game = games.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    if game.status != "playing":
        raise HTTPException(status_code=400, detail="Game is already finished")

    # Vérifier que c'est au tour d'un humain (selon mode)
    if game.players[game.turn] != "human":
        raise HTTPException(status_code=400, detail="It's AI's turn, use /ai-move endpoint")

    # Appliquer le coup
    success = game.apply_move(move)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid move")

    # Vérifier si l'IA doit jouer après ce coup (automatiquement ?)
    # On laisse le frontend appeler /ai-move séparément si besoin.
    return game.get_state_dict()

@router.post("/game/{game_id}/ai-move", response_model=dict)
async def ai_move(game_id: str):
    game = games.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    if game.status != "playing":
        raise HTTPException(status_code=400, detail="Game is already finished")

    if game.players[game.turn] != "ai":
        raise HTTPException(status_code=400, detail="It's human's turn, use /move endpoint")

    # L'IA joue
    move = get_ai_move(game, level=game.level)
    if move is None:
        # Aucun coup légal => défaite (détecté dans apply_move)
        # On peut forcer la défaite
        game.status = "finished"
        # winner est déjà set dans apply_move ? On va le faire
        game.winner = PLAYER2 if game.turn == PLAYER1 else PLAYER1
        game.status = "finished"
        return game.get_state_dict()

    success = game.apply_move(move)
    if not success:
        # Normalement ne devrait pas arriver
        raise HTTPException(status_code=400, detail="AI produced an illegal move")

    # Si après le coup de l'IA, c'est encore à l'IA (mode viavia), on peut enchaîner
    # Mais on laisse le frontend gérer cela en boucle.
    return game.get_state_dict()

@router.post("/game/{game_id}/reset", response_model=dict)
async def reset_game(game_id: str):
    game = games.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    # Réinitialiser avec les mêmes paramètres
    new_game = GameState(mode=game.mode, level=game.level, human_first=(game.players[PLAYER1]=="human"))
    games[game_id] = new_game
    return {"game_id": game_id, "message": "Game reset"}