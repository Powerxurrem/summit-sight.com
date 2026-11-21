"use client";

import Image from "next/image";
import { useId, useRef, useState, type PointerEvent } from "react";
import { changeWatchPair, initialWatchPair, watchTreatments, type WatchPair, type WatchTreatmentId } from "../lib/watch-study";
import "./showcases.css";
import "./watch-study.css";

export function WatchComparison() {
  const [pair, setPair] = useState(initialWatchPair);
  const [value, setValue] = useState(50);
  const [loaded, setLoaded] = useState<string[]>([]);
  const [failed, setFailed] = useState<string[]>([]);
  const dragging = useRef(false);
  const id = useId();
  const left = watchTreatments.find(treatment => treatment.id === pair.left)!;
  const right = watchTreatments.find(treatment => treatment.id === pair.right)!;
  const ready = loaded.includes(left.src) && loaded.includes(right.src);
  const hasError = failed.includes(left.src) || failed.includes(right.src);
  const sizes = "(max-width: 760px) 90vw, 50vw";

  function choose(side: keyof WatchPair, treatment: WatchTreatmentId) {
    dragging.current = false;
    setFailed([]);
    setPair(current => changeWatchPair(current, side, treatment));
  }

  function markLoaded(src: string) {
    setLoaded(current => current.includes(src) ? current : [...current, src]);
    setFailed(current => current.filter(image => image !== src));
  }

  function update(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    setValue(Math.round(Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100))));
  }

  return <div className="watch-comparison">
    <div className="watch-pair-controls">
      {(["left", "right"] as const).map(side => <label key={side} htmlFor={`${id}-${side}`}>
        <span>{side === "left" ? "Left treatment" : "Right treatment"}</span>
        <select id={`${id}-${side}`} value={pair[side]} onChange={event => choose(side, event.target.value as WatchTreatmentId)}>
          {watchTreatments.map(treatment => <option key={treatment.id} value={treatment.id}>{treatment.title}</option>)}
        </select>
      </label>)}
    </div>
    <p id={`${id}-pair`} className="watch-pair-status" role="status" aria-live="polite" aria-atomic="true">{left.title} on the left. {right.title} on the right.</p>
    <figure className="showcase-compare">
      <div className="showcase-frame showcase-comparison-frame" aria-busy={!ready && !hasError}
        onPointerDown={event => { if (!ready || !event.isPrimary || event.button !== 0) return; dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); update(event); }}
        onPointerMove={event => { if (dragging.current) update(event); }}
        onPointerUp={() => { dragging.current = false; }}
        onPointerCancel={() => { dragging.current = false; }}
        onLostPointerCapture={() => { dragging.current = false; }}>
        <Image key={`right-${right.id}`} src={right.src} alt={right.alt} fill sizes={sizes} draggable={false} onLoad={() => markLoaded(right.src)} onError={() => setFailed(current => [...current, right.src])}/>
        <div className="showcase-after" style={{ clipPath: `inset(0 ${100-value}% 0 0)` }}>
          <Image key={`left-${left.id}`} src={left.src} alt={left.alt} fill sizes={sizes} draggable={false} onLoad={() => markLoaded(left.src)} onError={() => setFailed(current => [...current, left.src])}/>
        </div>
        <span className="showcase-image-label showcase-image-label-left">{left.title}</span>
        <span className="showcase-image-label showcase-image-label-right">{right.title}</span>
        <span className="showcase-divider" style={{ left: `${value}%` }} aria-hidden="true"><span>‹ ›</span></span>
        {(!ready || hasError) && <div className="watch-image-status" role="status">{hasError ? "This treatment could not load. Choose another setting." : "Preparing your comparison…"}</div>}
      </div>
      <figcaption className="showcase-range-caption"><label htmlFor={`${id}-range`}>Drag to compare</label><span>Or use the arrow keys</span></figcaption>
      <input id={`${id}-range`} className="showcase-range" type="range" min={0} max={100} value={value} disabled={!ready || hasError} aria-label="Compare watch treatments" aria-describedby={`${id}-pair`} aria-valuetext={`${value}% ${left.title}; ${100-value}% ${right.title}`} onChange={event => setValue(Number(event.target.value))}/>
    </figure>
  </div>;
}
