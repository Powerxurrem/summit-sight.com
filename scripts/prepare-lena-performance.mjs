import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const source = String.raw`C:\Users\summi\Downloads\ai(3).mp4`;
const ffmpeg = process.env.FFMPEG_PATH;
assert.ok(ffmpeg, "Set FFMPEG_PATH to the local FFmpeg executable");
const ffprobe = path.join(path.dirname(ffmpeg), "ffprobe.exe");
const directory = "public/media/character-studies";
const video = `${directory}/lena-performance-v2.mp4`;
const poster = `${directory}/lena-poster-v2.webp`;
const hash = file => createHash("sha256").update(readFileSync(file)).digest("hex");
const run = args => execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", ...args], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
const probe = file => JSON.parse(execFileSync(ffprobe, ["-v", "error", "-show_streams", "-show_format", "-of", "json", file], { encoding: "utf8" }));
const originalHash = hash(source);
const original = probe(source);
mkdirSync(directory, { recursive: true });
mkdirSync("docs/lena-release", { recursive: true });

// Preserve all frames, timing and the original AAC stream; only resize/re-encode picture.
// --verify-only checks existing derivatives without overwriting or re-encoding them.
if (!process.argv.includes("--verify-only")) {
  run(["-n", "-i", source, "-map", "0:v:0", "-map", "0:a:0", "-vf", "scale=1920:1080:flags=lanczos", "-c:v", "libx264", "-crf", "21", "-preset", "slow", "-pix_fmt", "yuv420p", "-fps_mode", "passthrough", "-c:a", "copy", "-map_metadata", "-1", "-movflags", "+faststart", video]);
  run(["-n", "-i", source, "-vf", "select=eq(n\\,120),scale=1280:720:flags=lanczos", "-frames:v", "1", "-c:v", "libwebp", "-quality", "85", poster]);
}
run(["-i", video, "-f", "null", "-"]);
const output = probe(video);
const sourceVideo = original.streams.find(stream => stream.codec_type === "video");
const outputVideo = output.streams.find(stream => stream.codec_type === "video");
assert.equal(outputVideo.nb_frames, sourceVideo.nb_frames);
assert.equal(outputVideo.avg_frame_rate, sourceVideo.avg_frame_rate);
assert.equal(outputVideo.duration, sourceVideo.duration);
assert.equal(outputVideo.width, 1920);
assert.equal(outputVideo.height, 1080);
assert.equal(outputVideo.codec_name, "h264");
assert.equal(outputVideo.pix_fmt, "yuv420p");
const audioHash = file => run(["-i", file, "-map", "0:a:0", "-c:a", "pcm_s16le", "-f", "hash", "-hash", "sha256", "-"]).trim();
const sourceAudioHash = audioHash(source);
assert.equal(audioHash(video), sourceAudioHash, "decoded original audio is unchanged");
assert.equal(hash(source), originalHash, "original is unchanged");
const bytes = readFileSync(video);
assert.ok(bytes.indexOf(Buffer.from("moov")) < bytes.indexOf(Buffer.from("mdat")), "fast-start MP4");
assert.ok(statSync(video).size < 5_500_000, "on-demand 1080p character film budget");
const manifest = {
  status: "user authorized enhanced clip for production publication on 2026-11-23",
  source: { path: source, sha256: originalHash, bytes: statSync(source).size },
  video: { path: video, sha256: hash(video), bytes: statSync(video).size, width: 1920, height: 1080, frames: Number(outputVideo.nb_frames), fps: outputVideo.avg_frame_rate, durationSeconds: Number(outputVideo.duration), audio: "enhanced source AAC stream copied unchanged", decodedAudioHash: sourceAudioHash, fastStart: true },
  poster: { path: poster, sha256: hash(poster), bytes: statSync(poster).size, sourceFrame: 120, width: 1280, height: 720 },
  checks: ["source SHA-256 unchanged", "full video and audio decode passed", "frame count, rate and duration preserved", "decoded audio SHA-256 matches source", "moov precedes mdat"],
  review: "User approved publication of the enhanced source. Agent checks establish media integrity, not continuous audiovisual playback, lip-sync quality or caption accuracy.",
};
writeFileSync("docs/lena-release/media-manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest, null, 2));
