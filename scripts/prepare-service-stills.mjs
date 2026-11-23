import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, realpathSync } from "node:fs";
import { spawnSync } from "node:child_process";
import sharp from "sharp";

// Extract existing footage only. This script does not alter the source film.
const source = "public/media/cinematic-studies/universe-within.mp4";
const ffmpeg = realpathSync(process.env.FFMPEG_PATH || `${process.env.LOCALAPPDATA}/Microsoft/WinGet/Links/ffmpeg.exe`);
const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
const sourceHash = sha256(readFileSync(source));
const output = "public/media/service-studies";
mkdirSync(output, { recursive: true });
const frames = [];
for (const [name, frame] of [["passage", 72], ["reveal", 128]]) {
  const decoded = spawnSync(ffmpeg, ["-v", "error", "-i", source, "-vf", `select=eq(n\\,${frame})`, "-frames:v", "1", "-f", "image2pipe", "-c:v", "png", "-"], { maxBuffer: 8 * 1024 * 1024 });
  if (decoded.status !== 0) throw new Error(decoded.stderr?.toString() || decoded.error?.message);
  const bytes = await sharp(decoded.stdout).resize({ width: 640, withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
  const destination = `${output}/universe-${name}.webp`;
  writeFileSync(destination, bytes);
  frames.push({ destination, sourceFrame: frame, fps: 24, bytes: bytes.length, sha256: sha256(bytes) });
  console.log(`${destination}: ${bytes.length} bytes`);
}
if (sha256(readFileSync(source)) !== sourceHash) throw new Error("Source film changed");
mkdirSync("docs/services-refresh", { recursive: true });
writeFileSync("docs/services-refresh/media-manifest.json", JSON.stringify({ source, sourceSha256: sourceHash, method: "Exact decoded frames, scaled down to 640x360; no creative alteration or generation.", frames }, null, 2) + "\n");
