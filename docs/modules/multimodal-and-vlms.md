# Multimodal and VLMs

Topic family F · Prerequisites: Transformer internals, vision architecture awareness · Unlocks: Advanced retrieval patterns, multimodal product design

This module covers the multimodal systems and vision-language model families that are increasingly relevant in 2026 interviews, especially for applied research, multimodal product, and advanced AI engineering roles.

---

## Scope

- CLIP and contrastive alignment
- BLIP and generative multimodal
- SigLIP and efficiency improvements
- Flamingo and in-context multimodal learning
- Image-text alignment methods
- Multimodal retrieval
- VLM evaluation
- Product and system trade-offs
- Multimodal RAG

## Why This Module Matters

Multimodal systems are moving from research to production. Interviewers increasingly test whether candidates can reason about cross-modal alignment, evaluation difficulty, and the real costs of serving multimodal systems.

---

## Subtopic Breakdown

### Contrastive Alignment (CLIP / SigLIP)
- **CLIP:** Dual-encoder contrastive learning — image encoder + text encoder trained together
- **Objective:** Match image-text pairs, separate non-matching pairs
- **Zero-shot transfer:** Use text descriptions to classify images without task-specific training
- **SigLIP:** Sigmoid-based loss replacing softmax — computational efficiency at scale, removes the need for global normalization
- **Interview focus:** Why contrastive alignment enables zero-shot, what it cannot do (grounding, spatial reasoning)

### Generative Multimodal (BLIP / BLIP-2)
- **BLIP:** Combines contrastive and generative objectives — can retrieve and generate
- **BLIP-2:** Uses a lightweight Q-Former to bridge frozen vision and language models
- **Key insight:** Freezing large components reduces training cost while maintaining capability
- **Interview focus:** When to use retrieval-only (CLIP) vs generation (BLIP), cost of training vs adaptation

### In-Context Multimodal Learning (Flamingo)
- **Core idea:** Feed interleaved image-text sequences, model learns few-shot from examples
- **Perceiver-based visual processing:** Reduces visual tokens to manageable length
- **Interview focus:** How few-shot multimodal learning works, token budget for images vs text

### Modern VLMs (2025–2026 Landscape)
- LLaVA, InternVL, Qwen-VL: connecting vision encoders to language models
- Vision token reduction: strategies for managing image token count
- Document understanding: OCR-free approaches, chart/table reasoning
- Video understanding: frame sampling, temporal reasoning, token explosion management
- **Interview awareness:** Candidates should know the VLM landscape is evolving rapidly; specific model names matter less than architectural pattern understanding

### Multimodal Retrieval
- Image-to-text and text-to-image retrieval using shared embedding spaces
- Cross-modal reranking: using generative VLMs to rerank retrieved results
- Multimodal RAG: retrieving and grounding from mixed document types (text, images, tables)
- **Interview focus:** When multimodal retrieval adds value vs when it adds latency and complexity

### VLM Evaluation
- Text-only metrics applied to multimodal tasks: insufficient but commonly used
- Grounding evaluation: does the answer reference the right visual region?
- Hallucination in VLMs: models describe non-existent visual content
- Benchmark limitations: static benchmarks vs realistic task evaluation
- **Interview focus:** Why multimodal eval is harder than text-only eval and what to do about it

---

## What Interviewers Test by Band

### 0–2 years
- Knows what CLIP does and why zero-shot classification works
- Understands the basic idea of image-text alignment

### 2–5 years
- Can compare CLIP vs BLIP in terms of capability and use case
- Understands what VLMs can and cannot do (grounding, spatial, hallucination)
- Knows the basic multimodal retrieval pipeline

### 5–8 years
- Can design a multimodal RAG or retrieval pipeline with realistic constraints
- Understands VLM evaluation challenges and proposes mitigation
- Can reason about serving cost for multimodal systems (image tokens, memory, latency)

### 8+ years
- Can define a multimodal strategy for a product line
- Connects VLM capabilities to business value and serving economics
- Can advise on build vs buy for multimodal features

---

## Depth Ladder

| Level | What Good Looks Like |
|---|---|
| Concept | Can explain contrastive alignment, zero-shot, and the difference between retrieval and generative VLMs |
| Applied | Can choose between CLIP-style retrieval and generative VLMs for a given task |
| System | Can reason about serving cost, image token budgets, and multimodal pipeline design |
| Debugging | Can diagnose VLM hallucination, grounding failures, and retrieval mismatches |
| Architect | Can define multimodal strategy including model selection, evaluation, and serving economics |

---

## Anti-Patterns and Weak Answers

- Assuming all multimodal systems are generative chat models
- Confusing retrieval quality with generation quality
- Underestimating annotation, grounding, and evaluation difficulty
- Ignoring image pipeline, latency, and memory implications
- Treating CLIP as a universal solution without understanding its limitations (no spatial reasoning, no generation)
- Discussing VLMs without addressing hallucination risk
- Not knowing that image tokens consume far more of the context window than text tokens

---

## Role Relevance

| Role | Depth Needed | Focus Areas |
|---|---|---|
| DL / CV | ★★★ | Full coverage: contrastive, generative, evaluation, serving |
| Research | ★★★ | Architecture comparisons, evaluation rigor, training methods |
| LLM / RAG / Agent | ★ | Multimodal retrieval awareness, VLM integration points |
| Platform AI | ★ | Serving cost, token budgets, infrastructure implications |
| Senior / Architect | ★ | System fit, strategy, build vs buy |
| Data / ML | ★ | Evaluation methods, data pipeline for multimodal |
| Software → AI | ★ | Integration awareness |
| DevOps → AIOps | — | Not typically tested |

---

## What To Study Next

- [CV and Generative Architectures](./cv-and-generative-architectures.md) — vision encoder foundations
- [Transformer and Modern LLM Internals](./transformer-and-modern-llm-internals.md) — attention and scaling foundations
- [RAG](./rag.md) — multimodal retrieval builds on RAG patterns
- [Systems, Serving, and Inference](./systems-serving-and-inference.md) — serving multimodal models

## Cross-References

- [Module Index](../indexes/module-index.md) — all modules with sequences and detail cards
- [Experience Index](../indexes/experience-index.md) — depth expectations by career band
- [Tag Index](../indexes/tag-index.md) — related tags: `clip`, `blip`, `siglip`, `flamingo`, `vlm`, `image-text-alignment`, `multimodal-retrieval`, `contrastive-learning`, `zero-shot`
- [Topic Graph](../topic-graph.md) — prerequisite map
