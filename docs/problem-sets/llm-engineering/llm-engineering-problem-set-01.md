# Systems, Serving, and Inference Problem Set 01

## Serve, Route, And Stabilize A Production LLM Feature

| Attribute | Value |
|---|---|
| Module | Systems, Serving, and Inference |
| Difficulty | 3-4 |
| Best for | Mid-level to senior engineers working on serving, inference, and LLM product infra |
| Timebox | 90-120 minutes |
| Use with | [Systems, Serving, and Inference](../../modules/systems-serving-and-inference.md) and [Systems, Serving, and Inference Batch 01](../../question-library/systems-serving-and-inference/systems-serving-and-inference-batch-01.md) |

---

## Scenario

Your team is launching a writing assistant used by internal support and sales teams.

The feature must:

- stream responses in real time
- produce structured JSON for downstream automation
- stay within a daily budget cap
- fail over cleanly when an external provider rate-limits
- keep p99 latency below 5 seconds for interactive requests

The current prototype works for demos but breaks under concurrency and cost pressure.

## What You Should Produce

1. A serving design for the first production release.
2. A model-routing and fallback policy.
3. A structured-output reliability plan.
4. A cost and latency control plan.
5. A debugging path for one major production regression.

---

## Part 1: Serving Pass

### Prompt

Design the inference path for interactive traffic.

Be explicit about:

- serving stack choice
- batching policy
- streaming transport
- token budget management
- observability for latency and throughput

### Strong Answer Signals

- distinguishes TTFT from total latency
- uses continuous batching or explains scheduler behavior clearly
- treats streaming as both UX and resource-management behavior
- reserves explicit output-token budget
- logs enough to debug queue time, prefill time, and generation time separately

<details>
<summary>Reviewer rubric</summary>

A strong answer names the operating constraints, not just the tools. The weak answer says “use vLLM” without any capacity math, latency decomposition, or cancellation behavior.

</details>

---

## Part 2: Routing And Fallback Pass

### Prompt

You have three routes available:

- a self-hosted open-weight model for low-cost traffic
- a stronger external model for high-complexity requests
- a cheaper backup provider for outages or quota exhaustion

Design the router and fallback chain.

### Strong Answer Signals

- defines complexity classification, not just a static model preference
- uses circuit breakers or health-state tracking
- considers prompt compatibility across providers
- explains where privacy or compliance changes the route choice
- includes a failure mode where the primary provider partially degrades instead of fully failing

<details>
<summary>Reviewer rubric</summary>

The router should act like a policy engine. The weak answer is just “retry another provider” with no health model, no quality guard, and no cost reasoning.

</details>

---

## Part 3: Structured Output Pass

### Prompt

The product needs JSON output for workflow automation. A 1% parse failure is unacceptable because it breaks downstream processing.

Describe your reliability plan.

### Strong Answer Signals

- prioritizes constrained generation or schema-aware decoding when available
- validates schema separately from JSON syntax
- handles truncation, markdown wrappers, and extra text
- returns a safe failure path instead of crashing downstream services
- measures structure failures and semantic failures separately

<details>
<summary>Reviewer rubric</summary>

The strong answer treats structured output as an interface contract. The weak answer relies only on prompt wording and assumes the model will behave.

</details>

---

## Part 4: Cost And Latency Pass

### Prompt

Costs suddenly jump 3x with no traffic increase, and p99 latency drifts above the SLA during peak hours.

Explain how you would:

- detect the cause
- isolate whether the issue is prompt growth, longer outputs, routing drift, or queue buildup
- add guardrails so it cannot repeat silently

### Strong Answer Signals

- tracks input tokens, output tokens, model choice, and cost per endpoint
- decomposes latency into queue, TTFT, generation, and post-processing
- proposes one hard budget control, not only dashboards
- recognizes that routing policy can affect both cost and p99

<details>
<summary>Reviewer rubric</summary>

This is an operations answer. If the candidate cannot explain how to localize spend growth to a feature, route, or token pattern, they are not ready to own production LLM cost.

</details>

---

## Part 5: Debugging Pass

### Prompt

After a model update, throughput drops 40% on the same GPUs. Diagnose the issue before rolling back.

### Strong Answer Signals

- checks configuration drift, especially max context length and KV allocation
- compares startup logs and model config, not just dashboard symptoms
- understands how context length can collapse concurrency
- reruns the same benchmark with explicit settings before blaming the serving framework

<details>
<summary>Reviewer rubric</summary>

The strong answer isolates config and model changes before assuming infra failure. The weak answer immediately rolls back with no diagnosis and learns nothing.

</details>

---

## Follow-up Pressure

1. What do you cut first when p99 is bad: context length, reranking, output tokens, or provider choice?
2. When is a slower but more reliable JSON path worth the latency hit?
3. How do you separate interactive and batch traffic so they do not damage each other?
4. What metrics would you show leadership weekly: cost, quality, latency, or all three? Why?

---

## Finish Standard

A strong submission should leave you with:

- a serving design that matches the traffic pattern
- a real fallback strategy rather than hopeful retries
- a defensible structured-output contract
- explicit cost and latency guardrails
- a debugging mindset grounded in evidence instead of guesswork
