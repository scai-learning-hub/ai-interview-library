# Tag Index

Tags are used for navigation, filtering, and future site search. They are intentionally narrower than broad module names and help users find pressure-tested clusters of interview content.

**Tag Use Rule:** A tag is only worth using if it changes either the study path or the interview expectation.

---

## Core Tag Families

### A — Foundations and Core Math
`python` · `statistics` · `probability` · `optimization` · `autograd` · `tensor` · `compute-graph` · `metrics` · `broadcasting` · `vectorization` · `data-leakage` · `gradient-descent`

### B — Classical ML
`supervised-learning` · `unsupervised-learning` · `feature-engineering` · `cross-validation` · `bias-variance` · `tree-methods` · `svm` · `anomaly-detection` · `calibration` · `ensemble` · `thresholding` · `dimensionality-reduction`

### C — Deep Learning Core
`batching` · `normalization` · `regularization` · `loss-functions` · `mixed-precision` · `distributed-training` · `gradient-clipping` · `reproducibility` · `training-loop` · `oom-debugging`

### D — CV and Generative Architectures
`cnn` · `resnet` · `yolo` · `unet` · `gan` · `diffusion` · `vit` · `mamba` · `rnn` · `lstm` · `autoencoder` · `residual-connections` · `mode-collapse` · `denoising`

### E — Transformer and LLM Internals
`tokenization` · `embedding` · `positional-encoding` · `rope` · `attention` · `mha` · `gqa` · `mqа` · `moe` · `kv-cache` · `context-window` · `scaling` · `sampling` · `speculative-decoding` · `flash-attention`

### F — Multimodal and VLMs
`clip` · `blip` · `siglip` · `flamingo` · `vlm` · `image-text-alignment` · `multimodal-retrieval` · `contrastive-learning` · `zero-shot`

### G — RAG
`rag` · `hybrid-rag` · `graph-rag` · `chunking` · `reranking` · `grounding` · `citation` · `metadata-filtering` · `embedding-search` · `bm25` · `freshness` · `hallucination-diagnosis`

### H — Agents and Agentic Systems
`tool-calling` · `planning` · `memory` · `supervisor` · `multi-agent` · `human-in-the-loop` · `reflection` · `critique` · `retry` · `escalation` · `budget-control` · `side-effect-safety` · `loop-detection`

### I — Agent Protocols
`mcp` · `a2a` · `acp` · `discovery` · `delegation` · `trust` · `identity` · `protocol-fit` · `audit` · `capability-card`

### J — Systems, Serving, and Inference
`pytorch` · `lightning` · `cuda` · `kernel` · `quantization` · `vllm` · `tgi` · `batching` · `throughput` · `latency` · `paged-attention` · `continuous-batching` · `gptq` · `awq` · `gguf` · `model-routing` · `multi-tenancy` · `tail-latency`

### K — Alignment and Post-training
`sft` · `rlhf` · `dpo` · `reward-model` · `reward-hacking` · `safety` · `harmlessness` · `helpfulness` · `preference-data` · `objective-misspecification`

### L — Operations (MLOps / LLMOps / AIOps)
`tracing` · `observability` · `drift` · `rollback` · `governance` · `slos` · `prompt-versioning` · `token-cost` · `retrieval-freshness` · `trajectory-tracing` · `pipeline` · `ci-cd` · `incident-response` · `automation-boundary`

---

## Tag Clusters to Study Together

| Cluster | Tags | Why They Belong Together |
|---|---|---|
| Retrieval quality | `rag`, `chunking`, `reranking`, `grounding`, `citation`, `freshness` | These determine whether retrieval improves answers or only adds noise |
| Inference efficiency | `kv-cache`, `quantization`, `batching`, `vllm`, `tgi`, `latency`, `paged-attention` | These drive serving economics and user-perceived performance |
| Agent safety | `tool-calling`, `memory`, `supervisor`, `human-in-the-loop`, `trust`, `side-effect-safety` | Agent failures are usually orchestration failures, not just model failures |
| Platform control | `tracing`, `observability`, `rollback`, `governance`, `slos`, `prompt-versioning` | Production AI quality depends on operational controls |
| Modern architecture | `rope`, `mha`, `gqa`, `moe`, `context-window`, `scaling`, `flash-attention` | Shows whether the candidate can reason beyond "transformers use attention" |
| Training mechanics | `mixed-precision`, `gradient-clipping`, `distributed-training`, `loss-functions`, `normalization` | Core training skills tested in DL/CV/research roles |
| Alignment trade-offs | `sft`, `rlhf`, `dpo`, `reward-hacking`, `safety`, `preference-data` | Tests whether candidate understands behavior shaping vs instruction following |
| Multimodal reasoning | `clip`, `vlm`, `image-text-alignment`, `contrastive-learning`, `zero-shot` | Cross-modal system understanding tested in research and CV roles |

---

## Tags by Interview Pressure Type

| Interview Type | High-Value Tags |
|---|---|
| Screening call | `python`, `statistics`, `metrics`, `autograd`, `tensor` |
| Coding round | `python`, `tensor`, `training-loop`, `batching`, `embedding` |
| System design | `latency`, `throughput`, `model-routing`, `slos`, `governance` |
| Architecture deep-dive | `kv-cache`, `moe`, `quantization`, `vllm`, `paged-attention` |
| RAG debugging | `chunking`, `reranking`, `hallucination-diagnosis`, `freshness`, `citation` |
| Agent design | `tool-calling`, `planning`, `supervisor`, `mcp`, `budget-control` |
| Production debugging | `observability`, `drift`, `rollback`, `oom-debugging`, `tail-latency` |
| Research discussion | `attention`, `rope`, `scaling`, `diffusion`, `contrastive-learning` |

---

## Tags by Role Priority

| Role | Must-Know Tags | Should-Know Tags |
|---|---|---|
| SWE → AI | `python`, `tensor`, `embedding`, `rag`, `latency` | `chunking`, `tool-calling`, `observability` |
| Data / ML | `metrics`, `cross-validation`, `feature-engineering`, `drift`, `pipeline` | `calibration`, `ensemble`, `slos` |
| DL / CV | `cnn`, `resnet`, `vit`, `mixed-precision`, `loss-functions` | `diffusion`, `mamba`, `distributed-training` |
| LLM / RAG / Agent | `rag`, `chunking`, `tool-calling`, `mcp`, `kv-cache` | `graph-rag`, `a2a`, `budget-control` |
| Platform AI | `vllm`, `quantization`, `model-routing`, `observability`, `slos` | `multi-tenancy`, `governance`, `prompt-versioning` |
| DevOps → AIOps | `observability`, `drift`, `rollback`, `incident-response`, `slos` | `automation-boundary`, `token-cost`, `tracing` |
| Research | `attention`, `rope`, `moe`, `scaling`, `dpo` | `reward-hacking`, `contrastive-learning`, `diffusion` |
| Senior / Architect | `governance`, `slos`, `model-routing`, `multi-tenancy`, `latency` | `budget-control`, `automation-boundary`, `protocol-fit` |

---

## Cross-References

- [Module Index](./module-index.md) — modules organized by group and sequence
- [Role Index](./role-index.md) — which modules and tags matter per role
- [Experience Index](./experience-index.md) — depth expectations by career band
- [Topic Graph](../topic-graph.md) — prerequisite dependencies between modules
- the production trade-off discussion

If it does not change one of those, it is metadata noise.
