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
- Reusable interactive viewers: `app/components/showcases.tsx`.
- Optimized local media: `public/media/`.
- Asset origin and prompts: [docs/media-prompts.md](docs/media-prompts.md).

Add a service to the services array to update both home previews and the detail page. Add entries to selectedWork to update home previews and the Work gallery. Add media to `public/media/` and point the metadata at it. Replace the image-sequence array with actual product views when supplied. Add videos through VideoCard; use a local poster and H.264 MP4 for broad browser support.

The Original → Multi-Angle Result comparison is configured by `multiAngleStudy` in `app/lib/work.ts`. Its `original.image` is intentionally `null` until a genuine source photograph is supplied. Set it to `{ src: "/media/product-source.webp", alt: "Describe the supplied product photograph" }` to display a local source image. Replace `result.frames` with the corresponding product views, and update the captions, `result.studyLabel` and disclosure to accurately describe those assets. Both panels, the placeholder and the existing viewer controls are rendered by reusable components; no layout changes are needed for an asset swap.

All initial imagery is fictional concept material, identified as studio studies. The 12-angle viewer uses illustrated stills. The motion studies animate still images. No client affiliations, commercial results or 3D reconstruction accuracy are implied.

## Inquiry behavior and configuration

The prior website's public mailbox, `summit-sight@hotmail.com`, is retained in `studioEmail`. No verified web submission endpoint was found; mailbox deliverability has not been independently verified. The form validates five fields and prepares a draft link. The visitor opens an email app, then reviews and sends there. It never reports delivery. Copy and download alternatives support visitors without an email app. Long briefs avoid truncated mailto links and instruct visitors to paste or attach the full text.

Before launch, confirm the mailbox and set `SITE_URL` to the verified canonical origin in the existing Vercel environment. If absent, metadata uses Vercel's `VERCEL_PROJECT_PRODUCTION_URL`, then `http://localhost:3100` locally. This setting contains no secret. No environment files were changed or added.

If direct delivery is required later, connect a verified endpoint and implement server validation, abuse handling and genuine response/error states before changing delivery copy. No backend is needed for the current email-draft flow.

## Checks

```powershell
npm.cmd run lint
npm.cmd run build
node scripts/verify-site.mjs
```

Run the last check against a production preview on port 3100, or set `PREVIEW_URL`. It verifies page responses, navigation links, metadata, local media, removed-route 404s, media budgets, native control markup and responsive image optimization. It does not substitute for browser interaction or visual inspection.

See [docs/verification.md](docs/verification.md) for this delivery's verification and remaining browser QA.

## Deployment

No production deployment or merge is authorized by this rebuild. Review the dedicated rebuild branch and perform browser QA before HQ approves production deployment. Existing domain, Vercel connection, environment configuration and remote are unchanged.
