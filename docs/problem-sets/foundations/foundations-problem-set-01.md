# Foundations Problem Set 01

## Diagnose, Correct, And Defend A Broken ML Baseline

| Attribute | Value |
|---|---|
| Module | Foundations |
| Difficulty | 2-3 |
| Best for | Early-career to mid-level engineers building ML and AI fundamentals |
| Timebox | 75-100 minutes |
| Use with | [Foundations](../../modules/foundations.md) and [Foundations Batch 01](../../question-library/foundations/foundations-batch-01.md) |

---

## Scenario

A small team built a binary classifier for customer churn.

The model demo looked strong, but production review found several issues:

- the offline accuracy is high, but recall on the positive class is weak
- threshold selection was left at 0.5 with no business justification
- the training notebook occasionally crashes with shape errors
- a recent “performance fix” made the pipeline faster but harder to trust

You are asked to review the baseline and decide what must be fixed before the team scales the work into a larger ML system.

## What You Should Produce

1. A diagnosis of the most likely foundational mistakes.
2. A corrected evaluation plan.
3. A debugging path for the shape and autograd issues.
4. A small implementation plan for making the baseline trustworthy.
5. A short explanation of which team habits should be standardized.

---

## Part 1: Metrics And Evaluation

### Prompt

The team reports 94% accuracy and wants to ship.

Explain what else you need to know before trusting that number.

Your answer should cover:

- class imbalance
- precision and recall trade-offs
- threshold selection
- calibration
- offline vs online behavior

### Strong Answer Signals

- immediately questions whether accuracy is the right metric
- explains why threshold choice is a business decision, not a default
- distinguishes ranking quality from calibrated probability quality
- connects offline metric choice to real production cost

<details>
<summary>Reviewer rubric</summary>

A strong answer turns the discussion from one metric to decision quality. A weak answer just lists metric names without saying when each one matters.

</details>

---

## Part 2: Tensor And Shape Debugging

### Prompt

A recent refactor replaced a loop with vectorized tensor code. It is faster, but now the model intermittently fails with shape mismatch and non-contiguous tensor issues.

Describe how you would isolate and fix the problem.

### Strong Answer Signals

- checks shapes at each stage instead of guessing
- understands broadcasting, transpose, stride, and contiguity
- knows when `.view()` is wrong and when `.reshape()` or `.contiguous()` is required
- treats performance fixes as suspect if tensor semantics changed

<details>
<summary>Reviewer rubric</summary>

The strong answer is procedural: inspect shapes, inspect layout, reproduce minimally, then fix. The weak answer blindly sprinkles `.contiguous()` or `.squeeze()` until the error disappears.

</details>

---

## Part 3: Optimization And Autograd

### Prompt

Training is unstable: sometimes loss decreases, sometimes it explodes after a few steps. Another engineer says “PyTorch handles gradients anyway, so it’s probably just bad luck.”

Explain how you would investigate.

### Strong Answer Signals

- checks gradient accumulation and zeroing behavior
- inspects learning rate and optimizer settings before blaming the model
- understands what `.backward()` and `param.grad` are doing
- considers exploding gradients, bad scale, and wrong graph construction

<details>
<summary>Reviewer rubric</summary>

A strong answer connects autograd mechanics to training symptoms. A weak answer says “reduce the learning rate” without first showing how the failure is isolated.

</details>

---

## Part 4: Trustworthy Baseline Build

### Prompt

You have one week to make this baseline trustworthy enough for the next team to build on.

What do you standardize first?

Include:

- data split discipline
- metric reporting
- shape and tensor checks
- reproducibility steps
- code review standards for vectorized math

### Strong Answer Signals

- chooses a small number of high-leverage standards
- includes leakage prevention and split discipline
- adds reproducibility and seed control without pretending seeds solve everything
- defines what must be logged on every experiment run

<details>
<summary>Reviewer rubric</summary>

The point is not process theater. Good answers standardize the few foundational habits that prevent recurring mistakes from polluting every downstream module.

</details>

---

## Part 5: Follow-up Pressure

1. When is vectorization actually worth the readability trade-off?
2. What metric would you show a product lead instead of raw accuracy?
3. How do you tell the difference between data leakage and overfitting?
4. Which foundational mistake is most dangerous because it looks correct at first?

---

## Finish Standard

A strong submission should leave you with:

- a better evaluation contract than “accuracy is high”
- a clean debugging path for tensor and autograd failures
- a trustworthy baseline plan instead of a notebook demo
- a small set of team standards that prevent repeated foundational mistakes
