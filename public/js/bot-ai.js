/**
 * SYNAPSE SAGA: AI Sparring Partner Engine
 * Provides 3 Bot AI models with heuristic evaluation, cascade discovery, and agentic thought stream.
 */

class BotAI {
  constructor(difficulty = 'DEEPSEEKER') {
    this.difficulty = difficulty; // 'OVERFIT', 'DEEPSEEKER', 'OMNISENTINEL'
    this.name = this.getBotName();
  }

  setDifficulty(diff) {
    this.difficulty = diff;
    this.name = this.getBotName();
  }

  getBotName() {
    switch (this.difficulty) {
      case 'OVERFIT': return 'Dr. Overfit (Beginner)';
      case 'DEEPSEEKER': return 'DeepSeeker-Pro (Intermediate)';
      case 'OMNISENTINEL': return 'OmniSentinel AGI (Master)';
      default: return 'Bot AI';
    }
  }

  // Generate simulated Agentic Thought stream for the HUD
  generateThoughtLog(chosenAction) {
    const thoughts = {
      OVERFIT: [
        `[Dr. Overfit]: Training loss oscillating. Choosing nearest greedy token activation.`,
        `[Dr. Overfit]: Gradient vanishing... executing heuristic step without regularization.`
      ],
      DEEPSEEKER: [
        `[DeepSeeker-Pro]: Evaluating Q-K-V attention weights across row/col embeddings...`,
        `[DeepSeeker-Pro]: Projected cascade depth: 2. Selecting optimal policy branch.`,
        `[DeepSeeker-Pro]: ReAct cycle: Thought -> Observe opponent posture -> Execute action.`
      ],
      OMNISENTINEL: [
        `[OmniSentinel AGI]: Simulating multi-agent swarm consensus with Monte-Carlo tree search.`,
        `[OmniSentinel AGI]: Detected high-value attention singularity. Maximizing parameter yield.`,
        `[OmniSentinel AGI]: Tool Execution verified. Deploying targeted vector intercept.`
      ]
    };

    const pool = thoughts[this.difficulty] || thoughts.DEEPSEEKER;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Find best move for the bot (either a Token Swap or a Chess Piece Move)
  computeMove(board, chessSystem) {
    const p2Pieces = chessSystem.pieces.filter(p => p.owner === 'P2');
    const allPieceMoves = [];

    // Collect all valid chess moves for bot
    p2Pieces.forEach(piece => {
      const valid = chessSystem.getValidMoves(piece);
      valid.forEach(dest => {
        allPieceMoves.push({ piece, dest });
      });
    });

    // Collect all valid token swaps
    const allTokenSwaps = [];
    for (let r = 0; r < board.size; r++) {
      for (let c = 0; c < board.size; c++) {
        // Swap right
        if (c + 1 < board.size && board.canSwap(r, c, r, c + 1)) {
          allTokenSwaps.push({ r1: r, c1: c, r2: r, c2: c + 1 });
        }
        // Swap down
        if (r + 1 < board.size && board.canSwap(r, c, r + 1, c)) {
          allTokenSwaps.push({ r1: r, c1: c, r2: r + 1, c2: c });
        }
      }
    }

    // DECISION LOGIC BASED ON DIFFICULTY
    if (this.difficulty === 'OVERFIT') {
      // 70% chance token swap, 30% piece move
      if (allTokenSwaps.length > 0 && (Math.random() < 0.7 || allPieceMoves.length === 0)) {
        const chosen = allTokenSwaps[Math.floor(Math.random() * allTokenSwaps.length)];
        return { type: 'SWAP', data: chosen, thought: this.generateThoughtLog() };
      } else if (allPieceMoves.length > 0) {
        const chosen = allPieceMoves[Math.floor(Math.random() * allPieceMoves.length)];
        return { type: 'PIECE', data: chosen, thought: this.generateThoughtLog() };
      }
    }

    // INTERMEDIATE & MASTER: Heuristic scoring
    let bestAction = null;
    let bestScore = -9999;

    // Evaluate Piece Moves
    allPieceMoves.forEach(m => {
      let score = 0;
      const targetCell = board.getCell(m.dest.r, m.dest.c);

      // Value capturing enemy pieces
      if (targetCell.piece && targetCell.piece.owner === 'P1') {
        score += targetCell.piece.type === 'ORCHESTRATOR' ? 1000 : 350;
      }

      // Value collecting powerups
      if (targetCell.powerup) {
        score += 150;
      }

      // Value clearing hazards (Critic auditing hallucination)
      if (targetCell.hazard === 'HALLUCINATION' && m.piece.type === 'CRITIC') {
        score += 200;
      }

      // Value Memory promotion towards row 7
      if (m.piece.type === 'MEMORY') {
        score += (m.dest.r * 25);
      }

      // Small positional bonus
      score += Math.random() * 20;

      if (score > bestScore) {
        bestScore = score;
        bestAction = { type: 'PIECE', data: m };
      }
    });

    // Evaluate Token Swaps
    allTokenSwaps.forEach(s => {
      let score = 100; // Base value for matching

      // Virtual swap to calculate match length & score
      const cell1 = board.getCell(s.r1, s.c1);
      const cell2 = board.getCell(s.r2, s.c2);

      const t1 = cell1.token;
      const t2 = cell2.token;
      cell1.token = t2;
      cell2.token = t1;

      const matches = board.findMatches();
      let matchYield = 0;
      matches.forEach(match => {
        matchYield += match.cells.length * 40;
        if (match.length >= 4) matchYield += 250; // Flash Attention creation
        if (match.length >= 5) matchYield += 500; // Singularity creation
      });

      // Revert virtual swap
      cell1.token = t1;
      cell2.token = t2;

      score += matchYield;

      // Higher difficulty values large cascades more
      if (this.difficulty === 'OMNISENTINEL') {
        score *= 1.25;
      }

      score += Math.random() * 15;

      if (score > bestScore) {
        bestScore = score;
        bestAction = { type: 'SWAP', data: s };
      }
    });

    // Fallback if no moves possible
    if (!bestAction) {
      if (allTokenSwaps.length > 0) {
        bestAction = { type: 'SWAP', data: allTokenSwaps[0] };
      } else if (allPieceMoves.length > 0) {
        bestAction = { type: 'PIECE', data: allPieceMoves[0] };
      }
    }

    return {
      ...bestAction,
      thought: this.generateThoughtLog(bestAction)
    };
  }
}

// Global expose
if (typeof window !== 'undefined') {
  window.BotAI = BotAI;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BotAI;
}
