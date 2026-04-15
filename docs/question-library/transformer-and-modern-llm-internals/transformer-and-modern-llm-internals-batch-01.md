# Transformer and Modern LLM Internals — Batch 01

Module: Transformer and Modern LLM Internals · Topic Family B  
Questions: 25 · Levels: Concept, Applied, System, Debugging, Architect  
Complements: [Existing question bank](../../../modules/02_genai/) (GenAI module covers prompting, fine-tuning, RLHF — this module covers architecture internals)

---

### Q-TFM-B01-001: How does the tokenizer affect LLM behavior, and what goes wrong when it is poorly designed?

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Tokenization  
**Level:** Concept  
**Difficulty:** 2  
**Experience Bands:** 0–2, 2–5  
**Role Families:** software-foundations-to-ai-engineer, llm-rag-agent-engineer, research-applied-research  
**Interview Round:** Phone screen, Technical deep dive  
**Prerequisites:** Basic NLP awareness  
**Tags:** `tokenizer`, `bpe`, `vocabulary`, `token-efficiency`, `multilingual`  
**Why This Matters:** Tokenization is the invisible contract between the data and the model. Tokenizer issues cause mysterious failures in arithmetic, code generation, and multilingual tasks.

**Question**  
Explain how BPE tokenization works, why tokenizer choice matters for model behavior, and what problems arise from poor tokenization.

**Expected Answer (Short)**  
BPE (Byte Pair Encoding) iteratively merges the most frequent character pairs into tokens. The vocabulary size and merge rules determine how text is split. Poor tokenization causes: long sequences for some languages (less efficient, higher cost), broken arithmetic (numbers split into arbitrary sub-tokens), and inconsistent code handling. A model can only be as good as its tokenizer's representation.

**Deep Answer**  
- **BPE process**: start with individual characters/bytes, count all adjacent pairs, merge the most frequent pair into a new token, repeat until vocabulary size reached (32K–128K typical)
- **Token fertility**: average tokens per word. English ≈ 1.3, some languages ≈ 3–5. High fertility = more expensive, shorter effective context, worse performance
- **Arithmetic issues**: "1234" might tokenize as ["12", "34"] or ["1", "234"] — the model sees arbitrary sub-token boundaries, making arithmetic hard
- **Code tokenization**: indentation matters but spaces tokenize differently depending on count. "    " (4 spaces) vs "  " (2 spaces) may use different tokens
- **SentencePiece vs tiktoken**: SentencePiece uses unigram or BPE on Unicode. Tiktoken (OpenAI) uses BPE on byte sequences. Different design choices affect multilingual efficiency.
- **Chat templates**: special tokens (<|user|>, <|assistant|>) added by the tokenizer for conversation formatting. Mismatched templates between training and inference causes degraded performance.
- **Vocabulary size trade-off**: larger vocab = shorter sequences but larger embedding table. Smaller vocab = longer sequences but smaller embeddings.
- **Pre-tokenization**: rules applied before BPE (e.g., splitting on whitespace, digit splitting). GPT-4's tokenizer splits digits individually to help arithmetic.

**Follow-up Questions**  
- Why do LLMs struggle with character-level tasks like counting letters?
- How does tokenizer choice affect multilingual model fairness?
- What happens if you use the wrong chat template for a model?
- How does Llama 3's tokenizer differ from GPT-2's?

**Weak Answer Signals / Red Flags**  
- Thinks tokenization is just "splitting on spaces"
- Cannot explain BPE at a basic level
- Doesn't connect tokenizer to model failures
- Unaware of multilingual tokenization issues

**Interviewer Signal**  
Tests whether the candidate understands the full pipeline. Many LLM failures trace back to tokenization — engineers who understand this debug faster.

**Real-World Insight**  
Llama 3 increased vocabulary size from 32K to 128K specifically to improve multilingual efficiency and code handling. This single change improved non-English performance significantly without any architecture change.

---

### Q-TFM-B01-002: Explain the self-attention mechanism step by step. What is the purpose of Q, K, V, and why scale by √d_k?

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Attention Mechanism  
**Level:** Concept  
**Difficulty:** 2  
**Experience Bands:** 0–2, 2–5  
**Role Families:** software-foundations-to-ai-engineer, ml-data-engineer, deep-learning-cv-engineer, research-applied-research  
**Interview Round:** Phone screen, Technical deep dive  
**Prerequisites:** Linear algebra, softmax  
**Tags:** `attention`, `self-attention`, `qkv`, `softmax`, `scaling`  
**Why This Matters:** Attention is the core operation in transformers. Understanding it is required for reasoning about model behavior, memory usage, and optimization.

**Question**  
Walk through the self-attention computation: how are Q, K, V derived, how are attention scores computed, and why is the scaling factor √d_k necessary?

**Expected Answer (Short)**  
Q, K, V are linear projections of the input: Q = XW_Q, K = XW_K, V = XW_V. Attention = softmax(QK^T / √d_k) × V. The scaling factor √d_k prevents the dot products from becoming too large for high-dimensional keys, which would push softmax into saturation (near-zero gradients).

**Deep Answer**  
- Input: sequence of embeddings X ∈ ℝ^(seq_len × d_model)
- Projections: Q = XW_Q, K = XW_K, V = XW_V where W ∈ ℝ^(d_model × d_k)
- Score matrix: S = QK^T ∈ ℝ^(seq_len × seq_len). Each element (i,j) = dot product similarity between token i's query and token j's key
- **Scaling**: dot products have variance proportional to d_k (sum of d_k random products). Without scaling, large d_k → large values → softmax saturates → near-one-hot attention → vanishing gradients. Dividing by √d_k normalizes variance to ~1.
- Attention weights: A = softmax(S / √d_k) — each row sums to 1, representing how much each token "attends to" every other
- Output: O = AV — weighted average of value vectors, according to attention weights
- **Causal masking**: for autoregressive models, mask future positions by setting their scores to -∞ before softmax
- **Key insight**: attention is a data-dependent weighted average. Unlike convolution (fixed kernel), attention weights change based on input content
- **Computational cost**: O(seq_len² × d_k) for the attention matrix. This is why long sequences are expensive.

**Follow-up Questions**  
- What happens to training stability if you remove the √d_k scaling?
- How does causal masking work mechanically?
- Why is attention O(n²) and what alternatives exist?
- What role does the value projection play vs just using the input?

**Weak Answer Signals / Red Flags**  
- Cannot write the attention formula
- Doesn't know why scaling is needed
- Missing causal masking awareness
- Confuses Q, K, V roles

**Interviewer Signal**  
Fundamental transformer literacy. Candidates who can trace through attention step by step can reason about model behavior, memory, and optimization.

**Real-World Insight**  
Flash Attention exploits the attention computation pattern to avoid materializing the full n×n attention matrix, reducing memory from O(n²) to O(n) and speeding up attention 2–4x. Understanding the vanilla mechanism is required to understand why Flash Attention works.

---

### Q-TFM-B01-003: What is multi-head attention and why does it work better than single-head attention?

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Attention Architecture  
**Level:** Concept  
**Difficulty:** 2  
**Experience Bands:** 0–2, 2–5  
**Role Families:** software-foundations-to-ai-engineer, research-applied-research, deep-learning-cv-engineer  
**Interview Round:** Phone screen, Technical deep dive  
**Prerequisites:** Self-attention  
**Tags:** `multi-head-attention`, `mha`, `gqa`, `mqa`, `attention-heads`  
**Why This Matters:** Head design affects model capacity, inference speed, and KV cache size — critical for serving decisions.

**Question**  
Explain multi-head attention (MHA). Why use multiple heads instead of one large attention? How do MHA, Multi-Query Attention (MQA), and Grouped-Query Attention (GQA) differ?

**Expected Answer (Short)**  
MHA splits Q, K, V into multiple heads, each attending to different learned subspaces (syntactic, semantic, positional patterns). Concatenated outputs capture richer relationships than a single head. MQA shares K, V across all heads (reducing KV cache by num_heads×). GQA groups heads and shares K, V within groups — a middle ground between MHA and MQA quality/efficiency.

**Deep Answer**  
- **MHA**: d_model split into h heads, each head d_k = d_model/h. Each head has independent Q, K, V projections. Outputs concatenated and projected back to d_model.
- **Why multiple heads**: single attention can only represent one "attention pattern" per position. Multiple heads can simultaneously capture: positional patterns (head A), semantic similarity (head B), syntactic structure (head C), etc.
- **MQA (Multi-Query Attention)**: all heads share the same K, V projections. Only Q is per-head. Reduces KV cache memory by h× (e.g., 32× for 32 heads). Slightly lower quality than MHA.
- **GQA (Grouped-Query Attention)**: heads split into groups (e.g., 8 groups of 4). K, V shared within each group. KV cache reduced by group factor (e.g., 4× with 8 groups). Used in Llama 2/3, Mistral.
- **KV cache implication**: during autoregressive decoding, all past K, V are cached. With MHA and large batch + long sequence, KV cache dominates GPU memory. GQA/MQA directly reduce this.
- **Quality ordering**: MHA > GQA > MQA (generally). But the memory savings often justify GQA.
- **Practical choice**: most modern models (Llama 3, Mistral, Gemma) use GQA. MQA is used in some efficiency-focused models. MHA is legacy in new LLM designs.

**Follow-up Questions**  
- How much memory does KV cache consume for a 70B model with 128K context?
- Why did Llama 2 switch from MHA to GQA?
- How does the number of GQA groups affect quality vs efficiency?
- What is the relationship between KV cache size and batch size in serving?

**Weak Answer Signals / Red Flags**  
- Cannot explain what "multi-head" means mechanically
- Unaware of MQA or GQA
- Doesn't connect attention design to serving memory
- Thinks more heads is always better

**Interviewer Signal**  
Tests knowledge of modern architectural choices that directly affect serving costs and performance. Practical LLM engineering requires understanding these trade-offs.

**Real-World Insight**  
At Meta, switching from MHA to GQA in Llama 2 → 3 was motivated entirely by serving efficiency. The KV cache reduction from GQA allows serving larger batches on the same GPU, directly improving throughput per dollar.

---

### Q-TFM-B01-004: What is Rotary Position Encoding (RoPE), and why did it replace learned and sinusoidal position encodings?

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Position Encoding  
**Level:** Concept  
**Difficulty:** 3  
**Experience Bands:** 2–5, 5–8  
**Role Families:** llm-rag-agent-engineer, research-applied-research, senior-architect-ai-systems-lead  
**Interview Round:** Technical deep dive  
**Prerequisites:** Self-attention, basic complex numbers (optional)  
**Tags:** `rope`, `position-encoding`, `context-length`, `extrapolation`  
**Why This Matters:** Position encoding determines the model's ability to handle long contexts and generalize to unseen sequence lengths — critical for RAG, agent chains, and document processing.

**Question**  
Explain how RoPE encodes position information. What advantages does it have over absolute position encodings, and how does it relate to context length extension techniques?

**Expected Answer (Short)**  
RoPE encodes position by rotating Q and K vectors in 2D subspaces by angles proportional to position. This makes the dot product between Q_i and K_j depend only on relative position (i-j), not absolute position. Advantages: natural relative position awareness, better extrapolation to longer sequences than trained, and enables context length extension via techniques like NTK-aware scaling and YaRN.

**Deep Answer**  
- **Mechanism**: each pair of dimensions in Q and K is rotated by angle θ × position_index. θ varies per dimension pair (lower dimensions rotate faster = capture local position, higher dimensions rotate slower = capture global position)
- **Key property**: the dot product Q_m · K_n after rotation depends only on (m-n), giving relative position awareness without explicit relative position matrices
- **vs absolute learned positions**: learned positions have a fixed vocabulary (e.g., max 2048). Cannot extrapolate beyond training length. RoPE can extrapolate (with degradation).
- **vs sinusoidal**: sinusoidal positions are added to embeddings (additive). RoPE is multiplicative (rotation). Rotation preserves vector norms and interacts better with the dot product.
- **Context length extension**:
  - **Linear scaling**: stretch RoPE frequencies by a factor (e.g., 4× for 4× longer context). Simple but degrades short-range precision.
  - **NTK-aware scaling**: non-uniform scaling — high frequencies (local) stay sharp, low frequencies (global) get stretched. Better quality.
  - **YaRN**: combines NTK-aware scaling with attention temperature adjustment and fine-tuning on extended data. Used in Llama 3 for 128K context.
- **Why this matters for production**: context length directly determines how much RAG context, conversation history, or code can fit in one inference call

**Follow-up Questions**  
- Why does naive context length extension degrade performance?
- How does RoPE interact with Flash Attention?
- What is the difference between NTK-aware scaling and YaRN?
- Can you extend context length without any continued pre-training?

**Weak Answer Signals / Red Flags**  
- Cannot explain the rotation intuition
- Confuses RoPE with sinusoidal position encodings
- Doesn't know about context extension techniques
- Thinks context length is just a training parameter you change

**Interviewer Signal**  
Tests deep architectural understanding. Knowing position encoding is required for reasoning about context window limitations in RAG and agent systems.

**Real-World Insight**  
Context length extension is one of the most active areas in LLM deployment. Llama 3 used YaRN to extend from 8K to 128K. Production systems need to understand the quality degradation at extended lengths — just because the model accepts 128K tokens doesn't mean performance is uniform across the window.

---

### Q-TFM-B01-005: What is the KV cache, why does it exist, and what are its memory and performance implications?

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Inference Mechanics  
**Level:** Applied  
**Difficulty:** 3  
**Experience Bands:** 2–5, 5–8  
**Role Families:** llm-rag-agent-engineer, mlops-llmops-platform-engineer, senior-architect-ai-systems-lead  
**Interview Round:** Technical deep dive, System design  
**Prerequisites:** Attention mechanism, autoregressive decoding  
**Tags:** `kv-cache`, `memory`, `inference`, `serving`, `decoding`  
**Why This Matters:** KV cache is the single largest memory consumer during LLM inference and the primary constraint on batch size and context length in serving.

**Question**  
Explain the KV cache in LLM inference. Why is it necessary for autoregressive generation, how much memory does it consume, and what are the key strategies for managing it?

**Expected Answer (Short)**  
During autoregressive decoding, each new token needs to attend to all previous tokens. Without caching, you'd recompute K and V for all previous tokens at each step — O(n²) per token. The KV cache stores past K, V tensors so each new step only computes one new K, V pair. Memory: proportional to batch_size × seq_len × num_layers × num_heads × head_dim × 2 (K and V) × precision.

**Deep Answer**  
- **Why caching**: at step t, the new token's attention needs K_1..K_t and V_1..V_t. Without cache: recompute all KV projections each step. With cache: store previous KV, only compute the new token's KV.
- **Memory formula**: per-layer KV cache = 2 × batch_size × seq_len × num_kv_heads × head_dim × bytes_per_element
  - Llama 2 70B, FP16, 1 sequence of 4K tokens: 2 × 1 × 4096 × 80 layers × 8 kv_heads × 128 dim × 2 bytes ≈ 10.5 GB just for KV cache
  - With batch size 32: 32 × 10.5GB = 336 GB — exceeds single GPU memory
- **Impact on serving**: KV cache memory directly limits max_batch_size × max_seq_len. This is the fundamental constraint of LLM serving.
- **Management strategies**:
  - **GQA/MQA**: reduce num_kv_heads → proportionally reduce KV cache
  - **PagedAttention (vLLM)**: allocate KV cache in non-contiguous pages, like OS virtual memory. Reduces waste from variable-length sequences.
  - **Quantized KV cache**: store cache in INT8 or FP8 instead of FP16. 2× reduction with minimal quality loss.
  - **Sliding window attention**: only cache last W tokens. Discard older context beyond the window (Mistral approach).
  - **Prefix caching**: share KV cache for common system prompts across requests. Avoid recomputing the same system prompt for every request.
- **Prefill vs decode**: prefill computes all KV at once (compute-bound). Decode generates one token at a time using cached KV (memory-bound).

**Follow-up Questions**  
- How does PagedAttention improve memory utilization?
- What is the trade-off of quantizing the KV cache?
- How does prefix caching work in vLLM?
- What determines the boundary between prefill-bound and decode-bound workloads?

**Weak Answer Signals / Red Flags**  
- Doesn't know what KV cache is
- Cannot estimate KV cache memory size
- Unaware of GQA's impact on cache size
- Doesn't connect KV cache to batch size limitations

**Interviewer Signal**  
Critical for any engineer involved in LLM serving. KV cache management is the single most important serving optimization lever.

**Real-World Insight**  
vLLM's PagedAttention increased serving throughput 2–4x by reducing KV cache memory waste from ~60% (pre-allocated contiguous blocks) to <4% (paged allocation). This is the technique that made high-throughput LLM serving practical.

---

### Q-TFM-B01-006: How does Flash Attention work, and why does it make attention both faster and more memory-efficient?

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Attention Optimization  
**Level:** Applied  
**Difficulty:** 3  
**Experience Bands:** 2–5, 5–8  
**Role Families:** deep-learning-cv-engineer, research-applied-research, mlops-llmops-platform-engineer  
**Interview Round:** Technical deep dive  
**Prerequisites:** Self-attention, GPU memory hierarchy  
**Tags:** `flash-attention`, `io-aware`, `sram`, `hbm`, `memory-efficiency`  
**Why This Matters:** Flash Attention is the standard attention implementation in all modern LLM training and inference. Understanding it is necessary for performance optimization.

**Question**  
Explain the key insight behind Flash Attention. How does it reduce memory usage from O(n²) to O(n) while also improving speed?

**Expected Answer (Short)**  
Standard attention materializes the full n×n attention matrix in GPU HBM (slow memory). Flash Attention computes attention in tiles, keeping each tile in SRAM (fast on-chip memory), and never writes the full attention matrix to HBM. This reduces memory IO, which is the bottleneck. Memory usage drops from O(n²) to O(n) and speed improves because HBM reads/writes are reduced.

**Deep Answer**  
- **The problem**: standard attention writes QK^T to HBM (O(n²) memory), reads it back for softmax, writes result to HBM, reads for V multiplication. Total HBM I/O is O(n² × d).
- **GPU memory hierarchy**: SRAM (on-chip, ~20MB, ~19 TB/s) vs HBM (off-chip, ~80GB, ~2 TB/s). SRAM is 10× faster but much smaller.
- **Flash Attention key insight**: restructure the attention computation to work in tiles that fit in SRAM. Compute partial softmax + partial output per tile. Combine tile results using the online softmax trick (correction factors for partial sums).
- **Online softmax trick**: enables computing softmax incrementally over tiles without needing the full row in memory. Store running max and sum, correct as new tiles arrive.
- **Memory**: never materializes n×n matrix. Only stores the output O (size n × d) = O(n). The intermediate attention scores exist only transiently in SRAM.
- **Speed**: fewer HBM reads/writes → fewer memory-bound cycles → faster even though the FLOP count is slightly higher (recomputation for backward pass).
- **Flash Attention 2**: further optimization — better thread parallelism, causal masking optimization, sequences split more efficiently across GPU warps.
- **Flash Attention 3**: H100-specific optimizations (FP8, asynchronous copies, warp specialization).

**Follow-up Questions**  
- How does the online softmax trick work?
- Why is Flash Attention faster despite computing more FLOPs (in the backward pass)?
- How does Flash Attention interact with GQA/MQA head structures?
- When does Flash Attention NOT help?

**Weak Answer Signals / Red Flags**  
- Thinks Flash Attention is "just an approximate attention"
- Doesn't understand the HBM vs SRAM distinction
- Cannot explain why reducing memory I/O improves speed
- Confuses Flash Attention with sparse attention

**Interviewer Signal**  
Tests understanding of hardware-aware algorithm design. Engineers who understand this principle can optimize other operations beyond just attention.

**Real-World Insight**  
Every major LLM (Llama 3, Mistral, GPT-4, Claude) uses Flash Attention in both training and inference. It's not optional — without it, training costs increase 2–4x and long context serving is impractical.

---

### Q-TFM-B01-007: What is Mixture of Experts (MoE) and what are its trade-offs vs dense models?

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Architecture Variants  
**Level:** Concept  
**Difficulty:** 3  
**Experience Bands:** 2–5, 5–8  
**Role Families:** research-applied-research, senior-architect-ai-systems-lead, mlops-llmops-platform-engineer  
**Interview Round:** Technical deep dive  
**Prerequisites:** Transformer FFN, routing concepts  
**Tags:** `moe`, `mixture-of-experts`, `routing`, `sparse-model`, `efficiency`  
**Why This Matters:** MoE is the architecture choice behind the most capable frontier models (GPT-4, Mixtral, DBRX). Understanding trade-offs is essential for model selection and serving.

**Question**  
How does Mixture of Experts (MoE) work in transformer architectures? What are the trade-offs compared to dense models of equivalent parameter count?

**Expected Answer (Short)**  
MoE replaces the dense FFN in each transformer layer with multiple "expert" FFNs and a router network that selects the top-K experts per token. Each token only passes through K experts (typically 2), so computation is much less than using all experts. The model has more total parameters (more capacity) but activates fewer per token (lower compute cost). Trade-offs: larger memory footprint, routing complexity, expert load balancing, and more difficult to serve.

**Deep Answer**  
- **Architecture**: each MoE layer has N experts (e.g., 8, 16, or 64 FFN modules) and a router (small linear layer + softmax). Router assigns each token to top-K experts.
- **Efficiency**: Mixtral 8×7B has 47B total parameters but activates ~13B per token (2 of 8 experts). Performance comparable to a 40B+ dense model at the compute cost of a 13B model.
- **Router design**: token → router → logits over N experts → top-K selection. Router can be trained with auxiliary loss to encourage load balancing.
- **Load balancing challenge**: without balancing, some experts handle most tokens (overloaded) while others are idle. Auxiliary loss (e.g., load balancing loss) penalizes imbalanced expert utilization.
- **Memory trade-off**: all N expert weights must be in GPU memory even though only K are active per token. A "47B parameter" MoE model needs ~94GB at FP16 — more than an A100 80GB.
- **Serving challenges**: expert parallelism (different experts on different GPUs), all-to-all communication for routing, uneven compute per token (different experts cost different amounts)
- **vs dense**: dense models are simpler to serve, more predictable latency, but less parameter-efficient. MoE is better at scaling to very large capacities within a compute budget.
- **Production models using MoE**: GPT-4 (rumored 8×220B), Mixtral, DBRX, Grok

**Follow-up Questions**  
- What happens if the router always picks the same expert?
- How do you serve a MoE model across multiple GPUs?
- Why is expert parallelism different from tensor parallelism?
- Can you fine-tune a MoE model efficiently?

**Weak Answer Signals / Red Flags**  
- Confuses total parameters with active parameters
- Doesn't know about routing or load balancing
- Thinks MoE is always better (ignores memory and serving complexity)
- Cannot explain the efficiency advantage

**Interviewer Signal**  
Tests understanding of frontier model architectures and serving trade-offs that affect infrastructure planning.

**Real-World Insight**  
Companies choosing between Llama 3 70B (dense) and Mixtral 8×22B (MoE) face a concrete trade-off: Mixtral may be more capable per FLOP but requires more GPU memory and more complex serving. The serving infrastructure decision often drives the model choice, not just quality benchmarks.

---

### Q-TFM-B01-008: What is speculative decoding, and why does it speed up LLM inference without changing the output distribution?

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Generation and Decoding  
**Level:** Applied  
**Difficulty:** 4  
**Experience Bands:** 5–8, 8–12  
**Role Families:** llm-rag-agent-engineer, mlops-llmops-platform-engineer, senior-architect-ai-systems-lead  
**Interview Round:** Technical deep dive, System design  
**Prerequisites:** Autoregressive decoding, KV cache  
**Tags:** `speculative-decoding`, `draft-model`, `inference`, `latency`, `throughput`  
**Why This Matters:** Speculative decoding is one of the few techniques that reduces latency for memory-bound LLM decoding. Understanding it is key for latency-sensitive applications.

**Question**  
How does speculative decoding accelerate LLM generation? Why does it produce mathematically identical output to standard decoding?

**Expected Answer (Short)**  
A small "draft" model generates K candidate tokens quickly. The large "target" model then verifies all K tokens in parallel (single forward pass). Accepted tokens are kept; the first rejected token triggers re-generation from that point. This is faster because the target model processes K tokens in one batch instead of K sequential steps. Output is mathematically identical because the acceptance/rejection check ensures the distribution matches the target model.

**Deep Answer**  
- **Problem**: autoregressive decoding is sequential — one forward pass per token. Memory-bound on GPUs (GPU underutilized per step).
- **Insight**: while generating 1 token costs nearly the same as generating K tokens in a batch (memory-bound = bottleneck is loading weights, not FLOPs), you can verify K tokens for the cost of 1.
- **Algorithm**:
  1. Draft model generates K tokens (e.g., 4–8 tokens). Fast because draft model is small (7B draft for 70B target).
  2. Target model runs one forward pass on all K draft tokens. Gets logits for each position.
  3. For each draft token, compare draft probability with target probability using rejection sampling.
  4. Accept tokens that pass the acceptance criterion. The first rejection becomes the new starting point.
  5. Guarantees: the output distribution exactly matches the target model (proof via rejection sampling theory).
- **Speedup**: typically 2–3x latency reduction. Depends on draft model quality (higher acceptance rate = more speedup).
- **Draft model options**: smaller model of same family, fine-tuned student, self-draft (early exit from target model)
- **When it helps less**: very short outputs, high-entropy (unpredictable) text where draft acceptance is low
- **Implementation**: supported in vLLM, TGI, and HuggingFace transformers

**Follow-up Questions**  
- How does draft model quality affect the speedup?
- What is Medusa and how does it differ from standard speculative decoding?
- When does speculative decoding hurt rather than help?
- How does speculative decoding interact with batch serving?

**Weak Answer Signals / Red Flags**  
- Thinks speculative decoding is approximate ("it changes the output")
- Cannot explain the verification step
- Doesn't understand why batch verification is cheap
- Confuses with beam search

**Interviewer Signal**  
Tests understanding of advanced inference optimization. Engineers who understand speculative decoding can reason about latency vs throughput trade-offs in serving systems.

**Real-World Insight**  
Speculative decoding is especially effective for chat applications where latency matters (time-to-first-token, tokens-per-second). Companies like Anthropic and Google use it in production to reduce user-perceived latency.

---

### Q-TFM-B01-009: Why do transformer models use LayerNorm, and what is the difference between pre-norm and post-norm architectures?

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Normalization  
**Level:** Concept  
**Difficulty:** 2  
**Experience Bands:** 0–2, 2–5  
**Role Families:** research-applied-research, deep-learning-cv-engineer, software-foundations-to-ai-engineer  
**Interview Round:** Phone screen, Technical deep dive  
**Prerequisites:** Basic normalization concept, residual connections  
**Tags:** `layernorm`, `rmsnorm`, `pre-norm`, `post-norm`, `training-stability`  
**Why This Matters:** Normalization placement affects training stability and convergence. Nearly all modern LLMs use pre-norm, but understanding why prevents incorrect architectural choices.

**Question**  
Why is normalization necessary in transformers? Explain the difference between pre-norm and post-norm placement and why pre-norm dominates modern LLMs.

**Expected Answer (Short)**  
LayerNorm stabilizes activations by normalizing to zero mean and unit variance, preventing gradient explosion during training. Pre-norm applies normalization before each sublayer (attention, FFN). Post-norm applies after the residual addition. Pre-norm enables more stable training for deep models because the residual stream has an unimpeded gradient path. Modern LLMs also often use RMSNorm (simpler, slightly faster) instead of full LayerNorm.

**Deep Answer**  
- **LayerNorm**: normalizes across the hidden dimension for each token independently. Makes training more stable by controlling activation magnitudes.
- **Post-norm (original transformer)**: output = LayerNorm(x + Sublayer(x)). The normalization is applied to the sum. Problem: gradients pass through both the sublayer AND the normalization. In very deep networks, this causes training instability.
- **Pre-norm (modern LLMs)**: output = x + Sublayer(LayerNorm(x)). The residual stream (x + ...) has a direct gradient path that bypasses normalization. This makes training much more stable at depth (100+ layers).
- **RMSNorm**: simplifies LayerNorm by removing mean centering. Only normalizes by root-mean-square value. 10–20% faster than full LayerNorm. Used in Llama, Mistral, Gemma.
- **RMSNorm formula**: y = x / √(mean(x²) + ε) × γ (learnable scale)
- **Training stability**: pre-norm was the key change that enabled training GPT-3-scale models. Post-norm requires careful learning rate warmup and is brittle.
- **Trade-off**: some evidence that post-norm produces slightly better final quality (with careful training), but pre-norm is overwhelmingly preferred for ease of training.

**Follow-up Questions**  
- Why is RMSNorm sufficient without mean centering?
- How does normalization interact with residual connections for gradient flow?
- What is the QK-norm trick some models use?

**Weak Answer Signals / Red Flags**  
- Cannot distinguish pre-norm from post-norm
- Doesn't know why normalization is needed
- Confuses LayerNorm with BatchNorm in the transformer context
- Unaware of RMSNorm

**Interviewer Signal**  
Tests architectural knowledge depth. Understanding normalization choices shows the candidate can reason about training dynamics, not just use default configs.

**Real-World Insight**  
When fine-tuning or adapting models, normalization layers are often critical. Freezing vs training normalization layers during LoRA fine-tuning affects quality. Some practitioners unfreeze only input/output norms for better domain adaptation.

---

### Q-TFM-B01-010: How does autoregressive text generation work step by step, and what are the key sampling strategies?

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Generation Mechanics  
**Level:** Applied  
**Difficulty:** 2  
**Experience Bands:** 0–2, 2–5  
**Role Families:** software-foundations-to-ai-engineer, llm-rag-agent-engineer  
**Interview Round:** Technical deep dive  
**Prerequisites:** Softmax, probability distributions  
**Tags:** `generation`, `sampling`, `temperature`, `top-p`, `top-k`, `greedy`  
**Why This Matters:** Sampling strategy directly affects output quality, diversity, and reliability. Production LLM applications must tune these carefully.

**Question**  
Walk through how an LLM generates text token by token. What are greedy decoding, temperature, top-k, and nucleus (top-p) sampling, and when do you use each?

**Expected Answer (Short)**  
The model outputs logits over the vocabulary. Greedy: pick the highest-probability token. Temperature: divide logits by T before softmax — T<1 sharpens, T>1 flattens the distribution. Top-k: sample from the top K most probable tokens. Top-p (nucleus): sample from the smallest set of tokens whose cumulative probability ≥ p. These control the diversity-quality trade-off.

**Deep Answer**  
- **Generation loop**: input → model → logits ∈ ℝ^vocab_size → sampling → new token → append to input → repeat until EOS or max_tokens
- **Greedy decoding**: argmax over logits. Deterministic, often repetitive. Good for structured output (JSON, code completion).
- **Temperature**: logits = logits / T. T=0 → deterministic (greedy). T=0.7 → slightly creative. T=1.5 → very random. Doesn't change the ranking, just sharpens or flattens probabilities.
- **Top-k**: zero out all logits except the top K. Then sample from the remaining. k=1 = greedy. k=50 is a common default. Problem: fixed K doesn't adapt — sometimes there's 1 good token, sometimes 20.
- **Top-p (nucleus)**: sort tokens by probability, include tokens until cumulative probability ≥ p. Adaptive: if one token dominates (p=0.9, top token already 0.95), only that token is sampled. If distribution is flat, many tokens included.
- **Combining**: typically apply temperature first, then top-p, then top-k. The order matters.
- **Repetition penalty**: penalize recently generated tokens to avoid loops. Can be additive or multiplicative.
- **min_p**: newer strategy — sample tokens with probability ≥ min_p × max_probability. Simpler adaptive filtering.
- **Structured output**: for JSON or function calls, use constrained decoding (mask invalid tokens based on grammar) — greedy or low-temperature within the valid token set.

**Follow-up Questions**  
- Why does temperature=0 not mean literally zero probability for non-top tokens?
- How does constrained decoding (grammar-guided generation) work?
- What sampling settings would you use for code generation vs creative writing vs extraction?

**Weak Answer Signals / Red Flags**  
- Cannot explain what temperature does mechanically
- Confuses top-k and top-p
- Uses "random" as a description without understanding the probability manipulation
- Doesn't know about structured output generation

**Interviewer Signal**  
Tests practical LLM application knowledge. Engineers who understand sampling strategies make better production tuning decisions.

**Real-World Insight**  
In production, most extraction and classification tasks use temperature=0 or very low temperature + structured output constraints. Creative tasks (writing, brainstorming) use temperature 0.7–1.0 with top-p 0.9–0.95. Agent tool calls typically use greedy decoding for reliability.

---

### Q-TFM-B01-011: What is the difference between model parallelism (tensor, pipeline, sequence) and data parallelism for training large models?

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Distributed Training  
**Level:** System  
**Difficulty:** 4  
**Experience Bands:** 5–8, 8–12  
**Role Families:** research-applied-research, mlops-llmops-platform-engineer, senior-architect-ai-systems-lead  
**Interview Round:** System design  
**Prerequisites:** Multi-GPU basics, model architecture  
**Tags:** `parallelism`, `tensor-parallel`, `pipeline-parallel`, `data-parallel`, `distributed-training`  
**Why This Matters:** Training models beyond single-GPU capacity requires choosing the right parallelism strategy. Wrong choices waste expensive GPU hours.

**Question**  
Explain data parallelism, tensor parallelism, pipeline parallelism, and sequence parallelism. When do you use each, and how do they combine for training 100B+ parameter models?

**Expected Answer (Short)**  
Data parallelism: replicate the model on each GPU, split data across GPUs, synchronize gradients. Tensor parallelism: split individual layers (weight matrices) across GPUs. Pipeline parallelism: assign different layers to different GPUs, pass activations between them. Sequence parallelism: split the sequence dimension for long-context training. For 100B+ models, all are combined (3D parallelism).

**Deep Answer**  
- **Data Parallelism (DP/DDP/FSDP)**:
  - Replicate model on each GPU, each GPU processes a different data batch
  - All-reduce gradients after backward pass
  - FSDP (Fully Sharded Data Parallel): shards model parameters, gradients, and optimizer states across GPUs. Each GPU holds only a fraction.
  - Limitation: model must fit on a single GPU (or be sharded with FSDP)
- **Tensor Parallelism (TP)**:
  - Split weight matrices across GPUs (e.g., columns of the FFN weight on 4 GPUs)
  - Each GPU computes a partial result, then all-reduce to combine
  - Requires high-bandwidth interconnect (NVLink). Latency-sensitive.
  - Typical: TP=2 or TP=4 within a node
- **Pipeline Parallelism (PP)**:
  - Assign groups of transformer layers to different GPUs
  - GPU 0 processes layers 0–19, GPU 1 processes layers 20–39, etc.
  - Problem: pipeline bubbles — GPUs idle while waiting for activations
  - Solution: micro-batching (split a batch into micro-batches, pipeline them)
- **Sequence Parallelism (SP)**:
  - Split the sequence dimension across GPUs for operations that don't mix across sequence positions (e.g., LayerNorm, dropout)
  - Reduces activation memory
  - Complementary to tensor parallelism
- **3D parallelism**: DP × TP × PP. Common setup: TP within a node (2–8 GPUs, NVLink), PP across 2–4 nodes, DP across remaining GPUs.
- **Example**: training 175B model on 1024 GPUs: TP=8 (within node), PP=4 (across 4 nodes), DP=32 (data parallel groups)

**Follow-up Questions**  
- What is the communication overhead of each parallelism type?
- Why must tensor parallelism use NVLink while data parallelism can use ethernet?
- How does FSDP relate to DeepSpeed ZeRO stages?
- What are pipeline bubbles and how do you minimize them?

**Weak Answer Signals / Red Flags**  
- Cannot distinguish between the parallelism types
- Thinks data parallelism alone can train any model size
- Doesn't mention communication bottlenecks
- Unaware of FSDP or ZeRO

**Interviewer Signal**  
Tests infrastructure-level thinking for large-scale training. Essential for roles that manage training infrastructure or make model training decisions.

**Real-World Insight**  
Llama 3 405B was trained with 3D parallelism on 16K H100 GPUs. The parallelism configuration was carefully tuned — wrong settings could reduce MFU from 40% to 10%, wasting millions of dollars in GPU hours.

---

### Q-TFM-B01-012: What is the difference between pre-training, supervised fine-tuning, and alignment (RLHF/DPO), and why is each stage necessary?

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Training Stages  
**Level:** Concept  
**Difficulty:** 2  
**Experience Bands:** 0–2, 2–5  
**Role Families:** software-foundations-to-ai-engineer, llm-rag-agent-engineer, research-applied-research  
**Interview Round:** Phone screen, Technical deep dive  
**Prerequisites:** Language modeling basics  
**Tags:** `pre-training`, `sft`, `rlhf`, `dpo`, `alignment`, `instruction-tuning`  
**Why This Matters:** Understanding the training pipeline explains why base models vs instruct models behave differently, and why alignment can go wrong.

**Question**  
Describe the three stages of modern LLM training: pre-training, supervised fine-tuning (SFT), and alignment (RLHF/DPO). What does each stage accomplish, and what happens if you skip one?

**Expected Answer (Short)**  
Pre-training: learn language patterns from massive unlabeled web text (next-token prediction). SFT: learn to follow instructions from curated instruction-response pairs. Alignment: learn to be helpful and safe from human preference data. Skipping pre-training means no language ability. Skipping SFT means the model just completes text, doesn't follow instructions. Skipping alignment means the model follows instructions but may be unsafe or unhelpful.

**Deep Answer**  
- **Pre-training**:
  - Objective: next-token prediction on trillions of tokens
  - Data: web crawl, books, code, Wikipedia, etc.
  - Result: a "base model" that can complete text but doesn't follow instructions
  - Cost: millions of dollars, weeks-months on thousands of GPUs
  - This is where knowledge and language capability come from
- **Supervised Fine-Tuning (SFT)**:
  - Data: curated instruction-response pairs (10K–100K examples)
  - Result: model learns the "Q&A format" — how to respond to prompts
  - Critical: data quality matters more than quantity. 1K excellent examples can outperform 100K low-quality ones.
  - Techniques: full fine-tuning, LoRA, QLoRA
- **Alignment (RLHF/DPO)**:
  - Goal: make the model helpful, harmless, and honest
  - RLHF: train a reward model from human preferences, then optimize the LLM against it using PPO
  - DPO: directly optimize on preference pairs without a separate reward model. Simpler, increasingly preferred.
  - Result: model refuses harmful requests, gives balanced answers, follows safety guidelines
- **Skip pre-training**: no language ability at all
- **Skip SFT**: model writes text continuations instead of answering questions. "What is ML?" → "Machine learning is a subfield of..." (book-style continuation, not helpful answer)
- **Skip alignment**: model follows instructions but may be toxic, biased, or manipulable. Also tends to be verbose and not calibrated to user preferences.

**Follow-up Questions**  
- How does DPO differ from RLHF in practice?
- What is the "alignment tax" — does alignment reduce capability?
- Should you fine-tune a base model or an instruct model?
- What is Constitutional AI and how does it differ from RLHF?

**Weak Answer Signals / Red Flags**  
- Treats the stages as interchangeable
- Doesn't know what a "base model" is
- Thinks fine-tuning replaces pre-training
- Cannot explain why alignment is needed

**Interviewer Signal**  
Foundational LLM knowledge. Engineers who understand the training pipeline make better decisions about when to fine-tune, what data to collect, and which base model to start from.

**Real-World Insight**  
The quality of the SFT dataset is the most underrated factor in LLM performance. Llama 2's SFT used only ~27K high-quality examples. Companies that invest in data curation for SFT consistently outperform those that just scale up noisy instruction data.

---

### Q-TFM-B01-013: How do modern LLMs generate structured output (JSON, function calls), and what can go wrong?

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Structured Generation  
**Level:** Applied  
**Difficulty:** 3  
**Experience Bands:** 2–5, 5–8  
**Role Families:** llm-rag-agent-engineer, software-foundations-to-ai-engineer  
**Interview Round:** Technical deep dive  
**Prerequisites:** Generation mechanics, JSON awareness  
**Tags:** `structured-output`, `json`, `constrained-decoding`, `function-calling`, `grammar`  
**Why This Matters:** Production LLM applications almost always require structured output. Understanding generation constraints prevents reliability failures.

**Question**  
How does an LLM produce valid JSON or function call arguments? What are the approaches: training-time vs inference-time constraints? What failure modes exist?

**Expected Answer (Short)**  
Training-time: fine-tune the model on structured output examples so it learns output format. Inference-time: constrained decoding — at each step, mask logits for tokens that would produce invalid output according to a grammar/schema. Or: generate freely, then parse and validate + retry. Each has trade-offs between reliability, latency, and output quality.

**Deep Answer**  
- **Training-time approach**: include JSON/tool output examples in SFT data. Model learns the format. Reliability: ~95–99% depending on complexity.
- **Constrained decoding (grammar-guided)**:
  - At each generation step, determine which tokens are valid according to a schema (JSON schema, regex, CFG)
  - Mask invalid token logits to -∞
  - Guarantees valid syntax but can force the model into awkward continuations
  - Libraries: Outlines, Guidance, vLLM structured output support
  - Cost: slight latency increase for constraint checking
- **Parse and retry**:
  - Let the model generate freely, parse the output, retry on failure
  - Simple but adds latency and cost for retries
  - Can include the parse error in the retry prompt ("Your output had invalid JSON at position 42...")
- **Failure modes**:
  - Schema compliance: valid JSON but wrong schema (missing keys, wrong types)
  - Content quality: valid structure but meaningless values
  - Nested complexity: deeply nested JSON structures more likely to fail
  - Long outputs: probability of at least one structural error increases with output length
  - Constrained decoding artifacts: forcing the model to produce valid syntax can degrade content quality
- **Best practice**: combine training-time exposure + constrained decoding for critical paths. Parse validation as a safety net.

**Follow-up Questions**  
- How does Outlines implement constrained decoding?
- When does constrained decoding degrade output quality?
- How would you design a fallback strategy for structured output failures?

**Weak Answer Signals / Red Flags**  
- Thinks "just ask the model for JSON" is sufficient
- Doesn't know about constrained decoding
- Cannot identify failure modes
- No retry/validation strategy

**Interviewer Signal**  
Tests production LLM engineering. Structured output reliability is one of the top production concerns for LLM applications.

**Real-World Insight**  
OpenAI's structured output mode uses constrained decoding with a JSON schema. This guarantees valid JSON at the syntax level, but engineers still need to validate semantic correctness (e.g., the model returned a valid JSON with an invalid email address in the "email" field).

---

### Q-TFM-B01-014: What is quantization for LLMs, how does it work, and what are the quality-performance trade-offs?

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Model Compression  
**Level:** Applied  
**Difficulty:** 3  
**Experience Bands:** 2–5, 5–8  
**Role Families:** mlops-llmops-platform-engineer, llm-rag-agent-engineer, senior-architect-ai-systems-lead  
**Interview Round:** Technical deep dive, System design  
**Prerequisites:** Floating point, model architecture  
**Tags:** `quantization`, `int8`, `int4`, `gptq`, `awq`, `gguf`, `inference`  
**Why This Matters:** Quantization reduces model size 2–4x with minimal quality loss, making it possible to serve models on smaller/fewer GPUs. It is the default optimization for LLM deployment.

**Question**  
Explain how post-training quantization works for LLMs. What are the main approaches (GPTQ, AWQ, GGUF), and how do you evaluate the quality-performance trade-off?

**Expected Answer (Short)**  
Post-training quantization converts FP16/BF16 weights to lower precision (INT8, INT4) using calibration data. GPTQ: layer-by-layer quantization minimizing output reconstruction error. AWQ: protects "salient" weight channels that have high activation magnitudes. GGUF: format optimized for CPU inference (llama.cpp). Trade-off: 4-bit reduces memory ~4x with 1–3% quality loss on benchmarks; 2-bit degrades significantly.

**Deep Answer**  
- **Why quantize**: a 70B FP16 model needs ~140GB → won't fit on one GPU. INT4 → ~35GB → fits on one A100 80GB.
- **Weight quantization**: map FP16 weights to INT4/INT8 using calibration data (small sample of text, ~128–1024 sequences)
- **GPTQ**: quantize one layer at a time, minimize the layer output reconstruction error using Hessian information. Accurate but calibration-dependent.
- **AWQ (Activation-Aware Quantization)**: identify "salient" weight channels (those with high activations) and protect them from quantization error. More robust across datasets.
- **GGUF (llama.cpp)**: format for CPU inference. Various quantization levels (Q4_K_M, Q5_K_M, etc.). Optimized for Apple Silicon and x86 with AVX.
- **Quality spectrum**:
  - FP16 → INT8: <1% quality loss, 2x memory reduction
  - INT8 → INT4 (GPTQ/AWQ): 1–3% quality loss, 4x memory reduction
  - INT4 → INT3/INT2: 5–15% quality loss, often unacceptable
- **Perplexity vs task accuracy**: perplexity may increase only slightly, but downstream task accuracy (especially reasoning) can degrade more noticeably
- **Mixed quantization**: keep attention layers in higher precision, quantize FFN layers more aggressively. Weight-only vs weight+activation quantization.
- **Serving integration**: bitsandbytes (training-time), GPTQ (vLLM, TGI), AWQ (vLLM), GGUF (llama.cpp, Ollama)

**Follow-up Questions**  
- How do you evaluate quantization quality beyond perplexity?
- When should you use AWQ vs GPTQ?
- How does quantization interact with the KV cache?
- What is FP8 quantization and when is it preferred over INT8?

**Weak Answer Signals / Red Flags**  
- Thinks quantization is lossless
- Cannot explain how calibration data is used
- Doesn't distinguish between quantization approaches
- Says "just use 4-bit" without evaluating quality

**Interviewer Signal**  
Tests practical LLM deployment knowledge. Quantization decisions directly affect serving cost, hardware requirements, and model quality.

**Real-World Insight**  
Most production LLM deployments use quantization. The Meta Llama 3 70B at INT4 (AWQ) fits on 2× A100 80GB GPUs and serves at ~2x the throughput of FP16 on 4× A100s, with only minor quality degradation. This halves the serving cost.

---

### Q-TFM-B01-015: Your fine-tuned model generates repetitive text (loops). Diagnose the issue.

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Generation Failures  
**Level:** Debugging  
**Difficulty:** 3  
**Experience Bands:** 2–5, 5–8  
**Role Families:** llm-rag-agent-engineer, research-applied-research  
**Interview Round:** Debugging  
**Prerequisites:** Fine-tuning, generation mechanics  
**Tags:** `repetition`, `generation`, `fine-tuning`, `debugging`, `sampling`  
**Why This Matters:** Repetitive generation is one of the most common LLM production failures. Understanding the root causes prevents costly debugging cycles.

**Question**  
After fine-tuning, your model frequently generates repetitive text — sentences or phrases that loop. What are the possible causes and how do you diagnose each?

**Expected Answer (Short)**  
Causes: overfitting on training data (too many epochs on small dataset), training data itself contains repetition, low temperature/greedy decoding amplifies peaked distributions, degenerate attention patterns from extended context, or the fine-tuning corrupted the model's learned distribution. Diagnose by checking train loss, sampling at high temperature, inspecting attention patterns, and evaluating on the base model.

**Deep Answer**  
- **Overfitting (most common)**: fine-tuned too long on too little data. Model memorizes training sequences. Check: val loss diverged from train loss? Compare with fewer training epochs.
- **Training data repetition**: if the training data has repeated phrases or templates, the model learns to repeat. Check: audit training data for duplicates and repetitive patterns.
- **Sampling configuration**: greedy decoding (temperature=0) picks the highest-probability token every time. If the model is slightly peaked, it can lock into loops. Check: increase temperature to 0.7, add top-p, add repetition penalty.
- **Repetition penalty**: apply multiplicative or frequency penalty to recently generated tokens. Often sufficient as a quick fix.
- **Degenerate attention**: in some failure modes, attention "collapses" to attending only to recent context, creating echo chambers. Check: visualize attention patterns.
- **Context length issues**: if generating beyond the training context length, the model's distribution can degenerate. Check: is the repetition starting at a specific position?
- **Diagnosis sequence**:
  1. Test the base model (pre fine-tuning) — does it repeat? If no, fine-tuning caused it.
  2. Check training curves — overfitting?
  3. Try higher temperature + repetition penalty — quick fix?
  4. Audit training data for repetition
  5. Try fewer training epochs
  6. Check if repetition correlates with output length

**Follow-up Questions**  
- How many epochs are typical for LLM fine-tuning before overfitting?
- What is the difference between repetition penalty and frequency penalty?
- Can you detect repetition programmatically during generation?

**Weak Answer Signals / Red Flags**  
- Only suggests "increase temperature" without investigating root cause
- Doesn't check training data quality
- Cannot connect overfitting to repetition
- No systematic diagnosis approach

**Interviewer Signal**  
Tests debugging methodology. Repetitive generation is a real production issue. Systematic diagnosis vs random fix attempts separates effective engineers.

**Real-World Insight**  
Many production fine-tuning failures trace to training data quality. Teams that invest in deduplication, quality filtering, and diversity analysis before fine-tuning avoid the most common failure modes including repetition.

---

### Q-TFM-B01-016: The model produces correct answers for simple prompts but degrades on long-context prompts. Diagnose.

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Context Length / Attention  
**Level:** Debugging  
**Difficulty:** 4  
**Experience Bands:** 5–8, 8–12  
**Role Families:** llm-rag-agent-engineer, senior-architect-ai-systems-lead  
**Interview Round:** Debugging, System design  
**Prerequisites:** KV cache, position encoding, attention  
**Tags:** `long-context`, `lost-in-the-middle`, `context-window`, `degradation`, `debugging`  
**Why This Matters:** Long-context degradation is one of the most subtle and impactful LLM failures, especially for RAG and document processing applications.

**Question**  
Your LLM performs well on short prompts but quality degrades significantly for prompts exceeding 8K tokens. What could be causing this, and how do you investigate?

**Expected Answer (Short)**  
Possible causes: model was trained on shorter contexts and extended without sufficient continued pre-training; "lost in the middle" effect (model attends more to beginning and end of context); KV cache numerical issues at longer lengths; position encoding extrapolation degradation; or the prompt simply contains too much irrelevant information diluting useful context.

**Deep Answer**  
- **Training context mismatch**: model trained on 4K context, served at 32K. Position encoding (even RoPE) degrades when extrapolating significantly beyond training length. Check: what context length was the model trained on?
- **Lost in the middle**: well-documented phenomenon where LLMs attend strongly to the beginning and end of the context but "forget" information in the middle. Not a bug — a property of trained attention patterns.
  - Diagnosis: put the critical information at different positions (beginning, middle, end) and test accuracy
  - Mitigation: reorder context to put important information at the beginning
- **Attention dilution**: with more context, attention weights spread thinner across more tokens. Critical information gets less attention weight.
- **RoPE degradation**: extended RoPE (NTK-aware, YaRN) helps but quality still decreases with distance from training distribution
- **Investigation steps**:
  1. Measure perplexity as a function of context length — where does it degrade?
  2. Test "needle in a haystack" — can the model find specific information at various positions?
  3. Check model's training context length in documentation
  4. Test with critical information at different positions (beginning, middle, end)
  5. Compare with a model known for long-context (Claude, GPT-4-128K, Llama 3 128K)
- **Mitigations**: use models specifically trained for long context, chunk and summarize (recursive summarization), rerank and reorder context by relevance before prompting

**Follow-up Questions**  
- What is the "needle in a haystack" test and how do you interpret results?
- How does lost-in-the-middle affect RAG system design?
- When should you use recursive summarization vs long-context models?

**Weak Answer Signals / Red Flags**  
- Assumes all models handle any context length equally
- Doesn't know about "lost in the middle"
- No systematic investigation approach
- Only solution is "get a model with larger context"

**Interviewer Signal**  
Tests deep understanding of LLM capabilities and limitations. Critical for RAG and document processing applications where long context is the norm.

**Real-World Insight**  
The "lost in the middle" paper showed that most LLMs (even those claiming 100K+ context) degrade significantly for information placed in the middle of long contexts. Production RAG systems that simply concatenate retrieved chunks without ordering by relevance suffer from this effect. Placing the most relevant information at the beginning of the context significantly improves answer quality.

---

### Q-TFM-B01-017: What is LoRA and how does it work at the matrix level?

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Parameter-Efficient Fine-Tuning  
**Level:** Applied  
**Difficulty:** 3  
**Experience Bands:** 2–5, 5–8  
**Role Families:** llm-rag-agent-engineer, research-applied-research, ml-data-engineer  
**Interview Round:** Technical deep dive  
**Prerequisites:** Linear algebra, fine-tuning basics  
**Tags:** `lora`, `peft`, `low-rank`, `fine-tuning`, `adaptation`  
**Why This Matters:** LoRA is the most widely used fine-tuning technique for LLMs. Understanding its mechanics enables correct hyperparameter choices and debugging.

**Question**  
Explain how LoRA (Low-Rank Adaptation) works at the weight matrix level. What are rank, alpha, and target modules, and how do their choices affect fine-tuning quality?

**Expected Answer (Short)**  
LoRA freezes the original weight matrix W and adds a low-rank update: W' = W + (α/r) × BA, where B ∈ ℝ^(d×r) and A ∈ ℝ^(r×d), and r << d. Only A and B are trained. This reduces trainable parameters from d² to 2dr. Rank (r) controls capacity: higher r = more expressiveness but more memory. Alpha (α) scales the update magnitude. Target modules: which weight matrices get LoRA adapters (typically Q, K, V, O projections and FFN layers).

**Deep Answer**  
- **Frozen base**: W ∈ ℝ^(d×d) remains frozen. No gradient computation/storage for W.
- **Low-rank decomposition**: ΔW = BA where B ∈ ℝ^(d×r), A ∈ ℝ^(r×d). The update has rank at most r.
- **Initialization**: A initialized with random Gaussian, B initialized to zero → ΔW starts at zero (no change to model behavior at start).
- **Scaling**: ΔW is scaled by α/r. α controls the magnitude of the adaptation. Typical: α = 2r or α = r.
- **Memory savings**: 7B model has ~6.7B parameters × 2 bytes (FP16) = 13.4GB gradients + optimizer states. LoRA with r=16 on attention: ~0.1% trainable parameters → 0.1% gradient/optimizer memory.
- **Rank selection**:
  - r=4: very few parameters, works for simple tasks
  - r=16–32: balanced, common default for instruction tuning
  - r=64–256: high capacity, approaches full fine-tuning quality
- **Target module selection**:
  - Attention Q, V only (original LoRA paper)
  - All attention + FFN (recommended by recent work — QLoRA, LLaMA-Adapter)
  - Adding FFN targets significantly improves quality
- **QLoRA**: base model in INT4, LoRA adapters in FP16/BF16. Enables fine-tuning on consumer GPUs.
- **Merging**: after training, LoRA weights can be merged into base model: W' = W + (α/r)BA. No inference overhead.

**Follow-up Questions**  
- How does the rank relate to the expressiveness of the adaptation?
- When would you increase r=16 to r=64? What are the diminishing returns?
- Can you stack multiple LoRA adapters? How?
- What is the relationship between LoRA rank and the number of training examples?

**Weak Answer Signals / Red Flags**  
- Cannot explain the matrix decomposition
- Doesn't know what rank means
- Uses LoRA without understanding alpha scaling
- Cannot explain why LoRA reduces memory

**Interviewer Signal**  
Tests understanding of the most important practical fine-tuning technique. Candidates who understand LoRA mechanics make better hyperparameter decisions.

**Real-World Insight**  
Production teams often train multiple LoRA adapters for different tasks/customers on the same base model. Serving systems (vLLM, LoRAX) can serve hundreds of LoRA adapters simultaneously by swapping adapters per request with minimal overhead — this is how multi-tenant LLM platforms work.

---

### Q-TFM-B01-018: How does the feed-forward network (FFN) in a transformer work, and why does it use twice the hidden dimension?

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Architecture Components  
**Level:** Concept  
**Difficulty:** 2  
**Experience Bands:** 0–2, 2–5  
**Role Families:** research-applied-research, deep-learning-cv-engineer, software-foundations-to-ai-engineer  
**Interview Round:** Phone screen, Technical deep dive  
**Prerequisites:** Linear layers, activation functions  
**Tags:** `ffn`, `gated-ffn`, `swiglu`, `hidden-dimension`, `transformer-block`  
**Why This Matters:** The FFN constitutes ~2/3 of transformer parameters and is where "knowledge" is primarily stored. Understanding it explains model behavior and compression strategies.

**Question**  
Describe the FFN (feed-forward network) in a transformer block. Why is the intermediate dimension typically 4× the model dimension? What is SwiGLU and why did it replace ReLU?

**Expected Answer (Short)**  
The FFN is two linear layers with a non-linearity: FFN(x) = W2 · σ(W1 · x). The intermediate dimension (4× model dim) provides a large feature space for non-linear transformation. SwiGLU replaces ReLU with a gated mechanism: SwiGLU(x) = (Swish(xW1) ⊙ xW3) × W2, adding a gating weight that improves quality at the cost of a third weight matrix (compensated by reducing the intermediate size by 1/3).

**Deep Answer**  
- **Standard FFN**: FFN(x) = W2 · ReLU(W1 · x + b1) + b2. W1 projects d_model → 4×d_model, W2 projects back.
- **Why 4×**: empirical finding. Larger intermediate dimension = more capacity for each token's representation. The expansion-contraction pattern allows the model to use a richer feature space for non-linear processing.
- **Where knowledge lives**: mechanistic interpretability suggests that the FFN layers store factual associations. W1 maps to "feature detectors" and W2 maps back to the output space. Specific neurons in the FFN correspond to specific concepts.
- **SwiGLU**: modern replacement (Llama, Mistral, Gemma):
  - gate = Swish(x × W_gate), up = x × W_up, output = gate ⊙ up, then x × W_down
  - The gating mechanism allows the model to selectively activate features
  - Swish activation: x × sigmoid(βx), smooth and non-monotonic
  - Three weight matrices instead of two → 50% more parameters per FFN layer
  - To compensate, intermediate dimension reduced from 4× to ~8/3× (e.g., Llama 2 uses 11008 for d_model=4096)
- **Parameter share**: in a typical transformer, FFN has 8×d² parameters (2 matrices of 4d×d) vs attention's ~4×d² → FFN is ~2× the parameters of attention
- **Implication for LoRA**: applying LoRA to FFN layers (not just attention) is important because FFN contains most parameters and knowledge

**Follow-up Questions**  
- Why is SwiGLU better than ReLU empirically?
- How does the FFN relate to knowledge storage in transformers?
- If the FFN stores knowledge, what does that imply about knowledge editing?

**Weak Answer Signals / Red Flags**  
- Doesn't know the FFN architecture
- Thinks attention is the only important component
- Cannot explain the intermediate dimension
- Unaware of SwiGLU

**Interviewer Signal**  
Tests architectural understanding beyond attention. Many candidates focus exclusively on attention and miss the FFN, which is where most parameters and knowledge reside.

**Real-World Insight**  
Knowledge editing techniques (ROME, MEMIT) work by modifying specific FFN weight values to change factual associations. Understanding that FFN layers are "knowledge stores" is key for model editing and understanding how fine-tuning changes model behavior.

---

### Q-TFM-B01-019: Design the inference serving architecture for a 70B parameter LLM to handle 500 requests/second at P99 latency under 3 seconds.

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Inference Architecture  
**Level:** System  
**Difficulty:** 5  
**Experience Bands:** 8–12, 12–20  
**Role Families:** senior-architect-ai-systems-lead, mlops-llmops-platform-engineer  
**Interview Round:** System design  
**Prerequisites:** GPU serving, quantization, parallelism, KV cache  
**Tags:** `serving`, `inference`, `latency`, `throughput`, `system-design`  
**Why This Matters:** Designing LLM serving infrastructure requires integrating architectural knowledge (quantization, parallelism, KV cache) with systems engineering (load balancing, autoscaling, SLOs).

**Question**  
Design the serving infrastructure for a 70B LLM at 500 req/s with P99 latency < 3s. Cover GPU selection, parallelism strategy, batching, and scaling.

**Expected Answer (Short)**  
Use INT4 quantization (AWQ/GPTQ) to fit on 2× A100 80GB per replica with tensor parallelism. Deploy vLLM or TGI with continuous batching and PagedAttention. Multiple replicas behind a load balancer with request routing based on queue depth. Autoscale based on P99 latency and queue length. Prefix caching for repeated system prompts.

**Deep Answer**  
- **Model configuration**:
  - 70B at FP16 = 140GB → doesn't fit on 2× A100 (160GB) with KV cache
  - 70B at INT4 (AWQ) ≈ 35GB weights + KV cache for 4K context ≈ 10GB = ~45GB per replica with 2× A100 TP=2
  - Or: FP16 with 4× A100 TP=4 for higher quality
- **Serving stack**: vLLM preferred (PagedAttention, continuous batching, speculative decoding support)
- **Batching strategy**:
  - Continuous batching: don't wait for a full batch — start processing as requests arrive, preempt and schedule dynamically
  - Max batch size determined by KV cache memory budget
  - Throughput target: 500 req/s with average generation of ~200 tokens → ~100K tokens/s
- **Scaling model**:
  - Each replica handles ~30–60 req/s (depending on generation length)
  - Need ~10–20 replicas
  - Load balancer: least-outstanding-requests routing
  - Autoscaler: scale on P99 latency + queue length
- **Latency optimization**:
  - Speculative decoding: reduce per-token latency by 2–3x
  - Prefix caching: system prompt cached across requests
  - KV cache quantization: INT8 to increase batch size
  - Request prioritization: streaming responses, prefill scheduling
- **Cost optimization**:
  - Spot instances for non-latency-critical traffic
  - Scale-to-zero during low-traffic periods if SLO allows cold start
  - Model router: simple queries to 7B, complex to 70B

**Follow-up Questions**  
- How do you handle traffic spikes that exceed autoscaler speed?
- What monitoring would you set up for this system?
- How would you implement graceful degradation during partial outage?
- How does the cost change if you switch to H100 GPUs?

**Weak Answer Signals / Red Flags**  
- Cannot estimate memory requirements
- Doesn't mention continuous batching
- No latency analysis (just "add more GPUs")
- Ignores cost considerations

**Interviewer Signal**  
Tests end-to-end system design ability combining architectural knowledge with infrastructure engineering. Senior architect level.

**Real-World Insight**  
Companies serving LLMs at this scale typically use vLLM or TGI behind Kubernetes with GPU autoscaling. The key operational challenge is balancing cost (fewer replicas) against latency SLOs (more replicas for lower queue times). Many teams run two tiers: quantized models for most traffic, full-precision for quality-critical requests.

---

### Q-TFM-B01-020: What are the key differences between encoder-only, decoder-only, and encoder-decoder transformer architectures?

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Architecture Variants  
**Level:** Concept  
**Difficulty:** 2  
**Experience Bands:** 0–2, 2–5  
**Role Families:** software-foundations-to-ai-engineer, research-applied-research, llm-rag-agent-engineer  
**Interview Round:** Phone screen, Technical deep dive  
**Prerequisites:** Basic transformer awareness  
**Tags:** `encoder-only`, `decoder-only`, `encoder-decoder`, `bert`, `gpt`, `t5`  
**Why This Matters:** Choosing the right architecture type for a task is a fundamental design decision. Using a decoder-only model for embeddings or an encoder-only model for generation wastes resources.

**Question**  
Compare encoder-only (BERT), decoder-only (GPT), and encoder-decoder (T5) transformer architectures. When is each appropriate?

**Expected Answer (Short)**  
Encoder-only (BERT): bidirectional attention, produces embeddings. Best for classification, NER, sentence similarity. Decoder-only (GPT): causal (left-to-right) attention, generates text. Best for text generation, chat, code completion. Encoder-decoder (T5): encoder processes input bidirectionally, decoder generates output autoregressively. Best for translation, summarization, sequence-to-sequence tasks.

**Deep Answer**  
- **Encoder-only (BERT, RoBERTa, DeBERTa)**:
  - Bidirectional self-attention: each token attends to all other tokens. Rich contextual representations.
  - Training: masked language modeling (predict masked tokens)
  - Output: contextualized token embeddings, typically pooled for classification
  - Strong for: classification, NER, semantic similarity, reranking, embedding models
  - Cannot generate text (no causal mechanism)
- **Decoder-only (GPT, Llama, Mistral)**:
  - Causal self-attention: each token only attends to previous tokens (left-to-right)
  - Training: next-token prediction
  - Output: probability distribution over next token → generate text autoregressively
  - Strong for: text generation, chat, code, reasoning, general-purpose "do anything"
  - Can be used for classification (prompt-based) but less efficient than encoder-only
- **Encoder-decoder (T5, BART, mBART)**:
  - Encoder: bidirectional attention on input. Decoder: causal attention on output + cross-attention to encoder
  - Training: span corruption (T5), denoising (BART)
  - Strong for: translation, summarization, structured generation from input
  - More complex architecture, harder to scale
- **Modern trend**: decoder-only dominates because it's simpler to scale, works for all tasks (with prompting), and benefits most from scale. Encoder-only (BERT-class) still preferred for embeddings and classification due to efficiency.

**Follow-up Questions**  
- Why can't you use a decoder-only model for efficient embedding?
- Why has the industry converged on decoder-only for LLMs?
- When is T5-style architecture still the right choice?

**Weak Answer Signals / Red Flags**  
- Cannot distinguish the architectures
- Thinks BERT can generate text
- Doesn't know why decoder-only dominates
- Uses GPT for embedding tasks (wasteful)

**Interviewer Signal**  
Foundational architecture literacy. Correct architecture selection prevents wasteful engineering decisions.

**Real-World Insight**  
Modern embedding models (E5, GTE, BGE) are encoder-only or trained from decoder-only models with special pooling. Using a 70B decoder-only model for embeddings when a 100M encoder model works equally well is a common and expensive mistake in production RAG systems.

---

### Q-TFM-B01-021: After quantizing your model from FP16 to INT4, quality drops significantly on reasoning tasks but not on simple Q&A. Why?

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Quantization Failures  
**Level:** Debugging  
**Difficulty:** 4  
**Experience Bands:** 5–8, 8–12  
**Role Families:** llm-rag-agent-engineer, mlops-llmops-platform-engineer, research-applied-research  
**Interview Round:** Debugging  
**Prerequisites:** Quantization, model evaluation  
**Tags:** `quantization`, `quality-degradation`, `reasoning`, `debugging`, `outlier-channels`  
**Why This Matters:** Quantization quality is not uniform across task types. Understanding when and why quality drops helps teams choose the right quantization level for their use case.

**Question**  
After quantizing from FP16 to INT4, your model maintains quality on simple Q&A and summarization but drops 15% on mathematical reasoning and code generation. Why, and what can you do?

**Expected Answer (Short)**  
Reasoning and code require precise numerical computation and multi-step consistency across many tokens. Quantization introduces per-layer rounding errors that compound through the model. Simple tasks tolerate imprecision because they rely on broader pattern matching. Reasoning tasks depend on exact intermediate representations. Solutions: use INT8 instead of INT4 for these tasks, mixed-precision (keep critical layers in higher precision), or evaluate quantization per-task before deploying.

**Deep Answer**  
- **Error accumulation**: each quantized layer introduces small rounding errors. Through 80 transformer layers, these errors compound. Simple Q&A is robust to noise; multi-step reasoning amplifies errors.
- **Outlier channels**: some weight channels have much larger activation magnitudes than others. INT4 quantization can clip these outliers, destroying information that's critical for reasoning. AWQ addresses this by protecting high-activation channels.
- **Precision in FFN layers**: reasoning likely depends on precise FFN activations (knowledge lookup + transformation). INT4 FFN quantization loses the most precision.
- **Attention sensitivity**: precision in attention score computation affects long-range dependencies. INT4 attention KV can degrade attention patterns for complex reasoning chains.
- **Diagnosis**:
  1. Benchmark quantized model per-task (not just aggregate perplexity)
  2. Compare INT4 vs INT8 vs FP16 on reasoning tasks specifically
  3. Test GPTQ vs AWQ — AWQ specifically protects salient channels
  4. Try mixed precision: INT4 weights + FP16 attention (some frameworks support this)
- **Solutions**:
  - Use INT8 instead of INT4 for reasoning-critical deployments
  - Use model router: simple tasks → INT4, reasoning → INT8 or FP16
  - Apply AWQ with higher group size for reasoning-critical models
  - Keep attention computation in FP16 while quantizing FFN
  - Consider FP8 (H100/RTX 4090+) as a middle ground

**Follow-up Questions**  
- How does group size in quantization affect quality vs efficiency?
- What is the relationship between calibration data and quantization quality?
- How would you build a benchmark specifically for testing quantization robustness?

**Weak Answer Signals / Red Flags**  
- Assumes quantization quality is uniform across tasks
- No per-task evaluation strategy
- Cannot explain why reasoning is more sensitive
- Only solution is "don't quantize"

**Interviewer Signal**  
Tests nuanced understanding of quantization effects. Important for production teams that need to balance cost and quality.

**Real-World Insight**  
Many production teams use "quality-tiered serving" — INT4 models for high-volume simple tasks (summarization, extraction) and FP16 models for low-volume reasoning tasks (complex analysis, code generation). This optimizes cost without sacrificing quality where it matters.

---

### Q-TFM-B01-022: How would you evaluate whether a new foundation model is worth adopting for your production system?

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Model Evaluation and Selection  
**Level:** Architect  
**Difficulty:** 4  
**Experience Bands:** 5–8, 8–12, 12–20  
**Role Families:** senior-architect-ai-systems-lead, llm-rag-agent-engineer, mlops-llmops-platform-engineer  
**Interview Round:** Architecture strategy, System design  
**Prerequisites:** Model evaluation, production systems, cost analysis  
**Tags:** `model-selection`, `evaluation`, `benchmarks`, `production`, `migration`  
**Why This Matters:** New models release monthly. Impulsive model switching wastes months of engineering effort. Systematic evaluation prevents chasing benchmarks and ensures real-world value.

**Question**  
A new open-source foundation model claims to be "state of the art" on multiple benchmarks. How do you evaluate whether it's worth migrating your production system?

**Expected Answer (Short)**  
Don't trust benchmarks alone — benchmark gaming is common. Evaluate on YOUR task with YOUR data. Do a multi-dimensional assessment: quality on production-representative examples, latency/throughput, cost per inference, quantization compatibility, tooling support, licensing, and migration effort. Compare marginal quality improvement against total migration cost.

**Deep Answer**  
- **Benchmark skepticism**: MMLU, HumanEval, etc. can be gamed or contaminated. Models may have seen benchmark data during training.
- **Evaluation framework**:
  1. **Task-specific eval**: Run on your production dataset. Measure the metrics YOUR users care about, not generic benchmarks.
  2. **Quality dimensions**: accuracy, coherence, safety, formatting compliance, structured output reliability
  3. **Infrastructure compatibility**: Does it work with your serving stack (vLLM, TGI)? Quantization support? LoRA support?
  4. **Serving performance**: measure tokens/s and latency on YOUR hardware. Benchmark results from different hardware don't transfer.
  5. **Cost analysis**: total cost per request = GPU-hours × GPU cost. Include KV cache memory, batch sizes achievable.
  6. **License**: commercial use allowed? Any restrictions?
  7. **Ecosystem**: fine-tuning tools, community support, continued development, safety guarantees
  8. **Migration cost**: prompt changes needed, fine-tuning redo, evaluation pipeline updates, testing
- **Decision framework**: is quality_improvement × business_value > migration_cost + risk?
- **Pilot approach**: deploy new model for 5% of traffic (shadow or canary), compare against production model on real traffic
- **Red flags**: model performs well on benchmarks but poorly on YOUR data → benchmark contamination or task mismatch

**Follow-up Questions**  
- How do you set up A/B testing for model comparison in production?
- What are the hidden costs of model migration?
- How do you handle the case where the new model is better on average but worse on critical edge cases?

**Weak Answer Signals / Red Flags**  
- "It's higher on the leaderboard, let's switch"
- No production-specific evaluation
- Ignores migration cost and risk
- Doesn't consider infrastructure compatibility

**Interviewer Signal**  
Tests strategic technical judgment. The best engineers resist hype and make evidence-based decisions about model adoption.

**Real-World Insight**  
Many teams have spent months migrating to a "better" model only to find that prompt/template differences, fine-tuning data incompatibility, and serving quirks eliminated the benchmark advantage. A rigorous 2-week evaluation saves months of wasted migration effort.

---

### Q-TFM-B01-023: What is the impact of context window size on model architecture, training cost, and serving performance?

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Context Window Design  
**Level:** System  
**Difficulty:** 4  
**Experience Bands:** 5–8, 8–12  
**Role Families:** senior-architect-ai-systems-lead, research-applied-research, llm-rag-agent-engineer  
**Interview Round:** System design, Architecture strategy  
**Prerequisites:** Attention mechanism, KV cache, training parallelism  
**Tags:** `context-window`, `long-context`, `architecture`, `cost`, `training`  
**Why This Matters:** Context window size determines what applications are possible (e.g., full-document RAG, long-form code, conversation history) and drives infrastructure costs.

**Question**  
How does increasing context window size from 4K to 128K affect model architecture decisions, training costs, and serving infrastructure requirements?

**Expected Answer (Short)**  
Architecture: need RoPE or similar relative position encoding, possibly sliding window or sparse attention. Training: O(n²) attention makes long-context training very expensive — requires context parallelism and Flash Attention. Serving: KV cache grows linearly with context length — at 128K, may dominate GPU memory, limiting batch size and throughput.

**Deep Answer**  
- **Architecture impact**:
  - Position encoding must support extrapolation (RoPE + extension), not learned absolute positions
  - May need attention modifications: sliding window (Mistral), blockwise attention, or hybrid attention patterns
  - Flash Attention essential — O(n²) attention without it is prohibitive at 128K
- **Training cost**:
  - Attention FLOPs: O(n² × d) per layer. 128K = 32× the FLOPs of 4K for attention
  - But attention is only ~30% of total FLOPs (FFN dominates). So total training increase is ~2-5× not 32×
  - Data: need training data with useful long-range dependencies (not just padding short docs to 128K)
  - Sequence parallelism: split long sequences across GPUs. Communication overhead for cross-GPU attention.
  - Often done as a second stage: pre-train at 4K, then continue pre-training at 128K with position extension
- **Serving impact**:
  - KV cache for 128K at 70B (GQA, FP16): ~80GB per sequence. Batch size 1 fills an A100.
  - Throughput drops dramatically: can serve fewer concurrent users
  - Solutions: KV cache quantization (INT8), sliding window, KV cache eviction, prefix caching
  - Latency: prefill phase for 128K tokens takes several seconds — visible to users
- **Cost reality**: serving a 128K-context model costs ~32× more per request than 4K-context (KV cache memory + prefill compute)

**Follow-up Questions**  
- Is it better to use a 128K model with RAG or a 4K model with better retrieval?
- How does context parallelism work for long-sequence training?
- What determines whether you need 128K context vs smart context management?

**Weak Answer Signals / Red Flags**  
- Thinks longer context is always better
- Cannot estimate KV cache cost at longer contexts
- Ignores training cost implications
- Doesn't know about context extension techniques

**Interviewer Signal**  
Tests ability to reason about architectural trade-offs across the full lifecycle — training, serving, and cost. Essential for strategic model decisions.

**Real-World Insight**  
Many customers ask for "128K context" but their actual use case only needs 4K of well-selected context via RAG. Serving at 128K costs 10-30x more than serving at 4K with retrieval. The right answer is usually "use RAG to select the right 4K tokens" rather than "deploy a 128K model."

---

### Q-TFM-B01-024: How would you design a model evaluation strategy that catches quality regressions before production deployment?

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Evaluation Architecture  
**Level:** Architect  
**Difficulty:** 4  
**Experience Bands:** 5–8, 8–12, 12–20  
**Role Families:** senior-architect-ai-systems-lead, mlops-llmops-platform-engineer, llm-rag-agent-engineer  
**Interview Round:** System design, Architecture strategy  
**Prerequisites:** Model evaluation, CI/CD, production ML  
**Tags:** `evaluation`, `regression-testing`, `ci-cd`, `quality-gates`, `model-deployment`  
**Why This Matters:** LLM quality regressions are subtle and hard to detect. Without systematic evaluation gates, quality issues reach users and erode trust.

**Question**  
Design an evaluation pipeline that prevents LLM quality regressions from reaching production. What evaluation dimensions, data, automation, and decision criteria do you include?

**Expected Answer (Short)**  
Multi-layer evaluation: unit tests (structured output compliance, safety refusals), regression suite (golden examples with expected behavior), benchmark suite (task-specific metrics), qualitative review (human evaluation on a sample), and shadow/canary deployment. Automate as quality gates in CI/CD. Block deployment if any critical dimension regresses.

**Deep Answer**  
- **Layer 1 — Unit tests (fast, automated)**:
  - Structured output: always produces valid JSON? Respects schema?
  - Safety: refuses harmful prompts? (Red-team test cases)
  - Format compliance: follows system prompt instructions?
  - Determinism: same input → consistent quality range?
  - Run on every commit. Block deployment if any fail.
- **Layer 2 — Regression suite (medium, automated)**:
  - Golden examples: 100–500 curated input-output pairs with expected answers
  - LLM-as-judge: use a strong model to rate responses on relevance, accuracy, coherence
  - Per-task breakdown: score by category (extraction, summarization, reasoning, etc.)
  - Compare against baseline model version. Flag if any category degrades.
- **Layer 3 — Benchmark suite (slower, automated)**:
  - Standard benchmarks relevant to your domain (MMLU subset, HumanEval, domain-specific)
  - Custom benchmarks: real production queries with known-correct answers
  - Track over time: trending dashboard showing quality per version
- **Layer 4 — Human evaluation (manual, periodic)**:
  - Sample 50–100 production-like queries, rated by domain experts
  - Blind comparison: current model vs new model
  - Essential for catching nuanced quality changes that metrics miss
- **Layer 5 — Canary/shadow deployment**:
  - Deploy to 5% of traffic, monitor quality metrics
  - Automated rollback if quality drops below threshold
- **Decision criteria**:
  - Gate 1 (unit tests): must all pass → auto-proceed or auto-block
  - Gate 2 (regression): no category regresses >2% → auto-proceed; any regression → human review
  - Gate 3 (benchmark): no overall regression → proceed
  - Gate 4 (human): majority positive → approve
  - Gate 5 (canary): metrics stable for 24h → full rollout

**Follow-up Questions**  
- How do you handle evaluation data contamination (model has seen eval data during training)?
- When is LLM-as-judge reliable, and when does it fail?
- How do you balance evaluation thoroughness with deployment velocity?

**Weak Answer Signals / Red Flags**  
- Single evaluation metric, no multi-layer approach
- No automation or CI/CD integration
- Relies entirely on benchmarks without production-representative data
- No rollback strategy

**Interviewer Signal**  
Tests production quality engineering maturity. This is how senior engineers and architects prevent the most common LLM production failures.

**Real-World Insight**  
Every major LLM production team has experienced a quality regression that slipped past automated checks and was caught by users. The response is always to add more evaluation layers — the teams with the most mature evaluation pipelines deploy faster and more confidently.

---

### Q-TFM-B01-025: What is the role of the embedding layer in a transformer, and why does it share weights with the final linear layer in many models?

**Topic Family:** Transformer and Modern LLM Internals  
**Subtopic:** Architecture Components  
**Level:** Concept  
**Difficulty:** 2  
**Experience Bands:** 0–2, 2–5  
**Role Families:** research-applied-research, software-foundations-to-ai-engineer  
**Interview Round:** Phone screen, Technical deep dive  
**Prerequisites:** Linear algebra, vocabulary  
**Tags:** `embedding`, `weight-tying`, `vocabulary`, `language-model-head`  
**Why This Matters:** Understanding token embeddings explains how the model represents and outputs language, and weight tying affects model size and training.

**Question**  
What does the embedding layer do in a transformer? Why do many language models "tie" (share) the input embedding weights with the output projection (LM head)?

**Expected Answer (Short)**  
The embedding layer maps token IDs to dense vectors (d_model-dimensional). The LM head projects hidden states back to vocabulary logits. Weight tying shares the embedding matrix between both — the same matrix used to look up token representations is used (transposed) to project back to vocabulary probabilities. This reduces parameter count and can improve training because the embedding and output spaces are aligned.

**Deep Answer**  
- **Input embedding**: token_id → E[token_id], where E ∈ ℝ^(vocab_size × d_model). This is a lookup table.
- **Output projection (LM head)**: hidden_state ∈ ℝ^d_model → logits ∈ ℝ^vocab_size via linear projection W_out × hidden_state
- **Weight tying**: W_out = E^T (same matrix, transposed). The "meaning" of token t in input space is the same direction as its logit contribution in output space.
- **Why it works**: output probability should be high for tokens whose meaning is similar to the model's current representation. Input and output sharing ensures this consistency.
- **Parameter savings**: for vocab_size=128K and d_model=4096: 128K × 4096 × 2 bytes = ~1GB. Sharing saves one copy. For small models, this is significant percentage-wise; for large models, it's marginal.
- **Training benefit**: shared gradients between input and output. The embedding learns from both the input representation task and the output prediction task simultaneously.
- **When NOT to tie**: some very large models untie embeddings for more capacity. Llama 3 does NOT tie weights. The trade-off is model quality vs parameter efficiency.
- **Multi-token prediction**: when the model predicts multiple future tokens simultaneously, having untied embeddings allows each prediction head to use different output projections.

**Follow-up Questions**  
- How does the embedding matrix size scale with vocabulary size?
- When would you choose to untie input and output embeddings?
- How do embedding layers relate to positional encodings?

**Weak Answer Signals / Red Flags**  
- Doesn't know what the embedding layer does
- Cannot explain weight tying
- Confuses token embeddings with positional embeddings
- Thinks the LM head is an independent component

**Interviewer Signal**  
Tests understanding of the full transformer architecture from input to output. Gap here often indicates surface-level understanding of transformer models.

**Real-World Insight**  
When building embedding models from decoder-only LLMs, the input embedding quality is critical — it's the starting point for all token representations. Some embedding models fine-tune the input embeddings while freezing other layers, leveraging the pre-trained embedding space.
