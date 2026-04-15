# Python / Software Foundations → AI Engineer

Role family: Software → AI · Primary bands: 0–2 yr, 2–5 yr, 5–8 yr

## Who This Role Is For

- Backend engineers building AI-backed product features
- Full-stack engineers moving into AI features
- Platform/application engineers adding model-backed systems
- Strong Python developers with limited ML depth

## Typical Strengths

- Coding discipline and software engineering rigor
- APIs, service integration, and system architecture
- Debugging and software structure thinking
- Deployment basics, CI/CD, and production systems

## Typical Gaps

- Statistics and evaluation nuance (precision/recall thinking)
- Tensor, gradient, and training intuition
- Transformer internals beyond API usage
- Retrieval quality and model behavior diagnosis
- Cost reasoning for ML/LLM systems

---

## What Companies Expect by Band

### 0–2 yr (junior)
- Can integrate LLM APIs into product features safely
- Understands basic prompt engineering and response handling
- Knows when they are out of their depth on model behavior

### 2–5 yr (mid-level)
- Can build AI-backed features end-to-end: retrieval, prompting, evaluation, deployment
- Understands RAG at a working level, not just as "a database for LLMs"
- Can reason about cost, latency, and quality trade-offs
- Can diagnose basic production failures: bad retrieval, poor generation quality, latency spikes

### 5–8 yr (senior)
- Connects model behavior to system behavior, cost, reliability, and user impact
- Can design RAG and tool-use systems with production constraints in mind
- Understands serving trade-offs: vLLM, quantization, batching, routing
- Can lead technical decisions on when to use AI vs traditional software approaches

---

## What Distinguishes Good from Great

| Good | Great |
|---|---|
| Can build a RAG system that works | Can explain why retrieval quality degrades and how to fix it |
| Uses LLM APIs correctly | Can reason about model behavior beyond the API surface |
| Knows vLLM exists | Can explain why PagedAttention matters for serving economics |
| Writes clean integration code | Designs for observability, fallback, and cost control from the start |
| Can debug application errors | Can trace a quality issue through retrieval → context → generation → evaluation |

---

## What To Study First

1. [Foundations](../modules/foundations.md) — Python for ML, tensor basics, evaluation metrics
2. [Deep Learning Core](../modules/deep-learning-core.md) — forward/backward pass, loss functions, optimization
3. [Transformer and Modern LLM Internals](../modules/transformer-and-modern-llm-internals.md) — tokenization, attention, KV cache, generation
4. [RAG](../modules/rag.md) — retrieval, chunking, reranking, grounding, evaluation
5. [Systems, Serving, and Inference](../modules/systems-serving-and-inference.md) — throughput, latency, quantization, deployment

## What Can Be Skipped Initially

- GAN and diffusion internals
- Advanced CV architecture history
- Deep RLHF derivations
- Protocol details (MCP/A2A/ACP) beyond basic conceptual fit
- Multimodal/VLM internals (unless role-specific)

---

## Key Interview Rounds

| Round | What Is Tested | Common Format |
|---|---|---|
| Screening | Python, tensors, stats, and ML intuition | 30–45 min phone/video |
| Technical | Implementation and feature design | Live coding or take-home |
| Deep dive | RAG, agent workflows, and serving trade-offs | 60 min discussion/whiteboard |
| Debugging | Production incidents and eval failures | Scenario-based |
| System design | End-to-end AI feature architecture | 45–60 min whiteboard |

## Typical Failure Points

- Strong coding, weak evaluation reasoning
- Treating RAG as a simple database wrapper with no quality tuning
- Weak understanding of prompt structure vs retrieval quality vs model quality
- Inability to reason about latency, batching, and cost
- Over-engineering solutions with agents when a simple pipeline would work
- Not knowing when to ask for help from ML specialists

## Expanded Failure Mode Catalog

| Failure | Why It Happens | How To Fix |
|---|---|---|
| "I'd use an LLM for this" for every problem | AI enthusiasm without cost/complexity awareness | Practice the "when NOT to use AI" reasoning |
| Cannot explain evaluation metrics | Never studied precision, recall, ranking metrics | Work through Foundations evaluation section |
| RAG answer quality is poor, no idea why | Treats retrieval as a black box | Learn chunking, embedding, reranking pipeline |
| Latency is too high, no debugging path | Lacks serving intuition | Study Systems/Serving module: batching, KV cache, quantization |
| Uses agent where a workflow suffices | Conflates complexity with capability | Study Agents module: workflow vs agent distinction |

---

## Recommended Modules in Order

1. [Foundations](../modules/foundations.md)
2. [Classical ML](../modules/classical-ml.md)
3. [Deep Learning Core](../modules/deep-learning-core.md)
4. [Transformer and Modern LLM Internals](../modules/transformer-and-modern-llm-internals.md)
5. [RAG](../modules/rag.md)
6. [Agents and Agentic Systems](../modules/agents-and-agentic-systems.md)
7. [Systems, Serving, and Inference](../modules/systems-serving-and-inference.md)
8. [MLOps / LLMOps / AIOps](../modules/mlops-llmops-aiops.md)

## Recommended Difficulty Progression

- Weeks 1–3: Concept and Applied
- Weeks 4–6: Applied and Debugging
- Weeks 7–12: System depth in RAG, serving, and operations

## 30-Day Prep Strategy

| Days | Focus | Key Activities |
|---|---|---|
| 1–7 | Foundations and Classical ML | Evaluation metrics, tensor ops, gradient intuition, ML fundamentals |
| 8–14 | Deep Learning Core and Transformers | Forward/backward pass, attention, tokenization, KV cache |
| 15–21 | RAG and tool-use patterns | Chunking, retrieval, reranking, grounding, structured outputs |
| 22–26 | Serving and deployment | Latency, quantization, vLLM/TGI, cost estimation |
| 27–30 | Debugging drills and mock deep dives | End-to-end scenario debugging, system design practice |

## 90-Day Mastery Path

| Month | Focus | Outcome |
|---|---|---|
| 1 | Close model and evaluation gaps | Can reason about model behavior and evaluate quality |
| 2 | Build strong RAG and LLM feature reasoning | Can design and debug retrieval-augmented features |
| 3 | Deepen serving, operations, and system design | Can make production deployment and operational decisions |

## Best First Question Sets

- [Foundations question bank](../../modules/00_foundations/) — concept, applied, system, debugging
- [GenAI / LLM question bank](../../modules/02_genai/) — transformer internals, prompting, fine-tuning
- [RAG question bank](../../modules/04_rag/) — retrieval, chunking, grounding, evaluation

## Cross-References

- [Role Index](../indexes/role-index.md) — all role families with depth matrices
- [Experience Index](../indexes/experience-index.md) — band expectations across all roles
- [Module Index](../indexes/module-index.md) — full module sequence and detail cards
- [Topic Graph](../topic-graph.md) — prerequisite map for study planning
