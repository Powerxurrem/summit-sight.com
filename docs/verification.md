# Summit Sight verification and handoff

## Selectable milk and soap studies — current delivery

Date: 20 November 2026. Branch: `rebuild/ss-001-creative-studio`. Milk remains the default study and is preserved exactly. A second “Soap bottle” choice adds the fictional Summit Sight Good Hands 500 mL hand soap.

**Selector:** `app/components/turnaround-studies.tsx` renders a two-tab control from `turnaroundStudies` in `app/lib/work.ts`. Pointer activation and ArrowLeft/Right/Home/End select the study, with roving tab focus and an associated panel/description. Only one `MultiAngleShowcase` mounts at a time. Changing study replaces reference, frames, captions and disclosure together and resets the viewer to its front frame. Inactive study images are absent from rendered markup. The existing viewer and milk layout were not edited for this addition.

**Soap assets:** [front reference](../public/media/soap-turnaround/reference.webp), [eight-view review](ss-002/soap-accepted-views.jpg), [dense front/back artwork](ss-002/soap-label-artwork.webp), [manifest](../public/media/soap-turnaround/manifest.json), [prompts and correction](ss-002/soap-generation-prompts.json). Eight 1024×1024 WebPs total 361,728 bytes (353.25 KiB), plus a 53,076-byte reference copy. The dense back has story, directions, ingredients, care and barcode sections. Opaque material avoids internal-reflection ambiguity. Visual review checked label sides, readable upright main text, matched studio/framing and pump direction through front → right → back → left. One wrong-perspective 135° candidate was rejected and corrected. Small-copy reflow, illustration, pump length and perspective variation remain; the site discloses this and fictional product/formula copy.

**Preservation:** all ten milk files were compared by SHA-256 with their start-of-task baseline and are byte-identical. The complete `multiAngleStudy` configuration also matches its baseline exactly. Other page content, package dependencies/lockfile, environment, deployment/Git configuration and the mobile directory were preserved. No push, merge or production deployment.

**Passed:** production build including TypeScript; lint; four existing viewer-control logic tests; full HTTP/media verification against an owned temporary production server on port 3101. The smoke check validates both studies' 16 views, decoding, order, dimensions, budgets, source identity and optimized responses; all six pages, legacy-route 404s and all 53 public media/manifest files; two selector tabs with milk selected by default and one rendered panel; no inactive soap image elements; and existing controls/disclosures. The temporary server was stopped. `git diff --check` passed.

**Browser limitation:** the new inventory attempt again returned `The browser access host is unavailable`; no browser input was performed. Live tab switching, focus, frame reset, actual network loading, responsive layout and touch/keyboard dispatch remain unverified in a rendered browser. Static HTML and code review do not establish those runtime results. The image contact sheet is an asset review, not a website screenshot.

Preview with `npm.cmd run dev -- --port 3100`, then visit http://localhost:3100/work#multi-angle. In addition to the existing checklist, select both studies by pointer and keyboard; confirm reference and result always match, each selection starts at 0°, milk remains unchanged, only one tab is in the tab sequence, focus stays on the chosen tab, and the soap back is reached at the fifth frame. Check both choices at 320px/390px, tablet and desktop widths.

## SS-002 milk revision — preserved default study

Date: 20 November 2026. Branch: `rebuild/ss-001-creative-studio`. The user selected milk packaging after finding the amber trial's internal reflections and front/back distinction unconvincing. The earlier assets and notes remain preserved below; the website now uses the milk set.

**Delivered:** [milk reference](../public/media/milk-turnaround/reference.webp), [eight-view contact sheet](ss-002/milk-accepted-views.jpg), [four-face artwork](ss-002/milk-packaging-artwork.webp), [frame manifest](../public/media/milk-turnaround/manifest.json), [face specification](ss-002/milk-packaging.json) and [exact prompts/corrections](ss-002/milk-generation-prompts.json). Eight 1024×1024 WebPs total 403,364 bytes, with a separate 44,616-byte reference copy. `scripts/prepare-milk-turnaround.mjs` rebuilds the derivatives from the original generated PNGs.

**Visual review:** inspected all generated candidates and the final contact sheet. Fixed face roles and rotation order are: 0° front; 45° front + nutrition; 90° nutrition; 135° nutrition + back; 180° back; 225° back + storage; 270° storage; 315° storage + front. The fifth image now visibly shows “A FRESH PERSPECTIVE.” and the large sunrise landscape, with no front “WHOLE MILK” panel. Storage copy and barcode stay on the opposite side from nutrition. Headlines are readable, upright and attached to their intended faces. Opaque paperboard removes the glass/refraction ambiguity. First side candidates were corrected for width before acceptance. The matching studio, height, colors and gable structure were reviewed; minor perspective/width, small-copy reflow and illustration-detail variation remains. This is a fictional generated packaging concept, not measured geometry or production-ready label artwork.

**Website:** `multiAngleStudy` now points to `public/media/milk-turnaround/`, with new face-specific alternatives, captions and fictional label/nutrition disclosure. The reusable viewer, original dark layout and all other page content remain intact. The earlier amber files are no longer referenced by the current showcase. The smoke script discovers the active asset directory from the source configuration and checks the milk-specific caption/disclosure and absence of the old bottle paths.

**Verification:** production build and TypeScript passed; lint passed; all four existing control-logic tests passed. The full HTTP/media smoke check passed against an owned temporary production preview on port 3101: six pages, legacy-route 404s, all 43 media/manifest files, full frame decoding/dimensions/order/budgets, source identity, two initial showcase images, control markup and responsive optimization. The temporary server was stopped after checks. `git diff --check` passed. No dependencies, lockfile, environment, deployment configuration, Git/Vercel connection or mobile-directory changes; no push, merge or production deployment.

**Remaining browser limit:** another browser inventory attempt returned `The browser access host is unavailable`; no browser was available for automation. No native browser input was attempted in this revision, following the earlier unsupported-policy stop. The asset review is complete, but rendered responsive appearance and live pointer/touch/keyboard behavior have not been reverified. The runtime review checklist below still applies.

For preview, use `npm.cmd run dev -- --port 3100`, then open http://localhost:3100/work#multi-angle. Check the fifth frame/back and both side panels as well as wrapping, dragging, range keys, responsive layout and reduced motion.

## SS-002 — superseded amber trial

Date: 20 November 2026. Branch: `rebuild/ss-001-creative-studio`. This section supersedes the SS-001A placeholder and illustrated-sequence descriptions below, which are retained as historical notes.

The “Every angle. Considered.” section now pairs a real local demonstration reference with eight generated product views. The original premium charcoal design and headline are preserved. The reference/result media columns use a 35:65 ratio on desktop, with the source first on mobile. Other page content, comparison, gallery, tabs, videos and inquiry flow are preserved.

**Assets:** [front reference](../public/media/product-turnaround/reference.webp), [accepted-view contact sheet](ss-002/accepted-views.jpg), and [frame manifest](../public/media/product-turnaround/manifest.json). The source is an original fictional, unbranded amber fragrance concept. The reference is also the initial 0° frame. Seven additional views are conditioned on the front reference, with the accepted 45° view also supplied for the remaining angles. Final WebPs are all 1024×1024. The eight views total 289,528 bytes (about 283 KiB); the reference copy adds 35,374 bytes. No dependencies, models or generation backend were added. [Prompts](ss-002/generation-prompts.json) and [rebuild instructions](media-prompts.md) are included.

**Visual consistency review:** inspected each generated image and the assembled contact sheet. The rectangular amber body, thick glass base, short neck, cylindrical matte black cap, warm charcoal background and camera height remain recognizably consistent. Both narrow side views preserve the shallow body depth and wider cap. The product stays centered with closely matching vertical bounds. All faces remain unlabelled, without invented text or packaging claims. The unbranded, symmetric front/rear pairs naturally look similar. Small changes in glass reflections and cap width remain; the views and angles are artistic approximations, rather than calibrated geometry. No candidate had a gross silhouette, cap, color, framing or branding mismatch requiring exclusion. The website explicitly discloses fictional origin, generated unseen surfaces, approximate angles and the absence of measured reconstruction or commissioned customer work.

**Interaction implementation:** `MultiAngleShowcase` still reads `multiAngleStudy` from `app/lib/work.ts`; frames now have `{ src, alt, angle }`. `SequenceViewer` is implemented in its own client component and re-exported from `showcases.tsx`. It supports mouse/touch pointer dragging, pointer cancellation, wrapping previous/next buttons, a native range, keyboard arrows and Home/End, with angle and frame indicators. Horizontal gestures rotate; vertical gesture intent is left to page scrolling. Adjacent Next-optimized images are prepared near the viewport or on interaction. A selected view decodes before replacing the visible frame; a short reveal respects reduced motion. Failed views expose retry and allow selecting another view. These runtime behaviors have been implemented and reviewed in code; browser verification remains outstanding.

**Passed checks on the final implementation:**

- `npm.cmd run lint`: passed.
- `npm.cmd run build`: passed, including TypeScript and prerendering all six main pages.
- `node --test scripts/turnaround-controls.test.mjs`: four tests passed for repeated wrapping, keyboard endpoints/arrows, drag direction/thresholds at three widths and replacement sequence lengths. These are control-logic tests, not browser event tests. Node 24 emits a harmless module-type autodetection warning for the imported TypeScript helper; package settings were preserved.
- `PREVIEW_URL=http://localhost:3101 node scripts/verify-site.mjs`: passed against a temporary production server. All six pages returned 200, legacy routes returned 404 and all 33 public media/manifest files returned 200 within budgets. Every configured turnaround frame fully decoded, matched dimensions/order/manifest sizes and passed Next image optimization. HTML checks confirmed reference-before-result order, visible disclosure, keyboard control markup and only two initial images in the section.
- `git diff --check`: passed. Existing pages and unrelated configuration were checked for unintended source changes.

**Browser review limitation:** the current attempt again reported `The browser access host is unavailable`. Selecting the running Firefox window then stopped Computer Use because browser URL policy enforcement is unsupported for this Windows browser. No browser input was performed. Actual desktop/tablet/mobile layouts, touch/pointer event dispatch, keyboard focus, rapid image changes, network preloading, retry recovery and reduced-motion rendering have not been verified in a browser. No website screenshots were captured; the contact sheet is an asset review, not a rendered-page screenshot. The earlier browser limitation remains unresolved.

For local review, run `npm.cmd run dev -- --port 3100` and open http://localhost:3100/work#multi-angle. Check at desktop, tablet, 390px and 320px: source-first stacking/overflow; horizontal versus vertical touch gestures; dragging outside the frame and cancellation; 315° → 0° and 0° → 315° through arrows, keys and dragging; slider keys/Home/End; frame/angle agreement during slow loading and fast selections; broken-view retry; focus visibility; reduced motion; and network loading of only the initial/adjacent views before interaction. The full-site manual checklist below still applies before production approval.

**Preservation:** no push, merge, production deployment or environment/configuration change. Existing Git/Vercel connections, dependencies/lockfile and the separate mobile directory remain untouched. Production requires HQ approval. The temporary production verification server was stopped after checks; use the preview command above to review locally.

## Historical SS-001 handoff

Date: 19 November 2026. Branch: `rebuild/ss-001-creative-studio`.

## SS-001A — Multi-angle showcase polish

The “Every angle. Considered.” section now presents Original → Multi-Angle Result. The result viewer takes two-thirds of the desktop media width; the source and result stack in reading order at mobile widths. The existing drag, previous/next and range controls remain in the same SequenceViewer component.

The source panel uses a deliberate framed placeholder labelled “Source photograph to be added.” No original photograph has been invented or substituted. The result badge identifies a “12-view illustration · Concept study,” and the shared disclosure explains that the views are not derived from a source photograph, an actual customer result or a 3D reconstruction.

The reusable MultiAngleShowcase reads `multiAngleStudy` from `app/lib/work.ts`. A nullable source image, frames, placeholder copy, labels, captions and disclosure can all be replaced through that content object. The existing SequenceViewer now accepts its study label as a prop. No new assets, generation or dependencies were introduced.

Validation: production build and TypeScript passed; lint passed; the full HTTP/media smoke check passed against a temporary production preview on port 3101. Additional HTML checks confirmed source-before-result order, both labels, the explicit placeholder without a source image, the accuracy disclosure, all twelve angles and the existing arrow/range control markup. `git diff --check` passed. Rendered browser interaction and responsive appearance were not reverified; the earlier browser inspection limitation below remains unresolved.

## Repository preservation

The initial working tree was clean. The original site remains recoverable at commit `6c6e9cb` on `main`; no unrelated uncommitted work needed checkpointing. All replacement work is on the dedicated branch. The standalone mobile directory, package dependencies/lockfile, Next configuration, Git remote, existing environment configuration and Vercel connection were not modified. No push, production deployment or merge was performed.

## Implemented

- Six pages: home, services, work, how it works, about and contact.
- Four expandable service sections driven by local structured data, each covering outputs, applications, client inputs and deliverables.
- Cinematic charcoal/ivory/champagne design with original fragrance, audio and skincare concepts, editorial serif/sans typography and reduced-motion support.
- Pointer-driven comparison plus a native range for keyboard use.
- Twelve-angle illustrated image sequence with dragging, previous/next buttons and a native range.
- Native modal image gallery with close, Escape handling, arrow navigation and focus restoration.
- Keyboard-operable environment tabs, with left/right/Home/End support.
- Two real local MP4 motion studies with native play/pause, volume/mute and full-screen controls, `preload="none"`, posters and load-error states.
- Inquiry validation, draft review and mailto links, with copy/download alternatives and long-brief handling. No false delivery confirmation.
- Responsive navigation, skip link, landmarks, field labels, image alternatives, visible focus styles and page metadata.

## Passed checks

- `npm.cmd run lint`: success, no warnings or errors.
- `npm.cmd run build`: success, all six main pages prerendered as static pages. TypeScript passed. Initial stale `.next/dev/types` references to removed routes were cleared; the final build has no metadataBase warning.
- `node scripts/verify-site.mjs`: six pages return 200 with expected navigation, metadata and landmarks. Legacy routes return 404. All 23 local media files return 200 and meet the checked budgets. Responsive Next image optimization returns an image successfully. Expected native range, dialog, tab, video and form markup exists.
- `git diff --check`: no whitespace errors.
- No new runtime or development dependencies.

Total public concept media: approximately 1.87 MiB, including both videos and all twelve SVG views. Individual stills are below 170 KB; motion studies are approximately 518 KiB and 344 KiB. Below-fold images are lazy-loaded; the hero is preloaded; videos are not downloaded on page load.

## Browser inspection blocked

The browser automation inventory reported `The browser access host is unavailable`. Selecting the installed Windows Firefox through Computer Use then returned: `Computer Use has been stopped for this turn because browser URL policy enforcement is not yet supported for the current Windows browser.` UI automation stopped at that point, and no browser input was performed.

Consequently, actual rendered desktop/tablet/mobile layouts, touch/keyboard runtime behavior, video playback/full-screen and contact runtime states have **not** been visually verified. Desktop and mobile screenshots could not be captured. HTTP/source checks do not establish those results. This remains a required review step before production approval.

For manual review, run `npm.cmd run dev -- --port 3100`, open http://localhost:3100, and check:

1. All six navigation destinations, mobile menu and in-page anchors at desktop, tablet, 390px and 320px widths; watch for overflow.
2. Comparison dragging with mouse/touch, range keyboard arrows/Home/End, and aligned bottle framing.
3. Sequence drag, previous/next wraparound and keyboard angle selection.
4. Gallery open/close, Escape, arrow navigation, focus restoration and scroll lock.
5. Environment tabs by pointer and keyboard.
6. Both motion studies: play/pause, mute/unmute, native full-screen and load-error recovery. Studies have intentionally silent audio.
7. Contact: required and whitespace-only fields, malformed email, service preselection from Services links, non-ASCII/special characters, draft review, long brief, mailto, copy denial fallback and text download. Nothing should claim delivery.
8. Reduced-motion behavior, focus visibility, text readability and saved desktop/mobile screenshots.

## Launch configuration and sample limits

The studio mailbox comes from the previous site's public contact link and still needs HQ confirmation. There is no configured direct form-submission integration. `SITE_URL` should be set to the verified canonical origin in the existing Vercel environment before deployment; Vercel's production URL is used as a fallback.

All products are fictional studio concepts. The before/after is two generated treatments. The current multi-angle sequence is the SS-002 generated product study described above; its predecessor was an illustrated form study. Motion studies animate stills. Actual customer work, source product angles, finished commercial footage and any future advanced 3D reconstruction should be added only when available and accurately described.

Asset paths, origin and the built-in image-generation prompt set are recorded in [media-prompts.md](media-prompts.md). Content and launch instructions are in [README.md](../README.md).
