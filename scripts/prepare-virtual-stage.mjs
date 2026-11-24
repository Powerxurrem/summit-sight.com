import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import sharp from "sharp";

// All production inputs are read-only. Every output belongs to this website.
const source = "C:/Users/summi/Desktop/projects/cinema-lab-b/.workspace-b/web-motion-002/finished-v1";
const ffmpeg = process.env.FFMPEG_PATH || "C:/Users/summi/Desktop/projects/cinema-lab/.cache/rgb-preservation-tools/ffmpeg.exe";
const ffprobe = path.join(path.dirname(ffmpeg), "ffprobe.exe");
const output = "public/media/virtual-stage";
const evidence = "docs/web-005";
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const read = file => JSON.parse(readFileSync(file, "utf8"));
const finishing = read(`${source}/technical-finishing.json`);
const final = read(`${source}/final-manifest.json`);
const interval = read(`${source}/source/shared-interval.json`);
const preservation = read(`${source}/source/source-preservation.json`);
function run(command, args) {
  const result = spawnSync(command, args, { maxBuffer: 32 * 1024 * 1024 });
  assert.equal(result.status, 0, result.error?.message || result.stderr?.toString());
  return result.stdout;
}
const probe = file => JSON.parse(run(ffprobe, ["-v", "error", "-show_entries", "format=duration,size,bit_rate:stream=codec_type,codec_name,width,height,pix_fmt,r_frame_rate,nb_frames", "-of", "json", file]));
function verified(file) {
  const bytes = readFileSync(`${source}/${file}`);
  const receipt = finishing.videos_and_posters[file] || final.files.find(entry => entry.path === file);
  assert.ok(receipt, `Missing receipt: ${file}`);
  assert.equal(hash(bytes), receipt.sha256, file);
  assert.equal(bytes.length, receipt.bytes, file);
  return { path: `${source}/${file}`, bytes: bytes.length, sha256: hash(bytes) };
}
function writeFresh(file, bytes) {
  if (existsSync(file)) assert.equal(hash(readFileSync(file)), hash(bytes), `Refusing to replace different media: ${file}`);
  else writeFileSync(file, bytes);
}
mkdirSync(output, { recursive: true });
mkdirSync(evidence, { recursive: true });
const manifest = {
  mission: "WEB-005", sourceDirectory: source,
  receipts: ["technical-finishing.json", "final-manifest.json", "source/shared-interval.json", "source/source-preservation.json"].map(file => ({ path: `${source}/${file}`, sha256: hash(readFileSync(`${source}/${file}`)) })),
  originalClay: preservation.source_files.find(file => file.role === "primary_clay_motion"),
  timing: {
    sourceIndicesHalfOpen: interval.source_index_interval_half_open,
    sourceFramesOneBasedInclusive: interval.source_frames_one_based_inclusive,
    sourceSecondsHalfOpen: interval.source_time_interval_half_open_seconds,
    frames: interval.frames, fps: interval.fps, durationSeconds: interval.encoded_duration_seconds,
    websiteTimeToOriginalSeconds: "t + 71/24 for all four website clips; all clips start at the same shared interval",
    limitation: "Common timestamps do not establish exact generated geometry or frame-locked browser rendering.",
  },
  assets: [], inspectedProductionVideos: [],
};
const stagedOriginal = "C:/Users/summi/Desktop/projects/cinema-lab-b/inputs/web-motion-002/impossible-gallery-clay.mp4";
manifest.originalClay.stagedAbsolutePath = stagedOriginal;
for (const file of [manifest.originalClay.original, stagedOriginal]) {
  assert.equal(hash(readFileSync(file)), manifest.originalClay.sha256, file);
}
manifest.originalClay.originalAndStagedHashesVerified = true;
assert.deepEqual(manifest.timing.sourceIndicesHalfOpen, [71, 192]);
const clay = verified("source/shared-clay-interval.mp4");
const clayDestination = `${output}/clay.mp4`;
const clayArgs = ["-v", "error", "-xerror", "-n", "-i", clay.path, "-vf", "scale=1280:720:flags=lanczos,setsar=1", "-frames:v", "121", "-an", "-c:v", "libx264", "-crf", "21", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", clayDestination];
if (!existsSync(clayDestination)) run(ffmpeg, clayArgs);
const clayPoster = run(ffmpeg, ["-v", "error", "-i", clay.path, "-vf", "select=eq(n\\,60)", "-frames:v", "1", "-f", "image2pipe", "-c:v", "png", "-"]);
writeFresh(`${output}/clay-poster.webp`, await sharp(clayPoster).resize(1280, 720).webp({ quality: 86 }).toBuffer());
manifest.assets.push({ id: "clay", source: clay, destination: clayDestination, poster: `${output}/clay-poster.webp`, operation: "Scale existing 1920x1080 trimmed clay to 1280x720; H264/yuv420p CRF21 faststart; all 121 frames/24fps retained", derivationArgv: clayArgs });
for (const id of ["drowned-cathedral", "forgotten-sanctuary", "singularity-engine"]) {
  const input = verified(`impossible-gallery-${id}-web.mp4`);
  const poster = verified(`impossible-gallery-${id}-poster.png`);
  const destination = `${output}/${id}.mp4`;
  if (existsSync(destination)) assert.equal(hash(readFileSync(destination)), input.sha256);
  else copyFileSync(input.path, destination);
  writeFresh(`${output}/${id}-poster.webp`, await sharp(poster.path).resize(1280, 720).webp({ quality: 86 }).toBuffer());
  manifest.assets.push({ id, source: input, destination, poster: `${output}/${id}-poster.webp`, posterSource: poster, operation: "Web MP4 copied byte-for-byte; supplied master frame 60 PNG resized to WebP" });
}
for (const file of ["source/shared-clay-interval.mp4", ...["drowned-cathedral", "forgotten-sanctuary", "singularity-engine"].flatMap(id => [`impossible-gallery-${id}-master.mp4`, `impossible-gallery-${id}-web.mp4`]), "impossible-gallery-clay-three-worlds-comparison.mp4"]) {
  manifest.inspectedProductionVideos.push({ ...verified(file), technical: probe(`${source}/${file}`) });
}
for (const asset of manifest.assets) {
  const bytes = readFileSync(asset.destination);
  const technical = probe(asset.destination);
  const [video] = technical.streams;
  assert.equal(technical.streams.length, 1);
  assert.equal(video.codec_name, "h264"); assert.equal(video.pix_fmt, "yuv420p");
  assert.equal(video.width, 1280); assert.equal(video.height, 720);
  assert.equal(video.nb_frames, "121"); assert.equal(video.r_frame_rate, "24/1");
  assert.ok(bytes.indexOf(Buffer.from("moov")) < bytes.indexOf(Buffer.from("mdat")));
  run(ffmpeg, ["-v", "error", "-xerror", "-i", asset.destination, "-f", "null", "-"]);
  const pts = JSON.parse(run(ffprobe, ["-v", "error", "-select_streams", "v:0", "-show_entries", "frame=best_effort_timestamp_time", "-of", "json", asset.destination])).frames;
  assert.equal(pts.length, 121);
  pts.forEach((frame, index) => assert.ok(Math.abs(Number(frame.best_effort_timestamp_time) - index / 24) < 0.000001));
  asset.website = { bytes: bytes.length, sha256: hash(bytes), technical, fullDecode: true, all121TimestampsVerified: true };
  const posterBytes = readFileSync(asset.poster);
  asset.posterMetadata = { bytes: posterBytes.length, sha256: hash(posterBytes), sourceFrame: 60, width: 1280, height: 720 };
  console.log(`${asset.id}: ${bytes.length} video bytes, ${posterBytes.length} poster bytes; receipt, decode, 121 frames and PTS verified`);
}
const tiles = await Promise.all(manifest.assets.map(asset => sharp(asset.poster).resize(640, 360).toBuffer()));
await sharp({ create: { width: 1280, height: 720, channels: 3, background: "#141413" } }).composite(tiles.map((input, i) => ({ input, left: i % 2 * 640, top: Math.floor(i / 2) * 360 }))).jpeg({ quality: 90 }).toFile(`${evidence}/poster-contact-sheet.jpg`);
writeFileSync(`${evidence}/media-manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`);
