"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import "./showcases.css";

const sizes = "(max-width: 760px) 90vw, 65vw";
type StudyImage = { src: string; alt: string };

export function BeforeAfter({ before, after, beforeAlt, afterAlt }: { before: string; after: string; beforeAlt: string; afterAlt: string }) {
  const [value, setValue] = useState(50);
  const dragging = useRef(false);
  const id = useId();
  function update(event: PointerEvent<HTMLDivElement>) { const bounds = event.currentTarget.getBoundingClientRect(); setValue(Math.round(Math.max(0, Math.min(100, (event.clientX - bounds.left) / bounds.width * 100)))); }
  return <figure className="showcase-compare"><div className="showcase-frame showcase-comparison-frame" onPointerDown={event => { if (!event.isPrimary || event.button !== 0) return; dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); update(event); }} onPointerMove={event => { if (dragging.current) update(event); }} onPointerUp={() => { dragging.current = false; }} onPointerCancel={() => { dragging.current = false; }} onLostPointerCapture={() => { dragging.current = false; }}><Image src={before} alt={beforeAlt} fill sizes={sizes} draggable={false}/><div className="showcase-after" style={{ clipPath: `inset(0 ${100-value}% 0 0)` }}><Image src={after} alt={afterAlt} fill sizes={sizes} draggable={false}/></div><span className="showcase-image-label showcase-image-label-left">Creative treatment</span><span className="showcase-image-label showcase-image-label-right">Studio study</span><span className="showcase-divider" style={{left:`${value}%`}} aria-hidden="true"><span>‹ ›</span></span></div><figcaption className="showcase-range-caption"><label htmlFor={id}>Drag to compare</label><span>Or use the arrow keys</span></figcaption><input id={id} className="showcase-range" type="range" min={0} max={100} value={value} aria-label="Reveal the creative treatment" aria-valuetext={`${value}% of creative treatment revealed`} onChange={event => setValue(Number(event.target.value))}/></figure>;
}

export function SequenceViewer({ frames, studyLabel = "Illustrated form study" }: { frames: StudyImage[]; studyLabel?: string }) {
  const [index,setIndex] = useState(0);
  const drag = useRef<{x:number;index:number;pointerId:number}|null>(null);
  const id = useId();
  if (!frames.length) return null;
  const current = Math.min(index, frames.length-1);
  const move = (offset:number) => setIndex((current+offset+frames.length)%frames.length);
  return <figure className="showcase-sequence"><div className="showcase-frame showcase-draggable" aria-describedby={id} onPointerDown={event => { if(frames.length<2 || !event.isPrimary || event.button!==0) return; drag.current = {x:event.clientX,index:current,pointerId:event.pointerId}; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={event => {const start=drag.current; if(!start || start.pointerId!==event.pointerId) return; const steps=Math.trunc((event.clientX-start.x)/24); setIndex(((start.index-steps)%frames.length+frames.length)%frames.length);}} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}}><Image src={frames[current].src} alt={frames[current].alt} fill sizes={sizes} draggable={false}/><span className="showcase-image-label showcase-image-label-left">{studyLabel}</span></div><figcaption className="showcase-toolbar"><button className="showcase-control" type="button" onClick={()=>move(-1)} disabled={frames.length<2} aria-label="Previous product angle">‹</button><span id={id}>Drag to explore <span className="showcase-muted" aria-live="polite">· {current+1} / {frames.length}</span></span><button className="showcase-control" type="button" onClick={()=>move(1)} disabled={frames.length<2} aria-label="Next product angle">›</button></figcaption><input className="showcase-range" type="range" min={0} max={frames.length-1} value={current} disabled={frames.length<2} aria-label="Select product angle" aria-valuetext={`Angle ${current+1} of ${frames.length}`} onChange={event=>setIndex(Number(event.target.value))}/></figure>;
}

export function VideoCard({src,poster,title,caption}:{src:string;poster:string;title:string;caption:string}) {
  const [failed,setFailed] = useState(false);
  const id = useId();
  return <figure className="showcase-video-card"><div className="showcase-video"><video src={src} poster={poster} controls playsInline preload="none" aria-label={title} aria-describedby={id} onError={()=>setFailed(true)} onCanPlay={()=>setFailed(false)}/>{failed && <div className="showcase-video-error" role="status"><strong>This film could not be loaded.</strong><span>Check your connection, or <a href={src} target="_blank" rel="noreferrer">open the video file</a>.</span></div>}</div><figcaption className="showcase-video-caption"><h3>{title}</h3><p id={id}>{caption}</p></figcaption></figure>;
}

export function MediaGallery({items}:{items:(StudyImage & {title:string;category:string})[]}) {
  const [selected,setSelected] = useState<number|null>(null);
  const modal = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement|null>(null);
  const titleId = useId();
  const isOpen = selected!==null && items.length>0;
  const item = selected===null ? undefined : items[selected%items.length];
  const move = (offset:number) => {if(items.length) setSelected(value=>((value??0)+offset+items.length)%items.length);};
  useEffect(()=>{ const dialog=modal.current; if(!dialog) return; if(!isOpen){if(dialog.open) dialog.close();return;} const previous=document.body.style.overflow;document.body.style.overflow="hidden";if(!dialog.open)dialog.showModal();return()=>{document.body.style.overflow=previous;};},[isOpen]);
  return <><div className="showcase-gallery">{items.map((entry,index)=><button type="button" className="showcase-gallery-card" key={entry.src} aria-label={`Open ${entry.title}`} onClick={event=>{trigger.current=event.currentTarget;setSelected(index);}}><span className="showcase-thumb"><Image src={entry.src} alt={entry.alt} fill sizes="(max-width:700px) 90vw, 33vw"/><span className="showcase-gallery-expand" aria-hidden="true">↗</span></span><span className="showcase-card-copy"><span><small>{entry.category}</small><strong>{entry.title}</strong></span><span aria-hidden="true">↗</span></span></button>)}</div><dialog ref={modal} className="showcase-dialog" aria-labelledby={titleId} onClose={()=>{setSelected(null);trigger.current?.focus();}} onClick={event=>{if(event.target===event.currentTarget)event.currentTarget.close();}} onKeyDown={event=>{if(event.key==="ArrowLeft"||event.key==="ArrowRight"){event.preventDefault();move(event.key==="ArrowLeft"?-1:1);}}}>{item&&<div className="showcase-lightbox"><div className="showcase-lightbox-header"><div><small>{item.category}</small><h3 id={titleId}>{item.title}</h3></div><button type="button" className="showcase-control" autoFocus aria-label="Close image viewer" onClick={()=>modal.current?.close()}>×</button></div><div className="showcase-lightbox-image"><Image src={item.src} alt={item.alt} fill sizes="95vw"/></div><div className="showcase-toolbar"><button type="button" className="showcase-control" aria-label="Previous gallery image" disabled={items.length<2} onClick={()=>move(-1)}>‹</button><span aria-live="polite">{(selected??0)+1} / {items.length}</span><button type="button" className="showcase-control" aria-label="Next gallery image" disabled={items.length<2} onClick={()=>move(1)}>›</button></div></div>}</dialog></>;
}

export function TransformationTabs({items}:{items:(StudyImage & {title:string})[]}) {
  const [selected,setSelected] = useState(0);
  const buttons = useRef<(HTMLButtonElement|null)[]>([]);
  const id=useId();
  if(!items.length)return null;
  const current=Math.min(selected,items.length-1);
  function onKey(event:KeyboardEvent<HTMLButtonElement>,index:number){let next:number;if(event.key==="ArrowRight")next=(index+1)%items.length;else if(event.key==="ArrowLeft")next=(index-1+items.length)%items.length;else if(event.key==="Home")next=0;else if(event.key==="End")next=items.length-1;else return;event.preventDefault();setSelected(next);buttons.current[next]?.focus();}
  return <div className="showcase-transformations"><div className="showcase-tabs" role="tablist" aria-label="Conceptual environment studies">{items.map((entry,index)=><button key={entry.src} type="button" role="tab" ref={node=>{buttons.current[index]=node;}} id={`${id}-tab-${index}`} aria-controls={`${id}-panel`} aria-selected={current===index} tabIndex={current===index?0:-1} onClick={()=>setSelected(index)} onKeyDown={event=>onKey(event,index)}>{entry.title}</button>)}</div><div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${current}`} tabIndex={0}><div className="showcase-frame"><Image src={items[current].src} alt={items[current].alt} fill sizes={sizes}/><span className="showcase-image-label showcase-image-label-left">Conceptual environment study</span></div></div></div>;
}
