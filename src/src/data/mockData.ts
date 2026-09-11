import { FeatureItem, CandidateProfile, PythonAgent, PricingTier } from '../types';

export const MOCK_FEATURES: FeatureItem[] = [
  {
    id: 'ai-matching',
    title: 'Autonomous Candidate Matching',
    category: 'matching',
    description: 'Multi-dimensional vector embedding model evaluates 40+ skill vectors, work velocity, and team dynamic fit with 98.4% precision.',
    iconName: 'Sparkles',
    metrics: '98.4% Match Accuracy',
    tags: ['Vector Search', 'PyTorch Embeddings', 'Cosine Similarity'],
    pythonAgent: 'agents/match_engine_v3.py',
    detailHighlight: 'Uses dense neural embeddings trained on 5M+ successful tech hires to map candidate capability directly onto JD requirements.'
  },
  {
    id: 'talent-analytics',
    title: 'Predictive Talent Analytics',
    category: 'analytics',
    description: 'Real-time market compensation heatmaps, retention propensity scoring, and skill gap forecasting powered by deep learning.',
    iconName: 'TrendingUp',
    metrics: '10x Faster Hiring Velocity',
    tags: ['Pandas', 'Scikit-learn', 'Predictive Modeling'],
    pythonAgent: 'analytics/predictive_market.py',
    detailHighlight: 'Forecasts salary trajectories and candidate churn risks in real-time using historical market data APIs.'
  },
  {
    id: 'interview-copilot',
    title: 'AI Screening & Code Assessor',
    category: 'agents',
    description: 'Interactive AI voice & chat interviewer that evaluates technical reasoning, code cleanliness, and system design capability in real-time.',
    iconName: 'Bot',
    metrics: '85% Screening Hours Saved',
    tags: ['FastAPI', 'LangChain', 'OpenAI / Claude API'],
    pythonAgent: 'copilot/technical_assessor.py',
    detailHighlight: 'Conducts automated 15-minute preliminary tech assessments, outputting instant structural feedback and code quality metrics.'
  },
  {
    id: 'resume-parser',
    title: 'Deep NLP Skill Matrix Extractor',
    category: 'matching',
    description: 'Parses unstructured PDFs, GitHub repos, and LinkedIn profiles to assemble verifiable skill trees with automated fraud detection.',
    iconName: 'FileSearch',
    metrics: '99.2% Extraction Accuracy',
    tags: ['spaCy NLP', 'PyPDF2', 'Regex Parsing'],
    pythonAgent: 'nlp/resume_matrix_parser.py',
    detailHighlight: 'Cross-verifies claims against GitHub commit history and public code repositories to prevent candidate resume inflation.'
  },
  {
    id: 'bias-guardrails',
    title: 'Ethical AI & Unbiased Vetting',
    category: 'security',
    description: 'Guarantees compliance with NYC Local Law 144 & EU AI Act by anonymizing demographic indicators prior to scoring.',
    iconName: 'ShieldCheck',
    metrics: '100% Audit Compliance',
    tags: ['Fairness Metrics', 'Anonymization Pipeline', 'GDPR Ready'],
    pythonAgent: 'security/bias_filter_agent.py',
    detailHighlight: 'Strips out name, age, photo, gender, and location identifiers before passing candidate profile embeddings to scoring models.'
  },
  {
    id: 'multi-agent-orchestrator',
    title: 'Autonomous Pipeline Engine',
    category: 'agents',
    description: 'Decoupled Python microservices coordinate talent sourcing, interview scheduling, offer generation, and background checks effortlessly.',
    iconName: 'Cpu',
    metrics: '< 120ms Agent Latency',
    tags: ['Celery Workers', 'Redis Queue', 'FastAPI Microservices'],
    pythonAgent: 'orchestrator/pipeline_manager.py',
    detailHighlight: 'Asynchronous task queue dispatches background Python workers to manage high-volume application funnels.'
  }
];

export const MOCK_CANDIDATES: CandidateProfile[] = [
  {
    id: 'cand-1',
    name: 'Alexandra Vance',
    role: 'Staff AI/ML Engineer',
    experience: '8 Years Exp • Ex-Google AI',
    skills: ['PyTorch', 'Transformers', 'Next.js', 'Distributed Systems', 'Python'],
    matchScore: 98,
    aiSummary: 'Top 1% match for Senior AI Lead role. Exceptional expertise in LLM fine-tuning and high-throughput vector indexes.',
    pythonVerification: 'Verified via GitHub commit hash #7a2f9b (1,420 contributions)',
    status: 'Top Recommended',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'cand-2',
    name: 'Marcus Chen',
    role: 'Principal Full Stack Architect',
    experience: '10 Years Exp • Ex-Stripe',
    skills: ['React 18', 'TypeScript', 'Next.js', 'Go', 'GraphQL', 'TailwindCSS'],
    matchScore: 95,
    aiSummary: 'Strong candidate for lead architecture role. Built high-scale financial micro-frontends handling $2B+ volume.',
    pythonVerification: 'Verified via System Design Assessment Score 96/100',
    status: 'Top Recommended',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'cand-3',
    name: 'Sophia Patel',
    role: 'Senior Data Infrastructure Lead',
    experience: '6 Years Exp • Ex-Databricks',
    skills: ['Apache Spark', 'Python', 'Kafka', 'Snowflake', 'PostgreSQL'],
    matchScore: 91,
    aiSummary: 'High performance data pipeline specialist. Reduced query latency by 64% in multi-terabyte data warehouses.',
    pythonVerification: 'Verified via Data Architecture Skill Benchmark',
    status: 'High Potential',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  }
];

export const PYTHON_AGENTS: PythonAgent[] = [
  {
    id: 'agent-1',
    name: 'Sourcing & Discovery Agent',
    module: 'backend.agents.sourcing_engine',
    description: 'Scrapes, indexes, and normalizes candidate profiles from developer hubs, research papers, and open source commits.',
    status: 'active',
    latency: '42ms',
    techStack: ['Python 3.11', 'FastAPI', 'Playwright', 'Pinecone'],
    sampleOutput: '{"indexed_profiles": 1420, "vector_dim": 1536, "quality_score": 0.96}'
  },
  {
    id: 'agent-2',
    name: 'Vector Matching & Ranking Agent',
    module: 'backend.agents.vector_matcher',
    description: 'Calculates high-dimensional cosine similarity between job spec requirements and applicant skill vectors.',
    status: 'active',
    latency: '18ms',
    techStack: ['PyTorch', 'FAISS', 'NumPy', 'SentenceTransformers'],
    sampleOutput: '{"top_matches": 5, "average_similarity": 0.942, "processing_time_ms": 18}'
  },
  {
    id: 'agent-3',
    name: 'AI Screening & Code Evaluator',
    module: 'backend.agents.code_assessor',
    description: 'Executes candidate submitted code snippets in sandboxed Docker containers while evaluating time complexity.',
    status: 'idle',
    latency: '110ms',
    techStack: ['Docker SDK', 'AST Analysis', 'Python Exec', 'LangChain'],
    sampleOutput: '{"test_cases_passed": "12/12", "time_complexity": "O(N log N)", "cleanliness_score": 98}'
  },
  {
    id: 'agent-4',
    name: 'Bias & Compliance Auditor',
    module: 'backend.agents.compliance_guard',
    description: 'Audits algorithmic outputs for demographic parity and statistical fairness to enforce regulatory compliance.',
    status: 'active',
    latency: '25ms',
    techStack: ['AIF360', 'Demographic Parity', 'Python Logging'],
    sampleOutput: '{"bias_coefficient": 0.001, "audit_status": "PASSED", "compliance_id": "NYC-LL144-2026"}'
  }
];

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Growth',
    priceMonthly: 199,
    priceAnnual: 159,
    description: 'Ideal for scaling startups hiring up to 5 engineers per month with AI assistance.',
    features: [
      'Up to 100 AI Candidate Matches / mo',
      'Python Sourcing & Parser Agent',
      'Automated Interview Copilot (50 hrs)',
      'Basic Talent Analytics Dashboard',
      'Email & Slack Support'
    ],
    cta: 'Start 14-Day Free Trial'
  },
  {
    name: 'Scale Pro',
    priceMonthly: 499,
    priceAnnual: 399,
    popular: true,
    description: 'Comprehensive AI Talent Intelligence for high-growth tech companies and agencies.',
    features: [
      'Unlimited AI Candidate Matching',
      'Full Python AI Agent Orchestration Suite',
      'Autonomous Technical Interview Screening',
      'Custom Vector Embedding Fine-tuning',
      'ATS Integration (Greenhouse, Lever, Workday)',
      'NYC LL144 Bias Compliance Guarantee',
      'Dedicated Talent Intelligence Manager'
    ],
    cta: 'Get Scale Pro Access'
  },
  {
    name: 'Enterprise Matrix',
    priceMonthly: 1299,
    priceAnnual: 999,
    description: 'Custom self-hosted or cloud AI cluster tailored for enterprise talent acquisition operations.',
    features: [
      'Private Dedicated Python Agent Cluster',
      'Custom LLM Fine-Tuning on Internal Codebases',
      'On-Premise or VPC Deployment Support',
      '24/7 SLA & Custom Security Encryption',
      'Multi-Team Role & Permissions Hierarchy',
      'Custom API & Microservice Webhooks'
    ],
    cta: 'Schedule Executive Demo'
  }
];

export const TESTIMONIALS = [
  {
    quote: "AI Talent Matrix reduced our engineering hiring cycle from 45 days down to 6 days. The Python agent matching accuracy is uncanny — candidates were 95%+ aligned right out of the box.",
    author: "Elena Rostova",
    role: "VP of Engineering",
    company: "FinTech Global",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150"
  },
  {
    quote: "As a senior candidate, the AI Skill Verification gave me instant transparency into why I was matched with high-paying roles. It feels fair, modern, and lightyears ahead of traditional recruiters.",
    author: "David Kim",
    role: "Staff Infrastructure Engineer",
    company: "Candidate User",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150"
  },
  {
    quote: "The separation of Next.js 14 frontend from Python microservice agents made integrating our internal HR APIs effortless. Absolute masterclass in modern SPA architecture.",
    author: "Samantha Wright",
    role: "Head of Talent Acquisition",
    company: "Nexus Software",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
  }
];
