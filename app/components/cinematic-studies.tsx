import { cinematicStudies } from "../lib/cinematic-studies";
import { CinematicVideo } from "./cinematic-video";
import { CharacterStudy } from "./character-study";
import styles from "./cinematic-studies.module.css";

export function CinematicStudies({ location }: { location: "home" | "work" }) {
  return <section className={`${location === "home" ? "section-space page-container" : "work-section"} ${styles.section}`}
    id={location === "home" ? "selected-work" : "concepts"} aria-labelledby={`${location}-cinematic-title`}>
    {location === "work" && ["motion", "amber-stone", "quiet-form", "daily-ritual"].map(anchor =>
      <span key={anchor} id={anchor} className={styles.anchor} aria-hidden="true"/>)}
    <div className={`section-heading ${styles.heading}`}>
      <div><p className="eyebrow">01 / CINEMATIC STUDIES</p>
        <h2 id={`${location}-cinematic-title`}>Beyond the frame.<br/><em>Into the extraordinary.</em></h2>
      </div>
      <p className={styles.intro}>Original AI-generated cinematic studies. From the ignition of a supercar to an entire universe hidden within an eye.</p>
    </div>
    <div className={styles.grid}>{cinematicStudies.map(study => <CinematicVideo key={study.id} study={study}/>)}</div>
    {location === "work" && <CharacterStudy/>}
  </section>;
}
