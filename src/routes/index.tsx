import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Workflow,
  FileText,
  Settings2,
  Plug,
  BarChart3,
  Check,
  Building2,
  Stethoscope,
  Landmark,
  MessageSquareText,
  Users,
  Briefcase,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WalelAI — AI Systems That Make Your Business Run Better" },
      {
        name: "description",
        content:
          "WalelAI helps businesses automate workflows, improve operations, and implement practical AI solutions that save time, reduce manual work, and increase productivity.",
      },
      { property: "og:title", content: "WalelAI — Practical AI for Modern Operations" },
      {
        property: "og:description",
        content:
          "Workflow automation, AI assistants, document intelligence, and custom integrations for modern enterprises.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground premium-scroll">
      <Nav />
      <Hero />
      <TrustBar />
      <Solutions />
      <HowItWorks />
      <Industries />
      <ValueSection />
      <CaseStudies />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ---------- NAV ---------- */
function Nav() {
  const links = ["Solutions", "Industries", "How it works", "Outcomes"];
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center">
          <Logo className="h-8 w-auto sm:h-9" />
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="#contact"
            className="hidden text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-foreground md:inline"
          >
            Sign in
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-transform hover:scale-[1.02]"
          >
            Schedule a Consultation
            <ArrowRight className="size-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
}

function Logo({
  className = "h-9 w-auto",
  variant = "wordmark",
}: {
  className?: string;
  variant?: "wordmark" | "full";
}) {
  const source =
    variant === "full" ? "/assets/walelai-logo-full.png" : "/assets/walelai-logo-wordmark.png";
  const dimensions =
    variant === "full" ? { width: 1080, height: 700 } : { width: 1040, height: 240 };

  return (
    <img
      src={source}
      alt="WalelAI"
      className={`block shrink-0 object-contain ${className}`}
      width={dimensions.width}
      height={dimensions.height}
      decoding="async"
    />
  );
}

/* ---------- HERO ---------- */
function Hero() {
  return (
    <section className="section-shell section-hero relative overflow-hidden">
      <div className="bg-grid parallax-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="parallax-orb parallax-orb-one" />
      <div className="parallax-orb parallax-orb-two" />
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-[12px] font-medium text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" />
            Practical AI for modern operations
          </div>
          <h1 className="mt-6 text-balance text-[44px] font-semibold leading-[1.05] tracking-tight text-foreground md:text-[68px]">
            AI Systems That Make Your{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-brand)" }}
            >
              Business Run Better
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-[17px] leading-relaxed text-muted-foreground md:text-[18px]">
            WalelAI helps businesses automate workflows, improve operations, and implement practical
            AI solutions that save time, reduce manual work, and increase productivity.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-3 text-[14px] font-medium text-background shadow-[var(--shadow-lift)] transition-transform hover:scale-[1.02]"
            >
              Schedule a Consultation
              <ArrowRight className="size-4" />
            </a>
            <a
              href="#solutions"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-5 py-3 text-[14px] font-medium text-foreground backdrop-blur transition-colors hover:bg-background"
            >
              See Solutions
            </a>
          </div>
        </div>

        <div className="motion-depth relative mx-auto mt-16 max-w-6xl animate-fade-up [animation-delay:120ms]">
          <DashboardVisual />
        </div>
      </div>
    </section>
  );
}

/* ---------- DASHBOARD MOCK ---------- */
function DashboardVisual() {
  return (
    <div
      className="relative rounded-2xl border border-border/80 bg-card p-3 shadow-[var(--shadow-lift)]"
      style={{ boxShadow: "var(--shadow-lift), var(--shadow-glow)" }}
    >
      <div className="overflow-hidden rounded-xl border border-border/60 bg-background">
        {/* window chrome */}
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[oklch(0.85_0.08_30)]" />
            <span className="size-2.5 rounded-full bg-[oklch(0.88_0.1_85)]" />
            <span className="size-2.5 rounded-full bg-[oklch(0.82_0.13_145)]" />
          </div>
          <div className="text-[11px] font-medium text-muted-foreground">
            app.walelai.com / operations
          </div>
          <div className="text-[11px] text-muted-foreground">Live</div>
        </div>

        <div className="grid grid-cols-12 gap-3 p-4 md:p-5">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-3">
            <div className="space-y-1">
              {[
                { label: "Overview", active: true },
                { label: "Workflows" },
                { label: "Assistants" },
                { label: "Documents" },
                { label: "Integrations" },
                { label: "Insights" },
              ].map((i) => (
                <div
                  key={i.label}
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-[12.5px] ${
                    i.active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground"
                  }`}
                >
                  <span>{i.label}</span>
                  {i.active && <span className="size-1.5 rounded-full bg-primary" />}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg border border-border/70 bg-muted/40 p-3">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Automation health
              </div>
              <div className="mt-2 text-[20px] font-semibold tracking-tight">98.6%</div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border/60">
                <div
                  className="h-full w-[92%] rounded-full"
                  style={{ background: "var(--gradient-brand)" }}
                />
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="col-span-12 space-y-3 md:col-span-9">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <StatCard label="Tasks automated" value="42,318" delta="+18.4%" />
              <StatCard label="Avg. response time" value="1.2s" delta="−63%" positive />
              <StatCard label="Hours saved / wk" value="284" delta="+22%" />
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              {/* Chart */}
              <div className="rounded-lg border border-border/70 bg-card p-4 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[12px] font-medium text-muted-foreground">
                      Workflow throughput
                    </div>
                    <div className="mt-1 text-[16px] font-semibold tracking-tight">
                      Last 30 days
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="size-2 rounded-sm bg-primary" /> Automated
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="size-2 rounded-sm bg-[var(--cyan)]" /> Manual
                    </span>
                  </div>
                </div>
                <ChartBars />
              </div>

              {/* Pipeline */}
              <div className="rounded-lg border border-border/70 bg-card p-4">
                <div className="text-[12px] font-medium text-muted-foreground">Active pipeline</div>
                <div className="mt-3 space-y-2.5">
                  {[
                    { label: "Intake → Triage", pct: 96, tag: "AI routing" },
                    { label: "Document parse", pct: 88, tag: "OCR + NER" },
                    { label: "CRM sync", pct: 74, tag: "Salesforce" },
                    { label: "Approval", pct: 61, tag: "Slack" },
                  ].map((r) => (
                    <div key={r.label}>
                      <div className="flex items-center justify-between text-[11.5px]">
                        <span className="font-medium">{r.label}</span>
                        <span className="text-muted-foreground">{r.tag}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border/60">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${r.pct}%`,
                            background: "var(--gradient-cyan)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border/70 bg-card">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
                <div className="text-[12.5px] font-semibold">Recent automations</div>
                <div className="text-[11px] text-muted-foreground">Live feed</div>
              </div>
              <div className="divide-y divide-border/60">
                {[
                  ["Invoice #A-3421 processed", "Document intelligence", "12s"],
                  ["Support ticket #8842 routed → Tier 2", "AI assistant", "27s"],
                  ["Lead enriched & synced to CRM", "Workflow", "1m"],
                  ["Weekly ops summary generated", "Insights", "3m"],
                ].map(([title, tag, time]) => (
                  <div
                    key={title}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-2.5 text-[12.5px]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Check className="size-3.5 text-primary" />
                      <span className="truncate">{title}</span>
                    </div>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground">
                      {tag}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* floating badge */}
      <div
        className="absolute -left-4 top-24 hidden rounded-xl border border-border/70 bg-card p-3 shadow-[var(--shadow-soft)] md:block"
        style={{ animation: "float-soft 6s ease-in-out infinite" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="grid size-8 place-items-center rounded-lg"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Workflow className="size-4 text-background" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground">AI suggestion</div>
            <div className="text-[12.5px] font-medium">Auto-route 14 tickets</div>
          </div>
        </div>
      </div>

      <div
        className="absolute -right-4 bottom-16 hidden rounded-xl border border-border/70 bg-card p-3 shadow-[var(--shadow-soft)] md:block"
        style={{ animation: "float-soft 7s ease-in-out infinite", animationDelay: "1.5s" }}
      >
        <div className="text-[11px] text-muted-foreground">Productivity</div>
        <div className="mt-0.5 flex items-baseline gap-1">
          <span className="text-[18px] font-semibold">+38%</span>
          <span className="text-[11px] text-primary">this quarter</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-card p-4">
      <div className="text-[11.5px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline justify-between">
        <span className="text-[22px] font-semibold tracking-tight">{value}</span>
        <span
          className={`text-[11.5px] font-medium ${positive ? "text-emerald-600" : "text-primary"}`}
        >
          {delta}
        </span>
      </div>
    </div>
  );
}

function ChartBars() {
  const data = [
    [38, 12],
    [44, 14],
    [40, 18],
    [52, 16],
    [48, 12],
    [60, 14],
    [55, 10],
    [68, 14],
    [62, 10],
    [74, 12],
    [70, 8],
    [82, 10],
    [78, 8],
    [88, 10],
    [84, 8],
    [92, 10],
    [86, 6],
    [95, 8],
  ];
  const max = 110;
  return (
    <div className="mt-4 flex h-32 items-end gap-1.5">
      {data.map(([a, m], i) => (
        <div key={i} className="flex flex-1 flex-col items-stretch gap-0.5">
          <div
            className="rounded-sm"
            style={{
              height: `${(m / max) * 100}%`,
              background: "color-mix(in oklch, var(--cyan) 70%, transparent)",
            }}
          />
          <div
            className="rounded-sm"
            style={{
              height: `${(a / max) * 100}%`,
              background: "var(--gradient-brand)",
              animation: `pulse-bar 4s ease-in-out ${i * 0.08}s infinite`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ---------- TRUST ---------- */
function TrustBar() {
  const items = [
    "Workflow Automation",
    "AI Assistants",
    "Operations Optimization",
    "Business Intelligence",
    "Custom Integrations",
    "Process Improvement",
  ];
  return (
    <section className="section-trust premium-divider border-y border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="text-center text-[11.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Capabilities trusted by operations leaders
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-center md:grid-cols-3 lg:grid-cols-6">
          {items.map((i) => (
            <div key={i} className="text-[13.5px] font-semibold tracking-tight text-foreground/80">
              {i}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- SOLUTIONS ---------- */
function Solutions() {
  const items = [
    {
      icon: Workflow,
      title: "Workflow Automation",
      desc: "Automate repetitive business processes and reduce manual effort.",
    },
    {
      icon: MessageSquareText,
      title: "AI Assistants",
      desc: "Deploy intelligent assistants for customers, employees, and operations.",
    },
    {
      icon: FileText,
      title: "Document Intelligence",
      desc: "Transform documents, forms, and knowledge into actionable workflows.",
    },
    {
      icon: Settings2,
      title: "Business Operations",
      desc: "Identify inefficiencies and improve how work gets done.",
    },
    {
      icon: Plug,
      title: "Custom Integrations",
      desc: "Connect AI systems with your existing software stack.",
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      desc: "Gain visibility into performance and decision-making.",
    },
  ];
  return (
    <section id="solutions" className="section-shell section-solutions relative py-24 md:py-32">
      <div className="section-drift section-drift-right" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <SectionEyebrow>Solutions</SectionEyebrow>
          <h2 className="mt-3 text-[36px] font-semibold leading-[1.1] tracking-tight md:text-[48px]">
            Practical AI solutions for modern organizations
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
            Each engagement combines strategy, engineering, and operational expertise — so AI
            actually ships, integrates, and produces measurable outcomes.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="reveal-card group relative bg-card p-8 transition-colors hover:bg-muted/30"
            >
              <div
                className="grid size-10 place-items-center rounded-lg border border-border"
                style={{ background: "linear-gradient(180deg, var(--card), oklch(0.97 0.02 260))" }}
              >
                <Icon className="size-5 text-primary" strokeWidth={1.75} />
              </div>
              <h3 className="mt-5 text-[18px] font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{desc}</p>
              <ArrowUpRight className="absolute right-6 top-6 size-4 text-muted-foreground/40 transition-all group-hover:right-5 group-hover:top-5 group-hover:text-primary" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- HOW IT WORKS ---------- */
function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Discover",
      desc: "Understand current workflows and identify the highest-leverage opportunities.",
    },
    {
      n: "02",
      title: "Design",
      desc: "Build a practical AI strategy tailored to the business and its constraints.",
    },
    {
      n: "03",
      title: "Deploy",
      desc: "Launch solutions that create measurable operational improvements.",
    },
  ];
  return (
    <section
      id="how-it-works"
      className="section-shell section-process relative border-t border-border py-24 md:py-32"
    >
      <div className="section-drift section-drift-left" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <SectionEyebrow>How it works</SectionEyebrow>
          <h2 className="mt-3 text-[36px] font-semibold leading-[1.1] tracking-tight md:text-[48px]">
            A clear path from idea to deployed system
          </h2>
        </div>

        <div className="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div
            className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px md:block"
            style={{
              background:
                "linear-gradient(90deg, transparent, oklch(0.58 0.21 264 / 0.4), transparent)",
            }}
          />
          {steps.map((s) => (
            <div
              key={s.n}
              className="reveal-card card-surface relative rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-center gap-3">
                <div
                  className="grid size-9 place-items-center rounded-full text-[12px] font-semibold text-background"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  {s.n}
                </div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  Phase
                </div>
              </div>
              <h3 className="mt-6 text-[22px] font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- INDUSTRIES ---------- */
function Industries() {
  const items = [
    { icon: Briefcase, name: "Professional Services" },
    { icon: Stethoscope, name: "Healthcare" },
    { icon: Landmark, name: "Financial Services" },
    { icon: Settings2, name: "Technology" },
    { icon: Users, name: "Operations Teams" },
    { icon: Building2, name: "Small & Mid-Sized Businesses" },
  ];
  return (
    <section
      id="industries"
      className="section-shell section-industries border-t border-border py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <SectionEyebrow>Industries</SectionEyebrow>
            <h2 className="mt-3 text-[36px] font-semibold leading-[1.1] tracking-tight md:text-[48px]">
              Built for teams that run real operations
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
            From clinical workflows to financial back-office, WalelAI designs systems that respect
            the realities of regulated, high-volume environments.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
          {items.map(({ icon: Icon, name }) => (
            <div
              key={name}
              className="reveal-card card-surface group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-soft)]"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted">
                <Icon className="size-5 text-foreground/70" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 text-[14.5px] font-semibold tracking-tight">{name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- VALUE (DARK) ---------- */
function ValueSection() {
  const metrics = [
    { v: "−45%", l: "Reduce manual work", d: "Repetitive tasks routed through automated systems." },
    { v: "10×", l: "Improve response times", d: "AI-assisted triage and intelligent routing." },
    {
      v: "+38%",
      l: "Increase team productivity",
      d: "Knowledge and tooling at the point of work.",
    },
    { v: "∞", l: "Scale operations efficiently", d: "Systems that grow without linear headcount." },
  ];
  return (
    <section className="section-shell section-value relative overflow-hidden bg-[var(--navy-deep)] py-24 text-[oklch(0.96_0.01_260)] md:py-32">
      <div className="bg-grid-dark absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      <div
        className="parallax-layer pointer-events-none absolute -top-40 left-1/2 size-[700px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--gradient-brand)" }}
      />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="max-w-3xl">
          <SectionEyebrow dark>Outcomes</SectionEyebrow>
          <h2 className="mt-3 text-[36px] font-semibold leading-[1.1] tracking-tight md:text-[52px]">
            AI that delivers real business outcomes
          </h2>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[oklch(0.78_0.02_260)]">
            WalelAI engagements are measured by impact, not output. Every system we deploy ties to
            an operational metric the business already cares about.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.l} className="reveal-card bg-[var(--navy-deep)] p-7">
              <div
                className="bg-clip-text text-[44px] font-semibold tracking-tight text-transparent"
                style={{ backgroundImage: "var(--gradient-cyan)" }}
              >
                {m.v}
              </div>
              <div className="mt-2 text-[15px] font-semibold tracking-tight">{m.l}</div>
              <div className="mt-1.5 text-[13px] leading-relaxed text-[oklch(0.7_0.02_260)]">
                {m.d}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- CASE STUDIES ---------- */
function CaseStudies() {
  const items = [
    {
      tag: "Customer experience",
      title: "Customer Support Automation",
      desc: "Reduced response times and improved customer experience through AI-assisted triage and routing.",
      stat: "−63%",
      statLabel: "first response",
    },
    {
      tag: "Back-office",
      title: "Document Processing",
      desc: "Eliminated repetitive administrative tasks with intelligent extraction and downstream workflows.",
      stat: "12k+",
      statLabel: "documents / mo",
    },
    {
      tag: "Knowledge",
      title: "Internal Knowledge Assistant",
      desc: "Made company knowledge instantly accessible to every team across product, sales, and ops.",
      stat: "92%",
      statLabel: "first-try answers",
    },
  ];
  return (
    <section
      id="outcomes"
      className="section-shell section-outcomes border-t border-border py-24 md:py-32"
    >
      <div className="section-drift section-drift-right" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <SectionEyebrow>Selected work</SectionEyebrow>
          <h2 className="mt-3 text-[36px] font-semibold leading-[1.1] tracking-tight md:text-[48px]">
            Outcomes we've delivered
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.map((it) => (
            <article
              key={it.title}
              className="reveal-card card-surface group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
            >
              <div
                className="relative h-40 overflow-hidden border-b border-border"
                style={{
                  background: "linear-gradient(135deg, oklch(0.97 0.02 260), oklch(0.93 0.05 265))",
                }}
              >
                <div className="bg-grid absolute inset-0 opacity-60" />
                <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                  <span className="rounded-full border border-border bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur">
                    {it.tag}
                  </span>
                  <div className="text-right">
                    <div
                      className="bg-clip-text text-[28px] font-semibold tracking-tight text-transparent"
                      style={{ backgroundImage: "var(--gradient-brand)" }}
                    >
                      {it.stat}
                    </div>
                    <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
                      {it.statLabel}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-[18px] font-semibold tracking-tight">{it.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{it.desc}</p>
                <div className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary">
                  Read the story
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FINAL CTA ---------- */
function FinalCTA() {
  return (
    <section id="contact" className="section-shell section-contact bg-background py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div
          className="motion-depth relative overflow-hidden rounded-3xl border border-border p-10 md:p-16"
          style={{
            background:
              "radial-gradient(800px 400px at 20% 0%, oklch(0.94 0.06 260), transparent 60%), linear-gradient(180deg, var(--card), oklch(0.98 0.01 260))",
          }}
        >
          <div
            className="parallax-layer pointer-events-none absolute -right-20 -top-20 size-[420px] rounded-full opacity-30 blur-3xl"
            style={{ background: "var(--gradient-brand)" }}
          />
          <div className="relative max-w-2xl">
            <SectionEyebrow>Get started</SectionEyebrow>
            <h2 className="mt-3 text-[40px] font-semibold leading-[1.05] tracking-tight md:text-[56px]">
              Ready to put AI to work?
            </h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-muted-foreground">
              Discover how WalelAI can help your organization automate workflows, improve
              operations, and unlock measurable value from AI.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-3 text-[14px] font-medium text-background shadow-[var(--shadow-lift)] transition-transform hover:scale-[1.02]"
              >
                Schedule a Consultation
                <ArrowRight className="size-4" />
              </a>
              <a
                href="#solutions"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-5 py-3 text-[14px] font-medium text-foreground transition-colors hover:bg-muted/50"
              >
                See Solutions
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- FOOTER ---------- */
function Footer() {
  const cols = [
    {
      title: "Solutions",
      links: [
        "Workflow Automation",
        "AI Assistants",
        "Document Intelligence",
        "Custom Integrations",
      ],
    },
    {
      title: "Industries",
      links: ["Professional Services", "Healthcare", "Financial Services", "Technology"],
    },
    { title: "About", links: ["Company", "Approach", "Careers", "Press"] },
    { title: "Contact", links: ["Schedule a Consultation", "Support", "Partners", "Security"] },
  ];
  return (
    <footer className="section-footer border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <div className="flex items-center">
              <Logo className="h-24 w-auto sm:h-28" variant="full" />
            </div>
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-muted-foreground">
              AI Systems. Better Operations. Real Results.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-[12px] font-semibold uppercase tracking-wider text-foreground">
                {c.title}
              </div>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-[12.5px] text-muted-foreground md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} WalelAI, Inc. All rights reserved.</div>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <a href="#" className="hover:text-foreground">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- SHARED ---------- */
function SectionEyebrow({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] ${
        dark
          ? "border-white/15 bg-white/5 text-[oklch(0.85_0.04_260)]"
          : "border-border bg-muted/60 text-muted-foreground"
      }`}
    >
      <span className="size-1.5 rounded-full" style={{ background: "var(--gradient-brand)" }} />
      {children}
    </div>
  );
}
