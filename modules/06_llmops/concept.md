# Module 06 — LLMOps: Concept Level

---

## Q-06-C-001: What is LLMOps and how does it differ from traditional MLOps?

**Module:** LLMOps
**Submodule:** Fundamentals
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Beginner, Early-career
**Persona Relevance:** Software Dev → AI Engineer, DevOps / SRE → AIOps
**Tags:** [llmops, mlops, deployment, operations, fundamentals]
**Prerequisites:** Q-00-C-001
**Estimated Interview Round:** Screening, Technical
**Why This Question Matters:** LLMOps is a distinct discipline. Teams that apply MLOps patterns blindly to LLM systems miss critical concerns around prompt management, cost, evaluation, and non-determinism.

---

**Question**

How does operating LLM systems (LLMOps) differ from traditional MLOps? What new concerns does it introduce?

---

**Expected Answer (Short)**

Key differences: (1) **No training loop in most cases** — prompt engineering replaces model training, so versioning shifts from model weights to prompts. (2) **Cost is proportional to usage** — every API call costs tokens, unlike static model serving. (3) **Non-deterministic outputs** — same input can produce different outputs, making testing harder. (4) **Evaluation is harder** — no simple accuracy metric; need LLM-as-judge, human eval. (5) **Latency is higher** — autoregressive generation = seconds per request. (6) **Context window management** — prompt engineering is a core operational concern.

---

**Deep Answer**

| Dimension | Traditional MLOps | LLMOps |
|-----------|------------------|--------|
| Model update | Retrain → redeploy | Change prompt / swap model version |
| Versioning | Model weights + data | Prompts + model version + tools + guardrails |
| Cost model | Fixed infrastructure | Per-token API costs (variable) |
| Evaluation | Accuracy, F1, AUC | LLM-as-judge, human eval, task completion |
| Testing | Deterministic unit tests | Non-deterministic output, fuzzy assertions |
| Latency | ms (inference) | seconds (autoregressive generation) |
| Observability | Predictions + metrics | Full prompt/response logging + traces |
| Data pipeline | Feature engineering | Context retrieval + prompt construction |
| Failure modes | Wrong predictions | Hallucination, harmful content, cost spikes |
| Rollback | Redeploy previous model | Revert prompt version + model API version |

- **New operational concerns:**
  - **Prompt versioning** — track every prompt change, A/B test prompt variants
  - **Cost attribution** — which team/feature is consuming how many tokens?
  - **Guardrail monitoring** — are safety filters triggering appropriately?
  - **Model provider dependency** — external API outages, deprecations, behavior changes
  - **Compliance logging** — regulations may require storing all LLM interactions

---

**Follow-up Questions**

1. Your LLM provider deprecates the model version you depend on in 30 days. How do you handle the migration?
2. How do you version a system that combines prompts, RAG retrieval, and tool definitions?
3. When do you still need traditional MLOps alongside LLMOps?

---

## Q-06-C-002: What are the key components of an LLM observability stack?

**Module:** LLMOps
**Submodule:** Observability
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Beginner, Early-career, Mid-level
**Persona Relevance:** DevOps / SRE → AIOps, Software Dev → AI Engineer
**Tags:** [llmops, observability, monitoring, logging, tracing]
**Prerequisites:** Q-06-C-001
**Estimated Interview Round:** Screening, Technical
**Why This Question Matters:** LLM systems are opaque. Without proper observability, you can't debug quality issues, track costs, or detect regressions. It's the difference between "the system feels slow" and "P95 latency spiked 3x after the last prompt change."

---

**Question**

What should an LLM observability stack capture that a traditional application monitoring stack doesn't?

---

**Expected Answer (Short)**

LLM-specific observability: (1) **Prompt/response logging** — full content (for debugging), redacted (for production). (2) **Token usage tracking** — input/output tokens per call, cost per request. (3) **Quality scores** — LLM-as-judge scores, user feedback (thumbs up/down). (4) **Latency breakdown** — time-to-first-token, total generation time, tool execution time. (5) **Trace chains** — multi-step LLM calls linked as a single trace (prompt chain, RAG pipeline, agent loops). (6) **Guardrail metrics** — trigger rates, false positive rates.

---

**Deep Answer**

```
LLM Observability Stack:

┌─────────────────────────────────────────┐
│  Traces (per-request journey)            │
│  - User query → Retrieval → LLM call → │
│    Tool call → LLM call → Response      │
│  - Each span: input, output, latency,   │
│    tokens, model, cost                   │
├─────────────────────────────────────────┤
│  Metrics (aggregated)                    │
│  - Request volume, latency P50/P95/P99  │
│  - Token usage (in/out), cost per hour  │
│  - Quality scores (LLM judge, user)     │
│  - Error rates, guardrail trigger rates │
│  - Cache hit rates                      │
├─────────────────────────────────────────┤
│  Logs (detailed records)                 │
│  - Full prompt/response (PII redacted)  │
│  - Model version, prompt version        │
│  - Retrieval results, tool outputs      │
│  - Guardrail decisions                  │
├─────────────────────────────────────────┤
│  Evaluation (offline)                    │
│  - Automated eval pipelines             │
│  - Regression detection                 │
│  - Human annotation queues              │
└─────────────────────────────────────────┘
```

- **Tools:** Langfuse, LangSmith, Helicone, Phoenix (Arize), custom OpenTelemetry spans

---

**Follow-up Questions**

1. How do you handle PII in prompt/response logs?
2. Your traces show a 2x latency increase after a prompt change. What do you investigate?
3. How do you set up alerting for quality regressions that are gradual (not sudden)?

---

## Q-06-C-003: What is LLM evaluation and why is it harder than traditional model evaluation?

**Module:** LLMOps
**Submodule:** Evaluation
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Beginner, Early-career, Mid-level
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [llmops, evaluation, testing, quality, llm-as-judge]
**Prerequisites:** Q-06-C-001, Q-03-C-004
**Estimated Interview Round:** Screening, Technical
**Why This Question Matters:** You can't improve what you can't measure. LLM evaluation is the hardest unsolved problem in LLMOps — there's no single metric that tells you if the system is "good."

---

**Question**

Why is evaluating LLM outputs harder than evaluating a classification or regression model? What approaches work?

---

**Expected Answer (Short)**

Traditional ML: ground truth labels → compute accuracy/F1. LLM outputs: (1) No single correct answer (many valid responses). (2) Quality is subjective (tone, helpfulness, completeness). (3) Non-deterministic (same input → different outputs). Approaches: (1) **LLM-as-judge** — use a strong LLM to grade outputs (scalable, reasonably correlated with humans). (2) **Human evaluation** — gold standard but expensive and slow. (3) **Task-specific metrics** — exact match for factual QA, ROUGE for summarization. (4) **Pairwise comparison** — "Is response A or B better?" (easier for humans and LLMs than absolute scoring).

---

**Deep Answer**

| Evaluation Approach | Cost | Speed | Reliability | Best For |
|--------------------|------|-------|-------------|----------|
| Exact match | Free | Instant | High (factual) | QA, extraction |
| ROUGE/BLEU | Free | Instant | Low (surface) | Summarization |
| LLM-as-judge | ~$0.01/eval | Seconds | Medium-High | General quality |
| Human eval | ~$1-5/eval | Minutes-hours | High | Subjective quality |
| Pairwise A/B | Varies | Varies | Higher than absolute | Comparing versions |
| User feedback | Free | Async | Biased (only strong opinions) | Production quality |

- **LLM-as-judge pattern:**
  ```python
  eval_prompt = """Rate the following response on a scale of 1-5 for:
  - Correctness: Are the facts accurate?
  - Completeness: Does it address the full question?
  - Helpfulness: Would a user be satisfied?
  
  Question: {question}
  Response: {response}
  Reference Answer: {reference}
  
  Output JSON: {"correctness": X, "completeness": X, "helpfulness": X, "reasoning": "..."}"""
  ```

- **Key insight:** Use multiple evaluation methods in combination. LLM-as-judge for automated CI, human eval for periodic calibration, user feedback for production monitoring.

---

**Follow-up Questions**

1. Your LLM judge gives high scores to outputs that humans rate poorly. How do you calibrate?
2. How do you evaluate for safety and harmful content?
3. How do you build an evaluation pipeline that runs automatically on every prompt change?

---

## Q-06-C-004: What is prompt versioning and why does it matter?

**Module:** LLMOps
**Submodule:** Prompt Management
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Beginner, Early-career
**Persona Relevance:** Software Dev → AI Engineer, ML / Data Engineer
**Tags:** [llmops, prompt-management, versioning, deployment]
**Prerequisites:** Q-06-C-001, Q-03-C-002
**Estimated Interview Round:** Screening, Technical
**Why This Question Matters:** A one-word prompt change can cause a 10% quality drop. Without versioning, you can't track what changed, when, or why — and you can't rollback.

---

**Question**

Why do you need to version prompts like code? What should a prompt management system track?

---

**Expected Answer (Short)**

Prompts are the "code" of LLM systems. A prompt version should track: (1) **Full prompt text** (system + user templates). (2) **Model** (which LLM version). (3) **Parameters** (temperature, max_tokens, etc.). (4) **Linked tools/functions**. (5) **Evaluation results** (quality metrics at time of deployment). (6) **Deployment history** (when deployed, to which environment, by whom). Benefits: rollback on quality regression, A/B test between versions, audit trail for compliance.

---

**Deep Answer**

```python
@dataclass
class PromptVersion:
    version_id: str              # "v2.3.1"
    system_prompt: str           # Full system prompt text
    user_template: str           # User message template with {variables}
    model: str                   # "gpt-4o-2024-08-06"
    parameters: dict             # {"temperature": 0, "max_tokens": 4000}
    tools: list[ToolSchema]      # Function definitions
    guardrails: list[str]        # Linked guardrail versions
    eval_results: dict           # Eval scores at deploy time
    created_by: str
    created_at: datetime
    deployed_to: list[str]       # ["staging", "production"]
    rollback_version: str        # Previous version for quick rollback
    changelog: str               # Human-readable change description

# Deployment flow:
# 1. Edit prompt → new version (v2.4.0)
# 2. Run eval suite → generate scores
# 3. Deploy to staging → monitor
# 4. A/B test in production (10% traffic)
# 5. Full rollout or rollback
```

- **Anti-patterns:**
  - Prompts hardcoded in application code (no independent versioning)
  - Prompt changes deployed without evaluation
  - No rollback capability
  - "Last editor wins" with no diff history

---

**Follow-up Questions**

1. You have 15 different prompts across your application. How do you manage the combinatorial explosion of versions?
2. A prompt change improves one metric but degrades another. How do you decide whether to deploy?
3. How does prompt versioning integrate with your CI/CD pipeline?

---

## Q-06-C-005: What are the main LLM cost drivers and how do you model costs?

**Module:** LLMOps
**Submodule:** Cost Management
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Beginner, Early-career, Mid-level
**Persona Relevance:** Senior / Architect, DevOps / SRE → AIOps
**Tags:** [llmops, cost, tokens, optimization, budgeting]
**Prerequisites:** Q-06-C-001
**Estimated Interview Round:** Screening, Technical
**Why This Question Matters:** LLM costs can spiral unpredictably. Understanding cost drivers is the first step to building sustainable LLM systems that don't bankrupt the company.

---

**Question**

What drives LLM API costs? How do you model and forecast costs for an LLM-powered application?

---

**Expected Answer (Short)**

Cost = tokens × price_per_token. Key drivers: (1) **Input tokens** — system prompt + context (RAG chunks) + conversation history. These grow over time. (2) **Output tokens** — response length, typically 3-10x more expensive per token than input. (3) **Request volume** — scales with users. (4) **Model choice** — GPT-4o vs GPT-4o-mini = 10-30x cost difference. (5) **Retries** — failed requests that are retried double the cost. Cost model: `monthly_cost = daily_requests × avg_tokens_per_request × price_per_token × (1 + retry_rate)`.

---

**Deep Answer**

```python
# Cost model
class CostModel:
    def estimate_monthly(self):
        daily_requests = 10_000
        
        # Per request token breakdown:
        system_prompt = 500          # Fixed
        rag_context = 2000           # Retrieved chunks
        conversation_history = 1000  # Growing per turn
        user_message = 100           # Variable
        total_input = 3600
        
        avg_output = 500             # Response tokens
        
        # Pricing (GPT-4o example):
        input_price = 2.50 / 1_000_000   # $2.50 per 1M input tokens
        output_price = 10.00 / 1_000_000  # $10 per 1M output tokens
        
        cost_per_request = (total_input * input_price) + (avg_output * output_price)
        # = $0.009 + $0.005 = $0.014 per request
        
        monthly = daily_requests * 30 * cost_per_request * 1.1  # 10% retry overhead
        # = $4,620/month
        
        return monthly
```

- **Hidden cost multipliers:**
  - Multi-turn conversations: context grows each turn (turn 1: 1K tokens → turn 10: 10K tokens)
  - RAG systems: retrieval adds 2-5K tokens per request
  - Agent systems: 5-15 LLM calls per user request
  - Evaluation pipelines: LLM-as-judge = additional calls
  - Batch processing: reprocessing historical data on prompt change

---

**Follow-up Questions**

1. Your LLM costs doubled this month but request volume is unchanged. What happened?
2. How do you implement per-team or per-feature cost attribution?
3. When does self-hosting an LLM become cheaper than API calls?

---

## Q-06-C-006: What is an LLM gateway and why do production systems need one?

**Module:** LLMOps
**Submodule:** Infrastructure
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Early-career, Mid-level
**Persona Relevance:** DevOps / SRE → AIOps, Software Dev → AI Engineer
**Tags:** [llmops, gateway, proxy, rate-limiting, routing, infrastructure]
**Prerequisites:** Q-06-C-001
**Estimated Interview Round:** Screening, Technical
**Why This Question Matters:** Direct LLM API calls from every service = no cost control, no observability, no fallback. An LLM gateway is the control plane for all LLM interactions.

---

**Question**

What is an LLM gateway (proxy) and what problems does it solve?

---

**Expected Answer (Short)**

An LLM gateway sits between your application and LLM providers. It provides: (1) **Unified API** — abstract over multiple providers (OpenAI, Anthropic, local models) with a common interface. (2) **Rate limiting** — prevent abuse and control costs per team/user. (3) **Caching** — cache identical requests to reduce cost and latency. (4) **Fallback** — if OpenAI is down, route to Anthropic. (5) **Observability** — log all requests, token usage, latency in one place. (6) **Security** — centralize API key management, PII filtering. Tools: LiteLLM, Portkey, custom Nginx/Envoy proxy.

---

**Deep Answer**

```
Application Services
    │
    ▼
┌──────────────────────────────┐
│       LLM Gateway            │
│  ┌────────────────────────┐  │
│  │  Rate Limiter          │  │  ← Per-team, per-user limits
│  │  Cache Layer           │  │  ← Semantic + exact match cache
│  │  PII Filter            │  │  ← Redact before sending to LLM
│  │  Request Router        │  │  ← Route by model, cost, latency
│  │  Fallback Handler      │  │  ← Provider A fails → try B
│  │  Logger/Tracer         │  │  ← All requests captured
│  │  Cost Tracker          │  │  ← Real-time token/cost accounting
│  └────────────────────────┘  │
└──────────────┬───────────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
  OpenAI   Anthropic   Local Model
```

- **Routing strategies:**
  - **Cost-based:** Route simple queries to cheap model, complex to expensive
  - **Latency-based:** Route to fastest available provider
  - **Capability-based:** Route vision queries to multimodal model, code queries to code model
  - **Fallback:** Primary → secondary → cached response → error

---

**Follow-up Questions**

1. Your gateway cache returns stale responses for time-sensitive queries. How do you handle it?
2. How do you implement semantic caching (similar but not identical queries)?
3. When does a gateway become a bottleneck instead of a benefit?

---
