import sharp from "sharp";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceDirectory = process.env.SUMMIT_TURNAROUND_SOURCE_DIR;
if (!sourceDirectory) throw new Error("Set SUMMIT_TURNAROUND_SOURCE_DIR to the generated PNG directory in docs/ss-002/soap-generation-prompts.json.");
const directory = path.resolve("public/media/soap-turnaround");
await mkdir(directory, { recursive: true });
const sources = [
  [0, "exec-5aa61f86-cad3-4eef-b760-f6e7e848bba8.png", ["front"], "toward camera"],
  [45, "exec-03c0fd47-504e-456a-b7b8-62c7134193e1.png", ["front", "right side"], "left, toward camera"],
  [90, "exec-32bdf526-9bc0-4885-9878-f61ffba4dfaa.png", ["right side"], "left"],
  [135, "exec-aa1a873f-7edc-44c9-8809-47986a6f03a6.png", ["right side", "back"], "left, away from camera"],
  [180, "exec-a2b2f0b8-8a84-4e02-aa6f-036e1b1eae01.png", ["back"], "away from camera"],
  [225, "exec-b5c67b7f-9361-496a-96e6-75ee340ffa9e.png", ["back", "left side"], "right, away from camera"],
  [270, "exec-decd526e-4e63-4ac4-9a73-ce8699d0593b.png", ["left side"], "right"],
  [315, "exec-aa8fab7c-b13d-453b-ad0d-9ab67f9a1b44.png", ["left side", "front"], "right, toward camera"],
];
const frames = [];
for (const [angle, source, visibleFaces, nozzleDirection] of sources) {
  const file = `view-${String(angle).padStart(3, "0")}.webp`;
  const info = await sharp(path.join(sourceDirectory, source))
    .resize(1024, 1024, { fit: "contain", withoutEnlargement: true })
    .webp({ quality: 88 }).toFile(path.join(directory, file));
  if (info.size > 170_000) throw new Error(`${file} exceeds the turnaround image budget`);
  frames.push({ angle, file, visibleFaces, nozzleDirection, width: info.width, height: info.height, bytes: info.size, source });
}
await copyFile(path.join(directory, "view-000.webp"), path.join(directory, "reference.webp"));
await writeFile(path.join(directory, "manifest.json"), JSON.stringify({
  title: "Summit Sight Good Hands — fictional hand soap packaging concept",
  method: "Built-in image generation: fixed front/back artwork, opaque bottle front/side/back masters and conditioned diagonal views. Dense lettering and fine illustration details may vary. Product and formula copy are fictional; angles and unseen surfaces are approximate.",
  reference: "reference.webp",
  rotation: "Clockwise from above; front, right side, back, left side. Pump nozzle stays attached toward the front of the bottle. visibleFaces lists panels in image left-to-right order.",
  frames,
}, null, 2) + "\n");

await mkdir("docs/ss-002", { recursive: true });
await sharp(path.join(sourceDirectory, "exec-fe7aaa7e-7a16-4b09-8b35-fe16fe15050f.png"))
  .webp({ quality: 94 }).toFile("docs/ss-002/soap-label-artwork.webp");
const tiles = [];
for (const [index, frame] of frames.entries()) {
  const left = (index % 4) * 300;
  const top = Math.floor(index / 4) * 356;
  tiles.push({ input: await sharp(path.join(directory, frame.file)).resize(300, 300).toBuffer(), left, top });
  const label = `<svg width="300" height="56"><rect width="300" height="56" fill="#171716"/><g font-family="Arial" fill="#eee9dd" text-anchor="middle"><text x="150" y="22" font-size="16">${frame.angle}&#176; &#183; view ${index + 1} / ${frames.length}</text><text x="150" y="44" font-size="13">${frame.visibleFaces.join(" + ")}</text></g></svg>`;
  tiles.push({ input: Buffer.from(label), left, top: top + 300 });
}
await sharp({ create: { width: 1200, height: Math.ceil(frames.length / 4) * 356, channels: 3, background: "#171716" } })
  .composite(tiles).jpeg({ quality: 92 }).toFile("docs/ss-002/soap-accepted-views.jpg");
console.log(`Prepared soap reference + ${frames.length} accepted views (${frames.reduce((sum, frame) => sum + frame.bytes, 0)} bytes for the sequence).`);
