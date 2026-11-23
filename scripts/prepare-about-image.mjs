import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const source = process.argv[2];
if (!source) throw new Error("Pass the generated source image path as the first argument.");
const destination = "public/media/about-material-study.webp";
const evidence = "docs/about-refresh";
await mkdir(evidence, { recursive: true });
const sourceBytes = await readFile(source);
const sourceMetadata = await sharp(sourceBytes).metadata();
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const archivedSource = `${evidence}/material-study-source.png`;
if (sourceMetadata.format !== "png") throw new Error("Expected the built-in tool's PNG source.");
await copyFile(source, archivedSource);
const websiteImage = await sharp(sourceBytes).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 87 }).toBuffer();
await writeFile(destination, websiteImage);
const websiteMetadata = await sharp(websiteImage).metadata();
// Review the same centered crops used by the responsive image frame.
for (const [name, ratio, width] of [["desktop", 12 / 5, 1200], ["mobile", 4 / 3, 480]]) {
  const cropWidth = Math.min(sourceMetadata.width, Math.round(sourceMetadata.height * ratio));
  const cropHeight = Math.min(sourceMetadata.height, Math.round(sourceMetadata.width / ratio));
  await sharp(sourceBytes).extract({ left: Math.floor((sourceMetadata.width - cropWidth) / 2), top: Math.floor((sourceMetadata.height - cropHeight) / 2), width: cropWidth, height: cropHeight })
    .resize({ width, withoutEnlargement: true }).webp({ quality: 88 }).toFile(`${evidence}/${name}-crop.webp`);
}
const manifest = {
  method: "Built-in image_gen; one original abstract material study. Website derivative made with Sharp.",
  source: { generatedPath: source, archivedPath: archivedSource, sha256: hash(sourceBytes), bytes: sourceBytes.length, width: sourceMetadata.width, height: sourceMetadata.height },
  website: { path: destination, sha256: hash(websiteImage), bytes: websiteImage.length, width: websiteMetadata.width, height: websiteMetadata.height },
  caption: "Original AI-generated material study",
  preservation: "Existing skincare asset retained; no other source media overwritten."
};
await writeFile(`${evidence}/media-manifest.json`, JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify(manifest.website));
