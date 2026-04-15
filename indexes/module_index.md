# Module Index

> Complete map of all modules, their scope, level breakdown, and navigation links.

---

## Module Overview

| # | Module | Scope | Questions | Key Topics |
|---|--------|-------|-----------|------------|
| 00 | [Foundations](../modules/00_foundations/) | Python, math, stats, ML basics, data structures for AI | 30–40 | Linear algebra, probability, gradient descent, bias-variance, feature engineering |
| 01 | [PyTorch & Deep Learning](../modules/01_pytorch_and_deep_learning/) | Tensors, autograd, training loops, architectures, optimization | 35–45 | Computational graphs, CNNs, RNNs, optimizers, regularization, GPU training |
| 02 | [Generative AI](../modules/02_genai/) | Prompt engineering, structured output, fine-tuning, inference | 40–55 | Prompt design, LoRA/QLoRA, RLHF, instruction tuning, inference optimization |
| 03 | [LLM Engineering](../modules/03_llm_engineering/) | Tokenization, attention, context, KV cache, sampling, model lifecycle | 40–55 | BPE, MHA/MQA/GQA, RoPE, speculative decoding, quantization, model selection |
| 04 | [RAG](../modules/04_rag/) | Ingestion, chunking, retrieval, reranking, evaluation, assembly | 50–65 | Chunking strategies, hybrid search, rerankers, context assembly, RAG evaluation |
| 05 | [Agentic AI](../modules/05_agentic_ai/) | Planners, tools, state, memory, loops, multi-agent, guardrails | 40–55 | ReAct, plan-execute, tool calling, state machines, supervisor patterns |
| 06 | [LLMOps](../modules/06_llmops/) | Deployment, versioning, observability, cost tracking, evaluation | 35–45 | Serving infrastructure, prompt versioning, token cost, LLM evaluation |
| 07 | [MLOps](../modules/07_mlops/) | Pipelines, experiment tracking, registry, CI/CD, drift, retraining | 35–45 | Experiment tracking, model registry, CI/CD for ML, drift detection |
| 08 | [AIOps](../modules/08_aiops/) | Anomaly detection, log intelligence, alert triage, incident AI | 30–40 | Log parsing, anomaly models, alert correlation, automated remediation |
| 09 | [System Design](../modules/09_system_design/) | End-to-end AI system architecture, scaling, reliability | 35–50 | Architecture patterns, scaling strategies, cost modeling, multi-tenancy |
| 10 | [Debugging & Failure Modes](../modules/10_debugging_and_failure_modes/) | Incident scenarios, root cause analysis, recovery logic | 35–50 | Hallucination debugging, latency diagnosis, cascade failures, post-mortems |
| 11 | [Case Studies](../modules/11_case_studies/) | Cross-cutting real-world scenarios | 15–25 | End-to-end scenarios combining multiple modules |

**Total: 420–570 questions**

---

## Module Detail Cards

### Module 00 — Foundations

**Scope:** Mathematical and programming foundations required for AI engineering. Not a standalone ML course — focused on what interviewers actually test and what practitioners need.

**Key Submodules:**
- Linear algebra essentials (vectors, matrices, projections, eigenvalues)
- Probability and statistics (distributions, Bayes, hypothesis testing)
- Gradient-based optimization (gradient descent, convergence, learning rates)
- ML fundamentals (bias-variance, overfitting, cross-validation, feature engineering)
- Python for AI (NumPy, data structures, efficiency patterns)

**Level Breakdown:**
| Level | Focus |
|-------|-------|
| Concept | Definitions, first principles, mathematical intuitions |
| Applied | Choosing the right technique for a given problem |
| System | How foundational decisions affect model performance at scale |
| Debugging | Diagnosing training failures that trace back to data/math issues |

**Prerequisite Modules:** None (entry point)
**Unlocks:** All other modules

---

### Module 01 — PyTorch & Deep Learning

**Scope:** PyTorch mechanics, deep learning architectures, training workflows, and GPU-level execution. Focused on what practitioners must know to build, train, debug, and optimize neural networks.

**Key Submodules:**
- Tensors and operations (creation, manipulation, broadcasting, device management)
- Autograd and computation graphs (backward pass, gradient flow, custom autograd)
- Training loop engineering (DataLoader, optimizers, schedulers, checkpointing)
- Architectures (CNNs, RNNs, Transformers as building blocks)
- Optimization and regularization (Adam, weight decay, dropout, batch norm)
- GPU training (mixed precision, distributed training, memory management)

**Level Breakdown:**
| Level | Focus |
|-------|-------|
| Concept | What tensors, autograd, and training loops are |
| Applied | Building training pipelines, choosing architectures and optimizers |
| System | Distributed training, multi-GPU, memory optimization |
| Debugging | NaN gradients, OOM errors, training instability, convergence failures |

**Prerequisite Modules:** 00 (Foundations)
**Unlocks:** 02 (GenAI), 03 (LLM Engineering)

---

### Module 02 — Generative AI

**Scope:** Generative AI practitioner skills — prompt engineering, fine-tuning decision-making, inference optimization, and structured output. Not a "what is GenAI" module — focused on applied skill.

**Key Submodules:**
- Prompt engineering (zero/few-shot, chain-of-thought, structured prompting, prompt patterns)
- Structured output (JSON mode, function calling, schema constraints, output parsing)
- Fine-tuning decision framework (when, why, how, vs. prompting vs. RAG)
- LoRA / QLoRA / adapter methods (mechanics, trade-offs, practical considerations)
- RLHF and alignment (reward modeling, DPO, safety tuning)
- Inference optimization (batching, quantization, KV cache, speculative decoding)

**Level Breakdown:**
| Level | Focus |
|-------|-------|
| Concept | What prompt engineering, fine-tuning, and LoRA are |
| Applied | Choosing between prompting, RAG, and fine-tuning for a given problem |
| System | Deploying and optimizing fine-tuned models at scale |
| Debugging | Prompt regression, fine-tuning quality issues, inference bottlenecks |

**Prerequisite Modules:** 00 (Foundations), 01 (helpful but not required)
**Unlocks:** 03 (LLM Engineering), 04 (RAG), 05 (Agentic AI), 06 (LLMOps)

---

### Module 03 — LLM Engineering

**Scope:** The internal mechanics and engineering of large language models. How they tokenize, attend, generate, and can be optimized. This is the "engine" module.

**Key Submodules:**
- Tokenization (BPE, SentencePiece, vocabulary, subword mechanics)
- Attention mechanisms (self-attention, MHA, MQA, GQA, cross-attention)
- Positional encoding (RoPE, ALiBi, absolute vs. relative)
- Context windows (length management, truncation strategies, long-context models)
- KV cache (mechanics, memory footprint, PagedAttention)
- Sampling and decoding (temperature, top-k, top-p, beam search, speculative decoding)
- Model selection (parameter count, capability vs. cost, benchmark interpretation)

**Level Breakdown:**
| Level | Focus |
|-------|-------|
| Concept | How tokenization, attention, and generation work |
| Applied | Choosing models, configuring sampling, managing context |
| System | Inference optimization, serving architecture, model deployment |
| Debugging | Tokenization mismatches, attention artifacts, generation quality issues |

**Prerequisite Modules:** 01 (PyTorch & DL), 02 (GenAI — helpful)
**Unlocks:** 04 (RAG), 05 (Agentic AI), 06 (LLMOps), 09 (System Design)

---

### Module 04 — RAG

**Scope:** The full RAG lifecycle — from document ingestion to answer generation. The most common production AI pattern, and the one with the most failure modes.

**Key Submodules:**
- Ingestion (document parsing, preprocessing, metadata extraction)
- Chunking (strategies, overlap, size trade-offs, semantic chunking)
- Embedding and indexing (model selection, index types, dimensionality)
- Retrieval (dense, sparse, hybrid search, similarity metrics)
- Reranking (cross-encoder rerankers, relevance scoring, ordering)
- Context assembly (template design, token budgeting, source attribution)
- RAG evaluation (retrieval metrics, generation metrics, end-to-end evaluation)
- RAG failure modes (hallucination, context poisoning, retrieval degradation)

**Level Breakdown:**
| Level | Focus |
|-------|-------|
| Concept | What RAG is and why it exists |
| Applied | Designing chunking, retrieval, and reranking pipelines |
| System | Scaling RAG, multi-tenant RAG, production evaluation |
| Debugging | Why RAG answers are wrong, slow, or inconsistent |

**Prerequisite Modules:** 02 (GenAI), 03 (LLM Engineering — helpful)
**Unlocks:** 05 (Agentic AI), 06 (LLMOps), 09 (System Design), 10 (Debugging)

---

### Module 05 — Agentic AI

**Scope:** AI agents — planning, tool use, memory, state management, multi-agent systems, and the many ways they fail.

**Key Submodules:**
- Agent architectures (ReAct, plan-and-execute, function calling, router patterns)
- Tool calling (function calling, API integration, schema design, error handling)
- State and memory (conversation memory, working memory, long-term memory)
- Planning and decomposition (task planning, subtask routing, iterative refinement)
- Multi-agent orchestration (supervisor, hierarchical, collaborative patterns)
- Agent guardrails (input validation, output validation, loop detection, budget limits)
- Agent evaluation (task completion, tool accuracy, trajectory analysis)

**Level Breakdown:**
| Level | Focus |
|-------|-------|
| Concept | What agents are, how they differ from chains |
| Applied | Designing agent systems, choosing patterns, handling tool failures |
| System | Scaling agents, orchestrating multi-agent, production safety |
| Debugging | Loop detection, tool errors, planning failures, state corruption |

**Prerequisite Modules:** 02 (GenAI), 03 (LLM Engineering), 04 (RAG — helpful)
**Unlocks:** 06 (LLMOps), 09 (System Design), 10 (Debugging)

---

### Module 06 — LLMOps

**Scope:** Operating LLM-powered systems in production. Deployment, monitoring, evaluation, cost management, and lifecycle management.

**Key Submodules:**
- LLM deployment (serving infrastructure, API design, model hosting)
- Prompt versioning (template management, A/B testing, migration)
- Observability (tracing, logging, metrics, dashboards for LLM systems)
- Evaluation in production (online evaluation, LLM-as-judge, quality monitoring)
- Cost management (token tracking, cost attribution, optimization strategies)
- Model lifecycle (updates, rollback, fallback, deprecation)
- Guardrails and safety (input/output filters, hallucination detection, compliance)

**Level Breakdown:**
| Level | Focus |
|-------|-------|
| Concept | What LLMOps covers and how it differs from MLOps |
| Applied | Setting up observability, cost tracking, evaluation pipelines |
| System | Operating LLMs across multiple products and teams |
| Debugging | Diagnosing production LLM quality regressions |

**Prerequisite Modules:** 02 (GenAI), 03 (LLM Engineering)
**Unlocks:** 07 (MLOps), 09 (System Design)

---

### Module 07 — MLOps

**Scope:** End-to-end ML operations — pipelines, experiment management, model registry, CI/CD for ML, drift detection, and retraining.

**Key Submodules:**
- ML pipelines (orchestration, DAGs, data processing, feature engineering)
- Experiment tracking (logging, comparison, reproducibility)
- Model registry (versioning, staging, promotion, metadata)
- CI/CD for ML (testing, validation gates, automated deployment)
- Drift detection (data drift, model drift, concept drift, monitoring)
- Retraining (triggers, automation, data management, rollback)
- Feature stores (feature computation, serving, consistency)

**Level Breakdown:**
| Level | Focus |
|-------|-------|
| Concept | What MLOps is and why it exists |
| Applied | Building pipelines, tracking experiments, managing models |
| System | Scaling MLOps across teams and environments |
| Debugging | Pipeline failures, drift diagnosis, retraining issues |

**Prerequisite Modules:** 00 (Foundations), 01 (PyTorch — helpful)
**Unlocks:** 06 (LLMOps), 08 (AIOps), 09 (System Design)

---

### Module 08 — AIOps

**Scope:** AI for operations — anomaly detection, log intelligence, alert triage, and AI-assisted incident management.

**Key Submodules:**
- Anomaly detection (statistical methods, ML approaches, threshold management)
- Log intelligence (log parsing, pattern extraction, semantic analysis)
- Alert triage and correlation (noise reduction, alert grouping, prioritization)
- AI-assisted incident management (root cause suggestion, runbook automation, post-mortem AI)
- Ops workflow automation (auto-remediation, capacity planning, change risk assessment)

**Level Breakdown:**
| Level | Focus |
|-------|-------|
| Concept | What AIOps is and what problems it solves |
| Applied | Building anomaly detection, log analysis, alert systems |
| System | Deploying AIOps at scale, integration with existing monitoring |
| Debugging | When AIOps itself fails — false positives, missed anomalies, trust issues |

**Prerequisite Modules:** 00 (Foundations), 07 (MLOps — helpful)
**Unlocks:** 09 (System Design)

---

### Module 09 — System Design

**Scope:** End-to-end AI system architecture. The interview round that senior+ engineers face. Covers architecture patterns, scaling, reliability, cost, and organizational trade-offs.

**Key Submodules:**
- Architecture patterns (RAG systems, agent systems, ML serving, hybrid systems)
- Scaling strategies (horizontal, vertical, auto-scaling, queueing, caching)
- Reliability and failover (circuit breakers, fallback, redundancy, SLAs)
- Cost modeling (token costs, GPU costs, infrastructure budgeting)
- Multi-tenancy (isolation, per-tenant customization, cost allocation)
- Data architecture (ingestion, storage, indexing, privacy, compliance)
- End-to-end design exercises (full system design walkthroughs)

**Level Breakdown:**
| Level | Focus |
|-------|-------|
| Concept | What system design for AI entails, key patterns |
| Applied | Designing specific components of AI systems |
| System | Designing complete systems with all trade-offs |
| Debugging | Diagnosing architectural issues, bottleneck analysis |

**Prerequisite Modules:** All prior modules (recommended); 03, 04, 05, 06 (minimum)
**Unlocks:** 10 (Debugging), 11 (Case Studies)

---

### Module 10 — Debugging & Failure Modes

**Scope:** Incident-style scenarios, root cause analysis, recovery logic, and anti-patterns. The "what happens when things go wrong" module.

**Key Submodules:**
- Hallucination debugging (retrieval-induced, knowledge cutoff, conflicting context)
- Latency and performance debugging (P95 spikes, throughput drops, cold starts)
- Retrieval debugging (relevance degradation, index corruption, embedding drift)
- Agent debugging (loops, tool failures, planning errors, state corruption)
- Pipeline debugging (data quality, feature skew, training-serving mismatch)
- Cascade failures (multi-component failure propagation, blast radius)
- Incident response (triage, communication, mitigation, post-mortem)
- Anti-patterns (common mistakes across the AI stack)

**Level Breakdown:**
| Level | Focus |
|-------|-------|
| Concept | Common failure categories and mental models for debugging |
| Applied | Debugging specific failure types with structured approaches |
| System | Cross-system debugging, cascade diagnosis, monitoring design for debuggability |
| Debugging | Complex incident scenarios requiring multi-factor analysis |

**Prerequisite Modules:** Varies by submodule (questions specify prerequisites)
**Unlocks:** 11 (Case Studies)

---

### Module 11 — Case Studies

**Scope:** Cross-cutting real-world scenarios that combine concepts from multiple modules. Designed for senior/architect prep and system design practice.

**Format:** Each case study is a self-contained scenario with:
- Business context
- Technical constraints
- Architecture decisions
- Failure modes
- Evolution over time

**Prerequisite Modules:** Recommended: all modules. Minimum: 5+ modules completed.
**Unlocks:** None (capstone module)

---

## Module Dependency Graph

```
00_foundations
├── 01_pytorch_and_deep_learning
│   ├── 02_genai
│   │   ├── 03_llm_engineering
│   │   │   ├── 04_rag
│   │   │   │   ├── 05_agentic_ai
│   │   │   │   └── 10_debugging (rag-specific)
│   │   │   └── 06_llmops
│   │   └── 05_agentic_ai
│   └── 03_llm_engineering
├── 07_mlops
│   ├── 06_llmops
│   └── 08_aiops
└── 09_system_design (draws from all)
    └── 11_case_studies (capstone)
```

---

## Cross-Module Topic Map

This table shows which topics appear in multiple modules and how they are differentiated:

| Topic | Primary Module | Also Appears In | Differentiation |
|-------|---------------|-----------------|----------------|
| Embeddings | 04 (RAG) | 03 (LLM Eng) | RAG: retrieval quality. LLM Eng: representation mechanics |
| Fine-tuning | 02 (GenAI) | 06 (LLMOps) | GenAI: when/how to fine-tune. LLMOps: deploying fine-tuned models |
| Latency | 03 (LLM Eng) | 09 (Sys Design) | LLM Eng: inference optimization. Sys Design: end-to-end budget |
| Hallucination | 04 (RAG) | 10 (Debugging) | RAG: retrieval-induced causes. Debugging: cross-system diagnosis |
| Guardrails | 05 (Agentic) | 06 (LLMOps) | Agentic: agent safety controls. LLMOps: production guard systems |
| Drift | 07 (MLOps) | 08 (AIOps) | MLOps: detection. AIOps: automated response |
| Cost | 02 (GenAI) | 06 (LLMOps) | GenAI: model/inference cost. LLMOps: token cost tracking |
| Evaluation | 04 (RAG) | 06 (LLMOps) | RAG: retrieval/generation quality. LLMOps: production eval pipelines |
| Observability | 06 (LLMOps) | 07 (MLOps) | LLMOps: LLM-specific. MLOps: general ML pipeline |
| Tool calling | 05 (Agentic) | 10 (Debugging) | Agentic: design. Debugging: failure analysis |
