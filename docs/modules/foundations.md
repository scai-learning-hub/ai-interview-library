# Foundations

Topic family A · Prerequisites: none · Unlocks: Classical ML, Deep Learning Core, Systems/Serving (awareness)

Foundations is the entry layer for almost every role. This module is not a generic CS refresher. It focuses on the minimum foundation required to reason correctly about ML, deep learning, LLMs, retrieval, and AI systems in interviews.

---

## Scope

- Python for data and model workflows
- data structures used in pipelines and evaluation code
- NumPy-style tensor thinking
- linear algebra intuition for model behavior
- probability and statistics for evaluation and uncertainty
- optimization basics
- metrics intuition
- compute graph and autograd intuition

## Why This Module Exists

Candidates often fail AI interviews because they learned tools before mental models. They can use PyTorch, embeddings, or vector databases but cannot explain shape flow, gradients, variance, thresholding, or why a metric is misleading.

---

## Subtopic Breakdown

### Python for ML Workflows
- Collections, iteration, comprehensions, generators, file/JSON handling
- Decorators, context managers, and type hints at the level interviews actually test
- NumPy-style vectorization vs Python loops — when and why it matters
- Memory behavior: object references, mutability, copy semantics in data pipelines

### Tensor Thinking and Linear Algebra
- Scalars, vectors, matrices, and higher-rank tensors
- Shape reasoning: broadcasting, reshaping, transposing, and squeeze/unsqueeze
- Matrix multiplication dimensions and when matmul fails
- Dot products, norms, and cosine similarity — geometric intuition for embeddings

### Probability and Statistics
- Distributions: uniform, normal, Bernoulli, categorical
- Expectation, variance, covariance
- Bayes' theorem at the intuition level, not proof level
- Sampling, hypothesis testing basics, p-value misuse
- Conditional probability for reasoning about classifiers and generative models

### Metrics and Evaluation
- Precision, recall, F1, ROC-AUC, PR-AUC
- Calibration: why a model can rank well but predict poorly
- Threshold selection: business cost, not default 0.5
- Confusion matrix reasoning under class imbalance
- Online vs offline evaluation: why they diverge

### Optimization and Autograd
- Gradient descent: learning rate, convergence, divergence
- Compute graphs: how autograd builds and traverses them
- Chain rule intuition without full derivation
- Regularization: L1, L2, dropout — what each actually prevents
- Why gradients vanish or explode — intuition, not proof

---

## What Interviewers Test by Band

### 0–2 years
- Python fluency: can write clean, correct code under time pressure
- Arrays vs tensors: can explain the difference and when it matters
- Shapes, broadcasting, indexing: can reason about dimensions without trial and error
- Probability basics and core metrics
- Gradient intuition: what backpropagation computes and why it matters

### 2–5 years
- Metric selection under class imbalance with justification
- Calibration vs accuracy vs ranking quality
- Optimization and learning-rate reasoning with trade-off awareness
- Data leakage identification and evaluation pipeline design
- When vectorization matters and when it doesn't

### 5–8 years
- How foundational mistakes create system-level failures
- Metric misuse in production dashboards and alerting
- Compute graph intuition applied to debugging and optimization
- Evaluation pipeline as a first-class production system

### 8+ years
- What foundation standards to enforce across teams
- Where inconsistent metric definitions cause organizational confusion
- When to standardize evaluation infrastructure vs leave flexible

---

## Depth Ladder

| Level | What Good Looks Like | What Answers Should NOT Be |
|---|---|---|
| Concept | Can explain tensors, gradients, bias/variance, core metrics cleanly | Textbook recitation without connecting to practical use |
| Applied | Can choose metrics, identify leakage, reason about performance and data structures | Correct definitions delivered without a clear "why this matters here" |
| System | Can connect bad foundational assumptions to serving, evaluation, or operational failures | Describing only local consequences without system-level reasoning |
| Debugging | Can identify whether a failure is caused by data, metrics, optimization, or implementation | Jumping to code fixes without isolating the failure layer |
| Architect | Can define what foundations teams must standardize and what can remain flexible | Generic "best practices" without org-specific trade-off reasoning |

---

## Must-Know Topics

- Python collections, iteration, comprehensions, generators, file and JSON handling
- Numerical computing intuition: vectorization vs loops, when each matters
- Matrix multiplication and shape reasoning
- Probability distributions, sampling, expectation, variance
- Precision, recall, F1, ROC-AUC, PR-AUC, calibration
- Gradient descent, learning rate, regularization, convergence intuition
- Autograd and compute graph basics
- Data leakage: types, causes, and how to prevent it
- Online vs offline evaluation divergence

## Anti-Patterns and Weak Answers

- Treating accuracy as the default metric under class imbalance
- Confusing overfitting with data leakage
- Using matrix words without actual shape reasoning
- Saying "PyTorch handles gradients" without understanding what graph it built
- Treating statistical significance, business significance, and model quality as the same thing
- Memorizing metric formulas without knowing when each metric misleads
- Discussing "data augmentation" without connecting to the specific failure it addresses
- Answering probability questions with formulas but no intuition about what the numbers mean

---

## Role Relevance

| Role | Depth Needed | Focus Areas |
|---|---|---|
| Software → AI | ★★★ | Python, tensors, metrics, autograd |
| Data / ML | ★★ | Metrics, evaluation, statistics, leakage |
| DL / CV | ★★ | Tensors, shapes, optimization, autograd |
| LLM / RAG / Agent | ★★ | Metrics, evaluation, embeddings intuition |
| Platform AI | ★★ | Metrics, evaluation pipeline design |
| DevOps → AIOps | ★★★ | Python, metrics, evaluation literacy |
| Research | ★★ | Probability, optimization, autograd |
| Senior / Architect | ★ | Evaluation strategy, metric standardization |

## Who Can Skim Parts

- Strong research or ML candidates can skim Python basics
- Senior architects can skim detailed Python syntax unless interviews are hands-on
- Experienced DL/CV engineers can skim tensor basics and focus on evaluation and metrics

---

## What To Study Next

- [Classical ML](./classical-ml.md) — builds on metrics, evaluation, and data reasoning
- [Deep Learning Core](./deep-learning-core.md) — builds on tensors, optimization, and autograd
- [Transformer and Modern LLM Internals](./transformer-and-modern-llm-internals.md) — builds on embeddings and attention intuition

## Question Bank

Practice questions for this module are in the [Foundations question bank](../../modules/00_foundations/):
- [Concept questions](../../modules/00_foundations/concept.md)
- [Applied questions](../../modules/00_foundations/applied.md)
- [System questions](../../modules/00_foundations/system.md)
- [Debugging questions](../../modules/00_foundations/debugging.md)

## Practice Surface

- [Batch 01 question library](../question-library/foundations/foundations-batch-01.md) — targeted fundamentals drilling by question
- [Problem Set 01](../problem-sets/foundations/foundations-problem-set-01.md) — baseline debugging, metrics judgment, and tensor reasoning practice

## Cross-References

- [Module Index](../indexes/module-index.md) — all modules with sequences and detail cards
- [Experience Index](../indexes/experience-index.md) — depth expectations by career band
- [Tag Index](../indexes/tag-index.md) — related tags: `python`, `statistics`, `probability`, `optimization`, `autograd`, `tensor`, `metrics`
- [Topic Graph](../topic-graph.md) — prerequisite map
