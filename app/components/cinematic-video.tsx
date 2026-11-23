"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CinematicStudy } from "../lib/cinematic-studies";
import styles from "./cinematic-studies.module.css";

type Status = "idle" | "playing" | "paused" | "ended" | "error";

export function CinematicVideo({ study }: { study: CinematicStudy }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const toggleRef = useRef<() => void>(() => {});
  const [status, setStatus] = useState<Status>("idle");
  const id = useId();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let visible = false;
    let intent: "auto" | "play" | "pause" = "auto";
    let completed = false;
    let blocked = false;
    let disposed = false;
    let attempt = 0;
    const eligible = () => visible && !document.hidden && !completed && !blocked &&
      (intent === "play" || (intent === "auto" && !motion.matches && !connection?.saveData));

    const reconcile = () => {
      if (!eligible()) {
        attempt++;
        video.pause();
        return;
      }
      if (!video.getAttribute("src")) video.src = study.src;
      if (!video.paused) return;
      const current = ++attempt;
      video.play().then(() => {
        if (disposed || !eligible()) video.pause();
      }).catch(() => {
        if (disposed || current !== attempt) return;
        blocked = true;
        setStatus(video.error ? "error" : "paused");
      });
    };
    const onPlay = () => {
      if (!eligible()) { video.pause(); return; }
      setStatus("playing");
    };
    const onPause = () => { if (!disposed && !video.ended) setStatus("paused"); };
    const onEnded = () => {
      if (study.loop) {
        // Native looping normally avoids ended; recover if a browser emits it.
        completed = false;
        video.currentTime = 0;
        reconcile();
        return;
      }
      completed = true;
      setStatus("ended");
    };
    const onError = () => { blocked = true; setStatus("error"); };
    const onMotion = () => {
      // A new reduced-motion request immediately returns to the real poster.
      if (motion.matches) {
        intent = "auto";
        attempt++;
        video.pause();
        video.removeAttribute("src");
        video.load();
        completed = false;
        blocked = false;
        setStatus("idle");
      } else reconcile();
    };
    toggleRef.current = () => {
      if (!video.paused) {
        intent = "pause";
        reconcile();
        return;
      }
      intent = "play";
      completed = false;
      blocked = false;
      if (video.ended) video.currentTime = 0;
      if (video.error) { video.removeAttribute("src"); video.load(); }
      reconcile();
    };
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onError);
    document.addEventListener("visibilitychange", reconcile);
    motion.addEventListener("change", onMotion);
    // Attach sources only when a meaningful part of that individual card is visible.
    const observer = "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
      reconcile();
    }, { threshold: [0, 0.35] }) : null;
    observer?.observe(video);
    if (!observer) {
      // Older browsers retain the poster until the visitor explicitly plays.
      visible = true;
      intent = "pause";
    }
    return () => {
      disposed = true;
      attempt++;
      observer?.disconnect();
      document.removeEventListener("visibilitychange", reconcile);
      motion.removeEventListener("change", onMotion);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
      video.pause();
      video.removeAttribute("src");
      video.load();
      toggleRef.current = () => {};
    };
  }, [study.src, study.loop]);

  const playing = status === "playing";
  const action = playing ? "Pause" : status === "ended" ? "Replay" : status === "error" ? "Retry" : "Play";
  return <figure className={styles.card}>
    <div className={styles.frame}>
      <video ref={videoRef} id={`${id}-video`} width={1024} height={576} poster={study.poster}
        muted playsInline loop={study.loop} preload="none" aria-label={study.title} aria-describedby={`${id}-description`}>
        <p>Your browser cannot play this film. <a href={study.src}>Open {study.title}</a>.</p>
      </video>
      <button className={styles.playback} type="button" aria-label={`${action} ${study.title}`}
        aria-controls={`${id}-video`} onClick={() => toggleRef.current()}>
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">{playing
          ? <path d="M7 5v10M13 5v10" stroke="currentColor" strokeWidth="2"/>
          : <path d="m7 4 9 6-9 6V4Z" fill="currentColor"/>}</svg>
        <span>{action}</span>
      </button>
      {status === "error" && <p className={styles.error} role="status">This film couldn’t load. Try again or <a href={study.src}>open the video</a>.</p>}
    </div>
    <figcaption className={styles.caption}>
      <h3>{study.title}</h3><p>{study.subtitle}</p>
      <span id={`${id}-description`} className={styles.srOnly}>{study.description} Silent cinematic study.</span>
    </figcaption>
    <noscript><a className={styles.fileLink} href={study.src}>Watch {study.title}</a></noscript>
  </figure>;
}
