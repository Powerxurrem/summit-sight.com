import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = ts.transpileModule(readFileSync("app/components/cinematic-video.tsx", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
}).outputText;

function mount({ reduced = false, saveData = false, reject = false, defer = false, observer = true } = {}) {
  class Video extends EventTarget {
    paused = true; ended = false; error = null; currentTime = 0; sources = []; pending = [];
    getAttribute(name) { return name === "src" ? this.source : null; }
    set src(value) { this.source = value; this.sources.push(value); }
    removeAttribute(name) { if (name === "src") this.source = undefined; }
    load() { this.paused = true; this.ended = false; }
    play() {
      if (reject) return Promise.reject(new Error("Autoplay blocked"));
      if (defer) return new Promise(resolve => this.pending.push(() => { this.paused = false; this.dispatchEvent(new Event("play")); resolve(); }));
      this.paused = false; this.dispatchEvent(new Event("play")); return Promise.resolve();
    }
    pause() { if (!this.paused) { this.paused = true; this.dispatchEvent(new Event("pause")); } }
  }
  const video = new Video();
  const document = new EventTarget(); document.hidden = false;
  const motion = new EventTarget(); motion.matches = reduced;
  let intersection, effect, status = "idle", refIndex = 0;
  const exports = {};
  const react = {
    useId: () => "test", useRef: value => ({ current: refIndex++ === 0 ? video : value }),
    useState: value => [value, next => { status = next; }],
    useEffect: callback => { effect = callback; },
  };
  const jsx = (type, props) => ({ type, props });
  const window = { matchMedia: () => motion };
  if (observer) window.IntersectionObserver = class {
    constructor(callback) { intersection = callback; }
    observe() {} disconnect() {}
  };
  vm.runInNewContext(source, {
    exports, require: name => name === "react" ? react : name === "react/jsx-runtime" ? { jsx, jsxs: jsx } : { default: {} },
    window, document, navigator: { connection: { saveData } }, IntersectionObserver: window.IntersectionObserver,
  });
  const tree = exports.CinematicVideo({ study: { title: "Study", src: "/study.mp4", poster: "/poster.webp", loop: false } });
  function find(node, type) {
    if (!node || typeof node !== "object") return;
    if (node.type === type) return node;
    for (const child of [node.props?.children].flat()) { const found = find(child, type); if (found) return found; }
  }
  const cleanup = effect();
  return {
    video, tree, cleanup, status: () => status,
    visible: (ratio = 1) => intersection?.([{ isIntersecting: ratio > 0, intersectionRatio: ratio }]),
    click: () => find(tree, "button").props.onClick(),
    hidden: value => { document.hidden = value; document.dispatchEvent(new Event("visibilitychange")); },
    reduced: value => { motion.matches = value; motion.dispatchEvent(new Event("change")); },
  };
}
const settle = () => new Promise(resolve => setImmediate(resolve));

test("offscreen cards fetch no video, then play muted inline only above threshold", async () => {
  const card = mount(); assert.equal(card.video.source, undefined);
  card.visible(0.2); assert.equal(card.video.source, undefined);
  card.visible(); await settle(); assert.equal(card.video.paused, false);
  card.visible(0.2); assert.equal(card.video.paused, true); card.cleanup();
});
test("manual pause survives viewport and document visibility changes", () => {
  const card = mount(); card.visible(); card.click();
  card.visible(0); card.visible(); card.hidden(true); card.hidden(false);
  assert.equal(card.video.paused, true); card.click(); assert.equal(card.video.paused, false); card.cleanup();
});
for (const preference of ["reduced", "saveData"]) test(`${preference} stays on poster until explicit Play`, () => {
  const card = mount({ [preference]: true }); card.visible();
  assert.equal(card.video.source, undefined); card.click(); assert.equal(card.video.paused, false); card.cleanup();
});
test("a live reduced-motion request pauses and restores the poster", () => {
  const card = mount(); card.visible(); card.reduced(true);
  assert.equal(card.video.paused, true); assert.equal(card.video.source, undefined); assert.equal(card.status(), "idle");
  card.click(); assert.equal(card.video.paused, false); card.cleanup();
});
test("single-pass ending holds until explicit Replay", () => {
  const card = mount(); card.visible(); card.video.ended = true; card.video.paused = true;
  card.video.dispatchEvent(new Event("ended")); card.visible(0); card.visible(); card.hidden(true); card.hidden(false);
  assert.equal(card.video.paused, true); assert.equal(card.status(), "ended");
  card.click(); assert.equal(card.video.currentTime, 0); assert.equal(card.video.paused, false); card.cleanup();
});
test("autoplay rejection leaves an operable Play interaction and avoids retries on scroll", async () => {
  const card = mount({ reject: true }); card.visible(); await settle();
  assert.equal(card.status(), "paused"); card.visible(0); card.visible(); assert.equal(card.video.sources.length, 1);
  card.click(); await settle(); assert.equal(card.status(), "paused"); card.cleanup();
});
test("a late play resolution cannot restart a hidden or disposed video", async () => {
  for (const dispose of [false, true]) {
    const card = mount({ defer: true }); card.visible();
    if (dispose) card.cleanup(); else card.hidden(true);
    card.video.pending[0](); await settle(); assert.equal(card.video.paused, true);
    if (!dispose) card.cleanup();
  }
});
test("without IntersectionObserver, only explicit Play loads the source", () => {
  const card = mount({ observer: false }); assert.equal(card.video.source, undefined);
  card.click(); assert.equal(card.video.paused, false); card.cleanup();
});
