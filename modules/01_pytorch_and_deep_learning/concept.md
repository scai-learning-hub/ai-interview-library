# Module 01 — PyTorch & Deep Learning: Concept Level

## Q-01-C-001: What is a tensor and how does it differ from a NumPy array?

**Module:** PyTorch & Deep Learning
**Submodule:** Core PyTorch
**Level:** Concept
**Difficulty:** 1
**Experience Bands:** Beginner, Early-career
**Persona Relevance:** Fresher / Beginner, Software Dev → AI Engineer
**Tags:** [pytorch, tensor, numpy, gpu, fundamentals]
**Prerequisites:** None
**Estimated Interview Round:** Screening, Technical
**Why This Question Matters:** Tensors are the fundamental data structure in deep learning. Understanding how they relate to arrays and why they exist is table-stakes knowledge.

**Question**

What is a tensor in PyTorch? How does it differ from a NumPy ndarray, and why does PyTorch use tensors instead of NumPy arrays?

**Expected Answer (Short)**

A tensor is a multi-dimensional array (like NumPy's ndarray) but with two critical additions: (1) GPU acceleration — tensors can live on GPU memory for parallel computation. (2) Automatic differentiation — tensors track computation history and can compute gradients via `autograd`. NumPy arrays have neither capability.

**Deep Answer**

- **Structural similarity:** both are N-dimensional arrays with dtype, shape, stride. PyTorch tensors support the same operations (indexing, slicing, broadcasting, reshaping).
- **GPU support:** `tensor.to('cuda')` moves data to GPU. NumPy arrays are CPU-only. GPU parallelism enables 10–100x speedup for matrix operations.
- **Autograd integration:** tensors with `requires_grad=True` track operations in a computational graph. Calling `.backward()` computes gradients automatically. This is the foundation of backpropagation.
- **Memory sharing:** `torch.from_numpy(arr)` creates a tensor that shares memory with the NumPy array (zero-copy). Changes to one affect the other.
- **Dtype differences:** PyTorch defaults to `float32`; NumPy defaults to `float64`. This matters for GPU memory (float32 uses half the memory of float64).
- **Device abstraction:** tensors carry their device (`cpu`, `cuda:0`, `mps`), enabling seamless CPU↔GPU transfers.

**Follow-up Questions**

1. What happens if you modify a NumPy array that shares memory with a PyTorch tensor?
2. Why does PyTorch default to float32 instead of float64?
3. Can you use autograd with a tensor on CPU?

**Common Weak Answers / Red Flags**

- "They're the same thing" — misses the two critical additions (GPU + autograd)
- Cannot explain what autograd does
- Doesn't know about memory sharing between NumPy and PyTorch

**Interviewer Evaluation Signal**

Baseline knowledge check. Anyone writing PyTorch code should know this. The GPU + autograd distinction is non-negotiable.

**Real-World Insight**

The NumPy-PyTorch interop (memory sharing) is both a feature and a trap. In data pipelines, accidentally modifying a NumPy array that's shared with a tensor can introduce subtle data corruption bugs that are extremely hard to track down. Best practice: use `.clone()` when you need independent copies.

---

## Q-01-C-002: What is autograd and how does backpropagation work in PyTorch?

**Module:** PyTorch & Deep Learning
**Submodule:** Core PyTorch
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Beginner, Early-career
**Persona Relevance:** Fresher / Beginner, Software Dev → AI Engineer
**Tags:** [pytorch, autograd, backpropagation, gradient, computational-graph]
**Prerequisites:** Q-01-C-001
**Estimated Interview Round:** Technical
**Why This Question Matters:** Autograd is the engine that makes neural network training possible. If you don't understand it, you can't debug gradient issues.

**Question**

Explain how PyTorch's autograd system works. What is a computational graph, and how does PyTorch use it for backpropagation?

**Expected Answer (Short)**

When you perform operations on tensors with `requires_grad=True`, PyTorch records each operation in a directed acyclic graph (DAG). The leaves are input tensors, intermediate nodes are operations, and the root is the loss. Calling `loss.backward()` traverses this graph in reverse (from loss to inputs), computing gradients via the chain rule. Each tensor stores its gradient in `.grad`. PyTorch uses dynamic computational graphs — the graph is rebuilt on every forward pass, allowing Python control flow (if/else, loops) in the model.

**Deep Answer**

- **Dynamic graph (define-by-run):** PyTorch builds the graph during the forward pass. Each operation creates a node. This is different from TensorFlow 1.x's static graph (define-then-run).
- **Computational graph nodes:** each tensor has a `.grad_fn` attribute pointing to the operation that created it. `loss.grad_fn` → `MeanBackward` → `MmBackward` → `AddBackward` → ...
- **Backward pass:** `loss.backward()` starts at the root and applies the chain rule through each `.grad_fn`. Gradients accumulate in each tensor's `.grad` attribute.
- **Gradient accumulation:** `.grad` is ADDITIVE. If you call `.backward()` twice without zeroing, gradients double. That's why `optimizer.zero_grad()` is called before each backward pass.
- **Detaching:** `tensor.detach()` creates a tensor that doesn't track gradients. Useful for stopping gradient flow (e.g., in target networks for RL).
- **`torch.no_grad()`:** context manager that disables gradient tracking for inference. Reduces memory usage since no graph is saved.
- **Leaf tensors:** tensors created directly (not by operations) are leaves. Only leaf tensors retain `.grad` after backward by default.

**Follow-up Questions**

1. What happens if you forget `optimizer.zero_grad()` before backward?
2. Why is PyTorch's dynamic graph an advantage over static graphs for research?
3. What does `retain_graph=True` do and when would you use it?

**Common Weak Answers / Red Flags**

- Cannot explain the chain rule in context of autograd
- Doesn't understand gradient accumulation
- Thinks gradients are automatically zeroed between steps

**Interviewer Evaluation Signal**

Core PyTorch mechanism. If the candidate can explain autograd clearly, they understand the training loop at a fundamental level. If they can't, they're calling `.backward()` without understanding what happens.

**Real-World Insight**

The gradient accumulation behavior (additive `.grad`) is one of the most common PyTorch bugs for beginners. It's also intentionally exploited: gradient accumulation over multiple mini-batches simulates larger batch sizes when GPU memory is limited. This is standard practice when training large models on consumer GPUs.

---

## Q-01-C-003: What is the difference between nn.Module and nn.functional?

**Module:** PyTorch & Deep Learning
**Submodule:** Core PyTorch
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Beginner, Early-career
**Persona Relevance:** Fresher / Beginner, Software Dev → AI Engineer
**Tags:** [pytorch, nn-module, functional, api-design, stateful-vs-stateless]
**Prerequisites:** Q-01-C-001
**Estimated Interview Round:** Technical
**Why This Question Matters:** Understanding this distinction determines whether a developer structures PyTorch models correctly and knows where state (parameters) lives.

**Question**

What is the difference between `torch.nn` modules (like `nn.Linear`) and `torch.nn.functional` functions (like `F.linear`)? When would you use each?

**Expected Answer (Short)**

`nn.Module` classes (like `nn.Linear`) are stateful — they hold learnable parameters (weights, biases) as `nn.Parameter` objects. `nn.functional` functions (like `F.linear`) are stateless — they accept parameters as explicit arguments. Use `nn.Module` when you need learnable parameters that persist across forward passes. Use `nn.functional` for stateless operations (ReLU, dropout during inference) or when you want explicit control over parameters.

**Deep Answer**

- **`nn.Module`:** stateful layer. `nn.Linear` creates and manages weight and bias tensors. These are registered as parameters and appear in `model.parameters()`. The optimizer updates them.
- **`nn.functional`:** pure functions. `F.linear(input, weight, bias)` computes the same operation but you supply the parameters. No state management.
- **Convention:**
  - Use `nn.Module` for layers with learnable parameters (Linear, Conv2d, BatchNorm, Embedding)
  - Use `nn.functional` for activation functions (F.relu), loss computation (F.cross_entropy), and operations where you manage parameters yourself
- **Dropout consideration:** `nn.Dropout` module tracks training/eval mode automatically. `F.dropout` requires passing `training=self.training` explicitly.
- **Modern pattern:** most codebases use `nn.Module` for everything in the model definition (cleaner, state management handled automatically) and `nn.functional` for loss functions and preprocessing.

**Follow-up Questions**

1. If you use `F.dropout` instead of `nn.Dropout`, what do you need to handle manually?
2. What does `model.parameters()` return and why is it important for the optimizer?
3. How do you register a non-learnable buffer in an nn.Module? When would you need one?

**Common Weak Answers / Red Flags**

- "They're the same, just different syntax" — misses the stateful vs stateless distinction
- Doesn't know that nn.Module manages parameter registration
- Can't explain why optimizer needs model.parameters()

**Interviewer Evaluation Signal**

Tests understanding of PyTorch's design philosophy. Candidates who know this write cleaner, more maintainable model code. Those who don't often create bugs around parameter management.

**Real-World Insight**

A common production bug: defining a layer in `__init__` as a raw `torch.Tensor` instead of `nn.Parameter`. The tensor exists but isn't registered as a parameter — the optimizer never updates it, and `model.state_dict()` doesn't save it. The model trains but a subset of parameters are frozen. This is surprisingly hard to detect without explict parameter counting.

---

## Q-01-C-004: Explain batch normalization — what is it, why does it work, and what happens at inference time?

**Module:** PyTorch & Deep Learning
**Submodule:** Architectures
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Early-career, Mid-level
**Persona Relevance:** Fresher / Beginner, ML / Data Engineer
**Tags:** [pytorch, batch-normalization, training, inference, normalization]
**Prerequisites:** Q-01-C-002
**Estimated Interview Round:** Technical
**Why This Question Matters:** Batch norm is in virtually every CNN and many other architectures. Its behavior difference between training and inference is a critical source of production bugs.

**Question**

Explain batch normalization. Why does it help training? What changes between training mode and evaluation mode?

**Expected Answer (Short)**

Batch norm normalizes each feature across the batch to zero mean and unit variance, then scales and shifts with learnable parameters (gamma, beta). During training, it uses batch statistics (current batch mean/variance). During inference (`model.eval()`), it uses running statistics accumulated during training (exponential moving average of mean/variance). This prevents inference results from depending on the batch composition. Benefits: stabilizes training, allows higher learning rates, acts as mild regularization.

**Deep Answer**

- **Training:** for each feature dimension, compute batch mean μ and variance σ². Normalize: `(x - μ) / sqrt(σ² + ε)`. Then scale and shift: `γ * normalized + β` where γ, β are learnable.
- **Running statistics:** during training, maintain exponential moving average of batch statistics: `running_mean = (1-momentum) * running_mean + momentum * batch_mean`. Default momentum = 0.1.
- **Inference:** use running_mean and running_var instead of batch statistics. This makes inference deterministic and independent of batch composition.
- **Why it works:**
  - Reduces internal covariate shift (original claim, debated)
  - Smooths the loss landscape (proven effect)
  - Acts as regularization (batch statistics add noise)
  - Enables higher learning rates → faster convergence
- **`model.train()` vs `model.eval()`:** critical switch. `model.eval()` tells batch norm to use running statistics. Forgetting this → erratic inference results.
- **Small batch issues:** with very small batches, batch statistics are noisy. Use GroupNorm or LayerNorm instead.
- **Alternatives:** LayerNorm (used in transformers — normalizes across features, not batch), GroupNorm, InstanceNorm.

**Follow-up Questions**

1. You forget to call `model.eval()` before inference. How does this affect predictions?
2. Why do transformers use LayerNorm instead of BatchNorm?
3. Your model works with batch_size=32 but fails with batch_size=1 at inference. Why?

**Common Weak Answers / Red Flags**

- Cannot explain the training vs eval behavior difference
- Doesn't know about running statistics
- "It just normalizes the data" — too vague

**Interviewer Evaluation Signal**

Classic knowledge question that reveals understanding depth. The train/eval mode distinction is the key test — it causes real production bugs.

**Real-World Insight**

One of the most frequently reported PyTorch bugs in forums: "model works during training but gives random results during inference." Fix: add `model.eval()`. This one-line omission has cost teams days of debugging. In production serving code, the eval() call should be part of the model loading boilerplate, not left to individual developers.

---

## Q-01-C-005: What is the vanishing gradient problem and how do modern architectures solve it?

**Module:** PyTorch & Deep Learning
**Submodule:** Training Dynamics
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Early-career, Mid-level
**Persona Relevance:** Fresher / Beginner, Software Dev → AI Engineer
**Tags:** [pytorch, vanishing-gradient, residual-connections, lstm, relu, deep-networks]
**Prerequisites:** Q-01-C-002
**Estimated Interview Round:** Technical
**Why This Question Matters:** The vanishing gradient problem was the main barrier to training deep networks for decades. Understanding it is necessary to understand why modern architectures are designed the way they are.

**Question**

What is the vanishing gradient problem? Why does it occur, and what techniques in modern architectures address it?

**Expected Answer (Short)**

In deep networks, gradients are computed via the chain rule — multiplying many derivatives together. If these derivatives are small (e.g., sigmoid derivative max is 0.25), gradients shrink exponentially as they propagate backward. Layers near the input get near-zero gradients and stop learning. Solutions: (1) ReLU activation (non-saturating, derivative = 1 for positive inputs). (2) Residual connections (skip connections in ResNet — gradient has a direct path). (3) LSTM/GRU gates (for sequences — allow gradients to flow unchanged through time). (4) Proper initialization (He/Xavier). (5) Normalization layers.

**Deep Answer**

- **Root cause:** chain rule multiplication. For L layers with sigmoid: gradient ∝ (0.25)^L. At 10 layers, gradient is ~10^-6 of the original. At 50 layers, effectively zero.
- **ReLU (2011):** derivative is 1 for positive inputs, 0 for negative. No saturation for positive values. Problem: dying ReLU (neurons stuck at 0). Variants: LeakyReLU, GELU, SiLU (Swish).
- **Residual connections (ResNet, 2015):** y = F(x) + x. During backprop, gradient of identity shortcut is 1. Gradient always has at least an identity path, preventing vanishing. Enabled training of 152+ layer networks.
- **LSTM (1997):** cell state passes through with multiplicative gates. The "forget gate" and "input gate" can maintain gradient flow across long sequences (100+ timesteps) where vanilla RNNs fail at 20+.
- **Normalization:** BatchNorm/LayerNorm keep activations in a well-conditioned range, preventing gradients from entering the vanishing (or exploding) regime.
- **Initialization:** He initialization (for ReLU): weights ~ N(0, 2/fan_in). Xavier (for symmetric activations): weights ~ N(0, 2/(fan_in + fan_out)). Proper initialization prevents gradients from starting in a bad regime.
- **Transformers:** use residual connections + LayerNorm at every layer. Self-attention provides direct gradient paths between all positions (no sequential dependency like RNNs).

**Follow-up Questions**

1. What is the exploding gradient problem and how is it related?
2. Why does GELU outperform ReLU in transformers?
3. Can residual connections hurt performance? When?

**Common Weak Answers / Red Flags**

- Can describe the problem but not the solutions
- Doesn't connect residual connections to gradient flow
- "Just use ReLU" — incomplete without understanding why and alternatives

**Interviewer Evaluation Signal**

Tests historical understanding of deep learning progress. The connection between the vanishing gradient problem and architectural solutions (ResNet, LSTM, normalization) shows conceptual depth. Candidates who can trace this arc understand why architectures are designed the way they are.

**Real-World Insight**

ResNet's skip connections were arguably the single most important architectural innovation of the 2010s. Before ResNet (2015), training networks deeper than ~20 layers was unreliable. After ResNet, 100+ layer networks became routine. The same principle (residual connections) is now in every large model — transformers use residual connections at every layer, and the "pre-norm" vs "post-norm" placement debate remains active in LLM architecture design.

---

## Q-01-C-006: What are the key differences between CNNs, RNNs, and Transformers?

**Module:** PyTorch & Deep Learning
**Submodule:** Architectures
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Early-career, Mid-level
**Persona Relevance:** Fresher / Beginner, Software Dev → AI Engineer
**Tags:** [pytorch, cnn, rnn, transformer, architecture-comparison]
**Prerequisites:** Q-01-C-005
**Estimated Interview Round:** Technical
**Why This Question Matters:** Understanding the design tradeoffs between the three major architecture families is fundamental to choosing the right approach for a task.

**Question**

Compare CNNs, RNNs, and Transformers. What are the key architectural differences, what are their strengths, and when would you choose each one?

**Expected Answer (Short)**

**CNNs:** local pattern detection via sliding filters. Strength: translation invariance, parameter efficiency for spatial data. Best for: images, local patterns. **RNNs:** sequential processing, hidden state captures history. Strength: handles variable-length sequences. Weakness: slow (no parallelism), struggles with long-range dependencies. Best for: small sequential tasks, streaming. **Transformers:** self-attention over all positions simultaneously. Strength: captures long-range dependencies, parallelizable, scalable. Weakness: quadratic memory/compute in sequence length. Best for: NLP, generation, and increasingly everything else.

**Deep Answer**

| Aspect | CNN | RNN | Transformer |
|--------|-----|-----|-------------|
| Inductive bias | Locality, translation invariance | Temporal ordering, recurrence | No strong bias (learned via attention) |
| Parallelization | Full spatial parallelism | Sequential (can't parallelize over time) | Full parallelism over positions |
| Long-range deps | Limited by receptive field | Theoretically infinite, practically ~100 steps | All positions attend to all positions |
| Compute complexity | O(k·n) where k=kernel size | O(n·h²) where h=hidden size | O(n²·d) where n=sequence length |
| Memory | Efficient (shared kernels) | O(n·h) | O(n²) for attention |
| Modern usage | Vision (ConvNeXt), audio | Mostly replaced by Transformers | Dominant for NLP, increasing for vision (ViT) |

- **CNN architecture:** Conv → Activation → Pooling → repeat → FC. Each conv layer has limited receptive field; stacking deepens the field.
- **RNN architecture:** h_t = f(h_{t-1}, x_t). Processes one timestep at a time. LSTM/GRU variants solve vanishing gradients.
- **Transformer architecture:** Input → Positional Encoding → [Self-Attention + FFN + LayerNorm + Residual] × N. Attention computes weighted sum over all positions.
- **Current trend:** Transformers are being applied to vision (ViT), audio (Whisper), protein folding (AlphaFold), replacing domain-specific architectures with a general one.

**Follow-up Questions**

1. Why are CNNs still used for edge deployment even though Transformers are more accurate?
2. What is the computational bottleneck of Transformers and how are people addressing it?
3. Can you combine CNNs and Transformers? Give an example.

**Common Weak Answers / Red Flags**

- Cannot explain the computational trade-offs
- "Transformers are better at everything" — ignores efficiency concerns
- Doesn't know why RNNs have been largely replaced

**Interviewer Evaluation Signal**

Tests breadth of architectural knowledge. The key insight is that each architecture encodes different inductive biases, and the choice depends on the task's structure. Candidates who understand this make better design decisions.

**Real-World Insight**

Despite Transformers' dominance, CNNs remain the most deployed architecture in production due to their efficiency on edge devices (phones, cameras, IoT). MobileNet and EfficientNet power billions of on-device inference calls daily. The "Transformers for everything" trend in research doesn't reflect deployment reality, where compute constraints force pragmatic architecture choices.

---

## Q-01-C-007: What is attention and how does self-attention work?

**Module:** PyTorch & Deep Learning
**Submodule:** Transformers
**Level:** Concept
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [pytorch, attention, self-attention, transformer, qkv, scaled-dot-product]
**Prerequisites:** Q-01-C-006
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** Self-attention is the core mechanism of all modern LLMs and increasingly all deep learning. Understanding it at a mathematical level is essential for anyone working with transformers.

**Question**

Explain the self-attention mechanism. What are queries, keys, and values? Walk through the computation step by step.

**Expected Answer (Short)**

Self-attention computes a weighted combination of values (V), where the weights are determined by the similarity between queries (Q) and keys (K). Given input X: Q = XW_Q, K = XW_K, V = XW_V. Attention(Q,K,V) = softmax(QK^T / √d_k) V. Each position "queries" all other positions, gets similarity scores (attention weights), and aggregates their values. The √d_k scaling prevents softmax from becoming too peaked. Multi-head attention runs multiple attention heads in parallel with different projections, then concatenates.

**Deep Answer**

- **Step 1:** Project input X into three spaces: Q = XW_Q, K = XW_K, V = XW_V where W_Q, W_K, W_V are learned weight matrices.
- **Step 2:** Compute attention scores: S = QK^T. This is a matrix of similarity scores between all pairs of positions. Shape: (seq_len × seq_len).
- **Step 3:** Scale: S = S / √d_k. Without scaling, dot products grow with dimension size, pushing softmax into a regime where gradients vanish.
- **Step 4:** Apply softmax row-wise: A = softmax(S). Each row sums to 1. A[i][j] = how much position i attends to position j.
- **Step 5:** Weighted combination: Output = AV. Each position's output is a weighted sum of all value vectors, weighted by attention scores.
- **Multi-head attention:** run h parallel attention heads (each with d_k = d_model/h), concatenate outputs, project with W_O. Each head can learn different attention patterns (syntactic, semantic, positional).
- **Key insights:**
  - Self-attention: Q, K, V all come from the same sequence (unlike cross-attention where Q comes from decoder, K/V from encoder)
  - No notion of order — position must be added via positional encoding
  - Computational cost: O(n² × d) where n = sequence length

**Follow-up Questions**

1. Why √d_k scaling? What happens without it?
2. What is the difference between self-attention and cross-attention?
3. How does multi-head attention differ from running a single head with larger dimension?

**Common Weak Answers / Red Flags**

- Cannot walk through the QKV computation
- "Attention lets the model focus on important parts" — too vague for a technical interview
- Doesn't understand the scaling factor

**Interviewer Evaluation Signal**

The ability to explain QKV attention mathematically and intuitively separates candidates who understand transformers from those who just call APIs. This is a litmus test for any LLM engineering role.

**Real-World Insight**

Flash Attention (2022) doesn't change the attention computation — it computes the exact same thing — but optimizes memory access patterns. By tiling the computation and avoiding materializing the full N×N attention matrix, it reduces memory from O(N²) to O(N) and achieves 2-4x wall-clock speedup. Understanding that the attention bottleneck is often memory bandwidth, not compute, is critical for LLM performance work.

---

## Q-01-C-008: What is the difference between model.train() and model.eval() in PyTorch?

**Module:** PyTorch & Deep Learning
**Submodule:** Core PyTorch
**Level:** Concept
**Difficulty:** 1
**Experience Bands:** Beginner, Early-career
**Persona Relevance:** Fresher / Beginner, Software Dev → AI Engineer
**Tags:** [pytorch, train-mode, eval-mode, dropout, batchnorm, inference]
**Prerequisites:** Q-01-C-004
**Estimated Interview Round:** Screening, Technical
**Why This Question Matters:** Forgetting this toggle is one of the top-5 PyTorch bugs. It directly impacts inference quality in production.

**Question**

What does `model.train()` and `model.eval()` do? Which layers behave differently, and what happens if you forget to switch?

**Expected Answer (Short)**

`model.train()` sets the model to training mode; `model.eval()` sets it to evaluation mode. Two key layers behave differently: (1) **Dropout:** active during train (randomly zeros elements), disabled during eval. (2) **BatchNorm:** uses batch statistics during train, uses running statistics during eval. Forgetting `model.eval()` before inference causes: dropout to randomly drop activations (making outputs non-deterministic) and BatchNorm to use mini-batch statistics (making outputs depend on what else is in the batch).

**Deep Answer**

- **`model.train()` sets `self.training = True`** for the module and all submodules. **`model.eval()` sets `self.training = False`**.
- **Dropout behavior:**
  - Training: randomly zeros elements with probability p, scales remaining by 1/(1-p) (inverted dropout)
  - Eval: identity function (no dropout)
  - Impact of forgetting eval: inference outputs are random — different each time
- **BatchNorm behavior:**
  - Training: normalizes using current batch mean/variance, updates running statistics
  - Eval: normalizes using accumulated running mean/variance
  - Impact of forgetting eval: single-sample inference is undefined (batch statistics of a single sample), results vary with batch composition
- **Other affected layers:** any custom layer that checks `self.training` (e.g., stochastic depth, DropPath)
- **Common pattern:**
  ```python
  model.eval()
  with torch.no_grad():  # separate concern — disables autograd
      output = model(input)
  ```
- Note: `model.eval()` and `torch.no_grad()` are independent. `eval()` changes layer behavior. `no_grad()` disables gradient computation for memory savings.

**Follow-up Questions**

1. Can you have model.eval() WITHOUT torch.no_grad()? When would you want this?
2. How do you ensure eval mode is always set in a production serving pipeline?
3. Does model.eval() affect the model's parameters?

**Common Weak Answers / Red Flags**

- Confuses `model.eval()` with `torch.no_grad()` — they are independent
- Cannot name which layers are affected
- "It doesn't matter for inference" — it absolutely does

**Interviewer Evaluation Signal**

Simple but critical. Production bugs from this are so common that interviewers test it explicitly. A confident, precise answer signals production experience.

**Real-World Insight**

Production ML serving frameworks (TorchServe, Triton) automatically handle eval mode. But in custom serving code, this is frequently missed. Teams often add a validation step in CI/CD that asserts `model.training == False` in the serving container. One team discovered their production model had been running in training mode for 3 weeks — predictions were noisy due to active dropout, creating a subtle quality regression that was attributed to "data drift" before the real cause was found.

---

## Q-01-C-009: What is transfer learning and why is it so effective?

**Module:** PyTorch & Deep Learning
**Submodule:** Training Strategies
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Beginner, Early-career
**Persona Relevance:** Fresher / Beginner, Software Dev → AI Engineer, ML / Data Engineer
**Tags:** [pytorch, transfer-learning, pretrained, fine-tuning, feature-extraction]
**Prerequisites:** Q-01-C-005
**Estimated Interview Round:** Technical
**Why This Question Matters:** Transfer learning is the practical foundation of modern AI — fine-tuning pretrained models is how 90%+ of real-world models are built.

**Question**

What is transfer learning? Why does it work, and what are the two main approaches?

**Expected Answer (Short)**

Transfer learning uses a model pretrained on a large dataset (e.g., ImageNet, web text) and adapts it to a new task. It works because early layers learn general features (edges, textures for vision; syntax, semantics for language) that transfer across tasks. Two approaches: (1) **Feature extraction:** freeze pretrained layers, only train a new classification head. Fast, needs little data. (2) **Fine-tuning:** unfreeze some or all pretrained layers and train with a small learning rate. Better accuracy, needs more data, risk of overfitting/catastrophic forgetting.

**Deep Answer**

- **Why it works:** pretrained models learn hierarchical representations. Vision: edges → textures → parts → objects. Language: tokens → syntax → semantics → reasoning. Lower layers learn universal features; higher layers learn task-specific ones.
- **Feature extraction:**
  - Freeze all pretrained weights (`param.requires_grad = False`)
  - Replace final layers with task-specific head
  - Only train the new head (10x–100x faster)
  - When: small dataset (<1000 examples), target task similar to pretraining
- **Fine-tuning:**
  - Unfreeze all or top-N layers
  - Train with smaller learning rate than training from scratch (typically 10x–100x smaller)
  - Discriminative learning rates: lower LR for pretrained layers, higher for new head
  - When: medium dataset, target task somewhat different from pretraining
- **Progressive unfreezing:** unfreeze one layer at a time from top to bottom. Prevents catastrophic forgetting.
- **Modern paradigm:** pretrain a foundation model on massive data (GPT, BERT, ResNet on ImageNet), fine-tune on downstream tasks. This is the dominant pattern in NLP (BERT → fine-tune for sentiment, NER, QA) and vision (ResNet → fine-tune for medical imaging).

**Follow-up Questions**

1. When would transfer learning NOT help?
2. What is catastrophic forgetting and how do you prevent it during fine-tuning?
3. What learning rate would you use for fine-tuning vs. training from scratch?

**Common Weak Answers / Red Flags**

- Can't distinguish feature extraction from fine-tuning
- "Just unfreeze everything and train" — misses the nuance
- Doesn't mention learning rate adjustment for fine-tuning

**Interviewer Evaluation Signal**

Tests practical knowledge. Almost every production ML task uses transfer learning. The feature extraction vs fine-tuning distinction and knowing when to use each is a practical decision candidates should be able to make.

**Real-World Insight**

Medical imaging AI almost entirely relies on ImageNet-pretrained models fine-tuned on medical data. This works because even though X-rays look nothing like ImageNet images, the low-level features (edges, textures, shapes) transfer. A 2019 study showed that ImageNet-pretrained models fine-tuned on 500 chest X-rays outperformed models trained from scratch on 100,000 X-rays. This is why transfer learning is the default, not the exception.
