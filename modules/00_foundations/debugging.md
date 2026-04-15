# Module 00 — Foundations: Debugging Level

## Q-00-D-001: Your model accuracy is 98% in development but 61% in production. Diagnose.

**Module:** Foundations
**Submodule:** ML Fundamentals
**Level:** Debugging
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** ML / Data Engineer, Senior / Architect
**Tags:** [foundations, debugging, train-serve-skew, data-leakage, production, incident-response]
**Prerequisites:** Q-00-A-003, Q-00-S-004
**Estimated Interview Round:** Debugging, Deep Dive
**Why This Question Matters:** The #1 production ML horror story. This incident-style question tests systematic debugging under an ambiguous scenario — exactly what production engineers face.

**Question**

Your image classification model achieved 98% accuracy on the test set. After deploying to production, accuracy measured on live traffic is 61%. No code changes were made between evaluation and deployment. Walk through your diagnosis step by step.

**Expected Answer (Short)**

Check in this order: (1) Data pipeline — are production images preprocessed the same way as training images (resize, normalize, color channels)? (2) Data distribution — are production images significantly different from training data (different angles, lighting, resolution)? (3) Data leakage — did the test set contain information that leaked from training (same images, overlapping classes with test labels)? (4) Feature/preprocessing skew — is the serving preprocessing code different from training preprocessing? (5) Label quality — was the test set labeled more carefully than production data?

**Deep Answer**

- **Step 1: Verify the measurement.** Is the 61% number measured correctly? Are production labels accurate? Are you comparing the same metric?
- **Step 2: Check preprocessing pipeline.** Training: `normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])`. Serving: is it the same normalization? Same resize? Same color space (RGB vs BGR)?
  - OpenCV loads as BGR by default. PIL loads as RGB. This mismatch alone can cause catastrophic drops.
- **Step 3: Check for data leakage in the test set.**
  - Were train and test from the same time period, same camera, same distribution?
  - Did augmented training images appear in the test set?
  - Are train and test images from the same PDF documents, where pages from the same document could be in both sets?
- **Step 4: Check distribution mismatch.**
  - Training images: professional, well-lit, centered.  
  - Production images: user-uploaded, blurry, rotated, varying resolution, sometimes screenshots.
  - This domain gap often accounts for 20–30% accuracy drops.
- **Step 5: Check for silent failures.**
  - Is the model receiving null/corrupt input and returning default predictions?
  - Are batch normalization statistics from training used at serving time? (They should be.)
- **Recovery plan:** collect production samples, evaluate model on them, retrain with production-similar data, add robustness (augmentation for lighting, rotation, blur).

**Follow-up Questions**

1. You discover the train and test sets were created from the same video recordings (sequential frames). Why does this matter?
2. After fixing preprocessing and retraining with production data, accuracy improves to 78% but not 98%. Is this acceptable?
3. How would you set up monitoring to catch this kind of degradation early in the future?

**Common Weak Answers / Red Flags**

- "The model is just bad, retrain it" — doesn't diagnose the root cause
- Jumps to model architecture changes without checking data/preprocessing
- Doesn't mention preprocessing differences as a common cause

**Interviewer Evaluation Signal**

The gold standard debugging question. Tests systematic diagnosis, hypothesis generation, and production awareness. The best candidates generate hypotheses in priority order (most common causes first) rather than random guessing.

**Real-World Insight**

A medical AI company reported 99% test accuracy on their chest X-ray classifier. Production accuracy was 64%. Root cause: training images came from a single hospital with standardized equipment, and the test set was a random split from the same data. Production images came from 200+ hospitals with different equipment, positioning, and image quality. The model had learned hospital-specific artifacts, not disease features.

---

## Q-00-D-002: Your model training loss is NaN after a few hundred steps. What's wrong?

**Module:** Foundations
**Submodule:** Optimization
**Level:** Debugging
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [foundations, debugging, training, nan, gradient-explosion, numerical-stability]
**Prerequisites:** Q-00-C-003, Q-00-A-012
**Estimated Interview Round:** Technical, Debugging
**Why This Question Matters:** NaN losses are one of the most common and frustrating training failures. Systematic diagnosis is essential — random attempts waste GPU hours.

**Question**

You start training a model and after 300 steps the loss becomes NaN. What are the most likely causes and how do you systematically identify which one is responsible?

**Expected Answer (Short)**

Most likely causes: (1) Learning rate too high → gradients explode. (2) Numerical instability in loss computation (log(0), division by zero, exp overflow). (3) Corrupted input data (NaN or inf values in features). (4) Inappropriate weight initialization for the architecture. (5) Mixed precision (fp16) overflow in gradients. Diagnosis: add NaN checks after each component (data loading, forward pass, loss, backward pass) to pinpoint where NaN first appears.

**Deep Answer**

- **Diagnosis strategy:** instrument the training loop with NaN detection at each stage:
  ```python
  assert not torch.isnan(inputs).any(), "NaN in inputs"
  outputs = model(inputs)
  assert not torch.isnan(outputs).any(), "NaN in forward pass"
  loss = criterion(outputs, targets)
  assert not torch.isnan(loss), "NaN in loss"
  loss.backward()
  for name, param in model.named_parameters():
      if param.grad is not None:
          assert not torch.isnan(param.grad).any(), f"NaN grad: {name}"
  ```
- **Learning rate too high:** gradients grow exponentially. Fix: reduce LR by 10x, add gradient clipping (`torch.nn.utils.clip_grad_norm_`).
- **Numerical instability:** `log(0)` in cross-entropy, `1/x` where x→0, `exp(large_number)` overflow. Fix: add epsilon (`log(x + 1e-8)`), use numerically stable implementations (`F.log_softmax` instead of manual `log(softmax(x))`).
- **Data corruption:** NaN/inf in input features, missing value encoded as NaN. Fix: validate data before training (`torch.isfinite(x).all()`).
- **Mixed precision:** fp16 has limited range (max ~65k). Large loss values or gradient accumulation can overflow. Fix: use loss scaling (standard in AMP), use bf16 instead of fp16 (wider dynamic range).
- **Weight initialization:** Xavier/He initialization should match activation functions. Wrong init + deep network → unstable gradients.

**Follow-up Questions**

1. NaN appears in the backward pass but NOT the forward pass. What does this tell you?
2. You add gradient clipping and NaN disappears but the model doesn't learn. What's happening?
3. How does bf16 differ from fp16 in terms of numerical stability?

**Common Weak Answers / Red Flags**

- "Just reduce the learning rate" without diagnosing where NaN originates
- Cannot explain how to localize NaN in the computation graph
- Doesn't mention mixed precision as a common cause of NaN in modern training

**Interviewer Evaluation Signal**

Tests hands-on debugging skill. Candidates who can systematically localize NaN demonstrate real training pipeline experience. Those who guess randomly haven't trained models on real data.

**Real-World Insight**

The transition from fp32 to mixed precision (fp16/bf16) introduced an entire class of NaN bugs that didn't exist before. Teams adopting mixed precision for the first time often see 5–10% of their training runs produce NaN until they implement proper loss scaling and bf16. This is so common that major frameworks (PyTorch AMP, DeepSpeed) include NaN detection and automatic loss scaling as default features.

---

## Q-00-D-003: Your model performance degrades every time you retrain. What's wrong?

**Module:** Foundations
**Submodule:** ML Fundamentals
**Level:** Debugging
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** ML / Data Engineer, Senior / Architect
**Tags:** [foundations, debugging, retraining, data-quality, pipeline, drift]
**Prerequisites:** Q-00-S-005, Q-00-A-003
**Estimated Interview Round:** Debugging, Deep Dive
**Why This Question Matters:** Progressive degradation through retraining cycles is a subtle and dangerous failure mode. It indicates systematic issues in the data or pipeline that compound over time.

**Question**

Every time you retrain your production model on the latest data, performance gets slightly worse. Retrain 1: 88% → Retrain 2: 86% → Retrain 3: 83%. What hypotheses do you investigate?

**Expected Answer (Short)**

Hypotheses: (1) Data quality is degrading — new data has more noise, mislabels, or missing values. (2) Label feedback loop — the model's own predictions influence future labels (self-fulfilling prophecy). (3) Distribution shift accumulated over time — the world changed gradually. (4) Data pipeline bug that corrupts or drops features progressively. (5) Training data window including stale data that dilutes the signal from recent patterns.

**Deep Answer**

- **Feedback loops:** if the model's predictions influence what data is collected or how labels are generated, you get a death spiral. Example: a recommendation model only shows items it's already confident about → training data becomes less diverse → model becomes more biased → diversity drops further.
- **Label quality degradation:** early training data was hand-labeled carefully. Newer data is auto-labeled or weakly supervised. Quality drops silently.
- **Feature staleness/corruption:** a feature pipeline change causes gradual corruption. Maybe a join key changed, a third-party data source degraded, or a schema migration introduced subtle bugs.
- **Catastrophic forgetting (in fine-tuning):** each retraining overrides previously learned patterns. If the data windows don't overlap enough, the model "forgets" historical patterns.
- **Selection bias in production data:** the model creates the distribution it trains on. Users who get bad recommendations leave → surviving users have different behavior → training data shifts.
- **Debugging approach:**
  1. Compare data quality metrics across retraining cycles (missing values, feature distributions, label distributions)
  2. Evaluate each retrained model on a FIXED holdout set from the original period — if fixed-holdout performance is stable, the model is fine and the drop is from distribution shift
  3. Check for feedback loops by analyzing whether model predictions correlate with future training labels
  4. Check feature pipeline health across retraining cycles

**Follow-up Questions**

1. How do you specifically detect and break a feedback loop?
2. Your fixed holdout performance is stable at 88% across all retrains, but production keeps degrading. What does this mean?
3. How would you design a retraining pipeline that includes quality gates to prevent progressive degradation?

**Common Weak Answers / Red Flags**

- "The model is overfitting to recent data" — doesn't explain why performance drops specifically with retraining
- Doesn't consider feedback loops — one of the most insidious ML system failure modes
- Reaches for model architecture changes without diagnosing data/pipeline first

**Interviewer Evaluation Signal**

Tests deep production debugging skills. Feedback loops and progressive degradation are advanced failure modes that only engineers with sustained production experience have encountered. This question separates senior from mid-level practitioners.

**Real-World Insight**

Amazon's recruiting AI famously discriminated against women because the training data reflected historical hiring patterns (feedback loop: biased outcomes → biased training data → biased model → more biased outcomes). In recommendation systems, this is called "popularity bias amplification" — popular items get recommended more → get more clicks → appear more in training data. Breaking these loops requires deliberate exploration (showing diverse items) and counterfactual evaluation.

---

## Q-00-D-004: Your model works perfectly during the week but fails on weekends. Why?

**Module:** Foundations
**Submodule:** Data Engineering
**Level:** Debugging
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, DevOps / SRE → AIOps
**Tags:** [foundations, debugging, temporal-pattern, data-quality, feature-engineering]
**Prerequisites:** Q-00-A-008, Q-00-S-004
**Estimated Interview Round:** Debugging
**Why This Question Matters:** Temporal performance variation is extremely common in production and traces to data pipeline issues, feature availability, or genuine behavior changes. The diagnosis process is more important than the answer.

**Question**

Your production model's accuracy is consistently 85%+ Monday through Friday but drops to 55% on weekends. The model was trained on data from all days of the week. What are the possible causes?

**Expected Answer (Short)**

Possible causes: (1) Features computed from external systems that are stale/unavailable on weekends (batch jobs don't run, APIs are down). (2) Different user behavior on weekends that's underrepresented in training data. (3) A feature derived from "time since last business event" that becomes meaningless on weekends. (4) Class distribution shifts on weekends (different types of transactions/requests). (5) An infrastructure differences — weekend deployments, reduced capacity, stale caches.

**Deep Answer**

- **Feature availability:** a common cause. If features depend on upstream batch jobs (e.g., "daily_risk_score" computed at 6am by a cron job that doesn't run on weekends), the model receives stale or default values on weekends.
  - Diagnosis: log feature freshness timestamps. Compare weekend vs. weekday feature staleness.
- **Behavioral shift:** user behavior genuinely differs on weekends. Weekday traffic = enterprise users, weekend traffic = consumer users. If training data has 80% weekday, the model under-represents weekend patterns.
  - Diagnosis: segment model performance by user type, not just by day.
- **Feature design flaw:** features like "hours since last payroll" or "trading volume today" are meaningless on non-business days.
  - Diagnosis: check feature value distributions for weekday vs. weekend. Large distribution shifts indicate problematic features.
- **Infrastructure:** weekend capacity reduction, cached model versions not refreshed, feature store TTLs expiring.
  - Diagnosis: check system health dashboards, feature store refresh timestamps, model serving logs.
- **Class imbalance by day:** if weekday traffic is 90% class A and weekend is 60% class A, the model's threshold is wrong for weekends.
  - Diagnosis: per-class accuracy analysis, segmented by day of week.

**Follow-up Questions**

1. You confirm that two key features have stale values on weekends. What's your short-term fix and long-term fix?
2. Would adding "day_of_week" as a feature help? What are the risks?
3. Should you train separate models for weekday and weekend?

**Common Weak Answers / Red Flags**

- "Users just behave differently on weekends" — correct but doesn't explain a 30% accuracy drop
- Doesn't consider infrastructure/feature availability issues
- Cannot articulate a systematic debugging approach (checks one hypothesis and stops)

**Interviewer Evaluation Signal**

Tests practical debugging in a realistic scenario. The best candidates generate multiple hypotheses ranked by likelihood and describe a diagnostic plan for each. Real production debugging requires this systematic approach because the first hypothesis is often wrong.

**Real-World Insight**

A fintech company's fraud detection model had 25% higher false positive rates on Mondays. Root cause: a "spending_velocity_24h" feature was computed from Saturday+Sunday combined (low spending), making Monday morning transactions look anomalous by comparison. The fix was redesigning the feature to use rolling 7-day averages instead of 24-hour windows.

---

## Q-00-D-005: A stakeholder says "the model is biased." How do you investigate and respond?

**Module:** Foundations
**Submodule:** Governance
**Level:** Debugging
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, ML / Data Engineer
**Tags:** [foundations, debugging, fairness, bias, governance, production]
**Prerequisites:** Q-00-S-007
**Estimated Interview Round:** Deep Dive, Debugging
**Why This Question Matters:** Bias allegations can be legal, ethical, and reputational risks. Responding requires both technical rigor and clear communication.

**Question**

A product manager reports that users from a specific demographic group are receiving worse outcomes from your AI system. They want to know if the model is biased. How do you investigate, and how do you communicate the findings?

**Expected Answer (Short)**

Investigation: (1) Define "bias" precisely — what outcome metric differs, and across which groups? (2) Measure disparate impact — compare positive outcome rates across demographic groups. (3) Analyze feature contributions — SHAP values per group to identify which features drive the disparity. (4) Check training data composition — is the disadvantaged group underrepresented or mislabeled? (5) Test with protected attributes removed — does the disparity persist through proxy features? Communication: present findings factually with metrics, context, and recommended mitigations.

**Deep Answer**

- **Step 1: Define the claim.** "Biased" is ambiguous. Get specific: "Group A receives approval at 40% rate vs Group B at 65%." Measure the exact disparity.
- **Step 2: Check base rates.** Is the disparity in outcomes reflecting a disparity in the ground truth? If Group A genuinely has higher risk (e.g., due to historical disadvantage), the model may be accurately reflecting reality. But "accurate" is not the same as "fair."
- **Step 3: Measure fairness metrics:**
  - Demographic parity: P(positive | Group A) ≈ P(positive | Group B)
  - Equalized odds: FPR and TPR similar across groups
  - Predictive parity: precision similar across groups
  - Note: these metrics often conflict. Satisfying all simultaneously is mathematically impossible (except in trivial cases).
- **Step 4: Feature analysis.** Use SHAP per group. If ZIP code drives the disparity and ZIP code correlates with race, you have proxy bias.
- **Step 5: Data audit.** Check training data representation. Underrepresentation → higher error rates on minority groups (performance bias).
- **Step 6: Mitigations:**
  - Remove proxy features (ZIP code, name-derived features)
  - Constrained optimization (fairness constraints in training)
  - Post-processing threshold adjustment per group
  - Collect more representative training data
- **Communication:** present data, acknowledge the disparity, explain root causes, propose concrete mitigations with timelines. Never dismiss the concern.

**Follow-up Questions**

1. You remove ZIP code and the disparity shrinks but doesn't disappear. Now what?
2. Demographic parity and equalized odds give conflicting signals — one says the model is fair, the other says it's biased. How do you proceed?
3. The business team says fixing bias will reduce overall accuracy. How do you frame this trade-off?

**Common Weak Answers / Red Flags**

- "The model isn't biased because we didn't include race as a feature" — proxy bias exists
- Cannot name or explain specific fairness metrics
- Treats this as only a technical problem without considering ethical and communication dimensions

**Interviewer Evaluation Signal**

Tests the intersection of technical rigor and ethical awareness. Engineers who can investigate bias systematically, communicate findings clearly, and propose mitigations are extremely valuable — and increasingly required.

**Real-World Insight**

ProPublica's investigation of the COMPAS recidivism prediction tool found that the model had different false positive rates across racial groups — Black defendants were twice as likely to be falsely flagged as high-risk. The response required both statistical analysis (demonstrating the disparity) and policy decisions (which fairness metric to prioritize). This case is now a standard teaching example in ML fairness.
