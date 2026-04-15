# Agent Protocols: MCP / A2A / ACP

Topic family I · Prerequisites: Agent architecture, distributed systems trust · Unlocks: Platform-level agent governance, protocol-aware system design

This module covers the protocol and interoperability layer for tool-rich and agent-rich systems. It is intentionally written with nuance because this ecosystem is still evolving.

---

## Scope

- MCP (Model Context Protocol)
- A2A (Agent-to-Agent)
- ACP (Agent Communication Protocol)
- Where each fits
- Local tools vs remote agents
- Discovery and capability advertisement
- Delegation and task routing
- Identity, trust, and security
- Complement vs overlap
- Protocol governance in enterprise settings

## Why This Module Exists

As agent systems move from demos to production, the question of how agents access tools and communicate with each other becomes an infrastructure and governance problem, not just an implementation detail.

---

## Protocol Deep Dives

### MCP (Model Context Protocol)
- **Primary fit:** Model-to-tool and client-to-capability interface
- **How it works:** Standardized protocol for models to discover and invoke tools, access data sources, and interact with services
- **Key patterns:** Tool registration, capability discovery, schema-based invocation, result return
- **Security considerations:** Tool access control, input validation, output sanitization
- **2026 status:** Highest maturity and adoption among the three protocols
- **When to use:** Local tool access, structured integrations, IDE/app tool ecosystems
- **Interview focus:** Understanding the tool invocation pattern, security boundaries, and when MCP simplifies vs overcomplicates

### A2A (Agent-to-Agent)
- **Primary fit:** Agent-to-agent communication, delegation, and coordination
- **How it works:** Defines how one agent discovers, communicates with, and delegates tasks to another agent
- **Key concepts:** Agent cards (capability advertisement), task lifecycle, streaming results, push notifications
- **Security considerations:** Agent identity, delegation trust chains, task authorization
- **2026 status:** Growing adoption, important for multi-agent enterprise systems
- **When to use:** When agents need to delegate work to other agents across boundaries (team, service, or capability boundaries)
- **Interview focus:** When delegation adds value vs when it adds opaque complexity

### ACP (Agent Communication Protocol)
- **Primary fit:** Agent control, interoperability patterns, broader communication standards
- **2026 status:** Still evolving, less production-stable than MCP or A2A
- **When to discuss:** When the interview specifically covers agent ecosystem design or protocol comparison
- **Interview approach:** Acknowledge maturity level, discuss the problem it aims to solve, do not overclaim adoption

### When to Use Which

| Scenario | Best Protocol | Why |
|---|---|---|
| Model needs to call a database, API, or local tool | MCP | Tool access pattern, local invocation |
| Agent needs to hand off a task to a specialized remote agent | A2A | Cross-agent delegation and coordination |
| Building a platform where multiple agent types must interoperate | A2A + MCP | MCP for tools, A2A for agent-agent |
| Designing future-proof agent interoperability | Monitor ACP | Still maturing, not production-proven |

---

## Subtopic Breakdown

### Discovery and Capability Advertisement
- How agents and tools advertise what they can do
- Agent cards: structured descriptions of capabilities, constraints, and trust levels
- Tool schemas: parameter definitions, return types, descriptions
- Dynamic vs static discovery: runtime negotiation vs pre-configured registries

### Delegation and Task Routing
- Simple delegation: "do this task and return the result"
- Complex delegation: multi-step tasks with intermediate results and status updates
- Delegation chains: agent A delegates to agent B, which delegates to agent C — trust propagation
- Task lifecycle: pending → in-progress → completed/failed — state management across agents

### Identity, Trust, and Security
- Agent identity: how to verify who is making requests
- Trust boundaries: what an agent is allowed to do and access
- Delegation trust: should agent B trust that agent A is authorized to make this request?
- Audit requirements: logging every delegation, tool call, and result for compliance
- **Enterprise focus:** In production, identity and audit often matter more than protocol choice

### Complement vs Overlap
- MCP and A2A complement each other: tools vs agents are different patterns
- Some overlap exists in capability discovery and invocation patterns
- Protocol selection should be driven by the interaction pattern, not vendor lock-in
- **Interview maturity signal:** Acknowledging that these protocols address different layers of the same system

---

## What Interviewers Test by Band

### 0–2 years
- Knows what MCP is conceptually and why tool access needs a protocol
- Can explain the difference between calling a tool and delegating to an agent

### 2–5 years
- Can compare MCP and A2A in terms of use case, maturity, and trade-offs
- Understands discovery-delegation-trust as connected concerns
- Can explain security implications of remote tool access

### 5–8 years
- Can design a protocol strategy for a multi-agent system
- Understands enterprise requirements: identity, audit, access control across protocols
- Can explain when protocol choice matters and when orchestration design matters more

### 8+ years
- Can define platform-level protocol governance
- Can advise on protocol adoption timing: what to use now, what to watch, what to avoid
- Can connect protocol architecture to organizational trust boundaries

---

## Depth Ladder

| Level | What Good Looks Like |
|---|---|
| Concept | Can explain what each protocol does and when each is the right choice |
| Applied | Can design a tool or agent integration using the appropriate protocol |
| System | Can reason about trust, identity, and audit across protocol boundaries |
| Debugging | Can diagnose delegation failures, discovery mismatches, and trust chain issues |
| Architect | Can define protocol governance and adoption strategy for an org |

---

## Anti-Patterns and Weak Answers

- Acting as if all three are stable and equally adopted
- Treating protocol choice as more important than trust, identity, and audit boundaries
- Ignoring the difference between tool invocation and delegated agency
- Assuming protocol adoption automatically solves orchestration design
- Describing MCP without security considerations
- Discussing A2A without addressing delegation trust chains
- Not acknowledging that ACP is still maturing

---

## Role Relevance

| Role | Depth Needed | Focus Areas |
|---|---|---|
| LLM / RAG / Agent | ★★★ | MCP tools, A2A delegation, security, integration patterns |
| Senior / Architect | ★★ | Protocol strategy, governance, trust boundaries |
| Platform AI | ★★ | Infrastructure for protocol support, multi-agent platform design |
| Software → AI | ★ | MCP tool integration, basic protocol awareness |
| DevOps → AIOps | ★ | Security and audit concerns, operational protocol monitoring |
| Data / ML | ★ | Awareness of tool and agent interfaces |
| Research | ★ | Protocol design research, agent communication patterns |
| DL / CV | — | Not typically relevant |

---

## What To Study Next

- [Agents and Agentic Systems](./agents-and-agentic-systems.md) — the agent patterns these protocols serve
- [Systems, Serving, and Inference](./systems-serving-and-inference.md) — infrastructure for agent and tool serving
- [MLOps / LLMOps / AIOps](./mlops-llmops-aiops.md) — AgentOps and operational protocol monitoring

## Question Bank

Practice questions for agent protocols are included within the [Agentic AI question bank](../../modules/05_agentic_ai/).

## Cross-References

- [Module Index](../indexes/module-index.md) — all modules with sequences and detail cards
- [Experience Index](../indexes/experience-index.md) — depth expectations by career band
- [Tag Index](../indexes/tag-index.md) — related tags: `mcp`, `a2a`, `acp`, `discovery`, `delegation`, `trust`, `identity`, `protocol-fit`, `audit`, `capability-card`
- [Topic Graph](../topic-graph.md) — prerequisite map
