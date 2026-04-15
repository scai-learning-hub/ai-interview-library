# Classical ML

Topic family B · Prerequisites: Python, statistics, metrics (from Foundations) · Unlocks: MLOps evaluation pipelines, AIOps anomaly detection, retrieval reranking intuition

This module covers the classical machine learning reasoning that still appears in AI interviews in 2026, especially for data, ML, AIOps, and applied engineering roles.

---

## Scope

- Supervised and unsupervised learning
- Bias/variance and generalization
- Feature engineering
- Model evaluation and cross-validation
- Tree-based methods
- SVM and kernel intuition
- Dimensionality reduction
- Anomaly detection
- Calibration and thresholding
- Ensemble methods

## Why It Still Matters

Even in LLM-heavy roles, classical ML shows up in:
- Retrieval rerankers and ranking pipelines
- Anomaly detection and monitoring systems
- Feature-based classifiers and routing models
- Evaluation design and calibration thinking
- Tabular and structured-data production systems
- Hybrid systems where a classical model decides whether to invoke an LLM at all

---

## Subtopic Breakdown

### Supervised Learning and Evaluation
- Linear/logistic regression: when to use, interpretation, regularization
- Decision boundaries and separability
- Cross-validation: k-fold, stratified, time-series splits
- Train/validation/test discipline: why each exists and where leakage enters
- Metric selection under cost-asymmetric errors

### Tree Methods and Ensembles
- Decision trees: splits, depth, pruning, interpretability
- Random forests: bagging, feature sampling, when to prefer over boosting
- Gradient boosting (XGBoost, LightGBM, CatBoost): sequential correction, learning rate, regularization
- Trees vs neural nets on tabular data — when trees still win in production

### Unsupervised Learning
- Clustering: k-means, hierarchical, DBSCAN — assumptions and failure modes
- Dimensionality reduction: PCA, t-SNE, UMAP — what each preserves and distorts
- When clustering is used well vs when it masks a labeling problem

### Anomaly Detection
- Statistical approaches: z-score, IQR, Mahalanobis
- Isolation Forest: intuition and tree-based isolation
- One-class SVM: kernel trick for novelty detection
- Anomaly detection for monitoring: drift, data quality, serving health
- Why anomaly detection is an evaluation problem, not just a model problem

### SVM and Kernel Intuition
- Linear separability and margin maximization
- Kernel trick: mapping to higher dimensions without computing the full space
- Why SVMs still have interview value: mental model for non-linear separation
- Where SVMs are replaced by neural methods and where they still apply

### Calibration and Thresholding
- Why a model can rank well but predict poorly (calibration error)
- Platt scaling, isotonic regression
- Threshold selection tied to business cost, not default 0.5
- Calibration in production: how drift breaks calibration first

---

## What Interviewers Test by Band

### 0–2 years
- Supervised vs unsupervised: clean definitions and examples
- Bias/variance trade-off: can explain underfitting vs overfitting
- Cross-validation: knows k-fold, understands why random splits can leak
- Core metrics: precision, recall, F1, and when each misleads

### 2–5 years
- Model selection: can argue for trees vs neural nets on tabular data with evidence
- Evaluation discipline: identifies leakage, handles class imbalance, uses stratified splits
- Feature engineering: knows when features help and when they introduce correlation or leakage
- Calibration vs ranking quality: understands the distinction

### 5–8 years
- Connects evaluation pipeline to production monitoring (drift, threshold decay, metric divergence)
- Anomaly detection design: can choose an approach and defend it
- Ensemble and boosting trade-offs at production scale

### 8+ years
- Defines evaluation standards across teams
- Decides where classical ML fits vs where LLM/DL should replace it
- Understands total cost of ownership for classical ML pipelines

---

## Depth Ladder

| Level | What Good Looks Like | What Answers Should NOT Be |
|---|---|---|
| Concept | Can explain bias/variance, cross-validation, core algorithms cleanly | Textbook lists without connecting to when each matters |
| Applied | Can choose models based on data shape, label quality, and deployment constraints | "It depends" without specifying on what |
| System | Can connect evaluation failures to production incidents and dashboard misleads | Describing only offline behavior |
| Debugging | Can diagnose whether a production failure is caused by data, features, calibration, or model drift | Jumping to retraining without isolating the cause |
| Architect | Can decide where classical ML belongs in a modern AI platform and where it should be retired | Generic "use the right tool" without concrete reasoning |

---

## Anti-Patterns and Weak Answers

- Treating cross-validation as automatically sufficient (ignoring time-based leakage)
- Assuming more complex models always win
- Ignoring leakage from feature engineering or time-based splits
- Discussing SVM kernels only as history without using them as a mental model for non-linear separation
- Treating anomaly detection as a pure precision problem without considering alert fatigue
- Using ensemble methods without understanding when bagging vs boosting helps
- Defaulting to neural methods on small tabular datasets without justifying the choice

---

## Role Relevance

| Role | Depth Needed | Focus Areas |
|---|---|---|
| Data / ML | ★★★ | Full coverage: evaluation, trees, calibration, anomaly detection |
| DevOps → AIOps | ★★ | Anomaly detection, monitoring, evaluation |
| Software → AI | ★★ | Evaluation, metrics, model selection basics |
| DL / CV | ★★ | Evaluation, generalization, data discipline |
| LLM / RAG / Agent | ★ | Reranking intuition, evaluation, calibration |
| Platform AI | ★ | Evaluation pipeline, monitoring integration |
| Research | ★★ | Evaluation rigor, experimental design |
| Senior / Architect | ★ | Where classical ML still fits, portfolio decisions |

---

## Study Sequence

1. Evaluation and metrics (builds directly on Foundations)
2. Bias/variance and generalization
3. Tree methods and tabular trade-offs
4. Dimensionality reduction and anomaly detection
5. Kernels and SVM intuition
6. Calibration and thresholding

## What To Study Next

- [Deep Learning Core](./deep-learning-core.md) — transitions from classical to neural methods
- [MLOps / LLMOps / AIOps](./mlops-llmops-aiops.md) — where evaluation and drift monitoring apply in production
- [Foundations](./foundations.md) — if metrics or statistics need refreshing

## Cross-References

- [Module Index](../indexes/module-index.md) — all modules with sequences and detail cards
- [Experience Index](../indexes/experience-index.md) — depth expectations by career band
- [Tag Index](../indexes/tag-index.md) — related tags: `supervised-learning`, `unsupervised-learning`, `cross-validation`, `bias-variance`, `tree-methods`, `anomaly-detection`, `calibration`
- [Topic Graph](../topic-graph.md) — prerequisite map
