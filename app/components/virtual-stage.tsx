"use client";

import { useEffect, useRef, useState } from "react";
import { createComparisonPlayer, type ComparisonStatus } from "../lib/comparison-player";
import { cinematicWorlds, clayScene } from "../lib/virtual-stage";
import styles from "./virtual-stage.module.css";

export function VirtualStage() {
  const [selected, setSelected] = useState(0);
  const [showSource, setShowSource] = useState(false);
  const [status, setStatus] = useState<ComparisonStatus>("idle");
  const clayRef = useRef<HTMLVideoElement>(null);
  const worldRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReturnType<typeof createComparisonPlayer> | null>(null);
  const world = cinematicWorlds[selected];

  useEffect(() => {
    const clay = clayRef.current;
    const world = worldRef.current;
    const frame = frameRef.current;
    if (!clay || !world || !frame) return;
    const player = createComparisonPlayer({ clay, world, claySource: clayScene.src, worldSource: cinematicWorlds[0].src, onStatus: setStatus });
    playerRef.current = player;
    const onVisibility = () => player.setHidden(document.hidden);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => { if (motion.matches) player.reduceMotion(); };
    const observer = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
      player.setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.25);
    }, { threshold: [0, 0.25] }) : null;
    observer?.observe(frame);
    if (!observer) player.setVisible(true);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", onMotion);
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", onMotion);
      player.dispose();
      playerRef.current = null;
    };
  }, []);

  const selectWorld = (index: number) => {
    setSelected(index);
    playerRef.current?.select(cinematicWorlds[index].src);
  };
  const active = status === "playing" || status === "loading";
  const action = active ? "Pause" : status === "error" ? "Retry" : "Play";

  return <section id="virtual-stage" className={styles.section} aria-labelledby="virtual-stage-title">
    <div className="page-container">
      <div className={styles.heading}>
        <div><p className="eyebrow">VIRTUAL STAGE / CREATIVE EXPERIMENT</p>
          <h2 id="virtual-stage-title">One scene.<br/><em>Infinite possibilities.</em></h2></div>
        <p className={styles.intro}>One carefully choreographed 3D scene. Three cinematic worlds brought to life through AI.</p>
      </div>
      <div className={styles.experience}>
        <div className={styles.topline}><span>02 / THE IMPOSSIBLE GALLERY</span><span>ONE SCENE / THREE WORLDS</span></div>
        <div className={`${styles.panels} ${showSource ? styles.sourceVisible : ""}`}>
          <figure className={styles.source} id="virtual-stage-source">
            <figcaption className={styles.panelLabel}><span>THE FOUNDATION</span><span>Original Blender Clay</span></figcaption>
            <div className={styles.frame}>
              <video ref={clayRef} poster={clayScene.poster} muted playsInline preload="none" width="1280" height="720" disablePictureInPicture aria-label="Original Blender clay animation: a suspended ring sculpture in a grey gallery">Your browser does not support inline video.</video>
            </div>
          </figure>
          <figure className={styles.result}>
            <figcaption className={styles.panelLabel}><span>THE REIMAGINING / {world.number}</span><span>{world.title}</span></figcaption>
            <div ref={frameRef} className={styles.frame}>
              <video ref={worldRef} poster={world.poster} muted playsInline preload="none" width="1280" height="720" disablePictureInPicture aria-label={`${world.title}: a cinematic interpretation of the original gallery`}>Your browser does not support inline video.</video>
              {status === "loading" && <span className={styles.loading}>Preparing your world<span aria-hidden="true">…</span></span>}
            </div>
          </figure>
        </div>
        <div className={styles.toolbar}>
          <button className={styles.playback} onClick={() => playerRef.current?.toggle()} aria-label={`${action} scene comparison`}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">{active ? <path d="M8 5v14M16 5v14" stroke="currentColor" strokeWidth="2"/> : <path d="m9 5 10 7-10 7V5Z" stroke="currentColor" strokeWidth="1.5"/>}</svg>
            {status === "loading" ? "Pause" : action}
          </button>
          <span className={styles.playHint}>{status === "idle" ? "Choose a world. Press play to explore." : "One shared moment. Two interpretations."}</span>
          <button className={styles.sourceToggle} aria-expanded={showSource} aria-controls="virtual-stage-source" onClick={() => setShowSource(value => !value)}>{showSource ? "Hide" : "Compare"} original <span aria-hidden="true">{showSource ? "−" : "+"}</span></button>
        </div>
        <div className={styles.selector} role="group" aria-label="Choose a cinematic world">
          {cinematicWorlds.map((item, index) => <button key={item.id} className={styles.worldButton} aria-pressed={selected === index} onClick={() => selectWorld(index)}>
            <span className={styles.worldNumber}>{item.number}</span><span>{item.title}</span><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.2"/></svg>
          </button>)}
        </div>
        <div className={styles.worldCopy} aria-live="polite" aria-atomic="true"><p>{world.description}</p><span>{world.detail}</span></div>
        <p className={styles.srOnly} role="status">{status === "loading" ? "Loading the selected world at the shared timeline position." : status === "playing" ? "Comparison playing on repeat." : status === "paused" ? "Comparison paused. Press play to continue." : ""}</p>
        {status === "error" && <p className={styles.error} role="alert">This comparison could not load. Try again, or <a href={world.src}>open {world.title}</a>.</p>}
        <noscript><p className={styles.error}>JavaScript is needed for the comparison. Watch <a href={clayScene.src}>the original</a>, <a href={cinematicWorlds[0].src}>Drowned Cathedral</a>, <a href={cinematicWorlds[1].src}>Forgotten Sanctuary</a> or <a href={cinematicWorlds[2].src}>Singularity Engine</a>.</p></noscript>
      </div>
      <div className={styles.production}><p className="eyebrow">THE PROCESS</p><div><h3>Built in 3D. <em>Reimagined with AI.</em></h3><p>Starting with an original Blender animation, we used its camera movement and scene choreography as the foundation for three distinct cinematic interpretations.</p></div><span className={styles.processMark} aria-hidden="true">3D <span>→</span> AI</span></div>
    </div>
  </section>;
}
