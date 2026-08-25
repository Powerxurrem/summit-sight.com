import Link from "next/link";
import { BOOK_PRICE, BOOK_PURCHASE_URL, BOOK_STATUS } from "./book-config";

const archive = [
  {
    name: "Oddloop",
    kind: "A tiny browser arcade",
    description:
      "A growing cabinet of small games, strange mechanics, daily distractions, and reasons to try once more. Driftline lives here now.",
    href: "/oddloop",
    linkLabel: "Open Oddloop",
    internal: true,
  },
  {
    name: "Emberbound",
    kind: "Mini turn-based RPG",
    description:
      "Three travellers, one mossback wyrm, and a compact old-school command menu. A complete little RPG battle living inside the browser.",
    href: "/emberbound",
    linkLabel: "Play Emberbound",
    internal: true,
  },
  {
    name: "Tiny Delve",
    kind: "Pocket roguelike",
    description:
      "A seven-by-seven dungeon where every step moves the monsters. Gather three runes, choose strange relics, and see how deep a tiny hero can go.",
    href: "/tiny-delve",
    linkLabel: "Play Tiny Delve",
    internal: true,
  },
  {
    name: "Driftline",
    kind: "Endless tunnel game",
    description:
      "A ball, a rotating tunnel, and an endless line of obstacles. Hold left or right, find the gap, and try not to lose the flow.",
    href: "/driftline",
    linkLabel: "Play Driftline",
    internal: true,
  },
  {
    name: "Peak Stack",
    kind: "Tiny browser game",
    description:
      "A calm one-tap stacking game about balance, perfect landings, and convincing yourself that there is time for one more try.",
    href: "/peak-stack",
    linkLabel: "Play Peak Stack",
    internal: true,
  },
  {
    name: "Vestaryn",
    kind: "Developer tools",
    description:
      "An experiment in making AI-assisted development more deliberate: plan the work, review the changes, and verify before applying.",
    href: "/vestaryn",
    linkLabel: "Read about the project",
    internal: true,
  },
  {
    name: "Soundscape",
    kind: "SaaS & mobile",
    description:
      "A real-world software product spanning payments, backend systems, export workflows, and companion mobile apps.",
    href: "https://soundscape.run",
    linkLabel: "Visit Soundscape",
    internal: false,
  },
];

const bookFeatures = [
  "12 practical chapters",
  "Real, anonymized research-lab lessons",
  "Strategy Kill Pack templates",
  "Preregistration, robustness, shadow, and promotion frameworks",
];

const products = [
  {
    name: "Browser Research Trail",
    status: "Early / experimental",
    description:
      "A lightweight browser extension that turns focused browsing sessions into searchable research trails.",
    cta: "Coming soon",
    href: null,
  },
  {
    name: "Kill Your Own Trading Strategy",
    status: BOOK_STATUS,
    description:
      "A falsification-first field guide to disproving trading ideas before you risk real capital.",
    cta: "Get the guide",
    href: "#book",
  },
];

export default function Home() {
  return (
    <main>
      <nav className="site-nav page-shell" aria-label="Main navigation">
        <Link className="wordmark" href="/">
          Summit Sight
        </Link>
        <div className="nav-links">
          <a href="#products">Products</a>
          <a href="#about">About</a>
          <a href="#archive">Archive</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <section className="hero page-shell">
        <div className="eyebrow">Product studio</div>
        <div className="hero-grid">
          <div>
            <h1>Useful software, guides, and experiments.</h1>
            <p className="hero-copy">
              Small products built to solve real problems — from research
              tools and browser utilities to practical field guides.
            </p>
            <div className="hero-actions">
              <a className="btn-primary" href="#products">
                Browse products
              </a>
              <a className="btn-secondary" href="#about">
                About Summit Sight
              </a>
            </div>
          </div>

          <div className="summit-mark" aria-hidden="true">
            <span className="sun" />
            <span className="ridge ridge-one" />
            <span className="ridge ridge-two" />
            <span className="ridge ridge-three" />
          </div>
        </div>
      </section>

      <section className="section products-section page-shell" id="products">
        <div className="section-heading">
          <p className="section-number">01</p>
          <h2>Products</h2>
          <p>What you can use today, and what&apos;s coming next.</p>
        </div>

        <div className="products-body">
          <article className="featured-product" id="book">
            <div className="book-cover-placeholder">
              <img
                className="book-cover-image"
                src="/book-cover.png"
                alt="Kill Your Own Trading Strategy Before It Kills Your Money — book cover"
              />
            </div>

            <div className="featured-product-body">
              <p className="project-kind">Featured product · {BOOK_STATUS}</p>
              <h3 className="book-title">
                Kill Your Own Trading Strategy Before It Kills Your Money
              </h3>
              <p className="book-subtitle">
                A practical field guide to disproving trading ideas before you
                risk real capital.
              </p>
              <p className="book-description">
                A falsification-first field guide for systematic traders who
                want to know when a backtest is lying, when an edge
                disappears after costs, and when a strategy should be killed
                before real money gets involved.
              </p>

              <ul className="feature-list">
                {bookFeatures.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <div className="book-price-row">
                <span className="book-price">{BOOK_PRICE}</span>
                {BOOK_PURCHASE_URL ? (
                  <a
                    className="btn-primary"
                    href={BOOK_PURCHASE_URL}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Get the guide
                  </a>
                ) : (
                  <span
                    className="btn-primary cta-disabled"
                    title="Purchase link coming soon"
                    aria-disabled="true"
                  >
                    Get the guide
                  </span>
                )}
              </div>
            </div>
          </article>

          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.name}>
                <span className="status-badge">{product.status}</span>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                {product.href ? (
                  <a className="project-link" href={product.href}>
                    {product.cta} <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <span
                    className="project-link cta-disabled"
                    aria-disabled="true"
                  >
                    {product.cta}
                  </span>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section why-section page-shell" id="why">
        <div className="section-heading">
          <p className="section-number">02</p>
          <h2>Why Summit Sight</h2>
        </div>
        <div className="why-body">
          <p className="why-copy">
            Summit Sight is a small independent product studio focused on
            useful, understandable software and practical tools.
          </p>
          <p className="principles-list">
            <span>Small scope</span>
            <span>Clear purpose</span>
            <span>Dependable execution</span>
            <span>No unnecessary complexity</span>
          </p>
        </div>
      </section>

      <section className="section about page-shell" id="about">
        <div className="section-heading">
          <p className="section-number">03</p>
          <h2>About</h2>
        </div>
        <div className="about-copy">
          <p>
            I like software that feels understandable. The kind where the
            rough edges have been considered, the moving parts have a reason
            to exist, and the result helps someone do something real.
          </p>
          <p>
            I&apos;m Romano Kreugel, the builder behind Summit Sight. Away
            from the neat product descriptions, I&apos;m mostly exploring,
            learning, rebuilding, and following whatever idea has enough pull
            to turn into something worth shipping.
          </p>
        </div>
      </section>

      <section className="section archive-section page-shell" id="archive">
        <div className="section-heading">
          <p className="section-number">04</p>
          <h2>Archive</h2>
          <p>Earlier experiments and past work, kept around on purpose.</p>
        </div>

        <div className="project-list">
          {archive.map((project) => (
            <article className="project" key={project.name}>
              <div>
                <p className="project-kind">{project.kind}</p>
                <h3>{project.name}</h3>
              </div>
              <p>{project.description}</p>
              {project.internal ? (
                <Link className="project-link" href={project.href}>
                  {project.linkLabel} <span aria-hidden="true">↗</span>
                </Link>
              ) : (
                <a
                  className="project-link"
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {project.linkLabel} <span aria-hidden="true">↗</span>
                </a>
              )}
            </article>
          ))}
        </div>
      </section>

      <footer className="footer page-shell" id="contact">
        <div>
          <p className="section-number">05</p>
          <h2>Questions, ideas, or collaborations?</h2>
          <p className="footer-copy">
            Have a product idea, a question about the guide, or want to
            compare notes? My inbox is open.
          </p>
        </div>
        <div className="contact-links">
          <a href="mailto:summit-sight@hotmail.com">Email</a>
          <a
            href="https://github.com/Powerxurrem"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/romanokreugel/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </div>
        <p className="copyright">© {new Date().getFullYear()} Summit Sight</p>
      </footer>
    </main>
  );
}
