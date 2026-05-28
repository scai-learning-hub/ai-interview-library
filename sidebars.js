/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  mainSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Start Here',
    },
    {
      type: 'category',
      label: 'Roles',
      link: { type: 'doc', id: 'indexes/role-index' },
      items: [
        'personas/software-foundations-to-ai-engineer',
        'personas/ml-data-engineer',
        'personas/deep-learning-cv-engineer',
        'personas/llm-rag-agent-engineer',
        'personas/mlops-llmops-platform-engineer',
        'personas/devops-sre-to-aiops',
        'personas/research-applied-research',
        'personas/senior-architect-ai-systems-lead',
      ],
    },
    {
      type: 'category',
      label: 'Experience Bands',
      link: { type: 'doc', id: 'indexes/experience-index' },
      items: [
        'role-experience-matrix',
      ],
    },
    {
      type: 'doc',
      id: 'topic-graph',
      label: 'Topic Graph',
    },
    {
      type: 'category',
      label: 'Modules',
      link: { type: 'doc', id: 'indexes/module-index' },
      items: [
        {
          type: 'category',
          label: 'Core Foundations',
          items: [
            'modules/foundations',
            'modules/classical-ml',
            'modules/deep-learning-core',
          ],
        },
        {
          type: 'category',
          label: 'Model & Architecture Families',
          items: [
            'modules/cv-and-generative-architectures',
            'modules/transformer-and-modern-llm-internals',
            'modules/multimodal-and-vlms',
          ],
        },
        {
          type: 'category',
          label: 'Application & Orchestration',
          items: [
            'modules/rag',
            'modules/agents-and-agentic-systems',
            'modules/agent-protocols-mcp-a2a-acp',
          ],
        },
        {
          type: 'category',
          label: 'Production & Operations',
          items: [
            'modules/systems-serving-and-inference',
            'modules/alignment-post-training',
            'modules/mlops-llmops-aiops',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Question Library',
      link: { type: 'doc', id: 'question-library/README' },
      items: [
        'indexes/question-library-index',
        'question-library/foundations/foundations-batch-01',
        'question-library/transformer-and-modern-llm-internals/transformer-and-modern-llm-internals-batch-01',
        'question-library/rag/rag-batch-01',
        'question-library/agents-and-agentic-systems/agents-and-agentic-systems-batch-01',
        'question-library/agent-protocols-mcp-a2a-acp/agent-protocols-mcp-a2a-acp-batch-01',
        'question-library/systems-serving-and-inference/systems-serving-and-inference-batch-01',
        'question-library/mlops-llmops-aiops/mlops-llmops-aiops-batch-01',
      ],
    },
    {
      type: 'category',
      label: 'Problem Sets',
      link: { type: 'doc', id: 'problem-sets/README' },
      items: [
        'problem-sets/foundations/foundations-problem-set-01',
        'problem-sets/rag/rag-problem-set-01',
        'problem-sets/agents-and-agentic-systems/agents-and-agentic-systems-problem-set-01',
        'problem-sets/llm-engineering/llm-engineering-problem-set-01',
        'problem-sets/mlops-llmops-aiops/mlops-llmops-aiops-problem-set-01',
        'problem-sets/transformer-and-modern-llm-internals/transformer-and-modern-llm-internals-problem-set-01',
      ],
    },
    {
      type: 'doc',
      id: 'interview-philosophy',
      label: 'Interview Philosophy',
    },
    {
      type: 'category',
      label: 'Indexes',
      items: [
        'indexes/role-index',
        'indexes/module-index',
        'indexes/experience-index',
        'indexes/tag-index',
      ],
    },
  ],
};

module.exports = sidebars;
