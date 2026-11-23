"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./character-study.module.css";

const source = "/media/character-studies/lena-performance-v2.mp4";
const poster = "/media/character-studies/lena-poster-v2.webp";

export function CharacterStudy() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [failed, setFailed] = useState(false);
  const descriptionId = useId();
  const videoId = useId();
  const action = playing ? "Pause" : ended ? "Replay" : "Play";

  useEffect(() => {
    const video = videoRef.current;
    return () => { video?.pause(); };
  }, []);

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused && !video.ended) {
      video.pause();
      return;
    }
    if (video.ended) video.currentTime = 0;
    if (video.error) video.load();
    setFailed(false);
    try {
      await video.play();
    } catch (error) {
      // A quick pause can cancel an in-flight play request without a media failure.
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setFailed(true);
        setPlaying(false);
        setBuffering(false);
      }
    }
  }

  return <figure className={styles.study}>
    <div className={styles.frame}>
      <video ref={videoRef} id={videoId} className={styles.video} src={source} poster={poster} width={1920} height={1080}
        playsInline disablePictureInPicture disableRemotePlayback preload="none" aria-label="Lena character performance, with audio"
        aria-describedby={descriptionId}
        onPlay={() => { setPlaying(true); setEnded(false); }}
        onPause={() => { setPlaying(false); setBuffering(false); }}
        onEnded={() => { setPlaying(false); setEnded(true); setBuffering(false); }}
        onVolumeChange={event => setMuted(event.currentTarget.muted)}
        onWaiting={() => setBuffering(true)} onPlaying={() => setBuffering(false)}
        onError={() => { setFailed(true); setPlaying(false); setBuffering(false); }} onCanPlay={() => setFailed(false)}>
        Your browser does not support this video. <a href={source}>Open the Lena film</a>.
      </video>
      <div className={styles.controls}>
        {buffering && <span className={styles.loading} role="status">Loading…</span>}
        <button type="button" className={styles.control} aria-label={`${action} Lena`} aria-controls={videoId} onClick={togglePlayback}>
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">{playing
            ? <path d="M7 5v10M13 5v10" stroke="currentColor" strokeWidth="2"/>
            : <path d="m7 4 9 6-9 6V4Z" fill="currentColor"/>}</svg>
          {action}
        </button>
        <button type="button" className={styles.control} aria-label={muted ? "Unmute Lena" : "Mute Lena"} aria-controls={videoId}
          onClick={() => { if (videoRef.current) videoRef.current.muted = !videoRef.current.muted; }}>
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M9 4 5 7H2v6h3l4 3V4Z" stroke="currentColor" strokeWidth="1.4"/>
            {muted ? <path d="m13 7 5 6m0-6-5 6" stroke="currentColor" strokeWidth="1.4"/>
              : <path d="M12 7a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12" stroke="currentColor" strokeWidth="1.4"/>}
          </svg>
          Sound {muted ? "off" : "on"}
        </button>
      </div>
      {failed && <p className={styles.error} role="status">The film could not be loaded. <a href={source} target="_blank" rel="noreferrer">Open the video file</a>.</p>}
    </div>
    <figcaption className={styles.copy}>
      <p className={styles.eyebrow}>CHARACTER PERFORMANCE / 12 SEC</p>
      <h3>Lena. A moment of presence.</h3>
      <p id={descriptionId}>An original AI-generated character study exploring voice, expression and the space between words.</p>
      <p className={styles.note}>Press play to hear the performance.</p>
    </figcaption>
  </figure>;
}
