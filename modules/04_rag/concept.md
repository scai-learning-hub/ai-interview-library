# Module 04 — RAG (Retrieval-Augmented Generation): Concept Level

---

## How To Read This File

Use each question in interview order, not as isolated notes:

```text
Basic answer -> Concept depth -> Design bridge -> Practical build -> Real follow-ups
```

- **Basic answer**: define the idea clearly in 30-60 seconds
- **Concept depth**: explain the retrieval or ranking mechanism
- **Design bridge**: connect the concept to real RAG quality, latency, or reliability decisions
- **Practical build**: implement a scoped version yourself
- **Real follow-ups**: handle interviewer pressure after the first answer

## Interview Map

### Stage 1 — Basic Screen

| ID | Core prompt | Design bridge | Practical build |
|---|---|---|---|
| [Q-04-C-001](#q-04-c-001) | Why RAG exists | Decide when retrieval beats fine-tuning | Build a minimal LangChain + FAISS RAG flow |
| [Q-04-C-002](#q-04-c-002) | How embeddings affect retrieval | Choose embedding model, metric, and normalization | Benchmark retrieval quality for two embedding models |
| [Q-04-C-003](#q-04-c-003) | How chunking changes retrieval | Pick chunking based on document structure and context window | Compare recursive vs header-based chunking on the same docs |
| [Q-04-C-004](#q-04-c-004) | Why hybrid search beats dense-only retrieval | Fuse sparse and dense signals without double-counting | Implement BM25 + dense retrieval with RRF |

### Stage 2 — Concept Depth

| ID | Core prompt | Design bridge | Practical build |
|---|---|---|---|
| [Q-04-C-005](#q-04-c-005) | What a reranker does | Trade recall, latency, and precision across retrieval stages | Add a cross-encoder reranker on top of top-k retrieval |
| [Q-04-C-006](#q-04-c-006) | How to evaluate RAG | Split retrieval metrics from generation metrics | Build a tiny offline eval set with hit rate, MRR, groundedness |
| [Q-04-C-007](#q-04-c-007) | How vector DB choices affect production | Choose exact vs ANN, memory vs latency, local vs managed | Compare FAISS Flat vs ANN indexing on a toy corpus |
| [Q-04-C-008](#q-04-c-008) | Common RAG failure modes | Trace failures to chunking, retrieval, ranking, or generation | Reproduce two failure modes and localize the broken stage |

---

## Q-04-C-001: What is Retrieval-Augmented Generation and why does it solve the LLM knowledge limitation problem?

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| RAG | Fundamentals | Concept | 2 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Beginner, Early-career, Mid-level | Software Dev → AI Engineer, ML / Data Engineer, Fresher / Beginner | Screening, Technical |

| Prerequisites | Tags |
|---|---|
| Q-02-C-001 | [rag, retrieval, augmented-generation, knowledge, fundamentals] |

**Why This Question Matters:** RAG is the most popular architecture pattern for production LLM applications. Understanding why it exists (LLM knowledge is static and limited) and how it works (retrieve relevant context, inject into prompt) is the foundation for all RAG engineering.

---

**Question**

Why do LLMs need RAG? What problem does it solve and how does the basic architecture work?

---

#### Basic Answer

LLMs have static knowledge (training cutoff date), can't access private/proprietary data, and hallucinate when asked about unknown topics. RAG solves this by: (1) retrieving relevant documents from an external knowledge base at query time, (2) injecting retrieved context into the LLM prompt, (3) LLM generates an answer grounded in the provided context. Architecture: User query → embedding → vector search → top-K documents → inject into prompt → LLM generates answer.

---

#### Concept + Design Notes

- **RAG is external memory, not better reasoning:**
  | Gap | Why base LLM alone struggles | What RAG actually fixes |
  |-----|------------------------------|--------------------------|
  | Freshness | Weights stop updating after training | Retrieve current docs at query time |
  | Private knowledge | Internal docs were never in pretraining | Search enterprise KB or private data |
  | Provenance | Model emits an answer without a source trail | Return chunk IDs, citations, snippets |
  | Cheap updates | Behavior changes require retraining | Re-index documents instead |
  | Scope control | Model may answer from broad parametric memory | Constrain answer to a known corpus |

- **What RAG does NOT solve by itself:**
  - It does not give the model new reasoning ability; it gives it better evidence.
  - It does not guarantee truth; if retrieval misses or retrieves wrong context, generation still fails.
  - It is a poor fit for transactional, rapidly changing state unless retrieval is backed by live tools or databases.

- **Pipeline decomposition and failure boundary:**
  ```
  1. Ingestion / indexing:
     Parse -> chunk -> enrich metadata -> embed -> index

  2. Retrieval:
     Understand query -> filter search space -> retrieve candidates -> rerank

  3. Context assembly:
     Deduplicate -> compress -> order evidence -> enforce token budget

  4. Generation:
     Answer from context -> cite sources -> abstain when evidence is missing
  ```
  Every stage can fail independently. A strong RAG engineer should be able to say which stage is most likely wrong before touching prompts.

- **Decision framework: RAG vs fine-tuning vs tools**
  ```
  Changing documents / policies / KB?     -> RAG
  Need new response style or behavior?    -> Fine-tuning / prompting
  Need live account state or transactions?-> Tool/API call
  Need all three?                         -> Retrieval + tools + model policy
  ```

- **Example grounding prompt pattern:**
  ```
  System: Use only the provided context. If the answer is not supported, say you do not know.
  Return citations in [S1], [S2] format.

  Context:
  [S1] Refund policy allows returns within 30 days.
  [S2] Orders above $500 incur a 15% restocking fee.

  User: What is the refund policy for a $600 purchase?
  ```
  The important production detail is not just adding context, but forcing abstention and keeping source IDs stable through the pipeline.

---

#### Practical Build Drill

Build a minimal LangChain + FAISS RAG pipeline over 10-20 documents. Retrieve top-3 chunks for a query, pass only those chunks into the prompt, and require the answer to cite the retrieved sources.

#### Real Interviewer Follow-ups

1. When would you NOT use RAG and fine-tune instead?
2. What are the failure modes of RAG?
3. How do you measure RAG quality?

---

#### Weak Answer Signals

- "RAG is just search + LLM" — misses the nuance of why retrieval quality matters
- Can't explain when RAG fails (retrieval misses relevant docs, LLM ignores context)
- Doesn't mention grounding or reduced hallucination as key benefits

---

#### Interviewer Signal

Foundational understanding. The candidate should articulate WHY RAG exists (not just how) and describe the three-stage pipeline clearly.

#### Design / Production Bridge

RAG is usually the right first move when the knowledge changes faster than model weights. Teams that fine-tune just to expose changing documents create avoidable retraining cost, slower freshness, and harder rollback.

---

## Q-04-C-002: How do embedding models work for RAG, and what factors affect retrieval quality?

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| RAG | Embeddings | Concept | 2 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Early-career, Mid-level | ML / Data Engineer, Software Dev → AI Engineer | Technical |

| Prerequisites | Tags |
|---|---|
| Q-00-C-002 | [embeddings, vector-search, similarity, retrieval, rag] |

**Why This Question Matters:** The embedding model is the most critical component of RAG — if retrieval fails, the LLM gets wrong context and produces wrong answers. Understanding embedding model selection, similarity metrics, and their limitations is essential.

---

**Question**

How do embedding models convert text to vectors, and what factors determine whether a query will retrieve the right documents?

---

#### Basic Answer

Embedding models (e.g., text-embedding-3-small, BGE, E5) encode text into dense vectors where semantic similarity corresponds to vector proximity. Key factors for retrieval quality: (1) Embedding model quality — domain-trained models outperform general models. (2) Chunking strategy — chunk size and boundaries affect what gets embedded. (3) Query-document mismatch — queries are short and questions, documents are long and declarative, causing asymmetry. (4) Similarity metric — cosine similarity is standard, but different metrics suit different embedding models.

---

#### Concept + Design Notes

- **How embeddings actually become retrievable vectors:**
  - Text is tokenized, encoded by a transformer or similar encoder, then pooled into a fixed-size vector.
  - Training is usually contrastive: query-positive pairs are pulled together, negatives are pushed apart.
  - Retrieval quality depends on whether training pairs resemble your production queries. A model trained on generic web QA may perform poorly on policy IDs, legal clauses, or code snippets.

- **Retrieval quality is a stack, not one model choice:**
  | Layer | Failure mode | Symptom | Fix |
  |------|--------------|---------|-----|
  | Representation | Weak semantic mapping | Relevant docs never appear in top-k | Better embedding model or fine-tuning |
  | Query formatting | Query-doc mismatch | Questions retrieve vague explanatory docs | Use query/passage prefixes or rewrite query |
  | Chunking | Wrong unit of meaning | Right document exists, wrong chunk retrieved | Re-chunk by structure or answer span |
  | Similarity + normalization | Magnitude or metric mismatch | Rankings feel unstable or popularity-biased | Match metric to model and normalize correctly |
  | Index/filtering | Search space too broad or too narrow | Irrelevant results or missing tenant/date docs | Metadata filtering and index tuning |

- **Query/document asymmetry matters more than beginners expect:**
  ```
  Query:   "How do I rotate API keys?"
  Passage: "API key rotation procedure for production services"
  ```
  These are semantically related but not lexically aligned. Models like E5 are trained with explicit `query:` and `passage:` prefixes to reduce this mismatch.

- **Similarity metric and normalization are part of the model contract:**
  - Cosine similarity compares direction only and is the safest default when vectors are normalized.
  - Dot product mixes direction and magnitude, which can help if the embedding model intentionally uses norm to encode confidence or salience.
  - L2 distance is fine if the model was trained for it, but many teams accidentally switch metrics during indexing and silently degrade ranking.

- **Model choice trade-off (representative, not absolute):**
  | Model family | Strength | Weakness | Best use |
  |-------------|----------|----------|----------|
  | API general-purpose embeddings | Fast to integrate, strong baseline | Less controllable, cost per call | MVPs and broad corpora |
  | Open-source general embeddings | Lower cost, self-hostable | Ops burden, variable quality | Production teams with infra ownership |
  | Domain-tuned embeddings | Best on specialized vocabulary | Fine-tuning data needed | Legal, medical, support, code-heavy corpora |
  | Multilingual embeddings | Cross-language retrieval | Often weaker on niche jargon | Global document bases |

- **How to evaluate embeddings properly:**
  - Build a labeled query set with expected chunks or docs.
  - Measure Recall@K, MRR, and slice by query type: exact IDs, semantic questions, multilingual, short queries, long queries.
  - Compare retrieval before changing prompts. A lot of "LLM quality" complaints are actually embedding regressions.

- **Common pitfalls:**
  - Using a text-only embedding model for code, tables, or OCR-heavy documents.
  - Comparing leaderboard numbers without matching corpus, query style, or latency budget.
  - Ignoring hard negatives. If two policies are semantically close, generic embeddings may collapse them together.

---

#### Practical Build Drill

Index the same small corpus with two embedding models and compare Recall@5 on a labeled query set. Keep chunking fixed so the experiment isolates embedding quality and similarity metric choice.

#### Real Interviewer Follow-ups

1. How do you evaluate whether your embedding model is good enough for your use case?
2. What's the trade-off between embedding dimension and retrieval quality?
3. How do you handle multilingual retrieval (query in English, documents in other languages)?

---

#### Weak Answer Signals

- "All embedding models are the same" — false, 20-40% quality difference
- Doesn't know about query-document asymmetry
- Can't explain when to fine-tune embeddings

---

#### Interviewer Signal

Embedding model awareness beyond "use OpenAI's." Understanding domain-specific fine-tuning, query-doc asymmetry, and benchmarking on own data shows RAG engineering maturity.

#### Design / Production Bridge

Embedding choice, metric choice, and normalization are often higher-leverage than prompt tweaks. If retrieval quality is weak, the LLM is usually downstream of the real problem.

---

## Q-04-C-003: What are the different chunking strategies for RAG and when should you use each?

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| RAG | Chunking | Concept | 2 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Early-career, Mid-level | Software Dev → AI Engineer, ML / Data Engineer | Technical |

| Prerequisites | Tags |
|---|---|
| Q-03-A-007 | [chunking, text-splitting, document-processing, rag] |

**Why This Question Matters:** Chunking decisions directly affect retrieval quality. Wrong chunking means the right information either doesn't exist in any single chunk (split across chunks) or is diluted by irrelevant content in the same chunk.

---

**Question**

Compare fixed-size, semantic, recursive, and document-structure-based chunking. When should you use each?

---

#### Basic Answer

Fixed-size: split every N tokens. Simple, predictable. Use when documents are homogeneous text. Semantic: split on topic shifts (sentence embeddings). Use when documents contain multiple topics. Recursive: hierarchically split (paragraphs → sentences → words until under token limit). Use as a general-purpose default. Document-structure: split on headers, sections, tables. Use when documents have clear structure (markdown, HTML, PDF with headings). Best practice: match chunking strategy to your document type.

---

#### Concept + Design Notes

- **Chunking optimizes three conflicting goals:**
  1. Keep the answer inside a retrievable unit.
  2. Preserve enough context for the generator to answer correctly.
  3. Avoid polluting the chunk with unrelated material.
  There is no universal chunk size because these goals vary by corpus.

- **Strategy comparison:**
  | Strategy | Strength | Weakness | Best for |
  |----------|----------|----------|----------|
  | Fixed-size token chunks | Predictable and simple | Breaks semantic boundaries | Logs, transcripts, raw text streams |
  | Recursive splitting | Respects paragraph/sentence structure | Still needs chunk-size tuning | General default for text docs |
  | Semantic chunking | Preserves topical coherence | Higher preprocessing cost, unstable on noisy OCR | Long explanatory docs |
  | Document-structure chunking | Keeps headers, tables, sections intact | Requires good parsing | Markdown, HTML, manuals, policies |
  | Parent-child / hierarchical | High recall + richer answer context | More indexing complexity | High-quality production RAG |

- **Chunk size is tied to answer span and query style:**
  ```
  Fact lookup / policy clause / FAQ answer -> smaller chunks often win
  Explanatory or multi-sentence answers     -> medium chunks often win
  Large procedural sections                 -> parent-child or hierarchical retrieval
  ```
  If answers span multiple sections, naive small chunks fragment evidence. If chunks are too large, semantic search retrieves broad pages that bury the answer.

- **Overlap is useful, but not free:**
  - Overlap reduces boundary misses.
  - Too much overlap duplicates near-identical chunks, inflates index size, and can crowd out diverse evidence in the top-k.
  - Start with 10-20% overlap, then verify whether recall improves enough to justify the extra noise.

- **Format-specific guidance:**
  | Document type | Prefer |
  |--------------|--------|
  | API docs / markdown | Header-aware or section-based chunks |
  | Policies / contracts | Section + clause aware chunks |
  | Tables | Preserve row/column semantics; do not split arbitrarily |
  | Source code | Function / class / file-aware chunking |
  | Support tickets / chat logs | Turn- or incident-aware chunking |

- **Parent-child retrieval is often the practical answer:**
  ```
  Child chunk: optimized for retrieval precision
  Parent chunk: optimized for answer context
  ```
  This decouples search granularity from what the generator actually sees, which is one of the highest-leverage upgrades once a baseline RAG system works.

- **Anti-patterns:**
  - Character-based chunking that ignores tokens and structure.
  - Treating tables, lists, or code blocks like plain prose.
  - Using one chunking strategy for all corpora when document formats are mixed.

---

#### Practical Build Drill

Run fixed-size, recursive, and document-structure chunking on the same markdown or PDF sample. Compare chunk counts, average token lengths, and whether the correct chunk appears in top-k retrieval.

#### Real Interviewer Follow-ups

1. You have a PDF with tables and images. How do you chunk it?
2. What chunk size gives the best retrieval performance? How do you determine this?
3. How does chunk size interact with the embedding model's max input length?

---

#### Weak Answer Signals

- "Just split every 500 characters" — not token-aware, ignores boundaries
- One-size-fits-all chunking without considering document structure
- No overlap between chunks
- Doesn't test multiple strategies

---

#### Interviewer Signal

Attention to the most important RAG preprocessing step. Candidates who describe parent-child chunking or semantic chunking show advanced knowledge. The key insight: chunking strategy should match document type.

#### Design / Production Bridge

Chunking is not preprocessing boilerplate. Bad chunk boundaries create retrieval failures the generator cannot repair, even if the model itself is strong.

---

## Q-04-C-004: What is hybrid search and why does it outperform pure vector search for RAG?

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| RAG | Retrieval | Concept | 3 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Mid-level, Senior | ML / Data Engineer, Software Dev → AI Engineer | Technical |

| Prerequisites | Tags |
|---|---|
| Q-04-C-002 | [hybrid-search, bm25, vector-search, retrieval, rag] |

**Why This Question Matters:** Pure vector search fails on keyword-specific queries (product SKUs, error codes, names). Pure keyword search fails on semantic queries. Hybrid search combines both and is the standard for production RAG systems.

---

**Question**

Why is hybrid search (vector + keyword) better than either alone? How do you combine the scores?

---

#### Basic Answer

Vector search excels at semantic matching ("What causes server errors?" finds "Common HTTP 500 issues") but misses exact terms ("ERROR-42B" won't match if not semantically similar). Keyword search (BM25) excels at exact matching ("ERROR-42B" → exact document) but misses semantics. Hybrid combines both: run both searches, merge results using Reciprocal Rank Fusion (RRF) or weighted scoring. Typically 10-25% improvement over either alone. Alpha parameter controls vector vs keyword weight.

---

#### Concept + Design Notes

- **Dense and sparse retrieval fail on different query classes:**
  | Query class | Dense retrieval | BM25 / sparse retrieval | Why hybrid helps |
  |------------|-----------------|-------------------------|------------------|
  | Paraphrased conceptual question | Strong | Often weaker | Semantic match dominates |
  | Error code / SKU / exact ID | Often weak | Strong | Exact lexical evidence dominates |
  | Acronyms / uncommon product names | Mixed | Strong if tokenized well | Sparse side recovers exact matches |
  | Long vague question | Stronger after rewrite | Often noisy | Dense side keeps semantic focus |

- **Why BM25 still matters:**
  - BM25 is not "old search." It is a strong lexical prior that rewards rare, discriminative terms.
  - Enterprise corpora are full of identifiers, clause names, and exact policy language that embeddings often smooth away.

- **Why RRF is the safest first fusion strategy:**
  ```python
  def reciprocal_rank_fusion(vector_results, keyword_results, k=60):
      scores = {}
      for rank, doc in enumerate(vector_results):
          scores[doc.id] = scores.get(doc.id, 0.0) + 1 / (k + rank + 1)
      for rank, doc in enumerate(keyword_results):
          scores[doc.id] = scores.get(doc.id, 0.0) + 1 / (k + rank + 1)
      return sorted(scores.items(), key=lambda item: item[1], reverse=True)
  ```
  RRF works well because it uses rank positions instead of raw scores. That makes it robust when cosine scores and BM25 scores live on completely different scales.

- **Weighted score fusion is harder than it looks:**
  - Raw dense and sparse scores are not naturally comparable.
  - A single global `alpha` often underperforms because identifier-heavy queries want more sparse weight than semantic queries.
  - If you use weighted fusion, normalize scores first and evaluate by query slice, not only the average.

- **Operational trade-offs:**
  | Concern | Hybrid impact |
  |--------|---------------|
  | Retrieval quality | Usually best baseline on mixed corpora |
  | Latency | Slightly higher because two retrieval paths run |
  | Complexity | More moving parts, fusion logic, and evaluation slices |
  | Debuggability | Better, because you can see whether lexical or semantic path won |

- **When hybrid can underperform:**
  - Small, clean corpora where dense retrieval already has high recall.
  - Noisy lexical corpora where BM25 overweights repetitive boilerplate.
  - Poor tokenization of IDs, SKUs, or code symbols on the sparse side.

- **Practical rule:** start with hybrid on enterprise corpora, then prove you can safely remove one side.

---

#### Practical Build Drill

Implement dense retrieval and BM25 over a toy corpus that mixes semantic paraphrases with exact identifiers like error codes or SKU names. Fuse the two ranked lists with RRF and show one query where hybrid wins.

#### Real Interviewer Follow-ups

1. How do you tune the alpha (vector vs keyword weight) for your use case?
2. When would pure vector search outperform hybrid?
3. How does hybrid search affect latency?

---

#### Weak Answer Signals

- "Vector search handles everything" — doesn't for exact matches
- Doesn't know about BM25 or keyword search
- Can't explain score fusion methods

---

#### Interviewer Signal

Practical retrieval understanding. Hybrid search is the production standard for RAG. Candidates who know RRF and can explain when each search type fails show retrieval engineering knowledge.

#### Design / Production Bridge

Hybrid search is usually the default in production because enterprise corpora mix semantic questions with exact identifiers, policy IDs, part numbers, and error codes that dense retrieval alone often misses.

---

## Q-04-C-005: What is a reranker and how does it improve RAG retrieval quality?

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| RAG | Reranking | Concept | 3 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Mid-level, Senior | ML / Data Engineer, Software Dev → AI Engineer | Technical |

| Prerequisites | Tags |
|---|---|
| Q-04-C-002, Q-04-C-004 | [reranking, cross-encoder, retrieval, quality, rag] |

**Why This Question Matters:** Initial retrieval (vector search) is fast but approximate. Reranking with a cross-encoder is slower but much more accurate. This two-stage approach (retrieve many, rerank few) is standard for high-quality production RAG.

---

**Question**

How does a reranker work, and why is the two-stage retrieve-then-rerank approach standard for production RAG?

---

#### Basic Answer

Stage 1 (retrieval): fast bi-encoder search retrieves top-50 candidates. Stage 2 (reranking): slow cross-encoder scores each of the 50 candidates by processing (query, document) pair together. Cross-encoder is more accurate because it sees the full interaction between query and document tokens (cross-attention), unlike bi-encoder which embeds them independently. After reranking, take top-5 for the LLM context. Improves retrieval precision significantly (20-40% improvement typical).

---

#### Concept + Design Notes

- **The core difference is token interaction:**
  ```
  Bi-encoder:
    Query and doc are encoded separately.
    Great for indexing millions of docs.

  Cross-encoder:
    Query and doc are encoded together.
    The model can inspect exact token-to-token interactions.
  ```
  That is why a reranker can understand that "refunds after 30 days" is more relevant to the query than a vaguely similar passage about returns.

- **Why the two-stage pattern is standard:**
  - Stage 1 optimizes recall under latency constraints.
  - Stage 2 optimizes precision on a much smaller candidate set.
  - If the right document never enters the reranker candidate pool, the reranker cannot save you. Candidate generation quality still sets the ceiling.

- **Candidate set size is a real trade-off:**
  | Candidates to rerank | Typical effect |
  |----------------------|----------------|
  | Too few (top-5) | Cheap, but relevant docs may already be missing |
  | Medium (top-20 to top-50) | Best practical balance |
  | Too many (top-200+) | More latency, diminishing precision gains |

- **Latency budgeting matters:**
  ```
  Retriever: 20-80 ms
  Reranker:  100-400 ms depending on model and candidate count
  Generator: 300-1500+ ms
  ```
  Reranking is valuable only if that extra latency is justified by a measurable gain in answer correctness, citation quality, or support deflection.

- **How rerankers are usually trained:**
  - Pointwise: score each query-doc pair independently.
  - Pairwise/listwise: directly learn better ordering among candidates.
  - Domain tuning with hard negatives is especially valuable when many passages look similar but only one actually answers the question.

- **When rerankers are not worth it:**
  - Very small corpora where exact recall is already near-perfect.
  - Ultra-low-latency UX where every extra 100 ms matters more than small quality gains.
  - Workflows where the generator is already bottlenecked by poor prompt grounding or wrong context assembly.

- **Optimization patterns:**
  - Use a lighter reranker or distill a smaller one.
  - Batch rerank requests.
  - Cache rerank outputs for repeated queries.
  - Rerank only when the query class or low retrieval confidence justifies it.

---

#### Practical Build Drill

Retrieve top-20 candidates with embeddings, rerank them with a cross-encoder, and measure whether the relevant chunk moves into the top-5. Record the added latency so the quality gain is explicit.

#### Real Interviewer Follow-ups

1. When is a reranker NOT worth the added latency?
2. Can you fine-tune a reranker on domain-specific data? How?
3. What's the optimal number of candidates to retrieve for reranking?

---

#### Weak Answer Signals

- Doesn't know what a reranker is
- "Just use a better embedding model" — different problem, both are needed
- Can't explain bi-encoder vs cross-encoder difference

---

#### Interviewer Signal

RAG pipeline sophistication. Two-stage retrieval is the production standard. Understanding WHY (cross-encoder accuracy trade-off) and WHEN to use it shows practical RAG knowledge.

#### Design / Production Bridge

Reranking is often the highest-leverage quality improvement after baseline retrieval, but only if the latency budget can absorb it. Good teams treat it as a measurable trade-off, not an automatic add-on.

---

## Q-04-C-006: How do you evaluate RAG system quality? What metrics matter?

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| RAG | Evaluation | Concept | 3 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Mid-level, Senior | ML / Data Engineer, Software Dev → AI Engineer, Senior / Architect | Technical, Deep Dive |

| Prerequisites | Tags |
|---|---|
| Q-04-C-001 | [evaluation, metrics, ragas, retrieval-quality, rag] |

**Why This Question Matters:** RAG evaluation is harder than traditional search evaluation because you're evaluating TWO components (retrieval + generation) and their interaction. Wrong metrics lead to optimizing the wrong thing.

---

**Question**

What metrics do you use to evaluate a RAG system? How do you determine whether poor answers are caused by retrieval failure or generation failure?

---

#### Basic Answer

Two-level evaluation: (1) Retrieval metrics: Recall@K (did the retrieved chunks contain the answer?), Precision@K (were retrieved chunks relevant?), MRR (was the relevant chunk ranked first?). (2) Generation metrics: Faithfulness (is the answer supported by the context?), Answer relevance (does the answer address the question?), Correctness (is the answer factually correct?). Diagnosis: if retrieval recall is high but answer quality is low → LLM problem. If retrieval recall is low → retrieval problem. Tools: RAGAS framework automates these metrics.

---

#### Concept + Design Notes

- **RAG evaluation has at least four layers:**
  | Layer | Example metrics | Why it matters |
  |------|-----------------|----------------|
  | Retrieval | Recall@K, MRR, nDCG, hit rate | Did we fetch the right evidence? |
  | Answer grounding | Faithfulness, citation precision | Did the answer stay inside evidence? |
  | Answer usefulness | Correctness, completeness, task success | Was the answer actually helpful? |
  | System behavior | Latency, abstention rate, fallback rate, cost | Can this run reliably in production? |

- **Retrieval metrics:**
  | Metric | What it tells you | Common misuse |
  |--------|-------------------|---------------|
  | Recall@K | Whether relevant docs enter the candidate set | Using too small a `K` and concluding retrieval is fine |
  | Precision@K | Whether top results are clean | Over-optimizing precision and starving recall |
  | MRR | Whether the best answer appears near the top | Ignoring multi-document questions |
  | nDCG | Ranking quality with graded relevance | Requires decent labels, not binary-only shortcuts |

- **Generation metrics:**
  | Metric | Meaning |
  |--------|---------|
  | Faithfulness | Answer is supported by retrieved evidence |
  | Correctness | Answer matches ground truth or accepted truth set |
  | Completeness | Answer covers all required parts |
  | Citation precision | Cited source actually supports the claim |
  | Answer relevance | Answer responds to the user's actual intent |

- **Error attribution workflow:**
  ```
  Step 1: Did the relevant chunk appear in top-k?
  Step 2: If yes, was it high enough after reranking?
  Step 3: If yes, did the prompt/context pack preserve it?
  Step 4: If yes, did the generator ignore or distort it?
  ```
  This is the difference between systematic diagnosis and endless prompt tweaking.

- **Offline evaluation is necessary, but not sufficient:**
  - Offline gold sets catch regressions quickly.
  - Online metrics catch issues like user trust, readability, deflection rate, and latency.
  - A RAG system can score high on faithfulness yet still be unhelpful because the answer is incomplete, too verbose, or poorly prioritized.

- **LLM-as-judge is useful but imperfect:**
  - Fast for scaling annotation.
  - Sensitive to judge prompt wording and model bias.
  - Should be spot-checked against human labels, especially for high-stakes domains.

- **Tooling example:**
  ```python
  from ragas import evaluate
  from ragas.metrics import faithfulness, answer_relevancy, context_precision, context_recall

  result = evaluate(
      dataset,
      metrics=[faithfulness, answer_relevancy, context_precision, context_recall]
  )
  ```
  Frameworks help, but the hard part is still building a representative evaluation set with real user questions, negatives, and edge cases.

---

#### Practical Build Drill

Create a tiny labeled evaluation set with 20-30 questions, expected chunks, and reference answers. Compute Recall@K, MRR, and a simple faithfulness check before and after one retrieval change.

#### Real Interviewer Follow-ups

1. How do you create a ground truth evaluation dataset for RAG?
2. Faithfulness is 0.9 but users still complain. What's missing from the evaluation?
3. How frequently should you re-evaluate your RAG system?

---

#### Weak Answer Signals

- Only measures end-to-end quality (can't diagnose retrieval vs generation)
- Uses BLEU/ROUGE (wrong metrics for RAG — these measure surface similarity, not correctness)
- No ground truth evaluation dataset

---

#### Interviewer Signal

RAG evaluation literacy. The two-level approach (retrieval metrics + generation metrics) with diagnostic matrix shows the candidate can systematically improve RAG systems.

#### Design / Production Bridge

If retrieval and generation are not measured separately, teams misdiagnose failures and waste cycles tuning prompts for what is actually a ranking or chunking problem.

---

## Q-04-C-007: What are the different vector database architectures and how do you choose one for production RAG?

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| RAG | Vector Databases | Concept | 3 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Mid-level, Senior | Software Dev → AI Engineer, DevOps / SRE → AIOps | Technical |

| Prerequisites | Tags |
|---|---|
| Q-04-C-002 | [vector-database, hnsw, ivf, metadata-filtering, rag] |

**Why This Question Matters:** Vector database choice affects retrieval latency, scale, cost, and available features (metadata filtering, hybrid search, multi-tenancy). Making the wrong choice early requires expensive migration later.

---

**Question**

Compare HNSW and IVF index types for vector databases. When would you use each? What factors drive vector database selection for production RAG?

---

#### Basic Answer

HNSW (Hierarchical Navigable Small World): graph-based index, high recall, fast search, high memory usage. Best for production with <10M vectors per index. IVF (Inverted File Index): partition-based, lower memory, slightly lower recall, scales better to billions of vectors. Selection factors: (1) Scale: <10M vectors → almost any DB works; >100M → need careful choice. (2) Features: metadata filtering, hybrid search, multi-tenancy, ACL. (3) Operations: managed vs self-hosted, backup/restore, monitoring. (4) Latency: HNSW ~5ms, IVF ~10-50ms for top-10, depending on nprobe.

---

#### Concept + Design Notes

- **Index choice is a recall-latency-memory contract:**
  | Property | HNSW | IVF | IVF-PQ |
  |----------|------|-----|--------|
  | Recall | High | Medium-high | Lower |
  | Latency | Low | Tunable | Tunable |
  | Memory | High | Lower | Lowest |
  | Build/update cost | Moderate to high | Lower | Lower |
  | Best fit | Millions with high-quality recall | Large-scale corpora | Very large scale with compression |

- **What the index types actually mean:**
  - HNSW builds a navigable graph. Search quality depends heavily on graph quality and parameters like `M` and `efSearch`.
  - IVF clusters vectors into coarse partitions and searches only some of them. Search quality depends on `nlist` and `nprobe`.
  - IVF-PQ compresses vectors, trading off accuracy for lower memory and larger scale.

- **Parameter intuition matters:**
  ```
  HNSW:
    higher efSearch  -> better recall, slower queries
    higher M         -> denser graph, more memory, often better recall

  IVF:
    higher nprobe    -> searches more clusters, better recall, slower queries
    higher nlist     -> finer partitioning, better selectivity, more index overhead
  ```
  Good candidates know these are not black boxes.

- **Vector database selection is bigger than ANN type:**
  | Concern | Why it matters |
  |--------|----------------|
  | Metadata filtering | Retrieval without filters is useless in most enterprise systems |
  | Hybrid search | Dense-only often underperforms on identifiers and exact terms |
  | Multi-tenancy / ACLs | Prevents cross-tenant data leaks |
  | Operational model | Managed ease vs self-hosted control and cost |
  | Ingestion / deletion behavior | High-churn corpora need safe updates and tombstoning |
  | Backup / restore / migration | You will eventually need index versioning |

- **Representative DB trade-offs:**
  | DB | Strength | Weakness |
  |----|----------|----------|
  | Pinecone | Fast path to managed production | Vendor cost and lock-in concerns |
  | Weaviate | Strong hybrid and metadata features | More operational complexity |
  | Qdrant | Strong filtering and sparse+dense support | Smaller ecosystem than the biggest vendors |
  | Milvus | Large-scale ANN options | Heavier infra footprint |
  | pgvector | Great for simple stacks already on Postgres | Limited scale and ANN sophistication |
  | Chroma | Quick local iteration | Not a serious production destination |

- **Practical decision framework:**
  ```
  Small corpus, fast prototype                  -> pgvector or Chroma
  Managed production with moderate scale        -> Pinecone / Qdrant Cloud / Weaviate Cloud
  Heavy filtering + hybrid search               -> Qdrant / Weaviate / Elasticsearch
  Very large corpus with infra ownership        -> Milvus or self-hosted FAISS stack
  ```

- **One underused best practice:** keep an exact-search baseline on a sample corpus. It tells you whether ANN tuning is the problem or the embedding model is the problem.

---

#### Practical Build Drill

Benchmark FAISS exact search against one ANN configuration on the same embeddings. Compare recall, latency, and memory as corpus size grows, then map the result to a production choice.

#### Real Interviewer Follow-ups

1. How do you handle vector database migrations when switching providers?
2. What's the cost model difference between managed and self-hosted vector databases?
3. How does metadata filtering interact with vector search performance?

---

#### Weak Answer Signals

- "Just use Pinecone/Chroma" without understanding trade-offs
- Doesn't know about HNSW vs IVF
- Ignores metadata filtering as a selection criterion
- No consideration of scale or operational concerns

---

#### Interviewer Signal

Infrastructure-level RAG knowledge. The candidate should match vector DB choice to requirements (scale, features, operations) rather than defaulting to "whatever tutorial I followed."

#### Design / Production Bridge

Vector database choice is an operational decision as much as a retrieval decision. Metadata filtering, hybrid support, tenant isolation, and migration cost matter earlier than many teams expect.

---

## Q-04-C-008: What are common RAG failure modes and how do you prevent them?

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| RAG | Failure Analysis | Concept | 3 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Mid-level, Senior | Software Dev → AI Engineer, Senior / Architect | Technical, Deep Dive |

| Prerequisites | Tags |
|---|---|
| Q-04-C-001, Q-04-C-006 | [failure-modes, hallucination, retrieval-failure, rag] |

**Why This Question Matters:** RAG systems fail in specific, predictable ways. Understanding these failure modes enables proactive prevention rather than reactive debugging.

---

**Question**

List the top 5 RAG failure modes and explain how you prevent each.

---

#### Basic Answer

(1) Retrieval failure: relevant documents exist but aren't retrieved → fix embedding model, chunking, or query. (2) Context ignored: LLM has the right context but generates from parametric knowledge → strengthen prompt ("Answer ONLY from context"). (3) Context poisoning: wrong documents retrieved, LLM generates confidently wrong answer → add relevance threshold, reranker. (4) Information fragmentation: answer spans multiple chunks, no single chunk has the complete answer → parent-child chunking, multi-hop retrieval. (5) Stale knowledge: KB not updated, retrieved docs are outdated → freshness scoring, metadata filtering by date.

---

#### Concept + Design Notes

- **Failure taxonomy by pipeline stage:**
  | Failure mode | Symptom | Root cause | Prevention |
  |-------------|---------|------------|------------|
  | Retrieval miss | "I don't know" when answer exists | Bad embeddings, query mismatch, weak chunking | Better embeddings, hybrid search, query rewrite |
  | Context poisoning | Wrong answer with high confidence | Irrelevant docs ranked highly | Reranker, filters, relevance thresholds |
  | Context ignored | Answer contradicts evidence | Prompting weak or model over-trusts prior knowledge | Strong grounding prompts, citation checks |
  | Fragmented evidence | Partial answer | Needed evidence split across chunks | Parent-child or multi-hop retrieval |
  | Stale knowledge | Outdated answer | Ingestion or refresh lag | Incremental indexing, freshness metadata |
  | Hallucinated citations | Fake sources | Generator invents references | Source-ID-constrained citation rendering |
  | Over-retrieval | Verbose, unfocused answer | Too many chunks or duplicates | Deduplication, tighter top-k, better ranking |
  | ACL / tenant leak | User sees protected content | Missing or stale filters | Pre-retrieval auth filtering and audit logs |

- **A strong debugging mindset starts with stage isolation:**
  ```
  1. Was the right source available in the KB?
  2. Was it retrieved at all?
  3. If retrieved, was it ranked high enough?
  4. If ranked, did the prompt/context pack preserve it?
  5. If preserved, did the model answer from it or ignore it?
  ```
  Without this sequence, teams jump straight into prompt edits and lose days.

- **The "lost in the middle" problem:**
  - LLMs pay disproportionate attention to the beginning and end of long context windows.
  - A relevant chunk buried in the middle can behave as if it was never retrieved.
  - Fixes: rerank more aggressively, compress context, place strongest evidence first, and do not overstuff top-k.

- **Prompt injection is also a RAG failure mode:**
  - Retrieved documents can contain instructions like "ignore previous instructions" or malicious content.
  - The safe mental model is that retrieval introduces untrusted input into the prompt.
  - Mitigate with prompt isolation, content sanitization, instruction hierarchy, and tool permission boundaries.

- **Observability requirements:**
  - Log query, rewrite, filters, retrieved IDs, similarity scores, rerank scores, final packed context, and output citations.
  - If you only log the final answer, you cannot distinguish retrieval bugs from generator bugs.

---

#### Practical Build Drill

Create a toy corpus that triggers stale data, context poisoning, and fragmented answers. Add retrieval and prompt logging so you can identify whether the failure starts in ingestion, retrieval, reranking, or generation.

#### Real Interviewer Follow-ups

1. How do you build a RAG monitoring system that detects these failures automatically?
2. Your RAG system works for English but fails for Japanese. What failure modes are language-specific?
3. How do you handle queries where no relevant document exists in the KB?

---

#### Weak Answer Signals

- "RAG prevents hallucination" — it reduces but doesn't eliminate it
- Can't name specific failure modes
- No prevention strategies (only reactive debugging)

---

#### Interviewer Signal

RAG production awareness. Knowing failure modes BEFORE encountering them shows experience. The "lost in the middle" problem is a good litmus test for recent paper awareness.

#### Design / Production Bridge

Most RAG incidents are stage-specific. Teams that log only the final answer cannot tell whether the root cause was stale ingestion, weak retrieval, bad ranking, or prompt behavior.
