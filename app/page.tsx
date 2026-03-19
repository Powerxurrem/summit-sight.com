export default function SummitSightPersonalSite() {
  const badges = [
    "Applied AI",
    "Backend Systems",
    "Production SaaS",
    "Vestaryn",
  ];

  const pillars = [
    {
      title: "Reliable systems first",
      text: "I build production-grade backend systems with strong architecture, clear interfaces, and calm handling of failure cases.",
    },
    {
      title: "AI that works in practice",
      text: "My focus is not just generating output with AI, but integrating it into real workflows where validation, structure, and reliability matter.",
    },
    {
      title: "Builder mindset",
      text: "From payment flows and export pipelines to AI-driven development tooling, I like shipping systems that are useful, explainable, and maintainable.",
    },
  ];

  const projects = [
    {
      name: "Vestaryn",
      subtitle: "AI development chamber",
      description:
        "An AI development environment where code changes are proposed, verified, and only then applied. Built around structured execution instead of blind mutation.",
      bullets: [
        "Proposal → pre-verify → repair → apply → verify loop",
        "Repository-aware workflows instead of isolated snippets",
        "Focused on making AI-generated code safer in real systems",
      ],
      href: "/vestaryn",
    },
    {
      name: "Soundscape",
      subtitle: "Production SaaS + mobile companion",
      description:
        "A live SaaS platform with Stripe payments, idempotent webhook handling, entitlement logic, and supporting mobile applications.",
      bullets: [
        "Production payment and webhook architecture",
        "Structured export and workflow pipelines",
        "Shipped as a real product, not just a prototype",
      ],
      href: "https://soundscape.run",
       external: true,
    },
  ];

  return (
    
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.12),transparent_30%),linear-gradient(to_bottom,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />

      <main className="relative mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
        <header className="flex flex-col gap-6 rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-8">
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-100/90">
              Summit Sight
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
              Deventer, Netherlands
            </span>
          </div>

          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
            <div>
              <p className="mb-4 text-sm uppercase tracking-[0.28em] text-white/40">
                Romano Kreugel
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white/95 sm:text-5xl md:text-6xl">
                Applied AI and backend systems builder focused on reliable, real-world software.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
                I build production SaaS systems, structured AI workflows, and tools that move beyond demos into practical use. Most recently, I’m building Vestaryn.
              </p>
              <p className="mt-4 text-sm text-white/55">
                Systems built for real workflows — not demos, not prototypes.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#work"
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90"
                >
                  View work
                </a>
                <a
                  href="#contact"
                  className="rounded-2xl border border-white/15 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.07]"
                >
                  Contact
                </a>
              </div>

              <p className="mt-3 text-xs text-white/45">
                Available for building production AI systems and backend platforms.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-sm text-white/75"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3 rounded-[28px] border border-white/10 bg-black/30 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/40">Current focus</p>
                <p className="mt-2 text-xl font-medium text-white/90">Vestaryn</p>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Building an AI development chamber where changes are proposed, verified, and only then applied.
                </p>
                <p className="mt-2 text-xs text-white/45">
                  AI that proposes → verifies → then applies.
                </p>
              </div>
              <div className="grid gap-2 text-sm text-white/70">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  Verification before apply
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  Structured execution over blind mutation
                </div>
              </div>
              <a
                href="/vestaryn"
                className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100/90 transition hover:bg-cyan-400/15"
              >
                Explore Vestaryn
              </a>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.08] hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
            >
              <h2 className="text-lg font-medium text-white/90">{pillar.title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/60">{pillar.text}</p>
            </div>
          ))}
        </section>

        <section
          id="work"
          className="mt-8 rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl md:p-8"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Selected work</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white/92 md:text-3xl">
                Systems built for practical use, not just screenshots.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-white/55">
              I’m most interested in systems where architecture, reliability, and execution quality matter more than surface-level polish.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <a
                key={project.name}
                href={project.href}
                className="rounded-[28px] border border-white/10 bg-black/30 p-6 transition hover:-translate-y-1 hover:bg-white/[0.05] hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
              >
                <p className="text-sm uppercase tracking-[0.18em] text-white/35">{project.subtitle}</p>
                <h3 className="mt-2 text-2xl font-semibold text-white/92">{project.name}</h3>
                <p className="mt-4 text-sm leading-6 text-white/60">{project.description}</p>
                <div className="mt-5 space-y-2">
                  {project.bullets.map((bullet) => (
                    <div
                      key={bullet}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/72"
                    >
                      {bullet}
                    </div>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl md:p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">Approach</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white/92 md:text-3xl">
              Calm architecture, structured workflows, real output.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
              I like solving problems where systems need to stay understandable and dependable. That includes backend architecture, APIs, workflow orchestration, and AI integrations that must behave consistently under pressure.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-black/30 p-5 transition hover:bg-white/[0.05]">
                <p className="text-sm font-medium text-white/88">Backend systems</p>
                <p className="mt-2 text-sm leading-6 text-white/58">
                  APIs, webhook flows, structured export pipelines, entitlement logic, and production reliability.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/30 p-5 transition hover:bg-white/[0.05]">
                <p className="text-sm font-medium text-white/88">AI integration</p>
                <p className="mt-2 text-sm leading-6 text-white/58">
                  LLM workflows, controlled execution, validation loops, and system-level thinking around generated output.
                </p>
              </div>
            </div>
          </div>

          <div
            id="contact"
            className="rounded-[32px] border border-white/10 bg-black/30 p-6 backdrop-blur-xl md:p-8"
          >
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">Contact</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white/92">Let’s connect.</h2>
            <p className="mt-4 text-sm leading-7 text-white/60">
              Especially if you’re working on applied AI, backend systems, SaaS products, or opportunities where reliability and practical execution matter.
            </p>
            <div className="mt-6 space-y-3 text-sm text-white/75">
              <a
                href="mailto:summit-sight@hotmail.com"
                className="block rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.07]"
              >
                summit-sight@hotmail.com
              </a>
              <a
                href="https://vestaryn.dev"
                className="block rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.07]"
              >
                vestaryn.dev
              </a>
              <a
                href="https://github.com/Powerxurrem"
                className="block rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.07]"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/romanokreugel/"
                className="block rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.07]"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
