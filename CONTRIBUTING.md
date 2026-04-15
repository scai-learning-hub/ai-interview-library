# Contributing to SCAI AI Interview OS

Thank you for your interest in contributing. This project aims to build a high-quality, schema-strict, production-focused AI interview preparation system.

## How to Contribute

### Adding Questions

All questions must follow the [question schema](schema/question_schema.md). Every question needs:

- Topic Family, Subtopic, Level, Difficulty rating
- Experience band and role family targeting
- Expected answer (short) and deep answer with trade-offs
- Follow-up questions (2–5)
- Weak answer signals / red flags
- Interviewer signal
- Real-world insight connecting to production

Submit new questions as batch files in the appropriate `docs/question-library/<module>/` directory. Use the naming convention `<module>-batch-NN.md`.

### Quality Standards

- No filler questions. Every question must test something an interviewer would actually ask.
- No "define X" questions without deeper applied or system-level reasoning.
- Answers must include trade-offs, not just definitions.
- Real-world insights must reference actual production scenarios, not hypothetical ones.
- Avoid duplicating questions across modules. If a topic overlaps, differentiate the angle.

### Improving Existing Content

- Fix factual errors or outdated information
- Improve answer quality with better trade-off reasoning
- Add better follow-up questions
- Update experience band or role family targeting if misaligned
- Fix broken links or formatting issues

### Module and Navigation Pages

- Ensure all module pages (`docs/modules/`) accurately describe their scope
- Keep index files consistent with actual question library contents
- Maintain relative links (not absolute URLs) for internal references

## Submission Process

1. Fork the repository
2. Create a branch: `add/<module>-batch-NN` or `fix/<description>`
3. Make your changes
4. Verify all internal links work
5. Submit a pull request with a clear description

## Style Guide

- Use clean Markdown compatible with GitHub rendering
- Use relative links for internal references
- Keep heading structure consistent with existing files
- Use tables for structured comparison data
- Use code blocks with language tags for technical examples
- Do not add promotional content or marketing language

## What We Don't Accept

- Generic "study notes" or syllabus content
- Questions copied from other interview prep resources
- Content without schema compliance
- Promotional links or sponsored content

## Code of Conduct

Be professional, technical, and constructive. This is an engineering resource.

---

*Maintained by [School of Core AI](https://schoolofcoreai.com)*
