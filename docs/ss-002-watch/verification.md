# SS-002 watch refresh - verification

Date: 21 November 2026.

## Passed

- `npm.cmd run build`: production compilation, TypeScript and static page generation passed.
- `PREVIEW_URL=http://localhost:3100 node scripts/verify-site.mjs`: all six routes, navigation, metadata, landmarks, existing media budgets, legacy 404s, milk/soap configuration and Next image optimization passed against the running local preview after the loading fix.
- `node --test scripts/watch-image-loading.test.mjs`: five tests passed for warm-cache completion without another load event, pre-hydration failure, cold load/error/recovery, listener cleanup on rapid switching and a fresh retry. Tests use Node EventTarget image doubles, not a browser DOM.
- Five rapid HTTP refresh cycles passed for Work markup and both fully decoded active images. Both home and Work markup now show eager active images and an enabled native range on initial render. Every JavaScript chunk referenced by the live Work page returned 200 after the production build. These are HTTP checks, not simulated browser refreshes.
- Targeted production HTTP checks: both comparison sections render labelled left/right native selects, each with Wet rock, Presentation box, Business wrist and Studio study. The default remains studio-base/rock-overlay with descriptive alt text, responsive image markup, live pair status, original AI-generated concept disclosure and an accessible native range. The Work section renders all four treatment tabs.
- Exhaustive selection-logic assertions: all 12 ordered pairs are reachable. Every one of the 96 combinations of valid pair, side and selected treatment retains distinct valid images. Selecting the opposite side's image swaps the pair correctly. These test the pure selection helper, not browser event dispatch.
- Full decode of all four final WebPs: each is 1254 by 1254. Final byte sizes and SHA-256 values match the asset manifest. Next image optimization fully decoded at 384, 750 and 1080 pixels for every image.
- Source preservation comparison: the approved studio, wet-rock and presentation-box files remain byte-identical. All pre-existing dirty files other than the intentionally edited Work page retain their baseline SHA-256 hashes. All home and Work page content outside the comparison sections exactly matches the start-of-task files. Existing milk, soap, fragrance gallery/hero and motion content was retained.
- `git diff --check`: passed.

## Visual asset review

Reviewed all four generated photographs. The watch has an unlettered blue dial, gold baton markers/hands, a polished steel case and a steel bracelet with gold accents. No visible logo, brand name or watermark was found. The box has a navy suede cushion, metal rim, visible hinges and raised lid. Business wrist shows an adult man's wrist, charcoal tailoring and a white shirt cuff, with clear dial visibility and a bracelet that wraps around the wrist. Native-size review checked visible anatomy, skin/metal contact, cuff intersection, reflections and accidental branding. The watch's dial placement, scale, case and crown closely align across treatments; the cushion and wrist necessarily change bracelet curvature. No claim of calibrated geometry or manufactured product fidelity is made.

The square comparison and treatment frames are scoped to this study. The WatchComparison client component retains pointer capture/cancellation, vertical touch scrolling and a native keyboard range. Pair changes retain the divider position, update visible labels and accessible value text, and leave focus on the changed select. The loading fix replaces the opaque cover with a small bottom badge and leaves the native range enabled. Cached images are inspected on attachment; native load/error listeners have stable ref registration and cleanup. Failed images are hidden to suppress broken-image glyphs, and Retry images remounts the pair without changing selection or divider position. Select and retry controls are at least 44 pixels tall. These browser behaviors were implemented and reviewed in source. The original shared BeforeAfter component and existing tab component were not edited.

The business-wrist addition uses the existing data-driven selectors and tabs without component or CSS edits.

## Loading defect evidence

The user supplied a screenshot with the comparison indefinitely covered by Preparing your comparison. The old component depended on two Next Image callbacks to remove that opaque cover. Its inline error handlers changed identity on every state update. Inspection of the installed Next 16.2 `image-component.js` and `use-merged-ref.js` showed that changing the error callback can reattach the image ref and reassign `img.src`; this is a plausible cause of refresh flashing and interrupted completion. The exact browser event sequence behind the screenshot was not directly reproduced. All current live script and optimized-image requests returned 200. The fix removes that callback/ref-reset path and the blocking loading gate.

## Browser limit and local review

The current CUA attempt returned `The browser access host is unavailable` and no browser connection. The user's screenshot establishes the original symptom; no new rendered-page screenshot, browser refresh sequence, pointer/touch dispatch or viewport inspection has been verified. HTTP/markup and unit checks do not establish browser interaction or visual QA, or prove the observed flash is gone.

For review, start `npm.cmd run dev -- --port 3100` and open `/` and `/work#transformations`. Check desktop, tablet, 390px and 320px widths, full-watch visibility, readable copy, all 12 ordered image pairs, four-tab wrapping, opposite-side swaps, retained divider position, image loading/failure recovery, divider dragging/cancellation, keyboard range endpoints, treatment-tab ArrowLeft/Right/Home/End, focus and vertical touch scrolling.

No dependencies, environment settings, deployment configuration, remote, push, merge or production deployment were changed. Earlier uncommitted work remains separate from the watch refresh.
