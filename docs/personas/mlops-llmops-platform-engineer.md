# MLOps / LLMOps / Platform AI Engineer

Role family: Platform AI · Primary bands: 2–5 yr, 5–8 yr, 8–12 yr

## Who This Role Is For

- ML platform engineers building shared training and serving infrastructure
- LLM platform and infrastructure engineers
- MLOps engineers expanding into LLM, RAG, and agent operations
- Engineers building shared AI tooling for teams

## Typical Strengths

- Deployment pipelines and CI/CD
- Versioning and release controls
- Observability and platform standards
- Service integration and operations discipline

## Typical Gaps

- Deeper model internals (transformer mechanics, training dynamics)
- Retrieval quality reasoning (why RAG quality is poor, not just that it is)
- Post-training choices (when to fine-tune, RLHF vs DPO trade-offs)
- Research-heavy architecture nuance

---

## What Companies Expect by Band

### 2–5 yr (mid-level)
- Can set up and maintain ML training and deployment pipelines
- Understands experiment tracking, model registry, and versioning
- Can implement observability for model-backed services
- Knows basic serving concepts: latency, throughput, batching

### 5–8 yr (senior)
- Owns serving infrastructure: vLLM/TGI, routing, fallback, multi-tenancy
- Understands LLMOps concerns: prompt versioning, token cost monitoring, tracing
- Can design platform interfaces that serve multiple teams without over-simplifying
- Strong incident response: can investigate model/serving failures end-to-end

### 8–12 yr (staff / lead)
- Defines platform strategy: what to build, what to buy, what to defer
- Designs governance controls: access, cost attribution, compliance, audit
- Can reason about platform economics at organizational scale
- Connects platform decisions to team productivity and model quality

---

## What Distinguishes Good from Great

| Good | Great |
|---|---|
| Can deploy a model | Can design a deployment pipeline with canary, rollback, and monitoring |
| Uses MLflow or W&B | Can critique the tooling choice and explain what problems remain unsolved |
| Monitors basic metrics | Designs observability that distinguishes retrieval failures from model failures |
| Knows vLLM exists | Can explain PagedAttention, continuous batching, and when TGI is a better fit |
| Operates AI services | Designs platform interfaces that scale across teams without being prescriptive |

---

## What To Study First

1. [Systems, Serving, and Inference](../modules/systems-serving-and-inference.md) — your core domain
2. [MLOps / LLMOps / AIOps](../modules/mlops-llmops-aiops.md) — operational lifecycle
3. [Transformer and Modern LLM Internals](../modules/transformer-and-modern-llm-internals.md) — model understanding for infrastructure decisions
4. [RAG](../modules/rag.md) — RAGOps requires understanding RAG
5. [Agent Protocols](../modules/agent-protocols-mcp-a2a-acp.md) — protocol support in platform design

## What Can Be Skipped Initially

- Deep CV architecture internals
- GAN and diffusion details
- Heavy research derivations unless platform supports those workloads directly
- Alignment math (RLHF/DPO internals) — focus on operational implications instead

---

## Key Interview Rounds

| Round | What Is Tested | Common Format |
|---|---|---|
| Production system design | Serving architecture, multi-tenancy, routing | 45–60 min whiteboard |
| Observability/debugging | Incident investigation, tracing, root cause analysis | Scenario-based |
| Rollout/rollback | Governance, version control, release strategy | Discussion |
| Platform architecture | Multi-team platform design, cost attribution, boundaries | Architectural discussion |

## Typical Failure Points

- Strong operations, weak model-specific constraints (e.g., doesn't understand KV cache)
- Weak retrieval and agent evaluation understanding
- Choosing platform abstractions that oversimplify real team needs
- Not understanding why LLMOps differs from classical MLOps
- Generic platform answers without AI-specific operational depth

## Expanded Failure Mode Catalog

| Failure | Why It Happens | How To Fix |
|---|---|---|
| Platform doesn't account for KV cache memory | Lacks model-specific serving knowledge | Study Systems/Serving: GPU memory, KV cache, batching |
| Cannot distinguish retrieval failures from generation failures | Lacks RAG understanding | Study RAG module: grounding, evaluation, failure modes |
| Over-abstracts platform interfaces | Doesn't understand what ML teams actually need | Study module-specific ops: LLMOps, RAGOps, AgentOps |
| Designs MLOps assuming all models are classical | Hasn't updated for LLM world | Study LLMOps: prompt versioning, token costs, online eval |
| Cannot reason about cost at scale | Focuses on correctness not economics | Study serving economics: cost per million tokens, GPU ROI |

---

## Recommended Modules in Order

1. [Foundations](../modules/foundations.md)
2. [Transformer and Modern LLM Internals](../modules/transformer-and-modern-llm-internals.md)
3. [Systems, Serving, and Inference](../modules/systems-serving-and-inference.md)
4. [MLOps / LLMOps / AIOps](../modules/mlops-llmops-aiops.md)
5. [RAG](../modules/rag.md)
6. [Agents and Agentic Systems](../modules/agents-and-agentic-systems.md)
7. [Agent Protocols](../modules/agent-protocols-mcp-a2a-acp.md)
8. [Alignment / Post-Training](../modules/alignment-post-training.md)

## Recommended Difficulty Progression

- Concept/Applied for model internals
- Applied/System/Debugging for serving and operations
- Architect for platform boundaries, controls, and governance

## 30-Day Prep Strategy

| Days | Focus | Key Activities |
|---|---|---|
| 1–7 | Serving, latency, GPU memory, vLLM/TGI | GPU memory math, batching strategies, quantization trade-offs |
| 8–14 | Versioning, tracing, evaluation, rollback | Experiment tracking, prompt versioning, LLMOps lifecycle |
| 15–21 | RAG and agent operational failure modes | RAGOps, AgentOps, operational monitoring |
| 22–28 | Platform architecture, protocols, governance | Multi-team platform design, cost attribution, compliance |
| 29–30 | Mock interviews | System design and incident investigation practice |

## 90-Day Mastery Path

| Month | Focus | Outcome |
|---|---|---|
| 1 | Strengthen model-to-serving understanding | Can reason about model constraints when designing infrastructure |
| 2 | Deepen platform controls, tracing, and operational workflows | Can operate LLM/RAG/agent systems end-to-end |
| 3 | Develop architecture and governance range across teams | Can own platform strategy for an AI organization |

## Best First Question Sets

- [System Design question bank](../../modules/09_system_design/) — architecture, serving, inference
- [LLMOps question bank](../../modules/06_llmops/) — operations, observability, governance
- [Agentic AI question bank](../../modules/05_agentic_ai/) — agents, protocols, governance

## Cross-References

- [Role Index](../indexes/role-index.md) — all role families with depth matrices
- [Experience Index](../indexes/experience-index.md) — band expectations across all roles
- [Module Index](../indexes/module-index.md) — full module sequence and detail cards
- [Topic Graph](../topic-graph.md) — prerequisite map for study planning
