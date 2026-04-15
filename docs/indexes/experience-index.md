# Experience Index

Use this index if you want to navigate by career stage instead of by role.

Experience band is one of the two most important variables in interview prep (the other is role family). What companies test and how deep they go changes significantly with seniority.

**Important:** More years does NOT always mean more model depth. Senior candidates are increasingly judged on system design, architecture, governance, and platform thinking — not on maximal technical breadth.

---

## 0–2 Years

**Primary goal:** Become correct and implementable.

**Start with:**
- [Foundations](../modules/foundations.md)
- [Classical ML](../modules/classical-ml.md)
- [Deep Learning Core](../modules/deep-learning-core.md)
- [Transformer and Modern LLM Internals](../modules/transformer-and-modern-llm-internals.md)

**What to prioritize:**
- Python fluency, tensors, shapes, broadcasting
- Probability basics, core metrics, gradient intuition
- Correct terminology and clean explanations
- Basic training loop implementation
- RAG pipeline stages (if role-relevant)

**De-prioritize initially:**
- Graph RAG, protocol interoperability details, enterprise governance
- Advanced post-training methods, MoE routing details
- GANs, diffusion internals (unless CV role)

**What "good" looks like at this band:**
- Can explain basics without hand-waving or inventing mechanisms
- Can write functional code for simple ML/DL tasks
- Avoids major conceptual errors
- Says "I don't know" rather than fabricating

**Default depth levels:** Concept, Applied

---

## 2–5 Years

**Primary goal:** Become applied and production-aware.

**Start with:**
- [Transformer and Modern LLM Internals](../modules/transformer-and-modern-llm-internals.md)
- [RAG](../modules/rag.md)
- [Systems, Serving, and Inference](../modules/systems-serving-and-inference.md)
- [MLOps / LLMOps / AIOps](../modules/mlops-llmops-aiops.md)

**What to prioritize:**
- Trade-off reasoning across design choices
- Debugging discipline and failure mode awareness
- Evaluation fluency and metric selection under constraints
- Ability to compare design choices with evidence

**De-prioritize by role:**
- Graph RAG (unless actively using), RLHF (unless research role)
- Mamba, advanced multimodal (unless CV/research role)
- AIOps (unless operations-focused)

**What "good" looks like at this band:**
- Can compare options and explain why one fails in practice
- Can identify data leakage, evaluation pitfalls, and common anti-patterns
- Can discuss basic production concerns (latency, cost, reliability)
- Shows evaluation thinking, not just implementation thinking

**Default depth levels:** Applied, System

---

## 5–8 Years

**Primary goal:** Show ownership of production systems.

**Start with:**
- [RAG](../modules/rag.md)
- [Agents and Agentic Systems](../modules/agents-and-agentic-systems.md)
- [Systems, Serving, and Inference](../modules/systems-serving-and-inference.md)
- [MLOps / LLMOps / AIOps](../modules/mlops-llmops-aiops.md)

**What to prioritize:**
- Latency/cost/reliability trade-offs
- Rollout and rollback strategy
- Observability and incident reasoning
- Realistic evaluation gates
- Production debugging across data/model/retrieval/serving

**De-prioritize by role:**
- Research-heavy post-training (unless research role)
- Advanced CV architectures (unless CV role)
- Protocol details beyond conceptual fit (unless agent-systems role)

**What "good" looks like at this band:**
- Can operate and recover systems, not just describe them
- Can diagnose multi-factor production issues
- Can explain deployment, monitoring, and failure containment strategies
- Shows evidence-based reasoning, not opinion-based

**Default depth levels:** Applied, System, Debugging

---

## 8–12 Years

**Primary goal:** Show platform and architecture judgment.

**Start with:**
- [Topic Graph](../topic-graph.md) — understand the full dependency map
- [Systems, Serving, and Inference](../modules/systems-serving-and-inference.md)
- [Agent Protocols](../modules/agent-protocols-mcp-a2a-acp.md)
- [MLOps / LLMOps / AIOps](../modules/mlops-llmops-aiops.md)

**What to prioritize:**
- System boundaries and team interfaces
- Multi-tenant design and platform controls
- Governance and exception models
- Budget and cost allocation reasoning
- Where organizational structure becomes the bottleneck

**De-prioritize:**
- Narrow algorithmic trivia outside domain specialization
- Low-level implementation details (unless hands-on role)

**What "good" looks like at this band:**
- Makes bounded, realistic architecture choices
- Defines control surfaces and rollback paths
- Considers team capability, not just technical capability
- Can explain what to standardize vs leave flexible

**Default depth levels:** System, Debugging, Architect

---

## 12–20 Years

**Primary goal:** Show AI systems leadership, not trivia depth.

**Start with:**
- [Role Experience Matrix](../role-experience-matrix.md)
- [Senior / Architect / AI Systems Lead](../personas/senior-architect-ai-systems-lead.md)
- [Systems, Serving, and Inference](../modules/systems-serving-and-inference.md)
- [MLOps / LLMOps / AIOps](../modules/mlops-llmops-aiops.md)

**What to prioritize:**
- Organizational operating model design
- Governance and risk strategy
- Platform investment decisions
- Long-horizon technical direction
- Vendor vs build reasoning with cost and lock-in analysis

**De-prioritize:**
- Low-level implementation detail (unless role is hands-on)
- Exhaustive architecture histories
- Narrow technical trivia

**What "good" looks like at this band:**
- Connects technical architecture to staffing, governance, and failure containment
- Knows what to standardize vs leave flexible
- Can defend platform direction against realistic constraints
- Shows operating model thinking, not just technical depth

**Default depth levels:** Architect, System, selective Debugging

---

## By Depth Level

| Experience Band | Default Question Level Target |
|---|---|
| 0–2 years | Concept, Applied |
| 2–5 years | Applied, System |
| 5–8 years | Applied, System, Debugging |
| 8–12 years | System, Debugging, Architect |
| 12–20 years | Architect, System, selective Debugging |

---

## Band × Level Difficulty Guide

| Band | Typical Difficulty Range | What to Skip |
|---|---|---|
| 0–2 years | 1–2, stretch to 3 | Difficulty 4–5 |
| 2–5 years | 2–3, stretch to 4 | Difficulty 5 (unless strong) |
| 5–8 years | 3–4, include some 5 | Difficulty 1 (should be assumed) |
| 8–12 years | 3–5 | Difficulty 1–2 (use only as refresh) |
| 12–20 years | 4–5, selective 3 | Difficulty 1–2 except for rusty areas |

---

## Cross-References

- [Role Experience Matrix](../role-experience-matrix.md) — full role × band expectations
- [Role Index](./role-index.md) — entry by job family
- [Module Index](./module-index.md) — all 12 modules with sequences
- [Interview Philosophy](../interview-philosophy.md) — how the 5-level system works
- [Topic Graph](../topic-graph.md) — prerequisite dependencies
- 12-20 years: use the first batches selectively and bias toward architect-level questions
