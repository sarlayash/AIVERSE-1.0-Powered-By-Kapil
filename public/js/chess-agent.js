/**
 * SYNAPSE SAGA: Agentic Chess System
 * Represents the autonomous agent pieces, movement validation, and special abilities.
 */

class ChessAgentSystem {
  constructor(board) {
    this.board = board;
    this.pieces = []; // Array of { id, type, owner, r, c, hp, maxHp, powerups }
    this.initDefaultPieces();
  }

  initDefaultPieces() {
    this.pieces = [];

    // Clear board piece references
    for (let r = 0; r < this.board.size; r++) {
      for (let c = 0; c < this.board.size; c++) {
        this.board.grid[r][c].piece = null;
      }
    }

    // P1 (Blue Swarm - starts at bottom rank 7 & 6)
    this.addPiece('ORCHESTRATOR', 'P1', 7, 3);
    this.addPiece('EXECUTOR', 'P1', 7, 1);
    this.addPiece('CRITIC', 'P1', 7, 5);
    this.addPiece('MEMORY', 'P1', 6, 2);
    this.addPiece('MEMORY', 'P1', 6, 4);

    // P2 (Red Collective - starts at top rank 0 & 1)
    this.addPiece('ORCHESTRATOR', 'P2', 0, 4);
    this.addPiece('EXECUTOR', 'P2', 0, 6);
    this.addPiece('CRITIC', 'P2', 0, 2);
    this.addPiece('MEMORY', 'P2', 1, 3);
    this.addPiece('MEMORY', 'P2', 1, 5);
  }

  addPiece(type, owner, r, c) {
    const pieceDef = CONFIG.PIECES[type];
    const piece = {
      id: `${owner}_${type}_${r}_${c}`,
      type,
      owner, // 'P1' or 'P2'
      r,
      c,
      hp: type === 'ORCHESTRATOR' ? 3 : 2,
      maxHp: type === 'ORCHESTRATOR' ? 3 : 2,
      powerups: [],
      starTurns: 0, // Zero-shot star immunity turns
      loraTurns: 0  // LoRA fine-tune turns
    };

    this.pieces.push(piece);
    this.board.grid[r][c].piece = piece;
    return piece;
  }

  getPieceAt(r, c) {
    const cell = this.board.getCell(r, c);
    return cell ? cell.piece : null;
  }

  // Get valid moves for a piece at (r, c)
  getValidMoves(piece) {
    if (!piece) return [];
    const valid = [];
    const { r, c, type, owner, loraTurns } = piece;
    const size = this.board.size;

    // Movement modifiers from LoRA Powerup
    const reachBoost = loraTurns > 0 ? 1 : 0;

    switch (type) {
      case 'ORCHESTRATOR': {
        // King-like (1 step in all 8 directions + optional reach if powered)
        const range = 1 + reachBoost;
        for (let dr = -range; dr <= range; dr++) {
          for (let dc = -range; dc <= range; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (this.canLand(piece, nr, nc)) {
              valid.push({ r: nr, c: nc });
            }
          }
        }
        break;
      }

      case 'EXECUTOR': {
        // Knight L-moves: (+/-1, +/-2) or (+/-2, +/-1)
        const knightDeltas = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        knightDeltas.forEach(([dr, dc]) => {
          const nr = r + dr;
          const nc = c + dc;
          if (this.canLand(piece, nr, nc)) {
            valid.push({ r: nr, c: nc });
          }
        });

        // Plus orthogonal dash of 2 squares (Rook ability)
        const orthoDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        orthoDirs.forEach(([dr, dc]) => {
          for (let dist = 1; dist <= 2 + reachBoost; dist++) {
            const nr = r + dr * dist;
            const nc = c + dc * dist;
            if (nr < 0 || nr >= size || nc < 0 || nc >= size) break;
            const targetCell = this.board.getCell(nr, nc);
            if (targetCell.piece) {
              if (targetCell.piece.owner !== owner) {
                valid.push({ r: nr, c: nc }); // Can capture
              }
              break; // Blocked by piece
            }
            valid.push({ r: nr, c: nc });
          }
        });
        break;
      }

      case 'CRITIC': {
        // Diagonal slides (Bishop)
        const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        diagDirs.forEach(([dr, dc]) => {
          for (let dist = 1; dist <= (reachBoost ? size : 4); dist++) {
            const nr = r + dr * dist;
            const nc = c + dc * dist;
            if (nr < 0 || nr >= size || nc < 0 || nc >= size) break;
            const targetCell = this.board.getCell(nr, nc);
            if (targetCell.piece) {
              if (targetCell.piece.owner !== owner) {
                valid.push({ r: nr, c: nc });
              }
              break;
            }
            valid.push({ r: nr, c: nc });
          }
        });
        break;
      }

      case 'MEMORY': {
        // Pawn-like: Forward move 1 step (P1 moves UP r-1, P2 moves DOWN r+1)
        const fwd = owner === 'P1' ? -1 : 1;
        const nr = r + fwd;
        if (nr >= 0 && nr < size) {
          // Normal advance
          const forwardCell = this.board.getCell(nr, c);
          if (forwardCell && !forwardCell.piece && forwardCell.hazard !== 'RATE_LIMIT') {
            valid.push({ r: nr, c });
          }

          // Diagonal capture
          [-1, 1].forEach(dc => {
            const diagCell = this.board.getCell(nr, c + dc);
            if (diagCell && diagCell.piece && diagCell.piece.owner !== owner) {
              valid.push({ r: nr, c: c + dc });
            }
          });
        }
        break;
      }
    }

    return valid;
  }

  canLand(piece, nr, nc) {
    if (nr < 0 || nr >= this.board.size || nc < 0 || nc >= this.board.size) return false;
    const targetCell = this.board.getCell(nr, nc);
    if (!targetCell) return false;

    // Rate Limit wall can only be smashed by Executor
    if (targetCell.hazard === 'RATE_LIMIT' && piece.type !== 'EXECUTOR') return false;

    // Cannot land on friendly piece
    if (targetCell.piece && targetCell.piece.owner === piece.owner) return false;

    return true;
  }

  // Execute a tactical move
  movePiece(piece, targetR, targetC) {
    const fromCell = this.board.getCell(piece.r, piece.c);
    const toCell = this.board.getCell(targetR, targetC);

    if (!fromCell || !toCell) return null;

    let capturedPiece = null;
    let harvestedToken = toCell.token;
    let powerupCollected = toCell.powerup;
    let hazardCleared = toCell.hazard;

    // Check enemy capture
    if (toCell.piece && toCell.piece.owner !== piece.owner) {
      capturedPiece = toCell.piece;
      this.removePiece(capturedPiece);
    }

    // Clear Rate limit if Executor
    if (toCell.hazard === 'RATE_LIMIT' && piece.type === 'EXECUTOR') {
      toCell.hazard = null;
    }

    // Critic audits Hallucinations
    if (toCell.hazard === 'HALLUCINATION' && piece.type === 'CRITIC') {
      toCell.hazard = null;
      toCell.hazardTimer = 0;
    }

    // Move piece on board
    fromCell.piece = null;
    toCell.piece = piece;
    piece.r = targetR;
    piece.c = targetC;

    // Collect powerup if present
    if (powerupCollected && powerupCollected !== 'MYSTERY_BLOCK') {
      this.applyPowerup(piece, powerupCollected);
      toCell.powerup = null;
    }

    // Check Memory Unit promotion: P1 reaches rank 0, P2 reaches rank 7
    let promoted = false;
    if (piece.type === 'MEMORY') {
      if ((piece.owner === 'P1' && targetR === 0) || (piece.owner === 'P2' && targetR === this.board.size - 1)) {
        piece.type = 'CRITIC'; // Promotes to Critic / Evaluator
        piece.maxHp = 3;
        piece.hp = 3;
        promoted = true;
      }
    }

    // Harvest the token on the landing square and refresh with gravity
    toCell.token = null;

    return {
      piece,
      capturedPiece,
      harvestedToken,
      powerupCollected,
      hazardCleared,
      promoted
    };
  }

  applyPowerup(piece, powerupType) {
    piece.powerups.push(powerupType);
    if (powerupType === 'LORA_SHROOM') {
      piece.loraTurns = 4;
    } else if (powerupType === 'ZERO_SHOT_STAR') {
      piece.starTurns = 3;
    }
  }

  removePiece(piece) {
    const idx = this.pieces.indexOf(piece);
    if (idx !== -1) {
      this.pieces.splice(idx, 1);
    }
    const cell = this.board.getCell(piece.r, piece.c);
    if (cell && cell.piece === piece) {
      cell.piece = null;
    }
  }

  // Turn tick for power-up durations
  tickPieceDurations(owner) {
    this.pieces.filter(p => p.owner === owner).forEach(p => {
      if (p.loraTurns > 0) p.loraTurns--;
      if (p.starTurns > 0) p.starTurns--;
    });
  }
}

// Global expose
if (typeof window !== 'undefined') {
  window.ChessAgentSystem = ChessAgentSystem;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChessAgentSystem;
}
