export default function VestarynPage() {
  const flow = [
    {
      step: "01",
      title: "Define the goal",
      text: "Start with a plain-language request. Vestaryn turns it into a structured plan instead of jumping straight into uncontrolled code output.",
      image: "/vestaryn-goal-plan.png",
      alt: "Vestaryn goal plan screen",
    },
    {
      step: "02",
      title: "Approve before execution",
      text: "The system asks for approval before moving forward. This keeps the user in control of scope and direction.",
      image: "/vestaryn-approve-plan.png",
      alt: "Vestaryn approve plan screen",
    },
    {
      step: "03",
      title: "Execute step by step",
      text: "Work is broken into clear phases like scaffold, styling, and script changes, instead of one large opaque mutation.",
      image: "/vestaryn-step-execution.png",
      alt: "Vestaryn step execution screen",
    },
    {
      step: "04",
      title: "Review staged changes",
      text: "Every proposed repository change is visible before apply, including previews and file-level context.",
      image: "/vestaryn-staged-change.png",
      alt: "Vestaryn staged change review screen",
    },
    {
      step: "05",
      title: "Verify before apply",
      text: "Vestaryn runs verification before changes are accepted, turning AI output into a controlled engineering workflow.",
      image: "/vestaryn-preverify.png",
      alt: "Vestaryn pre-verify pass screen",
    },
    {
      step: "06",
      title: "Commit-ready state",
      text: "The result is a clean, tracked, commit-ready state instead of silent breakage or guesswork.",
      image: "/vestaryn-commit-ready.png",
      alt: "Vestaryn commit ready screen",
    },
  ];

  const principles = [
    {
      title: "Structure over chaos",
      text: "Vestaryn is built around explicit phases, visible state, and controlled transitions instead of blind AI mutation.",
    },
    {
      title: "Verification in the loop",
      text: "Changes are checked before they touch the codebase, making reliability part of the workflow rather than an afterthought.",
    },
    {
      title: "Repository-aware execution",
      text: "The chamber works with files, plans, staged changes, and verification context together in one environment.",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.12),transparent_30%),linear-gradient(to_bottom,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />

      <main className="relative mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-8 flex items-center justify-between rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl">
          <a href="/" className="text-sm font-medium text-white/80 transition hover:text-white">
            Summit Sight
          </a>
          <div className="flex items-center gap-5 text-sm text-white/55">
            <a href="#how-it-works" className="transition hover:text-white">
              How it works
            </a>
            <a href="#principles" className="transition hover:text-white">
              Principles
            </a>
            <a href="#early-access" className="transition hover:text-white">
              Early access
            </a>
          </div>
        </div>

        <section className="grid gap-6 rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:grid-cols-[1.05fr_0.95fr] md:p-8">
  <div>
    <p className="text-sm uppercase tracking-[0.28em] text-white/40">Vestaryn</p>

    <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-white/95 sm:text-5xl md:text-6xl">
      AI that builds code is easy.
      <br />
      AI that builds it correctly is not.
    </h1>

    <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
      Vestaryn turns plain-language requests into structured plans, staged changes,
      and verified execution — before anything touches your codebase.
    </p>

    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
      No blind mutations. No silent breakage. Just controlled, visible progress.
    </p>

    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
      <a
        href="#how-it-works"
        className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90"
      >
        See how it works
      </a>

      <a
        href="#early-access"
        className="rounded-2xl border border-white/15 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.07]"
      >
        Get early access
      </a>
    </div>

    <p className="mt-4 text-xs tracking-[0.18em] text-white/35">
      Plan → Approve → Execute → Verify → Commit
    </p>
  </div>

  <div className="rounded-[28px] border border-white/10 bg-black/30 p-3 py-7">
    <img
      src="/vestaryn-hero.png"
      alt="Vestaryn interface overview"
      className="w-full rounded-[20px] border border-white/10 object-cover"
    />

    <div className="mt-4 grid gap-2 text-sm text-white/72">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        Plan → Approve → Execute
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        Staged changes with full visibility
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        Verification before apply
      </div>
    </div>
  </div>
</section>

        <section id="principles" className="mt-8 grid gap-4 md:grid-cols-3">
          {principles.map((principle) => (
            <div
              key={principle.title}
              className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.08] hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
            >
              <h2 className="text-lg font-medium text-white/90">{principle.title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/60">{principle.text}</p>
            </div>
          ))}
        </section>

        <section
          id="how-it-works"
          className="mt-8 rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl md:p-8"
        >
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">How it works</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white/92 md:text-3xl">
              A clear execution loop instead of blind mutation.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/58 md:text-base">
              The screenshots below show a real flow: define a goal, approve a plan, execute scoped changes, review staged output, and verify before apply.
            </p>
          </div>

          <div className="mt-8 space-y-8">
            {flow.map((item) => (
              <div
                key={item.step}
                className="grid gap-5 rounded-[28px] border border-white/10 bg-black/30 p-5 md:grid-cols-[0.38fr_0.62fr] md:items-start md:p-6"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Step {item.step}</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white/92">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/60">{item.text}</p>
                </div>
                <div className="overflow-hidden rounded-[22px] border border-white/10 bg-neutral-950">
                  <img src={item.image} alt={item.alt} className="w-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl md:p-8">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">Why this matters</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white/92 md:text-3xl">
              AI is powerful. Unstructured execution is risky.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/60 md:text-base">
              Most tools stop at generation. Vestaryn focuses on the boundary where generated output becomes real system change. That boundary needs visibility, approval, and verification.
            </p>
          </div>
        </section>

        <section
          id="early-access"
          className="mt-8 rounded-[32px] border border-white/10 bg-black/30 p-6 backdrop-blur-xl md:p-8"
        >
          <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Early access</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white/92 md:text-3xl">
                Vestaryn is in active development.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/60 md:text-base">
                I’m currently exploring how structured AI execution can become a better standard for building software. Early access is open in small batches.
              </p>
            </div>

            <div className="grid gap-3">
              <a
                href="https://vestaryn.dev"
                className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-medium text-black transition hover:bg-white/90"
              >
                Visit Vestaryn
              </a>
              <a
                href="mailto:summit-sight@hotmail.com"
                className="rounded-2xl border border-white/15 bg-white/[0.03] px-5 py-3 text-center text-sm font-medium text-white transition hover:bg-white/[0.07]"
              >
                Get in touch
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
