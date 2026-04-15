# Tagging System

> Tag taxonomy, conventions, and governance for AI Interview OS.

---

## Purpose

Tags enable filtering, search, and recommendation across the question bank. They are designed for:

- GitHub-based manual filtering (search by tag)
- Future website conversion (faceted search, filter UI)
- AI-powered mock interview selection (tag-based question routing)
- Gap analysis (identifying under-covered tag areas)
- Cross-module navigation (finding all questions about a topic regardless of module)

---

## Tag Format Conventions

### Syntax Rules

| Rule | Convention | Example |
|------|-----------|---------|
| Case | Always lowercase | `rag`, not `RAG` or `Rag` |
| Word separator | Hyphen (`-`) | `hybrid-search`, not `hybrid_search` |
| Number | Singular form preferred | `embedding`, not `embeddings` |
| Abbreviations | Use common abbreviation if widely recognized | `kv-cache`, `bm25`, `lora` |
| Spell-out | Spell out if abbreviation is ambiguous | `reinforcement-learning`, not `rl` |
| Compound terms | Hyphenate | `prompt-engineering`, `tool-calling` |
| No spaces | Never | Use hyphens instead |
| No special chars | Only lowercase a–z, digits 0–9, and hyphens | — |

### When to Create a New Tag

Create a new tag when:
- A concept appears in ≥3 questions across ≥2 modules
- The concept is distinct enough to warrant independent filtering
- No existing tag covers the concept adequately

Do NOT create a new tag when:
- It is a synonym of an existing tag (use the existing one)
- It appears in only 1–2 questions (use a broader parent tag)
- It is too granular to be useful for filtering (e.g., `python-list-comprehension`)

### Tag Merge / Alias Policy

If two tags are used interchangeably:
1. Choose the more common/standard term as the canonical tag
2. Replace all instances of the alternate tag
3. Document the alias in the "Aliases" column below

---

## Tag Taxonomy

Tags are organized into 7 categories. A question typically has 3–8 tags spanning multiple categories.

### 1. Module Tags

Identify the primary technical domain. Each question gets exactly one module tag.

| Tag | Module |
|-----|--------|
| `foundations` | 00 — Foundations |
| `pytorch` | 01 — PyTorch & Deep Learning |
| `deep-learning` | 01 — PyTorch & Deep Learning |
| `genai` | 02 — Generative AI |
| `llm-engineering` | 03 — LLM Engineering |
| `rag` | 04 — RAG |
| `agentic-ai` | 05 — Agentic AI |
| `llmops` | 06 — LLMOps |
| `mlops` | 07 — MLOps |
| `aiops` | 08 — AIOps |
| `system-design` | 09 — System Design |
| `debugging` | 10 — Debugging & Failure Modes |
| `case-study` | 11 — Case Studies |

### 2. Skill / Technique Tags

Identify the specific technical skill or technique being tested.

| Tag | Description | Aliases |
|-----|------------|---------|
| `attention` | Attention mechanisms (self-attention, cross-attention, MHA, MQA, GQA) | — |
| `tokenization` | Tokenizers, BPE, SentencePiece, vocabulary | — |
| `embedding` | Embedding models, vector representations | `embeddings` |
| `fine-tuning` | Full fine-tuning, instruction tuning | — |
| `lora` | LoRA, QLoRA, adapter-based fine-tuning | `qlora` |
| `prompt-engineering` | Prompt design, few-shot, chain-of-thought, structured prompting | — |
| `structured-output` | JSON mode, function calling output, schema-constrained generation | — |
| `sampling` | Temperature, top-k, top-p, beam search | `decoding` |
| `kv-cache` | Key-value cache management, memory optimization | — |
| `context-window` | Context length, positional encoding, RoPE, ALiBi | — |
| `chunking` | Document chunking strategies, overlap, recursive splitting | — |
| `retrieval` | Dense retrieval, sparse retrieval, search | — |
| `bm25` | BM25 / sparse retrieval | — |
| `dense-retrieval` | Embedding-based retrieval | — |
| `hybrid-search` | Combined sparse + dense retrieval | — |
| `reranking` | Cross-encoder reranking, relevance scoring | `reranker` |
| `context-assembly` | Building LLM context from retrieved documents | — |
| `tool-calling` | Function calling, tool use in agents | `function-calling` |
| `planning` | Agent planning, task decomposition | — |
| `memory` | Agent memory, conversation history management | — |
| `multi-agent` | Multi-agent orchestration, supervisor patterns | — |
| `guardrails` | Safety filters, output validation, input screening | — |
| `evaluation` | Model evaluation, RAG evaluation, LLM-as-judge | — |
| `training-loop` | PyTorch training, backpropagation, gradient optimization | — |
| `autograd` | Automatic differentiation, computational graphs | — |
| `optimization` | Optimizers (Adam, SGD), learning rate scheduling | — |
| `regularization` | Dropout, weight decay, early stopping | — |
| `batch-processing` | Batching, dynamic batching, continuous batching | — |
| `quantization` | Model quantization (INT8, INT4, GPTQ, AWQ) | — |
| `distillation` | Knowledge distillation, model compression | — |
| `anomaly-detection` | Anomaly detection, outlier identification | — |
| `log-analysis` | Log parsing, log intelligence, pattern extraction | — |
| `alert-triage` | Alert routing, noise reduction, prioritization | — |

### 3. Infrastructure Tags

Identify infrastructure components, tools, and platforms referenced in the question.

| Tag | Description |
|-----|------------|
| `vector-db` | Vector databases (Pinecone, Weaviate, Qdrant, Milvus, pgvector) |
| `kubernetes` | K8s deployment, orchestration |
| `ray` | Ray Serve, Ray distributed computing |
| `vllm` | vLLM inference server |
| `tgi` | Text Generation Inference (HuggingFace) |
| `triton` | NVIDIA Triton Inference Server |
| `mlflow` | MLflow experiment tracking, model registry |
| `wandb` | Weights & Biases experiment tracking |
| `dagster` | Dagster pipeline orchestration |
| `airflow` | Apache Airflow workflow orchestration |
| `kubeflow` | Kubeflow ML pipelines |
| `langchain` | LangChain framework |
| `langgraph` | LangGraph agent orchestration |
| `llamaindex` | LlamaIndex data framework |
| `huggingface` | HuggingFace ecosystem (Transformers, Datasets, Hub) |
| `docker` | Containerization |
| `gpu` | GPU utilization, CUDA, multi-GPU |
| `api-gateway` | API management, rate limiting |
| `message-queue` | Kafka, RabbitMQ, async processing |
| `cache` | Redis, caching layers, semantic cache |
| `prometheus` | Prometheus monitoring |
| `grafana` | Grafana dashboards |
| `opentelemetry` | OpenTelemetry tracing |

### 4. Performance / Operational Tags

Identify the operational concern being tested.

| Tag | Description |
|-----|------------|
| `latency` | Response time, P50/P95/P99 latency |
| `throughput` | Requests per second, tokens per second |
| `cost` | Token cost, GPU cost, infrastructure cost |
| `scaling` | Horizontal/vertical scaling, auto-scaling |
| `reliability` | Uptime, redundancy, failover |
| `observability` | Monitoring, logging, metrics, dashboards |
| `tracing` | Distributed tracing, request tracing, span analysis |
| `drift` | Data drift, model drift, concept drift |
| `cold-start` | Cold start latency, model loading time |
| `token-management` | Token counting, context budget, truncation |
| `rate-limiting` | API rate limits, throttling, backpressure |
| `caching` | Response caching, semantic caching, KV cache |

### 5. Failure / Debugging Tags

Identify failure modes and debugging scenarios.

| Tag | Description |
|-----|------------|
| `hallucination` | LLM hallucination causes, detection, mitigation |
| `retrieval-failure` | Failed or degraded retrieval quality |
| `context-poisoning` | Irrelevant or harmful content in context |
| `tool-failure` | Tool calling errors, timeout, wrong tool selection |
| `loop-detection` | Agent loops, infinite retries |
| `cascade-failure` | Multi-component failure propagation |
| `data-quality` | Training/indexing data issues |
| `model-degradation` | Gradual performance decline |
| `incident-response` | Production incident handling, post-mortem |
| `anti-pattern` | Common mistakes, known bad practices |
| `timeout` | Request timeouts, connection timeouts |
| `memory-leak` | Memory issues in long-running systems |
| `race-condition` | Concurrency issues in AI pipelines |

### 6. Evaluation Tags

Identify evaluation methods, metrics, and frameworks.

| Tag | Description |
|-----|------------|
| `metrics` | Quantitative evaluation metrics |
| `ragas` | RAGAS evaluation framework |
| `llm-as-judge` | Using LLMs for automated evaluation |
| `human-eval` | Human evaluation protocols |
| `a-b-testing` | A/B testing for model/system changes |
| `rouge` | ROUGE metrics |
| `bleu` | BLEU metrics |
| `faithfulness` | Answer faithfulness to source |
| `relevance` | Answer/retrieval relevance scoring |
| `groundedness` | Grounding in retrieved evidence |
| `toxicity` | Content safety evaluation |

### 7. Architecture / Design Tags

Identify system design and architecture patterns.

| Tag | Description |
|-----|------------|
| `architecture` | System architecture, component design |
| `trade-offs` | Design trade-off analysis |
| `multi-tenant` | Multi-tenancy design patterns |
| `versioning` | Model versioning, prompt versioning, API versioning |
| `ci-cd` | Continuous integration / deployment for ML/AI |
| `pipeline` | Data/ML/inference pipelines |
| `fallback` | Model fallback, degraded mode, circuit breaker |
| `governance` | Model governance, compliance, audit |
| `prompt-versioning` | Prompt template management and versioning |
| `model-registry` | Model storage, cataloging, lifecycle |
| `feature-store` | Feature serving, feature computation |
| `retraining` | Retraining triggers, automated retraining |
| `canary-deployment` | Canary releases, progressive rollout |
| `blue-green` | Blue-green deployment strategy |
| `shadow-mode` | Shadow deployment, traffic mirroring |

---

## Tagging Rules

### Minimum and Maximum Tags Per Question

- **Minimum:** 3 tags (1 module tag + 2 others)
- **Maximum:** 8 tags (avoid over-tagging — each tag must add filtering value)

### Required Tag Types

Every question must have:
1. Exactly **one** module tag
2. At least **one** skill/technique tag
3. At least **one** tag from categories 3–7 (infrastructure, performance, failure, evaluation, or architecture)

### Tag Assignment Checklist

When tagging a question, ask:
1. What module does this belong to? → Module tag
2. What technical skill does it test? → Skill tag(s)
3. What tools/infra does it reference? → Infrastructure tag(s)
4. What operational concern does it address? → Performance tag(s)
5. What failure mode does it cover? → Failure tag(s)
6. What evaluation method is relevant? → Evaluation tag(s)
7. What architectural pattern is involved? → Architecture tag(s)

### Cross-Module Tagging

Questions can have a module tag that differs from their parent module's folder. For example, a question in `10_debugging_and_failure_modes/` about a RAG failure can have both `debugging` and `rag` tags. The module tag should match the primary focus, and additional tags capture cross-module relevance.

---

## Tag Governance

### Adding New Tags

To add a new tag:
1. Check that no existing tag covers the concept
2. Verify the tag would apply to ≥3 questions across ≥2 modules
3. Add it to the appropriate category table above
4. Follow naming conventions (lowercase, hyphenated, singular)
5. Update `indexes/tag_index.md`

### Deprecating Tags

To deprecate a tag:
1. Identify the replacement tag
2. Replace all instances in question files
3. Move the deprecated tag to an "Aliases" column pointing to the replacement
4. Update `indexes/tag_index.md`

### Periodic Tag Audit

Every 50 questions added, audit tags for:
- Tags used only once (consider merging into a parent tag)
- Near-synonym tags (consider merging)
- Missing tags for frequently discussed concepts
- Tags that have grown too broad (consider splitting)
