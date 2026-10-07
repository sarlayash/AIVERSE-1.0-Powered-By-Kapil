/**
 * SYNAPSE SAGA: AGENTIC PROTOCOL
 * Core Configuration, Token Types, Agent Pieces, and Educational Data
 * Aligned with Google Cloud GenAI & Microsoft Azure AI Standards
 */

const CONFIG = {
  GRID_SIZE: 8,
  DEFAULT_MOVES: 25,
  BASE_TARGET_LOSS: 0.05,
  INFERENCE_BUDGET: 1000,

  // Token Types (The "Candy Crush" Attention Elements)
  TOKENS: {
    EMBEDDING: {
      id: 'emb',
      name: 'Embedding Vector',
      symbol: '🔷',
      color: '#00f0ff',
      gradient: 'linear-gradient(135deg, #00c6ff, #0072ff)',
      desc: 'High-dimensional semantic representation mapping raw tokens into dense latent space.',
      standard: 'Google Vector Search / Azure AI Search',
      score: 30
    },
    ATTENTION: {
      id: 'attn',
      name: 'Self-Attention Head',
      symbol: '🟣',
      color: '#b026ff',
      gradient: 'linear-gradient(135deg, #f107a3, #7b2cbf)',
      desc: 'Scales Dot-Product Attention: Computes Softmax(QK^T / sqrt(d_k))V to weigh token relationships.',
      standard: 'Transformer Architecture (Vaswani et al.)',
      score: 40
    },
    RAG: {
      id: 'rag',
      name: 'RAG Knowledge Chunk',
      symbol: '🟢',
      color: '#00ff88',
      gradient: 'linear-gradient(135deg, #0575e6, #00f260)',
      desc: 'Retrieval-Augmented Generation: Grounding LLM responses against external verified databases.',
      standard: 'Microsoft Graph RAG / Google Vertex AI Search',
      score: 50
    },
    WEIGHT: {
      id: 'weight',
      name: 'LoRA Tensor Weight',
      symbol: '🟡',
      color: '#ffb703',
      gradient: 'linear-gradient(135deg, #f7971e, #ffd200)',
      desc: 'Low-Rank Adaptation: Efficient parameter updates without retraining the full foundational model.',
      standard: 'PEFT / HuggingFace & Azure Model Fine-Tuning',
      score: 35
    },
    REACT: {
      id: 'react',
      name: 'ReAct Agent Loop',
      symbol: '🔴',
      color: '#ff0055',
      gradient: 'linear-gradient(135deg, #ff0844, #ffb199)',
      desc: 'Autonomous Agentic reasoning cycle: Thought -> Action -> Observation -> Reflection.',
      standard: 'Agentic Frameworks (LangGraph, Google Antigravity, AutoGen)',
      score: 60
    },
    CRITIC: {
      id: 'critic',
      name: 'Self-Correction Critic',
      symbol: '💎',
      color: '#00e5ff',
      gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
      desc: 'Evaluator agent that critiques outputs, verifies factual accuracy, and mitigates hallucinations.',
      standard: 'Constitutional AI / RLHF Alignment',
      score: 55
    }
  },

  // Special Mario-Inspired Power-Up Blocks ('?' Mystery Blocks & Stars)
  POWERUPS: {
    LORA_SHROOM: {
      id: 'p_shroom',
      name: 'LoRA Turbo Super-Block',
      symbol: '🍄',
      color: '#ff2a6d',
      desc: 'Powers up your Agent: doubles movement reach and grants +50% cascade compute for 3 turns.'
    },
    ZERO_SHOT_STAR: {
      id: 'p_star',
      name: 'Zero-Shot Star of Invincibility',
      symbol: '⭐',
      color: '#ffe600',
      desc: 'Complete immunity against Hallucination explosions and Adversarial Jailbreak attacks.'
    },
    FLASH_ATTENTION: {
      id: 'p_flash',
      name: 'Flash Attention Beam',
      symbol: '⚡',
      color: '#05d9e8',
      desc: 'Slices an entire row and column in O(N) linear time, purging all corrupt tokens!'
    },
    RLHF_SHIELD: {
      id: 'p_shield',
      name: 'RLHF Alignment Guardrail',
      symbol: '🛡️',
      color: '#00ffc2',
      desc: 'Absorbs 100% of incoming Loss penalty damage and converts it into Model Parameter credits.'
    },
    RAG_FIREBALL: {
      id: 'p_fire',
      name: 'RAG Retrieval Fireball',
      symbol: '🔥',
      color: '#ff5e00',
      desc: 'Launches targeted retrieval vectors that eliminate up to 5 random obstacles on the grid.'
    }
  },

  // Platformer Hazards & Obstacles
  HAZARDS: {
    HALLUCINATION: {
      id: 'h_hallucination',
      name: 'Hallucination Hazard',
      symbol: '💣',
      desc: 'Unverified model output! Explodes and increases Loss by 0.15 if not audited within countdown.',
      turnsToExplode: 4
    },
    DATA_DRIFT: {
      id: 'h_drift',
      name: 'Data Distribution Drift',
      symbol: '🌫️',
      desc: 'Slime obstacle that locks the cell until cleared by an adjacent token cascade.'
    },
    RATE_LIMIT: {
      id: 'h_limit',
      name: 'API 429 Rate Limit Wall',
      symbol: '🧱',
      desc: 'Hard wall block. Only a Tool Executor piece or Flash Attention Beam can shatter it.'
    }
  },

  // Agentic Chess Pieces (The Strategic Agentic Swarm)
  PIECES: {
    ORCHESTRATOR: {
      id: 'orchestrator',
      name: 'Agent Orchestrator',
      role: 'Leader / Planner (King / Queen Hybrid)',
      symbol: '👑',
      badge: 'ORCH',
      moves: '1 step any direction (orthogonal or diagonal). Special: Deploy Swarm Wave.',
      desc: 'High-level planner that coordinates sub-agents, assigns sub-goals, and aggregates results.',
      azureConcept: 'Azure AI Agent Service / Orchestrator Pattern',
      googleConcept: 'Vertex AI Agent Builder Multi-Agent Coordinator'
    },
    EXECUTOR: {
      id: 'executor',
      name: 'Tool Executor',
      role: 'Specialist / Knight-Rook',
      symbol: '⚔️',
      badge: 'TOOL',
      moves: 'L-shape leaps (Knight) OR straight 2-cell dash. Smashes Rate Limit walls and Hazards.',
      desc: 'Invokes external APIs, code execution sandboxes, and database query tools via function calling.',
      azureConcept: 'Function Calling / OpenAPI Plugin Dispatcher',
      googleConcept: 'Gemini Function Calling & Code Execution Sandbox'
    },
    CRITIC: {
      id: 'critic_piece',
      name: 'Model Evaluator & Critic',
      role: 'Verifier / Bishop',
      symbol: '🔮',
      badge: 'EVAL',
      moves: 'Diagonal slides of any unblocked distance. Audits Hallucinations instantly.',
      desc: 'Applies self-reflection, detects logical fallacies, and enforces safety alignment rules.',
      azureConcept: 'Azure AI Content Safety & Groundedness Evaluator',
      googleConcept: 'Vertex AI Model Evaluation & Constitutional AI'
    },
    MEMORY: {
      id: 'memory',
      name: 'Vector Memory Unit',
      role: 'Sentinel / Pawn',
      symbol: '🛡️',
      badge: 'MEM',
      moves: 'Moves forward 1 cell, captures diagonally. Reaching opposite frontier rank promotes to Frontier Foundation Model!',
      desc: 'Maintains conversational state, episodic memory, and semantic caching.',
      azureConcept: 'Azure Cosmos DB Vector Index / Semantic Cache',
      googleConcept: 'Vertex AI Vector Search & Persistent State'
    }
  },

  // Avatars for User Journey & Profile Selection
  AVATARS: [
    { id: 'av_synapse', name: 'Dr. Synapse', role: 'Chief Neural Architect', icon: '🧠', color: '#00f0ff' },
    { id: 'av_quantum', name: 'Quantum Ray', role: 'Prompt Alchemist', icon: '⚡', color: '#ffd700' },
    { id: 'av_agent', name: 'Agent Neo', role: 'Autonomous Swarm Leader', icon: '🤖', color: '#00ff88' },
    { id: 'av_oracle', name: 'Oracle Veda', role: 'Critic & Safety Evaluator', icon: '🔮', color: '#b026ff' },
    { id: 'av_sentinel', name: 'Cyber Sentinel', role: 'Vector Memory Unit', icon: '🛡️', color: '#38bdf8' },
    { id: 'av_singularity', name: 'Nova Singularity', role: 'AGI Frontier Pioneer', icon: '🌌', color: '#ff007f' }
  ],

  // 10 Progressive Milestone Level Badges (Unlock after beating each Level)
  LEVEL_BADGES: [
    { id: 'badge_lvl1', level: 1, title: 'Perceptron Pioneer', symbol: '🥉', color: '#cd7f32', desc: 'Mastered Artificial Neurons, Weights, Biases & ReLU activation functions.' },
    { id: 'badge_lvl2', level: 2, title: 'Gradient Navigator', symbol: '📉', color: '#38bdf8', desc: 'Navigated Loss Landscapes & optimized Backpropagation without vanishing gradients.' },
    { id: 'badge_lvl3', level: 3, title: 'Latent Space Explorer', symbol: '🔷', color: '#00f0ff', desc: 'Mapped High-Dimensional Vector Embeddings & mastered Cosine Proximity.' },
    { id: 'badge_lvl4', level: 4, title: 'Attention Specialist', symbol: '🟣', color: '#b026ff', desc: 'Executed Scaled Dot-Product Self-Attention (Q, K, V) & Flash Attention linear beams.' },
    { id: 'badge_lvl5', level: 5, title: 'Prompt Engineer', symbol: '🔮', color: '#ec4899', desc: 'Mastered In-Context Learning, Sampling Temperature & mitigated Hallucinations.' },
    { id: 'badge_lvl6', level: 6, title: 'RAG Grounding Master', symbol: '🟢', color: '#00ff88', desc: 'Chunked enterprise documents & architected Vector Database Retrieval.' },
    { id: 'badge_lvl7', level: 7, title: 'ReAct Autonomous Agent', symbol: '🔴', color: '#ef4444', desc: 'Choreographed autonomous ReAct cycles: Thought -> Action -> Observation.' },
    { id: 'badge_lvl8', level: 8, title: 'Tool Calling Dispatcher', symbol: '⚔️', color: '#f59e0b', desc: 'Engineered OpenAPI Function Calling & secure code execution sandboxes.' },
    { id: 'badge_lvl9', level: 9, title: 'Swarm Choreographer', symbol: '🐝', color: '#10b981', desc: 'Orchestrated collaborative Multi-Agent Swarms with Critic consensus.' },
    { id: 'badge_lvl10', level: 10, title: 'Frontier Alignment Master', symbol: '💎', color: '#00f0ff', desc: 'Conquered Adversarial Jailbreaks & achieved RLHF Constitutional Alignment.' }
  ],

  // Official Certification (Strictly Unlocked ONLY after 60-Min 200 MCQ Exam >= 90%)
  CERTIFICATES: [
    {
      id: 'cert_architect',
      tier: 'Diamond Gold',
      title: 'Certified Autonomous Agent & Generative AI Systems Architect',
      examRequired: true,
      minScore: 180, // 90% of 200 MCQs
      standard: 'Google Cloud Generative AI Leader & Microsoft Azure AI Engineer Standard',
      color: '#ffd700',
      badgeIcon: '🏆'
    }
  ]
};

// Expose on window for browser scripts
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
