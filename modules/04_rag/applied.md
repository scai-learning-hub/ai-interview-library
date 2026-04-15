# Module 04 — RAG (Retrieval-Augmented Generation): Applied Level

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

**Expected Answer (Short)**

Pipeline stages: (1) Ingestion: chunk documents with overlap, embed, store in vector DB with metadata and BM25 index. (2) Retrieval: run vector search + BM25 in parallel, fuse results with RRF. (3) Reranking: cross-encoder scores top-50 fused results, take top-5. (4) Generation: inject top-5 into prompt with document IDs, instruct LLM to cite sources.

---

**Deep Answer**

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

- **Production additions:**
  - Input validation and sanitization before retrieval
  - Relevance threshold: skip generation if no retrieval scores exceed 0.5
  - Answer verification: check that citations match real source IDs
  - Streaming: stream LLM response with citation resolution at the end
  - Logging: log query, retrieved docs, answer, latency for evaluation

---

**Follow-up Questions**

1. How do you handle a query where the answer requires information from multiple documents?
2. What's the latency budget breakdown across the pipeline stages?
3. How do you update the index when source documents change?

---

**Common Weak Answers / Red Flags**

- Pipeline without reranking (basic vector search only)
- No citation mechanism
- No relevance threshold (generates answers even when retrieval fails)
- Hardcoded chunk sizes without justification

---

**Interviewer Evaluation Signal**

End-to-end RAG implementation. The candidate should demonstrate a complete pipeline with proper retrieval stages and production concerns (error handling, logging, citation verification).

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

**Expected Answer (Short)**

Query transformation techniques: (1) HyDE (Hypothetical Document Embedding): generate a hypothetical answer, embed THAT instead of the query — closer to document space than question space. (2) Multi-query: generate 3-5 diverse query reformulations, retrieve for each, merge results. (3) Step-back: for complex queries, generate a more general query first. (4) Sub-question decomposition: break complex query into sub-queries, retrieve for each. Each technique addresses a different retrieval failure type.

---

**Deep Answer**

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

---

**Follow-up Questions**

1. HyDE generates a wrong hypothetical answer. Does this hurt retrieval?
2. How do you evaluate whether query expansion actually improves results?
3. Can you combine multiple techniques (HyDE + multi-query)?

---

**Common Weak Answers / Red Flags**

- "Tell users to write better queries" — not a solution
- Doesn't know about HyDE or query expansion
- Applies one technique blindly without evaluating impact

---

**Interviewer Evaluation Signal**

Advanced RAG engineering. Query transformation is one of the most impactful improvements and shows the candidate goes beyond basic vector search.

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

**Expected Answer (Short)**

Incremental update pipeline: (1) Change detection: track document fingerprints (hash of content), detect which docs changed. (2) Delta processing: only re-chunk and re-embed changed documents. (3) Vector DB operations: delete old chunks for changed docs, insert new chunks. (4) Consistency: ensure search returns updated content within minutes of change. Implementation: CDC (change data capture) from source → delta ingestion pipeline → vector DB upsert.

---

**Deep Answer**

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

---

**Follow-up Questions**

1. During index update, users might get inconsistent results (some old, some new chunks). How do you ensure consistency?
2. Your embedding model is updated. Do you need to re-embed all 100K documents?
3. How do you handle rollback if an index update introduces bad data?

---

**Common Weak Answers / Red Flags**

- "Reindex everything daily" — doesn't scale
- No change detection (re-embeds everything)
- No handling of deleted or modified documents
- Ignores consistency during updates

---

**Interviewer Evaluation Signal**

Operational RAG maturity. Index freshness is a real production concern. The candidate should describe incremental updates with change detection and consistency guarantees.

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

**Expected Answer (Short)**

Pre-retrieval filtering: add access control metadata to every chunk (department, access_level, groups). At query time, filter the search space to only include chunks the user is authorized to see. Implementation: vector DB metadata filter applied BEFORE semantic search. Never do post-retrieval filtering (user might infer existence of documents from empty results after filtering). Sync ACLs from source systems to vector DB metadata.

---

**Deep Answer**

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

---

**Follow-up Questions**

1. A document's permissions change frequently. How does this affect your indexing strategy?
2. How do you handle "need-to-know" access where some paragraphs within a document are restricted?
3. How do you audit who accessed which documents through RAG?

---

**Common Weak Answers / Red Flags**

- Post-retrieval filtering only (retrieves everything, then filters — leaks info)
- No metadata in the vector database
- "Use the LLM to decide access" — completely insecure
- No ACL synchronization from source systems

---

**Interviewer Evaluation Signal**

Security awareness in RAG. Access control is critical in enterprise RAG. Pre-retrieval filtering with defense-in-depth shows the candidate understands security at the data layer.

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

**Expected Answer (Short)**

Multi-modal ingestion strategy: (1) Tables: extract as structured text (markdown tables), embed separately with "Table:" prefix. (2) Images/diagrams: generate text descriptions using vision LLM (GPT-4V, Claude Vision), embed the description. (3) Charts: extract data values + generate narrative summary, embed the summary. (4) Store original media as metadata alongside text chunks for display. At retrieval, the text embeddings find relevant content; at generation, the original media can be passed to a multi-modal LLM.

---

**Deep Answer**

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

---

**Follow-up Questions**

1. The vision LLM generates poor descriptions for your domain-specific diagrams. How do you improve this?
2. How do you evaluate multi-modal RAG quality?
3. A table has 500 rows. How do you chunk it?

---

**Common Weak Answers / Red Flags**

- "Skip images and tables" — misses critical content
- No vision LLM for image understanding
- Embeds raw table HTML (terrible for similarity search)

---

**Interviewer Evaluation Signal**

Production RAG completeness. Multi-modal handling separates good RAG systems from great ones. Using vision LLMs for diagram descriptions shows awareness of the full document intelligence pipeline.

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

**Expected Answer (Short)**

Text-to-SQL RAG: (1) Store schema description (table names, column descriptions, relationships) as RAG context. (2) User asks natural language question → retrieve relevant table schemas → LLM generates SQL query. (3) Execute SQL safely (read-only, parameterized) → return results. (4) LLM formats results into natural language answer. Key challenges: SQL injection prevention, handling ambiguous queries, validating generated SQL.

---

**Deep Answer**

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

---

**Follow-up Questions**

1. The LLM generates valid SQL but it returns wrong results. How do you debug this?
2. How do you handle ambiguous column names across tables?
3. What's the security risk of executing LLM-generated SQL and how do you mitigate it?

---

**Common Weak Answers / Red Flags**

- Passes user input directly into SQL (SQL injection risk)
- No SQL validation before execution
- "Just embed the database rows as documents" — doesn't scale
- No read-only restriction

---

**Interviewer Evaluation Signal**

SQL injection awareness is critical. The candidate must validate generated SQL and use read-only connections. Understanding schema-as-context shows practical text-to-SQL knowledge.

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

**Expected Answer (Short)**

Implementation: (1) Number each retrieved document in the prompt ([1], [2], [3]...). (2) Instruct LLM to cite using [N] format inline. (3) Post-process: extract citation markers, map to actual document IDs. (4) Verify: check that cited sources were actually in the context (no hallucinated citations). (5) Render: show citations as clickable links to source documents.

---

**Deep Answer**

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

---

**Follow-up Questions**

1. The LLM adds citation [4] but only 3 sources were provided. How do you handle this?
2. How do you verify that the cited source actually supports the claim?
3. Should you show the full source document or just a relevant snippet?

---

**Common Weak Answers / Red Flags**

- No citation verification (allows hallucinated sources)
- "The LLM will cite correctly" — it doesn't always
- No post-processing to extract and validate citations

---

**Interviewer Evaluation Signal**

Trustworthy AI output. Citation verification is where engineering meets responsible AI. The candidate should validate citations against actual sources.

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

**Expected Answer (Short)**

Latency breakdown and optimization: (1) Embedding (50ms → 10ms): use smaller/faster embedding model, batch encode, pre-compute frequent queries. (2) Vector search (10ms → 5ms): optimize index, use in-memory HNSW, reduce top_k. (3) Reranking (300ms → 0ms): remove reranker or use lightweight scorer, or do async reranking for next request. (4) LLM generation (1100ms → 400ms): use smaller model (8B instead of 70B), fewer context chunks, streaming. (5) Caching: cache frequent query results (semantic cache), cache embeddings for common terms.

---

**Deep Answer**

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

---

**Follow-up Questions**

1. Removing the reranker hurts quality by 15%. Is the latency improvement worth it?
2. How do you decide between a faster model (lower latency, lower quality) and a slower model?
3. What's the cache hit rate needed to meet 500ms at p95?

---

**Common Weak Answers / Red Flags**

- "Use a faster GPU" — doesn't address the architecture
- Doesn't analyze latency per component
- No caching strategy
- Doesn't consider quality trade-offs of latency optimizations

---

**Interviewer Evaluation Signal**

Performance engineering mindset. The candidate should break down latency by component and optimize each systematically, understanding the quality vs latency trade-off at each step.

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

**Expected Answer (Short)**

Building eval dataset: (1) Seed from real user questions (support tickets, search logs). (2) For each question, human annotates: expected answer, relevant document(s), required chunks. (3) Include edge cases: out-of-scope questions, multi-document answers, ambiguous queries. (4) Size: 200+ examples for initial, grow to 500+ over time. Continuous improvement: run eval suite on every change (prompt, model, config), track metrics over time, add every production failure as new eval case.

---

**Deep Answer**

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

---

**Follow-up Questions**

1. How do you handle evaluation for questions with no correct answer in the knowledge base?
2. How do you automate eval dataset creation (LLM-generated QA pairs)?
3. What's the minimum eval dataset size for statistically significant comparisons?

---

**Common Weak Answers / Red Flags**

- "Test manually with a few examples" — not systematic
- No ground truth annotation
- Eval dataset never grows after initial creation

---

**Interviewer Evaluation Signal**

Evaluation-driven development. The candidate should describe a flywheel where production failures feed back into the eval dataset, enabling continuous improvement.

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

**Expected Answer (Short)**

Query reformulation using conversation context: (1) Before retrieval, use LLM to reformulate the query by resolving references: "What's their revenue?" → "What is Apple's revenue?" (2) Use the reformulated query (not the raw query) for retrieval. (3) Include conversation summary in the system prompt for generation. Implementation: lightweight LLM call to decontextualize the query before retrieval.

---

**Deep Answer**

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

---

**Follow-up Questions**

1. The reformulation sometimes adds incorrect context. How do you handle this?
2. How do you manage the growing conversation history in terms of token budget?
3. Should you also carry over retrieved documents from previous turns?

---

**Common Weak Answers / Red Flags**

- Uses raw user message for retrieval (ignores context)
- "Just pass the full conversation history to the embedding model" — too long, poor embedding quality
- No query reformulation step

---

**Interviewer Evaluation Signal**

Multi-turn engineering. Query reformulation is the key technique for conversational RAG. Candidates who describe this pattern show they've built real conversational systems.
