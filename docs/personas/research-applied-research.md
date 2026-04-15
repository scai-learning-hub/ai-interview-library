# Research / Applied Research / Model Research

Role family: Research · Primary bands: 2–5 yr, 5–8 yr, 8–12 yr, 12–20 yr

## Who This Role Is For

- Applied scientists working on model development and evaluation
- Model researchers focused on pretraining, post-training, or architecture design
- Multimodal, VLM, or architecture-focused engineers
- Research engineers bridging papers and implementation

## Typical Strengths

- Mathematical and architectural reasoning
- Experimental design, ablations, and reproducibility discipline
- Familiarity with model families and training behavior
- Paper-to-implementation translation

## Typical Gaps

- Production serving and platform controls
- Operational observability and rollback
- Enterprise governance and multi-tenant design
- Retrieval and agent systems outside research demos

---

## What Companies Expect by Band

### 2–5 yr (mid-level research engineer)
- Can implement model architectures and training loops from papers
- Understands training dynamics: convergence, stability, hyperparameter sensitivity
- Can design and run rigorous experiments with appropriate baselines
- Familiar with at least one model family in depth (vision, language, multimodal)

### 5–8 yr (senior research engineer / applied scientist)
- Can identify which research directions are worth pursuing for a given product problem
- Strong architecture comparison: can reason about trade-offs between model families
- Understands where research conclusions break down in production (scaling, latency, data drift)
- Can own a research-to-production pipeline: idea → experiment → validation → handoff

### 8–12 yr (staff research / research lead)
- Defines research strategy for a team: what to invest in, what to skip
- Can evaluate emerging architectures and methods for practical impact
- Connects research outcomes to product and business value
- Can mentor junior researchers on experimental rigor and production realism

### 12–20 yr (principal / distinguished)
- Sets research direction at organizational level
- Can assess the landscape: where the field is heading, what bets to make
- Defines evaluation methodology and research quality standards
- Bridge between research vision and engineering/product reality

---

## What Distinguishes Good from Great

| Good | Great |
|---|---|
| Can reproduce paper results | Can identify why results don't transfer and propose fixes |
| Knows model architectures | Can reason about architecture implications for serving and deployment |
| Runs experiments | Designs experiments that distinguish signal from noise efficiently |
| Achieves good benchmark scores | Can critique benchmarks and design task-specific evaluations |
| Publishes papers | Delivers research that translates to product improvements |

---

## What To Study First

1. [Deep Learning Core](../modules/deep-learning-core.md) — training mechanics are fundamental
2. [CV and Generative Architectures](../modules/cv-and-generative-architectures.md) — architecture depth
3. [Transformer and Modern LLM Internals](../modules/transformer-and-modern-llm-internals.md) — current architecture landscape
4. [Alignment / Post-Training](../modules/alignment-post-training.md) — post-training is increasingly research-heavy
5. [Multimodal and VLMs](../modules/multimodal-and-vlms.md) — active research frontier

## What Can Be Skipped Initially

- Protocol layer details (MCP/A2A/ACP) unless the role is agent-platform research
- Enterprise platform workflow details
- Deep AIOps specifics
- RAG engineering details (unless research explicitly involves retrieval)

---

## Key Interview Rounds

| Round | What Is Tested | Common Format |
|---|---|---|
| Research discussion | Architecture choices, experimental design, ablation reasoning | 60–90 min deep technical |
| Training deep dive | Training trade-offs, optimization, stability, evaluation | Whiteboard or discussion |
| System/scaling | Serving consequences of architecture choices, deployment realism | Discussion |
| Paper review | Critique a paper's methodology, identify weaknesses, suggest improvements | Live or take-home |
| Implementation | Build a model component or training loop | Live coding |

## Typical Failure Points

- Elegant research reasoning, weak product or system realism
- Weak latency/cost awareness (model is great but can't be served)
- Overclaiming architecture benefits without operational caveats
- Ignoring data and annotation burden
- Optimizing for published metrics without understanding failure modes

## Expanded Failure Mode Catalog

| Failure | Why It Happens | How To Fix |
|---|---|---|
| Model is great on benchmarks, terrible in production | Doesn't understand distribution shift or serving constraints | Add Systems/Serving module to study plan |
| Cannot estimate serving cost or latency | Pure research focus, no deployment experience | Study GPU memory, quantization, batching math |
| Over-optimizes for benchmark leaderboard | Evaluation contamination, metric gaming | Study evaluation methodology: task-specific evals, human evaluation design |
| Cannot explain trade-offs between architectures | Knows individual architectures but lacks comparison framework | Practice architecture comparison with deployment constraints |
| Research doesn't translate to product | No collaboration with engineering/product teams | Study production realism across Systems, MLOps modules |

---

## Recommended Modules in Order

1. [Foundations](../modules/foundations.md)
2. [Deep Learning Core](../modules/deep-learning-core.md)
3. [CV and Generative Architectures](../modules/cv-and-generative-architectures.md)
4. [Transformer and Modern LLM Internals](../modules/transformer-and-modern-llm-internals.md)
5. [Multimodal and VLMs](../modules/multimodal-and-vlms.md)
6. [Alignment / Post-Training](../modules/alignment-post-training.md)
7. [Systems, Serving, and Inference](../modules/systems-serving-and-inference.md)
8. [RAG](../modules/rag.md)

## Recommended Difficulty Progression

- Concept/Applied/Architect for model families and post-training
- Applied/System for serving and deployment consequences
- Debugging for training stability and evaluation failure modes

## 30-Day Prep Strategy

| Days | Focus | Key Activities |
|---|---|---|
| 1–7 | Deep learning core and architecture comparison | Training mechanics, optimization, architecture trade-offs |
| 8–14 | Transformers, attention, scaling, multimodal | RoPE, MHA/GQA, MoE, VLM architectures, 2026 landscape |
| 15–21 | Post-training and evaluation | RLHF, DPO, evaluation methodology, benchmark critique |
| 22–28 | Serving, inference, and production realism | Latency, quantization, serving constraints for research models |
| 29–30 | Mock interviews | Research discussion and paper review practice |

## 90-Day Mastery Path

| Month | Focus | Outcome |
|---|---|---|
| 1 | Sharpen model and evaluation reasoning | Can discuss architecture trade-offs with depth and nuance |
| 2 | Deepen post-training and multimodal coverage | Can advise on alignment and multimodal strategy |
| 3 | Add system and deployment maturity | Research answers stay grounded in production reality |

## Best First Question Sets

- [Deep Learning question bank](../../modules/01_pytorch_and_deep_learning/) — concept, applied, system, debugging
- [GenAI question bank](../../modules/02_genai/) — transformer internals, generative architectures
- [LLM Engineering question bank](../../modules/03_llm_engineering/) — post-training, evaluation, alignment

## Cross-References

- [Role Index](../indexes/role-index.md) — all role families with depth matrices
- [Experience Index](../indexes/experience-index.md) — band expectations across all roles
- [Module Index](../indexes/module-index.md) — full module sequence and detail cards
- [Topic Graph](../topic-graph.md) — prerequisite map for study planning
