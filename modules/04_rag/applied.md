# Module 04 — RAG (Retrieval-Augmented Generation): Applied Level

---

## How To Read This File

Applied RAG questions are where interviews stop being theory and start sounding like actual engineering work:

```text
Design choice -> Build scope -> Constraints -> Failure handling -> Real follow-ups
```

- **Design choice**: what architecture or retrieval pattern you would choose
- **Build scope**: the smallest useful implementation you can actually ship or demo
- **Constraints**: latency, access control, freshness, and cost
- **Failure handling**: what breaks and how you contain it
- **Real follow-ups**: how an interviewer pressures the design after the happy path

## Implementation Map

| ID | Core problem | Bounded build scope | Pressure point |
|---|---|---|---|
| [Q-04-A-001](#q-04-a-001) | End-to-end RAG pipeline | LangChain + FAISS/BM25 + RRF + citations | Quality vs latency |
| [Q-04-A-002](#q-04-a-002) | Query transformation | Add HyDE or multi-query retrieval and measure impact | Extra LLM calls and cost |
| [Q-04-A-003](#q-04-a-003) | Index freshness | Build incremental re-indexing with versioning/tombstones | Stale answers after document updates |
| [Q-04-A-004](#q-04-a-004) | Metadata filters and ACLs | Enforce tenant/source filters before retrieval | Security leaks through retrieval |
| [Q-04-A-005](#q-04-a-005) | Multi-modal RAG | Extract tables/images and retrieve them with text | Parsing complexity |
| [Q-04-A-006](#q-04-a-006) | Structured data RAG | Route to SQL/API tools instead of only vector search | Hallucinated joins or tool misuse |
| [Q-04-A-007](#q-04-a-007) | Citation and attribution | Keep answer spans tied to retrieved source chunks | Fake citations |
| [Q-04-A-008](#q-04-a-008) | Low-latency RAG | Profile and cut each stage under a strict SLA | Recall loss from aggressive shortcuts |
| [Q-04-A-009](#q-04-a-009) | RAG evaluation dataset | Build labeled queries, expected docs, and answer checks | Evaluation drift |
| [Q-04-A-010](#q-04-a-010) | Conversational RAG | Maintain history, rewrite queries, and bound context growth | Retrieval drift across turns |

---

## Q-04-A-001: Implement a production RAG pipeline with hybrid search, reranking, and answer grounding.

**Module:** RAG
**Submodule:** Pipeline Implementation
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer, ML / Data Engineer
**Tags:** [rag-pipeline, hybrid-search, reranking, implementation, rag]
**Prerequisites:** Q-04-C-001, Q-04-C-004, Q-04-C-005
**Estimated Interview Round:** Technical, Coding
**Why This Question Matters:** Building a complete RAG pipeline requires integrating multiple components correctly. The difference between a demo RAG and a production RAG is the presence of hybrid search, reranking, answer grounding, and proper error handling.

---

**Question**

Implement a production RAG pipeline that includes: document ingestion with chunking, hybrid search (vector + BM25), reranking, and answer generation with citation.

---

#### Design Answer

Pipeline stages: (1) Ingestion: chunk documents with overlap, embed, store in vector DB with metadata and BM25 index. (2) Retrieval: run vector search + BM25 in parallel, fuse results with RRF. (3) Reranking: cross-encoder scores top-50 fused results, take top-5. (4) Generation: inject top-5 into prompt with document IDs, instruct LLM to cite sources.

---

#### Implementation Notes

```python
class ProductionRAGPipeline:
    def __init__(self, vector_db, embedding_model, reranker, llm):
        self.vector_db = vector_db
        self.embedding_model = embedding_model
        self.reranker = reranker
        self.llm = llm
    
    # --- INGESTION ---
    def ingest(self, documents):
        for doc in documents:
            chunks = self.chunk(doc)
            for chunk in chunks:
                embedding = self.embedding_model.encode(chunk.text)
                self.vector_db.upsert({
                    "id": chunk.id,
                    "embedding": embedding,
                    "text": chunk.text,
                    "metadata": {
                        "source": doc.source,
                        "page": chunk.page,
                        "date": doc.date,
                    }
                })
    
    def chunk(self, doc, chunk_size=512, overlap=50):
        # Recursive chunking with overlap
        splitter = RecursiveTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=overlap,
            separators=["\n\n", "\n", ". ", " "]
        )
        return splitter.split(doc)
    
    # --- RETRIEVAL ---
    def retrieve(self, query, top_k=5):
        # Stage 1: Hybrid search
        query_embedding = self.embedding_model.encode(query)
        
        vector_results = self.vector_db.search(
            vector=query_embedding, limit=50
        )
        bm25_results = self.vector_db.bm25_search(
            query=query, limit=50
        )
        
        # Fuse results with RRF
        fused = self.reciprocal_rank_fusion(vector_results, bm25_results)
        
        # Stage 2: Reranking
        reranked = self.reranker.rerank(
            query=query,
            documents=[r.text for r in fused[:50]],
            top_k=top_k
        )
        
        return reranked
    
    # --- GENERATION ---
    def generate(self, query):
        retrieved = self.retrieve(query)
        
        context = "\n\n".join([
            f"[Source {i+1}: {doc.metadata['source']}, p.{doc.metadata['page']}]\n{doc.text}"
            for i, doc in enumerate(retrieved)
        ])
        
        prompt = f"""Answer the question based ONLY on the provided context.
Cite your sources using [Source N] format.
If the context doesn't contain the answer, say "I don't have this information."

Context:
{context}

Question: {query}

Answer:"""
        
        return self.llm.generate(prompt)
```

- **A serious pipeline has four explicit contracts:**
    | Stage | Contract | What usually breaks |
    |------|----------|---------------------|
    | Ingestion | Correct chunking, metadata, document versioning | Duplicate chunks, stale content, missing ACL metadata |
    | Retrieval | High-recall candidate generation under latency budget | Wrong metric, no filters, weak hybrid fusion |
    | Ranking | Most relevant evidence moves to the top | Reranker too slow, too few candidates, no hard negatives |
    | Generation | Answer stays inside evidence and cites correctly | Context ignored, fake citations, overconfident abstention failure |

- **What makes this "production" instead of demo code:**
    - Input validation and sanitization before retrieval.
    - Relevance threshold or abstention policy when no chunk clears a minimum confidence bar.
    - Stable document and chunk IDs so citations survive reranking and rendering.
    - Answer verification: cited IDs must exist in the retrieval set and map back to source snippets.
    - Logging query, rewrite, filters, retrieved IDs, rerank scores, final prompt context, latency, and answer.

- **A practical latency budget should be explicit:**
    ```
    query understanding / rewrite   20-80 ms
    dense + sparse retrieval        20-100 ms
    reranking                       80-250 ms
    generation                      300-1200 ms
    total                           product-specific SLA
    ```
    If the candidate cannot explain where the time goes, they do not really own the design.

- **Key design choices and why they matter:**
    - **Chunk IDs vs document IDs:** citations should usually point to chunk-level evidence, but the UI may render document-level links plus a snippet.
    - **Top-k into generator:** more chunks do not always help; overstuffing context often hurts grounding.
    - **Hybrid before rerank:** sparse recall plus dense recall is usually the cheapest quality lift before adding a reranker.
    - **Prompt contract:** "use only provided context" is weak by itself unless paired with abstention and citation verification.

- **Failure containment:**
    - If retrieval confidence is low, fall back to "I do not have enough evidence" rather than generating.
    - If citations fail validation, either regenerate once or return answer plus warning without fabricated citations.
    - If reranker times out, degrade gracefully to fused retrieval instead of failing the entire request.

---

#### Scoped Build

Implement a minimal version over a 20-document corpus: dense retrieval with FAISS, sparse retrieval with BM25, RRF fusion, top-3 reranking, and inline citations. Keep it local first, then explain how you would harden it for production.

#### Real Interviewer Follow-ups

1. How do you handle a query where the answer requires information from multiple documents?
2. What's the latency budget breakdown across the pipeline stages?
3. How do you update the index when source documents change?

---

#### Weak Answer Signals

- Pipeline without reranking (basic vector search only)
- No citation mechanism
- No relevance threshold (generates answers even when retrieval fails)
- Hardcoded chunk sizes without justification

---

#### Interviewer Signal

End-to-end RAG implementation. The candidate should demonstrate a complete pipeline with proper retrieval stages and production concerns (error handling, logging, citation verification).

#### Design / Production Bridge

Real teams do not ship "vector DB plus prompt" and call it done. The hard part is owning the contracts between ingestion, retrieval, ranking, and generation so you can explain why a bad answer happened and how to prevent it without guessing.

---

## Q-04-A-002: How do you implement query expansion and transformation to improve RAG retrieval?

**Module:** RAG
**Submodule:** Query Engineering
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [query-expansion, hyde, multi-query, retrieval, rag]
**Prerequisites:** Q-04-C-002
**Estimated Interview Round:** Technical
**Why This Question Matters:** User queries are often vague, short, or poorly phrased. Query transformation improves retrieval by converting the user's intent into better search queries. This is one of the highest-impact improvements for RAG quality.

---

**Question**

Your RAG system has good documents but retrieves wrong ones for 30% of queries. The embedding model is fine. How do you improve retrieval through query transformation?

---

#### Design Answer

Query transformation techniques: (1) HyDE (Hypothetical Document Embedding): generate a hypothetical answer, embed THAT instead of the query — closer to document space than question space. (2) Multi-query: generate 3-5 diverse query reformulations, retrieve for each, merge results. (3) Step-back: for complex queries, generate a more general query first. (4) Sub-question decomposition: break complex query into sub-queries, retrieve for each. Each technique addresses a different retrieval failure type.

---

#### Implementation Notes

- **HyDE (Hypothetical Document Embedding):**
  ```python
  def hyde_search(query, llm, embedding_model, vector_db):
      # Generate hypothetical answer
      hypothetical = llm.generate(
          f"Write a detailed paragraph that answers: {query}"
      )
      # Embed the hypothetical answer (closer to document space)
      embedding = embedding_model.encode(hypothetical)
      # Search with hypothetical embedding
      return vector_db.search(embedding, top_k=20)
  ```
  - WHY: queries are questions ("What is X?"), documents are statements ("X is..."). HyDE bridges this gap.
  - Improvement: 10-20% retrieval improvement on factual queries.

- **Multi-query retrieval:**
  ```python
  def multi_query_search(query, llm, embedding_model, vector_db):
      reformulations = llm.generate(
          f"Generate 3 different search queries for: {query}\n"
          f"1."
      )  # → ["query variant 1", "query variant 2", "query variant 3"]
      
      all_results = []
      for q in [query] + reformulations:
          results = vector_db.search(embedding_model.encode(q), top_k=10)
          all_results.extend(results)
      
      # Deduplicate and rank by frequency
      return dedupe_and_rank(all_results)
  ```

- **Sub-question decomposition:**
  ```python
  def decomposed_search(query, llm):
      sub_questions = llm.generate(
          f"Break this complex question into 2-3 simple sub-questions:\n{query}"
      )
      # Retrieve for each sub-question
      all_contexts = []
      for sub_q in sub_questions:
          results = retrieve(sub_q)
          all_contexts.extend(results)
      
      # Generate answer using all gathered context
      return generate_answer(query, all_contexts)
  ```

- **When to use each:**
  | Technique | Best For | Latency Impact |
  |-----------|----------|---------------|
  | HyDE | Factual queries, domain-specific | +500ms (1 LLM call) |
  | Multi-query | Ambiguous queries | +1-2s (1 LLM call + 3 searches) |
  | Step-back | Complex/specific queries | +500ms (1 LLM call) |
  | Sub-questions | Multi-part questions | +1-3s (1 LLM call + N searches) |

- **Do not apply transformation blindly; route by query class:**
    ```
    Exact ID / error code / SKU           -> usually no HyDE, prefer sparse or hybrid
    Short vague semantic question         -> HyDE or multi-query
    Multi-hop / compare-and-contrast ask  -> sub-question decomposition
    Overly specific but narrow ask        -> step-back + original query together
    ```
    Query rewriting adds cost and can distort user intent. A strong system gates these techniques behind heuristics or a classifier.

- **Evaluation should be sliced, not averaged:**
    - Identifier queries
    - Conceptual semantic queries
    - Multi-hop questions
    - Long-tail domain terms
    - Ambiguous user wording
    A technique that improves average Recall@5 can still degrade exact-match queries badly.

- **Failure modes to call out explicitly:**
    - HyDE can hallucinate a framing that drifts the search away from the user's true intent.
    - Multi-query can inflate near-duplicate results unless you deduplicate and diversify.
    - Sub-question decomposition can over-fragment simple questions and add needless latency.
    - Step-back queries can become too generic and surface tutorial content instead of answer-bearing chunks.

- **Practical operating pattern:**
    - Keep the original query in the retrieval set even when you rewrite it.
    - Log rewritten queries next to the original.
    - Treat retrieval rewrites as an experimentable module with offline eval gates.

---

#### Scoped Build

Add one query-transformation technique behind a feature flag, preferably HyDE or multi-query retrieval, and compare Recall@5 plus latency on a labeled query set.

#### Real Interviewer Follow-ups

1. HyDE generates a wrong hypothetical answer. Does this hurt retrieval?
2. How do you evaluate whether query expansion actually improves results?
3. Can you combine multiple techniques (HyDE + multi-query)?

---

#### Weak Answer Signals

- "Tell users to write better queries" — not a solution
- Doesn't know about HyDE or query expansion
- Applies one technique blindly without evaluating impact

---

#### Interviewer Signal

Advanced RAG engineering. Query transformation is one of the most impactful improvements and shows the candidate goes beyond basic vector search.

#### Design / Production Bridge

Query transformation is high leverage precisely because user queries are often the weakest part of the pipeline. The mature answer is not "use HyDE" but "classify the failure, route the query, and prove the gain with slice-based evaluation."

---

## Q-04-A-003: How do you handle document updates and index freshness in a production RAG system?

**Module:** RAG
**Submodule:** Index Management
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** DevOps / SRE → AIOps, Software Dev → AI Engineer
**Tags:** [index-management, freshness, incremental-update, rag]
**Prerequisites:** Q-04-C-007
**Estimated Interview Round:** Technical
**Why This Question Matters:** Documents change constantly — policies update, product docs evolve, knowledge bases grow. If your RAG index is stale, you serve outdated answers. Incremental updates without full reindexing are essential for operational efficiency.

---

**Question**

Your RAG knowledge base has 100K documents. 500 documents are added/modified daily. How do you keep the index fresh without full reindexing?

---

#### Design Answer

Incremental update pipeline: (1) Change detection: track document fingerprints (hash of content), detect which docs changed. (2) Delta processing: only re-chunk and re-embed changed documents. (3) Vector DB operations: delete old chunks for changed docs, insert new chunks. (4) Consistency: ensure search returns updated content within minutes of change. Implementation: CDC (change data capture) from source → delta ingestion pipeline → vector DB upsert.

---

#### Implementation Notes

```python
class IncrementalIndexer:
    def __init__(self, vector_db, embedding_model, metadata_store):
        self.vector_db = vector_db
        self.embedding_model = embedding_model
        self.metadata_store = metadata_store  # Stores doc hashes
    
    def sync(self, documents):
        added, modified, deleted = self.detect_changes(documents)
        
        # Handle deletes
        for doc_id in deleted:
            chunk_ids = self.metadata_store.get_chunk_ids(doc_id)
            self.vector_db.delete(chunk_ids)
            self.metadata_store.remove(doc_id)
        
        # Handle adds and modifications
        for doc in added + modified:
            # Delete old chunks if modified
            if doc.id in [d.id for d in modified]:
                old_chunk_ids = self.metadata_store.get_chunk_ids(doc.id)
                self.vector_db.delete(old_chunk_ids)
            
            # Create new chunks
            chunks = self.chunk(doc)
            embeddings = self.embedding_model.encode_batch(
                [chunk.text for chunk in chunks]
            )
            
            # Insert new chunks
            self.vector_db.upsert_batch([
                {"id": chunk.id, "embedding": emb, "text": chunk.text,
                 "metadata": {"doc_id": doc.id, "updated": now()}}
                for chunk, emb in zip(chunks, embeddings)
            ])
            
            # Update metadata store
            self.metadata_store.set(doc.id, {
                "hash": hash(doc.content),
                "chunk_ids": [c.id for c in chunks],
                "last_indexed": now()
            })
    
    def detect_changes(self, current_docs):
        current_hashes = {doc.id: hash(doc.content) for doc in current_docs}
        stored_hashes = self.metadata_store.get_all_hashes()
        
        added = [d for d in current_docs if d.id not in stored_hashes]
        deleted = [id for id in stored_hashes if id not in current_hashes]
        modified = [d for d in current_docs 
                    if d.id in stored_hashes 
                    and current_hashes[d.id] != stored_hashes[d.id]]
        
        return added, modified, deleted
```

- **Scheduling options:**
  | Strategy | Freshness | Cost |
  |----------|-----------|------|
  | Real-time (event-driven) | <1 min | Highest (continuous compute) |
  | Near-real-time (every 5 min) | <5 min | High |
  | Hourly batch | <1 hour | Medium |
  | Daily batch | <24 hours | Lowest |

- **Freshness is not only about speed; it is about consistency:**
    - You need a rule for when a new document version becomes visible to search.
    - If old and new chunks coexist, users can receive contradictory evidence from the same source.
    - Safer patterns are versioned indexes, tombstones, or blue/green swaps for large updates.

- **Recommended consistency patterns:**
    | Pattern | Strength | Weakness |
    |--------|----------|----------|
    | In-place upsert/delete | Simple | Can expose mixed versions during updates |
    | Versioned chunk visibility | Strong correctness | More metadata and query logic |
    | Blue/green index swap | Clean cutover | More storage and operational ceremony |
    | Tombstones + async compaction | Handles deletes well | Query path must honor tombstones |

- **Embedding model upgrades are a separate migration problem:**
    - Changing chunk content is not the same as changing the embedding model.
    - Mixed embedding spaces inside one index usually break similarity search.
    - For embedding migrations, create a shadow index, backfill, compare offline metrics, then cut traffic over deliberately.

- **Operational controls worth mentioning:**
    - Track document source version, chunk version, embedding model version, and indexing job ID.
    - Make indexing idempotent so retries do not duplicate chunks.
    - Keep a rollback path to the last known-good index snapshot.
    - Alert on indexing lag, delete backlog, and source-sync failures.

---

#### Scoped Build

Build a delta indexer that hashes source documents, tombstones old chunks, and upserts only modified chunks. Add one rollback path so a bad index update can be reverted safely.

#### Real Interviewer Follow-ups

1. During index update, users might get inconsistent results (some old, some new chunks). How do you ensure consistency?
2. Your embedding model is updated. Do you need to re-embed all 100K documents?
3. How do you handle rollback if an index update introduces bad data?

---

#### Weak Answer Signals

- "Reindex everything daily" — doesn't scale
- No change detection (re-embeds everything)
- No handling of deleted or modified documents
- Ignores consistency during updates

---

#### Interviewer Signal

Operational RAG maturity. Index freshness is a real production concern. The candidate should describe incremental updates with change detection and consistency guarantees.

#### Design / Production Bridge

Freshness failures are brutal because the answer can look perfectly grounded while still being wrong. If the index lifecycle is weak, the model becomes a clean interface over stale data.

---

## Q-04-A-004: How do you implement metadata filtering and access control in RAG?

**Module:** RAG
**Submodule:** Access Control
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer, Senior / Architect
**Tags:** [access-control, metadata-filtering, security, multi-tenant, rag]
**Prerequisites:** Q-04-C-007
**Estimated Interview Round:** Technical
**Why This Question Matters:** In enterprise RAG, different users should only see documents they have access to. Without proper access control, RAG becomes a data leak vector — a user can query and retrieve documents they shouldn't see.

---

**Question**

Your RAG system serves 5 departments, each with confidential documents. How do you ensure users only retrieve documents they're authorized to access?

---

#### Design Answer

Pre-retrieval filtering: add access control metadata to every chunk (department, access_level, groups). At query time, filter the search space to only include chunks the user is authorized to see. Implementation: vector DB metadata filter applied BEFORE semantic search. Never do post-retrieval filtering (user might infer existence of documents from empty results after filtering). Sync ACLs from source systems to vector DB metadata.

---

#### Implementation Notes

```python
class SecureRAGPipeline:
    def retrieve(self, query, user):
        # Resolve user permissions
        allowed_departments = auth_service.get_departments(user.id)
        allowed_access_levels = auth_service.get_access_levels(user.id)
        
        # Build metadata filter
        metadata_filter = {
            "department": {"$in": allowed_departments},
            "access_level": {"$lte": user.access_level},
        }
        
        # Search with pre-filter (vector DB applies filter BEFORE similarity search)
        query_embedding = self.embedding_model.encode(query)
        results = self.vector_db.search(
            vector=query_embedding,
            filter=metadata_filter,  # Applied at index level
            limit=50
        )
        
        # Double-check: verify each result's permissions (defense-in-depth)
        verified = [r for r in results if self.verify_access(user, r.metadata)]
        
        return verified
    
    def ingest_with_acl(self, document, acl):
        chunks = self.chunk(document)
        for chunk in chunks:
            self.vector_db.upsert({
                "id": chunk.id,
                "embedding": self.embed(chunk.text),
                "text": chunk.text,
                "metadata": {
                    "department": acl.department,
                    "access_level": acl.level,
                    "groups": acl.groups,
                    "source": document.source,
                }
            })
```

- **ACL synchronization:**
  - Source of truth: document management system (SharePoint, Confluence, Google Drive)
  - Sync pipeline: regularly pull ACL changes → update vector DB metadata
  - Handle: document moved between departments, user role changes

- **Security considerations:**
  | Risk | Mitigation |
  |------|-----------|
  | ACL stale | Sync every 15 min or event-driven |
  | Filter bypass | Defense-in-depth: pre-filter + post-verify |
  | Data leakage via LLM | Don't include unauthorized context in prompt |
  | Prompt injection accessing other docs | Metadata filter is enforced at DB level |

- **The key security principle is filter-before-retrieval:**
    ```
    authorize user -> derive allowed scope -> search only inside allowed scope -> verify again
    ```
    Post-retrieval filtering is not just inefficient; it leaks existence, relevance, and sometimes ranking information.

- **Access control gets harder at finer granularity:**
    | Scope | Typical approach | Hard part |
    |------|------------------|-----------|
    | Document-level ACL | Chunk inherits document metadata | Straightforward |
    | Section-level ACL | Chunk carries section permissions | Source parsing must preserve boundaries |
    | Row/cell-level ACL | Route to structured query tools instead of plain chunk retrieval | Very easy to leak without exact enforcement |

- **Enterprise concerns a strong answer should include:**
    - Tenant isolation across indexes or namespaces.
    - Audit trail of who queried what and which sources were exposed.
    - Fast revocation when a user's access changes.
    - Prevention of cached unauthorized answers being replayed to the wrong user.

- **Defense-in-depth means more than one check:**
    - DB-level metadata filtering to constrain candidate set.
    - Application-level authorization verification before prompt assembly.
    - Response logging for audit and incident investigation.
    - Cache keys that include auth scope, not just query text.

---

#### Scoped Build

Implement metadata filters for department and access level before retrieval. Add one test that proves an unauthorized chunk never reaches the prompt context.

#### Real Interviewer Follow-ups

1. A document's permissions change frequently. How does this affect your indexing strategy?
2. How do you handle "need-to-know" access where some paragraphs within a document are restricted?
3. How do you audit who accessed which documents through RAG?

---

#### Weak Answer Signals

- Post-retrieval filtering only (retrieves everything, then filters — leaks info)
- No metadata in the vector database
- "Use the LLM to decide access" — completely insecure
- No ACL synchronization from source systems

---

#### Interviewer Signal

Security awareness in RAG. Access control is critical in enterprise RAG. Pre-retrieval filtering with defense-in-depth shows the candidate understands security at the data layer.

#### Design / Production Bridge

Enterprise RAG is a security product as much as an AI product. If retrieval boundaries are weak, the system becomes a very efficient confidential-document discovery tool for the wrong user.

---

## Q-04-A-005: How do you handle multi-modal RAG (images, tables, diagrams in documents)?

**Module:** RAG
**Submodule:** Multi-Modal
**Level:** Applied
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [multi-modal, images, tables, document-parsing, rag]
**Prerequisites:** Q-04-C-003, Q-04-A-001
**Estimated Interview Round:** Deep Dive
**Why This Question Matters:** Enterprise documents contain tables, charts, diagrams, and images — not just text. A RAG system that only handles text paragraphs misses crucial information that may be exactly what the user needs.

---

**Question**

Your RAG system processes technical manuals that contain text, tables, diagrams, and screenshots. How do you make all of this content retrievable and usable?

---

#### Design Answer

Multi-modal ingestion strategy: (1) Tables: extract as structured text (markdown tables), embed separately with "Table:" prefix. (2) Images/diagrams: generate text descriptions using vision LLM (GPT-4V, Claude Vision), embed the description. (3) Charts: extract data values + generate narrative summary, embed the summary. (4) Store original media as metadata alongside text chunks for display. At retrieval, the text embeddings find relevant content; at generation, the original media can be passed to a multi-modal LLM.

---

#### Implementation Notes

```python
class MultiModalIngestion:
    def process_document(self, document):
        chunks = []
        
        for element in document.elements:
            if element.type == "text":
                chunks.extend(self.chunk_text(element))
            
            elif element.type == "table":
                # Convert table to markdown and descriptive text
                markdown = element.to_markdown()
                description = self.llm.generate(
                    f"Describe this table's content in 2-3 sentences:\n{markdown}"
                )
                chunks.append(Chunk(
                    text=f"Table: {description}\n\n{markdown}",
                    metadata={"type": "table", "original_html": element.html}
                ))
            
            elif element.type == "image":
                # Vision LLM describes the image
                description = self.vision_llm.describe(
                    element.image_bytes,
                    prompt="Describe this technical diagram in detail."
                )
                chunks.append(Chunk(
                    text=f"Image/Diagram: {description}",
                    metadata={"type": "image", "image_path": element.path}
                ))
            
            elif element.type == "chart":
                # Extract data + narrative
                data = self.chart_extractor.extract(element)
                narrative = self.llm.generate(
                    f"Summarize these chart findings: {data}"
                )
                chunks.append(Chunk(
                    text=f"Chart: {narrative}\nData: {json.dumps(data)}",
                    metadata={"type": "chart", "image_path": element.path}
                ))
        
        return chunks
```

- **Document parsing tools:**
  | Content Type | Tool | Approach |
  |-------------|------|---------|
  | PDF with text | PyMuPDF, Unstructured | Direct text extraction |
  | PDF with images | Unstructured + Vision LLM | OCR + AI description |
  | Tables | Unstructured, Camelot | Table detection + markdown conversion |
  | Technical diagrams | GPT-4V, Claude Vision | AI-generated description |
  | Scanned documents | Tesseract, DocTR | OCR → text |

- **At generation time:**
  - If using a multi-modal LLM (GPT-4V, Claude Vision): pass original images alongside text context
  - If using text-only LLM: rely on the text descriptions generated during ingestion

- **The hard part is representation loss:**
    - A table is not just text; it has row, column, and aggregation semantics.
    - A diagram is not just an image; it often encodes flow, hierarchy, or spatial relationships.
    - A screenshot may contain UI state, error text, and contextual cues at once.
    Converting everything to plain narrative text is useful, but it also throws away structure unless you preserve metadata or the original artifact.

- **A practical multimodal ingestion strategy usually has two outputs per artifact:**
    | Output | Purpose |
    |--------|---------|
    | Searchable textual representation | Retrieval and ranking |
    | Original artifact reference | Rendering, verification, multimodal generation |

- **Table-specific guidance:**
    - Preserve header names and row labels explicitly.
    - Large tables often need chunking by logical sections, not raw token windows.
    - For analytical questions, a text summary alone is weak; preserve machine-readable structure if possible.

- **Vision output quality is domain-sensitive:**
    - Generic image descriptions are often too shallow for architecture diagrams, circuit diagrams, medical imagery, or dashboards.
    - Good systems use domain prompts, example-guided descriptions, or task-specific extractors before embedding.

- **Evaluation should be modality-aware:**
    - Can the system retrieve the correct table/image when the answer is not in prose?
    - Does the answer preserve numeric accuracy from tables?
    - Are cited artifacts actually the ones supporting the answer?

---

#### Scoped Build

Process one mixed document containing text, a table, and an image. Convert the non-text elements into retrievable descriptions while preserving source metadata for display in the final answer.

#### Real Interviewer Follow-ups

1. The vision LLM generates poor descriptions for your domain-specific diagrams. How do you improve this?
2. How do you evaluate multi-modal RAG quality?
3. A table has 500 rows. How do you chunk it?

---

#### Weak Answer Signals

- "Skip images and tables" — misses critical content
- No vision LLM for image understanding
- Embeds raw table HTML (terrible for similarity search)

---

#### Interviewer Signal

Production RAG completeness. Multi-modal handling separates good RAG systems from great ones. Using vision LLMs for diagram descriptions shows awareness of the full document intelligence pipeline.

#### Design / Production Bridge

Multimodal RAG fails when teams flatten every artifact into vague text. The deeper answer is to preserve both a searchable representation and the original modality so retrieval stays useful and the final answer stays verifiable.

---

## Q-04-A-006: How do you implement RAG for structured data (SQL databases, APIs, knowledge graphs)?

**Module:** RAG
**Submodule:** Structured Data RAG
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [structured-data, text-to-sql, knowledge-graph, rag]
**Prerequisites:** Q-04-C-001
**Estimated Interview Round:** Technical
**Why This Question Matters:** Not all knowledge lives in documents. Databases, APIs, and knowledge graphs contain structured data that traditional RAG can't handle. Text-to-SQL and graph RAG extend RAG to structured knowledge.

---

**Question**

Your company's data is in a SQL database (not documents). How do you build a natural language query interface using RAG principles?

---

#### Design Answer

Text-to-SQL RAG: (1) Store schema description (table names, column descriptions, relationships) as RAG context. (2) User asks natural language question → retrieve relevant table schemas → LLM generates SQL query. (3) Execute SQL safely (read-only, parameterized) → return results. (4) LLM formats results into natural language answer. Key challenges: SQL injection prevention, handling ambiguous queries, validating generated SQL.

---

#### Implementation Notes

```python
class TextToSQLRAG:
    def __init__(self, db_connection, llm, schema_store):
        self.db = db_connection
        self.llm = llm
        self.schema_store = schema_store  # Vector DB with table/column descriptions
    
    def answer(self, question):
        # 1. Retrieve relevant schema
        relevant_schemas = self.schema_store.search(question, top_k=5)
        schema_context = "\n".join([s.text for s in relevant_schemas])
        
        # 2. Generate SQL
        sql = self.llm.generate(f"""
Given the following database schema:
{schema_context}

Generate a SQL query to answer: {question}

Rules:
- Use only SELECT statements (no INSERT, UPDATE, DELETE)
- Use parameterized queries where possible
- Limit results to 100 rows
- Output ONLY the SQL query, nothing else
""")
        
        # 3. Validate SQL
        if not self.validate_sql(sql):
            return "Could not generate a safe query for this question."
        
        # 4. Execute safely
        results = self.db.execute_read_only(sql)
        
        # 5. Format results
        answer = self.llm.generate(f"""
Question: {question}
SQL query: {sql}
Results: {results[:20]}  # Limit for context

Provide a clear, natural language answer based on these results.
""")
        
        return answer
    
    def validate_sql(self, sql):
        # Security: only allow SELECT
        sql_upper = sql.strip().upper()
        if not sql_upper.startswith("SELECT"):
            return False
        dangerous = ["DROP", "DELETE", "INSERT", "UPDATE", "ALTER", "EXEC", "TRUNCATE"]
        if any(keyword in sql_upper for keyword in dangerous):
            return False
        return True
```

- **Schema as RAG context:**
  ```
  Instead of embedding documents, embed table descriptions:
  
  "Table: orders — Contains all customer orders. Columns: order_id (int, PK), 
   customer_id (FK → customers), total_amount (decimal), order_date (date), 
   status (enum: pending, shipped, delivered, returned)"
  ```

- **Knowledge graph RAG (alternative):**
  - For relationship-heavy data: use knowledge graph + graph queries
  - User question → LLM generates Cypher/SPARQL → execute on graph DB → format results
  - Better for "What are all products related to customer X's past orders?"

- **This is really a routing problem, not just a retrieval problem:**
    ```
    natural-language question
            -> classify intent
                    -> document retrieval?
                    -> SQL / API / graph tool?
                    -> combined retrieval + tool call?
    ```
    Many bad systems force structured questions through document retrieval when they should be routed to a live query path.

- **Schema retrieval is the equivalent of chunk retrieval:**
    - You are retrieving the minimal schema, table relationships, and business definitions needed to write correct SQL.
    - Over-retrieving schema hurts generation just like over-retrieving text chunks hurts normal RAG.

- **Safety controls should be layered:**
    | Control | Why it matters |
    |--------|----------------|
    | Read-only credentials | Prevent destructive queries |
    | SQL allowlist / parser validation | Blocks unsafe or irrelevant statements |
    | Row limits and timeouts | Prevent runaway cost and latency |
    | Human review for risky domains | Adds guardrails for finance, healthcare, ops |

- **Failure modes worth naming:**
    - Correct SQL against the wrong table.
    - Syntactically valid SQL with incorrect join logic.
    - Ambiguous business definitions like "revenue" or "active user."
    - Hallucinated columns because the schema retrieval step missed the relevant table.

- **Best practice:** make the system show the generated query, the tables used, or a user-friendly explanation of how the answer was derived. Structured-data answers need provenance just as much as document RAG answers do.

---

#### Scoped Build

Retrieve relevant schema descriptions, generate read-only SQL, validate it, and answer one natural-language question without embedding raw table rows as documents.

#### Real Interviewer Follow-ups

1. The LLM generates valid SQL but it returns wrong results. How do you debug this?
2. How do you handle ambiguous column names across tables?
3. What's the security risk of executing LLM-generated SQL and how do you mitigate it?

---

#### Weak Answer Signals

- Passes user input directly into SQL (SQL injection risk)
- No SQL validation before execution
- "Just embed the database rows as documents" — doesn't scale
- No read-only restriction

---

#### Interviewer Signal

SQL injection awareness is critical. The candidate must validate generated SQL and use read-only connections. Understanding schema-as-context shows practical text-to-SQL knowledge.

#### Design / Production Bridge

Structured-data RAG is where weak retrieval thinking gets exposed. The strong answer recognizes that documents, schemas, tools, and live state are different knowledge surfaces and should not all be forced through the same retrieval path.

---

## Q-04-A-007: How do you implement citation and source attribution in RAG responses?

**Module:** RAG
**Submodule:** Citation
**Level:** Applied
**Difficulty:** 2
**Experience Bands:** Early-career, Mid-level
**Persona Relevance:** Software Dev → AI Engineer
**Tags:** [citation, attribution, trustworthiness, rag]
**Prerequisites:** Q-04-A-001
**Estimated Interview Round:** Technical
**Why This Question Matters:** Citations make RAG answers verifiable. Without citations, users can't trust the answer or check its accuracy. Citation implementation is also important for compliance and audit trails.

---

**Question**

Implement a citation system where the RAG response includes inline citations linked to specific retrieved documents.

---

#### Design Answer

Implementation: (1) Number each retrieved document in the prompt ([1], [2], [3]...). (2) Instruct LLM to cite using [N] format inline. (3) Post-process: extract citation markers, map to actual document IDs. (4) Verify: check that cited sources were actually in the context (no hallucinated citations). (5) Render: show citations as clickable links to source documents.

---

#### Implementation Notes

```python
def generate_with_citations(query, retrieved_docs, llm):
    # Build context with numbered sources
    context_parts = []
    source_map = {}
    for i, doc in enumerate(retrieved_docs):
        source_id = f"[{i+1}]"
        source_map[source_id] = {
            "doc_id": doc.id,
            "source": doc.metadata["source"],
            "page": doc.metadata.get("page"),
            "url": doc.metadata.get("url"),
            "text_snippet": doc.text[:200]
        }
        context_parts.append(f"{source_id} {doc.text}")
    
    context = "\n\n".join(context_parts)
    
    prompt = f"""Answer the question using ONLY the provided sources.
Cite sources inline using [N] format (e.g., [1], [2]).
Every factual claim must have a citation.

Sources:
{context}

Question: {query}
Answer:"""
    
    response = llm.generate(prompt)
    
    # Verify citations
    cited_sources = re.findall(r'\[(\d+)\]', response)
    valid_sources = set(str(i+1) for i in range(len(retrieved_docs)))
    hallucinated = [c for c in cited_sources if c not in valid_sources]
    
    if hallucinated:
        # Remove hallucinated citations
        for h in hallucinated:
            response = response.replace(f"[{h}]", "")
    
    return {
        "answer": response,
        "sources": [source_map[f"[{c}]"] for c in set(cited_sources) 
                    if c in valid_sources]
    }
```

- **Good citation systems operate at claim granularity, not only answer granularity:**
    - The answer should make it possible to map an individual factual statement back to the supporting chunk.
    - Document-level citations alone are often too coarse for long policies or manuals.

- **There are three different citation-quality problems:**
    | Problem | Symptom | Fix |
    |--------|---------|-----|
    | Fake citation | Source ID was never retrieved | Validate IDs strictly |
    | Weak citation | Source exists but does not support claim | Run support verification or snippet alignment |
    | Coarse citation | Source is too broad to be useful | Preserve chunk/page/snippet references |

- **Rendering matters for trust:**
    - Show snippet text, source title, page/section, and a deep link where possible.
    - Separate multiple sources when one answer is synthesized from several chunks.
    - If verification fails, degrade gracefully instead of showing fabricated provenance.

- **Compliance and product use cases:**
    - Customer support: lets agents verify the KB source quickly.
    - Legal / policy: supports audits and exception handling.
    - Internal copilots: reduces blind trust in generated answers.

---

#### Scoped Build

Return numbered citations linked to retrieved chunks, validate cited IDs against the actual retrieval set, and strip hallucinated citations before rendering the final answer.

#### Real Interviewer Follow-ups

1. The LLM adds citation [4] but only 3 sources were provided. How do you handle this?
2. How do you verify that the cited source actually supports the claim?
3. Should you show the full source document or just a relevant snippet?

---

#### Weak Answer Signals

- No citation verification (allows hallucinated sources)
- "The LLM will cite correctly" — it doesn't always
- No post-processing to extract and validate citations

---

#### Interviewer Signal

Trustworthy AI output. Citation verification is where engineering meets responsible AI. The candidate should validate citations against actual sources.

#### Design / Production Bridge

Citations are not a cosmetic UI feature. They are the contract that turns "the model says so" into something a user, auditor, or support engineer can actually inspect.

---

## Q-04-A-008: How do you optimize RAG for low-latency applications (sub-500ms end-to-end)?

**Module:** RAG
**Submodule:** Performance Optimization
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** DevOps / SRE → AIOps, Software Dev → AI Engineer
**Tags:** [performance, latency, optimization, caching, rag]
**Prerequisites:** Q-04-A-001, Q-03-A-002
**Estimated Interview Round:** Technical
**Why This Question Matters:** RAG pipelines add latency: embedding (20ms) + vector search (5ms) + reranking (200ms) + LLM generation (1000ms+) = 1200ms+. For real-time applications, every millisecond matters.

---

**Question**

Your RAG system currently has 1.5s end-to-end latency. Product requires 500ms. What do you optimize?

---

#### Design Answer

Latency breakdown and optimization: (1) Embedding (50ms → 10ms): use smaller/faster embedding model, batch encode, pre-compute frequent queries. (2) Vector search (10ms → 5ms): optimize index, use in-memory HNSW, reduce top_k. (3) Reranking (300ms → 0ms): remove reranker or use lightweight scorer, or do async reranking for next request. (4) LLM generation (1100ms → 400ms): use smaller model (8B instead of 70B), fewer context chunks, streaming. (5) Caching: cache frequent query results (semantic cache), cache embeddings for common terms.

---

#### Implementation Notes

- **Latency budget analysis:**
  ```
  Current: 50ms (embed) + 10ms (search) + 300ms (rerank) + 1100ms (LLM) = 1460ms
  Target:                                                                = 500ms
  
  Optimized: 10ms (embed) + 5ms (search) + 0ms (no rerank) + 400ms (LLM) = 415ms
  ```

- **Optimization strategies by component:**
  | Component | Technique | Latency Saved |
  |-----------|-----------|--------------|
  | Embedding | Quantized model, ONNX runtime | 30-40ms |
  | Embedding | Pre-compute for known query patterns | 50ms (cache hit) |
  | Search | In-memory HNSW, pre-warm index | 5ms |
  | Search | Metadata pre-filter (reduce search space) | 2-5ms |
  | Reranking | Replace with lightweight scorer or remove | 200-300ms |
  | LLM | Smaller model (8B vs 70B) | 500-700ms |
  | LLM | Fewer context chunks (3 vs 5) | 100-200ms |
  | LLM | Speculative decoding | 200-300ms |
  | End-to-end | Semantic response caching | 1400ms (cache hit) |

- **Architecture for low latency:**
  ```
  Request → Check cache (2ms)
    ├── Cache hit → Return cached response (2ms total)
    └── Cache miss:
        ├── Embed query (10ms, ONNX)
        ├── Vector search (5ms, in-memory HNSW)
        ├── (No reranker — rely on good embeddings + hybrid search)
        ├── LLM generation (400ms, 8B with speculative decoding)
        └── Cache response (async, 0ms added)
  ```

- **Optimize for p95 and p99, not only mean latency:**
    - Retrieval systems often look fine on average and still fail UX due to tail spikes.
    - Common tail causes: cold caches, overloaded rerankers, remote embedding APIs, large prompt packs, and noisy neighbors in shared inference.

- **Latency optimization always has a quality cost surface:**
    | Optimization | Typical gain | Common risk |
    |-------------|--------------|-------------|
    | Smaller embedding model | Faster query encoding | Lower retrieval recall |
    | Lower top-k | Less ranking and prompt cost | Missed evidence |
    | Remove reranker | Large latency win | Lower precision |
    | Smaller generator | Faster decode | Worse synthesis and grounding |
    | Caching | Huge speedups on repeats | Stale or over-general cached answers |

- **Dynamic policies often outperform static ones:**
    - Easy/FAQ-like queries can skip reranking.
    - High-confidence cache hits can bypass generation.
    - Hard multi-hop queries may justify extra latency.
    This is usually better than forcing every request through the same slow path.

- **A good answer should mention concurrency and deployment shape:**
    - Co-locating reranker and retriever can reduce network hops.
    - Remote embedding APIs may dominate latency more than vector search itself.
    - Batchable stages and asynchronous prefetch can matter more than micro-optimizing ANN parameters.

---

#### Scoped Build

Measure latency per stage, then remove or replace one expensive stage such as reranking while tracking the quality loss on a small evaluation set.

#### Real Interviewer Follow-ups

1. Removing the reranker hurts quality by 15%. Is the latency improvement worth it?
2. How do you decide between a faster model (lower latency, lower quality) and a slower model?
3. What's the cache hit rate needed to meet 500ms at p95?

---

#### Weak Answer Signals

- "Use a faster GPU" — doesn't address the architecture
- Doesn't analyze latency per component
- No caching strategy
- Doesn't consider quality trade-offs of latency optimizations

---

#### Interviewer Signal

Performance engineering mindset. The candidate should break down latency by component and optimize each systematically, understanding the quality vs latency trade-off at each step.

#### Design / Production Bridge

Fast RAG is not about one trick. It is about deciding which stages deserve latency, which can be gated, and where quality loss is acceptable for the product surface you are serving.

---

## Q-04-A-009: How do you build an evaluation dataset for RAG and continuously improve the system?

**Module:** RAG
**Submodule:** Evaluation & Iteration
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [evaluation, dataset, continuous-improvement, rag]
**Prerequisites:** Q-04-C-006
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** Without a ground truth evaluation dataset, RAG improvements are guesswork. Building and maintaining an eval dataset enables data-driven iteration.

---

**Question**

You're launching a new RAG application. How do you build the initial evaluation dataset, and how do you use it to continuously improve the system?

---

#### Design Answer

Building eval dataset: (1) Seed from real user questions (support tickets, search logs). (2) For each question, human annotates: expected answer, relevant document(s), required chunks. (3) Include edge cases: out-of-scope questions, multi-document answers, ambiguous queries. (4) Size: 200+ examples for initial, grow to 500+ over time. Continuous improvement: run eval suite on every change (prompt, model, config), track metrics over time, add every production failure as new eval case.

---

#### Implementation Notes

```python
# Eval dataset structure
eval_example = {
    "question": "What is the refund policy for international orders?",
    "ground_truth_answer": "International orders can be refunded within 45 days...",
    "relevant_doc_ids": ["policy-doc-42", "faq-doc-15"],
    "required_chunks": ["chunk-42-3", "chunk-42-4"],
    "category": "policy",
    "difficulty": "medium",
    "multi_hop": False,
}

# Eval pipeline
def evaluate_rag(pipeline, eval_dataset):
    results = {
        "retrieval_recall": [],
        "retrieval_precision": [],
        "answer_faithfulness": [],
        "answer_correctness": [],
    }
    
    for example in eval_dataset:
        # Run pipeline
        retrieved = pipeline.retrieve(example["question"])
        answer = pipeline.generate(example["question"])
        
        # Retrieval metrics
        retrieved_ids = {r.metadata["chunk_id"] for r in retrieved}
        relevant_ids = set(example["required_chunks"])
        recall = len(retrieved_ids & relevant_ids) / len(relevant_ids)
        results["retrieval_recall"].append(recall)
        
        # Generation metrics (LLM-as-judge)
        faithfulness = judge_faithfulness(answer, retrieved)
        correctness = judge_correctness(answer, example["ground_truth_answer"])
        results["answer_faithfulness"].append(faithfulness)
        results["answer_correctness"].append(correctness)
    
    return {k: sum(v)/len(v) for k, v in results.items()}
```

- **Continuous improvement loop:**
  ```
  Deploy → Monitor → Collect failures → Add to eval set → Improve → Re-evaluate → Deploy
  
  Week 1: 200 eval examples, retrieval recall 0.70
  Week 2: Fixed chunking, recall 0.78; added 30 failure cases to eval
  Week 4: Added reranker, recall 0.85; added 20 more cases
  Week 8: Switched embedding model, recall 0.88; eval set now 300 examples
  ```

- **A useful eval set is intentionally diverse, not merely large:**
    | Slice | Why it belongs |
    |------|----------------|
    | High-frequency common asks | Protects core UX |
    | Long-tail domain questions | Exposes vocabulary and retrieval weaknesses |
    | No-answer queries | Tests abstention behavior |
    | Multi-document questions | Tests synthesis and context packing |
    | Adversarial / ambiguous queries | Tests robustness |

- **Where examples should come from:**
    - Real support tickets, search logs, docs feedback, analyst queries, incident reviews.
    - Synthetic QA generation can help bootstrap, but it should not dominate the dataset because it often mirrors the source document too cleanly.

- **Regression workflow should be explicit:**
    ```
    change retrieval/prompt/model
            -> run offline eval
            -> compare per-slice deltas
            -> inspect regressions manually
            -> decide ship / hold / shadow test
    ```

- **Production feedback loop:**
    - Every serious failure becomes a new eval case.
    - Repeated near-misses often reveal missing slices rather than one-off bugs.
    - Evaluation ownership should be part of the product lifecycle, not a one-time setup task.

- **Scoring nuance:**
    - Some questions have multiple acceptable answers.
    - Some require partial credit for retrieval or groundedness.
    - Pure exact-match answer grading is often too brittle for RAG systems.

---

#### Scoped Build

Create 25 labeled questions with relevant chunk IDs and reference answers, then run the evaluation automatically after any retrieval, prompt, or model change.

#### Real Interviewer Follow-ups

1. How do you handle evaluation for questions with no correct answer in the knowledge base?
2. How do you automate eval dataset creation (LLM-generated QA pairs)?
3. What's the minimum eval dataset size for statistically significant comparisons?

---

#### Weak Answer Signals

- "Test manually with a few examples" — not systematic
- No ground truth annotation
- Eval dataset never grows after initial creation

---

#### Interviewer Signal

Evaluation-driven development. The candidate should describe a flywheel where production failures feed back into the eval dataset, enabling continuous improvement.

#### Design / Production Bridge

RAG teams that do not maintain an eval set end up arguing from anecdotes. The stronger answer treats evaluation as the control system for retrieval, prompting, ranking, and rollout decisions.

---

## Q-04-A-010: How do you implement conversational RAG (multi-turn with context-aware retrieval)?

**Module:** RAG
**Submodule:** Conversational RAG
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer
**Tags:** [conversational, multi-turn, context-aware, retrieval, rag]
**Prerequisites:** Q-04-A-001, Q-03-A-004
**Estimated Interview Round:** Technical
**Why This Question Matters:** Single-turn RAG is simple — query → retrieve → answer. Multi-turn RAG is hard because follow-up queries reference previous turns (pronouns, context). "What about their competitors?" requires knowing "their" refers to the company from 3 turns ago.

---

**Question**

In a multi-turn conversation, the user asks "What's their revenue?" after previously discussing Apple. How do you ensure retrieval is context-aware?

---

#### Design Answer

Query reformulation using conversation context: (1) Before retrieval, use LLM to reformulate the query by resolving references: "What's their revenue?" → "What is Apple's revenue?" (2) Use the reformulated query (not the raw query) for retrieval. (3) Include conversation summary in the system prompt for generation. Implementation: lightweight LLM call to decontextualize the query before retrieval.

---

#### Implementation Notes

```python
class ConversationalRAG:
    def answer(self, user_message, conversation_history):
        # Step 1: Reformulate query with context
        reformulated = self.reformulate_query(user_message, conversation_history)
        
        # Step 2: Retrieve with reformulated query
        retrieved = self.retrieve(reformulated)
        
        # Step 3: Generate with full context
        response = self.generate(
            user_message=user_message,
            conversation_history=conversation_history,
            retrieved_context=retrieved
        )
        
        return response
    
    def reformulate_query(self, query, history):
        recent_history = history[-6:]  # Last 3 turns
        history_text = "\n".join([
            f"{msg['role']}: {msg['content']}" for msg in recent_history
        ])
        
        reformulated = self.llm.generate(f"""
Given this conversation history:
{history_text}

The user's latest message: "{query}"

Rewrite the user's message as a standalone question that includes all necessary context.
If the message is already standalone, return it unchanged.
Standalone question:""")
        
        return reformulated.strip()
```

- **Example reformulations:**
  ```
  History: [User asked about Apple's products]
  Raw: "What about their competitors?"
  Reformulated: "Who are Apple's main competitors?"
  
  History: [User asked about Python's GIL]
  Raw: "How do you work around it?"
  Reformulated: "How do you work around Python's Global Interpreter Lock (GIL)?"
  ```

- **Cost consideration:** The reformulation adds one LLM call per turn. Use a small/fast model (8B or GPT-3.5-turbo) for reformulation — it doesn't need to be the same model as generation.

- **Conversational RAG has three separate state problems:**
    | State type | Purpose | Failure if mishandled |
    |-----------|---------|-----------------------|
    | Dialogue state | Resolve pronouns and references | Query becomes ambiguous |
    | Retrieval state | Keep or discard prior evidence | Old evidence pollutes new turns |
    | Memory / summary state | Preserve long-running context compactly | Context window grows uncontrollably |

- **Query reformulation is necessary, but not always sufficient:**
    - For follow-up questions, decontextualization is usually the first fix.
    - For topic drift, you may need to explicitly drop prior retrieval state.
    - For long conversations, summarization or structured memory becomes necessary before retrieval quality collapses.

- **Useful design decisions to surface:**
    - How many prior turns influence reformulation?
    - Should prior retrieved chunks be reused or always refreshed?
    - When do you summarize history versus keeping raw turns?
    - How do you detect that the user has changed topic entirely?

- **Common production failure modes:**
    - Reformulation injects wrong entities from earlier turns.
    - The system over-carries stale retrieved documents into unrelated follow-ups.
    - Long histories blow the token budget and bury the current intent.
    - The answer reflects conversation memory, but retrieval was based on a weaker or mismatched query.

- **Practical pattern:**
    ```
    new user turn
            -> detect whether it is standalone or referential
            -> reformulate if needed
            -> retrieve fresh evidence
            -> optionally merge with still-relevant prior evidence
            -> update conversation summary / memory
    ```
    The key principle is that retrieval should stay grounded in the current turn, not blindly inherit all previous context.

---

#### Scoped Build

Add query reformulation for follow-up questions and compare retrieval quality with and without decontextualization across a short multi-turn conversation set.

#### Real Interviewer Follow-ups

1. The reformulation sometimes adds incorrect context. How do you handle this?
2. How do you manage the growing conversation history in terms of token budget?
3. Should you also carry over retrieved documents from previous turns?

---

#### Weak Answer Signals

- Uses raw user message for retrieval (ignores context)
- "Just pass the full conversation history to the embedding model" — too long, poor embedding quality
- No query reformulation step

---

#### Interviewer Signal

Multi-turn engineering. Query reformulation is the key technique for conversational RAG. Candidates who describe this pattern show they've built real conversational systems.

#### Design / Production Bridge

Single-turn RAG answers questions. Conversational RAG has to manage state. The deeper answer is about deciding what to remember, what to retrieve again, and when prior context has become a liability.
