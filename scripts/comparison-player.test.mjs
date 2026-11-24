import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const code = ts.transpileModule(readFileSync("app/lib/comparison-player.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText;
const { createComparisonPlayer } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
const settle = () => new Promise(resolve => setImmediate(resolve));

class Video extends EventTarget {
  paused = true; readyState = 0; seeking = false; ended = false; error = null; preload = "none";
  sources = []; seeks = []; plays = 0; pending = []; time = 0;
  autoReady = true; autoSeek = true; reject = false; defer = false;
  getAttribute() { return this.source; }
  set src(value) { this.source = value; this.sources.push(value); }
  removeAttribute() { this.source = undefined; }
  load() { this.readyState = this.autoReady && this.preload !== "none" ? 3 : 0; this.time = 0; this.ended = false; this.error = null; this.paused = true; }
  get currentTime() { return this.time; }
  set currentTime(value) {
    this.time = value; this.ended = false; this.seeks.push(value); this.seeking = !this.autoSeek;
    if (this.autoSeek) queueMicrotask(() => this.dispatchEvent(new Event("seeked")));
  }
  ready() { this.readyState = 3; this.dispatchEvent(new Event("loadeddata")); this.dispatchEvent(new Event("canplay")); }
  play() {
    this.plays++;
    if (this.reject) return Promise.reject(new Error("Play blocked"));
    const start = () => { this.paused = false; this.ended = false; this.dispatchEvent(new Event("play")); };
    if (this.defer) return new Promise(resolve => this.pending.push(() => { start(); resolve(); }));
    start(); return Promise.resolve();
  }
  pause() { this.paused = true; }
}
function mount() {
  const clay = new Video(), world = new Video();
  let status = "idle";
  const player = createComparisonPlayer({ clay, world, claySource: "/clay.mp4", worldSource: "/world-1.mp4", onStatus: value => { status = value; } });
  return { clay, world, player, status: () => status };
}

test("posters and selector do not fetch video until explicit Play", async () => {
  const { clay, world, player, status } = mount();
  player.setVisible(true); player.select("/world-2.mp4"); await settle();
  assert.deepEqual(clay.sources, []); assert.deepEqual(world.sources, []);
  assert.equal(clay.preload, "none"); assert.equal(world.preload, "none");
  player.toggle(); await settle();
  assert.deepEqual(clay.sources, ["/clay.mp4"]); assert.deepEqual(world.sources, ["/world-2.mp4"]);
  assert.equal(clay.preload, "auto"); assert.equal(world.preload, "auto");
  assert.equal(status(), "playing"); player.dispose();
});
test("world selection freezes and resumes the shared timeline without resetting clay", async () => {
  const { clay, world, player, status } = mount();
  player.setVisible(true); player.toggle(); await settle();
  clay.time = 2.25; world.time = 2.27;
  player.select("/world-2.mp4");
  assert.equal(clay.paused, true); assert.equal(world.paused, true);
  await settle();
  assert.equal(world.currentTime, 2.25); assert.equal(clay.currentTime, 2.25);
  assert.equal(clay.sources.length, 1); assert.equal(status(), "playing");
  const seeks = world.seeks.length;
  for (let i = 0; i < 20; i++) world.dispatchEvent(new Event("timeupdate"));
  assert.equal(world.seeks.length, seeks, "normal playback does not constantly seek");
  player.toggle(); player.select("/world-3.mp4"); await settle();
  assert.equal(status(), "paused"); assert.equal(clay.paused, true); assert.equal(world.paused, true);
  assert.equal(world.currentTime, 2.25); player.dispose();
});
test("rapid selection cancels stale readiness work and retains only the latest world", async () => {
  const { clay, world, player, status } = mount();
  player.setVisible(true); player.toggle(); await settle(); clay.time = 1.5;
  world.autoReady = false;
  player.select("/world-2.mp4"); player.select("/world-3.mp4");
  world.ready(); await settle();
  assert.equal(world.source, "/world-3.mp4"); assert.equal(world.currentTime, 1.5);
  assert.equal(world.plays, 2); assert.equal(status(), "playing"); player.dispose();
});
for (const reason of ["offscreen", "hidden", "reduced motion"]) test(`${reason} pauses both and requires explicit resume`, async () => {
  const { clay, world, player, status } = mount();
  player.setVisible(true); player.toggle(); await settle();
  if (reason === "offscreen") { player.setVisible(false); player.setVisible(true); }
  else if (reason === "hidden") { player.setHidden(true); player.setHidden(false); }
  else player.reduceMotion();
  await settle(); assert.equal(status(), "paused"); assert.equal(clay.paused, true); assert.equal(world.paused, true);
  player.toggle(); await settle(); assert.equal(status(), "playing"); player.dispose();
});
test("a rejected play and a late resolution leave both paused with Retry available", async () => {
  const { clay, world, player, status } = mount();
  clay.reject = true; world.defer = true;
  player.setVisible(true); player.toggle(); await settle();
  assert.equal(status(), "paused"); world.pending[0](); await settle();
  assert.equal(clay.paused, true); assert.equal(world.paused, true);
  clay.reject = false; world.defer = false;
  player.toggle(); await settle(); assert.equal(status(), "playing"); player.dispose();
});
test("buffering holds both panels, then aligns once before resuming", async () => {
  const { clay, world, player, status } = mount();
  player.setVisible(true); player.toggle(); await settle(); clay.time = 3; world.time = 2.9;
  world.readyState = 2; world.dispatchEvent(new Event("waiting")); await settle();
  assert.equal(status(), "loading"); assert.equal(clay.paused, true); assert.equal(world.paused, true);
  world.ready(); await settle(); assert.equal(world.currentTime, 3); assert.equal(status(), "playing"); player.dispose();
});
test("each ending loops both clips together and ignores duplicate or stale end events", async () => {
  const { clay, world, player, status } = mount();
  player.setVisible(true); player.toggle(); await settle();
  for (let cycle = 0; cycle < 3; cycle++) {
    clay.time = world.time = 5.041667; clay.ended = world.ended = true;
    world.dispatchEvent(new Event("ended")); clay.dispatchEvent(new Event("ended"));
    await settle();
    assert.equal(status(), "playing");
    assert.equal(clay.currentTime, 0); assert.equal(world.currentTime, 0);
    assert.equal(clay.plays, cycle + 2); assert.equal(world.plays, cycle + 2);
    // A delayed event from the preceding cycle must not restart the new one.
    world.dispatchEvent(new Event("ended")); await settle();
    assert.equal(world.plays, cycle + 2);
  }
  clay.time = 1.25; player.select("/world-3.mp4"); await settle();
  assert.equal(status(), "playing"); assert.equal(world.currentTime, 1.25); player.dispose();
});
test("pause, offscreen and reduced motion cancel a pending loop restart", async () => {
  for (const reason of ["pause", "offscreen", "reduced motion"]) {
    const { clay, world, player, status } = mount();
    player.setVisible(true); player.toggle(); await settle();
    clay.time = world.time = 5.041667; world.ended = true;
    world.dispatchEvent(new Event("ended"));
    if (reason === "pause") player.toggle();
    else if (reason === "offscreen") player.setVisible(false);
    else player.reduceMotion();
    await settle();
    assert.equal(status(), "paused"); assert.equal(clay.paused, true); assert.equal(world.paused, true);
    assert.equal(clay.plays, 1); assert.equal(world.plays, 1); player.dispose();
  }
});
test("pause and unmount cancel pending load/seek work and late play resolutions", async () => {
  for (const dispose of [false, true]) {
    const { clay, world, player } = mount(); world.defer = true;
    player.setVisible(true); player.toggle(); await settle();
    if (dispose) player.dispose(); else player.toggle();
    world.pending[0](); await settle();
    assert.equal(clay.paused, true); assert.equal(world.paused, true);
    if (!dispose) player.dispose();
  }
  const { clay, world, player, status } = mount();
  world.autoReady = false; player.setVisible(true); player.toggle();
  player.toggle(); world.ready(); await settle();
  assert.equal(status(), "paused"); assert.equal(clay.paused, true); assert.equal(world.plays, 0); player.dispose();
});
test("a genuine media failure pauses the pair and can recover on explicit Retry", async () => {
  const { clay, world, player, status } = mount();
  player.setVisible(true); player.toggle(); await settle();
  world.error = new Error("Decode failed"); world.dispatchEvent(new Event("error"));
  assert.equal(status(), "error"); assert.equal(clay.paused, true);
  player.toggle(); await settle(); assert.equal(status(), "playing"); player.dispose();
});
test("cancellation after readiness prevents stale seeks and ignores obsolete ending events", async () => {
  const { clay, world, player, status } = mount();
  player.setVisible(true); player.toggle(); await settle(); clay.time = 2;
  world.autoReady = false; player.select("/world-2.mp4");
  world.ready(); player.toggle(); // Pause before the loadeddata continuation runs.
  world.dispatchEvent(new Event("ended")); await settle();
  assert.equal(world.seeks.length, 0); assert.equal(status(), "paused");
  assert.equal(world.paused, true); player.dispose();
});
