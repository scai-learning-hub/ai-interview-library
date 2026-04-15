# Module 02 — Generative AI: Concept Level

---

## Q-02-C-001: What distinguishes generative models from discriminative models, and why does this distinction matter for production applications?

**Module:** Generative AI
**Submodule:** Generative Model Types
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Beginner, Early-career
**Persona Relevance:** Fresher / Beginner, Software Dev → AI Engineer
**Tags:** [generative-ai, discriminative-models, generative-models, fundamentals]
**Prerequisites:** Q-00-C-001
**Estimated Interview Round:** Screening, Technical
**Why This Question Matters:** Understanding the conceptual boundary between generative and discriminative models is foundational. Production decisions — from data requirements to deployment patterns — depend on knowing what your model actually models.

---

**Question**

Explain the difference between generative and discriminative models. Give an example of each and explain when you'd choose one over the other in a production setting.

---

**Expected Answer (Short)**

Discriminative models learn P(y|x) — the decision boundary between classes. Generative models learn P(x) or P(x|y) — the data distribution itself. Discriminative: BERT classifier, logistic regression. Generative: GPT, diffusion models, VAE. For classification with labeled data, discriminative models are simpler and often more accurate. For content creation, augmentation, or when you need the model to produce new samples, generative models are necessary.

---

**Deep Answer**

- **Discriminative models:** Learn the conditional P(y|x). They focus on what separates classes. Examples: BERT for sentiment classification, SVM, logistic regression, ResNet for image classification. They need labeled data and answer "what is this?"

- **Generative models:** Learn the joint P(x,y) or the data distribution P(x). They model how data is generated. Examples: GPT (autoregressive language model), diffusion models (Stable Diffusion), VAEs, GANs. They can answer "generate something like this."

- **Production implications:**
  - Discriminative: lower data requirement for classification tasks, easier to evaluate (accuracy/F1), faster inference
  - Generative: can produce content, enable zero/few-shot via prompting (LLMs), but harder to evaluate (how do you measure "is this text good?"), more expensive to serve

- **Modern blur:** LLMs like GPT-4 are generative models used as discriminative classifiers via prompting. This is viable but less efficient than fine-tuned discriminative models for narrow tasks.

---

**Follow-up Questions**

1. Can a generative model be used for classification? How?
2. Why are generative models generally more expensive to train than discriminative ones?
3. What's the connection between autoregressive language models and generative models?

---

**Common Weak Answers / Red Flags**

- Can't name examples of each type
- "GPT is discriminative because you can use it for classification" — confuses capability with model type
- No mention of production trade-offs

---

**Interviewer Evaluation Signal**

Foundational understanding check. Candidates should be precise about the probability distributions each type models. Bonus: connecting this to practical decisions (when to fine-tune a classifier vs. prompt an LLM).

---

## Q-02-C-002: What is prompt engineering and why is it considered a core skill for AI engineers rather than just ad-hoc text writing?

**Module:** Generative AI
**Submodule:** Prompt Engineering
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Beginner, Early-career, Mid-level
**Persona Relevance:** Software Dev → AI Engineer, Fresher / Beginner
**Tags:** [prompt-engineering, generative-ai, llm, zero-shot, few-shot, chain-of-thought]
**Prerequisites:** Q-02-C-001
**Estimated Interview Round:** Screening, Technical
**Why This Question Matters:** Prompt engineering is the primary interface for LLM-based systems. Engineers who treat it as "just writing text" build brittle, unreliable systems. Systematic prompt design is now a required engineering discipline.

---

**Question**

What is prompt engineering? Explain the key techniques (zero-shot, few-shot, chain-of-thought) and why prompt design should be treated as a software engineering discipline, not creative writing.

---

**Expected Answer (Short)**

Prompt engineering is the systematic design of inputs to LLMs to control output behavior. Key techniques: zero-shot (instruction only), few-shot (examples in prompt), chain-of-thought (reason step-by-step). It's engineering because: prompts need version control, testing, evaluation metrics, regression detection, and are as critical to system behavior as code. A bad prompt is a bug, not a writing mistake.

---

**Deep Answer**

- **Zero-shot:** Direct instruction, no examples. "Classify this review as positive or negative: {text}". Works well for tasks the model was trained on.
- **Few-shot:** Provide 2-5 examples of input→output pairs, then the actual input. Dramatically improves format compliance and edge case handling.
- **Chain-of-thought (CoT):** "Think step by step before answering." Forces the model to produce reasoning tokens before the final answer. Critical for math, logic, and multi-step tasks. Can be zero-shot CoT ("Let's think step by step") or few-shot CoT (examples include reasoning).

- **Why it's engineering:**
  - **Versioned:** Prompts change system behavior. They need git history like code.
  - **Tested:** Prompt changes can break functionality. Evaluation suites catch regressions.
  - **Measured:** Success rate, format compliance, latency — prompts have KPIs.
  - **Reviewed:** Prompt changes should be peer-reviewed. A subtle wording change can flip behavior on edge cases.
  - **Parameterized:** Production prompts are templates with variables, guards, and fallback strategies.

- **Common prompt design patterns:**
  - Role assignment: "You are a medical billing expert..."
  - Output format specification: "Respond in JSON with keys: category, confidence, reasoning"
  - Constraint declaration: "Only use information from the provided context"
  - Negative instruction: "Do NOT include disclaimers or caveats"

---

**Follow-up Questions**

1. How do you evaluate whether a prompt change improved or degraded performance?
2. What's the difference between prompt engineering and fine-tuning? When do you choose each?
3. How does prompt injection relate to prompt engineering?

---

**Common Weak Answers / Red Flags**

- "Just tell the model what you want" — no methodology
- No mention of version control or testing
- Can't explain CoT or why it helps

---

**Interviewer Evaluation Signal**

Tests whether the candidate treats prompts as engineering artifacts. The key distinctions: knowing the standard techniques (zero/few-shot, CoT) AND understanding that prompts need the same rigor as code (versioning, testing, evaluation).

---

## Q-02-C-003: What is fine-tuning, how does it differ from pre-training, and when is it worth the investment versus prompt engineering alone?

**Module:** Generative AI
**Submodule:** Fine-Tuning Fundamentals
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Beginner, Early-career, Mid-level
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [fine-tuning, pre-training, generative-ai, transfer-learning, llm]
**Prerequisites:** Q-01-C-009, Q-02-C-002
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** The decision between prompt engineering, fine-tuning, and training from scratch is one of the most consequential choices in an AI project. Getting it wrong costs weeks of engineering time or results in worse performance.

---

**Question**

Explain the difference between pre-training and fine-tuning. When should you fine-tune a model instead of relying on prompt engineering?

---

**Expected Answer (Short)**

Pre-training: learning general knowledge from massive data (billions of tokens, weeks of compute). Fine-tuning: adapting a pre-trained model to a specific task/domain with much less data (thousands of examples, hours of compute). Fine-tune when: (1) prompting can't achieve required quality, (2) you need consistent output format, (3) you need to encode domain knowledge not in the base model, (4) cost/latency of few-shot prompting is too high. Stick with prompting when: data is scarce, the task changes frequently, or prompting already works.

---

**Deep Answer**

- **Pre-training:** Train from random weights on massive general corpus (e.g., internet text). Learns language structure, world knowledge, reasoning patterns. Cost: millions of dollars, weeks on thousands of GPUs. Output: foundation model.

- **Fine-tuning:** Start from pre-trained weights, train further on task-specific data. Adapts the model's knowledge to your domain. Cost: hundreds to thousands of dollars, hours on a few GPUs. Output: specialized model.

- **Decision framework — Fine-tune when:**
  | Signal | Action |
  |--------|--------|
  | Prompting achieves <80% of target quality | Fine-tune |
  | Output format must be 100% consistent (JSON, API calls) | Fine-tune |
  | Domain vocabulary not in base model (medical, legal, proprietary) | Fine-tune |
  | Few-shot examples make prompt too long (cost/latency) | Fine-tune |
  | Privacy: can't send data to external API | Fine-tune + self-host |

- **Decision framework — Stick with prompting when:**
  | Signal | Action |
  |--------|--------|
  | <100 labeled examples available | Prompt (few-shot) |
  | Task definition changes frequently | Prompt (no retraining needed) |
  | Prompting already hits quality bar | Don't over-engineer |
  | Evaluation infrastructure not ready | Prompt first, fine-tune later |

- **Hybrid approach:** Most production systems start with prompting, identify where it fails, collect failure examples, and fine-tune on those. This is the most efficient path.

---

**Follow-up Questions**

1. What is catastrophic forgetting and how does it affect fine-tuning?
2. How much data do you typically need for effective fine-tuning?
3. What's the difference between full fine-tuning and parameter-efficient fine-tuning (LoRA)?

---

**Common Weak Answers / Red Flags**

- "Always fine-tune for best results" — ignores cost/data requirements
- Can't articulate when prompting is sufficient
- Doesn't mention evaluation as prerequisite for fine-tuning

---

**Interviewer Evaluation Signal**

Tests practical judgment. The best candidates describe a decision framework, not a dogmatic answer. They should mention that you need evaluation infrastructure BEFORE fine-tuning (otherwise you can't measure if it helped).

---

## Q-02-C-004: What is LoRA and why has it become the default approach for fine-tuning large language models?

**Module:** Generative AI
**Submodule:** Parameter-Efficient Fine-Tuning
**Level:** Concept
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [lora, qlora, peft, fine-tuning, generative-ai, adapter]
**Prerequisites:** Q-02-C-003, Q-01-C-001
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** LoRA reduced the cost of fine-tuning from "needs a cluster" to "fits on a single GPU." Understanding LoRA is essential for any engineer working with LLM customization.

---

**Question**

Explain how LoRA works. Why is it more efficient than full fine-tuning, and what trade-offs does it introduce?

---

**Expected Answer (Short)**

LoRA (Low-Rank Adaptation) freezes all original model weights and injects small trainable low-rank matrices (A and B) into each attention layer. Instead of updating a d×d weight matrix W, you add ΔW = BA where B is d×r and A is r×d (r << d, typically 8-64). This reduces trainable parameters by 90-99%. Trade-off: slightly less expressive than full fine-tuning, and rank r is a hyperparameter that affects quality vs. efficiency.

---

**Deep Answer**

- **Mechanism:**
  - Original weight: W₀ (d×d, frozen)
  - LoRA adds: ΔW = B × A where B ∈ ℝ^(d×r), A ∈ ℝ^(r×d)
  - During forward pass: h = (W₀ + ΔW)x = W₀x + BAx
  - Only A and B are trained. W₀ stays frozen.
  - At inference: merge W₀ + BA → single matrix, zero additional latency

- **Why it works:**
  - Research finding: weight updates during fine-tuning have low intrinsic rank. You don't need all d² degrees of freedom.
  - For a 7B model: full fine-tuning = 7B trainable params. LoRA with r=16 on attention layers ≈ 10-50M trainable params (0.1-0.7%).

- **Practical benefits:**
  - **Memory:** Only optimizer states for LoRA params (not full model). 7B model: full fine-tune needs ~56GB, LoRA needs ~16GB.
  - **Storage:** LoRA adapter is ~10-100MB vs. full model checkpoint of 14GB+.
  - **Multi-task:** Serve one base model with multiple LoRA adapters (swap at inference).
  - **Merging:** Can merge adapter into base weights for zero-overhead inference.

- **QLoRA extension:** Quantize base model to 4-bit, apply LoRA on quantized model. Fine-tune a 70B model on a single 48GB GPU.

- **Trade-offs:**
  - Lower rank = more compression = potential quality loss on complex tasks
  - Not all layers benefit equally — attention layers respond best
  - Hyperparameter: rank r, alpha (scaling), which layers to target
  - For dramatically different domains (English model → code), full fine-tuning may still win

---

**Follow-up Questions**

1. How do you choose the rank r for LoRA? What happens if it's too low or too high?
2. Can you stack multiple LoRA adapters? What are the challenges?
3. How does QLoRA quantize to 4-bit without destroying model quality?

---

**Common Weak Answers / Red Flags**

- Can't explain the low-rank decomposition
- "LoRA is just fine-tuning with less compute" — misses the mechanism
- Doesn't know LoRA can be merged for zero-latency inference

---

**Interviewer Evaluation Signal**

Technical depth test. The candidate should understand WHY low-rank works (intrinsic dimensionality of fine-tuning updates), not just WHAT it does. Bonus: knowing about adapter merging and multi-adapter serving.

---

## Q-02-C-005: What is RLHF and why is it critical for making LLMs useful and safe?

**Module:** Generative AI
**Submodule:** Alignment
**Level:** Concept
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Senior / Architect
**Tags:** [rlhf, alignment, reward-model, ppo, dpo, generative-ai, safety]
**Prerequisites:** Q-02-C-003
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** RLHF is the technique that transformed raw language models into usable assistants. Understanding it explains why ChatGPT behaves differently from GPT-3, and informs decisions about model alignment in production.

---

**Question**

Explain Reinforcement Learning from Human Feedback (RLHF). What problem does it solve, and what are its components?

---

**Expected Answer (Short)**

RLHF aligns model behavior with human preferences. Pre-training teaches the model to predict text; RLHF teaches it to produce HELPFUL, HARMLESS, HONEST text. Three stages: (1) Supervised fine-tuning (SFT) on demonstration data. (2) Train a reward model from human preference comparisons (A is better than B). (3) Optimize the LLM policy using PPO against the reward model, with a KL penalty to prevent divergence from the SFT model.

---

**Deep Answer**

- **The problem:** A pre-trained LLM can complete text but doesn't know what "good" completion means. It might produce toxic content, refuse to answer, answer incorrectly confidently, or ramble. RLHF teaches the model human-aligned behavior.

- **Stage 1 — Supervised Fine-Tuning (SFT):**
  - Collect demonstration data: human experts write ideal responses to prompts
  - Fine-tune the base model on this data
  - Result: model learns the FORMAT of good responses but not nuanced quality

- **Stage 2 — Reward Model Training:**
  - Generate multiple responses per prompt from the SFT model
  - Human annotators rank/compare responses (A > B)
  - Train a reward model to predict human preference scores
  - This automates the human evaluation signal

- **Stage 3 — PPO Optimization:**
  - Use the reward model as a scoring function
  - Optimize the LLM to maximize reward using Proximal Policy Optimization
  - KL divergence penalty prevents the model from "hacking" the reward model (reward overoptimization)

- **Modern alternatives:**
  - **DPO (Direct Preference Optimization):** Skips the reward model entirely. Directly optimizes the policy from preference pairs. Simpler, cheaper, competitive results.
  - **ORPO, SimPO, KTO:** Further simplifications of the alignment objective.
  - Industry trend: DPO is replacing PPO for many use cases due to simplicity.

---

**Follow-up Questions**

1. What is reward hacking and how does the KL penalty prevent it?
2. How does DPO simplify the RLHF pipeline?
3. What are the challenges of collecting high-quality human preference data at scale?

---

**Common Weak Answers / Red Flags**

- Can't name the three stages
- "RLHF is just reinforcement learning with human labels" — too vague
- Doesn't mention reward model or preference data

---

**Interviewer Evaluation Signal**

Tests understanding of the full RLHF pipeline. Senior candidates should understand the motivation (alignment), the mechanism (reward model + PPO), and the modern alternatives (DPO). Bonus: discussing reward overoptimization and its consequences.

---

## Q-02-C-006: What is structured output from LLMs and why is it critical for production systems?

**Module:** Generative AI
**Submodule:** Structured Output
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Early-career, Mid-level
**Persona Relevance:** Software Dev → AI Engineer, ML / Data Engineer
**Tags:** [structured-output, json-mode, function-calling, generative-ai, production]
**Prerequisites:** Q-02-C-002
**Estimated Interview Round:** Technical, Screening
**Why This Question Matters:** Production systems can't consume free-text LLM output. Structured output (JSON, function calls, schema-constrained) is the bridge between LLMs and software systems. Engineers who don't enforce structure build fragile integrations.

---

**Question**

What is structured output from LLMs? What techniques ensure an LLM produces valid JSON or other structured formats reliably?

---

**Expected Answer (Short)**

Structured output means constraining LLM generation to produce a specific format (JSON, XML, function call schema). Techniques: (1) JSON mode (API-level constraint). (2) Function calling / tool use (model selects a function + arguments). (3) Constrained decoding (grammar-based token filtering at generation time). (4) Schema-in-prompt (describe the schema and validate post-generation). For production reliability: constrained decoding > JSON mode > prompt engineering, because each provides stronger guarantees.

---

**Deep Answer**

- **Why free text fails in production:**
  - Downstream systems need parseable data (APIs, databases, UIs)
  - Free text is brittle: "Here's the JSON: ```json {...}```" vs just `{...}` — parsing breaks
  - Format compliance must be 100%, not 95% — a 5% parse failure rate means 5% of requests fail

- **Technique 1: JSON mode (API providers):**
  - OpenAI `response_format={"type": "json_object"}` — guarantees valid JSON
  - Doesn't guarantee SCHEMA compliance — you get valid JSON but maybe wrong keys

- **Technique 2: Function calling / Tool use:**
  - Define function schemas with parameter types
  - Model outputs a structured function call: `{"name": "search", "arguments": {"query": "..."}}`
  - More reliable than raw JSON mode because the schema is explicitly defined

- **Technique 3: Constrained decoding (strongest guarantee):**
  - At each generation step, mask tokens that would violate the grammar/schema
  - Libraries: Outlines, Guidance, LMQL, vLLM with grammar support
  - Guarantees 100% schema compliance by construction — invalid tokens are never sampled
  ```python
  from outlines import models, generate
  model = models.transformers("mistralai/Mistral-7B-v0.1")
  generator = generate.json(model, schema)  # JSON schema constraint
  result = generator(prompt)  # guaranteed valid
  ```

- **Technique 4: Prompt engineering + post-validation:**
  - Include schema in prompt, validate output, retry on failure
  - Weakest guarantee but works with any model
  - Use Pydantic models for validation

---

**Follow-up Questions**

1. How does constrained decoding affect generation speed?
2. What happens when function calling returns malformed arguments? How do you handle it?
3. How do you handle cases where the model's response legitimately doesn't fit the schema?

---

**Common Weak Answers / Red Flags**

- "Just ask the model to output JSON" — no reliability guarantee
- Doesn't know about constrained decoding
- Can't distinguish between valid JSON and schema-compliant JSON

---

**Interviewer Evaluation Signal**

Production readiness test. Candidates who only know prompt-based approaches will build systems with parse failures. Those who know constrained decoding understand the reliability spectrum.

---

## Q-02-C-007: What are the key differences between autoregressive models, diffusion models, and encoder-decoder models?

**Module:** Generative AI
**Submodule:** Generative Model Types
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Beginner, Early-career, Mid-level
**Persona Relevance:** ML / Data Engineer, Fresher / Beginner
**Tags:** [autoregressive, diffusion, encoder-decoder, generative-ai, architecture]
**Prerequisites:** Q-01-C-007, Q-02-C-001
**Estimated Interview Round:** Screening, Technical
**Why This Question Matters:** Different generative architectures suit different tasks. Choosing the wrong architecture for your use case wastes months. Understanding the fundamental differences guides architectural decisions.

---

**Question**

Compare autoregressive models (GPT), diffusion models (Stable Diffusion), and encoder-decoder models (T5). How does each generate output and what are they best suited for?

---

**Expected Answer (Short)**

Autoregressive: generates one token at a time, left-to-right. Best for text generation, code, conversation. Diffusion: starts from noise, iteratively denoises. Best for images, audio, video. Encoder-decoder: encodes full input, then decodes output. Best for translation, summarization, structured transformations. Key trade-off: autoregressive is sequential (slow for long output), diffusion requires many denoising steps (slow but controllable), encoder-decoder has full bidirectional context of input.

---

**Deep Answer**

- **Autoregressive (GPT, Llama, Claude):**
  - Generates token-by-token: P(x_t | x_1...x_{t-1})
  - Each token depends on all previous tokens
  - Strengths: natural for text, flexible output length, scales extremely well
  - Weaknesses: sequential generation (can't parallelize output), can't "look ahead"
  - Use cases: chat, code generation, creative writing, reasoning

- **Diffusion (Stable Diffusion, DALL-E 3, Sora):**
  - Forward process: add Gaussian noise to data in T steps until pure noise
  - Reverse process: learn to denoise step by step, recovering data from noise
  - Strengths: high-quality continuous data (images, audio), controllable via conditioning, edit-friendly
  - Weaknesses: slow (50-1000 denoising steps), high compute for high resolution
  - Use cases: image generation, image editing, video, audio, molecular design

- **Encoder-Decoder (T5, BART, mBART):**
  - Encoder: bidirectional attention over full input (understands context deeply)
  - Decoder: autoregressive generation conditioned on encoder output
  - Strengths: input understanding + output generation separated (good for transformation tasks)
  - Weaknesses: less dominant since decoder-only models matched quality with more scale
  - Use cases: translation, summarization, structured extraction

- **Modern trend:** Decoder-only (autoregressive) models have won for most text tasks due to scaling properties. But diffusion dominates for continuous media. Encoder-decoder survives in specific niches (translation, ASR).

---

**Follow-up Questions**

1. Why have decoder-only models largely replaced encoder-decoder models for text tasks?
2. Can autoregressive models generate images? How?
3. What are flow-matching models and how do they relate to diffusion?

---

**Common Weak Answers / Red Flags**

- Can't explain the diffusion process (forward noise + reverse denoising)
- Thinks GPT has an encoder
- "Diffusion models are for images, transformers are for text" — ignores diffusion transformers

---

**Interviewer Evaluation Signal**

Architecture literacy test. Candidates should know the generation mechanism of each type, not just what they're used for. Understanding WHY autoregressive won for text (scaling) shows awareness of the field's evolution.

---

## Q-02-C-008: What is inference optimization for generative models and why does it matter?

**Module:** Generative AI
**Submodule:** Inference Optimization
**Level:** Concept
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, DevOps / SRE → AIOps, Senior / Architect
**Tags:** [inference, optimization, quantization, batching, kv-cache, generative-ai, latency]
**Prerequisites:** Q-01-C-001, Q-02-C-007
**Estimated Interview Round:** Technical, System Design
**Why This Question Matters:** Generative model inference is expensive — often the largest cost in an AI system. Understanding optimization techniques directly impacts cost, latency, and scalability of production deployments.

---

**Question**

Why is generative model inference expensive, and what are the primary techniques for optimizing it?

---

**Expected Answer (Short)**

Generative inference is expensive because: (1) models are large (7B-405B parameters), (2) autoregressive generation is sequential (token-by-token), (3) each token requires a full forward pass. Primary optimizations: KV cache (avoid recomputing attention for previous tokens), quantization (INT8/INT4 reduces memory and compute), continuous batching (serve multiple requests simultaneously), speculative decoding (draft model proposes tokens, main model verifies in parallel), and tensor parallelism (split model across GPUs).

---

**Deep Answer**

- **Why it's expensive:**
  - A 70B model at fp16 = 140GB just for weights. Needs multiple GPUs just to load.
  - Generating 100 tokens = 100 sequential forward passes. Can't parallelize.
  - Each forward pass: attention over full context + all previous KV pairs.

- **Optimization 1: KV cache:**
  - Cache key-value tensors from previous tokens' attention computation
  - New token only computes its own Q, reuses cached K and V
  - Memory trade-off: KV cache for long contexts can be >10GB

- **Optimization 2: Quantization:**
  - INT8: halves memory, minimal quality loss for most models
  - INT4 (GPTQ, AWQ): quarters memory, enables 70B on a single GPU
  - FP8 (H100/H200): hardware-native 8-bit with good quality

- **Optimization 3: Continuous batching:**
  - Static batching: wait for all requests in batch to finish (waste)
  - Continuous: as one request finishes, immediately start a new one in its slot
  - Implemented by vLLM, TensorRT-LLM, TGI

- **Optimization 4: Speculative decoding:**
  - Small "draft" model generates N candidate tokens quickly
  - Large "verifier" model checks all N tokens in one forward pass (parallel verification)
  - Accept matching tokens, reject and regenerate from divergence point
  - Can achieve 2-3x speedup with quality preservation

- **Optimization 5: PagedAttention:**
  - KV cache memory allocated in non-contiguous pages (like OS virtual memory)
  - Eliminates KV cache memory fragmentation
  - Enables near-100% GPU memory utilization

---

**Follow-up Questions**

1. What's the relationship between batch size, latency, and throughput in LLM serving?
2. How does tensor parallelism differ from pipeline parallelism for serving?
3. When does quantization noticeably degrade output quality?

---

**Common Weak Answers / Red Flags**

- "Just use a bigger GPU" — not a strategy
- Doesn't know what KV cache is
- Can't explain why autoregressive generation is inherently sequential

---

**Interviewer Evaluation Signal**

System-level thinking test. The candidate should understand the root causes of inference cost (model size, sequential generation) and know the standard optimization toolkit. Mentioning vLLM or PagedAttention shows awareness of current infrastructure.

---

## Q-02-C-009: What is the difference between temperature, top-p, and top-k in LLM sampling?

**Module:** Generative AI
**Submodule:** Sampling and Decoding
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Beginner, Early-career, Mid-level
**Persona Relevance:** Software Dev → AI Engineer, Fresher / Beginner
**Tags:** [sampling, temperature, top-p, top-k, decoding, generative-ai]
**Prerequisites:** Q-02-C-001
**Estimated Interview Round:** Screening, Technical
**Why This Question Matters:** Sampling parameters directly control output quality, creativity, and reliability. Misconfigured sampling is a common source of poor LLM behavior in production — too creative (hallucination) or too deterministic (repetitive).

---

**Question**

Explain temperature, top-p (nucleus sampling), and top-k sampling. How do they interact, and what settings would you use for different production use cases?

---

**Expected Answer (Short)**

Temperature scales logits before softmax — high temperature (>1) makes distribution more uniform (creative), low temperature (<1) makes it peaky (deterministic). Top-k: only sample from the k most probable tokens. Top-p: only sample from the smallest set of tokens whose cumulative probability exceeds p. For factual tasks: low temperature (0.0-0.3). For creative tasks: higher temperature (0.7-1.0) with top-p=0.9. For code generation: temperature 0.0-0.2. They compose: temperature adjusts distribution, then top-k/top-p filters it.

---

**Deep Answer**

- **Temperature (T):**
  - Modified softmax: P(token_i) = exp(logit_i / T) / Σ exp(logit_j / T)
  - T=0: greedy (always pick highest probability token) — deterministic
  - T=1: standard softmax distribution
  - T>1: flatter distribution, more random selections
  - T<1: sharper distribution, more concentrated on top tokens

- **Top-k:**
  - After computing probabilities, keep only the k highest-probability tokens, zero out the rest, renormalize
  - k=1: greedy decoding, k=50: common default
  - Problem: fixed k doesn't adapt to the distribution shape. Easy next word (e.g., "the") vs. ambiguous position need different k.

- **Top-p (nucleus sampling):**
  - Sort tokens by probability. Include tokens until cumulative probability ≥ p.
  - Adaptive: easy positions use few tokens (peaked distribution), ambiguous positions use many.
  - p=0.9: commonly good default. p=1.0: no filtering.

- **Production settings:**
  | Use Case | Temperature | Top-p | Reasoning |
  |----------|-------------|-------|-----------|
  | Factual QA | 0.0 | 1.0 | Deterministic, correct answers |
  | Code generation | 0.0-0.2 | 0.95 | Low creativity, syntactically correct |
  | Creative writing | 0.7-1.0 | 0.9 | Varied, interesting output |
  | Structured extraction | 0.0 | 1.0 | Consistent format compliance |
  | Brainstorming | 1.0-1.2 | 0.95 | Maximum diversity |

- **Composition:** Temperature is applied first (reshapes the distribution), then top-k/top-p filter the reshaped distribution. Using both: temperature=0.8 + top-p=0.9 gives creative but not wild output.

---

**Follow-up Questions**

1. What's the difference between temperature=0 and greedy decoding? Are they identical?
2. How does repetition penalty interact with these sampling parameters?
3. Why might top-p=0.9 with temperature=0 still be deterministic?

---

**Common Weak Answers / Red Flags**

- Can't explain the mathematical effect of temperature
- Confuses top-k and top-p
- "Higher temperature = better quality" — wrong
- No awareness of use-case-specific settings

---

**Interviewer Evaluation Signal**

Practical knowledge test. Candidates should know the math and the production settings. The table of use-case-specific settings shows real deployment experience. Bonus: understanding why top-p is generally preferred over top-k (adaptive vs. fixed filtering).
