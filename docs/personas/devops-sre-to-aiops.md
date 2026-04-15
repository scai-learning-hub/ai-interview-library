# DevOps / SRE → AIOps Engineer

Role family: DevOps → AIOps · Primary bands: 2–5 yr, 5–8 yr

## Who This Role Is For

- SREs moving into AI-assisted operations
- DevOps engineers supporting AI services
- Observability and incident-response engineers adding AI systems depth

## Typical Strengths

- Production reliability and uptime discipline
- Incident handling and post-mortem culture
- Monitoring, tracing, and alerting design
- Capacity planning and release operations

## Typical Gaps

- Model behavior intuition (why outputs change, not just that they do)
- Evaluation and retrieval quality reasoning
- Post-training and architecture comparison depth
- Agent-specific orchestration failure modes

---

## What Companies Expect by Band

### 2–5 yr (mid-level)
- Can deploy and operate AI services with the same rigor as traditional services
- Understands basic model characteristics: latency patterns, GPU memory, failure modes
- Can set up monitoring for AI-specific metrics (not just CPU/memory/request rate)
- Knows the difference between a model failure and an infrastructure failure

### 5–8 yr (senior)
- Can design observability and incident response for AI systems
- Understands AIOps tools and their limitations: anomaly detection, alert triage, automation boundaries
- Can reason about capacity planning for GPU-based serving workloads
- Can collaborate with ML teams on operational design without being a bottleneck

---

## What Distinguishes Good from Great

| Good | Great |
|---|---|
| Monitors AI services like any other service | Designs AI-specific monitoring: token usage, retrieval quality, generation safety |
| Handles incidents | Can distinguish retrieval failures from model failures from infrastructure failures |
| Knows GPUs exist | Can reason about GPU memory, batch scheduling, and capacity planning |
| Uses AIOps tools | Understands where AI-assisted ops helps and where it adds risk |
| Deploys models | Designs deployment with canary, rollback, and model-specific validation |

---

## What To Study First

1. [Foundations](../modules/foundations.md) — AI literacy baseline
2. [Systems, Serving, and Inference](../modules/systems-serving-and-inference.md) — your core technical domain
3. [MLOps / LLMOps / AIOps](../modules/mlops-llmops-aiops.md) — operational lifecycle
4. [RAG](../modules/rag.md) — RAG failure modes are operational concerns
5. [Agents and Agentic Systems](../modules/agents-and-agentic-systems.md) — agent failure modes

## What Can Be Skipped Initially

- GAN and diffusion internals
- Detailed post-training optimization methods (RLHF/DPO math)
- Advanced multimodal architecture families
- Classical ML algorithm depth

---

## Key Interview Rounds

| Round | What Is Tested | Common Format |
|---|---|---|
| Production/debugging | Incident investigation for AI services | Scenario-based |
| Systems/serving | GPU serving, capacity, latency, deployment | Design discussion |
| AIOps/observability | Monitoring design, alert strategy, automation boundaries | Design discussion |
| Reliability/escalation | Failure modes, rollback, safety controls | Scenario-based |

## Typical Failure Points

- Good platform answers but shallow model-specific reasoning
- Weak distinction between retrieval failures and inference failures
- Weak quality evaluation depth (can't tell if the model is wrong, only if it's slow)
- Over-automation answers without safety boundaries
- Treating AI services as identical to traditional microservices

## Expanded Failure Mode Catalog

| Failure | Why It Happens | How To Fix |
|---|---|---|
| Cannot distinguish model failure from infra failure | Lacks model behavior understanding | Study Foundations + Transformer internals at conceptual level |
| Monitors only latency and error rate for AI services | Doesn't know AI-specific metrics | Study LLMOps: token cost, retrieval quality, generation safety monitoring |
| Over-automates with AIOps tools | Doesn't understand automation boundaries | Study AIOps module: where AI assists vs where it decides |
| Cannot capacity-plan for GPU workloads | Lacks GPU memory/batching intuition | Study Systems/Serving: GPU memory math, batching, KV cache |
| Treats RAG failures as "model is broken" | Doesn't understand retrieval vs generation | Study RAG module: retrieval monitoring, grounding, diagnosis |

---

## Recommended Modules in Order

1. [Foundations](../modules/foundations.md)
2. [Transformer and Modern LLM Internals](../modules/transformer-and-modern-llm-internals.md)
3. [Systems, Serving, and Inference](../modules/systems-serving-and-inference.md)
4. [MLOps / LLMOps / AIOps](../modules/mlops-llmops-aiops.md)
5. [RAG](../modules/rag.md)
6. [Agents and Agentic Systems](../modules/agents-and-agentic-systems.md)
7. [Agent Protocols](../modules/agent-protocols-mcp-a2a-acp.md)

## Recommended Difficulty Progression

- Concept for model internals and retrieval basics
- Applied/System/Debugging for serving and operations
- Architect only when targeting platform leadership roles

## 30-Day Prep Strategy

| Days | Focus | Key Activities |
|---|---|---|
| 1–7 | Foundations for model/system literacy | Basic ML concepts, evaluation metrics, model behavior intuition |
| 8–14 | Serving stacks, latency, batching, tracing | GPU memory, vLLM/TGI, quantization, deployment patterns |
| 15–21 | LLMOps, RAGOps, AgentOps, AIOps workflows | Operational monitoring, incident response, automation boundaries |
| 22–28 | Production incident scenarios | AI-specific debugging drills, failure mode analysis |
| 29–30 | Mock interviews | Architecture and incident-response round practice |

## 90-Day Mastery Path

| Month | Focus | Outcome |
|---|---|---|
| 1 | Operational literacy for AI systems | Can operate and monitor AI services beyond basic metrics |
| 2 | Strong debugging and reliability depth | Can investigate and resolve AI-specific production failures |
| 3 | Platform strategy and AI operations design | Can own operational design for AI services across teams |

## Best First Question Sets

- [System Design question bank](../../modules/09_system_design/) — architecture, serving, inference
- [LLMOps question bank](../../modules/06_llmops/) — operations, observability, governance
- [AIOps question bank](../../modules/08_aiops/) — AI-assisted operations

## Cross-References

- [Role Index](../indexes/role-index.md) — all role families with depth matrices
- [Experience Index](../indexes/experience-index.md) — band expectations across all roles
- [Module Index](../indexes/module-index.md) — full module sequence and detail cards
- [Topic Graph](../topic-graph.md) — prerequisite map for study planning
