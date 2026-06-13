import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";

export function Nav() {
  const links = [
    { label: "Solutions", href: "/#solutions" },
    { label: "Industries", href: "/#industries" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Outcomes", href: "/#outcomes" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="/" className="flex min-w-0 items-center">
          <Logo className="h-9 w-auto sm:h-11" variant="full" />
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
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

export function Logo({
  className = "h-9 w-auto",
  variant = "wordmark",
}: {
  className?: string;
  variant?: "wordmark" | "full";
}) {
  const source = variant === "full" ? "/walelai-logo-lockup.png" : "/walelai-logo-wordmark.png";
  const dimensions =
    variant === "full" ? { width: 1101, height: 721 } : { width: 1077, height: 209 };

  return (
    <img
      src={source}
      alt="WalelAI logo"
      className={`block shrink-0 object-contain ${className}`}
      width={dimensions.width}
      height={dimensions.height}
      decoding="async"
    />
  );
}

export function FinalConsultationCTA() {
  return (
    <section className="section-shell section-contact bg-background py-24 md:py-32">
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
              Ready to Explore AI for Your Organization?
            </h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-muted-foreground">
              Schedule a consultation and we&apos;ll identify practical opportunities to improve
              efficiency, automate workflows, and create measurable business value.
            </p>
            <div className="mt-8">
              <a
                href="#contact"
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-3 text-[14px] font-medium text-background shadow-[var(--shadow-lift)] transition-transform hover:scale-[1.02]"
              >
                Schedule a Consultation
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.currentTarget.reset();
    setSubmitted(true);
  }

  return (
    <section
      id="contact"
      className="section-shell relative overflow-hidden border-y border-border/70 bg-muted/35 py-24 md:py-32"
    >
      <div
        className="parallax-layer pointer-events-none absolute -left-32 top-16 size-[360px] rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gradient-brand)" }}
      />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="motion-depth max-w-xl">
          <SectionEyebrow>Consultation</SectionEyebrow>
          <h2 className="mt-4 text-[38px] font-semibold leading-[1.05] tracking-tight md:text-[54px]">
            Schedule a Consultation
          </h2>
          <p className="mt-5 text-[16.5px] leading-relaxed text-muted-foreground">
            Tell us what you want to improve, and we&apos;ll follow up with a practical next step.
          </p>
          <div className="mt-8 grid gap-3 text-[13.5px] text-muted-foreground sm:grid-cols-2">
            {["Workflow gaps", "Manual handoffs", "AI assistants", "Operations reporting"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-lg border border-border/70 bg-background/70 px-4 py-3 shadow-sm backdrop-blur"
                >
                  {item}
                </div>
              ),
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-lift)] md:p-8"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: "var(--gradient-brand)" }}
          />
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Name" name="name" placeholder="Your name" required />
            <FormField
              label="Work Email"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
            />
            <FormField label="Company" name="company" placeholder="Company name" required />
            <label className="grid gap-2 text-[13px] font-medium text-foreground">
              Budget / timeline optional
              <select
                name="timeline"
                className="h-11 rounded-lg border border-input bg-background px-3 text-[14px] text-foreground outline-none transition-colors focus:border-primary"
                defaultValue=""
              >
                <option value="" disabled>
                  Select timing
                </option>
                <option>Just exploring</option>
                <option>This month</option>
                <option>30&ndash;60 days</option>
                <option>Urgent</option>
              </select>
            </label>
          </div>

          <label className="mt-5 grid gap-2 text-[13px] font-medium text-foreground">
            What do you want to improve?
            <textarea
              name="improvement"
              required
              rows={5}
              placeholder="Tell us about the workflow, process, or operational bottleneck you want to improve."
              className="resize-none rounded-lg border border-input bg-background px-3 py-3 text-[14px] leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
          </label>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-foreground px-5 py-3 text-[14px] font-medium text-background shadow-[var(--shadow-lift)] transition-transform hover:scale-[1.02]"
            >
              Request Consultation
              <ArrowRight className="size-4" />
            </button>
            {submitted && (
              <div
                role="status"
                className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[13px] font-medium text-primary"
              >
                Thanks &mdash; your request has been captured. We&apos;ll follow up shortly.
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

function FormField({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-[13px] font-medium text-foreground">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="h-11 rounded-lg border border-input bg-background px-3 text-[14px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
      />
    </label>
  );
}

export function Footer() {
  const cols = [
    {
      title: "Solutions",
      links: [
        { label: "Workflow Automation", href: "/solutions/workflow-automation" },
        { label: "AI Assistants", href: "/solutions/ai-assistants" },
        { label: "Document Intelligence", href: "/solutions/document-intelligence" },
        { label: "Custom Integrations", href: "/#solutions" },
      ],
    },
    {
      title: "Industries",
      links: [
        { label: "Professional Services", href: "/#industries" },
        { label: "Healthcare", href: "/#industries" },
        { label: "Financial Services", href: "/#industries" },
        { label: "Technology", href: "/#industries" },
      ],
    },
    {
      title: "About",
      links: [
        { label: "Company", href: "/" },
        { label: "Approach", href: "/#how-it-works" },
        { label: "Careers", href: "/" },
        { label: "Press", href: "/" },
      ],
    },
    {
      title: "Contact",
      links: [
        { label: "Schedule a Consultation", href: "#contact" },
        { label: "Support", href: "#contact" },
        { label: "Partners", href: "#contact" },
        { label: "Security", href: "#contact" },
      ],
    },
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
                {c.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[13.5px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
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

export function SectionEyebrow({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
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
