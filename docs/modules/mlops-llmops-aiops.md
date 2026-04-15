# MLOps / LLMOps / AIOps

Topic family L · Prerequisites: Model training, serving, production systems · Unlocks: End-to-end production AI lifecycle management

This module groups the operational disciplines needed to build, deploy, observe, and recover AI systems in production.

---

## Scope

- MLOps: training pipelines, experiment tracking, data/model versioning, retraining
- LLMOps: prompt lifecycle, tracing, token cost monitoring, fallback logic
- RAGOps: index freshness, retrieval monitoring, grounding quality
- AgentOps: trajectory tracing, tool reliability, budget and safety controls
- AIOps: operational intelligence, anomaly detection, automation boundaries
- Observability: tracing, metrics, logs, evaluation in production
- Deployment: pipelines, canary, rollback, A/B testing
- Governance: SLOs, SLAs, compliance, audit trails

## Why This Module Matters

Production AI quality is not only a model problem. It is a lifecycle problem. This module exists to test whether the candidate understands the operating loop around the model.

---

## Subtopic Breakdown

### MLOps
- **Experiment tracking:** Recording hyperparameters, metrics, artifacts for every training run
- **Data versioning:** Tracking which data was used to train which model (DVC, Delta Lake, etc.)
- **Model registry:** Central catalog of trained models with metadata, lineage, and approval status
- **Training pipelines:** Automated, reproducible pipelines from raw data to trained model
- **Validation gates:** Automated quality checks before a model is promoted (accuracy thresholds, regression tests)
- **Retraining triggers:** When to retrain — scheduled, drift-based, performance-based
- **Feature stores:** Centralized feature management for consistent training and serving features
- **Interview focus:** Can you trace from a production prediction back to the data and code that produced it?

### LLMOps
- **Prompt versioning:** Tracking prompt changes with the same rigor as code changes
- **Online evaluation:** Running evaluation in production, not just at development time
- **Tracing:** End-to-end request traces through prompt → model → post-processing → response
- **Token cost monitoring:** Tracking and alerting on token usage and spend per model, per feature, per tenant
- **Fallback and routing:** What happens when the primary model fails or exceeds latency/cost budget
- **Model/provider management:** Managing multiple LLM providers, versions, and switching logic
- **Guardrail orchestration:** Input/output safety checks as part of the serving pipeline
- **Interview focus:** How do you know your LLM application is working correctly in production?

### RAGOps
- **Index freshness:** Monitoring whether retrieved documents are current (stale index = wrong answers)
- **Chunk/version governance:** Tracking which chunks are in the index, when they were indexed, from which source
- **Retrieval quality monitoring:** Measuring relevance of retrieved chunks in production
- **Grounding verification:** Checking whether model outputs are actually supported by retrieved context
- **Retrieval incident response:** What to do when retrieval quality degrades — rollback index, investigate source data
- **Interview focus:** Your RAG system starts hallucinating more — how do you diagnose and fix it?

### AgentOps
- **Trajectory tracing:** Recording every step of an agent's execution: plan, tool calls, intermediate results, final output
- **Tool reliability monitoring:** Tracking tool call success rates, latency, and error patterns
- **Budget controls:** Maximum tool calls, token limits, wall-clock time limits per agent task
- **Loop detection:** Identifying when agents get stuck in infinite or unproductive loops
- **Handoff monitoring:** Tracking agent-to-human and agent-to-agent handoffs
- **Safety controls:** Monitoring for side-effect violations, unauthorized tool use, budget exceedance
- **Interview focus:** An agent is spending 10x the expected tokens per task — how do you investigate?

### AIOps
- **Operational intelligence:** Using AI to assist with infrastructure monitoring and incident management
- **Anomaly detection:** ML-based detection of unusual patterns in system telemetry
- **Alert triage:** Prioritizing and grouping alerts to reduce noise for operators
- **Root cause analysis:** Tracing from symptoms to causes across complex distributed systems
- **Automation boundaries:** Where AI assistance helps operators vs where it should not make decisions alone
- **Interview focus:** AIOps is a tool for operators, not a replacement for operators

---

## Operational Discipline Matrix

| Ops Domain | What You Version | What You Monitor | What You Rollback |
|---|---|---|---|
| MLOps | Data, features, models, code | Training metrics, data drift, model performance | Model to previous version, data to previous snapshot |
| LLMOps | Prompts, model provider config, guardrails | Token cost, latency, quality metrics, safety | Prompt to previous version, model to fallback |
| RAGOps | Chunks, indexes, embedding model | Retrieval relevance, index freshness, grounding quality | Index to previous build, embedding model to previous version |
| AgentOps | Agent config, tool set, budget rules | Trajectory length, tool errors, budget usage | Agent to simpler mode, disable tools, increase HITL |
| AIOps | Detection rules, automation runbooks | Alert volume, triage accuracy, false positive rate | Automation to manual, rule to previous version |

---

## What Interviewers Test by Band

### 0–2 years
- Understands the lifecycle and basic tooling (MLflow, W&B, etc.)
- Knows what experiment tracking, model registry, and deployment are
- Can explain why versioning matters

### 2–5 years
- Can explain deployment, rollback, and monitoring strategy for a specific system
- Understands LLMOps concerns: prompt versioning, tracing, cost monitoring
- Can compare MLOps vs LLMOps: what changes when the model is an LLM?

### 5–8 years
- Can design production controls and investigation flows
- Understands RAGOps and AgentOps as distinct operational disciplines
- Can design observability strategy for a multi-model system

### 8+ years
- Can define operating model and platform boundaries across teams
- Can reason about operational economics: cost of monitoring vs cost of failure
- Can design governance for AI systems: SLOs, SLAs, compliance, audit trails

---

## Depth Ladder

| Level | What Good Looks Like | What Answers Should NOT Be |
|---|---|---|
| Concept | Understands why ops matters and what the lifecycle stages are | "Train the model and deploy it" with no mention of monitoring or rollback |
| Applied | Can set up tracking, versioning, and monitoring for a specific system | Naming tools (MLflow, W&B) without explaining what problem they solve |
| System | Can design end-to-end ops for a production AI system | Discussing MLOps without addressing LLMOps or RAGOps concerns |
| Debugging | Can investigate production issues using traces, metrics, and version history | "Check the logs" without a systematic investigation approach |
| Architect | Can define ops strategy for an organization with multiple AI systems | One-size-fits-all ops design that doesn't account for different AI system types |

---

## Anti-Patterns and Weak Answers

- Treating observability as only logs and dashboards
- Ignoring prompt and retrieval versioning while tracking only model versions
- Discussing incident response without rollback strategy
- Treating AIOps as an autonomous replacement for SRE judgment
- Monitoring only accuracy, ignoring cost, latency, and safety metrics
- Not distinguishing between MLOps and LLMOps operational requirements
- Treating governance as a checkbox exercise rather than an operational discipline

---

## Role Relevance

| Role | Depth Needed | Focus Areas |
|---|---|---|
| Platform AI | ★★★ | Full platform: training pipelines, serving, monitoring, governance |
| DevOps → AIOps | ★★★ | Deployment, monitoring, incident response, AIOps tools |
| Senior / Architect | ★★★ | Operating model design, governance, cross-team platform strategy |
| LLM / RAG / Agent | ★★ | LLMOps, RAGOps, AgentOps — ops for the systems they build |
| Data / ML | ★★ | MLOps: experiment tracking, data versioning, training pipelines |
| Software → AI | ★★ | Deployment integration, CI/CD for AI, monitoring integration |
| Research | ★ | Experiment tracking, reproducibility, evaluation infrastructure |
| DL / CV | ★ | Training pipelines, model registry, CV-specific serving ops |

---

## What To Study Next

- [Systems, Serving, and Inference](./systems-serving-and-inference.md) — the serving infrastructure that ops wraps around
- [RAG](./rag.md) — RAGOps requires understanding RAG systems
- [Agents and Agentic Systems](./agents-and-agentic-systems.md) — AgentOps requires understanding agent patterns
- [Agent Protocols](./agent-protocols-mcp-a2a-acp.md) — protocol monitoring in agent systems
- [Alignment / Post-Training](./alignment-post-training.md) — evaluation and safety ops concerns

## Question Bank

Practice questions for this module are in the operations question banks:
- [LLMOps question bank](../../modules/06_llmops/)
- [MLOps question bank](../../modules/07_mlops/)
- [AIOps question bank](../../modules/08_aiops/)

## Cross-References

- [Module Index](../indexes/module-index.md) — all modules with sequences and detail cards
- [Experience Index](../indexes/experience-index.md) — depth expectations by career band
- [Tag Index](../indexes/tag-index.md) — related tags: `mlops`, `llmops`, `ragops`, `agentops`, `aiops`, `observability`, `tracing`, `experiment-tracking`, `versioning`, `drift`, `rollback`, `incident-response`, `governance`, `slo`
- [Topic Graph](../topic-graph.md) — prerequisite map
