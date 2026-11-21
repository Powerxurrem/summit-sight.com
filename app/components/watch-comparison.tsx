"use client";

import Image from "next/image";
import { useCallback, useId, useRef, useState, type PointerEvent } from "react";
import { changeWatchPair, initialWatchPair, watchTreatments, type WatchPair, type WatchTreatmentId } from "../lib/watch-study";
import { observeWatchImage, type WatchImageState } from "../lib/watch-image-loading";
import "./showcases.css";
import "./watch-study.css";

export function WatchComparison() {
  const [pair, setPair] = useState(initialWatchPair);
  const [value, setValue] = useState(50);
  const [images, setImages] = useState<Record<string, WatchImageState>>({});
  const [attempt, setAttempt] = useState(0);
  const dragging = useRef(false);
  const id = useId();
  const left = watchTreatments.find(treatment => treatment.id === pair.left)!;
  const right = watchTreatments.find(treatment => treatment.id === pair.right)!;
  const ready = images[left.src] === "loaded" && images[right.src] === "loaded";
  const hasError = images[left.src] === "error" || images[right.src] === "error";
  const sizes = "(max-width: 760px) 90vw, 50vw";

  const recordImage = useCallback((src: string, state: WatchImageState) => {
    setImages(current => current[src] === state ? current : { ...current, [src]: state });
  }, []);

  const observeImage = useCallback((image: HTMLImageElement | null) => {
    const src = image?.dataset.watchSrc;
    if (!image || !src) return;
    return observeWatchImage(image, state => recordImage(src, state));
  }, [recordImage]);

  function choose(side: keyof WatchPair, treatment: WatchTreatmentId) {
    dragging.current = false;
    setPair(current => changeWatchPair(current, side, treatment));
  }

  function retry() {
    setImages(current => {
      const next = { ...current };
      delete next[left.src];
      delete next[right.src];
      return next;
    });
    setAttempt(current => current + 1);
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
        onPointerDown={event => { if (!event.isPrimary || event.button !== 0) return; dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); update(event); }}
        onPointerMove={event => { if (dragging.current) update(event); }}
        onPointerUp={() => { dragging.current = false; }}
        onPointerCancel={() => { dragging.current = false; }}
        onLostPointerCapture={() => { dragging.current = false; }}>
        <Image key={`right-${right.id}-${attempt}`} ref={observeImage} data-watch-src={right.src} src={right.src} alt={right.alt} fill sizes={sizes} loading="eager" draggable={false} style={{ visibility: images[right.src] === "error" ? "hidden" : undefined }}/>
        <div className="showcase-after" style={{ clipPath: `inset(0 ${100-value}% 0 0)` }}>
          <Image key={`left-${left.id}-${attempt}`} ref={observeImage} data-watch-src={left.src} src={left.src} alt={left.alt} fill sizes={sizes} loading="eager" draggable={false} style={{ visibility: images[left.src] === "error" ? "hidden" : undefined }}/>
        </div>
        <span className="showcase-image-label showcase-image-label-left">{left.title}</span>
        <span className="showcase-image-label showcase-image-label-right">{right.title}</span>
        <span className="showcase-divider" style={{ left: `${value}%` }} aria-hidden="true"><span>‹ ›</span></span>
        {(!ready || hasError) && <div className="watch-image-status" role="status">
          <span>{hasError ? "A treatment could not load." : "Loading images…"}</span>
          {hasError && <button className="watch-image-retry" type="button" onPointerDown={event => event.stopPropagation()} onClick={retry}>Retry images</button>}
        </div>}
      </div>
      <figcaption className="showcase-range-caption"><label htmlFor={`${id}-range`}>Drag to compare</label><span>Or use the arrow keys</span></figcaption>
      <input id={`${id}-range`} className="showcase-range" type="range" min={0} max={100} value={value} aria-label="Compare watch treatments" aria-describedby={`${id}-pair`} aria-valuetext={`${value}% ${left.title}; ${100-value}% ${right.title}`} onChange={event => setValue(Number(event.target.value))}/>
    </figure>
  </div>;
}
