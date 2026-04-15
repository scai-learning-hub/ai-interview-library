# Module 06 — LLMOps: Debugging Level

---

## Q-06-D-001: Your LLM application's quality suddenly drops after an API model update you didn't initiate. How do you diagnose and recover?

**Module:** LLMOps
**Submodule:** Operations
**Level:** Debugging
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** DevOps / SRE → AIOps, Senior / Architect
**Tags:** [llmops, debugging, model-updates, regression, provider-dependency]
**Prerequisites:** Q-06-A-006, Q-06-A-008
**Estimated Interview Round:** Debugging, Deep Dive
**Why This Question Matters:** LLM providers update models without notice. Your system didn't change, but quality dropped. This is unique to LLMOps — your dependencies are live services that evolve independently.

---

**Question**

Monday morning, user complaints spike 3x. Your team made no changes. Investigation shows: your LLM provider silently updated the model version over the weekend. How do you diagnose the impact and recover?

---

**Expected Answer (Short)**

Immediate: (1) Check provider status page and changelog for model updates. (2) Run eval suite against current model → compare to last known good scores. (3) Identify which query types degraded (category-level analysis). Recovery: (4) If provider offers version pinning, pin to previous version. (5) If not, adjust prompts to work better with new model behavior. (6) Activate fallback provider if available. Prevention: (7) Pin model versions always. (8) Automated eval that runs daily and alerts on regression.

---

**Deep Answer**

```python
# Diagnosis workflow:
class ModelRegressionDiagnosis:
    def run(self):
        # Step 1: Compare eval scores
        current_scores = self.eval_suite.run(model="current")
        baseline_scores = self.eval_suite.load_baseline()
        
        delta = compare(current_scores, baseline_scores)
        # Output: correctness -8%, helpfulness -3%, safety +0%
        
        # Step 2: Category-level breakdown
        for category in self.test_categories:
            cat_scores = self.eval_suite.run(model="current", filter=category)
            cat_baseline = self.eval_suite.load_baseline(filter=category)
            # Identifies: "math reasoning" dropped 20%, "summarization" unchanged
        
        # Step 3: Example-level analysis
        failing_examples = self.find_regressions(current_scores, baseline_scores)
        # Cluster failing examples to find pattern
        patterns = self.cluster_failures(failing_examples)
        # Output: "Model now refuses to answer comparative questions"
        #         "Model now gives shorter answers missing detail"
```

- **Recovery options (priority order):**
  1. **Pin model version** — `model="gpt-4o-2024-08-06"` not `model="gpt-4o"` (should have been doing this)
  2. **Prompt adaptation** — if new model needs different prompting style, adapt
  3. **Provider fallback** — route to Anthropic while fixing OpenAI prompts
  4. **Cached responses** — serve cached responses for known query patterns
  5. **Human fallback** — escalate affected query types to human agents

- **Prevention:**
  - ALWAYS pin model versions in production
  - Daily automated eval (catches regression within 24 hours)
  - Multi-provider readiness (tested fallback prompts)
  - Provider changelog monitoring (automated alerts)

---

**Follow-up Questions**

1. You pin the model version but the provider is going to deprecate it in 30 days. What's your migration plan?
2. The new model is actually better overall but worse for 10% of queries. Do you pin the old version?
3. How do you build a test suite that catches model behavior changes proactively?

---

## Q-06-D-002: LLM costs spiked 5x overnight with no traffic increase. How do you investigate?

**Module:** LLMOps
**Submodule:** Cost Management
**Level:** Debugging
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** DevOps / SRE → AIOps, Senior / Architect
**Tags:** [llmops, debugging, cost, anomaly, tokens, investigation]
**Prerequisites:** Q-06-A-002, Q-06-C-005
**Estimated Interview Round:** Debugging, Technical
**Why This Question Matters:** Cost spikes are silent — no errors, no user complaints. Without cost monitoring, you might not notice until the invoice arrives. Fast diagnosis prevents burning thousands.

---

**Question**

Your daily LLM spend jumped from $500 to $2,500 overnight. Request count is roughly the same. What do you investigate?

---

**Expected Answer (Short)**

The cost increased per-request, not per-volume. Investigate: (1) **Token count per request** — did avg input or output tokens increase? (2) **Prompt change** — did someone deploy a longer system prompt or more RAG context? (3) **Model routing** — are requests being routed to a more expensive model? (4) **Conversation length** — are conversations longer (more history = more tokens)? (5) **Retry storms** — are requests failing and being retried (2x or 3x charges)? (6) **Cache miss** — did the cache get flushed (lost 40% cost savings)?

---

**Deep Answer**

```python
# Diagnosis queries:

# 1. Token breakdown over time
SELECT date, AVG(input_tokens), AVG(output_tokens), AVG(cost)
FROM llm_requests
WHERE date >= '2026-04-12'
GROUP BY date
# Found: avg_input_tokens jumped from 2000 to 8000

# 2. What changed in the input?
SELECT date, AVG(LENGTH(system_prompt)), AVG(LENGTH(context)), AVG(LENGTH(history))
FROM llm_requests
WHERE date >= '2026-04-12'
GROUP BY date
# Found: context length 4x'd — RAG pipeline now returns 20 chunks instead of 5

# 3. Root cause: RAG config change
# Someone changed retrieval top_k from 5 to 20 "for better quality"
# Each request now includes 15 extra document chunks = +6000 tokens
# At $2.50/1M input tokens × 10K requests × 6000 extra tokens = +$150/day wait...
# Actually at $2.50/1M: 10K × 6000 = 60M tokens × $2.50/1M = $150/day
# But the actual jump was $2000/day, so also check output tokens and model tier
```

- **Common root causes:**
  1. RAG retrieval returning more chunks (top_k increased)
  2. Conversation history not truncated (unlimited context accumulation)
  3. System prompt expanded (new instructions, more examples)
  4. Model tier changed (mini → standard in routing config)
  5. Cache invalidated (deployment flushed semantic cache)
  6. Retry logic triggered by partial outage (3x retries = 3x cost)

---

**Follow-up Questions**

1. The cost spike is caused by one power user generating 100-turn conversations. How do you handle?
2. You need to roll back the RAG change but it improved quality. How do you balance?
3. How do you set up alerts to catch cost spikes within 1 hour?

---

## Q-06-D-003: Your LLM responses are correct but users report they "feel different" after a deployment. No metrics show a problem. How do you investigate?

**Module:** LLMOps
**Submodule:** Quality
**Level:** Debugging
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** ML / Data Engineer, Senior / Architect
**Tags:** [llmops, debugging, quality, tone, subjective, user-experience]
**Prerequisites:** Q-06-A-005, Q-06-A-003
**Estimated Interview Round:** Debugging, Deep Dive
**Why This Question Matters:** Subtle quality changes — tone, verbosity, format — don't show up in correctness metrics but significantly affect user experience. This is one of the hardest LLMOps debugging scenarios.

---

**Question**

After deploying a new prompt version, users complain that the assistant "doesn't sound right" and "gives walls of text." Your correctness and helpfulness scores are unchanged. What's happening and how do you investigate?

---

**Expected Answer (Short)**

Correctness metrics are passing because the content is right — but style changed. Investigate: (1) Compare response length distributions (before/after). (2) Compare formatting patterns (bullet points vs paragraphs). (3) Compare tone markers (formal vs casual). (4) Run a pairwise A/B evaluation: "Which response style is preferred?" (5) Check the prompt diff — the change probably added instructions that changed output style without changing content. Fix: add explicit style/format instructions to the prompt ("Use bullet points, keep responses under 200 words").

---

**Deep Answer**

```python
# Style regression analysis:
class StyleAnalyzer:
    def compare_deployments(self, before_samples, after_samples):
        metrics = {}
        
        # Length distribution
        metrics["avg_length_before"] = np.mean([len(s) for s in before_samples])
        metrics["avg_length_after"] = np.mean([len(s) for s in after_samples])
        # Found: 150 words → 350 words (2.3x increase)
        
        # Format analysis
        metrics["bullet_point_rate_before"] = self.count_bullets(before_samples) / len(before_samples)
        metrics["bullet_point_rate_after"] = self.count_bullets(after_samples) / len(after_samples)
        # Found: 70% bullet points → 20% bullet points
        
        # Tone analysis (using LLM)
        for sample in after_samples[:50]:
            tone = llm.classify_tone(sample)  # formal, casual, technical, friendly
        # Found: Shifted from "casual-friendly" to "formal-technical"
        
        # Pairwise preference
        preferences = []
        for before, after in zip(before_samples, after_samples):
            pref = llm.pairwise_judge(
                "Which response would a user prefer?",
                response_a=before, response_b=after
            )
            preferences.append(pref)
        # Found: 72% prefer the "before" style
```

- **Root cause patterns:**
  - Prompt change added "be thorough" → model now over-explains
  - Removed few-shot examples that anchored the output style
  - Changed system prompt ordering → style instructions deprioritized
  - Model version change → different default verbosity

- **Prevention:** Add style metrics to eval suite (length, format, tone) alongside correctness. Style is a first-class quality dimension.

---

**Follow-up Questions**

1. Users in different regions prefer different styles. How do you handle?
2. How do you add "style" as a measurable eval dimension?
3. The new prompt is more correct but less preferred. Which matters more?

---

## Q-06-D-004: Your LLM observability shows gaps — certain requests have no traces. How do you find the silent failures?

**Module:** LLMOps
**Submodule:** Observability
**Level:** Debugging
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** DevOps / SRE → AIOps, Software Dev → AI Engineer
**Tags:** [llmops, debugging, observability, silent-failures, gaps, monitoring]
**Prerequisites:** Q-06-C-002, Q-05-S-004
**Estimated Interview Round:** Debugging, Technical
**Why This Question Matters:** If your observability has gaps, you don't know what you don't know. Silent failures — requests that fail without being logged — are the most dangerous because they're invisible.

---

**Question**

Your dashboard shows 9,500 requests/day logged, but your load balancer shows 10,000 requests/day. 500 requests have no traces. Where are they going?

---

**Expected Answer (Short)**

The 500 missing requests are failing before they reach the logging layer. Investigation: (1) Check request pipeline order — is logging after authentication? (auth failures would be unlogged). (2) Check for timeouts — requests timing out before response is logged. (3) Check error handling — exceptions that skip the logging middleware. (4) Check async logging — if logging is async, are messages being dropped under load? (5) Check sampling — is logging accidentally sampling instead of capturing 100%?

---

**Deep Answer**

```python
# Diagnosis: Where in the pipeline do requests disappear?

# Request lifecycle:
# Load Balancer → Auth → Rate Limiter → Gateway → LLM API → Response → Logger
#    10,000       9,800    9,700         9,600      9,500     9,500    9,500

# Gap analysis:
# Auth layer: 200 rejected (invalid API keys) — NOT LOGGED ← Bug!
# Rate limiter: 100 rejected (429) — NOT LOGGED ← Bug!  
# Gateway timeout: 100 timed out before LLM responded — NOT LOGGED ← Bug!
# LLM API: 100 server errors (retried successfully) — logged as 1 request, not 2

# Fix: Log at EVERY decision point
class ObservableGateway:
    async def handle(self, request):
        trace = self.start_trace(request)  # Log entry point FIRST
        
        try:
            auth_result = self.authenticate(request)
            trace.add_span("auth", result=auth_result)
            if not auth_result.valid:
                trace.set_status("auth_failed")
                return  # Now logged!
            
            rate_check = self.rate_limiter.check(request)
            trace.add_span("rate_limit", result=rate_check)
            if not rate_check.allowed:
                trace.set_status("rate_limited")
                return  # Now logged!
            
            response = await self.call_llm(request)
            trace.add_span("llm_call", result=response)
            
        except TimeoutError:
            trace.set_status("timeout")  # Now logged!
        except Exception as e:
            trace.set_status("error", error=str(e))  # Now logged!
        finally:
            trace.end()  # Always finalize trace
```

- **Key principle:** Log at the entry point, not the exit point. If you only log successful completions, you miss everything that fails.

---

**Follow-up Questions**

1. You find 200 auth failures per day. Are these attacks or configuration errors? How do you tell?
2. Logging everything adds 50ms latency. How do you optimize?
3. Some missing requests are due to client-side errors (browser crash before response). Can you detect these?

---

## Q-06-D-005: Your LLM evaluation scores are high but production user satisfaction is low. What's wrong with your evals?

**Module:** LLMOps  
**Submodule:** Evaluation
**Level:** Debugging
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** ML / Data Engineer, Senior / Architect
**Tags:** [llmops, debugging, evaluation, metrics, gap, user-satisfaction]
**Prerequisites:** Q-06-A-005, Q-06-A-003
**Estimated Interview Round:** Debugging, Deep Dive
**Why This Question Matters:** The eval-production gap is the most common and dangerous LLMOps problem. If your evals don't predict production quality, every decision based on evals is unreliable.

---

**Question**

Your eval suite shows 4.3/5 quality score. Production NPS is 35 (mediocre). Users say the bot "doesn't understand what I'm asking" and "gives generic answers." Your evals test factual correctness and helpfulness. What's the gap?

---

**Expected Answer (Short)**

Eval-production gap causes: (1) **Eval queries too clean** — test set has polished questions, production has messy, ambiguous ones. (2) **Missing eval dimensions** — testing correctness but not relevance, specificity, or conversational quality. (3) **Single-turn eval, multi-turn production** — bot loses context across turns. (4) **Judge bias** — LLM judge rates differently than users (prefers verbose, formal answers). (5) **Distribution mismatch** — test set doesn't represent actual query distribution.

---

**Deep Answer**

```python
# Diagnosis steps:
# 1. Sample 100 low-satisfaction production conversations
# 2. Run them through eval → they score 4.2/5 (high!)
# 3. Human review finds:
#    - Answers are "correct" but don't address the user's ACTUAL intent
#    - Bot gives textbook answers when user wants specific guidance
#    - Bot doesn't ask clarifying questions for ambiguous queries
#    - Multi-turn context is lost

# Gap: "Correctness" ≠ "User satisfaction"

# Fix: Add missing eval dimensions
new_eval_criteria = {
    "intent_understanding": "Does the response address what the user actually wants (not just the literal question)?",
    "specificity": "Is the response specific to the user's situation or generic?",
    "conversational_quality": "Does it feel like a natural conversation or a textbook?",
    "clarification_behavior": "When the query is ambiguous, does it ask for clarification?",
    "context_continuity": "In multi-turn, does it remember and build on previous context?",
}

# Fix: Use production queries in eval set
# Sample real queries weekly, label with user satisfaction
# Replace 50% of eval set with production samples
# Test multi-turn conversations, not just single queries
```

---

**Follow-up Questions**

1. How do you build an eval that predicts user satisfaction accurately?
2. Different user segments have different satisfaction levels. How do you eval per segment?
3. Your improved eval now shows 3.5/5. Stakeholders are alarmed. How do you explain the "regression"?

---
