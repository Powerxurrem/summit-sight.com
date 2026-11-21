export type WatchImageState = "loaded" | "error";

// Observe the actual image, including events that finished before hydration.
// Native listeners avoid Next Image's onError-ref source reset on rerenders.
export function observeWatchImage(image: HTMLImageElement, report: (state: WatchImageState) => void) {
  let active = true;
  let previous: WatchImageState | undefined;
  function settle(state: WatchImageState) {
    if (!active || previous === state) return;
    previous = state;
    report(state);
  }
  const loaded = () => settle(image.naturalWidth > 0 ? "loaded" : "error");
  const failed = () => settle("error");
  image.addEventListener("load", loaded);
  image.addEventListener("error", failed);

  if (image.complete) {
    if (image.naturalWidth > 0) loaded();
    else if (image.currentSrc) failed();
  }

  return () => {
    active = false;
    image.removeEventListener("load", loaded);
    image.removeEventListener("error", failed);
  };
}
