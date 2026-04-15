# Systems, Serving, and Inference

Topic family J · Prerequisites: Model internals, CUDA/memory intuition · Unlocks: Production deployment, operational debugging, cost optimization

This module covers how models actually run in production. It is where many strong model candidates get exposed: they can discuss training and prompting, but not throughput, memory, routing, or serving constraints.

---

## Scope

- PyTorch and Lightning in production
- CUDA and GPU fundamentals
- Kernels and memory management
- Throughput and latency
- Batching strategies
- Quantization
- Inference optimization
- vLLM and TGI
- Model serving trade-offs
- Deployment patterns
- Model routing and fallback
- Multi-tenancy
- Cost optimization

## Why This Module Matters

A model that is correct but unaffordable, unstable, or slow is not production-ready. Serving interviews increasingly test whether candidates understand GPU-level constraints and can make real deployment trade-offs.

---

## Subtopic Breakdown

### GPU and CUDA Fundamentals
- GPU architecture: SMs, warps, threads — why GPU parallelism is different from CPU
- CUDA memory hierarchy: global, shared, registers — what bottlenecks where
- Memory bandwidth vs compute: most LLM inference is memory-bandwidth bound
- GPU utilization: MFU (Model FLOPs Utilization) and why high utilization is hard
- Multi-GPU: NVLink, PCIe, when communication overhead dominates

### Memory Management
- Model weights: how much memory a model consumes (parameter count × bytes per parameter)
- Activation memory: intermediate tensors during forward pass
- KV cache memory: the dominant memory consumer in LLM serving
- Optimizer state: Adam stores 2 additional tensors per parameter (training only)
- OOM diagnosis: where memory goes and how to identify the biggest consumer
- **Rule of thumb:** A 7B parameter model in FP16 needs ~14GB for weights alone, before KV cache

### Throughput and Latency
- Throughput: tokens per second across all requests — measures system capacity
- Latency: time to first token (TTFT) and time per output token (TPOT) — measures user experience
- The trade-off: batching improves throughput but can increase latency per request
- Tail latency: P99 latency matters more than average in production
- SLO design: defining acceptable latency at a given throughput level

### Batching Strategies
- Static batching: fixed batch, wait until full — simple but wastes time
- Dynamic batching: group requests as they arrive, configurable wait time
- Continuous batching: insert new requests as others finish — core innovation of vLLM
- Why continuous batching matters: requests have different output lengths, static batching wastes capacity
- Padding waste: in static batching, shorter sequences are padded to the longest — wasted compute

### Quantization
- What quantization does: reduce precision of weights (and/or activations) to save memory and increase speed
- INT8, INT4, FP8: precision levels and their quality/speed trade-offs
- GPTQ: post-training quantization using calibration data
- AWQ: activation-aware quantization, preserves important weights
- GGUF: quantization format for local/CPU inference (llama.cpp ecosystem)
- BitsAndBytes: runtime quantization in PyTorch, easy but less optimized
- **Critical insight:** Quantization is not free — quality degrades, especially at INT4, especially for reasoning tasks
- When quantization helps most: deploying larger models on limited hardware
- When quantization hurts: tasks requiring high accuracy, especially math and code

### Inference Optimization
- Flash Attention: IO-aware attention, reduces memory and increases speed
- Speculative decoding: draft model generates, target model verifies in parallel
- PagedAttention: KV cache management like virtual memory pages
- Prefix caching: reuse KV cache for shared prompt prefixes across requests
- Tensor parallelism: split model layers across GPUs for single-request latency reduction
- Pipeline parallelism: split model stages across GPUs for throughput

### vLLM and TGI
- **vLLM:** PagedAttention, continuous batching, high throughput, open-source reference serving stack
- **TGI (Text Generation Inference):** Hugging Face serving stack, good integration, production-ready
- Trade-offs: vLLM often higher throughput; TGI better Hugging Face ecosystem integration
- **Interview focus:** Can you explain WHY vLLM is faster (PagedAttention, continuous batching), not just THAT it is?
- Other stacks: SGLang (structured generation), Triton Inference Server (NVIDIA), TensorRT-LLM (NVIDIA optimized)

### Model Routing and Fallback
- Multi-model serving: different models for different task complexity or cost tier
- Router design: classify request and route to appropriate model (small/fast vs large/accurate)
- Fallback: if primary model fails or exceeds latency, fall back to simpler model
- A/B testing and canary deployments for model rollouts
- **Cost optimization:** Routing 80% of simple requests to a small model can save 60–80% of compute cost

### Multi-Tenancy
- Shared infrastructure serving multiple teams, products, or customers
- Isolation: ensuring one tenant's traffic doesn't degrade another's performance
- Priority queues: business-critical requests get priority
- Rate limiting: preventing individual tenants from consuming all capacity
- Cost attribution: tracking GPU-hours and token usage per tenant

### Deployment Patterns
- Model-as-a-service: managed API (OpenAI, Anthropic, cloud provider endpoints)
- Self-hosted serving: full control, higher operational burden
- Hybrid: some workloads self-hosted, some via API
- Edge deployment: on-device inference for latency-sensitive or privacy-sensitive use cases
- **Decision framework:** Cost, latency, privacy, control, operational capability

---

## What Interviewers Test by Band

### 0–2 years
- Understands what GPU memory is and why models need it
- Knows basic serving concepts: throughput, latency, batching
- Can explain what quantization does at a high level

### 2–5 years
- Can reason about KV cache memory, batch scheduling, and quantization trade-offs
- Knows vLLM or TGI at a working level, not just the name
- Understands throughput vs latency trade-offs

### 5–8 years
- Can design a serving stack with routing, fallback, and cost optimization
- Can diagnose performance bottlenecks: memory-bound vs compute-bound vs communication-bound
- Understands multi-tenancy and isolation requirements

### 8+ years
- Can define serving platform strategy for an organization
- Can make build-vs-buy decisions for serving infrastructure
- Can reason about serving economics at scale: cost per million tokens, GPU ROI, capacity planning

---

## Depth Ladder

| Level | What Good Looks Like | What Answers Should NOT Be |
|---|---|---|
| Concept | Understands why serving is hard and what constrains it | "Just deploy the model" without discussing constraints |
| Applied | Can choose and configure a serving stack for a specific workload | Naming vLLM without explaining what it does differently |
| System | Can design serving infrastructure with routing, fallback, and cost controls | Optimizing for one metric (throughput) while ignoring others (latency, cost) |
| Debugging | Can diagnose serving latency spikes, OOM errors, and throughput degradation | "Restart the server" without identifying the root cause |
| Architect | Can define serving strategy for a multi-model, multi-tenant platform | Recommending one serving stack for all use cases |

---

## Anti-Patterns and Weak Answers

- Saying quantization is free
- Discussing vLLM or TGI only as tool names without scheduler or cache implications
- Treating GPU utilization as the only optimization target
- Ignoring tail latency, multi-tenancy, or batch heterogeneity
- Not accounting for KV cache when estimating GPU memory requirements
- Treating model routing as a simple load-balancer problem (it requires task understanding)
- Ignoring the operational cost of self-hosting (monitoring, updates, on-call, GPU procurement)

---

## Role Relevance

| Role | Depth Needed | Focus Areas |
|---|---|---|
| Platform AI | ★★★ | Full serving infrastructure, routing, multi-tenancy, cost |
| DevOps → AIOps | ★★★ | Deployment, monitoring, capacity, incident response |
| Senior / Architect | ★★★ | Strategy, economics, build vs buy, platform design |
| LLM / RAG / Agent | ★★★ | Serving integration, latency budget, cost awareness |
| Data / ML | ★★ | Deployment awareness, inference characteristics |
| Research | ★★ | Inference optimization, serving consequences of architecture choices |
| Software → AI | ★★ | Deployment integration, serving API design |
| DL / CV | ★★ | Model-specific serving (CV inference, batch optimizations) |

---

## What To Study Next

- [MLOps / LLMOps / AIOps](./mlops-llmops-aiops.md) — operational lifecycle around serving
- [Transformer and Modern LLM Internals](./transformer-and-modern-llm-internals.md) — model internals that drive serving constraints
- [RAG](./rag.md) — RAG serving pipeline considerations
- [Agent Protocols](./agent-protocols-mcp-a2a-acp.md) — protocol layer for tool and agent serving

## Question Bank

Practice questions for this module are in the [System Design question bank](../../modules/09_system_design/).

## Cross-References

- [Module Index](../indexes/module-index.md) — all modules with sequences and detail cards
- [Experience Index](../indexes/experience-index.md) — depth expectations by career band
- [Tag Index](../indexes/tag-index.md) — related tags: `pytorch`, `cuda`, `quantization`, `vllm`, `tgi`, `batching`, `throughput`, `latency`, `paged-attention`, `model-routing`, `multi-tenancy`, `tail-latency`
- [Topic Graph](../topic-graph.md) — prerequisite map
