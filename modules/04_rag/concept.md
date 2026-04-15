# Module 04 — RAG (Retrieval-Augmented Generation): Concept Level

---

## Q-04-C-001: What is Retrieval-Augmented Generation and why does it solve the LLM knowledge limitation problem?

**Module:** RAG
**Submodule:** Fundamentals
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Beginner, Early-career, Mid-level
**Persona Relevance:** Software Dev → AI Engineer, ML / Data Engineer, Fresher / Beginner
**Tags:** [rag, retrieval, augmented-generation, knowledge, fundamentals]
**Prerequisites:** Q-02-C-001
**Estimated Interview Round:** Screening, Technical
**Why This Question Matters:** RAG is the most popular architecture pattern for production LLM applications. Understanding why it exists (LLM knowledge is static and limited) and how it works (retrieve relevant context, inject into prompt) is the foundation for all RAG engineering.

---

**Question**

Why do LLMs need RAG? What problem does it solve and how does the basic architecture work?

---

**Expected Answer (Short)**

LLMs have static knowledge (training cutoff date), can't access private/proprietary data, and hallucinate when asked about unknown topics. RAG solves this by: (1) retrieving relevant documents from an external knowledge base at query time, (2) injecting retrieved context into the LLM prompt, (3) LLM generates an answer grounded in the provided context. Architecture: User query → embedding → vector search → top-K documents → inject into prompt → LLM generates answer.

---

**Deep Answer**

- **Problems RAG solves:**
  | Problem | Without RAG | With RAG |
  |---------|-------------|----------|
  | Knowledge cutoff | Model doesn't know events after training | Retrieves current documents |
  | Private data | Model never trained on company docs | Retrieves from internal knowledge base |
  | Hallucination | Model invents plausible-sounding answers | Answer grounded in retrieved facts |
  | Verifiability | No way to check model's sources | Can cite retrieved documents |
  | Updates | Retrain the model (expensive) | Update the knowledge base (cheap) |

- **Basic RAG pipeline:**
  ```
  1. Indexing (offline):
     Documents → Chunk → Embed each chunk → Store in vector DB
  
  2. Retrieval (runtime):
     User query → Embed query → Vector search (cosine similarity) → Top-K chunks
  
  3. Generation (runtime):
     System prompt + Retrieved chunks + User query → LLM → Answer
  ```

- **Example prompt with RAG context:**
  ```
  System: Answer the user's question based ONLY on the provided context. 
  If the context doesn't contain the answer, say "I don't have this information."
  
  Context:
  [Document 1]: Our refund policy allows returns within 30 days of purchase...
  [Document 2]: For items over $500, a restocking fee of 15% applies...
  
  User: What's the refund policy for a $600 item?
  ```

---

**Follow-up Questions**

1. When would you NOT use RAG and fine-tune instead?
2. What are the failure modes of RAG?
3. How do you measure RAG quality?

---

**Common Weak Answers / Red Flags**

- "RAG is just search + LLM" — misses the nuance of why retrieval quality matters
- Can't explain when RAG fails (retrieval misses relevant docs, LLM ignores context)
- Doesn't mention grounding or reduced hallucination as key benefits

---

**Interviewer Evaluation Signal**

Foundational understanding. The candidate should articulate WHY RAG exists (not just how) and describe the three-stage pipeline clearly.

---

## Q-04-C-002: How do embedding models work for RAG, and what factors affect retrieval quality?

**Module:** RAG
**Submodule:** Embeddings
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Early-career, Mid-level
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [embeddings, vector-search, similarity, retrieval, rag]
**Prerequisites:** Q-00-C-002
**Estimated Interview Round:** Technical
**Why This Question Matters:** The embedding model is the most critical component of RAG — if retrieval fails, the LLM gets wrong context and produces wrong answers. Understanding embedding model selection, similarity metrics, and their limitations is essential.

---

**Question**

How do embedding models convert text to vectors, and what factors determine whether a query will retrieve the right documents?

---

**Expected Answer (Short)**

Embedding models (e.g., text-embedding-3-small, BGE, E5) encode text into dense vectors where semantic similarity corresponds to vector proximity. Key factors for retrieval quality: (1) Embedding model quality — domain-trained models outperform general models. (2) Chunking strategy — chunk size and boundaries affect what gets embedded. (3) Query-document mismatch — queries are short and questions, documents are long and declarative, causing asymmetry. (4) Similarity metric — cosine similarity is standard, but different metrics suit different embedding models.

---

**Deep Answer**

- **How embeddings work:**
  - Input text → Encoder (transformer-based) → Dense vector (384-3072 dimensions)
  - Similar meanings → nearby vectors (high cosine similarity)
  - "How to reset password" → similar vector to "Password reset procedure"
  - "Apple the fruit" → different vector from "Apple the company" (contextual)

- **Factors affecting retrieval quality:**
  | Factor | Impact | Solution |
  |--------|--------|----------|
  | Embedding model | 20-40% quality difference between models | Benchmark on YOUR data, not MTEB leaderboard |
  | Chunk size | Too large: diluted relevance. Too small: no context | Test 256, 512, 1024 tokens — measure retrieval recall |
  | Query-doc asymmetry | Queries are questions, docs are statements | Use query/document prefixes (E5: "query:" "passage:") |
  | Domain vocabulary | General embeddings miss domain terms | Fine-tune embedding model or use domain-specific one |
  | Metadata filtering | Reduces search space to relevant docs | Pre-filter by date, category, source before vector search |

- **Embedding model comparison (2025-2026):**
  | Model | Dimensions | Speed | Quality |
  |-------|-----------|-------|---------|
  | OpenAI text-embedding-3-large | 3072 | Fast (API) | High |
  | BGE-large-en-v1.5 | 1024 | Medium | High |
  | E5-mistral-7b-instruct | 4096 | Slow | Highest |
  | Nomic-embed-text | 768 | Fast | Good |
  | Cohere embed-v3 | 1024 | Fast (API) | High |

- **Common pitfalls:**
  - Using cosine similarity with an embedding model trained for L2 distance
  - Not normalizing vectors before cosine similarity
  - Assuming embedding models handle code/tables/images (they're text-optimized)

---

**Follow-up Questions**

1. How do you evaluate whether your embedding model is good enough for your use case?
2. What's the trade-off between embedding dimension and retrieval quality?
3. How do you handle multilingual retrieval (query in English, documents in other languages)?

---

**Common Weak Answers / Red Flags**

- "All embedding models are the same" — false, 20-40% quality difference
- Doesn't know about query-document asymmetry
- Can't explain when to fine-tune embeddings

---

**Interviewer Evaluation Signal**

Embedding model awareness beyond "use OpenAI's." Understanding domain-specific fine-tuning, query-doc asymmetry, and benchmarking on own data shows RAG engineering maturity.

---

## Q-04-C-003: What are the different chunking strategies for RAG and when should you use each?

**Module:** RAG
**Submodule:** Chunking
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Early-career, Mid-level
**Persona Relevance:** Software Dev → AI Engineer, ML / Data Engineer
**Tags:** [chunking, text-splitting, document-processing, rag]
**Prerequisites:** Q-03-A-007
**Estimated Interview Round:** Technical
**Why This Question Matters:** Chunking decisions directly affect retrieval quality. Wrong chunking means the right information either doesn't exist in any single chunk (split across chunks) or is diluted by irrelevant content in the same chunk.

---

**Question**

Compare fixed-size, semantic, recursive, and document-structure-based chunking. When should you use each?

---

**Expected Answer (Short)**

Fixed-size: split every N tokens. Simple, predictable. Use when documents are homogeneous text. Semantic: split on topic shifts (sentence embeddings). Use when documents contain multiple topics. Recursive: hierarchically split (paragraphs → sentences → words until under token limit). Use as a general-purpose default. Document-structure: split on headers, sections, tables. Use when documents have clear structure (markdown, HTML, PDF with headings). Best practice: match chunking strategy to your document type.

---

**Deep Answer**

- **Strategy comparison:**
  | Strategy | Pros | Cons | Best For |
  |----------|------|------|----------|
  | Fixed-size (token) | Simple, predictable cost | May split mid-sentence/paragraph | Uniform text, logs |
  | Recursive | Respects boundaries (paragraph → sentence) | Needs parameter tuning | General-purpose default |
  | Semantic | Chunks by topic coherence | More compute, needs embedding model | Multi-topic documents |
  | Document-structure | Preserves logical sections | Requires parsing (HTML/PDF/MD) | Structured documents |
  | Parent-child | Small chunks for retrieval, parent for context | More complex indexing | Any (advanced) |

- **Chunk size considerations:**
  ```
  Too small (50 tokens):
  - High recall (finds relevant chunk)
  - But chunk lacks context → LLM can't form complete answer
  
  Too large (2000 tokens):
  - Rich context per chunk
  - But diluted relevance → irrelevant content mixed in
  - Fewer chunks fit in context window
  
  Sweet spot: 256-512 tokens for most use cases
  (But always test on YOUR data with YOUR queries)
  ```

- **Parent-child chunking (advanced):**
  ```
  Document → Parent chunks (1000 tokens each, for context)
              └── Child chunks (200 tokens each, for retrieval)
  
  Search: embed and retrieve child chunks
  Display: return the parent chunk (more context for LLM)
  ```
  This gives you precise retrieval with rich context.

- **Overlap strategy:**
  - 10-20% overlap between adjacent chunks
  - Ensures information at chunk boundaries isn't lost
  - Example: 500-token chunks with 50-token overlap

---

**Follow-up Questions**

1. You have a PDF with tables and images. How do you chunk it?
2. What chunk size gives the best retrieval performance? How do you determine this?
3. How does chunk size interact with the embedding model's max input length?

---

**Common Weak Answers / Red Flags**

- "Just split every 500 characters" — not token-aware, ignores boundaries
- One-size-fits-all chunking without considering document structure
- No overlap between chunks
- Doesn't test multiple strategies

---

**Interviewer Evaluation Signal**

Attention to the most important RAG preprocessing step. Candidates who describe parent-child chunking or semantic chunking show advanced knowledge. The key insight: chunking strategy should match document type.

---

## Q-04-C-004: What is hybrid search and why does it outperform pure vector search for RAG?

**Module:** RAG
**Submodule:** Retrieval
**Level:** Concept
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [hybrid-search, bm25, vector-search, retrieval, rag]
**Prerequisites:** Q-04-C-002
**Estimated Interview Round:** Technical
**Why This Question Matters:** Pure vector search fails on keyword-specific queries (product SKUs, error codes, names). Pure keyword search fails on semantic queries. Hybrid search combines both and is the standard for production RAG systems.

---

**Question**

Why is hybrid search (vector + keyword) better than either alone? How do you combine the scores?

---

**Expected Answer (Short)**

Vector search excels at semantic matching ("What causes server errors?" finds "Common HTTP 500 issues") but misses exact terms ("ERROR-42B" won't match if not semantically similar). Keyword search (BM25) excels at exact matching ("ERROR-42B" → exact document) but misses semantics. Hybrid combines both: run both searches, merge results using Reciprocal Rank Fusion (RRF) or weighted scoring. Typically 10-25% improvement over either alone. Alpha parameter controls vector vs keyword weight.

---

**Deep Answer**

- **Failure cases each search type misses:**
  | Query | Vector Search | BM25 | Hybrid |
  |-------|--------------|------|--------|
  | "How to handle authentication?" | Finds docs about auth concepts | Finds docs containing "authentication" | Both ✓ |
  | "Error code ERR-AUTH-403" | May miss (not semantically similar to training) | Exact match ✓ | ✓ |
  | "Best practices for securing APIs" | Finds related concepts ✓ | May miss (no exact keyword match) | ✓ |

- **Score fusion (Reciprocal Rank Fusion — RRF):**
  ```python
  def reciprocal_rank_fusion(vector_results, keyword_results, k=60):
      scores = {}
      for rank, doc in enumerate(vector_results):
          scores[doc.id] = scores.get(doc.id, 0) + 1 / (k + rank + 1)
      for rank, doc in enumerate(keyword_results):
          scores[doc.id] = scores.get(doc.id, 0) + 1 / (k + rank + 1)
      
      return sorted(scores.items(), key=lambda x: x[1], reverse=True)
  ```

- **Alternative: weighted linear combination:**
  ```python
  def hybrid_score(vector_score, keyword_score, alpha=0.7):
      # alpha: weight for vector search (0.7 = 70% vector, 30% keyword)
      return alpha * vector_score + (1 - alpha) * keyword_score
  ```
  Alpha tuning: start at 0.7, test 0.5-0.9 on your eval set.

- **Native hybrid search support:**
  | Vector DB | Hybrid Support |
  |-----------|---------------|
  | Weaviate | Built-in BM25 + vector |
  | Qdrant | Sparse + dense vectors |
  | Pinecone | Sparse-dense hybrid |
  | Elasticsearch | BM25 + kNN vector |

---

**Follow-up Questions**

1. How do you tune the alpha (vector vs keyword weight) for your use case?
2. When would pure vector search outperform hybrid?
3. How does hybrid search affect latency?

---

**Common Weak Answers / Red Flags**

- "Vector search handles everything" — doesn't for exact matches
- Doesn't know about BM25 or keyword search
- Can't explain score fusion methods

---

**Interviewer Evaluation Signal**

Practical retrieval understanding. Hybrid search is the production standard for RAG. Candidates who know RRF and can explain when each search type fails show retrieval engineering knowledge.

---

## Q-04-C-005: What is a reranker and how does it improve RAG retrieval quality?

**Module:** RAG
**Submodule:** Reranking
**Level:** Concept
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [reranking, cross-encoder, retrieval, quality, rag]
**Prerequisites:** Q-04-C-002, Q-04-C-004
**Estimated Interview Round:** Technical
**Why This Question Matters:** Initial retrieval (vector search) is fast but approximate. Reranking with a cross-encoder is slower but much more accurate. This two-stage approach (retrieve many, rerank few) is standard for high-quality production RAG.

---

**Question**

How does a reranker work, and why is the two-stage retrieve-then-rerank approach standard for production RAG?

---

**Expected Answer (Short)**

Stage 1 (retrieval): fast bi-encoder search retrieves top-50 candidates. Stage 2 (reranking): slow cross-encoder scores each of the 50 candidates by processing (query, document) pair together. Cross-encoder is more accurate because it sees the full interaction between query and document tokens (cross-attention), unlike bi-encoder which embeds them independently. After reranking, take top-5 for the LLM context. Improves retrieval precision significantly (20-40% improvement typical).

---

**Deep Answer**

- **Bi-encoder vs Cross-encoder:**
  ```
  Bi-encoder (Stage 1 - Retrieval):
  Query → [Encoder] → q_vec    }
                                } cosine_similarity(q_vec, d_vec)
  Doc   → [Encoder] → d_vec    }
  
  Cross-encoder (Stage 2 - Reranking):
  [Query + Doc] → [Encoder] → relevance_score
  
  The cross-encoder sees BOTH texts together → much richer understanding
  ```

- **Why two stages:**
  - Cross-encoder is 100-1000x slower than bi-encoder per comparison
  - Can't afford to cross-encode against millions of documents
  - Solution: bi-encoder retrieves 20-100 candidates (fast), cross-encoder reranks them (accurate)

- **Performance example:**
  ```
  Without reranking: Retrieval recall@5 = 65%
  With reranking: Retrieval recall@5 = 85%
  
  Pipeline:
  1. Vector search → top 50 documents (50ms)
  2. Reranker scores 50 pairs (200ms)
  3. Take top 5 → feed to LLM
  Total added latency: ~200ms for 20% precision improvement
  ```

- **Popular rerankers:**
  | Model | Type | Quality |
  |-------|------|---------|
  | Cohere rerank-v3 | API | High |
  | BGE-reranker-v2 | Open source | High |
  | Cross-encoder/ms-marco-MiniLM | Open source | Good |
  | Jina reranker v2 | Open source | Good |

---

**Follow-up Questions**

1. When is a reranker NOT worth the added latency?
2. Can you fine-tune a reranker on domain-specific data? How?
3. What's the optimal number of candidates to retrieve for reranking?

---

**Common Weak Answers / Red Flags**

- Doesn't know what a reranker is
- "Just use a better embedding model" — different problem, both are needed
- Can't explain bi-encoder vs cross-encoder difference

---

**Interviewer Evaluation Signal**

RAG pipeline sophistication. Two-stage retrieval is the production standard. Understanding WHY (cross-encoder accuracy trade-off) and WHEN to use it shows practical RAG knowledge.

---

## Q-04-C-006: How do you evaluate RAG system quality? What metrics matter?

**Module:** RAG
**Submodule:** Evaluation
**Level:** Concept
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer, Senior / Architect
**Tags:** [evaluation, metrics, ragas, retrieval-quality, rag]
**Prerequisites:** Q-04-C-001
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** RAG evaluation is harder than traditional search evaluation because you're evaluating TWO components (retrieval + generation) and their interaction. Wrong metrics lead to optimizing the wrong thing.

---

**Question**

What metrics do you use to evaluate a RAG system? How do you determine whether poor answers are caused by retrieval failure or generation failure?

---

**Expected Answer (Short)**

Two-level evaluation: (1) Retrieval metrics: Recall@K (did the retrieved chunks contain the answer?), Precision@K (were retrieved chunks relevant?), MRR (was the relevant chunk ranked first?). (2) Generation metrics: Faithfulness (is the answer supported by the context?), Answer relevance (does the answer address the question?), Correctness (is the answer factually correct?). Diagnosis: if retrieval recall is high but answer quality is low → LLM problem. If retrieval recall is low → retrieval problem. Tools: RAGAS framework automates these metrics.

---

**Deep Answer**

- **Retrieval metrics:**
  | Metric | Formula | What It Measures |
  |--------|---------|-----------------|
  | Recall@K | (Relevant retrieved) / (All relevant) | Did we find the right docs? |
  | Precision@K | (Relevant retrieved) / K | Are the retrieved docs actually relevant? |
  | MRR | 1/(rank of first relevant) | Is the most relevant doc ranked first? |
  | NDCG@K | Normalized discounted cumulative gain | Are relevant docs ranked higher? |

- **Generation metrics:**
  | Metric | Method | What It Measures |
  |--------|--------|-----------------|
  | Faithfulness | LLM-judge: "Is the answer supported by context?" | Hallucination detection |
  | Answer relevance | LLM-judge: "Does the answer address the question?" | On-topic response |
  | Correctness | Compare to ground truth answer | Factual accuracy |
  | Context relevance | LLM-judge: "Is the retrieved context relevant to the question?" | Retrieval relevance |

- **Diagnostic matrix:**
  ```
  Retrieval good + Generation good = System working ✓
  Retrieval good + Generation bad  = Fix prompts or LLM (context ignored)
  Retrieval bad  + Generation good = Impossible (lucky, unreliable)
  Retrieval bad  + Generation bad  = Fix retrieval first
  ```

- **RAGAS framework:**
  ```python
  from ragas import evaluate
  from ragas.metrics import faithfulness, answer_relevancy, context_precision, context_recall
  
  result = evaluate(
      dataset,
      metrics=[faithfulness, answer_relevancy, context_precision, context_recall]
  )
  
  # Interpretation:
  # faithfulness: 0.85 → 15% of answers contain unsupported claims
  # context_precision: 0.70 → 30% of retrieved contexts are irrelevant
  ```

---

**Follow-up Questions**

1. How do you create a ground truth evaluation dataset for RAG?
2. Faithfulness is 0.9 but users still complain. What's missing from the evaluation?
3. How frequently should you re-evaluate your RAG system?

---

**Common Weak Answers / Red Flags**

- Only measures end-to-end quality (can't diagnose retrieval vs generation)
- Uses BLEU/ROUGE (wrong metrics for RAG — these measure surface similarity, not correctness)
- No ground truth evaluation dataset

---

**Interviewer Evaluation Signal**

RAG evaluation literacy. The two-level approach (retrieval metrics + generation metrics) with diagnostic matrix shows the candidate can systematically improve RAG systems.

---

## Q-04-C-007: What are the different vector database architectures and how do you choose one for production RAG?

**Module:** RAG
**Submodule:** Vector Databases
**Level:** Concept
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer, DevOps / SRE → AIOps
**Tags:** [vector-database, hnsw, ivf, metadata-filtering, rag]
**Prerequisites:** Q-04-C-002
**Estimated Interview Round:** Technical
**Why This Question Matters:** Vector database choice affects retrieval latency, scale, cost, and available features (metadata filtering, hybrid search, multi-tenancy). Making the wrong choice early requires expensive migration later.

---

**Question**

Compare HNSW and IVF index types for vector databases. When would you use each? What factors drive vector database selection for production RAG?

---

**Expected Answer (Short)**

HNSW (Hierarchical Navigable Small World): graph-based index, high recall, fast search, high memory usage. Best for production with <10M vectors per index. IVF (Inverted File Index): partition-based, lower memory, slightly lower recall, scales better to billions of vectors. Selection factors: (1) Scale: <10M vectors → almost any DB works; >100M → need careful choice. (2) Features: metadata filtering, hybrid search, multi-tenancy, ACL. (3) Operations: managed vs self-hosted, backup/restore, monitoring. (4) Latency: HNSW ~5ms, IVF ~10-50ms for top-10, depending on nprobe.

---

**Deep Answer**

- **Index comparison:**
  | Property | HNSW | IVF | IVF-PQ |
  |----------|------|-----|--------|
  | Recall@10 | 95-99% | 85-95% | 80-90% |
  | Search latency | 1-10ms | 5-50ms | 5-20ms |
  | Memory | Full vectors in memory | Centroids + vectors | Compressed vectors |
  | Build time | Slow | Fast | Medium |
  | Scale | <50M vectors | <1B vectors | Billions |
  | Update cost | Moderate | Low | Low |

- **Vector database comparison (2025-2026):**
  | DB | Strengths | Weaknesses |
  |----|-----------|------------|
  | Pinecone | Managed, simple, serverless option | Vendor lock-in, cost at scale |
  | Weaviate | Hybrid search built-in, multi-modal | More complex to operate |
  | Qdrant | Filtering, sparse-dense hybrid, Rust-fast | Smaller community |
  | Milvus | Scales to billions, GPU acceleration | Complex to operate |
  | pgvector | Runs in Postgres (!), simple | Limited scale, no native hybrid |
  | Chroma | Easy local development | Not production-scale |

- **Selection decision framework:**
  ```
  Prototyping → Chroma (local) or pgvector (Postgres users)
  <5M vectors, simple → pgvector or Pinecone
  <50M vectors, production → Qdrant, Weaviate, or Pinecone
  >100M vectors → Milvus, or Qdrant with sharding
  Need hybrid search → Weaviate, Qdrant
  Already have Elasticsearch → Elasticsearch kNN
  ```

---

**Follow-up Questions**

1. How do you handle vector database migrations when switching providers?
2. What's the cost model difference between managed and self-hosted vector databases?
3. How does metadata filtering interact with vector search performance?

---

**Common Weak Answers / Red Flags**

- "Just use Pinecone/Chroma" without understanding trade-offs
- Doesn't know about HNSW vs IVF
- Ignores metadata filtering as a selection criterion
- No consideration of scale or operational concerns

---

**Interviewer Evaluation Signal**

Infrastructure-level RAG knowledge. The candidate should match vector DB choice to requirements (scale, features, operations) rather than defaulting to "whatever tutorial I followed."

---

## Q-04-C-008: What are common RAG failure modes and how do you prevent them?

**Module:** RAG
**Submodule:** Failure Analysis
**Level:** Concept
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer, Senior / Architect
**Tags:** [failure-modes, hallucination, retrieval-failure, rag]
**Prerequisites:** Q-04-C-001, Q-04-C-006
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** RAG systems fail in specific, predictable ways. Understanding these failure modes enables proactive prevention rather than reactive debugging.

---

**Question**

List the top 5 RAG failure modes and explain how you prevent each.

---

**Expected Answer (Short)**

(1) Retrieval failure: relevant documents exist but aren't retrieved → fix embedding model, chunking, or query. (2) Context ignored: LLM has the right context but generates from parametric knowledge → strengthen prompt ("Answer ONLY from context"). (3) Context poisoning: wrong documents retrieved, LLM generates confidently wrong answer → add relevance threshold, reranker. (4) Information fragmentation: answer spans multiple chunks, no single chunk has the complete answer → parent-child chunking, multi-hop retrieval. (5) Stale knowledge: KB not updated, retrieved docs are outdated → freshness scoring, metadata filtering by date.

---

**Deep Answer**

| Failure Mode | Symptom | Root Cause | Prevention |
|-------------|---------|------------|------------|
| Retrieval miss | "I don't have information about X" (but KB has it) | Embedding mismatch, poor chunking, query-doc asymmetry | Hybrid search, better embeddings, query expansion |
| Context ignored | Answer contradicts retrieved context | LLM trusts parametric knowledge over context | Stronger grounding instructions, few-shot examples |
| Context poisoning | Confidently wrong answer | Wrong docs retrieved, no relevance threshold | Reranker, similarity threshold, answer verification |
| Fragmented answer | Partial or incomplete answer | Answer spans 3+ chunks, only 1 retrieved | Parent-child chunks, multi-hop retrieval |
| Stale knowledge | Outdated answer | KB not refreshed, old docs ranked highly | Date-aware scoring, forced refresh, metadata filtering |
| Hallucinated citations | Cites document that doesn't exist | LLM generates plausible-looking citations | Only allow citations from retrieved doc IDs |
| Over-retrieval | Answer is verbose and unfocused | Too many chunks injected, LLM overwhelmed | Fewer chunks (3-5), reranking for precision |

- **The "lost in the middle" problem:**
  - LLMs pay more attention to the beginning and end of context
  - If the relevant chunk is in the middle of 10 retrieved documents, LLM may miss it
  - Fix: rerank so the most relevant chunk is first, or limit to fewer chunks

---

**Follow-up Questions**

1. How do you build a RAG monitoring system that detects these failures automatically?
2. Your RAG system works for English but fails for Japanese. What failure modes are language-specific?
3. How do you handle queries where no relevant document exists in the KB?

---

**Common Weak Answers / Red Flags**

- "RAG prevents hallucination" — it reduces but doesn't eliminate it
- Can't name specific failure modes
- No prevention strategies (only reactive debugging)

---

**Interviewer Evaluation Signal**

RAG production awareness. Knowing failure modes BEFORE encountering them shows experience. The "lost in the middle" problem is a good litmus test for recent paper awareness.
