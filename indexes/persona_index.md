# Persona Index

> Maps all 5 persona groups to their recommended modules, modes, priorities, and navigation paths.

---

## Quick Persona Selector

| # | Persona Group | You Are... | Start Here |
|---|--------------|-----------|------------|
| 1 | [Software Dev → AI Engineer](#1-software-developer--ai-engineer) | Backend, full-stack, or API engineer moving into AI | [Persona File](../personas/software_dev_to_ai_engineer.md) |
| 2 | [ML / Data Engineer](#2-ml--data-engineer) | MLE, data scientist, or research engineer preparing for production AI roles | [Persona File](../personas/ml_data_engineer.md) |
| 3 | [DevOps / SRE → AIOps / LLMOps](#3-devops--sre--aiops--llmops) | DevOps, SRE, or platform engineer moving into AI operations | [Persona File](../personas/devops_sre_to_aiops.md) |
| 4 | [Fresher / Beginner](#4-fresher--beginner) | Recent grad, bootcamp alum, or career switcher entering AI | [Persona File](../personas/fresher_beginner.md) |
| 5 | [Senior / Architect](#5-senior--architect) | Staff+, tech lead, or architect-level engineer | [Persona File](../personas/senior_architect.md) |

---

## Persona → Module Priority Matrix

| Module | SWE → AI | ML / Data | DevOps / SRE | Fresher | Senior / Arch |
|--------|----------|-----------|-------------|---------|---------------|
| 00 Foundations | ★★★ | ★★ | ★★ | ★★★ | ★ |
| 01 PyTorch & DL | ★★★ | ★★ | ★ | ★★★ | ★ |
| 02 GenAI | ★★★ | ★★★ | ★★ | ★★★ | ★★ |
| 03 LLM Engineering | ★★★ | ★★★ | ★★ | ★★ | ★★★ |
| 04 RAG | ★★★ | ★★★ | ★★ | ★★ | ★★★ |
| 05 Agentic AI | ★★ | ★★★ | ★★ | ★★ | ★★★ |
| 06 LLMOps | ★★ | ★★ | ★★★ | ★ | ★★★ |
| 07 MLOps | ★★ | ★★★ | ★★★ | ★ | ★★ |
| 08 AIOps | ★ | ★ | ★★★ | ★ | ★★ |
| 09 System Design | ★★ | ★★ | ★★ | ★ | ★★★ |
| 10 Debugging | ★★ | ★★ | ★★★ | ★ | ★★★ |
| 11 Case Studies | ★ | ★★ | ★ | ★ | ★★★ |

**Legend:** ★★★ = Critical | ★★ = Important | ★ = Valuable but lower priority

---

## 1. Software Developer → AI Engineer

### Who Fits Here?

- Backend engineers (Java, Go, Python, Node.js)
- Full-stack developers
- API engineers
- Mobile developers with server-side experience
- Platform engineers without ML background
- Any software engineer with strong coding skills but limited ML/AI experience

### Profile Summary

| Attribute | Value |
|-----------|-------|
| **Starting Strengths** | Software engineering fundamentals, system design, API design, coding, debugging, CI/CD |
| **Typical Gaps** | ML fundamentals, deep learning mechanics, LLM internals, AI-specific system design, evaluation |
| **Interview Risk Areas** | ML theory questions, transformer internals, training/fine-tuning mechanics |
| **Recommended Prep Mode** | Deep Prep (30-day) or Interview Simulation |
| **Difficulty Starting Range** | Difficulty 1–3 |
| **Must-Master Topics** | Prompt engineering, RAG pipeline design, LLM API integration, basic fine-tuning, AI system architecture |

### Recommended Module Order

```
1. 00_foundations (fill ML gaps)
2. 01_pytorch_and_deep_learning (high-level understanding)
3. 02_genai (core applied skill)
4. 03_llm_engineering (understand the engine)
5. 04_rag (most common pattern you'll build)
6. 05_agentic_ai (next frontier)
7. 06_llmops (deploy what you build)
8. 09_system_design (leverage your SWE strength)
9. 10_debugging (production readiness)
```

### Question Priority Strategy

1. Start with Concept level in modules 00–01 to fill foundational gaps
2. Move quickly to Applied level in modules 02–04 (this is where your interviews will focus)
3. Leverage your SWE background for System-level questions in modules 09–10
4. Spend extra time on Debugging in modules 04, 05 — these expose AI-specific failure modes you haven't seen

→ [Full persona file](../personas/software_dev_to_ai_engineer.md)

---

## 2. ML / Data Engineer

### Who Fits Here?

- Machine learning engineers
- Data scientists transitioning to engineering roles
- Research engineers moving to production
- Data engineers building ML pipelines
- NLP engineers expanding to LLMs
- Computer vision engineers expanding to generative AI

### Profile Summary

| Attribute | Value |
|-----------|-------|
| **Starting Strengths** | ML theory, model training, data pipelines, experiment management, Python/ML libraries |
| **Typical Gaps** | Production system design, LLM-specific operational patterns, infrastructure/deployment, cost optimization at scale |
| **Interview Risk Areas** | System design rounds, LLMOps, production debugging, infrastructure questions |
| **Recommended Prep Mode** | Deep Prep or System Design Mode |
| **Difficulty Starting Range** | Difficulty 2–4 |
| **Must-Master Topics** | LLM inference optimization, RAG architecture, production evaluation, MLOps best practices, system design |

### Recommended Module Order

```
1. 02_genai (bridge to LLM world)
2. 03_llm_engineering (deepen LLM understanding)
3. 04_rag (master the dominant pattern)
4. 05_agentic_ai (high-growth area)
5. 07_mlops (formalize your pipeline knowledge)
6. 06_llmops (extend to LLM-specific ops)
7. 09_system_design (biggest gap for most MLEs)
8. 10_debugging (production readiness)
9. 11_case_studies (integrative practice)
```

### Question Priority Strategy

1. Skip most Concept-level questions — you likely know the theory
2. Dive into Applied level immediately for modules 02–05
3. Heavily prioritize System level across all modules — this is where MLE interviewers differentiate
4. Focus on Debugging in modules 04, 05, 10 — production failure modes are often unfamiliar

→ [Full persona file](../personas/ml_data_engineer.md)

---

## 3. DevOps / SRE → AIOps / LLMOps

### Who Fits Here?

- DevOps engineers
- Site Reliability Engineers (SREs)
- Platform engineers
- Infrastructure engineers
- Cloud engineers
- Release engineers
- Monitoring/observability engineers

### Profile Summary

| Attribute | Value |
|-----------|-------|
| **Starting Strengths** | Infrastructure, CI/CD, monitoring, incident response, containerization, scaling, reliability |
| **Typical Gaps** | ML/DL fundamentals, LLM mechanics, AI-specific failure modes, model evaluation |
| **Interview Risk Areas** | ML theory, model internals, AI-specific system design (vs. generic infra) |
| **Recommended Prep Mode** | Quick Prep (for ops roles) or Deep Prep (for full AI ops roles) |
| **Difficulty Starting Range** | Difficulty 1–2 (for AI topics), 3–4 (for ops topics) |
| **Must-Master Topics** | LLM deployment, observability for AI, drift detection, MLOps pipelines, AIOps patterns, cost optimization |

### Recommended Module Order

```
1. 00_foundations (minimal — focus on ML basics only)
2. 02_genai (understand what you're operating)
3. 06_llmops (your core domain)
4. 07_mlops (pipeline operations)
5. 08_aiops (your specialty extension)
6. 04_rag (most common system you'll support)
7. 10_debugging (leverage your incident response skills)
8. 09_system_design (infrastructure-focused design)
```

### Question Priority Strategy

1. Do Concept level in modules 00, 02, 03 — just enough to understand AI systems
2. Jump directly to Applied and System levels in modules 06, 07, 08
3. Your strength is in Debugging — prioritize level 4 questions in every module
4. For System Design, focus on infrastructure and reliability angles, not model design

→ [Full persona file](../personas/devops_sre_to_aiops.md)

---

## 4. Fresher / Beginner

### Who Fits Here?

- Recent CS/engineering graduates
- Bootcamp graduates
- Career switchers from non-tech fields
- Self-taught programmers entering AI
- Students preparing for first AI role
- Interns or entry-level engineers

### Profile Summary

| Attribute | Value |
|-----------|-------|
| **Starting Strengths** | Fresh learning capacity, up-to-date course knowledge, enthusiasm, no bad habits |
| **Typical Gaps** | Everything production-related, system design, debugging, trade-off reasoning |
| **Interview Risk Areas** | Applied questions, anything requiring production experience, system design rounds |
| **Recommended Prep Mode** | Deep Prep (60-day minimum) |
| **Difficulty Starting Range** | Difficulty 1–2 |
| **Must-Master Topics** | ML foundations, PyTorch basics, prompt engineering, basic RAG, basic agent concepts |

### Recommended Module Order

```
1. 00_foundations (thorough — this is your base)
2. 01_pytorch_and_deep_learning (build practical DL skills)
3. 02_genai (understand the current landscape)
4. 03_llm_engineering (understand how LLMs work)
5. 04_rag (learn the most practical pattern)
6. 05_agentic_ai (exposure to frontier topics)
7. 09_system_design (begin developing design thinking)
```

### Question Priority Strategy

1. Complete ALL Concept-level questions across modules 00–04 before moving to Applied
2. Focus on difficulty 1–2 questions first, then progress to difficulty 3
3. Do Applied-level questions in modules 02–04 after completing concepts
4. Skip System and Debugging levels until you have solid Applied-level understanding
5. Use follow-up questions to deepen understanding, not just the main question

→ [Full persona file](../personas/fresher_beginner.md)

---

## 5. Senior / Architect

### Who Fits Here?

- Staff engineers
- Principal engineers
- Tech leads
- Engineering managers with technical interviews
- CTOs at startups
- Solution architects
- Distinguished engineers
- Anyone interviewing for L6+ / Staff+ roles

### Profile Summary

| Attribute | Value |
|-----------|-------|
| **Starting Strengths** | System design, cross-team thinking, cost/reliability trade-offs, operational maturity, leadership |
| **Typical Gaps** | Latest AI techniques (RAG, agents, LoRA specifics), LLM-specific operational patterns |
| **Interview Risk Areas** | AI-specific deep dives (tokenization, attention, RAG evaluation), staying current with rapidly evolving tooling |
| **Recommended Prep Mode** | System Design Mode + Debugging Mode |
| **Difficulty Starting Range** | Difficulty 3–5 |
| **Must-Master Topics** | AI system architecture, LLM evaluation, RAG at scale, agent orchestration, cost modeling, production debugging |

### Recommended Module Order

```
1. 03_llm_engineering (understand the engine deeply)
2. 04_rag (master the dominant pattern)
3. 05_agentic_ai (understand agent architecture)
4. 06_llmops (production operations)
5. 09_system_design (your strength — add AI depth)
6. 10_debugging (production incident scenarios)
7. 11_case_studies (integrative exercises)
8. 02_genai (fill any gaps)
```

### Question Priority Strategy

1. Skip difficulty 1–2 unless you genuinely don't know the topic
2. Start at Applied level, move quickly to System and Debugging
3. Focus on difficulty 4–5 questions — these are what your interviews test
4. Prioritize System Design and Debugging modes
5. Case Studies are high-value for your level — they test integrative thinking
6. Pay special attention to cross-module questions that span infrastructure + AI

→ [Full persona file](../personas/senior_architect.md)

---

## Persona × Mode Recommendation Matrix

| Persona | Quick Prep | Deep Prep | Simulation | Debugging | Sys Design |
|---------|-----------|-----------|------------|-----------|------------|
| SWE → AI | ✓ | ★ | ★ | ✓ | ✓ |
| ML / Data | ✓ | ★ | ✓ | ✓ | ★ |
| DevOps / SRE | ★ | ✓ | ✓ | ★ | ✓ |
| Fresher | ✗ | ★ | ✓ | ✗ | ✗ |
| Senior / Arch | ✓ | ✓ | ★ | ★ | ★ |

**Legend:** ★ = Recommended primary mode | ✓ = Useful secondary mode | ✗ = Not recommended (insufficient foundation)

---

## Persona × Experience Band Matrix

| Persona | Beginner | Early-career | Mid-level | Senior | Architect |
|---------|----------|-------------|-----------|--------|-----------|
| SWE → AI | — | ★ | ★ | ★ | — |
| ML / Data | — | ★ | ★ | ★ | ★ |
| DevOps / SRE | — | ★ | ★ | ★ | — |
| Fresher | ★ | ★ | — | — | — |
| Senior / Arch | — | — | — | ★ | ★ |

**Legend:** ★ = Typical experience band for this persona | — = Unusual but not impossible

---

## How to Use This Index

1. **Find your persona** — Read the profile summary. If it matches, follow the link to the full persona file.
2. **Check the module priority matrix** — Focus on ★★★ modules first.
3. **Follow the recommended module order** — The sequence is designed to build knowledge progressively.
4. **Choose your prep mode** — Use the persona × mode matrix to pick the right mode.
5. **Apply the question priority strategy** — This tells you which difficulty levels and question levels to prioritize.
6. **Revisit this index** — As you progress, your effective persona may shift (e.g., a fresher becoming an early-career SWE → AI).
