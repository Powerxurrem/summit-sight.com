import sharp from "sharp";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Built-in imagegen outputs; no generation backend or credentials are needed here.
const sourceDirectory = process.env.SUMMIT_TURNAROUND_SOURCE_DIR;
if (!sourceDirectory) throw new Error("Set SUMMIT_TURNAROUND_SOURCE_DIR to the generated PNG directory recorded in docs/media-prompts.md.");
const directory = path.resolve("public/media/product-turnaround");
await mkdir(directory, { recursive: true });
const sources = [
  [0, "exec-416f4d17-a518-47fc-89c5-1bee9c3e6d88.png"],
  [45, "exec-aa3c639a-14ab-4d42-a983-e8afa03afe0c.png"],
  [90, "exec-cfb7c6f6-335c-4cd2-8062-dd2ece00cf33.png"],
  [135, "exec-88fa57af-cc3b-4428-86e0-cdb2851de487.png"],
  [180, "exec-6cbbf240-6be7-4507-b180-87705e9c85ee.png"],
  [225, "exec-991aa45f-55c1-46d0-9bb4-1eb9ed29d794.png"],
  [270, "exec-e87cdea1-1049-4b3f-8bcb-8f59a7009a66.png"],
  [315, "exec-64571c38-7afd-4f76-96c8-b1fe2530c874.png"],
];
const frames = [];
for (const [angle, source] of sources) {
  const file = `view-${String(angle).padStart(3, "0")}.webp`;
  const info = await sharp(path.join(sourceDirectory, source))
    .resize(1024, 1024, { fit: "contain", withoutEnlargement: true })
    .webp({ quality: 86 }).toFile(path.join(directory, file));
  if (info.size > 170_000) throw new Error(`${file} exceeds the turnaround image budget`);
  frames.push({ angle, file, width: info.width, height: info.height, bytes: info.size, source });
}
// The initial viewer frame is the actual reference, avoiding a synthetic before/after discrepancy.
await copyFile(path.join(directory, "view-000.webp"), path.join(directory, "reference.webp"));
await writeFile(path.join(directory, "manifest.json"), JSON.stringify({
  title: "Amber fragrance — original fictional concept",
  method: "Built-in image generation conditioned on the front reference and accepted 45-degree view. Approximate angles; unseen surfaces are artistic approximations, not measured geometry.",
  reference: "reference.webp",
  frames,
}, null, 2) + "\n");
console.log(`Prepared reference + ${frames.length} accepted views (${frames.reduce((sum, frame) => sum + frame.bytes, 0)} bytes for the sequence).`);

const tiles = [];
for (const [index, frame] of frames.entries()) {
  const left = (index % 4) * 300;
  const top = Math.floor(index / 4) * 340;
  tiles.push({ input: await sharp(path.join(directory, frame.file)).resize(300, 300).toBuffer(), left, top });
  const label = `<svg width="300" height="40"><rect width="300" height="40" fill="#171716"/><text x="150" y="26" font-family="Arial" font-size="16" fill="#eee9dd" text-anchor="middle">${frame.angle}&#176; &#183; view ${index + 1} / ${frames.length}</text></svg>`;
  tiles.push({ input: Buffer.from(label), left, top: top + 300 });
}
await mkdir("docs/ss-002", { recursive: true });
await sharp({ create: { width: 1200, height: Math.ceil(frames.length / 4) * 340, channels: 3, background: "#171716" } })
  .composite(tiles).jpeg({ quality: 88 }).toFile("docs/ss-002/accepted-views.jpg");
