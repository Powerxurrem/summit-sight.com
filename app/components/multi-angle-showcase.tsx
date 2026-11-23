import Image from "next/image";
import type { MultiAngleStudy } from "../lib/work";
import { SequenceViewer } from "./showcases";
import "./multi-angle-showcase.css";

export function MultiAngleShowcase({ study }: { study: MultiAngleStudy }) {
  return (
    <div className="angle-study">
      <div className="angle-study-comparison">
        <figure className="angle-study-original">
          <figcaption className="angle-study-label">
            {study.original.label}
          </figcaption>
          <div className="angle-study-source">
            {study.original.image ? (
              <Image
                src={study.original.image.src}
                alt={study.original.image.alt}
                fill
                draggable={false}
                sizes="(max-width: 760px) 90vw, 29vw"
              />
            ) : (
              <div className="angle-study-placeholder">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect x="5" y="7" width="30" height="26" rx="1" />
                  <circle cx="14" cy="16" r="3" />
                  <path d="m5 29 9-8 6 5 7-10 8 13" />
                </svg>
                <h3>{study.original.placeholderTitle}</h3>
                <p>{study.original.placeholderDescription}</p>
              </div>
            )}
          </div>
          <p className="angle-study-caption">{study.original.caption}</p>
        </figure>

        <span className="angle-study-flow" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M3 14h21m-7-7 7 7-7 7" />
          </svg>
        </span>

        <div className="angle-study-result">
          <h3 className="angle-study-label">{study.result.label}</h3>
          <SequenceViewer
            frames={study.result.frames}
            studyLabel={study.result.studyLabel}
          />
          <p className="angle-study-caption">{study.result.caption}</p>
        </div>
      </div>
      <p className="angle-study-disclosure">{study.disclosure}</p>
    </div>
  );
}
