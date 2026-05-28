# Module 03 — LLM Engineering: Debugging Level

---

## How To Read This File

Debugging-level LLM interviews are about disciplined isolation under production pressure, not clever speculation.

```text
Symptom -> isolate stage -> inspect evidence -> test hypothesis -> repair -> prevent recurrence
```

- **Symptom**: what users, alerts, or operators actually observe
- **Isolate stage**: serving, routing, prompt layer, structured output, tool calling, cache, GPU memory, or scheduler
- **Inspect evidence**: request traces, finish reasons, token counts, startup logs, queue metrics, memory stats
- **Test hypothesis**: disconfirm the fastest likely cause first
- **Repair**: fix the immediate failure without hiding the root cause
- **Prevent recurrence**: add validation, alerting, rollout checks, or regression tests

## Debugging Map

| ID | Primary symptom | Stage most likely at fault | What strong answers include |
|---|---|---|---|
| [Q-03-D-001](#q-03-d-001) | 1% JSON failures crash downstream | Output contract and parser layer | Failure categorization, finish reason checks, repair path |
| [Q-03-D-002](#q-03-d-002) | Throughput drops after model update | Serving config and KV allocation | Config diff, startup logs, context-length reasoning |
| [Q-03-D-003](#q-03-d-003) | Tool calls hallucinate names or params | Tool execution boundary | Name validation, param validation, permission checks |
| [Q-03-D-004](#q-03-d-004) | GPU memory grows until OOM | KV lifecycle, allocator, or preprocessing leak | Allocated vs reserved memory, metrics, long-run test |
| [Q-03-D-005](#q-03-d-005) | p99 latency explodes while p50 is fine | Queueing, long prefill, long generations, or preemption | Latency decomposition and targeted mitigation |

---

## Q-03-D-001: Your LLM generates valid JSON 99% of the time but the 1% failures are causing downstream service crashes. Diagnose and fix.

**Module:** LLM Engineering
**Submodule:** Structured Output
**Level:** Debugging
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer
**Tags:** [debugging, json, structured-output, reliability, llm-engineering]
**Prerequisites:** Q-03-A-005
**Estimated Interview Round:** Debugging
**Why This Question Matters:** 1% failure rate at 10K requests/day = 100 failures/day = service crashes, on-call pages, and user impact. Structured output reliability is a common production pain point.

---

**Question**

Your LLM extraction pipeline produces valid JSON 99% of the time. The 1% failures cause null pointer exceptions in downstream Java services. The failures appear random and are not correlated with input length or content type. Diagnose.

---

#### Debugging Answer

Categorize the 1% failures: (1) Invalid JSON syntax (unclosed brackets, trailing commas). (2) Valid JSON but wrong schema (missing required fields, wrong types). (3) JSON embedded in markdown (```json...```). (4) Extra text before/after JSON. (5) Truncated output (max_tokens hit mid-JSON). Diagnosis: collect failure samples, categorize, fix the top cause. Most likely: max_tokens truncation (outputs vary in length, sometimes truncated mid-JSON) or markdown wrapping.

---

#### Diagnostic + Repair Notes

- **Step 1: Categorize failures (sample 100 failures):**
  ```
  Failure breakdown:
  ├── 45% - Output truncated at max_tokens (JSON cut mid-string)
  ├── 25% - JSON wrapped in markdown (```json\n{...}\n```)
  ├── 15% - Extra text before JSON ("Here is the result: {...}")
  ├── 10% - Missing required fields (valid JSON, wrong schema)
  └── 5%  - True malformed JSON (rare model errors)
  ```

- **Step 2: Fix each category:**

  **Truncation (45%):**
  ```python
  # Check if output hit max_tokens
  if response.finish_reason == "length":
      # Output was truncated - retry with higher max_tokens
      # or restructure prompt to produce shorter output
      retry_with_higher_budget(request)
  ```

  **Markdown wrapping (25%):**
  ```python
  import re
  def extract_json(text):
      # Remove markdown code blocks
      match = re.search(r'```(?:json)?\s*([\s\S]*?)```', text)
      if match:
          return match.group(1).strip()
      # Try to find raw JSON
      match = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', text)
      if match:
          return match.group(1)
      return text
  ```

  **Extra text (15%):**
  ```python
  def extract_json_from_response(text):
      # Find the first { or [ and last } or ]
      start = min(text.find('{'), text.find('['))
      if text.find('{') == -1: start = text.find('[')
      if text.find('[') == -1: start = text.find('{')
      
      end = max(text.rfind('}'), text.rfind(']'))
      if start >= 0 and end > start:
          return text[start:end+1]
      return text
  ```

  **Missing fields (10%):**
  ```python
  from pydantic import BaseModel, Field
  
  class ExtractionResult(BaseModel):
      name: str = Field(default="")
      category: str = Field(default="unknown")
      amount: float = Field(default=0.0)
  
  # Pydantic gives defaults for missing fields instead of crashing
  result = ExtractionResult.model_validate_json(json_string)
  ```

- **Comprehensive fix:**
  ```python
  def robust_json_parse(response):
      text = response.content
      
      # Handle truncation
      if response.finish_reason == "length":
          raise TruncatedOutputError("Output truncated")
      
      # Extract JSON from wrapping
      text = extract_json(text)
      
      # Parse
      try:
          data = json.loads(text)
      except json.JSONDecodeError:
          # Attempt repair (fix trailing commas, unclosed strings)
          data = json.loads(repair_json(text))
      
      # Validate schema
      result = ExtractionResult.model_validate(data)
      return result
  ```

---

#### Scoped Debug Drill

Collect 100 failing samples, bucket them by failure type, check `finish_reason`, and harden the parsing layer so downstream services receive either valid typed data or an explicit recoverable error instead of a crash.

#### Real Interviewer Follow-ups

1. After applying all fixes, you're at 99.95%. The remaining 0.05% are true model errors. How do you handle them?
2. Should you switch to constrained generation (Outlines) instead of post-processing? Trade-offs?
3. How do you test JSON reliability? What does the test suite look like?

---

#### Weak Answer Signals

- "Tell the model to only output JSON" — the prompt already says that
- Doesn't check finish_reason for truncation
- No JSON extraction (expects clean JSON from LLM)
- Lets downstream service crash instead of handling gracefully

---

#### Interviewer Signal

Defensive programming for LLM systems. The 99% → 99.9% jump requires systematic failure categorization and layered fixes. This is a core skill for production LLM engineers.

#### Failure / Production Bridge

This is the difference between a fragile demo and a production interface contract. The model can be imperfect; the surrounding system cannot be allowed to turn a malformed payload into a customer-facing outage.

---

## Q-03-D-002: Your vLLM deployment's throughput dropped 40% after updating to a new model version. Same hardware, same configuration. Diagnose.

**Module:** LLM Engineering
**Submodule:** Serving Performance
**Level:** Debugging
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** DevOps / SRE → AIOps, ML / Data Engineer
**Tags:** [debugging, vllm, throughput, model-serving, llm-engineering]
**Prerequisites:** Q-03-A-001, Q-03-A-008, Q-03-C-004
**Estimated Interview Round:** Debugging, Deep Dive
**Why This Question Matters:** Model updates can silently change serving characteristics. A new model version might have a larger vocabulary (more memory for embeddings), different attention configuration, or different tokenization that affects all serving metrics.

---

**Question**

You updated from Llama 3 70B to Llama 3.1 70B on your vLLM cluster. Same GPUs (4× H100), same vLLM config. Throughput dropped from 500 tok/s to 300 tok/s. Diagnose.

---

#### Debugging Answer

Investigate model architecture changes: (1) Vocabulary size — Llama 3.1 may have larger vocab → larger embedding table → less GPU memory for KV cache → fewer concurrent requests → lower throughput. (2) Context window — Llama 3.1 supports 128K (vs 8K default for Llama 3). If max_model_len auto-detected to 128K, KV cache allocation per request is much larger → fewer concurrent slots. (3) Check GQA configuration changes (number of KV heads). (4) Different tokenization → same text produces more/fewer tokens, changing effective throughput.

---

#### Diagnostic + Repair Notes

- **Most likely cause: max_model_len auto-detection.**
  ```
  Llama 3 70B: default max_model_len = 8192
  Llama 3.1 70B: default max_model_len = 131072
  
  vLLM allocates KV cache based on max_model_len.
  If it auto-detected 128K, it pre-allocates KV memory for 128K per slot.
  This dramatically reduces the number of concurrent request slots.
  
  Before: 8K × 50 slots = 400K tokens of KV cache
  After:  128K × 3 slots = 384K tokens of KV cache
  
  Same memory, but only 3 concurrent requests instead of 50.
  Throughput drops because batch size is tiny.
  ```

- **Diagnosis steps:**
  ```bash
  # Check vLLM startup logs for KV cache allocation
  grep "KV cache" vllm.log
  # Look for: "# GPU blocks: 1234, # CPU blocks: 5678"
  # Compare before and after
  
  # Check model config
  python -c "from transformers import AutoConfig; c = AutoConfig.from_pretrained('meta-llama/Llama-3.1-70B-Instruct'); print(c.max_position_embeddings, c.vocab_size, c.num_key_value_heads)"
  ```

- **Fix:**
  ```bash
  # Set max_model_len to your actual needs, not model maximum
  python -m vllm.entrypoints.openai.api_server \
    --model meta-llama/Llama-3.1-70B-Instruct \
    --tensor-parallel-size 4 \
    --max-model-len 8192 \  # Override auto-detected 128K
    --gpu-memory-utilization 0.90
  ```

- **Other possible causes:**
  | Cause | Diagnosis | Fix |
  |-------|-----------|-----|
  | Larger vocab (128K → 128256) | Check embedding size | Minimal impact (~100MB) |
  | Different KV head config | Compare num_key_value_heads | Adjust batch expectations |
  | RoPE scaling overhead | CPU profiling | Usually minimal |
  | Tokenizer changes | Compare token counts for same text | Adjust if needed |

---

#### Scoped Debug Drill

Diff the old and new model configs, inspect vLLM startup logs for KV block allocation, rerun the benchmark with explicit `max-model-len`, and confirm whether throughput recovers before changing anything else.

#### Real Interviewer Follow-ups

1. You need 128K context for some requests but 8K for most. How do you configure this?
2. After fixing max_model_len, throughput is back to 450 tok/s (not 500). Where's the remaining 10%?
3. How do you automate catching these issues during model update CI/CD?

---

#### Weak Answer Signals

- "Rollback to the old model" — doesn't diagnose
- Doesn't know about max_model_len and its effect on KV cache allocation
- Doesn't read vLLM startup logs
- Blames vLLM instead of investigating configuration

---

#### Interviewer Signal

Deep LLM serving knowledge. Understanding how max_model_len affects KV cache allocation and throughput shows the candidate has operated LLM serving infrastructure. This is a real production issue many teams encounter.

#### Failure / Production Bridge

Model upgrades are not safe just because the parameter count stayed the same. Context length, tokenizer behavior, and KV allocation can silently change serving economics even when the hardware did not.

---

## Q-03-D-003: Users report that your LLM sometimes "hallucinates" tool calls — it calls functions that don't exist or with wrong parameters. How do you fix this?

**Module:** LLM Engineering
**Submodule:** Tool/Function Calling
**Level:** Debugging
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** Software Dev → AI Engineer
**Tags:** [debugging, tool-calling, function-calling, hallucination, llm-engineering]
**Prerequisites:** Q-02-A-015
**Estimated Interview Round:** Debugging
**Why This Question Matters:** Tool/function calling hallucination is dangerous — the model might "call" a function that doesn't exist (causing errors) or call a real function with hallucinated parameters (causing incorrect actions). This is different from text hallucination and requires different fixes.

---

**Question**

Your LLM agent has 15 available tools. Users report it sometimes calls `search_internal_wiki` (doesn't exist — the actual tool is `search_knowledge_base`) and calls `create_ticket` with hallucinated customer IDs. How do you fix both issues?

---

#### Debugging Answer

Two distinct problems: (1) Non-existent tool names: Model is generating tool names from its training rather than from the provided tool list. Fix: validate tool name against allowed list before execution, use constrained generation to limit tool names, simplify tool names to be more distinct. (2) Hallucinated parameters: Model invents plausible but wrong parameter values. Fix: validate all parameters before execution (especially IDs — check against database), require user confirmation for destructive actions, add parameter descriptions with examples in tool definitions.

---

#### Diagnostic + Repair Notes

- **Problem 1: Non-existent tool names**
  ```python
  # Defense: validate tool call before execution
  ALLOWED_TOOLS = {"search_knowledge_base", "create_ticket", "update_status", ...}
  
  def execute_tool_call(tool_call):
      if tool_call.name not in ALLOWED_TOOLS:
          # Don't execute - tell the model it used the wrong name
          return {
              "error": f"Tool '{tool_call.name}' does not exist. "
                       f"Available tools: {', '.join(ALLOWED_TOOLS)}"
          }
      # Proceed with execution
      return tools[tool_call.name](**tool_call.arguments)
  ```
  
  - **Root cause:** Model has seen "search_internal_wiki" in training data and considers it a plausible tool name.
  - **Prevention:** Use unique, specific tool names that are unlikely to match training data patterns. "kb_search_v2" instead of "search_knowledge_base."
  - **Advanced:** Constrained generation — force the model to only output from the allowed tool name list.

- **Problem 2: Hallucinated parameters**
  ```python
  def validate_tool_params(tool_name, params):
      if tool_name == "create_ticket":
          # Validate customer_id exists
          if "customer_id" in params:
              if not db.customer_exists(params["customer_id"]):
                  return False, f"Customer ID {params['customer_id']} not found"
          
          # Validate required fields
          required = ["title", "description", "priority"]
          missing = [f for f in required if f not in params]
          if missing:
              return False, f"Missing required fields: {missing}"
      
      return True, None
  ```
  
  - **Root cause:** Model generates plausible-looking IDs (e.g., "CUST-12345") without checking if they exist.
  - **Prevention:**
    - Provide the actual values in context: "Available customer IDs from current conversation: CUST-67890"
    - For IDs: always validate against database before execution
    - For destructive actions: require user confirmation
    - Add examples in tool definitions showing correct parameter format

- **Comprehensive tool calling safety:**
  ```python
  async def safe_tool_execution(tool_call):
      # 1. Validate tool name
      if tool_call.name not in ALLOWED_TOOLS:
          return error_response(f"Unknown tool: {tool_call.name}")
      
      # 2. Validate parameters
      valid, error = validate_tool_params(tool_call.name, tool_call.arguments)
      if not valid:
          return error_response(error)
      
      # 3. Check permissions
      if tool_call.name in DESTRUCTIVE_TOOLS:
          if not await get_user_confirmation(tool_call):
              return error_response("User declined action")
      
      # 4. Execute with timeout and error handling
      try:
          result = await asyncio.wait_for(
              tools[tool_call.name](**tool_call.arguments),
              timeout=30
          )
          return result
      except Exception as e:
          return error_response(f"Tool execution failed: {e}")
  ```

---

#### Scoped Debug Drill

Add a validation layer that rejects unknown tool names, checks every argument against schema and live system state, and requires confirmation for destructive actions. Then run a test set containing wrong tool names, fake IDs, and malicious parameter combinations.

#### Real Interviewer Follow-ups

1. The model keeps retrying the wrong tool name even after error feedback. How do you break the loop?
2. How do you test tool calling reliability? What does the test matrix look like?
3. Should you reduce the number of tools to decrease hallucination risk?

---

#### Weak Answer Signals

- "The model should know the correct tool names" — it doesn't always
- Executes tool calls without validation
- Doesn't validate parameters (especially IDs) against real data
- No confirmation step for destructive actions

---

#### Interviewer Signal

Safety-first tool calling. The candidate should never trust LLM-generated tool calls without validation. Both tool name validation and parameter validation are required. Confirmation for destructive actions shows security awareness.

#### Failure / Production Bridge

Tool-calling failures are more dangerous than text hallucinations because they can trigger real side effects. Strong answers move the trust boundary to the execution layer, not the model output.

---

## Q-03-D-004: Your LLM application has a memory leak — GPU memory usage grows steadily until OOM crash after ~6 hours. Diagnose.

**Module:** LLM Engineering
**Submodule:** GPU Memory
**Level:** Debugging
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** DevOps / SRE → AIOps, ML / Data Engineer
**Tags:** [debugging, memory-leak, gpu, oom, llm-engineering]
**Prerequisites:** Q-03-C-004, Q-03-A-001
**Estimated Interview Round:** Debugging, Deep Dive
**Why This Question Matters:** GPU memory leaks in LLM serving are subtle and different from CPU memory leaks. KV cache fragmentation, uncollected tensors, and growing conversation histories are common causes. Diagnosing requires understanding GPU memory management.

---

**Question**

Your vLLM server starts at 65GB GPU memory usage on an 80GB H100. Memory grows ~2GB/hour. After 6 hours: OOM crash. No traffic increase. Diagnose.

---

#### Debugging Answer

Possible causes: (1) KV cache fragmentation — PagedAttention should prevent this but bugs exist. (2) KV cache not being freed for completed requests — check request cleanup. (3) CUDA memory fragmentation — allocated tensors aren't contiguous, unusable gaps grow. (4) Growing metadata/state outside KV cache (request queues, response buffers). (5) External: memory leaked in pre/post-processing code (e.g., accumulating tensors without detaching). Diagnosis: monitor `nvidia-smi`, check vLLM metrics for block utilization, profile with `torch.cuda.memory_stats()`.

---

#### Diagnostic + Repair Notes

- **Diagnosis step 1: Identify the memory type:**
  ```bash
  # Monitor GPU memory every minute
  watch -n 60 nvidia-smi
  
  # Check CUDA memory breakdown
  python -c "
  import torch
  print(f'Allocated: {torch.cuda.memory_allocated()/1e9:.1f}GB')
  print(f'Reserved: {torch.cuda.memory_reserved()/1e9:.1f}GB')
  print(f'Max allocated: {torch.cuda.max_memory_allocated()/1e9:.1f}GB')
  "
  ```
  - If `allocated` grows: real memory leak (tensors not freed)
  - If `reserved` grows but `allocated` doesn't: fragmentation (CUDA allocator reserves blocks it can't reuse)

- **Diagnosis step 2: Check vLLM KV cache metrics:**
  ```bash
  # vLLM exposes metrics at /metrics
  curl localhost:8000/metrics | grep -i "cache\|block\|memory"
  
  # Key metrics:
  # vllm:num_gpu_blocks_used — should stabilize, not grow
  # vllm:num_gpu_blocks_free — should stabilize, not shrink
  ```

- **Common causes and fixes:**

  | Cause | Diagnosis | Fix |
  |-------|-----------|-----|
  | KV cache not freed | gpu_blocks_used grows monotonically | Update vLLM version (bug fix), check request abort handling |
  | CUDA fragmentation | reserved >> allocated | Restart periodically, use memory pool |
  | Pre-processing tensor leak | Memory grows even with no requests | Profile pre/post-processing code with torch profiler |
  | Growing conversation state | Correlates with conversation length | Implement conversation state cleanup |
  | Response buffer accumulation | Grows with completed requests | Ensure response buffers are freed after sending |

- **Fix for pre/post-processing leaks:**
  ```python
  # BAD: Tensor accumulates on GPU
  def process_response(model_output):
      embeddings.append(model_output.hidden_states)  # Keeps reference → not freed
  
  # GOOD: Detach and move to CPU or delete
  def process_response(model_output):
      cpu_embeddings = model_output.hidden_states.detach().cpu()
      embeddings.append(cpu_embeddings)
      del model_output  # Free GPU tensor
      torch.cuda.empty_cache()  # Return memory to CUDA allocator
  ```

- **Prevention:**
  - GPU memory monitoring with alert at 90% utilization
  - Periodic vLLM restart (every 12-24h) as defense-in-depth
  - Load testing with sustained traffic for 8+ hours before production deployment
  - Track vLLM KV cache block utilization in monitoring dashboard

---

#### Scoped Debug Drill

Separate real leaks from fragmentation by comparing allocated and reserved GPU memory, inspect vLLM block metrics during a long soak test, and trace any preprocessing tensors that remain referenced after request completion.

#### Real Interviewer Follow-ups

1. The leak only happens under high concurrency. Low concurrency is fine. Why?
2. `torch.cuda.empty_cache()` doesn't fix it. What does this tell you?
3. How do you implement a graceful restart that doesn't drop in-flight requests?

---

#### Weak Answer Signals

- "Restart the server when it crashes" — not a fix
- Doesn't differentiate between allocated and reserved GPU memory
- Can't use CUDA memory profiling tools
- "Increase GPU memory" — doesn't solve the leak

---

#### Interviewer Signal

GPU-level debugging. Memory leaks in LLM serving require understanding CUDA memory management, KV cache lifecycle, and tensor reference counting. This is deep infrastructure knowledge.

#### Failure / Production Bridge

GPU memory incidents often look like random instability until the system has been under load for hours. Good engineers prove whether the problem is leak, fragmentation, or lifecycle cleanup before prescribing restarts.

---

## Q-03-D-005: Your LLM's latency became highly variable — p50 is 200ms but p99 is 15 seconds. What's causing the long tail?

**Module:** LLM Engineering
**Submodule:** Latency Debugging
**Level:** Debugging
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** DevOps / SRE → AIOps, Senior / Architect
**Tags:** [debugging, latency, tail-latency, p99, serving, llm-engineering]
**Prerequisites:** Q-03-A-001, Q-03-A-008
**Estimated Interview Round:** Debugging, Deep Dive
**Why This Question Matters:** P99 latency determines the worst-case user experience. A 75x difference between p50 and p99 means some users have a terrible experience. LLM-specific causes of tail latency are different from traditional web services.

---

**Question**

Your LLM serving cluster has stable p50 latency (200ms) but the p99 is 15 seconds and growing. SLA is 5 seconds at p99. Diagnose.

---

#### Debugging Answer

LLM-specific tail latency causes: (1) Output length variance — some requests generate 2000 tokens while most generate 100. (2) Input length variance — long prompts have slower prefill/TTFT. (3) Queue waiting — requests arrive in bursts, some wait in queue during busy periods. (4) Cache cold starts — prefix cache miss for rare prompt patterns. (5) GPU contention — memory pressure causes swapping or batch size reduction. (6) Preemption — vLLM preempts (pauses) running requests to handle new ones.

---

#### Diagnostic + Repair Notes

- **Step 1: Decompose latency components:**
  ```
  Total latency = Queue time + Prefill time (TTFT) + Generation time + Post-processing
  ```
  Measure each component separately for p50 and p99:
  ```
  Component      p50     p99     Cause of variance
  Queue time     0ms     5000ms  Bursty traffic → queue backup
  TTFT          100ms   3000ms  Input length variance (500 vs 10K tokens)
  Generation     95ms   6500ms  Output length variance (50 vs 1500 tokens)
  Post-process    5ms     500ms  Downstream service latency (rare)
  ```

- **Step 2: Fix each component:**

  **Queue time (biggest contributor at p99):**
  - Cause: arrival rate > processing rate in bursts
  - Fix: autoscale on queue depth, not just average latency
  - Fix: priority queues — time-sensitive requests go first
  - Fix: request routing to least-loaded server

  **TTFT variance:**
  - Cause: 100-token prompts prefill in 20ms, 10K-token prompts in 2000ms
  - Fix: prefix caching for common prompt prefixes
  - Fix: separate long-context requests to dedicated instances (don't block short requests)
  - Fix: input truncation/summarization when possible

  **Generation time variance:**
  - Cause: most responses are 50-100 tokens, but some are 1500+ tokens
  - Fix: set max_tokens based on task (don't use a global high limit)
  - Fix: early stopping for repetitive outputs
  - Fix: streaming — user sees tokens immediately regardless of total length

  **Preemption:**
  - Cause: vLLM's scheduler preempts (pauses) running requests when new high-priority requests arrive or memory is tight
  - Diagnosis: check vLLM metrics for preemption count
  - Fix: increase GPU memory allocation, or accept higher TTFT to avoid preemption

- **Monitoring for tail latency:**
  ```python
  # Alert configuration
  alerts = {
      "p99_latency": {"threshold": 5000, "window": "5min"},
      "queue_depth": {"threshold": 50, "window": "1min"},
      "preemption_rate": {"threshold": 0.05, "window": "5min"},
  }
  ```

---

#### Scoped Debug Drill

Break total latency into queue time, TTFT, generation time, and post-processing for both p50 and p99 requests. Then separate short and long prompts so you can tell whether the tail is driven by queueing, long prefills, long outputs, or scheduler preemption.

#### Real Interviewer Follow-ups

1. Would adding more GPUs reduce p99 latency? Why or why not?
2. How do you set different SLAs for different request types (interactive vs batch)?
3. The p99 is fine during normal hours but spikes during peak. How do you handle temporal patterns?

---

#### Weak Answer Signals

- "Add more GPUs" without diagnosing the cause
- Doesn't decompose latency into components
- Doesn't know about preemption as a latency cause
- Focuses only on p50, ignores tail latency
- "15 seconds is acceptable for LLM" — not when SLA is 5s

---

#### Interviewer Signal

Tail latency analysis is a hallmark of production engineering expertise. Decomposing into queue/TTFT/generation/post-processing and fixing each shows systematic debugging ability. Understanding preemption as an LLM-specific cause is advanced.

#### Failure / Production Bridge

P99 latency is where user trust breaks first. The strong answer is not "add more GPUs" but a clean decomposition of where the tail is formed and which control surface actually reduces it.
