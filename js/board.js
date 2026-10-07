/**
 * SYNAPSE SAGA: Neural Grid Engine
 * Blends Token Attention Matching (Candy Crush) + Platformer Hazard Dynamics (Mario)
 */

class NeuralBoard {
  constructor(size = 8) {
    this.size = size;
    this.grid = [];
    this.tokenKeys = Object.keys(CONFIG.TOKENS);
    this.isAnimating = false;
    this.lastMatches = [];
    this.init();
  }

  init() {
    this.grid = [];
    for (let r = 0; r < this.size; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.size; c++) {
        this.grid[r][c] = {
          r,
          c,
          token: this.getRandomTokenKey([r, c]),
          piece: null,      // Agentic Chess piece if present
          hazard: null,     // Hallucination, Data Drift, Rate Limit
          powerup: null,    // Mario Mystery Block, LoRA Shroom, Star
          special: null,    // 'FLASH_ROW', 'FLASH_COL', 'SINGULARITY', 'HEAD_BOMB'
          hazardTimer: 0
        };
      }
    }

    // Ensure initial board has no automatic 3-in-a-row matches
    this.resolveInitialMatches();
  }

  getRandomTokenKey(avoidPos = null) {
    const keys = this.tokenKeys;
    let chosen = keys[Math.floor(Math.random() * keys.length)];
    return chosen;
  }

  resolveInitialMatches() {
    let attempts = 0;
    while (attempts < 50) {
      const matches = this.findMatches();
      if (matches.length === 0) break;
      matches.forEach(m => {
        m.cells.forEach(cell => {
          this.grid[cell.r][cell.c].token = this.tokenKeys[Math.floor(Math.random() * this.tokenKeys.length)];
        });
      });
      attempts++;
    }
  }

  getCell(r, c) {
    if (r < 0 || r >= this.size || c < 0 || c >= this.size) return null;
    return this.grid[r][c];
  }

  // Swap two adjacent token cells
  canSwap(r1, c1, r2, c2) {
    const dist = Math.abs(r1 - r2) + Math.abs(c1 - c2);
    if (dist !== 1) return false;

    const cell1 = this.getCell(r1, c1);
    const cell2 = this.getCell(r2, c2);
    if (!cell1 || !cell2) return false;

    // Check if cell is blocked by Rate Limit or frozen by Data Drift
    if (cell1.hazard === 'RATE_LIMIT' || cell2.hazard === 'RATE_LIMIT') return false;

    // Singularity matches with any adjacent token!
    if (cell1.special === 'SINGULARITY' || cell2.special === 'SINGULARITY') return true;

    // Try virtual swap
    const token1 = cell1.token;
    const token2 = cell2.token;
    cell1.token = token2;
    cell2.token = token1;

    const matches = this.findMatches();

    // Revert
    cell1.token = token1;
    cell2.token = token2;

    return matches.length > 0;
  }

  swap(r1, c1, r2, c2) {
    const cell1 = this.getCell(r1, c1);
    const cell2 = this.getCell(r2, c2);
    if (!cell1 || !cell2) return false;

    const tempToken = cell1.token;
    const tempSpecial = cell1.special;

    cell1.token = cell2.token;
    cell1.special = cell2.special;

    cell2.token = tempToken;
    cell2.special = tempSpecial;

    return true;
  }

  // Find all matches on board (horizontal and vertical)
  findMatches() {
    const matchedGroups = [];
    const matchedCoords = new Set();

    // Check horizontal
    for (let r = 0; r < this.size; r++) {
      let runLength = 1;
      for (let c = 0; c < this.size; c++) {
        const currentToken = this.grid[r][c]?.token;
        const nextToken = (c + 1 < this.size) ? this.grid[r][c + 1]?.token : null;

        if (currentToken && currentToken === nextToken) {
          runLength++;
        } else {
          if (runLength >= 3) {
            const cells = [];
            for (let i = c - runLength + 1; i <= c; i++) {
              cells.push({ r, c: i, token: this.grid[r][i].token });
              matchedCoords.add(`${r},${i}`);
            }
            matchedGroups.push({ type: 'H', length: runLength, cells, token: currentToken });
          }
          runLength = 1;
        }
      }
    }

    // Check vertical
    for (let c = 0; c < this.size; c++) {
      let runLength = 1;
      for (let r = 0; r < this.size; r++) {
        const currentToken = this.grid[r][c]?.token;
        const nextToken = (r + 1 < this.size) ? this.grid[r + 1][c]?.token : null;

        if (currentToken && currentToken === nextToken) {
          runLength++;
        } else {
          if (runLength >= 3) {
            const cells = [];
            for (let i = r - runLength + 1; i <= r; i++) {
              cells.push({ r: i, c, token: this.grid[i][c].token });
              matchedCoords.add(`${i},${c}`);
            }
            matchedGroups.push({ type: 'V', length: runLength, cells, token: currentToken });
          }
          runLength = 1;
        }
      }
    }

    return matchedGroups;
  }

  // Trigger special abilities and clear matching tokens
  processMatches(matches) {
    let totalScore = 0;
    let tokensCleared = 0;
    const clearedCoords = new Set();
    const newSpecials = [];

    matches.forEach(m => {
      let basePoints = (CONFIG.TOKENS[m.token]?.score || 30) * m.cells.length;
      if (m.length === 4) {
        basePoints *= 2.0; // Flash Attention multiplier
        // Center cell becomes a Flash Beam
        const center = m.cells[Math.floor(m.cells.length / 2)];
        newSpecials.push({ r: center.r, c: center.c, special: m.type === 'H' ? 'FLASH_ROW' : 'FLASH_COL' });
      } else if (m.length >= 5) {
        basePoints *= 3.5; // Singularity multiplier
        const center = m.cells[Math.floor(m.cells.length / 2)];
        newSpecials.push({ r: center.r, c: center.c, special: 'SINGULARITY' });
      }

      totalScore += basePoints;

      m.cells.forEach(cell => {
        clearedCoords.add(`${cell.r},${cell.c}`);
        tokensCleared++;

        // Clear any adjacent Data Drift
        this.clearAdjacentHazards(cell.r, cell.c);
      });
    });

    // Check special trigger activations among cleared cells
    clearedCoords.forEach(coord => {
      const [r, c] = coord.split(',').map(Number);
      const cell = this.getCell(r, c);
      if (cell && cell.special) {
        if (cell.special === 'FLASH_ROW') {
          for (let col = 0; col < this.size; col++) clearedCoords.add(`${r},${col}`);
        } else if (cell.special === 'FLASH_COL') {
          for (let row = 0; row < this.size; row++) clearedCoords.add(`${row},${c}`);
        } else if (cell.special === 'HEAD_BOMB') {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (r + dr >= 0 && r + dr < this.size && c + dc >= 0 && c + dc < this.size) {
                clearedCoords.add(`${r + dr},${c + dc}`);
              }
            }
          }
        }
      }

      // Check if mystery '?' block was cracked
      if (cell && cell.powerup === 'MYSTERY_BLOCK') {
        const pTypes = Object.keys(CONFIG.POWERUPS);
        cell.powerup = pTypes[Math.floor(Math.random() * pTypes.length)];
      }
    });

    // Mark cleared cells as null
    clearedCoords.forEach(coord => {
      const [r, c] = coord.split(',').map(Number);
      const cell = this.getCell(r, c);
      if (cell) {
        cell.token = null;
        cell.special = null;
        if (cell.hazard === 'DATA_DRIFT' || cell.hazard === 'HALLUCINATION') {
          cell.hazard = null;
          cell.hazardTimer = 0;
        }
      }
    });

    // Place newly formed special tokens
    newSpecials.forEach(s => {
      const cell = this.getCell(s.r, s.c);
      if (cell) {
        cell.token = this.tokenKeys[Math.floor(Math.random() * this.tokenKeys.length)];
        cell.special = s.special;
      }
    });

    return { totalScore, tokensCleared, clearedCoords: Array.from(clearedCoords) };
  }

  clearAdjacentHazards(r, c) {
    const deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    deltas.forEach(([dr, dc]) => {
      const neighbor = this.getCell(r + dr, c + dc);
      if (neighbor && neighbor.hazard === 'DATA_DRIFT') {
        neighbor.hazard = null;
      }
    });
  }

  // Mario Conveyor Gravity Drop: Tokens fall down, new ones enter from top
  applyGravity() {
    let moved = false;
    for (let c = 0; c < this.size; c++) {
      let emptyRow = this.size - 1;
      for (let r = this.size - 1; r >= 0; r--) {
        if (this.grid[r][c].token !== null || this.grid[r][c].piece !== null) {
          if (r !== emptyRow) {
            // Swap down if not blocked by piece
            if (!this.grid[emptyRow][c].piece) {
              this.grid[emptyRow][c].token = this.grid[r][c].token;
              this.grid[emptyRow][c].special = this.grid[r][c].special;
              this.grid[r][c].token = null;
              this.grid[r][c].special = null;
              moved = true;
            }
          }
          emptyRow--;
        }
      }

      // Fill remaining empty top rows with fresh tokens
      for (let r = emptyRow; r >= 0; r--) {
        if (!this.grid[r][c].piece) {
          this.grid[r][c].token = this.getRandomTokenKey();
          this.grid[r][c].special = null;

          // Rare chance (4%) to spawn a Mario '?' Mystery Block
          if (Math.random() < 0.04) {
            this.grid[r][c].powerup = 'MYSTERY_BLOCK';
          }
          moved = true;
        }
      }
    }
    return moved;
  }

  // Advance hazards countdown (called per turn)
  tickHazards() {
    const explosions = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const cell = this.grid[r][c];
        if (cell.hazard === 'HALLUCINATION' && cell.hazardTimer > 0) {
          cell.hazardTimer--;
          if (cell.hazardTimer === 0) {
            explosions.push({ r, c });
            // Explode: Clear 3x3 and add penalty
            cell.hazard = null;
          }
        }
      }
    }
    return explosions;
  }

  // Spawn a Mario-style hazard or powerup
  spawnHazard(type, r, c, timer = 3) {
    const cell = this.getCell(r, c);
    if (cell && !cell.piece) {
      cell.hazard = type;
      cell.hazardTimer = timer;
    }
  }

  spawnMysteryBlock(r, c) {
    const cell = this.getCell(r, c);
    if (cell && !cell.piece) {
      cell.powerup = 'MYSTERY_BLOCK';
    }
  }
}

// Global expose
if (typeof window !== 'undefined') {
  window.NeuralBoard = NeuralBoard;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NeuralBoard;
}
