# Deep Learning / Computer Vision Engineer

Role family: DL / CV · Primary bands: 2–5 yr, 5–8 yr, 8–12 yr

## Who This Role Is For

- Computer vision engineers building perception, detection, and segmentation systems
- Perception engineers (autonomous driving, robotics, AR/VR)
- Model training specialists focused on vision architectures
- Multimodal and VLM-adjacent engineers bridging vision and language

## Typical Strengths

- Training mechanics: loss functions, learning rates, regularization, mixed precision
- CV architectures and data augmentation strategies
- Experiment design, ablations, and reproducibility
- Model optimization intuition: pruning, quantization, architecture search

## Typical Gaps

- LLM internals outside transformer basics (tokenization, KV cache, generation)
- Retrieval systems and agent workflows
- Platform and serving economics for general-purpose LLM systems
- Protocol/interoperability topics (MCP, A2A)

---

## What Companies Expect by Band

### 2–5 yr (mid-level)
- Strong architecture comparison skills: ResNet vs EfficientNet, YOLO vs Faster R-CNN
- Can train, debug, and deploy CV models end-to-end
- Understands data augmentation, class imbalance, and evaluation metrics for CV
- Has working knowledge of transfer learning and domain adaptation

### 5–8 yr (senior)
- Can connect architecture decisions to deployment constraints (mobile, edge, cloud)
- Understands multimodal bridges: CLIP, VLMs, vision-language tasks
- Can reason about training stability, distributed training, and mixed precision
- Owns model performance from training through production serving

### 8–12 yr (staff / lead)
- Defines CV/multimodal strategy for a team or product
- Can evaluate emerging architectures: ViT variants, Mamba, diffusion-based vision
- Connects model decisions to business outcomes: latency, cost, accuracy trade-offs
- Can advise on classical CV vs VLM approaches for specific problems

---

## What Distinguishes Good from Great

| Good | Great |
|---|---|
| Can train a ResNet to good accuracy | Can explain why ResNet works (skip connections) and when alternatives are better |
| Knows ViT exists | Can compare ViT vs CNN trade-offs for specific deployment constraints |
| Uses data augmentation | Can design augmentation strategy based on domain-specific failure modes |
| Can deploy a model | Can optimize for target hardware: quantization, pruning, mobile/edge constraints |
| Understands CLIP at a high level | Can reason about when CLIP-style models help retrieval vs when fine-tuning is needed |

---

## What To Study First

1. [Deep Learning Core](../modules/deep-learning-core.md) — training mechanics are your foundation
2. [CV and Generative Architectures](../modules/cv-and-generative-architectures.md) — architecture depth is your differentiator
3. [Systems, Serving, and Inference](../modules/systems-serving-and-inference.md) — where many CV engineers are weakest
4. [Multimodal and VLMs](../modules/multimodal-and-vlms.md) — the bridge to 2026 CV roles

## What Can Be Skipped Initially

- Detailed graph RAG and complex retrieval architectures
- Deep MCP/A2A/ACP protocol nuance
- Enterprise agent governance unless role-specific
- LLMOps specifics (focus on MLOps relevant to CV)

---

## Key Interview Rounds

| Round | What Is Tested | Common Format |
|---|---|---|
| Architecture deep dive | Architecture comparisons, design decisions, trade-offs | 60 min discussion |
| Training/debugging | Training stability, convergence issues, data problems | Scenario-based |
| System/serving | Serving, quantization, deployment for CV/VLM workloads | Design discussion |
| Research discussion | Emerging architectures, paper-to-implementation reasoning | For research-heavy roles |

## Typical Failure Points

- Excellent model reasoning but weak deployment cost reasoning
- Weak multimodal evaluation depth
- Weak production debugging outside training instability
- Anchored on CNN-era thinking, not adapting to ViT/VLM world
- Cannot reason about serving latency for real-time CV applications

## Expanded Failure Mode Catalog

| Failure | Why It Happens | How To Fix |
|---|---|---|
| Cannot explain memory requirements for inference | Focused on training, not serving | Study GPU memory, activation memory, batch size impact |
| Struggles with multimodal questions | Career has been purely CV | Study Multimodal/VLMs module: CLIP, VLMs, evaluation |
| Cannot compare ViT vs CNN for a specific use case | Knows both but lacks decision framework | Practice architecture comparison with deployment constraints |
| Weak on LLM fundamentals | CV focus didn't require LLM knowledge until recently | Study Transformer module: tokenization, attention, KV cache |
| Training works but model is too slow for production | No latency/throughput thinking | Study Systems/Serving: quantization, batching, hardware |

---

## Recommended Modules in Order

1. [Foundations](../modules/foundations.md)
2. [Deep Learning Core](../modules/deep-learning-core.md)
3. [CV and Generative Architectures](../modules/cv-and-generative-architectures.md)
4. [Transformer and Modern LLM Internals](../modules/transformer-and-modern-llm-internals.md)
5. [Multimodal and VLMs](../modules/multimodal-and-vlms.md)
6. [Systems, Serving, and Inference](../modules/systems-serving-and-inference.md)
7. [MLOps / LLMOps / AIOps](../modules/mlops-llmops-aiops.md)

## Recommended Difficulty Progression

- Concept and Applied for non-CV LLM topics
- Applied/System for CV and serving topics
- Debugging and Architect for multimodal deployment and platform concerns

## 30-Day Prep Strategy

| Days | Focus | Key Activities |
|---|---|---|
| 1–7 | Deep learning core and CV architectures | Architecture comparisons, training mechanics refresh |
| 8–14 | Serving, quantization, CUDA, memory | GPU memory math, throughput/latency, deployment constraints |
| 15–21 | Transformers and multimodal/VLM bridge | ViT, CLIP, modern VLMs, multimodal evaluation |
| 22–28 | Debugging, evaluation, deployment | Training failure diagnosis, CV evaluation metrics, production scenarios |
| 29–30 | Mock interviews | Architecture deep dive and system design practice |

## 90-Day Mastery Path

| Month | Focus | Outcome |
|---|---|---|
| 1 | Solidify architecture and training depth | Can confidently compare architectures and debug training |
| 2 | Add multimodal and serving depth | Can reason about VLMs and deploy models efficiently |
| 3 | Build platform, operations, and architecture maturity | Can own CV/multimodal systems end-to-end in production |

## Best First Question Sets

- [Deep Learning question bank](../../modules/01_pytorch_and_deep_learning/) — concept, applied, system, debugging
- [GenAI question bank](../../modules/02_genai/) — transformer internals, generative architectures
- [System Design question bank](../../modules/09_system_design/) — serving, inference, deployment

## Cross-References

- [Role Index](../indexes/role-index.md) — all role families with depth matrices
- [Experience Index](../indexes/experience-index.md) — band expectations across all roles
- [Module Index](../indexes/module-index.md) — full module sequence and detail cards
- [Topic Graph](../topic-graph.md) — prerequisite map for study planning
