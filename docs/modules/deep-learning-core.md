# Deep Learning Core

Topic family C · Prerequisites: tensor thinking, optimization basics, compute graphs (from Foundations) · Unlocks: CV/Generative Architectures, Transformer Internals, Systems/Serving

Deep learning core is the bridge from mathematical intuition to model-building and production debugging.

---

## Scope

- Tensors and tensor layouts
- Batching and shape flow
- Forward and backward pass intuition
- Compute graph / autograd mechanics
- Loss functions
- Normalization and regularization
- Optimization and schedulers
- Training loops
- Mixed precision
- CUDA intuition
- Distributed training intuition

## Why This Module Matters

Candidates often know architecture names but cannot reason about training. This module fixes that gap. It is the difference between using models and understanding why they train, diverge, slow down, or overfit.

---

## Subtopic Breakdown

### Tensors, Shapes, and Memory
- Tensor ranks, strides, contiguous vs non-contiguous memory
- Shape flow through layers: how conv, linear, embedding, and attention layers transform shapes
- Device placement: CPU vs GPU, `.to()`, when transfers become bottlenecks
- Memory layout: NCHW vs NHWC, why it matters for performance

### Forward and Backward Pass
- Forward: input → layers → output → loss
- Backward: loss → gradients → parameter updates
- Compute graph construction: dynamic (PyTorch) vs static
- Gradient accumulation: when and why to use it
- Detach, no_grad, and when to break the graph

### Loss Functions
- Cross-entropy: why it works for classification, softmax temperature, label smoothing
- MSE vs MAE: robustness to outliers
- Contrastive losses: triplet, InfoNCE — used in embeddings and CLIP-style training
- Focal loss: addressing class imbalance in detection
- Custom losses: when to design them and when to avoid it

### Normalization
- BatchNorm: mean/variance over batch, train vs eval behavior, batch-size sensitivity
- LayerNorm: per-sample normalization, transformer standard
- GroupNorm, InstanceNorm: when BatchNorm fails (small batches, style transfer)
- Why normalization interacts with batch size, mixed precision, and distributed training

### Regularization
- Dropout: train vs eval, spatial dropout, where it helps and where it hurts
- Weight decay: L2 regularization, decoupled weight decay (AdamW)
- Data augmentation as implicit regularization
- Early stopping: when to use, how to implement correctly

### Optimization
- SGD, Adam, AdamW: when each helps
- Learning rate schedules: warmup, cosine decay, step decay
- Gradient clipping: why it prevents divergence, how to set the threshold
- Learning rate vs batch size interaction
- Why optimizer state consumes memory and what that means for large models

### Mixed Precision and Performance
- FP32, FP16, BF16: when to use each
- Loss scaling: why mixed precision needs it
- Autocast and GradScaler in PyTorch
- When mixed precision fails: numerical instability, gradient underflow

### Distributed Training
- Data parallelism: replicate model, split data, synchronize gradients
- Model parallelism: split model across GPUs, pipeline stages
- FSDP (Fully Sharded Data Parallel): memory savings and communication trade-offs
- DeepSpeed ZeRO stages: what each offloads and when to use which
- Communication overhead: all-reduce, ring-allreduce, gradient compression

### Training Loop Reliability
- Reproducibility: seeds, deterministic ops, when perfect reproducibility is impossible
- Checkpointing: frequency, what to save, resume logic
- OOM debugging: batch size, activation checkpointing, gradient accumulation
- Data loading: num_workers, prefetch, pin_memory, when the dataloader is the bottleneck

---

## What Interviewers Test by Band

### 0–2 years (Junior / early-career)
- Can explain tensors, forward pass, backward pass, loss, and optimizer roles
- Understands batching, gradients, normalization, dropout, and train/eval behavior
- Can write a basic training loop

### 2–5 years (Mid-level)
- Can diagnose overfitting, unstable loss, OOM, throughput bottlenecks, poor data loading
- Understands mixed precision, batch-size trade-offs, training loop reliability
- Knows when to use gradient accumulation, clipping, and learning rate warmup

### 5–8 years (Senior)
- Can reason about distributed training cost, throughput, failure containment
- Can design experiment infrastructure for reproducibility
- Understands interaction effects: normalization + batch size, mixed precision + loss scaling

### 8+ years (Staff / Architect)
- Can design training infrastructure for teams
- Can define what to standardize (training loop, checkpointing) vs what to leave flexible
- Can make resource allocation decisions across training workloads

---

## Depth Ladder

| Level | What Good Looks Like | What Answers Should NOT Be |
|---|---|---|
| Concept | Can explain training loop components and their roles clearly | Naming components without explaining their function |
| Applied | Can diagnose training issues and choose optimization strategies | "Just increase the learning rate" without trade-off reasoning |
| System | Can connect training choices to cost, throughput, and reliability | Describing training in isolation from deployment consequences |
| Debugging | Can isolate whether a failure is data, loss, optimizer, memory, or implementation | Restarting training without diagnosing what went wrong |
| Architect | Can define training infrastructure standards for teams | Generic distributed training advice without resource and team context |

---

## Anti-Patterns and Weak Answers

- Treating CUDA as magic instead of memory and kernel scheduling
- Confusing autograd correctness with numerically stable training
- Assuming larger batches always improve training
- Ignoring interaction effects: normalization + batch size, mixed precision + loss scaling, gradients + clipping
- Saying "we used 8 GPUs" without explaining parallelism strategy or communication overhead
- Treating OOM as a batch-size-only problem (ignoring activation memory, optimizer state, gradient accumulation)
- Skipping checkpoint strategy and reproducibility concerns in training design

---

## Role Relevance

| Role | Depth Needed | Focus Areas |
|---|---|---|
| Data / ML | ★★★ | Full training mechanics, evaluation, debugging |
| DL / CV | ★★★ | Architecture-specific training, mixed precision, distributed |
| Research | ★★★ | Ablation design, optimization, loss engineering |
| LLM / RAG / Agent | ★★ | Fine-tuning mechanics, memory, training awareness |
| Software → AI | ★★ | Training loop literacy, debugging basics |
| Platform AI | ★ | Resource implications, infrastructure awareness |
| DevOps → AIOps | ★ | Training workload characteristics, failure signatures |
| Senior / Architect | ★ | Training infrastructure decisions, cost trade-offs |

---

## What To Study Next

- [CV and Generative Architectures](./cv-and-generative-architectures.md) — applies training mechanics to vision architectures
- [Transformer and Modern LLM Internals](./transformer-and-modern-llm-internals.md) — applies training mechanics to LLM architectures
- [Systems, Serving, and Inference](./systems-serving-and-inference.md) — connects training decisions to inference consequences

## Cross-References

- [Module Index](../indexes/module-index.md) — all modules with sequences and detail cards
- [Experience Index](../indexes/experience-index.md) — depth expectations by career band
- [Tag Index](../indexes/tag-index.md) — related tags: `batching`, `normalization`, `regularization`, `loss-functions`, `mixed-precision`, `distributed-training`, `gradient-clipping`, `training-loop`
- [Topic Graph](../topic-graph.md) — prerequisite map
