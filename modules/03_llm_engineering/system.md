# Module 03 — LLM Engineering: System Level

---

## Q-03-S-001: Design a multi-model LLM serving platform that handles 10,000 requests/minute across 5 different models with varying latency SLAs.

**Module:** LLM Engineering
**Submodule:** Serving Infrastructure
**Level:** System
**Difficulty:** 5
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, DevOps / SRE → AIOps
**Tags:** [system-design, serving, multi-model, scaling, llm-engineering]
**Prerequisites:** Q-03-A-001, Q-03-A-010, Q-03-A-008
**Estimated Interview Round:** System Design
**Why This Question Matters:** Real LLM platforms serve multiple models to different products. The infrastructure must handle heterogeneous workloads, different GPU requirements, autoscaling, and cost optimization simultaneously.

---

**Question**

Design a platform serving 5 models (8B, 13B, 70B, MoE 8x7B, API-proxied GPT-4o) at 10K RPM total, with p99 latency SLAs of 500ms (8B) to 5s (70B). Include autoscaling, model loading, and cost optimization.

---

**Expected Answer (Short)**

Architecture: (1) API Gateway with routing layer → routes requests to appropriate model pool. (2) Per-model GPU pools with autoscaling (based on queue depth, not just CPU). (3) vLLM/TensorRT-LLM per pool with continuous batching. (4) Model registry for version management and hot-swapping. (5) Request queue per model with priority. (6) Autoscaler monitors queue depth + latency → scales GPU instances. (7) Cost optimization: spot instances for batch workloads, reserved for real-time. (8) Observability: per-model latency, throughput, error rate, GPU utilization, KV cache utilization.

---

**Deep Answer**

- **Architecture diagram:**
  ```
  Clients → API Gateway → Load Balancer → Model Router
                                              ↓
                      ┌──────────┬──────────┬──────────┬──────────┬──────────┐
                      │ Pool: 8B │Pool: 13B │Pool: 70B │Pool: MoE │Pool: API │
                      │ 4×A10G  │ 2×A100  │ 4×H100  │ 2×A100  │ Proxy    │
                      │ TP=1    │ TP=1    │ TP=4    │ TP=2    │          │
                      └──────────┴──────────┴──────────┴──────────┴──────────┘
                                              ↓
                      Model Registry ← Blue/Green Deployment ← CI/CD
  ```

- **Autoscaling strategy:**
  ```python
  # Scale on queue depth, not just request rate
  autoscaler_config = {
      "model_8b": {
          "min_replicas": 2,
          "max_replicas": 20,
          "scale_up_threshold": "queue_depth > 50 or p99_latency > 400ms",
          "scale_down_threshold": "queue_depth < 5 and p99_latency < 200ms",
          "cooldown_seconds": 120,
          "gpu_type": "a10g",
      },
      "model_70b": {
          "min_replicas": 1,
          "max_replicas": 8,
          "scale_up_threshold": "queue_depth > 10 or p99_latency > 4s",
          "scale_down_threshold": "queue_depth < 2 and p99_latency < 2s",
          "cooldown_seconds": 300,  # Longer: GPU startup is slow
          "gpu_type": "h100",
      }
  }
  ```

- **Model loading optimization:**
  - Pre-warm GPU instances with model weights loaded (avoid cold start)
  - Use shared storage (S3/NFS) for model weights with local caching
  - Model loading time: 8B ~30s, 70B ~5min → plan scale-up lead time
  - Blue/green deployment for model updates (no downtime)

- **Cost optimization:**
  | Strategy | Saving | Trade-off |
  |----------|--------|-----------|
  | Spot instances for batch/low-priority | 60-70% | May be interrupted |
  | Reserved for real-time baseline load | 30-40% | Committed capacity |
  | Time-based scaling (scale down at night) | 20-30% | Must predict traffic patterns |
  | Quantized models (INT4/INT8) | 50-75% fewer GPUs | Slight quality reduction |
  | Aggressive prefix caching | 30-50% fewer computations | Memory overhead |

---

**Follow-up Questions**

1. How do you handle a sudden 5x traffic spike (viral moment)?
2. A model update causes quality regression on one of the 5 models. How do you roll back?
3. How do you allocate GPU budget across 5 models when total budget is constrained?

---

**Common Weak Answers / Red Flags**

- "One big cluster serves everything" — no per-model optimization
- Doesn't consider model loading time in scaling decisions
- No cost optimization strategy
- Ignores GPU heterogeneity (different models need different GPU types)

---

**Interviewer Evaluation Signal**

Multi-model platform architecture. This is a senior/staff-level question. The candidate should demonstrate understanding of GPU-specific scaling, model loading constraints, and cost-aware infrastructure design.

---

## Q-03-S-002: Design a system for continuously evaluating LLM quality in production without human labelers.

**Module:** LLM Engineering
**Submodule:** Production Evaluation
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** ML / Data Engineer, Senior / Architect
**Tags:** [system-design, evaluation, monitoring, quality, llm-engineering]
**Prerequisites:** Q-03-A-009, Q-02-A-014
**Estimated Interview Round:** System Design, Deep Dive
**Why This Question Matters:** LLM output quality can degrade silently — model updates, prompt drift, input distribution changes. Continuous automated evaluation catches regressions before users notice. Building this without hiring human labelers requires creative system design.

---

**Question**

Design a continuous LLM quality monitoring system that detects quality regressions within 1 hour, without dedicated human labelers. The system serves customer support responses.

---

**Expected Answer (Short)**

Multi-signal approach: (1) Automated metrics: response length, format compliance, latency, error rate. (2) LLM-as-judge: sample 5% of responses, score with a stronger model. (3) Implicit user signals: did user ask a follow-up? (possible unsatisfied), did user click "helpful"?, did user escalate to human? (4) Drift detection: compare feature distributions (topic, length, confidence) to baseline. (5) Alerting: weighted score from all signals, alert if drops below threshold. Update baseline weekly.

---

**Deep Answer**

- **System architecture:**
  ```
  Production LLM → Response → User
       ↓ (async sampling)
  Quality Pipeline:
  ├── Signal 1: Automated Metrics (every response)
  │   ├── Response length (tokens)
  │   ├── Format compliance (JSON valid, schema match)
  │   ├── Latency (TTFT, total)
  │   └── Error rate (API errors, empty responses)
  ├── Signal 2: LLM-as-Judge (5% sample)
  │   ├── Helpfulness score (1-5)
  │   ├── Accuracy score (1-5)
  │   └── Tone score (1-5)
  ├── Signal 3: User Behavior (every interaction)
  │   ├── Follow-up rate (lower = better)
  │   ├── Escalation rate (lower = better)
  │   ├── Thumbs up/down ratio
  │   └── Conversation length (shorter = better for resolution)
  └── Signal 4: Distribution Drift
      ├── Input topic distribution shift
      ├── Output confidence distribution shift
      └── Response length distribution shift
  → Aggregated Quality Score → Alerting
  ```

- **Scoring methodology:**
  ```python
  def compute_quality_score(window="1h"):
      scores = {
          "format_compliance": get_format_compliance_rate(window),  # 0-1
          "llm_judge_avg": get_judge_scores(window).mean() / 5.0,  # 0-1
          "escalation_rate": 1 - get_escalation_rate(window),       # 0-1 (inverse)
          "followup_rate": 1 - get_followup_rate(window),           # 0-1 (inverse)
          "error_rate": 1 - get_error_rate(window),                 # 0-1 (inverse)
      }
      
      weights = {
          "format_compliance": 0.15,
          "llm_judge_avg": 0.35,
          "escalation_rate": 0.20,
          "followup_rate": 0.15,
          "error_rate": 0.15,
      }
      
      quality_score = sum(scores[k] * weights[k] for k in scores)
      return quality_score
  ```

- **Alert thresholds:**
  ```
  quality_score > 0.85: Green (healthy)
  quality_score 0.75-0.85: Yellow (investigate)
  quality_score < 0.75: Red (alert, potential rollback)
  
  Any single metric drop > 20% from baseline: Alert regardless of overall score
  ```

---

**Follow-up Questions**

1. The LLM-as-judge has 10% disagreement with eventual human review. Is this acceptable?
2. How do you handle the cold-start problem when launching a new feature?
3. What's the cost of running continuous LLM-as-judge evaluation?

---

**Common Weak Answers / Red Flags**

- "Check quality manually every week" — too slow
- Only uses one signal (e.g., only user ratings)
- No baseline comparison or drift detection
- No automated alerting

---

**Interviewer Evaluation Signal**

Production observability for LLM systems. Multi-signal quality monitoring without human labelers shows the candidate can design self-sustaining quality systems.

---

## Q-03-S-003: Design a context-aware caching system for LLM responses that reduces serving costs by 40%.

**Module:** LLM Engineering
**Submodule:** Caching Architecture
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, DevOps / SRE → AIOps
**Tags:** [system-design, caching, semantic-cache, cost-optimization, llm-engineering]
**Prerequisites:** Q-03-A-002, Q-03-A-012
**Estimated Interview Round:** System Design
**Why This Question Matters:** LLM inference is expensive. Caching can dramatically reduce costs but traditional exact-match caching has low hit rates for natural language queries. Semantic caching enables much higher hit rates.

---

**Question**

Design a caching system for LLM responses that supports exact-match and semantic similarity caching, with cache invalidation and quality guarantees.

---

**Expected Answer (Short)**

Three-tier cache: (1) Exact match: hash of (model, prompt, parameters) → cached response. Hit rate: 5-15%. (2) Semantic cache: embed the query, find similar cached queries (cosine similarity > threshold). Hit rate: 20-40%. (3) Prefix cache: KV cache reuse for shared prompt prefixes (implemented at serving level). Combined: 30-50% cost reduction. Invalidation: TTL-based (24h for dynamic content, 7d for static), version-based (invalidate on model/prompt change), quality-based (invalidate if cached response gets negative feedback).

---

**Deep Answer**

- **Architecture:**
  ```
  Request → Exact Cache Lookup (Redis)
              ↓ (miss)
          → Semantic Cache Lookup (Vector DB)
              ↓ (miss)
          → LLM Inference (with prefix cache)
              ↓ (response)
          → Store in both caches
              ↓
          → Return response
  ```

- **Exact cache:**
  ```python
  def exact_cache_key(model, messages, params):
      # Normalize and hash
      content = json.dumps({
          "model": model,
          "messages": messages,
          "temperature": params.get("temperature", 1.0),
          "max_tokens": params.get("max_tokens"),
      }, sort_keys=True)
      return hashlib.sha256(content.encode()).hexdigest()
  ```
  - Only works for deterministic settings (temperature=0)
  - Fast: Redis lookup ~1ms

- **Semantic cache:**
  ```python
  def semantic_cache_lookup(query, threshold=0.95):
      query_embedding = embed(query)
      results = vector_db.search(query_embedding, top_k=5)
      
      for result in results:
          if result.similarity >= threshold:
              # Verify staleness
              if not is_expired(result.metadata.timestamp):
                  return result.cached_response
      
      return None  # Cache miss
  ```
  - Higher hit rate: "How do I reset my password?" matches "I forgot my password, how to reset?"
  - Trade-off: embedding computation adds ~10ms latency
  - Similarity threshold is critical: too low → wrong answers served

- **Cache invalidation strategies:**
  | Trigger | Action |
  |---------|--------|
  | TTL expiry | Remove after configured time (e.g., 24 hours) |
  | Model version change | Invalidate all cached responses for that model |
  | Prompt version change | Invalidate all cached responses for that prompt template |
  | Negative user feedback | Remove specific cached response |
  | Quality eval failure | Batch invalidate low-scoring cached responses |

- **Cost analysis:**
  ```
  10K requests/day at $0.01 average per request = $100/day
  With semantic caching (35% hit rate):
  - 3,500 cache hits × $0.0001 (embedding cost) = $0.35
  - 6,500 cache misses × $0.01 = $65
  - Total: $65.35/day (vs $100) → 35% reduction
  ```

---

**Follow-up Questions**

1. A cached response is factually incorrect but highly similar semantically. How do you prevent serving it?
2. How do you handle cache warm-up after a model version update invalidates the entire cache?
3. What similarity threshold do you use and how did you determine it?

---

**Common Weak Answers / Red Flags**

- Only exact-match caching ("natural language queries rarely match exactly")
- No cache invalidation strategy
- No quality verification of cached responses
- Doesn't consider the risk of serving stale/wrong cached answers

---

**Interviewer Evaluation Signal**

Cost engineering creativity. Semantic caching is innovative but risky — the candidate should balance cost savings with quality guarantees. The invalidation strategy and similarity threshold tuning are the hard parts.

---

## Q-03-S-004: Design a real-time LLM observability platform that tracks quality, cost, and performance across all LLM calls.

**Module:** LLM Engineering
**Submodule:** Observability
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** DevOps / SRE → AIOps, Senior / Architect
**Tags:** [system-design, observability, monitoring, tracing, llm-engineering]
**Prerequisites:** Q-03-A-012, Q-03-S-002
**Estimated Interview Round:** System Design
**Why This Question Matters:** LLM systems are opaque — you can't understand what's happening in production without comprehensive observability. Traditional APM tools don't capture LLM-specific signals (token usage, prompt versions, quality scores).

---

**Question**

Design an observability platform for a company running 50 LLM-powered features across 10 services. It needs to track cost, quality, latency, and debug individual request failures.

---

**Expected Answer (Short)**

Four pillars: (1) Metrics: real-time dashboards with token usage, cost, latency, error rate, quality scores per feature/model/endpoint. (2) Traces: distributed tracing with LLM-specific spans (prompt construction, model call, post-processing, tool calls). (3) Logs: structured logs of every LLM call (input, output, tokens, model, duration, cost). (4) Evaluations: continuous quality scoring integrated into traces. Architecture: lightweight SDK that wraps LLM calls → async export to central platform → dashboards + alerts.

---

**Deep Answer**

- **SDK (minimal overhead):**
  ```python
  class LLMObserver:
      def wrap(self, llm_call):
          """Wraps any LLM call with observability."""
          span = self.start_span("llm_call")
          span.set_attributes({
              "llm.model": llm_call.model,
              "llm.prompt_template": llm_call.template_id,
              "llm.prompt_version": llm_call.template_version,
              "llm.feature": llm_call.feature_name,
          })
          
          start = time.time()
          response = llm_call.execute()
          duration = time.time() - start
          
          span.set_attributes({
              "llm.input_tokens": response.usage.prompt_tokens,
              "llm.output_tokens": response.usage.completion_tokens,
              "llm.cost_usd": self.calculate_cost(response),
              "llm.duration_ms": duration * 1000,
              "llm.ttft_ms": response.ttft_ms,
          })
          
          # Async: log full request/response for debugging
          self.log_async({
              "input": llm_call.messages,
              "output": response.content,
              "metadata": span.attributes
          })
          
          span.end()
          return response
  ```

- **Dashboard views:**
  | Dashboard | Metrics |
  |-----------|---------|
  | Cost Overview | Daily cost by feature, model, team. Cost trend. Budget vs actual. |
  | Performance | TTFT p50/p95/p99, throughput. Per-model, per-feature. |
  | Quality | LLM-judge scores, error rate, format compliance. Trend over time. |
  | Request Explorer | Individual request details: input, output, tokens, cost, duration. |
  | Anomaly | Automated anomaly detection on all metrics. |

- **Distributed tracing for LLM chains:**
  ```
  [User Request] ─── 120ms ──────────────────────────────────────────────
    ├── [Prompt Construction] ─── 5ms ───
    ├── [Cache Check] ─── 2ms ──
    ├── [LLM Call: GPT-4o] ─── 1500ms ──────────────────────────────────
    │     ├── TTFT: 200ms
    │     ├── Generation: 1300ms (250 tokens)
    │     ├── Input tokens: 1500
    │     └── Cost: $0.023
    ├── [Tool Call: search_knowledge_base] ─── 50ms ──
    ├── [LLM Call: GPT-4o] ─── 800ms ─────────────────
    │     └── Cost: $0.012
    ├── [Output Validation] ─── 3ms ──
    └── [Response] ─── Total: 2380ms, Cost: $0.035
  ```

---

**Follow-up Questions**

1. How do you handle PII in logged prompts and responses?
2. What's the storage and cost of logging every LLM call for a high-volume service?
3. How do you correlate LLM quality issues with downstream business metrics?

---

**Common Weak Answers / Red Flags**

- "Use standard APM tools" — miss LLM-specific metrics
- No tracing (can't debug individual request failures)
- No cost tracking (the most common complaint from leadership)
- Logging full prompts without PII handling

---

**Interviewer Evaluation Signal**

Production LLM operations maturity. Comprehensive observability with cost, quality, and performance tracking shows the candidate has operated LLM systems at scale.

---

## Q-03-S-005: Design a multi-tenant LLM platform where each tenant can deploy custom fine-tuned models with isolation and fair resource sharing.

**Module:** LLM Engineering
**Submodule:** Multi-Tenancy
**Level:** System
**Difficulty:** 5
**Experience Bands:** Architect
**Persona Relevance:** Senior / Architect
**Tags:** [system-design, multi-tenant, fine-tuning, isolation, resource-sharing, llm-engineering]
**Prerequisites:** Q-03-S-001, Q-02-S-005
**Estimated Interview Round:** System Design
**Why This Question Matters:** Multi-tenant LLM platforms (like what AI startups and enterprises need internally) have unique challenges: model isolation, GPU scheduling for heterogeneous models, fair sharing, and cost attribution.

---

**Question**

Design a platform where 50 internal teams can each deploy their own fine-tuned LoRA adapters on shared base models. Each team has different usage patterns and quality requirements.

---

**Expected Answer (Short)**

Architecture: shared base model instances (Llama 3 70B) with per-tenant LoRA adapters hot-swapped at inference time. Tenant isolation through: (1) API key authentication with rate limits per tenant. (2) LoRA adapter registry with version management per tenant. (3) GPU pool with fair-share scheduling (weighted by team priority). (4) Cost attribution: track per-tenant token usage. (5) Quality isolation: per-tenant eval dashboards. Model serving: vLLM/SGLang with multi-LoRA support — serve multiple adapters on one base model instance.

---

**Deep Answer**

- **Key insight: shared base model, per-tenant LoRA adapters.**
  Instead of deploying 50 separate model instances, deploy shared base models and dynamically load the appropriate LoRA adapter per request. LoRA adapter size: 10-100MB vs 140GB for base model.

- **Architecture:**
  ```
  Tenant Request (with API key + adapter version)
       ↓
  API Gateway (auth, rate limit, routing)
       ↓
  Model Router (select base model + adapter)
       ↓
  GPU Pool (vLLM with multi-LoRA)
       ↓
  Response → Cost attribution → Metrics per tenant
  ```

- **Multi-LoRA serving:**
  ```bash
  # vLLM multi-LoRA configuration
  python -m vllm.entrypoints.openai.api_server \
    --model meta-llama/Meta-Llama-3-70B-Instruct \
    --enable-lora \
    --lora-modules team_a=/adapters/team_a/v3 \
                   team_b=/adapters/team_b/v7 \
                   team_c=/adapters/team_c/v2
  ```

- **Tenant isolation:**
  | Layer | Mechanism |
  |-------|-----------|
  | Authentication | API key per tenant |
  | Rate limiting | RPM/TPM limits per tenant, with burst allowance |
  | Resource quota | GPU-hours budget per tenant per month |
  | Data isolation | Adapters stored in tenant-scoped storage (no cross-access) |
  | Quality | Per-tenant eval dashboards and alerts |

- **Fair scheduling:**
  ```python
  class FairScheduler:
      def schedule(self, request):
          tenant = request.tenant_id
          
          # Check quota
          if self.usage[tenant].monthly_tokens > self.quota[tenant].monthly_limit:
              return QueuedResponse(reason="quota_exceeded")
          
          # Weighted fair queue
          # Priority = base_priority × (1 - utilization_ratio)
          priority = (self.tenant_priority[tenant] * 
                     (1 - self.usage[tenant].current_utilization))
          
          queue.push(request, priority=priority)
  ```

---

**Follow-up Questions**

1. Team A's adapter works great but Team B's degrades the base model. How do you isolate this?
2. Hot-swapping LoRA adapters adds latency. How much and how do you minimize it?
3. A team deploys a malicious adapter that extracts training data. How do you prevent this?

---

**Common Weak Answers / Red Flags**

- "Deploy separate model instances per team" — 50 × 140GB = impractical
- No per-tenant cost tracking
- Doesn't know about multi-LoRA serving
- No resource fairness mechanism

---

**Interviewer Evaluation Signal**

Platform-level thinking. Multi-tenant LLM platforms are a real architecture challenge. The shared base model + per-tenant LoRA approach is the industry solution. Understanding GPU scheduling and fair sharing shows staff+ engineering capability.

---

## Q-03-S-006: Design a system for A/B testing LLM model versions and prompt changes in production.

**Module:** LLM Engineering
**Submodule:** Experimentation
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** ML / Data Engineer, Senior / Architect
**Tags:** [system-design, ab-testing, experimentation, production, llm-engineering]
**Prerequisites:** Q-03-A-009, Q-03-S-002
**Estimated Interview Round:** System Design
**Why This Question Matters:** LLM systems need to iterate rapidly on models and prompts. Without proper A/B testing, you're deploying changes without evidence — and LLM regressions can be subtle and costly.

---

**Question**

Design an A/B testing system for your LLM platform that supports: testing new model versions, prompt changes, parameter tuning, and LoRA adapter versions. Must be statistically rigorous.

---

**Expected Answer (Short)**

Architecture: (1) Experiment configuration: define variants (control/treatment), traffic split, metrics, and duration. (2) Traffic router: consistently assign users to variants (hash-based, sticky assignment). (3) Metric collection: per-variant quality scores (LLM-judge), latency, cost, user behavior. (4) Statistical analysis: sequential testing with early stopping, control for multiple comparisons. (5) Guardrails: automatic rollback if treatment variant causes safety or quality regression. (6) Integration: works with model router, observability platform, and quality monitoring.

---

**Deep Answer**

- **Experiment definition:**
  ```yaml
  experiment:
    name: "gpt4o-vs-claude-for-support"
    variants:
      control:
        model: "gpt-4o-2025-02-01"
        prompt_version: "v7"
        traffic: 50%
      treatment:
        model: "claude-3.5-sonnet-20250115"
        prompt_version: "v7-claude"
        traffic: 50%
    metrics:
      primary: "resolution_rate"
      secondary: ["helpfulness_score", "latency_p50", "cost_per_request"]
    guardrails:
      max_error_rate_increase: 5%
      min_quality_score: 0.80
    duration: "7_days"
    min_sample_size: 5000
  ```

- **Consistent assignment:**
  ```python
  def get_variant(user_id, experiment_id):
      # Hash-based: same user always sees same variant
      hash_val = hashlib.md5(f"{user_id}:{experiment_id}".encode()).hexdigest()
      bucket = int(hash_val[:8], 16) % 100
      
      if bucket < experiment.control_traffic:
          return "control"
      return "treatment"
  ```

- **Statistical rigor:**
  - Minimum sample size calculation before experiment starts
  - Sequential testing with spending function (α-spending) for early stopping
  - Bonferroni correction for multiple metrics
  - Pre-registered primary metric (avoid metric shopping)
  - Effect size estimation: detectable difference given sample size

- **Guardrail system:**
  ```python
  class ExperimentGuardrail:
      def check(self, experiment):
          treatment_metrics = get_metrics(experiment, "treatment")
          
          # Safety check: error rate
          if treatment_metrics.error_rate > control_metrics.error_rate * 1.05:
              self.rollback(experiment, reason="error_rate_exceeded")
              
          # Quality check: min quality score
          if treatment_metrics.quality_score < 0.80:
              self.rollback(experiment, reason="quality_below_minimum")
  ```

---

**Follow-up Questions**

1. How do you handle experiments that change conversation quality over multiple turns (not just one response)?
2. What's the minimum experiment duration and why?
3. Two experiments running simultaneously interact with each other. How do you handle this?

---

**Common Weak Answers / Red Flags**

- "Deploy to 50% of users and check metrics after a week" — no statistical rigor
- No consistent user assignment (users see different variants each request)
- No guardrails or automatic rollback
- No sample size calculation

---

**Interviewer Evaluation Signal**

Data-driven decision making. LLM changes are expensive to validate. Candidates who describe statistically rigorous A/B testing with guardrails show they can iterate safely in production.
