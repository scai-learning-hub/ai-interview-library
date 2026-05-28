# MLOps / LLMOps / AIOps — Batch 01

Module: MLOps / LLMOps / AIOps · Topic Family L  
Questions: 15 · Levels: Concept, Applied, System, Debugging, Architect  
Complements: [Module page](../../modules/mlops-llmops-aiops.md)

---

### Q-MLO-B01-001: What is the difference between MLOps, LLMOps, and AIOps, and why do they require different operational strategies?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| MLOps / LLMOps / AIOps   | Operational Scoping   | Concept   | 2   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 0–2, 2–5   | mlops-llmops-platform-engineer, devops-sre-to-aiops, software-foundations-to-ai-engineer   | Phone screen, Technical deep dive   |

| Prerequisites | Tags |
|---|---|
| Basic software deployment awareness   | `mlops`, `llmops`, `aiops`, `operations`, `observability`   |

**Why This Matters:** These terms are often conflated, but each represents a distinct operational surface area with different monitoring, deployment, and failure characteristics.

**Question**  
Define MLOps, LLMOps, and AIOps. Explain how each differs in scope, tooling, and the types of failures they address. Why can't a team use the same operational playbook for all three?

**Expected Answer (Short)**  
MLOps covers the lifecycle of traditional ML models (training, validation, deployment, monitoring for drift). LLMOps extends this to LLM-specific concerns (prompt management, token cost, evaluation of generative output, RAG pipeline health). AIOps uses AI to automate IT operations (anomaly detection, log analysis, incident correlation). They differ in what they monitor, how they detect failure, and what "drift" means in each context.

**Deep Answer**  
- **MLOps**: data pipelines, feature stores, model training, versioning, A/B testing, model monitoring (data drift, concept drift, performance degradation). Tools: MLflow, Kubeflow, Weights & Biases, Seldon. Failures: data schema changes, training-serving skew, stale features, slow model degradation over time
- **LLMOps**: prompt versioning and management, token cost tracking, output quality evaluation (often non-deterministic), RAG pipeline monitoring (retrieval accuracy, chunk quality), guardrail enforcement, latency management, model version migration. Tools: LangSmith, Langfuse, Helicone, Arize Phoenix. Failures: prompt injection, hallucination spikes, retrieval degradation, cost overruns from agent loops, version mismatch between model and prompts
- **AIOps**: using ML/AI to operate IT systems — anomaly detection on metrics, log clustering, root cause analysis, alert correlation, automated remediation. Tools: Dynatrace, Datadog AI, Moogsoft, PagerDuty + AI. Failures: false positive alerts, model staleness on changing infrastructure, automated remediation causing cascading failures
- **Why different playbooks**:
  - MLOps drift: input feature distributions change slowly → detect with statistical tests
  - LLMOps drift: prompt effectiveness degrades overnight due to model updates → detect with output quality scoring
  - AIOps drift: infrastructure patterns change with every deployment → detect with online learning
  - Feedback loops: MLOps has labeled validation. LLMOps often lacks ground truth for generative output. AIOps uses operational success (incident resolved?) as feedback
  - Cost levers: MLOps = training compute. LLMOps = inference tokens. AIOps = alert volume reduction

**Follow-up Questions**  
- How does "drift" differ between a tabular ML model and an LLM application?
- What evaluation methods work for LLM output quality in production?
- How would you monitor a RAG pipeline differently from a classification model?
- What are the risks of AIOps automated remediation?

**Weak Answer Signals / Red Flags**  
- Treats all three as interchangeable
- Defines AIOps as "AI operations" instead of "AI for operations"
- Cannot name concrete tools for any category
- Doesn't mention the evaluation challenge for LLM outputs

**Interviewer Signal**  
Tests whether the candidate understands the operational landscape broadly, not just one narrow slice.

**Real-World Insight**  
Many teams build MLOps infrastructure and then try to apply it unchanged to LLM applications. This fails because LLMOps has no ground truth labels, non-deterministic outputs, and cost models tied to token volume rather than compute time. Recognizing this early saves months of misapplied tooling.

---

### Q-MLO-B01-002: How do you detect and respond to data drift in a production ML pipeline, and how does this differ from concept drift?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| MLOps / LLMOps / AIOps   | Drift Detection   | Applied   | 3   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 2–5, 5–8   | ml-data-engineer, mlops-llmops-platform-engineer, software-foundations-to-ai-engineer   | Technical deep dive   |

| Prerequisites | Tags |
|---|---|
| Basic statistics, ML model lifecycle   | `data-drift`, `concept-drift`, `monitoring`, `statistical-tests`, `production`   |

**Why This Matters:** Drift is the #1 silent killer of ML models in production. Models degrade gradually without raising errors, and teams often only discover drift when business metrics drop.

**Question**  
Define data drift and concept drift. How do you detect each in a production ML system, and what is the correct operational response when drift is detected?

**Expected Answer (Short)**  
Data drift: the distribution of input features changes (e.g., user demographics shift). Concept drift: the relationship between features and targets changes (e.g., user behavior evolves). Data drift is detected by comparing feature distributions; concept drift by monitoring model performance metrics against ground truth. Response: data drift may require retraining on new data; concept drift may require new features or model architecture.

**Deep Answer**  
- **Data drift** (covariate shift): P(X) changes but P(Y|X) stays the same. Example: a fraud model trained on US transactions starts receiving EU transactions with different amounts and merchants. Detection: statistical tests on feature distributions — PSI (Population Stability Index), KS test, Jensen-Shannon divergence. Run these on a rolling window comparing recent data to training data
- **Concept drift**: P(Y|X) changes. The same inputs should now produce different outputs. Example: during COVID, purchasing patterns changed — the features looked normal but the labels changed meaning. Detection: requires access to ground truth labels (often delayed). Monitor model accuracy, precision, recall over time windows. If performance degrades but features haven't shifted, suspect concept drift
- **Response framework**:
  1. Data drift detected, no performance drop → monitor, may not need action
  2. Data drift detected, performance dropping → retrain on recent data
  3. Concept drift detected → retrain is necessary; may need new features or architecture
  4. Sudden drift → investigate data pipeline (schema change, upstream failure)
  5. Gradual drift → schedule regular retraining cadence
- **Challenge with LLMs**: for generative output, there's no simple "accuracy" metric. LLM drift detection requires output quality scoring (LLM-as-judge, embedding similarity, task-specific metrics)
- **Infrastructure**: store predictions + features + timestamps. Compare windows: this week vs last month. Set threshold for alert severity
- **False positives**: seasonal patterns (Black Friday traffic) can trigger drift alerts without actual model degradation. Use context-aware baselines
- **Tools**: Evidently AI, NannyML, WhyLabs, Arize, custom dashboards on top of feature stores

**Follow-up Questions**  
- How do you differentiate between seasonal variation and real data drift?
- What is training-serving skew, and how does it relate to drift?
- How would you design a retraining trigger that balances cost and freshness?
- How does drift detection differ for tabular vs text vs image data?

**Weak Answer Signals / Red Flags**  
- Confuses data drift with concept drift
- Doesn't mention statistical tests or specific detection methods
- Assumes retraining is always the answer (ignores data pipeline issues)
- Unaware that drift detection requires production monitoring infrastructure

**Interviewer Signal**  
Tests understanding of model lifecycle management — the gap between deploying a model and keeping it reliable.

**Real-World Insight**  
Many teams set up drift detection, get flooded with alerts they don't act on, and eventually ignore the system. Effective drift management requires tying alerts to business impact: only alert when drift correlates with performance degradation, not on every statistical shift.

---

### Q-MLO-B01-003: Design an observability stack for an LLM-powered RAG application. What metrics, logs, and traces would you capture?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| MLOps / LLMOps / AIOps   | LLM Observability   | System   | 4   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 5–8, 8–12   | mlops-llmops-platform-engineer, devops-sre-to-aiops, llm-rag-agent-engineer   | System design   |

| Prerequisites | Tags |
|---|---|
| RAG architecture, observability fundamentals   | `observability`, `tracing`, `rag`, `metrics`, `llmops`, `langfuse`, `langsmith`   |

**Why This Matters:** LLM applications have more failure modes than traditional APIs. Without proper observability, teams cannot diagnose hallucination spikes, retrieval failures, or cost anomalies.

**Question**  
Design the observability stack for a production RAG application that handles 10,000 queries/day. Cover the metrics, logs, traces, and evaluation signals you would capture at each stage of the pipeline.

**Expected Answer (Short)**  
Capture per-stage metrics: retrieval latency, chunk relevance scores, reranker scores, LLM latency, token counts, and end-to-end response quality. Use distributed tracing to link each request through retrieval → reranking → generation → response. Log individual queries and responses for quality auditing. Evaluate output quality using automated scoring (LLM-as-judge, faithfulness, relevance) on a sample.

**Deep Answer**  
- **Trace structure**: each RAG query is a trace with spans for:
  - Query processing (embedding, classification)
  - Retrieval (vector search latency, chunks returned, relevance scores)
  - Reranking (reranker scores, chunks reordered)
  - Context assembly (total context tokens, truncation events)
  - LLM generation (prompt tokens, completion tokens, latency, model version)
  - Post-processing (guardrail checks, citation extraction)
- **Metrics to capture**:
  - Retrieval: P50/P95 latency, top-k relevance score distribution, empty retrieval rate, index staleness
  - Generation: TTFT, total latency, tokens per response, cost per request
  - Quality: faithfulness score (does response match retrieved context?), answer relevance, hallucination rate (sampled)
  - Business: user satisfaction (thumbs up/down), follow-up question rate, task completion rate
- **Logs**:
  - Every query + retrieved chunks + generated response (for quality review and debugging)
  - Guardrail triggers (blocked queries, filtered responses)
  - Error events (retrieval failures, model timeouts, rate limits)
- **Evaluation pipeline**:
  - Sample 5–10% of requests for automated evaluation
  - LLM-as-judge: score faithfulness, relevance, completeness on a 1–5 scale
  - Flag low-scoring responses for human review
  - Track evaluation scores over time to detect quality drift
- **Alerting**:
  - Empty retrieval rate > 5% → retrieval failure
  - Faithfulness score dropping → context quality issue or model degradation
  - Token cost per request spiking → prompt bloat or retrieval returning too many chunks
  - Latency P95 exceeding SLO → scaling or model issue
- **Tools**: Langfuse or LangSmith for LLM tracing, Prometheus + Grafana for infrastructure metrics, custom evaluation pipeline running on a queue
- **Data retention**: store traces for 30 days (debugging), aggregated metrics for 12 months (trend analysis), flagged low-quality responses indefinitely (improvement dataset)

**Follow-up Questions**  
- How do you evaluate RAG faithfulness without human labels?
- What is the cost of running LLM-as-judge on 10% of traffic?
- How would you detect a degradation in your vector index without explicit quality labels?
- How do you build a feedback loop from observability to improvement?

**Weak Answer Signals / Red Flags**  
- Only monitors latency and error rates (standard API metrics), ignores quality signals
- Doesn't trace through the RAG pipeline stages
- Cannot explain how to evaluate generative output quality
- Treats LLM observability identically to REST API monitoring

**Interviewer Signal**  
Tests whether the candidate can build operational maturity for LLM applications — a rare and valuable skill in 2026.

**Real-World Insight**  
Most production RAG failures are silent: the system returns a plausible-sounding response that is factually wrong or irrelevant. Without quality scoring in the observability pipeline, teams only discover these failures when users complain — often weeks later.

---

### Q-MLO-B01-004: What is prompt versioning, and why is it as critical as model versioning for LLM applications?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| MLOps / LLMOps / AIOps   | Prompt Management   | Applied   | 2   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 0–2, 2–5, 5–8   | llm-rag-agent-engineer, mlops-llmops-platform-engineer, software-foundations-to-ai-engineer   | Technical deep dive   |

| Prerequisites | Tags |
|---|---|
| LLM application basics   | `prompt-versioning`, `prompt-management`, `llmops`, `deployment`, `regression`   |

**Why This Matters:** In LLM applications, the prompt IS the program. Changing a system prompt without versioning is equivalent to deploying untracked code changes to production.

**Question**  
Explain why prompt versioning matters in production LLM systems. What should a prompt management system track, and how do prompt changes relate to deployment risk?

**Expected Answer (Short)**  
Prompts define LLM behavior — a single word change can alter output quality, tone, or correctness. Without versioning, teams cannot reproduce results, roll back regressions, or understand which prompt version produced a specific response. A prompt management system should track version history, associate versions with evaluation results, and support A/B testing.

**Deep Answer**  
- **Why it matters**: LLM applications typically have 3 mutable components: model version, prompt, and retrieval context. Any change to any of these affects output. If you don't version prompts, you can't isolate the cause of quality changes
- **What to track**:
  - Full prompt text (system prompt, template, few-shot examples)
  - Version ID with timestamp and author
  - Associated model version (prompt v3 tested with GPT-4-turbo-20240901)
  - Evaluation results per version (accuracy, faithfulness, cost per request)
  - Deployment status (canary, production, deprecated)
- **Deployment risk**: a "minor" prompt edit (changing "concise" to "brief") can shift output distribution. Adding a guardrail instruction can reduce helpfulness. Removing few-shot examples can break structured output. Changes compound with model version changes
- **Operational patterns**:
  - Git-based versioning for prompts (prompts as code)
  - Prompt registry with approval workflows (like model registry)
  - A/B testing framework: deploy prompt v3 to 10% of traffic, compare quality metrics before full rollout
  - Rollback capability: if prompt v3 degrades quality, revert to v2 instantly
- **Common failures without versioning**:
  - Developer edits prompt in production database directly → no history
  - Quality regression discovered a week later → cannot determine which change caused it
  - Model provider updates base model → prompt that worked with v1 breaks with v2
- **Tools**: LangSmith prompt hub, Humanloop, Promptfoo for evaluation, custom registries on Git

**Follow-up Questions**  
- How would you design an A/B test for prompt changes?
- What evaluation metrics would you use to decide if a prompt change is safe to ship?
- How do you handle prompt changes when the underlying model also changes?
- What is the relationship between prompt versioning and reproducibility?

**Weak Answer Signals / Red Flags**  
- Doesn't recognize prompts as first-class deployment artifacts
- Thinks prompt changes are always safe and don't need testing
- No awareness of prompt-model interaction effects
- Cannot describe a rollback strategy

**Interviewer Signal**  
Tests operational maturity for LLM applications. Candidates who version prompts have production experience; those who don't have only built demos.

**Real-World Insight**  
Multiple production incidents at major companies traced back to "minor" prompt edits that weren't versioned or evaluated. Treating prompts with the same rigor as code (review, test, deploy, monitor) prevents the most common class of LLM application regressions.

---

### Q-MLO-B01-005: How do you monitor and control LLM inference cost in a production application with unpredictable usage patterns?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| MLOps / LLMOps / AIOps   | Cost Management   | Applied   | 3   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 2–5, 5–8   | mlops-llmops-platform-engineer, llm-rag-agent-engineer, devops-sre-to-aiops   | Technical deep dive, System design   |

| Prerequisites | Tags |
|---|---|
| LLM pricing models, token economics   | `cost`, `token-optimization`, `budget`, `rate-limiting`, `llm-cost`   |

**Why This Matters:** LLM inference cost is the #1 operational surprise for teams moving from prototype to production. Without cost controls, a bug or traffic spike can generate a five-figure bill overnight.

**Question**  
Describe how you would monitor, forecast, and control LLM inference cost for a production application. Include both real-time controls and longer-term optimization strategies.

**Expected Answer (Short)**  
Track cost per request (input + output tokens × price), set budget alerts and hard rate limits, implement token-level controls (max output tokens, context truncation), and optimize through prompt compression, caching, and model tiering (use cheaper models for simple tasks). Monitor cost per user, per feature, and per deployment to identify anomalies.

**Deep Answer**  
- **Monitoring dimensions**:
  - Cost per request (prompt tokens + completion tokens × per-token price)
  - Cost per user / per feature / per endpoint
  - Token efficiency: useful output tokens / total tokens (including system prompt overhead)
  - Cost trend: daily/weekly/monthly with forecasting
- **Real-time controls**:
  - Hard budget caps per day/week/month with circuit breaker (stop serving when cap is hit)
  - Per-request token limits: max_tokens on completion, max context length
  - Rate limiting per user/API key to prevent abuse
  - Agent loop breakers: max iterations, max total tokens per agent trajectory
- **Optimization strategies**:
  - Prompt compression: remove redundant instructions, use concise system prompts
  - Prefix caching: reuse computation for shared system prompts
  - Response caching: cache identical queries (with TTL). Exact match or semantic similarity cache
  - Model tiering: route simple queries to cheaper/smaller models, reserve expensive models for complex tasks. Classifier or heuristic-based routing
  - Batch processing: use batch APIs (50% cheaper on OpenAI) for non-interactive workloads
  - Context window management: truncate or summarize long conversation histories instead of sending full history
- **Agent-specific controls**: agent loops can consume 10–100x expected tokens. Implement: max tool calls per trajectory, token budget per agent run, timeout-based cost caps
- **Anomaly detection**: alert when hourly cost exceeds 2x the rolling average. Alert on individual requests exceeding $1 (likely a loop or prompt injection)
- **Cost attribution**: tag each request with user_id, feature_id, model_version for chargeback and feature-level cost analysis

**Follow-up Questions**  
- How would you build a model routing system that chooses between GPT-4 and GPT-3.5 based on query complexity?
- What is the risk of aggressive prompt compression on output quality?
- How do you handle cost spikes from agent loops without breaking functionality?
- What is the financial risk of prompt injection attacks that increase token usage?

**Weak Answer Signals / Red Flags**  
- No awareness that LLM costs scale with tokens, not just requests
- Doesn't mention agent loop cost risk
- Suggests only "reduce usage" with no specific strategies
- No concept of model tiering or task-based routing

**Interviewer Signal**  
Tests practical cost management skills. Candidates who've operated LLM applications at scale immediately discuss token budgets and model routing; those who haven't focus only on basic rate limiting.

**Real-World Insight**  
Multiple startups have reported $50K+ surprise bills from uncontrolled agent loops or prompt injection attacks that inflated token usage. Basic cost controls (budget caps, loop breakers, anomaly alerts) should be implemented before any LLM application sees production traffic.

---

### Q-MLO-B01-006: What is training-serving skew, and how do you prevent it in ML systems?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| MLOps / LLMOps / AIOps   | Training-Serving Consistency   | Applied   | 3   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 2–5, 5–8   | ml-data-engineer, mlops-llmops-platform-engineer, software-foundations-to-ai-engineer   | Technical deep dive   |

| Prerequisites | Tags |
|---|---|
| ML pipeline basics   | `training-serving-skew`, `feature-store`, `pipeline`, `consistency`, `production`   |

**Why This Matters:** Training-serving skew is one of the most insidious bugs in production ML — the model performs well offline but degrades silently in production, often going undetected for weeks.

**Question**  
Define training-serving skew. Give concrete examples of how it occurs, explain why it's hard to detect, and describe architectural patterns that prevent it.

**Expected Answer (Short)**  
Training-serving skew occurs when the data or feature transformations used during training differ from those used during inference. Examples: different preprocessing code paths, stale features in serving, timezone differences in timestamp features. Prevention: use a feature store with shared transformation logic, compute features identically in both paths, and validate feature distributions in production.

**Deep Answer**  
- **Common sources**:
  - Different code implementing the same transformation (Python for training, Java for serving)
  - Feature computation timing: training uses batch-computed features (exact), serving uses real-time features (approximate)
  - Data leakage in training (using future information) that's absent in serving
  - Normalization statistics (mean/std) computed on training data but not applied in serving
  - Missing values handled differently (training imputes, serving returns NaN)
  - String encoding: training lowercases text, serving doesn't
- **Why hard to detect**:
  - No explicit error — model still produces predictions
  - Degradation is gradual and looks like normal model decay
  - Offline evaluation shows great metrics; production metrics slowly decline
  - Features may be numerically similar but not identical (off by rounding, timezone)
- **Prevention patterns**:
  - **Feature store**: single source of truth for feature definitions (Feast, Tecton, Hopsworks). Shared transformation DAGs used in both training and serving
  - **Transform-once**: compute features in a shared library imported by both training and serving pipelines
  - **Shadow mode**: run serving pipeline on historical data and compare outputs to offline predictions. Identical inputs should produce identical features
  - **Distribution monitoring**: compare feature distributions between training data and serving traffic (same drift detection pipeline)
  - **Integration tests**: automated tests that feed the same input through training and serving pipelines and verify feature parity
- **LLM-specific skew**: prompt templates that differ between development testing and production. Retrieval pipelines that use different chunk sizes or models in testing vs production

**Follow-up Questions**  
- How does a feature store prevent training-serving skew?
- What is the difference between online and offline feature stores?
- How would you detect training-serving skew after the model is already in production?
- Can training-serving skew exist in LLM applications? How?

**Weak Answer Signals / Red Flags**  
- Never heard of the concept
- Cannot give a concrete example
- Thinks testing the model before deployment prevents skew
- Ignores the feature computation pipeline as a source of bugs

**Interviewer Signal**  
Tests understanding of ML systems beyond the model itself. Candidates who only think about models and not pipelines fail this question.

**Real-World Insight**  
Google's ML systems paper listed training-serving skew as one of the most common and costly bugs in production ML. Teams often discover skew only after a business-impact investigation reveals that model accuracy in production doesn't match offline benchmarks.

---

### Q-MLO-B01-007: Your LLM application's quality has degraded over the past two weeks, but the model version hasn't changed. How do you diagnose this?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| MLOps / LLMOps / AIOps   | LLM Quality Debugging   | Debugging   | 4   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 5–8, 8–12   | llm-rag-agent-engineer, mlops-llmops-platform-engineer, devops-sre-to-aiops   | Debugging   |

| Prerequisites | Tags |
|---|---|
| LLM application architecture, RAG   | `debugging`, `quality-degradation`, `rag`, `llm`, `root-cause-analysis`   |

**Why This Matters:** LLM applications have more mutable surfaces than traditional software. When quality degrades without an obvious code change, the root cause can be retrieval, data, prompts, or external dependencies — and misdiagnosis wastes weeks.

**Question**  
Users report that your RAG-based LLM application has been giving worse answers for the past two weeks. The model version hasn't changed. Walk through your diagnostic process.

**Expected Answer (Short)**  
Check the four mutable surfaces: (1) retrieval quality — has the vector index changed, are chunks stale? (2) prompt — was it edited? (3) input distribution — are users asking different types of questions? (4) external dependencies — did the API provider change model behavior behind the same version? Diagnose by comparing recent traces to baseline traces from 3 weeks ago.

**Deep Answer**  
- **Step 1: Establish the signal**
  - Confirm degradation is real: compare automated quality scores (faithfulness, relevance) from current period vs 3 weeks ago
  - Check if degradation is global or localized to certain query types, users, or topics
- **Step 2: Check retrieval pipeline**
  - Vector index: was it re-indexed? New documents added? Old documents removed? Chunking strategy changed?
  - Embedding model: was it updated or did provider change the embedding model version?
  - Retrieval scores: are relevance scores lower for the same test queries?
  - Data freshness: are documents in the index stale or outdated?
- **Step 3: Check prompts**
  - Diff prompt versions: any changes in the past 3 weeks?
  - Check prompt template rendering: are variables being substituted correctly?
  - Test current prompt with historical successful queries — does it still produce good results?
- **Step 4: Check input distribution**
  - Are users asking new types of questions outside the knowledge base coverage?
  - Has traffic source changed (new feature, new user segment)?
  - Compare query clusters: current vs baseline
- **Step 5: Check external dependencies**
  - API provider model change: providers sometimes update models behind the same version string
  - Rate limiting or throttling changes: degraded responses under pressure
  - Tool/API changes: if the app calls external tools, have they changed?
- **Step 6: Reproduce and isolate**
  - Take 20 queries from the degraded period and 20 from the good period
  - Run them through each pipeline stage independently
  - The stage where outputs diverge is the root cause
- **Step 7: Fix and verify**
  - Apply fix to root cause
  - Run the same test queries and verify quality scores return to baseline
  - Add monitoring to detect this failure mode going forward

**Follow-up Questions**  
- How would you detect if an API provider silently changed the model behind the same version?
- What is the first thing you'd check and why?
- How do you build a regression test suite for RAG quality?
- How would you prevent this from happening again?

**Weak Answer Signals / Red Flags**  
- Immediately assumes the model is the problem
- Doesn't consider retrieval pipeline changes
- No systematic diagnostic process — just guesses
- Thinks quality degradation always requires model retraining

**Interviewer Signal**  
Reveals diagnostic maturity. Strong candidates have a structured debugging process and consider all mutable surfaces, not just the model.

**Real-World Insight**  
In most real production RAG degradation incidents, the root cause is retrieval, not the model. Common culprits: a data pipeline silently broke and stopped indexing new documents, or a re-indexing job changed chunk sizes, or the embedding model was updated without re-embedding existing documents. Always check retrieval first.

---

### Q-MLO-B01-008: Explain the concept of model registry and why it matters for production ML systems. What metadata should a registry track?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| MLOps / LLMOps / AIOps   | Model Management   | Applied   | 2   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 0–2, 2–5   | mlops-llmops-platform-engineer, ml-data-engineer, software-foundations-to-ai-engineer   | Technical deep dive   |

| Prerequisites | Tags |
|---|---|
| Model training basics, deployment awareness   | `model-registry`, `versioning`, `mlflow`, `deployment`, `governance`   |

**Why This Matters:** Without a model registry, teams lose track of which model version is deployed, what data it was trained on, and whether it was evaluated before serving. This is the foundation of reproducible, auditable ML.

**Question**  
What is a model registry, what metadata should it track, and how does it fit into the ML deployment lifecycle? Give examples of how missing registry practices lead to production issues.

**Expected Answer (Short)**  
A model registry is a centralized store for trained model artifacts with metadata: training data version, hyperparameters, evaluation metrics, lineage, deployment status (staging/production/archived). It enables reproducibility, rollback, compliance, and multi-environment promotion. Without it, teams can't determine which model is in production, reproduce results, or roll back safely.

**Deep Answer**  
- **Core metadata per model version**:
  - Model artifact (weights, config, tokenizer)
  - Training data version / hash
  - Hyperparameters and training configuration
  - Evaluation metrics on validation and test sets
  - Training environment (framework version, GPU type, dependencies)
  - Lineage: who trained it, when, from which experiment
  - Deployment status: dev → staging → production → deprecated → archived
  - Approval/review chain for production promotion
- **Lifecycle integration**:
  - Training pipeline → registers new model version
  - Evaluation pipeline → runs benchmarks, attaches metrics
  - Promotion workflow → human or automated approval to move staging → production
  - Serving infrastructure → pulls model from registry by version tag
  - Rollback → revert to previous registered version with known metrics
- **Common failures without registry**:
  - "Which model is in production?" — nobody knows
  - Quality regression → can't identify which training run produced the current model
  - Retraining → previous training data and config are lost
  - Compliance audit → can't demonstrate model lineage or approval chain
  - Rollback → no previous version artifact available
- **Tools**: MLflow Model Registry, Hugging Face Hub, Weights & Biases Artifacts, SageMaker Model Registry, Vertex AI Model Registry
- **LLM extension**: for LLM applications, the registry should also track prompt versions, retrieval configurations, and adapter/LoRA weights alongside the base model version

**Follow-up Questions**  
- How would you design an automated promotion pipeline from staging to production?
- What evaluation gates should a model pass before production promotion?
- How does a model registry interact with a feature store?
- How would you extend a standard model registry for LLM applications?

**Weak Answer Signals / Red Flags**  
- Thinks saving model files to S3 counts as a registry
- Cannot name specific metadata that should be tracked
- Doesn't connect the registry to deployment and rollback
- Ignores governance and audit requirements

**Interviewer Signal**  
Tests foundational MLOps maturity. This is a baseline question — engineers at 2+ years should know this.

**Real-World Insight**  
Most ML compliance failures and audit findings trace back to missing model lineage. Regulated industries require a complete chain: training data → training run → evaluation → approval → deployment. A model registry is the backbone of this chain.

---

### Q-MLO-B01-009: How would you design a CI/CD pipeline for an LLM-powered application? How does it differ from traditional software CI/CD?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| MLOps / LLMOps / AIOps   | CI/CD for LLM Applications   | System   | 4   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 5–8, 8–12   | mlops-llmops-platform-engineer, devops-sre-to-aiops, llm-rag-agent-engineer   | System design   |

| Prerequisites | Tags |
|---|---|
| CI/CD concepts, LLM application architecture   | `ci-cd`, `deployment`, `testing`, `llmops`, `evaluation`, `pipeline`   |

**Why This Matters:** Traditional CI/CD tests deterministic behavior. LLM applications are non-deterministic and have quality dimensions that require evaluation, not just assertion testing. Teams that apply standard CI/CD without adaptation ship regressions.

**Question**  
Design a CI/CD pipeline for a production RAG application with LLM generation. How does it differ from standard software CI/CD, and what evaluation checkpoints are needed?

**Expected Answer (Short)**  
Standard CI/CD uses unit tests and integration tests with binary pass/fail. LLM CI/CD adds evaluation stages: prompt regression testing (do known queries still produce acceptable answers?), retrieval quality checks, cost per request estimation, and latency benchmarks. Key difference: LLM tests are probabilistic — you check quality distributions, not exact outputs.

**Deep Answer**  
- **Standard stages (still needed)**:
  - Lint and type check
  - Unit tests for data processing, routing logic, guardrails
  - Integration tests for API contracts
  - Infrastructure validation (Terraform, Helm)
- **LLM-specific stages**:
  - **Prompt regression suite**: 50–100 curated query-expected-answer pairs. Run current prompts through LLM and score outputs. Compare scores to baseline. Fail build if scores drop >5%
  - **Retrieval regression suite**: run test queries against the vector index, verify expected documents are retrieved in top-k. Detects index corruption or embedding model changes
  - **Cost estimation**: compute estimated daily cost from prompt token counts × expected volume. Alert if cost increases >20% from last deploy
  - **Latency benchmark**: run representative queries and verify TTFT and total latency meet SLO
  - **Safety/guardrail tests**: run adversarial prompts (prompt injection, jailbreak) and verify guardrails catch them
- **Pipeline structure**:
  ```
  commit → lint/type → unit tests → build → deploy-to-staging → 
  retrieval-regression → prompt-regression → cost-check → 
  latency-check → safety-check → approval-gate → deploy-to-production → 
  canary-monitor (30 min) → full-rollout
  ```
- **Key differences from traditional CI/CD**:
  - Tests are probabilistic, not deterministic. Same query can produce different outputs
  - Evaluation requires scoring functions (LLM-as-judge, embedding similarity), not equality checks
  - Pipeline is slower (LLM calls take seconds each) and more expensive
  - Canary monitoring is essential — problems may only appear at production scale
  - Rollback must be instant — keep previous prompt + config version ready
- **Tools**: Promptfoo for evaluation, GitHub Actions / GitLab CI for pipeline, Langfuse for production monitoring, custom evaluation harness for regression suites

**Follow-up Questions**  
- How do you handle non-determinism in LLM evaluation tests?
- What is the evaluation cost of running this pipeline on every commit?
- How would you implement canary deployments for a RAG application?
- When should evaluation tests block deployment vs just alert?

**Weak Answer Signals / Red Flags**  
- Designs standard CI/CD without LLM-specific stages
- Tests only latency and error rates, ignores quality
- Doesn't address non-determinism in evaluation
- No canary or gradual rollout strategy

**Interviewer Signal**  
Tests ability to adapt mature engineering practices to the new challenges of LLM applications. Strong candidates know that standard CI/CD is necessary but insufficient.

**Real-World Insight**  
Teams without prompt regression testing often discover regressions from user complaints — sometimes weeks after deployment. Adding a 100-query evaluation suite to CI/CD catches most regressions before they reach production. The cost (a few dollars of LLM calls per pipeline run) is negligible compared to the cost of shipping broken prompts.

---

### Q-MLO-B01-010: What is a canary deployment for ML models, and how does it differ from canary deployment for traditional software?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| MLOps / LLMOps / AIOps   | Deployment Strategies   | Applied   | 3   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 2–5, 5–8   | mlops-llmops-platform-engineer, devops-sre-to-aiops, software-foundations-to-ai-engineer   | Technical deep dive   |

| Prerequisites | Tags |
|---|---|
| Deployment strategies, monitoring basics   | `canary`, `deployment`, `progressive-rollout`, `a-b-testing`, `model-release`   |

**Why This Matters:** ML model canaries are harder than software canaries because failures are statistical (quality degradation) rather than binary (errors/crashes). Teams that deploy ML models without canary stages discover problems from users, not dashboards.

**Question**  
Explain how canary deployment works for ML models. How do you decide what metrics to monitor, how long to run the canary, and when to proceed vs roll back?

**Expected Answer (Short)**  
Route 5–10% of traffic to the new model version, compare its metrics against the baseline. Monitor error rates, latency, and model-specific metrics (prediction distribution, quality scores). Run for long enough to collect statistically significant data (hours to days). Roll back if quality metrics degrade beyond threshold; promote if metrics are neutral or improved.

**Deep Answer**  
- **Traffic splitting**: route 5–10% of requests to the canary model. Use consistent routing (same user always sees same model) to avoid confusing user experience
- **Metric categories**:
  - **Infrastructure**: error rate, latency P50/P95/P99, memory usage, throughput
  - **Model behavior**: prediction distribution shift (KL divergence between canary and baseline output distributions), token count distribution, response length distribution
  - **Quality**: automated evaluation scores (sampled), user feedback rates (thumbs up/down), task completion rates, escalation rates
  - **Cost**: token cost per request (critical for LLM — a model update might change verbosity)
- **Duration**: depends on traffic volume. Need statistical significance. At 10K requests/day with 5% canary: ~500 canary requests/day. For detecting a 5% quality degradation with 95% confidence, need ~2000 sampled evaluations → ~4 days
- **Decision criteria**:
  - Promote: canary metrics ≥ baseline (within confidence interval) for all critical metrics
  - Roll back: any critical metric degrades beyond predefined threshold
  - Extend: inconclusive results → increase canary percentage or extend duration
- **ML-specific challenges vs traditional canary**:
  - ML failures are gradual, not binary. A model doesn't crash — it gives slightly worse predictions
  - Evaluation requires domain-specific metrics, not just HTTP error rates
  - Some degradations only appear on specific input subsets (e.g., long queries, rare languages)
  - User feedback signal is noisy and delayed
- **Automation**: configure automatic rollback if error rate > X% or latency P99 > Y ms. Quality metric degradation should trigger alert for human decision (automated rollback on quality is risky due to noise)

**Follow-up Questions**  
- How do you ensure statistical significance with low traffic volume?
- What happens if the canary looks good on aggregate metrics but degrades for a specific user segment?
- How would you canary a prompt change vs a model change?
- What is the difference between canary and shadow (dark launch) deployment?

**Weak Answer Signals / Red Flags**  
- Describes only infrastructure canary metrics (latency, errors)
- No awareness of statistical significance requirements
- Cannot explain what model-specific metrics to track
- Thinks 5 minutes of canary is sufficient

**Interviewer Signal**  
Tests deployment maturity for ML systems. Candidates who've done real model deployments know the nuances; those who haven't describe generic canary patterns.

**Real-World Insight**  
Many ML teams skip canary deployment because "the model passed offline evaluation." But offline evaluation doesn't catch distribution differences, latency changes, or integration failures. The 30 minutes of canary monitoring that could have caught a regression saves days of incident response.

---

### Q-MLO-B01-011: What guardrails should be in place before an LLM application reaches production, and how do you enforce them operationally?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| MLOps / LLMOps / AIOps   | Safety and Governance   | System   | 4   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 5–8, 8–12   | senior-architect-ai-systems-lead, mlops-llmops-platform-engineer, llm-rag-agent-engineer   | System design, Behavioral   |

| Prerequisites | Tags |
|---|---|
| LLM application architecture, security basics   | `guardrails`, `safety`, `governance`, `prompt-injection`, `content-filtering`, `production`   |

**Why This Matters:** LLM applications are uniquely vulnerable to prompt injection, hallucination, and harmful output. Without guardrails, a production LLM app is a liability, not an asset.

**Question**  
Design the guardrail layer for a production LLM application. Cover input validation, output filtering, safety mechanisms, and operational enforcement.

**Expected Answer (Short)**  
Implement input guardrails (prompt injection detection, content classification, input length limits), output guardrails (toxicity filtering, hallucination detection, PII redaction, format validation), and operational guardrails (rate limiting, cost caps, audit logging). Enforce at the API gateway level so guardrails can't be bypassed.

**Deep Answer**  
- **Input guardrails**:
  - Prompt injection detection: classifier-based or pattern-based detection of attempts to override system instructions
  - Input content classification: flag or block harmful, illegal, or out-of-scope queries
  - Input length limits: prevent token-based DoS attacks
  - PII detection in input: flag or redact sensitive data before sending to LLM
  - Input sanitization: strip HTML, escape injection patterns
- **Output guardrails**:
  - Toxicity/harm classification: scan LLM output before returning to user
  - Hallucination detection: for RAG, verify that claims in the output are supported by retrieved context (faithfulness check)
  - PII redaction: scan output for leaked PII (phone numbers, emails, SSNs)
  - Format validation: if structured output expected (JSON), validate schema before returning
  - Citation enforcement: for RAG, require that output includes source references
- **Operational guardrails**:
  - Rate limiting per user/IP/API key
  - Budget caps per user, per day, per request
  - Agent loop breakers: max iterations, max token budget per trajectory
  - Audit logging: every input-output pair logged for compliance review
  - Circuit breaker: if guardrail bypass rate exceeds threshold, disable the endpoint
- **Enforcement architecture**:
  - Guardrails as middleware in the request pipeline, not in the application code
  - Fail-closed: if guardrail service is down, reject the request (don't bypass)
  - Separate guardrail service allows independent updates and monitoring
  - Async secondary checks: run expensive checks (hallucination scoring) asynchronously and flag for review
- **Tools**: NVIDIA NeMo Guardrails, Guardrails AI, custom classifiers, LlamaGuard

**Follow-up Questions**  
- How do you handle false positives in guardrails without frustrating users?
- What is the latency cost of guardrail checks, and how do you minimize it?
- How would you design guardrails for a multi-agent system where agents call each other?
- How do you update guardrails without redeploying the application?

**Weak Answer Signals / Red Flags**  
- Thinks guardrails are optional or "nice to have"
- Only mentions input validation, ignores output filtering
- Suggests only regex-based filtering (easily bypassed)
- No concept of fail-closed design

**Interviewer Signal**  
Tests awareness of production safety requirements. Architects who've shipped to real users know that guardrails are infrastructure, not features.

**Real-World Insight**  
Every major LLM application launch has had guardrail bypass incidents. The pattern is consistent: teams launch with minimal guardrails, face public embarrassment, then retrofit comprehensive guardrails under pressure. Building guardrails before launch is cheaper, faster, and less stressful.

---

### Q-MLO-B01-012: How does rollback work for ML models in production, and why is it harder than rolling back traditional software?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| MLOps / LLMOps / AIOps   | Disaster Recovery   | Debugging   | 3   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 2–5, 5–8   | mlops-llmops-platform-engineer, devops-sre-to-aiops, ml-data-engineer   | Technical deep dive, Debugging   |

| Prerequisites | Tags |
|---|---|
| Deployment basics, model serving   | `rollback`, `model-deployment`, `incident-response`, `versioning`   |

**Why This Matters:** ML rollback is the most underplanned capability in ML platforms. When a model degrades, the ability to revert quickly is the difference between a minor incident and a customer-impacting event.

**Question**  
Why is rolling back an ML model harder than rolling back a traditional software deployment? What components must be rolled back together, and what pitfalls teams encounter?

**Expected Answer (Short)**  
ML rollback involves more than just reverting code — you must restore the model artifact, its associated configuration (prompts, feature transformations, thresholds), and ensure compatibility with current data pipelines. Pitfalls: the previous model may not work with current features (schema changed), rolling back the model but not the prompt creates a mismatch, and some state (fine-tuning data, feedback loops) can't be undone.

**Deep Answer**  
- **What must be rolled back together**:
  - Model artifact (weights, tokenizer, config)
  - Prompt/template version (if LLM application)
  - Feature transformation code (if feature engineering changed)
  - Retrieval configuration (if RAG — chunk size, embedding model, index version)
  - Post-processing logic (thresholds, business rules that depend on model output distribution)
- **Why it's harder than software rollback**:
  - Model + prompt + config are three independently versioned artifacts that must all match
  - Feature schema may have changed — previous model expects features that no longer exist
  - Model artifacts are large (GBs) — rollback means loading a large artifact, which takes time
  - Warm-up: some models need GPU warm-up, cache population, or compilation before serving is optimal
  - State: if the model participated in a feedback loop (e.g., recommendations affecting future training data), rolling back the model doesn't undo the data contamination
- **Rollback strategies**:
  - **Blue-green**: maintain two deployment slots. Switch traffic between them instantly. Previous version stays warm
  - **Version pinning**: model registry stores all versions. Rollback = point serving config to previous version. Requires model pre-loaded or cached
  - **Configuration snapshot**: store the complete serving configuration (model version + prompt version + retrieval config) as a single deployable unit
  - **Automation**: rollback must be a single command or automated trigger, not a manual multi-step process
- **Common pitfalls**:
  - Team rolls back model but forgets to roll back the prompt → mismatch produces worse results than either version alone
  - Previous model artifact was deleted to save storage → can't roll back
  - Feature pipeline was updated alongside model → rolling back model without rolling back features causes skew
  - No rollback testing: team has never practiced rollback and discovers it's broken during an incident

**Follow-up Questions**  
- How do you ensure model artifacts are retained long enough for rollback?
- What is a "deployable unit" for LLM applications, and how do you version it?
- How would you implement automated rollback triggered by quality metric degradation?
- How do you test the rollback process before you need it in an incident?

**Weak Answer Signals / Red Flags**  
- Thinks model rollback is just container rollback
- Doesn't consider prompt/config as part of the rollback unit
- No awareness of feature schema compatibility issues
- Has never tested a rollback process

**Interviewer Signal**  
Tests operational readiness and incident response thinking. Candidates who've experienced a real ML incident know these pitfalls firsthand.

**Real-World Insight**  
A common pattern: team deploys new model, quality degrades, they revert to previous model but keep the new prompt — quality gets even worse. Treating (model version, prompt version, retrieval config) as a single deployable unit prevents this. Blue-green deployments with configuration snapshots are the gold standard.

---

### Q-MLO-B01-013: What is the role of SLOs (Service Level Objectives) for ML-powered services, and how do you define them when model quality is non-deterministic?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| MLOps / LLMOps / AIOps   | SLO and Reliability   | Architect   | 4   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 8–12, 12–20   | senior-architect-ai-systems-lead, devops-sre-to-aiops, mlops-llmops-platform-engineer   | System design, Behavioral   |

| Prerequisites | Tags |
|---|---|
| SRE fundamentals, ML serving experience   | `slo`, `sli`, `reliability`, `quality`, `non-deterministic`, `governance`   |

**Why This Matters:** Traditional SLOs cover availability and latency. ML services need quality SLOs that capture model performance — without them, a service can be 100% available and 0% useful.

**Question**  
How do you define SLOs for an LLM-powered production service? What SLIs (Service Level Indicators) would you track, and how do you handle the non-deterministic nature of LLM output in reliability engineering?

**Expected Answer (Short)**  
Define SLOs across three dimensions: infrastructure (availability, latency), model quality (faithfulness, relevance, task completion rate), and cost (cost per successful request). SLIs for quality are measured by automated evaluation on sampled traffic. Non-determinism is handled by using statistical thresholds per time window rather than per-request assertions.

**Deep Answer**  
- **Infrastructure SLOs (standard)**:
  - Availability: 99.9% uptime (measured as successful responses / total requests)
  - Latency: P95 TTFT < 500ms, P95 total < 3s
  - Error rate: < 0.1% 5xx errors
- **Quality SLOs (ML-specific)**:
  - Faithfulness: ≥ 90% of sampled responses rated "faithful to context" by automated evaluator
  - Relevance: ≥ 85% of responses rated "relevant to query"
  - Task completion: ≥ 80% of user interactions reach successful completion (domain-specific)
  - Hallucination rate: < 5% of responses contain claims unsupported by context
- **Cost SLOs**:
  - Cost per request < $0.05 (or whatever budget target)
  - Monthly spend within 120% of forecast
- **Handling non-determinism**:
  - Measure quality SLIs over time windows (hourly, daily), not per request
  - Use statistical significance tests to detect real degradation vs normal variance
  - Define error budgets: if quality SLO is 90%, you can tolerate 10% poor responses per month before action is required
  - Sample-based measurement: evaluate 5–10% of traffic, extrapolate. Don't evaluate every request (too expensive)
- **SLO management**:
  - Review SLOs quarterly — adjust as model and application evolve
  - Tie SLOs to alerting: burn rate alerts when error budget consumed too fast
  - Use SLOs in deployment decisions: block deployments that erode quality budget
  - Publish SLOs internally so stakeholders understand what "working" means
- **Cultural shift**: in traditional SRE, quality is binary (correct response or error). In ML SRE, quality is a spectrum. Teams must accept that some percentage of responses will be imperfect, and define what "good enough" means operationally

**Follow-up Questions**  
- How do you calculate error budgets for quality SLOs?
- How do quality SLOs interact with deployment velocity?
- What happens when quality SLO is violated but availability SLO is not?
- How would you explain quality SLOs to non-technical stakeholders?

**Weak Answer Signals / Red Flags**  
- Only defines availability and latency SLOs
- Doesn't address the non-deterministic nature of LLM output
- Cannot explain error budget concept
- Treats all quality failures as incidents rather than expected variance

**Interviewer Signal**  
Architect-level question that tests the ability to adapt SRE practices to the new reality of AI-powered services. Strong candidates can bridge the gap between traditional reliability engineering and ML quality management.

**Real-World Insight**  
Most AI teams in 2026 still don't have quality SLOs — they have availability SLOs and then react to user complaints about quality. Defining and tracking quality SLOs is the single most impactful operational maturity improvement for LLM-powered services.

---

### Q-MLO-B01-014: How do you implement governance and audit trails for AI systems in regulated industries?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| MLOps / LLMOps / AIOps   | Governance and Compliance   | Architect   | 4   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 8–12, 12–20   | senior-architect-ai-systems-lead, mlops-llmops-platform-engineer   | System design, Behavioral   |

| Prerequisites | Tags |
|---|---|
| ML deployment, compliance awareness   | `governance`, `audit-trail`, `compliance`, `model-lineage`, `regulated-ml`   |

**Why This Matters:** EU AI Act, FDA AI/ML guidance, and financial services regulations increasingly require demonstrable AI governance. Teams without audit infrastructure face regulatory risk and cannot deploy in regulated markets.

**Question**  
Design a governance and audit system for ML/LLM applications in a regulated industry. What must be tracked, stored, and auditable?

**Expected Answer (Short)**  
Track complete model lineage (training data → training run → evaluation → approval → deployment), all input-output pairs with timestamps, decision explanations (for explainability requirements), model version transitions with approval chains, and bias/fairness evaluations. Store immutably with retention policies matching regulatory requirements.

**Deep Answer**  
- **Model lineage**:
  - Training data version, source, consent status, preprocessing applied
  - Training configuration, hyperparameters, random seeds
  - Evaluation results on standard benchmarks and fairness metrics
  - Approval: who approved production promotion, when, based on what evidence
  - Deployment: which model version is serving at any point in time
- **Input-output logging**:
  - Every inference request and response, with timestamp, user context, model version
  - For LLM: full prompt and response tokens (with PII handling)
  - For RAG: which documents were retrieved, what context was provided
  - Retention: per regulatory requirement (often 7 years for financial, 10 years for healthcare)
- **Explainability**:
  - For traditional ML: feature importance, SHAP values for decisions above threshold
  - For LLM: chain-of-thought reasoning, source attribution, confidence signals
  - Right to explanation: users affected by automated decisions must be able to request an explanation
- **Bias and fairness**:
  - Regular bias audits across protected classes
  - Outcome distribution analysis by demographic group
  - Documented methodology for fairness testing
  - Remediation records when bias is detected
- **Change management**:
  - Every model, prompt, or pipeline change documented with: reason, expected impact, risk assessment, rollback plan
  - Approval workflow: data science → ML engineering → compliance
  - Emergency change process: faster approval for incidents, but still documented
- **Infrastructure**:
  - Immutable audit log (append-only database or write-once storage)
  - Tamper-evident audit trail (hash chaining or signed log entries)
  - Separate access controls: audit logs not modifiable by the team being audited
  - Automated compliance reports generated from stored metadata

**Follow-up Questions**  
- How do you handle PII in audit logs? Can you log LLM inputs that contain sensitive data?
- How does the EU AI Act classify different AI applications, and what requirements apply?
- How would you implement right-to-explanation for an LLM application?
- What happens during an audit if model lineage has gaps?

**Weak Answer Signals / Red Flags**  
- Treats governance as a checkbox exercise rather than engineering infrastructure
- Doesn't mention immutability of audit logs
- No awareness of specific regulations (EU AI Act, FDA, etc.)
- Thinks logging model accuracy is sufficient for compliance

**Interviewer Signal**  
Tests whether the candidate can think about ML systems from a governance perspective — increasingly required for senior and architect roles.

**Real-World Insight**  
The EU AI Act (effective 2025–2026) is driving major investment in AI governance infrastructure. Companies that built audit trails early treat compliance as a competitive advantage in regulated markets. Those that didn't face expensive retrofits and market access constraints.

---

### Q-MLO-B01-015: Your AIOps anomaly detection system generates too many false positive alerts. How do you diagnose and fix this without missing real incidents?

| Topic Family | Subtopic | Level | Difficulty |
|---|---|---|---|
| MLOps / LLMOps / AIOps   | AIOps Alert Quality   | Debugging   | 4   |

| Experience Bands | Role Families | Interview Round |
|---|---|---|
| 5–8, 8–12   | devops-sre-to-aiops, mlops-llmops-platform-engineer, senior-architect-ai-systems-lead   | Debugging, Technical deep dive   |

| Prerequisites | Tags |
|---|---|
| Anomaly detection basics, alert management   | `aiops`, `anomaly-detection`, `false-positives`, `alert-fatigue`, `sre`   |

**Why This Matters:** False positive alert fatigue is the #1 reason AIOps adoption fails. If operators ignore 90% of alerts, the real ones get missed too. Fixing this requires understanding both the ML model and the operational context.

**Question**  
Your AIOps anomaly detection system produces 200 alerts per day, but operators say only 10–20 are actionable. Diagnose the problem and design improvements that reduce false positives without increasing false negatives.

**Expected Answer (Short)**  
Root causes: static thresholds that don't account for normal variation, no awareness of planned changes (deployments, scaling events), and treating every metric anomaly as equally important. Fixes: context-aware anomaly detection (suppress alerts during known change windows), multi-signal correlation (only alert when multiple related metrics are anomalous), severity-based routing, and human feedback loops to retrain the model.

**Deep Answer**  
- **Diagnosis — common root causes**:
  - Static thresholds on non-stationary metrics (traffic varies by time of day, day of week)
  - No suppression during planned events (deployments, maintenance, autoscaling)
  - Univariate detection: alerting on individual metric anomalies without correlation
  - Overly sensitive models: detecting every statistical deviation, even benign ones
  - No severity differentiation: a 5% CPU spike gets the same alert as a complete outage
- **Fix strategy**:
  1. **Temporal modeling**: use seasonal decomposition or learned baselines that account for daily/weekly/monthly patterns. Alert on deviation from expected pattern, not static threshold
  2. **Change window integration**: suppress or reduce alert severity during known deployment windows, scaling events, and maintenance
  3. **Multi-signal correlation**: only alert when multiple related metrics are anomalous simultaneously. CPU + memory + error rate together = real. CPU alone = likely noise
  4. **Severity tiers**: classify alerts as critical (page), warning (ticket), info (dashboard). Route appropriately. Most "false positives" are real anomalies that aren't worth action
  5. **Operator feedback loop**: add "was this alert useful?" feedback. Use it to retrain the model. Track precision over time
  6. **Root cause grouping**: when an incident causes 50 metric anomalies, group them into one alert with root cause hypothesis, not 50 separate alerts
- **Measuring improvement**:
  - Track alert precision: actionable alerts / total alerts. Target >70%
  - Track time-to-acknowledge: if operators acknowledge faster, alerts are more trusted
  - Track missed incidents: ensure MTTD (mean time to detect) doesn't increase
  - A/B test threshold changes: run new model in shadow mode before replacing old one
- **Risk of over-suppression**: reducing false positives can increase false negatives (missed real incidents). Always validate changes against historical incidents — would the new system have caught past incidents?

**Follow-up Questions**  
- How do you build a feedback loop between operators and the anomaly detection model?
- What is the difference between static thresholds, dynamic baselines, and ML-based anomaly detection?
- How do you validate that alert suppression doesn't hide real incidents?
- How would you prioritize which alerts to improve first?

**Weak Answer Signals / Red Flags**  
- Suggests just raising thresholds (reduces all alerts, including real ones)
- No concept of temporal patterns or seasonality
- Doesn't mention operator feedback as a signal
- Treats all alerts as equally important

**Interviewer Signal**  
Tests practical AIOps experience. Candidates who've operated monitoring systems viscerally understand alert fatigue; those who haven't describe textbook anomaly detection without operational awareness.

**Real-World Insight**  
The most effective AIOps improvement is usually not a better ML model — it's better alert routing and correlation. Grouping 50 alerts into 1 incident with a root cause hypothesis reduces alert fatigue more than marginal improvements to anomaly detection accuracy.
