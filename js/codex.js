/**
 * SYNAPSE SAGA: AI Knowledge Codex & Curriculum Vault
 * Comprehensive reference library aligned with Google Cloud & Microsoft Azure standards.
 */

const CODEX_DATA = [
  {
    category: "1. Classical AI & Deep Learning",
    topics: [
      {
        id: "perceptron",
        title: "Artificial Neuron & Perceptrons",
        standard: "Microsoft AI-900 / Google ML Foundations",
        summary: "The fundamental computational unit of neural networks.",
        details: "Calculates output y = Activation(W · X + b). Weights (W) scale input importance, bias (b) provides threshold shift, and activation functions (ReLU, Sigmoid, GELU) introduce non-linear decision boundaries.",
        gameplayTip: "Match LoRA Tensor Weights (🟡) to adjust parameters and reduce baseline network loss!"
      },
      {
        id: "gradient_descent",
        title: "Gradient Descent & Loss Optimization",
        standard: "Google Professional ML Engineer",
        summary: "How AI systems learn by minimizing prediction errors.",
        details: "Computes partial derivatives of the Loss function with respect to weights (dL/dW). Weights update via: W = W - α * (dL/dW), where α is the Learning Rate. Momentum and Adam optimizers dynamically adapt step sizes.",
        gameplayTip: "Avoid Local Minima! Clearing Data Drift slimes restores smooth gradient flow across the board."
      },
      {
        id: "overfitting",
        title: "Overfitting vs Generalization",
        standard: "Azure Machine Learning / Vertex AI",
        summary: "Preventing models from memorizing training data noise.",
        details: "Overfitting occurs when training loss approaches zero but validation loss spikes. Solutions include L1/L2 regularization (weight decay), dropout, early stopping, and data augmentation.",
        gameplayTip: "Defeat 'Dr. Overfit' in sparring matches by maintaining a high validation score!"
      }
    ]
  },
  {
    category: "2. Generative AI & Transformers",
    topics: [
      {
        id: "transformer",
        title: "Transformer Architecture & Self-Attention",
        standard: "Attention Is All You Need (Vaswani et al. / Google)",
        summary: "The backbone of modern LLMs (GPT-4, Gemini, Claude).",
        details: "Replaces recurrence with Multi-Head Scaled Dot-Product Attention: Attention(Q, K, V) = Softmax(Q·K^T / √d_k) · V. Allows parallel processing of entire token contexts simultaneously.",
        gameplayTip: "Align 4 tokens in a row to trigger a Flash Attention beam that purges an entire line in linear time!"
      },
      {
        id: "tokens_embeddings",
        title: "Tokenization & Vector Embeddings",
        standard: "Azure OpenAI / Google Vertex Vector Search",
        summary: "Converting human language into geometry in latent space.",
        details: "Tokenizers (Byte Pair Encoding, WordPiece) break text into subwords. Embedding models project tokens into high-dimensional vector spaces (e.g. 1536 or 3072 dimensions) where Cosine Similarity measures semantic closeness.",
        gameplayTip: "Collect Embedding Vectors (🔷) to build high-dimensional semantic clusters and boost cascade combos."
      },
      {
        id: "rag",
        title: "Retrieval-Augmented Generation (RAG)",
        standard: "Microsoft Graph RAG / Vertex AI Search & Grounding",
        summary: "Grounding LLMs with real-time enterprise databases.",
        details: "Traditional LLMs hallucinate or lack private knowledge. RAG chunks private documents, embeds them into a Vector DB, and performs Approximate Nearest Neighbor (ANN) search to feed relevant excerpts into the prompt window.",
        gameplayTip: "Match RAG Knowledge Chunks (🟢) to neutralize Hallucination bombs before they detonate!"
      },
      {
        id: "peft_lora",
        title: "LoRA: Low-Rank Adaptation Fine-Tuning",
        standard: "Azure AI Studio / Hugging Face PEFT",
        summary: "Efficient model customization without updating all parameters.",
        details: "Freezes pre-trained weights W_0 and injects trainable rank-decomposition matrices A and B (W = W_0 + B · A, where rank r << d). Reduces trainable parameters by >90% while maintaining accuracy.",
        gameplayTip: "Grab the LoRA Mushroom powerup (🍄) to supercharge your Agent piece movement reach!"
      }
    ]
  },
  {
    category: "3. Agentic AI & Autonomous Systems",
    topics: [
      {
        id: "react_loop",
        title: "The ReAct Loop: Reason + Act",
        standard: "ReAct Framework / LangGraph / Google Antigravity",
        summary: "How autonomous AI agents think and interact with the world.",
        details: "Unlike passive chatbots, an Agent cycles through: 1. Thought (Internal reasoning & step-by-step planning), 2. Action (Tool calling, API request, search query), 3. Observation (Parsing environmental feedback), 4. Reflection (Adapting state).",
        gameplayTip: "Trigger ReAct tokens (🔴) to fuel your Agent Orchestrator piece and unlock sub-agent delegations."
      },
      {
        id: "function_calling",
        title: "Tool Execution & Function Calling",
        standard: "Google Gemini Function Calling / Azure OpenAPI Dispatch",
        summary: "Enabling models to execute code, search databases, and call APIs.",
        details: "The LLM detects when a question requires an external tool, generates a valid JSON payload conforming to a JSON Schema, sends it to the runtime, and incorporates the response.",
        gameplayTip: "Move your Tool Executor piece (⚔️) to smash API Rate Limit walls (🧱) and unlock trapped grid areas."
      },
      {
        id: "multi_agent",
        title: "Multi-Agent Swarms & Consensus",
        standard: "Microsoft AutoGen / Vertex AI Agent Builder",
        summary: "Coordinating teams of specialized AI agents.",
        details: "Complex enterprise tasks are divided among specialized agents: Planner/Orchestrator coordinates workflows, Critic evaluates quality and safety, Tool Executor handles execution, and Memory tracks state.",
        gameplayTip: "Position your Orchestrator, Critic, and Executor near each other to create an Agentic Swarm Synergy bonus!"
      },
      {
        id: "alignment_safety",
        title: "RLHF, Constitutional AI & Safety Alignment",
        standard: "Google DeepMind Frontier Safety & Anthropic Constitutional AI",
        summary: "Ensuring AI systems remain helpful, honest, and harmless.",
        details: "Uses Reinforcement Learning from Human Feedback (RLHF) and Direct Preference Optimization (DPO). Evaluator models verify outputs against constitutional rules and guardrails, defending against prompt injections and jailbreaks.",
        gameplayTip: "Deploy your Critic piece (🔮) diagonally to execute instant audits and reflect away adversarial attacks!"
      }
    ]
  }
];

// Interactive Mini-Quizzes for bonus score & certifications
const CODEX_QUIZZES = [
  {
    question: "In the Transformer architecture, what mathematical operation computes token attention weights?",
    options: [
      "Softmax(Q · K^T / √d_k) · V",
      "Sigmoid(W · X + b)",
      "ReLU(Max(0, X))",
      "L2_Norm(Q - K)"
    ],
    correctIndex: 0,
    explanation: "Scaled Dot-Product Attention multiplies Query and transposed Key matrices, scales by the square root of dimension, applies Softmax, and weights the Value matrix.",
    rewardCompute: 250
  },
  {
    question: "What does the ReAct framework in Agentic AI stand for?",
    options: [
      "Reactive Action Execution",
      "Reasoning and Acting (Thought -> Action -> Observation)",
      "Recurrent Activation Tensor",
      "Retrieval Augmented Compression"
    ],
    correctIndex: 1,
    explanation: "ReAct intertwines verbal reasoning (Thoughts) with action execution (Actions) and environmental feedback (Observations).",
    rewardCompute: 300
  },
  {
    question: "Why is RAG (Retrieval-Augmented Generation) preferred over full fine-tuning for proprietary enterprise knowledge?",
    options: [
      "It requires retraining 70 billion parameters every day",
      "It eliminates vector databases completely",
      "It grounds answers in real-time verified documents with citations and avoids costly retraining",
      "It converts all text into binary images"
    ],
    correctIndex: 2,
    explanation: "RAG dynamically fetches factual snippets from enterprise stores at inference time, dramatically reducing hallucination and updating instantly without retraining.",
    rewardCompute: 350
  }
];

// Global expose
window.CODEX_DATA = CODEX_DATA;
window.CODEX_QUIZZES = CODEX_QUIZZES;
