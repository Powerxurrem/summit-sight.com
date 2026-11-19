# Original studio concept media

These fictional, unbranded products are original AI-generated concept studies made for Summit Sight. They are not commissioned client work. The comparison is between two generated creative treatments, not a documented customer retouching result.

Generation used the built-in image-generation tool. Source PNGs remain in the local Codex generated-image directory; all assets required by the website are saved in `public/media/` and committed with the app. No remote stock-image or video dependencies.

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
- `sequence/frame-00.svg` through `frame-11.svg`: code-native illustrated bottle views, projected from a simple geometric form. An illustration, not measured product data or AI/photogrammetric reconstruction. Replace with actual product angles when supplied.
- `amber-motion.mp4`, `ritual-motion.mp4`: 6-second, 1280×720 H.264 editorial pan/zoom studies made from the generated stills with FFmpeg. Silent AAC tracks, no third-party soundtrack. These do not demonstrate generated moving product geometry.
- `app/opengraph-image.jpg`: social crop of hero.

## Rebuilding derivatives

No generation API or key is needed to run the site. All optimized assets are committed.

`scripts/prepare-media.mjs` rebuilds derivatives when the six original PNGs are available. Set `SUMMIT_MEDIA_SOURCE_DIR` to the source directory. This release used `C:\Users\summi\.codex\generated_images\01a1f501-1084-7631-a9cc-50b5c260d98f`. The script maps the six returned source filenames. Run `node scripts/prepare-media.mjs`. To recreate the motion studies, install FFmpeg and run `node scripts/prepare-motion.mjs`.
