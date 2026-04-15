# CV and Generative Architectures

Topic family D · Prerequisites: Deep Learning Core · Unlocks: Multimodal/VLMs (via ViT), research architecture discussions

This module groups the architecture families that matter most for computer vision, multimodal, and research-adjacent interviews.

---

## Scope

- CNNs and ResNet-style residual design
- YOLO and real-time detection trade-offs
- U-Net and encoder-decoder segmentation patterns
- Autoencoders and representation learning
- GANs and adversarial training
- RNN / LSTM / GRU as sequence foundations
- Transformers and ViT as cross-over architectures
- Mamba / state-space models as modern alternatives
- Diffusion models and denoising objectives

## Why This Module Is Structured as a Family

Interviewers rarely want isolated definitions. They want to know whether you understand:
- When a family is a better fit
- What its inductive bias buys you
- What it costs at training and inference time
- What has been replaced by newer patterns and what still matters in production

---

## Architecture Cards

### CNN and ResNet
- **Core idea:** Spatial feature hierarchies via learned convolutional filters
- **ResNet contribution:** Residual connections enable training of very deep networks by mitigating vanishing gradients
- **Still relevant because:** Efficient for many vision tasks, backbone for detection and segmentation
- **Interview focus:** Receptive fields, stride vs pooling, residual connection mechanics, when to use vs ViT

### YOLO (Real-Time Detection)
- **Core idea:** Single-pass detection — predicts bounding boxes and classes simultaneously
- **Trade-off:** Speed vs accuracy vs anchor-free design evolution
- **Interview focus:** Speed/accuracy curve, anchor-based vs anchor-free versions, NMS, deployment constraints (edge, mobile, real-time)
- **What separates good answers:** Discussing detection latency budgets, not just mAP

### U-Net (Segmentation)
- **Core idea:** Encoder-decoder with skip connections preserving spatial detail
- **Still relevant because:** Medical imaging, satellite, any dense prediction task
- **Interview focus:** Skip connection purpose, multi-scale feature fusion, data efficiency

### Autoencoders and VAEs
- **Core idea:** Learn compressed representations by reconstructing input
- **VAE extension:** Probabilistic latent space for generation
- **Interview focus:** Reconstruction vs generation objectives, latent space structure, when VAEs are useful vs when they are replaced by diffusion

### GANs
- **Core idea:** Generator vs discriminator adversarial training
- **Key challenge:** Training instability, mode collapse, evaluation difficulty
- **Still relevant because:** Some niche generation tasks; more importantly, the training dynamics inform understanding of adversarial robustness
- **Interview focus:** Mode collapse, training instability, Wasserstein distance, FID — but depth should match role

### RNN / LSTM / GRU
- **Core idea:** Sequential processing with hidden state
- **LSTM contribution:** Gating mechanism to handle long-range dependencies
- **Status in 2026:** Largely replaced by transformers for most tasks, but still tested as foundational sequence reasoning
- **Interview focus:** Vanishing gradients, gating intuition, why transformers superseded them, where RNNs still appear (edge, streaming)

### Vision Transformer (ViT)
- **Core idea:** Apply transformer architecture to image patches
- **Key trade-off:** Data hunger vs CNN-like inductive bias, scaling behavior
- **Interview focus:** Patch embedding, positional encoding for images, data efficiency compared to CNNs, hybrid CNN-ViT designs
- **Bridge to Multimodal:** ViT is the common vision encoder in CLIP, BLIP, and modern VLMs

### Mamba / State-Space Models
- **Core idea:** Selective state-space layers for efficient long-sequence modeling
- **Key advantage:** Linear scaling with sequence length vs quadratic for attention
- **Status in 2026:** Growing research attention, not yet dominant in production
- **Interview focus:** Where sequence length and hardware behavior favor SSMs, why they are not a universal transformer replacement
- **Differentiation topic:** Shows interview maturity — knowing what is emerging vs what is proven

### Diffusion Models
- **Core idea:** Iterative denoising from noise to data
- **Key advantage:** Higher-quality generation than GANs for images, more stable training
- **Key cost:** Slow inference due to multi-step denoising
- **Interview focus:** Forward/reverse process intuition, denoising objective, classifier-free guidance, latent diffusion (Stable Diffusion), inference speed trade-offs
- **2026 relevance:** Core for image generation, increasingly relevant for video and multimodal

---

## What Interviewers Test by Band

### 0–2 years
- Can name and distinguish major architecture families
- Understands CNN basics: filters, feature maps, pooling, stride
- Knows what residual connections solve

### 2–5 years
- Can compare architectures for a given task (detection vs segmentation vs generation)
- Understands training trade-offs: data hunger, instability, convergence
- Can reason about ViT vs CNN for a specific use case

### 5–8 years
- Can connect architecture choice to deployment constraints (latency, memory, edge)
- Understands diffusion quality/speed trade-offs
- Can discuss Mamba as a reasoned alternative, not just a buzzword

### 8+ years
- Can advise on architecture portfolio for a team or product line
- Connects model families to serving economics and platform capabilities

---

## Depth Ladder

| Level | What Good Looks Like |
|---|---|
| Concept | Can explain each family's core mechanism and primary trade-off |
| Applied | Can select and compare architectures for a given task and data constraint |
| System | Can connect architecture decisions to deployment cost, latency, and infrastructure |
| Debugging | Can diagnose training failures specific to each architecture family |
| Architect | Can define architecture strategy across a product or research portfolio |

---

## Anti-Patterns and Weak Answers

- Discussing YOLO only at marketing level, without speed/accuracy trade-offs
- Discussing GANs without training instability and mode collapse
- Discussing ViT without patching, scaling, or data hunger trade-offs
- Mentioning Mamba as a transformer replacement without understanding where it actually helps
- Treating diffusion as "better GANs" without discussing inference cost
- Listing architecture names without explaining what each family's inductive bias buys
- Ignoring that many production CV systems still use CNN backbones, not ViT

---

## Role Relevance

| Role | Depth Needed | Focus Areas |
|---|---|---|
| DL / CV | ★★★ | CNN, ResNet, YOLO, U-Net, ViT, diffusion |
| Research | ★★★ | Architecture comparisons, generative methods, Mamba, diffusion, training trade-offs |
| LLM / Multimodal | ★ | ViT and VLM-relevant encoders, image-text alignment context |
| Data / ML | ★ | Awareness of CV methods for hybrid systems |
| Platform / Ops | — | Shallow conceptual awareness only |

---

## What To Study Next

- [Transformer and Modern LLM Internals](./transformer-and-modern-llm-internals.md) — transformers applied to language and multimodal
- [Multimodal and VLMs](./multimodal-and-vlms.md) — where ViT meets language models
- [Deep Learning Core](./deep-learning-core.md) — if training mechanics need strengthening

## Cross-References

- [Module Index](../indexes/module-index.md) — all modules with sequences and detail cards
- [Experience Index](../indexes/experience-index.md) — depth expectations by career band
- [Tag Index](../indexes/tag-index.md) — related tags: `cnn`, `resnet`, `yolo`, `unet`, `gan`, `diffusion`, `vit`, `mamba`, `rnn`, `lstm`
- [Topic Graph](../topic-graph.md) — prerequisite map
