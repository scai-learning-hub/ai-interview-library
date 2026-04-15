# Module 00 — Foundations: System Level

## Q-00-S-001: How do you scale a training pipeline from a single GPU to distributed training?

**Module:** Foundations
**Submodule:** Distributed Computing
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** ML / Data Engineer, Senior / Architect
**Tags:** [foundations, distributed-training, gpu, scaling, data-parallelism]
**Prerequisites:** Q-00-C-003, Q-00-A-012
**Estimated Interview Round:** System Design, Deep Dive
**Why This Question Matters:** Scaling from 1 GPU to multi-GPU/multi-node is a core infra skill for any team training models. The decision between data parallelism and model parallelism has major cost and architecture implications.

**Question**

Your model training takes 3 days on a single A100 GPU. The team wants to reduce this to under 12 hours. Walk through your strategy for distributing training, including the trade-offs between data parallelism and model parallelism.

**Expected Answer (Short)**

Data parallelism (DP/DDP) replicates the model on each GPU and splits the data — each GPU trains on a different batch, gradients are synchronized via all-reduce. This is the standard approach and scales linearly up to 8–16 GPUs for most models. Model parallelism splits the model across GPUs (tensor parallelism or pipeline parallelism) — needed when the model doesn't fit in one GPU's memory. For a model that fits on one GPU, start with DDP. Use 8 GPUs → expect ~6–7x speedup (not 8x due to communication overhead). Adjust batch size and learning rate accordingly.

**Deep Answer**

- **Data Parallelism (DDP):** each GPU has full model copy, processes different data. Gradients synchronized via all-reduce after each step. Standard approach.
  - Linear scaling: N GPUs ≈ N × throughput (minus communication overhead, typically 10–20%)
  - Effective batch size = per-GPU batch × N GPUs. Must adjust learning rate (linear scaling rule: LR × N)
  - Communication bottleneck: gradient all-reduce over network. Mitigated by gradient compression, overlap with computation
- **Model Parallelism:** split model across GPUs
  - Tensor parallelism: split individual layers (attention heads, FFN) across GPUs. For very large layers.
  - Pipeline parallelism: split model into stages (layers 1-12 on GPU 0, 13-24 on GPU 1). Bubble overhead unless using micro-batching.
  - ZeRO (DeepSpeed): partitions optimizer states, gradients, and parameters across GPUs. Best of both worlds for many scenarios.
- **FSDP (Fully Sharded Data Parallel):** PyTorch native ZeRO equivalent. Shards model parameters across GPUs, all-gathers during forward/backward.
- Decision framework: model fits in 1 GPU → DDP. Model doesn't fit → FSDP/ZeRO or model parallelism. Model is >100B → full 3D parallelism (data + tensor + pipeline).
- Practical gotchas: batch size scaling requires learning rate warmup adjustment. Very large effective batch sizes can hurt generalization.
- Mixed precision (bf16/fp16) reduces memory by 2x, enabling larger batches per GPU and faster communication.

**Follow-up Questions**

1. You scale from 1 GPU to 8 GPUs with DDP but only get 4x speedup. What's the bottleneck?
2. How does the learning rate need to change when you scale from 1 to 8 GPUs?
3. When would you use FSDP instead of DDP?
4. What is gradient accumulation and when is it useful as an alternative to multi-GPU?

**Common Weak Answers / Red Flags**

- "Just use more GPUs" without understanding batch size implications or communication overhead
- Confuses data parallelism and model parallelism
- Doesn't know about mixed precision or its memory benefits

**Interviewer Evaluation Signal**

Tests whether the candidate has hands-on scaling experience or only theoretical knowledge. The nuanced understanding of communication overhead, batch size scaling, and when to use which parallelism strategy separates senior practitioners.

**Real-World Insight**

Most teams training 7B models use FSDP or DeepSpeed ZeRO Stage 3 on 4–8 A100s. The transition from single-GPU to distributed is where most teams encounter their first multi-day debugging sessions — NCCL timeout errors, OOM on specific ranks, and gradient synchronization hangs. Having a systematic approach (start with DDP, profile, add FSDP/ZeRO only when needed) saves significant engineering time.

---

## Q-00-S-002: How do you design a feature engineering pipeline that scales to millions of records and serves at low latency?

**Module:** Foundations
**Submodule:** Data Engineering
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** ML / Data Engineer, DevOps / SRE → AIOps, Senior / Architect
**Tags:** [foundations, feature-engineering, pipeline, feature-store, latency, scaling]
**Prerequisites:** Q-00-A-005
**Estimated Interview Round:** System Design
**Why This Question Matters:** The feature engineering pipeline is often the most complex and fragile part of a production ML system. Inconsistency between training and serving features (train-serve skew) is a top-5 production ML failure mode.

**Question**

Design a feature engineering pipeline for a fraud detection system that processes 10M transactions daily, trains weekly, and serves predictions in <50ms. How do you ensure consistency between training and serving features?

**Expected Answer (Short)**

Use a feature store (Feast, Tecton) with two computation paths: (1) Batch features computed offline (aggregations, historical stats) and stored in the feature store, (2) Real-time features computed inline at request time (current transaction amount, time since last transaction). Both must use the same transformation code. Training reads point-in-time-correct features from the feature store. Serving reads the latest stored features + computes real-time features. Consistency is enforced by sharing transformation logic between training and serving.

**Deep Answer**

- **Offline features:** daily/weekly batch jobs compute aggregations (avg_spend_7d, num_transactions_30d). Stored in feature store with timestamps.
- **Online features:** real-time computation at serving time (current_amount, seconds_since_last_txn). Must be fast (<10ms budget within the 50ms total).
- **Feature store architecture:** offline store (data warehouse/S3) for training, online store (Redis/DynamoDB) for serving. Feature store materializes offline features to online store.
- **Train-serve skew prevention:** single source of truth for feature definitions. Training requests features with `as_of_time` to get point-in-time correct values (no future leakage). Serving requests current features.
- **Point-in-time joins:** when building training data, each example gets features as they were at the time of the event, not current values. This is what feature stores handle automatically.
- **Transformation logic:** shared code (Python functions or SQL) used by both batch pipeline and serving pipeline. Never duplicate logic.
- **Monitoring:** compare feature distributions between training and serving. Alert on drift (feature skew detection).
- **Latency budget:** feature retrieval from online store (~5ms) + model inference (~10ms) + real-time feature computation (~5ms) + overhead = <50ms.

**Follow-up Questions**

1. Your real-time features are computed differently in training vs. serving and you discover a 3% accuracy drop in production. How do you diagnose this?
2. How do you handle late-arriving data in your batch feature pipeline?
3. What happens if the online feature store goes down? What's your fallback?

**Common Weak Answers / Red Flags**

- Doesn't mention train-serve skew as a risk — the biggest production issue in feature engineering
- "Just query the database at serving time" — won't meet latency requirements
- No awareness of point-in-time correctness for training features

**Interviewer Evaluation Signal**

Tests end-to-end production ML architecture thinking. Feature store design and train-serve consistency are hallmarks of mature ML engineering. Candidates who miss this usually haven't deployed production ML systems.

**Real-World Insight**

Uber, Lyft, and DoorDash have all published extensively about train-serve skew as their #1 production ML issue. Uber's Michelangelo and Feast were built specifically to solve this. The most insidious skew is temporal: a feature that works perfectly in offline evaluation but is unavailable or stale at serving time due to processing delays.

---

## Q-00-S-003: How do you design model evaluation for a system where the ground truth is delayed?

**Module:** Foundations
**Submodule:** Evaluation
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** ML / Data Engineer, Senior / Architect
**Tags:** [foundations, evaluation, delayed-feedback, production, metrics]
**Prerequisites:** Q-00-A-004, Q-00-A-009
**Estimated Interview Round:** System Design, Deep Dive
**Why This Question Matters:** Many production ML tasks have delayed ground truth — a loan default takes months to observe, a recommended item takes days to be purchased. You need evaluation strategies that work without immediate labels.

**Question**

You deploy a loan default prediction model. The ground truth (whether the loan defaults) isn't known for 6–18 months. How do you monitor and evaluate the model's performance in the interim?

**Expected Answer (Short)**

Use proxy metrics, early indicators, and staged evaluation: (1) Monitor prediction distribution stability — sudden shifts in predicted probabilities signal issues. (2) Track early behavioral proxies — late payments at 30/60/90 days correlate with eventual default. (3) Compare prediction distributions against historical cohorts. (4) Use human audits on a sample of borderline decisions. (5) When labels eventually arrive, perform retroactive evaluation and update the model registry. (6) Implement a "champion-challenger" framework where a new model runs in shadow mode before replacing the current one.

**Deep Answer**

- **Prediction distribution monitoring:** if the model's output distribution shifts (e.g., suddenly predicting 15% default rate vs. historical 6%), something has changed — either the population or the model.
- **Population Stability Index (PSI):** quantifies distribution shift between training and production data. PSI > 0.25 typically triggers investigation.
- **Proxy metrics / early signals:**
  - 30-day delinquency as proxy for 12-month default (high correlation in practice)
  - Payment velocity in the first 90 days
  - Credit utilization changes post-loan
- **Cohort analysis:** compare behavior of loans approved under the new model vs. the old model at the same age
- **Shadow / challenger testing:** run the new model in parallel without acting on its decisions. Compare predictions to the champion model. Flag disagreements for review.
- **Human-in-the-loop:** random audit of borderline cases (model says 0.4–0.6 risk). Review by credit analysts to spot obvious errors.
- **Retroactive evaluation pipeline:** automated system that computes actual metrics once labels arrive, compares to predicted performance, and triggers retraining if degradation is detected.
- **Concept drift risk:** the relationship between features and default may shift (economic downturns change which signals predict default).

**Follow-up Questions**

1. Your proxy metric shows no issues, but actual 12-month default rates are 40% higher than predicted. What went wrong?
2. How do you design the retroactive evaluation pipeline? What triggers should it have?
3. During an economic downturn, your model's feature importance shifts dramatically. Should you retrain immediately?

**Common Weak Answers / Red Flags**

- "Wait for ground truth, then evaluate" — unacceptable for a model making real-time decisions
- No concept of proxy metrics or early signals
- Doesn't mention distribution monitoring

**Interviewer Evaluation Signal**

Tests production evaluation sophistication. Many ML engineers only think about train/test evaluation, not ongoing monitoring with delayed feedback. This is a critical gap for production roles in finance, insurance, and healthcare.

**Real-World Insight**

After the 2008 financial crisis, many credit models that performed well in benign conditions failed catastrophically because they were trained on data from stable economic periods. The models had never seen the feature distributions that arise during a downturn. This led to the industry-wide adoption of stress testing, cohort monitoring, and delayed-feedback evaluation frameworks.

---

## Q-00-S-004: What is train-serve skew and how do you prevent it?

**Module:** Foundations
**Submodule:** ML Fundamentals
**Level:** System
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer, DevOps / SRE → AIOps
**Tags:** [foundations, train-serve-skew, pipeline, feature-store, production, debugging]
**Prerequisites:** Q-00-A-005, Q-00-A-009
**Estimated Interview Round:** Technical, System Design
**Why This Question Matters:** Train-serve skew is the single most common source of production ML degradation. If a candidate can't detect or prevent it, their models will silently fail.

**Question**

What is train-serve skew? Give three concrete examples and explain how you would prevent each one.

**Expected Answer (Short)**

Train-serve skew is when the data or features a model sees in production differ from what it saw during training, causing degraded performance. Examples: (1) Feature computation differs — training uses batch SQL, serving uses real-time API, both have slightly different logic. Prevention: shared transformation code. (2) Data distribution shifts — training data is from Q1, production traffic is Q4 (seasonal shift). Prevention: drift monitoring + retraining. (3) Missing features at serving time — a feature available in batch isn't available in real-time. Prevention: validate feature availability before training on it.

**Deep Answer**

- **Code skew:** training and serving use different code paths for the same feature. Even subtle differences (rounding, null handling, timezone) cause skew.
  - Prevention: single-source feature definitions, feature stores, unit tests comparing training vs serving outputs.
- **Data distribution skew:** production data distribution differs from training data. Seasonal patterns, user behavior changes, market shifts.
  - Prevention: drift monitoring (PSI, KL divergence), automated retraining triggers, holdout evaluation on recent data.
- **Feature availability skew:** a feature (e.g., 30-day rolling average) is available in batch training but not available in real-time (requires aggregation over historical data).
  - Prevention: design features with serving constraints in mind. Validate latency and availability before including a feature.
- **Label skew:** labels in training have different noise/quality than production feedback.
- **Preprocessing skew:** training normalizes with one scaler, serving uses a different one (or none).
  - Prevention: serialize and version all preprocessors alongside the model.
- **Temporal skew:** training data includes "future" features relative to the prediction point.
  - Prevention: strict point-in-time feature construction.

**Follow-up Questions**

1. Your model's production accuracy is 8% lower than offline evaluation. How do you determine if this is train-serve skew or a different problem?
2. How would you build a test suite that detects train-serve skew before deployment?
3. Can train-serve skew cause a model to perform BETTER in production than in offline evaluation?

**Common Weak Answers / Red Flags**

- Cannot give concrete examples beyond "data changes"
- Doesn't mention shared transformation code or feature stores
- Assumes offline evaluation accuracy = production accuracy

**Interviewer Evaluation Signal**

Directly tests production readiness. Engineers who understand train-serve skew have operated real systems. Those who don't have only trained models offline.

**Real-World Insight**

Google's paper "Reliable Machine Learning" identifies train-serve skew as the #1 cause of ML system failures. In one case study, a feature computed differently at training time (using a batch SQL join) vs. serving time (using a streaming aggregation) caused a 12% accuracy drop that went undetected for weeks because monitoring only tracked model-level metrics, not feature-level distributions.

---

## Q-00-S-005: How do you decide when to retrain a model vs. rebuild it?

**Module:** Foundations
**Submodule:** ML Fundamentals
**Level:** System
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, DevOps / SRE → AIOps, Senior / Architect
**Tags:** [foundations, retraining, drift, production, model-lifecycle]
**Prerequisites:** Q-00-A-010
**Estimated Interview Round:** Deep Dive, System Design
**Why This Question Matters:** Retraining is not free — it consumes compute, engineering time, and creates deployment risk. Knowing when to retrain vs. rebuild vs. do nothing is a key production judgment.

**Question**

Your deployed model's accuracy has dropped from 88% to 82% over 3 months. When do you simply retrain on new data, when do you rebuild the model, and when do you investigate something else entirely?

**Expected Answer (Short)**

First diagnose the cause: (1) If new data looks different but the underlying pattern is the same → retrain on recent data. (2) If the problem itself has changed (new features needed, new classes) → rebuild with updated architecture/features. (3) If the drop is caused by data quality issues, feature pipeline bugs, or system errors → fix the infrastructure, not the model. Check feature distributions, data quality, and pipeline health before touching the model.

**Deep Answer**

- **Step 1: Is the data pipeline healthy?** Check for missing features, stale data, broken joins. 50%+ of "model degradation" is actually infrastructure failure.
- **Step 2: Is the data distribution shifting?** Monitor feature distributions, label distribution, and prediction distribution. If features shifted, retrain.
- **Step 3: Is the relationship between features and target changing?** (concept drift) If the same features now predict different outcomes, you may need feature redesign.
- **Retrain** (incremental update): data shifted but the model architecture and features are still appropriate. Retrain on recent data, evaluate, deploy.  
- **Rebuild** (architecture change): the problem has fundamentally changed. New features needed, different model family, or the existing approach has hit a ceiling.
- **Fix infrastructure** (not a model problem): pipeline bugs, stale features, data quality degradation. Retraining won't help.
- **Cost of retraining:** compute cost + validation cost + deployment risk + team time. Don't retrain more often than necessary.
- **Automated retraining triggers:** drift detection exceeds threshold → retrain. Accuracy on recent labeled data drops below threshold → retrain. Schedule-based as a safety net.

**Follow-up Questions**

1. You retrain on recent data and accuracy returns to 87%. But it drops again within 2 weeks. What does this pattern indicate?
2. How do you distinguish between data drift and concept drift in practice?
3. At what accuracy threshold should you retrain? How do you set this threshold?

**Common Weak Answers / Red Flags**

- "Just retrain every week" — wasteful if drift isn't happening
- Reaches for model changes before checking infrastructure health
- Cannot distinguish between retraining (same approach, new data) and rebuilding (new approach)

**Interviewer Evaluation Signal**

Tests production judgment about model lifecycle management. The diagnosis-first approach separates engineers who systematically resolve issues from those who randomly retrain.

**Real-World Insight**

At a major ride-sharing company, a pricing model's accuracy dropped 15% over a month. The initial response was to retrain — which didn't help. Root cause was a data pipeline change that silently started sending stale location features (cached from hours prior instead of current). The model was fine; the data pipeline was broken. Diagnosing infrastructure before touching the model saved weeks of misdirected effort.

---

## Q-00-S-006: How do you think about compute cost vs. model accuracy trade-offs?

**Module:** Foundations
**Submodule:** ML Fundamentals
**Level:** System
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior, Architect
**Persona Relevance:** Senior / Architect, ML / Data Engineer, DevOps / SRE → AIOps
**Tags:** [foundations, cost, trade-offs, scaling, production, model-selection]
**Prerequisites:** Q-00-A-002
**Estimated Interview Round:** System Design, Deep Dive
**Why This Question Matters:** In production, every model choice has a dollar cost. Engineers who cannot reason about cost-accuracy trade-offs will overspend or under-deliver.

**Question**

Your team has three model options for a production classification task: (A) Logistic regression — 85% accuracy, $50/month serving cost. (B) XGBoost — 91% accuracy, $200/month. (C) Fine-tuned BERT — 94% accuracy, $2,000/month. How do you decide which to deploy?

**Expected Answer (Short)**

The decision depends on: (1) What does each accuracy point gain the business? (2) What does each error type cost? If the 85→91% improvement prevents $10K/month in fraud, the $150 extra for XGBoost is justified. If 91→94% prevents an additional $500/month in fraud, BERT's $1,800 premium is not justified. Calculate the marginal value of accuracy improvement vs. marginal cost. Also factor in: model maintainability, retraining cost, team expertise, and latency requirements.

**Deep Answer**

- **Marginal value analysis:** what's the business value of each accuracy percentage point? This varies — in ad ranking, 0.1% improvement on billions of impressions = millions in revenue. In internal tagging, 5% improvement saves 10 hours/week of human labeling.
- **Cost components:** serving (inference), retraining (GPU hours + engineer time), maintenance (monitoring, debugging, updates), opportunity (team time spent on this vs other projects).
- **Error cost asymmetry:** if false negatives cost $1000 each (missed fraud) and false positives cost $5 each (manual review), a model that catches 6% more fraud (91→94%) at $1800/month might save $25K/month.
- **TCO (Total Cost of Ownership):** BERT requires GPU inference, MLOps infrastructure, model versioning. Logistic regression runs on a $5/month rig with no GPU. TCO includes infra, people, and ongoing operations.
- **Phased deployment:** ship logistic regression for V1 (fast, cheap, validates the feature). Collect production data. Upgrade to XGBoost if needed. Only justify BERT when the accuracy gap is provably worth the infrastructure investment.
- **Latency impact:** BERT adds 50ms per request. In an interactive system, that's perceptible. In a batch system, it doesn't matter.

**Follow-up Questions**

1. The business stakeholder says "just use the most accurate model." How do you frame the discussion?
2. How does model cost scale with traffic? What happens when you 10x your user base?
3. At what point does it become cheaper to build an in-house model than to call an API (like GPT-4)?

**Common Weak Answers / Red Flags**

- "Pick the most accurate model" — ignores cost, latency, and maintenance
- Cannot estimate serving costs or articulate TCO
- No framework for marginal value analysis

**Interviewer Evaluation Signal**

Tests engineering and business maturity. The best ML engineers make cost-aware decisions. This question separates engineers who ship sustainably from those who build expensive but unmaintainable systems.

**Real-World Insight**

A startup spent $40K/month on LLM API calls for a classification task that a $200/month fine-tuned distilBERT model could handle at comparable quality. The switch wasn't obvious because the LLM was easier to set up initially. But at scale, the 200x cost difference made the business model unviable. Compute cost analysis should be part of every initial model selection decision.

---

## Q-00-S-007: How do you design an ML system for regulatory compliance?

**Module:** Foundations
**Submodule:** Governance
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, ML / Data Engineer
**Tags:** [foundations, governance, compliance, audit, model-registry, production]
**Prerequisites:** Q-00-A-014
**Estimated Interview Round:** System Design
**Why This Question Matters:** Regulated industries (finance, healthcare, insurance) require full model provenance, explainability, and audit trails. Engineers who can't design for compliance will be blocked from the highest-value production systems.

**Question**

You're building a credit scoring model for a bank. Regulators require that you can explain any individual decision, demonstrate that the model is not discriminatory, and reproduce any historical prediction. How do you design the ML system to meet these requirements?

**Expected Answer (Short)**

Design for: (1) Explainability — use interpretable models (logistic regression, XGBoost with SHAP) or add explanation layers. (2) Fairness — test for disparate impact across protected groups, monitor fairness metrics in production. (3) Reproducibility — version everything (data, code, model, features, config). (4) Audit trail — log every prediction with inputs, outputs, model version, and timestamp. (5) Human override — provide a mechanism for manual review of flagged decisions.

**Deep Answer**

- **Model selection:** prefer inherently interpretable models (logistic regression, small gradient-boosted trees) over black boxes for regulated decisions. If using complex models, SHAP/LIME for post-hoc explanation.
- **Feature documentation:** every feature must have a documented purpose, data source, and justification. No "we just threw it in."
- **Fairness testing:** calculate disparate impact ratios, equalized odds, and demographic parity across protected attributes (race, gender, age). The 80% rule (minority group approval rate ≥ 80% of majority) is a common regulatory threshold.
- **Fairness monitoring:** continuous, not one-time. Distribution of approvals by demographic group, monitored in production dashboards.
- **Reproducibility:** immutable artifacts — data snapshots, model binaries, feature definitions, code commits. Model registry (MLflow) with full lineage.
- **Prediction logging:** every production prediction stored with: input features, model version, prediction score, decision (approved/denied), timestamp. Queryable for individual lookups.
- **Challenger testing:** new models must demonstrate equivalent or better fairness metrics before replacing the champion model.

**Follow-up Questions**

1. A regulator asks why customer X was denied. Walk through exactly how you retrieve and explain that decision.
2. SHAP values show that ZIP code is the most important feature. ZIP code correlates with race. What do you do?
3. How do you handle model updates without losing the ability to explain historical decisions?

**Common Weak Answers / Red Flags**

- "Just use an explainable model" without discussing fairness, auditing, or reproducibility
- No awareness of specific fairness metrics or regulatory thresholds
- Cannot articulate how to reconstruct a historical prediction

**Interviewer Evaluation Signal**

Tests whether the candidate can design for non-functional requirements beyond accuracy. Compliance-aware ML design is becoming mandatory in high-value industries, and this question reveals whether the candidate has operated in regulated environments.

**Real-World Insight**

The EU AI Act (2025) and US federal guidance on algorithmic fairness (ECOA, Fair Housing Act) are creating legal requirements for ML explainability and fairness. Companies without proper model governance face regulatory fines, lawsuits, and reputational damage. Apple Card's gender discrimination incident (2019) demonstrated that even implicit bias in ML features can generate regulatory and public backlash.
