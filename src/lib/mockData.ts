export type ProblemCategory =
  | "code_coupling"
  | "duplication"
  | "devops"
  | "management"
  | "communication"
  | "technical_debt";

export interface Problem {
  id: string;
  devId: string;
  devName: string;
  devAvatar: string;
  category: ProblemCategory;
  description: string;
  submittedAt: string;
  status: "analyzing" | "survey_generated" | "completed";
  similarCases?: SimilarCase[];
}

export interface SimilarCase {
  company: string;
  problem: string;
  solution: string;
  outcome: string;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: "single" | "scale";
  options: string[];
  insight: string; // what this question reveals about mindset
}

export interface Survey {
  id: string;
  title: string;
  category: ProblemCategory;
  forDevId: string;
  questions: SurveyQuestion[];
  status: "pending" | "completed" | "expired";
  deadline: string;
  completedAt?: string;
  responses?: Record<string, string | number>;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  team: string;
  problemsCount: number;
  surveysDone: number;
  surveysTotal: number;
  sentiment: "proactive" | "reactive" | "blocked" | "neutral";
  categories: ProblemCategory[];
  score: number; // 0-100 mindset score
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "in_progress" | "done";
  dueDate: string;
  category: ProblemCategory;
  createdFrom: string; // survey/problem ref
}

// ─── Similar Cases Library ─────────────────────────────────────────────────
export const SIMILAR_CASES: Record<ProblemCategory, SimilarCase[]> = {
  code_coupling: [
    {
      company: "Netflix",
      problem: "Tightly coupled monolith causing cascading failures",
      solution: "Introduced hexagonal architecture with clear domain boundaries and dependency injection",
      outcome: "Deployment frequency increased 5x, rollback time reduced from hours to minutes",
    },
    {
      company: "Shopify",
      problem: "One change in checkout broke 12 unrelated modules",
      solution: "Defined service contracts with event-driven architecture using domain events",
      outcome: "Teams became independently deployable, zero cross-team breakages in 6 months",
    },
  ],
  duplication: [
    {
      company: "Spotify",
      problem: "Multiple squads building the same auth logic independently",
      solution: "Created a shared platform guild with a curated internal SDK library",
      outcome: "Removed 40% duplicate code, onboarding time dropped by 3 weeks per engineer",
    },
    {
      company: "Airbnb",
      problem: "Engineers reinventing UI components across 8 teams",
      solution: "Design system team with a contribution model — any team can add, everyone benefits",
      outcome: "Ship velocity increased 30%, visual consistency reached 95%",
    },
  ],
  devops: [
    {
      company: "GitHub",
      problem: "Manual deployments causing 3-day release cycles",
      solution: "Shift-left testing with feature flags — every PR deployable to production safely",
      outcome: "200+ deploys per day, MTTR dropped from 4 hours to 12 minutes",
    },
    {
      company: "LinkedIn",
      problem: "Infrastructure changes required 2 weeks of coordination",
      solution: "Infrastructure-as-Code with self-service platform portal for engineers",
      outcome: "Dev teams self-provision in 10 minutes, ops tickets reduced by 70%",
    },
  ],
  management: [
    {
      company: "Atlassian",
      problem: "Engineers unclear on priorities, duplicating strategic work",
      solution: "Weekly 1-page team charter with OKRs visible to everyone, async standups",
      outcome: "Team alignment score went from 42% to 87% in one quarter",
    },
    {
      company: "Basecamp",
      problem: "Meetings consuming 40% of dev time with no clear decisions",
      solution: "6-week work cycles with explicit bet/pitch model, decisions in writing",
      outcome: "Meeting time cut by 60%, engineers report highest satisfaction scores",
    },
  ],
  communication: [
    {
      company: "GitLab",
      problem: "Async remote team with misaligned decisions across time zones",
      solution: "Everything in writing, merge requests as the source of truth, handbook-first culture",
      outcome: "1,400 engineers collaborate across 65 countries with consistent alignment",
    },
    {
      company: "Stripe",
      problem: "Context lost between frontend/backend teams on API contracts",
      solution: "API-first design: teams write API specs before writing code, reviewed by consumers",
      outcome: "Integration bugs dropped 80%, frontend/backend teams ship in parallel",
    },
  ],
  technical_debt: [
    {
      company: "Twitter",
      problem: "Legacy Scala monolith blocking new feature development",
      solution: "Strangler fig pattern — new features as microservices, incrementally migrate old code",
      outcome: "Modernized 60% of core infrastructure without a big-bang rewrite",
    },
    {
      company: "HubSpot",
      problem: "Technical debt costing 30% of every sprint",
      solution: "Dedicated 20% time rule: every sprint has 1 day explicitly for debt reduction",
      outcome: "Debt reduced to 8% of sprint cost, feature velocity improved 40%",
    },
  ],
};

// ─── Survey Question Bank ──────────────────────────────────────────────────
export const SURVEY_QUESTIONS: Record<ProblemCategory, SurveyQuestion[]> = {
  code_coupling: [
    {
      id: "cc-1",
      text: "When a single change breaks multiple parts of the codebase, what's your immediate reaction?",
      type: "single",
      options: [
        "Fix everything at once — I stay until it's resolved",
        "Document the dependency map before touching anything",
        "Feel overwhelmed and defer to a team lead",
        "Patch the urgent parts and schedule a refactor task",
      ],
      insight: "Reveals problem-solving approach vs avoidance pattern",
    },
    {
      id: "cc-2",
      text: "How often do you think about module boundaries when writing new code?",
      type: "single",
      options: [
        "Always — I design interfaces before implementation",
        "Sometimes — when the feature feels complex",
        "Rarely — I focus on making it work first",
        "Never — I don't know where to start with that",
      ],
      insight: "Reveals architectural thinking maturity",
    },
    {
      id: "cc-3",
      text: "If refactoring a tightly coupled module would delay your sprint by 2 days, you would:",
      type: "single",
      options: [
        "Refactor it — the delay is worth long-term health",
        "Create a tracked ticket and refactor next sprint",
        "Ask the manager to decide",
        "Skip it and ship the feature as-is",
      ],
      insight: "Reveals long-term vs short-term tradeoff awareness",
    },
    {
      id: "cc-4",
      text: "How confident are you in explaining the concept of dependency inversion to a teammate?",
      type: "single",
      options: [
        "Very confident — I could run a workshop on it",
        "Confident enough to explain the basics",
        "I know the concept but struggle to apply it",
        "I need to learn this more deeply",
      ],
      insight: "Reveals technical knowledge gap vs application gap",
    },
  ],
  duplication: [
    {
      id: "dup-1",
      text: "Before starting a new task, how thoroughly do you check if similar work exists?",
      type: "single",
      options: [
        "Always — I search code, Jira, and ask teammates before starting",
        "Usually — I do a quick search when I remember",
        "Sometimes — if the task feels familiar",
        "Rarely — it's faster to write fresh code",
      ],
      insight: "Reveals awareness of shared codebase value",
    },
    {
      id: "dup-2",
      text: "When you write a utility that could benefit other teams, what do you typically do?",
      type: "single",
      options: [
        "Add it to the shared library and document it",
        "Mention it in Slack and wait for interest",
        "Keep it in my module but make it reusable",
        "It stays in my code — not my job to maintain a shared library",
      ],
      insight: "Reveals contribution mindset vs silo mindset",
    },
    {
      id: "dup-3",
      text: "How do you feel about spending time on code that someone else might have already written?",
      type: "single",
      options: [
        "Frustrated — we need a better system to find existing work",
        "Neutral — duplication is inevitable at our scale",
        "Indifferent — my priority is my sprint goal",
        "I don't often think about this",
      ],
      insight: "Reveals awareness of organisational waste",
    },
  ],
  devops: [
    {
      id: "dops-1",
      text: "How confident are you in deploying your own code to production?",
      type: "single",
      options: [
        "Very confident — I own the full deploy pipeline",
        "Mostly confident — with a checklist I'm fine",
        "Nervous — I rely on senior engineers or DevOps team",
        "Not at all — I've never done it alone",
      ],
      insight: "Reveals DevOps ownership vs dependency",
    },
    {
      id: "dops-2",
      text: "When a CI/CD pipeline fails on your PR, what is your first action?",
      type: "single",
      options: [
        "Read the logs immediately and diagnose the root cause",
        "Check if it's a flaky test before diving in",
        "Ask a DevOps colleague to look at it",
        "Re-run until it passes",
      ],
      insight: "Reveals problem-solving ownership vs avoidance",
    },
    {
      id: "dops-3",
      text: "How much do you understand about your team's infrastructure and deployment architecture?",
      type: "single",
      options: [
        "Deep understanding — I can draw it from memory",
        "Good enough — I know the flow but not every detail",
        "Basic — I know where to deploy but not how it works",
        "Almost none — it feels like a black box",
      ],
      insight: "Reveals infrastructure knowledge depth",
    },
  ],
  management: [
    {
      id: "mgmt-1",
      text: "When you're blocked on a task for more than 1 day, what do you do?",
      type: "single",
      options: [
        "Immediately escalate with a clear written description of the blocker",
        "Try different approaches before escalating after 2 days",
        "Wait for the next standup to mention it",
        "Push through silently and hope it resolves",
      ],
      insight: "Reveals communication and escalation behaviour",
    },
    {
      id: "mgmt-2",
      text: "How clear are you on your team's priorities for this sprint?",
      type: "single",
      options: [
        "Fully clear — I know the 'why' behind every task",
        "Clear on what, not always on why",
        "Vaguely aware — I focus on my assigned tasks",
        "Unclear — priorities seem to change frequently",
      ],
      insight: "Reveals alignment and strategic awareness",
    },
    {
      id: "mgmt-3",
      text: "When retrospectives happen, how engaged do you typically feel?",
      type: "single",
      options: [
        "Highly engaged — I prepare examples and action items in advance",
        "Engaged when the topics feel relevant to me",
        "Present but passive — I listen more than contribute",
        "Disengaged — I don't see real changes come from them",
      ],
      insight: "Reveals retrospective buy-in and psychological safety",
    },
  ],
  communication: [
    {
      id: "com-1",
      text: "When you disagree with a technical decision, how do you handle it?",
      type: "single",
      options: [
        "Write up my perspective with data and present it clearly",
        "Speak up in the meeting if the opportunity arises",
        "Mention it quietly to a colleague afterwards",
        "Accept it silently — not worth the conflict",
      ],
      insight: "Reveals psychological safety and assertiveness",
    },
    {
      id: "com-2",
      text: "How do you prefer to share progress on your tasks?",
      type: "single",
      options: [
        "Proactive async updates — Slack/PR descriptions before anyone asks",
        "In daily standups — I keep it to the meetings",
        "When someone asks me directly",
        "Only when there's something significant to share",
      ],
      insight: "Reveals communication proactivity",
    },
  ],
  technical_debt: [
    {
      id: "td-1",
      text: "When you encounter legacy code that's hard to work with, what do you do?",
      type: "single",
      options: [
        "Refactor incrementally while implementing the feature",
        "Add a TODO comment and create a tech debt ticket",
        "Work around it without touching it",
        "Rewrite it entirely — even if it takes longer",
      ],
      insight: "Reveals pragmatic vs avoidance vs overengineering tendencies",
    },
    {
      id: "td-2",
      text: "How do you feel about allocating sprint time specifically for tech debt?",
      type: "single",
      options: [
        "Essential — teams that skip this slow down exponentially",
        "Good in theory — hard to justify to non-technical stakeholders",
        "Unnecessary — good code shouldn't need debt sprints",
        "Unsure — I don't have a strong opinion yet",
      ],
      insight: "Reveals engineering sustainability mindset",
    },
    {
      id: "td-3",
      text: "How often do you leave code in a better state than you found it?",
      type: "single",
      options: [
        "Always — the Boy Scout rule is non-negotiable",
        "When time allows — quality matters but so does delivery",
        "Rarely — my job is to deliver features, not refactor",
        "I haven't thought about it this way before",
      ],
      insight: "Reveals craftsmanship and ownership mindset",
    },
  ],
};

// ─── Mock problems submitted ──────────────────────────────────────────────
export const MOCK_PROBLEMS: Problem[] = [
  {
    id: "p-1",
    devId: "dev-1",
    devName: "Alex Chen",
    devAvatar: "AC",
    category: "code_coupling",
    description:
      "Every time I change the user authentication flow, it breaks the payment module and the notification service. I spent 3 days tracing dependencies last sprint.",
    submittedAt: "2026-03-08T09:30:00Z",
    status: "survey_generated",
    similarCases: SIMILAR_CASES.code_coupling,
  },
  {
    id: "p-2",
    devId: "dev-2",
    devName: "Raj Kumar",
    devAvatar: "RK",
    category: "devops",
    description:
      "Our CI pipeline takes 45 minutes and fails randomly. I don't understand the deployment process and always need help from the DevOps team.",
    submittedAt: "2026-03-07T14:00:00Z",
    status: "completed",
    similarCases: SIMILAR_CASES.devops,
  },
];

// ─── Mock surveys ─────────────────────────────────────────────────────────
export const MOCK_SURVEYS: Survey[] = [
  {
    id: "s-1",
    title: "Code Architecture Mindset — Code Coupling",
    category: "code_coupling",
    forDevId: "dev-1",
    questions: SURVEY_QUESTIONS.code_coupling,
    status: "pending",
    deadline: "2026-03-17",
  },
  {
    id: "s-2",
    title: "DevOps Ownership & Confidence",
    category: "devops",
    forDevId: "dev-1",
    questions: SURVEY_QUESTIONS.devops,
    status: "pending",
    deadline: "2026-03-15",
  },
  {
    id: "s-3",
    title: "Team Collaboration & Communication",
    category: "communication",
    forDevId: "dev-1",
    questions: SURVEY_QUESTIONS.communication,
    status: "completed",
    deadline: "2026-03-10",
    completedAt: "2026-03-09T11:00:00Z",
    responses: { "com-1": "Write up my perspective with data and present it clearly", "com-2": "Proactive async updates — Slack/PR descriptions before anyone asks" },
  },
];

// ─── Team members for manager ─────────────────────────────────────────────
export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "dev-1",
    name: "Alex Chen",
    avatar: "AC",
    role: "Senior Engineer",
    team: "Platform",
    problemsCount: 3,
    surveysDone: 1,
    surveysTotal: 3,
    sentiment: "proactive",
    categories: ["code_coupling", "duplication"],
    score: 72,
  },
  {
    id: "dev-2",
    name: "Raj Kumar",
    avatar: "RK",
    role: "Backend Engineer",
    team: "Backend",
    problemsCount: 2,
    surveysDone: 2,
    surveysTotal: 2,
    sentiment: "reactive",
    categories: ["devops", "management"],
    score: 55,
  },
  {
    id: "dev-3",
    name: "Priya Nair",
    avatar: "PN",
    role: "Frontend Engineer",
    team: "Platform",
    problemsCount: 1,
    surveysDone: 0,
    surveysTotal: 2,
    sentiment: "blocked",
    categories: ["communication", "technical_debt"],
    score: 41,
  },
  {
    id: "dev-4",
    name: "James Okafor",
    avatar: "JO",
    role: "Full Stack Engineer",
    team: "Growth",
    problemsCount: 4,
    surveysDone: 3,
    surveysTotal: 4,
    sentiment: "proactive",
    categories: ["duplication", "devops"],
    score: 88,
  },
  {
    id: "dev-5",
    name: "Liu Wei",
    avatar: "LW",
    role: "Backend Engineer",
    team: "Backend",
    problemsCount: 2,
    surveysDone: 1,
    surveysTotal: 2,
    sentiment: "neutral",
    categories: ["code_coupling", "communication"],
    score: 63,
  },
  {
    id: "dev-6",
    name: "Maria Santos",
    avatar: "MS",
    role: "DevOps Engineer",
    team: "Infra",
    problemsCount: 5,
    surveysDone: 4,
    surveysTotal: 5,
    sentiment: "proactive",
    categories: ["devops", "management", "technical_debt"],
    score: 91,
  },
];

// ─── Action items ─────────────────────────────────────────────────────────
export const ACTION_ITEMS: ActionItem[] = [
  {
    id: "a-1",
    title: "Run dependency mapping workshop",
    description:
      "Use AI-generated module dependency graph to show the team where coupling is highest. Schedule a 2-hour workshop where devs identify contracts they can introduce.",
    assignee: "Alex Chen",
    priority: "high",
    status: "in_progress",
    dueDate: "2026-03-14",
    category: "code_coupling",
    createdFrom: "Survey s-1 responses",
  },
  {
    id: "a-2",
    title: "CI/CD onboarding sessions",
    description:
      "Three 45-min sessions: (1) Pipeline anatomy, (2) Debugging failures, (3) Self-service deploys. Raj and Priya to attend. Record for async access.",
    assignee: "Maria Santos",
    priority: "high",
    status: "todo",
    dueDate: "2026-03-17",
    category: "devops",
    createdFrom: "Problem p-2",
  },
  {
    id: "a-3",
    title: "Create shared component registry",
    description:
      "Audit codebase for duplicated utilities. Consolidate into /shared/utils with clear ownership. Assign a rotation of 1 dev per sprint to review PRs adding new shared code.",
    assignee: "James Okafor",
    priority: "medium",
    status: "todo",
    dueDate: "2026-03-21",
    category: "duplication",
    createdFrom: "Survey responses — duplication pattern",
  },
  {
    id: "a-4",
    title: "Psychological safety retrospective",
    description:
      "Priya's survey shows high communication avoidance score. Run a team session using start/stop/continue format. Manager to share their own vulnerability first.",
    assignee: "Sarah Mitchell",
    priority: "medium",
    status: "todo",
    dueDate: "2026-03-13",
    category: "communication",
    createdFrom: "Survey responses — communication pattern",
  },
  {
    id: "a-5",
    title: "Tech debt allocation policy",
    description:
      "Formalise 15% sprint capacity for tech debt. Create a visible tech debt board. Teams vote on highest-impact items each sprint.",
    assignee: "Sarah Mitchell",
    priority: "low",
    status: "done",
    dueDate: "2026-03-10",
    category: "technical_debt",
    createdFrom: "Team retrospective",
  },
  {
    id: "a-6",
    title: "Priority alignment sync",
    description:
      "Weekly 15-min async update from manager on sprint priorities. Post in Slack every Monday with the 'why' behind top 3 priorities.",
    assignee: "Sarah Mitchell",
    priority: "medium",
    status: "in_progress",
    dueDate: "2026-03-11",
    category: "management",
    createdFrom: "Survey s-2 responses",
  },
];

// ─── Chart data ───────────────────────────────────────────────────────────
export const PROBLEM_CATEGORY_DATA = [
  { name: "Code Coupling", value: 8, fill: "#06B6D4" },
  { name: "Duplication", value: 5, fill: "#8B5CF6" },
  { name: "DevOps", value: 7, fill: "#F59E0B" },
  { name: "Management", value: 4, fill: "#10B981" },
  { name: "Communication", value: 3, fill: "#EF4444" },
  { name: "Tech Debt", value: 6, fill: "#EC4899" },
];

export const SURVEY_COMPLETION_TREND = [
  { week: "W1", sent: 4, completed: 2 },
  { week: "W2", sent: 6, completed: 4 },
  { week: "W3", sent: 5, completed: 5 },
  { week: "W4", sent: 8, completed: 6 },
  { week: "W5", sent: 7, completed: 7 },
];

export const MINDSET_RADAR = [
  { subject: "Ownership", A: 72, fullMark: 100 },
  { subject: "Communication", A: 58, fullMark: 100 },
  { subject: "Architecture", A: 65, fullMark: 100 },
  { subject: "DevOps", A: 49, fullMark: 100 },
  { subject: "Collaboration", A: 81, fullMark: 100 },
  { subject: "Learning", A: 76, fullMark: 100 },
];

export const CATEGORY_LABELS: Record<ProblemCategory, string> = {
  code_coupling: "Code Coupling",
  duplication: "Duplication",
  devops: "DevOps",
  management: "Management",
  communication: "Communication",
  technical_debt: "Tech Debt",
};

export const SENTIMENT_CONFIG = {
  proactive: { label: "Proactive", color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  reactive: { label: "Reactive", color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  blocked: { label: "Blocked", color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
  neutral: { label: "Neutral", color: "#94A3B8", bg: "rgba(148,163,184,0.12)" },
};
