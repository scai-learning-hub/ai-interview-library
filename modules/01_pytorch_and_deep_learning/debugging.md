# Module 01 — PyTorch & Deep Learning: Debugging Level

---

## Q-01-D-001: Your model's training loss becomes NaN after a few hundred steps. How do you diagnose and fix it?

**Module:** PyTorch & Deep Learning
**Submodule:** Training Dynamics
**Level:** Debugging
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [pytorch, debugging, nan, training, gradient, numerical-stability, exploding-gradients]
**Prerequisites:** Q-01-C-002, Q-01-A-004, Q-01-A-005
**Estimated Interview Round:** Debugging, Technical
**Why This Question Matters:** NaN loss is one of the most common and frustrating training failures. A systematic debugging approach separates experienced practitioners from those who randomly toggle settings.

---

**Question**

You're training a transformer model. After ~300 steps, the loss suddenly jumps to NaN and never recovers. Training was progressing normally until that point. Walk through your diagnosis step by step.

---

**Expected Answer (Short)**

Step 1: Check for exploding gradients (log gradient norms — look for a spike before NaN). Step 2: Check the learning rate (too high, especially without warmup). Step 3: Check input data (NaN or inf values in a batch). Step 4: Check loss function (log(0) or division by zero). Step 5: Check mixed precision (fp16 overflow). Fixes in priority order: add gradient clipping, add LR warmup, validate input data, switch from fp16 to bf16.

---

**Deep Answer**

- **Diagnostic step 1 — gradient norms:**
  ```python
  total_norm = torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=float('inf'))
  print(f"Step {step}: grad_norm={total_norm:.4f}")
  ```
  If grad_norm spikes (e.g., 10 → 50 → 500 → inf → NaN), the cause is exploding gradients. Fix: gradient clipping with `max_norm=1.0`.

- **Diagnostic step 2 — learning rate:**
  - No warmup + high initial LR → large parameter updates → activations blow up within a few hundred steps
  - Fix: add linear warmup for 5-10% of training steps

- **Diagnostic step 3 — data inspection:**
  ```python
  for batch in dataloader:
      if torch.isnan(batch['input']).any() or torch.isinf(batch['input']).any():
          print(f"Bad batch found: {batch['index']}")
  ```
  A single corrupt data point can produce NaN loss. Common sources: missing values encoded as NaN, images with corrupted pixels, extreme outlier feature values.

- **Diagnostic step 4 — loss function numerics:**
  - `log(0)` → -inf → NaN when propagated. Add epsilon: `log(x + 1e-8)`.
  - Division by zero in custom losses.
  - `F.cross_entropy` is already numerically stable (log-softmax fused). But raw `log(softmax(x))` is not — use `F.log_softmax`.

- **Diagnostic step 5 — mixed precision:**
  - fp16 max value = 65504. Activations or logits exceeding this overflow to inf → NaN.
  - Loss scaling issues: if GradScaler scale factor goes to inf due to repeated overflows.
  - Fix: switch to bf16 (range = fp32), or reduce loss scale initial value.

- **Diagnostic step 6 — forward pass hooks:**
  ```python
  def check_nan_hook(module, input, output):
      if torch.isnan(output).any():
          print(f"NaN detected in {module.__class__.__name__}")
  for name, module in model.named_modules():
      module.register_forward_hook(check_nan_hook)
  ```
  This pinpoints exactly which layer produces NaN first.

- **Nuclear option — binary search:**
  If the above doesn't identify the cause: save checkpoint at step 250, replay the training. Bisect between step 250 and 300 to find the exact step/batch that triggers NaN. Then inspect that specific batch.

---

**Follow-up Questions**

1. The NaN happens only on certain batches, not at a fixed step count. What does this suggest?
2. You add gradient clipping and the NaN is gone, but training loss plateaus. Why?
3. How would you add automated NaN detection to halt training early instead of wasting compute?

---

**Common Weak Answers / Red Flags**

- "Reduce the learning rate" as first and only answer — doesn't diagnose the root cause
- No mention of gradient norm logging — flying blind
- Doesn't consider data quality as a possible cause
- "It just happens sometimes" — unacceptable; NaN always has a cause

---

**Interviewer Evaluation Signal**

Tests systematic debugging ability. The order of diagnosis matters — gradient norms → LR → data → numerics → mixed precision is the correct triage path. Candidates who can also instrument the model (hooks, logging) demonstrate real debugging experience.

---

**Real-World Insight**

During Llama 2 training (Meta), loss spikes were observed due to rare data batches containing unusual token sequences. Their solution: detect gradient norm spikes, skip the batch, and log it for investigation. This "spike-skip" technique is now standard in large-scale LLM pretraining. The key lesson: not every NaN requires a hyperparameter fix — sometimes the data is the problem.

---

## Q-01-D-002: Your model trains fine on one GPU but produces different (worse) results on multi-GPU DDP training. What's going wrong?

**Module:** PyTorch & Deep Learning
**Submodule:** Distributed Training
**Level:** Debugging
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** ML / Data Engineer, DevOps / SRE → AIOps
**Tags:** [pytorch, debugging, ddp, distributed-training, multi-gpu, reproducibility]
**Prerequisites:** Q-01-A-005, Q-01-S-002
**Estimated Interview Round:** Debugging, Deep Dive
**Why This Question Matters:** DDP introduces subtle bugs that don't exist in single-GPU training. Debugging distributed training requires understanding gradient synchronization, data sampling, and batch norm behavior across processes.

---

**Question**

You train a model on a single GPU and achieve 91% accuracy. When you switch to 4-GPU DDP training with the same hyperparameters, accuracy drops to 85%. No errors are thrown. Diagnose the issue.

---

**Expected Answer (Short)**

Top causes: (1) Effective batch size changed (4x larger → needs LR adjustment via linear scaling rule). (2) DataLoader sampler issue — not using `DistributedSampler`, so all GPUs see the same data (4x redundant updates). (3) BatchNorm not synchronized — each GPU computes batch stats on its local micro-batch. (4) Random seeds are the same across processes — identical augmentation/dropout. (5) Gradient accumulation mismatch — loss not divided by world size.

---

**Deep Answer**

- **Cause 1: Effective batch size (most common):**
  - Single GPU: batch_size=32 → 32 samples per step
  - 4x DDP: each GPU processes 32 samples → effective batch = 128
  - Larger batches need larger LR. Linear scaling rule: `lr_ddp = lr_single × world_size`
  - Or reduce per-GPU batch: `batch_size = 32 // world_size` = 8 per GPU

- **Cause 2: DistributedSampler missing:**
  ```python
  # Wrong — all GPUs process full dataset (4x redundancy)
  loader = DataLoader(dataset, batch_size=32, shuffle=True)

  # Correct — each GPU gets a unique shard
  sampler = DistributedSampler(dataset, num_replicas=world_size, rank=rank)
  loader = DataLoader(dataset, batch_size=32, sampler=sampler)
  ```
  Without DistributedSampler, all GPUs train on identical batches. The gradient all-reduce averages identical gradients — equivalent to single-GPU with 4x redundant compute.

- **Cause 3: BatchNorm not synced:**
  - Default BN computes stats per GPU's micro-batch (8 samples if batch=32/4)
  - Small micro-batch → noisy batch stats → worse training
  - Fix: `model = nn.SyncBatchNorm.convert_sync_batchnorm(model)` to sync stats across GPUs
  - Or use LayerNorm (not affected by batch size)

- **Cause 4: Same random state across processes:**
  - If seeds are identical, dropout masks and augmentations are identical across GPUs
  - Fix: seed = base_seed + rank. Each GPU gets a different seed.
  - `DistributedSampler` already handles data ordering, but augmentations need separate seeds

- **Cause 5: Loss scaling:**
  - If loss is already averaged per GPU, DDP's `all_reduce(mean)` averages again (divides by world_size twice)
  - Fix: use `reduction='sum'` and divide by `total_batch_size`, or verify `reduction='mean'` is applied correctly

- **Debugging checklist:**
  ```
  [ ] DistributedSampler used for train and eval
  [ ] Effective batch size accounted for in LR
  [ ] Seeds differ across ranks (for augmentation/dropout)
  [ ] BatchNorm sync'd (SyncBatchNorm) or replaced with LayerNorm
  [ ] Loss reduction is correct (mean vs sum)
  [ ] sampler.set_epoch(epoch) called each epoch (ensures shuffling differs across epochs)
  ```

---

**Follow-up Questions**

1. Training accuracy matches single-GPU, but evaluation accuracy is lower in DDP. What's happening?
2. You see that GPU 0 trains faster than GPU 3. What's causing the imbalance?
3. How does FSDP differ from DDP in terms of these gotchas?

---

**Common Weak Answers / Red Flags**

- "DDP should just work" — doesn't understand the configuration requirements
- Doesn't mention DistributedSampler
- Doesn't know about effective batch size and LR scaling

---

**Interviewer Evaluation Signal**

DDP bugs are extremely common in production teams scaling training. The ability to enumerate the causes systematically (batch size, sampler, BN, seeds, loss) shows experience running distributed training — not just knowing it exists.

---

**Real-World Insight**

A team scaled their single-GPU training (92% accuracy, batch=64) to 8 GPUs and got 87% accuracy. After 2 days of debugging: DistributedSampler was present BUT they forgot `sampler.set_epoch(epoch)`. Without this call, the same data order is used every epoch across all ranks. Each GPU saw the same batches in the same order every epoch — effectively training on 1/8th of the permutations. One line added: `sampler.set_epoch(epoch)` in the training loop. Accuracy: 92.1%.

---

## Q-01-D-003: Your model has been deployed for 3 months and prediction quality is gradually declining. No code changes were made. What do you investigate?

**Module:** PyTorch & Deep Learning
**Submodule:** Production Reliability
**Level:** Debugging
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, ML / Data Engineer, DevOps / SRE → AIOps
**Tags:** [pytorch, debugging, drift, production, model-degradation, monitoring, data-quality]
**Prerequisites:** Q-01-S-003, Q-01-S-004
**Estimated Interview Round:** Debugging, System Design
**Why This Question Matters:** Silent model degradation is the most dangerous production ML failure. No error is thrown, no alert fires — the model just quietly gets worse. Knowing what to look for prevents costly quality erosion.

---

**Question**

Your production image classification model has been serving predictions for 3 months. Accuracy on live labeled samples has dropped from 94% to 88%. No code or model changes were deployed. Walk through your investigation.

---

**Expected Answer (Short)**

Primary suspect: data drift. The input data distribution has shifted from what the model was trained on. Investigation: (1) Compare recent input feature distributions to training data distributions (covariate shift). (2) Check for new classes or patterns the model has never seen. (3) Check data pipeline integrity (upstream changes, encoding issues). (4) Check infrastructure (model loaded correctly, eval mode set, resource contention). (5) Check if the decline correlates with any external event (seasonality, upstream system change).

---

**Deep Answer**

- **Investigation tier 1 — data distribution (highest probability):**
  - Pull recent inputs vs training data. Compare pixel intensity distributions, resolution distributions, class distributions.
  - Frequency analysis: are certain classes suddenly more common? (class prior shift)
  - New data patterns: are images from a new camera, device, or lighting condition? (covariate shift)
  - PSI (Population Stability Index) or KL divergence between training and recent feature distributions
  - If drift confirmed → retrain on recent data or augment training set with new patterns

- **Investigation tier 2 — label drift / concept drift:**
  - The relationship between input and label has changed (concept drift)
  - Example: product images that were labeled "acceptable" 3 months ago now have different quality standards
  - Check if human labelers changed their criteria
  - Check if the downstream task requirements evolved

- **Investigation tier 3 — data pipeline integrity:**
  - Upstream API changed image encoding (JPEG quality, color space, resolution)
  - Preprocessing pipeline has an unnoticed dependency that was updated
  - Feature store serving different feature versions than training used (training-serving skew)
  - Normalization statistics (mean/std) no longer match actual data distribution

- **Investigation tier 4 — infrastructure:**
  - Model file corruption (rare but possible — verify checksum)
  - Model loaded in training mode (dropout active) — check `model.training`
  - GPU memory pressure causing CUDA errors that silently degrade output
  - Library version change (PyTorch update with different default behaviors)

- **Investigation tier 5 — evaluation methodology:**
  - Is the labeling quality of the live evaluation data consistent?
  - Has the evaluation sample composition changed (harder cases now included)?
  - Survivorship bias: easy cases are now filtered upstream, leaving harder ones for the model

- **Mitigation:**
  - Short-term: fallback to rule-based system or ensemble with heuristics
  - Medium-term: retrain on recent labeled data
  - Long-term: automated drift detection pipeline → alerting → retraining trigger

---

**Follow-up Questions**

1. You confirm data drift is the cause. But you only have 200 labeled examples of the new distribution. How do you retrain?
2. How would you design a monitoring system to catch this decline within 1 week instead of 3 months?
3. The accuracy dropped for only one class. What's the most likely cause?

---

**Common Weak Answers / Red Flags**

- "Just retrain the model" without diagnosing the cause — the same problem will recur
- Doesn't investigate data pipeline integrity
- Doesn't consider the distinction between covariate shift and concept drift
- No mention of monitoring or detection systems

---

**Interviewer Evaluation Signal**

Tests production ML maturity. The tiered investigation approach (data → pipeline → infrastructure → evaluation) shows systematic thinking. Candidates who immediately jump to "retrain" without understanding the cause often create models that degrade again in 3 months.

---

**Real-World Insight**

A fraud detection model at a fintech company silently degraded over 4 months. Investigation revealed: fraudsters had changed tactics (concept drift), but the data pipeline had ALSO introduced a bug that was converting timestamps to the wrong timezone. Two independent causes contributed ~3% accuracy loss each. The lesson: always check both the data distribution AND the pipeline. Multiple concurrent causes are common.

---

## Q-01-D-004: Your model gives extremely confident wrong predictions. What are the possible causes and how do you fix it?

**Module:** PyTorch & Deep Learning
**Submodule:** Training Dynamics
**Level:** Debugging
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [pytorch, debugging, calibration, overconfidence, softmax, production]
**Prerequisites:** Q-01-C-004, Q-01-A-003
**Estimated Interview Round:** Debugging, Technical
**Why This Question Matters:** Overconfident wrong predictions are worse than uncertain wrong predictions. They mislead downstream systems and human users. Calibration is a critical production concern.

---

**Question**

Your classification model outputs 98% confidence for predictions that are frequently incorrect. The overall accuracy is 85%, but the model rarely expresses uncertainty. What causes this and how do you address it?

---

**Expected Answer (Short)**

The model is poorly calibrated — its confidence scores don't match actual correctness probabilities. Causes: (1) Cross-entropy loss incentivizes pushing logits to extremes. (2) Overfitting (training accuracy 99%, validation 85% — model memorizes training set patterns). (3) No regularization or calibration technique. Fixes: temperature scaling (simplest, post-hoc), label smoothing (during training), MC Dropout (uncertainty estimation), Platt scaling.

---

**Deep Answer**

- **Root cause — why neural networks are overconfident:**
  - Cross-entropy loss minimizes when predicted probability → 1.0 for correct class. There's no penalty for EXCESSIVE confidence — only for wrong confidence.
  - Deep networks with high capacity can push logits to very large values (|logit| > 10). Softmax of extreme logits → nearly 0 or nearly 1 probabilities.
  - ReLU and its variants are unbounded — activations can grow large.
  - More parameters + more training = more overconfidence (even on correctly classified examples)

- **Fix 1 — Temperature scaling (post-hoc, most practical):**
  ```python
  # Learn a single temperature parameter on validation set
  temperature = nn.Parameter(torch.ones(1) * 1.5)
  calibrated_probs = F.softmax(logits / temperature, dim=-1)
  ```
  - Fit temperature on validation set by minimizing NLL
  - Doesn't change predictions (arg max is unchanged), only confidence levels
  - Simple, effective, one hyperparameter

- **Fix 2 — Label smoothing (during training):**
  ```python
  loss = F.cross_entropy(logits, targets, label_smoothing=0.1)
  ```
  - Target changes from [0, 1, 0] → [0.033, 0.9, 0.033] (for 3 classes, ε=0.1)
  - Prevents logits from growing to extreme values
  - Also acts as regularization (prevents overfit)
  - Standard in transformer training (typically ε=0.1)

- **Fix 3 — MC Dropout (uncertainty estimation):**
  ```python
  model.train()  # keep dropout active at inference
  predictions = [model(x) for _ in range(30)]
  mean_pred = torch.stack(predictions).mean(0)
  uncertainty = torch.stack(predictions).std(0)
  ```
  - Run inference multiple times with dropout active
  - Variance across runs estimates model uncertainty
  - Expensive (N forward passes) but gives genuine uncertainty

- **Fix 4 — Mixup / augmentation regularization:** prevents the model from memorizing sharp decision boundaries

- **Measuring calibration:** Expected Calibration Error (ECE). Bin predictions by confidence, compare average confidence vs actual accuracy per bin. A perfectly calibrated model: 90% confidence bin has 90% accuracy.

---

**Follow-up Questions**

1. Your model is overconfident on out-of-distribution inputs (images of objects not in any class). How do you detect this?
2. Temperature scaling works on the validation set but not on production data. Why?
3. When is an overconfident model acceptable? When is it dangerous?

---

**Common Weak Answers / Red Flags**

- "Accuracy is 85% so the model is fine" — ignores calibration entirely
- Cannot distinguish between accuracy and calibration
- Doesn't know temperature scaling — the simplest and most effective fix
- "Just use argmax; confidence scores don't matter" — dangerous in production systems that use confidence for routing or thresholding

---

**Interviewer Evaluation Signal**

Tests understanding of model behavior beyond accuracy. Calibration is critical in production — confidence scores are used for routing decisions, human-in-the-loop triggers, and cascading systems. Candidates who understand calibration make safer production systems.

---

**Real-World Insight**

Autonomous driving systems MUST use calibrated models — a 98% confident "no pedestrian" that is actually 70% correct is life-threatening. Medical AI systems use confidence thresholds to route to human review. In LLM systems, response confidence is used to decide whether to show the answer directly or add a disclaimer. Temperature scaling is now a standard post-training step in any production classification pipeline.

---

## Q-01-D-005: Training loss decreases but validation loss stays flat from the very first epoch. What's wrong?

**Module:** PyTorch & Deep Learning
**Submodule:** Training Dynamics
**Level:** Debugging
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer, Fresher / Beginner
**Tags:** [pytorch, debugging, training, validation, data-leak, overfitting, data-pipeline]
**Prerequisites:** Q-01-A-001, Q-01-A-003, Q-01-A-008
**Estimated Interview Round:** Debugging, Technical
**Why This Question Matters:** When training and validation curves diverge from the start, the problem is almost never the model — it's the data pipeline or evaluation setup. This is a common trap that wastes days of model architecture experimentation.

---

**Question**

You start training a new model. Training loss decreases normally, but validation loss remains flat (or even slightly increases) from epoch 1. The model clearly isn't learning anything useful for the validation set. What do you investigate?

---

**Expected Answer (Short)**

The problem is almost certainly in the data or evaluation, NOT the model. Investigation: (1) Data leak check — are train and validation sets actually different? (overlapping IDs). (2) Label mismatch — are validation labels correct and consistent with training labels? (3) Different preprocessing — are transforms/normalization different between train and val? (4) Shuffled labels — are labels accidentally shuffled or misaligned with inputs? (5) Distribution mismatch — is the validation set from a completely different distribution?

---

**Deep Answer**

- **Cause 1: Data leakage or duplication (check first):**
  - Exact duplicates between train and val → training loss drops because it memorizes, val loss is meaningless
  - OR: train and val are actually the same split (copy-paste error in split logic)
  - Check: `assert len(set(train_ids) & set(val_ids)) == 0`

- **Cause 2: Label-input misalignment:**
  - Labels are shuffled independently from inputs (e.g., loaded from separate files that weren't aligned)
  - Training memorizes random label-input pairs (loss drops) but val shows random performance (loss flat)
  - Diagnostic: manually inspect 10 samples: `print(input[0], label[0])`. Do they match?

- **Cause 3: Different preprocessing:**
  ```python
  # Bug: training normalizes inputs, validation doesn't
  train_transform = transforms.Compose([..., transforms.Normalize(mean, std)])
  val_transform = transforms.Compose([...])  # missing Normalize!
  ```
  - The model learns features of normalized data but receives unnormalized data at validation
  - Also check: image sizes, color space (RGB vs BGR), tensor dtype

- **Cause 4: Val set from different distribution:**
  - Training: high-quality studio photos. Validation: phone camera photos.
  - Model learns studio-specific features that don't transfer
  - This is a legitimate domain gap, not a bug — but it manifests the same way

- **Cause 5: Model.eval() not called:**
  - If model.eval() is missing during validation, dropout randomly zeros activations, and BatchNorm uses mini-batch stats
  - This alone can prevent validation metrics from improving

- **Systematic debugging approach:**
  1. Manually inspect 10 train samples and 10 val samples (inputs + labels). Do they look correct?
  2. Train on val set directly — does loss decrease? If yes, model can learn from val data (so the issue is mismatch, not the data)
  3. Overfit on a tiny set (10 samples) from both train and val — does the model memorize both? If not, data formats differ.
  4. Check all preprocessing, transforms, and loading code side by side for train vs val.

---

**Follow-up Questions**

1. Both training and validation loss are flat from epoch 1 (neither decreases). What's different about this case?
2. You find no bugs in the data pipeline. The val set is genuinely from a different distribution. What's your strategy?
3. How would you prevent label-input misalignment bugs in the future?

---

**Common Weak Answers / Red Flags**

- "The model is underfitting" — wrong diagnosis. Training loss IS decreasing, so the model IS learning.
- "Try a bigger model" — never the answer when training loss is fine but val loss isn't
- "Add regularization" — regularization helps when training is overfit, not when val loss is flat from epoch 1
- Starts changing the model architecture instead of checking the data

---

**Interviewer Evaluation Signal**

Tests debugging instincts. The KEY insight is: when training loss and validation loss diverge from the beginning, the problem is always in the data pipeline or evaluation setup, not the model. Candidates who immediately suspect data (not model) show real debugging experience.

---

**Real-World Insight**

A team spent 2 weeks trying different model architectures because "the model wasn't generalizing." Architectures tried: ResNet18, ResNet50, EfficientNet, ViT. None improved validation accuracy beyond random chance. Root cause: their image loading code applied color space conversion (BGR→RGB) for training but not for validation. A 3-line fix in the data pipeline solved the "model architecture problem" instantly.

---

## Q-01-D-006: Your trained model works correctly in Python but gives wrong results when exported to ONNX/TorchScript for deployment. How do you debug?

**Module:** PyTorch & Deep Learning
**Submodule:** Serving Infrastructure
**Level:** Debugging
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** ML / Data Engineer, DevOps / SRE → AIOps, Senior / Architect
**Tags:** [pytorch, debugging, onnx, torchscript, export, deployment, inference]
**Prerequisites:** Q-01-S-001, Q-01-A-012
**Estimated Interview Round:** Debugging, Deep Dive
**Why This Question Matters:** Model export for production deployment is a major source of subtle bugs. Numerical differences between PyTorch eager mode and exported models can silently degrade prediction quality.

---

**Question**

You export a PyTorch model to ONNX for production serving with Triton. On the same inputs, the Python model gives correct predictions, but the ONNX model produces slightly different and sometimes wrong outputs. No errors are thrown. How do you debug?

---

**Expected Answer (Short)**

Step 1: Numerical comparison — compute max absolute difference between PyTorch and ONNX outputs per layer. Step 2: Check opset version — some operations have different implementations across ONNX opset versions. Step 3: Check dynamic axes — if shapes changed between export and inference. Step 4: Check custom operations — any ops not supported by ONNX may be silently approximated. Step 5: Check floating point precision — ONNX runtime may use different precision or operator fusion than PyTorch.

---

**Deep Answer**

- **Step 1: Quantify the discrepancy:**
  ```python
  import onnxruntime as ort
  
  # Run PyTorch
  torch_output = model(sample_input).detach().numpy()
  
  # Run ONNX
  session = ort.InferenceSession("model.onnx")
  onnx_output = session.run(None, {"input": sample_input.numpy()})[0]
  
  # Compare
  max_diff = np.abs(torch_output - onnx_output).max()
  print(f"Max absolute difference: {max_diff}")
  ```
  - Diff < 1e-5: numerical noise, acceptable
  - Diff 1e-5 to 1e-3: precision issue (fp32 vs fp16 or operator implementation differences)
  - Diff > 1e-3: likely a real export bug

- **Step 2: Layer-by-layer export validation:**
  - Export intermediate layers, not just final output
  - Identify the FIRST layer where outputs diverge
  - This pinpoints the problematic operation

- **Step 3: Common export failure modes:**
  - **Unsupported operations:** custom ops silently replaced with approximations. ONNX warns during export but warnings are easy to miss.
  - **Dynamic control flow:** `if/else` based on tensor values at export time — TorchScript/ONNX evaluates the branch taken during export and bakes it in. Dynamic branching is serialized as the path taken with the trace input.
  - **In-place operations:** `x.add_(1)` can cause issues in tracing because the tracer may not correctly capture the mutation.
  - **Non-deterministic ops:** export captures a single execution. If the model uses `torch.randint` or `dropout` during export, that specific random state is captured.

- **Step 4: Precision mismatch:**
  - ONNX runtime performs operator fusion that can change numerical results
  - TensorRT conversion (from ONNX) may use fp16 for certain layers
  - Fix: disable optimizations in ONNX runtime for debugging: `session_options.set_graph_optimization_level(ort.GraphOptimizationLevel.ORT_DISABLE_ALL)`

- **Step 5: Pre-export checklist:**
  ```
  [ ] model.eval() called before export
  [ ] Sample input has the same shape/dtype as production input
  [ ] ONNX opset version is compatible (opset 17+ for modern ops)
  [ ] torch.onnx.export(..., dynamic_axes={"input": {0: "batch"}}) for variable batch
  [ ] All custom operations have ONNX symbolic functions
  [ ] Verify with onnx.checker.check_model(model)
  ```

- **Step 6: ONNX validation tool:**
  ```python
  torch.onnx.verification.verify(model, (sample_input,), 
                                  options=torch.onnx.verification.VerificationOptions(rtol=1e-3, atol=1e-5))
  ```

---

**Follow-up Questions**

1. The ONNX model works on fixed-size inputs but crashes on different batch sizes. What's the fix?
2. Your model uses a custom attention mechanism that ONNX doesn't support. What are your options?
3. When would you use TorchScript instead of ONNX for deployment?

---

**Common Weak Answers / Red Flags**

- "ONNX export should just work" — it frequently doesn't for complex models
- Doesn't know about opset versions or dynamic axes
- Cannot describe layer-by-layer debugging approach
- Doesn't check model.eval() before export

---

**Interviewer Evaluation Signal**

Tests deployment engineering skill. The gap between "model works in notebook" and "model works in production serving" is one of the hardest bridges in ML engineering. Candidates who can debug export issues have actually deployed models.

---

**Real-World Insight**

A team exporting a BERT model to ONNX found a 0.5% accuracy degradation. Root cause: their custom attention mask handling used a Python `if` statement that was traced as a constant during export. In training, the mask changed per input; in ONNX, it was frozen to the export-time value. Fix: rewrite the mask computation as pure tensor operations without control flow. This class of bug (Python control flow baked into trace) accounts for >50% of ONNX export issues.

---

## Q-01-D-007: Your PyTorch training script runs fine but gets progressively slower over epochs. GPU memory usage keeps growing. What's causing the memory leak?

**Module:** PyTorch & Deep Learning
**Submodule:** Core PyTorch
**Level:** Debugging
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [pytorch, debugging, memory-leak, gpu, training, performance]
**Prerequisites:** Q-01-A-006, Q-01-A-010
**Estimated Interview Round:** Debugging, Technical
**Why This Question Matters:** GPU memory leaks in PyTorch are subtle — they don't throw OOM immediately but gradually consume all memory, eventually crashing or dramatically slowing training. Understanding common causes prevents hours of debugging.

---

**Question**

Your training script starts using 8GB of GPU memory but it grows to 16GB by epoch 5, then 24GB by epoch 10, and eventually OOMs at epoch 15. Each epoch's data is the same size. What's causing the progressive memory increase?

---

**Expected Answer (Short)**

Most likely causes: (1) Accumulating tensors in the computation graph — storing `loss` without `.item()` keeps the entire graph alive. (2) Appending tensors to a list without detaching (logging metrics as tensors). (3) Not detaching hidden states in RNN training across batches. (4) DataLoader with growing worker queues. Fix: use `loss.item()` for logging, `.detach()` before storing, check for tensor references escaping the training loop.

---

**Deep Answer**

- **Cause 1: Storing loss tensor without `.item()` (most common):**
  ```python
  # BUG — keeps entire computation graph in memory
  epoch_losses = []
  for batch in loader:
      loss = model(batch)
      loss.backward()
      epoch_losses.append(loss)  # graph retained!

  # FIX — extract scalar value, graph can be freed
  epoch_losses.append(loss.item())  # or loss.detach().cpu()
  ```
  `loss` holds a reference to `grad_fn`, which holds the entire computation graph. Appending to a list prevents garbage collection of all intermediate activations.

- **Cause 2: Metric logging with tensors:**
  ```python
  # BUG — accumulates GPU tensors
  all_predictions.append(model(batch))

  # FIX — detach and move to CPU
  all_predictions.append(model(batch).detach().cpu())
  ```

- **Cause 3: RNN hidden state not detached:**
  ```python
  # BUG — h carries graph from ALL previous batches
  h = model.init_hidden()
  for batch in loader:
      output, h = model(batch, h)  # h ties graphs together
      loss = criterion(output)
      loss.backward()

  # FIX — detach hidden state each batch
  h = h.detach()
  ```

- **Cause 4: Callbacks or hooks accumulating references:**
  - TensorBoard logging that stores tensor references
  - Custom callbacks that append model outputs without detaching
  - Forward/backward hooks that retain tensor references

- **Debugging tools:**
  ```python
  # Track GPU memory
  print(torch.cuda.memory_allocated() / 1e9, "GB allocated")
  print(torch.cuda.memory_reserved() / 1e9, "GB reserved")
  
  # Find all tensors on GPU
  import gc
  for obj in gc.get_objects():
      if torch.is_tensor(obj) and obj.is_cuda:
          print(type(obj), obj.size(), obj.device)
  ```
  - `memory_allocated` grows steadily = leak in your code
  - `memory_reserved` grows but `memory_allocated` stable = PyTorch allocator fragmentation (less common)

- **Prevention pattern:**
  ```python
  # Always use .item() for scalar metrics
  # Always use .detach().cpu() when storing outputs
  # Never append raw model outputs to lists
  # Use torch.no_grad() for any non-training computation
  ```

---

**Follow-up Questions**

1. GPU memory allocated is stable but `nvidia-smi` shows growing memory. What explains the discrepancy?
2. How do you find which specific tensor is leaking?
3. Your model uses gradient accumulation. Does this inherently cause memory growth?

---

**Common Weak Answers / Red Flags**

- "Call `torch.cuda.empty_cache()` every step" — hides the symptom, doesn't fix the cause
- Doesn't know the difference between `.item()` and the tensor itself
- Can't explain why storing `loss` causes a memory leak (doesn't understand computation graph lifecycle)

---

**Interviewer Evaluation Signal**

Classic PyTorch debugging question that separates practitioners from users. The `.item()` vs tensor distinction is the most common cause, and every experienced PyTorch developer has hit this at least once. Understanding computation graph lifecycle demonstrates deep framework knowledge.

---

**Real-World Insight**

A training run on 8xA100s was crashing after 4 hours. The team requested more GPU memory. Investigation showed: a custom logging callback was appending `loss` (not `loss.item()`) to a list for plotting. After 4 hours, the list held ~50K computation graphs, consuming 400GB+ of memory across GPUs. Replacing `.append(loss)` with `.append(loss.item())` fixed the issue completely. Total fix: changing 1 character (adding `.item()`). Debugging time: 6 hours. This is one of the most frequently repeated PyTorch bugs in production.
