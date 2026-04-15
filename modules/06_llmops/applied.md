# Module 06 — LLMOps: Applied Level

---

## Q-06-A-001: Design a prompt CI/CD pipeline that tests prompt changes before they reach production.

**Module:** LLMOps
**Submodule:** Prompt Management
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer, DevOps / SRE → AIOps
**Tags:** [llmops, ci-cd, prompt-management, testing, evaluation, deployment]
**Prerequisites:** Q-06-C-003, Q-06-C-004
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** Prompt changes are the most frequent changes in LLM systems and the most common cause of quality regressions. A CI/CD pipeline prevents broken prompts from reaching users.

---

**Question**

Design a CI/CD pipeline for prompt changes. A developer edits a prompt — what happens between the edit and production deployment?

---

**Expected Answer (Short)**

Pipeline: (1) **PR with prompt diff** — visible change, reviewed by team. (2) **Automated eval suite** — run eval on 100+ test cases, compare scores to baseline. (3) **Regression check** — flag if any metric drops >2% from current production version. (4) **Cost estimation** — estimate token/cost impact of the change. (5) **Staging deploy** — test with real traffic shadow. (6) **Canary deploy** — 5% production traffic. (7) **Full rollout** — with automatic rollback trigger.

---

**Deep Answer**

```yaml
# .github/workflows/prompt-ci.yml
name: Prompt CI/CD
on:
  pull_request:
    paths: ['prompts/**']

jobs:
  eval:
    steps:
      - name: Run eval suite
        run: |
          python eval/run_evals.py \
            --prompt-version ${{ github.sha }} \
            --test-set eval/golden_set.jsonl \
            --judges correctness,helpfulness,safety \
            --baseline production

      - name: Check regression
        run: |
          python eval/check_regression.py \
            --threshold 0.02 \
            --metrics correctness,helpfulness

      - name: Estimate cost impact  
        run: |
          python eval/estimate_cost.py \
            --old-prompt prompts/current.txt \
            --new-prompt prompts/proposed.txt \
            --sample-requests 1000

      - name: Post results to PR
        run: |
          python eval/post_results.py  # Comment with eval table on PR
```

```
Pipeline stages:
1. PR opened → eval suite runs (3-5 min)
2. Results posted as PR comment:
   ┌────────────┬──────────┬──────────┬────────┐
   │ Metric     │ Current  │ Proposed │ Delta  │
   ├────────────┼──────────┼──────────┼────────┤
   │ Correctness│ 0.91     │ 0.93     │ +2.2%  │
   │ Helpfulness│ 0.87     │ 0.88     │ +1.1%  │
   │ Safety     │ 0.99     │ 0.99     │ +0.0%  │
   │ Avg tokens │ 450      │ 520      │ +15.5% │
   │ Est. cost  │ $4.2K/mo │ $4.8K/mo │ +14.3% │
   └────────────┴──────────┴──────────┴────────┘
3. Human review → merge
4. Auto-deploy to staging
5. Canary (5%) → monitor 2 hours → full rollout
```

---

**Follow-up Questions**

1. Evals pass but production quality drops. What's wrong with your eval set?
2. How do you handle prompt changes that are correct but more expensive?
3. How fast should the eval pipeline run? What's the trade-off with thoroughness?

---

## Q-06-A-002: Implement a cost tracking and attribution system for a multi-team LLM platform.

**Module:** LLMOps
**Submodule:** Cost Management
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** DevOps / SRE → AIOps, Senior / Architect
**Tags:** [llmops, cost, attribution, monitoring, multi-team]
**Prerequisites:** Q-06-C-005, Q-06-C-006
**Estimated Interview Round:** Technical
**Why This Question Matters:** Without cost attribution, LLM spend is a shared cost that no team owns — and nobody optimizes. Per-team visibility drives responsible usage.

---

**Question**

You manage an LLM platform used by 5 internal teams. Total spend is $30K/month but nobody knows which team or feature drives the cost. Design the solution.

---

**Expected Answer (Short)**

Implementation: (1) **Tag every request** with team_id, feature_id, user_id at the gateway level. (2) **Track per request:** model, input_tokens, output_tokens, cost, latency. (3) **Aggregate dashboards:** cost by team, by feature, by model, by day. (4) **Alerts:** per-team budget thresholds, anomaly detection on daily spend. (5) **Chargeback or showback:** monthly reports per team for internal billing.

---

**Deep Answer**

```python
class CostTracker:
    def track_request(self, request_metadata, response):
        record = {
            "timestamp": now(),
            "team_id": request_metadata["team_id"],
            "feature_id": request_metadata["feature_id"],
            "model": request_metadata["model"],
            "input_tokens": response.usage.prompt_tokens,
            "output_tokens": response.usage.completion_tokens,
            "cost": self.calculate_cost(
                model=request_metadata["model"],
                input_tokens=response.usage.prompt_tokens,
                output_tokens=response.usage.completion_tokens
            ),
            "latency_ms": response.latency,
            "cached": response.from_cache,
        }
        self.store.append(record)
        
        # Real-time budget check
        team_spend = self.get_daily_spend(request_metadata["team_id"])
        if team_spend > self.budgets[request_metadata["team_id"]].daily_limit:
            self.alert(f"Team {request_metadata['team_id']} exceeded daily budget")

# Dashboard queries:
# SELECT team_id, SUM(cost) FROM llm_requests GROUP BY team_id WHERE date = today()
# SELECT feature_id, AVG(input_tokens), AVG(cost) GROUP BY feature_id
# SELECT model, COUNT(*), SUM(cost) GROUP BY model
```

---

**Follow-up Questions**

1. One team's cost suddenly spikes 5x. How do you investigate without reading their prompts?
2. A team argues their high cost is justified because they use GPT-4o for critical tasks. How do you validate?
3. How do you incentivize teams to optimize cost without degrading quality?

---

## Q-06-A-003: Design an A/B testing framework for LLM-powered features.

**Module:** LLMOps
**Submodule:** Evaluation
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Senior / Architect
**Tags:** [llmops, ab-testing, evaluation, deployment, metrics]
**Prerequisites:** Q-06-C-003, Q-06-C-004
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** LLM A/B testing is harder than web A/B testing because outputs are non-deterministic and quality is subjective. You need specialized tooling and metrics.

---

**Question**

You want to A/B test two prompt variants for a customer support chatbot. Design the experiment — traffic split, metrics, duration, and statistical considerations.

---

**Expected Answer (Short)**

Design: (1) **Traffic split:** 50/50 by user_id hash (session-sticky). (2) **Metrics:** primary = user satisfaction (thumbs up/down), secondary = task completion rate, escalation rate, avg response time, tokens per conversation. (3) **Duration:** enough for statistical significance (~1000 conversations per variant, typically 1-2 weeks). (4) **Guardrails:** if safety metrics degrade >1%, auto-kill variant. (5) **Analysis:** non-determinism means higher variance → need more samples than traditional A/B tests.

---

**Deep Answer**

```python
class LLMABTest:
    def __init__(self, control_prompt, variant_prompt, config):
        self.variants = {"control": control_prompt, "variant": variant_prompt}
        self.config = config
        self.results = {"control": [], "variant": []}
    
    def assign_variant(self, user_id):
        # Consistent hashing — same user always gets same variant
        bucket = hash(f"{self.config.test_id}:{user_id}") % 100
        return "variant" if bucket < self.config.traffic_pct else "control"
    
    def record_outcome(self, variant, metrics):
        self.results[variant].append(metrics)
    
    def analyze(self):
        for metric_name in self.config.metrics:
            control_values = [r[metric_name] for r in self.results["control"]]
            variant_values = [r[metric_name] for r in self.results["variant"]]
            
            # Statistical test
            stat, p_value = mannwhitneyu(control_values, variant_values)
            effect_size = np.mean(variant_values) - np.mean(control_values)
            
            print(f"{metric_name}: effect={effect_size:+.3f}, p={p_value:.4f}")

# Guardrail metrics (auto-kill if violated):
guardrails = {
    "safety_violations_per_100": {"threshold": 1, "direction": "below"},
    "escalation_rate": {"threshold": 0.30, "direction": "below"},
    "avg_response_time_ms": {"threshold": 10000, "direction": "below"},
}
```

- **LLM-specific challenges:**
  - **Higher variance** — same query gets different responses → need more samples
  - **Interaction effects** — multi-turn conversations where variant affects future user behavior
  - **Metric lag** — user satisfaction may take days to converge (users try both variants over time)

---

**Follow-up Questions**

1. The variant is better on satisfaction but worse on cost. How do you decide?
2. 20% of users hate the variant but 80% love it. The average looks good. Should you deploy?
3. How do you A/B test when you have 10 prompt variants to compare?

---

## Q-06-A-004: Build a semantic caching layer that reduces LLM API costs by 30-40%.

**Module:** LLMOps
**Submodule:** Cost Optimization
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer, DevOps / SRE → AIOps
**Tags:** [llmops, caching, cost-optimization, semantic-similarity, embeddings]
**Prerequisites:** Q-06-C-005, Q-06-C-006, Q-04-C-002
**Estimated Interview Round:** Technical
**Why This Question Matters:** Exact-match caching captures only ~5% of requests. Semantic caching catches paraphrased queries ("What's the return policy?" ≈ "How do I return something?") and can reduce costs 30-40%.

---

**Question**

Implement a semantic caching layer that serves cached responses for semantically similar (not just exact-match) queries. How do you handle cache validity and quality?

---

**Expected Answer (Short)**

Implementation: (1) Embed the incoming query. (2) Search cache by cosine similarity to stored query embeddings. (3) If similarity > threshold (e.g., 0.95), return cached response. (4) If below threshold, call LLM and cache the new result. Key concerns: threshold tuning (too low = wrong cache hits, too high = no hits), TTL for freshness, context-aware caching (same query + different context = different answer).

---

**Deep Answer**

```python
class SemanticCache:
    def __init__(self, embedding_model, vector_store, similarity_threshold=0.95):
        self.embedder = embedding_model
        self.store = vector_store
        self.threshold = similarity_threshold
    
    async def get_or_call(self, query, context, llm_fn):
        # Create cache key from query + relevant context
        cache_input = f"{query}\n---\n{hash(context)}"
        query_embedding = self.embedder.encode(cache_input)
        
        # Search for similar cached queries
        results = self.store.search(query_embedding, top_k=1)
        
        if results and results[0].score >= self.threshold:
            # Cache hit
            self.metrics.record("cache_hit")
            return results[0].metadata["response"]
        
        # Cache miss — call LLM
        response = await llm_fn(query, context)
        
        # Store in cache
        self.store.upsert(
            embedding=query_embedding,
            metadata={
                "query": query,
                "context_hash": hash(context),
                "response": response,
                "created_at": now(),
                "ttl": timedelta(hours=24)
            }
        )
        self.metrics.record("cache_miss")
        return response
```

- **Cache invalidation triggers:**
  - Prompt version change → flush all cached responses
  - Source data update → flush related entries (by metadata tag)
  - TTL expiry → age-based freshness
  - User feedback "bad response" → evict that specific entry

- **Context-aware caching:** Same question + different user → might need different answer. Cache key must include relevant context dimensions: user role, conversation state, retrieved documents hash.

---

**Follow-up Questions**

1. Your cache hit rate is 50% but 5% of cache hits return wrong answers. How do you tune?
2. How do you warm the cache for a new deployment?
3. Semantic caching for streaming responses — how does that work?

---

## Q-06-A-005: Implement an LLM-as-judge evaluation pipeline for automated quality monitoring.

**Module:** LLMOps
**Submodule:** Evaluation
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [llmops, evaluation, llm-as-judge, quality, monitoring, automation]
**Prerequisites:** Q-06-C-003, Q-03-A-006
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** Human evaluation doesn't scale. LLM-as-judge enables automated quality monitoring at every prompt change and on production traffic — catching regressions before users complain.

---

**Question**

Build an automated evaluation pipeline using LLM-as-judge. How do you design judge prompts, calibrate them, and handle disagreements with human judgment?

---

**Expected Answer (Short)**

Pipeline: (1) Define evaluation criteria (correctness, helpfulness, safety) with rubrics. (2) Design judge prompt with clear scoring rubric and examples (few-shot). (3) Run judge on test set → produce scores. (4) Calibrate: compare judge scores vs human annotations on 100+ samples → measure correlation. (5) If correlation > 0.8, use automatically; if < 0.8, adjust rubric. (6) In production: sample N% of traffic → auto-judge → alert on regression.

---

**Deep Answer**

```python
JUDGE_PROMPT = """You are evaluating an AI assistant's response quality.

## Scoring Rubric

### Correctness (1-5)
1: Factually wrong, contradicts the source
2: Mostly wrong with some correct elements
3: Partially correct but missing key information
4: Mostly correct with minor omissions
5: Fully correct and accurate

### Helpfulness (1-5)
1: Does not address the user's question at all
2: Tangentially related but not helpful
3: Somewhat helpful but incomplete
4: Helpful and mostly complete
5: Exceptionally helpful, complete, and actionable

## Input
Question: {question}
Reference Answer: {reference}
AI Response: {response}

## Output (JSON)
{{"correctness": <1-5>, "helpfulness": <1-5>, "reasoning": "<brief explanation>"}}"""

class EvalPipeline:
    def __init__(self, judge_model="gpt-4o", calibration_threshold=0.8):
        self.judge = judge_model
        self.threshold = calibration_threshold
    
    def evaluate_batch(self, test_cases):
        results = []
        for case in test_cases:
            scores = self.judge_single(case)
            results.append(scores)
        return self.aggregate(results)
    
    def calibrate(self, human_annotations):
        """Compare judge scores to human scores."""
        judge_scores = self.evaluate_batch(human_annotations)
        correlation = spearmanr(
            [j.correctness for j in judge_scores],
            [h.correctness for h in human_annotations]
        )
        if correlation < self.threshold:
            print(f"WARNING: Judge correlation {correlation:.2f} below threshold")
            self.show_disagreements(judge_scores, human_annotations)
        return correlation
```

- **Reducing judge bias:**
  - Position bias: randomize order in pairwise comparisons
  - Verbosity bias: judges prefer longer answers → add "conciseness is valued" to rubric
  - Self-bias: don't use the same model as judge and generator
  - Calibration: periodic human-judge agreement checks

---

**Follow-up Questions**

1. Your judge gives 4.5/5 average but users give 3/5 satisfaction. What explains the gap?
2. How do you evaluate the evaluator? (Meta-evaluation)
3. Running judges on 100% of production traffic costs $5K/month. How do you optimize?

---

## Q-06-A-006: How do you implement safe rollback for LLM system changes?

**Module:** LLMOps
**Submodule:** Deployment
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** DevOps / SRE → AIOps, Software Dev → AI Engineer
**Tags:** [llmops, rollback, deployment, safety, operations]
**Prerequisites:** Q-06-C-004, Q-06-A-001
**Estimated Interview Round:** Technical
**Why This Question Matters:** LLM systems have multiple independently changing components (prompts, models, tools, guardrails). Rolling back one without the others can cause incompatible states. Safe rollback is non-trivial.

---

**Question**

You deployed a new prompt version and model upgrade simultaneously. Quality drops. How do you rollback safely when multiple components changed?

---

**Expected Answer (Short)**

Rule 1: Never change multiple components simultaneously. If you must: (1) Version the entire configuration as a bundle (prompt + model + tools + guardrails = deployment version). (2) Rollback the entire bundle, not individual pieces. (3) Immutable deployments — old version still exists and can be activated. (4) Feature flags to control which version serves traffic. (5) Post-rollback: deploy each change separately to isolate which one caused the regression.

---

**Deep Answer**

```python
@dataclass
class DeploymentBundle:
    version: str
    prompt_version: str
    model_version: str
    tool_versions: dict[str, str]
    guardrail_version: str
    eval_results: dict
    config_hash: str  # Hash of all components for integrity check

class Deployer:
    def deploy(self, bundle: DeploymentBundle, strategy="canary"):
        # Store as immutable artifact
        self.artifact_store.save(bundle)
        
        if strategy == "canary":
            self.traffic_manager.route(
                bundle.version, percentage=5, duration_minutes=120
            )
            # Auto-rollback if metrics degrade
            self.monitor.watch(
                bundle.version,
                rollback_trigger={"quality_score < 0.85", "error_rate > 5%"},
                rollback_to=self.get_current_production_version()
            )
    
    def rollback(self, to_version: str):
        bundle = self.artifact_store.load(to_version)
        # Atomic switch — all components change together
        self.traffic_manager.route(to_version, percentage=100)
        self.notify(f"Rolled back to {to_version}")
```

- **Key principle:** Atomic deploys and atomic rollbacks. The system is always running a consistent, tested bundle — never a mix of old and new components.

---

**Follow-up Questions**

1. The rollback fixed quality but reintroduced a bug the new version fixed. What now?
2. How do you handle rollback for stateful systems (conversations in progress)?
3. Your model provider deprecated the model version you're rolling back to. What's your fallback?

---

## Q-06-A-007: How do you implement rate limiting and fair queuing for a shared LLM platform?

**Module:** LLMOps
**Submodule:** Infrastructure
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** DevOps / SRE → AIOps, Software Dev → AI Engineer
**Tags:** [llmops, rate-limiting, fairness, multi-tenant, infrastructure]
**Prerequisites:** Q-06-C-006
**Estimated Interview Round:** Technical
**Why This Question Matters:** Without rate limiting, one team's batch job can consume all LLM capacity, starving interactive user-facing services. Fair queuing ensures critical requests get priority.

---

**Question**

Your LLM gateway serves 5 teams: 2 run user-facing chatbots (latency-sensitive) and 3 run batch analysis (throughput-sensitive). How do you implement fair access?

---

**Expected Answer (Short)**

Priority queuing: (1) **Priority tiers** — real-time (P0, <2s SLA) > interactive (P1, <10s) > batch (P2, best effort). (2) **Per-team rate limits** — token budget per minute. (3) **Weighted fair queuing** — P0 requests preempt P2 in queue. (4) **Token bucket algorithm** — smooth out burst traffic. (5) **Backpressure** — return 429 with retry-after header for batch; never reject real-time requests (queue instead).

---

**Deep Answer**

```python
class LLMRateLimiter:
    def __init__(self):
        self.team_budgets = {
            "chatbot_team_1": TokenBucket(rate=50_000, burst=100_000),  # tokens/min
            "chatbot_team_2": TokenBucket(rate=50_000, burst=100_000),
            "analytics_team": TokenBucket(rate=30_000, burst=50_000),
            "research_team": TokenBucket(rate=20_000, burst=30_000),
            "batch_team": TokenBucket(rate=10_000, burst=20_000),
        }
        self.priority_queue = PriorityQueue()  # P0 > P1 > P2
    
    async def process(self, request):
        team = request.metadata["team_id"]
        priority = request.metadata.get("priority", "P2")
        estimated_tokens = estimate_tokens(request)
        
        # Check team budget
        if not self.team_budgets[team].consume(estimated_tokens):
            if priority == "P0":
                # Never reject real-time — queue with high priority
                await self.priority_queue.put((0, request))
            else:
                return RateLimitResponse(retry_after=self.team_budgets[team].time_to_refill())
        
        # Queue by priority
        await self.priority_queue.put(({"P0": 0, "P1": 1, "P2": 2}[priority], request))
```

---

**Follow-up Questions**

1. A batch team needs to process 1M documents by end of day. How do you schedule without impacting real-time traffic?
2. A real-time team's traffic spikes 10x during peak hours. How does the limiter adapt?
3. How do you handle rate limiting when the upstream LLM provider also rate limits you?

---

## Q-06-A-008: How do you handle LLM provider outages and build multi-provider redundancy?

**Module:** LLMOps
**Submodule:** Reliability
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** DevOps / SRE → AIOps, Senior / Architect
**Tags:** [llmops, reliability, failover, multi-provider, resilience]
**Prerequisites:** Q-06-C-006, Q-06-A-006
**Estimated Interview Round:** Technical
**Why This Question Matters:** If your system depends on a single LLM provider and they go down (which happens), your entire product is down. Multi-provider resilience is a production requirement.

---

**Question**

Your product depends on OpenAI's API. It goes down for 2 hours during business hours. How do you design the system to handle this?

---

**Expected Answer (Short)**

Multi-provider architecture: (1) **Primary/fallback** — OpenAI primary, Anthropic fallback. (2) **Circuit breaker** — detect failure quickly (3 consecutive 5xx → circuit open). (3) **Failover routing** — redirect to fallback provider within seconds. (4) **Graceful degradation** — if all providers down, serve cached responses or simplified responses. (5) **Prompt compatibility** — maintain prompt variants tested on both providers. (6) **Automatic recovery** — circuit half-open after cooldown, test primary, restore if healthy.

---

**Deep Answer**

```python
class MultiProviderLLM:
    def __init__(self):
        self.providers = {
            "openai": OpenAIProvider(circuit_breaker=CircuitBreaker(threshold=3, timeout=60)),
            "anthropic": AnthropicProvider(circuit_breaker=CircuitBreaker(threshold=3, timeout=60)),
            "local": LocalModelProvider(),  # Last resort, lower quality
        }
        self.priority = ["openai", "anthropic", "local"]
        self.prompt_variants = {
            "openai": load_prompt("prompts/openai_v3.txt"),
            "anthropic": load_prompt("prompts/anthropic_v3.txt"),
            "local": load_prompt("prompts/local_v3.txt"),
        }
    
    async def call(self, messages, **kwargs):
        for provider_name in self.priority:
            provider = self.providers[provider_name]
            
            if provider.circuit_breaker.is_open:
                continue  # Skip failed provider
            
            try:
                # Use provider-specific prompt variant
                adapted_messages = self.adapt_prompt(messages, provider_name)
                response = await provider.call(adapted_messages, **kwargs)
                return response
            except ProviderError as e:
                provider.circuit_breaker.record_failure()
                continue
        
        # All providers failed — graceful degradation
        return self.fallback_response(messages)
```

- **Prompt compatibility challenge:** Different models behave differently with the same prompt. Maintain tested prompt variants per provider. Eval suite must pass on all configured providers.

---

**Follow-up Questions**

1. Anthropic's Claude gives subtly different quality than GPT-4o. Users notice. How do you handle?
2. How do you test failover without actually causing an outage?
3. Your local fallback model is 3x slower. How do you manage user expectations during failover?

---
