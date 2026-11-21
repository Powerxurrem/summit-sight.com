import test from "node:test";
import assert from "node:assert/strict";
import { observeWatchImage } from "../app/lib/watch-image-loading.ts";

class TestImage extends EventTarget {
  complete = false;
  naturalWidth = 0;
  currentSrc = "";
  finish(success) {
    this.complete = true;
    this.currentSrc = "/_next/image?url=watch.webp";
    this.naturalWidth = success ? 1254 : 0;
    this.dispatchEvent(new Event(success ? "load" : "error"));
  }
}

test("warm-cache refresh settles without another load event or decode promise", () => {
  const image = new TestImage();
  image.finish(true);
  image.decode = () => { throw new Error("Readiness must not wait on framework decoding"); };
  const states = [];
  const cleanup = observeWatchImage(image, state => states.push(state));
  assert.deepEqual(states, ["loaded"]);
  image.dispatchEvent(new Event("load"));
  assert.deepEqual(states, ["loaded"], "duplicate load does not restart state updates");
  cleanup();
});

test("a failure before hydration is reported instead of remaining pending", () => {
  const image = new TestImage();
  image.finish(false);
  const states = [];
  observeWatchImage(image, state => states.push(state))();
  assert.deepEqual(states, ["error"]);
});

test("cold images settle independently and can recover after an error", () => {
  const left = new TestImage();
  const right = new TestImage();
  const states = [];
  const cleanupLeft = observeWatchImage(left, state => states.push(`left:${state}`));
  const cleanupRight = observeWatchImage(right, state => states.push(`right:${state}`));
  assert.deepEqual(states, []);
  left.finish(true);
  right.finish(false);
  right.finish(true);
  assert.deepEqual(states, ["left:loaded", "right:error", "right:loaded"]);
  cleanupLeft(); cleanupRight();
});

test("rapid switching cleans up old listeners so late events cannot affect the next pair", () => {
  const oldImage = new TestImage();
  const nextImage = new TestImage();
  const states = [];
  const removeOld = observeWatchImage(oldImage, state => states.push(`old:${state}`));
  removeOld();
  const removeNext = observeWatchImage(nextImage, state => states.push(`next:${state}`));
  oldImage.finish(false);
  oldImage.finish(true);
  nextImage.finish(true);
  assert.deepEqual(states, ["next:loaded"]);
  removeNext();
});

test("retrying with a fresh image replaces cached failure with cached success", () => {
  const states = [];
  const failedImage = new TestImage();
  failedImage.finish(false);
  observeWatchImage(failedImage, state => states.push(state))();
  const retriedImage = new TestImage();
  retriedImage.finish(true);
  observeWatchImage(retriedImage, state => states.push(state))();
  assert.deepEqual(states, ["error", "loaded"]);
});
