# Module Index

Modules are not equal in importance for every role. Use this index to decide sequence, not just coverage.

---

## Modules

### Core Foundations
1. [Foundations](../modules/foundations.md) — Python, tensor thinking, linear algebra, probability, statistics, metrics, autograd
2. [Classical ML](../modules/classical-ml.md) — Supervised/unsupervised, evaluation, bias/variance, trees, SVM, anomaly detection
3. [Deep Learning Core](../modules/deep-learning-core.md) — Tensors, CUDA, batching, forward/backward, loss, normalization, optimization, training loops

### Model and Architecture Families
4. [CV and Generative Architectures](../modules/cv-and-generative-architectures.md) — CNN, ResNet, YOLO, U-Net, GANs, RNN/LSTM, ViT, Mamba, diffusion
5. [Transformer and Modern LLM Internals](../modules/transformer-and-modern-llm-internals.md) — Tokenization, embeddings, RoPE, attention, MHA/GQA, KV cache, MoE, scaling
6. [Multimodal and VLMs](../modules/multimodal-and-vlms.md) — CLIP, BLIP, SigLIP, Flamingo, image-text alignment, VLM evaluation

### Application and Orchestration
7. [RAG](../modules/rag.md) — Ingestion, chunking, retrieval, reranking, basic/hybrid/graph RAG, evaluation, failure modes
8. [Agents and Agentic Systems](../modules/agents-and-agentic-systems.md) — Tool calling, planners, memory, multi-agent, governance, safety
9. [Agent Protocols: MCP / A2A / ACP](../modules/agent-protocols-mcp-a2a-acp.md) — Protocol differentiation, local tools vs remote agents, discovery, trust

### Production and Operations
10. [Systems, Serving, and Inference](../modules/systems-serving-and-inference.md) — PyTorch, CUDA, kernels, quantization, vLLM, TGI, deployment
11. [Alignment / Post-training](../modules/alignment-post-training.md) — SFT, RLHF, DPO, reward models, behavior shaping trade-offs
12. [MLOps / LLMOps / AIOps](../modules/mlops-llmops-aiops.md) — MLOps, LLMOps, RAGOps, AgentOps, AIOps, observability, governance

---

## Module Detail Cards

### 1. Foundations
- **Scope:** Python, data structures for ML, NumPy-style tensor thinking, linear algebra intuition, probability/statistics, optimization basics, metrics, compute graphs/autograd
- **Subtopics:** Python fluency, vectorization, shapes/broadcasting, gradient descent, evaluation metrics, data leakage
- **Level breakdown:** Concept 20% / Applied 35% / System 20% / Debugging 15% / Architect 10%
- **Prerequisites:** None
- **Unlocks:** Classical ML, Deep Learning Core, Systems/Serving (awareness)

### 2. Classical ML
- **Scope:** Supervised/unsupervised learning, feature engineering, model evaluation, bias/variance, cross-validation, tree methods, SVM/kernels, dimensionality reduction, anomaly detection
- **Subtopics:** Calibration, thresholding, tabular model selection, data leakage, ensemble trade-offs
- **Prerequisites:** Python, statistics, metrics (from Foundations)
- **Unlocks:** MLOps evaluation pipelines, AIOps anomaly detection, retrieval reranking intuition

### 3. Deep Learning Core
- **Scope:** Tensors, CUDA, batching, forward/backward pass, loss functions, normalization, regularization, optimization, training loops, distributed training
- **Subtopics:** Mixed precision, batch-size trade-offs, OOM debugging, gradient clipping, reproducibility
- **Prerequisites:** Tensor thinking, optimization basics, compute graphs (from Foundations)
- **Unlocks:** CV/Generative Architectures, Transformer Internals, Systems/Serving

### 4. CV and Generative Architectures
- **Scope:** CNN, ResNet, YOLO, U-Net, autoencoders, GANs, RNN/LSTM/GRU, ViT, Mamba, diffusion models
- **Subtopics:** Residual connections, real-time detection trade-offs, encoder-decoder patterns, mode collapse, denoising objectives, state-space model advantages
- **Prerequisites:** Deep Learning Core
- **Unlocks:** Multimodal/VLMs (via ViT), research architecture discussions

### 5. Transformer and Modern LLM Internals
- **Scope:** Tokenization, embeddings, positional encoding, RoPE, self-attention, MHA/GQA/MQA, KV cache, context windows, scaling, MoE, inference trade-offs
- **Subtopics:** Attention cost analysis, sampling strategies, reasoning vs latency vs cost, model economics
- **Prerequisites:** Deep Learning Core, sequence modeling intuition
- **Unlocks:** Multimodal/VLMs, RAG, Agents, Alignment, Systems/Serving

### 6. Multimodal and VLMs
- **Scope:** CLIP, BLIP, SigLIP, Flamingo, image-text alignment, multimodal retrieval, VLM evaluation
- **Subtopics:** Contrastive alignment, zero-shot transfer, encoder-only vs generative VLMs, annotation burden
- **Prerequisites:** Transformer internals, vision architecture awareness
- **Unlocks:** Advanced retrieval patterns, multimodal product design

### 7. RAG
- **Scope:** Ingestion, chunking, embeddings, indexing, retrieval, metadata filtering, reranking, context assembly, grounding, citation, basic/hybrid/graph RAG, evaluation, failure modes
- **Subtopics:** BM25 vs dense, chunk size trade-offs, reranker selection, hallucination diagnosis, freshness, graph RAG governance
- **Prerequisites:** Embeddings, LLM prompting, evaluation basics
- **Unlocks:** Agent-RAG integration, RAGOps, production RAG debugging

### 8. Agents and Agentic Systems
- **Scope:** Tool calling, planners, state/memory, supervisors, reflection/critique, retries, HITL, multi-agent, governance
- **Subtopics:** Workflow vs agent, bounded autonomy, side-effect safety, loop detection, escalation paths, budget controls
- **Prerequisites:** Tool calling, structured outputs, control flow reasoning
- **Unlocks:** Agent Protocols, AgentOps, multi-agent governance

### 9. Agent Protocols: MCP / A2A / ACP
- **Scope:** Protocol differentiation, local tools vs remote agents, discovery, delegation, identity/trust/security, complement vs overlap
- **Subtopics:** MCP tool patterns, A2A delegation, ACP maturity, trust boundaries, audit requirements
- **Prerequisites:** Agent architecture, distributed systems trust
- **Unlocks:** Platform-level agent governance, protocol-aware system design

### 10. Systems, Serving, and Inference
- **Scope:** PyTorch, Lightning, CUDA, kernels, memory, throughput/latency, batching, quantization, vLLM, TGI, model serving, deployment
- **Subtopics:** PagedAttention, continuous batching, GPTQ/AWQ/GGUF, model routing, multi-tenancy, tail latency
- **Prerequisites:** Model internals, CUDA/memory intuition
- **Unlocks:** Production deployment, operational debugging, cost optimization

### 11. Alignment / Post-training
- **Scope:** SFT, RLHF, DPO, reward models, evaluation, safety/harmlessness/helpfulness, retrieval vs prompting vs fine-tuning vs preference optimization
- **Subtopics:** Reward hacking, objective misspecification, data collection burden, when NOT to fine-tune
- **Prerequisites:** Supervised fine-tuning, evaluation basics
- **Unlocks:** Behavior-aware deployment, safety-informed system design

### 12. MLOps / LLMOps / AIOps
- **Scope:** MLOps, LLMOps, RAGOps, AgentOps, AIOps, observability, tracing, versioning, pipelines, drift, rollback, incident response, governance, SLO/SLA
- **Subtopics:** Prompt versioning, token cost monitoring, retrieval freshness, trajectory tracing, automation boundaries
- **Prerequisites:** Pipeline thinking, evaluation, deployment, observability
- **Unlocks:** Production maturity, platform design, governance strategy

---

## Recommended Sequences

### Fastest Practical LLM Engineering Route
[Foundations](../modules/foundations.md) → [Deep Learning Core](../modules/deep-learning-core.md) → [Transformer Internals](../modules/transformer-and-modern-llm-internals.md) → [RAG](../modules/rag.md) → [Agents](../modules/agents-and-agentic-systems.md) → [Serving](../modules/systems-serving-and-inference.md)

### Platform and Operations Route
[Foundations](../modules/foundations.md) → [Serving](../modules/systems-serving-and-inference.md) → [MLOps / LLMOps / AIOps](../modules/mlops-llmops-aiops.md) → [RAG](../modules/rag.md) → [Agent Protocols](../modules/agent-protocols-mcp-a2a-acp.md)

### Research-Oriented Route
[Deep Learning Core](../modules/deep-learning-core.md) → [CV / Generative](../modules/cv-and-generative-architectures.md) → [Transformer Internals](../modules/transformer-and-modern-llm-internals.md) → [Multimodal / VLMs](../modules/multimodal-and-vlms.md) → [Alignment](../modules/alignment-post-training.md)

### CV / Multimodal Route
[Deep Learning Core](../modules/deep-learning-core.md) → [CV / Generative](../modules/cv-and-generative-architectures.md) → [Transformer Internals](../modules/transformer-and-modern-llm-internals.md) → [Multimodal / VLMs](../modules/multimodal-and-vlms.md) → [Serving](../modules/systems-serving-and-inference.md)

### Full-Stack AI Route (30+ day prep)
[Foundations](../modules/foundations.md) → [Classical ML](../modules/classical-ml.md) → [Deep Learning Core](../modules/deep-learning-core.md) → [Transformer Internals](../modules/transformer-and-modern-llm-internals.md) → [RAG](../modules/rag.md) → [Agents](../modules/agents-and-agentic-systems.md) → [Serving](../modules/systems-serving-and-inference.md) → [MLOps / LLMOps / AIOps](../modules/mlops-llmops-aiops.md)

---

## By Interview Pressure Type

| Need | Best Modules |
|---|---|
| Screening foundations | Foundations, Classical ML, Deep Learning Core |
| Applied feature building | Transformer Internals, RAG, Agents |
| Production debugging | Systems/Serving, MLOps/LLMOps/AIOps, RAG |
| Architecture rounds | Systems/Serving, MLOps/LLMOps/AIOps, Agent Protocols |
| Research discussion | CV/Generative, Transformer Internals, Alignment/Post-training |
| CV / perception interviews | Deep Learning Core, CV/Generative, Multimodal/VLMs |
| Agent / copilot design | Agents, Agent Protocols, RAG, Serving |
| Operations / SRE interviews | Systems/Serving, MLOps/LLMOps/AIOps, Foundations |

---

## Cross-References

- [Role Index](./role-index.md) — which modules matter for each role
- [Experience Index](./experience-index.md) — entry points by career band
- [Topic Graph](../topic-graph.md) — prerequisite dependencies
- [Tag Index](./tag-index.md) — find modules by technical tag
