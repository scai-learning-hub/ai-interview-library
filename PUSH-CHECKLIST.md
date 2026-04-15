# Push Checklist

Pre-push review for the initial public GitHub release.

---

## Files to Review

### Root
- [ ] `README.md` — landing page, navigation, all links working
- [ ] `LICENSE` — MIT license present
- [ ] `.gitignore` — ignores IDE, build, and OS files
- [ ] `CONTRIBUTING.md` — contribution guidelines and quality standards
- [ ] `ROADMAP.md` — current state and planned expansion
- [ ] `NEXT-BATCH-PLAN.md` — next generation priorities

### Documentation Layer (`docs/`)
- [ ] `docs/start-here.md` — entry point with role/band/module navigation
- [ ] `docs/interview-philosophy.md` — 5-level system, escalation patterns
- [ ] `docs/role-experience-matrix.md` — role × band expectations
- [ ] `docs/topic-graph.md` — dependency graph with traversal paths

### Indexes
- [ ] `docs/indexes/module-index.md` — all 12 modules listed
- [ ] `docs/indexes/role-index.md` — all 8 roles linked
- [ ] `docs/indexes/experience-index.md` — all 5 bands described
- [ ] `docs/indexes/tag-index.md` — tag taxonomy
- [ ] `docs/indexes/question-library-index.md` — batch listing with counts

### Question Library
- [ ] `docs/question-library/foundations/foundations-batch-01.md` — 25 questions
- [ ] `docs/question-library/transformer-and-modern-llm-internals/transformer-and-modern-llm-internals-batch-01.md` — 25 questions
- [ ] `docs/question-library/rag/rag-batch-01.md` — 25 questions
- [ ] `docs/question-library/agents-and-agentic-systems/agents-and-agentic-systems-batch-01.md` — 25 questions
- [ ] `docs/question-library/agent-protocols-mcp-a2a-acp/agent-protocols-mcp-a2a-acp-batch-01.md` — 25 questions
- [ ] `docs/question-library/systems-serving-and-inference/systems-serving-and-inference-batch-01.md` — 15 questions
- [ ] `docs/question-library/mlops-llmops-aiops/mlops-llmops-aiops-batch-01.md` — 15 questions

---

## Quality Checks

- [ ] **Link check**: all relative links resolve correctly on GitHub
- [ ] **Naming consistency**: file names match references in indexes
- [ ] **Duplicate check**: no identical questions across modules
- [ ] **Schema compliance**: every question has all required fields
- [ ] **Tone check**: engineering-first, no promotional language
- [ ] **Heading structure**: consistent use of `#`, `##`, `###` across files

---

## Pre-Push Actions

- [ ] Remove or archive any draft/WIP files
- [ ] Verify `.gitignore` excludes IDE and OS files
- [ ] Confirm `ARCHITECTURE_BLUEPRINT.md` is appropriate for public visibility (internal design doc)
- [ ] Verify `sidebars.js` is compatible with current structure or remove if not used
- [ ] Check `modules/` (legacy) directory — keep as supplementary or note its relationship

---

## Repository Settings

### Visibility
- **Recommended**: Public
- GitHub renders Markdown natively — the repo is immediately browsable

### Repository Description
> A structured, role-aware, experience-calibrated AI interview preparation system covering 12 topic families, 8 role tracks, and 155+ schema-strict questions.

### Topics / Tags
`ai-interview`, `machine-learning`, `llm`, `rag`, `mlops`, `interview-preparation`, `system-design`, `ai-engineering`, `deep-learning`, `interview-questions`

### First Release Tag
- Tag: `v0.1.0`
- Title: "Initial public release — 7 modules, 155+ questions"

### Suggested Commit Message
```
Initial public release: SCAI AI Interview OS v0.1

- 12 topic module pages with scope and prerequisites
- 8 role/persona pages with prep strategies
- 7 question library batches (155+ schema-strict questions)
- Navigation: role index, module index, experience index, tag index
- Interview philosophy, topic graph, role-experience matrix
- Contribution guidelines and roadmap
```

---

## Post-Push

- [ ] Verify README renders correctly on GitHub
- [ ] Test 5–10 internal links from the README
- [ ] Check that question files render properly (schema formatting)
- [ ] Add repository topics in GitHub settings
- [ ] Create v0.1.0 release with changelog
