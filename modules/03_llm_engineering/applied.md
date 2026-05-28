# Module 03 — LLM Engineering: Applied Level

---

## How To Read This File

Applied LLM Engineering questions should sound like build-and-serve work, not theory recitation:

```text
Design answer -> Implementation notes -> Scoped build -> Constraints -> Real follow-ups
```

- **Design answer**: the architecture or operating choice you would make first
- **Implementation notes**: the concrete mechanics, APIs, runtime behavior, and trade-offs
- **Scoped build**: the smallest real artifact you can implement or demo
- **Constraints**: memory, latency, reliability, and cost boundaries
- **Real follow-ups**: the pressure questions that expose whether you have actually shipped this

## Implementation Map

### Stage 1 — Serving Path

| ID | Core problem | Bounded build scope | Pressure point |
|---|---|---|---|
| [Q-03-A-001](#q-03-a-001) | Serve 70B on limited GPUs | Memory budget plus vLLM launch plan | Concurrency collapses at long context |
| [Q-03-A-002](#q-03-a-002) | Prefix caching | Measure TTFT improvement for shared prompts | Cache memory pressure |
| [Q-03-A-003](#q-03-a-003) | Benchmark frameworks | Compare vLLM, TensorRT-LLM, SGLang on realistic traffic | Throughput vs operator complexity |
| [Q-03-A-004](#q-03-a-004) | Token budget manager | Bound multi-turn context with reserved output budget | Silent overflow and summary drift |
| [Q-03-A-005](#q-03-a-005) | Reliable JSON output | Validate and retry against a real schema | Syntax success vs semantic success |
| [Q-03-A-006](#q-03-a-006) | Streaming chat endpoint | SSE stream with disconnect and error handling | GPU waste on abandoned streams |
| [Q-03-A-007](#q-03-a-007) | Token-aware splitting | Chunk with the real tokenizer and overlap | Broken boundaries and wasted context |

### Stage 2 — Throughput And Operations

| ID | Core problem | Bounded build scope | Pressure point |
|---|---|---|---|
| [Q-03-A-008](#q-03-a-008) | Continuous batching | Simulate scheduler behavior under mixed request lengths | Throughput vs latency fairness |
| [Q-03-A-009](#q-03-a-009) | Evaluation pipeline | Versioned dataset plus automated regression gate | Open-ended quality is hard to score |
| [Q-03-A-010](#q-03-a-010) | Model routing and fallback | Cost-aware router with circuit breakers | Provider outages and prompt compatibility |
| [Q-03-A-011](#q-03-a-011) | Rate limiting and backpressure | Priority queue plus capacity-aware dispatch | Shared quota collapse |
| [Q-03-A-012](#q-03-a-012) | Cost control | Per-endpoint spend tracking and guardrails | Silent token growth |
| [Q-03-A-013](#q-03-a-013) | Prompt reliability | Hardened prompt plus validation and fallback | 99% in test is still bad in prod |

---

## Q-03-A-001: You need to serve a 70B parameter model on 2 A100 80GB GPUs. Walk through the serving configuration.

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| LLM Engineering | Model Serving | Applied | 4 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Senior, Architect | DevOps / SRE → AIOps, ML / Data Engineer, Senior / Architect | Technical, System Design |

| Prerequisites | Tags |
|---|---|
| Q-03-C-004, Q-03-C-008 | [serving, tensor-parallel, vllm, gpu-memory, llm-engineering] |

**Why This Question Matters:** Deploying large models requires understanding memory budgets — model weights, KV cache, activation memory, and overhead. Getting this wrong means OOM errors in production.

---

**Question**

You have 2× A100 80GB GPUs (160GB total). Your model is 70B parameters in FP16 (140GB). Explain how you configure serving with vLLM, including memory allocation and expected throughput.

---

#### Design Answer

Use tensor parallelism (TP=2) to split model across 2 GPUs (70GB weights per GPU). Remaining ~10GB per GPU for KV cache. With GQA and FP16 KV cache, this supports ~4K context per request with ~16 concurrent requests. For longer contexts, use INT8 KV cache or INT8 model weights to free memory. vLLM configuration: `--tensor-parallel-size 2 --max-model-len 4096 --gpu-memory-utilization 0.9`.

---

#### Implementation Notes

- **Memory budget per GPU (A100 80GB):**
  ```
  Total: 80GB
  Model weights (70B FP16, TP=2): 70GB
  KV cache: ~8GB available
  CUDA overhead + activations: ~2GB
  ```

- **KV cache capacity (Llama 3 70B, GQA with 8 KV heads):**
  ```
  Per token per layer: 2 × 8 × 128 × 2 bytes = 4KB
  Per token (80 layers): 320KB
  Total KV memory (8GB split across 2 GPUs = 16GB total):
    16GB / 320KB per token = ~50K tokens of KV cache
  
  At 4K context: 50K / 4K = ~12 concurrent requests
  At 32K context: 50K / 32K = ~1.5 concurrent requests
  ```

- **vLLM configuration:**
  ```bash
  python -m vllm.entrypoints.openai.api_server \
    --model meta-llama/Meta-Llama-3-70B-Instruct \
    --tensor-parallel-size 2 \
    --max-model-len 4096 \
    --gpu-memory-utilization 0.90 \
    --dtype float16 \
    --max-num-seqs 16 \
    --enable-prefix-caching
  ```

- **Optimization options to increase throughput:**
  | Technique | Impact |
  |-----------|--------|
  | INT8 weights (bitsandbytes) | Halve weight memory (35GB/GPU), double KV budget |
  | FP8 KV cache | Halve KV cache memory, 2x concurrent requests |
  | AWQ INT4 | Quarter weight memory (17.5GB/GPU), 4x KV budget |
  | Prefix caching | Reuse KV cache for shared prefixes, higher effective throughput |

- **Throughput estimation (4K context, FP16):**
  - ~12 concurrent requests × 30 tokens/sec per request = ~360 tokens/sec aggregate
  - With continuous batching: throughput scales better as some requests finish and new ones start

---

#### Scoped Build

Write a small planning sheet that takes model size, dtype, GPU count, and target context length, then outputs estimated weight memory, KV cache budget, safe `max-num-seqs`, and a candidate vLLM launch command. Validate it with one short-context and one long-context load test.

#### Real Interviewer Follow-ups

1. A user sends a 32K context request — what happens with this configuration?
2. How would the configuration change if you had 4× A100s instead of 2?
3. What metrics would you monitor to determine if your serving setup is undersized?

---

#### Weak Answer Signals

- "Just load the model and it works" — no memory planning
- Doesn't understand tensor parallelism
- Can't estimate concurrent request capacity

---

#### Interviewer Signal

Infrastructure-level LLM knowledge. Being able to plan GPU memory budgets and predict serving capacity is essential for production LLM deployment.

#### Design / Production Bridge

This is the point where transformer knowledge becomes infrastructure ownership. If the memory math is wrong, the product does not fail gracefully; it falls over under real prompt lengths and concurrency.

---

## Q-03-A-002: How do you implement prefix caching to reduce latency and cost for repeated prompts?

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| LLM Engineering | Inference Optimization | Applied | 3 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Mid-level, Senior | Software Dev → AI Engineer, DevOps / SRE → AIOps | Technical |

| Prerequisites | Tags |
|---|---|
| Q-03-C-004 | [prefix-caching, kv-cache, latency, cost, llm-engineering] |

**Why This Question Matters:** Many LLM applications have shared prompt prefixes (system prompts, few-shot examples, document context). Prefix caching avoids recomputing KV cache for these shared portions, directly reducing latency and cost.

---

**Question**

Your chatbot has a 2000-token system prompt that's identical for all users. Each user message adds ~200 tokens. How do you use prefix caching to optimize this?

---

#### Design Answer

Prefix caching stores the KV cache for the 2000-token system prompt and reuses it across all requests. First request: compute full 2000 tokens, cache KV. Subsequent requests: skip system prompt computation, only process user-specific tokens. This reduces TTFT from processing 2200 tokens to processing ~200 tokens (10x faster). In vLLM: `--enable-prefix-caching`. Works because the system prompt's KV cache is identical regardless of user input.

---

#### Implementation Notes

- **Without prefix caching:**
  ```
  Request 1: [system_prompt(2000) + user_msg(200)] → Compute 2200 tokens → TTFT: ~500ms
  Request 2: [system_prompt(2000) + user_msg(150)] → Compute 2150 tokens → TTFT: ~490ms
  Each request recomputes the same 2000-token prefix.
  ```

- **With prefix caching:**
  ```
  Request 1: [system_prompt(2000) + user_msg(200)] → Compute 2200 tokens, cache prefix KV → TTFT: ~500ms
  Request 2: [system_prompt(2000) + user_msg(150)] → Reuse prefix KV, compute 150 tokens → TTFT: ~50ms
  10x TTFT reduction on subsequent requests.
  ```

- **Implementation in vLLM:**
  ```bash
  python -m vllm.entrypoints.openai.api_server \
    --model meta-llama/Meta-Llama-3-8B-Instruct \
    --enable-prefix-caching
  ```
  Automatic: vLLM detects common prefixes across requests and caches their KV.

- **Advanced: multi-level prefix caching:**
  ```
  Level 1 (shared): System prompt (2000 tokens) → cached for all users
  Level 2 (per-conversation): System prompt + conversation history → cached per session
  Level 3 (per-request): System prompt + history + current message → not cached (unique)
  ```

- **Cost savings calculation:**
  ```
  1000 requests/hour, 2000-token system prompt, 200-token user messages
  Without caching: 1000 × 2200 = 2.2M tokens processed
  With caching: 2000 (first) + 999 × 200 = 201.8K tokens processed
  Reduction: 91% fewer tokens computed → ~10x throughput improvement
  ```

---

#### Scoped Build

Enable prefix caching for one shared system prompt, capture TTFT with and without it, then repeat with several feature-specific prompts to show when hit rate falls because prompt diversity becomes too high.

#### Real Interviewer Follow-ups

1. What happens when you have 100 different system prompts for different features? Does prefix caching still help?
2. How does prefix caching interact with KV cache memory limits? What if you can't fit all prefixes in memory?
3. Can prefix caching work across different users in the same batch?

---

#### Weak Answer Signals

- Doesn't know prefix caching exists
- Can't calculate the performance benefit
- Confuses prefix caching with response caching (caching entire outputs)

---

#### Interviewer Signal

Production optimization awareness. Prefix caching is one of the highest-impact optimizations for LLM serving. Understanding it shows the candidate thinks about cost and latency systematically.

#### Design / Production Bridge

Prefix caching is one of the cleanest wins in LLM serving, but only when the prompt contract is stable enough to produce real reuse. Strong candidates know both the upside and the memory trade-off.

---

## Q-03-A-003: How do you benchmark and compare LLM inference frameworks (vLLM, TensorRT-LLM, SGLang)?

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| LLM Engineering | Inference Frameworks | Applied | 3 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Mid-level, Senior | ML / Data Engineer, DevOps / SRE → AIOps, Senior / Architect | Technical |

| Prerequisites | Tags |
|---|---|
| Q-03-A-001 | [vllm, tensorrt-llm, sglang, benchmarking, throughput, llm-engineering] |

**Why This Question Matters:** The inference framework can 2-3x throughput on the same hardware. Benchmarking correctly (not just "run a few prompts and check speed") is essential for production serving decisions.

---

**Question**

Your team needs to choose between vLLM, TensorRT-LLM, and SGLang for serving Llama 3 70B. How do you benchmark them and make the decision?

---

#### Design Answer

Benchmark dimensions: (1) Tokens/sec/GPU at different batch sizes. (2) Latency: TTFT and inter-token latency (ITL) at p50/p95/p99. (3) Maximum concurrent requests before quality degrades. (4) Memory efficiency (max context length). Test methodology: use realistic workload (actual prompt lengths, generation lengths), not synthetic benchmarks. Also consider: ease of deployment, model update speed, API compatibility, community support.

---

#### Implementation Notes

- **Benchmark methodology:**
  ```python
  # Realistic workload simulation
  workload = {
      "prompt_lengths": sample_from_production_distribution(),  # e.g., 500-3000 tokens
      "generation_lengths": [100, 200, 500],  # typical output lengths
      "concurrent_users": [1, 4, 8, 16, 32, 64],  # scaling curve
      "duration": 300,  # seconds of sustained load
  }
  ```

- **Key metrics to measure:**
  | Metric | Why |
  |--------|-----|
  | TTFT (p50, p95, p99) | User-facing latency for first token |
  | ITL (inter-token latency) | Streaming smoothness |
  | Tokens/sec (throughput) | Cost efficiency |
  | Tokens/sec/$ | Cost-normalized comparison |
  | Max concurrent requests | Scaling capacity |
  | Memory utilization | KV cache efficiency |

- **Framework comparison (general strengths, 2025-2026):**
  | Framework | Strengths | Weaknesses |
  |-----------|-----------|------------|
  | vLLM | Easy setup, wide model support, PagedAttention, active community | Not always fastest raw throughput |
  | TensorRT-LLM | Highest throughput on NVIDIA GPUs, production-optimized | Complex setup, longer model onboarding, NVIDIA-only |
  | SGLang | Fast for structured generation (JSON, regex), RadixAttention | Smaller community |

- **Decision framework:**
  ```
  Need maximum throughput on NVIDIA? → TensorRT-LLM
  Need rapid iteration and wide model support? → vLLM
  Need structured output at scale? → SGLang
  Need multi-vendor GPU support? → vLLM
  ```

- **Common benchmarking mistakes:**
  - Benchmarking with uniform prompt lengths (not realistic)
  - Ignoring warmup period (first requests are always slower)
  - Comparing at different quantization levels
  - Not measuring tail latency (p99) — only p50

---

#### Scoped Build

Build a repeatable benchmark harness that replays a production-like prompt and generation distribution across vLLM, TensorRT-LLM, and SGLang. Report TTFT, p95 latency, throughput, memory utilization, and operator cost, not just tokens per second.

#### Real Interviewer Follow-ups

1. TTFT is great at low concurrency but degrades at high concurrency. Is this expected? How do you address it?
2. TensorRT-LLM gives 40% more throughput but takes 2 hours to compile a new model. When is this worth it?
3. How do you handle A/B testing between serving frameworks in production?

---

#### Weak Answer Signals

- "Just benchmark tokens/sec" — incomplete (must include latency)
- Benchmarks with unrealistic workloads
- Makes framework choice without benchmarking

---

#### Interviewer Signal

Rigorous engineering methodology. The candidate should describe systematic benchmarking with realistic workloads and multi-dimensional metrics, not just throughput.

#### Design / Production Bridge

Serving-framework choice is a platform decision, not a benchmark screenshot. The right answer depends on the workload shape, the speed of model updates, and how much operational complexity the team can afford.

---

## Q-03-A-004: Implement a token budget manager that prevents context window overflow in a multi-turn conversation.

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| LLM Engineering | Context Management | Applied | 3 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Mid-level, Senior | Software Dev → AI Engineer | Technical, Coding |

| Prerequisites | Tags |
|---|---|
| Q-03-C-001, Q-03-C-004 | [context-window, token-budget, multi-turn, conversation, llm-engineering] |

**Why This Question Matters:** Multi-turn conversations inevitably exceed context windows. Handling this gracefully (without dropping critical context or crashing) is a production essential.

---

**Question**

You're building a chatbot with a 32K token context window. Conversations can last 50+ turns. Design and implement a token budget manager.

---

#### Design Answer

Strategy: (1) Reserve fixed budgets: system_prompt (2K), recent_messages (last 5 turns, ~5K), tools (1K), generation (4K), remaining (20K for history). (2) When history exceeds budget, compress old messages: summarize, truncate, or use sliding window. (3) Count tokens accurately using the model's tokenizer, not approximations. (4) Always leave generation budget (max_tokens) — never fill context completely.

---

#### Implementation Notes

```python
class TokenBudgetManager:
    def __init__(self, model_context_length=32768, tokenizer=None):
        self.context_length = model_context_length
        self.tokenizer = tokenizer
        
        # Fixed budgets
        self.budgets = {
            "system_prompt": 2000,
            "tools": 1000,
            "generation": 4000,  # Reserved for output
            "recent_turns": 6000,  # Always keep last N turns
        }
        self.history_budget = (
            self.context_length 
            - sum(self.budgets.values())
        )  # ~19K for older history
    
    def count_tokens(self, text):
        return len(self.tokenizer.encode(text))
    
    def build_context(self, system_prompt, messages, tools=None):
        context = []
        
        # 1. System prompt (always included, truncate if needed)
        sys_tokens = self.count_tokens(system_prompt)
        if sys_tokens > self.budgets["system_prompt"]:
            system_prompt = self.truncate_to_budget(
                system_prompt, self.budgets["system_prompt"]
            )
        context.append({"role": "system", "content": system_prompt})
        
        # 2. Split messages into recent and history
        recent = messages[-5:]  # Last 5 turns always kept
        history = messages[:-5]
        
        # 3. Fit history within budget
        history_tokens = sum(self.count_tokens(m["content"]) for m in history)
        if history_tokens > self.history_budget:
            history = self.compress_history(history, self.history_budget)
        
        # 4. Assemble
        context.extend(history)
        context.extend(recent)
        
        # 5. Final validation
        total = sum(self.count_tokens(m["content"]) for m in context)
        assert total + self.budgets["generation"] <= self.context_length
        
        return context
    
    def compress_history(self, history, budget):
        """Compression strategies in order of preference."""
        # Strategy 1: Sliding window - drop oldest messages
        while self.total_tokens(history) > budget and len(history) > 0:
            history.pop(0)
        
        return history
    
    def summarize_history(self, history, budget):
        """Alternative: Use LLM to summarize old messages."""
        summary = self.llm.summarize(history)
        return [{"role": "system", "content": f"Previous conversation summary: {summary}"}]
```

- **Strategies comparison:**
  | Strategy | Quality | Cost | Complexity |
  |----------|---------|------|------------|
  | Sliding window (drop oldest) | Low | Free | Simple |
  | Summarization | High | API call | Medium |
  | Hybrid (summarize + recent) | Best | 1 API call | Medium |
  | Hierarchical (nested summaries) | Best | Multiple calls | High |

- **Token counting pitfalls:**
  - Don't count characters/4 as tokens (inaccurate up to 2x)
  - Different models have different tokenizers (cl100k ≠ Llama tokenizer)
  - Message formatting adds tokens (role markers, separators)
  - Tool definitions count toward context

---

#### Scoped Build

Implement a token budget manager that reserves explicit output space, always keeps recent turns, summarizes older turns when needed, and rejects any request that still exceeds the model window after compression.

#### Real Interviewer Follow-ups

1. Your summarization sometimes loses critical information (e.g., user's name mentioned 20 turns ago). How do you handle this?
2. How do you test that your token budget manager works correctly?
3. The user sends a single message that exceeds the context window. What happens?

---

#### Weak Answer Signals

- "Just increase the context window" — avoids the problem
- No strategy for when conversations exceed the window
- Approximates tokens instead of counting accurately

---

#### Interviewer Signal

Practical multi-turn engineering. This is a real problem every chat application faces. The hybrid approach (sliding window + summarization) shows engineering judgment.

#### Design / Production Bridge

Most multi-turn chat failures are really context-budget failures: missing state, clipped tool history, or no room left for output. A good answer treats token budgeting as a system contract, not a convenience utility.

---

## Q-03-A-005: How do you implement structured output (JSON) parsing with LLMs reliably?

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| LLM Engineering | Structured Output | Applied | 3 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Mid-level, Senior | Software Dev → AI Engineer | Technical |

| Prerequisites | Tags |
|---|---|
| Q-02-C-006, Q-03-C-006 | [structured-output, json, parsing, constrained-generation, llm-engineering] |

**Why This Question Matters:** Most production LLM systems need structured output (JSON, enums, specific formats). Achieving 100% valid structured output is surprisingly hard and requires multiple approaches depending on the model.

---

**Question**

You need your LLM to always return valid JSON matching a specific schema. How do you achieve near-100% reliability?

---

#### Design Answer

Layered approach: (1) Constrained generation (grammar-based): force the model to only generate valid JSON tokens. Tools: Outlines, SGLang, vLLM JSON mode. (2) Model-level JSON mode: OpenAI's response_format=json_object. (3) Prompt engineering: explicit examples, schema in prompt. (4) Post-processing: parse attempt, retry with error feedback if invalid. Best reliability: constrained generation (100%), then model JSON mode (99%+), then prompt + retry (~98%).

---

#### Implementation Notes

- **Level 1: Constrained generation (100% valid JSON):**
  ```python
  # Using Outlines (grammar-based generation)
  from outlines import models, generate
  import json
  from pydantic import BaseModel
  
  class ExtractedEntity(BaseModel):
      name: str
      type: str
      confidence: float
  
  model = models.transformers("meta-llama/Llama-3-8B-Instruct")
  generator = generate.json(model, ExtractedEntity)
  
  result = generator("Extract entities from: Apple released iPhone 16")
  # Always valid JSON matching the schema
  ```
  - How: at each generation step, mask logits for tokens that would produce invalid JSON/schema
  - Pro: 100% reliability, matches Pydantic schema exactly
  - Con: slower (logit masking overhead), not available for API models

- **Level 2: API JSON mode:**
  ```python
  response = openai_client.chat.completions.create(
      model="gpt-4o",
      response_format={"type": "json_object"},
      messages=[{"role": "user", "content": "Extract entities. Respond in JSON."}]
  )
  # 99%+ valid JSON, but may not match your exact schema
  ```

- **Level 3: Prompt + retry:**
  ```python
  def get_structured_output(prompt, schema, max_retries=3):
      for attempt in range(max_retries):
          response = llm.generate(prompt)
          try:
              parsed = json.loads(response)
              validated = schema.model_validate(parsed)
              return validated
          except (json.JSONDecodeError, ValidationError) as e:
              prompt = f"{prompt}\n\nPrevious attempt was invalid: {e}\nPlease try again with valid JSON."
      raise StructuredOutputError(f"Failed after {max_retries} attempts")
  ```

- **Reliability comparison:**
  | Approach | JSON Valid Rate | Schema Match Rate | Latency |
  |----------|----------------|-------------------|---------|
  | Constrained (Outlines) | 100% | 100% | +20-30% |
  | API JSON mode | 99.5%+ | ~95% | Same |
  | Prompt + retry | ~97% first try, ~99.5% with retries | ~90% | Variable |

---

#### Scoped Build

Take one real schema with required and optional fields, implement constrained generation when available, add schema validation and retry fallback when it is not, and log both syntax failures and semantic-schema failures separately.

#### Real Interviewer Follow-ups

1. Constrained generation is slower. How much latency increase is acceptable for 100% reliability?
2. How do you handle optional fields in your JSON schema?
3. The model generates valid JSON but semantically wrong content. How do you validate meaning, not just structure?

---

#### Weak Answer Signals

- "Tell the model to output JSON" — that's the weakest approach
- Doesn't know about constrained generation
- No retry or fallback strategy

---

#### Interviewer Signal

Production reliability engineering. Achieving structured output at 100% reliability requires understanding the full toolkit (constrained generation > JSON mode > prompt engineering).

#### Design / Production Bridge

The important production contract is not that the LLM is usually well-behaved. It is that downstream systems never crash because the output layer trusted free-form text as if it were already a typed API.

---

## Q-03-A-006: How do you implement token-level streaming for a real-time LLM chat interface?

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| LLM Engineering | Streaming | Applied | 2 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Early-career, Mid-level | Software Dev → AI Engineer | Technical |

| Prerequisites | Tags |
|---|---|
| Q-03-C-006 | [streaming, sse, websocket, real-time, llm-engineering] |

**Why This Question Matters:** Streaming tokens as they're generated is essential for good UX — users see words appear in real-time instead of waiting 5-30 seconds for a complete response. It's also critical for long outputs where total generation time is significant.

---

**Question**

Implement server-sent events (SSE) streaming for an LLM chat endpoint. How do you handle backpressure, error mid-stream, and client disconnection?

---

#### Design Answer

Use SSE (Server-Sent Events) for HTTP streaming. Server generates tokens one at a time, sends each as an SSE event. Client receives token-by-token. Key concerns: (1) Backpressure: if client is slow, buffer tokens server-side (bounded buffer, drop or pause if full). (2) Errors mid-stream: send an SSE error event, client shows partial response + error indicator. (3) Client disconnect: detect closed connection, cancel generation to free GPU resources.

---

#### Implementation Notes

```python
# FastAPI SSE streaming endpoint
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import asyncio

app = FastAPI()

@app.post("/v1/chat/stream")
async def chat_stream(request: Request, body: ChatRequest):
    async def generate_tokens():
        try:
            async for token in llm.generate_stream(body.messages):
                # Check if client disconnected
                if await request.is_disconnected():
                    # Cancel generation to free GPU resources
                    llm.cancel_generation(token.request_id)
                    return
                
                # Send token as SSE event
                yield f"data: {json.dumps({'token': token.text, 'finish_reason': None})}\n\n"
            
            # Send completion event
            yield f"data: {json.dumps({'token': '', 'finish_reason': 'stop'})}\n\n"
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            # Send error mid-stream
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate_tokens(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )
```

- **Client-side handling:**
  ```javascript
  const eventSource = new EventSource('/v1/chat/stream');
  let fullResponse = '';
  
  eventSource.onmessage = (event) => {
    if (event.data === '[DONE]') {
      eventSource.close();
      return;
    }
    const data = JSON.parse(event.data);
    if (data.error) {
      showError(data.error, fullResponse); // Show partial + error
      eventSource.close();
      return;
    }
    fullResponse += data.token;
    updateUI(fullResponse);
  };
  ```

- **Production concerns:**
  | Concern | Solution |
  |---------|----------|
  | Client disconnect detection | Check connection periodically, cancel generation |
  | GPU resource waste | Cancelled requests must free KV cache slots |
  | Proxy timeouts | Configure reverse proxy for long-lived connections |
  | Token buffering | Small buffer (10-20 tokens) for batch efficiency |

---

#### Scoped Build

Ship a minimal SSE endpoint that streams tokens, emits explicit completion and error events, and cancels generation as soon as the client disconnects. Then verify that abandoned requests actually release serving capacity.

#### Real Interviewer Follow-ups

1. SSE vs WebSocket for LLM streaming — when would you use each?
2. How do you implement streaming with function/tool calling (model outputs both text and tool calls)?
3. What happens to streaming when you have a content filter that needs to see the full response before sending?

---

#### Weak Answer Signals

- Doesn't handle client disconnection (wastes GPU)
- No error handling mid-stream
- Generates full response first, then streams (defeats the purpose)

---

#### Interviewer Signal

Full-stack LLM engineering. Streaming is where backend meets frontend. Handling disconnection, errors, and resource cleanup shows production awareness.

#### Design / Production Bridge

Streaming is not just a nicer UI. It changes perceived latency, cancellation behavior, and how long expensive generation jobs remain alive after the user has already left.

---

## Q-03-A-007: How do you implement a tokenizer-aware text splitter for preprocessing long documents?

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| LLM Engineering | Tokenization | Applied | 2 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Early-career, Mid-level | Software Dev → AI Engineer, ML / Data Engineer | Technical |

| Prerequisites | Tags |
|---|---|
| Q-03-C-001 | [tokenization, chunking, text-splitting, preprocessing, llm-engineering] |

**Why This Question Matters:** Naive text splitting (by character count) leads to context window overflow or underutilization. Token-aware splitting ensures you use the context window efficiently and split at meaningful boundaries.

---

**Question**

You need to split documents into chunks that fit within a 4096-token budget. Implement a token-aware splitter that respects sentence boundaries.

---

#### Design Answer

Use the model's actual tokenizer to count tokens (not character approximation). Split on sentence boundaries. Algorithm: accumulate sentences until adding the next sentence would exceed the token budget, then emit the chunk. Overlap between chunks for continuity (10-20% overlap). Handle edge cases: single sentences exceeding budget, empty chunks.

---

#### Implementation Notes

```python
from transformers import AutoTokenizer
import re

class TokenAwareTextSplitter:
    def __init__(self, model_name, max_tokens=4096, overlap_tokens=200):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.max_tokens = max_tokens
        self.overlap_tokens = overlap_tokens
    
    def count_tokens(self, text):
        return len(self.tokenizer.encode(text, add_special_tokens=False))
    
    def split_into_sentences(self, text):
        # Split on sentence boundaries
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def split(self, text):
        sentences = self.split_into_sentences(text)
        chunks = []
        current_chunk = []
        current_tokens = 0
        
        for sentence in sentences:
            sentence_tokens = self.count_tokens(sentence)
            
            # Handle single sentence exceeding budget
            if sentence_tokens > self.max_tokens:
                # Flush current chunk
                if current_chunk:
                    chunks.append(" ".join(current_chunk))
                    current_chunk = []
                    current_tokens = 0
                # Force-split the long sentence by tokens
                chunks.extend(self._force_split(sentence))
                continue
            
            if current_tokens + sentence_tokens > self.max_tokens:
                # Emit current chunk
                chunks.append(" ".join(current_chunk))
                
                # Start new chunk with overlap
                overlap_sentences = self._get_overlap(current_chunk)
                current_chunk = overlap_sentences + [sentence]
                current_tokens = self.count_tokens(" ".join(current_chunk))
            else:
                current_chunk.append(sentence)
                current_tokens += sentence_tokens
        
        # Don't forget the last chunk
        if current_chunk:
            chunks.append(" ".join(current_chunk))
        
        return chunks
```

- **Key design decisions:**
  - Always use the target model's tokenizer (token counts vary between models)
  - Overlap ensures context continuity across chunk boundaries
  - Sentence-boundary splitting maintains semantic coherence
  - Force-split handles edge cases without crashing

---

#### Scoped Build

Implement a tokenizer-aware splitter against the exact model tokenizer you plan to use downstream, then compare chunk counts and budget utilization against a naive character-based splitter on prose, code, and mixed-format documents.

#### Real Interviewer Follow-ups

1. How does chunking strategy change for code vs prose?
2. What overlap percentage works best in practice?
3. How do you handle structured documents (tables, lists, headers)?

---

#### Weak Answer Signals

- Split by character count divided by 4 (inaccurate)
- No overlap between chunks
- Doesn't handle edge cases (long sentences, empty chunks)

---

#### Interviewer Signal

Attention to detail. Token-aware splitting is a common task done wrong. Using the actual tokenizer and handling edge cases shows careful engineering.

#### Design / Production Bridge

Preprocessing decisions leak directly into retrieval and prompting quality. Waste the context window here and every later stage pays for it with lower recall or higher cost.

---

## Q-03-A-008: How do you implement request batching for maximum LLM throughput?

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| LLM Engineering | Batching | Applied | 3 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Mid-level, Senior | DevOps / SRE → AIOps, Software Dev → AI Engineer | Technical |

| Prerequisites | Tags |
|---|---|
| Q-03-A-001, Q-03-C-004 | [batching, continuous-batching, throughput, latency, llm-engineering] |

**Why This Question Matters:** Batching is the primary mechanism for achieving high throughput in LLM serving. Understanding static vs continuous batching can 3-5x throughput on the same hardware.

---

**Question**

Explain static batching vs continuous batching for LLM inference. How does continuous batching improve throughput?

---

#### Design Answer

Static batching: group N requests, process together, wait for ALL to finish before starting next batch. Problem: short responses wait for long responses to finish (wasted compute). Continuous batching: as soon as one request in the batch finishes, insert a new request into its slot immediately. The batch is always full, GPU is always busy. Throughput improvement: 3-5x because GPU utilization stays near 100% instead of declining as requests complete at different times.

---

#### Implementation Notes

- **Static batching (naive):**
  ```
  Batch 1: [req_A(50 tokens), req_B(200 tokens), req_C(500 tokens)]
  
  Step 1-50:   All three generating
  Step 51-200: A finished, B still going, C still going → A's GPU slot wasted
  Step 201-500: A,B finished, only C going → 2/3 of GPU wasted
  
  Effective utilization: ~45%
  ```

- **Continuous batching (orca-style):**
  ```
  Step 1-50:   [A, B, C] → A finishes → insert D immediately
  Step 51-150: [D, B, C] → D finishes → insert E
  Step 151-200: [E, B, C] → B finishes → insert F
  ... GPU always processing 3 requests
  
  Effective utilization: ~95%
  ```

- **Implementation (simplified concept):**
  ```python
  class ContinuousBatcher:
      def __init__(self, max_batch_size):
          self.max_batch = max_batch_size
          self.active_requests = []
          self.waiting_queue = asyncio.Queue()
      
      async def step(self):
          # Remove finished requests
          finished = [r for r in self.active_requests if r.is_done()]
          for r in finished:
              self.active_requests.remove(r)
              r.complete()
          
          # Fill empty slots from waiting queue
          while (len(self.active_requests) < self.max_batch 
                 and not self.waiting_queue.empty()):
              new_req = await self.waiting_queue.get()
              self.active_requests.append(new_req)
          
          # Run one generation step for all active requests
          if self.active_requests:
              self.model.generate_one_step(self.active_requests)
  ```

- **vLLM's continuous batching:** Automatic. vLLM uses continuous batching + PagedAttention by default. No configuration needed beyond `--max-num-seqs` (max batch size).

---

#### Scoped Build

Simulate a mixed workload with short and long generations, then compare static batching and continuous batching by measuring average GPU utilization, throughput, and tail latency. Explain which policy you would ship for an interactive product.

#### Real Interviewer Follow-ups

1. What's the trade-off between batch size and per-request latency?
2. How does continuous batching interact with prefix caching?
3. What happens to continuous batching when requests have very different input lengths?

---

#### Weak Answer Signals

- Doesn't know continuous batching exists
- "Just increase batch size" without understanding the wait-for-longest problem
- Can't explain why continuous batching improves utilization

---

#### Interviewer Signal

Understanding of the fundamental throughput mechanism in modern LLM serving. This is how vLLM achieves its performance — candidates serving LLMs in production should understand it.

#### Design / Production Bridge

Buying more GPUs is often not the first answer. Scheduler quality and batching policy determine whether the hardware you already have is actually being used well.

---

## Q-03-A-009: How do you design an effective LLM evaluation pipeline for a production system?

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| LLM Engineering | Evaluation | Applied | 3 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Mid-level, Senior | ML / Data Engineer, Software Dev → AI Engineer | Technical, Deep Dive |

| Prerequisites | Tags |
|---|---|
| Q-02-A-005, Q-02-A-014 | [evaluation, llm-judge, metrics, benchmarking, llm-engineering] |

**Why This Question Matters:** LLM evaluation is harder than traditional ML evaluation because outputs are open-ended text. Building a reliable eval pipeline is the foundation for iterating on prompts, models, and configurations with confidence.

---

**Question**

Design an evaluation pipeline for a customer support LLM that needs to classify issues, generate responses, and detect escalation needs.

---

#### Design Answer

Multi-metric evaluation: (1) Classification accuracy: exact-match on category labels (automated). (2) Response quality: LLM-as-judge scoring on helpfulness, accuracy, tone (automated + calibrated). (3) Escalation detection: precision/recall (automated). (4) Safety: check for harmful/inappropriate content (automated classifier). (5) End-to-end: resolution rate from A/B test (human-in-the-loop). Run on versioned eval datasets. Track metrics over time. Alert on regression.

---

#### Implementation Notes

- **Evaluation architecture:**
  ```
  ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
  │ Eval Dataset │ →  │ LLM Pipeline │ →  │ Eval Metrics│
  │ (versioned)  │    │ (under test) │    │ (automated) │
  └─────────────┘    └──────────────┘    └─────────────┘
                                               ↓
                                     ┌─────────────────┐
                                     │ Regression Check │
                                     │ (vs. baseline)   │
                                     └─────────────────┘
  ```

- **Metric layers:**
  | Layer | Metric | Method | Automated? |
  |-------|--------|--------|-----------|
  | Classification | Accuracy, F1 | Exact match | Yes |
  | Response quality | Helpfulness (1-5) | LLM-as-judge | Yes |
  | Response accuracy | Factual correctness | LLM-as-judge with ground truth | Yes |
  | Tone | Professional, empathetic | LLM-as-judge | Yes |
  | Safety | Harmful content | Safety classifier | Yes |
  | Escalation | Precision, recall | Binary classification metrics | Yes |
  | Resolution | Did it solve the problem? | Human review (sampled) | No |

- **LLM-as-judge implementation:**
  ```python
  judge_prompt = """Rate this customer support response on a scale of 1-5 for helpfulness.
  
  Customer query: {query}
  Agent response: {response}
  Ground truth resolution: {ground_truth}
  
  Score (1-5) and one-sentence justification:"""
  
  # Use a different (stronger) model as judge
  judge_score = judge_model.generate(judge_prompt)
  ```

- **Eval dataset requirements:**
  - 200+ examples minimum for statistical significance
  - Stratified by category, difficulty, edge cases
  - Include adversarial examples (prompt injection, out-of-scope queries)
  - Version controlled — never modify existing examples, only add
  - Human-annotated ground truth

- **Regression detection:**
  ```python
  def check_regression(current_scores, baseline_scores, threshold=0.02):
      for metric, current in current_scores.items():
          baseline = baseline_scores[metric]
          if current < baseline - threshold:
              alert(f"Regression detected: {metric} dropped {baseline:.3f} → {current:.3f}")
              return False
      return True
  ```

---

#### Scoped Build

Create a small versioned evaluation set for one production workflow, score it with automated metrics and an LLM judge, and block deployment whenever any primary metric regresses beyond a pre-declared threshold.

#### Real Interviewer Follow-ups

1. How do you calibrate the LLM-as-judge to match human evaluators?
2. What eval dataset size gives you statistical confidence?
3. How do you handle cases where the LLM-as-judge disagrees with humans?

---

#### Weak Answer Signals

- "Vibes-based" evaluation (manually check a few examples)
- Only uses one metric (accuracy or BLEU)
- No versioned eval dataset
- No regression detection

---

#### Interviewer Signal

Evaluation maturity is one of the strongest signals of LLM engineering capability. Candidates who describe multi-metric, automated eval with regression detection are significantly more likely to build reliable systems.

#### Design / Production Bridge

Without evaluation, prompt and model changes are just expensive guesswork. The engineering bar is not whether you can score outputs once, but whether the pipeline can stop bad changes before they hit users.

---

## Q-03-A-010: How do you implement model fallback and routing between multiple LLM providers?

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| LLM Engineering | Model Routing | Applied | 3 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Mid-level, Senior | Software Dev → AI Engineer, DevOps / SRE → AIOps, Senior / Architect | Technical, System Design |

| Prerequisites | Tags |
|---|---|
| Q-02-S-006 | [model-routing, fallback, multi-provider, reliability, llm-engineering] |

**Why This Question Matters:** No single LLM provider has 100% uptime. Provider outages, rate limits, and cost spikes require automatic fallback. Model routing also enables cost optimization by routing simple tasks to cheaper models.

---

**Question**

Design a model router that selects between GPT-4o, Claude 3.5 Sonnet, and Llama 3 70B (self-hosted) based on task complexity, cost, and availability.

---

#### Design Answer

Router design: (1) Classify request complexity (simple/complex via heuristic or small classifier). (2) Route simple requests to cheapest available model (Llama 3 self-hosted). (3) Route complex requests to strongest available model (GPT-4o or Claude). (4) Fallback chain: if primary fails (timeout, rate limit, error), try next provider. (5) Circuit breaker: if a provider has 5+ failures in 60 seconds, stop sending traffic to it temporarily. (6) Track quality per-route and adjust routing weights.

---

#### Implementation Notes

```python
class ModelRouter:
    def __init__(self):
        self.providers = {
            "llama-70b": {"cost": 0.0, "quality": 0.85, "latency": "low"},
            "claude-3.5-sonnet": {"cost": 0.003, "quality": 0.95, "latency": "medium"},
            "gpt-4o": {"cost": 0.005, "quality": 0.97, "latency": "medium"},
        }
        self.circuit_breakers = {name: CircuitBreaker() for name in self.providers}
        self.fallback_chain = ["llama-70b", "claude-3.5-sonnet", "gpt-4o"]
    
    def route(self, request):
        # 1. Classify complexity
        complexity = self.classify_complexity(request)
        
        # 2. Select primary model based on complexity
        if complexity == "simple":
            primary_chain = ["llama-70b", "claude-3.5-sonnet", "gpt-4o"]
        elif complexity == "complex":
            primary_chain = ["gpt-4o", "claude-3.5-sonnet", "llama-70b"]
        else:  # medium
            primary_chain = ["claude-3.5-sonnet", "gpt-4o", "llama-70b"]
        
        # 3. Try each provider in order
        for provider in primary_chain:
            if self.circuit_breakers[provider].is_open():
                continue  # Skip providers in circuit-breaker state
            
            try:
                response = self.call_provider(provider, request, timeout=10)
                self.circuit_breakers[provider].record_success()
                return response
            except (TimeoutError, RateLimitError, APIError) as e:
                self.circuit_breakers[provider].record_failure()
                continue
        
        raise AllProvidersUnavailable("No provider could handle this request")
    
    def classify_complexity(self, request):
        # Heuristics: token count, task type, etc.
        tokens = count_tokens(request.prompt)
        if tokens < 500 and request.task_type in ["classification", "extraction"]:
            return "simple"
        elif request.task_type in ["reasoning", "code_generation", "analysis"]:
            return "complex"
        return "medium"
```

- **Circuit breaker pattern:**
  ```
  CLOSED → (5 failures in 60s) → OPEN → (wait 30s) → HALF-OPEN → (1 success) → CLOSED
                                         ↑                            |
                                         └─── (failure) ──────────────┘
  ```

- **Quality monitoring per route:**
  - Track eval scores per model-route combination
  - If Llama 3 quality degrades on "simple" tasks, reclassify threshold
  - Monthly eval across all routes to validate routing decisions

---

#### Scoped Build

Implement a router that classifies request complexity, applies a cost-aware primary route, and uses circuit breakers plus prompt adapters for fallback providers. Then run a failure drill where the primary provider times out repeatedly.

#### Real Interviewer Follow-ups

1. How do you ensure prompt compatibility across providers? (Different models may need different prompts.)
2. The self-hosted Llama model has better privacy but worse quality. How do you factor privacy into routing?
3. How do you optimize cost while maintaining quality SLAs?

---

#### Weak Answer Signals

- Single provider, no fallback strategy
- No circuit breaker (retries overwhelm failing provider)
- Doesn't consider cost in routing decision

---

#### Interviewer Signal

Production reliability engineering. Multi-provider routing with circuit breakers shows the candidate builds resilient systems. Cost-aware routing shows business awareness.

#### Design / Production Bridge

Routing is the interface between model quality, uptime, privacy, and cost. A strong answer treats fallback as a first-class system behavior, not a desperate retry after the outage has already spread.

---

## Q-03-A-011: How do you handle rate limiting and backpressure when your application depends on external LLM APIs?

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| LLM Engineering | Rate Limiting | Applied | 3 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Mid-level, Senior | Software Dev → AI Engineer, DevOps / SRE → AIOps | Technical |

| Prerequisites | Tags |
|---|---|
| Q-03-A-010 | [rate-limiting, backpressure, api, throttling, llm-engineering] |

**Why This Question Matters:** LLM API rate limits are the most common production bottleneck. Handling them gracefully (instead of throwing errors at users) is essential for reliable LLM-powered applications.

---

**Question**

Your application makes 500 requests/minute to OpenAI's API but your rate limit is 300 RPM. How do you handle this without degrading user experience?

---

#### Design Answer

Solutions: (1) Token bucket rate limiter — throttle outgoing requests to stay within limits. (2) Request queue with priority — queue excess requests, process in order when capacity available. (3) Tiered caching — cache responses for common queries to reduce API calls. (4) Parallel providers — overflow to Claude or self-hosted model. (5) Request coalescing — batch similar requests. (6) Graceful degradation — for low-priority requests, serve cached/simpler responses.

---

#### Implementation Notes

```python
import asyncio
from collections import deque

class LLMRateLimiter:
    def __init__(self, rpm_limit=300, tpm_limit=150000):
        self.rpm_limit = rpm_limit
        self.tpm_limit = tpm_limit
        self.request_times = deque()
        self.token_usage = deque()
        self.queue = asyncio.PriorityQueue()
    
    async def submit(self, request, priority=5):
        """Submit a request with priority (1=highest, 10=lowest)."""
        future = asyncio.Future()
        await self.queue.put((priority, request, future))
        return await future
    
    async def process_loop(self):
        while True:
            # Wait until we have capacity
            await self._wait_for_capacity()
            
            priority, request, future = await self.queue.get()
            
            try:
                response = await self._call_api(request)
                self._record_usage(request, response)
                future.set_result(response)
            except RateLimitError:
                # Re-queue with delay
                await asyncio.sleep(1)
                await self.queue.put((priority, request, future))
    
    async def _wait_for_capacity(self):
        now = time.time()
        # Remove requests older than 60s
        while self.request_times and now - self.request_times[0] > 60:
            self.request_times.popleft()
        
        if len(self.request_times) >= self.rpm_limit:
            wait_time = 60 - (now - self.request_times[0])
            await asyncio.sleep(wait_time)
    
    def _record_usage(self, request, response):
        self.request_times.append(time.time())
        self.token_usage.append((time.time(), response.usage.total_tokens))
```

- **Priority levels:**
  | Priority | Use Case | Handling |
  |----------|----------|---------|
  | 1 (Critical) | Real-time user-facing requests | Always processed first |
  | 5 (Normal) | Standard requests | Queued normally |
  | 8 (Low) | Background processing, batch jobs | Queued, may be delayed |
  | 10 (Deferrable) | Analytics, non-urgent | Process only when idle |

- **Caching to reduce API calls:**
  - Cache exact-match queries: same question = same answer (for deterministic tasks)
  - Semantic cache: similar queries get cached responses (embedding similarity)
  - Typical cache hit rates: 10-30% for diverse queries, 50-80% for FAQ-like workloads

---

#### Scoped Build

Implement a token bucket plus priority queue around one external API integration, then test it with over-limit traffic and verify that critical interactive requests still complete while low-priority jobs are delayed or degraded.

#### Real Interviewer Follow-ups

1. Your rate limit is per-organization. Multiple services share the same API key. How do you coordinate?
2. How do you handle token-per-minute (TPM) limits vs request-per-minute (RPM) limits?
3. The rate limit increases during off-peak hours. How do you take advantage of this?

---

#### Weak Answer Signals

- "Just increase the rate limit" — not always possible
- No priority system (all requests treated equally)
- No caching strategy

---

#### Interviewer Signal

Production API management. Rate limiting is a universal production concern but uniquely challenging for LLM APIs (cost + latency + limits). Priority queuing and caching show engineering maturity.

#### Design / Production Bridge

Rate limiting is really an admission-control problem. If everything is urgent, the system becomes unreliable for everyone as soon as the provider becomes the bottleneck.

---

## Q-03-A-012: How do you monitor and control LLM API costs in production?

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| LLM Engineering | Cost Management | Applied | 2 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Early-career, Mid-level, Senior | Software Dev → AI Engineer, DevOps / SRE → AIOps, Senior / Architect | Technical, Behavioral |

| Prerequisites | Tags |
|---|---|
| Q-03-C-001 | [cost, monitoring, budget, token-usage, llm-engineering] |

**Why This Question Matters:** LLM API costs can spiral unexpectedly — a prompt change that doubles output length doubles cost. Real-time cost monitoring and controls prevent budget overruns that can cost thousands of dollars per day.

---

**Question**

Your LLM costs jumped from $500/day to $2000/day. No traffic increase. How do you detect, diagnose, and prevent this?

---

#### Design Answer

Detection: real-time cost dashboard with alerts (alert at 150% of daily average). Diagnosis: (1) Check token usage per endpoint — which endpoint's cost increased? (2) Check average tokens per request — did prompt or output length change? (3) Check model version — did someone switch to a more expensive model? (4) Check for runaway loops (retry storms). Prevention: per-endpoint cost budgets, max_tokens enforcement, prompt length limits, cost anomaly alerts.

---

#### Implementation Notes

- **Cost monitoring architecture:**
  ```python
  class CostTracker:
      def track_request(self, endpoint, response):
          input_tokens = response.usage.prompt_tokens
          output_tokens = response.usage.completion_tokens
          model = response.model
          
          # Calculate cost
          cost = (input_tokens * MODEL_PRICING[model]["input"] + 
                  output_tokens * MODEL_PRICING[model]["output"])
          
          # Log to metrics system
          metrics.record(
              endpoint=endpoint,
              model=model,
              input_tokens=input_tokens,
              output_tokens=output_tokens,
              cost_usd=cost,
              timestamp=now()
          )
          
          # Check budget
          daily_spend = metrics.get_daily_spend(endpoint)
          if daily_spend > DAILY_BUDGET[endpoint]:
              alert(f"Endpoint {endpoint} exceeded daily budget: ${daily_spend:.2f}")
              # Option: switch to cheaper model or reject non-critical requests
  ```

- **Cost diagnosis checklist:**
  | Check | What to Look For |
  |-------|-----------------|
  | Tokens per request | Output tokens doubled → prompt change made model verbose |
  | Requests per hour | Retry storm → exponential growth |
  | Model used | Someone changed from gpt-3.5-turbo to gpt-4o |
  | Endpoint breakdown | One endpoint consuming 80% of budget |
  | Cache hit rate | Cache disabled → all requests hitting API |

- **Prevention controls:**
  - **max_tokens on every request:** Never allow unlimited output
  - **Per-endpoint daily budgets with automatic cutoff**
  - **Prompt regression tests:** Assert prompt+output token count stays within expected range
  - **Model pinning:** Prevent accidental model upgrades
  - **Rate limiting per user:** Prevent single-user abuse

---

#### Scoped Build

Track input tokens, output tokens, model choice, and cost per endpoint for every request, then add anomaly alerts and one hard budget action such as model downgrade, request rejection, or tighter `max_tokens` when a threshold is crossed.

#### Real Interviewer Follow-ups

1. How do you set cost budgets for new features with unknown usage patterns?
2. Should cost be a factor in model selection? How much quality degradation is acceptable for 50% cost reduction?
3. How do you attribute LLM costs to individual product features or teams?

---

#### Weak Answer Signals

- "We check the OpenAI dashboard at end of month" — way too late
- No per-endpoint cost tracking
- No max_tokens on requests

---

#### Interviewer Signal

Cost awareness. LLM costs are the #1 concern for production LLM applications. Candidates who describe real-time monitoring, per-endpoint budgets, and automatic controls demonstrate operational maturity.

#### Design / Production Bridge

LLM spend usually rises through token drift, not only traffic growth. Teams that do not measure cost at the request and endpoint level usually discover the problem after the bill arrives.

---

## Q-03-A-013: How do you design prompts that work reliably under high-concurrency production conditions?

| Module | Submodule | Level | Difficulty |
|---|---|---|---|
| LLM Engineering | Prompt Reliability | Applied | 3 |

| Experience Bands | Persona Relevance | Interview Round |
|---|---|---|
| Mid-level, Senior | Software Dev → AI Engineer | Technical |

| Prerequisites | Tags |
|---|---|
| Q-02-A-001, Q-02-A-010 | [prompt-engineering, reliability, production, testing, llm-engineering] |

**Why This Question Matters:** A prompt that works perfectly in development may fail unpredictably in production due to input diversity, edge cases, and model behavior under different conditions. Designing for reliability requires a different approach than designing for demos.

---

**Question**

You designed a prompt that works 99% of the time in testing. In production with 10,000 requests/day, that's 100 failures daily. How do you push reliability to 99.9%+?

---

#### Design Answer

Layers of defense: (1) Prompt hardening — add explicit constraints, examples for edge cases, boundary conditions. (2) Input validation — reject or transform malformed inputs before they reach the LLM. (3) Output validation — parse and validate structured output, retry on failure. (4) Fallback prompts — simpler prompt as backup when complex prompt fails. (5) Monitoring — track failure rate by input category, continuously add edge case examples. (6) Graceful degradation — return a safe default response rather than error.

---

#### Implementation Notes

- **Prompt hardening techniques:**
  ```
  BEFORE (fragile):
  "Classify this customer message: {message}"
  
  AFTER (hardened):
  "Classify the customer message into exactly ONE of these categories:
  - billing: Payment, invoice, pricing questions
  - technical: Product bugs, errors, how-to questions
  - account: Login, password, settings, subscription
  - other: Everything that doesn't fit above
  
  Rules:
  1. Output ONLY the category name, nothing else
  2. If the message is empty or unclear, output 'other'
  3. If the message contains multiple topics, choose the primary one
  4. Never output a category not in the list above
  
  Customer message: {message}
  Category:"
  ```

- **Reliability engineering pattern:**
  ```python
  async def classify_reliable(message, max_retries=3):
      # 1. Input validation
      if not message or len(message) < 3:
          return "other"  # Default for invalid input
      
      message = sanitize(message)  # Remove control chars, etc.
      
      # 2. Primary attempt
      for attempt in range(max_retries):
          try:
              result = await llm.classify(HARDENED_PROMPT, message)
              
              # 3. Output validation
              if result.strip().lower() in VALID_CATEGORIES:
                  return result.strip().lower()
              
              # Invalid output — retry with feedback
              continue
              
          except (TimeoutError, APIError):
              continue
      
      # 4. Fallback: simpler prompt or rule-based
      return rule_based_classifier(message)
  ```

- **Testing for reliability:**
  - Test with 1000+ diverse inputs (not just happy path)
  - Include: empty strings, very long inputs, non-English, mixed languages, emojis, code, special characters, adversarial inputs
  - Track failure rate by category to identify weak spots
  - Add every production failure as a new test case

---

#### Scoped Build

Wrap one prompt-driven workflow with input validation, hardened instructions, output validation, retry, and a fallback path. Then build a regression set from real failure cases and measure whether the layered defenses push reliability from demo quality to production quality.

#### Real Interviewer Follow-ups

1. How do you balance prompt specificity (more instructions = more reliable) vs prompt length (more tokens = higher cost/latency)?
2. Your fallback classifier is rule-based and lower quality. How do you decide when to accept the fallback vs error?
3. How do you version and A/B test prompt changes?

---

#### Weak Answer Signals

- "99% is good enough" — not at 10K requests/day
- No output validation
- No fallback strategy
- No monitoring of production failure rate

---

#### Interviewer Signal

Production reliability mindset applied to LLM engineering. The key insight: reliability comes from layers of defense (input validation → prompt hardening → output validation → retry → fallback), not from one perfect prompt.

#### Design / Production Bridge

Prompting becomes engineering when the system is designed to survive the 1% failures. Strong candidates stop talking about prompt wording alone and start talking about validation, rollback, and safe degradation.
