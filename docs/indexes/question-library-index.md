# Question Library Index

How to navigate the AI Interview OS question library. This index covers the schema-strict batch files in `docs/question-library/`.

---

## Choose Questions Vs Problem Sets

| Surface | Best when | Link |
|---|---|---|
| Question Library | You want targeted topic drilling and metadata-rich interview prompts | [Question Library](../question-library/README.md) |
| Problem Sets | You want multi-step build, debugging, and design practice | [Problem Sets](../problem-sets/README.md) |
| Module Guides | You need prerequisite order and deeper study notes first | [Module Index](module-index.md) |

---

## How Questions Are Organized

Each module has its own directory under `docs/question-library/`. Questions are released in numbered batches (batch-01, batch-02, etc.) as the library grows. Every question follows the same strict schema so questions are machine-readable and consistently structured.

### Read A Batch In Interview Order

```text
Basic -> Concept -> Design -> Practical Build -> Real Follow-ups -> Architect
```

The batch tables below show where content lives. The flow above shows how to study it without getting lost in indexing.

### Question Schema (Summary)

Every question includes:

| Field | Purpose |
|---|---|
| Topic Family | Which module the question belongs to |
| Subtopic | Specific area within the module |
| Level | Concept / Applied / System / Debugging / Architect |
| Difficulty | 1–5 (see [Difficulty Guide](../../schema/difficulty_guide.md)) |
| Experience Bands | Which career stages the question targets |
| Role Families | Which roles should prioritize this question |
| Interview Round | Where this question typically appears |
| Tags | Technical tags for cross-filtering |
| Why This Matters | Why interviewers ask this |
| Expected Answer | Short 2–5 line answer |
| Deep Answer | Full technical answer with trade-offs and reasoning |
| Practical Build Drill | One bounded implementation task tied to the concept |
| Follow-up Questions | 2–5 real interviewer follow-ups an interviewer might chain |
| Weak Answer Signals | Red flags and shallow patterns to avoid |
| Interviewer Signal | What this question reveals about the candidate |
| Real-World Insight | Production, deployment, or operational connection |

→ Full schema: [Question Schema](../../schema/question_schema.md) · [Tagging System](../../schema/tagging_system.md)

---

## Module Batches

### Core Foundations

| Module | Batch | Questions | Levels | Link |
|---|---|---|---|---|
| Foundations | Batch 01 | 25 | Concept, Applied, System, Debugging, Architect | [foundations-batch-01.md](../question-library/foundations/foundations-batch-01.md) |

### Model and Architecture Families

| Module | Batch | Questions | Levels | Link |
|---|---|---|---|---|
| Transformer and Modern LLM Internals | Batch 01 | 25 | Concept, Applied, System, Debugging, Architect | [transformer-and-modern-llm-internals-batch-01.md](../question-library/transformer-and-modern-llm-internals/transformer-and-modern-llm-internals-batch-01.md) |

### Application and Orchestration

| Module | Batch | Questions | Levels | Link |
|---|---|---|---|---|
| RAG | Batch 01 | 25 | Concept, Applied, System, Debugging, Architect | [rag-batch-01.md](../question-library/rag/rag-batch-01.md) |
| Agents and Agentic Systems | Batch 01 | 25 | Concept, Applied, System, Debugging, Architect | [agents-and-agentic-systems-batch-01.md](../question-library/agents-and-agentic-systems/agents-and-agentic-systems-batch-01.md) |
| Agent Protocols: MCP / A2A / ACP | Batch 01 | 20 | Concept, Applied, System, Debugging, Architect | [agent-protocols-mcp-a2a-acp-batch-01.md](../question-library/agent-protocols-mcp-a2a-acp/agent-protocols-mcp-a2a-acp-batch-01.md) |

### Production and Operations

| Module | Batch | Questions | Levels | Link |
|---|---|---|---|---|
| Systems, Serving, and Inference | Batch 01 | 15 | Concept, Applied, System, Debugging, Architect | [systems-serving-and-inference-batch-01.md](../question-library/systems-serving-and-inference/systems-serving-and-inference-batch-01.md) |
| MLOps / LLMOps / AIOps | Batch 01 | 15 | Concept, Applied, System, Debugging, Architect | [mlops-llmops-aiops-batch-01.md](../question-library/mlops-llmops-aiops/mlops-llmops-aiops-batch-01.md) |

---

## How to Use This Library

### By Role

| Your Role | Start With These Modules |
|---|---|
| Software → AI Engineer | Foundations → Transformer Internals → RAG |
| ML / Data Engineer | Foundations → Systems/Serving → MLOps |
| DL / CV Engineer | Foundations → Transformer Internals → Systems/Serving |
| LLM / RAG / Agent Engineer | Transformer Internals → RAG → Agents |
| MLOps / Platform AI | Systems/Serving → MLOps/LLMOps → Agents |
| DevOps / SRE → AIOps | Systems/Serving → MLOps/LLMOps/AIOps |
| Research / Applied Research | Transformer Internals → Foundations (advanced) |
| Senior / Architect | RAG → Agents → Systems/Serving → MLOps |

### By Experience Band

| Band | Focus |
|---|---|
| 0–2 years | Difficulty 1–2, Concept and Applied levels |
| 2–5 years | Difficulty 2–3, Applied and System levels |
| 5–8 years | Difficulty 3–4, System and Debugging levels |
| 8–12 years | Difficulty 4–5, System, Debugging, and Architect levels |
| 12–20 years | Difficulty 4–5, Architect level, cross-module system design |

### By Interview Round

| Round Type | Recommended Levels |
|---|---|
| Phone screen | Concept, Applied (Difficulty 1–3) |
| Technical deep dive | Applied, System (Difficulty 2–4) |
| System design | System, Architect (Difficulty 3–5) |
| Debugging / incident | Debugging (Difficulty 3–5) |
| Bar raiser / final | Architect (Difficulty 4–5) |

---

## Question Level Distribution

| Level | What It Tests | Target Share |
|---|---|---|
| Concept | First principles, clean definitions, mental models | ~20% |
| Applied | Design choices, trade-offs, practical reasoning | ~30% |
| System | Architecture, scale, reliability, cost | ~20% |
| Debugging | Failure analysis, incidents, recovery | ~15% |
| Architect | Operating model, governance, platform strategy | ~15% |

---

## Anti-Duplication Design

Each module owns distinct question territory:

| Module | Owns These Question Angles |
|---|---|
| Foundations | Python/ML fundamentals, statistics, metrics, tensor/autograd mechanics |
| Transformer Internals | Tokenization, attention, KV cache, MoE, scaling, generation mechanics |
| RAG | Retrieval design, chunking, reranking, grounding, RAG evaluation |
| Agents | Tool calling, planning, memory, multi-agent, governance, HITL |
| Agent Protocols | MCP/A2A/ACP differentiation, delegation, trust, discovery, interop |
| Systems/Serving | GPU, CUDA, batching, quantization, vLLM/TGI, deployment, throughput/latency |
| MLOps/LLMOps/AIOps | Versioning, tracing, observability, drift, rollback, incident response, SLOs |

When topics overlap (e.g., RAG latency vs serving latency), each module asks from its own angle:
- RAG module asks about retrieval latency and end-to-end RAG performance
- Systems module asks about GPU-level serving latency and batching
- MLOps module asks about latency monitoring, alerting, and SLO design

---

## Cross-References

- [Module Index](module-index.md) — module descriptions, prerequisites, sequences
- [Role Index](role-index.md) — role-specific study paths
- [Experience Index](experience-index.md) — band-specific depth expectations
- [Tag Index](tag-index.md) — technical tag cross-references
- [Question Schema](../../schema/question_schema.md) — full schema definition
- [Difficulty Guide](../../schema/difficulty_guide.md) — difficulty level calibration
