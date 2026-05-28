# Module 04 — RAG: Debugging Level

---

## How To Read This File

Debugging-level RAG questions are about disciplined isolation, not clever guesses.

```text
Symptom -> isolate stage -> inspect evidence -> test hypothesis -> repair -> prevent recurrence
```

- **Symptom**: what users or monitors observe
- **Isolate stage**: ingestion, retrieval, reranking, context assembly, generation, cache, infra
- **Inspect evidence**: logs, prompts, chunk IDs, scores, model versions, timings
- **Test hypothesis**: disconfirm the fastest likely cause first
- **Repair**: fix the immediate issue without hiding the root cause
- **Prevent recurrence**: add guards, monitoring, rollout control, or eval coverage

## Debugging Map

| ID | Primary symptom | Stage most likely at fault | What strong answers include |
|---|---|---|---|
| [Q-04-D-001](#q-04-d-001) | Correct docs, wrong answer | Prompt/context/generation | Prompt inspection, context ordering, faithfulness verification |
| [Q-04-D-002](#q-04-d-002) | Retrieval regresses after model upgrade | Embedding/index compatibility | Version checks, dimension/metric validation, rollback plan |
| [Q-04-D-003](#q-04-d-003) | Updated source, stale answer | Ingestion/index/cache | Freshness chain tracing, tombstones, cache invalidation |
| [Q-04-D-004](#q-04-d-004) | Reranker degrades recall | Reranking input/model fit | Input inspection, truncation checks, domain mismatch |
| [Q-04-D-005](#q-04-d-005) | Latency explodes after scale-up | Non-search stages | Stage timings, context growth, filter/index misuse |

---

## Q-04-D-001: Your RAG system retrieves the correct documents but the LLM ignores them and hallucinates.

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| RAG | Answer Quality | Debugging | 3 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Mid-level, Senior | Software Dev → AI Engineer, ML / Data Engineer | Debugging, Deep Dive |

| Prerequisites | Tags |
|---|---|
| Q-04-C-008, Q-04-A-001 | [debugging, hallucination, context-ignoring, rag] |

**Why This Question Matters:** This is one of the most frustrating RAG failures: retrieval works perfectly, but the LLM generates answers from its own knowledge instead of the provided context. This is a prompt engineering + model behavior problem.

---

**Question**

Users report wrong answers. You verify that the correct chunks ARE being retrieved (relevance score >0.9). But the LLM answer doesn't match the retrieved context. What's happening and how do you fix it?

---

#### Debugging Answer

Root causes: (1) Prompt not forceful enough — model defaults to parametric knowledge when context conflicts with its training data. (2) Context too long — model loses focus on relevant chunks (lost in the middle problem). (3) Context poorly formatted — model can't parse the chunk structure. (4) Model temperature too high — generates creative content instead of faithful answers. Fixes: stronger grounding instructions, reorder context (relevant first), reduce context to fewer, higher-quality chunks, add explicit "if the context doesn't contain this, say so" instruction.

---

#### Diagnostic + Repair Notes

- **This is a generation-grounding bug, not a retrieval bug:**
  The first job is to prove the answer-bearing chunk is truly in the final prompt context seen by the model. Teams often say "retrieval was correct" when the chunk was later reordered, truncated, or drowned in prompt assembly.

- **Debugging checklist:**
  ```
  1. Log the full prompt sent to the LLM
  2. Check if the answer IS in the context (manual inspection)
  3. Check context position (is it at the beginning, middle, or end?)
  4. Check context length (how many tokens of context?)
  5. Check model temperature setting
  6. Check if the answer conflicts with model's training knowledge
  ```

- **Fast isolation sequence:**
  | Question | Why it matters |
  |---------|----------------|
  | Is the supporting chunk in the final packed prompt? | Retrieval may be fine but prompt packing may be wrong |
  | Is the chunk near the top or buried in the middle? | Position bias is common |
  | Is the prompt forcing abstention and source use? | Weak prompt contracts cause parametric answers |
  | Is the model or temperature configured for creativity? | High temperature worsens faithfulness |
  | Does the answer contradict well-known public priors? | Model may prefer pretraining knowledge over local evidence |

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

- **Additional common causes strong candidates mention:**
  - The packed context includes duplicate or contradictory chunks.
  - Relevant evidence is clipped during context compression.
  - The answer is multi-hop but the prompt expects single-span extraction.
  - The citation layer is absent, so the model has no pressure to stay grounded.

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

- **Prevention patterns:**
  - Keep top evidence first.
  - Reduce packed context to the minimum useful set.
  - Use citation or span-verification prompts.
  - Track faithfulness and unsupported-claim rate as production metrics.

---

#### Scoped Debug Drill

Take one failing query, log the exact final prompt, move the known-good supporting chunk to the top, lower temperature, and compare the answer plus support classification before and after the change.

#### Real Interviewer Follow-ups

1. How do you measure the faithfulness rate across all responses?
2. Different LLMs have different grounding strengths. How do you choose?
3. You've optimized the prompt but 5% of responses still hallucinate. What now?

---

#### Weak Answer Signals

- "Use a better model" — doesn't diagnose the actual root cause
- Doesn't check the prompt structure
- Unaware of "lost in the middle" phenomenon
- No systematic verification of answer vs context

---

#### Interviewer Signal

Systematic debugging. The candidate should log the full prompt, check context positioning, verify answer derivability, and strengthen grounding instructions. This is a common and important RAG failure.

#### Failure / Production Bridge

This incident matters because it destroys trust while looking superficially healthy: retrieval metrics can look fine even though answer quality is failing at the final step.

---

## Q-04-D-002: Retrieval performance drops 50% after re-embedding your documents with a new model.

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| RAG | Embedding Model | Debugging | 3 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Mid-level, Senior | ML / Data Engineer, Software Dev → AI Engineer | Debugging |

| Prerequisites | Tags |
|---|---|
| Q-04-C-002 | [debugging, embeddings, model-upgrade, performance-regression, rag] |

**Why This Question Matters:** Upgrading embedding models should improve retrieval. When it doesn't, the cause is subtle and often relates to model compatibility, dimension mismatches, or normalization differences.

---

**Question**

You upgraded from text-embedding-ada-002 to text-embedding-3-large. All documents were re-embedded. But retrieval recall dropped by 50%. What went wrong?

---

#### Debugging Answer

Top causes: (1) Query embeddings still use the old model — query and doc embeddings must use the SAME model. (2) Dimension mismatch — old model outputs 1536 dims, new model outputs 3072, but vector DB index wasn't rebuilt. (3) Similarity metric mismatch — old model requires cosine, new model may use dot product. (4) Normalization difference — one model normalizes embeddings, the other doesn't. (5) Partial re-embedding — some documents were missed during re-embedding.

---

#### Diagnostic + Repair Notes

- **Treat embedding migrations like schema migrations, not model swaps:**
  Retrieval regressions after re-embedding usually come from incompatibility, partial rollout, or serving the wrong index version rather than from the model being intrinsically worse.

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

- **Migration checks that strong answers add:**
  | Check | Why |
  |------|-----|
  | Query path model version | Queries may still hit old embedding service |
  | Index version routing | Requests may be pointed at a mixed or stale namespace |
  | Metric config | New vectors may require different similarity behavior |
  | Normalization policy | Silent ranking regressions often start here |
  | Chunking changes | Retrieval may change because chunking changed, not just embeddings |

- **Common pitfalls during embedding model migration:**
  | Issue | Cause | Fix |
  |-------|-------|-----|
  | Dimension mismatch | Models output different dimensions | Rebuild vector DB index |
  | Metric mismatch | cosine vs dot product | Update DB config |
  | Normalization | Model A normalizes, Model B doesn't | Normalize before storage |
  | Partial migration | Some chunks not re-embedded | Verify all chunk embeddings |
  | API version | Using old API version returns old model | Check API config |
  | Truncation | New model has different max token length | Adjust chunk sizes |

- **Zero-downtime repair pattern:**
  - Build a shadow index with the new embeddings.
  - Run offline eval and sampled online comparison.
  - Route a small percentage of traffic to the new path.
  - Cut over only after retrieval slices pass.
  - Keep the old index hot until rollback is no longer needed.

---

#### Scoped Debug Drill

Pick 20 known queries, compare old-index vs new-index Recall@5, and log model version, vector dimension, similarity metric, and normalization status for each path before deciding whether to roll forward or roll back.

#### Real Interviewer Follow-ups

1. How do you perform a zero-downtime embedding model migration?
2. How do you validate the new model before committing to the migration?
3. How do you roll back if the new model performs worse?

---

#### Weak Answer Signals

- "The new model must be worse" — doesn't investigate
- Doesn't check if query and document models match
- Unaware of dimension/metric compatibility requirements

---

#### Interviewer Signal

Model migration debugging. Embedding model upgrades are common operations. The candidate should check compatibility at every level: model alignment, dimensions, metrics, normalization.

#### Failure / Production Bridge

This is a classic silent regression: nothing crashes, but relevance collapses. Good teams treat embedding upgrades as staged migrations with eval gates, not as background maintenance.

---

## Q-04-D-003: Users report that RAG returns stale, outdated information despite the source documents being updated.

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| RAG | Index Freshness | Debugging | 2 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Early-career, Mid-level | DevOps / SRE → AIOps, Software Dev → AI Engineer | Debugging |

| Prerequisites | Tags |
|---|---|
| Q-04-A-003 | [debugging, stale-data, indexing, freshness, rag] |

**Why This Question Matters:** Stale knowledge base is a silent RAG killer. Users lose trust when the system provides outdated information that contradicts what they know from updated source documents.

---

**Question**

Your company's HR policy was updated last Monday (new PTO policy). Users asking about PTO still get the old policy. The source document in SharePoint is updated. What's the issue?

---

#### Debugging Answer

Debugging the staleness chain: (1) Check when the document was last indexed — if the indexing timestamp is before Monday, the update wasn't picked up. (2) Check the ingestion pipeline schedule — if it runs weekly, it hasn't run since the update. (3) Check change detection — does the pipeline detect SharePoint changes? (4) Check if old chunks were deleted — maybe new chunks were added but old ones still exist (duplicates). (5) Check if embedding service re-embedded the updated content. (6) Check vector DB cache — some vector DBs cache results.

---

#### Diagnostic + Repair Notes

- **Staleness is a chain problem, so debug the chain in order:**
  source system -> connector -> change detection -> extraction -> embedding -> index publish -> cache -> serving

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

- **Evidence to collect before changing anything:**
  - Source document version/timestamp.
  - Metadata store hash and last indexed timestamp.
  - Returned chunk IDs and their version metadata.
  - Whether both old and new chunks are simultaneously retrievable.
  - Cache key and cache age for the failing query.

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

- **The deeper issue is publish semantics:**
  - If old and new chunks are visible together, retrieval can oscillate.
  - If updates are frequent, hourly batch jobs may violate user expectations even when the pipeline is "working."
  - If cache invalidation is weak, the answer path can lag behind the index path.

- **Prevention patterns:**
  - Versioned chunk visibility or blue/green index publish.
  - Freshness dashboards by source system.
  - Synthetic probes for recently changed documents.
  - Alerts on indexing lag and duplicate chunk count.

---

#### Scoped Debug Drill

Trace one stale-answer incident end-to-end: prove the source changed, inspect whether the new chunk exists in the index, check whether old chunks still rank, and verify whether cache invalidation happened for the affected document or query family.

#### Real Interviewer Follow-ups

1. How do you verify that the index correctly reflects the latest source documents?
2. Users expect real-time updates. Your pipeline runs hourly. What do you do?
3. How do you monitor index freshness proactively?

---

#### Weak Answer Signals

- "Rebuild the entire index" — doesn't diagnose the root cause
- Doesn't check if old chunks were properly deleted
- Unaware of cache invalidation as a staleness cause

---

#### Interviewer Signal

Data pipeline debugging. The candidate should trace the staleness through the full pipeline: source → connector → change detection → ingestion → embedding → vector DB → cache → retrieval.

#### Failure / Production Bridge

Staleness incidents are dangerous because the answer still looks grounded. Users blame the model, but the root cause is usually missing freshness guarantees in the data path.

---

## Q-04-D-004: RAG retrieves relevant documents but the reranker keeps pushing them to the bottom.

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| RAG | Reranking | Debugging | 3 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Mid-level, Senior | ML / Data Engineer, Software Dev → AI Engineer | Debugging |

| Prerequisites | Tags |
|---|---|
| Q-04-C-005 | [debugging, reranking, cross-encoder, retrieval, rag] |

**Why This Question Matters:** Rerankers should improve retrieval by promoting relevant documents. When they do the opposite, the cause is typically a domain mismatch or input formatting issue.

---

**Question**

Without the reranker, your top-5 retrieval recall is 0.82. After adding a reranker, it drops to 0.65. The reranker is a well-known cross-encoder (bge-reranker-v2). What's going wrong?

---

#### Debugging Answer

Reranker pushes good results down when: (1) Input format mismatch — reranker expects (query, passage) but receives (query, chunk_metadata + passage), confusing the model. (2) Domain mismatch — general-purpose reranker doesn't understand your domain terminology (medical, legal, code). (3) Truncation — reranker has a 512-token limit, your chunks are 1000 tokens, so relevant content is truncated. (4) Score normalization — reranker scores aren't comparable across queries, and your thresholding is wrong. (5) Passage length bias — reranker prefers longer passages, shorter relevant chunks are penalized.

---

#### Diagnostic + Repair Notes

- **A reranker regression is often an interface bug, not a model bug:**
  The quickest win is to inspect exactly what text the reranker receives, how long it is, and whether the scoring semantics are interpreted correctly.

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

- **Extra checks strong candidates add:**
  | Check | Why |
  |------|-----|
  | Candidate set before rerank | If relevant docs are absent, reranker is not the cause |
  | Truncation boundary | Relevant answer may be beyond model max tokens |
  | Score direction | Some pipelines accidentally sort ascending instead of descending |
  | Domain slice behavior | Model may fail specifically on legal, medical, or code terms |

- **Root causes and fixes:**
  | Cause | Evidence | Fix |
  |-------|----------|-----|
  | Input contamination | Passage includes metadata/headers | Pass only text to reranker |
  | Truncation | Relevant content beyond 512 tokens | Use smaller chunks or chunk-level reranking |
  | Domain mismatch | Good scores on general queries, bad on domain | Fine-tune reranker or use domain-specific model |
  | Length bias | Short relevant chunks score lower than long irrelevant ones | Normalize scores by length |
  | Score inversion | Reranker outputs distance not similarity | Multiply by -1 or use 1-score |

- **Repair strategy:**
  - Re-run the failing examples with and without rerank.
  - Measure Recall@K and MRR on a labeled set, not just one query.
  - If domain mismatch is confirmed, either fine-tune the reranker or conditionally disable it on slices where it harms results.

---

#### Scoped Debug Drill

Take 10 labeled failing queries, log pre-rerank candidates, check truncation and input contamination, then compare Recall@5 and MRR before and after cleaning the reranker input format.

#### Real Interviewer Follow-ups

1. How do you evaluate whether the reranker improves retrieval?
2. When should you NOT use a reranker?
3. How do you fine-tune a reranker for your domain?

---

#### Weak Answer Signals

- "Remove the reranker" — doesn't diagnose why
- Doesn't inspect the actual input sent to the reranker
- Unaware of truncation limits on cross-encoders

---

#### Interviewer Signal

Component-level debugging. The candidate should isolate the reranker's behavior by checking its inputs, outputs, and comparing with/without. This tests systematic debugging of ML component integration.

#### Failure / Production Bridge

This failure matters because rerankers are usually added to improve quality. If they silently degrade retrieval, teams can spend weeks tuning prompts while the real regression sits one stage earlier.

---

## Q-04-D-005: RAG system latency increased from 800ms to 6 seconds after adding 50K new documents.

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| RAG | Performance | Debugging | 3 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Mid-level, Senior | DevOps / SRE → AIOps, Software Dev → AI Engineer | Debugging |

| Prerequisites | Tags |
|---|---|
| Q-04-A-008, Q-04-C-007 | [debugging, latency, performance, scaling, vector-database, rag] |

**Why This Question Matters:** RAG latency should scale sub-linearly with document count (logarithmic for HNSW). If latency degrades linearly, something is architecturally wrong.

---

**Question**

Your RAG system served 50K documents at 800ms. After adding 50K more (now 100K), latency jumped to 6 seconds. Vector search itself is still fast (10ms). Where is the time going?

---

#### Debugging Answer

If vector search is still 10ms, the latency is elsewhere. Investigate: (1) Reranker — if you're reranking 50 results and each result is now a larger passage, cross-encoder scoring is quadratically expensive. (2) Metadata filtering — if filter uses scan instead of index, more documents = more scan time. (3) Embedding service — if embedding model is overloaded (shared resource), query embedding takes longer. (4) Context assembly — if pipeline fetches full documents (not just chunks), more documents = more data transfer. (5) LLM input — if context grew (more chunks, longer chunks), LLM processing is slower.

---

#### Diagnostic + Repair Notes

- **The premise already narrows the search space:**
  If vector search is still 10 ms, the latency spike is almost certainly in reranking, context fetch/assembly, remote dependencies, or generator input growth.

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

- **Additional high-value checks:**
  - Did the retrieval or reranking stage start returning longer chunks after the new corpus was added?
  - Did a namespace/filter bug pull in irrelevant documents from the new batch?
  - Did the prompt packer start including more than the intended top-k?
  - Did a remote model or embedding service become overloaded after traffic or corpus growth?

- **Prevention patterns:**
  - Emit per-stage timings on every request.
  - Track average packed-context tokens and top-k after rerank.
  - Alert on changes in chunk length distribution after ingestion changes.
  - Run scale-step load tests before corpus expansions hit production.

---

#### Scoped Debug Drill

Instrument one slow query end-to-end, record stage timings and packed-context tokens, then verify whether the regression comes from longer passages, broader retrieval, or prompt assembly instead of from ANN search itself.

#### Real Interviewer Follow-ups

1. You discover the LLM context grew to 10K tokens. How do you fix this without reducing quality?
2. How do you set up monitoring to catch latency regressions before they hit users?
3. Your vector DB is in a different region from your app. Does this affect scaling behavior?

---

#### Weak Answer Signals

- "Upgrade the vector database" — vector search isn't the bottleneck
- "Add more RAM" — doesn't diagnose the actual component causing latency
- Doesn't instrument each pipeline stage to find the bottleneck

---

#### Interviewer Signal

Performance debugging methodology. The candidate should instrument each pipeline stage, identify the actual bottleneck, and fix it. The key insight is that vector search scales logarithmically, so 10ms → 10ms is expected; the latency is elsewhere.

#### Failure / Production Bridge

This incident is a good test of engineering discipline: the visible symptom is "RAG got slower," but the real skill is proving which stage expanded with scale and why the architecture allowed that coupling.
