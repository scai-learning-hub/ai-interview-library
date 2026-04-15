# Module 01 — PyTorch & Deep Learning: System Level

## Q-01-S-001: Design a model serving system that handles 10K requests/second with <100ms latency.

**Module:** PyTorch & Deep Learning
**Submodule:** Serving Infrastructure
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, DevOps / SRE → AIOps
**Tags:** [pytorch, serving, inference, latency, throughput, production, scaling]
**Prerequisites:** Q-01-A-005, Q-01-A-010
**Estimated Interview Round:** System Design
**Why This Question Matters:** Model serving is where training meets production. Designing for throughput and latency simultaneously requires understanding batching, hardware, and infrastructure trade-offs.

**Question**

Design a PyTorch model serving system for a recommendation model that must handle 10,000 requests/second with p99 latency under 100ms. Walk through your architecture decisions.

**Expected Answer (Short)**

Architecture: (1) Model optimization: torch.compile or TorchScript + fp16 inference + operator fusion. (2) Dynamic batching: accumulate individual requests into batches for GPU efficiency (TorchServe or Triton). (3) Horizontal scaling: multiple GPU instances behind a load balancer. (4) Caching: cache predictions for repeated inputs. (5) Model format: ONNX or TensorRT for optimized inference. Target: single GPU handles ~2K req/s with batching → 5+ GPUs behind load balancer.

**Deep Answer**

- **Model optimization (per-instance throughput):**
  - Export to ONNX → TensorRT for maximum GPU utilization (2-5x over native PyTorch)
  - Or: torch.compile with mode='max-autotune' for minimal code changes
  - fp16/int8 quantization for inference (int8 gives 2-4x speedup over fp32)
  - Operator fusion: combine adjacent operations to reduce kernel launches
- **Dynamic batching (critical for GPU efficiency):**
  - GPU is most efficient with large batches. Single request = massive GPU underutilization.
  - Dynamic batcher: accumulates requests for up to N ms (e.g., 10ms), batches them, processes as one GPU call, unbatches results.
  - max_batch_size: tune for latency budget. Larger batch = more efficient but higher latency per request.
  - Triton Inference Server excels at this; TorchServe supports it.
- **Infrastructure scaling:**
  - 10K req/s with 100ms budget → need ~5-10 GPU instances depending on model size
  - Load balancer distributes requests across instances
  - Auto-scaling based on request queue depth and GPU utilization
  - Health checks and circuit breakers for instance failures
- **Latency breakdown budget:**
  - Network + load balancer: ~5ms
  - Batching wait: ~10ms
  - GPU inference: ~50ms (including batched computation)
  - Post-processing + response: ~5ms
  - Buffer: ~30ms for p99 variance
- **Caching layer:** Redis/Memcached for requests with same features. Cache hit ratio can be 30-50% for recommendation models (same user requesting within short time).
- **Model versioning:** support A/B testing, canary deployments, instant rollback via model registry.

**Follow-up Questions**

1. Your p99 latency is 150ms but p50 is 40ms. What's causing the tail latency?
2. How do you handle model updates without downtime?
3. What monitoring metrics would you track for this serving system?

**Common Weak Answers / Red Flags**

- No mention of dynamic batching — the single biggest optimization for GPU serving
- "Just add more GPUs" without optimizing per-instance throughput
- Cannot break down the latency budget

**Interviewer Evaluation Signal**

Tests end-to-end system design for inference. The dynamic batching knowledge and latency budget breakdown are strong signals of production experience. Candidates who mention TensorRT/ONNX optimization show they've optimized real serving systems.

**Real-World Insight**

Moving from PyTorch eager mode to TensorRT gave a social media company a 4x throughput improvement on their ranking model. Combined with dynamic batching (Triton), they reduced their GPU fleet from 200 to 60 instances while maintaining the same latency SLAs. The cost savings were $2M/year.

---

## Q-01-S-002: How do you design a training pipeline for reproducible experiments?

**Module:** PyTorch & Deep Learning
**Submodule:** Training Infrastructure
**Level:** System
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, DevOps / SRE → AIOps
**Tags:** [pytorch, reproducibility, experiment-tracking, mlflow, configuration, pipeline]
**Prerequisites:** Q-01-A-007, Q-00-A-014
**Estimated Interview Round:** System Design, Technical
**Why This Question Matters:** Without reproducible experiments, you can't trust results, can't collaborate effectively, and can't debug regressions. This is the foundation of ML engineering discipline.

**Question**

Design a training pipeline that guarantees reproducibility across runs and team members. What must be versioned, logged, and controlled?

**Expected Answer (Short)**

Version: (1) Code (git commit), (2) Data (snapshot or hash), (3) Configuration (all hyperparameters), (4) Environment (dependencies, PyTorch version, CUDA version). Log: training metrics, validation metrics per step, system metrics. Control: random seeds (Python, NumPy, PyTorch, CUDA), deterministic algorithms. Tool: MLflow or Weights & Biases for experiment tracking.

**Deep Answer**

- **Seed everything:**
  ```python
  def seed_everything(seed=42):
      random.seed(seed)
      np.random.seed(seed)
      torch.manual_seed(seed)
      torch.cuda.manual_seed_all(seed)
      torch.backends.cudnn.deterministic = True
      torch.backends.cudnn.benchmark = False
  ```
  Note: `cudnn.deterministic=True` + `benchmark=False` slows training by 5-20% but guarantees bit-exact reproducibility.
- **Configuration management:** use Hydra or OmegaConf. Every hyperparameter in a YAML config file. No hardcoded values. Config is committed with the experiment.
- **Data versioning:** DVC (Data Version Control) or data snapshots with hashes. Training data must be immutable once an experiment references it.
- **Experiment tracking:** MLflow, W&B, or Neptune. Log: config, metrics per step, model artifacts, system info.
  ```python
  mlflow.log_params(config)
  mlflow.log_metric("train_loss", loss, step=step)
  mlflow.log_artifact("model.pt")
  mlflow.log_artifact("config.yaml")
  ```
- **Environment:** Docker container with fixed PyTorch, CUDA, and dependency versions. Or: `pip freeze > requirements.txt` committed with experiment.
- **Reproducibility checklist:**
  1. Same code (git SHA) + same config + same data + same environment = same result
  2. Every logged experiment has: git SHA, config, data hash, environment hash
  3. Any past experiment can be reproduced from its logged metadata
- **CUDA non-determinism:** some CUDA operations (atomicAdd in scatter, certain convolution algorithms) are non-deterministic by default. `torch.use_deterministic_algorithms(True)` forces deterministic variants but may be slower.

**Follow-up Questions**

1. Two team members run the same experiment with the same config and get different results. What do you check?
2. How do you handle reproducibility with distributed training (DDP)?
3. Is bit-exact reproducibility worth the performance cost?

**Common Weak Answers / Red Flags**

- "Just set the random seed" — seeds alone don't ensure reproducibility (CUDA non-determinism, library versions)
- No mention of data versioning
- Cannot explain what an experiment tracking system should log

**Interviewer Evaluation Signal**

Tests ML engineering discipline. Reproducibility requires systematic thinking about all sources of variation. Candidates who can enumerate all components (code, data, config, environment, seeds) show mature engineering practices.

**Real-World Insight**

A team couldn't reproduce a published paper's results. After weeks of investigation: the paper used PyTorch 1.8, the team used PyTorch 1.13. A change in the default convolution algorithm between versions caused a 1.5% accuracy difference. This is why environment versioning (Docker containers with pinned versions) is essential for reproducibility.

---

## Q-01-S-003: How do you design a model training system for continuous learning?

**Module:** PyTorch & Deep Learning
**Submodule:** Training Infrastructure
**Level:** System
**Difficulty:** 4
**Experience Bands:** Senior, Architect
**Persona Relevance:** Senior / Architect, ML / Data Engineer
**Tags:** [pytorch, continuous-learning, retraining, pipeline, production, automation]
**Prerequisites:** Q-00-S-005, Q-01-S-002
**Estimated Interview Round:** System Design
**Why This Question Matters:** Production models need regular updates as data distributions change. Automating the train→evaluate→deploy cycle is essential for maintaining model quality at scale.

**Question**

Design a continuous learning system where a production model is automatically retrained on new data, evaluated, and deployed if the new version is better. What are the key components and safety mechanisms?

**Expected Answer (Short)**

Components: (1) Data pipeline: ingests new data, validates quality. (2) Training pipeline: triggers on schedule or data drift, trains new model version. (3) Evaluation: compares new model vs current on holdout + recent data. (4) Deployment gate: automated checks (accuracy, fairness, latency). (5) Rollback: instant revert if production metrics degrade. Safety: shadow deployment, canary rollout, automated monitoring.

**Deep Answer**

- **Data pipeline:**
  - New data arrives continuously or in batches
  - Data validation: schema checks, distribution checks, missing value rates, label quality
  - Data versioning: every training run references an immutable data snapshot
  - Feature computation: shared feature pipeline (training uses the same code as serving)
- **Training trigger:**
  - Schedule-based: retrain every N hours/days
  - Drift-based: retrain when feature/prediction drift exceeds threshold
  - Performance-based: retrain when measured accuracy drops below threshold
- **Training pipeline:**
  - Configuration: reproducible (same config + new data = expected result)
  - Warm-starting: optionally initialize from current production model
  - Resource management: GPU allocation, job scheduling (Kubernetes + GPU scheduler)
- **Evaluation gate:**
  - Compare new model vs champion on:
    - Fixed evaluation set (catches regressions)
    - Recent evaluation set (captures adaptation to new patterns)
    - Fairness metrics (no regression in group-level performance)
    - Latency benchmark (new model meets serving SLA)
  - Gate policy: new model must beat champion on primary metric AND not regress on any secondary metric
- **Deployment:**
  - Shadow mode: new model runs in parallel, predictions logged but not served
  - Canary: serve 5% of traffic, monitor for 24 hours
  - Full rollout: gradual increase to 100%
  - Rollback: instant revert (keep previous model version warm)
- **Monitoring:**
  - Online metrics: accuracy on live labeled data, prediction distribution, latency
  - Drift detection: feature distributions, prediction distributions vs training
  - Alert thresholds: automatic rollback if key metrics breach SLA

**Follow-up Questions**

1. Your continuous training system produces a model that passes all offline checks but degrades in production. What's the gap?
2. How do you handle catastrophic forgetting when frequently retraining?
3. What's the cost of this system and how do you justify it?

**Common Weak Answers / Red Flags**

- "Just retrain on a cron job and deploy" — no evaluation gate or safety mechanisms
- No mention of rollback or canary deployment
- Doesn't consider data quality validation before training

**Interviewer Evaluation Signal**

Tests end-to-end ML system design. The evaluation gate and safety mechanisms are the key differentiators. Anyone can set up a training cron job; building a safe, monitored continuous learning system requires production experience.

**Real-World Insight**

Uber's Michelangelo continuously retrains thousands of models. Their key insight: the evaluation gate is more important than the training pipeline. A model that passes the gate is deployed automatically; a model that fails is flagged for human review. This automation reduced their model update cycle from weeks (manual review) to hours (automated gate) while maintaining quality.

---

## Q-01-S-004: How do you manage model versioning and A/B testing in production?

**Module:** PyTorch & Deep Learning
**Submodule:** Serving Infrastructure
**Level:** System
**Difficulty:** 3
**Experience Bands:** Mid-level, Senior
**Persona Relevance:** ML / Data Engineer, DevOps / SRE → AIOps
**Tags:** [pytorch, model-versioning, ab-testing, deployment, production, mlflow]
**Prerequisites:** Q-01-A-007, Q-01-S-001
**Estimated Interview Round:** System Design
**Why This Question Matters:** Deploying model updates safely requires versioning, traffic splitting, and statistical rigor. Without proper A/B testing, you can't attribute changes in metrics to the model.

**Question**

Design a model versioning and A/B testing system. How do you ensure statistically valid comparisons between model versions?

**Expected Answer (Short)**

Model registry (MLflow) stores versioned models with metadata. Deployment: traffic router splits requests between model A (champion) and model B (challenger). Statistical rigor: pre-calculate required sample size, run for sufficient duration, use appropriate statistical test (two-proportion z-test for binary metrics, t-test for continuous). Guard against: novelty bias, temporal confounds, selection bias.

**Deep Answer**

- **Model registry:**
  - Each model version: unique ID, training config, data version, metrics on evaluation sets, status (staging/production/archived)
  - Metadata: training job ID, git commit, data hash, evaluation results
  - MLflow Model Registry or custom database
  - Immutable artifacts: once registered, a model version is never overwritten
- **A/B testing infrastructure:**
  - Traffic router: consistent hashing by user_id (same user always sees same model → valid longitudinal comparison)
  - Split: 50/50 or 90/10 (use smaller split for risky changes)
  - Duration: pre-calculate minimum runtime for statistical power (typically 7-14 days for product metrics)
- **Statistical rigor:**
  - Define primary metric and success threshold BEFORE starting the test
  - Calculate required sample size: `n = (z_α + z_β)² × 2 × p(1-p) / δ²` for binary metrics
  - Run for full duration even if early results look positive (avoid peeking problem)
  - Use sequential testing (e.g., always-valid p-values) if you need to stop early
  - Check for confounds: time-of-day effects, day-of-week effects, seasonal effects
- **Common pitfalls:**
  - Novelty effect: users engage more with ANY change initially. Wait for effect to stabilize (at least 7 days).
  - Simpson's paradox: overall metric looks better but sub-segments are worse (check per-segment metrics).
  - Multiple testing: testing many metrics inflates false positive rate. Apply Bonferroni correction or focus on one primary metric.
- **Rollback:** if model B underperforms or causes issues, instantly route 100% to model A. No downtime.

**Follow-up Questions**

1. Your A/B test shows model B is 2% better on clicks but 1% worse on long-term retention. How do you decide?
2. The A/B test runs for 14 days but the p-value is 0.08. What do you do?
3. How do you handle A/B testing when users interact with the model multiple times per session?

**Common Weak Answers / Red Flags**

- "Just deploy and watch metrics" — no statistical rigor
- Doesn't know about consistent user assignment (same user sees same model)
- Cannot explain sample size calculation or statistical significance

**Interviewer Evaluation Signal**

Tests the intersection of ML engineering and experimentation. Companies like Netflix, Uber, and Spotify consider A/B testing infrastructure as critical as model training. Candidates who understand statistical rigor bring discipline to decision-making.

**Real-World Insight**

Netflix runs thousands of A/B tests simultaneously across recommendation, ranking, and UI models. Their key learning: most model changes that look promising in offline evaluation show neutral or negative results in online A/B tests. The offline→online gap is typically 30-50% (i.e., only 50-70% of offline wins translate to online wins). This is why A/B testing is non-negotiable for production model deployments.

---

## Q-01-S-005: How do you design a GPU cluster for model training at scale?

**Module:** PyTorch & Deep Learning
**Submodule:** Training Infrastructure
**Level:** System
**Difficulty:** 5
**Experience Bands:** Architect
**Persona Relevance:** Senior / Architect, DevOps / SRE → AIOps
**Tags:** [pytorch, gpu-cluster, infrastructure, distributed-training, scaling, cost]
**Prerequisites:** Q-00-S-001, Q-01-A-005
**Estimated Interview Round:** System Design
**Why This Question Matters:** GPU clusters are expensive ($10K-$100K+/month). Architects must design for utilization efficiency, fault tolerance, and multi-tenant scheduling.

**Question**

Design a GPU cluster for a team of 20 ML engineers training models ranging from small experiments to large multi-node training runs. How do you maximize GPU utilization and minimize waste?

**Expected Answer (Short)**

Components: (1) Kubernetes + GPU scheduling (NVIDIA device plugin) for resource allocation. (2) Job queue with priority (high-priority production training > low-priority experiments). (3) Preemptible/spot instances for cost savings on interruptible jobs. (4) Shared storage (NFS/S3 + local NVMe cache). (5) Monitoring: per-user GPU utilization, job wait time, cluster utilization. (6) Right-sizing: mix of GPU types (A100 for large training, T4 for experiments/inference).

**Deep Answer**

- **Compute layer:**
  - Mix of GPU types: A100/H100 for large training, A10G/L4 for small experiments and inference
  - Multi-node interconnect: NVLink within nodes, InfiniBand between nodes for distributed training
  - Cloud: use spot/preemptible instances for fault-tolerant jobs (checkpointing every 30min)
  - Auto-scaling: scale down unused nodes, scale up when queue is backlogged
- **Scheduling:**
  - Kubernetes with NVIDIA GPU Operator: GPU scheduling, MIG (Multi-Instance GPU) for smaller jobs
  - Priority queue: production > dev > experiment. Preemption: low-priority jobs evicted when high-priority arrives.
  - Gang scheduling: multi-node training jobs must be scheduled atomically (all GPUs or none)
  - Fair share: each team/user gets a guaranteed quota, can burst into idle resources
- **Storage:**
  - Shared filesystem (NFS, Lustre, or FSx) for datasets (terabytes, read-heavy)
  - NVMe local SSD for high-throughput data loading (copy dataset to local before training)
  - S3/GCS for checkpoints and artifacts (durable, cheap, but high latency)
- **Cost optimization:**
  - Spot instances: 60-90% cheaper but can be reclaimed. Checkpoint frequently.
  - Right-sizing: don't assign A100 to a job that only needs A10G
  - Idle detection: kill or warn on jobs with <10% GPU utilization for >1 hour
  - Reservation: reserve some percentage of compute for predictable baseline, spot for burst
- **Monitoring:**
  - Per-job GPU utilization, memory usage, training throughput
  - Cluster-level: total utilization, queue wait time, cost per team
  - Dashboard: Grafana with DCGM exporter (NVIDIA Data Center GPU Manager)
  - Alerts: underutilized GPUs, stuck jobs, OOM events

**Follow-up Questions**

1. A researcher reserves 8 GPUs but only uses 2 for most of the job. How do you handle this?
2. How do you handle node failures during a multi-day training run?
3. What's the total cost of running this cluster for a year? How do you justify it?

**Common Weak Answers / Red Flags**

- "Just buy more GPUs" — no scheduling, sharing, or cost optimization
- Doesn't mention spot instances or auto-scaling
- No multi-tenant scheduling strategy

**Interviewer Evaluation Signal**

Architect-level question testing infrastructure design, cost management, and operational excellence. This separates candidates who've designed ML infrastructure from those who've only used it.

**Real-World Insight**

Companies that invest in proper GPU scheduling and monitoring typically achieve 70-80% GPU utilization. Without it, utilization is typically 20-30% (researchers reserve GPUs and leave them idle). At $2/hour per A100, a 50-GPU cluster at 30% utilization wastes ~$500K/year in idle compute. The ROI on scheduling infrastructure is typically 3-6 months.
