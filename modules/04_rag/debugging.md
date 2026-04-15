# Module 04 — RAG: Debugging Level

---

## Q-04-D-001: Your RAG system retrieves the correct documents but the LLM ignores them and hallucinates.

**Module:** RAG
**Submodule:** Answer Quality
**Level:** Debugging
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer, ML / Data Engineer
**Tags:** [debugging, hallucination, context-ignoring, rag]
**Prerequisites:** Q-04-C-008, Q-04-A-001
**Estimated Interview Round:** Debugging, Deep Dive
**Why This Question Matters:** This is one of the most frustrating RAG failures: retrieval works perfectly, but the LLM generates answers from its own knowledge instead of the provided context. This is a prompt engineering + model behavior problem.

---

**Question**

Users report wrong answers. You verify that the correct chunks ARE being retrieved (relevance score >0.9). But the LLM answer doesn't match the retrieved context. What's happening and how do you fix it?

---

**Expected Answer (Short)**

Root causes: (1) Prompt not forceful enough — model defaults to parametric knowledge when context conflicts with its training data. (2) Context too long — model loses focus on relevant chunks (lost in the middle problem). (3) Context poorly formatted — model can't parse the chunk structure. (4) Model temperature too high — generates creative content instead of faithful answers. Fixes: stronger grounding instructions, reorder context (relevant first), reduce context to fewer, higher-quality chunks, add explicit "if the context doesn't contain this, say so" instruction.

---

**Deep Answer**

- **Debugging checklist:**
  ```
  1. Log the full prompt sent to the LLM
  2. Check if the answer IS in the context (manual inspection)
  3. Check context position (is it at the beginning, middle, or end?)
  4. Check context length (how many tokens of context?)
  5. Check model temperature setting
  6. Check if the answer conflicts with model's training knowledge
  ```

- **Root cause: Lost in the middle**
  ```
  If you have 10 chunks and the relevant answer is in chunk 7,
  models often focus on first+last chunks, ignoring the middle.
  
  Fix: rerank so most relevant chunks are FIRST
  Reduce chunk count: 10 → 3-5 (only highly relevant)
  ```

- **Root cause: Weak grounding instruction**
  ```
  Bad prompt:
  "Here is some context. Answer the question."
  
  Better prompt:
  "Answer the user's question based ONLY on the provided context below.
   Do NOT use any prior knowledge.
   If the context does not contain enough information to answer,
   respond with: 'Based on the available documents, I cannot answer this question.'
   
   Context:
   ---
   {context}
   ---
   
   Question: {question}
   Answer based on context above ONLY:"
  ```

- **Root cause: Context conflicts with training data**
  ```
  Context says: "Our refund policy allows 60 days"
  Model's training data: "Standard refund is 30 days"
  Model answers: "30 days" (from training, ignoring context)
  
  Fix: Increase grounding instruction strength, add few-shot examples
  showing the model choosing context over its own knowledge
  ```

- **Systematic fix:**
  ```python
  def diagnose_hallucination(query, context, answer, llm):
      # Check if answer is derivable from context
      verification = llm.generate(f"""
  Given this context:
  {context}
  
  Can the following answer be directly derived from the context?
  Answer: {answer}
  
  Rate: SUPPORTED / PARTIALLY_SUPPORTED / NOT_SUPPORTED
  Explain which parts are not supported by the context.
  """)
      return verification
  ```

---

**Follow-up Questions**

1. How do you measure the faithfulness rate across all responses?
2. Different LLMs have different grounding strengths. How do you choose?
3. You've optimized the prompt but 5% of responses still hallucinate. What now?

---

**Common Weak Answers / Red Flags**

- "Use a better model" — doesn't diagnose the actual root cause
- Doesn't check the prompt structure
- Unaware of "lost in the middle" phenomenon
- No systematic verification of answer vs context

---

**Interviewer Evaluation Signal**

Systematic debugging. The candidate should log the full prompt, check context positioning, verify answer derivability, and strengthen grounding instructions. This is a common and important RAG failure.

---

## Q-04-D-002: Retrieval performance drops 50% after re-embedding your documents with a new model.

**Module:** RAG
**Submodule:** Embedding Model
**Level:** Debugging
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [debugging, embeddings, model-upgrade, performance-regression, rag]
**Prerequisites:** Q-04-C-002
**Estimated Interview Round:** Debugging
**Why This Question Matters:** Upgrading embedding models should improve retrieval. When it doesn't, the cause is subtle and often relates to model compatibility, dimension mismatches, or normalization differences.

---

**Question**

You upgraded from text-embedding-ada-002 to text-embedding-3-large. All documents were re-embedded. But retrieval recall dropped by 50%. What went wrong?

---

**Expected Answer (Short)**

Top causes: (1) Query embeddings still use the old model — query and doc embeddings must use the SAME model. (2) Dimension mismatch — old model outputs 1536 dims, new model outputs 3072, but vector DB index wasn't rebuilt. (3) Similarity metric mismatch — old model requires cosine, new model may use dot product. (4) Normalization difference — one model normalizes embeddings, the other doesn't. (5) Partial re-embedding — some documents were missed during re-embedding.

---

**Deep Answer**

- **Debugging steps:**
  ```python
  # 1. Verify query and document use same model
  query_emb = model.encode("test query")
  doc_emb = vector_db.get("doc-1").embedding
  print(f"Query dim: {len(query_emb)}, Doc dim: {len(doc_emb)}")
  # If different → FOUND IT
  
  # 2. Check similarity metric
  cosine = cosine_similarity(query_emb, doc_emb)
  dot = dot_product(query_emb, doc_emb)
  print(f"Cosine: {cosine}, Dot: {dot}")
  # If cosine works but dot doesn't → wrong metric in vector DB config
  
  # 3. Check normalization
  print(f"Query norm: {np.linalg.norm(query_emb)}")
  print(f"Doc norm: {np.linalg.norm(doc_emb)}")
  # If norms differ significantly → normalization mismatch
  
  # 4. Spot-check random docs
  sample_ids = random.sample(all_doc_ids, 100)
  re_embedded = model.encode([get_text(id) for id in sample_ids])
  stored = [vector_db.get(id).embedding for id in sample_ids]
  mismatches = sum(1 for r, s in zip(re_embedded, stored) 
                   if not np.allclose(r, s))
  print(f"Mismatches: {mismatches}/100")
  # If mismatches > 0 → partial re-embedding failure
  ```

- **Common pitfalls during embedding model migration:**
  | Issue | Cause | Fix |
  |-------|-------|-----|
  | Dimension mismatch | Models output different dimensions | Rebuild vector DB index |
  | Metric mismatch | cosine vs dot product | Update DB config |
  | Normalization | Model A normalizes, Model B doesn't | Normalize before storage |
  | Partial migration | Some chunks not re-embedded | Verify all chunk embeddings |
  | API version | Using old API version returns old model | Check API config |
  | Truncation | New model has different max token length | Adjust chunk sizes |

---

**Follow-up Questions**

1. How do you perform a zero-downtime embedding model migration?
2. How do you validate the new model before committing to the migration?
3. How do you roll back if the new model performs worse?

---

**Common Weak Answers / Red Flags**

- "The new model must be worse" — doesn't investigate
- Doesn't check if query and document models match
- Unaware of dimension/metric compatibility requirements

---

**Interviewer Evaluation Signal**

Model migration debugging. Embedding model upgrades are common operations. The candidate should check compatibility at every level: model alignment, dimensions, metrics, normalization.

---

## Q-04-D-003: Users report that RAG returns stale, outdated information despite the source documents being updated.

**Module:** RAG
**Submodule:** Index Freshness
**Level:** Debugging
**Difficulty:** 2
**Experience Bands:** Early-career, Mid-level
**Persona Relevance:** DevOps / SRE → AIOps, Software Dev → AI Engineer
**Tags:** [debugging, stale-data, indexing, freshness, rag]
**Prerequisites:** Q-04-A-003
**Estimated Interview Round:** Debugging
**Why This Question Matters:** Stale knowledge base is a silent RAG killer. Users lose trust when the system provides outdated information that contradicts what they know from updated source documents.

---

**Question**

Your company's HR policy was updated last Monday (new PTO policy). Users asking about PTO still get the old policy. The source document in SharePoint is updated. What's the issue?

---

**Expected Answer (Short)**

Debugging the staleness chain: (1) Check when the document was last indexed — if the indexing timestamp is before Monday, the update wasn't picked up. (2) Check the ingestion pipeline schedule — if it runs weekly, it hasn't run since the update. (3) Check change detection — does the pipeline detect SharePoint changes? (4) Check if old chunks were deleted — maybe new chunks were added but old ones still exist (duplicates). (5) Check if embedding service re-embedded the updated content. (6) Check vector DB cache — some vector DBs cache results.

---

**Deep Answer**

- **Staleness debugging flowchart:**
  ```
  User gets stale answer
  └── When was the document last indexed?
      ├── Not indexed since update → Ingestion pipeline issue
      │   ├── Pipeline not scheduled to run? → Fix schedule
      │   ├── Pipeline ran but didn't detect change? → Change detection bug
      │   └── Pipeline ran, detected change, but failed? → Check error logs
      │
      └── Indexed after update → Index contains new content
          ├── Old chunks still exist alongside new? → Chunk deduplication issue
          ├── New chunks have low relevance score? → Re-check embedding
          └── Vector DB serving cached results? → Cache invalidation issue
  ```

- **Common root causes:**
  | Cause | Evidence | Fix |
  |-------|----------|-----|
  | Pipeline not running | Last run timestamp is old | Fix cron/trigger |
  | Change detection missed | Doc hash unchanged in metadata store | Fix hash computation (include content, not just metadata) |
  | Old chunks not deleted | Search returns both old and new chunks for same doc | Delete old chunks before inserting new |
  | Cache serving stale results | Direct DB query returns new data, API returns old | Invalidate/warm cache |
  | Connector permission issue | Pipeline can't read updated doc | Fix service account permissions |

- **Fix: Proper document update flow:**
  ```python
  def update_document(doc_id, new_content):
      # 1. Delete ALL old chunks for this document
      old_chunks = vector_db.query(
          filter={"doc_id": doc_id}
      )
      vector_db.delete([c.id for c in old_chunks])
      
      # 2. Create new chunks
      new_chunks = chunk(new_content)
      embeddings = embed(new_chunks)
      
      # 3. Insert new chunks
      vector_db.upsert(new_chunks, embeddings)
      
      # 4. Invalidate cache for queries related to this document
      cache.invalidate_by_doc(doc_id)
      
      # 5. Update metadata with new hash and timestamp
      metadata_store.update(doc_id, {
          "hash": hash(new_content),
          "indexed_at": now()
      })
  ```

---

**Follow-up Questions**

1. How do you verify that the index correctly reflects the latest source documents?
2. Users expect real-time updates. Your pipeline runs hourly. What do you do?
3. How do you monitor index freshness proactively?

---

**Common Weak Answers / Red Flags**

- "Rebuild the entire index" — doesn't diagnose the root cause
- Doesn't check if old chunks were properly deleted
- Unaware of cache invalidation as a staleness cause

---

**Interviewer Evaluation Signal**

Data pipeline debugging. The candidate should trace the staleness through the full pipeline: source → connector → change detection → ingestion → embedding → vector DB → cache → retrieval.

---

## Q-04-D-004: RAG retrieves relevant documents but the reranker keeps pushing them to the bottom.

**Module:** RAG
**Submodule:** Reranking
**Level:** Debugging
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [debugging, reranking, cross-encoder, retrieval, rag]
**Prerequisites:** Q-04-C-005
**Estimated Interview Round:** Debugging
**Why This Question Matters:** Rerankers should improve retrieval by promoting relevant documents. When they do the opposite, the cause is typically a domain mismatch or input formatting issue.

---

**Question**

Without the reranker, your top-5 retrieval recall is 0.82. After adding a reranker, it drops to 0.65. The reranker is a well-known cross-encoder (bge-reranker-v2). What's going wrong?

---

**Expected Answer (Short)**

Reranker pushes good results down when: (1) Input format mismatch — reranker expects (query, passage) but receives (query, chunk_metadata + passage), confusing the model. (2) Domain mismatch — general-purpose reranker doesn't understand your domain terminology (medical, legal, code). (3) Truncation — reranker has a 512-token limit, your chunks are 1000 tokens, so relevant content is truncated. (4) Score normalization — reranker scores aren't comparable across queries, and your thresholding is wrong. (5) Passage length bias — reranker prefers longer passages, shorter relevant chunks are penalized.

---

**Deep Answer**

- **Debugging steps:**
  ```python
  # 1. Inspect what's being sent to the reranker
  for doc in initial_results[:10]:
      print(f"Query: {query}")
      print(f"Passage: {doc.text[:200]}")
      print(f"Length: {len(doc.text)} chars")
      print(f"Reranker score: {reranker.score(query, doc.text)}")
      print(f"Vector similarity: {doc.score}")
      print("---")
  
  # 2. Check if relevant docs are being truncated
  relevant_doc = find_known_relevant_doc(query)
  truncated = relevant_doc.text[:512]  # Reranker's max input
  full_score = reranker.score(query, relevant_doc.text)
  manual_score = reranker.score(query, truncated)
  print(f"Full: {full_score}, Truncated: {manual_score}")
  # If truncated score is much lower → answer was after the 512-token mark
  
  # 3. Check input format
  # Are you accidentally including metadata in the passage?
  # Bad:  reranker.score(query, f"Source: HR-policy.pdf, Page: 3\n{text}")
  # Good: reranker.score(query, text)
  ```

- **Root causes and fixes:**
  | Cause | Evidence | Fix |
  |-------|----------|-----|
  | Input contamination | Passage includes metadata/headers | Pass only text to reranker |
  | Truncation | Relevant content beyond 512 tokens | Use smaller chunks or chunk-level reranking |
  | Domain mismatch | Good scores on general queries, bad on domain | Fine-tune reranker or use domain-specific model |
  | Length bias | Short relevant chunks score lower than long irrelevant ones | Normalize scores by length |
  | Score inversion | Reranker outputs distance not similarity | Multiply by -1 or use 1-score |

---

**Follow-up Questions**

1. How do you evaluate whether the reranker improves retrieval?
2. When should you NOT use a reranker?
3. How do you fine-tune a reranker for your domain?

---

**Common Weak Answers / Red Flags**

- "Remove the reranker" — doesn't diagnose why
- Doesn't inspect the actual input sent to the reranker
- Unaware of truncation limits on cross-encoders

---

**Interviewer Evaluation Signal**

Component-level debugging. The candidate should isolate the reranker's behavior by checking its inputs, outputs, and comparing with/without. This tests systematic debugging of ML component integration.

---

## Q-04-D-005: RAG system latency increased from 800ms to 6 seconds after adding 50K new documents.

**Module:** RAG
**Submodule:** Performance
**Level:** Debugging
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** DevOps / SRE → AIOps, Software Dev → AI Engineer
**Tags:** [debugging, latency, performance, scaling, vector-database, rag]
**Prerequisites:** Q-04-A-008, Q-04-C-007
**Estimated Interview Round:** Debugging
**Why This Question Matters:** RAG latency should scale sub-linearly with document count (logarithmic for HNSW). If latency degrades linearly, something is architecturally wrong.

---

**Question**

Your RAG system served 50K documents at 800ms. After adding 50K more (now 100K), latency jumped to 6 seconds. Vector search itself is still fast (10ms). Where is the time going?

---

**Expected Answer (Short)**

If vector search is still 10ms, the latency is elsewhere. Investigate: (1) Reranker — if you're reranking 50 results and each result is now a larger passage, cross-encoder scoring is quadratically expensive. (2) Metadata filtering — if filter uses scan instead of index, more documents = more scan time. (3) Embedding service — if embedding model is overloaded (shared resource), query embedding takes longer. (4) Context assembly — if pipeline fetches full documents (not just chunks), more documents = more data transfer. (5) LLM input — if context grew (more chunks, longer chunks), LLM processing is slower.

---

**Deep Answer**

- **Latency breakdown debugging:**
  ```python
  import time
  
  def timed_pipeline(query):
      t0 = time.time()
      embedding = embed(query)
      t1 = time.time()
      results = vector_search(embedding, top_k=50)
      t2 = time.time()
      reranked = rerank(query, results)
      t3 = time.time()
      context = assemble_context(reranked[:5])
      t4 = time.time()
      answer = llm_generate(context, query)
      t5 = time.time()
      
      print(f"Embed: {(t1-t0)*1000:.0f}ms")
      print(f"Search: {(t2-t1)*1000:.0f}ms")
      print(f"Rerank: {(t3-t2)*1000:.0f}ms")
      print(f"Context: {(t4-t3)*1000:.0f}ms")
      print(f"LLM: {(t5-t4)*1000:.0f}ms")
  ```

  Expected result revealing the bottleneck:
  ```
  Before (50K docs): Embed: 20ms, Search: 10ms, Rerank: 200ms, Context: 20ms, LLM: 550ms = 800ms
  After (100K docs): Embed: 20ms, Search: 10ms, Rerank: 200ms, Context: 20ms, LLM: 5750ms = 6000ms
  ```

- **Most likely culprit: LLM context grew:**
  ```
  50K docs → retrieved chunks average 300 tokens each × 5 = 1,500 tokens context
  100K docs → new docs have bigger chunks, 1000 tokens each × 5 = 5,000 tokens context
  Or: metadata filter issues → returning chunks from wrong namespace = irrelevant + relevant
  Or: reranker top_k=5 but pipeline actually passes 20 chunks to LLM
  
  5,000 tokens × 30ms/token for KV cache computation = significant increase
  ```

- **Other candidates:**
  | Component | Why It Could Be Slow | Evidence |
  |-----------|---------------------|----------|
  | Reranker | New docs have longer text, reranker processes more tokens | Rerank time increased |
  | Metadata filter | Unindexed filter field → full scan | Filter time proportional to doc count |
  | Context fetch | Fetching full pages instead of chunks | Network time increased |
  | LLM | Longer context = more generation time | LLM time increased proportionally to input |

---

**Follow-up Questions**

1. You discover the LLM context grew to 10K tokens. How do you fix this without reducing quality?
2. How do you set up monitoring to catch latency regressions before they hit users?
3. Your vector DB is in a different region from your app. Does this affect scaling behavior?

---

**Common Weak Answers / Red Flags**

- "Upgrade the vector database" — vector search isn't the bottleneck
- "Add more RAM" — doesn't diagnose the actual component causing latency
- Doesn't instrument each pipeline stage to find the bottleneck

---

**Interviewer Evaluation Signal**

Performance debugging methodology. The candidate should instrument each pipeline stage, identify the actual bottleneck, and fix it. The key insight is that vector search scales logarithmically, so 10ms → 10ms is expected; the latency is elsewhere.
