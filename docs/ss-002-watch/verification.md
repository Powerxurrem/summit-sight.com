# SS-002 watch refresh - verification

Date: 21 November 2026.

## Passed

- `npm.cmd run build`: production compilation, TypeScript and static page generation passed.
- `PREVIEW_URL=http://localhost:3100 node scripts/verify-site.mjs`: all six routes, navigation, metadata, landmarks, existing media budgets, legacy 404s, milk/soap configuration and Next image optimization passed against the running local preview after the loading fix.
- `node --test scripts/watch-comparison.test.mjs`: three tests passed using real React server rendering of the actual component. They verify direct committed image URLs with no loading gate, enabled controls with four options and the original default pair, and ten fresh renders without pending/loading markup. The old observer helper and EventTarget tests were removed.
- Live home and Work HTTP checks confirm the comparison uses direct local WebP URLs, has no loading/pending badge or busy attribute and keeps the native range enabled. All four direct image responses fully decoded at 1254 pixels. These are HTTP/server-render checks, not simulated browser refreshes.
- Targeted production HTTP checks: both comparison sections render labelled left/right native selects, each with Wet rock, Presentation box, Business wrist and Studio study. The default remains studio-base/rock-overlay with descriptive alt text, responsive image markup, live pair status, original AI-generated concept disclosure and an accessible native range. The Work section renders all four treatment tabs.
- Exhaustive selection-logic assertions: all 12 ordered pairs are reachable. Every one of the 96 combinations of valid pair, side and selected treatment retains distinct valid images. Selecting the opposite side's image swaps the pair correctly. These test the pure selection helper, not browser event dispatch.
- Full decode of all four final WebPs: each is 1254 by 1254. Final byte sizes and SHA-256 values match the asset manifest. Next image optimization fully decoded at 384, 750 and 1080 pixels for every image.
- Source preservation comparison: the approved studio, wet-rock and presentation-box files remain byte-identical. All pre-existing dirty files other than the intentionally edited Work page retain their baseline SHA-256 hashes. All home and Work page content outside the comparison sections exactly matches the start-of-task files. Existing milk, soap, fragrance gallery/hero and motion content was retained.
- `git diff --check`: passed.

## Visual asset review

Reviewed all four generated photographs. The watch has an unlettered blue dial, gold baton markers/hands, a polished steel case and a steel bracelet with gold accents. No visible logo, brand name or watermark was found. The box has a navy suede cushion, metal rim, visible hinges and raised lid. Business wrist shows an adult man's wrist, charcoal tailoring and a white shirt cuff, with clear dial visibility and a bracelet that wraps around the wrist. Native-size review checked visible anatomy, skin/metal contact, cuff intersection, reflections and accidental branding. The watch's dial placement, scale, case and crown closely align across treatments; the cushion and wrist necessarily change bracelet curvature. No claim of calibrated geometry or manufactured product fidelity is made.

The square comparison and treatment frames are scoped to this study. The WatchComparison client component retains pointer capture/cancellation, vertical touch scrolling and a native keyboard range. Pair changes retain the divider position, update visible labels and accessible value text, and leave focus on the changed select. Each selected image is a native image element keyed by source and retry attempt, using the already compressed local WebP directly. There is no loading/readiness state and no pending badge. Cached completion is checked after mounting; native load/error callbacks update failure status only. Failed images are hidden to suppress broken-image glyphs, and Retry images remounts the pair without changing selection or divider position. Select and retry controls are at least 44 pixels tall. These browser behaviors were implemented and reviewed in source. The original shared BeforeAfter component and existing tab component were not edited.

The business-wrist addition uses the existing data-driven selectors and tabs without component or CSS edits.

## Loading defect evidence

The user supplied a screenshot with the comparison indefinitely covered by Preparing your comparison. An initial fix removed that cover and added native event observation, but the user reported Loading images still remained. The exact browser event sequence behind either report was not directly reproduced. Direct WebPs, optimized URLs and referenced scripts all returned 200 in HTTP checks. The current fix removes both the custom readiness observer and pending state, and uses the known-valid committed image files directly. The comparison therefore emits no loading notice even before client hydration. Real failures retain an explicit retry path.

## Browser limit and local review

The user reported that the buttons and comparison slider also did not respond. This broadened the investigation to client startup; the earlier image-loading changes did not establish that the reported problem was resolved.

The development log recorded Next rejecting `/_next/webpack-hmr` requests from the local preview host `10.5.0.2`. A request for an actual page script with `Origin: http://10.5.0.2:3100` also reproduced `403 Unauthorized`. Following the installed Next 16.2 `allowedDevOrigins` documentation, `next.config.ts` now allows that specific development host. Next automatically restarted on the config change. Afterward, all 19 script URLs referenced by `/work` returned JavaScript with status 200 under the same Origin header; a cross-site script request with that host as Referer also returned 200, and the HMR WebSocket handshake with that Origin returned 101. A script request from `unrelated.invalid` still returned 403. Production build passed with the config change. These checks establish that the reproduced origin block is corrected, but do not prove it caused every inactive control or that browser hydration now succeeds.

After the origin fix, the user completed the requested hard-refresh and explicitly confirmed that both the watch selectors and slider work. They also reported nothing clearly red in the Firefox console. This establishes user-confirmed control recovery; it does not establish that every console message or the earlier icon flash was independently inspected.

The most recent CUA attempt stopped because browser URL-policy enforcement is unsupported for the current Windows browser. No new rendered-page screenshot, automated pointer/touch dispatch or viewport inspection has been verified. Browser interaction confirmation above comes from the user's check; HTTP/server-render checks alone do not establish it.

For review, start `npm.cmd run dev -- --port 3100` and open `/` and `/work#transformations`. Check desktop, tablet, 390px and 320px widths, full-watch visibility, readable copy, all 12 ordered image pairs, four-tab wrapping, opposite-side swaps, retained divider position, image loading/failure recovery, divider dragging/cancellation, keyboard range endpoints, treatment-tab ArrowLeft/Right/Home/End, focus and vertical touch scrolling.

The only runtime configuration change is the specific local development-origin allowance above. No dependencies, environment variables, production hosting settings, remote, push, merge or production deployment were changed. Earlier uncommitted work remains separate from the watch refresh.
