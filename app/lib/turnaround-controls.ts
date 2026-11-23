export function wrapFrameIndex(index: number, count: number) {
  return count > 0 ? ((index % count) + count) % count : 0;
}

export function keyboardFrameIndex(key: string, index: number, count: number): number | null {
  if (key === "ArrowRight" || key === "ArrowUp") return wrapFrameIndex(index + 1, count);
  if (key === "ArrowLeft" || key === "ArrowDown") return wrapFrameIndex(index - 1, count);
  if (key === "Home") return 0;
  if (key === "End") return Math.max(0, count - 1);
  return null;
}

export function dragFrameIndex(startIndex: number, distance: number, width: number, count: number) {
  const stepWidth = Math.max(28, width / Math.max(1, count));
  return wrapFrameIndex(startIndex - Math.trunc(distance / stepWidth), count);
}
