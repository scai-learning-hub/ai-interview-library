# Transformer and Modern LLM Internals Problem Set 01

## Choose, Explain, And Defend The Right Model Internals For A Product

| Attribute | Value |
|---|---|
| Module | Transformer and Modern LLM Internals |
| Difficulty | 3-4 |
| Best for | Engineers moving from API use to real model and serving understanding |
| Timebox | 90-120 minutes |
| Use with | [Transformer and Modern LLM Internals](../../modules/transformer-and-modern-llm-internals.md) and [Transformer and Modern LLM Internals Batch 01](../../question-library/transformer-and-modern-llm-internals/transformer-and-modern-llm-internals-batch-01.md) |

---

## Scenario

Your team is choosing a model strategy for a copilot product that must support:

- long technical prompts
- code-heavy traffic
- structured JSON output
- cost-aware routing between fast and strong models
- future integration with RAG and agent workflows

Leadership hears terms like RoPE, GQA, KV cache, long context, reasoning models, and MoE, but no one has explained which of these matter for product behavior and serving economics.

## What You Should Produce

1. A clear explanation of the internal mechanisms that matter most for this product.
2. A model-selection and routing recommendation.
3. A memory and latency reasoning pass grounded in context length and KV cache behavior.
4. A failure analysis for poor tokenization, weak sampling policy, and oversized context use.
5. A short decision memo that a product or platform lead could actually act on.

---

## Part 1: Internals That Matter

### Prompt

Which transformer internals matter most for this product, and why?

Cover:

- tokenization
- attention cost
- RoPE or positional behavior
- GQA or MQA vs MHA
- KV cache
- constrained decoding or structured output behavior

### Strong Answer Signals

- explains mechanisms in terms of product behavior and cost, not only architecture trivia
- connects tokenization to context usage and code-heavy traffic
- explains why KV cache and GQA matter for serving economics
- distinguishes “supports long context” from “serves long context cheaply”

<details>
<summary>Reviewer rubric</summary>

The strong answer makes internals legible to someone making platform decisions. The weak answer sounds like a textbook chapter with no explanation of why the product team should care.

</details>

---

## Part 2: Model Selection And Routing

### Prompt

You can choose between:

- a smaller fast model
- a larger stronger model
- a reasoning-heavy premium model
- an MoE model with higher total parameter count but lower active compute

Define a routing policy for the product.

### Strong Answer Signals

- routes by task complexity instead of parameter-count worship
- recognizes where structured output needs reliability more than raw model size
- considers latency, token cost, and context length together
- knows when MoE helps and when its operational complexity is not worth it

<details>
<summary>Reviewer rubric</summary>

A strong answer looks like product-aware model portfolio design. A weak answer says “use the biggest model for best quality” and ignores cost and throughput.

</details>

---

## Part 3: Memory And Context Reasoning

### Prompt

The team wants to enable a much larger context window because “more context is always better.”

Explain what really changes when context grows.

Include:

- prefill cost
- KV cache growth
- concurrency loss
- lost-in-the-middle behavior
- when RAG is better than just stuffing more tokens

### Strong Answer Signals

- explains quadratic or near-quadratic pressure in the right places
- knows that longer context can lower effective throughput and raise cost sharply
- distinguishes model max context from practical deployment context
- treats RAG as a possible alternative, not a universal upgrade

<details>
<summary>Reviewer rubric</summary>

The best answer makes it obvious why long context is not free. The weak answer celebrates big token windows without owning the memory and quality trade-offs.

</details>

---

## Part 4: Generation And Failure Modes

### Prompt

Three problems show up in testing:

1. JSON output is unreliable.
2. Code responses are repetitive or truncated.
3. A multilingual query uses far more tokens than expected.

Explain how tokenization, decoding policy, and output constraints could cause these failures.

### Strong Answer Signals

- links multilingual cost surprises to tokenizer behavior
- understands temperature, top-p, and constrained decoding as control surfaces
- separates sampling bugs from architecture bugs
- recognizes when the output contract needs grammar or schema constraints rather than prompt tweaks alone

<details>
<summary>Reviewer rubric</summary>

A strong answer shows operational understanding of internals at inference time. The weak answer blames the model generically and reaches for retraining with no diagnosis.

</details>

---

## Part 5: Decision Memo

### Prompt

Write the short recommendation you would send to leadership after this review.

The memo should state:

- which model characteristics matter most
- what routing policy you recommend first
- what not to optimize prematurely
- what risks should be monitored after launch

### Strong Answer Signals

- is concise and decision-oriented
- gives one clear initial strategy instead of five incompatible options
- identifies the main operational risks in plain language
- bridges internal mechanics to product and cost outcomes

<details>
<summary>Reviewer rubric</summary>

This section tests whether the candidate can translate internal understanding into decisions. A technically correct answer that cannot drive action is still incomplete.

</details>

---

## Follow-up Pressure

1. Why not just buy one premium reasoning model and use it for everything?
2. What is the first internal signal you would monitor after launch: token cost, KV cache pressure, JSON failure rate, or latency?
3. When does MoE help enough to justify the serving complexity?
4. Which internal misunderstanding causes the most expensive production mistakes?

---

## Finish Standard

A strong submission should leave you with:

- a product-facing explanation of the right internals
- a practical routing strategy
- a realistic view of context and memory cost
- a clean mapping from internal mechanisms to production failures
