# Module 00 — Foundations: Applied Level

## Q-00-A-001: How do you handle class imbalance in a classification problem?

**Module:** Foundations
**Submodule:** ML Fundamentals
**Level:** Applied
**Difficulty:** 2
**Experience Bands:** Early-career, Mid-level
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer, Fresher / Beginner
**Tags:** [foundations, class-imbalance, sampling, loss-function, evaluation]
**Prerequisites:** Q-00-C-002, Q-00-C-008
**Estimated Interview Round:** Technical
**Why This Question Matters:** Class imbalance is present in nearly every real-world classification task — fraud detection, spam, medical diagnosis. The approach determines whether the model is actually useful.

**Question**

Your binary classification model has 95% accuracy but only 12% recall on the positive class (which is 3% of your dataset). What are the likely causes and what approaches would you use to fix this?

**Expected Answer (Short)**

The model is predicting the majority class almost always — 95% accuracy is just the baseline rate. Fixes: (1) Use appropriate metrics (F1, precision-recall AUC, not accuracy), (2) Class-weighted loss to penalize minority class misses, (3) Resampling — SMOTE or random oversampling for minority, undersampling for majority, (4) Adjust classification threshold (lower it from 0.5 to increase recall at cost of precision), (5) Collect more positive examples if possible.

**Deep Answer**

- Accuracy is misleading for imbalanced data — a model predicting "always negative" gets 97% accuracy on a 3% positive rate dataset
- Metrics to use instead: Precision-Recall curve, F1, F-beta (F2 if recall matters more), PR-AUC, Matthews Correlation Coefficient
- Class-weighted loss: `weight = n_total / (n_classes × n_class)`. Tells the model that missing a positive costs more.
- Focal loss: dynamically downweights easy negatives, focuses on hard cases. Standard in object detection (RetinaNet), useful for tabular too.
- SMOTE: creates synthetic minority samples by interpolating between neighbors. Better than random oversampling for small datasets. Risk: can create noisy samples if classes overlap.
- Threshold tuning: train as usual, then optimize the decision threshold on validation set using F1 or business-specific cost function. This is the cheapest intervention and often the most effective.
- Ensemble approaches: balanced random forest, EasyEnsemble (bagging on balanced subsets)
- In production: combine threshold tuning + class-weighted loss. Monitor precision-recall per-class continuously — distribution can shift.
- For LLM classification: class imbalance in fine-tuning data causes the model to under-generate minority labels. Balance the fine-tuning dataset or use few-shot examples that oversample the minority.

**Follow-up Questions**

1. You increase recall from 12% to 78% but precision drops from 95% to 34%. How do you decide the right trade-off?
2. Why might SMOTE make things worse in some situations?
3. How does class imbalance affect model calibration?
4. Your fraud detection model needs to flag 90%+ of fraud. What threshold strategy do you use?

**Common Weak Answers / Red Flags**

- "The model has 95% accuracy so it's working well" — the most dangerous misconception
- Jumps to SMOTE without considering simpler fixes like threshold tuning or class weights
- Doesn't mention that accuracy is the wrong metric for imbalanced problems

**Interviewer Evaluation Signal**

Reveals whether the candidate evaluates models by business-relevant metrics or by default accuracy. In production, this is the difference between a useful model and one that gets pulled after deployment.

**Real-World Insight**

In fraud detection and medical diagnosis, the cost of a false negative is orders of magnitude higher than a false positive. Production systems typically operate at very low thresholds (0.1–0.3) and route flagged cases to human review. The model's job is to reduce the haystack, not make final decisions.

---

## Q-00-A-002: When should you use a simple model vs. a complex one?

**Module:** Foundations
**Submodule:** ML Fundamentals
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer, Senior / Architect
**Tags:** [foundations, model-selection, trade-offs, production, cost]
**Prerequisites:** Q-00-C-002
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** Model selection is one of the highest-leverage decisions in production ML. Over-engineering with complex models is as costly as under-engineering with simple ones.

**Question**

You're building a content classification system. A logistic regression model achieves 89% accuracy. Your team wants to try a fine-tuned BERT model. Under what conditions would you stick with logistic regression, and under what conditions would the extra complexity be justified?

**Expected Answer (Short)**

Stick with logistic regression if: 89% meets business requirements, latency/cost requirements are tight, training data is small, interpretability matters, or the model needs frequent retraining. Upgrade to BERT if: 89% doesn't meet the bar, the failure mode (which 11% fails) has high business cost, you have sufficient labeled data for fine-tuning, and the deployment infrastructure supports transformer inference. Always quantify the marginal value of the accuracy gain.

**Deep Answer**

- Start with: does 89% solve the business problem? If yes, you're done. Ship logistic regression.
- Cost analysis: logistic regression inference is 0.01ms. BERT inference is ~10–50ms. 1000x latency difference affects architecture.
- Logistic regression can run on CPU for pennies. BERT may need GPU at $0.50+/hour. At scale, this is a significant budget difference.
- Interpretability: logistic regression weights tell you which features matter. BERT is a black box. For compliance-heavy domains, this matters.
- Retraining velocity: logistic regression retrains in seconds. BERT retrains in hours/days. If data distribution shifts frequently, simpler models are more agile.
- Error analysis first: look at what the 11% failure cases are. If they're genuinely ambiguous, no model will fix them. If they require semantic understanding that bag-of-words can't capture, BERT will help.
- Middle ground: TF-IDF + logistic regression → distilled BERT → fine-tuned BERT. Evaluate each step incrementally.
- In production: many teams ship simple models for V1, instrument them for error collection, and only upgrade when they have evidence that complexity is needed.

**Follow-up Questions**

1. You switch to BERT and accuracy improves to 93%. The team celebrates. What should you check before deploying?
2. How would you run an A/B test to validate that the 4% accuracy improvement translates to business value?
3. What is the TCO (total cost of ownership) difference between maintaining a logistic regression model vs. a fine-tuned BERT model?

**Common Weak Answers / Red Flags**

- "BERT is always better because it understands language" — ignores cost, latency, and maintenance
- Defaults to the most complex model without justifying the complexity
- Cannot estimate the cost difference between simple and complex models
- "We should use an LLM for everything" — the 2024/2025/2026 version of the same mistake

**Interviewer Evaluation Signal**

Tests production judgment. Engineers who default to complexity haven't operated systems under cost and latency constraints. Engineers who always choose simplicity haven't solved hard problems. The best answer is structured: measure the gap, quantify the cost, decide based on evidence.

**Real-World Insight**

At high-scale companies, a 4% accuracy improvement that requires GPU inference can cost millions more per year. Conversely, at a startup, shipping a 93% model faster with BERT (using a managed API) might be cheaper than building feature engineering pipelines for logistic regression. The right answer is always context-dependent.

---

## Q-00-A-003: How do you detect and handle data leakage?

**Module:** Foundations
**Submodule:** ML Fundamentals
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [foundations, data-leakage, evaluation, debugging, pipeline]
**Prerequisites:** Q-00-C-004
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** Data leakage is the #1 cause of models that work in development but fail in production. Detecting it requires disciplined thinking about information flow.

**Question**

Your model achieves 99.2% accuracy on the test set — suspiciously high for the problem. Walk through your process for diagnosing potential data leakage.

**Expected Answer (Short)**

Suspect leakage whenever metrics are "too good." Check: (1) Does the test set contain any overlap with training data? (2) Are any features derived from the target variable (directly or indirectly)? (3) Is temporal ordering respected — are future features leaking into past samples? (4) Was preprocessing (scaling, encoding) done before the train/test split? (5) Feature importance analysis — if a single feature dominates, investigate how it's computed.

**Deep Answer**

- Step 1: Check for duplicate rows between train and test sets (exact or near-duplicate)
- Step 2: Check for features that are proxies for the target. Example: a "next_month_spending" feature in a churn prediction model is literally the answer.
- Step 3: Check temporal integrity. If predicting next-week sales, ensure no features contain next-week data.
- Step 4: Check preprocessing pipeline order. StandardScaler fit on full data before split = mean/std leaks test distribution.
- Step 5: Feature importance analysis. If one feature has 10x the importance of all others, it's either an amazing feature or a leak. Investigate.
- Step 6: Ablation test. Remove the top feature and retrain. If accuracy drops from 99% to 70%, that feature is the source — verify it's legitimate.
- Step 7: Check data collection process. Sometimes leakage is upstream — in how the data was extracted from the database (e.g., joining tables without time filters).
- Common sources: ID columns that encode ordering, aggregated features computed over the full dataset, target-encoded features fit on train+test.
- In LLM fine-tuning: leakage can occur if evaluation examples appear in training data (benchmark contamination).
- Prevention: build the data pipeline so that the split happens FIRST, before any feature engineering.

**Follow-up Questions**

1. You removed the leaking feature and accuracy dropped to 72%. The team is disappointed. How do you communicate this?
2. How would you build a data pipeline that prevents leakage by design?
3. Your LLM achieves suspiciously high scores on a public benchmark. How do you check for benchmark contamination?

**Common Weak Answers / Red Flags**

- "99.2% is great, let's ship it" — no skepticism about unrealistic metrics
- Only checks for train/test overlap but misses feature leakage
- Cannot explain temporal leakage patterns

**Interviewer Evaluation Signal**

Critical diagnostic skill. Engineers who don't instinctively question "too good" results have likely shipped leaky models without knowing it. This separates rigorous practitioners from checkbox ML engineers.

**Real-World Insight**

A major healthcare company discovered after 6 months of deployment that their disease prediction model was using a hospital-ward feature as input — patients in the ICU ward had higher disease rates by definition, creating a trivially predictive but clinically useless feature. The model's 97% test accuracy was driven entirely by this leak. After removal, real accuracy was 64%.

---

## Q-00-A-004: How do you choose the right evaluation metric for your problem?

**Module:** Foundations
**Submodule:** ML Fundamentals
**Level:** Applied
**Difficulty:** 2
**Experience Bands:** Early-career, Mid-level
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer, Fresher / Beginner
**Tags:** [foundations, evaluation, metrics, precision, recall, f1]
**Prerequisites:** Q-00-C-008
**Estimated Interview Round:** Technical
**Why This Question Matters:** The metric you optimize defines what the model actually optimizes. Choosing wrong metrics leads to models that look good on paper but fail for users.

**Question**

For each of the following tasks, which evaluation metric(s) would you prioritize and why? (a) Spam email detection, (b) Medical tumor classification, (c) Product recommendation ranking, (d) Regression for house price prediction.

**Expected Answer (Short)**

(a) Spam: Precision — false positives (legitimate mail marked as spam) are more costly than false negatives (spam in inbox). (b) Medical: Recall — missing a tumor (false negative) is far worse than a false positive that leads to further testing. (c) Ranking: NDCG or MAP — order matters more than binary correctness. (d) House price: MAE or RMSE — MAE for interpretability, RMSE if large errors are disproportionately bad.

**Deep Answer**

- **Spam detection:** High precision (>99%) critical — users lose trust if real mail is deleted. Moderate recall acceptable (some spam in inbox is tolerable). Metric: Precision@threshold, then PR-AUC.
- **Medical diagnosis:** High recall critical — missing cancer is fatal. Low precision acceptable (false alarms lead to biopsy, not death). Metric: Recall>95%, Sensitivity/Specificity, F2 (weights recall 2x).
- **Recommendation ranking:** Order matters. Metric: NDCG@k (discounted cumulative gain), MAP (mean average precision), MRR (mean reciprocal rank). Accuracy is meaningless for ranking.
- **House prices:** MAE = average $ error (interpretable). RMSE = penalizes large errors (appropriate if large errors are disproportionately costly). MAPE = percentage error (avoids scale issues across price ranges).
- Business context always dominates: what is the cost of each error type? Assign $-values to FP vs. FN → derive the right optimization target.
- In LLM evaluation: metrics are harder. Task-specific: ROUGE for summarization, BLEU for translation, exact match for QA. But human evaluation and LLM-as-judge are increasingly standard because automated metrics correlate poorly with perceived quality.
- In production: monitor multiple metrics, but optimize one. "Goodhart's Law" — when a metric becomes a target, it ceases to be a good metric. Watch for metrics gaming.

**Follow-up Questions**

1. Your spam filter has 99.9% precision and 40% recall. Is this acceptable? What's the user experience?
2. How do you handle the tension between optimizing a model metric vs. a business metric?
3. Why do teams increasingly prefer LLM-as-judge over ROUGE/BLEU for evaluating generated text?

**Common Weak Answers / Red Flags**

- "I always use F1" — F1 is not always appropriate, it equally weights precision and recall
- Cannot articulate the cost asymmetry between false positives and false negatives for a given task
- Uses accuracy for ranking or imbalanced problems

**Interviewer Evaluation Signal**

Reveals whether the candidate thinks in terms of business impact or just default metrics. This is a practical engineering judgment question that separates production-ready engineers from academic ones.

**Real-World Insight**

A major e-commerce company optimized their recommendation model for click-through rate (CTR) — and achieved excellent CTR. But revenue dropped because the model learned to recommend low-price, high-click items (clickbait) over high-margin products. They had to redesign their metric to incorporate revenue per click. Metric design is a product decision, not just a modeling decision.

---

## Q-00-A-005: Feature engineering — when does it still matter in the age of deep learning?

**Module:** Foundations
**Submodule:** ML Fundamentals
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [foundations, feature-engineering, deep-learning, trade-offs, tabular-data]
**Prerequisites:** Q-00-C-002
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** The "deep learning does feature engineering automatically" narrative is partially true but misleading. Understanding when manual feature engineering still dominates is crucial for practical engineering.

**Question**

Deep learning is supposed to learn features automatically. When does manual feature engineering still significantly outperform letting the model figure it out? Give specific scenarios.

**Expected Answer (Short)**

Manual feature engineering still wins for: (1) Tabular/structured data — XGBoost with engineered features beats neural nets on most tabular tasks, (2) Small datasets where the model can't learn features from limited examples, (3) Domain-specific transformations the model cannot discover (time-since-last-event, ratios, moving averages), (4) When interpretability is needed. Deep learning dominates for unstructured data (images, text, audio) where feature spaces are too complex for manual engineering.

**Deep Answer**

- Tabular data: tree-based models (XGBoost, LightGBM) with feature engineering consistently win Kaggle competitions and production systems. Deep learning for tabular is still not clearly superior.
- Time-series features: lags, rolling means, cyclical encoding (sin/cos for hours/days), time-since-event. These encode temporal relationships that vanilla NNs struggle to learn.
- Interaction features: combining `city` and `device_type` into a single feature can capture patterns that linear models miss without additional capacity.
- Entity counts, aggregations: "number of transactions in last 7 days" as a feature for fraud detection is pure domain knowledge that a model trained on individual transactions won't discover.
- Embedding features: converting categorical variables to pretrained embeddings (e.g., word2vec for product names) is a form of feature engineering that bridges manual and learned features.
- In NLP/CV: feature engineering is largely replaced by pretrained representations (BERT, ResNet features). But metadata features (document length, image resolution, user context) are still manually engineered alongside deep features.
- Production reality: most systems use hybrid approaches — deep learning for unstructured features + manual engineering for structured features, combined in a fusion model.

**Follow-up Questions**

1. You have a dataset with 50 features and 500 rows. What's your approach — feature engineering or neural network?
2. How do feature stores in production systems relate to feature engineering?
3. Your deep learning model for tabular data underperforms XGBoost. What are the likely reasons?

**Common Weak Answers / Red Flags**

- "Deep learning replaces feature engineering" — demonstrably false for tabular data
- Cannot name concrete feature engineering techniques beyond one-hot encoding
- "Feature engineering is outdated" — shows limited production experience

**Interviewer Evaluation Signal**

Tests practical breadth. Candidates who've only worked with unstructured data may dismiss feature engineering. Those who've built production ML across data types know it's indispensable for half the problems they'll face.

**Real-World Insight**

In ad-tech, fraud detection, and financial modeling, feature engineering is the primary source of model improvement — not model architecture. A team at a major bank improved fraud detection recall by 23% with a single time-series feature (inter-transaction interval) while model architecture changes contributed less than 3%.

---

## Q-00-A-006: How do you approach feature selection for a high-dimensional dataset?

**Module:** Foundations
**Submodule:** ML Fundamentals
**Level:** Applied
**Difficulty:** 2
**Experience Bands:** Early-career, Mid-level
**Persona Relevance:** ML / Data Engineer, Fresher / Beginner
**Tags:** [foundations, feature-selection, dimensionality, regularization]
**Prerequisites:** Q-00-C-005, Q-00-C-009
**Estimated Interview Round:** Technical
**Why This Question Matters:** High-dimensional datasets (genomics, NLP bag-of-words, wide tabular data) require deliberate feature selection to avoid overfitting, reduce compute, and improve interpretability.

**Question**

You have a dataset with 10,000 features and 5,000 samples. Your model overfits severely. How do you approach feature selection?

**Expected Answer (Short)**

With p > n (more features than samples), aggressive feature selection is needed. Approach: (1) Remove zero-variance and highly correlated features first (filter methods), (2) Use L1 regularization (Lasso) for initial feature ranking, (3) Use tree-based feature importance (random forest, XGBoost) for a non-linear perspective, (4) Wrapper methods (recursive feature elimination) for fine-tuning the set, (5) Validate that performance holds on a proper validation set after selection.

**Deep Answer**

- **Filter methods** (cheap, fast): correlation with target, variance threshold, mutual information. Apply first to cut obviously useless features.
- **Embedded methods** (built into training): L1 regularization (Lasso), tree-based importance, ElasticNet. L1 naturally selects features during training.
- **Wrapper methods** (expensive, thorough): recursive feature elimination (RFE), forward/backward selection. Train model repeatedly with different subsets. Use when the feature set is already manageable (<500).
- **Dimensionality reduction** (different approach): PCA, UMAP. Create new composite features that capture maximum variance. Loses interpretability.
- Order of operations: variance threshold → correlation filter → L1/tree importance → RFE on top candidates.
- Critical: do feature selection WITHIN cross-validation folds, not before splitting. Otherwise you leak validation info.
- In production: feature selection is also about reducing serving latency and feature store storage cost. Fewer features = faster inference + simpler monitoring.
- For NLP: TF-IDF + chi-squared selection is a classic pipeline. Or just use embeddings (which implicitly do dimensionality reduction).

**Follow-up Questions**

1. L1 regularization selected 200 features. Random forest importance gives a different top 200. How do you reconcile?
2. Why must feature selection happen inside cross-validation?
3. How do you handle feature selection when features are highly correlated with each other?

**Common Weak Answers / Red Flags**

- Goes directly to PCA without considering simpler methods
- Performs feature selection on the entire dataset before splitting (leakage)
- "Just use all features, deep learning will figure it out" — ignores p > n problem

**Interviewer Evaluation Signal**

Tests methodical problem-solving for data preprocessing. Overfitting due to high dimensionality is one of the most common real-world ML problems, and the candidate's approach reveals their debugging discipline.

**Real-World Insight**

In genomics and bioinformatics (10K–100K features, hundreds of samples), feature selection is the entire modeling challenge. Teams that skip it and train complex models end up with perfectly overfit models that fail on new patient cohorts. The same principle applies at a smaller scale in every tabular ML application.

---

## Q-00-A-007: When would you use an ensemble method vs. a single model?

**Module:** Foundations
**Submodule:** ML Fundamentals
**Level:** Applied
**Difficulty:** 2
**Experience Bands:** Early-career, Mid-level
**Persona Relevance:** ML / Data Engineer, Fresher / Beginner
**Tags:** [foundations, ensemble, bagging, boosting, model-selection, trade-offs]
**Prerequisites:** Q-00-C-002
**Estimated Interview Round:** Technical
**Why This Question Matters:** Ensembles win most tabular ML competitions but add production complexity. Understanding the cost-benefit is essential.

**Question**

Explain the difference between bagging and boosting. When would each be appropriate, and when should you avoid ensembles entirely?

**Expected Answer (Short)**

Bagging (e.g., Random Forest): trains independent models on bootstrap samples, averages predictions. Reduces variance without increasing bias. Good for unstable learners (decision trees). Boosting (e.g., XGBoost, AdaBoost): trains sequential models, each correcting the previous one's errors. Reduces both bias and variance, but risks overfitting. Avoid ensembles when: latency is critical, interpretability is required, the base model already performs well, or maintaining multiple models in production is too expensive.

**Deep Answer**

- **Bagging:** random subsets + independent training + averaging. Parallelizable. Reduces variance. Random Forest is the standard.
- **Boosting:** sequential error correction. Each tree focuses on what the ensemble gets wrong. XGBoost, LightGBM, CatBoost are standards. Reduces bias and variance.
- Boosting generally achieves higher accuracy than bagging on tabular data but is more sensitive to hyperparameters and noise.
- **Stacking:** meta-learner on top of base model predictions. More complex. Used in competitions, rare in production.
- When NOT to ensemble: (a) Sub-millisecond inference requirements — ensembles multiply latency. (b) Interpretability needs — explaining 500 trees is impractical. (c) When a single model already meets requirements — ensembles add maintenance cost. (d) When the base model is a large neural network — ensembling transformers is prohibitively expensive.
- In LLM context: model routing (sending different queries to different models) is a form of ensemble. So is majority voting across multiple LLM calls.
- Production trade-off: 2% accuracy improvement from an ensemble might not justify doubling inference cost and complexity.

**Follow-up Questions**

1. You have a random forest with 500 trees. How do you decide if 100 trees would work just as well?
2. Why is boosting more prone to overfitting than bagging?
3. How does "model routing" in LLM systems relate to traditional ensemble methods?

**Common Weak Answers / Red Flags**

- "Ensembles are always better" — ignores production cost and complexity
- Confuses bagging and boosting
- Cannot explain why Random Forest uses random feature subsets per tree

**Interviewer Evaluation Signal**

Tests whether the candidate makes modeling decisions based on trade-offs or defaults to complexity. Practical understanding of when NOT to ensemble is more valuable than knowing how they work.

**Real-World Insight**

In competitive ML (Kaggle), stacking ensembles of 50+ models is common. In production, single models (or simple 2–3 model ensembles) dominate. Netflix famously couldn't deploy their $1M prize-winning ensemble because the improvement wasn't worth the engineering complexity. The gap between competition ML and production ML is largely about this trade-off.

---

## Q-00-A-008: How do you handle missing values in a production ML pipeline?

**Module:** Foundations
**Submodule:** Data Engineering
**Level:** Applied
**Difficulty:** 2
**Experience Bands:** Early-career, Mid-level
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [foundations, missing-data, data-quality, pipeline, imputation]
**Prerequisites:** None
**Estimated Interview Round:** Technical
**Why This Question Matters:** Every real-world dataset has missing values. Handling them wrong introduces bias; handling them as an afterthought causes production failures.

**Question**

Your production feature has 15% missing values. The data is not missing at random — high-value customers are more likely to have the field populated. How do you handle this?

**Expected Answer (Short)**

When data is Missing Not At Random (MNAR), the missingness itself carries information. Options: (1) Add a binary indicator feature "is_missing" to let the model use the missingness signal, (2) Impute with a domain-appropriate value (not mean — mean imputation erases the MNAR signal), (3) Use models robust to missing values (XGBoost naturally handles them), (4) Model the missingness mechanism if possible. Never silently drop rows — you'd systematically exclude low-value customers, biasing the model.

**Deep Answer**

- Missing data categories: MCAR (random), MAR (depends on observed features), MNAR (depends on the missing value itself). Each requires different treatment.
- MNAR is the hardest — imputation methods assume MAR/MCAR and will introduce bias for MNAR data.
- **Indicator feature:** `feature_is_missing = 1/0`. Let the model learn that missingness has predictive power. Simple and effective.
- **Conditional imputation:** impute different values for different segments (e.g., median per cohort).
- **Tree-based models:** XGBoost and LightGBM natively send missing values down both branches and learn the best direction. Often the best practical approach.
- **DO NOT:** drop rows silently, impute with global mean for MNAR data, or ignore the problem and let the model see NaN (most models crash).
- In production: the imputation strategy must be deterministic and versioned. If you impute with the median, that median must be computed from training data and stored — not recomputed at inference time (which shifts with new data).
- For LLM/text data: "missing" means an empty field in structured data extraction. A separate "unknown" token or explicit prompt handling is needed.

**Follow-up Questions**

1. You impute with the median and model performance drops. Why?
2. How should imputation be implemented in a production pipeline to avoid train-serve skew?
3. Your fraud detection model performs differently on weekends. You discover a feature with 40% missing values only on weekends. What do you do?

**Common Weak Answers / Red Flags**

- "Just impute with the mean" without considering the missingness mechanism
- "Drop rows with missing values" — introduces selection bias
- Doesn't mention that the imputation strategy must be saved and applied consistently in production

**Interviewer Evaluation Signal**

Tests data engineering discipline. Candidates who think about missingness mechanisms and production consistency demonstrate readiness for real ML systems. Those who default to mean imputation likely haven't dealt with messy production data.

**Real-World Insight**

A credit scoring company discovered their model was biased against rural applicants because address-verification features had 35% missing values in rural areas (MNAR — verification systems had lower coverage). Mean imputation made it worse by filling in "urban-average" values, making the model think rural applicants had urban characteristics. Adding a missingness indicator and segment-specific imputation resolved the disparity.

---

## Q-00-A-009: How do you design a train/validation/test split correctly?

**Module:** Foundations
**Submodule:** ML Fundamentals
**Level:** Applied
**Difficulty:** 2
**Experience Bands:** Early-career, Mid-level
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer, Fresher / Beginner
**Tags:** [foundations, evaluation, data-split, time-series, leakage]
**Prerequisites:** Q-00-C-004
**Estimated Interview Round:** Technical
**Why This Question Matters:** A bad split invalidates every metric computed on it. Production failures from improper splits are disturbingly common.

**Question**

Describe how you split data into train/validation/test sets. What changes if the data is time-series? What if each row isn't independent (e.g., multiple records per user)?

**Expected Answer (Short)**

Standard: random split (e.g., 70/15/15) with stratification for classification. For time-series: chronological split only — train on past, validate on future. Never shuffle. For grouped data: GroupKFold or group-aware split — all records from one user go into the same set. Never let the same user appear in both train and test. Validation set = hyperparameter tuning. Test set = final, one-time evaluation (never tune on it).

**Deep Answer**

- **Standard i.i.d. data:** random stratified split. Ensure class distribution is preserved in each set. Common ratios: 70/15/15 or 80/10/10.
- **Temporal data:** sort by time. Train on first T periods, validate on T+1, test on T+2. No shuffling. No look-ahead. This simulates production conditions.
- **Grouped data:** users, patients, devices. Use GroupSplit — all records from entity X must be in the same partition. Otherwise: model memorizes entities, not patterns.
- **Validation vs. test:** validation is for iterating (model selection, hyperparameter tuning). Test is for final evaluation. If you tune on test, you need a second test set (which nobody has).
- **Data versioning:** split definitions should be saved and versioned. If the dataset changes, recompute the split — don't just append new rows to test set.
- **Size considerations:** if data is very small (<1000), use k-fold CV instead of a single split for more reliable estimates.
- **In LLM fine-tuning:** the split applies to the fine-tuning dataset. And there's an additional concern: ensuring evaluation examples aren't in the base model's pretraining data (benchmark contamination).

**Follow-up Questions**

1. You tune hyperparameters using the test set because the validation set was too small. What goes wrong?
2. How would you design a split for a system that predicts tomorrow's stock prices?
3. Your model has 95% accuracy on the test set but 78% in production. What went wrong with the split?

**Common Weak Answers / Red Flags**

- "I use sklearn's train_test_split" without discussing stratification, temporal, or group concerns
- Doesn't distinguish validation from test set purposes
- Shuffles time-series data

**Interviewer Evaluation Signal**

Tests fundamental evaluation discipline. Candidates who don't instinctively think about temporal ordering and group structure will produce leaky evaluations. This is one of the most common ML mistakes in industry.

**Real-World Insight**

A financial services company reported 92% accuracy on their loan default model. Compliance review revealed the test set contained future records from the same borrowers as the training set. After proper sequential splitting with borrower isolation, real accuracy was 71%. The model had to be pulled from production.

---

## Q-00-A-010: What is the difference between online learning and batch learning, and when does each apply?

**Module:** Foundations
**Submodule:** ML Fundamentals
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer, DevOps / SRE → AIOps
**Tags:** [foundations, online-learning, batch-learning, streaming, production, drift]
**Prerequisites:** Q-00-C-003
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** Production ML often requires reacting to new data quickly. Understanding the batch vs. online spectrum is critical for designing production pipelines.

**Question**

When should you use online (incremental) learning vs. batch retraining in production? What are the risks of each approach?

**Expected Answer (Short)**

Batch retraining: retrain the full model on accumulated data periodically (daily/weekly). Stable, reproducible, easier to debug. Use when data is reasonably stationary and retraining cost is acceptable. Online learning: update the model incrementally with each new batch/sample. Faster adaptation to distribution shift. Use when data evolves rapidly (ad systems, personalization, market data). Risks: online learning can drift, forget past data (catastrophic forgetting), and is harder to reproduce and debug.

**Deep Answer**

- **Batch:** full retrain on accumulated data. Model is static between retrains. Simple. Auditable. Standard for most production ML.
- **Online/incremental:** model updates with each new observation or micro-batch. Adapts instantly to distribution shift.
- Batch retraining risks: stale model between retrains. If data shifts mid-cycle, performance degrades until next retrain.
- Online learning risks: catastrophic forgetting (model forgets old patterns while learning new ones), adversarial drift (model can be steered by manipulated data), debugging difficulty (no stable model state to reproduce issues).
- Production compromise: frequent micro-batch retraining (every few hours) bridges the gap — more responsive than daily batch, more stable than true online.
- Online learning algorithms: SGD-based models, Vowpal Wabbit, River library. Transformer models are generally not suited for online learning due to size.
- For LLMs: online learning means continuous fine-tuning or RAG-based updating (cheaper, more common). You don't re-train GPT-4 online.
- Drift detection should trigger retraining decisions for batch systems. If drift is detected, retrain sooner. If stable, retrain less often.
- In ad-tech: models retrain every few hours because user behavior shifts that fast. In medical: models retrain annually because clinical guidelines change slowly.

**Follow-up Questions**

1. How do you detect when a batch model has become stale?
2. Can you use RAG as an alternative to online learning for keeping an LLM up-to-date?
3. What is catastrophic forgetting and how would you detect it in an incrementally trained model?

**Common Weak Answers / Red Flags**

- "Just retrain every day" without considering cost or necessity
- "Online learning is always better because it's newer" — ignores stability and debugging challenges
- Cannot articulate the risks of online learning (drift, forgetting, reproducibility)

**Interviewer Evaluation Signal**

Tests production architecture thinking. The answer should demonstrate understanding of the batch/online spectrum as a trade-off, not a binary choice. Bonus: connecting to RAG as a "pseudo-online" update mechanism for LLMs.

**Real-World Insight**

Ad-tech companies typically retrain click-through-rate models every 2–4 hours because user interests shift rapidly (breaking news, trending topics). A financial institution retrains risk models quarterly with heavy validation. The retraining frequency should match the data's non-stationarity rate — and many teams get this wrong by either over-training (wasting compute) or under-training (shipping stale models).

---

## Q-00-A-011: What is transfer learning and how has it changed ML practice?

**Module:** Foundations
**Submodule:** ML Fundamentals
**Level:** Applied
**Difficulty:** 2
**Experience Bands:** Early-career, Mid-level
**Persona Relevance:** Fresher / Beginner, Software Dev → AI Engineer, ML / Data Engineer
**Tags:** [foundations, transfer-learning, fine-tuning, pretrained-models, trade-offs]
**Prerequisites:** Q-00-C-002
**Estimated Interview Round:** Technical
**Why This Question Matters:** Transfer learning is the paradigm that makes modern AI practical. Understanding when and why it works (and fails) is essential for any AI engineer.

**Question**

What is transfer learning and why has it become the dominant paradigm? When does transfer learning fail or underperform training from scratch?

**Expected Answer (Short)**

Transfer learning takes a model pretrained on a large dataset and adapts it to a specific task with less data. It works because early layers learn universal representations (edges in vision, syntax in language) that transfer across tasks. It fails when: (1) the source and target domains are too different, (2) the pretrained model encodes biases that hurt the target task, (3) the task requires knowledge not represented in pretraining, (4) negative transfer — the pretrained features actively confuse the target task.

**Deep Answer**

- Pre-LLM transfer learning: ImageNet-pretrained CNNs → fine-tune on medical images, satellite data, etc. Revolutionized vision tasks.
- LLM transfer learning: GPT/BERT pretrained on web text → fine-tune on classification, QA, etc. Revolutionized NLP.
- Foundation models: large pretrained models (GPT-4, Llama, CLIP) are the ultimate transfer learning — single model, many tasks.
- Why it works: lower layers learn general features. Deeper layers learn task-specific features. Fine-tuning adjusts deeper layers while preserving general knowledge.
- When it fails: (a) Domain gap too large — natural images → X-ray images works; natural images → spectrograms may not. (b) Label space mismatch — pretrained vocabulary doesn't cover target domain terms. (c) Bias transfer — models trained on internet text transfer internet biases.
- LoRA/QLoRA: parameter-efficient transfer learning for LLMs. Fine-tune <1% of parameters, preserve pretrained knowledge.
- Training from scratch is still needed for: novel architectures, novel data modalities, regulatory requirements demanding full provenance.
- The spectrum: pretrained + zero-shot → few-shot prompting → LoRA fine-tuning → full fine-tuning → train from scratch. Each step increases data/compute requirements and customization potential.

**Follow-up Questions**

1. You're fine-tuning a pretrained model for a domain-specific task and accuracy starts high then degrades. What's happening?
2. When is LoRA fine-tuning preferable to full fine-tuning?
3. What is "negative transfer" and how would you detect it?

**Common Weak Answers / Red Flags**

- "Transfer learning always works" — ignores negative transfer and domain gap
- Cannot place fine-tuning on the spectrum of transfer learning approaches
- Confuses transfer learning with data augmentation

**Interviewer Evaluation Signal**

Tests whether the candidate understands the current ML paradigm. The spectrum from zero-shot to full fine-tuning is the most important practical decision in modern AI engineering.

**Real-World Insight**

The entire GenAI industry is built on transfer learning — OpenAI, Anthropic, and Google pretrain massive models, and everyone else fine-tunes or prompts them. The key production insight: fine-tuning on out-of-domain data can degrade the model's general capabilities (catastrophic forgetting). LoRA mitigates this by only modifying a small parameter subspace, which is why it's the standard for production fine-tuning.

---

## Q-00-A-012: How do you debug a model that trains but doesn't converge?

**Module:** Foundations
**Submodule:** Optimization
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [foundations, debugging, optimization, training, convergence]
**Prerequisites:** Q-00-C-003, Q-00-C-008
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** Non-convergence is one of the top 3 training issues. Systematic debugging separates productive engineers from those who randomly adjust hyperparameters.

**Question**

Your model's training loss plateaus after 2 epochs and doesn't improve despite training for 50 epochs. Walk through your systematic debugging approach.

**Expected Answer (Short)**

Systematic checklist: (1) Verify data pipeline — check for corrupted/mislabeled data, check if data is reaching the model correctly. (2) Learning rate — try 10x higher and 10x lower. (3) Overfit on a single small batch first — if the model can't memorize 10 samples, there's a bug. (4) Check gradient flow — are gradients vanishing or exploding? (5) Check loss function — is it appropriate for the task? (6) Check model initialization. (7) Simplify the model first, then add complexity.

**Deep Answer**

- **Step 0:** Can the model overfit 10 training samples? If not, there's a fundamental bug (data loading, loss calculation, model architecture, gradient disconnection).
- **Step 1:** Plot the loss curve. Is it oscillating (LR too high), flat from start (LR too low or dead neurons), or decreasing then flat (normal convergence or stuck in local minimum)?
- **Step 2:** Check learning rate. Use LR finder (train with exponentially increasing LR, plot loss vs. LR). Choose LR where loss drops fastest.
- **Step 3:** Check gradients. Log gradient norms per layer. If all zeros → gradient vanishing (check activations, skip connections). If NaN/inf → gradient explosion (add clipping, reduce LR).
- **Step 4:** Check data. Shuffle the dataset (maybe order is correlated). Check label correctness. Visualize a few samples.
- **Step 5:** Check numerical issues. Is the loss computed in float16 when it should be float32? Are there log(0) or division-by-zero in the loss?
- **Step 6:** Check architecture. Is the model capacity sufficient? Does it have residual connections for deep networks? Are activations appropriate?
- **Step 7:** Try AdamW if using SGD, or vice versa. Try warmup. Try different weight initialization.
- **In production:** automated training health checks (gradient histograms, loss curve analysis, NaN detection) should be built into the training pipeline to catch these issues early.

**Follow-up Questions**

1. Your gradients are all 1e-8. What specifically would you check?
2. The model overfits 10 samples perfectly but won't learn on the full dataset. What's different?
3. How would you implement automated training health checks in a production pipeline?

**Common Weak Answers / Red Flags**

- Starts randomly changing hyperparameters without a diagnostic process
- "Just increase the learning rate" without checking gradients
- Doesn't mention the "overfit a single batch" diagnostic — the most powerful first test

**Interviewer Evaluation Signal**

Tests systematic debugging ability, which is the most valuable practical skill. Engineers who can methodically diagnose training failures save weeks of GPU time.

**Real-World Insight**

At scale, failed training runs are extremely expensive. A single training run of a 7B model costs thousands in GPU hours. Teams that invest in training health checks (automated gradient monitoring, early stopping on loss plateau, NaN detection) recover this investment within a few runs. The "overfit one batch" test takes 30 seconds and catches 50% of training bugs.

---

## Q-00-A-013: What is the role of a learning rate schedule? Design one for transformer training.

**Module:** Foundations
**Submodule:** Optimization
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [foundations, optimization, learning-rate, transformer, training]
**Prerequisites:** Q-00-C-003
**Estimated Interview Round:** Technical
**Why This Question Matters:** Learning rate scheduling is the single most impactful hyperparameter decision in transformer training. Getting it wrong wastes entire training runs.

**Question**

Why do transformers need learning rate warmup followed by decay? What goes wrong without warmup, and how do you choose the warmup duration and peak learning rate?

**Expected Answer (Short)**

Transformers need warmup because the initial gradients (with random weights) are high-variance — large learning rates early cause training instability. Warmup starts with a very low LR and linearly increases to the peak over N steps, allowing the model to stabilize. After warmup, cosine decay or linear decay reduces the LR to avoid overshooting in the later, fine-grained optimization phase. Without warmup, loss often spikes or diverges in the first 100-1000 steps. Typical warmup: 1-10% of total training steps. Peak LR: 1e-4 to 5e-4 for fine-tuning, 1e-4 to 3e-4 for pretraining.

**Deep Answer**

- Warmup: LR increases linearly from ~0 to peak over N steps. Stabilizes Adam's moment estimates (which are initialized to 0 and need steps to become reliable).
- Without warmup: Adam's second moment (variance estimate) is tiny early on → effective LR is huge → gradient update is enormous → training diverges.
- AdamW's bias correction partially addresses this but doesn't eliminate the need for warmup in practice.
- Cosine decay: LR follows a cosine curve from peak to near-zero. Smooth. Standard for LLM pretraining.
- Linear decay: LR decreases linearly. Simpler. Works well for fine-tuning.
- Warmup duration: typically 1–10% of total steps. More for larger models, less for fine-tuning.
- Peak LR selection: use [LR finder](https://arxiv.org/abs/1506.01186) or follow published recipes. For LoRA fine-tuning: 1e-4 to 2e-4. For full fine-tuning: 5e-5 to 2e-4.
- Constant LR (no schedule): rarely optimal but sometimes used for simplicity in very short training runs.
- Multiple cycles: cosine annealing with restarts can help escape local minima, but adds hyperparameters.

**Follow-up Questions**

1. Your fine-tuning run shows loss decreasing, then suddenly spiking at step 5000. What happened?
2. Would you use the same schedule for pretraining a model from scratch vs. fine-tuning?
3. How does the learning rate schedule interact with gradient accumulation?

**Common Weak Answers / Red Flags**

- "Just use a constant learning rate" — shows no experience with transformer training
- Doesn't know why warmup exists (Adam's moment initialization)
- Cannot specify reasonable learning rate values for LLM fine-tuning

**Interviewer Evaluation Signal**

Tests hands-on training experience. Candidates who have actually trained or fine-tuned transformers know learning rate schedules intimately. Those who only consume models likely don't.

**Real-World Insight**

The majority of failed LLM fine-tuning runs trace back to learning rate misconfiguration. Peak LR too high → diverge after warmup. No warmup → diverge immediately. No decay → oscillate and never converge to sharp minimum. Published recipes (Llama training reports) are invaluable starting points — don't reinvent scheduling from scratch.

---

## Q-00-A-014: How do you approach reproducibility in ML experiments?

**Module:** Foundations
**Submodule:** ML Fundamentals
**Level:** Applied
**Difficulty:** 2
**Experience Bands:** Early-career, Mid-level
**Persona Relevance:** ML / Data Engineer, DevOps / SRE → AIOps
**Tags:** [foundations, reproducibility, experiment-tracking, mlops, pipeline]
**Prerequisites:** None
**Estimated Interview Round:** Technical
**Why This Question Matters:** Irreproducible experiments waste team time and erode trust. Production ML requires that results can be reproduced and audited.

**Question**

Your colleague reports that a model change improved accuracy by 2%, but when you rerun the experiment, you get different results. What are the likely causes and how do you prevent this systematically?

**Expected Answer (Short)**

Likely causes: (1) Random seeds not set (weight init, data shuffling, dropout), (2) Data versioning — training data changed between runs, (3) Environment differences (library versions, CUDA version, GPU type), (4) Non-deterministic operations (GPU floating-point order, parallel data loading), (5) Hyperparameter drift (not all params logged). Prevention: set all seeds, version data (DVC), pin environment (Docker), log all hyperparameters (MLflow/W&B), use deterministic mode when possible.

**Deep Answer**

- **Random seeds:** set `random.seed()`, `np.random.seed()`, `torch.manual_seed()`, `torch.cuda.manual_seed_all()`. Also `torch.backends.cudnn.deterministic = True`.
- **Data versioning:** use DVC or track dataset hashes. Even a shuffle-order difference changes results.
- **Environment pinning:** Docker image with exact library versions. Different PyTorch CUDA backends give different float results.
- **GPU non-determinism:** some CUDA ops (atomicAdd in reduction kernels) are non-deterministic by default. `torch.use_deterministic_algorithms(True)` forces determinism but may be slower.
- **Experiment tracking:** log EVERYTHING — hyperparameters, data hash, git commit, environment, metrics, artifacts. MLflow, W&B, or Neptune.
- **Metric significance:** a 2% improvement might be within noise. Run multiple seeds and report mean ± std. If the confidence intervals overlap, the improvement isn't real.
- In production: model registry should store the exact training config, data version, and code version for every model. Compliance in regulated industries (healthcare, finance) requires full provenance.

**Follow-up Questions**

1. You've set all seeds and pinned the environment, but results still differ by 0.1% across runs. Is this acceptable?
2. How does distributed training affect reproducibility?
3. How would you design a CI/CD pipeline that validates model reproducibility before deployment?

**Common Weak Answers / Red Flags**

- "Just set the random seed" — misses data versioning, environment, and GPU non-determinism
- "Exact reproducibility doesn't matter" — may be true for research, but production model auditing requires it
- Cannot describe a systematic approach to experiment tracking

**Interviewer Evaluation Signal**

Tests engineering discipline. ML is uniquely prone to irreproducibility, and candidates who treat it casually will create audit nightmares in team settings. The best answer demonstrates a systematic prevention approach, not just reactive fixing.

**Real-World Insight**

A fintech company couldn't reproduce their production model during a regulatory audit because they hadn't versioned the training data. The dataset had been updated in-place (rows added/removed) without tracking. They had to retrain from scratch and hope the new model met the same performance bar. After the incident, they implemented DVC for data versioning and committed to full experiment provenance.
