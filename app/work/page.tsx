import type { Metadata } from "next";
import { ProjectCTA } from "../components/brand";
import { MultiAngleShowcase } from "../components/multi-angle-showcase";
import { TransformationTabs } from "../components/showcases";
import { CinematicStudies } from "../components/cinematic-studies";
import { soapStudy } from "../lib/work";
import { WatchComparison } from "../components/watch-comparison";
import { watchDisclosure, watchTreatments } from "../lib/watch-study";
import "../components/watch-study.css";

export const metadata: Metadata = { title: "Selected Work", description: "Explore original studio concepts, interactive transformations, a generated multi-angle product study and cinematic motion experiments." };

export default function Work() {
  return <main id="main"><div className="page-container"><section className="page-intro"><p className="eyebrow">THE EXPLORATION ROOM / SELECTED WORK</p><h1>A glimpse of<br/><em>what could be.</em></h1><p>Product stories. New perspectives. Unexpected possibilities.<br/>A collection of independent studio concepts and visual experiments.</p><div className="work-jump-links"><a href="#concepts">Cinematic studies ↘</a><a href="#transformations">Transformations ↘</a><a href="#multi-angle">Multi-angle ↘</a></div></section><CinematicStudies location="work"/><section className="work-section" id="transformations"><div className="section-heading"><div><p className="eyebrow">02 / CREATIVE TRANSFORMATIONS</p><h2>A study in time.<br/><em>A change of atmosphere.</em></h2></div><p className="section-description">An original, unbranded luxury watch.<br/>Four settings. One considered visual direction.</p></div><div className="work-comparison"><WatchComparison/><div><p className="eyebrow">BLUE DIAL / GOLD ACCENTS</p><h3>Deep blue. A different mood.</h3><p>Choose any two settings, then move the divider. Compare pale limestone, wet dark rock, an open presentation box or a tailored suit cuff. One fictional watch, explored through four expressions of premium product photography.</p><p className="small-note">{watchDisclosure}</p><p className="small-note">Use your mouse, touch, or the arrow keys.</p></div></div><div className="environment-heading"><h3>One watch. Four atmospheres.</h3><span className="small-note">Select a creative direction</span></div><div className="watch-treatment-studies"><TransformationTabs items={watchTreatments}/></div></section><section className="work-section" id="multi-angle"><div className="section-heading"><div><p className="eyebrow">03 / A NEW PERSPECTIVE</p><h2>Every angle.<br/><em>Considered.</em></h2></div><p className="section-description">One fictional product. A curated sequence of generated views. Explore every perspective.</p></div><MultiAngleShowcase study={soapStudy}/></section></div><ProjectCTA/></main>;
}
