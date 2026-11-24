import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

const base = process.env.PREVIEW_URL || "http://localhost:3101";
const manifest = JSON.parse(await readFile("docs/web-005/media-manifest.json", "utf8"));
const response = await fetch(base);
assert.equal(response.status, 200);
const html = (await response.text()).replace(/<script\b[\s\S]*?<\/script>/g, "");
const section = html.match(/<section id="virtual-stage"[\s\S]*?<\/section>/)?.[0];
assert.ok(section, "Virtual Stage section present");
assert.ok(html.indexOf("Ignition") < html.indexOf('id="virtual-stage"'));
assert.ok(html.indexOf("A Universe Within") < html.indexOf('id="virtual-stage"'));
assert.ok(html.indexOf('id="virtual-stage"') < html.indexOf("services-home"));
for (const text of ["VIRTUAL STAGE / CREATIVE EXPERIMENT", "One scene.", "Infinite possibilities.", "Built in 3D.", "Reimagined with AI.", "Original Blender Clay", "Drowned Cathedral", "Forgotten Sanctuary", "Singularity Engine"]) assert.ok(section.includes(text), text);
const videos = section.match(/<video\b[^>]*>/g) || [];
assert.equal(videos.length, 2);
for (const video of videos) {
  assert.match(video, /preload="none"/); assert.match(video, /muted=""/);
  assert.match(video, /playsInline=""|playsinline=""/);
  assert.match(video, /poster="\/media\/virtual-stage\//);
  assert.doesNotMatch(video, /\ssrc=|\sautoPlay=|\sautoplay=|\sloop=|\scontrols=/);
}
assert.equal((section.match(/aria-pressed="true"/g) || []).length, 1);
assert.equal((section.match(/aria-pressed="false"/g) || []).length, 2);
assert.match(section, /aria-label="Play scene comparison"/);
assert.match(section, /aria-controls="virtual-stage-source"/);
assert.match(section, /aria-expanded="false"/);
assert.match(section, /<noscript>/);
assert.match(section, /Choose a world\. Press play to explore\./);
assert.doesNotMatch(section, /frame-perfect|exact geometry|geometric preservation/);
for (const asset of manifest.assets) {
  const url = asset.destination.replace(/^public/, "");
  const video = await fetch(`${base}${url}`);
  assert.equal(video.status, 200); assert.match(video.headers.get("content-type"), /video\/mp4/);
  const bytes = Buffer.from(await video.arrayBuffer());
  assert.equal(bytes.length, asset.website.bytes);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.website.sha256);
  assert.ok(bytes.indexOf(Buffer.from("moov")) < bytes.indexOf(Buffer.from("mdat")));
  const range = await fetch(`${base}${url}`, { headers: { Range: "bytes=0-1023" } });
  assert.equal(range.status, 206); assert.equal((await range.arrayBuffer()).byteLength, 1024);
  const poster = await fetch(`${base}${asset.poster.replace(/^public/, "")}`);
  assert.equal(poster.status, 200);
  const posterBytes = Buffer.from(await poster.arrayBuffer());
  assert.equal(createHash("sha256").update(posterBytes).digest("hex"), asset.posterMetadata.sha256);
  const image = await sharp(posterBytes).metadata();
  assert.equal(image.width, 1280); assert.equal(image.height, 720);
  await sharp(posterBytes).raw().toBuffer();
  assert.equal(asset.website.technical.streams[0].nb_frames, "121");
  assert.equal(asset.website.technical.streams[0].r_frame_rate, "24/1");
  console.log(`PASS ${asset.id}: served hash, faststart, byte ranges, decoded poster and recorded 121-frame timeline`);
}
assert.deepEqual(manifest.timing.sourceIndicesHalfOpen, [71, 192]);
assert.equal(manifest.timing.sourceSecondsHalfOpen[0], 71 / 24);
assert.equal(manifest.timing.sourceSecondsHalfOpen[1], 8);
console.log("PASS Home placement, poster-only initial markup, world buttons, shared playback control, mobile source toggle and timing provenance");
console.log("Rendered responsive appearance, actual browser event dispatch and decoder synchronization require browser review.");
