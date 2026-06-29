"use client";

import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  ChevronRight,
  CircleDot,
  Clock,
  Compass,
  FileText,
  Gauge,
  GitBranch,
  History,
  Lightbulb,
  Lock,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingUp,
  User,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useState } from "react";

type View = "new" | "dashboard" | "decisions" | "outcomes" | "insights" | "profile" | "settings";
type Confidence = "low" | "medium" | "high";
type Reversibility = "One-way" | "Two-way" | "Mostly reversible";
type EmotionalState = "Clear" | "Rushed" | "Anxious" | "Frustrated" | "Avoidant" | "Excited";
type OutcomeStatus = "pending" | "reviewed";

type DecisionDraft = {
  title: string;
  context: string;
  category: string;
  options: string;
  leaning: string;
  confidence: number;
  desiredOutcome: string;
  expectedOutcome: string;
  assumptions: string;
  risks: string;
  reversibility: Reversibility;
  urgency: string;
  emotionalState: EmotionalState;
  reviewDate: string;
  wrongIf: string;
};

type Blindspot = {
  name: string;
  why: string;
  confidence: Confidence;
  question: string;
  action: string;
};

type Decision = DecisionDraft & {
  id: string;
  createdAt: string;
  finalDecision: string;
  qualityScore: number;
  blindspots: Blindspot[];
  status: OutcomeStatus;
  outcome?: {
    happened: string;
    actual: string;
    calibrated: string;
    missed: string;
    lesson: string;
    repeat: string;
  };
};

const today = new Date();
const dateIn = (days: number) => {
  const d = new Date(today);
  d.setDate(today.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const emptyDraft: DecisionDraft = {
  title: "",
  context: "",
  category: "Career",
  options: "",
  leaning: "",
  confidence: 62,
  desiredOutcome: "",
  expectedOutcome: "",
  assumptions: "",
  risks: "",
  reversibility: "Mostly reversible",
  urgency: "",
  emotionalState: "Clear",
  reviewDate: dateIn(30),
  wrongIf: "",
};

const seedDecisions: Decision[] = [
  {
    ...emptyDraft,
    id: "d-001",
    createdAt: "2026-05-18",
    title: "Shift launch sequencing toward founder-led pilots",
    context: "We had too many broad ICPs and unclear conversion signals.",
    category: "Product",
    options:
      "A: keep broad launch. B: narrow to founder-led pilots. C: pause and rebuild onboarding.",
    leaning: "Narrow to founder-led pilots",
    confidence: 76,
    desiredOutcome: "Higher quality feedback and faster willingness-to-pay signal.",
    expectedOutcome:
      "Three high-signal pilots in four weeks, at least one paid expansion conversation.",
    assumptions:
      "Founders feel the pain more acutely; narrower scope will improve copy and product decisions.",
    risks: "Smaller top-of-funnel volume and overfitting to founder workflows.",
    reversibility: "Mostly reversible",
    urgency: "Two-week messaging window before outreach starts.",
    emotionalState: "Clear",
    reviewDate: dateIn(5),
    wrongIf: "Founder pilots produce weak engagement or requests that do not generalize.",
    finalDecision: "Run founder-led pilots first, defer broad launch language.",
    qualityScore: 84,
    blindspots: [
      {
        name: "Optimism bias",
        why: "The expected outcome assumes fast expansion conversations without defining a fallback threshold.",
        confidence: "medium",
        question: "What weak signal would make this thesis false?",
        action: "Define a kill threshold before the first pilot starts.",
      },
    ],
    status: "pending",
  },
  {
    ...emptyDraft,
    id: "d-002",
    createdAt: "2026-04-22",
    title: "Delay the contractor hire until a paid work sample",
    context:
      "The candidate interviewed well but the role depends on crisp execution under ambiguity.",
    category: "Hiring",
    options: "A: hire now. B: paid trial. C: restart sourcing.",
    leaning: "Paid trial",
    confidence: 68,
    desiredOutcome: "Avoid a high-conviction hire based only on rapport.",
    expectedOutcome:
      "Work sample reveals whether the candidate can translate messy context into finished output.",
    assumptions: "A short trial will be accepted and will be representative of real work.",
    risks: "Candidate may decline or feel mistrusted.",
    reversibility: "Two-way",
    urgency: "Need capacity this month, but no hard deadline.",
    emotionalState: "Anxious",
    reviewDate: "2026-06-12",
    wrongIf:
      "Trial output is unrepresentative or delays hiring enough to miss the delivery window.",
    finalDecision: "Offer a paid work sample before making the hire.",
    qualityScore: 79,
    blindspots: [
      {
        name: "People pleasing",
        why: "The risk statement focuses on the candidate's feelings more than the business cost of a bad hire.",
        confidence: "medium",
        question: "What would you choose if disappointing the candidate was not a factor?",
        action: "Write the business case for the trial in one paragraph.",
      },
    ],
    status: "reviewed",
    outcome: {
      happened: "Partially",
      actual:
        "The candidate accepted the trial. Output was organized but required more editing than expected.",
      calibrated: "Slightly overconfident",
      missed: "I underestimated how much feedback time the trial itself would require.",
      lesson: "For ambiguous roles, score the review burden as part of the trial result.",
      repeat: "Yes, with a tighter rubric.",
    },
  },
  {
    ...emptyDraft,
    id: "d-003",
    createdAt: "2026-03-30",
    title: "Have the hard scope conversation before renewing",
    context: "The client keeps expanding scope informally and the team is absorbing it.",
    category: "Client",
    options: "A: avoid friction and renew. B: address scope now. C: exit the account.",
    leaning: "Address scope now",
    confidence: 58,
    desiredOutcome: "Renew on healthier terms without resentment or hidden labor.",
    expectedOutcome: "Client agrees to a smaller scope or pays for added work.",
    assumptions:
      "The relationship can tolerate directness; the client values the work enough to negotiate.",
    risks: "They may see it as a price increase and churn.",
    reversibility: "One-way",
    urgency: "Renewal call in 48 hours.",
    emotionalState: "Avoidant",
    reviewDate: "2026-05-04",
    wrongIf: "Directness creates churn without improving terms.",
    finalDecision: "Raise scope before renewal and offer two clean options.",
    qualityScore: 72,
    blindspots: [
      {
        name: "Conflict avoidance",
        why: "The decision was delayed until renewal pressure made it harder to handle calmly.",
        confidence: "high",
        question: "What conversation did you avoid two weeks ago?",
        action: "Send a written agenda before the renewal call.",
      },
      {
        name: "Urgency bias",
        why: "A 48-hour deadline may be compressing the option set.",
        confidence: "medium",
        question: "What could be separated from the renewal date?",
        action: "Ask for a one-week extension if terms need revision.",
      },
    ],
    status: "reviewed",
    outcome: {
      happened: "Yes",
      actual: "The client accepted a tighter scope and added a paid support block.",
      calibrated: "Underconfident",
      missed: "I underestimated how much they already knew the old scope was unsustainable.",
      lesson: "Direct scope conversations are usually less costly than silent over-delivery.",
      repeat: "Yes.",
    },
  },
];

const categories = [
  "Career",
  "Product",
  "Hiring",
  "Client",
  "Personal",
  "Finance",
  "Strategy",
  "Operations",
];
const emotions: EmotionalState[] = [
  "Clear",
  "Rushed",
  "Anxious",
  "Frustrated",
  "Avoidant",
  "Excited",
];
const reversibilities: Reversibility[] = ["Mostly reversible", "Two-way", "One-way"];

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function splitLines(value: string) {
  return value
    .split(/\n|;/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function hasText(value: string, min = 8) {
  return value.trim().length >= min;
}

function qualityFor(draft: DecisionDraft) {
  const dimensions = [
    { label: "Clarity of goal", value: hasText(draft.desiredOutcome) ? 12 : 4 },
    { label: "Quality of options", value: splitLines(draft.options).length >= 2 ? 12 : 5 },
    { label: "Evidence quality", value: hasText(draft.context, 40) ? 10 : 4 },
    { label: "Disconfirming evidence", value: hasText(draft.wrongIf) ? 11 : 3 },
    {
      label: "Risk/reward balance",
      value: hasText(draft.risks) && hasText(draft.expectedOutcome) ? 11 : 5,
    },
    {
      label: "Emotional awareness",
      value: draft.emotionalState !== "Clear" || hasText(draft.urgency) ? 9 : 6,
    },
    { label: "Reversibility", value: draft.reversibility ? 9 : 3 },
    {
      label: "Confidence calibration",
      value: draft.confidence >= 35 && draft.confidence <= 82 ? 10 : 4,
    },
    { label: "Review plan", value: draft.reviewDate ? 10 : 2 },
  ];
  return { score: clamp(dimensions.reduce((sum, d) => sum + d.value, 0)), dimensions };
}

function blindspotsFor(draft: DecisionDraft): Blindspot[] {
  const text =
    `${draft.title} ${draft.context} ${draft.urgency} ${draft.leaning} ${draft.assumptions} ${draft.risks}`.toLowerCase();
  const spots: Blindspot[] = [];

  if (
    (text.includes("urgent") ||
      text.includes("asap") ||
      text.includes("immediately") ||
      draft.emotionalState === "Rushed") &&
    !text.includes("deadline")
  ) {
    spots.push({
      name: "Urgency bias",
      why: "You are framing this as time-sensitive, but the hard deadline is not yet explicit.",
      confidence: "high",
      question: "What would change if you waited 24 hours?",
      action:
        "Delay the final decision long enough to write the strongest case against your current leaning.",
    });
  }
  if (draft.confidence > 82 && splitLines(draft.options).length < 3) {
    spots.push({
      name: "Overconfidence",
      why: "Confidence is high while the option set is still narrow.",
      confidence: "high",
      question: "What evidence would lower your confidence by 20 points?",
      action: "Add one serious alternative and one no-decision option before committing.",
    });
  }
  if (
    draft.emotionalState === "Anxious" ||
    draft.emotionalState === "Frustrated" ||
    draft.emotionalState === "Excited"
  ) {
    spots.push({
      name: "Emotional reasoning",
      why: `The decision is being logged while your state is ${draft.emotionalState.toLowerCase()}, which can distort cost and timing estimates.`,
      confidence: "medium",
      question: "What would you advise a calm friend to do with the same facts?",
      action: "Separate the emotional relief you want from the outcome you expect.",
    });
  }
  if (draft.emotionalState === "Avoidant" || text.includes("avoid") || text.includes("confront")) {
    spots.push({
      name: "Conflict avoidance",
      why: "The language suggests the interpersonal cost may be carrying more weight than the decision cost.",
      confidence: "medium",
      question: "What conversation is this decision trying to avoid?",
      action: "Draft the cleanest direct conversation before choosing the workaround.",
    });
  }
  if (text.includes("already") || text.includes("spent") || text.includes("invested")) {
    spots.push({
      name: "Sunk cost fallacy",
      why: "Past investment appears in the reasoning, but past cost should not decide future allocation.",
      confidence: "medium",
      question: "If you inherited this today, would you make the same choice?",
      action: "Rewrite the decision using only future costs and future upside.",
    });
  }
  if (!hasText(draft.wrongIf)) {
    spots.push({
      name: "Confirmation bias",
      why: "You have not named what would prove the decision wrong.",
      confidence: "high",
      question: "What would make your current leaning obviously wrong?",
      action: "Add one disconfirming signal before committing.",
    });
  }
  if (draft.reversibility === "One-way" && draft.confidence < 65) {
    spots.push({
      name: "Analysis paralysis",
      why: "This is a hard-to-reverse decision with moderate confidence, so the next move should reduce uncertainty rather than force certainty.",
      confidence: "medium",
      question: "What low-cost experiment would make this easier?",
      action: "Design a reversible test that answers the riskiest assumption.",
    });
  }

  return spots.slice(0, 4);
}

function nudgesFor(draft: DecisionDraft) {
  const nudges: string[] = [];
  if (splitLines(draft.options).length < 2)
    nudges.push("You have not considered a second option yet.");
  if (!hasText(draft.wrongIf)) nudges.push("What evidence would change your mind?");
  if (
    (draft.emotionalState === "Rushed" || draft.emotionalState === "Anxious") &&
    !draft.urgency.toLowerCase().includes("deadline")
  ) {
    nudges.push("This sounds emotionally urgent. Is there a real deadline?");
  }
  if (!hasText(draft.assumptions)) nudges.push("What assumption is doing the most work here?");
  if (draft.confidence > 80) nudges.push("What would make this decision obviously wrong?");
  if (draft.reversibility === "One-way") nudges.push("What is the cost of waiting?");
  if (!hasText(draft.risks)) nudges.push("What would you advise a friend to watch out for?");
  return nudges.slice(0, 5);
}

function experimentsFor(draft: DecisionDraft) {
  const text = `${draft.title} ${draft.context} ${draft.leaning}`.toLowerCase();
  if (text.includes("quit") || text.includes("job") || draft.category === "Career") {
    return [
      "Take one market interview",
      "Negotiate internally",
      "Calculate true runway",
      "Run a two-week energy audit",
    ];
  }
  if (text.includes("hire") || draft.category === "Hiring") {
    return [
      "Paid work sample",
      "Structured reference check",
      "Scorecard interview",
      "Two-hour collaboration test",
    ];
  }
  if (text.includes("launch") || draft.category === "Product") {
    return [
      "Concierge pilot",
      "Smoke-test pricing page",
      "Five customer calls",
      "Manual workflow before build",
    ];
  }
  if (draft.reversibility === "One-way") {
    return [
      "One-week reversible trial",
      "Pre-mortem with a skeptical reviewer",
      "Smallest possible exposure",
      "Written kill criteria",
    ];
  }
  return [
    "24-hour cooling period",
    "Ask one disconfirming expert",
    "Run a small reversible test",
    "Write the no-decision option",
  ];
}

function similarDecision(draft: DecisionDraft, decisions: Decision[]) {
  const words = new Set(
    `${draft.title} ${draft.context} ${draft.category}`
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 4),
  );
  return decisions
    .filter((d) => d.status === "reviewed")
    .map((d) => {
      const haystack = `${d.title} ${d.context} ${d.category}`.toLowerCase();
      const score =
        [...words].filter((w) => haystack.includes(w)).length +
        (d.category === draft.category ? 2 : 0);
      return { d, score };
    })
    .sort((a, b) => b.score - a.score)[0]?.d;
}

function useStoredDecisions() {
  const [decisions, setDecisions] = useState<Decision[]>(seedDecisions);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("wo:judgment-os:v1");
      if (raw) setDecisions(JSON.parse(raw));
    } catch {
      setDecisions(seedDecisions);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("wo:judgment-os:v1", JSON.stringify(decisions));
    } catch {
      // Local persistence is best-effort in this experimental fork.
    }
  }, [decisions]);

  return [decisions, setDecisions] as const;
}

function Logo() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 100 100"
      fill="none"
      role="img"
      aria-label="WorkOutput"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <rect
          key={i}
          x="44.5"
          y="2"
          width="11"
          height="20"
          rx="3"
          fill="var(--brand)"
          transform={`rotate(${i * 45} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="35" fill="var(--brand)" />
      <rect x="29" y="29" width="42" height="42" rx="9" fill="#FFFFFF" />
      <path
        d="M37 51 L46.5 60.5 L64 39.5"
        stroke="#15130F"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Button({
  children,
  onClick,
  kind = "ghost",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  kind?: "primary" | "ghost" | "soft";
  disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} className="wo-button" data-kind={kind}>
      {children}
    </button>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <div className="wo-kicker">{children}</div>;
}

function Card({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return <section className={wide ? "wo-card wo-wide" : "wo-card"}>{children}</section>;
}

function Meter({
  value,
  label,
  tone = "accent",
}: {
  value: number;
  label: string;
  tone?: "accent" | "caution" | "critical";
}) {
  return (
    <div>
      <div className="wo-meter-row">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="wo-meter">
        <div style={{ width: `${clamp(value)}%`, background: `var(--${tone})` }} />
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="wo-field">
      <span>{label}</span>
      {hint ? <em>{hint}</em> : null}
      {children}
    </label>
  );
}

export default function JudgmentOS() {
  const [view, setView] = useState<View>("new");
  const [theme, setTheme] = useState<"ink" | "paper">("ink");
  const [draft, setDraft] = useState<DecisionDraft>(emptyDraft);
  const [decisions, setDecisions] = useStoredDecisions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const quality = useMemo(() => qualityFor(draft), [draft]);
  const blindspots = useMemo(() => blindspotsFor(draft), [draft]);
  const nudges = useMemo(() => nudgesFor(draft), [draft]);
  const experiments = useMemo(() => experimentsFor(draft), [draft]);
  const replay = useMemo(() => similarDecision(draft, decisions), [draft, decisions]);
  const pending = decisions.filter((d) => d.status === "pending");
  const reviewed = decisions.filter((d) => d.status === "reviewed");
  const selected = decisions.find((d) => d.id === selectedId) ?? decisions[0];

  const update = <K extends keyof DecisionDraft>(key: K, value: DecisionDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const commitDecision = () => {
    const title = draft.title.trim();
    if (!title || !draft.expectedOutcome.trim() || !draft.reviewDate) {
      setNotice("Add a decision, expected outcome, and review date before committing.");
      return;
    }

    const decision: Decision = {
      ...draft,
      id: `d-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      finalDecision: draft.leaning || draft.title,
      qualityScore: quality.score,
      blindspots,
      status: "pending",
    };
    setDecisions((items) => [decision, ...items]);
    setSelectedId(decision.id);
    setDraft(emptyDraft);
    setNotice("Decision committed. It is now part of your judgment record.");
    setView("decisions");
  };

  const reviewDecision = (id: string, outcome: Decision["outcome"]) => {
    setDecisions((items) =>
      items.map((d) => (d.id === id ? { ...d, status: "reviewed", outcome } : d)),
    );
    setNotice("Outcome saved. The lesson now updates your decision profile.");
    setView("insights");
  };

  return (
    <div className="wo" data-theme={theme}>
      <div className="wo-grain" />
      <aside className="wo-sidebar">
        <div className="wo-brand">
          <Logo />
          <div>
            <strong>WorkOutput</strong>
            <span>Judgment OS</span>
          </div>
        </div>
        <nav>
          <NavItem
            icon={<GitBranch size={15} />}
            label="New Decision"
            active={view === "new"}
            onClick={() => setView("new")}
          />
          <NavItem
            icon={<Gauge size={15} />}
            label="Dashboard"
            active={view === "dashboard"}
            onClick={() => setView("dashboard")}
          />
          <NavItem
            icon={<FileText size={15} />}
            label="Decisions"
            active={view === "decisions"}
            onClick={() => setView("decisions")}
          />
          <NavItem
            icon={<RotateCcw size={15} />}
            label="Outcomes"
            active={view === "outcomes"}
            onClick={() => setView("outcomes")}
            badge={pending.length}
          />
          <NavItem
            icon={<BarChart3 size={15} />}
            label="Insights"
            active={view === "insights"}
            onClick={() => setView("insights")}
          />
          <NavItem
            icon={<User size={15} />}
            label="Decision Profile"
            active={view === "profile"}
            onClick={() => setView("profile")}
          />
          <NavItem
            icon={<Settings size={15} />}
            label="Settings"
            active={view === "settings"}
            onClick={() => setView("settings")}
          />
        </nav>
        <div className="wo-plan">
          <div>
            <Lock size={14} />
            <span>Preview protected</span>
          </div>
          <p>
            Free tracks 3 active decisions. Pro unlocks full history, replay, and advanced pattern
            analytics.
          </p>
        </div>
      </aside>

      <main className="wo-main">
        <header className="wo-topbar">
          <div>
            <Kicker>Compounding judgment data</Kicker>
            <h1>{titleFor(view)}</h1>
          </div>
          <div className="wo-actions">
            {notice ? <span className="wo-notice">{notice}</span> : null}
            <Button kind="soft" onClick={() => setTheme(theme === "ink" ? "paper" : "ink")}>
              {theme === "ink" ? "Paper" : "Ink"}
            </Button>
          </div>
        </header>

        <div className="wo-content wo-sc">
          {view === "new" ? (
            <NewDecision
              draft={draft}
              update={update}
              quality={quality}
              blindspots={blindspots}
              nudges={nudges}
              experiments={experiments}
              replay={replay}
              onCommit={commitDecision}
            />
          ) : null}
          {view === "dashboard" ? <Dashboard decisions={decisions} setView={setView} /> : null}
          {view === "decisions" ? (
            <DecisionList
              decisions={decisions}
              selected={selected}
              setSelectedId={setSelectedId}
              setView={setView}
            />
          ) : null}
          {view === "outcomes" ? <Outcomes decisions={pending} onReview={reviewDecision} /> : null}
          {view === "insights" ? <Insights decisions={decisions} /> : null}
          {view === "profile" ? <DecisionProfile decisions={decisions} /> : null}
          {view === "settings" ? <SettingsView /> : null}
        </div>
      </main>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button className="wo-nav" data-active={active} onClick={onClick}>
      {icon}
      <span>{label}</span>
      {badge ? <strong>{badge}</strong> : null}
    </button>
  );
}

function titleFor(view: View) {
  return {
    new: "Log a decision",
    dashboard: "Judgment dashboard",
    decisions: "Decision memory",
    outcomes: "Outcome reviews",
    insights: "My patterns",
    profile: "Decision profile",
    settings: "Settings",
  }[view];
}

function NewDecision({
  draft,
  update,
  quality,
  blindspots,
  nudges,
  experiments,
  replay,
  onCommit,
}: {
  draft: DecisionDraft;
  update: <K extends keyof DecisionDraft>(key: K, value: DecisionDraft[K]) => void;
  quality: ReturnType<typeof qualityFor>;
  blindspots: Blindspot[];
  nudges: string[];
  experiments: string[];
  replay?: Decision;
  onCommit: () => void;
}) {
  return (
    <div className="wo-layout">
      <section className="wo-form">
        <Card wide>
          <div className="wo-section-head">
            <div>
              <Kicker>Decision record</Kicker>
              <h2>Not a prompt. A training example for future you.</h2>
              <p>
                Capture the facts, forecast, assumptions, and review plan before the outcome is
                known.
              </p>
            </div>
            <Button kind="primary" onClick={onCommit}>
              Commit decision <ArrowRight size={15} />
            </Button>
          </div>
          <div className="wo-form-grid">
            <Field label="Decision being considered" hint="Make it concrete">
              <input
                value={draft.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Should I..."
              />
            </Field>
            <Field label="Category">
              <select value={draft.category} onChange={(e) => update("category", e.target.value)}>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Context" hint="What matters, what changed, what is constrained">
              <textarea
                value={draft.context}
                onChange={(e) => update("context", e.target.value)}
                placeholder="The situation, constraints, relevant evidence..."
              />
            </Field>
            <Field label="Options" hint="One per line. Include the no-decision option.">
              <textarea
                value={draft.options}
                onChange={(e) => update("options", e.target.value)}
                placeholder={"Option A\nOption B\nDo nothing for now"}
              />
            </Field>
            <Field label="Current leaning">
              <input
                value={draft.leaning}
                onChange={(e) => update("leaning", e.target.value)}
                placeholder="The choice you currently expect to make"
              />
            </Field>
            <Field label={`Confidence: ${draft.confidence}%`}>
              <input
                type="range"
                min="0"
                max="100"
                value={draft.confidence}
                onChange={(e) => update("confidence", Number(e.target.value))}
              />
            </Field>
            <Field label="Desired outcome">
              <textarea
                value={draft.desiredOutcome}
                onChange={(e) => update("desiredOutcome", e.target.value)}
                placeholder="What you want to happen"
              />
            </Field>
            <Field label="Expected outcome">
              <textarea
                value={draft.expectedOutcome}
                onChange={(e) => update("expectedOutcome", e.target.value)}
                placeholder="What you predict will happen"
              />
            </Field>
            <Field label="Key assumptions">
              <textarea
                value={draft.assumptions}
                onChange={(e) => update("assumptions", e.target.value)}
                placeholder="This works if..."
              />
            </Field>
            <Field label="Risks">
              <textarea
                value={draft.risks}
                onChange={(e) => update("risks", e.target.value)}
                placeholder="What could go wrong or be underestimated"
              />
            </Field>
            <Field label="Reversibility">
              <select
                value={draft.reversibility}
                onChange={(e) => update("reversibility", e.target.value as Reversibility)}
              >
                {reversibilities.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field label="Deadline or urgency">
              <input
                value={draft.urgency}
                onChange={(e) => update("urgency", e.target.value)}
                placeholder="Hard deadline, soft pressure, or none"
              />
            </Field>
            <Field label="Emotional state">
              <select
                value={draft.emotionalState}
                onChange={(e) => update("emotionalState", e.target.value as EmotionalState)}
              >
                {emotions.map((emotion) => (
                  <option key={emotion}>{emotion}</option>
                ))}
              </select>
            </Field>
            <Field label="Review date">
              <input
                type="date"
                value={draft.reviewDate}
                onChange={(e) => update("reviewDate", e.target.value)}
              />
            </Field>
            <Field label="What would prove this wrong?" hint="The anti-rationalization clause">
              <textarea
                value={draft.wrongIf}
                onChange={(e) => update("wrongIf", e.target.value)}
                placeholder="I should update if..."
              />
            </Field>
          </div>
        </Card>
      </section>

      <aside className="wo-coach">
        <Card>
          <Kicker>Decision quality score</Kicker>
          <div className="wo-score">{quality.score}</div>
          <p>Scores the process, not whether the decision sounds right.</p>
          {quality.dimensions.map((d) => (
            <Meter
              key={d.label}
              label={d.label}
              value={Math.round((d.value / 12) * 100)}
              tone={d.value < 6 ? "critical" : d.value < 9 ? "caution" : "accent"}
            />
          ))}
        </Card>
        <Card>
          <Kicker>Real-time coaching</Kicker>
          <ul className="wo-list">
            {nudges.length ? (
              nudges.map((n) => <li key={n}>{n}</li>)
            ) : (
              <li>The decision record is becoming reviewable.</li>
            )}
          </ul>
        </Card>
        <Card>
          <Kicker>Blindspot engine</Kicker>
          {blindspots.length ? (
            blindspots.map((spot) => <BlindspotCard key={spot.name} spot={spot} />)
          ) : (
            <p>No major blindspot detected yet. Keep adding evidence and assumptions.</p>
          )}
        </Card>
        <Card>
          <Kicker>Decision experiments</Kicker>
          <ul className="wo-list">
            {experiments.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Card>
        {replay ? (
          <Card>
            <Kicker>Decision replay</Kicker>
            <h3>This resembles a previous decision.</h3>
            <p>
              <strong>{replay.title}</strong>
            </p>
            <p>Outcome: {replay.outcome?.actual}</p>
            <p>Lesson: {replay.outcome?.lesson}</p>
          </Card>
        ) : null}
      </aside>
    </div>
  );
}

function BlindspotCard({ spot }: { spot: Blindspot }) {
  return (
    <div className="wo-blindspot">
      <div>
        <strong>{spot.name}</strong>
        <span>{spot.confidence}</span>
      </div>
      <p>{spot.why}</p>
      <p>
        <b>Counter-question:</b> {spot.question}
      </p>
      <p>
        <b>Corrective action:</b> {spot.action}
      </p>
    </div>
  );
}

function Dashboard({
  decisions,
  setView,
}: {
  decisions: Decision[];
  setView: (view: View) => void;
}) {
  const avg = Math.round(decisions.reduce((sum, d) => sum + d.qualityScore, 0) / decisions.length);
  const reviewed = decisions.filter((d) => d.status === "reviewed");
  const pending = decisions.filter((d) => d.status === "pending");
  const highEmotion = decisions.filter((d) => d.emotionalState !== "Clear").length;
  return (
    <div className="wo-stack">
      <div className="wo-stat-grid">
        <Stat label="Decision quality" value={`${avg}`} icon={<Gauge size={18} />} />
        <Stat label="Awaiting review" value={`${pending.length}`} icon={<Clock size={18} />} />
        <Stat label="Outcome lessons" value={`${reviewed.length}`} icon={<RotateCcw size={18} />} />
        <Stat
          label="High-emotion calls"
          value={`${highEmotion}`}
          icon={<AlertTriangle size={18} />}
        />
      </div>
      <Card wide>
        <div className="wo-section-head">
          <div>
            <Kicker>Operating principle</Kicker>
            <h2>ChatGPT helps you think. WorkOutput helps you become someone who thinks better.</h2>
            <p>
              Every meaningful decision becomes training data: prediction, confidence, assumptions,
              outcome, and lesson.
            </p>
          </div>
          <Button kind="primary" onClick={() => setView("new")}>
            Log a decision
          </Button>
        </div>
      </Card>
      <Insights decisions={decisions} compact />
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="wo-stat">
      {icon}
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function DecisionList({
  decisions,
  selected,
  setSelectedId,
  setView,
}: {
  decisions: Decision[];
  selected?: Decision;
  setSelectedId: (id: string) => void;
  setView: (view: View) => void;
}) {
  return (
    <div className="wo-two">
      <Card>
        <Kicker>Decision CRM</Kicker>
        <div className="wo-rows">
          {decisions.map((d) => (
            <button
              key={d.id}
              className="wo-row"
              data-active={selected?.id === d.id}
              onClick={() => setSelectedId(d.id)}
            >
              <span>{d.title}</span>
              <small>
                {d.category} · {d.confidence}% · {d.status}
              </small>
            </button>
          ))}
        </div>
      </Card>
      {selected ? (
        <Card wide>
          <Kicker>
            {selected.category} · {selected.createdAt}
          </Kicker>
          <h2>{selected.title}</h2>
          <p>{selected.context}</p>
          <div className="wo-record-grid">
            <Record label="Final decision" value={selected.finalDecision} />
            <Record label="Expected outcome" value={selected.expectedOutcome} />
            <Record label="Key assumptions" value={selected.assumptions} />
            <Record label="Wrong if" value={selected.wrongIf || "Not specified"} />
            <Record label="Review date" value={selected.reviewDate} />
            <Record label="Quality score" value={`${selected.qualityScore}/100`} />
          </div>
          <div className="wo-chip-row">
            {selected.blindspots.map((b) => (
              <span key={b.name}>{b.name}</span>
            ))}
          </div>
          {selected.status === "pending" ? (
            <Button kind="primary" onClick={() => setView("outcomes")}>
              Review outcome
            </Button>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}

function Record({ label, value }: { label: string; value: string }) {
  return (
    <div className="wo-record">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}

function Outcomes({
  decisions,
  onReview,
}: {
  decisions: Decision[];
  onReview: (id: string, outcome: Decision["outcome"]) => void;
}) {
  const [active, setActive] = useState(decisions[0]?.id ?? "");
  const [form, setForm] = useState({
    happened: "Partially",
    actual: "",
    calibrated: "About right",
    missed: "",
    lesson: "",
    repeat: "Unsure",
  });
  const decision = decisions.find((d) => d.id === active) ?? decisions[0];

  if (!decision) {
    return (
      <Card wide>
        <Kicker>Outcome queue</Kicker>
        <h2>No committed decisions are awaiting review.</h2>
        <p>
          When review dates arrive, WorkOutput asks what happened and turns the result into a
          lesson.
        </p>
      </Card>
    );
  }

  return (
    <div className="wo-two">
      <Card>
        <Kicker>Awaiting review</Kicker>
        <div className="wo-rows">
          {decisions.map((d) => (
            <button
              key={d.id}
              className="wo-row"
              data-active={decision.id === d.id}
              onClick={() => setActive(d.id)}
            >
              <span>{d.title}</span>
              <small>Review {d.reviewDate}</small>
            </button>
          ))}
        </div>
      </Card>
      <Card wide>
        <Kicker>Outcome review</Kicker>
        <h2>{decision.title}</h2>
        <p>Expected: {decision.expectedOutcome}</p>
        <div className="wo-form-grid">
          <Field label="Did the expected outcome happen?">
            <select
              value={form.happened}
              onChange={(e) => setForm({ ...form, happened: e.target.value })}
            >
              <option>Yes</option>
              <option>Partially</option>
              <option>No</option>
            </select>
          </Field>
          <Field label="Was your confidence calibrated?">
            <select
              value={form.calibrated}
              onChange={(e) => setForm({ ...form, calibrated: e.target.value })}
            >
              <option>About right</option>
              <option>Too high</option>
              <option>Too low</option>
            </select>
          </Field>
          <Field label="What actually happened?">
            <textarea
              value={form.actual}
              onChange={(e) => setForm({ ...form, actual: e.target.value })}
            />
          </Field>
          <Field label="What did you miss?">
            <textarea
              value={form.missed}
              onChange={(e) => setForm({ ...form, missed: e.target.value })}
            />
          </Field>
          <Field label="Lesson to save">
            <textarea
              value={form.lesson}
              onChange={(e) => setForm({ ...form, lesson: e.target.value })}
            />
          </Field>
          <Field label="Would you make the same decision again?">
            <input
              value={form.repeat}
              onChange={(e) => setForm({ ...form, repeat: e.target.value })}
            />
          </Field>
        </div>
        <Button kind="primary" onClick={() => onReview(decision.id, form)}>
          Save outcome lesson
        </Button>
      </Card>
    </div>
  );
}

function Insights({ decisions, compact }: { decisions: Decision[]; compact?: boolean }) {
  const byMonth = decisions
    .map((d, i) => ({
      name: d.createdAt.slice(5),
      score: d.qualityScore,
      confidence: d.confidence + (i % 2 ? -8 : 3),
    }))
    .reverse();
  const blindspots = countBlindspots(decisions);
  const categoryRows = categories
    .map((category) => {
      const rows = decisions.filter((d) => d.category === category);
      return {
        category,
        score: rows.length
          ? Math.round(rows.reduce((sum, d) => sum + d.qualityScore, 0) / rows.length)
          : 0,
      };
    })
    .filter((r) => r.score);

  return (
    <div className={compact ? "wo-stack" : "wo-layout"}>
      <Card wide>
        <Kicker>Decision quality over time</Kicker>
        <div className="wo-chart">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={byMonth}>
              <defs>
                <linearGradient id="quality" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.36} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--line-soft)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--meta)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--meta)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Area dataKey="score" stroke="var(--accent)" fill="url(#quality)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <Kicker>Most common blindspots</Kicker>
        <div className="wo-chart small">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={blindspots}>
              <CartesianGrid stroke="var(--line-soft)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--meta)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--meta)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <Kicker>Category strength</Kicker>
        {categoryRows.map((row) => (
          <Meter key={row.category} label={row.category} value={row.score} />
        ))}
      </Card>
      {!compact ? (
        <Card>
          <Kicker>Repeated mistake patterns</Kicker>
          <ul className="wo-list">
            <li>Urgency compresses your option set before client or renewal decisions.</li>
            <li>You improve when you define what would prove the decision wrong.</li>
            <li>
              Confidence is strongest in product sequencing and weakest in emotional aftermath
              estimates.
            </li>
          </ul>
        </Card>
      ) : null}
    </div>
  );
}

function countBlindspots(decisions: Decision[]) {
  const counts = new Map<string, number>();
  decisions.forEach((d) =>
    d.blindspots.forEach((b) => counts.set(b.name, (counts.get(b.name) ?? 0) + 1)),
  );
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function DecisionProfile({ decisions }: { decisions: Decision[] }) {
  const reviewed = decisions.filter((d) => d.status === "reviewed");
  const patterns = [
    [
      "Tends to underestimate timeline drag",
      "medium",
      "Appears in product and hiring reviews where the work after the decision took longer than expected.",
    ],
    [
      "Improves when disconfirming evidence is named",
      "high",
      "Higher quality scores cluster around decisions with a clear wrong-if condition.",
    ],
    [
      "Can overvalue immediate relief",
      "medium",
      "High-emotion decisions show more urgency language and fewer experiments.",
    ],
    [
      "Strong at career and client tradeoff reasoning",
      "medium",
      "Reviewed outcomes show underconfidence more often than overconfidence in these categories.",
    ],
  ];
  return (
    <div className="wo-layout">
      <Card wide>
        <Kicker>Living profile</Kicker>
        <h2>Observed patterns, not permanent traits.</h2>
        <p>
          WorkOutput gets more useful as committed decisions become reviewed outcomes. Pattern
          confidence rises only when the evidence repeats.
        </p>
        <div className="wo-profile-list">
          {patterns.map(([title, confidence, why]) => (
            <div key={title} className="wo-profile">
              <div>
                <strong>{title}</strong>
                <span>{confidence} confidence</span>
              </div>
              <p>{why}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <Kicker>Calibration</Kicker>
        <div className="wo-score">{reviewed.length ? "B+" : "—"}</div>
        <p>
          Confidence is slightly undercalled in conflict-heavy decisions and slightly overcalled in
          timeline estimates.
        </p>
      </Card>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="wo-stack">
      <Card wide>
        <Kicker>Experimental fork</Kicker>
        <h2>Judgment OS is isolated from the production app.</h2>
        <p>
          This branch uses local experimental records in the browser. The password gate remains in
          middleware. Server routes return graceful JSON errors when paid/auth infrastructure is not
          configured.
        </p>
      </Card>
      <Card>
        <Kicker>Graceful error posture</Kicker>
        <ul className="wo-list">
          <li>No model call is required to view or test the redesign.</li>
          <li>Decision capture, scoring, blindspots, replay, and outcomes work locally.</li>
          <li>Production secrets are not required for this preview branch.</li>
        </ul>
      </Card>
    </div>
  );
}
