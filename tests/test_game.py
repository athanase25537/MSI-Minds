import pytest
from app.core.game import GameState
from app.core.constants import *

def test_initial_state():
    game = GameState()
    assert game.board == [[EMPTY]*3 for _ in range(3)]
    assert game.phase == PHASE_PLACEMENT
    assert game.turn == PLAYER1
    assert game.status == "playing"

def test_placement_move():
    game = GameState()
    move = {"row": 0, "col": 0}
    assert game.apply_move(move) == True
    assert game.board[0][0] == PLAYER1
    assert game.turn == PLAYER2

def test_winning_detection_placement():
    game = GameState()
    # Joueur 1 place trois pions alignés
    game.apply_move({"row":0, "col":0})  # P1
    game.apply_move({"row":1, "col":0})  # P2
    game.apply_move({"row":0, "col":1})  # P1
    game.apply_move({"row":1, "col":1})  # P2
    game.apply_move({"row":0, "col":2})  # P1 -> alignement ligne 0
    assert game.status == "finished"
    assert game.winner == PLAYER1