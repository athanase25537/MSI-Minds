from typing import Dict, Set, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # game_id -> dict { player: websocket }
        self.active_connections: Dict[str, Dict[int, WebSocket]] = {}

    async def connect(self, game_id: str, player: int, websocket: WebSocket):
        await websocket.accept()
        if game_id not in self.active_connections:
            self.active_connections[game_id] = {}
        self.active_connections[game_id][player] = websocket

    def disconnect(self, game_id: str, player: int):
        if game_id in self.active_connections:
            self.active_connections[game_id].pop(player, None)
            if not self.active_connections[game_id]:
                del self.active_connections[game_id]

    async def broadcast(self, game_id: str, message: dict):
        if game_id in self.active_connections:
            for ws in self.active_connections[game_id].values():
                await ws.send_json(message)

    async def send_to_player(self, game_id: str, player: int, message: dict):
        if game_id in self.active_connections:
            ws = self.active_connections[game_id].get(player)
            if ws:
                await ws.send_json(message)

manager = ConnectionManager()