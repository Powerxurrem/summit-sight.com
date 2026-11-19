import Link from "next/link";

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h16m-6-6 6 6-6 6"} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function Brand() {
  return <Link className="brand" href="/" aria-label="Summit Sight home"><svg viewBox="0 0 38 34" fill="none" aria-hidden="true"><path d="m2 29 12-23 6 12 5-9 11 20H2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="m9 16 5 3 4-5m3 9 4-3 5 2M14 6l11 23" stroke="currentColor" strokeWidth="1.1"/></svg><span>SUMMIT SIGHT<span className="brand-descriptor">CREATIVE PRODUCTION STUDIO</span></span></Link>;
}

export function ProjectCTA() {
  return <section className="project-cta page-container"><div><p className="eyebrow">LET’S MAKE SOMETHING EXTRAORDINARY</p><h2>Your next big idea.<br/><em>Let’s bring it to life.</em></h2></div><Link href="/contact" className="round-cta" aria-label="Start a project"><Arrow diagonal /><span>Start a project</span></Link></section>;
}

export function Footer() {
  return <footer className="site-footer page-container"><div className="footer-top"><Brand/><p>Independent thinking.<br/>Exceptional possibilities.</p><a href="mailto:summit-sight@hotmail.com">Let’s talk <Arrow diagonal /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Summit Sight</span><span>Independent creative production</span><Link href="/contact">Get in touch <Arrow diagonal /></Link></div></footer>;
}
