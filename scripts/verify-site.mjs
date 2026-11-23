import assert from "node:assert/strict";
import {stat,readdir,readFile} from "node:fs/promises";
import sharp from "sharp";
import ts from "typescript";
import path from "node:path";

const content = ts.transpileModule(await readFile("app/lib/work.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText;
const { multiAngleStudy, soapStudy, turnaroundStudies } = await import(`data:text/javascript;base64,${Buffer.from(content).toString("base64")}`);
assert.deepEqual(turnaroundStudies.map(entry => entry.id), ["milk", "soap"], "both original study configurations remain preserved");
assert.deepEqual(turnaroundStudies[0].study, multiAngleStudy, "milk configuration remains available for restoration");
assert.deepEqual(turnaroundStudies[1].study, soapStudy, "soap configuration remains available");
const allStudyImages = [];
for (const entry of turnaroundStudies) {
  const study = entry.study;
  const turnaroundUrl = path.posix.dirname(study.original.image.src);
  const manifest = JSON.parse(await readFile(`public${turnaroundUrl}/manifest.json`, "utf8"));
  const frames = study.result.frames;
  assert.ok(frames.length >= 4 && frames.length <= 8, "curated set contains four to eight views");
  assert.equal(manifest.frames.length, frames.length, "manifest matches configured sequence");
  assert.equal(new Set(frames.map(frame => frame.angle)).size, frames.length, "angles are unique");
  for (const [index, frame] of frames.entries()) {
    assert.ok(Number.isFinite(frame.angle) && frame.angle >= 0 && frame.angle < 360, "valid angle");
    if (index) assert.ok(frame.angle > frames[index - 1].angle, "angles in rotation order");
    assert.equal(frame.src, `${turnaroundUrl}/${manifest.frames[index].file}`);
    assert.equal(frame.angle, manifest.frames[index].angle);
    assert.ok(frame.alt.trim(), "every accepted view has alt text");
    const file = `public${frame.src}`;
    const image = await sharp(file).metadata();
    assert.equal(image.format, "webp");
    assert.equal(image.width, 1024);
    assert.equal(image.height, 1024);
    assert.equal((await stat(file)).size, manifest.frames[index].bytes);
    assert.ok(manifest.frames[index].bytes < 170_000, "turnaround frame budget");
    await sharp(file).raw().toBuffer(); // Decode actual image data, not just a header.
  }
  assert.equal(study.original.image.src, `${turnaroundUrl}/${manifest.reference}`);
  assert.deepEqual(await readFile(`public${study.original.image.src}`), await readFile(`public${frames[0].src}`), "front view is the actual demonstration reference");
  allStudyImages.push(study.original.image, ...frames);
  console.log(`PASS ${entry.label}: ${frames.length} views, configuration, decoding, dimensions and budgets`);
}
const frames = soapStudy.result.frames;
const base=process.env.PREVIEW_URL||"http://localhost:3100";
const routes=["/","/services","/work","/how-it-works","/about","/contact"];
for(const route of routes){const response=await fetch(`${base}${route}`);assert.equal(response.status,200,route);const html=await response.text();assert.match(html,/<main[^>]*id="main"/,`${route}: main landmark`);assert.match(html,/<title>[^<]*Summit Sight/);assert.match(html,/name="description"/);assert.match(html,/property="og:image"/);assert.ok(!/\b(Cinema Lab|Vestaryn|Silen|Oddloop|Mazeloop|trading|field guide)\b/i.test(html),`${route}: obsolete positioning absent`);for(const destination of routes)assert.ok(html.includes(`href="${destination}"`),`${route} navigation to ${destination}`);if(route==="/work"){assert.match(html,/type="range"/);assert.match(html,/aria-label="Select product angle"/);assert.match(html,/preload="none"/);assert.equal((html.match(/<video\b/g)||[]).length,2,"two cinematic studies");assert.doesNotMatch(html,/<video[^>]*\scontrols/);assert.match(html,/role="tablist"/);}if(route==="/contact"){for(const field of ["name","business","email","service","brief"])assert.ok(html.includes(`name="${field}"`));assert.match(html,/does not send inquiries directly/);assert.doesNotMatch(html,/<form[^>]*action="https?:/);}console.log(`PASS ${route}: navigation, metadata, content and landmarks`);}
for(const route of ["/vestaryn","/oddloop","/mazeloop","/driftline","/tiny-delve","/peak-stack"])assert.equal((await fetch(`${base}${route}`)).status,404);
console.log("PASS all obsolete public routes return 404");
async function assets(directory){for(const entry of await readdir(directory,{withFileTypes:true})){const full=`${directory}/${entry.name}`;if(entry.isDirectory()){await assets(full);continue;}const url=full.replace(/^public/,"");const response=await fetch(`${base}${url}`);assert.equal(response.status,200,url);const bytes=(await stat(full)).size;assert.ok(bytes>0,url);if(!url.endsWith(".mp4"))assert.ok(bytes<600_000,`${url} image budget`);else assert.ok(bytes < (url.endsWith("/universe-within-ping-pong-v1.mp4") ? 4_500_000 : url.includes("/cinematic-studies/") ? 2_000_000 : 1_500_000),`${url} video budget`);console.log(`PASS ${url} (${Math.round(bytes/1024)} KiB)`);}}
await assets("public/media");
const workHtml = await (await fetch(`${base}/work`)).text();
const section = workHtml.match(/<section class="work-section" id="multi-angle">([\s\S]*?)<\/section>/)?.[1];
assert.ok(section, "multi-angle section exists");
const studyTabs = section.match(/<button\b[^>]*role="tab"[^>]*>[\s\S]*?<\/button>/g) || [];
assert.equal(studyTabs.length, 0, "single soap study needs no product selector");
assert.doesNotMatch(section, /Choose a product|Milk carton|Summit Sight Milk|milk-turnaround|angle-studies-picker/, "milk and the redundant picker are hidden from Work");
assert.match(section, /soap-turnaround/);
assert.ok(section.indexOf("reference.webp") < section.indexOf("view-000.webp"), "reference precedes the interactive result");
assert.match(section, /Reference image/);
assert.match(section, /Interactive result/);
assert.match(section, /Good Hands Soap/);
assert.match(section, /botanical front, curved sides and detailed back label/);
assert.match(section, /product, formula and label copy are fictional/);
assert.match(section, /fictional soap bottle/);
assert.match(section, /unseen surfaces are artistic approximations/);
assert.match(section, /Angles are approximate/);
assert.match(section, /not commissioned customer work/);
assert.doesNotMatch(section, /Source photograph to be added|12-view illustration|\/media\/sequence\/|\/media\/product-turnaround\/|Amber glass bottle/);
assert.match(section, /aria-label="Interactive product views"/);
assert.match(section, /aria-label="Previous product angle"/);
assert.match(section, /aria-label="Next product angle"/);
assert.ok(section.includes(`aria-valuetext="${frames[0].angle} degrees, view 1 of ${frames.length}"`));
assert.equal((section.match(/<img\b/g) || []).length, 2, "HTML renders only reference and initial frame, not the entire sequence");
for (const image of allStudyImages) {
  const response = await fetch(`${base}/_next/image?url=${encodeURIComponent(image.src)}&w=1080&q=75`);
  assert.equal(response.status, 200, `optimized ${image.src}`);
  assert.match(response.headers.get("content-type"), /image/);
  const decoded = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
  assert.ok(decoded.width > 0 && decoded.height > 0);
}
console.log("PASS soap-only Work presentation, disclosures, controls and optimized preserved study assets");
const optimized=await fetch(`${base}/_next/image?url=%2Fmedia%2Fhero.webp&w=1920&q=75`);assert.equal(optimized.status,200);assert.match(optimized.headers.get("content-type"),/image/);
console.log("PASS responsive Next image optimization");
console.log("HTTP checks complete. Browser interaction and visual checks must be performed separately.");
