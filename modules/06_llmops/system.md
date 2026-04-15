# Module 06 — LLMOps: System Level

---

## Q-06-S-001: Design an enterprise LLM platform serving 10 internal teams with different models, budgets, and quality requirements.

**Module:** LLMOps
**Submodule:** Platform Architecture
**Level:** System
**Difficulty:** 5
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, DevOps / SRE → AIOps
**Tags:** [llmops, platform, multi-tenant, architecture, enterprise]
**Prerequisites:** Q-06-A-002, Q-06-A-007, Q-06-C-006
**Estimated Interview Round:** System Design
**Why This Question Matters:** Building an LLM platform is different from building one LLM feature. The platform must serve diverse team needs while maintaining cost control, quality standards, and operational visibility.

---

**Question**

Design an internal LLM platform for a company with 10 teams. Some need chatbots, others batch analysis, others RAG systems. Different quality and latency requirements. Total LLM budget is $100K/month.

---

**Expected Answer (Short)**

Architecture: (1) **Shared LLM gateway** — unified API, routing, caching, rate limiting. (2) **Model catalog** — curated list of approved models with cost/quality profiles. (3) **Prompt registry** — centralized prompt versioning with team-level permissions. (4) **Budget system** — per-team token budgets with alerts and hard limits. (5) **Eval platform** — shared eval infrastructure teams can run against their prompts. (6) **Observability** — platform-wide dashboards + team-specific views. (7) **Self-service onboarding** — teams deploy without platform team involvement.

---

**Deep Answer**

```
┌─────────────────────────────────────────────────────┐
│                    Teams (10)                         │
│  Team A (chatbot)  Team B (RAG)  Team C (batch)     │
└──────────┬──────────────┬──────────────┬────────────┘
           │              │              │
┌──────────┴──────────────┴──────────────┴────────────┐
│                 LLM Platform Layer                    │
│  ┌──────────┬───────────┬───────────┬─────────────┐ │
│  │ Gateway  │ Prompt    │ Eval      │ Observ.     │ │
│  │ (routing,│ Registry  │ Platform  │ (traces,    │ │
│  │  cache,  │ (version, │ (judges,  │  metrics,   │ │
│  │  auth)   │  deploy)  │  test)    │  dashboards)│ │
│  └──────────┴───────────┴───────────┴─────────────┘ │
│  ┌──────────┬───────────┬───────────┐               │
│  │ Budget   │ Model     │ Guardrail │               │
│  │ Manager  │ Catalog   │ Engine    │               │
│  └──────────┴───────────┴───────────┘               │
└──────────────────────┬──────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
      OpenAI       Anthropic     Local Models
```

- **Budget management:**
  - $100K/month total → allocate by team priority and usage pattern
  - Real-time tracking, daily reports, weekly summaries
  - Soft limits (alert) at 80%, hard limits (block new requests) at 100%
  - Teams can request budget increases via approval workflow

- **Model catalog:**
  - Tier 1: GPT-4o, Claude Opus — for complex reasoning, production chatbots
  - Tier 2: GPT-4o-mini, Haiku — for classification, extraction, batch work
  - Tier 3: Local models — for sensitive data, unlimited throughput tasks

- **Team onboarding flow:**
  1. Team requests access → platform approval
  2. Team gets API key with budget allocation
  3. Team selects model from catalog
  4. Team registers prompts in registry
  5. Team runs evals → deploys to staging → production

---

**Follow-up Questions**

1. Two teams need mutually exclusive model configurations. How do you handle?
2. A team wants to use a model not in the catalog. What's the process?
3. How do you handle data residency requirements (EU data can't go to US API endpoints)?

---

## Q-06-S-002: Design the evaluation infrastructure for continuous LLM quality monitoring across production systems.

**Module:** LLMOps
**Submodule:** Evaluation
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** ML / Data Engineer, Senior / Architect
**Tags:** [llmops, evaluation, monitoring, quality, continuous, production]
**Prerequisites:** Q-06-A-005, Q-06-A-003
**Estimated Interview Round:** System Design
**Why This Question Matters:** One-time evals are insufficient. LLM quality can degrade from model provider updates, data changes, or traffic pattern shifts. Continuous monitoring catches regressions before users notice.

---

**Question**

Design an eval infrastructure that continuously monitors quality for 5 production LLM features, each with different quality metrics. Support automated detection, alerting, and investigation workflows.

---

**Expected Answer (Short)**

Architecture: (1) **Sampler** — sample N% of production traffic per feature. (2) **Judge pipeline** — run LLM-as-judge on samples asynchronously. (3) **Metric store** — time-series quality scores per feature. (4) **Regression detector** — statistical comparison against rolling baseline. (5) **Alert system** — notify team when quality drops beyond threshold. (6) **Investigation dashboard** — drill down to specific failing examples.

---

**Deep Answer**

```python
class ContinuousEvalSystem:
    def __init__(self, features):
        self.features = features  # 5 production features
        self.sampler = TrafficSampler(rate=0.05)  # 5% of traffic
        self.judge = JudgePipeline()
        self.metric_store = TimeSeriesDB()
        self.detector = RegressionDetector(window=24*7, threshold=0.05)
    
    async def process_sample(self, feature_id, request, response):
        # Asynchronous — doesn't affect user latency
        scores = await self.judge.evaluate(
            feature_id=feature_id,
            query=request.query,
            response=response.text,
            criteria=self.features[feature_id].eval_criteria
        )
        
        # Store in time series
        self.metric_store.record(feature_id, scores, timestamp=now())
        
        # Check for regression
        regression = self.detector.check(
            feature_id=feature_id,
            current_score=scores,
            baseline=self.metric_store.rolling_mean(feature_id, window="7d")
        )
        
        if regression.detected:
            self.alert(
                feature_id=feature_id,
                severity=regression.severity,
                details=f"Quality dropped {regression.delta:.1%} over last {regression.window}"
            )

# Each feature defines its own eval criteria:
features = {
    "support_chatbot": EvalCriteria(
        metrics=["correctness", "helpfulness", "tone"],
        weights=[0.4, 0.4, 0.2],
        threshold=4.0  # out of 5
    ),
    "document_summarizer": EvalCriteria(
        metrics=["faithfulness", "completeness", "conciseness"],
        weights=[0.5, 0.3, 0.2],
        threshold=3.8
    ),
}
```

---

**Follow-up Questions**

1. Your judge pipeline costs $3K/month. How do you reduce cost without reducing coverage?
2. Quality drops only for queries in Spanish. How does your system detect language-specific regressions?
3. How do you distinguish between an actual regression and normal variance?

---

## Q-06-S-003: Design a compliance and audit system for LLM interactions in a regulated industry.

**Module:** LLMOps
**Submodule:** Compliance
**Level:** System
**Difficulty:** 5
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, DevOps / SRE → AIOps
**Tags:** [llmops, compliance, audit, regulated, logging, privacy]
**Prerequisites:** Q-05-S-002, Q-06-A-002
**Estimated Interview Round:** System Design
**Why This Question Matters:** In healthcare, finance, and legal — every LLM interaction may need to be auditable for years. Compliance is a system design problem, not a checkbox.

---

**Question**

Design the compliance and audit system for an LLM-powered financial advisory tool. Requirements: every AI interaction auditable for 7 years, explainable decisions, PII handling, and regulatory reporting.

---

**Expected Answer (Short)**

Architecture: (1) **Immutable audit log** — every prompt, response, tool call stored in append-only storage (no deletion, no modification). (2) **PII handling** — detect and redact PII in logs, tokenize for retrieval. (3) **Explainability layer** — store reasoning chain alongside each response. (4) **Retention policy** — 7-year hot+cold storage with legal hold capabilities. (5) **Access control** — role-based access to audit data (compliance team, legal, regulators). (6) **Automated reporting** — generate compliance reports for regulatory submissions.

---

**Deep Answer**

```python
class ComplianceLogger:
    def __init__(self, audit_store, pii_detector):
        self.audit_store = audit_store  # Append-only, tamper-evident
        self.pii_detector = pii_detector
    
    def log_interaction(self, interaction):
        # Detect and handle PII
        pii_entities = self.pii_detector.scan(interaction.full_text)
        
        audit_record = AuditRecord(
            id=uuid4(),
            timestamp=now(),
            session_id=interaction.session_id,
            user_id=interaction.user_id,
            advisor_model=interaction.model_version,
            prompt_version=interaction.prompt_version,
            
            # Full content (PII-tokenized for storage, restorable by compliance)
            query=self.pii_detector.tokenize(interaction.query),
            response=self.pii_detector.tokenize(interaction.response),
            
            # Explainability
            reasoning_chain=interaction.reasoning_steps,
            sources_cited=interaction.citations,
            confidence_score=interaction.confidence,
            disclaimers_included=interaction.disclaimers,
            
            # Compliance metadata
            pii_detected=pii_entities,
            guardrail_results=interaction.guardrail_checks,
            compliance_flags=self.check_compliance_rules(interaction),
            
            # Tamper evidence
            hash=sha256(interaction.serialize()),
            previous_hash=self.audit_store.last_hash()
        )
        
        self.audit_store.append(audit_record)

# Storage tiers:
# Hot (0-90 days): Fast queryable store (DynamoDB/Postgres)
# Warm (90 days - 2 years): Object storage with indexing (S3 + Athena)
# Cold (2-7 years): Glacier-class storage with legal hold
```

---

**Follow-up Questions**

1. A regulator asks for all interactions where the AI recommended a specific stock. How fast can you query this?
2. GDPR right-to-deletion vs 7-year financial retention. How do you handle the conflict?
3. How do you prove the audit log hasn't been tampered with?

---

## Q-06-S-004: Design a multi-model routing system that optimizes for cost, quality, and latency simultaneously.

**Module:** LLMOps
**Submodule:** Infrastructure
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, DevOps / SRE → AIOps
**Tags:** [llmops, routing, optimization, multi-model, cost, quality]
**Prerequisites:** Q-06-C-006, Q-06-A-004
**Estimated Interview Round:** System Design
**Why This Question Matters:** Not every request needs GPT-4o. A smart router that directs simple queries to cheap models and hard queries to premium models can cut costs 60% with <2% quality impact.

---

**Question**

Design a routing system that decides which model to use for each request, optimizing for cost while maintaining quality and latency SLAs.

---

**Expected Answer (Short)**

Architecture: (1) **Complexity classifier** — lightweight model classifies query difficulty (simple/medium/complex). (2) **Model tiers** — simple→mini, medium→standard, complex→premium. (3) **Quality monitor** — track quality per route, adjust thresholds. (4) **Latency-aware** — if premium model is slow, fall back to standard. (5) **Feedback loop** — user feedback on routed responses tightens classifier.

---

**Deep Answer**

```python
class ModelRouter:
    def __init__(self):
        self.tiers = {
            "simple": ModelConfig(model="gpt-4o-mini", cost_per_1k=0.15, avg_latency_ms=500),
            "medium": ModelConfig(model="gpt-4o-mini", cost_per_1k=0.15, avg_latency_ms=500),
            "complex": ModelConfig(model="gpt-4o", cost_per_1k=5.00, avg_latency_ms=2000),
            "critical": ModelConfig(model="gpt-4o", cost_per_1k=5.00, avg_latency_ms=2000),
        }
        self.classifier = ComplexityClassifier()  # Fine-tuned small model or rules
    
    def route(self, request):
        # Classify complexity
        complexity = self.classifier.predict(request.query)
        
        # Check SLA constraints
        if request.latency_sla_ms < 1000 and complexity == "complex":
            complexity = "medium"  # Can't use slow model if latency is tight
        
        # Check quality override
        if request.quality_requirement == "high":
            complexity = "complex"  # Always use premium for high-quality requirements
        
        model_config = self.tiers[complexity]
        
        # Latency check — if model is currently slow, downgrade routing
        if self.is_model_slow(model_config.model):
            model_config = self.tiers["medium"]  # Fallback
        
        return model_config

# Cost impact:
# Without routing: 100% GPT-4o = $15K/month  
# With routing: 60% mini + 30% standard + 10% premium = $4.5K/month
# Quality impact: <2% avg quality difference (validated by eval pipeline)
```

---

**Follow-up Questions**

1. The classifier incorrectly routes a complex query to the cheap model. User gets a bad answer. How do you detect and fix?
2. A new model release makes the medium tier as good as the premium tier. How does the system adapt?
3. How do you handle requests where you can't determine complexity until after you've started generating?

---
