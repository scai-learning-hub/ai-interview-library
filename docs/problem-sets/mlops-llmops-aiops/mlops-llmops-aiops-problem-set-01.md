# MLOps / LLMOps / AIOps Problem Set 01

## Operate, Detect, And Recover A Failing AI Production Stack

| Attribute | Value |
|---|---|
| Module | MLOps / LLMOps / AIOps |
| Difficulty | 3-4 |
| Best for | Platform, infra, and senior engineers owning AI systems in production |
| Timebox | 90-120 minutes |
| Use with | [MLOps / LLMOps / AIOps](../../modules/mlops-llmops-aiops.md) and [MLOps / LLMOps / AIOps Batch 01](../../question-library/mlops-llmops-aiops/mlops-llmops-aiops-batch-01.md) |

---

## Scenario

Your company runs three AI surfaces in production:

- a tabular fraud model
- a RAG assistant for internal support
- an agent-driven remediation assistant for ops teams

Over the last two weeks:

- the fraud model’s precision dropped quietly
- the RAG assistant started citing stale content
- the agent assistant doubled its token spend and triggered too many low-value alerts

Leadership wants one operational plan, one observability model, and one incident process that can cover all three systems without pretending they are identical.

## What You Should Produce

1. A platform operating model that separates MLOps, LLMOps, RAGOps, AgentOps, and AIOps correctly.
2. A telemetry design covering metrics, traces, logs, evaluations, and rollback data.
3. A drift and regression detection plan for the three system types.
4. An incident-response flow for silent quality degradation.
5. A governance and rollout model that can stop bad changes before they spread.

---

## Part 1: Operational Scoping

### Prompt

Define what belongs to:

- MLOps
- LLMOps
- RAGOps
- AgentOps
- AIOps

Then explain what should be shared across these layers and what should stay specialized.

### Strong Answer Signals

- recognizes shared platform primitives like tracing, rollout control, and registry patterns
- avoids pretending one metric set or one playbook fits every AI system
- distinguishes prompt and retrieval versioning from classical model versioning
- treats AIOps as assistance for operators, not autonomous replacement

<details>
<summary>Reviewer rubric</summary>

The strong answer builds a platform with shared control surfaces and specialized operating signals. The weak answer throws every concern into one generic “AI monitoring” bucket.

</details>

---

## Part 2: Observability Stack

### Prompt

Design the observability stack for these three systems.

Cover:

- metrics
- structured logs
- traces
- evaluation signals
- version lineage
- alert routing

### Strong Answer Signals

- separates feature metrics from model metrics and business metrics
- uses end-to-end traces for LLM and agent flows, not only point metrics
- records enough lineage to answer “what version caused this?” quickly
- keeps alert routing explicit so the right team owns the right failure

<details>
<summary>Reviewer rubric</summary>

A strong answer can trace from a production symptom back to model, prompt, index, tool, or rollout version. A weak answer says “ship logs to Datadog” and stops there.

</details>

---

## Part 3: Drift And Regression Detection

### Prompt

For each of the three production surfaces, define:

- what drift means
- how it is detected
- what evidence is needed before action
- whether rollback, retraining, re-indexing, or prompt adjustment is the right first response

### Strong Answer Signals

- distinguishes data drift, concept drift, retrieval freshness failure, and prompt or policy regression
- avoids using the same detection method for tabular ML and generative systems
- ties alerts to action thresholds instead of producing endless noise
- knows that some regressions require rollback while others require investigation before rollback

<details>
<summary>Reviewer rubric</summary>

The key test is operational judgment. Good answers know that not every drift alert means retrain now, and not every LLM regression is a model issue.

</details>

---

## Part 4: Incident Response

### Prompt

You need one incident flow for silent degradation across these AI systems.

Describe:

- how incidents are detected
- how ownership is assigned
- how rollback or containment is decided
- how evidence is preserved for postmortem
- how new tests are created from production failures

### Strong Answer Signals

- uses severity and blast radius, not only technical root cause, to prioritize incidents
- distinguishes local rollback from platform-wide rollback
- preserves traces, prompts, retrieved chunks, tool paths, and model versions for forensics
- feeds incident learnings back into eval and release gates

<details>
<summary>Reviewer rubric</summary>

Strong answers understand that silent degradation is the main enemy. The incident flow must catch quality decay before customers or operators fully lose trust.

</details>

---

## Part 5: Governance And Release Control

### Prompt

Define the minimum governance model for releasing changes to:

- model versions
- prompt versions
- retrieval indexes
- tool policies
- automation runbooks

### Strong Answer Signals

- names explicit release gates and owners
- includes canary or staged rollout behavior
- includes rollback readiness before release, not after
- treats auditability as an operating requirement rather than a compliance afterthought

<details>
<summary>Reviewer rubric</summary>

Good answers balance speed with control. Weak answers either create no governance or create so much ceremony that no team can ship improvements.

</details>

---

## Follow-up Pressure

1. How do you keep alerting from becoming background noise?
2. Which signals should block release immediately, and which should only trigger investigation?
3. When is full rollback safer than local containment?
4. How do you show leadership that the platform is improving, not just producing more dashboards?

---

## Finish Standard

A strong submission should leave you with:

- a clean separation between AI ops disciplines
- an observability model that supports real diagnosis
- a realistic incident-response flow for silent degradation
- actionable release gates and rollback rules
- an operating model that can scale beyond a single team or one AI surface
