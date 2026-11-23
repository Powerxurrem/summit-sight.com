import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const delivery = JSON.parse(readFileSync("docs/web-004/media-manifest.json", "utf8"));
const original = delivery.studies.find(study => study.id === "universe-within");
const source = original.master.source;
const destination = "public/media/cinematic-studies/universe-within-ping-pong-v1.mp4";
const ffmpeg = realpathSync(process.env.FFMPEG_PATH || `${process.env.LOCALAPPDATA}/Microsoft/WinGet/Links/ffmpeg.exe`);
const ffprobe = path.join(path.dirname(ffmpeg), "ffprobe.exe");
const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
function run(command, args) {
  const result = spawnSync(command, args, { maxBuffer: 24 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr?.toString() || result.error?.message);
  return result.stdout;
}
const probe = file => JSON.parse(run(ffprobe, ["-v", "error", "-count_frames", "-show_entries", "format=duration,size:stream=codec_type,codec_name,width,height,pix_fmt,avg_frame_rate,nb_read_frames", "-of", "json", file]));
assert.equal(sha256(readFileSync(source)), original.master.sha256, "preserve the delivered master");
const sourceInfo = probe(source);
const video = sourceInfo.streams.find(stream => stream.codec_type === "video");
assert.equal(Number(video.nb_read_frames), 144);
assert.equal(video.avg_frame_rate, "24/1");
assert.equal(video.width, 1024); assert.equal(video.height, 576);

// 0..143 forward, then 142..1 backward. The browser loop continues with 0.
// Omitting the repeated end frames avoids extra holds at either turnaround.
const filter = "[0:v]split=2[forward][backward];[forward]setpts=PTS-STARTPTS[f];[backward]trim=start_frame=1:end_frame=143,reverse,setpts=PTS-STARTPTS[r];[f][r]concat=n=2:v=1:a=0,format=yuv420p[out]";
mkdirSync(path.dirname(destination), { recursive: true });
run(ffmpeg, ["-v", "error", "-n", "-i", source, "-filter_complex", filter, "-map", "[out]", "-an", "-r", "24", "-fps_mode", "cfr", "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-movflags", "+faststart", destination]);
const technical = probe(destination);
const outputVideo = technical.streams.find(stream => stream.codec_type === "video");
assert.equal(Number(outputVideo.nb_read_frames), 286);
assert.equal(outputVideo.avg_frame_rate, "24/1");
assert.equal(technical.streams.filter(stream => stream.codec_type === "audio").length, 0);
assert.equal(outputVideo.codec_name, "h264"); assert.equal(outputVideo.pix_fmt, "yuv420p");
run(ffmpeg, ["-v", "error", "-i", destination, "-f", "null", "-"]);

// Compare every decoded output frame to its expected source frame, allowing
// normal H.264 compression differences. This validates ordering, not motion quality.
const decode = file => run(ffmpeg, ["-v", "error", "-i", file, "-vf", "scale=64:36:flags=area", "-pix_fmt", "rgb24", "-f", "rawvideo", "-"]);
const before = decode(source), after = decode(destination), frameBytes = 64 * 36 * 3;
assert.equal(before.length, 144 * frameBytes); assert.equal(after.length, 286 * frameBytes);
let maxMeanAbsoluteError = 0;
for (let frame = 0; frame < 286; frame++) {
  const expected = frame < 144 ? frame : 286 - frame;
  let difference = 0;
  for (let pixel = 0; pixel < frameBytes; pixel++) difference += Math.abs(after[frame * frameBytes + pixel] - before[expected * frameBytes + pixel]);
  maxMeanAbsoluteError = Math.max(maxMeanAbsoluteError, difference / frameBytes);
}
assert.ok(maxMeanAbsoluteError < 4, `Unexpected frame content/order: ${maxMeanAbsoluteError}`);
const bytes = readFileSync(destination);
assert.ok(bytes.indexOf(Buffer.from("moov")) < bytes.indexOf(Buffer.from("mdat")), "faststart");
assert.ok(bytes.length < 4_500_000, "bounded website loop size");
assert.equal(sha256(readFileSync(source)), original.master.sha256, "master unchanged");
const manifest = {
  source: { path: source, sha256: original.master.sha256, frames: 144, fps: 24 },
  website: { path: destination, sha256: sha256(bytes), bytes: bytes.length, frames: 286, fps: 24, durationSeconds: Number(technical.format.duration), technical },
  edit: "Original frames 0..143 followed by 142..1; the loop seam continues with 0. No generated frames, interpolation, upscale or source overwrite.",
  verification: { fullDecode: true, comparedFrames: 286, maxMeanAbsoluteError, comparison: "64x36 decoded RGB against the expected source-frame ordering; compression tolerance under4/255", visualBoundary: "Frame ordering does not establish continuous playback quality." }
};
writeFileSync("docs/web-004/universe-ping-pong.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify({ path: destination, bytes: bytes.length, frames: 286, duration: technical.format.duration, maxMeanAbsoluteError }));
