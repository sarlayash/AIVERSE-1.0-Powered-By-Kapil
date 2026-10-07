/**
 * SYNAPSE SAGA: Level System & Curriculum
 * Aligned with Microsoft Azure AI Engineering & Google Cloud Generative AI Standards.
 */

const LEVELS_DATA = [
  {
    id: 1,
    title: "Level 1: Perceptron Awakening",
    category: "Classical AI & Neural Nets",
    standard: "Microsoft AI-900 & Google AI Foundations",
    conceptTitle: "The Artificial Neuron: Weights & Biases",
    conceptDesc: "An artificial neuron multiplies incoming signals by learned weights, sums them with a bias, and passes them through an activation function (ReLU/Sigmoid) to produce an output.",
    goalText: "Match 15 LoRA Tensor Weights & reach Loss ≤ 0.20",
    moves: 22,
    targetLoss: 0.20,
    targetScore: 1800,
    targetToken: 'WEIGHT',
    targetTokenCount: 15,
    hazards: [],
    timerSeconds: null, // Move-based
    aiOpponent: false
  },
  {
    id: 2,
    title: "Level 2: Gradient Descent Valley",
    category: "Optimization & Loss Landscape",
    standard: "Google Professional ML Engineer Standard",
    conceptTitle: "Backpropagation & Learning Rate",
    conceptDesc: "Gradient Descent navigates the multidimensional loss landscape by computing partial derivatives (gradients) to update model weights in the direction of steepest descent.",
    goalText: "Smash 2 Data Drift hazards using Tool Executor & reach Loss ≤ 0.12",
    moves: 20,
    targetLoss: 0.12,
    targetScore: 2400,
    hazards: [
      { type: 'DATA_DRIFT', r: 3, c: 3 },
      { type: 'DATA_DRIFT', r: 4, c: 4 }
    ],
    timerSeconds: null,
    aiOpponent: false
  },
  {
    id: 3,
    title: "Level 3: Latent Vector Matrix",
    category: "Embeddings & Vector Spaces",
    standard: "Google Vertex Vector Search & Azure AI Search",
    conceptTitle: "High-Dimensional Vector Embeddings",
    conceptDesc: "Embeddings map unstructured text, audio, and images into dense numerical vectors where semantic similarity correlates with geometric proximity (Cosine Similarity / Dot Product).",
    goalText: "Trigger 2 Flash Attention Beams (Match-4) & score 3,000 Compute",
    moves: 22,
    targetLoss: 0.08,
    targetScore: 3000,
    targetToken: 'EMBEDDING',
    targetTokenCount: 18,
    hazards: [],
    timerSeconds: null,
    aiOpponent: false
  },
  {
    id: 4,
    title: "Level 4: Self-Attention Gateway",
    category: "Transformers & LLMs",
    standard: "Transformer Core (Vaswani et al. / Google DeepMind)",
    conceptTitle: "Scaled Dot-Product Attention: Q, K, V",
    conceptDesc: "Self-attention computes dynamic weights between every token pair in the sequence using Query (what to find), Key (what is matched), and Value (content to extract).",
    goalText: "Match 20 Self-Attention tokens & crack open a '?' Mystery Block",
    moves: 20,
    targetLoss: 0.06,
    targetScore: 3600,
    targetToken: 'ATTENTION',
    targetTokenCount: 20,
    mysteryBlocks: [{ r: 3, c: 4 }],
    hazards: [],
    timerSeconds: null,
    aiOpponent: false
  },
  {
    id: 5,
    title: "Level 5: Prompt Engineering Arena",
    category: "Generative AI In-Context Learning",
    standard: "Microsoft Azure OpenAI / Google Vertex AI",
    conceptTitle: "In-Context Learning & Sampling Temperature",
    conceptDesc: "Generative LLMs sample next tokens probabilistically. Temperature controls randomness (0.0 = deterministic code, 0.9 = creative prose). Guardrails prevent hallucination risks.",
    goalText: "Neutralize 1 Hallucination Hazard before it detonates & score 4,200 Compute",
    moves: 22,
    targetLoss: 0.05,
    targetScore: 4200,
    hazards: [
      { type: 'HALLUCINATION', r: 2, c: 4, timer: 4 }
    ],
    timerSeconds: null,
    aiOpponent: false
  },
  {
    id: 6,
    title: "Level 6: The RAG Knowledge Fortress",
    category: "Retrieval-Augmented Generation",
    standard: "Microsoft Graph RAG & Google Grounding Engine",
    conceptTitle: "Grounding LLMs with External Memory",
    conceptDesc: "RAG chunks enterprise documents, indexes them in a vector database, and retrieves the top-K relevant passages as prompt context, effectively eliminating hallucinated facts.",
    goalText: "Match 20 RAG Knowledge Chunks & use Critic piece to audit corruption",
    moves: 24,
    targetLoss: 0.04,
    targetScore: 5000,
    targetToken: 'RAG',
    targetTokenCount: 20,
    hazards: [
      { type: 'HALLUCINATION', r: 1, c: 2, timer: 5 },
      { type: 'DATA_DRIFT', r: 5, c: 5 }
    ],
    timerSeconds: null,
    aiOpponent: false
  },
  {
    id: 7,
    title: "Level 7: The ReAct Autonomous Loop",
    category: "Agentic AI Architecture",
    standard: "ReAct Framework (Reasoning + Acting in Language Models)",
    conceptTitle: "Autonomous ReAct Loop: Thought -> Action -> Observation",
    conceptDesc: "Agentic AI is not just chat. It observes the environment, forms reasoned plans, executes external actions (APIs/tools), and observes outcomes to adapt in real time.",
    goalText: "Trigger 18 ReAct Loop tokens & promote a Vector Memory unit",
    moves: 25,
    targetLoss: 0.035,
    targetScore: 5800,
    targetToken: 'REACT',
    targetTokenCount: 18,
    hazards: [
      { type: 'RATE_LIMIT', r: 4, c: 3 }
    ],
    timerSeconds: null,
    aiOpponent: false
  },
  {
    id: 8,
    title: "Level 8: API Function Dispatcher",
    category: "Tool Calling & Function Calling",
    standard: "Google Gemini Function Calling & Azure OpenAPI Plugins",
    conceptTitle: "Structured Function Calling & Execution Sandboxes",
    conceptDesc: "Agents convert user intent into strict JSON schemas, invoke external REST endpoints or Python runtimes, and parse structured payloads back into natural language.",
    goalText: "Shatter 2 Rate Limit walls using Tool Executor piece & score 6,500 Compute",
    moves: 24,
    targetLoss: 0.03,
    targetScore: 6500,
    hazards: [
      { type: 'RATE_LIMIT', r: 3, c: 2 },
      { type: 'RATE_LIMIT', r: 3, c: 5 },
      { type: 'HALLUCINATION', r: 2, c: 3, timer: 4 }
    ],
    timerSeconds: null,
    aiOpponent: false
  },
  {
    id: 9,
    title: "Level 9: Multi-Agent Swarm Arena",
    category: "Multi-Agent Coordination & Swarms",
    standard: "Microsoft AutoGen & Google Vertex Multi-Agent Engine",
    conceptTitle: "Multi-Agent Choreography & Consensus",
    conceptDesc: "Complex problems require specialized agent roles: Planners design workflows, Critics audit safety, Executors run code, and Memory units track state in collaborative consensus.",
    goalText: "Spar with AI Bot: Outscore DeepSeeker or achieve 7,500 Compute",
    moves: 26,
    targetLoss: 0.025,
    targetScore: 7500,
    hazards: [],
    timerSeconds: null,
    aiOpponent: true,
    botDifficulty: 'DEEPSEEKER'
  },
  {
    id: 10,
    title: "Level 10: Frontier Alignment Singularity",
    category: "Frontier Alignment & Safe AGI",
    standard: "Google DeepMind Alignment & Anthropic Constitutional AI",
    conceptTitle: "RLHF, Constitutional Rules & Jailbreak Defense",
    conceptDesc: "Frontier systems require rigorous Alignment: Reinforcement Learning from Human Feedback (RLHF), safety classifiers, and red-teaming to defend against adversarial prompts.",
    goalText: "Defeat OmniSentinel AGI, achieve Loss ≤ 0.015, and unlock the Zero-Shot Star!",
    moves: 28,
    targetLoss: 0.015,
    targetScore: 9000,
    hazards: [
      { type: 'HALLUCINATION', r: 2, c: 2, timer: 4 },
      { type: 'HALLUCINATION', r: 2, c: 5, timer: 4 }
    ],
    timerSeconds: null,
    aiOpponent: true,
    botDifficulty: 'OMNISENTINEL'
  },

  // BONUS TIMER SPEEDRUN LEVELS
  {
    id: 101,
    title: "⏱️ Speedrun Alpha: Inference Latency Rush",
    category: "Latency Sprint (Timed)",
    standard: "High-Throughput Serving & Low-Latency LLM Inference",
    conceptTitle: "Inference Latency & KV Cache Optimization",
    conceptDesc: "In real-world LLM deployment, response time is critical. Techniques like vLLM PagedAttention and speculative decoding minimize time-to-first-token (TTFT).",
    goalText: "Score 4,000 Compute in 60 Seconds! Each cascade adds +2 bonus seconds.",
    moves: 999,
    targetLoss: 0.05,
    targetScore: 4000,
    hazards: [],
    timerSeconds: 60,
    isTimed: true,
    aiOpponent: false
  },
  {
    id: 102,
    title: "⏱️ Speedrun Beta: Overfitting Velocity Rush",
    category: "GPU Thermal Throttle Sprint (Timed)",
    standard: "Enterprise GPU Cluster Optimization",
    conceptTitle: "Dynamic Batching & GPU Utilization",
    conceptDesc: "Maximizing GPU tensor core saturation requires continuous batching and efficient memory management to prevent memory thrashing under load.",
    goalText: "Score 6,500 Compute in 90 Seconds while clearing incoming hazards!",
    moves: 999,
    targetLoss: 0.03,
    targetScore: 6500,
    hazards: [
      { type: 'HALLUCINATION', r: 2, c: 3, timer: 6 }
    ],
    timerSeconds: 90,
    isTimed: true,
    aiOpponent: false
  }
];

// Global expose
window.LEVELS_DATA = LEVELS_DATA;
