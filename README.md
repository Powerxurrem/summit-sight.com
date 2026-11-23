# Summit Sight

An independent creative production studio website. Next.js 16.2, React 19, TypeScript and Tailwind CSS 4. Six static pages, structured local content and reusable client components. Existing Vercel configuration and Git remote are retained. No database, CRM, accounts, analytics or new runtime dependencies.

## Local preview

```powershell
npm.cmd install
npm.cmd run dev -- --port 3100
```

Open http://localhost:3100. Use `npm` on systems without PowerShell's script restriction. For a production preview:

```powershell
npm.cmd run build
npm.cmd run start -- --port 3100
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Cinematic landing page, selected work, four service previews, comparison |
| `/services` | Four service details with applications, inputs and deliverables |
| `/work` | Image lightbox, before/after, environment tabs, image-sequence viewer, videos |
| `/how-it-works` | Five proposed production stages and briefing guidance |
| `/about` | Independent studio positioning and creative principles |
| `/contact` | Validated inquiry draft, copy and text-download options |

Obsolete product, book, software and arcade routes have been removed. History remains recoverable from the original commit. The separate `oddloop-mobile/` directory remains untouched and is excluded from this web app's checks.

## Content and media

- Services and workflow: `app/lib/content.ts`.
- Selected work, transformation sets, image sequence: `app/lib/work.ts`.
- Reusable interactive viewers: `app/components/showcases.tsx`; the turnaround player is in `app/components/sequence-viewer.tsx`.
- Optimized local media: `public/media/`.
- Asset origin and prompts: [docs/media-prompts.md](docs/media-prompts.md).

Add a service to the services array to update both home previews and the detail page. Add entries to selectedWork to update home previews and the Work gallery. Add media to `public/media/` and point the metadata at it. Replace the image-sequence array with actual product views when supplied. Add videos through VideoCard; use a local poster and H.264 MP4 for broad browser support.

The Reference image → Interactive result showcase has two choices in `turnaroundStudies` in `app/lib/work.ts`: **Milk carton** (the unchanged default `multiAngleStudy`) and **Soap bottle** (`soapStudy`). Each has eight generated views. Milk uses `public/media/milk-turnaround/`; soap uses `public/media/soap-turnaround/`. `TurnaroundStudies` renders accessible tabs and only mounts the active study, resetting its viewer to the front when switching. Milk's front, nutrition, sunrise back and storage panels are preserved. Good Hands soap adds an opaque oxblood pump bottle with botanical front artwork and a dense back label. The fifth frame (180°) is the back in both sets.

To replace or add a study, configure `{ id, label, description, study }` in `turnaroundStudies`. Replace each study's `original.image` and `result.frames` together; frames have `{ src, alt, angle }`, with angles in degrees ordered around the product. Update captions, `result.studyLabel` and disclosure for the actual assets. A null source still displays the placeholder. No viewer changes are required for another customer-approved sequence.

The player supports pointer/touch dragging, wrapping arrows, a native angle slider, keyboard arrows and Home/End. Adjacent responsive images are prepared only as the viewer approaches the viewport or is used; image changes wait for decoding and respect reduced motion. All imagery is fictional concept material. Generated unseen surfaces and viewing angles are approximate. The older twelve illustrated SVGs are retained as unused legacy assets. Motion studies animate still images. No client affiliations, commercial results or 3D reconstruction accuracy are implied.

See the [milk contact sheet](docs/ss-002/milk-accepted-views.jpg), [four-face artwork](docs/ss-002/milk-packaging-artwork.webp), [visual review and verification](docs/verification.md), and [milk generation prompts](docs/ss-002/milk-generation-prompts.json). To regenerate WebP derivatives and the contact sheet from the original PNGs, set `SUMMIT_TURNAROUND_SOURCE_DIR` as recorded in [media-prompts.md](docs/media-prompts.md), then run `node scripts/prepare-milk-turnaround.mjs`. No generation backend or API key is needed to run the site. The earlier amber trial remains preserved as unused assets; `prepare-turnaround.mjs` rebuilds that historical trial.

The [soap contact sheet](docs/ss-002/soap-accepted-views.jpg), [front/back label artwork](docs/ss-002/soap-label-artwork.webp) and [soap prompts](docs/ss-002/soap-generation-prompts.json) document the second study. Run `node scripts/prepare-soap-turnaround.mjs` with the same source-directory environment variable to rebuild its derivatives. Product, formula and label copy are fictional; fine print and illustration details may vary across generated views.

## Inquiry behavior and configuration

The prior website's public mailbox, `summit-sight@hotmail.com`, is retained in `studioEmail`. No verified web submission endpoint was found; mailbox deliverability has not been independently verified. The form validates five fields and prepares a draft link. The visitor opens an email app, then reviews and sends there. It never reports delivery. Copy and download alternatives support visitors without an email app. Long briefs avoid truncated mailto links and instruct visitors to paste or attach the full text.

Before launch, confirm the mailbox and set `SITE_URL` to the verified canonical origin in the existing Vercel environment. If absent, metadata uses Vercel's `VERCEL_PROJECT_PRODUCTION_URL`, then `http://localhost:3100` locally. This setting contains no secret. No environment files were changed or added.

If direct delivery is required later, connect a verified endpoint and implement server validation, abuse handling and genuine response/error states before changing delivery copy. No backend is needed for the current email-draft flow.

## Checks

```powershell
npm.cmd run lint
npm.cmd run build
node --test scripts/turnaround-controls.test.mjs
node scripts/verify-site.mjs
```

The control tests use Node 24's built-in TypeScript support. Run the last check against a production preview on port 3100, or set `PREVIEW_URL`. It verifies page responses, navigation links, metadata, local media, removed-route 404s, media budgets, native control markup, reference/frame order, configuration, full image decoding, matching dimensions and responsive image optimization. It does not substitute for browser interaction or visual inspection.

See [docs/verification.md](docs/verification.md) for this delivery's verification and remaining browser QA.

## Deployment

No production deployment or merge is authorized by this rebuild. Review the dedicated rebuild branch and perform browser QA before HQ approves production deployment. Existing domain, Vercel connection, environment configuration and remote are unchanged.
