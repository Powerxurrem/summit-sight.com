"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { TurnaroundStudy } from "../lib/work";
import { MultiAngleShowcase } from "./multi-angle-showcase";
import "./turnaround-studies.css";

export function TurnaroundStudies({ studies }: { studies: TurnaroundStudy[] }) {
  const [selectedId, setSelectedId] = useState(studies[0]?.id);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const selectedIndex = Math.max(0, studies.findIndex(study => study.id === selectedId));
  const selected = studies[selectedIndex];
  if (!selected) return null;

  function onKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % studies.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + studies.length) % studies.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = studies.length - 1;
    else return;
    event.preventDefault();
    setSelectedId(studies[next].id);
    buttons.current[next]?.focus();
  }

  return (
    <div className="angle-studies">
      <div className="angle-studies-picker">
        <p id={`${id}-label`} className="angle-studies-heading">Choose a product</p>
        <div className="angle-studies-tabs" role="tablist" aria-labelledby={`${id}-label`}>
          {studies.map((entry, index) => (
            <button
              key={entry.id}
              ref={node => { buttons.current[index] = node; }}
              type="button"
              role="tab"
              id={`${id}-tab-${entry.id}`}
              aria-controls={`${id}-panel`}
              aria-selected={selectedIndex === index}
              tabIndex={selectedIndex === index ? 0 : -1}
              onClick={() => setSelectedId(entry.id)}
              onKeyDown={event => onKey(event, index)}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${selected.id}`} aria-describedby={`${id}-description`} tabIndex={0} className="angle-studies-panel">
        <p id={`${id}-description`} className="angle-studies-description" aria-live="polite" aria-atomic="true">{selected.description}</p>
        <MultiAngleShowcase key={selected.id} study={selected.study}/>
      </div>
    </div>
  );
}
