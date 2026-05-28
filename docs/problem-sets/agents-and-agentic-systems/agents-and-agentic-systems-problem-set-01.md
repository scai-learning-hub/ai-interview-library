# Agents and Agentic Systems Problem Set 01

## Design, Bound, And Recover A Tool-Using Support Agent

| Attribute | Value |
|---|---|
| Module | Agents and Agentic Systems |
| Difficulty | 3-4 |
| Best for | Mid-level to senior engineers building agentic product flows |
| Timebox | 90-120 minutes |
| Use with | [Agents and Agentic Systems](../../modules/agents-and-agentic-systems.md) and [Agents and Agentic Systems Batch 01](../../question-library/agents-and-agentic-systems/agents-and-agentic-systems-batch-01.md) |

---

## Scenario

Your team wants to launch a support operations agent that can:

- read account context and ticket history
- search the knowledge base
- draft a response to the customer
- create or update internal tickets when needed
- escalate risky or ambiguous cases to a human

The prototype works in happy-path demos but has three real problems:

- it sometimes loops between tools without making progress
- it occasionally drafts unsafe actions without enough evidence
- it is slower and more expensive than the deterministic workflow it is trying to replace

## What You Should Produce

1. A design that explains whether this should be an agent, a workflow, or a hybrid.
2. A bounded tool and state model for the first production version.
3. A reliability plan for tool failures, loops, and unsafe actions.
4. An observability and evaluation plan for launch.
5. A human-in-the-loop policy that is strict enough to be safe without killing the product.

---

## Part 1: Architecture Decision

### Prompt

Should this product be implemented as:

- a deterministic workflow
- a tool-using agent
- a supervisor plus specialists
- a hybrid system

Choose one and justify it.

### Strong Answer Signals

- starts by separating predictable work from truly dynamic work
- explains where a deterministic path is cheaper and safer
- does not default to multi-agent unless decomposition is clearly justified
- names the cost, latency, auditability, and debugging trade-offs

<details>
<summary>Reviewer rubric</summary>

The strongest answer is usually hybrid: deterministic routing and approval boundaries with agentic behavior only where dynamic tool choice or synthesis is actually needed. Weak answers declare “use an agent” without proving why a workflow is insufficient.

</details>

---

## Part 2: Tool And State Design

### Prompt

Define the first production-safe tool set and the state the system must track across a task.

Include:

- read-only vs side-effecting tool split
- required tool argument validation
- state fields needed for retries and checkpoints
- budget controls for time, tokens, and tool calls

### Strong Answer Signals

- distinguishes information-gathering tools from mutation tools
- validates IDs, enums, and side-effecting arguments before execution
- tracks state explicitly instead of relying only on chat history
- includes maximum iteration or budget rules to stop runaway behavior

<details>
<summary>Reviewer rubric</summary>

A good answer treats the tool boundary as the trust boundary. The weak answer gives broad tool access and assumes the model will use it responsibly.

</details>

---

## Part 3: Failure And Recovery

### Prompt

Three incidents happen in week one:

1. The agent loops between knowledge-base search and ticket lookup.
2. A required tool call fails halfway through a task.
3. The agent proposes a ticket update based on ambiguous evidence.

Describe your diagnosis and recovery sequence for each.

### Strong Answer Signals

- uses a structured loop-detection or progress-detection rule
- falls back or escalates when required tools fail instead of retrying forever
- inserts approval gates before side-effecting actions under ambiguity
- adds prevention after the incident, not only a one-off fix

<details>
<summary>Reviewer rubric</summary>

The strong answer isolates each failure to the plan, tool layer, state layer, or policy layer. The weak answer says “improve the prompt” for every incident.

</details>

---

## Part 4: Human-In-The-Loop Policy

### Prompt

Define where a human must approve, review, or take over.

Your answer should cover:

- risky side effects
- low-confidence cases
- repeated failure loops
- contradictory tool evidence
- time-budget exhaustion

### Strong Answer Signals

- explains escalation triggers clearly
- balances safety with operator burden
- knows that too much HITL destroys throughput and too little creates risk
- ties approval rules to action type and evidence quality

<details>
<summary>Reviewer rubric</summary>

Look for explicit decision rules, not vague references to “a human can review if needed.” Good systems know when they are outside their safe operating envelope.

</details>

---

## Part 5: Observability And Launch Gate

### Prompt

Define the launch dashboard and minimum release gate for this agent.

Include:

- trajectory metrics
n- tool success and failure metrics
- budget overrun metrics
- escalation metrics
- quality and safety checks
- rollback conditions

### Strong Answer Signals

- logs every step in the trajectory with timestamps and tool results
- measures loop rate, average steps per task, and budget overrun rate
- distinguishes successful completion from safe escalation
- names a rollback condition tied to safety or cost, not just latency

<details>
<summary>Reviewer rubric</summary>

A strong launch gate recognizes that agent success is not only “did it answer?” but also “did it stay inside its policy and cost envelope?”

</details>

---

## Follow-up Pressure

1. Why not replace the whole design with a deterministic workflow?
2. When does a supervisor pattern help, and when is it pure overhead?
3. How do you measure whether memory is helping instead of adding noise?
4. What is your blast-radius plan if a side-effecting tool is misused?

---

## Finish Standard

A strong submission should leave you with:

- a justified boundary between workflow and agent behavior
- a safe and observable tool model
- a concrete recovery plan for loops, failures, and ambiguity
- a human escalation policy that is operationally realistic
- a launch gate tied to safety, cost, and task success together
