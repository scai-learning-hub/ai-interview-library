# Module 03 — LLM Engineering

> Tokenization, attention, context windows, KV cache, sampling, and model lifecycle.

**Question count:** 33
**Prerequisite modules:** 01 (PyTorch & DL), 02 (GenAI — helpful)
**Unlocks:** 04 (RAG), 05 (Agentic AI), 06 (LLMOps), 09 (System Design)

## How To Use This Module

LLM Engineering interviews usually move in this order:

```text
Basic answer -> Concept depth -> Build and serve -> System trade-offs -> Debugging under pressure
```

Do not treat this module like a transformer theory chapter. The real interview path is usually: explain the mechanism, connect it to serving cost or latency, then handle a concrete production failure.

## File Map

| File | Primary interview use | Focus | Questions |
|-------|------|-------|-----------|
| [concept.md](concept.md) | Basic screen + core internals | Tokenization, attention, positional encoding, KV cache, quantization, decoding, speculative decoding, model selection, and cost/mechanism trade-offs | 9 |
| [applied.md](applied.md) | Build + inference decisions | Model serving, prefix caching, benchmarking, token budgets, structured output, streaming, batching, evaluation, routing, rate limiting, cost, prompt reliability | 13 |
| [system.md](system.md) | Platform and architecture | Multi-model serving platform, continuous quality monitoring, semantic caching, LLM observability, multi-tenant platform, A/B testing | 6 |
| [debugging.md](debugging.md) | Real failures and recovery | JSON reliability, throughput regression, tool call hallucination, GPU memory leaks, tail latency | 5 |

If you are early-career, start with `concept.md` and translate each idea into cost or latency implications. If you are senior, move quickly into `applied.md`, `system.md`, and `debugging.md` because that is where production judgment shows up.

## Key Topics

- Tokenization (BPE, SentencePiece, vocabulary)
- Attention mechanisms (MHA, MQA, GQA)
- Positional encoding (RoPE, ALiBi)
- Context windows and long-context models
- KV cache and PagedAttention
- Sampling and decoding strategies
- Model selection and benchmarks
