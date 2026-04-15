# Difficulty Guide

> Calibration reference for difficulty ratings 1–5 across all modules.

---

## Purpose

Difficulty ratings ensure consistent calibration across all 12 modules and all question authors. A difficulty-3 question in the RAG module should demand roughly the same level of reasoning as a difficulty-3 question in the System Design module — adjusted for domain, but calibrated for cognitive load.

This guide defines what each difficulty level means, what it expects from candidates, and provides calibration examples across multiple modules.

---

## Difficulty Scale

| Difficulty | Label | Candidate Expectation | Typical Experience Band |
|-----------|-------|----------------------|------------------------|
| **1** | Foundational | Core knowledge that any candidate claiming familiarity with the topic should know. Answerable from first principles or basic training. | Beginner, Early-career |
| **2** | Solid | Demonstrates working understand beyond definitions. Requires basic applied knowledge. | Early-career, Mid-level |
| **3** | Applied | Requires practical reasoning, trade-off awareness, and experience-informed judgment. Cannot be answered purely from textbook knowledge. | Mid-level, Senior |
| **4** | Production | Requires deep experience with real systems. Tests debugging intuition, architecture decisions under constraints, and operational maturity. | Senior, Architect |
| **5** | Architectural | Requires cross-system judgment, organizational design authority, and the ability to balance competing concerns at scale. | Architect |

---

## Detailed Calibration

### Difficulty 1 — Foundational

**What it tests:**
- Core definitions and terminology
- First principles that underpin the module
- "You should know this before going deeper"

**Candidate profile:**
- Has read about the topic or taken a course
- Can explain basic concepts clearly
- May not have built anything with it

**Question characteristics:**
- Answerable in 1–3 sentences
- Has a clear "right answer"
- Doesn't require trade-off analysis
- Appropriate for screening rounds

**Calibration examples by module:**

| Module | Example Question |
|--------|-----------------|
| RAG | What is the purpose of chunking in a RAG pipeline? |
| LLM Engineering | What is a KV cache and why is it used during LLM inference? |
| Agentic AI | What is the difference between a single-agent and multi-agent system? |
| MLOps | What is model drift? |
| PyTorch | What is autograd in PyTorch? |

**Red flag if candidate misses difficulty-1:** They are not ready for this topic area.

---

### Difficulty 2 — Solid

**What it tests:**
- Understanding beyond definitions
- Ability to explain "how" and "why," not just "what"
- Basic comparisons and distinctions

**Candidate profile:**
- Has built something with the technology or studied it in depth
- Can explain mechanisms, not just names
- Starting to form opinions about approaches

**Question characteristics:**
- Requires 3–5 sentence answers
- May involve comparing two approaches
- Asks "how does X work" or "why do we do X"
- Appropriate for technical rounds (early stage)

**Calibration examples by module:**

| Module | Example Question |
|--------|-----------------|
| RAG | How does recursive character splitting differ from semantic chunking, and when would you use each? |
| LLM Engineering | How does temperature affect token sampling, and what happens at extreme values? |
| Agentic AI | How does ReAct differ from plan-and-execute agent architectures? |
| MLOps | What is the difference between data drift and concept drift? |
| PyTorch | How does `torch.no_grad()` differ from `model.eval()` and when do you need both? |

**Red flag if candidate misses difficulty-2:** They've memorized terms but don't understand the underlying mechanics.

---

### Difficulty 3 — Applied

**What it tests:**
- Practical reasoning and design choices
- Trade-off awareness
- Decision-making under realistic constraints
- The "what would you actually do" question

**Candidate profile:**
- Has built and deployed systems (or closely worked on them)
- Can reason about trade-offs without being told the constraints
- Has encountered at least some failure modes firsthand

**Question characteristics:**
- Requires 5+ sentence answers with structured reasoning
- Involves trade-offs ("When would you use X instead of Y?")
- Often scenario-based
- Appropriate for technical deep dive rounds

**Calibration examples by module:**

| Module | Example Question |
|--------|-----------------|
| RAG | You notice retrieval recall is high but end-to-end answer quality is low. What are the most likely causes and how do you investigate? |
| LLM Engineering | When would you choose speculative decoding over standard autoregressive decoding, and what are the failure modes? |
| Agentic AI | Your agent is calling the correct tool but producing wrong results because of how it formats tool inputs. How do you diagnose and fix this? |
| MLOps | You have a model retraining pipeline that runs weekly. How do you decide when to trigger retraining sooner? |
| System Design | Design the caching layer for an LLM-powered customer support system. What do you cache, at what granularity, and how do you invalidate? |

**Red flag if candidate misses difficulty-3:** They can explain technology but haven't internalized practical trade-offs.

---

### Difficulty 4 — Production

**What it tests:**
- Deep production experience
- Debugging intuition built from real incidents
- Architecture decisions under competing constraints (cost vs. latency vs. reliability)
- Ability to diagnose problems from symptoms, not just explain known solutions

**Candidate profile:**
- Has owned or deeply contributed to production AI systems
- Has debugged real incidents
- Can reason about cost, scale, and organizational constraints
- Makes nuanced technical decisions

**Question characteristics:**
- Scenario-based with realistic constraints
- No single "right answer" — quality is in the reasoning
- Requires considering 2+ competing concerns simultaneously
- Appropriate for senior/deep-dive rounds

**Calibration examples by module:**

| Module | Example Question |
|--------|-----------------|
| RAG | Your production RAG system serves 10K concurrent users. P95 latency has increased from 800ms to 2.5s over two weeks, but average latency is stable. What do you investigate and in what order? |
| LLM Engineering | You're choosing between deploying a 7B fine-tuned model and a 70B model with 4-bit quantization for a classification task. Both hit your accuracy target. How do you decide, and what could go wrong with each choice? |
| Agentic AI | Your multi-agent system intermittently enters a state where agents pass tasks back and forth without resolution. The logs show no errors. How do you detect, diagnose, and prevent this? |
| LLMOps | Your deployed LLM's response quality degraded after a provider updated their base model. You have no control over the model weights. What is your mitigation strategy? |
| Debugging | Users report that your AI assistant "stopped being helpful" last Tuesday. No deployment changed. No alerts fired. Walk through your investigation. |

**Red flag if candidate misses difficulty-4:** They can design systems but haven't operated them under pressure.

---

### Difficulty 5 — Architectural

**What it tests:**
- Cross-system design judgment
- Organizational and technical trade-offs at scale
- Long-term architectural thinking
- Ability to balance innovation, reliability, cost, and team capability

**Candidate profile:**
- Staff/principal-level engineer or architect
- Has designed systems that multiple teams build on
- Has made decisions that are expensive to reverse
- Thinks in terms of organizational capability, not just technical correctness

**Question characteristics:**
- Open-ended system design or strategy questions
- Requires balancing 3+ competing concerns
- Involves organizational and technical reasoning
- Appropriate for architecture or leadership rounds

**Calibration examples by module:**

| Module | Example Question |
|--------|-----------------|
| RAG | Design a multi-tenant RAG platform that serves 50 enterprise customers with different data, different security requirements, and different SLAs. How do you architect isolation, scaling, and cost allocation? |
| System Design | Design the AI infrastructure layer for a company that needs to support 15 different LLM use cases (chatbot, search, summarization, classification, etc.) across multiple teams. How do you avoid duplication while allowing team autonomy? |
| Agentic AI | Your organization wants to adopt agentic AI across multiple products. Design the governance, safety, and operational framework for agent deployment at scale. |
| LLMOps | Design an LLM evaluation and deployment pipeline that supports weekly model updates, automatic rollback, A/B testing, and compliance auditing for a financial services company. |
| AIOps | Design an AI-powered incident management system that integrates with existing monitoring, reduces alert fatigue by 70%, and provides automated root cause suggestions. What are the hardest problems to solve? |

**Red flag if candidate misses difficulty-5:** They can design individual systems but cannot reason about cross-cutting architectural concerns.

---

## Difficulty Distribution Guidelines

### Per Module

Target distribution for a module with ~40 questions:

| Difficulty | Target % | Target Count | Level Alignment |
|-----------|---------|--------------|----------------|
| 1 | 10–15% | 4–6 | Mostly Concept |
| 2 | 20–25% | 8–10 | Concept + early Applied |
| 3 | 30–35% | 12–14 | Applied + early System |
| 4 | 20–25% | 8–10 | System + Debugging |
| 5 | 5–10% | 2–4 | System + Debugging |

### Per Level

| Level | Typical Difficulty Range |
|-------|------------------------|
| Concept | 1–2 (occasionally 3) |
| Applied | 2–4 |
| System | 3–5 |
| Debugging | 3–5 |

### Difficulty vs. Experience Band Mapping

| Difficulty | Primary Bands | Stretch Bands |
|-----------|--------------|--------------|
| 1 | Beginner, Early-career | — |
| 2 | Early-career, Mid-level | Beginner |
| 3 | Mid-level, Senior | Early-career |
| 4 | Senior, Architect | Mid-level |
| 5 | Architect | Senior |

---

## Common Calibration Mistakes

| Mistake | How to Fix |
|---------|-----------|
| Rating a definition question as difficulty 3 | If it can be answered from a textbook in 1 sentence, it's difficulty 1–2 |
| Rating a trade-off question as difficulty 1 | If it requires comparing approaches under constraints, it's at least difficulty 3 |
| Rating all debugging questions as difficulty 5 | Debugging ranges from 3 (common issues) to 5 (cross-system incidents) |
| Rating system design questions uniformly as 5 | Component design is 3–4; full system architecture is 4–5 |
| Inflating difficulty because the topic is advanced | Difficulty is about cognitive demand, not topic obscurity. A simple question about a complex topic is still difficulty 1–2 |
| Deflating difficulty because the question is short | A short question can be extremely hard. "Why is your RAG system slow?" is potentially difficulty 4 |

---

## Calibration Verification

When assigning difficulty, verify by asking:

1. **Could a bootcamp graduate answer this?** → If yes, difficulty ≤ 2
2. **Does this require production experience?** → If yes, difficulty ≥ 3
3. **Does this require multi-system reasoning?** → If yes, difficulty ≥ 4
4. **Does this require organizational/architectural judgment?** → If yes, difficulty = 5
5. **Is there a single correct answer?** → If yes, difficulty likely ≤ 2
6. **Is the quality of the answer in the reasoning, not the conclusion?** → If yes, difficulty ≥ 3
