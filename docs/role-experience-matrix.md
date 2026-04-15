# Role Experience Matrix

AI interview expectations are driven by two independent variables:

- **role family** — what kind of work you do
- **experience band** — how many years of relevant experience you bring

A 3-year applied research engineer and a 3-year platform engineer should not prepare the same way. A 12-year architect is rarely judged on whether they can recite CNN layer equations from memory, but they are judged on architecture judgment, reliability, governance, and trade-offs.

More years does NOT automatically mean more model depth. Senior candidates are increasingly judged on system design, architecture trade-offs, org-level decision-making, reliability, governance, and platform thinking.

---

## Role Families

1. [Python / Software Foundations → AI Transition](./personas/software-foundations-to-ai-engineer.md)
2. [Data / ML Engineer](./personas/ml-data-engineer.md)
3. [Deep Learning / Computer Vision Engineer](./personas/deep-learning-cv-engineer.md)
4. [LLM / RAG / Agent Engineer](./personas/llm-rag-agent-engineer.md)
5. [MLOps / LLMOps / Platform AI Engineer](./personas/mlops-llmops-platform-engineer.md)
6. [DevOps / SRE → AIOps Engineer](./personas/devops-sre-to-aiops.md)
7. [Research / Applied Research / Model Research](./personas/research-applied-research.md)
8. [Senior / Architect / AI Systems Lead](./personas/senior-architect-ai-systems-lead.md)

### Role Family Profiles

#### 1. Software Foundations → AI Engineer
- **Typical strengths:** Coding discipline, API integration, service design, deployment basics
- **Typical gaps:** Statistics, tensor thinking, training intuition, evaluation rigor, retrieval quality reasoning
- **Interview focus:** Can you build AI-backed features without inventing incorrect ML explanations?

#### 2. Data / ML Engineer
- **Typical strengths:** Modeling intuition, evaluation design, experimentation, data pipeline quality
- **Typical gaps:** Serving economics, LLM-specific operations, agent orchestration, inference stacks
- **Interview focus:** Can you connect model quality to production lifecycle, not just offline experiments?

#### 3. Deep Learning / Computer Vision Engineer
- **Typical strengths:** Training mechanics, architecture selection, data augmentation, experiment design
- **Typical gaps:** LLM internals beyond transformer basics, retrieval systems, platform economics
- **Interview focus:** Can you connect architecture decisions to deployment constraints and cost?

#### 4. LLM / RAG / Agent Engineer
- **Typical strengths:** Prompting, retrieval basics, tool-use patterns, application integration
- **Typical gaps:** Transformer internals beyond surface, evaluation rigor, agent reliability, inference economics
- **Interview focus:** Are you more than a prompt engineer? Can you diagnose retrieval vs model vs system failures?

#### 5. MLOps / LLMOps / Platform AI Engineer
- **Typical strengths:** Deployment pipelines, versioning, observability, platform standards
- **Typical gaps:** Deeper model internals, retrieval quality reasoning, post-training choices
- **Interview focus:** Can you design platforms that serve model teams without fighting the models they ship?

#### 6. DevOps / SRE → AIOps Engineer
- **Typical strengths:** Production reliability, incident handling, monitoring, capacity planning
- **Typical gaps:** Model behavior intuition, evaluation quality, agent-specific failure modes
- **Interview focus:** Can you operate AI systems without treating all AI failures as generic service failures?

#### 7. Research / Applied Research
- **Typical strengths:** Mathematical reasoning, architecture comparison, experimental design, ablations
- **Typical gaps:** Production serving, platform controls, enterprise governance, retrieval systems
- **Interview focus:** Can you connect research reasoning to deployment reality and cost constraints?

#### 8. Senior / Architect / AI Systems Lead
- **Typical strengths:** Broad systems judgment, cross-team coordination, architecture reasoning
- **Typical gaps:** Current-generation model details if not hands-on recently, newer ecosystem nuance
- **Interview focus:** Can you define system boundaries, governance, rollback paths, and cost models?

---

## Experience Bands

| Band | Interview Expectation | What Good Looks Like |
|---|---|---|
| 0–2 years | Strong foundations, correct terminology, ability to implement guided solutions | Can explain basics cleanly, write simple code, avoid major conceptual errors |
| 2–5 years | Applied reasoning, implementation trade-offs, moderate debugging competence | Can choose approaches, explain failure modes, and discuss evaluation with evidence |
| 5–8 years | Production ownership, system trade-offs, debugging, deployment maturity | Can operate systems, reason under constraints, and diagnose multi-factor issues |
| 8–12 years | Cross-system design, platform thinking, reliability, cost, governance | Can design services and workflows used by teams, not just single features |
| 12–20 years | Architecture, org-level decision making, portfolio strategy, risk management | Can justify platform direction, operating model, fallback strategy, and long-term trade-offs |

---

## Detailed Band Expectations

### 0–2 Years
- **Likely expectations:** Demonstrate correct mental models, write functional code, explain core concepts without hand-waving
- **Expected depth:** Concept and early Applied across foundations, ML basics, and one specialization
- **What "good" looks like:** Clean explanations, no invented mechanisms, ability to implement basic training loops, pipelines, or RAG chains with guidance
- **Essential:** Python, statistics, metrics, tensors, training loops, classical ML intuition, transformer basics, RAG basics
- **Optional:** GANs, diffusion internals, MoE routing details, protocol standards, enterprise governance
- **Practitioner vs architect:** Not applicable at this band

### 2–5 Years
- **Likely expectations:** Compare design choices, explain failure modes, demonstrate evaluation discipline, show moderate debugging ability
- **Expected depth:** Applied and early System across role-relevant modules
- **What "good" looks like:** Can explain why one design failed in practice, choose metrics under constraints, reason about evaluation pitfalls, and diagnose basic production issues
- **Essential:** Applied ML, PyTorch, transformer internals, RAG design, evaluation, debugging basics, inference basics
- **Optional by role:** Graph RAG, RLHF, Mamba, advanced multimodal models, AIOps
- **Practitioner vs architect:** Practitioner focus — building features, not designing platforms

### 5–8 Years
- **Likely expectations:** Own production systems, debug multi-factor failures, reason about cost/latency/reliability trade-offs, manage deployment lifecycle
- **Expected depth:** Applied + System + Debugging across core modules for the role
- **What "good" looks like:** Can operate and recover systems, not just describe them. Can explain rollout strategy, observability design, and incident reasoning
- **Essential:** Production debugging, serving, observability, retrieval quality, cost/latency trade-offs, deployment lifecycle
- **Optional by role:** Research-heavy post-training, advanced CV architectures, protocol details beyond conceptual fit
- **Practitioner vs architect:** Transition zone — strong practitioners start showing architecture reasoning

### 8–12 Years
- **Likely expectations:** Design multi-system architecture, define platform boundaries, reason about governance/compliance/cost, support multiple teams
- **Expected depth:** System + Debugging + Architect across relevant modules
- **What "good" looks like:** Makes bounded, realistic architecture choices. Defines control surfaces, rollback paths, and team interfaces. Understands where organizational structure becomes the bottleneck
- **Essential:** Multi-system design, team interfaces, governance, rollout strategy, SLO/SLA thinking, platform economics
- **Optional:** Narrow algorithmic trivia outside domain specialization
- **Practitioner vs architect:** Architect expectations dominate — judged on choices, not implementation speed

### 12–20 Years
- **Likely expectations:** Organization-level AI architecture, operating model design, risk management, portfolio strategy, compliance posture
- **Expected depth:** Architect + selective System/Debugging for hands-on credibility
- **What "good" looks like:** Connects technical architecture to staffing, governance, vendor strategy, and failure containment. Knows what to standardize vs leave flexible
- **Essential:** Organization-level architecture, operating model, risk, cost allocation, compliance, platform boundaries
- **Optional:** Low-level implementation detail unless role is hands-on
- **Practitioner vs architect:** Architect mode is primary — technical credibility maintained through depth in 1–2 areas

---

## Expectation Matrix

| Role Family | 0–2 years | 2–5 years | 5–8 years | 8–12 years | 12–20 years |
|---|---|---|---|---|---|
| Software Foundations → AI | Python, stats, ML basics, tensors, training loops | PyTorch, transformers, RAG basics, inference basics | Production LLM feature design, debugging, evaluation | AI system design, platform constraints, build-vs-buy | Org-level AI architecture, governance, cost strategy |
| Data / ML Engineer | Classical ML, evaluation, pipelines, PyTorch basics | Training design, feature/data quality, model selection | Production ML and LLM pipelines, drift, retraining | Multi-team ML platform design, lifecycle management | Portfolio-level model strategy and platform evolution |
| DL / CV Engineer | CNN, ResNet, augmentation, training mechanics | Detection/segmentation, diffusion or ViT basics, serving basics | Distributed training, optimization, production CV systems | Vision platform and model portfolio design | Research-to-production bridge, infra and annotation strategy |
| LLM / RAG / Agent Engineer | Prompting, tokenization, embeddings, basic RAG | Retrieval design, evals, tool use, structured output | Agent reliability, serving, observability, cost control | Multi-system LLM architecture and governance | Enterprise AI architecture and product/platform decisions |
| MLOps / LLMOps / Platform AI | CI/CD, experiment tracking, model lifecycle basics | Serving, tracing, rollback, eval pipelines, versioning | Platform design, multi-tenant controls, SLOs | Shared platform operating model, compliance, budget controls | Org-wide AI platform strategy and controls |
| DevOps / SRE → AIOps | Core ML/LLM literacy, observability, infra basics | LLM serving stacks, tracing, incident patterns, AIOps use cases | AI reliability engineering, routing, autoscaling, incident response | AI platform SRE model, capacity and resilience design | AI operations governance and org-wide reliability posture |
| Research / Applied Research | Math, papers, model internals, ablations | Architecture comparison, evaluation rigor, post-training methods | Training systems, scaling decisions, deployment trade-offs | Research portfolio design and infra impact reasoning | Research strategy with product/platform consequences |
| Senior / Architect / AI Systems Lead | Not typical entry band | Broad but shallow unless transitioning | Strong systems judgment and technical range | End-to-end architecture, governance, org design | Company-level AI systems leadership |

---

## Topic Depth by Experience Band

| Topic Family | 0–2 years | 2–5 years | 5–8 years | 8–12 years | 12–20 years |
|---|---|---|---|---|---|
| Foundations | Essential | Essential | Expected | Expected | Assumed |
| Classical ML | Essential for ML roles | Essential for ML roles | Important | Important | Contextual |
| Deep Learning Core | Important | Essential for model roles | Essential for most AI roles | Important | Contextual unless leading model org |
| Architectures (CV/Gen) | Introductory | Working depth | Strong specialization by role | Trade-off depth | Portfolio depth |
| LLM Internals | Introductory to working | Essential for LLM roles | Strong applied/system depth | Trade-off and platform depth | Mostly architecture/economics |
| Multimodal / VLMs | Awareness | Working for relevant roles | Applied for CV/research roles | System-fit depth | Selective |
| RAG | Introductory | Essential for LLM feature roles | Essential for production AI roles | System and governance depth | Portfolio/platform depth |
| Agents | Conceptual | Applied for relevant roles | Reliability and orchestration | Platform/governance depth | Selective, not universal |
| Protocols (MCP/A2A/ACP) | Conceptual awareness | Applied awareness | Design trade-off depth | Policy/platform fit depth | Strategic fit |
| Serving / Inference | Awareness | Working depth | Essential | Essential | Architecture and cost depth |
| Alignment / Post-training | Awareness | Working for research/LLM roles | Important | Strategic trade-off depth | Selective |
| Operations (MLOps/LLMOps/AIOps) | Awareness | Important | Essential | Essential | Governance and operating model |

---

## Essential vs Optional by Band

### 0–2 years
- **Essential:** Python, statistics, metrics, tensors, training loops, classical ML intuition, transformer basics, RAG basics
- **Optional early:** GANs, diffusion internals, MoE routing details, protocol standards, enterprise governance
- **Good interview signal:** Correct fundamentals, clean implementation reasoning, no invented explanations

### 2–5 years
- **Essential:** Applied ML, PyTorch, transformer internals, RAG design, evaluation, debugging basics, inference basics
- **Optional by role:** Graph RAG, RLHF, Mamba, advanced multimodal models, AIOps
- **Good interview signal:** Can compare options and explain why one fails in practice

### 5–8 years
- **Essential:** Production debugging, serving, observability, retrieval quality, cost/latency trade-offs, deployment lifecycle
- **Optional by role:** Research-heavy post-training, advanced CV architectures, protocol details beyond conceptual fit
- **Good interview signal:** Can operate and recover systems, not just describe them

### 8–12 years
- **Essential:** Multi-system design, team interfaces, governance, rollout strategy, SLO/SLA thinking, platform economics
- **Optional:** Narrow algorithmic trivia outside domain specialization
- **Good interview signal:** Makes bounded, realistic architecture choices

### 12–20 years
- **Essential:** Organization-level architecture, operating model, risk, cost allocation, compliance, platform boundaries
- **Optional:** Low-level implementation detail unless role is hands-on
- **Good interview signal:** Connects technical architecture to staffing, governance, and failure containment

---

## Practitioner vs Architect Expectations

| Dimension | Practitioner | Architect |
|---|---|---|
| Model depth | Can implement and debug specific systems | Knows where depth matters and where abstraction is enough |
| Trade-offs | Can compare 2–3 approaches for one feature | Can balance product, infra, org, compliance, and cost together |
| Reliability | Can triage incidents in owned services | Can design systems and processes that reduce incident frequency |
| Evaluation | Can run and interpret evals | Can define evaluation strategy and acceptance gates across teams |
| Governance | Can comply with platform rules | Can define the rules, exceptions, and escalation model |
| Cost | Can optimize within a budget | Can set the budget and justify investment trade-offs |
| Scope | Feature or service level | Platform, portfolio, or organization level |

---

## Recommended Entry Paths

- **Software-heavy background:** Start with [Foundations](./modules/foundations.md), [Deep Learning Core](./modules/deep-learning-core.md), then [Transformer and Modern LLM Internals](./modules/transformer-and-modern-llm-internals.md)
- **ML-heavy background:** Start with [Classical ML](./modules/classical-ml.md), [Deep Learning Core](./modules/deep-learning-core.md), then [Systems, Serving, and Inference](./modules/systems-serving-and-inference.md)
- **Operations-heavy background:** Start with [Systems, Serving, and Inference](./modules/systems-serving-and-inference.md) and [MLOps / LLMOps / AIOps](./modules/mlops-llmops-aiops.md), then backfill [Transformer and Modern LLM Internals](./modules/transformer-and-modern-llm-internals.md)
- **Research background:** Start with [Deep Learning Core](./modules/deep-learning-core.md), [CV and Generative Architectures](./modules/cv-and-generative-architectures.md), then [Alignment / Post-training](./modules/alignment-post-training.md)
- **Senior architecture rounds:** Start with [Interview Philosophy](./interview-philosophy.md), [Topic Graph](./topic-graph.md), and [Senior / Architect / AI Systems Lead](./personas/senior-architect-ai-systems-lead.md)

---

## Cross-References

- [Interview Philosophy](./interview-philosophy.md) — how the 5-level system works
- [Topic Graph](./topic-graph.md) — prerequisite dependencies
- [Role Index](./indexes/role-index.md) — all 8 role pages
- [Experience Index](./indexes/experience-index.md) — entry by career band
