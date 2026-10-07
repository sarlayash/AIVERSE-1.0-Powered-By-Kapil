/**
 * SYNAPSE SAGA: Multiplayer Manager
 * Supports both Local Pass-and-Play (Hotseat) and Online/LAN Room Code via WebSockets.
 */

class MultiplayerManager {
  constructor(onRemoteMove, onStatusChange) {
    this.mode = 'SOLO'; // 'SOLO', 'PASS_AND_PLAY', 'ONLINE_ROOM'
    this.ws = null;
    this.roomCode = null;
    this.playerRole = 'P1'; // 'P1' (Host/Blue) or 'P2' (Guest/Red)
    this.onRemoteMove = onRemoteMove;
    this.onStatusChange = onStatusChange;
    this.isConnected = false;
  }

  setMode(mode) {
    this.mode = mode;
    if (mode !== 'ONLINE_ROOM' && this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // Connect to local or remote WebSocket server
  connectWs() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host || 'localhost:3000';
    const wsUrl = `${protocol}//${host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.onStatusChange?.('CONNECTED', 'Connected to Multiplayer Server');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleServerMessage(data);
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.onStatusChange?.('DISCONNECTED', 'Multiplayer disconnected');
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket connection error:', err);
        this.onStatusChange?.('ERROR', 'Unable to reach multiplayer server. Pass-and-Play is still available offline!');
      };
    } catch (e) {
      console.warn('WebSocket init exception:', e);
    }
  }

  createRoom() {
    this.connectWs();
    const sendCreate = () => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'CREATE_ROOM' }));
      } else {
        setTimeout(sendCreate, 200);
      }
    };
    sendCreate();
  }

  joinRoom(code) {
    this.connectWs();
    const sendJoin = () => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode: code }));
      } else {
        setTimeout(sendJoin, 200);
      }
    };
    sendJoin();
  }

  sendMove(moveData) {
    if (this.mode === 'ONLINE_ROOM' && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'SYNC_MOVE',
        moveData
      }));
    }
  }

  sendChat(text) {
    if (this.mode === 'ONLINE_ROOM' && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'CHAT_MSG',
        text
      }));
    }
  }

  handleServerMessage(data) {
    switch (data.type) {
      case 'ROOM_CREATED':
        this.roomCode = data.roomCode;
        this.playerRole = data.role;
        this.onStatusChange?.('ROOM_CREATED', `Room ${this.roomCode} created! Share this code with your rival.`);
        break;

      case 'ROOM_JOINED':
        this.roomCode = data.roomCode;
        this.playerRole = data.role;
        this.onStatusChange?.('ROOM_JOINED', `Joined Room ${this.roomCode}! You are playing as ${data.role === 'P1' ? 'Blue Swarm' : 'Red Collective'}.`);
        break;

      case 'OPPONENT_JOINED':
        this.onStatusChange?.('OPPONENT_JOINED', 'Rival Player joined! Neural battle begins now.');
        break;

      case 'OPPONENT_MOVE':
        this.onRemoteMove?.(data.moveData, data.sender);
        break;

      case 'OPPONENT_DISCONNECTED':
        this.onStatusChange?.('OPPONENT_DISCONNECTED', 'Opponent disconnected from session.');
        break;

      case 'CHAT_MSG':
        this.onStatusChange?.('CHAT_MSG', `[${data.sender}]: ${data.text}`);
        break;

      case 'ERROR':
        this.onStatusChange?.('ERROR', data.message);
        break;
    }
  }
}

// Global expose
window.MultiplayerManager = MultiplayerManager;
