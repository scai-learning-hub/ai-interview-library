# Module 05 — Agentic AI: Concept Level

---

## Q-05-C-001: What makes a system an "agent" vs a prompt chain, and what are the core components of an LLM agent?

**Module:** Agentic AI
**Submodule:** Agent Fundamentals
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Beginner, Early-career
**Persona Relevance:** Software Dev → AI Engineer, Fresher / Beginner
**Tags:** [agents, fundamentals, architecture, llm-agents]
**Prerequisites:** Q-02-C-001, Q-03-C-001
**Estimated Interview Round:** Screening, Technical
**Why This Question Matters:** The industry uses "agent" loosely. Understanding the precise distinction between a prompt chain and an agent is foundational — an agent has autonomy in deciding what to do next, while a prompt chain follows a fixed sequence.

---

**Question**

What distinguishes an LLM agent from a prompt chain? What are the four core components of an agent?

---

**Expected Answer (Short)**

An agent has a **control loop** — it decides at each step what action to take based on observations. A prompt chain follows a fixed, predetermined sequence. The four core components: (1) **LLM** (brain: reasoning and planning), (2) **Tools** (actions: search, code execution, APIs), (3) **Memory** (short-term: conversation state; long-term: knowledge), (4) **Planning/Orchestration** (decides which tool to call next, evaluates results, decides when to stop).

---

**Deep Answer**

| Feature | Prompt Chain | Agent |
|---------|-------------|-------|
| Control flow | Fixed, predetermined | Dynamic, decided at runtime |
| Decision making | None (follows template) | LLM decides next action |
| Tool use | Optional, fixed order | Yes, selected dynamically |
| Loops | No loops (linear) | Can loop, retry, backtrack |
| Stopping condition | After last step | LLM decides when done |
| Complexity | Simple, predictable | Complex, variable execution paths |

- **Agent architecture:**
  ```
  User Query → Planning → [Action → Observation → Reasoning]* → Final Answer
  
  The [Action → Observation → Reasoning] loop continues until:
  - Agent decides it has enough information
  - Max iterations reached (safety limit)
  - Error threshold exceeded
  ```

- **Core components:**
  1. **LLM (Brain):** Reasons about the task, generates plans, decides actions
  2. **Tools (Hands):** Functions the agent can call — search, calculator, code execution, APIs
  3. **Memory (Context):** Working memory (current conversation), episodic memory (past interactions), semantic memory (knowledge base)
  4. **Orchestrator (Loop):** Manages the agent loop — calls LLM, executes tools, feeds observations back, checks stopping conditions

---

**Follow-up Questions**

1. When should you use a prompt chain instead of an agent? (simpler, more predictable, cheaper)
2. Can an agent call another agent? How?
3. What happens when the LLM enters an infinite loop?

---

**Common Weak Answers / Red Flags**

- "An agent is just a chatbot with tools" — misses the control loop
- Can't distinguish agent from prompt chain
- No mention of planning or decision-making

---

**Interviewer Evaluation Signal**

Foundational understanding. The candidate should clearly articulate: agents have autonomous decision-making in a loop; prompt chains follow fixed sequences.

---

## Q-05-C-002: Explain the ReAct, Plan-and-Execute, and Router agent architectures.

**Module:** Agentic AI
**Submodule:** Agent Architectures
**Level:** Concept
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer, ML / Data Engineer
**Tags:** [react, plan-and-execute, router, agent-architectures, agents]
**Prerequisites:** Q-05-C-001
**Estimated Interview Round:** Technical
**Why This Question Matters:** Different tasks require different agent architectures. ReAct is reactive (think-act-observe), Plan-and-Execute separates planning from execution, and Router dispatches to specialized sub-agents. Choosing the right architecture affects reliability, latency, and cost.

---

**Question**

Compare ReAct, Plan-and-Execute, and Router agent patterns. When would you choose each?

---

**Expected Answer (Short)**

**ReAct:** Interleaves Reasoning and Acting. At each step, the LLM thinks (reason), decides an action, observes the result, then thinks again. Best for: simple tasks, few tools, exploratory queries. **Plan-and-Execute:** First creates a full plan (list of steps), then executes each step. Can re-plan if a step fails. Best for: complex multi-step tasks, deterministic workflows. **Router:** Classifies the query and routes to a specialized agent/chain. Best for: diverse query types each needing different handling (e.g., support routing to billing vs technical agents).

---

**Deep Answer**

| Pattern | Flow | Strengths | Weaknesses |
|---------|------|-----------|-----------|
| ReAct | Think → Act → Observe → Think → ... | Simple, flexible, good for exploration | Can loop, expensive (many LLM calls), hard to predict execution |
| Plan-and-Execute | Plan → Execute Step 1 → ... → Execute Step N | Efficient (plan once), predictable, supports complex tasks | Upfront plan may be wrong, re-planning adds complexity |
| Router | Classify → Route to Agent A/B/C | Fast routing, specialized agents per task, modular | Misrouting = wrong answer, doesn't handle mixed queries |

- **ReAct example (few tools, exploratory):**
  ```
  User: "What's the weather in the city where Apple HQ is?"
  
  Think: I need to find where Apple HQ is located.
  Act: search("Apple headquarters location")
  Observe: Apple Park, Cupertino, California
  Think: Now I need the weather in Cupertino.
  Act: weather_api("Cupertino, CA")
  Observe: 72°F, sunny
  Think: I have the answer.
  Answer: The weather in Cupertino (Apple HQ) is 72°F and sunny.
  ```

- **Plan-and-Execute example (complex, multi-step):**
  ```
  User: "Generate a quarterly report comparing our Q1 vs Q2 revenue, top customers, and churn."
  
  Plan:
  1. Query database for Q1 revenue figures
  2. Query database for Q2 revenue figures
  3. Get top 10 customers by revenue for each quarter
  4. Calculate churn rate for each quarter
  5. Generate comparison report with charts
  
  Execute: [Steps 1-5 sequentially, re-plan if step fails]
  ```

- **Router example (diverse query types):**
  ```
  User query → Classifier
  ├── "Billing question" → Billing Agent (has CRM tools)
  ├── "Technical issue" → Support Agent (has docs + ticketing tools)
  ├── "Product info" → Sales Agent (has product DB tools)
  └── "General" → General Agent (basic RAG)
  ```

---

**Follow-up Questions**

1. Can you combine these patterns? (e.g., Router → Plan-and-Execute)
2. ReAct uses 5-10 LLM calls per query. How do you control cost?
3. Plan-and-Execute creates a bad plan. How does the agent recover?

---

**Common Weak Answers / Red Flags**

- Only knows ReAct, unaware of other patterns
- "Always use ReAct" — wrong, different tasks need different patterns
- Can't explain when Plan-and-Execute is better than ReAct

---

**Interviewer Evaluation Signal**

Architecture selection skills. The candidate should match agent patterns to use cases and explain the trade-offs (flexibility vs cost vs reliability).

---

## Q-05-C-003: How does tool calling work in LLM agents? What is function calling?

**Module:** Agentic AI
**Submodule:** Tool Calling
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Early-career, Mid-level
**Persona Relevance:** Software Dev → AI Engineer, Fresher / Beginner
**Tags:** [tool-calling, function-calling, agents, openai-functions]
**Prerequisites:** Q-03-C-001
**Estimated Interview Round:** Technical
**Why This Question Matters:** Tool calling is how agents interact with the external world. Function calling (OpenAI, Anthropic, etc.) is the standardized API for this. Understanding the flow — LLM generates structured tool call → application executes → result fed back — is essential for building agents.

---

**Question**

Explain the function calling flow: how does the LLM "call" a tool? What does the LLM actually output?

---

**Expected Answer (Short)**

The LLM doesn't execute tools directly. Flow: (1) You describe available tools (function name, description, parameters as JSON schema) in the system message. (2) LLM decides to call a tool by outputting a structured JSON object with function name and arguments. (3) Your application code parses this JSON, executes the actual function. (4) You send the function result back to the LLM as a new message. (5) LLM uses the result to continue reasoning or generate the final answer. The LLM only generates text (the tool call JSON) — execution happens in your code.

---

**Deep Answer**

- **Function calling flow:**
  ```
  Step 1: Define tools in system message
  tools = [{
    "type": "function",
    "function": {
      "name": "get_weather",
      "description": "Get current weather for a city",
      "parameters": {
        "type": "object",
        "properties": {
          "city": {"type": "string", "description": "City name"},
          "units": {"type": "string", "enum": ["celsius", "fahrenheit"]}
        },
        "required": ["city"]
      }
    }
  }]
  
  Step 2: LLM generates a tool call (structured output, not free text)
  # LLM response:
  {
    "tool_calls": [{
      "id": "call_abc123",
      "function": {
        "name": "get_weather",
        "arguments": "{\"city\": \"San Francisco\", \"units\": \"celsius\"}"
      }
    }]
  }
  
  Step 3: YOUR CODE executes the function
  result = get_weather(city="San Francisco", units="celsius")
  # result = {"temp": 18, "condition": "foggy"}
  
  Step 4: Send result back as a tool message
  messages.append({
    "role": "tool",
    "tool_call_id": "call_abc123",
    "content": json.dumps(result)
  })
  
  Step 5: LLM generates final answer using the result
  # "The weather in San Francisco is 18°C and foggy."
  ```

- **Key points:**
  - LLM never executes code — it only generates JSON describing what to call
  - Tool descriptions act as a "menu" for the LLM
  - Quality of tool descriptions directly affects tool selection accuracy
  - LLM can call multiple tools in parallel (parallel function calling)

---

**Follow-up Questions**

1. The LLM calls a tool that doesn't exist. How do you handle this?
2. How do you design a good tool description that minimizes misuse?
3. Can the LLM call tools in parallel? When is this useful?

---

**Common Weak Answers / Red Flags**

- "The LLM executes the function" — it generates the call, your code executes
- Doesn't understand the multi-step message flow
- No awareness of the importance of tool descriptions

---

**Interviewer Evaluation Signal**

Understanding the execution boundary between LLM and application. The model generates structured JSON; your code executes. This is fundamental to building safe agents.

---

## Q-05-C-004: What are the different types of agent memory, and why does memory architecture matter?

**Module:** Agentic AI
**Submodule:** Memory
**Level:** Concept
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer, ML / Data Engineer
**Tags:** [memory, working-memory, long-term-memory, agents]
**Prerequisites:** Q-05-C-001
**Estimated Interview Round:** Technical
**Why This Question Matters:** Without memory, agents are stateless — they can't learn from previous interactions, reference past decisions, or maintain context across long tasks. Memory architecture determines what an agent can remember, for how long, and how efficiently.

---

**Question**

Describe the types of memory in an LLM agent and explain when each is needed.

---

**Expected Answer (Short)**

Three types: (1) **Working memory (short-term):** Current conversation context, tool call history, intermediate results. Stored in the prompt itself. Limited by context window. (2) **Episodic memory:** Records of past interactions and outcomes. Stored in a database, retrieved when relevant. Enables "remember when the user asked about X last week." (3) **Semantic memory:** Long-term knowledge about the world, user preferences, learned facts. Stored in a vector DB or knowledge graph. Enables "the user prefers Python over Java" persistently.

---

**Deep Answer**

| Memory Type | Duration | Storage | Example |
|-------------|----------|---------|---------|
| Working | Current task/conversation | LLM context window | "User asked about weather → I called weather API → result was 72°F" |
| Episodic | Across conversations | Database/Vector DB | "Last week, user asked about refund policy and was frustrated with the answer" |
| Semantic | Permanent knowledge | Vector DB / KG | "User is an enterprise customer, prefers formal tone, works in finance" |
| Procedural | Learned behaviors | Prompt/Fine-tuned weights | "When user says 'urgent', escalate to high-priority" |

- **Working memory management:**
  ```
  Challenge: LLM context window is finite (128K tokens)
  
  Strategies:
  1. Sliding window: keep last N messages
  2. Summary compression: summarize older messages
  3. Key-value store: extract key facts, discard raw messages
  4. Retrieval: store all messages, retrieve relevant ones per query
  ```

- **Memory architecture patterns:**
  ```
  Simple Agent: Working memory only (conversation history in prompt)
  ├── Good for: single-task, short conversations
  └── Fails for: multi-session, personalization
  
  Memory-Augmented Agent: Working + Episodic + Semantic
  ├── Working: current conversation
  ├── Episodic: auto-saved interaction summaries
  ├── Semantic: user preferences, learned facts
  └── On each turn: retrieve relevant memories → inject into prompt
  ```

---

**Follow-up Questions**

1. Your agent has 50 past conversations. How do you decide which memories to retrieve for the current query?
2. The context window fills up mid-task. How does the agent continue?
3. How do you handle conflicting memories (user said they like A, now says they prefer B)?

---

**Common Weak Answers / Red Flags**

- "Memory is just the conversation history" — too narrow
- No awareness of long-term memory across conversations
- Doesn't understand context window limitations

---

**Interviewer Evaluation Signal**

Memory design thinking. The candidate should distinguish memory types and explain how each enables different agent capabilities.

---

## Q-05-C-005: What are agent guardrails and safety mechanisms? Why are they critical?

**Module:** Agentic AI
**Submodule:** Safety
**Level:** Concept
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer, Senior / Architect
**Tags:** [guardrails, safety, agent-security, alignment, agents]
**Prerequisites:** Q-05-C-001, Q-05-C-003
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** Agents can take real-world actions (send emails, modify databases, deploy code). Without guardrails, a misbehaving agent can cause real damage. Guardrails are the most safety-critical component of any agent system.

---

**Question**

What types of guardrails do LLM agents need, and how do you implement them?

---

**Expected Answer (Short)**

Four layers: (1) **Input guardrails:** Validate and sanitize user input before it reaches the agent (prompt injection detection, PII filtering). (2) **Planning guardrails:** Limit what the agent can plan to do (restricted tool list, budget limits on API calls, max iterations). (3) **Action guardrails:** Validate tool calls before execution (parameter validation, permission checks, human-in-the-loop for dangerous actions). (4) **Output guardrails:** Filter agent responses (PII detection, toxicity check, hallucination detection).

---

**Deep Answer**

| Layer | Examples | Implementation |
|-------|----------|---------------|
| Input | Prompt injection, PII in query | Input classifier, regex/ML filter |
| Planning | Agent plans to delete all files | Tool whitelist, action budget, prohibited actions list |
| Action | Sends email to wrong person | Parameter validation, confirmation for destructive actions |
| Output | Leaks internal data | PII scanner, content filter |
| Loop | Agent stuck in infinite loop | Max iterations (10-20), max tokens budget, timeout |

- **Human-in-the-loop:**
  ```python
  class GuardedAgent:
      DANGEROUS_TOOLS = {"delete_file", "send_email", "execute_sql", "deploy"}
      
      def execute_tool(self, tool_name, args):
          # Input validation
          if not self.validate_args(tool_name, args):
              return {"error": "Invalid arguments"}
          
          # Dangerous action → require human approval
          if tool_name in self.DANGEROUS_TOOLS:
              approved = self.request_human_approval(tool_name, args)
              if not approved:
                  return {"error": "Action rejected by human reviewer"}
          
          # Budget check
          if self.budget.exceeded():
              return {"error": "Action budget exceeded"}
          
          # Execute with timeout
          result = self.tools[tool_name].execute(args, timeout=30)
          return result
  ```

- **Agent budget system:**
  ```
  Per-task limits:
  - Max LLM calls: 20
  - Max tool calls: 15
  - Max total tokens: 100K
  - Max wall-clock time: 5 minutes
  - Max cost: $0.50
  
  If any limit exceeded → gracefully stop, return partial result
  ```

---

**Follow-up Questions**

1. An agent finds a way to use a "safe" tool to accomplish a "dangerous" action (e.g., writing a shell command to a file, then executing it). How do you prevent this?
2. How do you balance safety guardrails with agent autonomy?
3. How do you test guardrails? Can you red-team an agent?

---

**Common Weak Answers / Red Flags**

- "Just use a good prompt to tell the agent to be safe" — prompts can be bypassed
- No budget/iteration limits
- No human-in-the-loop for dangerous actions
- Unaware of prompt injection risks in tool outputs

---

**Interviewer Evaluation Signal**

Safety-first engineering. Agents that take real-world actions MUST have guardrails. The candidate should describe multiple layers of protection, not just a "be careful" prompt.

---

## Q-05-C-006: What is multi-agent orchestration and what are the common patterns?

**Module:** Agentic AI
**Submodule:** Multi-Agent
**Level:** Concept
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Senior / Architect, Software Dev → AI Engineer
**Tags:** [multi-agent, orchestration, collaboration, agents]
**Prerequisites:** Q-05-C-001, Q-05-C-002
**Estimated Interview Round:** Technical
**Why This Question Matters:** Complex tasks benefit from multiple specialized agents working together rather than one general-purpose agent. Multi-agent patterns enable modularity, specialization, and parallel execution.

---

**Question**

When would you use multiple agents instead of one, and what are the orchestration patterns?

---

**Expected Answer (Short)**

Use multiple agents when: the task spans multiple domains (each agent specializes), tasks can run in parallel, or you need separation of concerns for safety. Patterns: (1) **Supervisor:** One manager agent delegates to worker agents and synthesizes results. (2) **Sequential/Pipeline:** Agents pass work to the next agent in order (analyst → writer → reviewer). (3) **Debate/Consensus:** Multiple agents generate answers, then vote or discuss to reach consensus. (4) **Hierarchical:** Multi-level management structure for complex organizations.

---

**Deep Answer**

| Pattern | Flow | Best For |
|---------|------|----------|
| Supervisor | Manager → Workers → Manager synthesizes | Diverse sub-tasks, need coordination |
| Pipeline | Agent A → Agent B → Agent C | Linear workflows (analyze → write → review) |
| Debate | Agent A + Agent B → Discuss → Consensus | High-stakes decisions needing diverse perspectives |
| Hierarchical | CEO → Managers → Workers | Complex organizations, enterprise workflows |
| Peer-to-peer | Agents communicate directly | Collaborative tasks without clear hierarchy |

- **Supervisor pattern example:**
  ```
  User: "Create a marketing strategy for our new AI product"
  
  Supervisor Agent → decomposes:
  ├── Market Research Agent: "Analyze competitor landscape"
  ├── Content Agent: "Draft messaging and positioning"
  ├── Analytics Agent: "Model market size and projections"
  └── Supervisor Agent: synthesizes all results into strategy document
  ```

- **Pipeline pattern example:**
  ```
  Code Review Pipeline:
  Agent 1 (Analyzer): Reads code, identifies potential issues
  → Agent 2 (Security Reviewer): Checks for security vulnerabilities
  → Agent 3 (Formatter): Generates structured review report
  ```

---

**Follow-up Questions**

1. Two agents disagree on an approach. How does the system resolve this?
2. One agent is significantly slower than others. How do you handle the bottleneck?
3. How do agents share context with each other?

---

**Common Weak Answers / Red Flags**

- "Just have one agent do everything" — doesn't scale for complex tasks
- No awareness of communication overhead between agents
- Can't articulate when multi-agent is better than single-agent

---

**Interviewer Evaluation Signal**

System design thinking applied to agents. The candidate should match orchestration patterns to use cases and understand the trade-offs (specialization vs communication overhead).

---

## Q-05-C-007: What is the difference between structured tool outputs and unstructured tool outputs, and how does this affect agent reliability?

**Module:** Agentic AI
**Submodule:** Tool Design
**Level:** Concept
**Difficulty:** 2
**Experience Bands:** Early-career, Mid-level
**Persona Relevance:** Software Dev → AI Engineer
**Tags:** [tool-design, structured-output, reliability, agents]
**Prerequisites:** Q-05-C-003
**Estimated Interview Round:** Technical
**Why This Question Matters:** Tool output format directly affects agent reliability. If a tool returns unstructured text, the LLM must parse it — and parsing can fail. Structured outputs (JSON) are deterministic and parseable by code, reducing the LLM's burden and the agent's error rate.

---

**Question**

You're designing tools for an agent. Should tools return raw text or structured JSON? How does this affect agent behavior?

---

**Expected Answer (Short)**

Always prefer structured (JSON) outputs. Reasons: (1) Code parses JSON deterministically; text parsing by LLM is unreliable. (2) Structured outputs can include explicit status codes (success/error), enabling programmatic error handling. (3) The agent's LLM doesn't need to extract data from free text — reducing hallucination risk. (4) Structured outputs are loggable and testable. Exception: when the tool produces natural language that the agent should pass to the user (e.g., a content generation tool).

---

**Deep Answer**

| Aspect | Structured (JSON) | Unstructured (Text) |
|--------|-------------------|-------------------|
| Parsing | Deterministic (code) | Non-deterministic (LLM) |
| Error handling | `{"status": "error", "message": "..."}` | LLM must infer error from text |
| Composability | Output feeds directly into next tool | LLM must extract fields first |
| Logging | Structured, queryable | Free text, hard to analyze |
| LLM token cost | Small JSON = fewer tokens | Long text = more tokens in context |

- **Good tool design:**
  ```python
  # Good: Structured output
  def search_orders(customer_id: str, status: str = None) -> dict:
      """Search customer orders. Returns structured order list."""
      orders = db.query(customer_id=customer_id, status=status)
      return {
          "status": "success",
          "count": len(orders),
          "orders": [{"id": o.id, "total": o.total, "date": o.date} for o in orders],
          "has_more": len(orders) == 100  # Pagination signal
      }
  
  # Bad: Unstructured output
  def search_orders(customer_id: str) -> str:
      orders = db.query(customer_id=customer_id)
      return f"Found {len(orders)} orders: " + ", ".join([str(o) for o in orders])
  ```

---

**Follow-up Questions**

1. When would you intentionally return unstructured text from a tool?
2. How do you handle tools that return very large structured outputs (1000+ items)?
3. The LLM ignores structured fields and hallucinates different values. Why?

---

**Common Weak Answers / Red Flags**

- "Just return text, the LLM can parse it" — unreliable
- No error status in tool outputs
- No consideration of output size and token budget

---

**Interviewer Evaluation Signal**

Tool engineering discipline. Structured outputs make agents reliable. The candidate should understand why deterministic parsing beats LLM-driven text extraction.
