# Question Schema

> Canonical format for every question in AI Interview OS. No exceptions.

---

## Purpose

The question schema ensures every question is:
- **Consistent** — identical structure across all modules
- **Machine-readable** — parseable for future website, search, and mock interview tooling
- **Interview-realistic** — contains metadata that maps to real interview rounds and evaluation
- **Self-contained** — each question is usable independently, without requiring surrounding context

---

## Full Schema Template

```markdown
### Q-{MODULE}-{LEVEL}-{SEQ}: {Question Title}

**Module:** {module name}
**Submodule:** {submodule or topic area}
**Level:** Concept | Applied | System | Debugging
**Difficulty:** {1–5}
**Experience Bands:** {Beginner | Early-career | Mid-level | Senior | Architect} (one or more)
**Persona Relevance:** {persona group(s) where this question is most relevant}
**Tags:** [{tag1}, {tag2}, {tag3}, ...]
**Prerequisites:** {Q-IDs or topic names that should be understood first, or "None"}
**Estimated Interview Round:** Screening | Technical | Deep Dive | System Design | Debugging
**Why This Question Matters:** {1–2 sentences on what this question tests and why interviewers ask it}

---

**Question**

{Full question text. Must be clear, specific, and self-contained. Should not require additional context or setup unless explicitly provided. For scenario-based questions, include the scenario within the question.}

---

**Expected Answer (Short)**

{2–5 lines. Technically precise. No filler. This is what a good candidate says in 30–60 seconds.}

---

**Deep Answer**

- {Bullet point 1: core explanation}
- {Bullet point 2: trade-offs}
- {Bullet point 3: production reasoning}
- {Bullet point 4: caveats or edge cases}
- {Bullet point 5: alternatives or related considerations}
- {Additional bullets as needed — no maximum, but no padding}

---

**Follow-up Questions**

1. {Follow-up that increases depth or pressure}
2. {Follow-up that tests a related trade-off}
3. {Follow-up that shifts to a different angle (e.g., from design to debugging)}
{Minimum 2, recommended 3–5}

---

**Common Weak Answers / Red Flags**

- {What weak candidates typically say}
- {What oversimplifications to watch for}
- {What signals lack of production experience}
{Minimum 2 entries}

---

**Interviewer Evaluation Signal**

{Single paragraph or 1–3 lines. What this question reveals about the candidate: depth of understanding, production judgment, ability to reason under pressure, architecture maturity, etc.}

---

**Real-World Insight**

{Connect to actual production systems, incidents, architecture decisions, cost implications, or reliability concerns. Must be specific — not "this is important in production" but rather "at scale, this causes X because Y, and teams typically address it by Z."}
```

---

## Question ID Convention

### Format

```
Q-{MODULE_ID}-{LEVEL_CODE}-{SEQUENCE}
```

### Components

| Component | Format | Values |
|-----------|--------|--------|
| MODULE_ID | Two-digit | 00–11 |
| LEVEL_CODE | Single letter | C (Concept), A (Applied), S (System), D (Debugging) |
| SEQUENCE | Three-digit | 001–999 |

### Examples

| ID | Meaning |
|----|---------|
| `Q-00-C-001` | Foundations, Concept level, question 1 |
| `Q-04-A-012` | RAG, Applied level, question 12 |
| `Q-09-S-005` | System Design, System level, question 5 |
| `Q-10-D-003` | Debugging & Failure Modes, Debugging level, question 3 |
| `Q-05-A-021` | Agentic AI, Applied level, question 21 |

### Rules

- IDs are permanent. Do not renumber after deletion.
- Gaps in sequence numbers are acceptable and expected.
- IDs must be unique across the entire repository.
- When a question is deprecated, mark it as `[DEPRECATED]` in the title — do not reassign the ID.

---

## Field-Level Specifications

### Module

The parent module name. Must exactly match one of:

- `Foundations`
- `PyTorch & Deep Learning`
- `Generative AI`
- `LLM Engineering`
- `RAG`
- `Agentic AI`
- `LLMOps`
- `MLOps`
- `AIOps`
- `System Design`
- `Debugging & Failure Modes`
- `Case Studies`

### Submodule

A topic area within the module. Examples:

| Module | Valid Submodules |
|--------|-----------------|
| RAG | Chunking, Retrieval, Reranking, Evaluation, Context Assembly, Ingestion |
| Agentic AI | Planning, Tool Calling, Memory, Multi-Agent, Guardrails, State Management |
| LLMOps | Deployment, Versioning, Observability, Cost Tracking, Evaluation |
| System Design | Architecture, Scaling, Reliability, Cost/Performance, Multi-Tenancy |

Submodules are not strictly enumerated — new ones can be added as needed, but they should be consistent within a module.

### Level

One of four values. Every module must contain questions at all four levels.

| Level | Code | What It Tests |
|-------|------|--------------|
| Concept | C | Definitions, first principles, mental models |
| Applied | A | Design choices, trade-offs, practical reasoning |
| System | S | Architecture, scale, reliability, cost/perf trade-offs |
| Debugging | D | Failure analysis, incidents, anti-patterns, recovery |

### Difficulty

Integer from 1 to 5. See [difficulty_guide.md](difficulty_guide.md) for calibration details.

| Score | Label | Calibration |
|-------|-------|-------------|
| 1 | Foundational | Should be known by any candidate claiming familiarity with the topic |
| 2 | Solid | Demonstrates working knowledge; expected from early-career engineers |
| 3 | Applied | Requires practical reasoning and trade-off awareness |
| 4 | Production | Requires deep experience with real systems |
| 5 | Architectural | Requires cross-system judgment and design authority |

### Experience Bands

One or more of:

- `Beginner` — 0–1 years
- `Early-career` — 1–3 years
- `Mid-level` — 3–5 years
- `Senior` — 5–8 years
- `Architect` — 8+ years

A question can span multiple bands. Example: A difficulty-3 question might be appropriate for `Mid-level, Senior`.

### Persona Relevance

One or more of:

- `Software Dev → AI Engineer`
- `ML / Data Engineer`
- `DevOps / SRE → AIOps`
- `Fresher / Beginner`
- `Senior / Architect`

Indicates which persona groups would most likely encounter this question. Most questions will be relevant to 2–3 personas.

### Tags

Array of lowercase, hyphenated tags. See [tagging_system.md](tagging_system.md) for the full taxonomy and conventions.

### Prerequisites

Either `None` or a comma-separated list of:
- Question IDs (e.g., `Q-04-C-001, Q-04-C-003`)
- Topic names (e.g., `"basic embedding concepts", "attention mechanism"`)

Prerequisites indicate what a candidate should understand before attempting this question. They are used for sequencing in Deep Prep and Interview Simulation modes.

### Estimated Interview Round

One of:

| Round | Typical Duration | What It Tests |
|-------|-----------------|--------------|
| Screening | 15–30 min | Fundamentals, communication, basic techn knowledge |
| Technical | 45–60 min | Applied knowledge, coding, problem-solving |
| Deep Dive | 45–60 min | Production experience, trade-offs, depth |
| System Design | 45–60 min | Architecture, scale, reliability, cost |
| Debugging | 30–45 min | Incident response, root cause analysis, recovery |

### Why This Question Matters

1–2 sentences explaining:
- What capability this question tests
- Why interviewers ask it (what signal it gives)

This field helps learners understand the purpose of the question, not just the content.

---

## Quality Rules for Each Field

### Question Text

- Must be self-contained. No "as discussed above" or "continuing from the last question."
- For scenario-based questions, include the full scenario.
- Must be specific. "How would you improve this system?" is too vague. "How would you reduce P95 latency of a RAG pipeline serving 10K concurrent users?" is specific.
- Must not be answerable with a single yes/no or a one-line definition (except at Concept level, difficulty 1).

### Expected Answer (Short)

- 2–5 lines maximum.
- Technically precise. Every word earns its place.
- This is what a strong candidate says in the first 30–60 seconds.
- No "It depends" without immediately stating what it depends on.

### Deep Answer

- Bullet points, not paragraphs.
- Must include at least one trade-off.
- Must include at least one production consideration for Applied+ questions.
- Must include at least one caveat or edge case where the obvious answer breaks down.
- No filler bullets like "This is an important concept."

### Follow-up Questions

- Minimum 2, recommended 3–5.
- Must escalate difficulty or shift angle.
- At least one follow-up should move from theory to practice (or vice versa).
- At least one follow-up should be a "what if" scenario that changes a constraint.
- Bad follow-ups: "Can you explain more?" / "Tell me about X." These are not follow-ups; they are prompts.

### Common Weak Answers / Red Flags

- Minimum 2 entries.
- Must reflect what actual weak candidates say, not strawman responses.
- Should include both oversimplifications and common misconceptions.
- Example of a good entry: "Candidate says 'just increase chunk size' without considering context window limits or retrieval precision degradation."
- Example of a bad entry: "Candidate doesn't know the answer."

### Interviewer Evaluation Signal

- 1–3 lines.
- Must specify what capability gap the question exposes.
- Example: "Reveals whether the candidate understands the difference between retrieval accuracy and end-to-end answer quality — a critical gap in many RAG engineers."

### Real-World Insight

- Must be specific to real system behavior, not generic advice.
- Good: "In high-traffic RAG systems, chunk overlap above 20% significantly increases indexing cost without proportional retrieval quality gains. Most production systems settle on 10–15% overlap after tuning."
- Bad: "Chunking is important in RAG systems."
- Should reference measurable impacts (cost, latency, failure rates) where possible.

---

## Example: Fully Populated Question

```markdown
### Q-04-A-007: When does BM25 outperform dense retrieval in a RAG pipeline?

**Module:** RAG
**Submodule:** Retrieval
**Level:** Applied
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, Software Dev → AI Engineer
**Tags:** [rag, retrieval, bm25, dense-retrieval, hybrid-search, trade-offs]
**Prerequisites:** Q-04-C-001 (embedding basics), Q-04-C-003 (retrieval fundamentals)
**Estimated Interview Round:** Technical, Deep Dive
**Why This Question Matters:** Tests whether the candidate has production intuition about retrieval methods beyond defaulting to embeddings, which is a common gap in RAG engineers.

---

**Question**

In a production RAG pipeline, under what conditions does BM25-based retrieval outperform dense embedding retrieval? How would you decide which to use, and when would you combine both?

---

**Expected Answer (Short)**

BM25 outperforms dense retrieval when queries contain rare or domain-specific keywords, when the corpus has strong lexical patterns (e.g., legal, medical), or when training data for embeddings is insufficient. In practice, hybrid search (BM25 + dense) with reciprocal rank fusion is the most robust default, as it covers both lexical precision and semantic understanding.

---

**Deep Answer**

- BM25 excels at exact keyword matching — critical for domain-specific terms, product names, error codes, or acronyms that embedding models may not encode well
- Dense retrieval excels at semantic similarity — captures paraphrases and conceptual matches that BM25 misses entirely
- BM25 requires no training or fine-tuning — zero cold-start cost, works immediately on any corpus
- Dense retrieval quality degrades when the embedding model is not trained on domain-similar data
- Hybrid search (BM25 + dense with rank fusion) consistently outperforms either method alone in benchmarks and production
- Reciprocal Rank Fusion (RRF) is the most common combination strategy — simple, effective, tunable with a single k parameter
- For multilingual corpora, dense retrieval has a significant advantage over BM25
- BM25 is computationally cheaper at index and query time — relevant for cost-sensitive or high-throughput systems
- In practice, start with hybrid, then A/B test to determine if one component can be dropped without quality loss

---

**Follow-up Questions**

1. How would you implement reciprocal rank fusion, and what happens if you weight BM25 too heavily?
2. Your RAG system handles medical documents with many Latin terms. Embedding retrieval is missing relevant passages. What do you investigate first?
3. How would you evaluate whether adding BM25 to an existing dense retrieval pipeline actually improves end-to-end answer quality, not just retrieval recall?
4. At what corpus size does BM25 index maintenance become a concern, and how do you handle it?

---

**Common Weak Answers / Red Flags**

- "Dense retrieval is always better because it understands meaning" — ignores domain-specific failure modes
- "Just use embeddings" without discussing when they fail — suggests lack of production debugging experience
- Candidate cannot explain what BM25 actually does (TF-IDF variant with length normalization) — signals surface-level RAG knowledge
- "Hybrid search is too complex" — most production RAG systems use hybrid; this suggests limited real-world experience

---

**Interviewer Evaluation Signal**

Reveals whether the candidate makes retrieval decisions based on evidence and system requirements, or defaults to the most popular approach. Strong candidates demonstrate awareness of failure modes for each method and articulate when simplicity (BM25) beats sophistication (dense).

---

**Real-World Insight**

Most production RAG systems at scale (legal tech, enterprise search, customer support) use hybrid retrieval. Teams that start with dense-only retrieval frequently discover gaps during QA — especially for queries with acronyms, product IDs, or domain jargon. Adding BM25 as a parallel retrieval path with RRF typically improves recall@10 by 8–15% with minimal latency overhead. The decision to drop one leg of hybrid usually comes from cost pressure, not quality analysis.
```

---

## Schema Compliance Checklist

Use this checklist when authoring or reviewing questions:

- [ ] Question ID follows `Q-{MODULE}-{LEVEL}-{SEQ}` format
- [ ] All 14 metadata fields are populated
- [ ] Level matches content (not just labeled "Applied" while testing recall)
- [ ] Difficulty is calibrated against the difficulty guide
- [ ] Experience bands are realistic (not everything is "Mid-level, Senior")
- [ ] Tags follow the tagging system conventions
- [ ] Question text is self-contained and specific
- [ ] Expected Answer is 2–5 lines, technically precise
- [ ] Deep Answer has bullets with trade-offs and production reasoning
- [ ] Follow-ups number ≥2 and escalate difficulty
- [ ] Common Weak Answers reflect realistic bad responses
- [ ] Interviewer Evaluation Signal specifies what the question reveals
- [ ] Real-World Insight is specific, not generic
- [ ] No duplicate or near-duplicate exists in the same module
