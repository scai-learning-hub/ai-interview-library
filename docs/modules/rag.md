# RAG

Topic family G · Prerequisites: Embeddings, LLM prompting, evaluation basics · Unlocks: Agent-RAG integration, RAGOps, production RAG debugging

RAG is one of the highest-value practical modules in the library because it sits at the boundary between model capability, retrieval quality, document quality, product behavior, and system operations.

---

## Scope

- Ingestion and document processing
- Chunking strategies
- Embeddings and embedding models
- Indexing and vector stores
- Retrieval strategies (dense, sparse, hybrid)
- Metadata filtering
- Reranking
- Context assembly and prompt construction
- Grounding and citation behavior
- Basic RAG, hybrid RAG, graph RAG
- RAG evaluation
- RAG failure modes
- RAG vs fine-tuning vs long context

## Why This Module Matters

Many AI teams ship RAG before they understand it. Interviews reflect that. Strong candidates know that retrieval systems fail in ways that look like model failures, and model failures can be misdiagnosed as retrieval problems.

---

## Subtopic Breakdown

### Ingestion and Document Processing
- Document parsing: PDF, HTML, markdown, tables, images — each has unique challenges
- Cleaning: removing noise, headers/footers, boilerplate that pollutes retrieval
- Metadata extraction: source, date, section, document type — enriches retrieval later
- Update strategy: incremental vs full re-ingestion, freshness tracking

### Chunking
- Fixed-size chunking: simple, predictable, but breaks semantic boundaries
- Semantic chunking: split by meaningful boundaries (paragraphs, sections, topics)
- Recursive chunking: hierarchical split strategies
- Chunk size trade-offs: small chunks → better precision but lose context; large chunks → more context but retrieval noise
- Overlap: preserving boundary context, but increasing index size
- **Interview test:** Can you explain why chunk size affects both retrieval quality AND generation quality?

### Embeddings and Indexing
- Embedding models: sentence-transformers, OpenAI embeddings, Cohere, domain-specific models
- Embedding dimensions: trade-offs in quality, storage, and latency
- Vector stores: Pinecone, Weaviate, Qdrant, pgvector, Chroma — when each fits
- Index types: flat, IVF, HNSW — approximate search trade-offs
- Embedding drift: when embeddings become stale relative to the corpus

### Retrieval Strategies
- Dense retrieval: embedding similarity, good for semantic matching
- Sparse retrieval (BM25): term-frequency matching, good for exact terms, names, codes
- Hybrid retrieval: combining dense + sparse with fusion (RRF, weighted scores)
- When hybrid beats either approach alone and when it adds complexity without benefit
- Top-k selection: how many chunks to retrieve and why more is not always better

### Metadata Filtering
- Pre-retrieval filtering: reduce search space with structured metadata (date, source, category)
- Post-retrieval filtering: remove irrelevant results after retrieval
- Access control: user-level permissions applied at retrieval time
- **Interview focus:** Metadata filtering is often what makes RAG work in production, not just embedding quality

### Reranking
- Cross-encoder reranking: more expensive but more accurate than embedding similarity
- Reranker models: Cohere Rerank, BGE Reranker, cross-encoder fine-tunes
- Two-stage retrieval: fast retrieval (top 50-100) → accurate reranking (top 5-10)
- When reranking helps most: noisy retrieval, ambiguous queries, mixed-quality corpora
- Cost of reranking: latency budget and when to skip it

### Context Assembly and Prompting
- Context ordering: how retrieval results are arranged in the prompt matters
- Lost-in-the-middle: models attend better to content at the beginning and end
- Context deduplication: removing similar chunks to avoid repetition
- System prompt vs user prompt vs context: structure affects grounding quality
- Token budget management: fitting retrieval results within context limits

### Grounding and Citation
- Grounding: model should answer based on retrieved context, not parametric knowledge
- Citation: attributing answers to specific sources and chunks
- Grounded vs hallucinated: how to detect and measure the difference
- Faithfulness evaluation: does the answer contradict or fabricate beyond the context?

### RAG Architectures
- **Basic RAG:** Query → retrieve → generate — single pass
- **Hybrid RAG:** Dense + sparse retrieval, metadata filtering, reranking
- **Agentic RAG:** Model decides when to retrieve, what to retrieve, and whether to retry
- **Graph RAG:** Relationships between entities used to guide retrieval and reasoning
- **When graph RAG fits:** Complex reasoning over connected information (medical, legal, organizational knowledge)
- **When graph RAG doesn't fit:** Most document QA — the graph construction cost is not justified

### RAG Evaluation
- Retrieval quality: precision@k, recall@k, MRR, NDCG
- Generation quality: faithfulness, relevance, completeness
- End-to-end evaluation: does the system answer correctly from the user's perspective?
- RAGAS, TruLens, custom eval frameworks
- Failure mode taxonomy: retrieval miss, retrieval noise, grounding failure, hallucination
- **Interview test:** Can you design an evaluation pipeline that separates retrieval quality from generation quality?

### RAG vs Fine-Tuning vs Long Context
- RAG: external knowledge, fresh and updatable, no model change required
- Fine-tuning: bake knowledge or behavior into the model, training cost, staleness risk
- Long context: put everything in the prompt, no retrieval needed but expensive and degraded attention
- **Decision framework:** Use RAG when knowledge is dynamic and external. Use fine-tuning when behavior change is needed. Use long context when the task is bounded and fits the budget.

---

## What Interviewers Test by Band

### 0–2 years (Junior / early-career)
- Understands pipeline stages: ingest → chunk → embed → index → retrieve → generate
- Can explain chunking, embeddings, retrieval, and reranking in sequence
- Knows why RAG exists (grounding, freshness, access to external knowledge)

### 2–5 years (Mid-level)
- Can choose retrieval strategies and explain hybrid trade-offs
- Understands evaluation beyond "it looks better"
- Can reason about metadata filtering and context assembly
- Knows when reranking helps and what it costs

### 5–8 years (Senior)
- Can diagnose retrieval-induced hallucination, latency spikes, stale indexes, and bad chunking strategy
- Can reason about graph RAG selectively, without forcing it where it does not fit
- Can design end-to-end evaluation separating retrieval from generation

### 8+ years (Staff / Architect)
- Can define RAG strategy for a product line: when to use RAG, when to fine-tune, when to use long context
- Can design RAG infrastructure for multi-tenant, multi-corpus environments
- Can define evaluation governance and freshness SLOs

---

## Depth Ladder

| Level | What Good Looks Like | What Answers Should NOT Be |
|---|---|---|
| Concept | Understands pipeline stages, can explain why each exists | Listing components without explaining the information flow |
| Applied | Can design a RAG pipeline for a specific use case with justified choices | "Use FAISS and GPT-4" without explaining chunking, retrieval, or evaluation |
| System | Can reason about latency, freshness, cost, and multi-tenant considerations | Treating RAG as a solved problem with no operational complexity |
| Debugging | Can isolate whether a failure is retrieval, grounding, generation, or data quality | "The model hallucinated" without checking what was retrieved |
| Architect | Can define RAG strategy including when NOT to use RAG | Treating RAG as the universal solution for all knowledge problems |

---

## Anti-Patterns and Weak Answers

- Treating RAG as always superior to fine-tuning or task-specific workflows
- Discussing embeddings without lexical retrieval trade-offs (BM25)
- Ignoring reranking and context assembly
- Calling any metadata-aware retrieval "graph RAG"
- Evaluating RAG only with end-to-end metrics without separating retrieval from generation
- Not accounting for chunk size impact on both retrieval precision and generation quality
- Treating vector store selection as the main architecture decision when chunking and evaluation matter more

---

## Role Relevance

| Role | Depth Needed | Focus Areas |
|---|---|---|
| LLM / RAG / Agent | ★★★ | Full pipeline, evaluation, failure diagnosis, architecture selection |
| Senior / Architect | ★★★ | Strategy, platform design, evaluation governance |
| Platform AI | ★★ | Infrastructure, multi-tenant RAG, freshness, observability |
| Software → AI | ★★★ | Integration, pipeline implementation, evaluation basics |
| Data / ML | ★★ | Data pipeline, evaluation, embedding quality |
| DevOps → AIOps | ★★ | Operational monitoring, freshness, incident response |
| Research | ★ | Retrieval methods, evaluation rigor |
| DL / CV | ★ | Multimodal RAG awareness |

---

## What To Study Next

- [Agents and Agentic Systems](./agents-and-agentic-systems.md) — agent-RAG integration patterns
- [Systems, Serving, and Inference](./systems-serving-and-inference.md) — RAG serving constraints
- [MLOps / LLMOps / AIOps](./mlops-llmops-aiops.md) — RAGOps and production monitoring
- [Transformer and Modern LLM Internals](./transformer-and-modern-llm-internals.md) — context window and generation mechanics

## Question Bank

Practice questions for this module are in the [RAG question bank](../../modules/04_rag/):
- [Concept questions](../../modules/04_rag/concept.md)
- [Applied questions](../../modules/04_rag/applied.md)
- [System questions](../../modules/04_rag/system.md)
- [Debugging questions](../../modules/04_rag/debugging.md)

## Cross-References

- [Module Index](../indexes/module-index.md) — all modules with sequences and detail cards
- [Experience Index](../indexes/experience-index.md) — depth expectations by career band
- [Tag Index](../indexes/tag-index.md) — related tags: `rag`, `hybrid-rag`, `graph-rag`, `chunking`, `reranking`, `grounding`, `citation`, `embedding-search`, `bm25`, `freshness`
- [Topic Graph](../topic-graph.md) — prerequisite map
