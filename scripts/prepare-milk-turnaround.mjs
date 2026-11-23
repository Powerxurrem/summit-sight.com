import sharp from "sharp";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceDirectory = process.env.SUMMIT_TURNAROUND_SOURCE_DIR;
if (!sourceDirectory) throw new Error("Set SUMMIT_TURNAROUND_SOURCE_DIR to the generated PNG directory in docs/ss-002/milk-generation-prompts.json.");
const directory = path.resolve("public/media/milk-turnaround");
await mkdir(directory, { recursive: true });
const sources = [
  [0, "exec-35d3bb81-18d4-47a7-b4fb-8fa2befdb722.png", ["front"]],
  [45, "exec-0e637aed-9baf-40a2-9b97-50cc2575b38f.png", ["front", "nutrition"]],
  [90, "exec-379bb11d-8a49-4979-88ed-7f24ec2e2679.png", ["nutrition"]],
  [135, "exec-9064efac-d264-42ed-acd0-452f126efa6f.png", ["nutrition", "back"]],
  [180, "exec-d91eb889-e4d5-420b-8cc7-def432c61fcc.png", ["back"]],
  [225, "exec-4f636eeb-43a8-4dd2-94da-f53f8950e430.png", ["back", "storage"]],
  [270, "exec-abcee97c-366b-4486-adb3-c34d6899752c.png", ["storage"]],
  [315, "exec-164b58c2-a173-498d-8a03-02649cb25dcc.png", ["storage", "front"]],
];
const frames = [];
for (const [angle, source, visibleFaces] of sources) {
  const file = `view-${String(angle).padStart(3, "0")}.webp`;
  const info = await sharp(path.join(sourceDirectory, source))
    .resize(1024, 1024, { fit: "contain", withoutEnlargement: true })
    .webp({ quality: 86 }).toFile(path.join(directory, file));
  if (info.size > 170_000) throw new Error(`${file} exceeds the turnaround image budget`);
  frames.push({ angle, file, visibleFaces, width: info.width, height: info.height, bytes: info.size, source });
}
await copyFile(path.join(directory, "view-000.webp"), path.join(directory, "reference.webp"));
await writeFile(path.join(directory, "manifest.json"), JSON.stringify({
  title: "Summit Sight Whole Milk — fictional packaging concept",
  method: "Built-in image generation: fixed four-panel packaging artwork, front/side/back masters and conditioned diagonal views. Angles and unseen surfaces are artistic approximations. Label copy and nutrition values are fictional.",
  reference: "reference.webp",
  rotation: "Clockwise as seen from above; front, nutrition, back, storage. visibleFaces lists panels in image left-to-right order.",
  frames,
}, null, 2) + "\n");

await mkdir("docs/ss-002", { recursive: true });
await sharp(path.join(sourceDirectory, "exec-1313e348-e758-4b7e-a6fc-a82f4c9d4ed9.png"))
  .webp({ quality: 90 }).toFile("docs/ss-002/milk-packaging-artwork.webp");
const tiles = [];
for (const [index, frame] of frames.entries()) {
  const left = (index % 4) * 300;
  const top = Math.floor(index / 4) * 356;
  tiles.push({ input: await sharp(path.join(directory, frame.file)).resize(300, 300).toBuffer(), left, top });
  const label = `<svg width="300" height="56"><rect width="300" height="56" fill="#171716"/><g font-family="Arial" fill="#eee9dd" text-anchor="middle"><text x="150" y="22" font-size="16">${frame.angle}&#176; &#183; view ${index + 1} / ${frames.length}</text><text x="150" y="44" font-size="13">${frame.visibleFaces.join(" + ")}</text></g></svg>`;
  tiles.push({ input: Buffer.from(label), left, top: top + 300 });
}
await sharp({ create: { width: 1200, height: Math.ceil(frames.length / 4) * 356, channels: 3, background: "#171716" } })
  .composite(tiles).jpeg({ quality: 90 }).toFile("docs/ss-002/milk-accepted-views.jpg");
console.log(`Prepared milk reference + ${frames.length} accepted views (${frames.reduce((sum, frame) => sum + frame.bytes, 0)} bytes for the sequence).`);
