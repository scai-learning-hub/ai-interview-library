# Module 04 — RAG: System Level

---

## How To Read This File

System-level RAG interviews are not asking whether you know what chunking or reranking is. They are asking whether you can operate RAG as a platform under latency, security, quality, and cost pressure.

```text
Requirements -> isolation boundaries -> control plane -> data plane -> failure containment -> operating model
```

- **Requirements**: what each workload optimizes for
- **Isolation boundaries**: where tenants, KBs, data classes, and SLAs diverge
- **Control plane**: configuration, rollout, eval gating, and ownership
- **Data plane**: ingestion, retrieval, ranking, generation, caching
- **Failure containment**: what breaks locally vs platform-wide
- **Operating model**: who owns configs, approvals, audits, and migrations

## Architecture Map

| ID | Core system problem | Main design pressure | What strong answers include |
|---|---|---|---|
| [Q-04-S-001](#q-04-s-001) | Multi-KB RAG platform | Shared infra vs per-KB optimization | Control plane, tenant isolation, SLA-aware configs |
| [Q-04-S-002](#q-04-s-002) | Ingestion at million-doc scale | Heterogeneous parsing and freshness | Queues, extraction quality, versioning, rollback |
| [Q-04-S-003](#q-04-s-003) | Multi-hop reasoning system | Dependency-aware retrieval | Planning, source routing, bounded execution |
| [Q-04-S-004](#q-04-s-004) | Production quality monitoring | Silent degradation | Quality telemetry, drift detection, alert routing |

---

## Q-04-S-001: Design a production RAG platform that serves 10 different knowledge bases with shared infrastructure and per-KB quality SLAs.

**Module:** RAG
**Submodule:** RAG Platform Architecture
**Level:** System
**Difficulty:** 5
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, DevOps / SRE → AIOps
**Tags:** [system-design, rag-platform, multi-tenant, scaling, rag]
**Prerequisites:** Q-04-A-001, Q-04-A-004
**Estimated Interview Round:** System Design
**Why This Question Matters:** Enterprise teams don't build one RAG pipeline — they build a platform that serves multiple products, each with its own knowledge base, quality requirements, and access controls.

---

**Question**

Design a RAG platform serving: Engineering docs (50K docs, sub-300ms latency), Legal contracts (10K docs, high accuracy required, audit trail), Customer Support (200K docs, multilingual, high volume). Each has different embedding models, chunking strategies, and LLMs.

---

#### System Answer

Architecture: (1) Shared infrastructure layer: vector database cluster, LLM serving pool, embedding service. (2) Per-KB configuration: each knowledge base has its own namespace in vector DB, configured chunking strategy, embedding model, retrieval parameters, and LLM. (3) Configuration-as-code: YAML configs per KB define the full pipeline. (4) Quality SLAs: per-KB eval suites with automated regression testing. (5) Shared services: ingestion pipeline, caching layer, observability. (6) Isolation: logical namespace isolation in vector DB, separate API keys.

---

#### Architecture + Operating Model

- **The right abstraction is control plane plus data plane:**
  ```
  Control plane:
    KB registry -> config -> eval policy -> rollout gates -> audit / approvals

  Data plane:
    ingest -> index -> retrieve -> rerank -> generate -> cite -> observe
  ```
  A multi-KB platform fails when every team forks the pipeline in code. Strong systems keep the shared mechanics in one platform and expose per-KB variation through governed configuration.

- **Platform architecture:**
  ```
  ┌─────────────────────────────────────────────────────────────┐
  │                         RAG Platform                        │
  │                                                             │
  │  Control Plane                                              │
  │  ┌───────────────────────────────────────────────────────┐  │
  │  │ KB registry │ config store │ eval gates │ rollout    │  │
  │  │ access policy │ prompt/version catalog │ audit log   │  │
  │  └───────────────────────────────────────────────────────┘  │
  │                                                             │
  │  Data Plane                                                 │
  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
  │  │ Ingestion  │ │ Retrieval  │ │ Reranking  │ │ Generate │ │
  │  │ pipelines  │ │ services   │ │ service    │ │ + cite   │ │
  │  └────────────┘ └────────────┘ └────────────┘ └──────────┘ │
  │                                                             │
  │  Shared Infra                                               │
  │  ┌───────────────────────────────────────────────────────┐  │
  │  │ Vector stores │ embed services │ cache │ observability│  │
  │  │ job queues │ feature flags │ authn/authz │ model pool │  │
  │  └───────────────────────────────────────────────────────┘  │
  └─────────────────────────────────────────────────────────────┘
  ```

- **Per-KB configuration should define behavior, not just parameters:**
  ```yaml
  knowledge_base:
    name: "legal-contracts"
    namespace: "legal"
    ingestion:
      chunking: {strategy: "recursive", size: 256, overlap: 30}
      embedding_model: "E5-mistral-7b-instruct"
    retrieval:
      search_type: "hybrid"
      top_k: 20
      reranker: "bge-reranker-v2"
      rerank_top_k: 5
      similarity_threshold: 0.7
    generation:
      model: "gpt-4o"
      temperature: 0
      max_tokens: 2000
      prompt_template: "legal_qa_v3"
    access_control:
      enabled: true
      acl_source: "sharepoint"
    sla:
      latency_p99: 5000ms
      accuracy_target: 0.95
      audit_logging: required
  ```

  The important part is that KB teams can change retrieval and generation policy without changing platform code.

- **Isolation model:**
  | Concern | Shared | Per-KB |
  |--------|--------|--------|
  | Job orchestration | Yes | No |
  | Vector namespace / index | Maybe | Usually yes |
  | Embedding model | Maybe | Often yes |
  | Prompt and citation policy | Catalog shared | Choice per KB |
  | Eval suite and SLA | Framework shared | Thresholds per KB |
  | Access control rules | Auth service shared | Scope rules per KB |

- **SLA-aware design choices:**
  | KB | Dominant goal | Likely design choice |
  |----|---------------|----------------------|
  | Engineering docs | Low latency | Smaller models, tighter top-k, maybe no heavy reranker |
  | Legal contracts | Accuracy + auditability | Strong reranker, citations, full audit, slower path acceptable |
  | Customer support | High volume + multilingual | Cheap embed path, semantic cache, language-aware routing |

- **Operating model questions strong candidates answer:**
  - Who can create a new KB config?
  - Who approves prompt or model changes for legal-grade KBs?
  - What eval gates must pass before rollout?
  - How do you roll back one KB without touching all others?

- **Failure-domain thinking:**
  - A single bad KB config should not crash the shared serving path.
  - Per-KB rollouts should be feature-flagged and reversible.
  - Shared model outages should trigger fallback policy by KB criticality.

---

#### Scoped Design Drill

Design the control plane for onboarding a new knowledge base: config creation, eval registration, ACL binding, staged rollout, and rollback. Keep the data plane shared unless the SLA clearly requires dedicated isolation.

#### Real Interviewer Follow-ups

1. Engineering KB needs sub-300ms but Legal needs highest accuracy. How do you optimize each independently?
2. A new team wants to add their KB. What's the onboarding process?
3. How do you handle cross-KB queries (user wants info from both Engineering and Support)?

---

#### Weak Answer Signals

- Separate infrastructure per KB (expensive, doesn't share resources)
- One-size-fits-all configuration (same chunking/embedding/LLM for all KBs)
- No per-KB quality monitoring

---

#### Interviewer Signal

Platform thinking. The candidate should describe shared infrastructure with per-KB configuration, enabling each team to optimize independently while sharing operational costs.

#### Design / Production Bridge

This question is really about platform maturity. Strong answers separate shared mechanics from per-KB policy so teams can optimize independently without turning the platform into ten bespoke RAG systems.

---

## Q-04-S-002: Design a knowledge base ingestion pipeline that handles 1 million documents across 10 different formats.

**Module:** RAG
**Submodule:** Document Ingestion
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** ML / Data Engineer, DevOps / SRE → AIOps
**Tags:** [system-design, ingestion, document-processing, scaling, rag]
**Prerequisites:** Q-04-A-003, Q-04-A-005
**Estimated Interview Round:** System Design
**Why This Question Matters:** Ingestion is the boring but critical part of RAG. Processing millions of documents across different formats (PDF, DOCX, HTML, Markdown, Confluence, etc.) at scale requires robust architecture.

---

**Question**

Design an ingestion pipeline for 1M documents: PDFs (400K), web pages (300K), Office docs (200K), Confluence pages (100K). Must handle incremental updates and format-specific extraction.

---

#### System Answer

Architecture: (1) Source connectors: per-format extractors (PDF: PyMuPDF + Unstructured, Web: HTML parser, Office: python-docx, Confluence: API). (2) Processing pipeline: Extract → Clean → Chunk → Embed → Store. (3) Queue-based processing: documents into task queue (Celery, SQS), workers process in parallel. (4) Incremental: hash-based change detection, only reprocess changed docs. (5) Quality: extraction quality monitoring, failed document handling, manual review queue for low-confidence extractions.

---

#### Architecture + Operating Model

- **A scalable ingestion system is a reliability pipeline, not just ETL:**
  ```
  source discovery -> change detection -> extraction -> normalization -> chunking
      -> embedding -> indexing -> quality checks -> publish / rollback
  ```
  The hardest part is not raw throughput. It is preserving correctness and recoverability while many source formats fail in different ways.

- **Pipeline architecture:**
  ```
  Sources → Connector → Extract → Clean → Chunk → Embed → Vector DB
      ↓          ↓          ↓        ↓        ↓        ↓         ↓
  Confluence  PDF Parser   HTML→Text  Denoise  Recursive Batch    Upsert
  SharePoint  Web Scraper  Table→MD   Overlap  Overlap   Model    Metadata
  S3 Bucket   DOCX Parser                                         
      ↓                                                           
  Change Detection → Only process delta                           
  ```

- **Format-specific extraction:**
  | Format | Tool | Challenges |
  |--------|------|-----------|
  | PDF (text) | PyMuPDF, pdfplumber | Layout detection, columns, headers/footers |
  | PDF (scanned) | Tesseract, DocTR | OCR accuracy, image quality |
  | HTML | BeautifulSoup, readability | Navigation, ads, boilerplate removal |
  | DOCX | python-docx | Embedded images, tracked changes |
  | Confluence | Confluence API | Nested pages, macros, attachments |
  | Markdown | Standard parser | Code blocks, math equations |

- **Throughput estimate is useful, but publish semantics matter more:**
  ```python
  # Queue-based parallel processing
  # Assuming average 3 chunks per document = 3M embeddings
  
  # Embedding batch processing:
  # BGE-large: ~500 embeddings/sec on A10G GPU
  # 3M embeddings / 500 per sec = 6000 seconds ≈ 1.7 hours
  
  # With 4 GPU workers: ~25 minutes for full reindex
  # Incremental (500 docs/day): < 1 minute
  ```

- **Quality gates should exist before new content becomes searchable:**
  | Gate | Why it exists |
  |-----|---------------|
  | Extraction completeness | Catch empty or broken parses |
  | OCR confidence | Route low-confidence docs to review |
  | Chunk count anomaly | Detect parser explosions or truncation |
  | Metadata completeness | Prevent ACL/date/source loss |
  | Embedding success | Avoid half-indexed documents |

- **Failed document handling:**
  ```python
  class DocumentProcessor:
      def process(self, document):
          try:
              text = self.extract(document)
              if not text or len(text) < 50:
                  self.flag_for_review(document, "extraction_too_short")
                  return
              
              chunks = self.chunk(text)
              embeddings = self.embed(chunks)
              self.store(chunks, embeddings)
              
          except ExtractionError as e:
              self.dead_letter_queue.put(document, error=str(e))
              self.metrics.increment("extraction_failures", 
                                    tags={"format": document.format})
  ```

- **Publishing model matters at 1M docs:**
  - In-place publishing is simpler but can expose partially reprocessed corpora.
  - Blue/green or versioned publish flows let you finish extraction and validation first, then atomically switch visibility.
  - Large corpora often need per-source or per-partition publishing to avoid all-or-nothing cutovers.

- **Operational concerns a deep answer should mention:**
  - Dead-letter queues by failure class.
  - Reprocessing retries that are idempotent.
  - Cost controls on OCR and vision extraction.
  - Format-specific monitoring, because PDF quality problems are not HTML quality problems.

---

#### Scoped Design Drill

Design one publish path for Confluence and one for scanned PDFs. Show where change detection, extraction confidence, dead-letter handling, and index publish boundaries differ.

#### Real Interviewer Follow-ups

1. 5% of PDFs fail extraction (scanned, corrupted, password-protected). How do you handle them?
2. How do you ensure extraction quality across formats?
3. The full reindex takes 25 minutes. How do you handle the inconsistency period?

---

#### Weak Answer Signals

- "Parse everything with one tool" — different formats need different parsers
- No error handling for failed documents
- No incremental processing
- No quality monitoring for extraction

---

#### Interviewer Signal

Data engineering at RAG scale. The candidate should describe format-specific extraction, parallelized processing, error handling, and quality monitoring.

#### Design / Production Bridge

At scale, ingestion quality becomes retrieval quality. A platform with brilliant retrieval logic and weak extraction will still feel broken to users because the evidence never entered the index correctly.

---

## Q-04-S-003: Design a RAG system that handles multi-hop reasoning queries requiring information from multiple documents.

**Module:** RAG
**Submodule:** Advanced Retrieval
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** ML / Data Engineer, Senior / Architect
**Tags:** [system-design, multi-hop, complex-reasoning, advanced-retrieval, rag]
**Prerequisites:** Q-04-A-002, Q-04-C-008
**Estimated Interview Round:** System Design, Deep Dive
**Why This Question Matters:** Simple RAG retrieves one set of documents. Multi-hop queries require iterative retrieval: the answer to the first retrieval determines what to retrieve next. "Compare the refund policies of our top 3 competitors" requires finding who the competitors are, then finding each competitor's policy.

---

**Question**

Design a system that answers: "What are the combined revenue impacts of all security incidents affecting our top 3 customers last quarter?" This requires: identifying top 3 customers (from CRM), finding their security incidents (from incident DB), calculating revenue impact (from financial data).

---

#### System Answer

Multi-hop RAG architecture: (1) Query planner: LLM decomposes the complex query into sub-queries with dependencies. (2) Iterative retrieval: execute sub-queries in dependency order, each using results from previous steps. (3) Context accumulation: gather context from all steps. (4) Final synthesis: LLM generates final answer from accumulated context. Implementation: agent-like loop with planning, retrieval, and synthesis phases.

---

#### Architecture + Operating Model

```python
class MultiHopRAG:
    def answer(self, complex_query):
        # Step 1: Plan retrieval steps
        plan = self.planner.decompose(complex_query)
        # Returns: [
        #   {"step": 1, "query": "Top 3 customers by revenue", "source": "crm"},
        #   {"step": 2, "query": "Security incidents for {step1_results}", "source": "incidents", "depends_on": 1},
        #   {"step": 3, "query": "Revenue impact of {step2_results}", "source": "financial", "depends_on": 2},
        # ]
        
        # Step 2: Execute plan iteratively
        accumulated_context = {}
        for step in plan:
            # Resolve dependencies
            query = self.resolve_references(step["query"], accumulated_context)
            
            # Retrieve from appropriate source
            results = self.retrieve(query, source=step["source"])
            
            # Extract and store intermediate results
            intermediate = self.llm.extract(
                f"Extract the key information from these results for: {query}\n{results}"
            )
            accumulated_context[step["step"]] = {
                "query": query,
                "results": results,
                "extracted": intermediate,
            }
        
        # Step 3: Synthesize final answer
        full_context = self.format_context(accumulated_context)
        return self.llm.generate(
            f"Based on the following research:\n{full_context}\n\n"
            f"Answer the original question: {complex_query}"
        )
```

- **Multi-hop is retrieval with dependencies, not just bigger top-k:**
  - Some answers require discovering intermediate entities before the next retrieval step is even knowable.
  - If you try to retrieve everything in one pass, recall collapses or the context becomes too broad to use.

- **Planning prompt:**
  ```
  Decompose this complex question into simple, sequential retrieval steps.
  Each step should retrieve ONE piece of information.
  Later steps can reference results from earlier steps using {stepN_results}.
  
  Question: "What are the combined revenue impacts of all security incidents 
             affecting our top 3 customers last quarter?"
  
  Steps:
  1. Find the top 3 customers by revenue from CRM data
  2. Find all security incidents associated with these 3 customers from incident reports
  3. Find the revenue impact data for each identified incident from financial records
  4. Calculate the combined revenue impact
  ```

- **Execution architecture choices:**
  | Concern | Strong pattern |
  |--------|----------------|
  | Planning | Planner with schema/tool awareness |
  | Execution | Bounded step engine with max hops and retries |
  | Source routing | Structured systems first when possible |
  | Evidence handling | Keep intermediate results typed and inspectable |
  | Final synthesis | Combine cited outputs, not raw unbounded transcripts |

- **Key design decisions:**
  | Decision | Options |
  |----------|---------|
  | Planning | LLM planner vs rule-based decomposition |
  | Max hops | Limit to 3-5 hops (prevent infinite loops) |
  | Context accumulation | Keep all vs summarize intermediate steps |
  | Source routing | Different vector DBs per data type |
  | Failure handling | Skip failed steps with partial answer, or fail entirely |

- **Hard constraints a serious system should enforce:**
  - Maximum hop count.
  - Step-level timeout and retry limits.
  - Validation of planner output before execution.
  - Explicit source permissions and audit trail for each step.

- **Latency mitigation patterns:**
  - Parallelize independent sub-steps.
  - Prefer tool/database calls over LLM synthesis when the answer is computable.
  - Summarize intermediate context instead of carrying raw outputs from every hop.
  - Cache stable intermediate entities like "top customers last quarter" when business semantics allow it.

- **Best deep point:** multi-hop RAG often becomes workflow or agent design. The mature answer knows when to stop calling it "RAG" and start treating it as a bounded orchestration problem.

---

#### Scoped Design Drill

Design a bounded executor for the revenue-impact query that validates planner output, routes CRM and financial steps to structured tools, and only uses document retrieval for unstructured incident reports.

#### Real Interviewer Follow-ups

1. The planner generates a bad plan. How do you validate the plan before execution?
2. How do you handle circular dependencies in the plan?
3. Multi-hop adds significant latency (4+ LLM calls). How do you make it acceptable?

---

#### Weak Answer Signals

- "Just retrieve more documents in one shot" — doesn't handle dependencies
- No planning step (tries to answer everything at once)
- No limit on number of hops

---

#### Interviewer Signal

Advanced RAG engineering. Multi-hop retrieval is where RAG meets agentic patterns. The candidate should describe planning, iterative execution, and synthesis — not just more retrieval.

#### Design / Production Bridge

This is the boundary where basic retrieval systems end. Strong candidates recognize that multi-hop problems need planning, bounded execution, and typed intermediate state, not just a larger context window.

---

## Q-04-S-004: Design a RAG quality monitoring and alerting system for production.

**Module:** RAG
**Submodule:** Quality Monitoring
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** DevOps / SRE → AIOps, Senior / Architect
**Tags:** [system-design, monitoring, quality, alerting, rag]
**Prerequisites:** Q-04-C-006, Q-04-A-009
**Estimated Interview Round:** System Design
**Why This Question Matters:** RAG quality degrades silently — documents change, embeddings drift, retrieval patterns shift. Without active monitoring, you discover quality issues from angry users, not from your dashboard.

---

**Question**

Design a monitoring system that detects RAG quality degradation within 30 minutes of onset. Cover: retrieval quality, answer quality, and system health.

---

#### System Answer

Three-layer monitoring: (1) System metrics: retrieval latency, vector DB health, embedding service uptime, LLM API latency (real-time, alert on anomaly). (2) Retrieval quality: average retrieval score, similarity distribution, empty retrieval rate, reranker score distribution (sampled, 5-minute windows). (3) Answer quality: LLM-as-judge on sampled responses (faithfulness, relevance), citation accuracy rate, "I don't know" rate trend, user feedback signals (hourly). Dashboard with automated alerts on statistical drift from baseline.

---

#### Architecture + Operating Model

- **A production monitoring system needs quality telemetry, not just uptime:**
  ```
  system health + retrieval health + answer quality + business impact + drift signals
  ```
  If you only watch latency and 500s, you will miss the failures users actually care about.

- **Monitoring architecture:**
  ```
  Every RAG request:
  ├── Emit system metrics (latency, tokens, errors)
  ├── Log retrieval scores and document IDs
  └── 10% sample:
      ├── LLM-as-judge: faithfulness score
      ├── LLM-as-judge: answer relevance score
      └── Citation verification
  
  Aggregation (5-minute windows):
  ├── Mean/p95 retrieval score
  ├── Empty retrieval rate
  ├── Mean quality score
  └── Compare to 24-hour baseline → alert on drift
  ```

- **Alert definitions:**
  | Alert | Condition | Severity |
  |-------|-----------|----------|
  | Retrieval score drop | Mean score drops >10% from 24h baseline | Warning |
  | Empty retrieval spike | Empty retrieval rate >20% (baseline: 5%) | Critical |
  | Faithfulness drop | LLM-judge faithfulness <0.7 for 15 min | Critical |
  | Answer length anomaly | Mean length changes >50% | Warning |
  | Vector DB latency | p95 >100ms (baseline: 20ms) | Critical |
  | "I don't know" spike | Rate doubles from baseline | Warning |

- **Monitoring layers to separate explicitly:**
  | Layer | Example signals |
  |------|-----------------|
  | Infrastructure | DB health, API errors, queue lag, model latency |
  | Retrieval | empty results, score drift, rerank drift, index freshness |
  | Answer quality | faithfulness, citation precision, abstention quality |
  | User outcome | clicks, support deflection, dissatisfaction, manual escalations |

- **Root cause diagnosis dashboard:**
  ```
  Quality dropped → Which component?
  ├── Retrieval scores low → Embedding service issue? Document update broke chunks?
  ├── Retrieval scores fine but answers bad → LLM issue? Prompt change?
  ├── Empty retrievals spiked → New query pattern? Index stale?
  └── All metrics degraded → Infrastructure issue? Provider outage?
  ```

- **Design points strong candidates mention:**
  - Baselines should be sliced by KB, language, query class, and tenant, not only global averages.
  - LLM-as-judge sampling should be adaptive: increase sampling when drift indicators rise.
  - Monitoring must be tied to change events: prompt rollout, embedding migration, parser change, KB update.
  - Alert routing should follow ownership: ingestion team, retrieval team, platform/SRE, or KB owner.

- **How to catch gradual degradation:**
  - Rolling 7-day and 14-day drift comparisons.
  - Per-slice quality trends rather than single-point anomaly thresholds.
  - "Golden set" scheduled probes that run continuously against stable questions.

---

#### Scoped Design Drill

Design one dashboard for platform operators and one for KB owners. Split which metrics each sees, what thresholds alert them, and what runbook each alert should trigger.

#### Real Interviewer Follow-ups

1. How do you distinguish between genuine quality degradation and normal variance?
2. The LLM-as-judge sample costs $50/day. How do you reduce this?
3. A gradual quality decline over 2 weeks went undetected. How do you catch this?

---

#### Weak Answer Signals

- "Check quality manually weekly" — too slow
- Only monitors system health (latency, errors), not quality
- No baseline comparison (alerts on absolute thresholds only)

---

#### Interviewer Signal

RAG operations maturity. Monitoring answer quality (not just system health) and detecting degradation within 30 minutes shows the candidate operates production RAG systems.

#### Design / Production Bridge

RAG systems usually fail silently before they fail loudly. The strong answer builds a monitoring stack that can tell whether the degradation came from infra, ingestion, retrieval, or answer behavior before users file tickets.
