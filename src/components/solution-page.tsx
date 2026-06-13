import { ArrowRight, Check } from "lucide-react";
import { ContactForm, FinalConsultationCTA, Footer, Nav, SectionEyebrow } from "@/components/site";
import { relatedSolutions, type SolutionPageContent } from "@/content/solutions";

export function SolutionPage({ solution }: { solution: SolutionPageContent }) {
  const Icon = solution.icon;

  return (
    <div className="min-h-screen bg-background text-foreground premium-scroll">
      <Nav />
      <main>
        <section className="section-shell section-hero relative overflow-hidden border-b border-border/70">
          <div className="bg-grid parallax-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
          <div className="parallax-orb parallax-orb-one" />
          <div className="parallax-orb parallax-orb-two" />
          <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-20 md:pt-28 md:pb-28">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_0.55fr] lg:items-center">
              <div className="max-w-3xl animate-fade-up">
                <SectionEyebrow>Solutions</SectionEyebrow>
                <h1 className="mt-5 text-balance text-[44px] font-semibold leading-[1.05] tracking-tight md:text-[66px]">
                  {solution.title}
                </h1>
                <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-muted-foreground md:text-[18px]">
                  {solution.intro.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <div className="mt-9">
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-3 text-[14px] font-medium text-background shadow-[var(--shadow-lift)] transition-transform hover:scale-[1.02]"
                  >
                    Schedule a Consultation
                    <ArrowRight className="size-4" />
                  </a>
                </div>
              </div>

              <div className="motion-depth relative rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-lift)]">
                <div
                  className="absolute inset-x-0 top-0 h-px"
                  style={{ background: "var(--gradient-brand)" }}
                />
                <div
                  className="grid size-12 place-items-center rounded-xl border border-border"
                  style={{
                    background: "linear-gradient(180deg, var(--card), oklch(0.97 0.02 260))",
                  }}
                >
                  <Icon className="size-6 text-primary" strokeWidth={1.75} />
                </div>
                <div className="mt-8 space-y-4">
                  {solution.sections.slice(0, 3).map((section) => (
                    <a
                      key={section.title}
                      href={`#${section.title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, "")}`}
                      className="group flex items-center justify-between rounded-lg border border-border/70 bg-muted/35 px-4 py-3 text-[13.5px] font-medium transition-colors hover:bg-muted/60"
                    >
                      {section.title}
                      <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell section-solutions py-20 md:py-28">
          <div className="mx-auto max-w-5xl px-6">
            <div className="space-y-14">
              {solution.sections.map((section) => (
                <article
                  key={section.title}
                  id={section.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "")}
                  className="reveal-card rounded-2xl border border-border bg-card p-7 shadow-sm md:p-9"
                >
                  <h2 className="text-[28px] font-semibold leading-tight tracking-tight md:text-[36px]">
                    {section.title}
                  </h2>
                  {section.body && (
                    <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
                      {section.body}
                    </p>
                  )}
                  {section.bullets && (
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {section.bullets.map((bullet) => (
                        <div
                          key={bullet}
                          className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/35 px-4 py-3 text-[14px] text-foreground"
                        >
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {section.cards && (
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      {section.cards.map((card) => (
                        <div
                          key={card.title}
                          className="rounded-xl border border-border/70 bg-background p-5 shadow-sm"
                        >
                          <h3 className="text-[17px] font-semibold tracking-tight">{card.title}</h3>
                          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                            {card.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>

            <div className="mt-16 rounded-2xl border border-border bg-card p-7 shadow-sm md:p-8">
              <h2 className="text-[24px] font-semibold tracking-tight">Related Solutions</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {relatedSolutions.map((related) => (
                  <a
                    key={related.href}
                    href={related.href}
                    className="group flex items-center justify-between rounded-lg border border-border/70 bg-muted/35 px-4 py-3 text-[14px] font-medium transition-colors hover:bg-muted/60"
                  >
                    {related.label}
                    <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <FinalConsultationCTA />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
