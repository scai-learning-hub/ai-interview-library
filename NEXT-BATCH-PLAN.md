# Next Batch Plan

What to generate in the next expansion cycle after the initial public push.

---

## Priority 0: Content Model Reset

Before adding more volume, make the library easier to read and closer to real interview flow.

### Deliverables

- Add a clear interview progression to every module index: `Basic -> Concept -> Design -> Practical Build -> Real Follow-ups`
- Keep the current file layout during migration, but explain what each file means in interview terms
- Add one bounded build drill to every new Concept and Applied question
- Rewrite question indexes so they show the practical drill or design bridge, not just the title

### Pilot Modules

- Foundations
- RAG

### Example Build Drill Shapes

- Implement ANN-style similarity ranking over normalized embeddings in Torch
- Build a minimal LangChain + FAISS RAG pipeline with citations
- Implement reciprocal rank fusion over dense and BM25 results

### Exit Criteria

- A new reader can tell where to start, what gets deeper, and what they should build
- Index pages stop looking like flat inventories
- Questions feel like real interview sequences, not isolated notes

---

## Priority 1: New Module Batches

These modules have navigation pages but no questions yet.

| Module | Priority | Reason |
|---|---|---|
| Classical ML | High | Foundational for all ML roles, frequently tested |
| Deep Learning Core | High | Prerequisite for transformer/serving modules |
| Alignment / Post-training | Medium | Growing in interview frequency (SFT, RLHF, DPO) |

Target: 15–20 questions per module, Batch 01.

---

## Priority 2: Expand Existing Modules

These modules have Batch 01 and benefit from additional depth.

| Module | Current | Target | Focus |
|---|---|---|---|
| Systems, Serving, and Inference | 15 | 30+ | More Architect-level, GPU profiling, cost modeling |
| MLOps / LLMOps / AIOps | 15 | 30+ | More debugging scenarios, CI/CD depth |
| Foundations | 25 | 35+ | Advanced statistics, experiment design |
| Transformer Internals | 25 | 35+ | Architecture comparison, scaling laws |

---

## Priority 3: Cross-Module Questions

System design questions that span multiple modules:

- Design an end-to-end RAG system with serving, monitoring, and cost controls
- Design a multi-agent system with observability and governance
- Design a model serving platform with canary deployments and rollback
- Debug a production LLM application with degrading quality

Target: 10–15 cross-module questions in a dedicated section.

---

## Priority 4: Later Modules

| Module | Priority | Notes |
|---|---|---|
| CV and Generative Architectures | Medium | Important for CV roles, less urgent for LLM-focused |
| Multimodal and VLMs | Medium | Growing rapidly but smaller interview surface |

---

## Expansion Principles

1. Quality over quantity — don't rush to fill gaps
2. Each batch should be independently useful
3. Architect-level questions should increase proportionally
4. Debugging scenarios should be realistic production incidents
5. No duplicate questions — verify against existing batches before adding

---

## Timeline Estimate

- Priority 1 (3 new module batches): next cycle
- Priority 2 (expand 4 modules): following cycle
- Priority 3 (cross-module): after core coverage is solid
- Priority 4 (remaining modules): as needed based on demand
