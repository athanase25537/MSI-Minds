from fastapi import APIRouter, HTTPException, Depends
from ..models.schemas import NewGameRequest
from ..api.game_services import GameService

router = APIRouter()

# Dependency to get a service instance (could also be a singleton)
def get_game_service():
    # In production you might use a global instance or a factory
    return GameService()


@router.post("/game/new", response_model=dict)
async def new_game(
    request: NewGameRequest,
    service: GameService = Depends(get_game_service)
):
    game_id = service.create_game(request)
    return {"game_id": game_id}


@router.get("/game/{game_id}/state", response_model=dict)
async def get_state(
    game_id: str,
    service: GameService = Depends(get_game_service)
):
    try:
        return service.get_state_dict(game_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/game/{game_id}/move", response_model=dict)
async def make_move(
    game_id: str,
    move: dict,  # accepts both full and simple move formats
    service: GameService = Depends(get_game_service)
):
    try:
        return service.make_move(game_id, move)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/game/{game_id}/ai-move", response_model=dict)
async def ai_move(
    game_id: str,
    service: GameService = Depends(get_game_service)
):
    try:
        return service.ai_move(game_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/game/{game_id}/reset", response_model=dict)
async def reset_game(
    game_id: str,
    service: GameService = Depends(get_game_service)
):
    try:
        new_id = service.reset_game(game_id)
        return {"game_id": new_id, "message": "Game reset"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))