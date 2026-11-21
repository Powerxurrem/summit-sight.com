# SS-002 - Luxury watch comparison

Created 21 November 2026 using the built-in image-generation tool. Four original photographs of a fictional, unbranded luxury watch supply selectable comparisons on the home and Work pages. Presentation-box and business-wrist treatments were added after approval of the first pair. Each addition preserves the previous image files byte-for-byte. The fragrance hero, gallery and motion studies remain separate concepts.

## Assets and provenance

- [Studio study](../../public/media/watch-study/studio.webp): pale limestone, soft neutral light, deep blue dial, steel case and bracelet with narrow gold accents.
- [Creative treatment](../../public/media/watch-study/creative.webp): the studio master conditioned an environment-and-lighting edit onto dark wet basalt with blue edge light and warm reflections.
- [Presentation box](../../public/media/watch-study/presentation-box.webp): the same studio master conditioned an open navy presentation box, fitted suede cushion, metal trim, hinges and raised lid. This is an additional still treatment, not an opening animation.
- [Business wrist](../../public/media/watch-study/business-wrist.webp): the same studio master conditioned the watch onto an adult man's wrist, with a charcoal business suit and white shirt cuff. The bracelet wraps naturally around the wrist; the dial remains unobstructed.
- [Asset manifest](../../public/media/watch-study/manifest.json): source filenames, SHA-256 hashes, dimensions and final byte sizes.
- [Original pair prompts](generation-prompts.json), [box prompt](box-generation-prompt.json) and [wrist prompt](wrist-generation-prompt.json): exact built-in generation/edit prompts, source mapping and identity reference.

No third-party watch photograph was used. Visual review found no visible logo, brand name, watermark or dial lettering. All four images closely match the watch's dial placement, case scale, hands and baton markers. Bracelet curvature changes naturally for the cushion and wrist, and reflections change with the lighting. Wrist anatomy, the cuff intersection and the worn bracelet were reviewed at native resolution. This is generated concept imagery, not a calibrated product photograph or an engineering design.

The final site loads only local WebP assets from `public/media/watch-study/`; no generation service or external image host is used at runtime. All four images are 1254 by 1254 pixels. Studio is 159,104 bytes, wet rock is 334,138 bytes, the presentation box is 217,574 bytes and business wrist is 243,926 bytes. The originals remain preserved outside the repository at `C:\Users\summi\.codex\generated_images\01a1fda6-9d87-7740-a143-2ba75da92ee6`.

## Content and extension

`app/lib/watch-study.ts` supplies all treatments, the default pair, selection logic, alt text and the visible original AI-generated concept disclosure. `app/components/watch-comparison.tsx` renders two labelled native selects and a square comparison slider. Wet rock on the left and studio on the right remain the default. Either side can show any of the four treatments. Choosing the image currently on the other side swaps the pair; the divider position is retained. A live status describes the current pair, and slider value text identifies each treatment's reveal percentage. The two active images load eagerly; a small status badge leaves the images and slider usable during loading. Failed images have a retry button. The original shared `BeforeAfter` component was left untouched.

Scoped CSS preserves the full square watch framing, caps the lower treatment viewer at 720 pixels and stacks the 44-pixel-minimum select controls below 420 pixels. Work's full-image tabs include all four settings. The wrist addition required no component or CSS changes. Future settings can be added to `watchTreatments` and its ID type once matching local imagery exists. No future shots or placeholders are currently rendered.

## Loading recovery

A reported stuck loading cover led to a refresh fix. `app/lib/watch-image-loading.ts` observes native image events and immediately checks cached completion. Stable ref callbacks avoid the installed Next Image error-callback ref behavior that can reassign image sources during rerenders. Detached image listeners are cleaned up during pair switches. Loading no longer blocks the comparison, and retry remounts the current images without changing the selected pair or divider position.

Run `node --test scripts/watch-image-loading.test.mjs` for five regression checks covering cached loads, failures before hydration, cold loading/recovery, listener cleanup and retry. These are image-event unit tests; they do not establish physical browser rendering.

## Rebuilding optimized files

With the four original PNGs available:

```powershell
$env:SUMMIT_WATCH_SOURCE_DIR='C:\Users\summi\.codex\generated_images\01a1fda6-9d87-7740-a143-2ba75da92ee6'
node scripts/prepare-watch-study.mjs
```

This only regenerates local WebP derivatives and their manifest using the existing Sharp dependency. It performs no image generation, downloads or installations.

See [verification.md](verification.md) for delivery checks and browser limits. No push, merge or deployment is included.
