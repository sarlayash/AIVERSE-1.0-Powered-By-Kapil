const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');
const archiver = require('archiver');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

const PORT = process.env.PORT || 3000;

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// API endpoint to download the entire application as an offline-ready ZIP file
app.get('/api/download-app-zip', (req, res) => {
  res.attachment('AIVERSE-1.0-Powered-By-Kapil-SARLAYASH.zip');
  
  let archive;
  if (typeof archiver === 'function') {
    archive = archiver('zip', { zlib: { level: 9 } });
  } else if (archiver.ZipArchive) {
    archive = new archiver.ZipArchive({ zlib: { level: 9 } });
  }

  archive.on('error', (err) => {
    res.status(500).send({ error: err.message });
  });

  archive.pipe(res);

  // Add all files from public directory
  archive.directory(path.join(__dirname, 'public/'), 'AIVERSE-1.0');
  
  // Add launcher batch script
  const launcherContent = `@echo off
echo ========================================================
echo   SARLAYASH PRODUCTIONS PRESENTS
echo   AIVERSE 1.0 - Powered By Kapil
echo   The Epic AI, GenAI & Agentic AI Video Game!
echo ========================================================
start "" "%~dp0index.html"
exit
`;
  archive.append(launcherContent, { name: 'AIVERSE-1.0/Launch-Game.bat' });

  archive.finalize();
});

// Multiplayer Room Management
// Rooms map: roomCode -> { hostWs, guestWs, gameState, turn, roomCode }
const rooms = new Map();

wss.on('connection', (ws) => {
  let currentRoom = null;
  let playerRole = null; // 'P1' (Host) or 'P2' (Guest)

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'CREATE_ROOM': {
          const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
          rooms.set(roomCode, {
            hostWs: ws,
            guestWs: null,
            roomCode,
            status: 'WAITING',
            turn: 'P1'
          });
          currentRoom = roomCode;
          playerRole = 'P1';

          ws.send(JSON.stringify({
            type: 'ROOM_CREATED',
            roomCode,
            role: 'P1'
          }));
          break;
        }

        case 'JOIN_ROOM': {
          const targetCode = (data.roomCode || '').toUpperCase().trim();
          const room = rooms.get(targetCode);

          if (!room) {
            ws.send(JSON.stringify({ type: 'ERROR', message: `Room "${targetCode}" not found!` }));
            return;
          }

          if (room.guestWs && room.guestWs.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Room is already full!' }));
            return;
          }

          room.guestWs = ws;
          room.status = 'READY';
          currentRoom = targetCode;
          playerRole = 'P2';

          // Notify guest
          ws.send(JSON.stringify({
            type: 'ROOM_JOINED',
            roomCode: targetCode,
            role: 'P2'
          }));

          // Notify host
          if (room.hostWs && room.hostWs.readyState === WebSocket.OPEN) {
            room.hostWs.send(JSON.stringify({
              type: 'OPPONENT_JOINED',
              roomCode: targetCode,
              opponentRole: 'P2'
            }));
          }

          // Broadcast match start
          const startMsg = JSON.stringify({
            type: 'GAME_START',
            turn: room.turn,
            roomCode: targetCode
          });
          ws.send(startMsg);
          room.hostWs.send(startMsg);
          break;
        }

        case 'SYNC_MOVE': {
          if (!currentRoom || !rooms.has(currentRoom)) return;
          const room = rooms.get(currentRoom);

          // Relay move to other player
          const recipient = playerRole === 'P1' ? room.guestWs : room.hostWs;
          if (recipient && recipient.readyState === WebSocket.OPEN) {
            recipient.send(JSON.stringify({
              type: 'OPPONENT_MOVE',
              moveData: data.moveData,
              sender: playerRole
            }));
          }
          break;
        }

        case 'SYNC_BOARD': {
          if (!currentRoom || !rooms.has(currentRoom)) return;
          const room = rooms.get(currentRoom);
          const recipient = playerRole === 'P1' ? room.guestWs : room.hostWs;
          if (recipient && recipient.readyState === WebSocket.OPEN) {
            recipient.send(JSON.stringify({
              type: 'REMOTE_BOARD_SYNC',
              boardState: data.boardState,
              sender: playerRole
            }));
          }
          break;
        }

        case 'CHAT_MSG': {
          if (!currentRoom || !rooms.has(currentRoom)) return;
          const room = rooms.get(currentRoom);
          const recipient = playerRole === 'P1' ? room.guestWs : room.hostWs;
          if (recipient && recipient.readyState === WebSocket.OPEN) {
            recipient.send(JSON.stringify({
              type: 'CHAT_MSG',
              sender: playerRole,
              text: data.text
            }));
          }
          break;
        }

        case 'RESTART_REQUEST': {
          if (!currentRoom || !rooms.has(currentRoom)) return;
          const room = rooms.get(currentRoom);
          const recipient = playerRole === 'P1' ? room.guestWs : room.hostWs;
          if (recipient && recipient.readyState === WebSocket.OPEN) {
            recipient.send(JSON.stringify({
              type: 'RESTART_REQUEST',
              sender: playerRole
            }));
          }
          break;
        }
      }
    } catch (e) {
      console.error('WebSocket message parsing error:', e);
    }
  });

  ws.on('close', () => {
    if (currentRoom && rooms.has(currentRoom)) {
      const room = rooms.get(currentRoom);
      if (playerRole === 'P1') {
        if (room.guestWs && room.guestWs.readyState === WebSocket.OPEN) {
          room.guestWs.send(JSON.stringify({ type: 'OPPONENT_DISCONNECTED' }));
        }
        rooms.delete(currentRoom);
      } else if (playerRole === 'P2') {
        room.guestWs = null;
        if (room.hostWs && room.hostWs.readyState === WebSocket.OPEN) {
          room.hostWs.send(JSON.stringify({ type: 'OPPONENT_DISCONNECTED' }));
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(`  SARLAYASH PRODUCTIONS PRESENTS`);
  console.log(`  AIVERSE 1.0 - Powered By Kapil`);
  console.log(`  Local URL: http://localhost:${PORT}`);
  console.log(`  Multiplayer WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`========================================================`);
});
