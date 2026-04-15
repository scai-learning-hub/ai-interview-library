# Module 05 — Agentic AI: Debugging Level

---

## Q-05-D-001: Your agent is stuck in an infinite loop — calling the same tool repeatedly with the same arguments. How do you fix it?

**Module:** Agentic AI
**Submodule:** Agent Loops
**Level:** Debugging
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer, ML / Data Engineer
**Tags:** [agents, debugging, infinite-loop, tool-use, stuck]
**Prerequisites:** Q-05-A-002, Q-05-A-007
**Estimated Interview Round:** Debugging, Technical
**Why This Question Matters:** Infinite loops are the #1 agent failure mode. They waste tokens/money, degrade user experience, and can have side effects if the repeated tool has write operations.

---

**Question**

Your ReAct agent keeps calling `search_documents("quarterly revenue")` repeatedly. Each time it gets the same results, reasons "I need more information", and searches again. It hits the max iteration limit every time. Diagnose and fix.

---

**Expected Answer (Short)**

Causes: (1) Search results don't contain what the agent needs — it doesn't know how to proceed without that information and defaults to retrying. (2) Observation format is unclear — the agent can't extract useful info from the tool response. (3) No memory of previous actions — the agent doesn't realize it already searched. Fixes: (1) Add loop detection (track action+param pairs, block repeats). (2) Include action history in prompt ("You already searched X and got Y"). (3) Add an explicit "give up" or "ask user" action. (4) Improve tool response format to be more parseable.

---

**Deep Answer**

```python
class LoopDetector:
    def __init__(self, max_repeats=2):
        self.action_history = []
        self.max_repeats = max_repeats
    
    def check(self, action, params):
        key = (action, str(params))
        count = self.action_history.count(key)
        self.action_history.append(key)
        
        if count >= self.max_repeats:
            return LoopDetected(
                message=f"You've already called {action} with these params {count} times. "
                        f"Results won't change. Consider: (1) trying different search terms, "
                        f"(2) using a different tool, (3) answering with available info, "
                        f"(4) asking the user for clarification."
            )
        return None

# Inject into ReAct loop:
def react_step(agent, action, params):
    loop_check = loop_detector.check(action, params)
    if loop_check:
        # Return the loop detection message as the observation
        return loop_check.message  # Agent sees this instead of tool result
    return execute_tool(action, params)
```

- **Root cause analysis:**
  - The LLM gets stuck because its prompt says "use tools to find information" but doesn't have an exit strategy for "tool doesn't have what I need"
  - Fix: system prompt must include explicit instructions: "If a tool doesn't return useful results after 2 attempts, work with what you have or ask the user"

- **Prevention patterns:**
  - Include action history summary in each prompt iteration
  - Monotonically increasing "steps remaining" counter: "You have 3 steps left"
  - Diversify: after a repeated action, force the agent to choose a DIFFERENT tool

---

**Follow-up Questions**

1. The agent doesn't loop on the same action but cycles between two actions endlessly (A→B→A→B). How do you detect this?
2. The loop has side effects (each iteration creates a duplicate support ticket). How do you handle this?
3. How do you distinguish a legitimate retry (transient error) from a loop?

---

## Q-05-D-002: Your agent hallucinates tool calls — calling tools that don't exist or passing invalid parameters. How do you debug?

**Module:** Agentic AI
**Submodule:** Tool Failures
**Level:** Debugging
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer, ML / Data Engineer
**Tags:** [agents, debugging, hallucination, tool-use, validation]
**Prerequisites:** Q-05-A-001, Q-05-A-009
**Estimated Interview Round:** Debugging, Technical
**Why This Question Matters:** LLMs frequently invent tools or params that don't exist. Without robust validation, these hallucinated calls crash the agent or worse — get silently misrouted.

---

**Question**

Your agent sometimes calls `search_internet(query="...")` even though only `search_documents` and `search_knowledge_base` are available. It also passes `{"max_results": "five"}` (string instead of int). Diagnose and fix.

---

**Expected Answer (Short)**

Root causes: (1) Tool descriptions are ambiguous — "search_documents" vs "search_knowledge_base" unclear boundary. (2) Model trained on similar tools from other contexts — "search_internet" is a common tool in training data. (3) No strict validation layer between LLM output and tool execution. Fixes: (1) Add a validation layer that checks tool name exists before execution. (2) Fuzzy match to nearest valid tool with confirmation. (3) Return structured error messages so the agent self-corrects. (4) Reduce tool ambiguity — consolidate similar tools.

---

**Deep Answer**

```python
class ToolValidator:
    def __init__(self, available_tools):
        self.tools = {t.name: t for t in available_tools}
        self.tool_names = set(self.tools.keys())
    
    def validate_call(self, tool_name, params):
        # Check tool exists
        if tool_name not in self.tool_names:
            closest = self.fuzzy_match(tool_name)
            return ValidationError(
                f"Tool '{tool_name}' does not exist. "
                f"Available tools: {list(self.tool_names)}. "
                f"Did you mean '{closest}'?"
            )
        
        tool = self.tools[tool_name]
        
        # Validate parameter types
        for param_name, param_value in params.items():
            expected_type = tool.schema[param_name]["type"]
            if not isinstance(param_value, expected_type):
                try:
                    params[param_name] = expected_type(param_value)  # Auto-coerce
                except (ValueError, TypeError):
                    return ValidationError(
                        f"Parameter '{param_name}' must be {expected_type.__name__}, "
                        f"got {type(param_value).__name__}: {param_value}"
                    )
        
        # Check required params present
        for required in tool.required_params:
            if required not in params:
                return ValidationError(f"Missing required parameter: '{required}'")
        
        return ValidatedCall(tool_name, params)
```

- **Reducing hallucinated tool calls:**
  - Fewer tools in the prompt = less confusion (5-7 tools optimal)
  - Distinct tool names — never similar-sounding tools
  - Include tools in system prompt, not user message (less likely to be ignored)
  - Use function calling API (constrained to declared functions) instead of free-text parsing

---

**Follow-up Questions**

1. The model consistently chooses the wrong tool between two similar options. How do you fix without removing a tool?
2. Your validation auto-corrects parameters but introduces subtle errors. When is auto-correction dangerous?
3. How do you test that an agent uses tools correctly across edge cases?

---

## Q-05-D-003: Your multi-agent system produces inconsistent results — the same query gives different answers each time. How do you debug?

**Module:** Agentic AI
**Submodule:** Multi-Agent
**Level:** Debugging
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, ML / Data Engineer
**Tags:** [agents, debugging, multi-agent, consistency, non-determinism]
**Prerequisites:** Q-05-A-008, Q-05-S-001
**Estimated Interview Round:** Debugging, Deep Dive
**Why This Question Matters:** Non-determinism is inherent in LLMs, but excessive inconsistency in multi-agent systems indicates architecture problems. Users expect reasonable consistency.

---

**Question**

Your multi-agent research system produces vastly different reports for the same query run 5 minutes apart. The reports contradict each other on key facts. Diagnose and fix.

---

**Expected Answer (Short)**

Sources of inconsistency: (1) **LLM temperature** — nonzero temperature → different outputs each run. (2) **Tool result variation** — live search results change, cached data expires. (3) **Agent routing** — different specialist agents chosen based on non-deterministic classification. (4) **Ordering effects** — parallel sub-agents return in different orders, affecting synthesis. (5) **Context window differences** — different memory retrieval each time. Fixes: temperature=0 for factual tasks, cache tool results with TTL, deterministic routing, ordered synthesis.

---

**Deep Answer**

- **Diagnosis steps:**
  1. Compare trace logs from both runs side by side
  2. Identify first divergence point — where do the runs start differing?
  3. Common divergence sources:

  ```
  Run 1: Router → Research Agent → [search("X")] → 3 results → Synthesize → Report A
  Run 2: Router → Research Agent → [search("X")] → 2 results → Synthesize → Report B
                                                     ^-- Search returned different results
  ```

- **Fixing each source:**
  - **Temperature:** `temperature=0` for factual/analytical tasks. Still not 100% deterministic (batching effects) but much more consistent.
  - **Tool caching:** Cache search results with short TTL (5-15 min). Same query within TTL gets same results.
  - **Deterministic routing:** Hash the query for consistent routing. Same query always goes to same specialist.
  - **Context normalization:** Sort retrieved memories/documents by relevance score, take top-K. Consistent retrieval = consistent context.
  - **Version pinning:** Pin model version explicitly (`gpt-4o-2024-08-06` not `gpt-4o`).

- **When inconsistency is acceptable:**
  - Creative tasks (brainstorming, writing)
  - Low-stakes informational queries
  - When users explicitly want variety

- **When it's not acceptable:**
  - Financial calculations
  - Compliance-related outputs
  - Any task where two users comparing outputs would lose trust

---

**Follow-up Questions**

1. Despite temperature=0, outputs still vary slightly between runs. Why?
2. You need consistency but also want the agent to improve over time. How do you balance?
3. How do you test for consistency in your CI/CD pipeline?

---

## Q-05-D-004: Your agent's tool calls succeed but it misinterprets the results, leading to wrong conclusions. How do you debug?

**Module:** Agentic AI
**Submodule:** Reasoning Failures
**Level:** Debugging
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** ML / Data Engineer, Senior / Architect
**Tags:** [agents, debugging, reasoning, misinterpretation, tool-results]
**Prerequisites:** Q-05-A-001, Q-05-A-002
**Estimated Interview Round:** Debugging, Deep Dive
**Why This Question Matters:** The hardest agent bugs aren't tool failures — they're correct tool results that the agent misinterprets. The tool works fine; the reasoning about the result is wrong.

---

**Question**

Your agent searches for "Q3 revenue" and correctly retrieves a document saying "Q3 revenue was $4.2M, down 15% from Q2." The agent then tells the user "Revenue is growing at 15%." The tool worked, the retrieval was correct — but the answer is wrong. How do you debug and prevent this?

---

**Expected Answer (Short)**

This is a reasoning/comprehension failure, not a tool failure. Debugging: (1) Log the full reasoning chain — see exactly how the agent interpreted the tool result. (2) Check if the tool output format is ambiguous (does "down 15%" need clearer formatting?). (3) Check prompt instructions — does the system prompt instruct careful reading? Fixes: (1) Structured tool outputs (explicit fields: `{"direction": "decrease", "percentage": 15}` instead of prose). (2) Verification step — ask the agent to re-read and confirm key facts before finalizing. (3) Fact extraction as a separate step — extract numbers and directions from text before reasoning.

---

**Deep Answer**

```python
# Problem: prose tool output is ambiguous
tool_result = "Q3 revenue was $4.2M, down 15% from Q2."
# LLM focuses on "15%" and misses "down"

# Fix 1: Structured tool output
tool_result = {
    "metric": "revenue",
    "period": "Q3",
    "value": 4200000,
    "change_from_previous": -0.15,  # Negative = decrease, unambiguous
    "direction": "decrease",
    "previous_period": "Q2",
    "source": "financial_report_2024.pdf"
}

# Fix 2: Verification step in agent loop
VERIFY_PROMPT = """Before finalizing your answer, verify:
1. Re-read the tool results below carefully
2. List the key facts (numbers, directions, entities)
3. Check if your answer is consistent with ALL the facts

Tool results: {tool_results}
Your draft answer: {draft_answer}
Are there any contradictions? If yes, correct your answer."""

# Fix 3: Fact extraction pipeline
def extract_facts(tool_result_text):
    """Separate step to extract structured facts from prose."""
    facts = llm.extract(
        prompt="Extract all numerical facts as structured data:",
        text=tool_result_text,
        output_format=FactList
    )
    return facts  # [Fact(metric="revenue", value=4.2M, direction="down", magnitude="15%")]
```

- **Root causes of misinterpretation:**
  - **Information overload** — tool returns 2000 words, agent skims and misses details
  - **Recency bias** — agent fixates on the last piece of information
  - **Confirmation bias** — agent had a hypothesis and unconsciously confirms it
  - **Ambiguous formatting** — "15%" without "down" on the same line, agent misattributes

- **Prevention strategies:**
  - Return shorter, structured tool results (not full documents)
  - Highlight key facts in tool output formatting
  - Add explicit "double-check" step in agent loop for high-stakes answers
  - Use a separate verification agent (cheaper model, focused only on fact-checking)

---

**Follow-up Questions**

1. The agent correctly interprets individual tool results but draws wrong conclusions when combining results from multiple tools. How do you debug?
2. How do you build an automated test for reasoning correctness (not just tool correctness)?
3. When should you use a separate verification agent vs. self-verification?

---

## Q-05-D-005: Your agent works perfectly in testing but fails for 30% of real users. What's happening?

**Module:** Agentic AI
**Submodule:** Production Failures
**Level:** Debugging
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, DevOps / SRE → AIOps
**Tags:** [agents, debugging, production, distribution-shift, real-world, testing-gaps]
**Prerequisites:** Q-05-A-006, Q-05-S-004
**Estimated Interview Round:** Debugging, Deep Dive
**Why This Question Matters:** The gap between test performance and production performance is the defining challenge of agent deployment. Understanding why and how to close this gap separates lab prototypes from production systems.

---

**Question**

Your agent scores 95% on your evaluation benchmark but real user satisfaction is only 65%. Tests use well-formatted single-intent questions; real users send typos, multi-intent messages, incomplete requests, and follow-ups that reference previous conversations. Diagnose and fix.

---

**Expected Answer (Short)**

Classic distribution shift between test and production. Root causes: (1) **Test queries too clean** — no typos, slang, or ambiguity. (2) **Single-turn test, multi-turn production** — context dependency not tested. (3) **No edge cases** — missing personas like impatient user, confused user, adversarial user. (4) **Tool environment differs** — test tools return mocked/stable data; production tools return variable, sometimes empty results. Fixes: (1) Sample real user queries for test set. (2) Test with multi-turn conversations. (3) Build persona-based test suites. (4) Test with real tools (or realistic mocks). (5) Shadow mode: run new agent alongside old one, compare.

---

**Deep Answer**

```python
# Test distribution vs production distribution gap
test_queries = [
    "What is the refund policy?",                    # Clean, single intent
    "How do I reset my password?",                   # Clear, single intent
]

production_queries = [
    "ya so i bought this thing n its broken can u help also change my address",  # Typos, multi-intent
    "the thing from last time",                       # Relies on context
    "I WANT A REFUND NOW THIS IS RIDICULOUS",        # Emotional, caps
    "refund?",                                        # Ambiguous, underspecified
    "is this AI? im not talking to a robot",          # Meta-query
    "do what you did for my friend sarah",            # Privacy boundary
]

# Fix: Build realistic test suite
class ProductionTestSuite:
    categories = {
        "clean_queries": 0.2,          # What tests usually cover
        "typos_and_slang": 0.15,       # "how dis wrk"
        "multi_intent": 0.15,          # "do X and also Y"
        "underspecified": 0.1,         # "help"
        "context_dependent": 0.15,     # "what about the other one?"
        "emotional": 0.1,             # Frustrated, angry users
        "adversarial": 0.05,          # Prompt injection, boundary testing
        "meta_queries": 0.05,         # "are you AI?"
        "multi_turn_conversations": 0.05,  # Full conversation flows
    }
```

- **Closing the gap:**
  1. **Weekly sampling:** Pull 100 random production sessions, categorize failures
  2. **Failure taxonomy:** Track top 5 failure modes, add to test suite
  3. **Shadow mode:** Run new agent version on 100% of traffic in read-only mode, compare outputs to production agent
  4. **User simulation:** Build LLM-powered user simulators that mimic real user behavior (typos, impatience, multi-intent)

---

**Follow-up Questions**

1. You add production queries to your test set and accuracy drops to 70%. Should you optimize for the test set or redesign the agent?
2. How do you continuously keep your test set representative of changing user behavior?
3. Some users are power users who push the agent hard. Should you optimize for them or for the average user?

---

## Q-05-D-006: Your agent's latency spikes from 3s to 45s for certain queries. How do you diagnose and fix?

**Module:** Agentic AI
**Submodule:** Performance
**Level:** Debugging
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer, DevOps / SRE → AIOps
**Tags:** [agents, debugging, latency, performance, optimization]
**Prerequisites:** Q-05-S-004, Q-05-A-014
**Estimated Interview Round:** Debugging, Technical
**Why This Question Matters:** Latency variance in agents is extreme because step count is variable. A query that takes 2 steps = 3s; one that takes 15 steps = 45s. Understanding what triggers high step counts is critical for production.

---

**Question**

Most user queries complete in 3-5 seconds (2-3 agent steps). But 10% of queries take 30-45 seconds (10-15 steps). Users are complaining. Diagnose the pattern and optimize.

---

**Expected Answer (Short)**

Diagnosis: (1) Profile the slow queries — what do they have in common? (ambiguous, multi-intent, requiring multiple tools). (2) Trace analysis — which steps take the longest? (LLM calls, tool execution, or both). (3) Common patterns: agent "overthinks" (unnecessary tool calls), tool chains (A→B→C→D sequentially), large context windows (growing prompt per step). Fixes: (1) Set step budget and degrade gracefully. (2) Parallelize independent tool calls. (3) Summarize intermediate results (don't accumulate raw tool output). (4) Route complex queries to plan-and-execute (parallel steps) instead of ReAct (sequential).

---

**Deep Answer**

```python
# Step 1: Profile slow queries
slow_sessions = traces.filter(latency > 20_000)  # >20s

# Common patterns found:
# Pattern A: "Gathering loop" — agent calls 5 different search tools looking for info
#   Fix: Better routing + early termination
# Pattern B: "Context explosion" — scratchpad grows to 10K tokens by step 8
#   Fix: Summarize intermediate results
# Pattern C: "Tool chain" — results from tool A needed for tool B, which feeds tool C
#   Fix: Can't parallelize, but can optimize individual tools

# Step 2: Parallel tool execution
async def execute_step(plan):
    independent_steps = find_independent(plan)  # No dependency overlap
    results = await asyncio.gather(*[
        execute_tool(step) for step in independent_steps
    ])
    return results  # 3 parallel calls = 1x latency instead of 3x

# Step 3: Scratchpad compression
def compress_scratchpad(scratchpad, max_tokens=2000):
    if count_tokens(scratchpad) > max_tokens:
        summary = llm.summarize(scratchpad, 
            instruction="Keep all facts, numbers, and tool results. Remove reasoning.")
        return summary
    return scratchpad

# Step 4: Adaptive strategy
def choose_strategy(query):
    complexity = classify_complexity(query)
    if complexity == "simple":
        return ReactAgent(max_steps=3)        # Fast path
    elif complexity == "medium":
        return ReactAgent(max_steps=6)        # Normal path  
    else:
        return PlanAndExecuteAgent(max_steps=10, parallel=True)  # Complex path
```

- **Latency budget:** Total = LLM latency × num_steps + tool latency + overhead. The multiplier effect of step count is why agents have high latency variance.

---

**Follow-up Questions**

1. You reduce max steps to 5 but quality drops for complex queries. How do you balance?
2. The LLM API itself has variable latency (2-8s per call). How do you handle upstream latency variance?
3. How do you set user expectations for slow queries without showing a blank screen?

---
