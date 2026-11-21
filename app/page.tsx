import Image from "next/image";
import Link from "next/link";
import { Arrow, ProjectCTA } from "./components/brand";
import { WatchComparison } from "./components/watch-comparison";
import { services } from "./lib/content";
import { selectedWork } from "./lib/work";
import { watchDisclosure } from "./lib/watch-study";
import "./components/watch-study.css";

export default function Home() {
  return <main id="main">
    <section className="hero" aria-labelledby="hero-title">
      <Image className="hero-image" src="/media/hero.webp" alt="Amber fragrance concept on dark volcanic stone, illuminated by a warm shaft of light" fill sizes="100vw" preload/>
      <div className="hero-shade"/>
      <div className="hero-content page-container"><p className="eyebrow"><span className="status-dot"/> INDEPENDENT VISION. EXTRAORDINARY VISUALS.</p><h1 id="hero-title">Your product.<br/><em>Beyond ordinary.</em></h1><p className="hero-description">Premium product imagery, cinematic video and<br className="desktop-break"/> creative production — built around your vision.</p><div className="hero-actions"><Link className="button button-light" href="/work">Explore our work <Arrow diagonal/></Link><Link className="text-link" href="/services">Discover the possibilities <Arrow/></Link></div></div>
      <div className="hero-bottom page-container"><a href="#selected-work" className="scroll-cue"><span>↓</span> SCROLL TO EXPLORE</a><span className="hero-caption">01 / AMBER & STONE <span>STUDIO CONCEPT</span></span></div>
    </section>
    <div className="capability-strip"><span>PRODUCT IMAGERY</span><i>✳</i><span>CINEMATIC VIDEO</span><i>✳</i><span>360° & MULTI-ANGLE</span><i>✳</i><span>CREATIVE POST-PRODUCTION</span></div>
    <section className="selected-work section-space page-container" id="selected-work"><div className="section-heading"><div><p className="eyebrow">A DIFFERENT WAY TO SEE YOUR BRAND</p><h2>More than a visual.<br/><em>A lasting impression.</em></h2></div><div className="section-heading-aside"><p>From a single product to a whole new world.<br/>Explore what your next chapter could look like.</p><Link className="text-link" href="/work">View selected work <Arrow diagonal/></Link></div></div><div className="work-preview-grid">{selectedWork.map((work,index) => <Link href={`/work#${work.id}`} className={`work-preview work-preview-${index}`} key={work.id}><div className="work-preview-image"><Image src={work.src} alt={work.alt} fill sizes="(max-width: 700px) 90vw, (max-width: 1000px) 45vw, 33vw"/><span className="image-tag">STUDIO CONCEPT</span><span className="image-arrow"><Arrow diagonal/></span></div><div className="work-preview-meta"><div><h3>{work.title}</h3><p>{work.category}</p></div><span>0{index+1}</span></div></Link>)}</div><p className="concept-note">Independent creative studies. A glimpse of the possibilities, made for exploration.</p></section>
    <section className="services-home section-space"><div className="page-container"><div className="section-heading"><div><p className="eyebrow">WHAT WE CREATE</p><h2>One vision.<br/><em>Endless possibilities.</em></h2></div><Link className="text-link" href="/services">Explore our services <Arrow diagonal/></Link></div><div className="services-preview-grid">{services.map(service => <Link href={`/services#${service.id}`} key={service.id} className="service-preview"><span className="service-number">{service.number} /</span><h3>{service.shortTitle}</h3><p>{service.description}</p><span className="service-explore">Discover more <Arrow diagonal/></span></Link>)}</div></div></section>
    <section className="transformation-home section-space page-container"><div className="transformation-copy"><p className="eyebrow">AN ORIGINAL WATCH CONCEPT</p><h2>One watch.<br/><em>A different atmosphere.</em></h2><p>Deep blue. Polished steel. A touch of gold. Explore an original luxury watch concept, from quiet studio light to wet volcanic stone and the reveal of an open presentation box.</p><Link className="text-link" href="/work#transformations">Explore transformations <Arrow diagonal/></Link><span className="small-note">{watchDisclosure}</span></div><WatchComparison/></section>
    <section className="studio-note page-container"><span className="eyebrow">THE STUDIO</span><p>Creative instinct.<br/>Technical curiosity.<br/><em>A fresh point of view.</em></p><div><p>Summit Sight is an independent creative technology studio. We bring visual craft and thoughtful experimentation together to help businesses show what makes them different.</p><Link className="text-link" href="/about">Get to know the studio <Arrow diagonal/></Link></div></section>
    <ProjectCTA/>
  </main>;
}
