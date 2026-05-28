# Agents and Agentic Systems

Topic family H · Prerequisites: Tool calling, structured outputs, control flow reasoning · Unlocks: Agent Protocols, AgentOps, multi-agent governance

This module covers the difference between tool use, workflows, and full agentic systems. It is intentionally biased toward reliability, control, and production realism.

---

## Scope

- Tool calling and function calling
- Planners and planning strategies
- State and memory (short-term, long-term)
- Supervisors and orchestration
- Reflection / critique patterns
- Retries and error recovery
- Human-in-the-loop (HITL)
- Multi-agent architectures
- Governance and safety
- Bounded autonomy
- Budget and resource controls

## Why This Module Matters

Agents are easy to overstate. Interviews increasingly test whether candidates understand where agents add leverage and where they add avoidable complexity, latency, and failure surface.

---

## Subtopic Breakdown

### Tool Calling and Function Calling
- How LLMs invoke external tools: structured output → parse → execute → return result
- Tool schemas: defining parameters, return types, descriptions
- Read-only vs side-effecting tools: critical safety distinction
- Tool selection: how models choose which tools to use
- Error handling: what happens when a tool fails, times out, or returns unexpected results
- **Interview focus:** Can you design a tool interface that is safe, observable, and recoverable?

### Planning Strategies
- ReAct: Reasoning + Acting interleaved — think, act, observe loop
- Plan-then-execute: generate full plan, then execute steps sequentially
- Iterative refinement: partial plan, execute, observe, revise
- When planning helps: complex multi-step tasks with uncertain intermediate results
- When planning hurts: over-planning on simple tasks, fragile plans that break at step 2
- **Interview test:** Can you explain when a workflow is better than a planner?

### State and Memory
- Short-term memory: conversation history, recent tool results, scratchpad
- Long-term memory: persistent storage of facts, preferences, prior interactions
- Memory management: what to store, when to summarize, when to forget
- Context window as implicit memory: limitations and overflow handling
- Vector-based retrieval memory: using embeddings to find relevant prior context
- **Critical insight:** Memory is not "store everything" — it is a retrieval and relevance problem

### Orchestration and Supervisors
- Single-agent orchestration: one model with tool access and loop control
- Supervisor pattern: a coordination agent that delegates to specialized sub-agents
- Router pattern: classify input and route to appropriate handler (not always an agent)
- When to use a supervisor: tasks requiring coordination across different capabilities
- When NOT to use a supervisor: simple routing that can be done with rules

### Reflection and Critique
- Self-evaluation: model reviews its own output and decides to revise or proceed
- Critique agents: separate model instance that evaluates quality
- Reflection loops: generate → evaluate → revise → re-evaluate
- Diminishing returns: when additional reflection steps stop improving quality
- **Interview focus:** Reflection is not a reliability guarantee — it is a heuristic

### Error Recovery and Retries
- Graceful degradation: what to do when a tool fails mid-plan
- Retry strategies: immediate retry, backoff, alternative tool, fallback to simpler approach
- Dead loop detection: recognizing when an agent is stuck in a cycle
- Budget enforcement: maximum tool calls, token limits, wall-clock time limits
- Escalation: when to hand off to a human or a deterministic system

### Human-in-the-Loop (HITL)
- Approval gates: require human approval before side-effecting actions
- Correction interfaces: let humans fix intermediate results before continuing
- Escalation triggers: confidence thresholds, risk levels, novel situations
- HITL frequency: too much defeats the purpose, too little creates risk
- **Design principle:** The system should know when it does not know

### Multi-Agent Systems
- When multi-agent helps: clear decomposition boundaries, different tool sets, different safety levels
- When multi-agent hurts: added orchestration complexity, harder debugging, unpredictable interactions
- Communication patterns: shared state, message passing, structured handoffs
- Agent identity: who is responsible for each action? (audit trail)
- **Maturity signal:** Candidates who can explain when NOT to use multi-agent show deeper understanding

### Governance and Safety
- Side-effect safety: preventing unintended mutations (database writes, API calls, financial transactions)
- Action whitelisting: restricting what tools agents can access
- Audit trails: logging every decision, tool call, and result for review
- Budget controls: token spend, API call limits, wall-clock time limits
- Containment: what happens when an agent goes wrong — blast radius and recovery

---

## Core Distinctions

| Pattern | What It Is | When It Fits |
|---|---|---|
| Workflow | Fixed control flow with LLM steps | Stable, well-bounded business processes |
| Tool-using assistant | One model calls external tools | Retrieval, actions, and structured workflows with low orchestration complexity |
| Agent | Non-trivial loop over planning, acting, observing | Open-ended tasks with uncertain next steps |
| Multi-agent system | Multiple specialized agents coordinate | Only when decomposition, ownership, or modality boundaries justify it |

---

## What Interviewers Test by Band

### 0–2 years
- Understand tool calling and basic loops
- Can explain the difference between a workflow and an agent
- Knows what structured outputs are and why they matter for tool calling

### 2–5 years
- Implement agent patterns: memory, retries, safety bounds
- Can design a tool interface with error handling
- Understands when an agent is overkill vs when it adds value

### 5–8 years
- Design coordination: supervisor patterns, observability, degradation
- Can explain human override design and escalation triggers
- Can debug agent loops and identify root cause of stuck or runaway behavior

### 8+ years
- Define where agents belong in product and platform strategy
- Design multi-agent governance: who owns what, audit trails, budget controls
- Can reason about agent risk at org level

---

## Depth Ladder

| Level | What Good Looks Like | What Answers Should NOT Be |
|---|---|---|
| Concept | Understands agent vs workflow distinction, tool calling mechanics | Treating all LLM applications as "agents" |
| Applied | Can build a safe, observable agent with tools, memory, and error handling | Implementing a loop without budget controls or escalation |
| System | Can design agent orchestration for production with observability and fallbacks | Describing agent behavior without discussing failure modes |
| Debugging | Can isolate agent failures: tool errors, planning loops, memory overflow, budget exhaustion | "The agent got confused" without specific diagnosis |
| Architect | Can define agent strategy for a product: where agents fit, where workflows fit, where rules fit | Recommending agents everywhere without justifying orchestration complexity |

---

## Anti-Patterns and Weak Answers

- Treating multi-agent as the default upgrade path
- Ignoring side-effect safety in tools
- Treating memory as "store everything"
- Confusing reflection prompts with actual reliability strategy
- Omitting escalation paths to humans or deterministic systems
- Building agents when a workflow with conditional branches would suffice
- Not setting budget limits (token, time, API call) on autonomous behavior
- Discussing planning without acknowledging that most real-world plans break early

---

## Role Relevance

| Role | Depth Needed | Focus Areas |
|---|---|---|
| LLM / RAG / Agent | ★★★ | Full coverage: tool calling, planning, memory, evaluation, orchestration |
| Senior / Architect | ★★★ | Strategy, governance, multi-agent trade-offs, organizational fit |
| Platform AI | ★★ | Infrastructure for agent execution, observability, budget controls |
| Software → AI | ★★ | Tool calling, structured outputs, basic agent patterns |
| DevOps → AIOps | ★★ | Agent failure modes, operational monitoring, escalation |
| Data / ML | ★ | Agent evaluation, data quality for tool results |
| Research | ★ | Agent architecture research, planning methods |
| DL / CV | ★ | Awareness only |

---

## What To Study Next

- [Agent Protocols: MCP / A2A / ACP](./agent-protocols-mcp-a2a-acp.md) — protocol layer for agent interoperability
- [RAG](./rag.md) — retrieval integration in agent pipelines
- [Systems, Serving, and Inference](./systems-serving-and-inference.md) — serving agents in production
- [MLOps / LLMOps / AIOps](./mlops-llmops-aiops.md) — AgentOps and operational monitoring

## Question Bank

Practice questions for this module are in the [Agentic AI question bank](../../modules/05_agentic_ai/):
- [Concept questions](../../modules/05_agentic_ai/concept.md)
- [Applied questions](../../modules/05_agentic_ai/applied.md)
- [System questions](../../modules/05_agentic_ai/system.md)
- [Debugging questions](../../modules/05_agentic_ai/debugging.md)

## Practice Surface

- [Batch 01 question library](../question-library/agents-and-agentic-systems/agents-and-agentic-systems-batch-01.md) — targeted interview drilling by question
- [Problem Set 01](../problem-sets/agents-and-agentic-systems/agents-and-agentic-systems-problem-set-01.md) — end-to-end agent design, recovery, and launch practice

## Cross-References

- [Module Index](../indexes/module-index.md) — all modules with sequences and detail cards
- [Experience Index](../indexes/experience-index.md) — depth expectations by career band
- [Tag Index](../indexes/tag-index.md) — related tags: `tool-calling`, `planning`, `memory`, `supervisor`, `multi-agent`, `human-in-the-loop`, `reflection`, `budget-control`, `side-effect-safety`
- [Topic Graph](../topic-graph.md) — prerequisite map
