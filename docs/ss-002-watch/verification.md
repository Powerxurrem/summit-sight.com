# SS-002 watch refresh - verification

Date: 21 November 2026.

## Passed

- `npm.cmd run build`: production compilation, TypeScript and static page generation passed.
- `PREVIEW_URL=http://localhost:3102 node scripts/verify-site.mjs`: all six routes, navigation, metadata, landmarks, existing media budgets, legacy 404s, milk/soap configuration and Next image optimization passed.
- Targeted production HTTP checks: both comparison sections render labelled left/right native selects, each with Wet rock, Presentation box, Business wrist and Studio study. The default remains studio-base/rock-overlay with descriptive alt text, responsive image markup, live pair status, original AI-generated concept disclosure and an accessible native range. The Work section renders all four treatment tabs.
- Exhaustive selection-logic assertions: all 12 ordered pairs are reachable. Every one of the 96 combinations of valid pair, side and selected treatment retains distinct valid images. Selecting the opposite side's image swaps the pair correctly. These test the pure selection helper, not browser event dispatch.
- Full decode of all four final WebPs: each is 1254 by 1254. Final byte sizes and SHA-256 values match the asset manifest. Next image optimization fully decoded at 384, 750 and 1080 pixels for every image.
- Source preservation comparison: the approved studio, wet-rock and presentation-box files remain byte-identical. All pre-existing dirty files other than the intentionally edited Work page retain their baseline SHA-256 hashes. All home and Work page content outside the comparison sections exactly matches the start-of-task files. Existing milk, soap, fragrance gallery/hero and motion content was retained.
- `git diff --check`: passed.

## Visual asset review

Reviewed all four generated photographs. The watch has an unlettered blue dial, gold baton markers/hands, a polished steel case and a steel bracelet with gold accents. No visible logo, brand name or watermark was found. The box has a navy suede cushion, metal rim, visible hinges and raised lid. Business wrist shows an adult man's wrist, charcoal tailoring and a white shirt cuff, with clear dial visibility and a bracelet that wraps around the wrist. Native-size review checked visible anatomy, skin/metal contact, cuff intersection, reflections and accidental branding. The watch's dial placement, scale, case and crown closely align across treatments; the cushion and wrist necessarily change bracelet curvature. No claim of calibrated geometry or manufactured product fidelity is made.

The square comparison and treatment frames are scoped to this study. The new WatchComparison client component retains pointer capture/cancellation, vertical touch scrolling and a native keyboard range. Pair changes retain the divider position, update visible labels and accessible value text, and leave focus on the changed select. New images are covered until both selected files have loaded; failed images show a recovery message. Select controls are at least 44 pixels tall and stack below 420 pixels. These browser behaviors were implemented and reviewed in source. The original shared BeforeAfter component and existing tab component were not edited.

The business-wrist addition uses the existing data-driven selectors and tabs without component or CSS edits.

## Browser limit and local review

The latest CUA attempt, during the box addition, returned `The browser access host is unavailable` and no browser connection. This data-and-asset addition did not repeat that browser attempt. No rendered-page screenshot, physical browser playback, pointer/touch dispatch or viewport inspection has been verified. HTTP/markup and source checks do not establish browser interaction or visual QA.

For review, start `npm.cmd run dev -- --port 3100` and open `/` and `/work#transformations`. Check desktop, tablet, 390px and 320px widths, full-watch visibility, readable copy, all 12 ordered image pairs, four-tab wrapping, opposite-side swaps, retained divider position, image loading/failure recovery, divider dragging/cancellation, keyboard range endpoints, treatment-tab ArrowLeft/Right/Home/End, focus and vertical touch scrolling.

No dependencies, environment settings, deployment configuration, remote, push, merge or production deployment were changed. Earlier uncommitted work remains separate from the watch refresh.
