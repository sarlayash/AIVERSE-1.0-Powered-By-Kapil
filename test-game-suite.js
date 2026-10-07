/**
 * SYNAPSE SAGA: Automated Test Verification Suite
 * Validates:
 * 1. Static asset serving & PWA manifest
 * 2. ZIP app packaging API
 * 3. WebSocket room creation & joining
 * 4. Game mechanics: board matching, chess pieces, bot AI decisions, certificate generator
 */

const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const PORT = 3001; // test port
process.env.PORT = PORT;

// Import server
const serverApp = require('./server.js');

async function runTests() {
  console.log('🧪 Starting Synapse Saga Verification Test Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Allow server to spin up
  await new Promise(r => setTimeout(r, 600));

  // Test 1: Fetch index.html
  await new Promise(resolve => {
    http.get(`http://localhost:${PORT}/index.html`, res => {
      assert(res.statusCode === 200, 'HTTP GET /index.html returns 200 OK');
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        assert(data.includes('AIVERSE 1.0'), 'index.html contains AIVERSE 1.0 title');
        assert(data.includes('SARLAYASH PRODUCTIONS PRESENTS'), 'index.html contains SARLAYASH branding');
        assert(data.includes('Powered By Kapil'), 'index.html contains Powered By Kapil tag');
        assert(data.includes('btn-dl-cert-pdf'), 'index.html has PDF certificate download button');
        assert(data.includes('btn-dl-cert-png'), 'index.html has PNG certificate download button');
        resolve();
      });
    }).on('error', err => {
      assert(false, `HTTP GET /index.html error: ${err.message}`);
      resolve();
    });
  });

  // Test 2: Fetch manifest.json
  await new Promise(resolve => {
    http.get(`http://localhost:${PORT}/manifest.json`, res => {
      assert(res.statusCode === 200, 'HTTP GET /manifest.json returns 200 OK');
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const manifest = JSON.parse(data);
          assert(manifest.name.includes('AIVERSE 1.0') && manifest.name.includes('SARLAYASH'), 'PWA manifest has valid branded app name');
          assert(manifest.display === 'standalone', 'PWA manifest display is standalone');
        } catch (e) {
          assert(false, 'manifest.json is valid JSON');
        }
        resolve();
      });
    });
  });

  // Test 3: Fetch app download ZIP
  await new Promise(resolve => {
    http.get(`http://localhost:${PORT}/api/download-app-zip`, res => {
      assert(res.statusCode === 200, 'HTTP GET /api/download-app-zip returns 200 OK');
      assert(res.headers['content-type'] === 'application/zip', 'Content-Type is application/zip');
      let bytes = 0;
      res.on('data', chunk => bytes += chunk.length);
      res.on('end', () => {
        assert(bytes > 1000, `Downloaded ZIP size is non-trivial (${bytes} bytes)`);
        resolve();
      });
    });
  });

  // Test 4: WebSocket Multiplayer Test
  await new Promise(resolve => {
    const ws1 = new WebSocket(`ws://localhost:${PORT}/ws`);
    let roomCode = null;

    ws1.on('open', () => {
      ws1.send(JSON.stringify({ type: 'CREATE_ROOM' }));
    });

    ws1.on('message', msg => {
      const data = JSON.parse(msg);
      if (data.type === 'ROOM_CREATED') {
        assert(data.roomCode && data.roomCode.length >= 4, `WebSocket created room code: ${data.roomCode}`);
        roomCode = data.roomCode;

        // Guest joins
        const ws2 = new WebSocket(`ws://localhost:${PORT}/ws`);
        ws2.on('open', () => {
          ws2.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode }));
        });

        ws2.on('message', msg2 => {
          const data2 = JSON.parse(msg2);
          if (data2.type === 'ROOM_JOINED') {
            assert(data2.role === 'P2', 'Guest successfully joined as P2');
            ws1.close();
            ws2.close();
            resolve();
          }
        });
      }
    });
  });

  // Test 5: Verify Board and AI Bot Logic in Node
  try {
    const CONFIG = require('./public/js/config.js');
    global.CONFIG = CONFIG;

    const NeuralBoard = require('./public/js/board.js');
    const board = new NeuralBoard(CONFIG.GRID_SIZE);
    assert(board.grid.length === 8 && board.grid[0].length === 8, 'NeuralBoard creates 8x8 matrix');

    const ChessAgentSystem = require('./public/js/chess-agent.js');
    const chess = new ChessAgentSystem(board);
    assert(chess.pieces.length === 10, 'Agentic Chess initializes 10 swarm pieces (P1 & P2)');

    // Verify valid moves for an orchestrator
    const orch = chess.pieces.find(p => p.type === 'ORCHESTRATOR' && p.owner === 'P1');
    const validMoves = chess.getValidMoves(orch);
    assert(validMoves.length > 0, `Orchestrator has ${validMoves.length} valid moves`);

    // Load Bot AI
    const BotAI = require('./public/js/bot-ai.js');
    const bot = new BotAI('OMNISENTINEL');
    const move = bot.computeMove(board, chess);
    assert(move && (move.type === 'SWAP' || move.type === 'PIECE'), `Bot AI successfully computes move: [${move.type}]`);
    assert(move.thought && move.thought.includes('OmniSentinel'), 'Bot AI generates agentic reasoning thought');

    // Load Certificate Engine definitions
    const certificateEngine = require('./public/js/certs.js');
    const credId = certificateEngine.generateCredentialId(10, 'Lead Architect');
    assert(credId.startsWith('AGY-AI-2026-LV10-'), `Credential ID format verified: ${credId}`);

  } catch (err) {
    assert(false, `Game engine logic test failed: ${err.message}`);
    console.error(err);
  }

  console.log(`\n========================================`);
  console.log(`  TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(e => {
  console.error('Test Suite Exception:', e);
  process.exit(1);
});
