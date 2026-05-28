# Systems, Serving, and Inference — Batch 01

Module: Systems, Serving, and Inference · Topic Family J  
Questions: 15 · Levels: Concept, Applied, System, Debugging, Architect  
Complements: [Module page](../../modules/systems-serving-and-inference.md)

---

### Q-SSI-B01-001: What is the difference between model latency and throughput in an LLM serving system, and why can optimizing one hurt the other?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| Systems, Serving, and Inference   | Serving Fundamentals   | Concept   | 2   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 0–2, 2–5   | software-foundations-to-ai-engineer, mlops-llmops-platform-engineer, llm-rag-agent-engineer   | Phone screen, Technical deep dive   |

| Prerequisites | Tags |
|---|---|
| Basic systems thinking   | `latency`, `throughput`, `serving`, `batching`, `llm-inference`   |

**Why This Matters:** Every production LLM deployment must balance latency and throughput. Misunderstanding the trade-off leads to SLO violations or wasted GPU spend.

**Question**  
Define latency and throughput in the context of LLM serving. Explain why increasing batch size improves throughput but can degrade latency, and how production systems navigate this trade-off.

**Expected Answer (Short)**  
Latency is the time from request arrival to response completion. Throughput is total tokens generated per second across all requests. Larger batches amortize GPU overhead and improve throughput, but each individual request waits longer as the batch grows. Production systems use dynamic batching with configurable max-wait windows to balance both.

**Deep Answer**  
- Latency has two components in autoregressive LLMs: time-to-first-token (TTFT) and inter-token latency (ITL)
- Throughput measures aggregate output: tokens/second across all concurrent requests
- With no batching, a single request uses the GPU alone — low latency, terrible throughput
- Static batching: wait for N requests, run them together. High throughput but latency spikes for early arrivals
- Dynamic/continuous batching (vLLM, TGI): new requests join mid-generation. Reduces idle GPU time without forcing long waits
- The fundamental tension: GPU compute is most efficient with large batch sizes (high arithmetic intensity), but each request shares the bandwidth and memory
- KV cache memory is per-request — larger batches consume more GPU memory, eventually limiting batch size or requiring memory management (PagedAttention)
- Production approach: set an SLO (e.g., P95 TTFT < 500ms), then maximize throughput within that constraint
- Streaming responses help perceived latency even when actual TTFT is higher

**Follow-up Questions**  
- What is the difference between TTFT and ITL, and which matters more for chat vs batch use cases?
- How does continuous batching differ from static batching, and why does it help?
- How does KV cache memory limit maximum batch size?
- When would you choose latency-optimized vs throughput-optimized serving?

**Weak Answer Signals / Red Flags**  
- Conflates latency and throughput as interchangeable
- Cannot explain why batching helps throughput
- Unaware of TTFT vs ITL distinction
- Thinks more GPUs always solve latency problems

**Interviewer Signal**  
Tests whether the candidate understands the core economics of GPU serving, not just model architecture.

**Real-World Insight**  
Cloud LLM providers (OpenAI, Anthropic) run throughput-optimized backends with latency SLO constraints. Internal teams often over-provision GPUs because they optimize for latency without understanding that batching can increase throughput 5–10x on the same hardware.

---

### Q-SSI-B01-002: How does KV cache work in autoregressive transformer inference, and why is it the dominant memory bottleneck?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| Systems, Serving, and Inference   | KV Cache and Memory   | Concept   | 3   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 2–5, 5–8   | llm-rag-agent-engineer, software-foundations-to-ai-engineer, research-applied-research   | Technical deep dive   |

| Prerequisites | Tags |
|---|---|
| Transformer attention basics, matrix multiplication   | `kv-cache`, `memory`, `attention`, `serving`, `gpu-memory`   |

**Why This Matters:** KV cache is the single largest memory consumer during LLM inference. Understanding it is required for capacity planning, choosing context-length limits, and selecting serving frameworks.

**Question**  
Explain what the KV cache stores, why it exists, how its memory scales with sequence length and batch size, and what happens when it exceeds GPU memory.

**Expected Answer (Short)**  
During autoregressive generation, each new token needs to attend to all previous tokens. Without caching, every key and value would be recomputed from scratch at each step. The KV cache stores previous K and V tensors so only the new token's Q/K/V needs computation. Memory scales as O(batch × layers × seq_len × 2 × head_dim), making long contexts and large batches the primary memory pressure.

**Deep Answer**  
- In autoregressive generation, token t attends to tokens 0..t-1. Without caching, you recompute K and V for all previous tokens at every step — O(n²) compute per sequence
- KV cache stores the K and V projections for all previous positions across all layers. At step t, only the new token's Q, K, V are computed and K/V are appended to the cache
- Memory per request: 2 (K and V) × num_layers × seq_len × num_heads × head_dim × bytes_per_element
- For a 70B model with 80 layers, 64 heads, head_dim=128, fp16: ~2.5 MB per token per request. At 4096 tokens, that's ~10 GB per request
- With batch size 32 at 4096 context: KV cache alone needs ~320 GB — more than the model weights
- This is why KV cache is the bottleneck, not model weights, for concurrent serving
- Solutions: PagedAttention (vLLM) manages KV cache like virtual memory pages to avoid fragmentation. GQA reduces KV cache by sharing K/V across query head groups. Quantized KV cache (FP8, INT8) halves memory. Sliding window attention limits cache to fixed window size
- When KV cache exceeds GPU memory: requests queue, preemption occurs, or context length must be reduced

**Follow-up Questions**  
- How does GQA (Grouped Query Attention) reduce KV cache size compared to MHA?
- What is PagedAttention and why does it improve memory utilization?
- How would you estimate the maximum concurrent users for a given GPU and model?
- What are the trade-offs of quantizing the KV cache?

**Weak Answer Signals / Red Flags**  
- Thinks model weights are the primary memory bottleneck during serving
- Cannot estimate KV cache size for a given model
- Unaware that KV cache scales linearly with sequence length and batch size
- Confuses KV cache with model parameter memory

**Interviewer Signal**  
Separates candidates who understand inference systems from those who only understand training.

**Real-World Insight**  
Most production KV cache OOMs happen when teams set generous context windows without calculating per-request memory. A 128k context LLaMA 70B request can consume 300+ GB of KV cache alone, making concurrent serving on a single node impossible without aggressive memory management.

---

### Q-SSI-B01-003: Compare vLLM and TGI as LLM serving engines. When would you choose one over the other?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| Systems, Serving, and Inference   | Serving Engines   | Applied   | 3   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 2–5, 5–8   | mlops-llmops-platform-engineer, llm-rag-agent-engineer, devops-sre-to-aiops   | Technical deep dive, System design   |

| Prerequisites | Tags |
|---|---|
| LLM serving basics, GPU memory concepts   | `vllm`, `tgi`, `serving`, `pagedattention`, `deployment`   |

**Why This Matters:** Choosing the right serving engine affects latency, throughput, cost, and operational complexity. These are the two dominant open-source options in 2025–2026.

**Question**  
Compare vLLM and Hugging Face TGI as LLM serving frameworks. Cover their core technical differentiators, performance characteristics, and deployment trade-offs. When would you recommend one over the other?

**Expected Answer (Short)**  
vLLM pioneered PagedAttention for efficient KV cache management and excels at high-throughput batch serving. TGI offers a production-ready HTTP API with built-in features like token streaming, watermarking, and grammar-constrained generation. vLLM generally wins on raw throughput benchmarks; TGI wins on operational maturity and ecosystem integration with Hugging Face.

**Deep Answer**  
- **vLLM**: PagedAttention manages KV cache as pages (like OS virtual memory), near-zero waste. Continuous batching, speculative decoding, tensor parallelism. Strong throughput on batch workloads. OpenAI-compatible API
- **TGI**: Flash Attention, continuous batching, token streaming. Grammar-constrained decoding (JSON mode), watermarking, prompt caching. Tighter Hugging Face Hub integration. Optimized for single-model deployment
- Throughput: vLLM typically 1.2–2x higher throughput on synthetic benchmarks due to PagedAttention efficiency. Gap narrows on real workloads with variable-length sequences
- Latency: comparable for single requests. vLLM's batching strategy can add slight TTFT overhead under high load
- Model support: both support most HF models. vLLM has broader quantization support (AWQ, GPTQ, FP8). TGI has more conservative model compatibility but tends to be more stable
- Operational: TGI has built-in health checks, metrics, and Docker deployment patterns. vLLM requires more custom scaffolding but offers more flexibility
- When to choose vLLM: high-throughput batch inference, many concurrent users, cost optimization at scale, multi-model routing setups
- When to choose TGI: quick single-model deployment, JSON/grammar constraints needed, Hugging Face ecosystem, smaller teams wanting less operational overhead
- Emerging: SGLang, TensorRT-LLM, and Ollama fill different niches (SGLang for structured generation, TensorRT-LLM for maximum NVIDIA optimization)

**Follow-up Questions**  
- How does PagedAttention reduce memory waste compared to pre-allocated KV cache?
- When would you consider TensorRT-LLM over both vLLM and TGI?
- How do you benchmark serving engines fairly across different workload profiles?
- What metrics would you monitor in production to decide whether to switch engines?

**Weak Answer Signals / Red Flags**  
- Only knows one framework with no awareness of alternatives
- Cannot explain PagedAttention at any level
- Evaluates only on "which is faster" without considering operational trade-offs
- Thinks model serving is just `model.generate()` behind an API

**Interviewer Signal**  
Tests practical deployment experience. Candidates who have actually deployed LLMs can discuss specific trade-offs; those who haven't default to benchmark numbers.

**Real-World Insight**  
Many teams start with TGI for speed of deployment, then migrate to vLLM when throughput demands and cost pressure increase. The choice often depends more on team expertise and existing infrastructure than on raw performance numbers.

---

### Q-SSI-B01-004: What is quantization in the context of LLM inference, and what are the practical trade-offs between FP16, INT8, INT4, and FP8?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| Systems, Serving, and Inference   | Quantization   | Applied   | 3   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 2–5, 5–8   | software-foundations-to-ai-engineer, mlops-llmops-platform-engineer, research-applied-research   | Technical deep dive   |

| Prerequisites | Tags |
|---|---|
| Floating point representation basics, model weight storage   | `quantization`, `int8`, `int4`, `fp8`, `gptq`, `awq`, `gguf`, `memory-optimization`   |

**Why This Matters:** Quantization is the primary lever for reducing serving cost and enabling larger models on smaller GPUs. Getting it wrong degrades quality in hard-to-detect ways.

**Question**  
Explain what quantization does to model weights, compare the common formats (FP16, INT8, INT4, FP8), and discuss the quality-cost trade-offs of each. When is aggressive quantization safe, and when is it dangerous?

**Expected Answer (Short)**  
Quantization reduces the precision of model weights (and optionally activations) to use less memory and compute. FP16 is the baseline for most models. INT8 halves memory with minimal quality loss. INT4 quarters memory but can degrade on reasoning-heavy tasks. FP8 (Hopper/Blackwell GPUs) offers near-FP16 quality at half the memory. The key trade-off is memory savings vs accuracy degradation, which varies by task and model.

**Deep Answer**  
- FP16/BF16: standard training and serving precision. BF16 preferred for range; FP16 for precision. Both use 2 bytes per parameter
- INT8: 1 byte per parameter. Techniques like LLM.int8() (bitsandbytes) use mixed precision — most weights in INT8, outlier features in FP16. Minimal quality loss for most tasks
- INT4: 0.5 bytes per parameter. GPTQ (post-training, GPU-optimized), AWQ (activation-aware, preserves important weights), GGUF (CPU-friendly, used by llama.cpp). Noticeable quality degradation on complex reasoning, code generation, and math. Good for chat and simple generation
- FP8 (E4M3/E5M2): 1 byte per parameter but preserves floating-point granularity. Supported natively on H100/H200/B100. Near-FP16 quality, significant throughput improvement. Becoming the preferred production format for new deployments
- Quality assessment: perplexity benchmarks often understate quality loss. Task-specific evaluation (e.g., coding accuracy, multi-step reasoning) reveals true degradation
- When safe: simple chat, classification, summarization, retrieval augmented tasks where context provides grounding
- When dangerous: multi-step reasoning, mathematical computation, code generation, tasks requiring nuanced world knowledge. Also dangerous when quantization is applied uniformly without calibration
- Production pattern: start with FP8 on supported hardware, fall back to INT8 if FP8 unavailable, use INT4 only when GPU memory is the hard constraint

**Follow-up Questions**  
- How does AWQ differ from GPTQ in preserving model quality?
- What is the role of calibration data in post-training quantization?
- How would you evaluate whether quantization degraded quality for your specific use case?
- When would you use FP8 over INT8, and why?

**Weak Answer Signals / Red Flags**  
- Thinks quantization is lossless
- Cannot explain the difference between weight-only and weight+activation quantization
- Uses only perplexity to assess quantization quality
- Unaware of hardware requirements (FP8 needs Hopper+)

**Interviewer Signal**  
Reveals whether the candidate has made real deployment decisions or only read about quantization theoretically.

**Real-World Insight**  
Teams frequently ship INT4 models to save cost, then discover degraded performance on tail queries weeks later. The fix is task-specific evaluation before deployment and monitoring quality metrics in production, not just benchmarks.

---

### Q-SSI-B01-005: What is tensor parallelism vs pipeline parallelism for multi-GPU inference, and when do you use each?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| Systems, Serving, and Inference   | Multi-GPU Inference   | System   | 4   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 5–8, 8–12   | mlops-llmops-platform-engineer, senior-architect-ai-systems-lead, research-applied-research   | System design, Technical deep dive   |

| Prerequisites | Tags |
|---|---|
| GPU architecture basics, model parallelism concepts   | `tensor-parallelism`, `pipeline-parallelism`, `multi-gpu`, `distributed-inference`, `NVLink`   |

**Why This Matters:** Models above ~13B parameters typically require multi-GPU serving. Choosing the wrong parallelism strategy wastes hardware or creates latency bottlenecks.

**Question**  
Explain tensor parallelism and pipeline parallelism for LLM inference. How does each work, what are their communication patterns, and when would you prefer one over the other?

**Expected Answer (Short)**  
Tensor parallelism (TP) splits individual layers across GPUs — each GPU computes part of every layer, requiring all-reduce communication at each layer. Pipeline parallelism (PP) assigns whole layer groups to different GPUs — each GPU computes its chunk sequentially, with point-to-point communication between stages. TP needs fast interconnect (NVLink) and reduces per-request latency. PP works across nodes but adds pipeline bubble overhead.

**Deep Answer**  
- **Tensor Parallelism**: splits weight matrices across GPUs. For a linear layer W of shape (H, H), with TP=2, each GPU holds (H, H/2). After each layer, GPUs synchronize via all-reduce. Communication is frequent (every layer) but small. Ideal within a single node with NVLink (600 GB/s+)
- **Pipeline Parallelism**: assigns layers 0-39 to GPU0, 40-79 to GPU1. Only one GPU active at a time for a single request. Communication is point-to-point between stages (activation transfer). Less communication but pipeline bubble: GPUs sit idle waiting for their stage
- For serving (not training), micro-batching to fill the pipeline is harder because requests arrive individually
- TP latency: each GPU does less work per layer, so latency decreases linearly with TP degree (ideal case). Limited by all-reduce overhead and requires all GPUs on same node
- PP latency: sum of all stages. Each stage adds sequential delay. Better suited for throughput with many concurrent requests than for single-request latency
- Combined: many deployments use TP within a node and PP across nodes. Example: 4-node serve of a 70B model with TP=4 intra-node, PP=4 across nodes
- Expert parallelism: MoE models add another dimension — route different experts to different GPUs
- Decision factors: interconnect speed (NVLink → TP, ethernet → PP), model size vs GPU memory, latency SLO vs throughput target

**Follow-up Questions**  
- What is the pipeline bubble, and how does micro-batching help reduce it?
- Why does tensor parallelism require NVLink or equivalent high-bandwidth interconnect?
- How would you shard a 70B model across 8 GPUs within one node?
- What changes when serving a Mixture-of-Experts model?

**Weak Answer Signals / Red Flags**  
- Confuses parallelism strategies for training vs inference
- Cannot explain the communication pattern of either approach
- Ignores interconnect bandwidth as a decision factor
- Thinks more GPUs always means lower latency

**Interviewer Signal**  
Tests systems-level thinking about model deployment at scale. Strong candidates connect parallelism strategy to hardware topology and SLO requirements.

**Real-World Insight**  
Most production 70B+ deployments use TP=8 within a single DGX node. Cross-node PP is used when a single node can't hold the model, but teams often prefer smaller (quantized) models that fit in one node to avoid cross-node latency. The cost of an extra node is often higher than the quality loss from quantization.

---

### Q-SSI-B01-006: You deploy an LLM endpoint and observe that P99 latency is 5x worse than P50. What are the likely causes and how do you diagnose them?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| Systems, Serving, and Inference   | Latency Debugging   | Debugging   | 4   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 5–8, 8–12   | mlops-llmops-platform-engineer, devops-sre-to-aiops, llm-rag-agent-engineer   | Debugging, Technical deep dive   |

| Prerequisites | Tags |
|---|---|
| LLM serving basics, percentile metrics   | `latency`, `p99`, `debugging`, `serving`, `tail-latency`, `slo`   |

**Why This Matters:** P99 tail latency is the single most common production complaint in LLM serving. Diagnosing it requires understanding the full request lifecycle, not just model inference.

**Question**  
Your production LLM endpoint shows P50 latency of 400ms but P99 of 2000ms. Walk through the systematic debugging process. What are the most likely root causes, and how would you test each hypothesis?

**Expected Answer (Short)**  
The 5x gap between P50 and P99 suggests variable request characteristics, batching effects, or resource contention. Key suspects: long input/output sequences hitting KV cache limits, queue waiting time under load, garbage collection pauses, GPU memory pressure causing preemption, or uneven batch composition. Diagnose by correlating latency with input length, queue depth, batch size, and GPU utilization at the per-request level.

**Deep Answer**  
- **Input/output length variance**: a 50-token prompt returns fast, a 4000-token prompt is inherently slower. If P99 correlates with input length, the distribution of request sizes is the cause, not a bug
- **Queue wait time**: under high load, requests wait for batch slots. Continuous batching helps but doesn't eliminate queuing. Log request arrival time vs inference start time
- **KV cache preemption**: vLLM can preempt (evict and recompute) requests when KV cache memory is exhausted. Preempted requests restart, dramatically increasing their latency
- **Batch composition**: a batch with one very long sequence slows all others in the batch (the longest sequence dictates computation per step)
- **GPU memory pressure**: near-capacity GPU causes allocation delays. Monitor `nvidia-smi` memory utilization over time, not just snapshots
- **Python GC pauses**: garbage collection in the serving framework can cause intermittent spikes. Some teams disable GC and manage memory manually
- **Network I/O**: tokenization, detokenization, and result serialization add variable overhead. Large outputs take longer to stream
- **Diagnostic approach**: 
  1. Log per-request metadata: input tokens, output tokens, queue time, inference time, total time
  2. Scatter plot latency vs input+output length — if it's linear, the problem is request distribution
  3. Check queue depth time series — spikes indicate capacity limits
  4. Monitor GPU memory utilization — sustained >90% suggests preemption risk
  5. Profile with torch.profiler or nsys for GPU-side bottlenecks

**Follow-up Questions**  
- How would you set up SLOs that account for variable input lengths?
- What is KV cache preemption in vLLM, and how do you detect it?
- How would you distinguish between queuing delay and inference delay in your metrics?
- What mitigations would you deploy to reduce P99 without over-provisioning?

**Weak Answer Signals / Red Flags**  
- Immediately blames "GPU is slow" without systematic analysis
- Doesn't consider input length as a variable
- Unaware of batching effects on tail latency
- Suggests "just add more GPUs" without diagnosing root cause

**Interviewer Signal**  
Reveals whether the candidate can debug production systems methodically rather than guessing. Strong indicator of operational experience.

**Real-World Insight**  
In most real deployments, P99 latency is dominated by long-tail request sizes (10% of requests are 10x longer than median) and by KV cache pressure. The most effective mitigation is often input length bucketing + separate deployment tiers for short vs long requests.

---

### Q-SSI-B01-007: What is speculative decoding, and how does it improve inference throughput without changing model quality?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| Systems, Serving, and Inference   | Inference Optimization   | Applied   | 3   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 2–5, 5–8   | research-applied-research, mlops-llmops-platform-engineer, llm-rag-agent-engineer   | Technical deep dive   |

| Prerequisites | Tags |
|---|---|
| Autoregressive generation basics   | `speculative-decoding`, `draft-model`, `inference-optimization`, `throughput`   |

**Why This Matters:** Speculative decoding is one of the few techniques that accelerates inference without quality loss. Understanding it reveals knowledge of the memory-bound nature of autoregressive generation.

**Question**  
Explain how speculative decoding works. Why can a smaller draft model speed up a larger target model's generation, and under what conditions does this approach help or fail?

**Expected Answer (Short)**  
A small draft model generates K candidate tokens cheaply. The large target model then verifies all K tokens in a single forward pass (parallel verification). Accepted tokens are kept; the first rejected token triggers a fallback. Since LLM inference is memory-bandwidth-bound (not compute-bound) for single requests, verifying K tokens costs nearly the same as generating 1. Net effect: multiple tokens per forward pass of the large model.

**Deep Answer**  
- Autoregressive LLM inference is memory-bandwidth-bound: each step loads all model weights from GPU memory to generate one token. The GPU compute units are underutilized
- Verification of K tokens: the target model runs a single forward pass with K draft tokens. Each position's output distribution is compared to the draft model's choice. If the target model agrees, the token is accepted. First disagreement triggers resampling from the corrected distribution
- Quality guarantee: the output distribution is mathematically identical to running the target model alone. Speculative decoding is lossless
- Speedup depends on: draft model acceptance rate (how often the small model's guess matches the large model), K (number of speculative tokens), and the ratio of draft model cost to verification overhead
- Works well when: the draft model is a good approximator (same family, distilled version), the text is predictable (common language, structured output), K is tuned (typically 3–8)
- Works poorly when: the text is highly creative or unpredictable, the draft model diverges significantly from the target, or verification overhead dominates
- Variants: self-speculative decoding (uses early exit from the same model), Medusa (adds extra prediction heads), EAGLE (feature-level speculation)
- Production: vLLM and TGI both support speculative decoding. Typical speedup: 1.5–3x on common workloads

**Follow-up Questions**  
- Why is autoregressive LLM inference memory-bandwidth-bound rather than compute-bound?
- How do you choose or train the draft model?
- What happens to the speedup when the acceptance rate drops below 50%?
- Compare Medusa heads vs separate draft model approaches

**Weak Answer Signals / Red Flags**  
- Thinks speculative decoding changes the output distribution
- Cannot explain why verification of K tokens costs roughly the same as generating 1
- Confuses speculative decoding with beam search or sampling strategies
- Unaware that it's a lossless optimization

**Interviewer Signal**  
Tests understanding of the memory-bandwidth bottleneck in inference — the fundamental insight behind most modern serving optimizations.

**Real-World Insight**  
Teams serving code completion endpoints see the highest speculative decoding speedups (3x+) because code is highly predictable. Open-ended creative writing sees the least benefit. Choosing whether to enable speculative decoding should be workload-dependent, not a blanket decision.

---

### Q-SSI-B01-008: How does continuous batching work in modern LLM serving engines, and why is it superior to static batching?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| Systems, Serving, and Inference   | Batching Strategies   | Applied   | 3   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 2–5, 5–8   | mlops-llmops-platform-engineer, software-foundations-to-ai-engineer, devops-sre-to-aiops   | Technical deep dive   |

| Prerequisites | Tags |
|---|---|
| Batching, autoregressive generation   | `continuous-batching`, `static-batching`, `serving`, `gpu-utilization`   |

**Why This Matters:** Continuous batching is the single biggest throughput improvement in LLM serving. It's the default in vLLM/TGI, but understanding why it works reveals deeper systems knowledge.

**Question**  
Explain static batching vs continuous (dynamic) batching for LLM inference. Why does static batching waste GPU resources, and how does continuous batching solve this?

**Expected Answer (Short)**  
Static batching groups N requests, processes them until all finish, then takes the next group. Short requests waste GPU cycles waiting for the longest request. Continuous batching allows new requests to join and finished requests to exit mid-generation, keeping the GPU busy at all times.

**Deep Answer**  
- Static batching: all requests start together, all must finish before the batch completes. If one request generates 500 tokens and another generates 20, the GPU idles on the finished request for 480 generation steps
- GPU utilization in static batching: often 30–50% because of padding and stragglers
- Continuous batching (iteration-level scheduling): after each generation step, the scheduler checks if any request has finished (hit EOS or max tokens). Finished requests are ejected, and waiting requests are inserted
- New requests get their prefill computed and immediately join the generation batch
- Result: GPU batch remains near capacity at all times. Throughput improves 2–5x over static batching for realistic workload distributions
- Challenge: variable KV cache sizes per request require memory management. PagedAttention handles this by allocating KV cache in non-contiguous pages
- Prefill vs decode: prefill (processing the prompt) is compute-bound; decode (generating tokens) is memory-bound. Some engines separate these phases to avoid prefill stalls during decode
- Implementation: vLLM, TGI, SGLang all implement continuous batching. The scheduler is the most performance-critical component

**Follow-up Questions**  
- How does the scheduler decide which waiting request to admit next?
- What happens during prefill of a new request — does it slow down ongoing decode?
- How does PagedAttention interact with continuous batching?
- What is chunked prefill, and when is it useful?

**Weak Answer Signals / Red Flags**  
- Thinks static batching is acceptable for production
- Cannot explain the padding waste problem
- Unaware that different requests finish at different times
- Conflates batching with simple parallel processing

**Interviewer Signal**  
Tests understanding of why serving frameworks are engineered the way they are, not just how to use them.

**Real-World Insight**  
Switching from naive static batching to continuous batching in vLLM typically yields 3–5x throughput improvement with zero quality change. Teams running custom serving pipelines without continuous batching are wasting significant GPU spend.

---

### Q-SSI-B01-009: Design an LLM serving architecture that handles 1000 concurrent users with a P95 TTFT SLO of 500ms on a 70B model.

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| Systems, Serving, and Inference   | System Design   | System   | 4   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 5–8, 8–12   | senior-architect-ai-systems-lead, mlops-llmops-platform-engineer, devops-sre-to-aiops   | System design   |

| Prerequisites | Tags |
|---|---|
| LLM serving, multi-GPU deployment, load balancing   | `system-design`, `serving-architecture`, `scaling`, `load-balancing`, `slo`   |

**Why This Matters:** Designing an LLM serving stack from scratch is a core system design question in AI infra interviews. It tests the intersection of ML knowledge and distributed systems.

**Question**  
Design an architecture for serving a 70B parameter LLM to 1000 concurrent users with a P95 time-to-first-token (TTFT) SLO of 500ms. Cover hardware selection, model sharding, batching strategy, load balancing, and autoscaling.

**Expected Answer (Short)**  
Use 8×H100 nodes with tensor parallelism (TP=8) to fit the model. Run vLLM with continuous batching and PagedAttention. Deploy multiple replicas behind a request-aware load balancer that routes by estimated input length. Autoscale based on queue depth and P95 TTFT metrics. Target ~30–50 concurrent requests per replica based on benchmarking.

**Deep Answer**  
- **Hardware**: 70B FP16 needs ~140 GB. Single H100 (80 GB) insufficient. Use 2×H100 (TP=2) for FP16, or 1×H100 with INT8 quantization. For lowest latency, TP=4 or TP=8 within a DGX node
- **Model sharding**: TP=8 on a single DGX H100 node. All layers split across 8 GPUs with NVLink communication. Fastest option for latency. Alternative: FP8 quantization on 2×H100 with TP=2 for cost efficiency
- **Serving engine**: vLLM with continuous batching. Configure max_num_seqs (max batch), max_model_len (context limit). Enable prefix caching if prompt patterns are repetitive
- **Capacity per replica**: benchmark to find max concurrent requests while meeting TTFT < 500ms. Typically 30–60 for a 70B model depending on input length distribution. At 50 concurrent/replica, need ~20 replicas for 1000 users
- **Load balancing**: least-connections routing with health checks. Optionally route by estimated input length (short prompts to one pool, long to another) to reduce batch variance
- **Queue management**: bounded queue per replica with backpressure (HTTP 429). Monitor queue depth as autoscaling signal
- **Autoscaling**: scale on queue_depth > threshold and P95_TTFT > 450ms. Scale-down on queue_depth = 0 for sustained period. Keep minimum replica count for cold-start avoidance
- **Monitoring**: per-request TTFT, ITL, queue time, GPU utilization, KV cache utilization, request rate, error rate
- **Failover**: health check on /health endpoint. Remove unhealthy replicas from LB pool. GPU error detection and automatic pod restart

**Follow-up Questions**  
- How would the design change if cost were the primary constraint instead of latency?
- How would you handle a sudden 5x spike in traffic?
- What changes if the 70B model uses MoE architecture?
- How would you implement A/B testing between model versions in this architecture?

**Weak Answer Signals / Red Flags**  
- Cannot estimate GPU memory requirements for a 70B model
- Designs for static batching
- Ignores queue management and backpressure
- No consideration of autoscaling or failure handling

**Interviewer Signal**  
Tests end-to-end system design capability — the full stack from GPU hardware through to user-facing SLOs.

**Real-World Insight**  
Most teams over-provision initially and optimize later. The key optimization lever is usually not hardware but workload characterization: understanding your input length distribution, peak-to-trough traffic ratio, and acceptable degradation modes.

---

### Q-SSI-B01-010: What is prefix caching, and how does it reduce cost for LLM applications with repetitive system prompts?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| Systems, Serving, and Inference   | Inference Optimization   | Applied   | 3   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 2–5, 5–8   | llm-rag-agent-engineer, mlops-llmops-platform-engineer, software-foundations-to-ai-engineer   | Technical deep dive   |

| Prerequisites | Tags |
|---|---|
| KV cache, prompt structure   | `prefix-caching`, `kv-cache`, `system-prompt`, `cost-optimization`, `serving`   |

**Why This Matters:** Most production LLM applications share the same system prompt across thousands of requests. Without prefix caching, the same KV cache computation is repeated for every request — pure waste.

**Question**  
Explain prefix caching (also called prompt caching) in LLM serving. How does it work, what are the memory trade-offs, and when does it provide the most benefit?

**Expected Answer (Short)**  
Prefix caching stores the KV cache for common prompt prefixes (e.g., system prompts) so they don't need to be recomputed for each request. When multiple requests share the same prefix, the cached KV is reused, reducing TTFT and GPU compute. The trade-off is additional memory for storing cached KV states, which competes with batch size.

**Deep Answer**  
- In a typical RAG or chat application, the system prompt (500–2000 tokens) is identical across all requests. Without caching, each request recomputes the KV cache for those tokens from scratch
- Prefix caching: after computing KV for a prefix, store it in GPU memory keyed by the token hash. Subsequent requests with the same prefix skip prefill for cached tokens and only process the unique suffix
- Savings: if system prompt is 1000 tokens and user query is 200 tokens, prefix caching skips 83% of prefill compute. For 10,000 requests/hour, this saves massive GPU-seconds
- Memory trade-off: cached KV states consume GPU memory. A 1000-token prefix for a 70B model with GQA might use ~50 MB. Caching 10 different prefixes: 500 MB. This memory is unavailable for batch concurrency
- Cache management: LRU eviction for least-used prefixes. Radix tree structures (SGLang) enable partial prefix matching — if two prompts share 80% of their prefix, 80% is cached
- Limitations: only works for exact prefix matches (token-level). Slight changes to the system prompt invalidate the cache. Order matters — same tokens in different positions are different prefixes
- Production pattern: standardize system prompts, version them carefully, and monitor cache hit rates. Anthropic's and OpenAI's prompt caching features work on this same principle
- When most beneficial: high-volume endpoints with consistent system prompts, RAG applications with shared context templates, multi-turn chat with long conversation histories

**Follow-up Questions**  
- How does radix attention (SGLang) extend basic prefix caching?
- What happens to your cache hit rate when system prompts are slightly different per user?
- How would you design a prompt template strategy to maximize prefix cache hits?
- What is the memory cost of caching multiple different prefixes?

**Weak Answer Signals / Red Flags**  
- Unaware that system prompts are redundantly processed
- Thinks caching is only about response caching (HTTP-level)
- Cannot estimate the compute savings
- Doesn't consider memory trade-offs

**Interviewer Signal**  
Tests whether the candidate thinks about serving economics, not just correctness. Strong candidates immediately connect prefix caching to cost reduction.

**Real-World Insight**  
Teams using OpenAI's API with prompt caching see 50–80% cost reduction on repetitive workloads. Self-hosted teams running vLLM or SGLang should enable prefix caching as a default — it's nearly always beneficial.

---

### Q-SSI-B01-011: Your model serves fine for single requests but OOMs when batch size increases. Walk through the diagnosis.

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| Systems, Serving, and Inference   | GPU Memory Debugging   | Debugging   | 4   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 5–8, 8–12   | mlops-llmops-platform-engineer, devops-sre-to-aiops, software-foundations-to-ai-engineer   | Debugging   |

| Prerequisites | Tags |
|---|---|
| GPU memory layout, KV cache   | `oom`, `gpu-memory`, `debugging`, `kv-cache`, `batch-size`   |

**Why This Matters:** GPU OOM at scale is the most common failure mode in LLM serving. Systematic debugging separates production engineers from hobbyists.

**Question**  
Your LLM serves correctly with batch_size=1 but crashes with CUDA OOM at batch_size=16. The model weights use 30 GB on a 80 GB H100. Walk through the diagnosis and potential fixes.

**Expected Answer (Short)**  
Model weights (30 GB) leave 50 GB for KV cache, activations, and framework overhead. At batch_size=16, the KV cache alone might consume 40+ GB (depending on sequence length and model config). Add activation memory and CUDA allocator fragmentation, and you exceed 80 GB. Diagnosis: profile per-batch-size memory, calculate KV cache analytically, and check for fragmentation.

**Deep Answer**  
- **Step 1: Inventory GPU memory**:
  - Model weights: 30 GB (known)
  - CUDA context + framework overhead: ~2–4 GB
  - Available for KV cache + activations: ~46–48 GB
- **Step 2: Calculate KV cache per request**:
  - Formula: 2 × num_layers × num_kv_heads × head_dim × max_seq_len × bytes_per_element
  - For a typical model with 40 layers, 8 KV heads, head_dim=128, 4096 seq_len, FP16: 2 × 40 × 8 × 128 × 4096 × 2 = ~2.7 GB per request
  - At batch_size=16: 16 × 2.7 = ~43 GB — close to the limit before fragmentation
- **Step 3: Activation memory**: during prefill, intermediate activations consume additional memory. For batch_size=16 with long prompts, this can add 5–10 GB
- **Step 4: CUDA memory fragmentation**: PyTorch's caching allocator can hold fragmented blocks. `torch.cuda.memory_stats()` shows reserved vs allocated. Fragmentation can waste 10–20% of GPU memory
- **Fixes (in order of preference)**:
  1. Enable PagedAttention (vLLM) — reduces KV cache fragmentation to near zero
  2. Reduce max_seq_len — if requests don't actually need 4096 tokens, set a tighter limit
  3. Quantize KV cache to FP8 or INT8 — halves KV cache memory
  4. Use GQA model variant — fewer KV heads means less KV cache
  5. Reduce batch size to fit — find the empirical maximum
  6. Use tensor parallelism to spread across GPUs
  7. Enable CUDA memory pool settings: `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`
- **Monitoring**: set `gpu_memory_utilization` in vLLM (default 0.9) to reserve headroom

**Follow-up Questions**  
- How would you calculate the theoretical maximum batch size for a given model and GPU?
- What is the difference between `torch.cuda.memory_allocated()` and `torch.cuda.memory_reserved()`?
- How does `PYTORCH_CUDA_ALLOC_CONF` help with fragmentation?
- When would you choose quantized KV cache vs reducing batch size?

**Weak Answer Signals / Red Flags**  
- Cannot identify KV cache as the batch-dependent memory component
- Thinks model weights grow with batch size
- Suggests "just use a bigger GPU" without analysis
- Doesn't know how to profile GPU memory

**Interviewer Signal**  
Tests hands-on debugging capability with GPU memory — essential for anyone operating LLM infrastructure.

**Real-World Insight**  
Most production OOMs are not from model weights (those are fixed) but from KV cache growth under load. Teams that run `nvidia-smi` once and see "20 GB free" forget that those 20 GB evaporate as concurrent requests increase. Proper capacity planning requires per-request memory modeling, not static snapshots.

---

### Q-SSI-B01-012: What are the key differences between running inference on NVIDIA GPUs vs using CPU-based or hybrid inference, and when is each appropriate?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| Systems, Serving, and Inference   | Hardware Selection   | System   | 3   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 2–5, 5–8   | mlops-llmops-platform-engineer, devops-sre-to-aiops, senior-architect-ai-systems-lead   | System design, Technical deep dive   |

| Prerequisites | Tags |
|---|---|
| Basic hardware architecture awareness   | `gpu`, `cpu`, `inference`, `hardware`, `cost-optimization`, `edge`   |

**Why This Matters:** Not every inference workload justifies GPU cost. Knowing when CPU inference is viable (and when it isn't) is a real sizing decision in production deployments.

**Question**  
Compare GPU-based vs CPU-based LLM inference. When is GPU inference necessary, when can CPU work, and what hybrid strategies exist?

**Expected Answer (Short)**  
GPUs provide massive parallelism for matrix operations, making them essential for large models (>7B) at interactive latencies. CPUs can serve smaller models (<3B) or quantized models (INT4) at acceptable latency for non-interactive batch workloads. Hybrid approaches offload embedding or tokenization to CPU while running attention on GPU.

**Deep Answer**  
- GPU inference: 100–1000x faster than CPU for large matrix multiplications. Memory bandwidth (H100: 3.35 TB/s) is critical for autoregressive decoding. Only option for interactive serving of models >7B parameters
- CPU inference: llama.cpp, ONNX Runtime, Intel OpenVINO. Viable for: small models (<3B), batch processing with relaxed latency (seconds, not milliseconds), edge deployments without GPUs, embedding models, classification models
- Quantization on CPU: INT4/INT8 with GGUF format. A 7B INT4 model uses ~3.5 GB RAM and can generate ~10 tokens/sec on modern server CPUs. Acceptable for single-user, non-interactive use cases
- Cost comparison: an H100 costs $2–3/hr on cloud. A 96-core CPU instance costs $3–4/hr. If CPU can serve your workload at acceptable latency, it may be cheaper — but GPU throughput per dollar is usually better for high-volume serving
- Hybrid strategies:
  - Tokenization/detokenization on CPU, inference on GPU (standard pattern)
  - Embedding computation on CPU (small, parallelizable), generation on GPU
  - Pre/post-processing pipelines on CPU, model inference on GPU
  - Offloading: some layers on GPU, overflow layers on CPU RAM (slow but enables models too large for GPU memory)
- Apple Silicon / NPU: M-series MacBooks can run 7B–13B models via Metal backend. Useful for local development, not for production serving
- Decision framework: interactive serving + model >7B → GPU required. Batch processing + relaxed latency + model <7B → CPU may suffice. Embedding/classification inference → CPU often sufficient

**Follow-up Questions**  
- When would you use ONNX Runtime vs llama.cpp for CPU inference?
- How do NPUs (Apple Neural Engine, Intel NPU) change the CPU inference picture?
- What is the break-even point where GPU inference becomes cheaper than CPU per request?
- How would you design a system that falls back to CPU when GPU capacity is exhausted?

**Weak Answer Signals / Red Flags**  
- Claims GPU is always necessary for any ML inference
- Unaware that small models can run on CPU at reasonable speed
- Ignores cost analysis entirely
- Cannot explain what makes GPUs faster (parallelism, bandwidth)

**Interviewer Signal**  
Tests pragmatic system design thinking. Candidates who default to "always use GPU" lack cost-awareness and deployment maturity.

**Real-World Insight**  
Many teams run embedding models on CPU (e.g., sentence-transformers for RAG retrieval) and only use GPUs for generative inference. Some production classifiers and small models run entirely on CPU behind ONNX Runtime, saving significant infrastructure cost.

---

### Q-SSI-B01-013: What is FlashAttention, and why did it fundamentally change transformer inference and training efficiency?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| Systems, Serving, and Inference   | Kernel-Level Optimization   | Concept   | 3   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 2–5, 5–8   | research-applied-research, software-foundations-to-ai-engineer, mlops-llmops-platform-engineer   | Technical deep dive   |

| Prerequisites | Tags |
|---|---|
| Attention mechanism, GPU memory hierarchy   | `flash-attention`, `io-aware`, `sram`, `tiling`, `memory-hierarchy`   |

**Why This Matters:** FlashAttention is the enabling kernel behind efficient long-context models. Understanding it reveals knowledge of the GPU memory hierarchy that underlies all modern serving optimizations.

**Question**  
Explain why standard attention is memory-inefficient on GPUs, what FlashAttention does differently, and why it achieves both faster speed and lower memory usage.

**Expected Answer (Short)**  
Standard attention materializes the full N×N attention matrix in GPU HBM (high-bandwidth memory), which is O(N²) memory and requires slow HBM reads/writes. FlashAttention uses tiling to compute attention in blocks that fit in SRAM (on-chip cache), never materializing the full matrix. This reduces HBM reads/writes from O(N²) to O(N), achieving 2–4x speedup and enabling longer contexts.

**Deep Answer**  
- Standard attention: compute Q×K^T (N×N matrix), apply softmax, multiply by V. The N×N matrix must be stored in HBM. For N=128K, this matrix is 128K × 128K × 2 bytes = 32 GB — impossible
- GPU memory hierarchy: SRAM (on-chip, ~20 MB, 19 TB/s) ≫ HBM (off-chip, 80 GB, 3.35 TB/s). SRAM is 5–6x faster but tiny
- FlashAttention insight: attention is IO-bound, not compute-bound. The bottleneck is moving data between SRAM and HBM, not the actual FLOPs
- Tiling: divide Q, K, V into blocks that fit in SRAM. Compute partial attention scores per block, maintain running softmax statistics, accumulate output. Never write the N×N matrix to HBM
- Online softmax: the key algorithmic trick. Standard softmax needs the full row to compute the normalization constant. FlashAttention uses the online softmax algorithm to update the running max and sum incrementally per tile
- Memory: O(N) instead of O(N²) — only the output and softmax statistics are stored in HBM
- Speed: 2–4x faster than standard attention by reducing HBM IO. Even faster relative speedup at long sequences
- FlashAttention-2: further optimized tile scheduling, parallelism across sequence length, reduced synchronization. 2x faster than FA1
- FlashAttention-3: Hopper-specific optimizations using TMA (Tensor Memory Accelerator) and warp specialization
- Impact: enabled 128K+ context models, reduced training cost, made continuous batching more efficient

**Follow-up Questions**  
- What is the online softmax trick, and why is it necessary for tiled attention?
- Why doesn't FlashAttention reduce FLOPs but still speeds up computation?
- How does FlashAttention interact with GQA (Grouped Query Attention)?
- What are the limitations of FlashAttention (e.g., custom attention patterns)?

**Weak Answer Signals / Red Flags**  
- Thinks FlashAttention is just "faster attention" without explaining the mechanism
- Cannot explain the GPU memory hierarchy (SRAM vs HBM)
- Confuses IO-bound with compute-bound
- Believes FlashAttention reduces computation rather than memory access

**Interviewer Signal**  
Tests understanding of hardware-aware algorithm design — the intersection of ML and systems that defines senior ML engineering.

**Real-World Insight**  
Before FlashAttention, training on sequences beyond 2–4K tokens was impractical for most teams. FA made 32K–128K context windows feasible, directly enabling modern RAG systems, long-document understanding, and code assistants that can read entire files.

---

### Q-SSI-B01-014: How do you decide between serving a model via a dedicated inference endpoint vs an API gateway calling a third-party provider?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| Systems, Serving, and Inference   | Build vs Buy   | Architect   | 4   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 5–8, 8–12, 12–20   | senior-architect-ai-systems-lead, mlops-llmops-platform-engineer, devops-sre-to-aiops   | System design, Behavioral   |

| Prerequisites | Tags |
|---|---|
| LLM serving experience, cloud cost modeling   | `build-vs-buy`, `api-provider`, `self-hosted`, `cost`, `governance`, `architecture`   |

**Why This Matters:** The self-host vs API decision is the highest-leverage architectural choice for LLM-powered products. Getting it wrong wastes millions or blocks product velocity.

**Question**  
Your company needs LLM inference for a production product. Outline the decision framework for self-hosting an open model vs using a third-party API (OpenAI, Anthropic, etc.). Cover cost, latency, quality, privacy, and operational concerns.

**Expected Answer (Short)**  
API providers offer faster time-to-market, no infrastructure burden, and access to frontier models. Self-hosting offers data privacy, lower cost at scale, customization, and no vendor dependency. The decision depends on volume (>1M tokens/day favors self-hosting), latency requirements (self-hosted avoids network hops), privacy constraints (regulated industries need self-hosting), and team capability (self-hosting requires ML infra expertise).

**Deep Answer**  
- **Cost crossover**: at low volume (<100K tokens/day), API is cheaper than maintaining GPU infrastructure. At high volume (>1M tokens/day), self-hosting with quantized open models can be 5–10x cheaper per token
- **Quality**: frontier models (GPT-4, Claude Opus) still lead on complex reasoning. Open models (Llama 3, Mistral, Qwen) are competitive for most production tasks (classification, RAG, structured extraction)
- **Latency**: API adds network round-trip (50–200ms). Self-hosted eliminates this but introduces operational latency (cold starts, scaling). For streaming chat, difference is negligible. For batch processing or agents making many LLM calls, network overhead compounds
- **Privacy/governance**: regulated industries (healthcare, finance, defense) may require on-premises inference. Even without regulation, sending customer data to third-party APIs has compliance and reputational risk
- **Customization**: self-hosting enables fine-tuning, custom tokenizers, embedding modifications. API providers offer limited fine-tuning with less control
- **Operational cost**: self-hosting requires GPU orchestration, monitoring, model updates, failover, scaling. A small team may spend more engineering hours on infra than on product
- **Hybrid strategy**: use API for development and prototyping, self-host for production at scale. Use API as fallback when self-hosted capacity is exceeded
- **Vendor risk**: API providers change pricing, deprecate models, modify policies. Self-hosted models are stable. But self-hosted models require manual updates for improvements
- **Decision checklist**: 
  1. Is data privacy a hard constraint? → Self-host
  2. Is volume >1M tokens/day? → Evaluate self-hosting cost
  3. Does the team have ML infra capability? → If not, API first
  4. Is task quality achievable with open models? → Test before committing
  5. Is latency measured in hundreds of calls per user action? → Self-host to avoid network overhead

**Follow-up Questions**  
- How would you model the total cost of self-hosting including engineering time?
- What is the fallback strategy if your API provider has an outage?
- How do you handle model version transitions when self-hosting?
- When would a hybrid approach (API + self-hosted) make sense?

**Weak Answer Signals / Red Flags**  
- Dogmatically favors one approach without considering trade-offs
- Ignores operational cost of self-hosting
- Doesn't mention data privacy or governance
- Cannot estimate cost crossover points

**Interviewer Signal**  
Architect-level question that tests strategic technical decision-making, not just implementation skill.

**Real-World Insight**  
Many startups begin with OpenAI API, hit cost pressure at scale, then migrate to self-hosted Llama/Mistral. The migration often takes 3–6 months. Planning for this from the start (abstracting the LLM layer behind an interface) saves enormous refactoring cost later.

---

### Q-SSI-B01-015: What are the operational differences between serving a dense model vs a Mixture-of-Experts (MoE) model in production?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| Systems, Serving, and Inference   | MoE Serving   | System   | 4   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 5–8, 8–12   | mlops-llmops-platform-engineer, senior-architect-ai-systems-lead, research-applied-research   | System design, Technical deep dive   |

| Prerequisites | Tags |
|---|---|
| MoE architecture basics, GPU serving   | `moe`, `mixture-of-experts`, `serving`, `routing`, `expert-parallelism`, `memory`   |

**Why This Matters:** MoE models (Mixtral, DBRX, GPT-4 rumored MoE) are increasingly common in production. Their serving characteristics differ fundamentally from dense models, and naive deployment wastes memory and compute.

**Question**  
Compare serving a dense model vs a Mixture-of-Experts model in production. What are the key differences in memory footprint, compute patterns, batching behavior, and operational challenges?

**Expected Answer (Short)**  
MoE models have large total parameter counts but only activate a subset (e.g., 2 of 8 experts) per token. Total memory is higher than dense models of similar quality, but per-token compute is similar to a smaller dense model. Serving challenges include load imbalance across experts, memory for all experts even when inactive, and batch routing that creates irregular computation patterns.

**Deep Answer**  
- **Memory**: Mixtral 8x7B has ~47B total parameters but activates ~13B per token. Memory must hold all 47B (serving needs all experts loaded), even though compute is 13B-equivalent per token. This makes MoE models memory-heavy relative to their computational cost
- **Compute**: per-token FLOPs are similar to a ~13B dense model, so generation speed per token is comparable. But memory bandwidth for loading expert weights can bottleneck throughput
- **Batching challenge**: different tokens in a batch route to different experts. If batch has 32 tokens, each expert might handle 0–16 tokens (uneven). GPUs process the most-loaded expert last, leaving others idle — load imbalance
- **Expert parallelism**: distribute different experts across different GPUs. Requires all-to-all communication to route tokens to correct GPUs. Communication overhead can dominate for small batch sizes
- **Quantization**: MoE models benefit more from quantization because memory (not compute) is the bottleneck. INT4 quantization of Mixtral 8x7B: ~25 GB, fitting on a single GPU
- **KV cache**: MoE models typically have standard attention (not MoE in attention), so KV cache behavior is the same as dense models of equal layer/head configuration
- **Routing stability**: in inference, router decisions are deterministic (top-k experts per token). No load-balancing loss needed (that's training only). But some expert combinations may be slower due to memory access patterns
- **Practical considerations**:
  - Cold experts: if few tokens route to an expert, its weights may be evicted from GPU cache. Expert "popularity" varies by domain and prompt
  - Capacity planning: must provision for worst-case routing, not average
  - vLLM and TGI support MoE serving with expert parallelism

**Follow-up Questions**  
- How does expert parallelism differ from tensor parallelism?
- Why is memory bandwidth more of a bottleneck for MoE than dense models?
- How would you benchmark whether a MoE model is cost-effective vs an equivalently performing dense model?
- What happens if expert routing becomes imbalanced in production?

**Weak Answer Signals / Red Flags**  
- Thinks MoE models use less memory because they activate fewer parameters
- Cannot explain routing or expert selection
- Treats MoE serving identically to dense model serving
- Unaware of expert parallelism as a deployment strategy

**Interviewer Signal**  
Tests awareness of emerging model architectures and their operational implications — important for anyone making infrastructure decisions.

**Real-World Insight**  
Mixtral 8x7B became popular precisely because it achieves Llama 70B-level quality at ~13B compute cost per token. But teams often underestimate the memory requirement (47B parameters all loaded). The "best of both worlds" narrative only holds when memory is properly provisioned and expert parallelism is implemented.
