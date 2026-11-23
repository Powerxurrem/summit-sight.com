import test from "node:test";
import assert from "node:assert/strict";
import { wrapFrameIndex, keyboardFrameIndex, dragFrameIndex } from "../app/lib/turnaround-controls.ts";

test("rotation wraps at both ends and over repeated revolutions", () => {
  assert.equal(wrapFrameIndex(-1, 8), 7);
  assert.equal(wrapFrameIndex(8, 8), 0);
  assert.equal(wrapFrameIndex(-25, 8), 7);
  assert.equal(wrapFrameIndex(25, 8), 1);
});
test("keyboard selects endpoints and wraps one view per arrow press", () => {
  assert.equal(keyboardFrameIndex("ArrowLeft", 0, 8), 7);
  assert.equal(keyboardFrameIndex("ArrowRight", 7, 8), 0);
  assert.equal(keyboardFrameIndex("ArrowUp", 4, 8), 5);
  assert.equal(keyboardFrameIndex("ArrowDown", 4, 8), 3);
  assert.equal(keyboardFrameIndex("Home", 6, 8), 0);
  assert.equal(keyboardFrameIndex("End", 2, 8), 7);
  assert.equal(keyboardFrameIndex("Tab", 3, 8), null);
});
test("dragging follows direction, ignores small motion and wraps consistently across viewport sizes", () => {
  for (const width of [280, 640, 960]) {
    const step = width / 8;
    assert.equal(dragFrameIndex(0, step, width, 8), 7);
    assert.equal(dragFrameIndex(7, -step, width, 8), 0);
    assert.equal(dragFrameIndex(3, 8, width, 8), 3);
    assert.equal(dragFrameIndex(3, -width * 2, width, 8), 3);
    assert.equal(dragFrameIndex(3, -step * 3, width, 8), 6);
  }
});
test("replacement sequences work without an eight-frame assumption", () => {
  assert.equal(keyboardFrameIndex("ArrowLeft", 0, 5), 4);
  assert.equal(dragFrameIndex(0, -120, 600, 5), 1);
  assert.equal(wrapFrameIndex(-1, 1), 0);
  assert.equal(keyboardFrameIndex("End", 0, 1), 0);
  assert.equal(wrapFrameIndex(1, 0), 0);
});
