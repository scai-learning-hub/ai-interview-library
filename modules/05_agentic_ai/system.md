# Module 05 — Agentic AI: System Level

---

## Q-05-S-001: Design a production multi-agent orchestration platform that handles 1000+ concurrent agent sessions.

**Module:** Agentic AI
**Submodule:** Multi-Agent Orchestration
**Level:** System
**Difficulty:** 5
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, DevOps / SRE → AIOps
**Tags:** [agents, multi-agent, orchestration, scaling, architecture, production]
**Prerequisites:** Q-05-A-008, Q-05-A-010, Q-09-C-001
**Estimated Interview Round:** System Design
**Why This Question Matters:** Scaling agents from a single conversation to thousands of concurrent sessions requires careful architecture — managing state, resource allocation, and fault isolation.

---

**Question**

Design a platform that runs 1000+ concurrent agent sessions, each potentially involving multiple specialist sub-agents. Address state management, resource isolation, scaling, and fault handling.

---

**Expected Answer (Short)**

Architecture: (1) **Stateless agent workers** behind a load balancer, with state externalized to Redis/DynamoDB. (2) **Session manager** assigns sessions to workers, handles failover. (3) **Resource isolation** — per-session token budgets, timeouts, and tool rate limits prevent one session from starving others. (4) **Event-driven execution** — agent steps emitted as events, enabling async tool execution and horizontal scaling. (5) **Circuit breakers** per tool — if a tool is failing, affected agents degrade gracefully instead of cascading failures.

---

**Deep Answer**

```
                    ┌─────────────────┐
                    │   Load Balancer  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐
        │  Worker 1  │ │  Worker 2  │ │  Worker N  │
        │ (stateless)│ │ (stateless)│ │ (stateless)│
        └─────┬─────┘ └─────┬─────┘ └─────┴─────┘
              │              │              │
        ┌─────┴──────────────┴──────────────┴─────┐
        │           State Store (Redis)            │
        │  - Session state    - Agent memory       │
        │  - Conversation     - Tool results cache │
        └─────────────────────────────────────────┘
              │
        ┌─────┴─────────────────────┐
        │     Event Bus (Kafka)      │
        │  - Tool execution events   │
        │  - Agent step events       │
        │  - Monitoring events       │
        └───────────────────────────┘
```

- **State externalization:**
  - All session state in Redis (TTL = session timeout)
  - Conversation history in append-only log (DynamoDB/Postgres)
  - Any worker can pick up any session (stateless workers)
  - If a worker crashes, session can resume on another worker

- **Resource isolation:**
  ```python
  class SessionBudget:
      max_llm_calls: int = 20
      max_tokens: int = 100_000
      max_tool_calls: int = 50
      timeout_seconds: int = 300
      max_concurrent_tools: int = 3
  ```
  - Each session has enforced budget limits
  - Prevents runaway agent loops from killing the platform

- **Scaling dimensions:**
  - Workers scale horizontally (auto-scale on queue depth)
  - LLM API calls are the bottleneck — use rate limiter with per-session fairness
  - Tool execution can be async with callback pattern

- **Fault handling:**
  - Worker crash → session state is in Redis → another worker picks up
  - Tool failure → circuit breaker pattern → fallback or skip
  - LLM API failure → retry with exponential backoff → degrade to cached response
  - Runaway session → killed by timeout, user notified

---

**Follow-up Questions**

1. A bug in one agent type is causing 50% of sessions to fail. How do you isolate it?
2. How do you handle sessions that span multiple hours (user leaves and comes back)?
3. You need to deploy a new agent version without disrupting active sessions. How?

---

## Q-05-S-002: Design an agent safety and compliance framework for a regulated industry (healthcare/finance).

**Module:** Agentic AI
**Submodule:** Safety & Compliance
**Level:** System
**Difficulty:** 5
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, DevOps / SRE → AIOps
**Tags:** [agents, safety, compliance, audit, regulated, guardrails]
**Prerequisites:** Q-05-A-004, Q-05-A-012
**Estimated Interview Round:** System Design
**Why This Question Matters:** In regulated industries, agent actions have legal consequences. Compliance requires auditability, explainability, and provable safety guarantees — well beyond basic guardrails.

---

**Question**

Design the safety and compliance framework for a financial services agent that can access customer accounts, execute trades, and provide investment advice. It must comply with SEC/FINRA regulations.

---

**Expected Answer (Short)**

Framework layers: (1) **Action classification** — every action categorized by regulatory risk. (2) **Mandatory disclosures** — agent must include regulatory disclaimers for investment advice. (3) **Audit trail** — every LLM call, tool execution, and decision logged immutably (who, what, when, why). (4) **Compliance checks** — pre-execution validation against regulatory rules (suitability, concentration limits). (5) **Human oversight** — tiered approval based on action impact. (6) **Explainability** — agent must produce reasoning that can be shown to regulators.

---

**Deep Answer**

```python
class ComplianceFramework:
    def __init__(self):
        self.action_tiers = {
            "view_balance": Tier.READ_ONLY,         # Auto-execute
            "provide_info": Tier.LOW_RISK,           # Execute + log
            "investment_advice": Tier.REGULATED,     # Disclaimer required + compliance check
            "execute_trade": Tier.HIGH_RISK,         # Human approval + suitability check
            "transfer_funds": Tier.CRITICAL,         # Multi-factor approval + compliance
        }
        self.audit_log = ImmutableAuditLog()  # Append-only, tamper-evident
    
    async def execute(self, action, context):
        tier = self.action_tiers[action.type]
        
        # 1. Log intent (before execution)
        audit_id = self.audit_log.record_intent(action, context)
        
        # 2. Compliance pre-check
        compliance_result = await self.check_compliance(action, context)
        if not compliance_result.passed:
            self.audit_log.record_blocked(audit_id, compliance_result.reason)
            return BlockedResponse(reason=compliance_result.reason)
        
        # 3. Suitability check (for investment actions)
        if tier >= Tier.REGULATED:
            suitability = await self.suitability_check(action, context.customer_profile)
            if not suitability.appropriate:
                return BlockedResponse(f"Not suitable for customer risk profile: {suitability.reason}")
        
        # 4. Human approval (for high-risk actions)
        if tier >= Tier.HIGH_RISK:
            approval = await self.request_approval(action, context)
            if not approval.granted:
                return BlockedResponse("Action requires human approval — pending")
        
        # 5. Execute with mandatory disclosures
        result = await self._execute(action)
        
        # 6. Post-execution compliance logging
        self.audit_log.record_execution(audit_id, result, 
            reasoning=context.agent_reasoning,
            compliance_checks=compliance_result,
            approver=approval.approver if tier >= Tier.HIGH_RISK else None)
        
        return result
```

- **Audit requirements:**
  - Every LLM prompt and response stored (for regulatory review)
  - Every tool call with inputs and outputs
  - Agent reasoning chain (explainable decisions)
  - Timestamp, session ID, customer ID, employee overseeing
  - Retention: typically 7 years for financial services

- **Mandatory disclosures:** Agent must append: "This is AI-generated information. Past performance does not guarantee future results. Consult a licensed financial advisor before making investment decisions."

---

**Follow-up Questions**

1. A regulator asks you to explain why the agent recommended a specific trade. How do you produce this?
2. How do you test compliance rules without executing real trades?
3. The compliance checks add 2 seconds latency. How do you optimize?

---

## Q-05-S-003: Design a self-improving agent system that learns from past successes and failures.

**Module:** Agentic AI
**Submodule:** Learning & Adaptation
**Level:** System
**Difficulty:** 5
**Experience Bands:** Architect
**Persona Relevance:** Senior / Architect, ML / Data Engineer
**Tags:** [agents, learning, feedback, self-improvement, reflection]
**Prerequisites:** Q-05-A-003, Q-05-A-006, Q-05-C-003
**Estimated Interview Round:** System Design
**Why This Question Matters:** Static agents become stale. The ability to learn from successful trajectories, avoid repeated failures, and improve over time is the frontier of agent engineering.

---

**Question**

Design a system where your agent improves over time by learning from successful task completions and failed attempts. Include the feedback loop, what data to store, and how to surface improvements.

---

**Expected Answer (Short)**

Architecture: (1) **Trajectory store** — log every agent run with steps, outcomes, user feedback. (2) **Outcome labeling** — automatic (task completed?) + human (thumbs up/down). (3) **Pattern mining** — identify successful strategies for query types and failed patterns. (4) **Dynamic few-shot** — retrieve successful trajectories as examples for similar new queries. (5) **Prompt evolution** — periodically update system prompts based on common failure modes. (6) **Guardrail updates** — add new rules when recurring failures are detected.

---

**Deep Answer**

```python
class SelfImprovingAgent:
    def __init__(self, base_agent, trajectory_store, llm):
        self.base_agent = base_agent
        self.trajectory_store = trajectory_store
        self.llm = llm
    
    async def run(self, query):
        # 1. Retrieve similar successful trajectories as examples
        similar_successes = self.trajectory_store.search(
            query=query, filter={"outcome": "success", "rating": {"$gte": 4}},
            top_k=2
        )
        
        # 2. Retrieve similar failures to avoid
        similar_failures = self.trajectory_store.search(
            query=query, filter={"outcome": "failure"},
            top_k=1
        )
        
        # 3. Inject into agent context
        enhanced_prompt = f"""
        Here are examples of successfully handling similar queries:
        {format_trajectories(similar_successes)}
        
        Avoid these patterns that failed previously:
        {format_failure_patterns(similar_failures)}
        """
        
        # 4. Run agent
        result = await self.base_agent.run(query, additional_context=enhanced_prompt)
        
        # 5. Store trajectory for future learning
        self.trajectory_store.store(
            query=query,
            trajectory=result.steps,
            outcome="success" if result.completed else "failure",
            tokens_used=result.total_tokens,
            latency=result.total_time
        )
        
        return result
    
    # Periodic optimization job
    def optimize(self):
        # Analyze failure patterns
        failures = self.trajectory_store.recent_failures(days=7)
        common_patterns = self.llm.analyze_failure_patterns(failures)
        
        # Update guardrails
        for pattern in common_patterns:
            if pattern.frequency > 10:
                self.base_agent.add_guardrail(pattern.prevention_rule)
        
        # Update system prompt with lessons learned
        lessons = self.llm.extract_lessons(failures)
        self.base_agent.update_system_prompt_section("lessons_learned", lessons)
```

- **Improvement surfaces:**
  - **Few-shot examples** — most impactful, immediate improvement
  - **System prompt updates** — address systematic issues
  - **Tool description refinement** — fix consistent tool misuse
  - **Guardrail additions** — prevent recurring safety issues
  - **Fine-tuning** — ultimate optimization for specific domains (expensive)

- **Safety:** Self-improvement must not bypass safety guardrails. Every prompt update goes through review. Canary % of traffic tests improvements before full rollout.

---

**Follow-up Questions**

1. The agent learns a shortcut that works but violates safety guidelines. How do you prevent this?
2. How do you measure whether the agent is actually improving vs. just memorizing?
3. Cold start: no trajectory data yet. How do you bootstrap the system?

---

## Q-05-S-004: Design the observability stack for a production agent system.

**Module:** Agentic AI
**Submodule:** Production Operations
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** DevOps / SRE → AIOps, Senior / Architect
**Tags:** [agents, observability, monitoring, tracing, logging, production]
**Prerequisites:** Q-05-A-006, Q-06-A-002
**Estimated Interview Round:** System Design
**Why This Question Matters:** Agent systems are non-deterministic and multi-step. Traditional request-response monitoring is insufficient. You need agent-aware observability to debug failures and optimize performance.

---

**Question**

Design the monitoring and observability system for a production agent serving 50K daily requests. You need to understand what the agent is doing, catch failures early, and debug issues quickly.

---

**Expected Answer (Short)**

Three pillars adapted for agents: (1) **Traces** — distributed trace per agent session spanning all LLM calls, tool executions, and sub-agent invocations. Trace = full agent trajectory. (2) **Metrics** — task completion rate, avg steps, avg cost, P95 latency, tool success rates, guardrail trigger rate. (3) **Logs** — structured logs for every agent decision point. Plus agent-specific: (4) **Session replay** — ability to replay any agent session step-by-step for debugging.

---

**Deep Answer**

```python
# Trace structure for agent session
class AgentTrace:
    session_id: str
    user_id: str
    query: str
    start_time: datetime
    spans: list[AgentSpan]  # Ordered list of all operations
    outcome: str  # success, failure, timeout, escalated
    total_tokens: int
    total_cost: float
    total_latency_ms: float

class AgentSpan:
    span_id: str
    parent_span_id: str  # For nested operations (sub-agent calls)
    type: str  # "llm_call", "tool_execution", "guardrail_check", "sub_agent"
    name: str  # "gpt-4o reasoning step 3" or "search_documents"
    input: dict  # Prompt/params (PII-redacted)
    output: dict  # Response (PII-redacted)
    duration_ms: float
    tokens: dict  # {"input": 500, "output": 200}
    status: str  # success, error, timeout

# Key dashboards:
# 1. Health overview: completion rate, error rate, avg cost, P95 latency
# 2. Agent behavior: most common tool sequences, avg steps per query type
# 3. Cost breakdown: cost by model, by tool, by query type
# 4. Quality: user satisfaction, guardrail triggers, escalation rate
# 5. Anomaly detection: sudden changes in any metric

# Alerting rules:
alerts = [
    Alert("completion_rate < 85%", severity="critical"),
    Alert("avg_cost_per_query > $0.50", severity="warning"),
    Alert("guardrail_triggers_per_hour > 100", severity="critical"),
    Alert("tool_error_rate > 10%", severity="warning"),
    Alert("p95_latency > 30s", severity="warning"),
]
```

- **Session replay:** Store full trace → allow replay in a debug UI. Enables: "Show me exactly what the agent did for session X." This is the most valuable debugging tool for non-deterministic systems.

- **Integration:** Langfuse, LangSmith, or custom trace collector. OpenTelemetry spans adapted for LLM/agent semantics.

---

**Follow-up Questions**

1. How do you handle PII in agent traces (user data passes through LLM calls)?
2. Traces for 50K daily sessions — how do you manage storage costs?
3. How do you detect gradual quality degradation (not a sudden failure)?

---

## Q-05-S-005: Design an agent system that manages long-running tasks spanning hours or days.

**Module:** Agentic AI
**Submodule:** Orchestration
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, Software Dev → AI Engineer
**Tags:** [agents, long-running, async, workflow, state-management]
**Prerequisites:** Q-05-A-010, Q-05-A-012
**Estimated Interview Round:** System Design
**Why This Question Matters:** Not all agent tasks complete in seconds. Research synthesis, complex analysis, and multi-approval workflows can span hours. The agent must persist state, handle interruptions, and resume.

---

**Question**

Design an agent that handles a due diligence analysis for a potential acquisition — a task that involves gathering data from multiple sources, requesting human reviews, and producing a final report over 2-3 days.

---

**Expected Answer (Short)**

Architecture: (1) **Durable execution** — agent state in persistent store (not memory). If the process crashes, it resumes from the last checkpoint. (2) **Event-driven steps** — each step completes asynchronously (tool result callbacks, human approval webhooks). (3) **Checkpoint/resume** — save state after each completed step. (4) **Notification system** — keep stakeholders updated on progress. (5) **Deadline management** — track SLAs for each step, escalate if overdue.

---

**Deep Answer**

```python
# Modeled as a durable workflow (Temporal/Step Functions pattern)
class DueDiligenceWorkflow:
    def __init__(self, agent, state_store, notifier):
        self.agent = agent
        self.state_store = state_store
        self.notifier = notifier
    
    async def run(self, target_company):
        state = WorkflowState(
            id=uuid4(),
            phases=[
                Phase("financial_analysis", deadline=hours(24)),
                Phase("legal_review", deadline=hours(48)),
                Phase("market_analysis", deadline=hours(24)),
                Phase("human_review", deadline=hours(48)),
                Phase("report_generation", deadline=hours(12)),
            ]
        )
        
        for phase in state.phases:
            self.state_store.checkpoint(state)  # persist before each phase
            self.notifier.notify(f"Starting phase: {phase.name}")
            
            try:
                result = await self.execute_phase(phase, state)
                phase.result = result
                phase.status = "completed"
            except HumanApprovalPending:
                phase.status = "awaiting_approval"
                await self.wait_for_approval(phase)  # async, could be hours
            except DeadlineExceeded:
                phase.status = "escalated"
                self.notifier.escalate(f"Phase {phase.name} exceeded deadline")
        
        # Generate final report from all phase results
        report = await self.agent.synthesize_report(state)
        return report
    
    async def resume(self, workflow_id):
        """Resume a workflow after crash or human approval."""
        state = self.state_store.load(workflow_id)
        # Find first incomplete phase and continue from there
        for phase in state.phases:
            if phase.status != "completed":
                return await self.execute_phase(phase, state)
```

- **Key patterns:**
  - **Durable execution:** Use Temporal, AWS Step Functions, or equivalent. Agent logic is a workflow definition, not a long-running process.
  - **Idempotent steps:** Each step can be safely retried (not duplicate actions).
  - **Progress tracking:** Dashboard shows current phase, pending actions, estimated completion.

---

**Follow-up Questions**

1. A human reviewer doesn't respond for 48 hours. How does the system handle it?
2. How do you handle partial failures (3 of 5 phases complete, then the system crashes)?
3. The agent needs to incorporate new information that arrived after an earlier phase completed. How?

---

## Q-05-S-006: How do you design an agent system that handles multiple modalities (text, code, images, structured data)?

**Module:** Agentic AI
**Submodule:** Architecture Patterns
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, ML / Data Engineer
**Tags:** [agents, multimodal, architecture, tools, integration]
**Prerequisites:** Q-05-A-001, Q-05-A-008
**Estimated Interview Round:** System Design
**Why This Question Matters:** Real-world agent tasks are rarely text-only. Analyzing charts, writing code, parsing PDFs, and querying databases all require multimodal capabilities integrated into the agent loop.

---

**Question**

Design an agent that helps data analysts by accepting questions about data (text), analyzing uploaded CSVs and charts (structured data + images), writing and executing SQL/Python code, and producing visualizations.

---

**Expected Answer (Short)**

Architecture: (1) **Multimodal input processing** — route inputs through appropriate parsers (text→LLM, CSV→pandas, image→vision model, SQL→query engine). (2) **Code execution sandbox** — secure sandbox (Docker/E2B) for running generated Python/SQL. (3) **Tool chain** — tools for each modality: `analyze_csv`, `run_sql`, `execute_python`, `generate_chart`, `describe_image`. (4) **Context fusion** — combine outputs from different modalities into a unified context the agent reasons over. (5) **Safety** — sandbox prevents arbitrary code execution, SQL injection prevention, file size limits.

---

**Deep Answer**

```python
class MultimodalDataAgent:
    tools = {
        "analyze_csv": Tool(
            description="Load and analyze a CSV file. Returns schema, stats, and sample rows.",
            input_types=["file"],
            sandbox_required=False
        ),
        "run_sql": Tool(
            description="Execute SQL query against loaded datasets.",
            input_types=["text"],
            sandbox_required=True  # SQL injection prevention
        ),
        "execute_python": Tool(
            description="Run Python code for data analysis. Has pandas, numpy, matplotlib.",
            input_types=["code"],
            sandbox_required=True  # Arbitrary code execution
        ),
        "generate_chart": Tool(
            description="Generate a chart from data. Specify chart type and columns.",
            input_types=["structured"],
            sandbox_required=True
        ),
        "describe_image": Tool(
            description="Use vision model to describe an uploaded chart or image.",
            input_types=["image"],
            sandbox_required=False
        )
    }
    
    async def handle(self, user_input):
        # 1. Parse multimodal input
        parsed = self.parse_input(user_input)
        # Could have: text question, uploaded CSV, pasted image
        
        # 2. Agent loop with multimodal context
        context = {"text": parsed.text, "files": parsed.files, "images": parsed.images}
        
        return await self.react_loop(context)
    
    async def execute_code(self, code, language):
        """Execute in sandboxed environment."""
        sandbox = await Sandbox.create(
            image="data-analysis-sandbox",
            timeout=30,
            memory_limit="512MB",
            network=False  # No network access for safety
        )
        result = await sandbox.run(code, language)
        await sandbox.destroy()
        return result
```

- **Security critical:**
  - Code execution in isolated sandbox (no host access)
  - SQL parameterized queries only
  - File upload: size limits, type validation, virus scanning
  - No network access from sandbox (prevent data exfiltration)

---

**Follow-up Questions**

1. The code execution takes 60 seconds for a large dataset. How do you handle timeout vs letting it complete?
2. User uploads a 2GB CSV. How does your architecture handle it?
3. How do you validate that generated code is safe before executing?

---
