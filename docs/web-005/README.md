# WEB-005 — One scene, three worlds

Delivered locally on 24 November 2026. The Home page now has a Virtual Stage section immediately after **Ignition** and **A Universe Within**, before the services overview. Its anchor is `/#virtual-stage`. Both existing cinematic studies and all pre-existing public media remain unchanged.

The user subsequently authorized production publication of this showcase and its looping adjustment. [The release record](../releases/2026-11-24.json) identifies the existing GitHub/Vercel route and deployment verification method. The checks below describe the validated local release candidate; public deployment is verified separately against the pushed commit and canonical domain.

## Presentation

This uses the **individual synchronized comparison**, with native video elements for the clay foundation and the selected cinematic world. It does not use the four-way comparison fallback. Three touch-friendly buttons select Drowned Cathedral, Forgotten Sanctuary and Singularity Engine. On narrow screens the world is full width; **Compare original** reveals a full-width clay panel below it. All frames retain their 16:9 aspect ratio.

The supplied headline, eyebrow, description and brief Blender-plus-AI explanation are included. Section 01 remains Cinematic Studies; the new gallery is 02. No removed image/motion sections were restored, and the Work page's existing numbering/navigation is unchanged.

Playback is muted, inline and explicitly started with Play. After Play, the clay and selected world keep looping together. There is no automatic initial playback or video source, including for reduced motion and data-saving visitors. Posters are real matching frame-60 images. Once requested, only clay and the currently selected world load; other world videos wait for selection. Pause/Play controls apply to both panels. Leaving the world frame sufficiently offscreen, hiding the browser tab or enabling reduced motion pauses both; resuming requires Play. A blocked play leaves the control operable. A media failure exposes Retry and a direct selected-film link; no-JavaScript visitors receive direct links to all clips.

World changes hold the current clay timeline position, replace only the right-hand source, seek the selected world to that held position, wait for both clips and resume only if playback was active. Buffering holds both panels and aligns them before resuming. At each ending, the shared controller returns both videos to zero and restarts them together, retaining the footage and Pause control on screen. Duplicate or stale end events are ignored, and pausing cancels a pending restart. Selection, seeking and play work use cancellation and operation generations to prevent obsolete asynchronous work from taking over. There are no playback timers, continuous seeks, independent native loops, interpolation or frontend video dependencies. The original clip content is unchanged; a brief boundary pause is possible, so seamless looping is not claimed.

## Exact sources

All completed B delivery files below are under:

`C:\Users\summi\Desktop\projects\cinema-lab-b\.workspace-b\web-motion-002\finished-v1`

| Role | Exact path relative to that directory |
| --- | --- |
| Matched clay interval | `source\shared-clay-interval.mp4` |
| Drowned web / inspected master / supplied poster | `impossible-gallery-drowned-cathedral-web.mp4`, `impossible-gallery-drowned-cathedral-master.mp4`, `impossible-gallery-drowned-cathedral-poster.png` |
| Sanctuary web / inspected master / supplied poster | `impossible-gallery-forgotten-sanctuary-web.mp4`, `impossible-gallery-forgotten-sanctuary-master.mp4`, `impossible-gallery-forgotten-sanctuary-poster.png` |
| Engine web / inspected master / supplied poster | `impossible-gallery-singularity-engine-web.mp4`, `impossible-gallery-singularity-engine-master.mp4`, `impossible-gallery-singularity-engine-poster.png` |
| Inspected comparison, unused by website | `impossible-gallery-clay-three-worlds-comparison.mp4` |
| Timing / preservation / file receipts | `source\shared-interval.json`, `source\source-preservation.json`, `technical-finishing.json`, `final-manifest.json` |

The full original clay is `C:\Users\summi\Desktop\projects\cinema-lab-stage\stage-output\vs016a-clay-002\review\impossible-gallery-clay.mp4`. Its staged B copy is `C:\Users\summi\Desktop\projects\cinema-lab-b\inputs\web-motion-002\impossible-gallery-clay.mp4`. Both currently hash to `0fda85a8b3eb377e3705a7eff157cdaad602f48e383c029c58d420b14cd7362f`, matching B's preservation receipt.

The authoritative shared interval is original zero-based indices **[71, 192)**, one-based frames **72–192 inclusive**, original seconds **[71/24, 8)**. It contains **121 frames at 24 fps**, with encoded duration **121/24 = 5.041666667 seconds** and last sample at website second 5. For every website clip, original source time is `websiteTime + 71/24`. The matched clay delivery is already trimmed and cropped to 1920×1080; it must not receive another source offset or four-row crop. The website only scales it to 1280×720 and encodes H.264/yuv420p with fast-start. The three existing 1280×720 web clips are copied byte-for-byte. No clips are retimed.

## Website-owned files

| Path in `public/media/virtual-stage/` | Video bytes | Poster bytes |
| --- | ---: | ---: |
| `clay.mp4` / `clay-poster.webp` | 905,103 | 38,578 |
| `drowned-cathedral.mp4` / `drowned-cathedral-poster.webp` | 2,645,703 | 135,086 |
| `forgotten-sanctuary.mp4` / `forgotten-sanctuary-poster.webp` | 3,446,266 | 180,882 |
| `singularity-engine.mp4` / `singularity-engine-poster.webp` | 1,782,009 | 82,302 |

All four website videos are silent H.264/yuv420p, 1280×720, 121 frames, 24 fps and fast-start. Posters are WebP, 1280×720, derived from corresponding interval frame 60. [The manifest](media-manifest.json) records exact absolute source paths, receipt hashes, source/website hashes, FFprobe output, derivation arguments, sizes and timing. [The contact sheet](poster-contact-sheet.jpg) shows clay/drowned above sanctuary/engine; it is an asset review, not a website screenshot.

Website implementation: `app/page.tsx`, `app/components/virtual-stage.tsx`, `app/components/virtual-stage.module.css`, `app/lib/virtual-stage.ts`, `app/lib/comparison-player.ts`. Preparation/verification: `scripts/prepare-virtual-stage.mjs`, `scripts/comparison-player.test.mjs`, `scripts/verify-virtual-stage.mjs`; existing `scripts/verify-cinematic-studies.mjs` and `scripts/verify-site.mjs` now account for the new Home videos and their explicit media budget. `README.md` documents preview and checks.

## Verification and limits

- Production build and TypeScript: passed.
- ESLint and Git whitespace check: passed.
- Node regression tests: 31 passed, including 13 comparison lifecycle tests for initial deferral, timeline-preserving selection, rapid switches, pause/resume, hidden/offscreen/reduced-motion events, blocked play, buffering, repeated coordinated loops, stale end events, loop cancellation and media failure recovery. These use mock video events and do not establish browser behavior.
- Media: all eight production videos inspected with FFprobe; all four website clips fully decoded; all 121 per-frame timestamps checked against `index/24`; website hashes, fast-start, HTTP byte ranges and poster decoding verified.
- Production HTTP preview on port 3101: all six pages, navigation, media, prior showcase preservation, client script delivery, markup, exact served media hashes and existing verification scripts passed.
- B/C source files and production receipts were read only. Preparation used no inference, cloud resources, dependency changes or source-footage replacement. The subsequent production push is covered by the user's separate release authorization above.

Browser inventory returned **“The browser access host is unavailable.”** Rendered desktop/mobile layouts, real pointer/keyboard interactions, actual network loading behavior, preference emulation, console output and continuous synchronized playback remain unverified. Timing evidence supports a common source interval; it does not prove exact generated geometry, frame-locked playback across two browser decoders, continuous temporal quality or HQ creative approval. The generated assets remain production candidates under B's review boundary.

For remaining browser QA, visit `/#virtual-stage` at desktop, 760px, 390px and 320px widths. Check all three selections before and during playback, rapid selection, pause while loading, repeated loop boundaries, pausing during a loop restart, offscreen/tab-hide behavior, reduced motion, blocked playback and mobile Compare original. Verify no overflow, footage remains readable, buttons have visible keyboard focus, both videos hold/resume together and inactive world videos do not load before selection. Check the browser console and confirm Ignition/A Universe Within still behave as before.
