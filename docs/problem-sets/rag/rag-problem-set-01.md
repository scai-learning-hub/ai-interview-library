# RAG Problem Set 01

## Build, Debug, And Harden A Grounded Support Assistant

| Attribute | Value |
|---|---|
| Module | RAG |
| Difficulty | 3-4 |
| Best for | Mid-level to senior LLM / RAG / Agent engineers |
| Timebox | 90-120 minutes |
| Use with | [RAG Module Guide](../../modules/rag.md) and [RAG Batch 01](../../question-library/rag/rag-batch-01.md) |

---

## Scenario

You are building a support assistant for a B2B SaaS product.

It must:

- answer only from approved product docs and release notes
- cite the source section for every answer
- respect tenant-level document access
- reflect document updates within 15 minutes
- stay under a 2.0 second p95 latency target

The current system works in demos but fails in production with stale answers, weak citations, and inconsistent retrieval quality.

## What You Should Produce

1. A pipeline design for ingestion, retrieval, reranking, and answer generation.
2. A bounded implementation plan that one team could ship in two sprints.
3. A debugging plan for the current failures.
4. An evaluation and rollout gate that decides whether the system is good enough to launch.

---

## Part 1: Architecture Pass

### Prompt

Design the end-to-end RAG pipeline. Make explicit choices for:

- chunking strategy
- embedding model policy
- hybrid retrieval vs dense-only retrieval
- reranking
- prompt context assembly
- citation format
- ACL enforcement
- freshness and re-index strategy

### Strong Answer Signals

- separates ingestion, retrieval, ranking, generation, and observability clearly
- uses hybrid retrieval or explains why not
- places ACL filtering before or inside retrieval, not as a cosmetic post-process
- defines how citations stay attached to chunk or document IDs
- treats freshness as an indexing and cache invalidation problem, not just a prompt problem

<details>
<summary>Reviewer rubric</summary>

Look for a design that can survive document updates, tenant isolation, and latency pressure at the same time. The weak answer is a generic vector-store diagram with no ownership of ranking, ACLs, or stale-index behavior.

</details>

---

## Part 2: Build Pass

### Prompt

You have two engineers and one week for the first production-worthy version. What exactly do you build first?

Your answer should include:

- a minimal ingestion pipeline
- retrieval and reranking components
- one citation contract
- one latency budget
- one observability checklist

### Deliverable shape

Use this structure in your answer:

```text
Sprint 1 -> ingest and retrieve
Sprint 2 -> rerank, cite, evaluate, and harden
```

### Strong Answer Signals

- chooses a bounded first version instead of proposing every advanced variant
- gives a stage-by-stage latency budget
- logs retrieved IDs, rerank scores, prompt context, answer, and citation IDs
- explains what is deliberately deferred

<details>
<summary>Reviewer rubric</summary>

The strong candidate knows how to ship a first useful slice. The weak candidate proposes graph RAG, agents, multimodal parsing, and advanced evaluation all at once.

</details>

---

## Part 3: Debugging Pass

### Prompt

Three incidents arrive in the same week:

1. The correct chunk is retrieved, but the answer still ignores it.
2. Updated docs are not reflected for hours.
3. Citations point to the wrong section after reranking.

Describe how you would isolate each failure and what evidence you would inspect first.

### Strong Answer Signals

- separates retrieval bugs from prompt and context-assembly bugs
- checks final packed prompt, not just retrieved results
- traces freshness through ingestion queue, index update, and cache invalidation
- verifies that citation IDs survive chunking, reranking, and rendering
- proposes prevention, not just manual repair

<details>
<summary>Reviewer rubric</summary>

Strong debugging answers follow a sequence: symptom, stage isolation, evidence, hypothesis, fix, prevention. Weak answers jump straight to model swapping or hand-wavy “better prompts.”

</details>

---

## Part 4: Evaluation Pass

### Prompt

Define the minimum evaluation set and release gate for this assistant.

Include:

- retrieval metrics
- answer quality metrics
- citation or faithfulness checks
- freshness checks
- failure cases that must block release

### Strong Answer Signals

- separates retrieval quality from answer quality
- includes adversarial or low-evidence queries
- defines at least one abstention rule
- treats unsupported claims and fake citations as release blockers
- explains how the eval set grows from production failures

<details>
<summary>Reviewer rubric</summary>

If the candidate only says “we’ll manually test a few examples,” the system is not ready. A credible answer includes a versioned eval set and explicit go or no-go thresholds.

</details>

---

## Part 5: Follow-up Pressure

Use these after the candidate finishes the main design:

1. Why not skip reranking and just retrieve more chunks?
2. If latency spikes, what do you cut first without destroying answer quality?
3. How do you support premium tenants needing stricter freshness SLAs than everyone else?
4. When would you choose long context or fine-tuning instead of RAG for this product?

---

## Finish Standard

A strong submission should leave you with:

- a clear first production architecture
- a realistic sprint-scoped build plan
- a structured debugging model
- a release gate that can stop bad launches

If the answer cannot explain ownership of freshness, citations, ACLs, and latency together, it is not production-ready.
