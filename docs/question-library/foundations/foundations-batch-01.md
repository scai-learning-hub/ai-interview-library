# Foundations — Batch 01

Module: Foundations · Topic Family A  
Questions: 25 · Levels: Concept, Applied, System, Debugging, Architect  
Complements: [Existing question bank](../../../modules/00_foundations/)

---

### Q-FND-B01-001: Why does PyTorch use dynamic computation graphs, and what does that mean for debugging vs performance?

**Topic Family:** Foundations  
**Subtopic:** Python for ML / Compute Graphs  
**Level:** Concept  
**Difficulty:** 2  
**Experience Bands:** 0–2, 2–5  
**Role Families:** software-foundations-to-ai-engineer, ml-data-engineer, research-applied-research  
**Interview Round:** Phone screen, Technical deep dive  
**Prerequisites:** Basic Python, numpy awareness  
**Tags:** `pytorch`, `computation-graph`, `eager-mode`, `torch-compile`  
**Why This Matters:** Understanding dynamic vs static graphs is foundational for debugging training issues and knowing when to use torch.compile for production optimization.

**Question**  
PyTorch uses dynamic (define-by-run) computation graphs. Explain what that means, how it differs from static graph frameworks, and what trade-offs it introduces for debugging, performance, and production deployment.

**Expected Answer (Short)**  
Dynamic graphs are built on each forward pass, making them easy to debug with standard Python tools. Static graphs (TensorFlow v1 style) are defined once and then executed, enabling more aggressive compiler optimization. PyTorch trades some raw performance for developer productivity. torch.compile bridges this gap by adding JIT compilation to eager-mode code.

**Deep Answer**  
- Dynamic graph: each line of Python creates graph nodes on the fly. You can use print(), pdb, conditional logic freely. The graph is rebuilt each iteration.
- Static graph: defined once, compiled, then run. Harder to debug but allows whole-graph optimization (operator fusion, memory planning).
- PyTorch's eager mode catches shape errors immediately at the offending line. In static frameworks, errors surface at graph compilation or execution time and are harder to trace.
- Performance gap: eager mode has Python overhead per operator call. For training this is often acceptable. For serving, the overhead per token matters more.
- torch.compile (PyTorch 2.x): applies dynamo tracing + inductor compiler to convert eager code into optimized graphs. Gives near-static-graph performance while keeping the eager development experience.
- Trade-off awareness: torch.compile can fail on highly dynamic control flow and has compilation latency on first run.
- Production implication: teams often develop in eager mode, then apply torch.compile or export to TorchScript/ONNX for serving.

**Follow-up Questions**  
- When does torch.compile fail, and how do you work around it?
- How does torch.compile relate to ONNX export for serving?
- Why does eager mode hurt inference latency more than training throughput?
- What is graph break in torch.compile, and why does it matter?

**Weak Answer Signals / Red Flags**  
- Cannot explain what "dynamic" means concretely
- Doesn't mention debugging advantages
- Claims PyTorch is always slower without mentioning torch.compile
- Confuses computation graph with neural network architecture

**Interviewer Signal**  
Reveals whether the candidate understands the development-to-production pipeline and framework internals beyond surface usage.

**Real-World Insight**  
Most production teams develop in eager mode for fast iteration, then benchmark with torch.compile before serving. Knowing when compilation helps (batch inference, static shapes) vs when it doesn't (highly dynamic agent tool calls) is a real deployment decision.

---

### Q-FND-B01-002: What is the difference between a tensor's shape, stride, and contiguity, and why do these matter for performance?

**Topic Family:** Foundations  
**Subtopic:** Tensor Thinking  
**Level:** Concept  
**Difficulty:** 2  
**Experience Bands:** 0–2, 2–5  
**Role Families:** software-foundations-to-ai-engineer, ml-data-engineer, deep-learning-cv-engineer, research-applied-research  
**Interview Round:** Phone screen, Technical deep dive  
**Prerequisites:** Basic numpy/torch usage  
**Tags:** `tensors`, `memory-layout`, `stride`, `contiguous`, `performance`  
**Why This Matters:** Memory layout directly affects GPU kernel efficiency. Misunderstanding contiguity causes subtle performance bugs and incorrect results in reshape operations.

**Question**  
Explain what shape, stride, and contiguity mean for a PyTorch tensor. Why does `.contiguous()` exist, and when does an operation produce a non-contiguous tensor?

**Expected Answer (Short)**  
Shape defines dimensions. Stride defines how many elements to skip in memory to move one step along each dimension. A tensor is contiguous when its memory layout matches C-order (row-major). Transpose and certain views produce non-contiguous tensors. Some CUDA kernels require contiguous input, so `.contiguous()` creates a copy with sequential layout.

**Deep Answer**  
- Shape: `(batch, seq_len, hidden_dim)` — logical dimensions
- Stride: for a `(3, 4)` contiguous tensor, stride is `(4, 1)` — moving along dim 0 jumps 4 elements, dim 1 jumps 1
- `.transpose()` swaps strides without copying data — the tensor becomes non-contiguous
- `.view()` requires contiguous memory; `.reshape()` handles non-contiguous by copying if needed
- Why it matters for performance: contiguous memory enables coalesced GPU memory access. Non-contiguous access patterns cause cache misses and poor GPU utilization
- Flash Attention and custom CUDA kernels often assert contiguity
- Memory overhead: calling `.contiguous()` allocates new memory — in tight loops this can cause OOM
- Debugging: `tensor.is_contiguous()` check is essential when diagnosing unexplained performance degradation

**Follow-up Questions**  
- What does `.view()` require that `.reshape()` doesn't?
- Can you have a tensor that is contiguous in Fortran order? When does that matter?
- How does non-contiguous memory affect GPU kernel performance?

**Weak Answer Signals / Red Flags**  
- Cannot explain stride at all
- Thinks contiguous means "stored on one GPU"
- Doesn't connect memory layout to performance
- Uses `.contiguous()` everywhere "just in case" without understanding when it's needed

**Interviewer Signal**  
Tests low-level tensor intuition that separates engineers who debug real training/serving issues from those who only use high-level APIs.

**Real-World Insight**  
OOM errors in custom attention kernels frequently trace back to unexpected `.contiguous()` copies. Teams serving ViTs or custom architectures hit this regularly.

---

### Q-FND-B01-003: How does autograd work in PyTorch, and what happens when you call `.backward()`?

**Topic Family:** Foundations  
**Subtopic:** Autograd and Differentiation  
**Level:** Concept  
**Difficulty:** 2  
**Experience Bands:** 0–2, 2–5  
**Role Families:** software-foundations-to-ai-engineer, ml-data-engineer, research-applied-research  
**Interview Round:** Phone screen, Technical deep dive  
**Prerequisites:** Calculus basics, computation graphs  
**Tags:** `autograd`, `backward`, `gradient`, `computation-graph`, `chain-rule`  
**Why This Matters:** Every training loop depends on autograd. Understanding it prevents gradient-related bugs and enables writing custom operations.

**Question**  
Walk through what happens when you call `loss.backward()` in PyTorch. What data structures are involved, what computation occurs, and what state changes on the model's parameters?

**Expected Answer (Short)**  
PyTorch maintains a DAG of operations linking the loss back to each parameter. `.backward()` traverses this graph in reverse topological order, computing gradients via the chain rule. After backward, each parameter's `.grad` attribute accumulates the gradient. Importantly, gradients accumulate — you must zero them before each optimizer step.

**Deep Answer**  
- During the forward pass, every operation on tensors with `requires_grad=True` records a `Function` node in the computation graph
- The graph is a DAG (Directed Acyclic Graph) — leaves are parameters, root is the loss
- `.backward()` starts at the loss node and:
  1. Computes local gradients for each Function using saved tensors
  2. Multiplies by incoming gradient (chain rule)
  3. Passes result to predecessor nodes
- Gradients accumulate in `param.grad` — this is **additive** across `.backward()` calls
- `optimizer.zero_grad()` clears gradients before each step. Forgetting this causes gradients from previous batches to leak in
- `torch.no_grad()` or `@torch.inference_mode()` disables graph construction for inference — critical for memory and speed
- `retain_graph=True` prevents graph cleanup after backward; needed for multiple backward passes but leaks memory if misused
- `gradient checkpointing`: trades compute for memory by not saving intermediate activations — recomputes them during backward

**Follow-up Questions**  
- Why do gradients accumulate by default? When is accumulation useful?
- What happens if you forget `optimizer.zero_grad()`?
- When would you use `retain_graph=True`, and why is it dangerous?
- How does gradient checkpointing reduce memory? What does it cost?

**Weak Answer Signals / Red Flags**  
- Cannot explain the chain rule in the context of a computation graph
- Doesn't mention gradient accumulation behavior
- Thinks backward automatically updates weights (confuses backward with optimizer.step)
- Cannot explain when to use `torch.no_grad()`

**Interviewer Signal**  
Core ML engineering literacy. Candidates who can trace the backward pass understand training bugs at a fundamental level.

**Real-World Insight**  
Gradient accumulation is intentionally used for simulating larger batch sizes on limited GPU memory. Understanding this distinction is essential for distributed training and memory-constrained fine-tuning.

---

### Q-FND-B01-004: When is the mean a misleading metric, and how do you choose between mean, median, percentiles, and distributions for evaluating ML systems?

**Topic Family:** Foundations  
**Subtopic:** Statistics and Evaluation  
**Level:** Applied  
**Difficulty:** 2  
**Experience Bands:** 0–2, 2–5, 5–8  
**Role Families:** software-foundations-to-ai-engineer, ml-data-engineer, llm-rag-agent-engineer, mlops-llmops-platform-engineer  
**Interview Round:** Technical deep dive  
**Prerequisites:** Basic statistics  
**Tags:** `statistics`, `evaluation`, `percentiles`, `tail-latency`, `metrics`  
**Why This Matters:** Production systems are often evaluated on means, which hide failures. Percentile thinking is essential for SLOs and user experience.

**Question**  
Give concrete examples of when the mean is a misleading metric for ML systems. How should you think about metric selection: when to use median, P95, P99, or full distributions?

**Expected Answer (Short)**  
Means are misleading with skewed distributions, outliers, or bimodal data. Latency should use P95/P99 because tail latency affects real users. Model accuracy on imbalanced classes hides failure on the minority class. Production SLOs are always defined on percentiles, not means.

**Deep Answer**  
- Mean latency of 200ms can hide P99 of 8 seconds — 1% of users have terrible experience
- Mean accuracy of 97% on imbalanced data can mean 0% recall on the rare class (e.g., fraud detection)
- Mean token cost per request hides a few runaway agent loops that consume 10x tokens
- When to use what:
  - **Median**: robust to outliers, good for "typical user experience"
  - **P95/P99**: captures tail behavior — essential for SLOs ("99% of requests under 500ms")
  - **Full distribution**: when bimodality is possible (e.g., cached vs uncached requests have completely different latency profiles)
  - **Mean**: acceptable when distribution is roughly normal and symmetric — rare in production
- In RAG: mean retrieval relevance score hides queries where retrieval completely fails
- In agents: mean trajectory length hides stuck loops that run 50+ steps
- Production insight: always start with histograms, then choose the right summary statistic

**Follow-up Questions**  
- How would you design an SLO for an LLM serving endpoint?
- When is variance more informative than percentiles?
- How do you detect bimodal distributions in production telemetry?

**Weak Answer Signals / Red Flags**  
- Reports only mean metrics for any system
- Doesn't connect metric choice to business impact
- Cannot give a concrete example of when mean misleads
- Uses "accuracy" as the default metric without questioning

**Interviewer Signal**  
Tests statistical maturity and production thinking. Candidates who think in distributions rather than single numbers are more reliable in operational roles.

**Real-World Insight**  
Every serving SLO at major companies is defined on percentiles. P99 latency at 10x the median is a common production issue that teams miss when they only monitor averages.

---

### Q-FND-B01-005: Explain the difference between precision, recall, F1, and when each is the right metric to optimize.

**Topic Family:** Foundations  
**Subtopic:** Evaluation Metrics  
**Level:** Concept  
**Difficulty:** 1  
**Experience Bands:** 0–2  
**Role Families:** software-foundations-to-ai-engineer, ml-data-engineer, llm-rag-agent-engineer  
**Interview Round:** Phone screen  
**Prerequisites:** Binary classification basics  
**Tags:** `precision`, `recall`, `f1`, `evaluation`, `classification`  
**Why This Matters:** Metric choice determines what your model optimizes for. Getting this wrong means the model succeeds on paper but fails for the business.

**Question**  
Define precision and recall. When would you optimize for high precision at the cost of recall, and when would you do the opposite? Give real-world examples.

**Expected Answer (Short)**  
Precision = of all positive predictions, how many are actually positive. Recall = of all actual positives, how many did we catch. Optimize precision when false positives are costly (spam filter blocking important email). Optimize recall when false negatives are costly (medical screening, fraud detection). F1 balances both when neither can be ignored.

**Deep Answer**  
- Precision = TP / (TP + FP) — "when we say yes, are we right?"
- Recall = TP / (TP + FN) — "of everything we should catch, how much do we catch?"
- F1 = harmonic mean of precision and recall — penalizes imbalance between the two
- **High precision, lower recall**: content moderation for auto-removal — better to miss some than to wrongly remove legitimate content
- **High recall, lower precision**: cancer screening — better to have false alarms than to miss real cases
- Threshold tuning: most classifiers output probabilities. Moving the threshold trades precision for recall (or vice versa). The precision-recall curve shows this trade-off.
- Class imbalance: accuracy can be 99% while recall on the minority class is 0%. Precision-recall is more informative than ROC in imbalanced settings.
- In RAG: retrieval precision = are the retrieved chunks relevant? Retrieval recall = did we find all relevant chunks?
- In LLM evaluation: precision of extracted entities vs recall of entities that should have been extracted

**Follow-up Questions**  
- When is ROC-AUC misleading? When is PR-AUC better?
- How does changing the classification threshold affect the precision-recall trade-off?
- How do you compute precision and recall for a multi-class problem?

**Weak Answer Signals / Red Flags**  
- Defines metrics but cannot connect to a real decision
- Cannot explain the trade-off between precision and recall
- Defaults to accuracy for all classification problems
- Doesn't mention threshold tuning

**Interviewer Signal**  
Tests whether the candidate can translate metric definitions into real system decisions. This is the most basic evaluation literacy — gaps here signal fundamental weakness.

**Real-World Insight**  
Every production ML system has an implicit precision-recall trade-off. The product team's tolerance for false positives vs false negatives determines the right default, and the threshold should be tunable in production without retraining.

---

### Q-FND-B01-006: What is the computational and memory cost of matrix multiplication, and why does this matter for transformer inference?

**Topic Family:** Foundations  
**Subtopic:** Tensor Thinking / Compute  
**Level:** Applied  
**Difficulty:** 3  
**Experience Bands:** 2–5, 5–8  
**Role Families:** ml-data-engineer, deep-learning-cv-engineer, research-applied-research, mlops-llmops-platform-engineer  
**Interview Round:** Technical deep dive  
**Prerequisites:** Linear algebra basics, transformer awareness  
**Tags:** `matmul`, `flops`, `memory-bandwidth`, `compute-bound`, `memory-bound`  
**Why This Matters:** Understanding matmul costs is the foundation for reasoning about model size, training time, inference throughput, and GPU utilization.

**Question**  
What is the computational complexity of multiplying two matrices of shape (M, K) and (K, N)? How does this connect to transformer inference costs, and when is the operation compute-bound vs memory-bandwidth-bound?

**Expected Answer (Short)**  
The computation is O(MKN) FLOPs, and the memory transfer is O(MK + KN + MN). When the matrices are large (training), the operation is typically compute-bound. When batch size is small (inference, especially autoregressive decoding), the operation becomes memory-bandwidth-bound because there are not enough FLOPs to amortize the cost of loading weights from GPU memory.

**Deep Answer**  
- FLOPs: 2 × M × K × N (multiply-accumulate for each output element)
- Memory: must load both input matrices and write the output matrix
- Arithmetic intensity = FLOPs / bytes transferred. Higher intensity = more compute-bound
- Transformer self-attention: Q×K^T is (seq_len, head_dim) × (head_dim, seq_len) → O(seq_len² × head_dim)
- During autoregressive generation: one token at a time, so effective batch dimension is 1. Arithmetic intensity is very low → memory-bandwidth-bound
- This is why LLM inference is called "memory-bandwidth-bound" — the GPU spends most time loading weights, not computing
- Implication for batching: larger batch sizes increase arithmetic intensity, shifting toward compute-bound → better GPU utilization
- Implication for quantization: reducing weight precision (FP16 → INT8 → INT4) reduces bytes transferred, directly improving memory-bound operations
- Training vs inference: training has large batch sizes and full sequences → typically compute-bound. Inference (especially decoding) has batch=1 or small → memory-bound.

**Follow-up Questions**  
- Why does increasing batch size improve GPU utilization during inference?
- How does Flash Attention change the memory access pattern for attention?
- What does MFU (Model FLOPs Utilization) measure and why is it usually below 50%?

**Weak Answer Signals / Red Flags**  
- Cannot state the complexity of matmul
- Doesn't connect matmul cost to transformer layers
- Uses "compute-bound" and "memory-bound" interchangeably
- Cannot explain why quantization helps inference speed

**Interviewer Signal**  
Tests whether the candidate can reason about model performance from first principles rather than memorizing benchmark numbers.

**Real-World Insight**  
The memory-bandwidth bottleneck is why vLLM's PagedAttention and continuous batching exist — they maximize GPU memory utilization to improve throughput for the memory-bound decoding phase.

---

### Q-FND-B01-007: How does mixed precision training work, and what can go wrong?

**Topic Family:** Foundations  
**Subtopic:** Training Mechanics  
**Level:** Applied  
**Difficulty:** 3  
**Experience Bands:** 2–5, 5–8  
**Role Families:** ml-data-engineer, deep-learning-cv-engineer, research-applied-research  
**Interview Round:** Technical deep dive  
**Prerequisites:** Floating point basics, training loop  
**Tags:** `mixed-precision`, `fp16`, `bf16`, `loss-scaling`, `training`  
**Why This Matters:** Mixed precision is standard for modern training. Understanding it prevents training instability and enables correct performance optimization.

**Question**  
Explain how mixed precision training works in PyTorch. What is the role of FP16 vs BF16 vs FP32? What is loss scaling, and when does mixed precision cause training to diverge?

**Expected Answer (Short)**  
Mixed precision keeps a master copy of weights in FP32 while running forward/backward passes in FP16/BF16 for speed. Loss scaling multiplies the loss before backward to prevent small gradients from underflowing to zero in FP16. BF16 has the same exponent range as FP32 so it doesn't need loss scaling, but has less mantissa precision than FP16.

**Deep Answer**  
- FP32: 8 exponent, 23 mantissa bits. Full precision, baseline
- FP16: 5 exponent, 10 mantissa. 2x throughput, but limited range (max ~65504). Small gradients underflow to zero.
- BF16: 8 exponent, 7 mantissa. Same range as FP32, less precision. No underflow issues, slightly less accurate per operation.
- AMP (Automatic Mixed Precision) workflow:
  1. Forward pass in FP16/BF16 (faster GEMM on tensor cores)
  2. Loss computation in FP32
  3. Loss scaling: multiply loss by a large factor before backward, so gradients stay representable in FP16
  4. Gradient unscaling before optimizer step
  5. Master weights updated in FP32
- Dynamic loss scaling: starts high, halves when inf/nan gradients appear, doubles when stable
- When it fails:
  - Loss scaling too aggressive → inf gradients → skipped updates → training stalls
  - Normalization layers accumulating statistics in FP16 → precision loss → instability
  - Very small learning rates combined with FP16 → weight updates vanish
- BF16 on modern GPUs (A100, H100, RTX 40/50): preferred because no loss scaling needed
- Production tip: use BF16 if hardware supports it. Fall back to FP16 with AMP if not.

**Follow-up Questions**  
- Why does BF16 not need loss scaling while FP16 does?
- What is the relationship between tensor cores and mixed precision?
- How does mixed precision interact with gradient accumulation?
- When would you NOT use mixed precision?

**Weak Answer Signals / Red Flags**  
- Thinks mixed precision is just "use FP16 everywhere"
- Doesn't mention loss scaling at all
- Confuses FP16 and BF16 capabilities
- Doesn't know that master weights are kept in FP32

**Interviewer Signal**  
Tests practical training knowledge. Candidates who understand mixed precision mechanics can debug training instabilities that others cannot.

**Real-World Insight**  
Most modern LLM training uses BF16 on Ampere/Hopper GPUs. Legacy models and inference pipelines still use FP16 with AMP. Knowing when each applies prevents wasting weeks on training instability.

---

### Q-FND-B01-008: What is the difference between torch.no_grad() and torch.inference_mode(), and when should each be used?

**Topic Family:** Foundations  
**Subtopic:** Autograd / Inference  
**Level:** Applied  
**Difficulty:** 2  
**Experience Bands:** 0–2, 2–5  
**Role Families:** software-foundations-to-ai-engineer, ml-data-engineer  
**Interview Round:** Technical deep dive  
**Prerequisites:** Autograd basics  
**Tags:** `no-grad`, `inference-mode`, `pytorch`, `memory`, `performance`  
**Why This Matters:** Using the wrong context manager wastes memory in production or breaks gradient computation during training.

**Question**  
When should you use `torch.no_grad()` vs `torch.inference_mode()` in PyTorch? What does each actually do under the hood, and what happens if you use neither during inference?

**Expected Answer (Short)**  
Both disable gradient tracking. `no_grad()` prevents gradient computation but allows tensor operations that could be used in gradient-requiring code later. `inference_mode()` is stricter — it marks tensors as "inference tensors" that cannot be used in any autograd computation, enabling more aggressive memory optimization. For pure inference, use `inference_mode()`. For validation during training, use `no_grad()`.

**Deep Answer**  
- `torch.no_grad()`: disables gradient tracking. Tensors created inside can still be used outside the context (but without gradients). Used during validation in training loops because you may need tensors afterward for logging.
- `torch.inference_mode()`: creates "inference tensors" that are permanently detached from autograd. PyTorch can skip bookkeeping entirely, save more memory, and run slightly faster. But these tensors cannot be inputs to any gradient-requiring operation.
- Without either: every operation during inference builds an unnecessary computation graph → wastes GPU memory → can cause OOM with large models
- Memory impact: for a 7B parameter model, inference without either context manager allocates significant extra memory for graph structures
- Best practice: `inference_mode()` for all serving/evaluation code. `no_grad()` only when you specifically need to use output tensors in gradient-enabled contexts.
- Common mistake: using `model.eval()` thinking it disables gradients — it only affects dropout and batchnorm behavior, NOT gradient computation

**Follow-up Questions**  
- What does `model.eval()` do that `no_grad()` does not?
- Can you mix `inference_mode()` tensors with regular tensors?
- How much memory does the computation graph consume relative to model weights?

**Weak Answer Signals / Red Flags**  
- Thinks `model.eval()` disables gradients
- Cannot distinguish between the two context managers
- Doesn't know the memory implications of skipping both
- Uses `no_grad()` everywhere when `inference_mode()` would be correct

**Interviewer Signal**  
Tests whether the candidate understands PyTorch memory management for production inference — a common gap for engineers who only train models.

**Real-World Insight**  
Serving pipelines that forget `inference_mode()` waste 10–30% GPU memory on unnecessary graph bookkeeping. In memory-constrained serving (e.g., vLLM with large KV cache), this can be the difference between serving and OOM.

---

### Q-FND-B01-009: You have a classification model with 95% accuracy. The product team says it is not working. What do you investigate?

**Topic Family:** Foundations  
**Subtopic:** Evaluation / Production Reasoning  
**Level:** Debugging  
**Difficulty:** 3  
**Experience Bands:** 2–5, 5–8  
**Role Families:** software-foundations-to-ai-engineer, ml-data-engineer, llm-rag-agent-engineer, mlops-llmops-platform-engineer  
**Interview Round:** Debugging, Technical deep dive  
**Prerequisites:** Evaluation metrics, data distribution  
**Tags:** `evaluation`, `debugging`, `class-imbalance`, `production`, `distribution-shift`  
**Why This Matters:** The gap between metric success and product failure is one of the most common production ML issues.

**Question**  
Your classification model has 95% accuracy on the test set, but the product team reports it is not working for users. What are the most likely causes, and how do you systematically investigate?

**Expected Answer (Short)**  
95% accuracy can hide class imbalance (95% majority class → the model always predicts the majority), distribution shift between test and production data, different error costs across classes, or metric mismatch (the business cares about precision on a specific class, not overall accuracy).

**Deep Answer**  
- **Class imbalance**: if 95% of examples are class A, predicting A every time gives 95% accuracy with 0% recall on class B. Check per-class metrics.
- **Distribution shift**: test set may not represent production traffic. Check production distribution vs training/test distribution.
- **Metric mismatch**: product team may care about specific classes. A fraud detector with 95% accuracy but 20% fraud recall is failing the product goal.
- **Data leakage in eval**: test set may overlap with training data, inflating metrics. Check for leakage.
- **Annotation quality**: labels may be wrong. Some "correct" predictions may be matching incorrect labels.
- Investigation sequence:
  1. Compute per-class precision, recall, confusion matrix on production samples
  2. Compare production data distribution to training data distribution
  3. Identify which user cases fail — is there a pattern? (certain categories, time periods, geographies)
  4. Sample production failures and manually inspect
  5. Check if the eval metric matches the product OKR
- Often the fix is not model improvement but metric alignment or threshold tuning

**Follow-up Questions**  
- How would you design an evaluation that prevents this disconnect?
- What is the role of sliced evaluation (evaluating subsets separately)?
- How do you set up monitoring to catch this before the product team notices?

**Weak Answer Signals / Red Flags**  
- Says "95% is good, the product team is wrong"
- Jumps to "retrain the model" without investigating
- Cannot list concrete investigation steps
- Doesn't mention per-class metrics

**Interviewer Signal**  
Tests production debugging maturity. The gap between offline metrics and real-world performance is where many interviews separate mid-level from senior engineers.

**Real-World Insight**  
This exact scenario happens monthly at companies launching ML features. The fix is usually metric redesign, threshold adjustment, or evaluation on production-representative slices — not more training data or a bigger model.

---

### Q-FND-B01-010: What is the difference between a Python generator, a DataLoader worker, and a prefetch queue, and how do they compose for training pipeline performance?

**Topic Family:** Foundations  
**Subtopic:** Python for ML / Data Loading  
**Level:** Applied  
**Difficulty:** 3  
**Experience Bands:** 2–5, 5–8  
**Role Families:** software-foundations-to-ai-engineer, ml-data-engineer, deep-learning-cv-engineer  
**Interview Round:** Technical deep dive  
**Prerequisites:** Python generators, multiprocessing basics  
**Tags:** `dataloader`, `pipeline`, `python`, `gpu-utilization`, `prefetch`  
**Why This Matters:** GPU-starved training (GPU idle waiting for data) is a common and expensive problem. Understanding data loading architecture prevents it.

**Question**  
How do Python generators, PyTorch DataLoader workers, and prefetch queues work together to keep GPU utilization high during training? What happens when this pipeline breaks down?

**Expected Answer (Short)**  
Generators lazily produce data. DataLoader workers run multiple dataset `__getitem__` calls in parallel processes to overlap CPU preprocessing with GPU compute. The prefetch queue pre-loads batches so the GPU never waits. When data loading is slower than GPU compute, the GPU sits idle — this is "data-starved" training.

**Deep Answer**  
- `Dataset.__getitem__()`: fetches and preprocesses one sample (disk I/O, decode, augmentation, tokenization)
- `DataLoader(num_workers=N)`: spawns N worker processes that call `__getitem__` in parallel using multiprocessing
- `prefetch_factor`: how many batches each worker pre-loads into the queue
- Pipeline: Workers fill queue → main process transfers batch to GPU → model runs forward/backward → repeat
- GPU utilization drops when: `num_workers` too low, preprocessing too slow, I/O bottleneck (NFS, slow disk), GIL contention in custom code
- `pin_memory=True`: allocates batch in page-locked (pinned) memory for faster CPU→GPU transfer via DMA. Essential for GPU training.
- Generator vs DataLoader: raw Python generators are single-process, blocking. DataLoader parallelizes across workers
- Debugging: use `torch.utils.bottleneck` or profile with `torch.profiler` to find data loading gaps
- Common mistakes: `num_workers=0` in production training, heavy augmentation in `__getitem__` without multi-worker, forgetting `pin_memory`

**Follow-up Questions**  
- How do you diagnose data-starved training?
- What is the GIL and how does it affect DataLoader workers?
- When would you use IterableDataset vs MapDataset?
- How does distributed training (DDP) interact with DataLoader workers?

**Weak Answer Signals / Red Flags**  
- Doesn't know what num_workers does
- Thinks GPU training is always compute-bound
- Cannot explain pin_memory
- Uses DataLoader without understanding the worker model

**Interviewer Signal**  
Tests practical training infrastructure knowledge. Teams that don't understand data loading waste GPU hours — the most expensive resource in ML.

**Real-World Insight**  
At scale, data loading is often the bottleneck, not the model. Companies invest heavily in data loading optimization: WebDataset for web-scale training, custom prefetch pipelines, and SSD-direct I/O for large datasets.

---

### Q-FND-B01-011: How do you reason about whether a model is underfitting vs overfitting, and what are the correct interventions for each?

**Topic Family:** Foundations  
**Subtopic:** Model Diagnostics  
**Level:** Concept  
**Difficulty:** 2  
**Experience Bands:** 0–2, 2–5  
**Role Families:** software-foundations-to-ai-engineer, ml-data-engineer, research-applied-research  
**Interview Round:** Phone screen, Technical deep dive  
**Prerequisites:** Training/validation loss, bias-variance  
**Tags:** `underfitting`, `overfitting`, `regularization`, `model-selection`, `diagnostics`  
**Why This Matters:** This is the most fundamental diagnostic skill in ML. Getting the diagnosis wrong leads to wasted effort — adding data when the model is too simple, or adding regularization when the model can't even fit the training set.

**Question**  
How do you determine if a model is underfitting vs overfitting using training and validation curves? What are the correct interventions for each case?

**Expected Answer (Short)**  
Underfitting: both training and validation loss are high — the model cannot capture the patterns. Fix by increasing model capacity, training longer, or improving features. Overfitting: training loss is low but validation loss is high — the model memorizes training data. Fix by adding regularization, getting more data, reducing model capacity, or using dropout/early stopping.

**Deep Answer**  
- **Underfitting signals**: training loss plateaus high, validation loss also high, model accuracy is poor even on training data
- **Underfitting fixes**: increase model capacity (more layers, wider layers), train longer, better features, reduce regularization, check for data quality issues (wrong labels)
- **Overfitting signals**: training loss keeps dropping, validation loss starts increasing (gap widens), model memorizes training examples
- **Overfitting fixes**: more training data, data augmentation, dropout, weight decay (L2), early stopping, reduce model capacity
- **Nuance**: some gap between train and val loss is normal. The question is whether val loss is still improving or has diverged
- **Learning rate issues**: can look like underfitting. If LR is too high, loss oscillates. If too low, convergence is very slow.
- **Data issues masking as model issues**: mislabeled data causes high training loss that looks like underfitting but is actually a data problem
- **Production nuance**: slight overfitting to the training distribution might be acceptable if the production distribution matches. Severe overfitting always degrades production performance.

**Follow-up Questions**  
- How does the learning rate interact with the underfitting/overfitting diagnosis?
- What would a learning curve (train/val loss vs dataset size) tell you?
- When is a small train-val gap NOT evidence of good generalization?

**Weak Answer Signals / Red Flags**  
- Cannot articulate the training/validation loss relationship
- Treats all poor performance as "get more data"
- Confuses underfitting and overfitting interventions
- Doesn't mention regularization options

**Interviewer Signal**  
Fundamental diagnostic thinking. Candidates who cannot diagnose under/overfitting will waste cycles on wrong interventions in every project.

**Real-World Insight**  
In LLM fine-tuning, overfitting is extremely common with small datasets and LoRA — validation loss can start increasing after just 1–2 epochs. Setting up early stopping and monitoring val loss is essential.

---

### Q-FND-B01-012: What CUDA device properties should you check before starting a training or inference job, and why?

**Topic Family:** Foundations  
**Subtopic:** CUDA / GPU Awareness  
**Level:** Applied  
**Difficulty:** 3  
**Experience Bands:** 2–5, 5–8  
**Role Families:** ml-data-engineer, deep-learning-cv-engineer, mlops-llmops-platform-engineer, devops-sre-to-aiops  
**Interview Round:** Technical deep dive, Production round  
**Prerequisites:** Basic GPU awareness  
**Tags:** `cuda`, `gpu`, `device-properties`, `memory`, `compute-capability`  
**Why This Matters:** Deploying to the wrong GPU or ignoring GPU characteristics leads to OOM errors, slow training, or incompatible operations.

**Question**  
Before running a training or inference workload, what GPU device properties should you check, and how does each property affect your decisions about model selection, batch size, precision, and serving configuration?

**Expected Answer (Short)**  
Check: total GPU memory (determines model size and batch size), compute capability (determines which operations and precisions are supported), number of SMs (computational throughput), memory bandwidth (inference speed for memory-bound workloads), and multi-GPU topology (NVLink vs PCIe for distributed training).

**Deep Answer**  
- **GPU memory (VRAM)**: determines maximum model size + KV cache + activations + optimizer state
  - 7B FP16 model ≈ 14GB weights. Add KV cache, activations, optimizer states for training
  - Rule of thumb: training needs ~4x the weight memory (weights + gradients + optimizer states)
- **Compute capability (sm_XX)**: determines supported operations
  - sm_80 (A100): BF16 tensor cores, TF32
  - sm_89 (RTX 4090): FP8 support
  - sm_90 (H100): FP8, enhanced transformer engine
  - Incompatible capability → CUDA kernel errors
- **Memory bandwidth**: GB/s of data transfer HBM↔compute
  - A100: 2TB/s HBM2e, H100: 3.35TB/s HBM3
  - Directly limits inference throughput for memory-bound workloads
- **Multi-GPU interconnect**: NVLink (600 GB/s on H100) vs PCIe (64 GB/s)
  - Distributed training communication-bound? NVLink essential
  - Tensor parallelism feasible only with high-bandwidth interconnect
- **Practical commands**: `torch.cuda.get_device_properties()`, `nvidia-smi`, `torch.cuda.mem_get_info()`

**Follow-up Questions**  
- How do you estimate whether a model will fit on a given GPU?
- What happens when you run a BF16 model on a GPU without BF16 tensor cores?
- How does NVLink vs PCIe affect your choice of parallelism strategy?

**Weak Answer Signals / Red Flags**  
- Only checks "how much memory do I have?"
- Doesn't know about compute capability
- Cannot estimate model memory requirements
- Ignores multi-GPU topology

**Interviewer Signal**  
Tests hardware awareness. Engineers who understand GPU properties make better serving decisions and avoid expensive trial-and-error deployment.

**Real-World Insight**  
Cloud GPU instances vary dramatically — an A10G (24GB, PCIe) vs an A100 (80GB, NVLink) have completely different capacity profiles. Choosing the wrong instance type for your workload is a common cost mistake.

---

### Q-FND-B01-013: Why does shuffling matter during training, and when should you NOT shuffle?

**Topic Family:** Foundations  
**Subtopic:** Training Best Practices  
**Level:** Concept  
**Difficulty:** 1  
**Experience Bands:** 0–2  
**Role Families:** software-foundations-to-ai-engineer, ml-data-engineer  
**Interview Round:** Phone screen  
**Prerequisites:** Training loop basics  
**Tags:** `shuffle`, `training`, `batch-composition`, `data-loading`  
**Why This Matters:** Shuffling affects training convergence and can hide or introduce subtle bugs.

**Question**  
Why is shuffling the training data important? When should you NOT shuffle, and what bugs can arise from incorrect shuffling?

**Expected Answer (Short)**  
Shuffling prevents the model from learning patterns in the order of data presentation (e.g., all class A examples first, then class B). Without shuffling, batches may be homogeneous, causing oscillating gradients and poor convergence. Don't shuffle time series data or sequential data where order matters. Bug: shuffling validation data differently across runs makes results non-reproducible.

**Deep Answer**  
- Without shuffling: if data is sorted by class, consecutive batches contain only one class → gradients oscillate between class boundaries → slow or failed convergence
- Shuffling ensures each batch is representative of the overall distribution
- **Don't shuffle**: time series prediction (order is the signal), streaming/online learning, sequence-to-sequence where ordering encodes context
- **Don't shuffle validation/test**: evaluation must be deterministic. Shuffle only training data.
- **Common bug**: using IterableDataset with DDP (Distributed Data Parallel) and not properly partitioning — workers see overlapping data, effectively reducing effective dataset size
- **Reproducibility**: set random seed for DataLoader shuffle to get deterministic batch ordering across runs
- **Token-level shuffling in NLP**: sentences should be shuffled, but tokens within a sentence should NOT be shuffled (order is the signal)

**Follow-up Questions**  
- How does shuffling work in distributed training (DDP)?
- What is curriculum learning and how does it intentionally control ordering?
- How do you shuffle a dataset too large to fit in memory?

**Weak Answer Signals / Red Flags**  
- Doesn't know why shuffling matters
- Shuffles everything including validation data and time series
- Doesn't mention reproducibility concerns
- Cannot explain what happens without shuffling

**Interviewer Signal**  
Basic training hygiene. This is a fast litmus test for engineering discipline.

**Real-World Insight**  
In large-scale pre-training, shuffling is done at the dataset-construction stage (shuffled shards). DataLoader shuffling at train time is impractical for web-scale data. Understanding this distinction matters for data pipeline design.

---

### Q-FND-B01-014: Design a model evaluation strategy for a system where ground truth arrives days or weeks after prediction.

**Topic Family:** Foundations  
**Subtopic:** Evaluation Design  
**Level:** System  
**Difficulty:** 4  
**Experience Bands:** 5–8, 8–12  
**Role Families:** ml-data-engineer, mlops-llmops-platform-engineer, senior-architect-ai-systems-lead  
**Interview Round:** System design, Technical deep dive  
**Prerequisites:** Evaluation fundamentals, production systems  
**Tags:** `evaluation`, `delayed-labels`, `proxy-metrics`, `production`, `monitoring`  
**Why This Matters:** Many real ML systems (fraud detection, content recommendation, medical diagnosis) have delayed feedback. Without proxy evaluation, you fly blind for days or weeks.

**Question**  
You are deploying a model where ground truth labels arrive 2–14 days after prediction time. How do you design an evaluation strategy that gives useful signal before the labels arrive?

**Expected Answer (Short)**  
Use proxy metrics (prediction confidence distribution, feature distribution shifts, output distribution stability) for immediate monitoring. Set up a delayed evaluation pipeline that joins predictions with labels as they arrive. Use human review sampling for fast spot-checks. Alert on proxy metric drift immediately, and validate with ground-truth metrics on a rolling window.

**Deep Answer**  
- **Immediate (no labels)**: monitor prediction confidence distributions, output class distributions, input feature distributions. Any drift signals potential issues.
- **Fast proxies**: human review on a sample (1–5% of predictions), rule-based sanity checks (e.g., "price prediction should be within 10x of recent average")
- **Delayed ground truth pipeline**:
  1. Store every prediction with a unique ID and timestamp
  2. As labels arrive, join prediction ↔ label
  3. Compute metrics on rolling windows (daily, weekly)
  4. Track metric trends, not just single-point values
- **Alerting design**:
  - Alert immediately on proxy metric drift (distribution shift, confidence anomalies)
  - Alert on ground-truth metrics when they become available (but don't wait weeks to learn)
- **Bucketed evaluation**: segment by prediction time (Monday predictions evaluated together once labels arrive)
- **A/B testing with delayed labels**: need sufficient time before drawing conclusions — statistical significance requires enough labeled samples
- **Catastrophic failure detection**: even without labels, if predictions suddenly become uniform or confidence drops dramatically, intervene immediately

**Follow-up Questions**  
- How do you set up monitoring alerts that fire before ground truth arrives?
- What happens if the label delay varies (some 2 days, some 14 days)?
- How does this affect canary deployment and rollback decisions?

**Weak Answer Signals / Red Flags**  
- Waits for ground truth before evaluating anything
- No proxy metric thinking
- Doesn't design a join pipeline for delayed labels
- Cannot reason about evaluation timing in production

**Interviewer Signal**  
Tests production evaluation maturity. This separates engineers who have operated ML systems from those who have only trained models.

**Real-World Insight**  
Fraud detection, medical diagnosis, loan default prediction, and ad recommendation all have delayed labels. Companies that don't invest in proxy metrics discover problems weeks late, after significant revenue or trust impact.

---

### Q-FND-B01-015: What is the GIL, and how does it affect ML training and serving workloads in Python?

**Topic Family:** Foundations  
**Subtopic:** Python for ML  
**Level:** Applied  
**Difficulty:** 2  
**Experience Bands:** 0–2, 2–5  
**Role Families:** software-foundations-to-ai-engineer, ml-data-engineer  
**Interview Round:** Technical deep dive  
**Prerequisites:** Basic Python concurrency  
**Tags:** `gil`, `python`, `multiprocessing`, `threading`, `performance`  
**Why This Matters:** Python's GIL is often cited as a bottleneck but its actual impact on ML workloads is nuanced. Understanding it prevents incorrect optimization decisions.

**Question**  
What is the Python GIL, how does it affect ML training and serving performance, and when does it actually matter vs when is it irrelevant?

**Expected Answer (Short)**  
The GIL (Global Interpreter Lock) prevents multiple threads from executing Python bytecode simultaneously. For ML, it is mostly irrelevant during GPU computation (the GPU runs independently of the GIL) but matters for data loading, preprocessing, and serving request handling. That is why DataLoader uses multiprocessing (separate processes, each with their own GIL) rather than threading.

**Deep Answer**  
- GIL: only one thread can execute Python bytecode at a time, even on multi-core CPUs
- **When GIL doesn't matter**: GPU operations (CUDA kernels run on GPU, Python releases GIL during CUDA calls), I/O-bound operations (threading still works for network/disk I/O because GIL is released during I/O waits)
- **When GIL matters**: CPU-bound preprocessing (tokenization, image augmentation, feature engineering). Multiple threads doing Python computation will serialize.
- **DataLoader solution**: `num_workers>0` uses `multiprocessing`, not `threading`. Each worker is a separate process with its own GIL. Overhead: process creation, memory duplication, IPC.
- **Serving impact**: Python HTTP servers (Flask, FastAPI with sync handlers) can only handle one request at a time per process. Solution: uvicorn with multiple workers, or async handlers that release GIL during I/O
- **NumPy/PyTorch**: release GIL during C/CUDA operations, so numerical operations in threads can run in parallel
- **Python 3.13+**: free-threaded Python (no-GIL mode) is experimental. May change this picture in the future.

**Follow-up Questions**  
- Why does DataLoader use multiprocessing instead of threading?
- How does the GIL affect a serving pipeline with multiple concurrent requests?
- When would you use threading vs multiprocessing in an ML pipeline?

**Weak Answer Signals / Red Flags**  
- Says "GIL makes Python slow for ML" without nuance
- Doesn't know that GPU operations bypass the GIL
- Doesn't distinguish between threading and multiprocessing
- Claims the GIL prevents all concurrency

**Interviewer Signal**  
Tests Python systems knowledge. Engineers who understand the GIL make correct decisions about parallelism, serving architecture, and data pipeline design.

**Real-World Insight**  
Most serving frameworks (vLLM, TGI) use Rust/C++ for the hot path and only use Python for configuration and orchestration. Understanding why reveals the GIL's practical impact on serving architecture.

---

### Q-FND-B01-016: What is the difference between micro-averaging and macro-averaging for multiclass metrics, and when does the choice matter?

**Topic Family:** Foundations  
**Subtopic:** Evaluation Metrics  
**Level:** Concept  
**Difficulty:** 2  
**Experience Bands:** 0–2, 2–5  
**Role Families:** ml-data-engineer, research-applied-research, llm-rag-agent-engineer  
**Interview Round:** Phone screen, Technical deep dive  
**Prerequisites:** Precision, recall, confusion matrix  
**Tags:** `metrics`, `evaluation`, `multiclass`, `micro-average`, `macro-average`  
**Why This Matters:** The averaging method can flip your conclusion about model quality. Choosing wrong leads to shipping a model that fails on important minority classes.

**Question**  
Explain the difference between micro-averaging and macro-averaging for multiclass classification metrics. When does the choice between them change your evaluation conclusion?

**Expected Answer (Short)**  
Micro-averaging aggregates TP, FP, FN across all classes before computing the metric — it is dominated by the majority class. Macro-averaging computes the metric per class and then averages — it gives equal weight to every class. For imbalanced datasets, micro and macro can give very different results, and macro better reveals poor performance on minority classes.

**Deep Answer**  
- **Micro-average**: sum all true positives, false positives, false negatives across classes, then compute precision/recall. Equivalent to accuracy for some metrics. Weighted toward majority class.
- **Macro-average**: compute precision/recall for each class independently, then take the unweighted mean. Each class contributes equally regardless of size.
- **Weighted-average**: like macro but weights by class frequency. Compromise between micro and macro.
- **When it matters**: 3-class problem with 90% class A, 5% class B, 5% class C. Model predicts A for everything. Micro-F1 ≈ 0.90 (looks great). Macro-F1 ≈ 0.30 (reveals failure on B and C).
- **In NER (Named Entity Recognition)**: micro-average is standard because entity types have very different frequencies
- **In sentiment analysis**: macro-average is often better because each sentiment class matters equally
- **In LLM evaluation**: per-task macro-averaging across benchmarks is common (MMLU averages across subjects equally)
- **Production implication**: always report BOTH micro and macro, plus per-class breakdown

**Follow-up Questions**  
- When would weighted-average be the right choice?
- How does this apply to multilabel classification?
- In what scenarios would micro and macro give nearly identical results?

**Weak Answer Signals / Red Flags**  
- Doesn't know the difference
- Reports only one averaging method without justification
- Cannot explain how imbalance affects the metrics
- Says "I always use accuracy"

**Interviewer Signal**  
Tests evaluation nuance. A candidate who understands averaging methods will make better decisions about model quality for real-world applications.

**Real-World Insight**  
Benchmark leaderboards often use specific averaging methods that can be gamed. MMLU uses macro-averaging across subjects, so models that are strong on common subjects but weak on rare ones look worse on macro than micro.

---

### Q-FND-B01-017: What happens when your training data has label noise, and how do you detect and handle it?

**Topic Family:** Foundations  
**Subtopic:** Data Quality  
**Level:** Applied  
**Difficulty:** 3  
**Experience Bands:** 2–5, 5–8  
**Role Families:** ml-data-engineer, research-applied-research, llm-rag-agent-engineer  
**Interview Round:** Technical deep dive  
**Prerequisites:** Training basics, evaluation  
**Tags:** `label-noise`, `data-quality`, `annotation`, `confident-learning`  
**Why This Matters:** Most real-world datasets have 5–20% label noise. Ignoring it means training a model to memorize mistakes.

**Question**  
How does label noise affect model training? How can you detect noisy labels, and what strategies exist for training robustly despite them?

**Expected Answer (Short)**  
Label noise raises the effective floor on training loss — the model cannot reach zero loss even if it memorizes everything. It causes the model to learn incorrect decision boundaries. Detection: look at samples where a trained model disagrees with the label (high loss examples). Handling: clean noisy labels, use noise-robust losses (symmetric cross-entropy), or use curriculum/confidence-based filtering.

**Deep Answer**  
- **Impact**: 5–10% noise can degrade accuracy by 2–5%. Neural networks can memorize noise, but this reduces generalization.
- **Detection techniques**:
  - **Loss-based**: sort by per-sample loss after training. High-loss examples are likely mislabeled or genuinely ambiguous
  - **Confident Learning** (cleanlab): use model predictions across epochs to identify label-probability disagreements
  - **Cross-validation disagreement**: train on 80%, predict on 20%. Disagreements with labels are noise candidates.
  - **Human audit**: sample high-disagreement examples for manual review
- **Handling strategies**:
  - **Relabel**: fix incorrect labels manually (gold standard but expensive)
  - **Remove**: drop suspected noisy samples (simple but loses data)
  - **Robust losses**: symmetric cross-entropy, generalized cross-entropy — less sensitive to wrong labels
  - **Co-teaching**: train two models, each teaches the other using low-loss samples
  - **Label smoothing**: softens targets (e.g., [0, 1] → [0.05, 0.95]) — reduces confidence in any single label
  - **Sample weighting**: downweight suspected noisy samples
- In LLM fine-tuning: instruction tuning data quality is even more critical because the dataset is typically small (1k–50k examples). A few bad examples have outsized impact.

**Follow-up Questions**  
- How would you use cleanlab or similar tools in a fine-tuning pipeline?
- When is label smoothing a proxy for handling noise vs an intentional regularizer?
- How do you balance the cost of relabeling vs training with noise?

**Weak Answer Signals / Red Flags**  
- Assumes training data is always correctly labeled
- Only solution is "get more data"
- Cannot describe a detection method
- Ignores the impact on small fine-tuning datasets

**Interviewer Signal**  
Tests data-centric ML thinking. Engineers who think about data quality are more effective than those who only tune models.

**Real-World Insight**  
LLM fine-tuning datasets are often created by weaker models or crowd workers. Teams that invest in data curation (deduplication, quality filtering, label verification) consistently outperform teams that scale data volume without quality control.

---

### Q-FND-B01-018: Your model produces different results on CPU vs GPU for the same input. Why, and is this a bug?

**Topic Family:** Foundations  
**Subtopic:** Numerical Precision / Reproducibility  
**Level:** Debugging  
**Difficulty:** 3  
**Experience Bands:** 2–5, 5–8  
**Role Families:** software-foundations-to-ai-engineer, ml-data-engineer, deep-learning-cv-engineer, research-applied-research  
**Interview Round:** Debugging  
**Prerequisites:** Floating point arithmetic, mixed precision  
**Tags:** `reproducibility`, `numerical-precision`, `cpu-vs-gpu`, `floating-point`, `determinism`  
**Why This Matters:** Numerical differences between devices cause test flakiness, evaluation inconsistency, and hard-to-debug production issues.

**Question**  
Your model gives slightly different outputs on CPU vs GPU for the same input. Is this a bug? Why does this happen, and how do you handle it in production?

**Expected Answer (Short)**  
Not always a bug. GPU computations use different instruction ordering (fused operations, different accumulation order) which produces different floating-point rounding. FP16/BF16 reduce precision further. Small differences (1e-6) are expected. Large differences indicate a real issue (wrong device placement, precision mismatch, non-deterministic operations).

**Deep Answer**  
- **Floating-point non-associativity**: (a + b) + c ≠ a + (b + c) in floating-point math. GPU parallelism changes the reduction order, producing different rounding
- **Tensor cores**: use TF32 or FP16 internally even for FP32 operations (on A100+). Slightly different results than CPU FP32.
- **cuBLAS non-determinism**: by default, cuBLAS chooses algorithms that are fast but non-deterministic. `torch.use_deterministic_algorithms(True)` forces determinism at some performance cost.
- **Acceptable differences**: ≤1e-5 relative difference in FP32. ≤1e-2 in FP16/BF16. If larger, investigate.
- **Real bugs to check**: weights not transferred correctly (`.to(device)` missed), input tensor on wrong device (silent casting), batchnorm running stats computed differently
- **Production implications**:
  - Don't use exact equality for model output tests
  - Use `torch.allclose(atol=, rtol=)` with appropriate tolerances
  - Document expected precision per device/precision combination
  - If strict reproducibility is required (financial, medical), pin CUDA algorithms and accept performance cost

**Follow-up Questions**  
- How does `torch.use_deterministic_algorithms(True)` affect performance?
- What about differences across GPU architectures (A100 vs H100)?
- How does this affect model evaluation and A/B testing?

**Weak Answer Signals / Red Flags**  
- Says "it's definitely a bug, results should be identical"
- Doesn't understand floating-point non-associativity
- Cannot suggest practical tolerance thresholds
- Doesn't know about deterministic mode

**Interviewer Signal**  
Tests understanding of floating-point arithmetic and hardware realities. Essential for debugging and building reliable evaluation pipelines.

**Real-World Insight**  
Model evaluation pipelines that use exact output comparison break every time the hardware, CUDA version, or PyTorch version changes. Teams learn (often the hard way) to use approximate comparison with documented tolerances.

---

### Q-FND-B01-019: Explain the vanishing gradient problem, why it matters for deep networks, and how modern architectures address it.

**Topic Family:** Foundations  
**Subtopic:** Optimization / Training  
**Level:** Concept  
**Difficulty:** 2  
**Experience Bands:** 0–2, 2–5  
**Role Families:** software-foundations-to-ai-engineer, ml-data-engineer, deep-learning-cv-engineer, research-applied-research  
**Interview Round:** Phone screen, Technical deep dive  
**Prerequisites:** Backpropagation, chain rule  
**Tags:** `vanishing-gradient`, `residual-connections`, `normalization`, `deep-networks`  
**Why This Matters:** Understanding gradient flow is essential for diagnosing training failures and understanding why modern architectures (ResNet, Transformer) work.

**Question**  
What is the vanishing gradient problem, why does it occur in deep networks, and what architectural techniques solve it?

**Expected Answer (Short)**  
When backpropagating through many layers, gradients get multiplied at each step. If the multipliers are consistently less than 1 (e.g., sigmoid derivative), gradients shrink exponentially toward zero — early layers stop learning. Solutions: residual connections (ResNet), better activations (ReLU, GELU), normalization (LayerNorm, BatchNorm), and careful initialization.

**Deep Answer**  
- Chain rule: gradient = product of local gradients through each layer. If each is < 1, the product → 0 exponentially
- **Sigmoid/tanh**: derivatives are bounded (0, 0.25] for sigmoid. In deep networks, 0.25^50 is effectively zero
- **Solutions**:
  - **ReLU**: gradient is 1 for positive inputs — no vanishing. But "dying ReLU" problem (gradient = 0 for negative inputs)
  - **GELU, SiLU**: smooth approximations of ReLU used in modern transformers. Non-zero gradient everywhere.
  - **Residual connections**: output = f(x) + x. Gradient flows directly through the skip connection (gradient of identity = 1). This is why ResNet and Transformers can be very deep.
  - **Normalization**: BatchNorm/LayerNorm stabilize activation magnitudes, preventing gradient explosion/vanishing
  - **Initialization**: Xavier/He initialization sets initial weights to maintain gradient magnitude across layers
- In Transformers: the combination of residual connections (around every attention and FFN block) + LayerNorm is what enables models with 100+ layers
- **Exploding gradients**: the opposite problem — gradients grow exponentially. Solved with gradient clipping (`torch.nn.utils.clip_grad_norm_`)
- **Practical implication**: if your deep network stops learning, check gradient norms through layers. Vanishing = early layers have near-zero gradients. Exploding = very large gradient norms.

**Follow-up Questions**  
- Why are residual connections specifically effective? Can you explain the gradient mathematics?
- How does LayerNorm help with gradient flow in transformers?
- What is gradient clipping and when do you use it?

**Weak Answer Signals / Red Flags**  
- Cannot explain WHY gradients vanish (just memorized "gradients go to zero")
- Doesn't connect to chain rule
- Doesn't mention residual connections as a solution
- Confuses vanishing with exploding gradients

**Interviewer Signal**  
Tests fundamental understanding of why modern architectures work. Engineers who can trace gradient flow can debug training failures that others cannot.

**Real-World Insight**  
When fine-tuning a deep model and lower layers don't seem to update, the first check is gradient norms per layer. If early layers have near-zero gradients, consider learning rate warm-up, layer-wise learning rates, or verifying that normalization layers are configured correctly.

---

### Q-FND-B01-020: How do you design an experiment to fairly compare two ML approaches for the same problem?

**Topic Family:** Foundations  
**Subtopic:** Experimentation  
**Level:** Applied  
**Difficulty:** 3  
**Experience Bands:** 2–5, 5–8  
**Role Families:** ml-data-engineer, research-applied-research, senior-architect-ai-systems-lead  
**Interview Round:** Technical deep dive, Research discussion  
**Prerequisites:** Evaluation fundamentals, statistics  
**Tags:** `experimentation`, `ablation`, `comparison`, `reproducibility`, `statistical-significance`  
**Why This Matters:** Unfair comparisons lead to wrong decisions. Rigorous experimentation separates effective ML teams from those that chase noise.

**Question**  
You need to compare two ML approaches (e.g., classical ML vs fine-tuned LLM) for the same task. How do you design a fair experiment?

**Expected Answer (Short)**  
Use the same train/val/test split for both. Measure the same metrics. Control for compute budget. Run multiple seeds and report confidence intervals. Include a reasonable baseline. Ensure preprocessing is consistent. Account for differences in training cost and inference latency, not just accuracy.

**Deep Answer**  
- **Same data**: identical train/val/test split. Any preprocessing must be applied consistently
- **Same metrics**: both approaches evaluated on the exact same metrics, same evaluation script
- **Compute fairness**: compare at the same compute budget OR report performance AND cost. An LLM at 1000x the compute cost winning by 1% accuracy is not necessarily better
- **Multiple seeds**: run each approach 3–5 times with different random seeds. Report mean ± standard deviation. A 0.5% improvement within noise is not significant.
- **Statistical testing**: paired t-test or bootstrap confidence intervals to determine if the difference is statistically significant
- **Baseline**: always include a simple baseline (majority class, heuristic, simple logistic regression). Both approaches should beat it comfortably.
- **Hyperparameter tuning budget**: both approaches should get equivalent tuning effort. Exhaustively tuning one while using defaults for the other invalidates the comparison.
- **Ablation design**: if comparing two complex systems, identify which component causes the difference. Don't just compare final systems.
- **Report more than accuracy**: latency, memory, cost, data requirements, development time, maintenance burden
- **Negative results**: if the complex approach doesn't beat the simple one, report that. This is valuable information.

**Follow-up Questions**  
- How do you handle the case where one approach requires significantly more data?
- When is compute-matched comparison the right framing vs cost-matched?
- How do you present results to stakeholders who only care about accuracy?

**Weak Answer Signals / Red Flags**  
- Single run, single metric, no confidence intervals
- Doesn't control for compute or tuning budget
- No baseline comparison
- Doesn't mention statistical significance

**Interviewer Signal**  
Tests experimental rigor. Research and ML teams that design poor experiments waste months on wrong conclusions.

**Real-World Insight**  
Many companies switched from classical ML to LLMs based on unfair comparisons — the LLM was given more tuning effort, better prompts, and cherry-picked examples. Rigorous comparison often reveals the gap is smaller than expected, and the operational cost of the LLM may not be justified.

---

### Q-FND-B01-021: What is the difference between online learning and batch learning, and when does each apply in production?

**Topic Family:** Foundations  
**Subtopic:** Learning Paradigms  
**Level:** Applied  
**Difficulty:** 3  
**Experience Bands:** 2–5, 5–8  
**Role Families:** ml-data-engineer, mlops-llmops-platform-engineer, senior-architect-ai-systems-lead  
**Interview Round:** System design, Technical deep dive  
**Prerequisites:** Training fundamentals, production systems  
**Tags:** `online-learning`, `batch-learning`, `continual-learning`, `production`  
**Why This Matters:** Choosing between online and batch learning affects system architecture, data pipeline design, model stability, and operational complexity.

**Question**  
When should you use online learning (updating the model with each new example) vs batch learning (periodic retraining on full datasets) in production? What are the engineering trade-offs?

**Expected Answer (Short)**  
Batch learning is simpler, safer, and the default choice — retrain periodically on accumulated data. Online learning is necessary when the environment changes rapidly (click-stream, financial markets, real-time personalization) and you cannot afford to wait for batch retraining. Online learning adds significant operational complexity: model instability, catastrophic forgetting, evaluation challenges.

**Deep Answer**  
- **Batch learning (default)**:
  - Retrain on full dataset periodically (daily, weekly, monthly)
  - Full evaluation before deployment. A/B testing. Rollback is simple.
  - Suitable for most ML applications where distribution shift is gradual
- **Online learning (when needed)**:
  - Model updates with each new example or micro-batch
  - Necessary for: real-time ad bidding, fraud detection in evolving patterns, recommendation with cold-start items
  - Challenges: model can diverge, hard to evaluate continuously, no clear rollback point
  - Need safety mechanisms: shadow training (compare online vs batch model), periodic checkpointing, drift detection
- **Engineering trade-offs**:
  - Online: requires streaming infrastructure, continuous validation, more operational burden
  - Batch: requires data warehouse, scheduled retraining, simpler evaluation
  - Hybrid: online model for real-time, with periodic batch model as baseline/fallback
- **LLM context**: online learning is rare for LLMs — fine-tuning is batch. But RAG systems update their index "online" (new documents added continuously), which is a form of online knowledge update without model retraining.

**Follow-up Questions**  
- How do you evaluate an online learning model if the model keeps changing?
- What is catastrophic forgetting in the context of online learning?
- How does continual learning differ from online learning?

**Weak Answer Signals / Red Flags**  
- Treats online learning as always better ("fresher model")
- Ignores operational complexity of online learning
- Cannot give a concrete use case for either
- Conflates online learning with continual fine-tuning

**Interviewer Signal**  
Tests production system design thinking. The choice affects architecture so profoundly that getting it wrong creates months of rework.

**Real-World Insight**  
Most production ML at major companies is batch-retrained. Online learning is reserved for very specific use cases (ad serving, fraud detection) where the operational investment is justified by the value of real-time adaptation.

---

### Q-FND-B01-022: Your model training uses 27GB of GPU memory but your model has only 3B parameters in FP16 (6GB). Where is the rest of the memory?

**Topic Family:** Foundations  
**Subtopic:** Memory Analysis  
**Level:** Debugging  
**Difficulty:** 3  
**Experience Bands:** 2–5, 5–8  
**Role Families:** ml-data-engineer, deep-learning-cv-engineer, research-applied-research, mlops-llmops-platform-engineer  
**Interview Round:** Debugging  
**Prerequisites:** Training basics, optimizer mechanics  
**Tags:** `gpu-memory`, `optimizer-state`, `activations`, `memory-profiling`  
**Why This Matters:** GPU memory is the most constrained resource in ML training. Understanding where memory goes is essential for fitting larger models and debugging OOM errors.

**Question**  
Your 3B parameter model in FP16 should consume ~6GB for weights, but training uses 27GB. Account for the remaining ~21GB of GPU memory.

**Expected Answer (Short)**  
Gradients: 6GB (same size as weights in FP16). Adam optimizer states: 12GB (two FP32 copies: first and second moment estimates, each 4 bytes × 3B params). Activations: varies but typically several GB depending on batch size and sequence length. CUDA context and fragmentation: 0.5–1GB overhead.

**Deep Answer**  
- **Model weights**: 3B × 2 bytes (FP16) = 6GB
- **Gradients**: same size as weights = 6GB in FP16
- **Adam optimizer states**: Adam stores `m` (first moment) and `v` (second moment) per parameter, typically in FP32
  - 3B × 4 bytes × 2 states = 24GB... wait, that's more than 27GB total
  - With mixed precision: master weights in FP32 (12GB) + m (12GB) + v (12GB) = 36GB. This is why mixed precision training actually uses MORE total memory than FP32 in some configurations
  - **Correction for FP16 training with AMP**: FP16 forward/backward, FP32 master weights + optimizer states → weights (6 FP16) + gradients (6 FP16) + master weights (12 FP32) + m (12 FP32) + v (12 FP32) = ~48GB... 
  - Most frameworks optimize by sharing some storage, using FP16 optimizer, or gradient checkpointing
- **Activations**: stored during forward pass for backward pass. Size depends on batch size × sequence length × hidden dimensions × number of layers. Can be several GB.
- **Gradient checkpointing**: trades compute for memory by recomputing activations during backward instead of storing them. Reduces activation memory by ~60–80% at ~30% compute overhead.
- **KV cache** (if applicable): attention past states stored in memory
- **CUDA context**: ~500MB–1GB for CUDA initialization, kernel JIT cache
- **Memory fragmentation**: allocated but unused memory due to CUDA's block allocator

**Follow-up Questions**  
- How does gradient checkpointing reduce memory?
- Why does Adam use so much more memory than SGD?
- How would you choose between reducing batch size vs enabling gradient checkpointing?
- What does `PYTORCH_CUDA_ALLOC_CONF` control?

**Weak Answer Signals / Red Flags**  
- Thinks GPU memory is only weights
- Doesn't know optimizer states consume memory
- Cannot explain gradient checkpointing
- Doesn't mention activations

**Interviewer Signal**  
Essential for any engineer training models or managing GPU resources. Candidates who can do memory accounting can make informed decisions about model size, batch size, and optimization strategy.

**Real-World Insight**  
QLoRA's key insight is reducing optimizer state memory by keeping the base model quantized (INT4) and only training small LoRA adapters — optimizer states for 0.1% of parameters instead of 100%. This is why QLoRA enables fine-tuning 65B+ models on a single GPU.

---

### Q-FND-B01-023: What is Bayesian reasoning and why does it matter for ML system design?

**Topic Family:** Foundations  
**Subtopic:** Probability / Statistics  
**Level:** Concept  
**Difficulty:** 2  
**Experience Bands:** 0–2, 2–5  
**Role Families:** software-foundations-to-ai-engineer, ml-data-engineer, research-applied-research  
**Interview Round:** Phone screen, Technical deep dive  
**Prerequisites:** Basic probability  
**Tags:** `bayesian`, `prior`, `posterior`, `probability`, `reasoning`  
**Why This Matters:** Bayesian thinking underlies uncertainty estimation, model calibration, A/B testing design, and principled decision-making with limited data.

**Question**  
Explain Bayesian reasoning in the context of ML. Give an example of where Bayesian thinking improves a practical ML decision.

**Expected Answer (Short)**  
Bayesian reasoning updates beliefs based on evidence. Prior belief × likelihood of evidence = posterior belief (updated). In ML, this matters for: model calibration (are model probabilities trustworthy?), incorporating prior knowledge into models, and making decisions under uncertainty (should we deploy a model based on limited A/B test data?).

**Deep Answer**  
- **Bayes' theorem**: P(hypothesis | evidence) ∝ P(evidence | hypothesis) × P(hypothesis)
- **Prior**: what we believe before seeing data. In ML: regularization encodes priors (L2 = Gaussian prior on weights, favoring small weights)
- **Likelihood**: how well the data supports each hypothesis. In ML: training maximizes likelihood (or minimizes negative log-likelihood = cross-entropy loss)
- **Posterior**: updated belief after seeing data
- **Practical applications**:
  - **Model calibration**: a model says 90% confidence — does that mean 90% of the time it's correct? Bayesian calibration checks this.
  - **A/B testing**: with limited data, Bayesian testing gives posterior probability that model A is better than B, rather than just a p-value
  - **Cold start**: new product with few users. Use prior (similar products' performance) + limited data → posterior prediction, better than ignoring prior knowledge
  - **Uncertainty estimation**: Bayesian neural networks or MC Dropout give uncertainty estimates, useful for active learning and safety-critical applications
- **Anti-pattern**: ignoring base rates. A test with 99% accuracy and 0.1% disease prevalence still has ~50% false positive rate (base rate fallacy).

**Follow-up Questions**  
- How does L2 regularization relate to a Gaussian prior?
- When would you use a Bayesian approach vs a frequentist approach in ML?
- How does base rate neglect affect anomaly detection systems?

**Weak Answer Signals / Red Flags**  
- Memorized the formula but cannot give a concrete ML application
- Cannot explain base rate effects
- Confuses prior and likelihood
- Thinks Bayesian means "slow" without understanding trade-offs

**Interviewer Signal**  
Tests probabilistic thinking maturity. Engineers with Bayesian intuition make better uncertainty-aware decisions across all ML applications.

**Real-World Insight**  
Production anomaly detection systems that ignore base rates generate overwhelming false positives. A 99.9% accurate fraud detector in a population where 0.01% are fraudulent still floods the review queue with false alarms. Bayesian thinking helps set appropriate thresholds.

---

### Q-FND-B01-024: How do you design an ML system to satisfy regulatory compliance and what are the key technical controls?

**Topic Family:** Foundations  
**Subtopic:** Governance / Compliance  
**Level:** Architect  
**Difficulty:** 4  
**Experience Bands:** 5–8, 8–12, 12–20  
**Role Families:** senior-architect-ai-systems-lead, mlops-llmops-platform-engineer, ml-data-engineer  
**Interview Round:** System design, Architecture strategy  
**Prerequisites:** Production ML systems, evaluation, versioning  
**Tags:** `governance`, `compliance`, `audit`, `explainability`, `production`  
**Why This Matters:** AI regulations (EU AI Act, industry-specific requirements) increasingly mandate specific technical controls. Engineers who can architect compliance from the start avoid expensive retrofits.

**Question**  
You are designing an ML system for a regulated industry (finance, healthcare, or insurance). What technical controls must be built into the system from day one, and how do they affect architecture decisions?

**Expected Answer (Short)**  
Key controls: model versioning with full lineage (data → model → prediction), audit logging of all predictions and decisions, explainability mechanisms (feature importance, attention visualization), bias monitoring, data retention and privacy controls, human review workflows, and rollback capability. Architecture must support reproducibility, traceability, and oversight from day one.

**Deep Answer**  
- **Model lineage**: track which data, code, and hyperparameters produced which model version. Reproducible from random seed.
- **Prediction audit log**: every prediction stored with input, output, model version, confidence, timestamp. Must support "explain this past decision" queries.
- **Explainability**: SHAP values, feature importance, attention heatmaps — appropriate to the model type. For LLMs: chain-of-thought reasoning, citation of sources.
- **Bias monitoring**: demographic parity, equalized odds across protected groups. Dashboard with automated alerts.
- **Data governance**: consent tracking, data retention policies, right to deletion (GDPR), data provenance
- **Human-in-the-loop**: mandatory for high-stakes decisions (loan denial, medical diagnosis). System must support routing to human reviewers.
- **Rollback**: ability to revert to any previous model version within minutes. Requires model registry and blue-green or canary deployment.
- **Testing**: beyond accuracy — test for fairness, safety, robustness, and edge cases before production
- **Architecture implications**: adds storage (audit logs), latency (explainability computation), and operational complexity. Must be budgeted from day one, not bolted on later.
- **Documentation**: model cards, data sheets, risk assessments — required by EU AI Act for high-risk applications

**Follow-up Questions**  
- How do you implement "right to be forgotten" for a model that was trained on the deleted data?
- How does explainability change for an LLM vs a gradient boosted tree?
- What is the cost of compliance, and how do you argue for it to stakeholders?

**Weak Answer Signals / Red Flags**  
- Treats compliance as a checkbox exercise
- No concrete technical controls
- Doesn't mention audit logging or explainability
- Ignores the cost and architecture impact

**Interviewer Signal**  
Tests architect-level thinking. Many AI systems fail regulatory review because compliance was an afterthought. Engineers who think about this from day one design better systems.

**Real-World Insight**  
The EU AI Act requires high-risk AI systems to be explainable, auditable, and monitorable. Companies that build these controls into the architecture from the beginning spend 3–5x less than those who retrofit.

---

### Q-FND-B01-025: How do you decide the right level of model complexity for a given problem?

**Topic Family:** Foundations  
**Subtopic:** Model Selection / Architecture  
**Level:** Architect  
**Difficulty:** 4  
**Experience Bands:** 5–8, 8–12  
**Role Families:** ml-data-engineer, senior-architect-ai-systems-lead, research-applied-research  
**Interview Round:** System design, Architecture strategy  
**Prerequisites:** Model evaluation, production systems, cost reasoning  
**Tags:** `model-selection`, `complexity`, `production`, `cost-benefit`, `architecture`  
**Why This Matters:** Over-engineering is as common as under-engineering. The right model complexity depends on the problem, the data, the team, the budget, and the operational environment — not just accuracy.

**Question**  
A team wants to use a 70B parameter LLM for a text classification task. The current logistic regression baseline achieves 89% accuracy. How do you reason about whether the LLM is justified?

**Expected Answer (Short)**  
Start by quantifying the gap: does the LLM get significantly better accuracy? What is the cost difference? (LLM inference may be 100–1000x more expensive.) Is the accuracy improvement worth the latency increase, operational complexity, and cost? Consider: is the remaining 11% error due to model capacity or data quality? Often, better features or data labeling closes the gap more cheaply than a larger model.

**Deep Answer**  
- **Accuracy gap**: test the LLM on the same data. If 89% → 91%, the 2% improvement needs to justify massive cost increase
- **Error analysis**: examine the 11% errors from logistic regression. Are they data quality issues (wrong labels)? Feature gaps? Or genuinely complex cases that need more capacity?
- **Cost analysis**: logistic regression: microseconds per inference, runs on CPU. 70B LLM: seconds per inference, requires GPU cluster. Cost difference can be 1000x+.
- **Operational complexity**: LLM requires serving infrastructure (vLLM, GPU management, model updates). Logistic regression is a few lines of code.
- **Diminishing returns**: the 89% → 91% improvement may not matter if the business threshold is 85%. Or it may be critical if the business needs 95%.
- **Alternative approaches before LLM**:
  1. Better features
  2. Better training data (clean labels, more data)
  3. Ensemble of simple models
  4. Fine-tuned small model (BERT-class, 110M params)
  5. Distilled LLM knowledge into a smaller model
- **When the LLM IS justified**: the task requires reasoning, context understanding, or generalization that simple models cannot provide. Or the accuracy gap is large enough to justify the cost.
- **Decision framework**: accuracy improvement × business value per improvement ≥ incremental cost of LLM serving?

**Follow-up Questions**  
- When is a fine-tuned BERT-class model the right middle ground?
- How would you use distillation to get LLM-quality results at lower cost?
- What if the LLM's advantage is in edge cases that the product team cares most about?

**Weak Answer Signals / Red Flags**  
- "Always use the biggest model possible"
- Doesn't consider cost or operational complexity
- Cannot articulate a decision framework
- Jumps to the LLM without testing simpler alternatives

**Interviewer Signal**  
Tests engineering judgment and cost awareness. The best engineers choose the simplest solution that meets the requirements, not the most impressive one.

**Real-World Insight**  
Many production classification systems at major companies still use logistic regression or gradient boosted trees because the accuracy difference vs LLMs doesn't justify the cost. LLMs are chosen when the task requires language understanding, not just pattern matching.
