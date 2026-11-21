"use client";

import { useCallback, useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { changeWatchPair, initialWatchPair, watchTreatments, type WatchPair, type WatchTreatmentId } from "../lib/watch-study";
import "./showcases.css";
import "./watch-study.css";

function WatchPhoto({ src, alt, failed, onResult }: { src: string; alt: string; failed: boolean; onResult: (src: string, failed: boolean) => void }) {
  const image = useRef<HTMLImageElement>(null);
  const loaded = useCallback(() => onResult(src, false), [onResult, src]);
  const error = useCallback(() => onResult(src, true), [onResult, src]);
  useEffect(() => {
    const element = image.current;
    if (!element?.complete) return;
    if (element.naturalWidth > 0) loaded();
    else if (element.currentSrc) error();
  }, [loaded, error]);

  // These committed WebPs are already sized and compressed for this viewer.
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={image} className="watch-photo" data-watch-src={src} src={src} alt={alt} width={1254} height={1254} loading="eager" decoding="async" draggable={false} onLoad={loaded} onError={error} style={{ visibility: failed ? "hidden" : undefined }}/>;
}

export function WatchComparison() {
  const [pair, setPair] = useState(initialWatchPair);
  const [value, setValue] = useState(50);
  const [failed, setFailed] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);
  const dragging = useRef(false);
  const id = useId();
  const left = watchTreatments.find(treatment => treatment.id === pair.left)!;
  const right = watchTreatments.find(treatment => treatment.id === pair.right)!;
  const hasError = failed.includes(left.src) || failed.includes(right.src);
  const recordImage = useCallback((src: string, hasFailed: boolean) => {
    setFailed(current => hasFailed
      ? current.includes(src) ? current : [...current, src]
      : current.includes(src) ? current.filter(image => image !== src) : current);
  }, []);

  function choose(side: keyof WatchPair, treatment: WatchTreatmentId) {
    dragging.current = false;
    setPair(current => changeWatchPair(current, side, treatment));
  }

  function retry() {
    setFailed(current => current.filter(src => src !== left.src && src !== right.src));
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
      <div className="showcase-frame showcase-comparison-frame"
        onPointerDown={event => {
          if (!event.isPrimary || event.button !== 0) return;
          // Pointer capture keeps the divider moving outside the frame, but does
          // not cancel the browser's text-selection gesture on its own.
          if (event.pointerType !== "touch") event.preventDefault();
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          update(event);
        }}
        onPointerMove={event => { if (dragging.current) update(event); }}
        onPointerUp={() => { dragging.current = false; }}
        onPointerCancel={() => { dragging.current = false; }}
        onLostPointerCapture={() => { dragging.current = false; }}>
        <WatchPhoto key={`right-${right.src}-${attempt}`} src={right.src} alt={right.alt} failed={failed.includes(right.src)} onResult={recordImage}/>
        <div className="showcase-after" style={{ clipPath: `inset(0 ${100-value}% 0 0)` }}>
          <WatchPhoto key={`left-${left.src}-${attempt}`} src={left.src} alt={left.alt} failed={failed.includes(left.src)} onResult={recordImage}/>
        </div>
        <span className="showcase-image-label showcase-image-label-left">{left.title}</span>
        <span className="showcase-image-label showcase-image-label-right">{right.title}</span>
        <span className="showcase-divider" style={{ left: `${value}%` }} aria-hidden="true"><span>‹ ›</span></span>
        {hasError && <div className="watch-image-status" role="status">
          <span>A treatment could not load.</span>
          <button className="watch-image-retry" type="button" onPointerDown={event => event.stopPropagation()} onClick={retry}>Retry images</button>
        </div>}
      </div>
      <figcaption className="showcase-range-caption"><label htmlFor={`${id}-range`}>Drag to compare</label><span>Or use the arrow keys</span></figcaption>
      <input id={`${id}-range`} className="showcase-range" type="range" min={0} max={100} value={value} aria-label="Compare watch treatments" aria-describedby={`${id}-pair`} aria-valuetext={`${value}% ${left.title}; ${100-value}% ${right.title}`} onChange={event => setValue(Number(event.target.value))}/>
    </figure>
  </div>;
}
