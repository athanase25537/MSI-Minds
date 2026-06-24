from fastapi import Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..api.game_services import GameService

def get_game_service(db: Session = Depends(get_db)) -> GameService:
    return GameService(db)