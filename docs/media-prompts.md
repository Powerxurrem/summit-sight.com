# Original studio concept media

These fictional, unbranded products are original AI-generated concept studies made for Summit Sight. They are not commissioned client work. The comparison is between two generated creative treatments, not a documented customer retouching result.

Generation used the built-in image-generation tool. Source PNGs remain in the local Codex generated-image directory; all assets required by the website are saved in `public/media/` with the app. No remote stock-image or video dependencies.

## Prompt set

1. **Amber & Stone / hero** — Premium cinematic product photography, wide 16:9. A square amber glass fragrance bottle with a substantial matte black cylindrical cap on a weathered obsidian plinth among wet volcanic rock. Product on the right at 72%, dark negative space on the left for a headline. Warm golden raking sunlight beams through haze, amber refractions, water droplets, sophisticated chiaroscuro. Photorealistic. No people, text, labels, logos, watermark or recognizable brand.
2. **Quiet Form / audio** — Premium editorial product photography of sculptural matte charcoal wireless over-ear headphones, upright on a geometric black basalt pedestal. Icy blue-gray mist, cool rim lighting, realistic leather and matte metal, restrained cinematic contrast. Portrait 4:5, fully visible centred subject. Original fictional industrial design. No text, labels, logos or watermark.
3. **Daily Ritual / skincare** — Photorealistic luxury beauty still life of a minimal cylindrical ivory ceramic skincare bottle with a matching cap on warm limestone. Golden afternoon sun, long shadows, curved stone and soft cream fabric, cream/sand/gold palette, tactile architectural composition. Portrait 4:5, centred fully visible bottle. No text, labels, logos or watermark.
4. **Plain studio treatment** — Edit the hero target. Preserve bottle identity, scale, position, geometry, perspective, amber liquid and cap. Replace rocks, sunlight and haze with a simple warm-gray seamless background, a flat surface and soft neutral studio lighting. Retain 16:9 framing. No text, branding or watermark.
5. **Arctic** — Edit the hero target. Preserve exact bottle identity, geometry, position, scale and 16:9 camera framing. Change environment to sculpted dark ice, angular blue ice, frost, misty deep blue-gray atmosphere and cool rim lighting. Amber liquid remains warm. Photorealistic fictional product campaign. No text, logos or watermark.
6. **Ember** — Edit the hero target. Preserve exact bottle identity, geometry, position, scale and 16:9 framing. Charred volcanic plinth with fine copper-red glowing fissures, a few floating sparks, black smoke and warm backlight. No large flames or fire touching the bottle. Amber liquid remains golden. No text, logos or watermark.

## Saved assets

- `hero.webp`: wide hero.
- `concept-fragrance.webp`: crop of the hero for gallery cards.
- `audio.webp`, `skincare.webp`: portrait concept studies.
- `fragrance-before.webp`, `fragrance-after.webp`: matching crops for the comparison.
- `fragrance-obsidian.webp`, `fragrance-arctic.webp`, `fragrance-inferno.webp`: wide environment studies.
- `sequence/frame-00.svg` through `frame-11.svg`: legacy code-native illustrated bottle views. Retained for preservation; the SS-002 viewer no longer uses them.
- `milk-turnaround/reference.webp` and `view-000.webp` through `view-315.webp` at 45-degree intervals: current Summit Sight milk packaging concept, with front, nutrition, back and storage faces. Reference and initial frame are identical. See the milk revision below.
- `soap-turnaround/reference.webp` and `view-000.webp` through `view-315.webp`: second selectable Good Hands hand soap concept, with an opaque oxblood body, fixed black pump, botanical front and dense back label. Milk remains the default.
- `product-turnaround/reference.webp` and `view-000.webp` through `view-315.webp`: superseded SS-002 amber trial, preserved but not used by the current viewer.
- `amber-motion.mp4`, `ritual-motion.mp4`: 6-second, 1280×720 H.264 editorial pan/zoom studies made from the generated stills with FFmpeg. Silent AAC tracks, no third-party soundtrack. These do not demonstrate generated moving product geometry.
- `app/opengraph-image.jpg`: social crop of hero.

## Rebuilding derivatives

No generation API or key is needed to run the site. All optimized assets are committed.

`scripts/prepare-media.mjs` rebuilds derivatives when the six original PNGs are available. Set `SUMMIT_MEDIA_SOURCE_DIR` to the source directory. This release used `C:\Users\summi\.codex\generated_images\01a1f501-1084-7631-a9cc-50b5c260d98f`. The script maps the six returned source filenames. Run `node scripts/prepare-media.mjs`. To recreate the motion studies, install FFmpeg and run `node scripts/prepare-motion.mjs`.

## SS-002 — superseded amber trial

Created 20 November 2026 with the built-in image-generation tool, without a new generation backend, model download or dependency. The existing `fragrance-before.webp` supplied the identity for a clean, front-facing master. The accepted 45-degree image used that master; the six remaining generated angles used both images as conditioning references. The full prompt template and per-angle instructions are in [generation-prompts.json](ss-002/generation-prompts.json).

Original PNGs remain in `C:\Users\summi\.codex\generated_images\01a1f9bf-9a27-7c72-ad8c-42952207858c`. Source filename mappings, final sizes and angle order are recorded in `public/media/product-turnaround/manifest.json` and `scripts/prepare-turnaround.mjs`. All final website images are saved inside this repository. Set `SUMMIT_TURNAROUND_SOURCE_DIR` to that PNG directory and run `node scripts/prepare-turnaround.mjs` to rebuild the 1024×1024 WebPs and `docs/ss-002/accepted-views.jpg`.

The accepted sequence totals 289,528 bytes, plus a 35,374-byte copy for the reference panel. Each frame is below 44 KB. Background, lighting direction, framing, amber glass body and cylindrical black cap were visually reviewed together. Front/rear pairs are deliberately similar because this concept has no branding or asymmetrical packaging. Minor generative variation in reflections and cap width remains. These are curated approximate views, not calibrated turntable photographs or accurate unseen-surface reconstruction.

## SS-002 milk revision — default study

The user rejected the amber trial's ambiguous internal reflections and weak front/back distinction, and selected a fictional Summit Sight one-litre milk carton instead. The new packaging uses warm ivory, deep forest green and orange, with fixed face roles: “SUMMIT SIGHT / WHOLE MILK / 1 L” on the front, “THE DAILY DETAILS” nutrition side, “A FRESH PERSPECTIVE.” sunrise back, and “KEEP IT FRESH.” storage/barcode side. All label copy and nutrition values are fictional concept artwork.

Built-in imagegen first created a [four-panel artwork reference](ss-002/milk-packaging-artwork.webp). A front product photograph established the physical carton, studio, scale and lighting. Side and back masters were conditioned on it and the artwork; the first side candidates were corrected for width. Diagonal views were conditioned on their corresponding accepted face masters. Exact prompts and correction prompts are saved in [milk-generation-prompts.json](ss-002/milk-generation-prompts.json); the intended face/rotation specification is in [milk-packaging.json](ss-002/milk-packaging.json). All original PNGs remain in the same generated-image directory recorded above. Final source filenames, face order, dimensions and bytes are in `public/media/milk-turnaround/manifest.json`.

Run `node scripts/prepare-milk-turnaround.mjs` with `SUMMIT_TURNAROUND_SOURCE_DIR` set to that directory to rebuild the eight 1024×1024 WebPs, reference copy, artwork preview and [milk contact sheet](ss-002/milk-accepted-views.jpg). The sequence totals 403,364 bytes (about 394 KiB), plus a 44,616-byte reference copy. Each frame is below 64 KB. No generation backend, API key or new dependency is required to run the website or rebuild these derivatives.

Visual review confirmed the face order from front → nutrition → back → storage → front, with the fifth frame showing the actual back artwork. Headlines are upright and assigned to the correct panels; the barcode is confined to the storage face. Minor small-copy reflow, illustration detail, paper shading and perspective variation remain. These are curated generated views rather than calibrated photographs, measured geometry or print-production artwork.

## Good Hands soap — second selectable study

The user requested a more demanding packaging example while preserving the approved milk study. Good Hands is a fictional 500 mL bergamot and cedar liquid hand soap, with an opaque matte oxblood bottle, ivory labels, copper rule and black pump. A [fixed two-label artwork reference](ss-002/soap-label-artwork.webp) established the typography and content. The back carries a product story, directions, a long ingredients list, care text, studio footline and barcode. Copy is illustrative and does not establish a real formulation or commercial label compliance.

Built-in imagegen created the artwork, front geometry master, back and side masters, then conditioned diagonal views. The first 135° candidate showed the wrong body perspective and was rejected. A correction moved the back label to the correct image-right plane while retaining upright text; the matching pump direction was checked. Front/right/back/left order and nozzle direction are listed in `public/media/soap-turnaround/manifest.json`. [Exact accepted prompts and correction](ss-002/soap-generation-prompts.json) and the [contact sheet](ss-002/soap-accepted-views.jpg) are retained. Original PNGs are in the same generated-image directory recorded above.

Set `SUMMIT_TURNAROUND_SOURCE_DIR` to that directory and run `node scripts/prepare-soap-turnaround.mjs` to rebuild eight 1024×1024 WebPs, the reference copy, artwork preview and contact sheet. The sequence totals 361,728 bytes (353.25 KiB), plus a 53,076-byte reference copy; individual views are 19,788–55,404 bytes. Milk files and content were not changed. Fine-print reflow, botanical detail, perspective and pump length still show some generative variation. This is a visual sales-presentation concept, not a print proof, exact reconstruction or commissioned customer result.
