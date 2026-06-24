from pydantic import BaseModel, field_validator, model_validator
from typing import List, Optional

class MoveRequest(BaseModel):
    row: Optional[int] = None
    col: Optional[int] = None
    from_row: Optional[int] = None
    from_col: Optional[int] = None
    to_row: Optional[int] = None
    to_col: Optional[int] = None

    @field_validator('row', 'col', 'from_row', 'from_col', 'to_row', 'to_col')
    @classmethod
    def check_bounds(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (0 <= v <= 2):
            raise ValueError('Coordinate must be between 0 and 2')
        return v

    @model_validator(mode='after')
    def validate_move_type(self) -> 'MoveRequest':
        has_placement = self.row is not None or self.col is not None
        has_movement = any(getattr(self, k) is not None for k in ('from_row','from_col','to_row','to_col'))
        
        if has_placement and has_movement:
            raise ValueError('Cannot mix placement and movement fields')
        if has_placement:
            if self.row is None or self.col is None:
                raise ValueError('Placement requires both row and col')
        elif has_movement:
            missing = [k for k in ('from_row','from_col','to_row','to_col') if getattr(self, k) is None]
            if missing:
                raise ValueError(f'Movement requires all four fields, missing: {missing}')
        else:
            raise ValueError('Move must be either placement or movement')
        return self

    def to_dict(self) -> dict:
        """Retourne le dictionnaire des champs non nuls."""
        return {k: v for k, v in self.model_dump().items() if v is not None}

class GameStateResponse(BaseModel):
    game_id: str
    board: List[List[int]]
    phase: int
    turn: int
    status: str
    winner: Optional[int]
    players: dict
    legal_moves: List[dict]

class NewGameRequest(BaseModel):
    mode: str
    level: Optional[str] = "medium"
    human_first: Optional[bool] = True