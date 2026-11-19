# SS-001 verification and handoff

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

All products are fictional studio concepts. The before/after is two generated treatments. The multi-angle sequence is an illustrated form study. Motion studies animate stills. Actual customer work, source product angles, finished commercial footage and any future advanced 3D reconstruction should be added only when available and accurately described.

Asset paths, origin and the built-in image-generation prompt set are recorded in [media-prompts.md](media-prompts.md). Content and launch instructions are in [README.md](../README.md).
