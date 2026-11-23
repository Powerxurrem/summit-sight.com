"use client";

import Image, { getImageProps } from "next/image";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { ProductFrame } from "../lib/work";
import { dragFrameIndex, keyboardFrameIndex, wrapFrameIndex as wrap } from "../lib/turnaround-controls";
import "./sequence-viewer.css";

const imageSizes = "(max-width: 760px) 90vw, (max-width: 1440px) 55vw, 720px";

export function SequenceViewer({ frames, studyLabel }: { frames: ProductFrame[]; studyLabel: string }) {
  // A new content set gets fresh loading and interaction state, without remounting on rotation.
  return frames.length ? <SequencePlayer key={frames.map(frame => `${frame.src}:${frame.angle}`).join("|")} frames={frames} studyLabel={studyLabel}/> : null;
}

function SequencePlayer({ frames, studyLabel }: { frames: ProductFrame[]; studyLabel: string }) {
  const [index, setIndex] = useState(0);
  const [presentation, setPresentation] = useState<{ frame: ProductFrame; previous?: ProductFrame }>({ frame: frames[0] });
  const [active, setActive] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const container = useRef<HTMLElement>(null);
  const frameElement = useRef<HTMLDivElement>(null);
  const loads = useRef(new Map<string, Promise<void>>());
  const drag = useRef<{ x: number; y: number; index: number; pointerId: number; horizontal: boolean } | null>(null);
  const instructionId = useId();
  const rangeId = useId();
  const target = frames[index];
  const busy = target.src !== presentation.frame.src && failed !== target.src;

  useEffect(() => {
    if (!container.current) return;
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setActive(true); observer.disconnect(); }
    }, { rootMargin: "250px" });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    function load(frame: ProductFrame) {
      const cached = loads.current.get(frame.src);
      if (cached) return cached;
      const promise = new Promise<void>((resolve, reject) => {
        const image = new window.Image();
        const { props } = getImageProps({ src: frame.src, alt: frame.alt, fill: true, sizes: imageSizes });
        image.onload = () => {
          const decoded = image.decode ? image.decode() : Promise.resolve();
          decoded.then(resolve, reject);
        };
        image.onerror = () => reject(new Error(`Unable to load ${frame.src}`));
        image.sizes = props.sizes || imageSizes;
        image.srcset = props.srcSet || "";
        image.src = props.src;
      });
      loads.current.set(frame.src, promise);
      promise.catch(() => { loads.current.delete(frame.src); });
      return promise;
    }
    load(target).then(() => {
      if (cancelled) return;
      setFailed(null);
      setPresentation(previous => previous.frame.src === target.src ? previous : { frame: target, previous: previous.frame });
    }).catch(() => { if (!cancelled) setFailed(target.src); });
    // Only the two neighbors are prepared. Matching srcset/sizes reuses Next's responsive cache.
    for (const neighbor of new Set([wrap(index - 1, frames.length), wrap(index + 1, frames.length)])) {
      if (neighbor !== index) void load(frames[neighbor]).catch(() => {});
    }
    return () => { cancelled = true; };
  }, [active, attempt, frames, index, target]);

  function select(next: number) { setActive(true); setIndex(wrap(next, frames.length)); }
  function move(offset: number) { setActive(true); setIndex(value => wrap(value + offset, frames.length)); }
  function onKey(event: KeyboardEvent<HTMLElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (keyboardFrameIndex(event.key, index, frames.length) === null) return;
    event.preventDefault();
    setActive(true);
    setIndex(value => keyboardFrameIndex(event.key, value, frames.length) ?? value);
  }
  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (frames.length < 2 || !event.isPrimary || event.button !== 0) return;
    event.currentTarget.focus({ preventScroll: true });
    drag.current = { x: event.clientX, y: event.clientY, index, pointerId: event.pointerId, horizontal: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function rotate(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.horizontal) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        drag.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        return;
      }
      start.horizontal = true;
    }
    select(dragFrameIndex(start.index, dx, event.currentTarget.clientWidth, frames.length));
  }
  const shownIndex = frames.findIndex(frame => frame.src === presentation.frame.src);
  return (
    <figure className="showcase-sequence turnaround" ref={container}>
      <div className="showcase-frame showcase-draggable turnaround-frame" ref={frameElement} tabIndex={0} role="group" aria-label="Interactive product views" aria-describedby={instructionId} aria-busy={busy} onKeyDown={onKey} onPointerDown={startDrag} onPointerMove={rotate} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}>
        {presentation.previous && <Image src={presentation.previous.src} alt="" aria-hidden="true" fill sizes={imageSizes} draggable={false}/>}
        <Image key={`${presentation.frame.src}:${attempt}`} className="turnaround-current" src={presentation.frame.src} alt={presentation.frame.alt} fill sizes={imageSizes} draggable={false} loading={active ? "eager" : "lazy"} onError={() => setFailed(presentation.frame.src)}/>
        <span className="showcase-image-label showcase-image-label-left">{studyLabel}</span>
        {busy && <span className="turnaround-loading" role="status">Loading {target.angle}°…</span>}
        {failed === target.src && <div className="turnaround-error" role="status"><span>This view could not be loaded.</span><button type="button" onPointerDown={event => event.stopPropagation()} onClick={() => { frameElement.current?.focus({ preventScroll: true }); loads.current.delete(target.src); setFailed(null); setActive(true); setAttempt(value => value + 1); }}>Retry this view</button><span>Or choose another angle below.</span></div>}
      </div>
      <figcaption className="showcase-toolbar turnaround-toolbar">
        <button className="showcase-control" type="button" onClick={() => move(-1)} disabled={frames.length < 2} aria-label="Previous product angle">‹</button>
        <span className="turnaround-position" aria-live="polite" aria-atomic="true"><strong>{presentation.frame.angle}°</strong><span className="showcase-muted">View {shownIndex + 1} / {frames.length}</span></span>
        <button className="showcase-control" type="button" onClick={() => move(1)} disabled={frames.length < 2} aria-label="Next product angle">›</button>
      </figcaption>
      <label className="turnaround-instructions" id={instructionId} htmlFor={rangeId}>Drag to explore · Arrow keys to rotate · Home / End</label>
      <input id={rangeId} className="showcase-range" type="range" min={0} max={frames.length - 1} step={1} value={index} disabled={frames.length < 2} aria-label="Select product angle" aria-valuetext={`${target.angle} degrees, view ${index + 1} of ${frames.length}`} onKeyDown={onKey} onChange={event => select(Number(event.target.value))}/>
    </figure>
  );
}
