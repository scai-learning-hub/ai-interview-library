# Module 03 — LLM Engineering

> Tokenization, attention, context windows, KV cache, sampling, and model lifecycle.

**Question count:** 33
**Prerequisite modules:** 01 (PyTorch & DL), 02 (GenAI — helpful)
**Unlocks:** 04 (RAG), 05 (Agentic AI), 06 (LLMOps), 09 (System Design)

## Levels

| Level | File | Focus | Questions |
|-------|------|-------|-----------|
| Concept | [concept.md](concept.md) | Tokenization, attention, positional encoding, KV cache, quantization, decoding, speculative decoding, model selection | 9 |
| Applied | [applied.md](applied.md) | Model serving, prefix caching, benchmarking, token budgets, structured output, streaming, batching, evaluation, routing, rate limiting, cost, prompt reliability | 13 |
| System | [system.md](system.md) | Multi-model serving platform, continuous quality monitoring, semantic caching, LLM observability, multi-tenant platform, A/B testing | 6 |
| Debugging | [debugging.md](debugging.md) | JSON reliability, throughput regression, tool call hallucination, GPU memory leaks, tail latency | 5 |

## Key Topics

- Tokenization (BPE, SentencePiece, vocabulary)
- Attention mechanisms (MHA, MQA, GQA)
- Positional encoding (RoPE, ALiBi)
- Context windows and long-context models
- KV cache and PagedAttention
- Sampling and decoding strategies
- Model selection and benchmarks
