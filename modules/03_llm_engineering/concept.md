# Module 03 — LLM Engineering: Concept Level

---

## Q-03-C-001: How does tokenization work in LLMs, and why does it matter for engineering decisions?

**Module:** LLM Engineering
**Submodule:** Tokenization
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Beginner, Early-career, Mid-level
**Persona Relevance:** Software Dev → AI Engineer, ML / Data Engineer, Fresher / Beginner
**Tags:** [tokenization, bpe, sentencepiece, vocabulary, llm-engineering]
**Prerequisites:** Q-00-C-002
**Estimated Interview Round:** Technical, Screening
**Why This Question Matters:** Tokenization is invisible but determines cost, context window capacity, and multilingual ability. A single poor tokenization decision can 2x your API costs or break your application in non-English languages.

---

**Question**

How do modern LLMs tokenize text? What is BPE, and why does tokenization affect cost, performance, and multilingual capability?

---

**Expected Answer (Short)**

LLMs don't process raw text — they split it into tokens (subword units). BPE (Byte-Pair Encoding) starts with bytes/characters and iteratively merges the most frequent pairs into larger tokens. "unhappiness" might become ["un", "happiness"] or ["un", "happi", "ness"]. It affects: (1) Cost — APIs charge per token; inefficient tokenization = more tokens = higher cost. (2) Context window — fixed token limit means fewer "words" for inefficient tokenizers. (3) Multilingual — English-centric tokenizers split non-English text into many tokens, increasing cost 2-5x.

---

**Deep Answer**

- **BPE (Byte-Pair Encoding):**
  - Start with character-level (or byte-level) vocabulary
  - Find the most frequent adjacent pair → merge into a new token
  - Repeat N times to build vocabulary (typically 32K-128K tokens)
  - Result: common words = single token, rare words = multiple tokens

- **Tokenizer examples:**
  | Tokenizer | Vocab Size | Model |
  |-----------|-----------|-------|
  | GPT-4 (cl100k) | 100K | GPT-4, GPT-4o |
  | Llama 3 | 128K | Llama 3 family |
  | T5 SentencePiece | 32K | T5, mT5 |

- **Engineering impact:**
  - **Cost:** "Hello world" = 2 tokens. "Привет мир" (Russian) = 6 tokens. Same meaning, 3x cost.
  - **Context window:** 128K tokens ≈ 100K English words, but ≈ 40K Chinese characters
  - **Reasoning:** Each token is one "step" of reasoning. More tokens ≠ better reasoning.
  
- **Practical issues:**
  - Numbers: "12345" may become ["123", "45"] — model doesn't "see" the number
  - Code: spaces/indentation eat tokens (Python whitespace is expensive)
  - Special characters: emojis can be 3-5 tokens each

---

**Follow-up Questions**

1. How does tokenization affect math ability in LLMs?
2. What's the difference between BPE and SentencePiece?
3. If you're building a system for Japanese users, how does tokenizer choice affect your architecture?

---

**Common Weak Answers / Red Flags**

- "Tokenization splits on words and spaces" — wrong
- No awareness of multilingual implications
- Can't explain BPE at a high level

---

**Interviewer Evaluation Signal**

Foundational LLM knowledge. The cost and multilingual implications are the key practical insights. Candidates who connect tokenization to engineering decisions (cost estimates, context budgets) demonstrate useful understanding.

---

## Q-03-C-002: Explain the self-attention mechanism. Why is it $O(n^2)$ and what are the implications for long-context models?

**Module:** LLM Engineering
**Submodule:** Attention Mechanisms
**Level:** Concept
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [attention, self-attention, transformer, quadratic-complexity, llm-engineering]
**Prerequisites:** Q-01-C-007
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** Self-attention is the core compute bottleneck of transformers. Understanding its quadratic nature explains why long-context models are expensive and guides architectural decisions about context window size.

---

**Question**

Explain how self-attention works in a transformer. Why does it scale quadratically with sequence length, and what does that mean for serving long-context LLMs?

---

**Expected Answer (Short)**

Self-attention computes a weighted sum of all Value vectors, where weights come from the dot product of Query and Key vectors. For each of n tokens, it attends to all n tokens → $O(n^2)$ attention matrix. For 4K context: 16M operations. For 128K context: 16B operations (1000x more). Practical impact: long-context models need proportionally more GPU memory (for KV cache) and compute, making them significantly more expensive per request.

---

**Deep Answer**

- **Mechanism:**
  - Input: sequence of n embeddings X ∈ ℝ^(n×d)
  - Projections: Q = XW_Q, K = XW_K, V = XW_V
  - Attention: $\text{Attention}(Q,K,V) = \text{softmax}(\frac{QK^T}{\sqrt{d_k}})V$
  - $QK^T$ produces an n×n attention matrix → each token's attention over all others

- **Why $O(n^2)$:**
  - Computing $QK^T$: n×d multiplied by d×n = n×n matrix → O(n²d)
  - Storing the attention matrix: n×n floats → O(n²) memory
  - Softmax + weighted sum: O(n²) operations per layer
  - Total across L layers, H heads: O(L × H × n² × d/H) = O(Ln²d)

- **Practical numbers:**
  | Context Length | Attention Matrix | KV Cache (per layer, fp16) |
  |----------------|-----------------|---------------------------|
  | 4K | 16M entries | ~1MB |
  | 32K | 1B entries | ~8MB |
  | 128K | 16B entries | ~32MB |
  | 1M | 1T entries | ~256MB |
  
  For a 70B model with 80 layers: KV cache at 128K = ~2.5GB per request

- **Solutions for long context:**
  - **FlashAttention:** Exact attention but memory-efficient (tiles computation to fit in SRAM)
  - **Multi-Query Attention (MQA):** Share K,V heads → reduce KV cache by 8-16x
  - **Grouped-Query Attention (GQA):** Share K,V within groups → intermediate between MHA and MQA
  - **Sliding window attention:** Only attend to nearby tokens + a few global tokens
  - **Ring attention:** Distribute sequence across GPUs, each processes a segment

---

**Follow-up Questions**

1. How does FlashAttention achieve the same result as standard attention with less memory?
2. What's the trade-off between MHA, GQA, and MQA?
3. If a model supports 128K context, should you always fill it? Why not?

---

**Common Weak Answers / Red Flags**

- Can't explain why it's quadratic
- "Just use a bigger GPU" to handle long contexts
- Doesn't know about FlashAttention or GQA

---

**Interviewer Evaluation Signal**

Technical depth on the most critical LLM bottleneck. Understanding the quadratic scaling and modern solutions (FlashAttention, GQA) shows the candidate can reason about compute constraints.

---

## Q-03-C-003: What are the different positional encoding schemes (RoPE, ALiBi) and why do they matter for context length extrapolation?

**Module:** LLM Engineering
**Submodule:** Positional Encoding
**Level:** Concept
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Senior / Architect
**Tags:** [positional-encoding, rope, alibi, context-length, llm-engineering]
**Prerequisites:** Q-03-C-002
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** Positional encoding determines how well a model handles sequences longer than what it was trained on. This is critical for production systems that need to process long documents when the base model was trained on shorter contexts.

---

**Question**

Compare RoPE and ALiBi positional encodings. Why is positional encoding critical for context length extrapolation?

---

**Expected Answer (Short)**

Positional encoding tells the model where each token is in the sequence. RoPE (Rotary Position Embedding) encodes position by rotating Q and K vectors by an angle proportional to position — enables relative position awareness. ALiBi (Attention with Linear Biases) doesn't modify embeddings; it adds a linear bias to attention scores based on distance between tokens — naturally decays attention with distance. For extrapolation: ALiBi generalizes better to unseen lengths. RoPE can be extended with NTK-aware scaling or YaRN for longer contexts.

---

**Deep Answer**

- **Why positional encoding matters:**
  - Self-attention is position-agnostic by default ("bag of tokens")
  - Without positional encoding, "The cat sat on the mat" and "The mat sat on the cat" produce identical attention patterns
  - Positional encoding injects order information

- **RoPE (Rotary Position Embedding):**
  - Rotates Q and K vectors by θ·position in 2D subspaces
  - Dot product Q·K naturally encodes relative position (rotation difference)
  - Used by: Llama, Mistral, Qwen, most modern LLMs
  - Extrapolation: struggles beyond training length without modifications
  - Extensions: RoPE scaling (NTK-aware), YaRN, dynamic NTK → extend to 4-16x training length

- **ALiBi (Attention with Linear Biases):**
  - No modification to Q, K, V embeddings
  - Adds penalty: attention_score -= m × |i - j| (linear bias based on distance)
  - m is a head-specific slope (different heads attend at different ranges)
  - Used by: BLOOM, MPT
  - Extrapolation: naturally generalizes to longer sequences (linear bias extrapolates)

- **Comparison:**
  | Property | RoPE | ALiBi |
  |----------|------|-------|
  | Position info | In Q, K vectors | In attention scores |
  | Relative position | Yes (implicit) | Yes (explicit) |
  | Extrapolation | Needs scaling tricks | Naturally extrapolates |
  | Quality at training length | Higher | Slightly lower |
  | Adoption | Dominant | Declining |

- **Production relevance:** If your model was trained on 4K tokens but you need 32K, RoPE with YaRN scaling can extend it, but quality degrades at extreme extensions. Better: choose a model pre-trained at your target length.

---

**Follow-up Questions**

1. Your model was trained on 8K context but you need 64K. What are your options?
2. How does Llama's RoPE scaling work? What's the quality trade-off?
3. Why did the field converge on RoPE instead of ALiBi, despite ALiBi's better extrapolation?

---

**Common Weak Answers / Red Flags**

- Confuses positional encoding with positional embedding (learned absolute positions)
- Can't explain relative vs absolute positional encoding
- "Just train on longer contexts" — doesn't understand the extrapolation problem

---

**Interviewer Evaluation Signal**

Tests deep understanding of transformer architecture. Knowing RoPE vs ALiBi indicates the candidate follows recent architectural developments and understands context length constraints.

---

## Q-03-C-004: What is the KV cache, and why is it the primary memory bottleneck in LLM inference?

**Module:** LLM Engineering
**Submodule:** KV Cache
**Level:** Concept
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, DevOps / SRE → AIOps, Senior / Architect
**Tags:** [kv-cache, inference, memory, llm-engineering, performance]
**Prerequisites:** Q-03-C-002, Q-02-C-008
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** The KV cache determines how many concurrent requests a GPU can serve and how long contexts can be. It's often the limiting factor in LLM serving economics, not compute.

---

**Question**

Explain what the KV cache is, why it exists, and why it dominates GPU memory during LLM inference.

---

**Expected Answer (Short)**

During autoregressive generation, each new token needs to attend to all previous tokens. Without caching, you'd recompute K and V for all previous tokens at every step (wasteful). The KV cache stores these computed K and V vectors, so each new token only computes its own Q and looks up cached K, V. Problem: KV cache grows linearly with sequence length and batch size, and for large models (70B+ with 80 layers), it can exceed model weight memory. At 128K context on a 70B model, KV cache is ~40GB per request.

---

**Deep Answer**

- **Without KV cache (naive):**
  - At step t: compute attention over all t tokens from scratch
  - Total work for generating N tokens: N × (1 + 2 + ... + N) / 2 = O(N³)
  - Extremely wasteful — recomputing the same K, V vectors every step

- **With KV cache:**
  - At step t: compute Q_t from new token, lookup K_{1:t-1} and V_{1:t-1} from cache
  - Only compute K_t and V_t for the new token, append to cache
  - Total work: O(N²) instead of O(N³)

- **Memory calculation:**
  ```
  KV cache per token per layer = 2 × d_model × sizeof(dtype)
  (2 for K and V, d_model is hidden dimension)
  
  For Llama 3 70B:
  - d_model = 8192
  - Layers = 80
  - GQA: 8 KV heads (not 64)
  - Per-token KV cache = 2 × 8 × 128 × 80 × 2 bytes (fp16) = 327KB
  
  At 128K context: 327KB × 128K = ~40GB per request
  ```

- **Why it's the bottleneck:**
  - Model weights: 70B × 2 bytes = 140GB (fixed, shared across requests)
  - KV cache: ~40GB per request at full context
  - 2 concurrent requests at 128K: 80GB of KV cache alone
  - GPU memory is the constraint → fewer concurrent requests → lower throughput → higher cost per request

- **Solutions:**
  - **PagedAttention (vLLM):** Non-contiguous memory pages for KV cache, like OS virtual memory. Eliminates fragmentation, enables memory sharing across requests.
  - **GQA/MQA:** Reduce KV heads → proportionally smaller KV cache
  - **Quantized KV cache:** FP8 or INT8 KV cache → 50-75% memory reduction
  - **Sliding window:** Only cache last W tokens → bounded memory
  - **Token eviction:** Evict least-attended tokens from cache

---

**Follow-up Questions**

1. How does PagedAttention solve KV cache memory fragmentation?
2. If KV cache is the bottleneck, would it be better to use shorter prompts? How much does it save?
3. How does prefix caching work and when is it useful?

---

**Common Weak Answers / Red Flags**

- Doesn't know KV cache exists
- "Memory is just the model weights" — ignores KV cache
- Can't estimate KV cache size for a given model

---

**Interviewer Evaluation Signal**

System-level LLM understanding. KV cache is the #1 constraint in LLM serving economics. Candidates who can estimate KV cache size and know the mitigation strategies (PagedAttention, GQA) demonstrate practical serving knowledge.

---

## Q-03-C-005: Compare Multi-Head Attention (MHA), Multi-Query Attention (MQA), and Grouped-Query Attention (GQA). When does each make sense?

**Module:** LLM Engineering
**Submodule:** Attention Mechanisms
**Level:** Concept
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Senior / Architect
**Tags:** [mha, mqa, gqa, attention, inference, kv-cache, llm-engineering]
**Prerequisites:** Q-03-C-002, Q-03-C-004
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** GQA has become the default attention mechanism for modern LLMs (Llama 3, Mistral, Gemma). Understanding why involves KV cache economics and is essential for model selection and serving optimization.

---

**Question**

What's the difference between MHA, MQA, and GQA? Why did the field move from MHA to GQA?

---

**Expected Answer (Short)**

MHA: separate K, V, Q heads (e.g., 64 each). Full expressiveness but large KV cache. MQA: one shared K, V head across all Q heads. Minimal KV cache but quality drops. GQA: group Q heads to share K, V (e.g., 8 KV groups for 64 Q heads). Best balance — 85-90% of MHA quality, 8x smaller KV cache. The field moved to GQA because KV cache dominates inference cost, and GQA makes long-context serving practical.

---

**Deep Answer**

- **Comparison:**
  | Property | MHA | MQA | GQA |
  |----------|-----|-----|-----|
  | Q heads | H | H | H |
  | K,V heads | H | 1 | G (H/group_size) |
  | KV cache size | H × d | 1 × d | G × d |
  | Quality | Best | Lower | Near-MHA |
  | Inference speed | Slowest | Fastest | Fast |
  | Example | GPT-3, BERT | PaLM | Llama 3, Mistral |

- **Why GQA won:**
  - **Training:** Quality difference between MHA and GQA is small (1-2% on benchmarks)
  - **Inference:** GQA with G=8 → 8x smaller KV cache vs MHA
  - **Serving:** 8x smaller KV cache → 8x more concurrent requests per GPU
  - **Cost:** Directly translates to 3-5x lower serving cost at scale

- **Concrete example (Llama 3 70B):**
  - 64 Q heads, 8 KV heads (GQA with group size 8)
  - If MHA instead: KV cache would be 8x larger → ~320GB at 128K context
  - With GQA: ~40GB at 128K context → feasible on a single node

---

**Follow-up Questions**

1. Can you convert an MHA model to GQA post-training? How?
2. What group size works best? How do you choose?
3. Does GQA affect fine-tuning? Should LoRA target the reduced K,V heads?

---

**Common Weak Answers / Red Flags**

- Doesn't know MQA or GQA exist
- Can't explain the KV cache reduction
- "More heads = better" without understanding serving trade-offs

---

**Interviewer Evaluation Signal**

Modern LLM architecture knowledge. GQA is the current industry standard. Understanding the WHY (KV cache economics) is more important than the WHAT.

---

## Q-03-C-006: How do different decoding strategies (greedy, beam search, sampling) affect LLM output quality?

**Module:** LLM Engineering
**Submodule:** Decoding Strategies
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Early-career, Mid-level
**Persona Relevance:** Software Dev → AI Engineer, ML / Data Engineer
**Tags:** [decoding, sampling, beam-search, greedy, llm-engineering]
**Prerequisites:** Q-02-C-009
**Estimated Interview Round:** Technical
**Why This Question Matters:** Decoding strategy choice significantly affects output quality, diversity, and reliability. Using the wrong strategy for your task produces either repetitive/boring output or unpredictable/unreliable output.

---

**Question**

Compare greedy decoding, beam search, and sampling-based decoding. When should you use each?

---

**Expected Answer (Short)**

Greedy: always pick highest probability token. Simple, fast, deterministic, but repetitive and misses globally optimal sequences. Beam search: explore top-k paths simultaneously, pick the highest overall probability sequence. Better than greedy for structured output (translation) but still repetitive for creative tasks. Sampling (top-p, top-k, temperature): randomly sample from the distribution. Produces diverse, creative output but less reliable. Use: greedy for deterministic extraction, beam search for translation/summarization, sampling for conversation/creative writing.

---

**Deep Answer**

- **Greedy decoding:**
  - At each step: pick argmax P(token|context)
  - Pro: deterministic, fastest, simplest
  - Con: "greedy trap" — locally optimal choices lead to globally suboptimal sequences
  - Con: highly repetitive ("The cat sat on the mat. The cat sat on the mat. The cat...")
  - Use: structured extraction, classification, when determinism required

- **Beam search:**
  - Maintain top-B (beam width) candidate sequences at each step
  - Expand each by all vocabulary, keep top-B overall
  - Returns the highest probability complete sequence
  - Pro: better than greedy (considers alternatives), good for "correct" outputs
  - Con: still tends toward high-frequency, generic outputs. Not creative.
  - Con: more compute (B × cost of greedy)
  - Use: translation, summarization, code generation with correctness priority

- **Sampling (temperature + top-p + top-k):**
  - Sample from the probability distribution (with optional filtering)
  - Pro: diverse, creative, natural
  - Con: non-deterministic, can produce low-quality samples
  - Mitigation: top-p/top-k filter out low-probability tokens, temperature controls diversity
  - Use: chat, creative writing, brainstorming

- **Modern LLMs (GPT-4, Claude):** Use sampling by default (temperature, top-p). Beam search is rare for LLMs because it produces boring output. The sampling parameters ARE the quality control mechanism.

---

**Follow-up Questions**

1. What is repetition penalty and when should you use it?
2. Can you combine beam search with sampling? How?
3. Why don't modern chat LLMs use beam search?

---

**Common Weak Answers / Red Flags**

- "Beam search is always better than greedy" — not for creative tasks
- Doesn't understand the trade-off between quality and diversity
- Can't explain when deterministic output is desirable

---

**Interviewer Evaluation Signal**

Practical generation knowledge. The key insight is matching decoding strategy to task requirements: deterministic for extraction, creative for conversation.

---

## Q-03-C-007: What are speculative decoding and medusa heads? How do they speed up LLM inference?

**Module:** LLM Engineering
**Submodule:** Inference Optimization
**Level:** Concept
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** ML / Data Engineer, Senior / Architect, DevOps / SRE → AIOps
**Tags:** [speculative-decoding, medusa, inference, latency, llm-engineering]
**Prerequisites:** Q-03-C-004, Q-02-C-008
**Estimated Interview Round:** Deep Dive
**Why This Question Matters:** Speculative decoding is the most promising technique for reducing LLM latency without quality loss. It's becoming standard in production serving stacks and understanding it is essential for LLM infrastructure engineers.

---

**Question**

Explain speculative decoding. How does it speed up LLM inference without changing the output distribution?

---

**Expected Answer (Short)**

Speculative decoding uses a small "draft" model to generate N candidate tokens quickly. The large "target" model then verifies all N tokens in a single forward pass (parallel). If they match, you've generated N tokens at the cost of ~1 large model forward pass. If they diverge at position k, accept tokens 1 to k-1 and restart. Key insight: verifying N tokens in parallel is as fast as generating 1 token (GPU parallelism). Typical speedup: 2-3x for text, higher for predictable sequences.

---

**Deep Answer**

- **Why it works:**
  - Autoregressive generation: generate 1 token → wait → generate next → wait (sequential)
  - GPU is underutilized: each step uses massive compute for a single token
  - Speculative decoding: verify N tokens in parallel → GPU fully utilized
  - The verification step is mathematically equivalent to generating from the target model → same quality

- **Algorithm:**
  ```
  1. Draft model generates N candidate tokens: [t1, t2, ..., tN]
  2. Target model processes input + all N candidates in ONE forward pass
  3. For each position i:
     - Compare draft P_draft(ti) vs target P_target(ti)
     - If target agrees: accept token
     - If target disagrees: reject, sample from corrected distribution, stop
  4. All accepted tokens are added to the output
  5. Repeat from step 1
  ```

- **Key properties:**
  - **Lossless:** Output distribution is identical to generating from target model alone
  - **Speedup depends on:** Draft model accuracy (how often target agrees) and draft model speed
  - **Best case:** Draft model agrees on all N tokens → Nx speedup
  - **Worst case:** Draft model always wrong → slight slowdown (draft + verification overhead)

- **Draft model selection:**
  - Same architecture, fewer layers (e.g., 1B draft for 70B target)
  - Same-family smaller model (Llama 3 8B draft for Llama 3 70B target)
  - Same model with less compute (first 4 layers as draft)

- **Medusa heads (variation):**
  - Instead of a separate draft model, add extra prediction heads to the target model
  - Each head predicts 1, 2, 3... positions ahead
  - No separate model needed, but requires fine-tuning the heads
  - Simpler deployment (one model, no orchestration)

- **Practical speedup:**
  | Scenario | Draft Acceptance Rate | Speedup |
  |----------|----------------------|---------|
  | Code generation | 80-90% | 2.5-3x |
  | Natural language | 60-70% | 1.7-2.3x |
  | Creative writing | 40-50% | 1.3-1.6x |

---

**Follow-up Questions**

1. Why is the speedup higher for code generation than creative writing?
2. How does speculative decoding interact with KV cache management?
3. If the draft model is inaccurate, is there any quality degradation?

---

**Common Weak Answers / Red Flags**

- "It approximates the output" — wrong, it's lossless
- Doesn't understand why verification of N tokens is parallel (batch processing on GPU)
- Can't explain when speculative decoding helps most vs least

---

**Interviewer Evaluation Signal**

Advanced inference engineering. Understanding speculative decoding shows the candidate knows cutting-edge LLM serving techniques. The key insight: verification is parallel due to GPU architecture.

---

## Q-03-C-008: What is model quantization and how does it enable large model deployment on constrained hardware?

**Module:** LLM Engineering
**Submodule:** Quantization
**Level:** Concept
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, DevOps / SRE → AIOps
**Tags:** [quantization, int8, int4, gptq, awq, gguf, llm-engineering]
**Prerequisites:** Q-01-C-001, Q-02-C-008
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** Quantization makes the difference between "needs 4 H100s" and "runs on a single GPU." It's the primary technique enabling LLM deployment for cost-conscious teams and edge deployment scenarios.

---

**Question**

What is quantization in the context of LLMs? Compare INT8, INT4, and FP8 quantization techniques.

---

**Expected Answer (Short)**

Quantization converts model weights (and sometimes activations) from high precision (FP32/FP16) to lower precision (INT8, INT4, FP8). This reduces memory by 2-4x and can increase throughput. INT8: halves FP16 memory, minimal quality loss. INT4 (GPTQ, AWQ): quarters memory, enables 70B on single GPU, 1-3% quality degradation. FP8: hardware-native on H100, near-FP16 quality with 2x memory savings. Trade-off: lower precision = smaller memory = some quality degradation.

---

**Deep Answer**

- **Types:**
  | Format | Bits | Memory (70B model) | Quality Loss | Hardware |
  |--------|------|-------------------|-------------|----------|
  | FP16 | 16 | 140GB | Baseline | Any modern GPU |
  | FP8 | 8 | 70GB | <0.5% | H100, H200 |
  | INT8 | 8 | 70GB | <1% | Any GPU (software) |
  | INT4 | 4 | 35GB | 1-3% | Any GPU (software) |

- **Techniques:**
  - **GPTQ:** Post-training quantization using calibration data. Quantizes weights layer-by-layer, optimizing to minimize output error. INT4, popular for deployment.
  - **AWQ (Activation-Aware Weight Quantization):** Identifies and protects "salient" weights (high activation channels). Better quality than naive INT4.
  - **GGUF (llama.cpp format):** Various quantization levels (Q4_K_M, Q5_K_M, etc.). Optimized for CPU inference. Popular for local deployment.
  - **bitsandbytes:** Dynamic quantization in Python. NF4 (normalized float 4-bit) for QLoRA.
  - **FP8:** Native H100/H200 hardware support. No calibration needed, near-lossless.

- **When quality matters:**
  - FP8 on H100: best quality-efficiency trade-off (Recommended if hardware supports it)
  - INT8: safe for all tasks, widely supported
  - INT4: acceptable for chat/generation, risky for precision tasks (math, extraction)
  - Lower than INT4: significant quality degradation, only for extreme constraints

- **Production recommendation:**
  ```
  Budget for GPUs?
    Yes → FP8 (if H100) or INT8 (if A100) for best quality
    No → INT4 (AWQ) for maximum accessibility
  Running locally?
    Yes → GGUF Q4_K_M or Q5_K_M
  ```

---

**Follow-up Questions**

1. How does quantization affect fine-tuning? Can you fine-tune a quantized model?
2. What's the difference between weight quantization and activation quantization?
3. Your INT4 model gives wrong answers on math problems but works fine for chat. Why?

---

**Common Weak Answers / Red Flags**

- "Quantization just makes things smaller" — no explanation of how
- Can't explain the quality trade-off
- Doesn't know about different techniques (GPTQ vs AWQ vs GGUF)

---

**Interviewer Evaluation Signal**

Practical deployment knowledge. Quantization is essential for cost-effective LLM deployment. Candidates who can recommend the right quantization level for a given use case and hardware constraint demonstrate deployment experience.

---

## Q-03-C-009: What are the key considerations when selecting a base model for a new project?

**Module:** LLM Engineering
**Submodule:** Model Selection
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Early-career, Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer, ML / Data Engineer, Senior / Architect
**Tags:** [model-selection, benchmarks, licensing, llm-engineering, production]
**Prerequisites:** Q-02-C-001
**Estimated Interview Round:** Screening, Technical
**Why This Question Matters:** The base model choice is the foundation of your LLM project. A wrong choice costs weeks of rework. Understanding the selection criteria (beyond "pick the top leaderboard model") is essential.

---

**Question**

You're starting a new LLM project. What factors do you consider when selecting the base model?

---

**Expected Answer (Short)**

Key factors: (1) Task fit — does the model excel at your specific task type? (2) Size vs. capability — smallest model that meets quality requirements. (3) License — open weights vs. API, commercial use allowed? (4) Context window — matches your input length requirements. (5) Language support — trained on your target languages? (6) Ecosystem — fine-tuning support, quantized versions available, community adoption. (7) Serving cost — inference cost at your expected volume. (8) Privacy — can data go to external API?

---

**Deep Answer**

- **Selection framework:**
  | Factor | Questions to Ask |
  |--------|-----------------|
  | Task fit | Code → CodeLlama. Math → DeepSeek-Math. General → Llama 3 |
  | Model size | Can a 7B model suffice? Don't use 70B if 7B works. |
  | License | Apache 2.0, Llama license, proprietary. Is commercial use OK? |
  | Context window | 8K, 32K, 128K. Match to your longest expected input. |
  | Languages | English-only or multilingual? Check training data composition. |
  | Benchmarks | Custom eval > public benchmarks (MMLU, HumanEval) |
  | Fine-tuning | LoRA support, training scripts, community adapters available? |
  | Quantization | GGUF, GPTQ, AWQ versions available? |
  | Serving | vLLM support, TensorRT-LLM optimized? |
  | Community | Active development, bug fixes, documentation? |
  | Cost | GPU requirements for self-hosting vs API pricing |

- **Common model families (2025-2026):**
  | Family | Sizes | Strengths |
  |--------|-------|-----------|
  | Llama 3 | 8B, 70B, 405B | General purpose, strong community |
  | Mistral/Mixtral | 7B, 8x7B, 8x22B | Code, instruction following |
  | Qwen | 7B, 72B | Multilingual, Chinese |
  | DeepSeek | 7B, 67B | Code, math |
  | Gemma | 2B, 7B, 27B | Small, efficient |
  | Phi | 3B, 14B | Small model performance |

- **Anti-patterns:**
  - Choosing the largest available model "for best quality" (usually overkill)
  - Choosing based on leaderboard without custom evaluation
  - Ignoring license terms (caught after building the product)
  - Not testing serving feasibility before building on the model

---

**Follow-up Questions**

1. How do you handle the case where no single model meets all your criteria?
2. What's your process for evaluating a model you've never used before?
3. How do you plan for model obsolescence (newer, better models release every few months)?

---

**Common Weak Answers / Red Flags**

- "Use GPT-4 for everything" — no analysis
- Doesn't consider license implications
- Doesn't mention serving cost as a factor
- Selects model based solely on parameter count

---

**Interviewer Evaluation Signal**

Practical judgment. The candidate should demonstrate a structured selection process that balances multiple constraints. The key insight: the best model is the smallest one that meets your quality requirements, not the largest available. 
