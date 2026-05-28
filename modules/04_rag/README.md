# Module 04 — RAG

> Ingestion, chunking, retrieval, reranking, context assembly, evaluation, and failure modes.

**Question count:** 27
**Prerequisite modules:** 02 (GenAI), 03 (LLM Engineering — helpful)
**Unlocks:** 05 (Agentic AI), 06 (LLMOps), 09 (System Design), 10 (Debugging)

## How To Use This Module

RAG interviews usually move in this order:

```text
Basic answer -> Concept depth -> Design choice -> Practical build -> Real follow-ups
```

Do not treat this module like a vector-DB glossary. Start with the retrieval mental model, then move into implementation choices, then failure and evaluation pressure.

## File Map

| File | Primary interview use | Focus | Questions |
|-------|------|-------|-----------|
| [concept.md](concept.md) | Basic screen + core concepts | RAG fundamentals, embeddings, chunking, hybrid search, reranking, evaluation, vector DBs, failure modes, and scoped build drills | 8 |
| [applied.md](applied.md) | Design + practical build | Pipeline implementation, query expansion, index freshness, access control, multi-modal, structured data, citation, latency optimization, evaluation datasets, conversational RAG | 10 |
| [system.md](system.md) | Platform-scale design | Multi-tenant RAG platform, ingestion at scale, multi-hop reasoning, quality monitoring | 4 |
| [debugging.md](debugging.md) | Real follow-ups when things break | Hallucination despite good retrieval, embedding migration, stale data, reranker regression, latency scaling | 5 |

If you are early-career, finish `concept.md` and do the build drills. If you are mid-level or senior, move quickly into `applied.md` because most real RAG rounds turn into design-plus-implementation discussion fast.

## Key Topics

- Document ingestion and parsing
- Chunking strategies and trade-offs
- Embedding models and indexing
- Dense, sparse, and hybrid retrieval
- Reranking and relevance scoring
- Context assembly and token budgeting
- RAG evaluation (retrieval + generation)
- RAG failure modes and debugging
