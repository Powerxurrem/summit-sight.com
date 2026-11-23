import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

const base = process.env.PREVIEW_URL || "http://localhost:3000";
const manifest = JSON.parse(await readFile("docs/web-004/media-manifest.json", "utf8"));
const universeLoop = JSON.parse(await readFile("docs/web-004/universe-ping-pong.json", "utf8"));
const lenaManifest = JSON.parse(await readFile("docs/lena-release/media-manifest.json", "utf8"));
for (const route of ["/", "/work"]) {
  const response = await fetch(`${base}${route}`);
  assert.equal(response.status, 200);
  const documentHtml = await response.text();
  const html = documentHtml.replace(/<script\b[\s\S]*?<\/script>/g, "");
  assert.equal((html.match(/01 \/ CINEMATIC STUDIES/g) || []).length, 1);
  assert.match(html, /Beyond the frame\./);
  assert.match(html, /Into the extraordinary\./);
  const allVideos = html.match(/<video\b[^>]*>/g) || [];
  const videos = allVideos.filter(video => video.includes('/media/cinematic-studies/'));
  const lena = allVideos.filter(video => video.includes('/media/character-studies/lena-performance-v2.mp4'));
  assert.equal(allVideos.length, 2 + lena.length);
  assert.equal(lena.length, route === "/work" ? 1 : 0, "Lena is visible on Work only");
  if (lena.length) {
    assert.doesNotMatch(lena[0], /\scontrols=/);
    assert.match(lena[0], /disablePictureInPicture=""|disablepictureinpicture=""/);
    assert.match(html, /aria-label="Play Lena"/);
    assert.match(html, /aria-label="Mute Lena"/);
    assert.match(lena[0], /preload="none"/);
    assert.doesNotMatch(lena[0], /\sautoPlay=|\sautoplay=|\smuted=/);
    assert.match(lena[0], /poster="\/media\/character-studies\/lena-poster-v2.webp"/);
    assert.doesNotMatch(html, /lena-preview-v1|lena-poster-v1|Open film|<dialog\b/);
  }
  assert.equal(videos.length, 2);
  for (const video of videos) {
    assert.match(video, /preload="none"/);
    assert.match(video, /muted=""/);
    assert.match(video, /playsInline=""|playsinline=""/);
    assert.doesNotMatch(video, /\ssrc=|\scontrols=/);
  }
  assert.match(videos[0], /loop=""/);
  assert.match(videos[1], /loop=""/);
  assert.ok(html.includes("universe-within-ping-pong-v1.mp4"), "eye study uses the forward/reverse derivative");
  for (const title of ["Ignition", "A Universe Within"]) assert.ok(html.includes(`aria-label="Play ${title}"`));
  assert.doesNotMatch(html, /01 \/ IMAGE STUDIES|04 \/ MOTION STUDIES|amber-motion\.mp4|ritual-motion\.mp4|work-preview-grid/);
  if (route === "/work") {
    for (const id of ["concepts", "motion", "amber-stone", "quiet-form", "daily-ritual", "transformations", "multi-angle"]) assert.ok(html.includes(`id="${id}"`));
    assert.match(html, /02 \/ CREATIVE TRANSFORMATIONS/);
    assert.match(html, /03 \/ A NEW PERSPECTIVE/);
    assert.match(html, /Cinematic studies/);
  } else {
    for (const name of ["selected-work", "services-home", "transformation-home", "studio-note"]) assert.ok(html.includes(name));
  }
  // Verify delivered client scripts as well as server HTML; this does not prove hydration.
  const scripts = [...new Set([...documentHtml.matchAll(/<script[^>]*src="([^"]+)"/g)].map(match => match[1]))];
  for (const src of scripts) {
    const script = await fetch(new URL(src.replaceAll("&amp;", "&"), base));
    assert.equal(script.status, 200, src);
    assert.match(script.headers.get("content-type"), /javascript/);
    await script.arrayBuffer();
  }
  console.log(`PASS ${route}: cinematic content, lazy sources, controls, loop policy, anchors and ${scripts.length} client scripts`);
}
for (const study of manifest.studies) {
  const playback = study.id === "universe-within" ? universeLoop.website : { path: study.web.destination, sha256: study.web.sha256 };
  const url = playback.path.replace(/^public/, "");
  const range = await fetch(`${base}${url}`, { headers: { Range: "bytes=0-1023" } });
  assert.equal(range.status, 206); assert.equal((await range.arrayBuffer()).byteLength, 1024);
  const response = await fetch(`${base}${url}`);
  assert.equal(response.status, 200); assert.match(response.headers.get("content-type"), /video\/mp4/);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(createHash("sha256").update(bytes).digest("hex"), playback.sha256);
  assert.ok(bytes.indexOf(Buffer.from("moov")) < bytes.indexOf(Buffer.from("mdat")), "faststart metadata precedes video data");
  const poster = await fetch(`${base}${study.poster.destination.replace(/^public/, "")}`);
  assert.equal(poster.status, 200);
  const image = await sharp(Buffer.from(await poster.arrayBuffer())).metadata();
  assert.equal(image.width, 1024); assert.equal(image.height, 576);
  console.log(`PASS ${study.id}: served SHA-256 matches delivery, byte ranges, faststart and native-ratio poster`);
}
for (const artifact of [lenaManifest.video, lenaManifest.poster]) {
  const url = artifact.path.replace(/^public/, "");
  const response = await fetch(`${base}${url}`);
  assert.equal(response.status, 200, url);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(bytes.length, artifact.bytes);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), artifact.sha256);
  if (url.endsWith(".mp4")) {
    assert.match(response.headers.get("content-type"), /video\/mp4/);
    assert.ok(bytes.indexOf(Buffer.from("moov")) < bytes.indexOf(Buffer.from("mdat")));
    const range = await fetch(`${base}${url}`, { headers: { Range: "bytes=0-1023" } });
    assert.equal(range.status, 206);
    assert.equal((await range.arrayBuffer()).byteLength, 1024);
  } else {
    const poster = await sharp(bytes).metadata();
    assert.equal(poster.width, artifact.width);
    assert.equal(poster.height, artifact.height);
    await sharp(bytes).raw().toBuffer();
  }
}
console.log("PASS Lena: enhanced clip/poster delivery hashes, inline controls, Work-only visibility and byte ranges");
console.log("Browser visual, interaction, reduced-motion emulation and continuous playback review remain separate.");
