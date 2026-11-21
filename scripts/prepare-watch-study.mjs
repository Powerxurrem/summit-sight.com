import sharp from "sharp";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceDirectory = process.env.SUMMIT_WATCH_SOURCE_DIR;
if (!sourceDirectory) throw new Error("Set SUMMIT_WATCH_SOURCE_DIR to the generated PNG directory; see docs/ss-002-watch/README.md.");

const outputDirectory = path.resolve("public/media/watch-study");
const sourceNames = {
  studio: "exec-52940f33-ad64-4abd-992e-8e13d508399c.png",
  creative: "exec-fd2365e0-83bf-4037-9819-ed0e27d13cb7.png",
};
const sha256 = buffer => createHash("sha256").update(buffer).digest("hex");
await mkdir(outputDirectory, { recursive: true });
const images = [];
for (const [treatment, source] of Object.entries(sourceNames)) {
  const input = await readFile(path.join(sourceDirectory, source));
  const metadata = await sharp(input).metadata();
  if (metadata.width !== metadata.height) throw new Error(`${source}: expected square comparison master`);
  const output = await sharp(input).resize({ width: 1254, withoutEnlargement: true }).webp({ quality: 88, effort: 6 }).toBuffer();
  const decoded = await sharp(output).metadata();
  const file = `${treatment}.webp`;
  await writeFile(path.join(outputDirectory, file), output);
  images.push({ treatment, file, source, sourceSha256: sha256(input), width: decoded.width, height: decoded.height, bytes: output.length, sha256: sha256(output) });
}
const manifest = {
  title: "Original fictional unbranded luxury watch concept",
  created: "2026-11-21",
  method: "Built-in image generation: studio master, then an environment-and-lighting edit conditioned on that master. No third-party watch reference used.",
  review: "Matched camera, pose, framing, blue dial, gold baton markers and steel/gold bracelet visually reviewed. Product geometry is generated, not a calibrated or manufactured design.",
  images,
};
await writeFile(path.join(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(images.map(image => `${image.file}: ${image.width}x${image.height}, ${image.bytes} bytes`).join("\n"));
