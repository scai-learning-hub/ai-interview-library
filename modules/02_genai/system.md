# Module 02 — Generative AI: System Level

---

## Q-02-S-001: Design a production LLM serving infrastructure that handles 1000 requests per second with <2 second latency.

**Module:** Generative AI
**Submodule:** Serving Infrastructure
**Level:** System
**Difficulty:** 5
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, DevOps / SRE → AIOps, ML / Data Engineer
**Tags:** [serving, infrastructure, latency, scaling, vllm, generative-ai, production]
**Prerequisites:** Q-02-C-008, Q-02-A-002
**Estimated Interview Round:** System Design
**Why This Question Matters:** LLM serving at scale requires balancing throughput, latency, cost, and reliability. The architecture decisions here dominate the total cost of ownership for any production LLM system.

---

**Question**

Design an LLM serving system that handles 1000 req/s with p99 latency under 2 seconds. Users send queries averaging 500 input tokens; responses average 200 output tokens. The model is a 70B parameter LLM.

---

**Expected Answer (Short)**

Architecture: Load balancer → Request queue → GPU serving cluster (vLLM/TensorRT-LLM) with tensor parallelism (2-4 GPUs per replica), auto-scaling based on queue depth. Key optimizations: continuous batching, PagedAttention, speculative decoding (if latency-constrained). Scaling math: each replica handles ~50-80 req/s with continuous batching → need ~15-20 replicas. Use H100/A100 80GB GPUs, 2-4 per replica for tensor parallelism on 70B model.

---

**Deep Answer**

- **Capacity planning:**
  - 70B model at fp16 = 140GB → minimum 2x H100 80GB for tensor parallelism
  - Per replica throughput with continuous batching: ~50-80 req/s (depends on sequence length)
  - 1000 req/s ÷ 60 req/s per replica ≈ 17 replicas needed
  - Total: ~34-68 H100 GPUs + headroom for failures

- **Architecture:**
  ```
  Client → CDN/API Gateway → Load Balancer (round-robin or least-connections)
      → Request Queue (Redis/Kafka for burst absorption)
      → GPU Serving Pool (17-20 replicas)
          Each replica: vLLM on 2x H100 with tensor parallelism
      → Response streaming back to client
  ```

- **Serving framework selection:**
  - **vLLM:** PagedAttention, continuous batching, production ready
  - **TensorRT-LLM:** Highest throughput per GPU, NVIDIA-optimized
  - **TGI (Text Generation Inference):** Good HuggingFace integration
  - Recommendation: vLLM for flexibility, TRT-LLM for maximum performance

- **Key optimizations:**
  - **Continuous batching:** Don't wait for all requests to finish — as one completes, add another
  - **PagedAttention:** Manage KV cache memory efficiently (non-contiguous pages)
  - **Quantization:** INT8 or FP8 reduces GPU count by 40-50% (140GB → 70-80GB)
  - **Speculative decoding:** Draft model + verifier for 2-3x latency reduction
  - **Prefix caching:** Cache KV states for common prefixes (system prompts)

- **Auto-scaling:**
  - Scale on: GPU utilization, request queue depth, p99 latency
  - Scale-out threshold: queue depth > 100 or GPU utilization > 80%
  - Scale-in: queue depth < 20 for 10 minutes
  - Cold start: GPU provisioning takes 5-10 minutes → maintain warm pool

- **Reliability:**
  - Health checks every 30 seconds (CUDA OOM detection, model corrupt detection)
  - Request timeout: 30 seconds → retry on different replica
  - Graceful drain: signal replica to stop accepting new requests, finish in-flight
  - Multi-region deployment for geographic latency + disaster recovery

- **Cost optimization:**
  - Spot/preemptible GPUs for non-critical traffic (30-60% savings)
  - Right-size: INT8 quantization allows fewer GPUs per replica
  - Batch API for non-real-time workloads at 50% cost
  - Caching layer before serving (semantic cache for repeated queries)

---

**Follow-up Questions**

1. Traffic spikes 5x during business hours. How does your auto-scaling handle this?
2. A single GPU fails mid-request. How does the system recover?
3. How would you modify this architecture for a multimodal model (text + images)?

---

**Common Weak Answers / Red Flags**

- No capacity planning (doesn't estimate how many GPUs needed)
- Doesn't mention continuous batching
- "Just add more GPUs" without discussing cost
- No failure handling or health checks

---

**Interviewer Evaluation Signal**

Full-stack system design for ML serving. Tests capacity planning, architecture, optimization, and operations. The candidate should produce concrete numbers (GPU count, throughput per replica) rather than vague "scale as needed."

---

## Q-02-S-002: How do you design a multi-tenant LLM platform where different teams share infrastructure but have isolated data and custom models?

**Module:** Generative AI
**Submodule:** Platform Architecture
**Level:** System
**Difficulty:** 5
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, DevOps / SRE → AIOps
**Tags:** [multi-tenant, platform, isolation, serving, generative-ai, infrastructure]
**Prerequisites:** Q-02-S-001, Q-02-A-002
**Estimated Interview Round:** System Design
**Why This Question Matters:** Most organizations need a centralized LLM platform serving multiple teams. Multi-tenancy introduces isolation, fairness, cost attribution, and security challenges beyond single-application serving.

---

**Question**

Your company has 10 product teams, each needing LLM capabilities. Some use the same base model; others have fine-tuned versions. Design the platform architecture.

---

**Expected Answer (Short)**

Shared API gateway with per-tenant API keys. Routing layer directs to appropriate model (base or custom). Shared base model serving pool. LoRA adapter hot-swapping for custom models (one base model, multiple adapters). Per-tenant: rate limits, cost tracking, data isolation. Shared: GPU infrastructure, monitoring, model management.

---

**Deep Answer**

- **Architecture layers:**
  ```
  Team APIs → Tenant Gateway (auth, rate limit, routing)
      → Model Router (maps tenant → model version)
      → Shared GPU Pool
          ├── Base Model Pool (shared Llama 3 70B)
          ├── Custom Model Pool (tenant-specific fine-tuned)
          └── LoRA Adapter Pool (base model + per-tenant adapters)
      → Response → Logging (per-tenant isolated)
  ```

- **LoRA adapter serving (key innovation):**
  - One base model loaded on GPU
  - Multiple LoRA adapters swapped per request based on tenant
  - vLLM supports per-request LoRA adapters
  ```python
  # Request from Team A
  response_a = model.generate(prompt, lora_adapter="team_a_customer_service")
  # Request from Team B (same GPU, different adapter)
  response_b = model.generate(prompt, lora_adapter="team_b_legal_analysis")
  ```
  - Eliminates need for separate GPU allocation per tenant

- **Data isolation:**
  - Logs, prompts, and responses stored in tenant-isolated storage
  - No cross-tenant data leakage (separate databases or tenant-keyed partitions)
  - LoRA adapters are tenant-owned (cannot be accessed by other tenants)
  - Audit logs per tenant for compliance

- **Cost attribution:**
  - Track tokens (input + output) per tenant per request
  - Cost = tokens × model price per token
  - Monthly billing per team with breakdown by model, feature, and usage pattern
  - Budget alerts: notify teams approaching spend limits

- **Fairness and rate limiting:**
  - Per-tenant rate limits (requests/sec, tokens/min)
  - Priority queues: P0 tenants (revenue-critical) get priority over P2 (internal tools)
  - Burst allowance: allow 2x limit for 5 minutes, then enforce
  - Global rate limiting to protect shared infrastructure

- **Model management:**
  - Model registry: base models + all tenant LoRA adapters
  - Deployment pipeline: tenant submits new adapter → automated eval → staged rollout
  - Version pinning: tenants can pin to a model version (no surprise updates)
  - Deprecation policy: 90 days notice before removing a model version

---

**Follow-up Questions**

1. Team A's traffic spike starves Team B of GPU resources. How do you prevent this?
2. A tenant's LoRA adapter degrades base model quality for other tenants. Can this happen?
3. How do you handle different compliance requirements per tenant (e.g., HIPAA for healthcare team, SOC2 for finance team)?

---

**Common Weak Answers / Red Flags**

- Separate GPU cluster per tenant — massive waste
- No cost attribution — "just split cost equally"
- Doesn't mention LoRA adapter serving for model customization
- No data isolation architecture

---

**Interviewer Evaluation Signal**

Platform engineering maturity. The LoRA adapter serving pattern is the industry standard for multi-tenant LLM platforms. Cost attribution and fairness mechanisms show operational experience.

---

## Q-02-S-003: Design an automated model evaluation and deployment pipeline for LLM-based products.

**Module:** Generative AI
**Submodule:** Deployment
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** DevOps / SRE → AIOps, ML / Data Engineer, Senior / Architect
**Tags:** [deployment, ci-cd, evaluation, canary, generative-ai, production]
**Prerequisites:** Q-02-A-014, Q-02-A-010
**Estimated Interview Round:** System Design
**Why This Question Matters:** LLM deployment is riskier than traditional service deployment because behavior changes are semantic, not functional. A new model version might pass all unit tests but produce subtly worse responses. Automated evaluation gates are essential.

---

**Question**

You're deploying a new fine-tuned model version to replace the current production model. Design the end-to-end deployment pipeline with safety gates.

---

**Expected Answer (Short)**

Pipeline: (1) Offline eval — run automated eval suite against golden set, compare to baseline. (2) Shadow mode — run new model alongside production (no user-facing output), compare outputs. (3) Canary deployment — route 5% of traffic to new model, monitor metrics. (4) Progressive rollout — increase to 25%, 50%, 100% with automated rollback triggers. Each stage has pass/fail criteria. Rollback is automatic if quality drops below threshold.

---

**Deep Answer**

- **Stage 1: Offline evaluation (gate: automated metrics):**
  ```
  New model → Eval suite (500+ examples) → Score comparison → Pass/Fail
  
  Pass criteria:
  - Accuracy ≥ baseline - 1%
  - Format compliance ≥ 99%
  - LLM-judge quality ≥ baseline - 0.1 (on 5-point scale)
  - Latency ≤ baseline + 10%
  ```
  - Blocks deployment if criteria not met
  - Takes 30-60 minutes, costs $10-50 in LLM eval calls

- **Stage 2: Shadow deployment (1-3 days):**
  - Production traffic duplicated to new model
  - New model generates responses but they're NOT returned to users
  - Compare: new model outputs vs production model outputs
  - Flag divergences for human review
  - Detect systematic biases (e.g., new model always shorter, or different tone)

- **Stage 3: Canary (5% traffic, 24-48 hours):**
  - Route 5% of real traffic to new model
  - Monitor: user feedback, error rates, response quality (LLM-judge on sample)
  - A/B comparison: canary metrics vs control metrics
  - Auto-rollback trigger: error rate > 2% or quality score drops > 5%

- **Stage 4: Progressive rollout:**
  ```
  5% → (24h, metrics OK) → 25% → (24h, metrics OK) → 50% → (24h) → 100%
  ```
  - At each stage: compare metrics to control group
  - Any degradation pauses rollout
  - Full rollback takes <5 minutes (switch routing back to old model)

- **Rollback mechanism:**
  - Old model always running (warm standby) until 100% rollout confirmed for 1 week
  - Feature flag controls routing — rollback is a config change, not a deployment
  - Automated rollback on: error rate spike, latency spike, quality score drop, manual trigger

- **Infrastructure:**
  ```
  Git push → CI eval → Shadow (auto) → Canary (approval) → Rollout (auto) → Monitor
       ↑                                                           ↓
       └──────── Automatic rollback if metrics degrade ←──────────┘
  ```

---

**Follow-up Questions**

1. The new model passes all offline evals but performs worse in canary. What kind of issue does offline eval miss?
2. How do you handle deployments that require both a model change and a prompt change simultaneously?
3. With 50% rollout, users get inconsistent experiences between old and new model. How do you handle this?

---

**Common Weak Answers / Red Flags**

- No canary/progressive rollout — "just deploy and monitor"
- No automated rollback — relies on humans noticing problems
- Shadow mode skipped — goes directly to user-facing deployment
- No metric comparison between stages

---

**Interviewer Evaluation Signal**

Deployment engineering maturity. The progressive rollout pattern with automated rollback is standard for production ML. Candidates who include shadow deployment demonstrate extra operational caution.

---

## Q-02-S-004: How do you build a real-time content moderation system using LLMs at scale?

**Module:** Generative AI
**Submodule:** Content Safety
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, Software Dev → AI Engineer
**Tags:** [content-moderation, safety, real-time, scaling, generative-ai, production]
**Prerequisites:** Q-02-A-006, Q-02-A-009
**Estimated Interview Round:** System Design
**Why This Question Matters:** Content moderation at scale requires balancing accuracy (don't miss harmful content), speed (real-time), cost (every post must be checked), and fairness (don't over-block legitimate content). LLMs enable nuanced moderation that rule-based systems can't achieve.

---

**Question**

Design a content moderation system for a social platform with 10M posts/day. The system must flag harmful content in <500ms while maintaining <1% false positive rate.

---

**Expected Answer (Short)**

Tiered architecture: Tier 1 (regex/keyword, <10ms, catches 30% of violations), Tier 2 (small classifier model, <50ms, catches 60%), Tier 3 (LLM, <500ms, handles ambiguous cases). Only ~10% of traffic reaches the expensive LLM tier. Feedback loop: human reviewers validate LLM decisions, labels used to improve Tier 2 classifier over time.

---

**Deep Answer**

- **Tiered moderation architecture:**
  ```
  Post → Tier 1: Rule-based (regex, word lists) → 30% flagged → Action
                 ↓ Passed
         Tier 2: Fast classifier (BERT-sized) → 8% flagged → Action
                 ↓ Passed
         Tier 3: LLM analysis (ambiguous cases) → 2% flagged → Action
                 ↓ Passed
         Published
  ```

- **Tier 1 — Rule-based (<10ms, handles 30%):**
  - Regex patterns for known slurs, phone numbers, spam URLs
  - Exact match on known harmful content hashes
  - Cost: negligible (CPU-only)
  - False positive rate: <0.1% (high-confidence rules only)

- **Tier 2 — Classifier (<50ms, handles 60%):**
  - Fine-tuned small model (DeBERTa, 300M params)
  - Multi-label: toxicity, hate speech, violence, spam, sexual content
  - Batch inference on GPU for throughput
  - 10M posts / 86400 seconds = 116 posts/sec → easily handled by small GPU cluster

- **Tier 3 — LLM analysis (<500ms, handles 10%):**
  - Context-aware moderation: understands sarcasm, cultural context, implicit harm
  - Used ONLY for borderline cases (classifier confidence 0.3-0.7)
  - Prompt includes: content, context (reply chain, user history), platform policies
  - Outputs: decision (allow/block/review), confidence, explanation
  - ~12 posts/sec at Tier 3 → manageable with small LLM fleet

- **Feedback loop:**
  - Human review team validates Tier 3 decisions (sample + appeals)
  - Validated labels feed back into Tier 2 classifier training (monthly retraining)
  - Over time, Tier 2 gets better → fewer Tier 3 calls → lower cost

- **Latency budget:**
  | Tier | Latency | % Traffic | Cost/post |
  |------|---------|-----------|-----------|
  | 1 | 5ms | 100% | $0.000001 |
  | 2 | 40ms | 70% | $0.0001 |
  | 3 | 400ms | 10% | $0.005 |
  | Avg | ~50ms | — | ~$0.0006 |

- **Monitoring:**
  - False positive rate per category (target: <1%)
  - False negative rate (sampled by human review)
  - Tier escalation rates (if Tier 3 seeing >15%, Tier 2 needs retraining)
  - Appeals rate and overturn rate

---

**Follow-up Questions**

1. A new type of harmful content emerges that none of your tiers detect. How quickly can you respond?
2. Users learn to evade Tier 1 (leetspeak, Unicode tricks). How do you adapt?
3. How do you handle content in 20 different languages?

---

**Common Weak Answers / Red Flags**

- "Use an LLM for every post" — impractical at 10M posts/day (cost would be $50K/day)
- No tiered architecture
- Doesn't mention feedback loop for continuous improvement
- No latency budget allocation

---

**Interviewer Evaluation Signal**

Systems thinking at scale. The tiered architecture is the key insight — use the cheapest effective tool at each stage. The feedback loop shows understanding of continuous improvement. The candidate should produce rough cost/latency estimates.

---

## Q-02-S-005: How do you design a fine-tuning platform that enables multiple teams to fine-tune models self-service?

**Module:** Generative AI
**Submodule:** Training Platform
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, ML / Data Engineer, DevOps / SRE → AIOps
**Tags:** [fine-tuning, platform, self-service, mlops, generative-ai, infrastructure]
**Prerequisites:** Q-02-A-004, Q-02-A-003, Q-02-S-002
**Estimated Interview Round:** System Design
**Why This Question Matters:** Fine-tuning will become a routine operation for product teams. A self-service platform democratizes this capability while maintaining guardrails (GPU cost, data quality, evaluation standards).

---

**Question**

Design a self-service fine-tuning platform where product teams can fine-tune LLMs on their data without needing ML infrastructure expertise.

---

**Expected Answer (Short)**

Platform components: (1) Data upload and validation pipeline (format checks, PII detection, quality scoring). (2) Configuration UI (model selection, hyperparameter presets, task type). (3) Managed training infrastructure (auto-provisioned GPUs, LoRA/QLoRA by default). (4) Automated evaluation (compare fine-tuned model vs base model). (5) One-click deployment to serving infrastructure. Built-in guardrails: budget limits, mandatory eval pass, data quality gates.

---

**Deep Answer**

- **Platform architecture:**
  ```
  User Portal → Data Validation → Config Builder → Job Scheduler
      → GPU Cluster (training) → Evaluation Pipeline → Model Registry
      → One-click Deploy → Serving Infrastructure
  ```

- **Data pipeline (automated quality gates):**
  - **Format validation:** Correct chat format, valid JSON, required fields
  - **Size check:** Minimum 100 examples, maximum 100K (cost guardrails)
  - **PII detection:** Automated scan, block if PII found without explicit acknowledgment
  - **Quality scoring:** Automated checks (dedup ratio, average length, language distribution)
  - **Splits:** Auto-generate train/eval split if not provided

- **Configuration (smart defaults):**
  ```yaml
  # User selects:
  base_model: llama-3-8b       # From approved model catalog
  task_type: chat               # chat, completion, classification
  data_path: s3://team-a/data/
  
  # Platform sets (overridable for power users):
  method: qlora
  rank: 16
  learning_rate: 2e-4
  epochs: 3
  eval_strategy: steps
  ```
  - 80% of users use defaults. 20% customize for advanced use cases.
  - Task-type presets: different defaults for chat vs classification vs code.

- **Training infrastructure:**
  - Job scheduler: integrates with Kubernetes + GPU scheduling (e.g., KubeFlow, Ray)
  - Auto-provisions appropriate GPU (A100 40GB for 8B, 2xA100 80GB for 70B)
  - Spot instances for cost reduction (70% cheaper), with checkpointing for preemption
  - Live monitoring: loss curves, GPU utilization, estimated completion time

- **Automated evaluation (mandatory):**
  - Every fine-tuning job triggers automated evaluation
  - Compare: fine-tuned model vs base model on eval set
  - Display: accuracy delta, quality delta, format compliance, regression warnings
  - Gate: deployment blocked if quality is worse than base model

- **Deployment:**
  - One-click deploy to serving platform (vLLM with adapter)
  - A/B testing: automatic canary deployment (5% traffic)
  - Automatic promotion after 48 hours if metrics stable

- **Guardrails:**
  - Budget limits per team (max GPU-hours per month)
  - Cost estimation before training starts ("This job will cost ~$150")
  - Data size limits to prevent accidental large training runs
  - Automatic job cancellation if loss diverges (NaN, explosion)

---

**Follow-up Questions**

1. A team fine-tunes a model that's great on their eval but terrible in production. How does the platform help prevent this?
2. How do you manage GPU scheduling when 5 teams submit fine-tuning jobs simultaneously?
3. A team accidentally uploads sensitive customer data. What safeguards prevent this?

---

**Common Weak Answers / Red Flags**

- No data validation pipeline — teams upload whatever they want
- No mandatory evaluation — deploy fine-tuned model without comparison
- No cost guardrails — unlimited GPU usage
- Requires ML team involvement for every fine-tuning job (defeats "self-service")

---

**Interviewer Evaluation Signal**

Platform engineering for ML. The key insight is balancing self-service (teams can do it themselves) with guardrails (they can't break things or waste money). Mandatory evaluation before deployment is a critical gate.

---

## Q-02-S-006: How do you design an LLM gateway that provides unified access to multiple LLM providers with failover and cost optimization?

**Module:** Generative AI
**Submodule:** Infrastructure
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, DevOps / SRE → AIOps
**Tags:** [llm-gateway, routing, failover, cost-optimization, generative-ai, production]
**Prerequisites:** Q-02-A-002, Q-02-A-011
**Estimated Interview Round:** System Design
**Why This Question Matters:** Depending on a single LLM provider is a business risk. An LLM gateway provides provider abstraction, failover, cost optimization, and centralized observability. It's a critical infrastructure component for any serious LLM-powered organization.

---

**Question**

Design an LLM gateway that provides your engineering teams with a unified API, supports multiple providers (OpenAI, Anthropic, self-hosted), includes automatic failover, and optimizes for cost.

---

**Expected Answer (Short)**

Gateway provides: (1) Unified API — same interface regardless of provider. (2) Provider routing — rules-based or dynamic routing to cheapest/fastest/best provider. (3) Failover — if one provider returns errors or hits rate limits, auto-switch to backup. (4) Caching — exact and semantic caching for cost reduction. (5) Observability — centralized logging, cost tracking, latency monitoring. (6) Rate limiting — per-team quotas to prevent abuse.

---

**Deep Answer**

- **Architecture:**
  ```
  Client SDK → Gateway API → Request Pipeline:
      1. Auth & Rate Limiting
      2. Cache Check (exact + semantic)
      3. Router (select provider based on rules)
      4. Provider Adapter (translate to provider-specific API)
      5. Request to Provider
      6. Response Processing (standardize format)
      7. Logging & Metrics
      8. Cache Store
      → Response to Client
  ```

- **Unified API design:**
  ```python
  # Client code — same regardless of provider
  response = llm_gateway.chat(
      model="default-chat",           # Logical model name (not provider-specific)
      messages=[...],
      temperature=0.7,
      max_tokens=500,
      metadata={"team": "search", "feature": "autocomplete"}
  )
  ```
  - Model aliases: "default-chat" → routes to cheapest provider for the task
  - Team can request specific provider: "openai/gpt-4o" if needed

- **Routing strategies:**
  - **Cost-optimized:** Route to cheapest provider that meets quality threshold
  - **Latency-optimized:** Route to provider with lowest recent p50 latency
  - **Quality-optimized:** Route to highest-quality provider for important requests
  - **A/B routing:** Split traffic between providers for comparison

- **Failover:**
  ```python
  providers = ["openai", "anthropic", "self-hosted"]
  for provider in providers:
      try:
          response = call_provider(provider, request, timeout=10)
          if response.status == 200:
              return response
      except (RateLimitError, TimeoutError, ServerError):
          log_failover(provider, error)
          continue  # Try next provider
  raise AllProvidersFailedError()
  ```
  - Circuit breaker: if provider has >5% error rate in last 5 minutes, skip it
  - Rate limit awareness: if approaching provider rate limit, preemptively route elsewhere

- **Caching:**
  - Exact cache: hash(model + messages + params) → cached response
  - Semantic cache: embed the query, return cached response if similarity > 0.95
  - TTL: configurable per use case (minutes for dynamic data, hours for static)

- **Observability:**
  - Total requests, tokens, cost per: team, feature, provider, model
  - Latency percentiles (p50, p95, p99) per provider
  - Error rates and failover frequency
  - Dashboard: real-time cost burn rate, provider health, top consumers

---

**Follow-up Questions**

1. How do you handle streaming responses through the gateway?
2. Provider A raises prices by 50%. How does the gateway help you adapt?
3. How do you ensure the gateway itself doesn't become a single point of failure?

---

**Common Weak Answers / Red Flags**

- Direct provider calls in application code (no abstraction)
- No failover strategy — single provider dependency
- No centralized cost tracking
- Gateway as a simple proxy without routing intelligence

---

**Interviewer Evaluation Signal**

Infrastructure architecture maturity. An LLM gateway is becoming standard at scale. The candidate should describe it as an intelligent routing + observability layer, not just a proxy. Failover and cost optimization are minimum requirements.

---

## Q-02-S-007: How do you design the data architecture for a system that needs to fine-tune models continuously as new data arrives?

**Module:** Generative AI
**Submodule:** Continuous Learning
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** ML / Data Engineer, Senior / Architect
**Tags:** [continuous-learning, data-architecture, fine-tuning, pipeline, generative-ai]
**Prerequisites:** Q-02-A-003, Q-02-S-005
**Estimated Interview Round:** System Design
**Why This Question Matters:** Models degrade over time as data distributions shift. A continuous fine-tuning pipeline keeps models fresh. The data architecture is the foundation — how you collect, curate, and feed training data determines model quality.

---

**Question**

You're running an LLM-powered customer service system. You want to continuously improve the model using new conversation data produced daily. Design the data architecture for continuous fine-tuning.

---

**Expected Answer (Short)**

Pipeline: (1) Data collection — capture all conversations with outcomes (resolved/escalated). (2) Automated labeling — use resolved conversations as positive examples, escalated as negative. (3) Quality filtering — automated quality scores, diversity checks. (4) Data store — versioned dataset that grows incrementally. (5) Training trigger — retrain weekly or on drift detection. (6) Evaluation — compare new model to current production on fresh held-out data.

---

**Deep Answer**

- **Data flow:**
  ```
  Production conversations → Data Lake (raw)
      → PII Redaction → Label Generation → Quality Scoring
      → Curated Dataset (versioned) → Training Trigger
      → Fine-tuning Job → Evaluation → Deploy (if better)
  ```

- **Label generation (semi-automated):**
  - **Positive examples:** Conversations that were resolved (no escalation, positive CSAT)
  - **Negative examples:** Escalated conversations, low CSAT, user complaints
  - **Human review:** Sample 5% for manual quality check
  - **LLM-as-judge:** Use a stronger model to rate conversation quality

- **Data versioning:**
  ```
  datasets/
  ├── v1.0/  (initial training set, 5K examples)
  ├── v1.1/  (v1.0 + week 1 new data, 6.2K examples)
  ├── v1.2/  (v1.1 + week 2 new data, 7.5K examples)
  └── current → v1.2 (symlink)
  ```
  - Track dataset lineage: which raw conversations went into which version
  - Immutable versions: never modify past versions, only create new ones

- **Quality gates before training:**
  - Deduplication against existing training set (avoid memorization)
  - Distribution check: new data shouldn't dramatically shift category distribution
  - Toxicity scan: remove any conversations with toxic content
  - Minimum quality score threshold (LLM-judge score ≥ 3.5/5)

- **Training trigger strategies:**
  | Strategy | Trigger | Best For |
  |----------|---------|----------|
  | Scheduled | Weekly/monthly | Stable domains |
  | Threshold | 1000+ new high-quality examples | Growth phase |
  | Drift-based | Performance drops below threshold | Mature systems |
  | Manual | Team decision | Early stage |

- **Catastrophic forgetting prevention:**
  - Always include a sample of original training data in each training run (replay buffer)
  - Ratio: 70% new data, 30% original data
  - Monitor general benchmarks alongside task-specific metrics

---

**Follow-up Questions**

1. A batch of bad data gets into the pipeline and degrades the model. How do you detect and recover?
2. How do you handle concept drift (the definition of a "good response" changes over time)?
3. How do you know when to stop fine-tuning and retrain from a new base model instead?

---

**Common Weak Answers / Red Flags**

- "Just retrain on all available data every time" — wasteful, doesn't scale
- No data versioning — can't reproduce past training runs
- No quality filtering — trains on everything including garbage
- Doesn't address catastrophic forgetting

---

**Interviewer Evaluation Signal**

Data engineering maturity for ML. The continuous fine-tuning pipeline is the next frontier after one-time fine-tuning. Key insights: data versioning, quality gates, catastrophic forgetting prevention via replay buffer.

---

## Q-02-S-008: How do you design observability for an LLM-powered system?

**Module:** Generative AI
**Submodule:** Observability
**Level:** System
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior, Architect
**Persona Relevance:** DevOps / SRE → AIOps, Senior / Architect, ML / Data Engineer
**Tags:** [observability, monitoring, logging, tracing, generative-ai, production]
**Prerequisites:** Q-02-A-010
**Estimated Interview Round:** System Design
**Why This Question Matters:** LLM systems fail silently — they don't crash, they just produce bad output. Traditional monitoring (HTTP 200, latency) is necessary but insufficient. LLM observability requires monitoring output quality, cost, and behavioral patterns.

---

**Question**

What does observability look like for an LLM-powered application? What do you monitor beyond standard service metrics?

---

**Expected Answer (Short)**

Standard (necessary but insufficient): HTTP errors, latency, throughput, GPU utilization. LLM-specific: token usage (input/output), cost per request, output quality (LLM-as-judge on sample), format compliance rate, hallucination detection (RAG systems), user feedback (thumbs up/down), prompt version performance, and drift detection (input distribution changes).

---

**Deep Answer**

- **Layer 1: Infrastructure metrics (standard):**
  - Latency: TTFT (time to first token), total response time, p50/p95/p99
  - Throughput: requests/sec, tokens/sec
  - Errors: HTTP 500, timeout, rate limit
  - GPU: utilization, memory, temperature
  - Queue: depth, wait time

- **Layer 2: LLM-specific metrics (critical):**
  - **Token usage:** Input tokens, output tokens, total per request
  - **Cost:** Per-request, per-feature, per-team, daily trend
  - **Format compliance:** % of responses that parse correctly
  - **Safety:** % flagged by content filter, injection attempt rate
  - **Cache hit rate:** % of requests served from cache

- **Layer 3: Quality metrics (differentiating):**
  - **Automated quality scoring:** LLM-as-judge on 1-5% sample of production requests
  - **User feedback:** Thumbs up/down ratio, explicit rating
  - **Task completion:** % of interactions that achieve the user's goal
  - **Hallucination rate** (for RAG): % of claims not grounded in retrieved context

- **Tracing (per-request):**
  ```
  Request trace:
  ├── Input preprocessing: 5ms
  ├── Cache lookup: 2ms (miss)
  ├── Guardrail check: 15ms
  ├── LLM call: 1200ms
  │   ├── TTFT: 200ms
  │   ├── Generation: 1000ms
  │   └── Tokens: 150 in, 300 out
  ├── Output guardrail: 10ms
  └── Total: 1232ms, cost: $0.003
  ```
  - Full trace for every request
  - Searchable by: user, session, feature, quality score, error type

- **Alerting:**
  | Alert | Condition | Priority |
  |-------|-----------|----------|
  | Quality degradation | Judge score drops >10% | P1 |
  | Cost spike | Daily cost >150% of average | P2 |
  | Latency regression | p99 > SLA for 15 minutes | P1 |
  | Format compliance | <95% for 10 minutes | P2 |
  | Safety filter spike | >5% of requests flagged | P1 |

- **Dashboards:**
  - Operations: latency, throughput, errors, GPU utilization
  - Quality: quality scores trend, feedback, format compliance
  - Cost: burn rate, cost per feature, model comparison
  - Safety: filter triggers, injection attempts, escalation rate

---

**Follow-up Questions**

1. How do you implement automated quality scoring without it being too expensive?
2. Your quality alert fires but there's no obvious cause. What's your debugging process?
3. How do you correlate quality changes with deployment events (prompt change, model update)?

---

**Common Weak Answers / Red Flags**

- Only monitors standard metrics (latency, errors) — misses quality
- No per-request tracing
- No cost monitoring
- No automated quality scoring

---

**Interviewer Evaluation Signal**

Operability maturity. The three-layer model (infrastructure → LLM-specific → quality) shows understanding that LLM systems need deeper monitoring than traditional services. Automated quality scoring on production traffic is the key differentiator.
