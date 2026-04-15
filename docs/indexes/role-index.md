# Role Index

Use this index if you want to enter AI Interview OS by job family instead of by topic.

Every role page includes: who this role is for, what companies expect, strengths, gaps, study order, prep strategies, typical failure points, 30-day and 90-day plans.

---

## Role Pages

1. [Python / Software Foundations → AI Engineer](../personas/software-foundations-to-ai-engineer.md)
2. [Data / ML Engineer](../personas/ml-data-engineer.md)
3. [Deep Learning / Computer Vision Engineer](../personas/deep-learning-cv-engineer.md)
4. [LLM / RAG / Agent Engineer](../personas/llm-rag-agent-engineer.md)
5. [MLOps / LLMOps / Platform AI Engineer](../personas/mlops-llmops-platform-engineer.md)
6. [DevOps / SRE → AIOps Engineer](../personas/devops-sre-to-aiops.md)
7. [Research / Applied Research / Model Research](../personas/research-applied-research.md)
8. [Senior / Architect / AI Systems Lead](../personas/senior-architect-ai-systems-lead.md)

---

## Fast Start by Background

| Your Background | Start Here | Then Move To |
|---|---|---|
| Strong Python / backend | [Software Foundations → AI Engineer](../personas/software-foundations-to-ai-engineer.md) | [Transformer Internals](../modules/transformer-and-modern-llm-internals.md), [RAG](../modules/rag.md) |
| ML / data pipelines | [Data / ML Engineer](../personas/ml-data-engineer.md) | [Systems / Serving](../modules/systems-serving-and-inference.md), [MLOps](../modules/mlops-llmops-aiops.md) |
| CV / model training | [Deep Learning / CV Engineer](../personas/deep-learning-cv-engineer.md) | [Multimodal / VLMs](../modules/multimodal-and-vlms.md), [Serving](../modules/systems-serving-and-inference.md) |
| LLM features / copilots | [LLM / RAG / Agent Engineer](../personas/llm-rag-agent-engineer.md) | [Agent Protocols](../modules/agent-protocols-mcp-a2a-acp.md), [MLOps](../modules/mlops-llmops-aiops.md) |
| Platform / infra | [MLOps / LLMOps / Platform AI Engineer](../personas/mlops-llmops-platform-engineer.md) | [Systems / Serving](../modules/systems-serving-and-inference.md), [Agents](../modules/agents-and-agentic-systems.md) |
| SRE / operations | [DevOps / SRE → AIOps Engineer](../personas/devops-sre-to-aiops.md) | [MLOps / LLMOps / AIOps](../modules/mlops-llmops-aiops.md) |
| Research / applied science | [Research / Applied Research](../personas/research-applied-research.md) | [Alignment / Post-training](../modules/alignment-post-training.md), [Serving](../modules/systems-serving-and-inference.md) |
| Senior lead / architect | [Senior / Architect / AI Systems Lead](../personas/senior-architect-ai-systems-lead.md) | [Topic Graph](../topic-graph.md), [Role Experience Matrix](../role-experience-matrix.md) |

---

## What Each Role Is Judged On

| Role | Primary Interview Bias | Secondary Focus |
|---|---|---|
| Software → AI | Implementation quality, practical model understanding, system integration | Evaluation reasoning, latency/cost awareness |
| Data / ML | Modeling discipline, evaluation, feature/data quality, lifecycle management | Serving trade-offs, drift and retraining strategy |
| DL / CV | Architecture selection, training mechanics, data/optimization quality | Deployment cost, multimodal extensions |
| LLM / RAG / Agent | Retrieval, prompting, tool use, evals, production reliability | Agent governance, serving economics, protocol awareness |
| Platform AI | Serving, routing, observability, rollout, governance, multi-tenant controls | Model-to-platform alignment, eval pipeline design |
| DevOps / SRE → AIOps | Reliability, incident handling, monitoring, scaling, operational automation | AI-specific failure modes, retrieval/agent debugging |
| Research | Architecture reasoning, evaluation rigor, ablations, training trade-offs | Deployment consequences, cost awareness |
| Senior / Architect | System boundaries, portfolio trade-offs, governance, cost, org fit | Current-generation model and serving realities |

---

## Role × Module Priority Matrix

Stars indicate depth needed:

| Module | SWE→AI | ML/Data | DL/CV | LLM/RAG | Platform | SRE→AIOps | Research | Architect |
|---|---|---|---|---|---|---|---|---|
| Foundations | ★★★ | ★★ | ★★ | ★★ | ★★ | ★★★ | ★★ | ★ |
| Classical ML | ★★ | ★★★ | ★★ | ★ | ★ | ★★ | ★★ | ★ |
| Deep Learning Core | ★★ | ★★★ | ★★★ | ★★ | ★ | ★ | ★★★ | ★ |
| CV / Generative Arch | ★ | ★ | ★★★ | ★ | ★ | — | ★★★ | ★ |
| Transformer / LLM | ★★★ | ★★★ | ★★ | ★★★ | ★★ | ★★ | ★★★ | ★★ |
| Multimodal / VLMs | ★ | ★ | ★★★ | ★ | ★ | — | ★★★ | ★ |
| RAG | ★★★ | ★★ | ★ | ★★★ | ★★ | ★★ | ★ | ★★★ |
| Agents | ★★ | ★ | ★ | ★★★ | ★★ | ★★ | ★ | ★★★ |
| Protocols (MCP/A2A/ACP) | ★ | ★ | — | ★★★ | ★★ | ★ | ★ | ★★ |
| Serving / Inference | ★★ | ★★ | ★★ | ★★★ | ★★★ | ★★★ | ★★ | ★★★ |
| Alignment / Post-training | ★ | ★★ | ★ | ★★ | ★ | ★ | ★★★ | ★ |
| Operations (MLOps/LLMOps) | ★★ | ★★★ | ★ | ★★ | ★★★ | ★★★ | ★ | ★★★ |

★★★ = essential depth · ★★ = working depth · ★ = conceptual awareness · — = not typically tested

---

## Cross-References

- [Role Experience Matrix](../role-experience-matrix.md) — expectations by role × experience band
- [Experience Index](./experience-index.md) — entry by career stage
- [Module Index](./module-index.md) — all 12 modules with sequences
- [Topic Graph](../topic-graph.md) — prerequisite dependencies
