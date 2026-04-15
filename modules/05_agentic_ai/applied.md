# Module 05 — Agentic AI: Applied Level

---

## Q-05-A-001: Design a tool interface for an LLM agent. What makes a good tool definition?

**Module:** Agentic AI
**Submodule:** Tool Design
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer, ML / Data Engineer
**Tags:** [agents, tools, function-calling, api-design, interface]
**Prerequisites:** Q-05-C-001, Q-05-C-002
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** Tools are the agent's hands. Poorly designed tool interfaces cause hallucinated parameters, wrong tool selection, and cascading failures. Good tool design is the difference between a demo agent and a production one.

---

**Question**

You're building an agent that can search documents, query a database, and send emails. Design the tool interface — schema, descriptions, and parameter validation. What principles make tools agent-friendly?

---

**Expected Answer (Short)**

Good tool design: (1) Clear, unambiguous name (search_documents not do_thing). (2) Descriptive docstring that tells the LLM WHEN to use it, not just what it does. (3) Minimal parameters — fewer params = fewer hallucination opportunities. (4) Strong typing with enums for constrained values. (5) Return structured output the LLM can parse. (6) Graceful error messages the LLM can reason about.

---

**Deep Answer**

- **Tool schema principles:**
  ```python
  tools = [
      {
          "name": "search_documents",
          "description": "Search internal knowledge base. Use when user asks about company policies, procedures, or product docs. Do NOT use for general knowledge questions.",
          "parameters": {
              "query": {"type": "string", "description": "Natural language search query"},
              "collection": {"type": "string", "enum": ["policies", "products", "engineering"], "description": "Which document collection to search"},
              "max_results": {"type": "integer", "default": 5, "description": "Number of results (1-20)"}
          },
          "required": ["query", "collection"]
      }
  ]
  ```

- **Key principles:**
  1. **Negative descriptions** — tell the LLM when NOT to use the tool ("Do NOT use for general knowledge")
  2. **Enum over free text** — `collection: enum[policies, products, engineering]` not `collection: string`
  3. **Sensible defaults** — reduce required params to minimum
  4. **Output structure** — return `{"results": [...], "total_count": 42}` not raw text
  5. **Error returns** — `{"error": "Collection 'finance' not found. Available: policies, products, engineering"}` so the LLM can self-correct

- **Anti-patterns:**
  - God tools: `do_everything(action, params)` — LLM can't reason about when to use it
  - Ambiguous tools: two tools named `search` and `find` with overlapping scope
  - Complex nested params: `{"filter": {"and": [{"field": "x", "op": "gt", "val": 5}]}}` — LLMs struggle with deep nesting

- **Validation layer:**
  ```python
  def execute_tool(name, params):
      schema = TOOL_SCHEMAS[name]
      validated = validate_params(params, schema)  # type check, enum check, range check
      if validated.errors:
          return {"error": f"Invalid params: {validated.errors}", "hint": "Try again with corrected values"}
      return tools[name](**validated.params)
  ```
  Never pass unvalidated LLM output directly to tools (security + reliability).

---

**Follow-up Questions**

1. The agent keeps choosing the wrong tool. How do you debug tool selection?
2. How do you handle tools with side effects (send_email) vs read-only tools (search)?
3. Your tool takes 30 seconds to execute. How does this affect agent design?

---

**Common Weak Answers / Red Flags**

- No parameter validation — directly executing LLM-generated params
- Tools with ambiguous or overlapping descriptions
- No error handling in tool returns

---

**Interviewer Evaluation Signal**

Tests API design sense applied to AI systems. The best candidates think about the LLM as a "user" of their API and optimize for LLM usability, not just human usability.

---

**Real-World Insight**

OpenAI's function calling performance improved 15-20% across benchmarks when tool descriptions included explicit "when to use" and "when NOT to use" instructions. Anthropic's tool use documentation similarly emphasizes that the description is more important than the schema for correct tool selection.

---

## Q-05-A-002: Implement ReAct (Reasoning + Acting) for a multi-step research agent.

**Module:** Agentic AI
**Submodule:** Planning Patterns
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer, ML / Data Engineer
**Tags:** [agents, react, planning, reasoning, chain-of-thought, tools]
**Prerequisites:** Q-05-C-001, Q-05-C-003
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** ReAct is the foundational agent loop. Understanding its implementation, strengths, and limitations is essential for building any agent system.

---

**Question**

Implement a ReAct agent that answers multi-step research questions using search and calculator tools. Show the thought-action-observation loop.

---

**Expected Answer (Short)**

ReAct interleaves reasoning (Thought) with actions (Act) and observations (Observe) in a loop. Each iteration: LLM generates a Thought explaining its reasoning, then selects an Action with params. The system executes the action and returns an Observation. The LLM then decides: continue looping or produce Final Answer.

---

**Deep Answer**

```python
REACT_PROMPT = """Answer the question using the available tools.

Tools: {tool_descriptions}

Format:
Thought: [reason about what to do next]
Action: tool_name(param1="value1", param2="value2")
Observation: [tool result will be inserted here]
... (repeat Thought/Action/Observation as needed)
Thought: I now have enough information
Final Answer: [your answer]

Question: {question}"""

def react_agent(question, tools, llm, max_iterations=10):
    scratchpad = ""
    for i in range(max_iterations):
        prompt = REACT_PROMPT.format(
            tool_descriptions=format_tools(tools),
            question=question
        ) + scratchpad
        
        response = llm(prompt, stop=["Observation:"])
        scratchpad += response
        
        if "Final Answer:" in response:
            return extract_final_answer(response)
        
        action_name, params = parse_action(response)
        observation = tools[action_name](**params)
        scratchpad += f"\nObservation: {observation}\n"
    
    return "Max iterations reached — could not determine answer"
```

- **Key implementation details:**
  - `stop=["Observation:"]` — stop generation before the LLM hallucinates a tool result
  - Scratchpad accumulates full history so each iteration sees prior reasoning
  - Max iterations prevents infinite loops
  - Parse action with regex/structured extraction, not blind eval()

- **ReAct vs alternatives:**

| Pattern | Planning | When to use |
|---------|----------|-------------|
| ReAct | Step-by-step, interleaved | General-purpose, moderate complexity |
| Plan-and-Execute | All planning upfront, then execute | Complex multi-step with clear subtasks |
| Reflexion | ReAct + self-critique after failure | Tasks needing error recovery |

---

**Follow-up Questions**

1. The agent enters an infinite loop (Action → Observation → same Action again). How do you break it?
2. How do you add memory to this ReAct agent?
3. When would you choose Plan-and-Execute over ReAct?

---

**Common Weak Answers / Red Flags**

- No max iteration safety
- Using eval() to parse actions
- No stop token — LLM hallucinates observations

---

**Interviewer Evaluation Signal**

Tests ability to implement the core agent loop. The stop token and max iteration details reveal whether the candidate has actually built agents or just read about them.

---

## Q-05-A-003: How do you implement agent memory — both short-term (conversation) and long-term (persistent)?

**Module:** Agentic AI
**Submodule:** Memory Systems
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer, ML / Data Engineer
**Tags:** [agents, memory, conversation-state, rag, vector-store, persistence]
**Prerequisites:** Q-05-C-004, Q-04-C-001
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** Without memory, agents repeat work, forget context, and can't learn from experience. Memory architecture is the key differentiator between toy demos and useful agents.

---

**Question**

Design the memory system for a customer support agent that handles multi-turn conversations and remembers past interactions with the same customer across sessions.

---

**Expected Answer (Short)**

Three memory tiers: (1) **Working memory** — current conversation context in the prompt (sliding window or summarized). (2) **Short-term memory** — full conversation stored, retrieved when context window is too small (buffer + summary). (3) **Long-term memory** — past interactions stored in vector DB, retrieved by semantic similarity when relevant. Key decisions: when to write to long-term, what to retrieve, how to summarize.

---

**Deep Answer**

```python
class AgentMemory:
    def __init__(self, vector_store, llm):
        self.working_memory = []          # current turn messages
        self.conversation_buffer = []      # full session history
        self.vector_store = vector_store   # long-term (cross-session)
        self.llm = llm
    
    def add_message(self, role, content):
        self.working_memory.append({"role": role, "content": content})
        self.conversation_buffer.append({"role": role, "content": content})
        
        # Compress working memory if too long
        if self.count_tokens(self.working_memory) > 3000:
            summary = self.llm.summarize(self.working_memory[:-3])
            self.working_memory = [
                {"role": "system", "content": f"Previous context: {summary}"}
            ] + self.working_memory[-3:]
    
    def retrieve_long_term(self, query, customer_id):
        """Retrieve relevant past interactions for this customer."""
        results = self.vector_store.search(
            query=query,
            filter={"customer_id": customer_id},
            top_k=3
        )
        return [r.content for r in results]
    
    def persist_session(self, customer_id):
        """At end of conversation, store summary in long-term memory."""
        summary = self.llm.summarize(self.conversation_buffer)
        self.vector_store.upsert(
            content=summary,
            metadata={"customer_id": customer_id, "date": today(), "type": "session_summary"}
        )
```

- **Memory retrieval strategies:**
  - **Recency** — recent interactions weighted higher
  - **Relevance** — semantic similarity to current query
  - **Importance** — escalations, complaints, purchases scored higher
  - **Hybrid** — combine all three with tunable weights

- **What to store vs. what to discard:**
  - Store: decisions made, issues resolved, preferences expressed, entities mentioned
  - Discard: small talk, repeated clarifications, system messages

---

**Follow-up Questions**

1. Memory retrieval adds 500ms latency. How do you optimize?
2. Customer says "I already told you about this last time." But retrieval returns nothing. What happened?
3. How do you handle contradictory memories (customer changed their preference)?

---

**Common Weak Answers / Red Flags**

- Only uses conversation buffer (no long-term)
- Stores everything verbatim (no summarization strategy)
- No filtering by customer — retrieves irrelevant memories from other users

---

## Q-05-A-004: How do you implement guardrails for an LLM agent to prevent harmful or off-topic actions?

**Module:** Agentic AI
**Submodule:** Safety & Guardrails
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer, Senior / Architect
**Tags:** [agents, guardrails, safety, validation, prompt-injection, trust]
**Prerequisites:** Q-05-C-006
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** An unconstrained agent with tool access is a security and liability risk. Guardrails are not optional in production — they're the difference between a useful assistant and a liability.

---

**Question**

You're deploying a customer-facing agent that can search docs, create support tickets, and issue refunds. Design the guardrail system.

---

**Expected Answer (Short)**

Layered guardrails: (1) **Input guardrails** — detect prompt injection, filter harmful/off-topic requests before the LLM sees them. (2) **Output guardrails** — validate LLM responses for harmful content, PII leakage, hallucinated actions. (3) **Tool guardrails** — permission system (read vs write), confirmation for high-impact actions (refunds), rate limiting, parameter bounds. (4) **Conversation guardrails** — max turns, topic boundaries, escalation triggers.

---

**Deep Answer**

```python
class GuardrailPipeline:
    def __init__(self):
        self.input_guards = [PromptInjectionDetector(), TopicClassifier(), PIIRedactor()]
        self.output_guards = [HallucinationChecker(), ToxicityFilter(), PIILeakDetector()]
        self.tool_guards = {
            "issue_refund": ToolGuard(
                requires_confirmation=True,  # human-in-the-loop
                max_amount=100.00,           # parameter bounds
                rate_limit="5/hour",         # abuse prevention
                allowed_roles=["support_agent", "supervisor"]
            ),
            "search_docs": ToolGuard(
                requires_confirmation=False,
                rate_limit="100/minute"
            )
        }
    
    async def process(self, user_input, agent):
        # Input guardrails
        for guard in self.input_guards:
            result = guard.check(user_input)
            if result.blocked:
                return result.safe_response  # don't even call LLM
        
        # Agent execution
        agent_response = await agent.run(user_input)
        
        # Output guardrails 
        for guard in self.output_guards:
            agent_response = guard.filter(agent_response)
        
        return agent_response
```

- **Prompt injection defense:**
  - Input classifier trained on injection examples
  - Delimiter-based prompt structure (separate system/user/tool sections)
  - Check if tool params contain injection attempts
  - Never let user input flow into system prompt without sanitization

- **Tool permission hierarchy:**
  - **Tier 1 (read-only):** search, lookup — auto-execute
  - **Tier 2 (write, low impact):** create ticket, add note — execute with logging
  - **Tier 3 (write, high impact):** refund, delete, modify account — require confirmation

---

**Follow-up Questions**

1. A clever user bypasses your prompt injection detection. What's your fallback defense?
2. The guardrails reject 30% of legitimate requests (false positives). How do you tune?
3. How do you test guardrails? What's your red-teaming strategy?

---

**Common Weak Answers / Red Flags**

- Relies solely on the system prompt for safety ("Please don't do harmful things")
- No tool-level permissions — all tools equally accessible
- No consideration of prompt injection

---

## Q-05-A-005: How do you implement a plan-and-execute agent for complex multi-step tasks?

**Module:** Agentic AI
**Submodule:** Planning Patterns
**Level:** Applied
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** Software Dev → AI Engineer, Senior / Architect
**Tags:** [agents, planning, plan-and-execute, decomposition, orchestration]
**Prerequisites:** Q-05-C-003, Q-05-A-002
**Estimated Interview Round:** Deep Dive
**Why This Question Matters:** Plan-and-execute separates planning from execution, allowing more complex reasoning. It's the dominant pattern for production agents handling real business workflows.

---

**Question**

Implement a plan-and-execute agent that takes a complex user request (e.g., "Research competitors, compare pricing, and draft a summary email"), decomposes it into steps, executes each step, and adapts the plan if a step fails.

---

**Expected Answer (Short)**

Architecture: (1) Planner LLM decomposes the task into ordered subtasks with dependencies. (2) Executor runs each subtask using available tools. (3) Replanner evaluates after each step — if the result changes requirements, update the plan. Key: the plan is a data structure (list of steps with status), not just text.

---

**Deep Answer**

```python
@dataclass
class Step:
    id: int
    description: str
    tool: str
    depends_on: list[int]  # step IDs this depends on
    status: str = "pending"  # pending, running, completed, failed
    result: str = None

def plan_and_execute(task, tools, llm, max_replans=3):
    # Phase 1: Plan
    plan = llm.generate_plan(task, available_tools=tools)
    # Returns: [Step(1, "Search for competitor X", "web_search", []),
    #           Step(2, "Search for competitor Y", "web_search", []),
    #           Step(3, "Compare pricing", "analyze", [1, 2]),
    #           Step(4, "Draft email", "compose", [3])]
    
    replan_count = 0
    while pending_steps(plan):
        # Find next executable step (all dependencies completed)
        step = get_next_step(plan)
        step.status = "running"
        
        try:
            result = execute_step(step, tools, context=completed_results(plan))
            step.result = result
            step.status = "completed"
        except ToolError as e:
            step.status = "failed"
            
            # Replan: adapt remaining steps given the failure
            if replan_count < max_replans:
                plan = llm.replan(plan, failed_step=step, error=str(e))
                replan_count += 1
            else:
                return f"Task failed at step {step.id}: {e}"
    
    return synthesize_results(plan)
```

- **Replanning strategies:**
  - **Skip** — mark failed step as non-critical and continue
  - **Retry** — retry with different parameters
  - **Substitute** — use a different tool/approach for the same goal
  - **Restructure** — completely rework remaining plan given new information

- **Parallelization:** Steps with no dependency overlap can execute concurrently (steps 1 and 2 above).

---

**Follow-up Questions**

1. The planner generates 20 steps for a simple task. How do you handle over-planning?
2. How do you handle a step that returns unexpected information that makes the rest of the plan irrelevant?
3. Plan-and-Execute vs ReAct — when do you use each?

---

**Common Weak Answers / Red Flags**

- Plan is just text, not a structured data type
- No replanning capability — fails on first error
- No dependency tracking between steps

---

## Q-05-A-006: How do you evaluate an agent system? What metrics matter?

**Module:** Agentic AI
**Submodule:** Evaluation
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Senior / Architect
**Tags:** [agents, evaluation, metrics, testing, quality]
**Prerequisites:** Q-05-C-001, Q-03-A-006
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** Agent evaluation is much harder than model evaluation. You're evaluating a dynamic system that makes variable numbers of calls, uses tools, and can take different paths to the same answer.

---

**Question**

How do you evaluate and benchmark an agent that handles multi-step tasks? What metrics do you track beyond final answer correctness?

---

**Expected Answer (Short)**

Metrics beyond accuracy: (1) **Task completion rate** — did the agent achieve the user's goal? (2) **Tool selection accuracy** — did it choose the right tools? (3) **Efficiency** — number of steps/tokens/cost to complete task. (4) **Recovery rate** — how often does it recover from errors? (5) **Latency** — end-to-end time. (6) **Safety** — harmful action attempts, guardrail triggers. Evaluation methods: golden trajectories (compare step sequences), outcome-based (only judge final result), human eval (rate overall quality).

---

**Deep Answer**

```python
@dataclass
class AgentEvalResult:
    task_id: str
    final_answer_correct: bool      # Did it get the right answer?
    task_completed: bool             # Did it complete the full task?
    num_steps: int                   # Efficiency
    total_tokens: int                # Cost
    total_latency_ms: float          # Speed
    tools_used: list[str]           # Which tools were called
    tool_accuracy: float             # % of tool calls that were appropriate
    recovered_from_error: bool       # Hit an error and recovered?
    guardrail_violations: int        # Safety metric
    trajectory_match: float          # Similarity to golden trajectory (0-1)

# Evaluation dimensions:
# 1. Outcome eval — is the final answer correct?
# 2. Trajectory eval — did it take a reasonable path?
# 3. Efficiency eval — could it have done it in fewer steps?
# 4. Safety eval — did it violate any constraints?
# 5. Robustness eval — does it handle edge cases?
```

- **Evaluation dataset design:**
  - Easy tasks (1-2 tool calls) — baseline capability
  - Medium tasks (3-5 tool calls) — reasoning and planning
  - Hard tasks (5+ tool calls, ambiguity) — robustness
  - Adversarial tasks (misleading info, tool failures) — recovery
  - Safety tasks (prompt injection, boundary tests) — guardrails

- **Trajectory evaluation:**
  - Exact match is too strict (multiple valid paths)
  - Key: evaluate "did the critical steps happen?" not "did every step match?"
  - Use LLM-as-judge to rate trajectory quality

---

**Follow-up Questions**

1. Your agent scores 90% on benchmarks but users complain it's slow and verbose. What's the gap?
2. How do you build a regression test suite for agents?
3. Accuracy vs efficiency trade-off: the agent can get 95% accuracy in 3 steps or 99% in 15 steps. How do you decide?

---

## Q-05-A-007: How do you handle tool errors and failures gracefully in an agent?

**Module:** Agentic AI
**Submodule:** Error Handling
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer, DevOps / SRE → AIOps
**Tags:** [agents, error-handling, tool-failures, resilience, retry]
**Prerequisites:** Q-05-A-001, Q-05-A-002
**Estimated Interview Round:** Technical
**Why This Question Matters:** In production, tools fail — APIs time out, databases go down, search returns empty. An agent that crashes or loops on the first tool failure is useless.

---

**Question**

Your agent calls a search API that returns a 500 error. How should the agent handle this? Design the error handling strategy.

---

**Expected Answer (Short)**

Layered strategy: (1) **Retry with backoff** — transient errors resolve on retry (1-3 attempts). (2) **Fallback tools** — if search API fails, try a different search provider or cached results. (3) **Inform and adapt** — tell the LLM the tool failed with a structured error message; let it reason about alternatives. (4) **Graceful degradation** — if no alternative, provide a partial answer with explanation. (5) **Never silently fail** — always surface the failure so the agent can reason about it.

---

**Deep Answer**

```python
class ToolExecutor:
    def __init__(self, tools, fallback_map):
        self.tools = tools
        self.fallbacks = fallback_map  # {"search_api": ["cached_search", "web_scrape"]}
    
    async def execute(self, tool_name, params, max_retries=2):
        # Attempt primary tool
        for attempt in range(max_retries + 1):
            try:
                result = await self.tools[tool_name](**params)
                return ToolResult(success=True, data=result)
            except TransientError:
                if attempt < max_retries:
                    await asyncio.sleep(2 ** attempt)  # exponential backoff
                    continue
            except PermanentError as e:
                break  # Don't retry permanent errors (4xx, auth failures)
        
        # Attempt fallback tools
        for fallback in self.fallbacks.get(tool_name, []):
            try:
                result = await self.tools[fallback](**params)
                return ToolResult(success=True, data=result, used_fallback=fallback)
            except Exception:
                continue
        
        # All options exhausted — return structured error for LLM
        return ToolResult(
            success=False,
            error=f"Tool '{tool_name}' failed after {max_retries} retries. "
                  f"Fallbacks also failed. Consider alternative approach or "
                  f"provide partial answer with available information."
        )
```

- **Key principle**: Return errors as structured observations the LLM can reason about — don't raise exceptions that crash the agent loop.

---

**Follow-up Questions**

1. The LLM keeps retrying the same failed tool in a loop. How do you break it?
2. A tool returns successfully but with wrong/stale data. How do you detect this?
3. How do you set timeouts for tools without killing long-running legitimate operations?

---

## Q-05-A-008: How do you implement multi-agent systems where agents collaborate or delegate to each other?

**Module:** Agentic AI
**Submodule:** Multi-Agent
**Level:** Applied
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, Software Dev → AI Engineer
**Tags:** [agents, multi-agent, orchestration, delegation, collaboration]
**Prerequisites:** Q-05-C-005, Q-05-A-002
**Estimated Interview Round:** Deep Dive, System Design
**Why This Question Matters:** Complex tasks exceed what a single agent can handle effectively. Multi-agent systems enable specialization, parallel work, and better quality through separation of concerns.

---

**Question**

Design a multi-agent system for a code review workflow: one agent analyzes code quality, another checks security, a third verifies test coverage. How do they coordinate?

---

**Expected Answer (Short)**

Architecture options: (1) **Orchestrator pattern** — a supervisor agent dispatches subtasks to specialist agents and synthesizes results. (2) **Pipeline pattern** — agents run in sequence, each passing results to the next. (3) **Debate pattern** — agents review each other's work and resolve disagreements. For code review: orchestrator dispatches to 3 specialists in parallel, collects results, synthesizes final review. Key: shared message format, clear agent scopes, conflict resolution when agents disagree.

---

**Deep Answer**

```python
class OrchestratorAgent:
    def __init__(self):
        self.specialists = {
            "quality": CodeQualityAgent(tools=["ast_analyzer", "complexity_checker"]),
            "security": SecurityAgent(tools=["sast_scanner", "dependency_checker"]),
            "testing": TestCoverageAgent(tools=["coverage_analyzer", "mutation_tester"])
        }
    
    async def review(self, code_diff):
        # Dispatch to specialists in parallel
        tasks = {
            name: agent.analyze(code_diff) 
            for name, agent in self.specialists.items()
        }
        results = await asyncio.gather(*tasks.values())
        
        # Each specialist returns structured findings
        all_findings = merge_findings(dict(zip(tasks.keys(), results)))
        
        # Conflict resolution: if quality says "refactor function" but 
        # security says "don't change it, it's security-critical"
        resolved = self.resolve_conflicts(all_findings)
        
        # Synthesize final review
        return self.synthesize(resolved)
    
    def resolve_conflicts(self, findings):
        # Priority: security > quality > testing
        # Or: use another LLM call to reason about conflicts
        pass
```

- **Communication patterns:**
  - **Blackboard** — shared state store all agents read/write
  - **Message passing** — agents send structured messages to each other
  - **Orchestrator-mediated** — all communication goes through supervisor
  
- **When to use multi-agent:**
  - Task requires distinct expertise that's hard to combine in one prompt
  - You want parallel execution for speed
  - You need separation of concerns for testing/maintenance
  
- **When NOT to use multi-agent:**
  - Single agent can handle the task (added complexity for no benefit)
  - Tight context coupling (agents need to share too much state)
  - Latency budget is tight (orchestration overhead)

---

**Follow-up Questions**

1. The security agent and quality agent give contradictory recommendations. How do you resolve?
2. How do you debug a multi-agent system when the final output is wrong?
3. What happens when one specialist agent is much slower than the others?

---

## Q-05-A-009: How do you implement structured output from agents to ensure downstream systems can consume the results?

**Module:** Agentic AI
**Submodule:** Tool Design
**Level:** Applied
**Difficulty:** 2
**Experience Bands:** Early-career, Mid-level
**Persona Relevance:** Software Dev → AI Engineer
**Tags:** [agents, structured-output, json, pydantic, validation]
**Prerequisites:** Q-05-C-001, Q-03-A-003
**Estimated Interview Round:** Technical
**Why This Question Matters:** Agents that produce free-text output can't integrate with downstream APIs, databases, or UIs. Structured output is essential for production agents.

---

**Question**

Your agent needs to output a structured JSON object (customer issue classification with category, priority, and suggested actions). How do you ensure the output is always valid?

---

**Expected Answer (Short)**

Three approaches: (1) **Constrained generation** — use JSON mode or function calling to force valid JSON from the LLM. (2) **Pydantic validation** — define a schema, parse the output, retry on validation failure. (3) **Output parsers** — regex or structured extraction from free text. Best practice: combine constrained generation (structural validity) with Pydantic validation (semantic validity — e.g., priority must be 1-5).

---

**Deep Answer**

```python
from pydantic import BaseModel, validator

class IssueClassification(BaseModel):
    category: str  # Must be one of predefined categories
    priority: int  # 1-5
    summary: str
    suggested_actions: list[str]
    confidence: float  # 0-1
    
    @validator("category")
    def valid_category(cls, v):
        allowed = ["billing", "technical", "account", "feature_request"]
        if v not in allowed:
            raise ValueError(f"Category must be one of {allowed}")
        return v
    
    @validator("priority")
    def valid_priority(cls, v):
        if not 1 <= v <= 5:
            raise ValueError("Priority must be 1-5")
        return v

def get_structured_output(llm, user_message, max_retries=3):
    for attempt in range(max_retries):
        response = llm.chat(
            messages=[...],
            response_format={"type": "json_object"},  # Constrained generation
        )
        try:
            return IssueClassification.model_validate_json(response)
        except ValidationError as e:
            # Retry with error feedback
            messages.append({"role": "assistant", "content": response})
            messages.append({"role": "user", "content": f"Invalid output: {e}. Fix and retry."})
    raise OutputValidationError("Failed after max retries")
```

---

**Follow-up Questions**

1. The LLM consistently fails to produce valid JSON for a complex nested schema. What do you simplify?
2. How do you handle optional fields — should the LLM always include them?
3. Structured output vs free text with post-processing: when do you prefer each?

---

## Q-05-A-010: How do you implement conversation state management for a multi-turn agent?

**Module:** Agentic AI
**Submodule:** State Management
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer
**Tags:** [agents, state-management, conversation, context, multi-turn]
**Prerequisites:** Q-05-C-004, Q-05-A-003
**Estimated Interview Round:** Technical
**Why This Question Matters:** Multi-turn agents must track what's been discussed, what actions were taken, and what decisions were made. Poor state management causes agents to repeat questions, forget context, or contradict themselves.

---

**Question**

Design the state management for a travel booking agent that handles multi-turn conversations (search → compare → book → confirm). The agent needs to track partial booking info, user preferences, and conversation history.

---

**Expected Answer (Short)**

Use a typed state object (not just conversation history). The state tracks: (1) **Conversation phase** (searching, comparing, booking, confirming). (2) **Collected entities** (destination, dates, budget — each with confidence and source turn). (3) **Actions taken** (searches performed, options shown, selections made). (4) **Pending requirements** (what info is still needed). Update state after each turn. The LLM receives both conversation history AND structured state.

---

**Deep Answer**

```python
@dataclass
class BookingState:
    phase: str = "gathering_info"  # gathering_info → searching → comparing → booking → confirming
    destination: Optional[str] = None
    dates: Optional[DateRange] = None
    budget: Optional[BudgetRange] = None
    passengers: Optional[int] = None
    preferences: dict = field(default_factory=dict)  # {"seat": "window", "class": "economy"}
    search_results: list = field(default_factory=list)
    selected_option: Optional[dict] = None
    pending_fields: list = field(default_factory=lambda: ["destination", "dates", "passengers"])
    actions_log: list = field(default_factory=list)

def agent_turn(user_message, state, conversation_history):
    # Inject state into prompt alongside conversation
    system_prompt = f"""You are a travel booking agent.
    
    Current state:
    - Phase: {state.phase}
    - Collected: destination={state.destination}, dates={state.dates}, budget={state.budget}
    - Still needed: {state.pending_fields}
    - Options shown: {len(state.search_results)} results
    
    Based on the conversation, decide: ask for missing info, search, show options, or proceed to booking."""
    
    response = llm.chat(system_prompt, conversation_history + [user_message])
    
    # Update state based on response (entity extraction + action tracking)
    state = update_state(state, user_message, response)
    
    return response, state
```

- **State vs conversation history:** Conversation history is raw text. State is structured data extracted from it. The LLM is better at reasoning about structured state than re-parsing 20 turns of conversation.

---

**Follow-up Questions**

1. The user contradicts something they said 5 turns ago. How does the state handle it?
2. How do you persist state across sessions (user closes browser, comes back tomorrow)?
3. Two concurrent requests from the same user — how do you prevent state corruption?

---

## Q-05-A-011: How do you implement a router agent that dispatches to specialized sub-agents?

**Module:** Agentic AI
**Submodule:** Orchestration
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer, Senior / Architect
**Tags:** [agents, routing, classification, orchestration, multi-agent]
**Prerequisites:** Q-05-C-005, Q-05-A-008
**Estimated Interview Round:** Technical
**Why This Question Matters:** A single monolithic agent prompt degrades as capabilities grow. Router agents enable modular, maintainable, and scalable agent systems by directing requests to specialized handlers.

---

**Question**

You have an enterprise assistant with 8 different capabilities (HR, IT support, finance, travel, etc.). Design the routing layer that dispatches user requests to the right specialist agent.

---

**Expected Answer (Short)**

Routing options: (1) **LLM classifier** — prompt the LLM to classify intent and route (flexible, handles ambiguity). (2) **Embedding + classifier** — encode query, nearest-neighbor match to capability categories (fast, cheap). (3) **Hybrid** — embedding for first pass (top-3 candidates), LLM for final selection (accurate). Key: route with confidence — if confidence is low, ask a clarifying question. Handle multi-intent ("book me a flight AND submit a PTO request" → two routes).

---

**Deep Answer**

```python
class RouterAgent:
    def __init__(self, specialists, llm, embedding_model):
        self.specialists = specialists  # {"hr": HRAgent, "it": ITAgent, ...}
        self.llm = llm
        self.embedder = embedding_model
        self.route_descriptions = {
            name: agent.description for name, agent in specialists.items()
        }
    
    def route(self, user_message):
        # Fast pass: embedding similarity
        query_embedding = self.embedder.encode(user_message)
        scores = {
            name: cosine_sim(query_embedding, self.embedder.encode(desc))
            for name, desc in self.route_descriptions.items()
        }
        top_candidates = sorted(scores, key=scores.get, reverse=True)[:3]
        
        # If clear winner (score > 0.85 and gap > 0.15): route directly
        if scores[top_candidates[0]] > 0.85 and \
           scores[top_candidates[0]] - scores[top_candidates[1]] > 0.15:
            return top_candidates[0]
        
        # Ambiguous: use LLM to decide among top candidates
        route = self.llm.classify(
            user_message, 
            options={name: self.route_descriptions[name] for name in top_candidates}
        )
        return route
    
    def handle(self, user_message):
        route = self.route(user_message)
        if route == "clarify":
            return "I can help with HR, IT, finance, or travel. Could you specify which area?"
        return self.specialists[route].handle(user_message)
```

- **Multi-intent handling:** "Book a flight to NYC and submit PTO for those dates" → detect multiple intents, split, route to travel + HR separately, merge results.

---

**Follow-up Questions**

1. User message could go to HR or IT (laptop issue affecting work-from-home setup). How do you handle ambiguity?
2. You add a 9th capability. How do you update routing without breaking existing routes?
3. How do you detect when a request falls outside ALL capabilities?

---

## Q-05-A-012: How do you implement human-in-the-loop (HITL) for high-stakes agent actions?

**Module:** Agentic AI
**Submodule:** Safety & Guardrails
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer, Senior / Architect
**Tags:** [agents, human-in-the-loop, approval, safety, trust]
**Prerequisites:** Q-05-A-004, Q-05-A-010
**Estimated Interview Round:** Technical, System Design
**Why This Question Matters:** Not all agent actions should be autonomous. The ability to pause, request human approval, and resume is critical for production trust and compliance.

---

**Question**

Your agent can create, modify, and delete customer records. Design a human-in-the-loop system that requires approval for destructive actions while keeping low-risk actions autonomous.

---

**Expected Answer (Short)**

Design: (1) Classify actions into risk tiers (read=auto, create=auto with logging, modify=conditional approval, delete=always require approval). (2) When approval needed: serialize agent state, create approval request with context (what, why, impact), pause agent. (3) On approval: restore state, execute action, continue. On rejection: inform agent, let it plan alternative. Key: the pause/resume must be async — the human might take hours to respond.

---

**Deep Answer**

```python
class HITLExecutor:
    def __init__(self, approval_queue, risk_classifier):
        self.approval_queue = approval_queue
        self.risk_classifier = risk_classifier
    
    async def execute_action(self, action, agent_state):
        risk_level = self.risk_classifier.assess(action)
        
        if risk_level == "low":
            return await self._execute(action)
        
        if risk_level == "medium":
            # Auto-execute but log for async review
            result = await self._execute(action)
            await self._log_for_review(action, result)
            return result
        
        if risk_level == "high":
            # Pause and request approval
            request = ApprovalRequest(
                action=action,
                context=agent_state.summary(),
                impact=f"Will delete customer record {action.customer_id}",
                agent_state_snapshot=serialize(agent_state),
                expires_at=now() + timedelta(hours=24)
            )
            await self.approval_queue.submit(request)
            
            # Wait for human decision (async — could be hours)
            decision = await self.approval_queue.wait(request.id)
            
            if decision.approved:
                return await self._execute(action)
            else:
                return ActionResult(
                    success=False,
                    message=f"Action rejected by {decision.reviewer}: {decision.reason}"
                )
```

- **Key design decisions:**
  - State serialization must capture full context (so the human reviewer understands why)
  - Expiration: approval requests should expire to prevent stale actions
  - Bulk approval: group similar low-risk actions into batches for efficiency
  - Audit trail: every approved/rejected action is logged with who, when, why

---

**Follow-up Questions**

1. The approval queue average response time is 4 hours. How do you maintain conversation continuity?
2. How do you prevent the agent from finding workarounds to avoid the approval step?
3. When should you remove HITL and let the agent act autonomously?

---

## Q-05-A-013: How do you implement streaming responses for an agent that performs multi-step operations?

**Module:** Agentic AI
**Submodule:** UX Patterns
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer
**Tags:** [agents, streaming, ux, latency, real-time]
**Prerequisites:** Q-05-A-002, Q-05-A-010
**Estimated Interview Round:** Technical
**Why This Question Matters:** Agents that think for 30 seconds with no feedback feel broken. Streaming intermediate steps — "Searching...", "Analyzing 3 results...", "Drafting response..." — is essential for user trust.

---

**Question**

Your agent takes 15-30 seconds to complete a research task (multiple tool calls). Users see a blank screen until it's done. How do you provide real-time feedback?

---

**Expected Answer (Short)**

Stream intermediate state: (1) **Status updates** — "Searching knowledge base..." when a tool is called. (2) **Partial results** — "Found 3 relevant documents" as tools return. (3) **Thought streaming** — stream the LLM's reasoning tokens in real-time. (4) **Progress indication** — "Step 2 of 4: Analyzing results". Implementation: Server-Sent Events (SSE) or WebSocket; emit events for each agent loop iteration.

---

**Deep Answer**

```python
async def agent_stream(question, tools, llm):
    """Generator that yields intermediate results."""
    yield AgentEvent(type="status", content="Analyzing your question...")
    
    plan = await llm.plan(question)
    yield AgentEvent(type="plan", content=f"I'll need {len(plan)} steps")
    
    for i, step in enumerate(plan):
        yield AgentEvent(type="status", content=f"Step {i+1}/{len(plan)}: {step.description}")
        
        # Stream LLM thinking
        async for token in llm.stream(step.prompt):
            yield AgentEvent(type="thought_token", content=token)
        
        # Execute tool
        yield AgentEvent(type="tool_call", content=f"Using {step.tool}...")
        result = await tools[step.tool](**step.params)
        yield AgentEvent(type="tool_result", content=result.summary)
    
    # Stream final answer
    yield AgentEvent(type="status", content="Composing final answer...")
    async for token in llm.stream(synthesize_prompt):
        yield AgentEvent(type="answer_token", content=token)

# Client-side: SSE endpoint
@app.get("/agent/stream")
async def stream_endpoint(question: str):
    return StreamingResponse(
        agent_stream(question, tools, llm),
        media_type="text/event-stream"
    )
```

---

**Follow-up Questions**

1. A tool call takes 10 seconds. How do you keep the stream alive during that wait?
2. How do you handle streaming when the agent backtracks (realizes a step was wrong)?
3. Mobile clients on slow connections — how do you batch events efficiently?

---

## Q-05-A-014: How do you manage cost and token budget for an agent system?

**Module:** Agentic AI
**Submodule:** Production Operations
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Senior / Architect, DevOps / SRE → AIOps
**Tags:** [agents, cost, token-budget, optimization, production]
**Prerequisites:** Q-05-A-002, Q-03-A-008
**Estimated Interview Round:** Technical, System Design
**Why This Question Matters:** Agents make multiple LLM calls per user request. Without cost controls, a single complex query can cost $5-50 in API calls. Budget management is critical for production viability.

---

**Question**

Your agent averages 8 LLM calls per user query at $0.03/call. At 10K queries/day, that's $2,400/day. How do you reduce costs without degrading quality?

---

**Expected Answer (Short)**

Cost reduction strategies: (1) **LLM tiering** — use cheap model (GPT-4o-mini) for routing/classification, expensive model (GPT-4o) only for complex reasoning. (2) **Caching** — cache tool results and LLM responses for repeated queries. (3) **Token budget per query** — set max iterations/tokens per query, degrade gracefully when exceeded. (4) **Prompt optimization** — shorter system prompts, fewer few-shot examples. (5) **Batching** — batch similar tool calls. (6) **Early termination** — stop when confidence is high enough (don't over-research).

---

**Deep Answer**

```python
class CostAwareAgent:
    def __init__(self, budget_per_query=0.15):
        self.budget_per_query = budget_per_query
        self.models = {
            "router": "gpt-4o-mini",      # $0.001/call
            "simple": "gpt-4o-mini",      # $0.001/call  
            "complex": "gpt-4o",          # $0.03/call
        }
        self.cache = LRUCache(max_size=10000)
    
    def run(self, query):
        spent = 0.0
        
        # Route with cheap model
        complexity = self.classify_complexity(query)  # spent += $0.001
        
        if complexity == "simple":
            model = self.models["simple"]  # entire query handled by mini
        else:
            model = self.models["complex"]
        
        # Check cache before each LLM/tool call
        cache_key = hash(query + context)
        if cached := self.cache.get(cache_key):
            return cached
        
        # Budget-aware loop
        while spent < self.budget_per_query:
            response = llm.call(model, prompt)
            spent += estimate_cost(response)
            
            if has_final_answer(response):
                self.cache.set(cache_key, response)
                return response
        
        # Budget exceeded — return best partial answer
        return self.graceful_degrade(partial_results)
```

- **Impact analysis:**
  - LLM tiering alone: 60-70% cost reduction (most calls are routing/classification)
  - Response caching: 20-40% reduction for repeated query patterns
  - Prompt optimization: 10-20% reduction (shorter prompts = fewer input tokens)

---

**Follow-up Questions**

1. How do you monitor cost in real-time and alert when it spikes?
2. A single user is using 100x the average cost. How do you handle this?
3. Cost vs quality trade-off: how do you measure the quality impact of cost reduction?

---

## Q-05-A-015: How do you version and A/B test agent systems?

**Module:** Agentic AI
**Submodule:** Production Operations
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Senior / Architect, ML / Data Engineer
**Tags:** [agents, versioning, ab-testing, deployment, quality]
**Prerequisites:** Q-05-A-006, Q-06-A-003
**Estimated Interview Round:** Technical
**Why This Question Matters:** Agent behavior changes with every prompt edit, tool addition, or model update. Without versioning and A/B testing, you can't safely iterate.

---

**Question**

You want to test a new version of your agent that uses a different planning strategy. How do you A/B test agent systems?

---

**Expected Answer (Short)**

Agent A/B testing is harder than model A/B testing because: (1) Variable execution paths (same query, different tool calls each time). (2) Side effects (agent took an action in variant A — can't undo for variant B). (3) Latency variation. Approach: version the full agent config (prompt + model + tools + guardrails), split traffic by user/session, compare metrics (task completion, user satisfaction, cost, latency). Use session-sticky routing (same user stays on same variant throughout conversation).

---

**Deep Answer**

```python
@dataclass
class AgentVersion:
    version_id: str
    system_prompt: str
    model: str
    tools: list[str]
    planning_strategy: str  # "react" vs "plan-and-execute"
    guardrail_config: dict
    max_iterations: int

# A/B test config
ab_test = {
    "control": AgentVersion(version_id="v2.3", planning_strategy="react", model="gpt-4o"),
    "variant": AgentVersion(version_id="v2.4", planning_strategy="plan-and-execute", model="gpt-4o"),
    "traffic_split": 0.1,  # 10% to variant
    "metrics": ["task_completion_rate", "avg_latency", "avg_cost", "user_satisfaction"],
    "min_samples": 1000,  # statistical significance
    "duration_days": 14
}

def route_to_variant(user_id, ab_test):
    # Session-sticky: same user always gets same variant
    bucket = hash(user_id + ab_test["id"]) % 100
    if bucket < ab_test["traffic_split"] * 100:
        return ab_test["variant"]
    return ab_test["control"]
```

- **Metrics to compare:**
  - Task completion rate (primary)
  - Average steps to completion (efficiency)
  - Average cost per query
  - P95 latency
  - User satisfaction (thumbs up/down)
  - Guardrail violation rate

---

**Follow-up Questions**

1. The variant shows higher task completion but also higher cost. How do you decide?
2. Non-deterministic agents give different results each time. How do you account for variance?
3. How do you rollback if the variant is worse?

---
