# Senior / Architect / AI Systems Lead

Role family: Senior / Architect · Primary bands: 8–12 yr, 12–20 yr

## Who This Role Is For

- Staff and principal engineers shaping AI systems strategy
- AI platform leads responsible for cross-team infrastructure
- Senior ICs or architects defining company-wide AI approaches
- Technical leaders balancing product, platform, and governance concerns

## Typical Strengths

- Broad systems judgment and architecture thinking
- Cross-team coordination and technical leadership
- Platform reasoning and organizational trade-offs
- Reliability, cost, and risk awareness

## Typical Gaps

- Current-generation model details if not hands-on recently
- Newer protocol and ecosystem nuance (MCP, A2A, evolving agent patterns)
- Modern retrieval and agent-specific failure modes
- Current serving stack details (vLLM innovations, quantization methods)

---

## What Companies Expect by Band

### 8–12 yr (staff / senior architect)
- Realistic architecture answers, not encyclopedic topic recall
- Defines system boundaries, control surfaces, rollback paths
- Can design governance posture and cost models for AI systems
- Understands where AI adds value and where it adds risk
- Can navigate build-vs-buy-vs-partner decisions

### 12–20 yr (principal / distinguished / CTO-adjacent)
- Sets AI strategy at organizational level: what to invest in, what to defer, what to avoid
- Can evaluate emerging technology with realistic adoption timelines
- Defines operating model for AI across multiple teams and products
- Connects technical architecture to business outcomes, risk, and compliance
- Trusted to make high-stakes decisions about AI infrastructure and governance

---

## What Distinguishes Good from Great

| Good | Great |
|---|---|
| Can design a system architecture | Can explain why this architecture and not three alternatives |
| Knows RAG, agents, and serving | Can reason about when each should NOT be used |
| Makes build-vs-buy recommendations | Includes operational burden, team capability, and timeline in the analysis |
| Designs for performance | Designs for failure: rollback, fallback, degradation, incident response |
| Understands governance conceptually | Can specify concrete governance controls: SLOs, audit trails, cost attribution, compliance gates |
| Answers "what would you do?" | Answers "what would you NOT do, and why?" |

---

## What To Study First

1. [Role Experience Matrix](../role-experience-matrix.md) — understand the full landscape you are connecting
2. [Topic Graph](../topic-graph.md) — prerequisite map for reasoning about team skill gaps
3. [Systems, Serving, and Inference](../modules/systems-serving-and-inference.md) — serving economics and infrastructure
4. [MLOps / LLMOps / AIOps](../modules/mlops-llmops-aiops.md) — operational lifecycle and governance
5. [RAG](../modules/rag.md) — most common system you will need to architect
6. [Agents and Agentic Systems](../modules/agents-and-agentic-systems.md) — increasingly in architecture scope

## What Can Be Skipped Initially

- Low-level implementation trivia outside the role's hands-on surface area
- Exhaustive architecture histories
- Niche framework APIs unless central to the target company
- Deep RLHF math (focus on strategic implications instead)
- Detailed CV architecture comparisons (unless relevant to the specific org)

---

## Key Interview Rounds

| Round | What Is Tested | Common Format |
|---|---|---|
| System design | End-to-end AI system architecture | 60–90 min whiteboard |
| Architecture strategy | Platform decisions, build vs buy, technology selection | Discussion with follow-ups |
| Debugging/incident | Root cause analysis at scale, incident recovery | Scenario-based |
| Governance/operating model | Compliance, SLOs, cost attribution, team boundaries | Discussion |
| Leadership | Cross-team coordination, technical decision-making | Behavioral + situational |

## Typical Failure Points

- Broad but stale answers on modern LLM/RAG/agent systems
- Architecture that ignores org capability and operating burden
- Generic statements about governance without concrete controls
- Answers that optimize local technical elegance over rollout reality
- Not acknowledging uncertainty in rapidly evolving areas
- Over-investing in technology selection, under-investing in operational design

## Expanded Failure Mode Catalog

| Failure | Why It Happens | How To Fix |
|---|---|---|
| Architecture is technically sound but team can't operate it | Doesn't factor in team maturity and skills | Include operational burden in architecture proposals |
| Recommends agents everywhere | Doesn't distinguish agent benefit from agent complexity | Study Agents module: core distinctions, when NOT to use agents |
| Governance is hand-waved | Has not designed concrete controls | Study MLOps module: SLOs, audit trails, cost attribution, rollback |
| Stale on serving details | Hasn't kept up with vLLM, quantization, routing advances | Refresh Systems/Serving module |
| Cannot reason about cost at scale | Focuses on correctness, not economics | Study serving economics: cost per token, GPU ROI, routing optimization |
| Architecture lacks fallback/degradation | Optimistic design without failure planning | Add failure modes to every architecture discussion |

---

## Recommended Modules in Order

1. [Transformer and Modern LLM Internals](../modules/transformer-and-modern-llm-internals.md)
2. [RAG](../modules/rag.md)
3. [Agents and Agentic Systems](../modules/agents-and-agentic-systems.md)
4. [Agent Protocols](../modules/agent-protocols-mcp-a2a-acp.md)
5. [Systems, Serving, and Inference](../modules/systems-serving-and-inference.md)
6. [MLOps / LLMOps / AIOps](../modules/mlops-llmops-aiops.md)
7. [Alignment / Post-Training](../modules/alignment-post-training.md)

## Recommended Difficulty Progression

- Skip most Difficulty 1 work unless rusty
- Focus on System, Debugging, and Architect material
- Use Concept material only to refresh weak or stale areas

## 30-Day Prep Strategy

| Days | Focus | Key Activities |
|---|---|---|
| 1–7 | Refresh transformer, retrieval, and serving realities | KV cache, vLLM, quantization, RAG architecture, cost math |
| 8–14 | Architecture and ops for RAG and agents | Agent patterns, tool safety, RAGOps, AgentOps |
| 15–21 | Governance, rollout, fallback, observability, protocol fit | SLOs, cost attribution, compliance, MCP/A2A awareness |
| 22–28 | Mock system design and incident-review drills | End-to-end architecture, failure mode analysis, governance scenarios |
| 29–30 | Self-assessment and gap filling | Address weakest areas identified during mock practice |

## 90-Day Mastery Path

| Month | Focus | Outcome |
|---|---|---|
| 1 | Refresh technical substrate | Up-to-date on model internals, serving, and retrieval |
| 2 | Deepen platform and operations architecture | Can design and critique operational architecture for AI systems |
| 3 | Harden organization-level reasoning | Can define governance, cost models, and risk trade-offs at scale |

## Best First Question Sets

- [System Design question bank](../../modules/09_system_design/) — architecture, serving, inference
- [LLMOps question bank](../../modules/06_llmops/) — operations, observability, governance
- [Agentic AI question bank](../../modules/05_agentic_ai/) — agents, protocols, governance

## Cross-References

- [Role Index](../indexes/role-index.md) — all role families with depth matrices
- [Experience Index](../indexes/experience-index.md) — band expectations across all roles
- [Module Index](../indexes/module-index.md) — full module sequence and detail cards
- [Topic Graph](../topic-graph.md) — prerequisite map for study planning
