# LLM / RAG / Agent Engineer

Role family: LLM / RAG / Agent · Primary bands: 0–2 yr, 2–5 yr, 5–8 yr, 8–12 yr

## Who This Role Is For

- Engineers building copilots, assistants, retrieval systems, and agent workflows
- Product engineers responsible for LLM features in production
- Applied AI engineers bridging model APIs and real systems

## Typical Strengths

- Prompting and feature prototyping
- Basic retrieval and tool-use patterns
- Application logic and integration
- API-level LLM usage

## Typical Gaps

- Transformer internals beyond surface level
- Evaluation rigor (metrics, systematic failure analysis)
- Retrieval diagnosis (why retrieval quality is poor, not just that it is)
- Agent reliability and observability
- Inference economics and serving stacks

---

## What Companies Expect by Band

### 0–2 yr (junior)
- Can build simple LLM features: prompt engineering, basic retrieval, structured outputs
- Understands the difference between prompting, RAG, and fine-tuning at a conceptual level
- Can integrate LLM APIs safely with basic error handling

### 2–5 yr (mid-level)
- Evidence-based retrieval decisions: chunk size, embedding choice, reranking
- Evaluation fluency: can design and run evaluations for RAG and generation quality
- Production debugging: can diagnose retrieval failures, generation quality issues, latency problems
- Clear understanding of where agents help or hurt

### 5–8 yr (senior)
- Can design end-to-end RAG/agent systems with production constraints
- Understands serving trade-offs: model selection, quantization, routing, cost
- Can define agent architecture: when to use agents, multi-agent, HITL, and safety controls
- Owns evaluation strategy for the systems they build

### 8–12 yr (staff / lead)
- Defines LLM/RAG/agent strategy for a product or organization
- Can make build-vs-buy decisions for LLM infrastructure
- Connects technical decisions to business outcomes: cost, latency, quality, risk
- Can advise on protocol choices, governance, and operational model

---

## What Distinguishes Good from Great

| Good | Great |
|---|---|
| Can build a working RAG system | Can explain why retrieval quality varies and systematically improve it |
| Uses agents for complex tasks | Knows when a workflow is better than an agent and can justify the choice |
| Can evaluate with basic metrics | Designs multi-dimensional evaluation: faithfulness, relevance, coverage, latency |
| Knows about tool calling | Understands tool safety: read-only vs side-effecting, error handling, budget controls |
| Can prompt engineer effectively | Can reason about when prompting is enough vs when RAG or fine-tuning is needed |
| Works with one serving stack | Can compare stacks, reason about cost, and design routing strategies |

---

## What To Study First

1. [Transformer and Modern LLM Internals](../modules/transformer-and-modern-llm-internals.md) — you must understand the model you build on
2. [RAG](../modules/rag.md) — the core technical skill for this role
3. [Agents and Agentic Systems](../modules/agents-and-agentic-systems.md) — increasingly expected
4. [Systems, Serving, and Inference](../modules/systems-serving-and-inference.md) — cost, latency, deployment reality
5. [MLOps / LLMOps / AIOps](../modules/mlops-llmops-aiops.md) — operating what you build

## What Can Be Skipped Initially

- Deep CV architecture history
- Extensive GAN content
- Advanced RLHF math unless the role is post-training heavy
- Classical ML beyond evaluation fundamentals

---

## Key Interview Rounds

| Round | What Is Tested | Common Format |
|---|---|---|
| Technical | Transformer internals and practical feature design | 60 min live discussion |
| RAG deep dive | Architecture, evaluation, and failure modes | Scenario-based |
| Agent/production | Agent loops, latency, observability, rollout | Debugging scenario |
| System design | Multi-tenant assistant or platform features | 45–60 min whiteboard |
| Evaluation | Can you design an eval strategy? | Discussion or take-home |

## Typical Failure Points

- Overusing agents when workflows are enough
- Overusing retrieval when the issue is schema, workflow, or product design
- Weak eval strategy: no systematic approach to measuring quality
- Weak model/serving trade-off reasoning
- Weak distinction between tool access, protocol layers, and orchestration

## Expanded Failure Mode Catalog

| Failure | Why It Happens | How To Fix |
|---|---|---|
| RAG answers are poor but candidate can't diagnose | Treats retrieval as a black box | Deep dive on RAG module: chunking, embedding, reranking, evaluation |
| Agent gets stuck in loops | No budget controls or loop detection | Study Agent module: error recovery, budget enforcement |
| Cannot explain transformer internals | Built on APIs without understanding the model | Study Transformer module: attention, KV cache, generation |
| Evaluation is "ask the model to grade itself" | No rigorous evaluation training | Study evaluation across RAG, Alignment, and Foundations modules |
| Cannot reason about serving cost | Never worked on deployment | Study Systems/Serving: quantization, batching, routing, cost |
| Uses multi-agent when single agent suffices | Over-engineering from demos/tutorials | Study Agent module: core distinctions table, when to use what |

---

## Recommended Modules in Order

1. [Foundations](../modules/foundations.md)
2. [Deep Learning Core](../modules/deep-learning-core.md)
3. [Transformer and Modern LLM Internals](../modules/transformer-and-modern-llm-internals.md)
4. [RAG](../modules/rag.md)
5. [Agents and Agentic Systems](../modules/agents-and-agentic-systems.md)
6. [Agent Protocols](../modules/agent-protocols-mcp-a2a-acp.md)
7. [Systems, Serving, and Inference](../modules/systems-serving-and-inference.md)
8. [Alignment / Post-Training](../modules/alignment-post-training.md)
9. [MLOps / LLMOps / AIOps](../modules/mlops-llmops-aiops.md)

## Recommended Difficulty Progression

- Early: Concept/Applied in internals, RAG, and agents
- Mid: System/Debugging in retrieval, orchestration, serving, and operations
- Later: Architect in protocols, governance, and platform decisions

## 30-Day Prep Strategy

| Days | Focus | Key Activities |
|---|---|---|
| 1–7 | Transformer internals and inference basics | Attention, KV cache, generation, tokenization |
| 8–14 | RAG architecture and evaluation | Chunking, retrieval strategies, reranking, faithfulness evaluation |
| 15–21 | Agents, memory, tool safety, protocols | Agent patterns, HITL, budget controls, MCP basics |
| 22–28 | Serving, observability, incident drills | vLLM, latency budgets, tracing, debugging scenarios |
| 29–30 | Mock interviews | System design and debugging round practice |

## 90-Day Mastery Path

| Month | Focus | Outcome |
|---|---|---|
| 1 | Become precise on internals and retrieval | Can explain and debug RAG systems with confidence |
| 2 | Build strong agent and serving depth | Can design and operate agent systems in production |
| 3 | Add operations, governance, and architecture fluency | Can own LLM product strategy and technical decisions |

## Best First Question Sets

- [GenAI / LLM question bank](../../modules/02_genai/) — transformer internals, prompting, fine-tuning
- [RAG question bank](../../modules/04_rag/) — retrieval, chunking, grounding, evaluation
- [Agentic AI question bank](../../modules/05_agentic_ai/) — agents, tool calling, planning, protocols

## Cross-References

- [Role Index](../indexes/role-index.md) — all role families with depth matrices
- [Experience Index](../indexes/experience-index.md) — band expectations across all roles
- [Module Index](../indexes/module-index.md) — full module sequence and detail cards
- [Topic Graph](../topic-graph.md) — prerequisite map for study planning
