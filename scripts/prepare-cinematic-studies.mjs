import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import sharp from "sharp";

// Read the delivered Cinema Lab assets; never write into the central library.
const library = "C:/CinemaLabMedia/render/projects/WEB-MOTION-001";
const ffmpeg = realpathSync(process.env.FFMPEG_PATH || `${process.env.LOCALAPPDATA}/Microsoft/WinGet/Links/ffmpeg.exe`);
const ffprobe = path.join(path.dirname(ffmpeg), "ffprobe.exe");
const output = "public/media/cinematic-studies";
const evidence = "docs/web-004";
const studies = [
  { id: "ignition", master: "d9475055-4960-47d3-a709-f735a2367993", web: "239f056f-ffc3-4515-842c-f07b95d5dcb2" },
  { id: "universe-within", master: "1c1cacef-ecc1-4f33-8f21-9a7038e0d4b7", web: "42273861-d029-496e-9e9f-d149ae172ce4" },
];
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
function run(command, args) {
  const result = spawnSync(command, args, { maxBuffer: 24 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr?.toString() || result.error?.message);
  return result.stdout;
}
function delivered(id, role, assetId) {
  const directory = `${library}/${id}-${role}--${assetId}`;
  const source = `${directory}/${id}-${role}.mp4`;
  const receipt = JSON.parse(readFileSync(`${directory}/publication.json`, "utf8"));
  const bytes = readFileSync(source);
  if (hash(bytes) !== receipt.sha256 || bytes.length !== receipt.size_bytes) throw new Error(`Receipt mismatch: ${source}`);
  return { source, bytes: bytes.length, sha256: hash(bytes), assetId };
}
mkdirSync(output, { recursive: true });
mkdirSync(evidence, { recursive: true });
const manifest = { mission: "WEB-004", studies: [] };
for (const study of studies) {
  const master = delivered(study.id, "master", study.master);
  const web = delivered(study.id, "web", study.web);
  const receipt = JSON.parse(readFileSync(path.join(path.dirname(web.source), "publication.json"), "utf8"));
  if (!receipt.provenance.parent_assets.some(parent => parent.sha256 === master.sha256)) throw new Error("Web file has a different master");
  const destination = `${output}/${study.id}.mp4`;
  if (existsSync(destination) && hash(readFileSync(destination)) !== web.sha256) throw new Error(`Refusing to overwrite a different asset: ${destination}`);
  copyFileSync(web.source, destination);
  const probe = file => JSON.parse(run(ffprobe, ["-v", "error", "-show_entries", "format=duration,size,bit_rate:stream=codec_type,codec_name,width,height,pix_fmt,r_frame_rate,nb_frames", "-of", "json", file]));
  const technical = probe(destination);
  master.technical = probe(master.source);
  run(ffmpeg, ["-v", "error", "-i", master.source, "-f", "null", "-"]);
  run(ffmpeg, ["-v", "error", "-i", destination, "-f", "null", "-"]);
  const frame = run(ffmpeg, ["-v", "error", "-i", master.source, "-frames:v", "1", "-f", "image2pipe", "-c:v", "png", "-"]);
  const poster = await sharp(frame).webp({ quality: 86 }).toBuffer();
  writeFileSync(`${output}/${study.id}-poster.webp`, poster);
  // A first/last-frame comparison supports the playback decision, not a motion-quality claim.
  const count = Number(technical.streams.find(stream => stream.codec_type === "video").nb_frames);
  if (!existsSync(`${evidence}/${study.id}-endpoints.png`)) run(ffmpeg, ["-v", "error", "-n", "-i", destination, "-vf", `select='eq(n,0)+eq(n,${count - 1})',scale=640:-1,tile=2x1`, "-frames:v", "1", `${evidence}/${study.id}-endpoints.png`]);
  if (hash(readFileSync(master.source)) !== master.sha256) throw new Error("Master changed during integration");
  manifest.studies.push({ id: study.id, master, web: { ...web, destination, technical }, poster: { destination: `${output}/${study.id}-poster.webp`, sourceMasterSha256: master.sha256, sourceFrame: 0, bytes: poster.length, sha256: hash(poster) } });
  console.log(`${study.id}: ${web.bytes} video bytes; ${poster.length} poster bytes; receipt, parent master and full decode verified`);
}
writeFileSync(`${evidence}/media-manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`);
