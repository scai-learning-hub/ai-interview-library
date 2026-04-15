# AI Interview OS — Architecture Blueprint

> Internal design document. Defines the system architecture, content model, generation policies, and quality contracts for the entire AI Interview OS repository.

---

## 1. Product Vision

**AI Interview OS** is a role-aware, experience-calibrated interview preparation operating system for engineers targeting modern AI roles in 2026 and beyond. It is organized as a navigable system — not a question dump — where every question has a schema, every path has a purpose, and every module builds toward production-grade thinking.

### What This Is

- A role-oriented interview prep OS with 8 role families and 5 experience bands
- A topic graph with prerequisite dependencies, not a flat syllabus
- A difficulty ladder (concept → applied → system → debugging → architect) across 12 topic families
- A career-stage navigation system serving 2–20 years of experience
- A production-focused technical preparation resource with strict quality gates
- A Docusaurus-ready static site with schema-driven question bank for filtering, scoring, and future automation

### What This Is Not

- A random collection of interview questions
- A syllabus dump or notes library
- A one-size-fits-all roadmap
- A beginner-only cheat sheet
- A marketing-driven content dump

### Core Design Principles

1. **Structure before volume** — Scalable architecture that cleanly holds 400–600+ questions
2. **Production-first** — Every question connects to how things work or break in real systems
3. **Schema-strict** — Every question follows an identical metadata schema for machine-readability
4. **Role-oriented** — Users enter by job family and get role-specific depth guidance
5. **Experience-calibrated** — Expectations scale with seniority; more years ≠ more model depth
6. **Topic-graph aware** — Prerequisites matter; depth depends on dependency order
7. **Difficulty-progressive** — Each module escalates from concept to architect
8. **Deduplicated** — Cross-module overlaps are deliberate and angle-differentiated
9. **Interview-realistic** — Questions test reasoning, trade-offs, and diagnosis — not recall

### Key Differentiation Rules

The system explicitly separates:
- **Research depth vs engineering depth** — mathematical reasoning vs systems/cost/scaling reasoning
- **Training-side vs inference-side depth** — optimization/fine-tuning vs serving/latency/throughput
- **Model-building vs system-building** — knowing ResNet ≠ designing a CV inference platform
- **Foundation vs interview expectation** — everyone studies CNNs, not everyone gets deeply interviewed on GANs

---

## 2. Repository Tree

```
AI-Interview-OS/
│
├── README.md                            ← Navigation hub and entry point
├── ARCHITECTURE_BLUEPRINT.md            ← This document
├── LICENSE
│
├── docs/                                ← Information architecture layer
│   ├── interview-philosophy.md          ← How the interview system works
│   ├── role-experience-matrix.md        ← Role × experience band expectations
│   ├── topic-graph.md                   ← Topic dependencies and traversal paths
│   │
│   ├── modules/                         ← 12 topic family pages
│   │   ├── foundations.md
│   │   ├── classical-ml.md
│   │   ├── deep-learning-core.md
│   │   ├── cv-and-generative-architectures.md
│   │   ├── transformer-and-modern-llm-internals.md
│   │   ├── multimodal-and-vlms.md
│   │   ├── rag.md
│   │   ├── agents-and-agentic-systems.md
│   │   ├── agent-protocols-mcp-a2a-acp.md
│   │   ├── systems-serving-and-inference.md
│   │   ├── alignment-post-training.md
│   │   └── mlops-llmops-aiops.md
│   │
│   ├── personas/                        ← 8 role family pages
│   │   ├── software-foundations-to-ai-engineer.md
│   │   ├── ml-data-engineer.md
│   │   ├── deep-learning-cv-engineer.md
│   │   ├── llm-rag-agent-engineer.md
│   │   ├── mlops-llmops-platform-engineer.md
│   │   ├── devops-sre-to-aiops.md
│   │   ├── research-applied-research.md
│   │   └── senior-architect-ai-systems-lead.md
│   │
│   └── indexes/                         ← Cross-cutting navigation
│       ├── role-index.md
│       ├── module-index.md
│       ├── experience-index.md
│       └── tag-index.md
│
├── modules/                             ← Question bank (by topic, by level)
│   ├── 00_foundations/
│   │   ├── README.md
│   │   ├── concept.md
│   │   ├── applied.md
│   │   ├── system.md
│   │   └── debugging.md
│   ├── 01_pytorch_and_deep_learning/
│   ├── 02_genai/
│   ├── 03_llm_engineering/
│   ├── 04_rag/
│   ├── 05_agentic_ai/
│   ├── 06_llmops/
│   ├── 07_mlops/
│   ├── 08_aiops/
│   ├── 09_system_design/
│   ├── 10_debugging_and_failure_modes/
│   └── 11_case_studies/
│
├── interview_modes/                     ← Prep-style navigation
│   └── README.md
│
├── schema/                              ← Question format and standards
│   ├── question_schema.md
│   ├── tagging_system.md
│   └── difficulty_guide.md
│
└── indexes/                             ← Master indexes (generated/maintained)
    ├── master_question_index.md
    ├── module_index.md
    ├── persona_index.md
    └── tag_index.md
```

---

## 3. Topic Families (12 Modules)

### Module Inventory

| ID | Topic Family | Scope | Target Questions |
|----|-------------|-------|-----------------|
| A | Foundations | Python, data structures, NumPy/tensor thinking, linear algebra, probability/statistics, optimization, metrics, autograd | 30–40 |
| B | Classical ML | Supervised/unsupervised learning, feature engineering, evaluation, bias/variance, trees, SVM, dimensionality reduction, anomaly detection | 25–35 |
| C | Deep Learning Core | Tensors, CUDA, batching, forward/backward, loss, normalization, regularization, optimization, training loops, distributed training | 35–45 |
| D | CV / Generative Architectures | CNN, ResNet, YOLO, U-Net, autoencoders, GANs, RNN/LSTM/GRU, transformers, ViT, Mamba, diffusion | 35–45 |
| E | Transformer / Modern LLM Internals | Tokenization, embeddings, positional encoding, RoPE, attention, MHA/GQA, KV cache, context windows, scaling, MoE, inference trade-offs | 40–55 |
| F | Multimodal / VLMs | CLIP, BLIP, SigLIP, Flamingo, image-text alignment, multimodal retrieval, VLM evaluation | 20–30 |
| G | RAG | Ingestion, chunking, embeddings, indexing, retrieval, reranking, context assembly, grounding, basic/hybrid/graph RAG, evaluation, failure modes | 50–65 |
| H | Agents / Agentic Systems | Tool calling, planners, memory, supervisors, reflection, retries, HITL, multi-agent, governance | 40–55 |
| I | Agent Protocols (MCP/A2A/ACP) | Protocol differentiation, local tools vs remote agents, discovery, delegation, identity/trust, complement vs overlap | 20–30 |
| J | Systems / Serving / Inference | PyTorch, Lightning, CUDA, kernels, memory, throughput/latency, batching, quantization, vLLM, TGI, deployment | 40–55 |
| K | Alignment / Post-training | SFT, RLHF, DPO, reward models, evaluation, safety/harmlessness, retrieval vs prompting vs fine-tuning vs preference optimization | 20–30 |
| L | MLOps / LLMOps / AIOps | MLOps, LLMOps, RAGOps, AgentOps, AIOps, observability, tracing, versioning, pipelines, drift, rollback, incident response, governance | 45–60 |

**Total target: 400–560 questions**

### Level Distribution Per Module

| Level | Share | Purpose |
|-------|-------|---------|
| Concept | 20% | First principles, mental models, clean definitions |
| Applied | 35% | Design choices, trade-offs, practical reasoning |
| System | 20% | Architecture, scale, reliability, cost |
| Debugging | 15% | Failure analysis, incidents, anti-patterns, recovery |
| Architect | 10% | Operating model, governance, platform strategy |

### Cross-Module Differentiation Strategy

| Concept | Module A Angle | Module B Angle |
|---------|---------------|---------------|
| Embeddings | RAG: retrieval quality, indexing | Transformer Internals: tokenization, representation |
| Fine-tuning | Alignment: SFT/DPO behavior shaping | Operations: deployment and versioning of fine-tuned models |
| Latency | Transformer Internals: inference optimization | Systems/Serving: end-to-end serving budget |
| Hallucination | RAG: retrieval-induced hallucination | Operations: diagnosing hallucination root cause |
| Drift | Operations: data/model drift detection | AIOps: automated response to drift alerts |
| Guardrails | Agents: agent safety controls | Operations: production guardrail systems |
| Cost | Transformer Internals: inference cost | Operations: token cost tracking and optimization |
| Attention | Transformer Internals: mechanism and memory | Systems/Serving: KV cache economics and batching |
| Quantization | Systems/Serving: quality vs speed trade-offs | Operations: deployment pipeline for quantized models |
| Tool calling | Agents: reliability and side-effect safety | Protocols: MCP integration and remote tool access |

---

## 4. Role Families (8 Personas)

### Role Family Inventory

| # | Role Family | Subtypes Included |
|---|------------|-------------------|
| 1 | Python / Software Foundations → AI Engineer | Backend devs, full-stack devs, API engineers moving into AI features |
| 2 | Data / ML Engineer | MLEs, data scientists, data engineers, model-focused engineers |
| 3 | Deep Learning / Computer Vision Engineer | CV engineers, perception engineers, model training specialists |
| 4 | LLM / RAG / Agent Engineer | Copilot builders, retrieval engineers, applied AI engineers |
| 5 | MLOps / LLMOps / Platform AI Engineer | ML platform engineers, LLM infra engineers, shared AI tooling |
| 6 | DevOps / SRE → AIOps Engineer | SREs, DevOps supporting AI, observability engineers |
| 7 | Research / Applied Research / Model Research | Applied scientists, model researchers, research engineers |
| 8 | Senior / Architect / AI Systems Lead | Staff/principal engineers, AI platform leads, technical directors |

### Role → Topic Family Priority

| Role Family | Essential Topics | Important | Selective |
|---|---|---|---|
| Software → AI | A, C, E, G, J | B, H, L | D, F, I, K |
| Data / ML | A, B, C, E, J, L | G, K | D, F, H, I |
| DL / CV | A, C, D, E, J | F, L | G, H, I, K |
| LLM / RAG / Agent | A, E, G, H, J, L | C, I, K | B, D, F |
| Platform AI | A, E, J, L | G, H, I | B, C, D, F, K |
| DevOps / SRE → AIOps | A, J, L | E, G, H | B, C, D, F, I, K |
| Research | A, C, D, E, F, K | J | B, G, H, I, L |
| Senior / Architect | E, G, H, J, L | I, K | A, B, C, D, F |

---

## 5. Experience Bands

| Band | Interview Expectation | Judged On |
|---|---|---|
| 0–2 years | Correct foundations, clean implementation, no invented explanations | Terminology, code, metrics, basic reasoning |
| 2–5 years | Applied reasoning, implementation trade-offs, debugging competence | Design choices, failure modes, evaluation fluency |
| 5–8 years | Production ownership, system trade-offs, deployment maturity | Operating systems, constraints, multi-factor diagnosis |
| 8–12 years | Cross-system design, platform thinking, governance | Architecture, boundaries, controls, cost |
| 12–20 years | Organization-level architecture, operating model, risk management | Platform strategy, staffing/governance trade-offs, long-term direction |

More years does NOT always mean more model depth. Senior candidates are increasingly judged on system design, architecture trade-offs, governance, reliability, and platform thinking.

---

## 6. Interview Mode Plan

| Mode | Purpose | Target User | Duration |
|------|---------|-------------|----------|
| Screening Prep | Baseline calibration | Anyone with <7 days | 3–7 days |
| Technical Round Prep | Feature-level interviews | Active interviewing | Per-session |
| Deep Dive Prep | Full progressive depth | Dedicated prep | 30–60 days |
| System Design Prep | Architecture and scaling | Senior/architect | 7–14 days |
| Debugging Prep | Incident and failure focus | Senior/mid-level | 5–10 days |
| Research Discussion Prep | Architecture and experimental reasoning | Research roles | 7–14 days |

---

## 7. Question Generation Policy

### Question Schema

Format: `Q-{TOPIC_LETTER}-{LEVEL_CODE}-{SEQUENCE}`

- TOPIC_LETTER: A–L (matching topic family)
- LEVEL_CODE: C (Concept), A (Applied), S (System), D (Debugging), R (Architect)
- SEQUENCE: Three-digit sequential number

Examples:
- `Q-E-C-001` — Transformer Internals, Concept level, first question
- `Q-G-A-012` — RAG, Applied level, 12th question
- `Q-L-D-003` — Operations, Debugging level, 3rd question

### Required Schema Fields

Every question must include:
- Topic Family, Subtopic, Level, Difficulty (1–5)
- Experience Bands, Role Families, Interview Round
- Prerequisites, Tags, Why This Matters
- Question, Expected Answer (Short), Deep Answer
- Follow-up Questions (2–5), Weak Answer Signals / Red Flags
- Interviewer Signal, Real-World Insight

### Generation Rules

1. No question without full schema
2. No question without ≥2 follow-ups
3. No shallow questions at Applied+ levels
4. Production connection required at Applied+
5. Experience band accuracy enforced
6. Cross-module angle differentiation verified pre-generation

### Answer Quality Rules

- **Expected Answer:** 2–5 lines. Technically precise.
- **Deep Answer:** Bullet points with trade-offs, caveats, production reasoning.
- **Weak Answer Signals:** Reflect actual interviewer experience.
- **Interviewer Signal:** What this question reveals about the candidate.
- **Real-World Insight:** Specific system behaviors, not hypotheticals.

---

## 8. Deduplication Policy

Before generating any module's questions:
1. List shared concepts with other modules
2. Define unique angle for this module
3. Verify no other module covers the same angle

Two questions are near-duplicates if:
- Same concept at same level
- Expected answers overlap >70%
- Follow-ups are interchangeable

Action: Merge, reassign to different level/angle, or differentiate explicitly.

---

## 9. Quality Bar

### Per-Module Checklist

- [ ] Questions at all 5 levels (Concept, Applied, System, Debugging, Architect)
- [ ] Level distribution approximately 20/35/20/15/10
- [ ] No question answerable with a single definition
- [ ] All Applied+ questions reference production contexts
- [ ] Every question has ≥2 follow-ups
- [ ] No two questions test the same thing at the same angle
- [ ] Difficulty range spans 1–5
- [ ] Experience bands span 0–2yr through 12–20yr
- [ ] All schema fields populated
- [ ] Weak answers reflect realistic bad responses
- [ ] Real-world insights are specific

### Module Rejection Criteria

A module must be revised if:
- >30% of questions are pure recall
- Debugging level has fewer than 3 questions
- No question exceeds difficulty 3
- Follow-ups are generic
- Real-world insights are vague

---

## 10. Future Extensibility

### Docusaurus Site Conversion

The docs/ layer + strict schema enable:
- Docusaurus deployment with sidebar navigation
- JSON export for filtering by module, level, difficulty, persona, tags, experience band
- Tag-based search and clustering
- Scoring rubrics per question
- Progress tracking per user

### Mock Interview Automation

- Question sequencing by persona + mode + experience band
- Difficulty escalation based on answer quality
- Follow-up generation from schema
- Multi-round mock interview construction

### Recommendation System

- "What should I study next?" based on completed questions
- Gap analysis by tag performance
- Personalized difficulty curves
- Role-specific weak area identification

---

## 11. Generation Phase Plan

| Phase | Deliverables | Status |
|-------|-------------|--------|
| 0 | Architecture Blueprint | Complete |
| 1 | Information architecture (docs/ layer) | Complete |
| 2 | All 8 role pages, indexes, navigation | Complete |
| 3 | Module topic pages (12 families) | Complete |
| 4 | First question batch (high-value modules) | In progress |
| 5 | Full question bank (all modules, all levels) | Planned |
| 6 | Final audit, dedup, consistency review | Planned |
