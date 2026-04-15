# Data / ML Engineer

Role family: Data / ML · Primary bands: 2–5 yr, 5–8 yr, 8–12 yr

## Who This Role Is For

- Machine learning engineers building and deploying models
- Data scientists moving into production roles
- Data engineers with strong ML exposure
- Model-focused engineers expanding into LLM and platform work

## Typical Strengths

- Modeling intuition and algorithm selection
- Evaluation design (metrics, A/B testing, offline vs online)
- Experimentation and ablation discipline
- Data pipelines and feature quality reasoning

## Typical Gaps

- Serving and inference economics (GPU memory, batching, latency budgets)
- LLM-specific operations and prompt lifecycle
- Platform controls, rollout, and rollback
- Agent orchestration and production debugging

---

## What Companies Expect by Band

### 2–5 yr (mid-level)
- Can train, evaluate, and deploy ML models with appropriate rigor
- Understands evaluation beyond accuracy: precision, recall, calibration, fairness
- Can build and maintain data and feature pipelines
- Knows when classical ML is sufficient vs when deep learning adds value

### 5–8 yr (senior)
- Can own a model from research through production
- Understands serving economics and operational burden
- Can reason about LLM features: evaluation, cost, retrieval, prompt lifecycle
- Can diagnose production model failures: drift, data quality, evaluation breakdown

### 8–12 yr (staff / lead)
- Defines modeling and evaluation strategy for a team or product area
- Connects model decisions to business outcomes: cost, latency, risk, user impact
- Can advise on ML vs LLM vs RAG vs agent approaches for different problems
- Owns model lifecycle strategy: retraining, versioning, governance

---

## What Distinguishes Good from Great

| Good | Great |
|---|---|
| Trains a model that performs well offline | Can explain why offline metrics don't guarantee online performance |
| Uses standard evaluation metrics | Designs evaluation around specific failure modes and business risk |
| Knows about data drift | Can design drift detection, retraining triggers, and rollback strategy |
| Understands LLM basics | Can reason about when LLMs replace classical models vs when they don't |
| Follows MLOps best practices | Can critique and improve an existing MLOps pipeline |

---

## What To Study First

1. [Classical ML](../modules/classical-ml.md) — the foundation; do not skip this
2. [Deep Learning Core](../modules/deep-learning-core.md) — training mechanics, optimization, regularization
3. [Transformer and Modern LLM Internals](../modules/transformer-and-modern-llm-internals.md) — now essential even for classical ML engineers
4. [Systems, Serving, and Inference](../modules/systems-serving-and-inference.md) — where many ML engineers are weakest
5. [MLOps / LLMOps / AIOps](../modules/mlops-llmops-aiops.md) — operational lifecycle

## What Can Be Skipped Initially

- Deep protocol details (MCP/A2A/ACP) unless the role mentions agent interoperability
- Low-level CV architectures if role is LLM-heavy
- GAN history unless research-oriented

---

## Key Interview Rounds

| Round | What Is Tested | Common Format |
|---|---|---|
| Technical deep dive | Model and evaluation choices, algorithm trade-offs | 60 min discussion with follow-ups |
| Production round | Drift, retraining, rollout, observability | Scenario-based discussion |
| System design | Model lifecycle or LLM feature deployment | 45–60 min whiteboard |
| Coding | Feature engineering, model implementation, data pipeline | Live coding or take-home |

## Typical Failure Points

- Excellent offline reasoning, weak online/system reasoning
- Weak latency and serving intuition (cannot estimate model memory or throughput)
- Underestimating prompt, retrieval, or inference-layer problems
- Treating deployment as an afterthought
- Strong classical ML but cannot bridge to LLM world

## Expanded Failure Mode Catalog

| Failure | Why It Happens | How To Fix |
|---|---|---|
| Model works in notebook, fails in production | No serving or deployment reasoning | Study Systems/Serving module |
| Cannot explain why model degraded in production | Lacks drift detection and monitoring knowledge | Study MLOps module: drift, evaluation, retraining |
| Over-engineers ML solution when LLM API would work | Anchored on classical approach | Study Transformer/LLM module, then RAG module |
| Under-invests in feature quality | Treats features as given, not designed | Review data-centric ML in Classical ML module |
| Cannot compare classical ML vs LLM for a specific use case | Lacks cross-paradigm reasoning | Practice "when to use what" decision framework |

---

## Recommended Modules in Order

1. [Foundations](../modules/foundations.md)
2. [Classical ML](../modules/classical-ml.md)
3. [Deep Learning Core](../modules/deep-learning-core.md)
4. [Transformer and Modern LLM Internals](../modules/transformer-and-modern-llm-internals.md)
5. [RAG](../modules/rag.md)
6. [Systems, Serving, and Inference](../modules/systems-serving-and-inference.md)
7. [Alignment / Post-Training](../modules/alignment-post-training.md)
8. [MLOps / LLMOps / AIOps](../modules/mlops-llmops-aiops.md)

## Recommended Difficulty Progression

- Start at Applied for familiar ML topics
- Add System depth early for serving and operations
- Reserve Architect-level depth for platform and governance topics

## 30-Day Prep Strategy

| Days | Focus | Key Activities |
|---|---|---|
| 1–7 | Evaluation, metrics, generalization, drift | Root metrics, calibration, offline vs online eval |
| 8–14 | Deep learning and transformer internals | Forward/backward, attention, tokenization, KV cache |
| 15–21 | RAG and serving trade-offs | Retrieval pipeline, latency budgets, quantization |
| 22–28 | MLOps, LLMOps, rollback, tracing | Versioning, monitoring, incident response drills |
| 29–30 | Debugging drills and mock interviews | End-to-end scenario debugging |

## 90-Day Mastery Path

| Month | Focus | Outcome |
|---|---|---|
| 1 | Strengthen serving and production reasoning | Can deploy and operate models confidently |
| 2 | Build depth in RAG, agents, and LLM-specific ops | Can work with LLM-based systems, not just classical ML |
| 3 | Develop system design and architect-style trade-off fluency | Can own model lifecycle decisions end-to-end |

## Best First Question Sets

- [Foundations question bank](../../modules/00_foundations/) — concept, applied, system, debugging
- [GenAI / LLM question bank](../../modules/02_genai/) — transformer internals, prompting, fine-tuning
- [LLMOps question bank](../../modules/06_llmops/) — operations, observability, governance

## Cross-References

- [Role Index](../indexes/role-index.md) — all role families with depth matrices
- [Experience Index](../indexes/experience-index.md) — band expectations across all roles
- [Module Index](../indexes/module-index.md) — full module sequence and detail cards
- [Topic Graph](../topic-graph.md) — prerequisite map for study planning
