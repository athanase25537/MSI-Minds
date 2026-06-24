from pydantic import BaseModel
from typing import List, Optional

class MoveRequest(BaseModel):
    row: int
    col: int

class GameStateResponse(BaseModel):
    game_id: str
    board: List[List[int]]          # 3x3
    phase: int                      # 1 ou 2
    turn: int                       # 1 ou 2
    status: str                     # "playing", "finished"
    winner: Optional[int]           # 0, 1, 2
    players: dict                   # {1: "human", 2: "ai"} ou similaire
    legal_moves: List[dict]         # [{row, col}] pour le joueur courant

class NewGameRequest(BaseModel):
    mode: str                       # "hvh", "hvia", "viavia"
    level: Optional[str] = "medium" # "easy", "medium", "hard"
    human_first: Optional[bool] = True  # si hvia, l'humain commence ?