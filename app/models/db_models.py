from sqlalchemy import Column, String, Integer, JSON, Boolean, DateTime
from sqlalchemy.sql import func
from ..db import Base

class GameModel(Base):
    __tablename__ = "games"

    game_id = Column(String, primary_key=True, index=True)
    mode = Column(String, nullable=False)
    level = Column(String, nullable=False)
    human_first = Column(Boolean, nullable=False)

    board = Column(JSON, nullable=False)         # Liste 3x3
    phase = Column(Integer, nullable=False)
    turn = Column(Integer, nullable=False)
    winner = Column(Integer, nullable=True)
    status = Column(String, nullable=False)      # "playing", "finished"

    pieces_left = Column(JSON, nullable=False)   # {1: n, 2: n}
    players = Column(JSON, nullable=False)       # {1: "human"/"ai", ...}

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())