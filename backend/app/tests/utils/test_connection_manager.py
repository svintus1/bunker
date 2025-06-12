import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi import WebSocket


def test_connect_adds_websocket(manager, lobby_id, websocket):
    import asyncio

    asyncio.run(manager.connect(lobby_id, websocket))
    assert websocket in manager.active_connections[lobby_id]


def test_disconnect_removes_websocket(manager, lobby_id, websocket):
    import asyncio

    asyncio.run(manager.connect(lobby_id, websocket))
    manager.disconnect(lobby_id, websocket)
    assert websocket not in manager.active_connections[lobby_id]

@pytest.mark.asyncio
async def test_unicast_json(manager, websocket):
    data = {"msg": "hello"}
    await manager.unicast_json(data, websocket)
    websocket.send_json.assert_awaited_once_with(data)

@pytest.mark.asyncio
async def test_unicast_text(manager, websocket):
    data = "hello"
    await manager.unicast_text(data, websocket)
    websocket.send_text.assert_awaited_once_with(data)


def test_parse_exclude_none(manager, websocket):
    result = manager._parse_exclude()
    assert result == set()


def test_parse_exclude_single(manager, websocket):
    result = manager._parse_exclude(websocket)
    assert result == {websocket}


def test_parse_exclude_set(manager, websocket):
    ws2 = MagicMock(spec=WebSocket)
    ws_set = {websocket, ws2}
    result = manager._parse_exclude(ws_set)
    assert result == ws_set


def test_parse_exclude_invalid(manager):
    with pytest.raises(TypeError):
        manager._parse_exclude(123)

@pytest.mark.asyncio
async def test_broadcast_json(manager, lobby_id):
    ws1 = AsyncMock(spec=WebSocket)
    ws2 = AsyncMock(spec=WebSocket)
    await manager.connect(lobby_id, ws1)
    await manager.connect(lobby_id, ws2)
    data = {"msg": "broadcast"}
    await manager.broadcast_json(data, lobby_id)
    ws1.send_json.assert_awaited_once_with(data)
    ws2.send_json.assert_awaited_once_with(data)

@pytest.mark.asyncio
async def test_broadcast_json_with_exclude(manager, lobby_id):
    ws1 = AsyncMock(spec=WebSocket)
    ws2 = AsyncMock(spec=WebSocket)
    await manager.connect(lobby_id, ws1)
    await manager.connect(lobby_id, ws2)
    data = {"msg": "broadcast"}
    await manager.broadcast_json(data, lobby_id, exclude=ws1)
    ws1.send_json.assert_not_awaited()
    ws2.send_json.assert_awaited_once_with(data)

@pytest.mark.asyncio
async def test_broadcast_text(manager, lobby_id):
    ws1 = AsyncMock(spec=WebSocket)
    ws2 = AsyncMock(spec=WebSocket)
    await manager.connect(lobby_id, ws1)
    await manager.connect(lobby_id, ws2)
    data = "broadcast"
    await manager.broadcast_text(data, lobby_id)
    ws1.send_text.assert_awaited_once_with(data)


@pytest.mark.asyncio
async def test_broadcast_text_with_exclude(manager, lobby_id):
    ws1 = AsyncMock(spec=WebSocket)
    ws2 = AsyncMock(spec=WebSocket)
    await manager.connect(lobby_id, ws1)
    await manager.connect(lobby_id, ws2)
    data = "broadcast"
    await manager.broadcast_text(data, lobby_id, exclude={ws2})
    ws1.send_text.assert_awaited_once_with(data)
    ws2.send_text.assert_not_awaited()
