import Image from "next/image";
import type { Service } from "../lib/content";
import { cinematicStudies } from "../lib/cinematic-studies";
import { watchTreatments } from "../lib/watch-study";
import { soapFrames } from "../lib/work";
import { CinematicVideo } from "./cinematic-video";
import styles from "./service-visuals.module.css";

type Tile = { src: string; alt: string; label: string };

function StudyMosaic({ tiles, title, caption }: { tiles: Tile[]; title: string; caption: string }) {
  return <figure className={styles.visual}>
    <div className={styles.mosaic}>
      {tiles.map((tile, index) => <div className={`${styles.tile} ${index === 0 ? styles.primary : ""}`} key={tile.src}>
        <Image src={tile.src} alt={tile.alt} fill
          sizes={index === 0 ? "(max-width:800px) 60vw, 28vw" : "(max-width:800px) 30vw, 14vw"}/>
        <span className={styles.tileLabel}>{tile.label}</span>
      </div>)}
    </div>
    <figcaption className={styles.caption}><h3>{title}</h3><p>{caption}</p></figcaption>
  </figure>;
}

export function ServiceVisual({ service }: { service: Service["id"] }) {
  if (service === "imagery") {
    const tiles = ["creative", "studio", "box"].map(id => {
      const treatment = watchTreatments.find(item => item.id === id)!;
      return { ...treatment, label: treatment.title };
    });
    return <StudyMosaic tiles={tiles} title="One watch. Three atmospheres."
      caption="Original AI-generated product imagery. A fictional, unbranded watch explored through different visual settings."/>;
  }
  if (service === "multi-angle") {
    const tiles = [
      { angle: 0, label: "Front" }, { angle: 45, label: "Angled" }, { angle: 180, label: "Back" },
    ].map(view => ({ ...soapFrames.find(frame => frame.angle === view.angle)!, label: view.label }));
    return <StudyMosaic tiles={tiles} title="A product from every side."
      caption="Good Hands, a fictional packaging study. Generated viewpoints are artistic approximations, with fine details that may vary."/>;
  }
  if (service === "video") {
    return <div className={styles.visual}><CinematicVideo study={cinematicStudies[0]}/>
      <p className={styles.note}>An original AI-generated automotive study. Camera movement, atmosphere and a five-second reveal.</p>
    </div>;
  }
  return <div className={styles.visual}>
    <CinematicVideo study={cinematicStudies[1]}/>
    <ol className={styles.editSequence} aria-label="A Universe Within editing sequence">
      {[
        { src: cinematicStudies[1].poster, alt: "Opening frame: a colourful iris around a dark pupil", label: "Opening" },
        { src: "/media/service-studies/universe-passage.webp", alt: "The iris enlarges and its dark pupil becomes prominent", label: "Passage" },
        { src: "/media/service-studies/universe-reveal.webp", alt: "A blue, violet and gold spiral galaxy emerges", label: "Reveal" },
      ].map(frame => <li key={frame.label}><div className={styles.sequenceFrame}>
        <Image src={frame.src} alt={frame.alt} fill sizes="(max-width:800px) 28vw, 13vw"/>
      </div><span>{frame.label}</span></li>)}
    </ol>
    <p className={styles.note}>Two cinematic shots, flowing from eye to galaxy and back. An original AI-generated sequence study.</p>
  </div>;
}
