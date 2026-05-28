# Transformer and Modern LLM Internals

Topic family E · Prerequisites: Deep Learning Core, sequence modeling intuition · Unlocks: Multimodal/VLMs, RAG, Agents, Alignment, Systems/Serving

This is one of the highest-value modules in the system. It covers the concepts interviewers use to distinguish API familiarity from actual model understanding.

---

## Scope

- Tokenization
- Embeddings
- Positional encoding and RoPE
- Self-attention
- MHA, MQA, GQA
- KV cache
- Context windows and long-context behavior
- Scaling behavior
- MoE (Mixture of Experts)
- Inference-time trade-offs
- Reasoning vs latency vs cost
- Test-time compute and reasoning models
- Structured outputs and constrained generation

## Why This Module Matters

Strong LLM answers require more than saying "transformers use attention." Interviewers want to see whether you can connect internal mechanics to:
- Latency and memory consumption
- Long-context behavior and degradation
- Routing and serving constraints
- Why modern variants exist at all
- Model economics: token cost, throughput, and when to use which model

---

## Subtopic Breakdown

### Tokenization
- BPE, SentencePiece, WordPiece: trade-offs in vocabulary size and coverage
- Tokenization artifacts: how rare words, code, and multilingual text get split
- Why tokenizer choice affects context window utilization
- Token counting: why prompt length ≠ word count and cost implications

### Embeddings
- Token embeddings: learned lookup tables
- Positional embeddings: absolute (original transformer), relative, rotary (RoPE)
- Embedding dimensions and their relationship to model capacity
- Why embeddings are the input to everything downstream

### Positional Encoding and RoPE
- Why position information is needed (attention has no inherent ordering)
- Absolute vs relative vs rotary: trade-off landscape
- RoPE: rotation-based encoding, extrapolation behavior, long-context enablement
- ALiBi: linear attention bias, no learned positions
- Why RoPE dominates modern LLMs and what its limitations are

### Attention Mechanics
- Self-attention: query, key, value — what each computes and why
- Attention scores: softmax over dot products, scaling by √d
- Causal masking: why decoder-only models mask future tokens
- Attention cost: O(n²d) — why long sequences are expensive
- Flash Attention: IO-aware tiling, memory-efficient attention without approximation
- Multi-head attention: why multiple heads, what diverse heads capture

### MHA, MQA, GQA
- MHA: each head has independent Q, K, V projections — maximum expressiveness, maximum KV cache size
- MQA: all heads share K, V — minimal KV cache, some quality trade-off
- GQA: heads grouped, sharing K, V within groups — practical compromise
- **Why this exists:** KV cache memory is the serving bottleneck, not just model quality
- Interview test: can you explain the serving motivation, not just the architecture difference?

### KV Cache
- Why KV cache exists: avoid recomputing attention for previous tokens during autoregressive generation
- Memory cost: proportional to batch_size × num_layers × num_heads × seq_len × head_dim
- Why KV cache is the primary memory bottleneck in LLM serving
- PagedAttention (vLLM): manages KV cache like virtual memory pages
- KV cache and context length: longer contexts → more memory → fewer concurrent requests

### Context Windows and Long-Context
- Context window size: what the model can attend to in a single forward pass
- Long-context models: 128K, 1M+ context — what they enable and where they degrade
- Lost-in-the-middle: attention tends to focus on beginning and end of long contexts
- When RAG is better than long context and when long context replaces RAG
- Context window utilization: why filling the window is not always optimal

### Scaling Behavior
- Chinchilla scaling laws: optimal compute allocation between model size and data size
- Scaling model size vs data vs compute: diminishing returns and practical limits
- Emergence: capabilities that appear at scale without being explicitly trained
- Over-training: training beyond Chinchilla-optimal for inference efficiency (smaller, longer-trained models)

### MoE (Mixture of Experts)
- Core idea: route tokens to specialized expert subnetworks
- Advantage: larger effective model capacity with lower per-token compute
- Router design: top-k gating, load balancing, expert collapse
- Serving implications: all experts loaded in memory even if only some activate
- Interview focus: total parameter count vs active parameter count, memory vs compute trade-off

### Sampling and Generation
- Temperature: controls randomness, higher → more diverse
- Top-k and top-p (nucleus): truncating the distribution
- Repetition penalty, frequency penalty, presence penalty
- Structured output: constrained decoding, JSON mode, grammar-guided generation
- Speculative decoding: draft model generates, target model verifies — throughput optimization

### Test-Time Compute and Reasoning Models
- Chain-of-thought: reasoning steps improve accuracy on complex tasks
- o1-style reasoning: allocating more compute at inference for harder problems
- Trade-off: reasoning tokens increase latency and cost but improve accuracy
- When to use reasoning models vs fast models: task complexity determines the choice
- Budget-aware routing: different models for different query difficulties

---

## What Interviewers Test by Band

### 0–2 years
- Understand tokenization, embeddings, attention, positional encoding, and context windows
- Can explain why attention is O(n²) and what that means practically
- Knows what a transformer block contains

### 2–5 years
- Explain RoPE, KV cache, attention cost, sampling strategies
- Reason about context limits and why GQA/MQA exist
- Understand inference trade-offs: latency vs throughput vs cost

### 5–8 years
- Compare MHA vs GQA, dense vs MoE, long-context approaches
- Reason about model economics: which model for which workload
- Understand Flash Attention, speculative decoding, and serving stack interactions

### 8+ years
- Connect architecture choice to product constraints, serving economics, and platform portfolio
- Reason about test-time compute allocation and model routing strategies
- Define platform-level model selection and routing policy

---

## Depth Ladder

| Level | What Good Looks Like | What Answers Should NOT Be |
|---|---|---|
| Concept | Can explain each component's role and interaction | Listing components without explaining why they exist |
| Applied | Can reason about trade-offs: context length vs memory, MHA vs GQA, dense vs MoE | "It depends" without specifying the trade-off variables |
| System | Can connect internals to serving cost, latency, and routing decisions | Discussing architecture in isolation from deployment reality |
| Debugging | Can diagnose generation quality issues from tokenization, attention, or sampling | "Retrain the model" for every quality problem |
| Architect | Can design model selection and routing strategy for a platform | Recommending a single model for all use cases |

---

## Anti-Patterns and Weak Answers

- Saying RoPE is just positional encoding without long-context implications
- Naming GQA or MoE without explaining the serving motivation
- Treating large context windows as universally good
- Ignoring KV cache memory cost when discussing throughput
- Treating attention as the only mechanism without acknowledging alternatives (Mamba, SSMs)
- Saying "transformers use attention" as if that explains anything
- Discussing model quality without connecting to inference cost
- Ignoring structured output / constrained generation as a practical production concern

---

## Role Relevance

| Role | Depth Needed | Focus Areas |
|---|---|---|
| LLM / RAG / Agent | ★★★ | Full internals, sampling, structured output, KV cache, context |
| Research | ★★★ | Architecture comparisons, scaling, MoE, attention alternatives |
| Software → AI | ★★★ | Tokenization, embeddings, attention, inference trade-offs |
| Data / ML | ★★★ | Internals for evaluation, model selection, fine-tuning |
| DL / CV | ★★ | Attention mechanics, ViT bridge, cross-architecture comparison |
| Platform AI | ★★ | KV cache, serving economics, model routing |
| DevOps → AIOps | ★★ | Inference characteristics, resource consumption patterns |
| Senior / Architect | ★★ | Model economics, portfolio design, routing strategy |

---

## What To Study Next

- [Systems, Serving, and Inference](./systems-serving-and-inference.md) — where internals meet deployment reality
- [RAG](./rag.md) — how retrieval interacts with context windows and generation
- [Alignment / Post-training](./alignment-post-training.md) — behavior shaping after pretraining
- [Multimodal and VLMs](./multimodal-and-vlms.md) — extending transformers to vision and multimodal

## Question Bank

Practice questions for this module are in the question banks:
- [GenAI question bank](../../modules/02_genai/) — generative AI, prompting, fine-tuning
- [LLM Engineering question bank](../../modules/03_llm_engineering/) — LLM internals, sampling, scaling

## Practice Surface

- [Batch 01 question library](../question-library/transformer-and-modern-llm-internals/transformer-and-modern-llm-internals-batch-01.md) — targeted internals drilling by question
- [Problem Set 01](../problem-sets/transformer-and-modern-llm-internals/transformer-and-modern-llm-internals-problem-set-01.md) — product-facing model internals, routing, and context-cost reasoning practice

## Cross-References

- [Module Index](../indexes/module-index.md) — all modules with sequences and detail cards
- [Experience Index](../indexes/experience-index.md) — depth expectations by career band
- [Tag Index](../indexes/tag-index.md) — related tags: `tokenization`, `embedding`, `rope`, `attention`, `mha`, `gqa`, `moe`, `kv-cache`, `context-window`, `scaling`, `flash-attention`, `sampling`
- [Topic Graph](../topic-graph.md) — prerequisite map
