# SCAI AI Interview OS

**A Role-Aware, Experience-Calibrated AI Interview Preparation System**

Built by [School of Core AI](https://schoolofcoreai.com). Structured for engineers who build, deploy, debug, and scale AI systems — not for people looking for definitions to memorize.

**155+ schema-strict interview questions** across 7 modules, covering foundations through production operations. Navigable by role, experience band, topic, and interview round.

---

## What Is This?

AI Interview OS is a structured interview operating system covering the full modern AI engineering stack. It is navigable by role, by experience band, by topic family, by interview mode, and by tag.

Every question follows a strict schema with metadata, difficulty ratings, experience bands, role relevance, follow-ups, weak answer patterns, and production insights.

**This is not a notes library. This is not a syllabus dump. This is an interview system.**

It answers:
- What should I study first based on my background?
- What do companies expect at my experience level?
- Which topics are foundational vs advanced vs architect-level?
- Which parts are research-heavy vs deployment-heavy?
- What should a 2-year engineer know vs a 10-year architect?

---

## Start Here

| Your background | Start with |
|---|---|
| Python / backend engineer moving into AI | [Software Foundations → AI Engineer](docs/personas/software-foundations-to-ai-engineer.md) |
| ML or data engineer | [Data / ML Engineer](docs/personas/ml-data-engineer.md) |
| CV / deep learning engineer | [Deep Learning / CV Engineer](docs/personas/deep-learning-cv-engineer.md) |
| Building copilots, RAG, or agents | [LLM / RAG / Agent Engineer](docs/personas/llm-rag-agent-engineer.md) |
| ML platform or LLM infra | [MLOps / LLMOps / Platform AI](docs/personas/mlops-llmops-platform-engineer.md) |
| DevOps / SRE moving into AIOps | [DevOps / SRE → AIOps](docs/personas/devops-sre-to-aiops.md) |
| Research or applied research | [Research / Applied Research](docs/personas/research-applied-research.md) |
| Senior / staff / architect | [Senior / Architect / AI Systems Lead](docs/personas/senior-architect-ai-systems-lead.md) |

Don't know where to start? → **[Start Here](docs/start-here.md)** for a guided walkthrough.

---

## Navigation

### By Role
Enter by job family. Each role page includes strengths, gaps, study order, prep strategy, and failure points.

→ [Role Index](docs/indexes/role-index.md)

### By Experience Band
Enter by career stage. Each band defines expectations, essential topics, and depth targets.

→ [Experience Index](docs/indexes/experience-index.md)

### By Topic Family
Dive into a specific technical domain. 12 topic families covering foundations through operations.

→ [Module Index](docs/indexes/module-index.md)

### By Interview Mode
Choose the prep mode matching your timeline and interview stage.

→ [Interview Modes](interview_modes/README.md)

### By Question Library
Browse schema-strict questions by module, with full metadata, answers, and follow-ups.

→ [Question Library Index](docs/indexes/question-library-index.md)

### By Tag
Filter across modules using technical tags for targeted preparation.

→ [Tag Index](docs/indexes/tag-index.md)

---

## Core Documents

| Document | Purpose |
|---|---|
| [Interview Philosophy](docs/interview-philosophy.md) | How the 5-level interview system works |
| [Role Experience Matrix](docs/role-experience-matrix.md) | What is expected per role × experience band |
| [Topic Graph](docs/topic-graph.md) | Prerequisite dependencies and traversal paths |
| [Architecture Blueprint](ARCHITECTURE_BLUEPRINT.md) | Internal system design and generation policies |

---

## What's Available Now

### Question Library (155+ questions)

| Module | Questions | Levels | Link |
|---|---|---|---|
| Foundations | 25 | Concept, Applied, System, Debugging, Architect | [Batch 01](docs/question-library/foundations/foundations-batch-01.md) |
| Transformer and LLM Internals | 25 | Concept, Applied, System, Debugging, Architect | [Batch 01](docs/question-library/transformer-and-modern-llm-internals/transformer-and-modern-llm-internals-batch-01.md) |
| RAG | 25 | Concept, Applied, System, Debugging, Architect | [Batch 01](docs/question-library/rag/rag-batch-01.md) |
| Agents and Agentic Systems | 25 | Concept, Applied, System, Debugging, Architect | [Batch 01](docs/question-library/agents-and-agentic-systems/agents-and-agentic-systems-batch-01.md) |
| Agent Protocols: MCP / A2A / ACP | 25 | Concept, Applied, System, Debugging, Architect | [Batch 01](docs/question-library/agent-protocols-mcp-a2a-acp/agent-protocols-mcp-a2a-acp-batch-01.md) |
| Systems, Serving, and Inference | 15 | Concept, Applied, System, Debugging, Architect | [Batch 01](docs/question-library/systems-serving-and-inference/systems-serving-and-inference-batch-01.md) |
| MLOps / LLMOps / AIOps | 15 | Concept, Applied, System, Debugging, Architect | [Batch 01](docs/question-library/mlops-llmops-aiops/mlops-llmops-aiops-batch-01.md) |

**Coming next**: Classical ML, Deep Learning Core, Alignment / Post-training, and Batch 02 expansions for existing modules. See [Roadmap](ROADMAP.md).

---

## Topic Families (12 Modules)

### Core Foundations
| Module | Scope |
|---|---|
| [Foundations](docs/modules/foundations.md) | Python, tensor thinking, linear algebra, probability, statistics, metrics, autograd |
| [Classical ML](docs/modules/classical-ml.md) | Supervised/unsupervised, evaluation, bias/variance, trees, SVM, anomaly detection |
| [Deep Learning Core](docs/modules/deep-learning-core.md) | Tensors, CUDA, batching, forward/backward, loss, normalization, optimization, training loops |

### Model and Architecture Families
| Module | Scope |
|---|---|
| [CV and Generative Architectures](docs/modules/cv-and-generative-architectures.md) | CNN, ResNet, YOLO, U-Net, GANs, RNN/LSTM, ViT, Mamba, diffusion |
| [Transformer and Modern LLM Internals](docs/modules/transformer-and-modern-llm-internals.md) | Tokenization, embeddings, RoPE, attention, MHA/GQA, KV cache, MoE, scaling |
| [Multimodal and VLMs](docs/modules/multimodal-and-vlms.md) | CLIP, BLIP, SigLIP, Flamingo, image-text alignment, VLM evaluation |

### Application and Orchestration
| Module | Scope |
|---|---|
| [RAG](docs/modules/rag.md) | Ingestion, chunking, retrieval, reranking, basic/hybrid/graph RAG, evaluation |
| [Agents and Agentic Systems](docs/modules/agents-and-agentic-systems.md) | Tool calling, planners, memory, multi-agent, governance, safety |
| [Agent Protocols: MCP / A2A / ACP](docs/modules/agent-protocols-mcp-a2a-acp.md) | Protocol differentiation, local tools vs remote agents, discovery, trust |

### Production and Operations
| Module | Scope |
|---|---|
| [Systems, Serving, and Inference](docs/modules/systems-serving-and-inference.md) | PyTorch, CUDA, kernels, quantization, vLLM, TGI, deployment patterns |
| [Alignment / Post-training](docs/modules/alignment-post-training.md) | SFT, RLHF, DPO, reward models, behavior shaping trade-offs |
| [MLOps / LLMOps / AIOps](docs/modules/mlops-llmops-aiops.md) | MLOps, LLMOps, RAGOps, AgentOps, AIOps, observability, governance |

---

## Question Bank

Questions are organized by module and level in the `modules/` directory:

| Level | What It Tests | Share |
|-------|--------------|-------|
| **Concept** | First principles, clean definitions, mental models | 20% |
| **Applied** | Design choices, trade-offs, practical reasoning | 35% |
| **System** | Architecture, scale, reliability, cost | 20% |
| **Debugging** | Failure analysis, incidents, recovery | 15% |
| **Architect** | Operating model, governance, platform strategy | 10% |

→ [Question Schema](schema/question_schema.md) · [Difficulty Guide](schema/difficulty_guide.md) · [Tagging System](schema/tagging_system.md)

---

## Experience Bands

| Band | What Good Looks Like |
|---|---|
| 0–2 years | Correct foundations, clean implementation, no invented explanations |
| 2–5 years | Applied reasoning, trade-offs, failure mode awareness, evaluation fluency |
| 5–8 years | Production ownership, system trade-offs, debugging, deployment maturity |
| 8–12 years | Cross-system design, platform thinking, governance, cost reasoning |
| 12–20 years | Architecture, org-level decisions, operating model, risk management |

→ [Full Experience Index](docs/indexes/experience-index.md) · [Role Experience Matrix](docs/role-experience-matrix.md)

---

## Prep Plans

### 7-Day Quick Plan
1. Pick your role → follow the recommended module order
2. Do top 5–8 questions per priority module
3. Focus on Applied and System levels
4. Review weak answer signals for quick calibration

### 30-Day Deep Plan
1. Follow your role page's full module order
2. Complete all levels per module, in order
3. Spend extra time on gap areas identified in your role page
4. Final week: debugging drills and mock deep dives

### 90-Day Mastery Path
1. Follow the 30-day plan first
2. Add cross-module system design practice
3. Develop architect-level reasoning for your specialization
4. Run mock interviews across all round types

→ Each role page includes specific 30-day and 90-day strategies

---

## Design Principles

1. **Structure before volume** — Scalable architecture before question count
2. **Production over theory** — Concepts build toward applied, system, and debugging depth
3. **Role-aware paths** — Not everyone needs the same starting point or depth
4. **Experience-calibrated** — More seniority ≠ more model trivia; it means better judgment
5. **Schema-strict** — Every question is machine-readable for future tooling
6. **Interview-realistic** — Questions test what real interviewers test
7. **Topic-graph aware** — Prerequisites matter; depth depends on dependency order
8. **Deduplicated by design** — Cross-module overlaps are intentional and angle-differentiated

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on adding questions and improving content.

---

## Related

- [School of Core AI](https://schoolofcoreai.com)
- [AI Developers Course](https://schoolofcoreai.com/courses/ai-developers-course)
- [Generative AI Course](https://schoolofcoreai.com/courses/generative-ai-course)
- [AIOps Course](https://schoolofcoreai.com/courses/aiops-course)

---

*Built by School of Core AI. For engineers who build AI systems, not for memorizers.*
