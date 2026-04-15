# Alignment / Post-Training

Topic family K · Prerequisites: Transformer internals, training loops, loss functions · Unlocks: Model customization, safety design, evaluation strategy

This module covers behavior shaping after pretraining, with explicit attention to when post-training is the right lever and when retrieval, prompting, or product controls are better.

---

## Scope

- SFT (Supervised Fine-Tuning)
- RLHF (Reinforcement Learning from Human Feedback)
- DPO, ORPO, SimPO, KTO (reward-free alignment variants)
- Reward modeling
- LoRA, QLoRA, and PEFT methods
- Constitutional AI and rule-based alignment
- Red-teaming and adversarial evaluation
- Guardrails and safety layers
- Evaluation and benchmarking
- When to fine-tune vs prompt-engineer vs use RAG

## Why This Module Matters

AI interviews increasingly test whether candidates can choose the right intervention. Many weak answers jump directly to fine-tuning or RLHF without asking whether the real problem is retrieval, prompting, data quality, or system design.

---

## Subtopic Breakdown

### SFT (Supervised Fine-Tuning)
- Fine-tuning a pre-trained model on task-specific (instruction, response) pairs
- Data quality matters more than data quantity — garbage in, garbage out
- Catastrophic forgetting: fine-tuning on a narrow domain can degrade general capabilities
- Full fine-tuning vs parameter-efficient methods: when each is appropriate
- **Interview focus:** When does SFT help, and when does better prompting or RAG eliminate the need?

### LoRA and Parameter-Efficient Fine-Tuning (PEFT)
- **LoRA:** Low-rank adaptation — inject small trainable matrices into frozen model layers
- **QLoRA:** LoRA on a quantized base model — dramatically reduces memory requirements
- Rank selection: higher rank = more capacity but more parameters and risk of overfitting
- Target layers: which layers to apply LoRA to (attention projections, MLP layers, etc.)
- Merging: LoRA adapters can be merged back into the base model for inference
- Multiple LoRA adapters: serving different adapters for different tasks from one base model
- **Why PEFT dominates in 2026:** Full fine-tuning of large models is prohibitively expensive for most teams

### RLHF (Reinforcement Learning from Human Feedback)
- Pipeline: SFT → reward model training → PPO to optimize for reward
- Reward model: trained on human preference comparisons (A vs B, which is better?)
- PPO (Proximal Policy Optimization): RL algorithm used to update the model
- KL divergence penalty: prevents model from deviating too far from the base policy
- Reward hacking: model finds ways to maximize reward signal without genuinely improving
- **Critical insight:** RLHF is expensive, requires good preference data, and introduces instability

### DPO and Reward-Free Alignment
- **DPO (Direct Preference Optimization):** Directly optimizes from preference pairs without training a separate reward model
- Simpler pipeline than RLHF: no reward model, no RL — just contrastive loss on chosen/rejected pairs
- **ORPO, SimPO, KTO:** Newer alternatives with different trade-offs (no reference model, single-pass, etc.)
- When DPO works: clear preference signal, good data, model not too far from desired behavior
- When RLHF still wins: complex reward landscapes, iterative refinement, known reward hacking risks
- **2026 trend:** DPO and variants are increasingly preferred for practical alignment work

### Constitutional AI and Rule-Based Alignment
- Define principles (a "constitution") that guide model behavior
- Self-critique: model evaluates its own outputs against the constitution
- Reduced need for human annotation (the constitution provides the signal)
- Limitations: principles must be well-specified, and self-critique is not perfectly reliable
- **Enterprise relevance:** Organizations define their own alignment rules (tone, safety, compliance)

### Red-Teaming and Adversarial Evaluation
- Systematic attempts to make the model produce harmful, incorrect, or policy-violating outputs
- Automated red-teaming: using LLMs to generate adversarial prompts at scale
- Human red-teaming: expert evaluators finding edge cases automated methods miss
- Categories: jailbreaks, hallucination induction, bias elicitation, unsafe tool use
- **Interview focus:** Can you design an evaluation process, not just list attack types?

### Guardrails and Safety Layers
- Input filtering: detect and block harmful or out-of-scope requests
- Output filtering: check model outputs for unsafe content before returning to user
- Classifiers: separate models that evaluate safety (Llama Guard, content classifiers)
- Layered defense: multiple safety checks at different points in the pipeline
- Trade-offs: stricter guardrails = more false positives = worse user experience
- **Design principle:** Safety is a system property, not a model property

### Evaluation and Benchmarking
- Task-specific evaluation: accuracy, F1, BLEU, ROUGE — depends on the task
- LLM-as-judge: using a stronger model to evaluate outputs (MT-Bench, AlpacaEval patterns)
- Human evaluation: gold standard but expensive and slow
- Holistic benchmarks: MMLU, HumanEval, GSM8K — useful but limited
- Evaluation contamination: models might have trained on benchmark data
- **Critical insight:** No single metric captures model quality — evaluation must be multi-dimensional

### When to Fine-Tune vs Prompt-Engineer vs RAG
- **Prompt engineering:** Fast, cheap, no training — try this first
- **RAG:** Model needs access to knowledge not in its training data — add retrieval
- **Fine-tuning:** Model needs to change its behavior pattern, not just its knowledge
- **The decision matrix:**
  - Behavior change → fine-tune
  - Knowledge gap → RAG
  - Formatting/style → prompt engineering or light SFT
  - All of the above → combine approaches
- **Anti-pattern:** Fine-tuning to inject facts that change over time (use RAG instead)

---

## What Interviewers Test by Band

### 0–2 years
- Can explain what RLHF is and why it exists
- Knows the difference between SFT and alignment training
- Understands why fine-tuning might be unnecessary for many use cases

### 2–5 years
- Understands LoRA/QLoRA and can explain when to use them
- Can compare DPO vs RLHF trade-offs
- Knows how to structure a fine-tuning dataset and evaluate results

### 5–8 years
- Can design an alignment and evaluation pipeline for a specific product
- Understands guardrail architecture and safety system design
- Can reason about when fine-tuning is justified vs when it is wasted effort

### 8+ years
- Can define an organization's alignment and safety strategy
- Can design evaluation frameworks that go beyond standard benchmarks
- Can reason about alignment trade-offs at scale: safety vs helpfulness, cost vs quality

---

## Depth Ladder

| Level | What Good Looks Like | What Answers Should NOT Be |
|---|---|---|
| Concept | Knows the post-training pipeline: SFT → alignment → evaluation | "RLHF makes the model better" without explaining the mechanism |
| Applied | Can set up a fine-tuning run with LoRA, evaluate results, and decide if it helped | Fine-tuning without evaluating against a baseline |
| System | Can design alignment and evaluation pipelines for a product | Treating alignment as a one-time activity rather than ongoing process |
| Debugging | Can diagnose fine-tuning failures: reward hacking, catastrophic forgetting, data quality issues | "The fine-tuning didn't work" without investigating why |
| Architect | Can define alignment strategy across models, teams, and products | Recommending RLHF for every alignment need without considering simpler alternatives |

---

## Anti-Patterns and Weak Answers

- Treating RLHF as the default path to better behavior
- Describing DPO as "RLHF but simpler" without discussing supervision assumptions
- Fine-tuning to inject facts (use RAG for knowledge, fine-tuning for behavior)
- Ignoring evaluation: fine-tuning without measuring whether it actually helped
- Treating safety as a model-only concern rather than a system concern
- Not understanding LoRA rank selection or when PEFT applies
- Evaluating post-training changes only with preference win-rate and not task correctness or operational risk
- Ignoring the role of retrieval, tool grounding, guardrails, and prompt design

---

## Role Relevance

| Role | Depth Needed | Focus Areas |
|---|---|---|
| Research | ★★★ | Full depth: RLHF, reward modeling, DPO variants, evaluation methodology |
| LLM / RAG / Agent | ★★★ | LoRA/QLoRA, DPO, evaluation, when to fine-tune vs RAG |
| Senior / Architect | ★★ | Alignment strategy, safety architecture, evaluation design |
| Data / ML | ★★ | Data quality for fine-tuning, evaluation design |
| Platform AI | ★★ | Fine-tuning infrastructure, model management, A/B testing |
| Software → AI | ★ | When to fine-tune vs prompt-engineer, basic evaluation |
| DL / CV | ★ | Transfer learning connections, domain adaptation |
| DevOps → AIOps | ★ | Model versioning, deployment of fine-tuned models |

---

## What To Study Next

- [Transformer and Modern LLM Internals](./transformer-and-modern-llm-internals.md) — model internals that alignment modifies
- [RAG](./rag.md) — the alternative to fine-tuning for knowledge injection
- [Agents and Agentic Systems](./agents-and-agentic-systems.md) — safety constraints in autonomous systems
- [MLOps / LLMOps / AIOps](./mlops-llmops-aiops.md) — operational lifecycle for fine-tuned models

## Question Bank

Practice questions for this module are in the [GenAI question bank](../../modules/02_genai/) and [LLM Engineering question bank](../../modules/03_llm_engineering/).

## Cross-References

- [Module Index](../indexes/module-index.md) — all modules with sequences and detail cards
- [Experience Index](../indexes/experience-index.md) — depth expectations by career band
- [Tag Index](../indexes/tag-index.md) — related tags: `rlhf`, `dpo`, `sft`, `lora`, `qlora`, `peft`, `reward-model`, `alignment`, `safety`, `guardrails`, `red-teaming`, `evaluation`, `fine-tuning-vs-rag`
- [Topic Graph](../topic-graph.md) — prerequisite map
