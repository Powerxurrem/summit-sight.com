import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
function loadSource(file, dependencies = {}) {
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports,
    require: name => name.endsWith(".css") ? {} : dependencies[name] || require(name),
  }, { filename: file });
  return module.exports;
}
const study = loadSource("app/lib/watch-study.ts");
const { WatchComparison } = loadSource("app/components/watch-comparison.tsx", { "../lib/watch-study": study });
const render = () => renderToStaticMarkup(createElement(WatchComparison));

test("initial comparison displays direct committed images without a pending loading gate", () => {
  const html = render();
  const images = html.match(/<img\b[^>]*>/g) || [];
  assert.equal(images.length, 2);
  assert.match(images[0], /src="\/media\/watch-study\/studio.webp"/);
  assert.match(images[1], /src="\/media\/watch-study\/creative.webp"/);
  assert.doesNotMatch(html, /_next\/image|Loading images|Preparing your comparison|aria-busy|watch-image-status/);
  for (const image of images) {
    assert.match(image, /loading="eager"/);
    assert.match(image, /width="1254" height="1254"/);
    assert.match(image, /alt="[^"]+"/);
    assert.doesNotMatch(image, /visibility:hidden/);
  }
});

test("controls are usable on initial render and preserve all four treatment choices", () => {
  const html = render();
  const range = html.match(/<input\b[^>]*type="range"[^>]*>/)?.[0];
  assert.ok(range);
  assert.doesNotMatch(range, /disabled/);
  const selects = html.match(/<select\b[\s\S]*?<\/select>/g) || [];
  assert.equal(selects.length, 2);
  for (const select of selects) assert.equal((select.match(/<option\b/g) || []).length, 4);
  assert.match(selects[0], /value="creative" selected=""/);
  assert.match(selects[1], /value="studio" selected=""/);
});

test("repeated fresh renders cannot reintroduce an initial loading message", () => {
  for (let attempt = 0; attempt < 10; attempt++) {
    assert.doesNotMatch(render(), /Loading images|Preparing your comparison|watch-image-status|aria-busy/);
  }
});
