# SS-002 - Luxury watch comparison

Created 21 November 2026 using the built-in image-generation tool. Two original photographs of a fictional, unbranded luxury watch replace the fragrance comparison on the home and Work pages. The fragrance hero, gallery and motion studies remain separate concepts.

## Assets and provenance

- [Studio study](../../public/media/watch-study/studio.webp): pale limestone, soft neutral light, deep blue dial, steel case and bracelet with narrow gold accents.
- [Creative treatment](../../public/media/watch-study/creative.webp): the studio master conditioned an environment-and-lighting edit onto dark wet basalt with blue edge light and warm reflections.
- [Asset manifest](../../public/media/watch-study/manifest.json): source filenames, SHA-256 hashes, dimensions and final byte sizes.
- [Complete prompts](generation-prompts.json): exact built-in generation/edit prompts, source mapping and identity reference.

No third-party watch photograph was used. Visual review found no visible logo, brand name, watermark or dial lettering. The two images closely match the watch's placement, pose, case, hands, baton markers and bracelet links. Reflections change with the lighting. This is generated concept imagery, not a calibrated product photograph or an engineering design.

The final site loads only local WebP assets from `public/media/watch-study/`; no generation service or external image host is used at runtime. Both images are 1254 by 1254 pixels. The studio image is 159,104 bytes; the creative image is 334,138 bytes. The two originals remain preserved outside the repository at `C:\Users\summi\.codex\generated_images\01a1fda6-9d87-7740-a143-2ba75da92ee6`.

## Content and extension

`app/lib/watch-study.ts` supplies both comparisons, alt text, treatment tabs and the visible original AI-generated concept disclosure. Studio is the base image, with creative revealed on the left. The native range, pointer/touch dragging and keyboard controls are unchanged. Scoped CSS presents the entire watch in square frames at all viewport widths; the lower treatment viewer is capped at 720 pixels.

Future presentation-box, white-glove or suit-cuff settings can be added to `watchTreatments` once matching local imagery exists. The initial comparison remains studio versus creative. No future shots or placeholders are currently rendered.

## Rebuilding optimized files

With the two original PNGs available:

```powershell
$env:SUMMIT_WATCH_SOURCE_DIR='C:\Users\summi\.codex\generated_images\01a1fda6-9d87-7740-a143-2ba75da92ee6'
node scripts/prepare-watch-study.mjs
```

This only regenerates local WebP derivatives and their manifest using the existing Sharp dependency. It performs no image generation, downloads or installations.

See [verification.md](verification.md) for delivery checks and browser limits. No push, merge or deployment is included.
