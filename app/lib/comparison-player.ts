export type ComparisonStatus = "idle" | "loading" | "playing" | "paused" | "error";

// Both delivered clips start at original Blender index 71 (71/24 seconds).
// Synchronize at interaction/buffering boundaries, never on a playback timer.
export function createComparisonPlayer({ clay, world, claySource, worldSource, onStatus }: {
  clay: HTMLVideoElement;
  world: HTMLVideoElement;
  claySource: string;
  worldSource: string;
  onStatus: (status: ComparisonStatus) => void;
}) {
  const videos = [clay, world];
  let source = worldSource;
  let visible = false;
  let hidden = false;
  let active = false;
  let disposed = false;
  let position = 0;
  let revision = 0;
  let operation: AbortController | undefined;
  let status: ComparisonStatus = "idle";
  const report = (next: ComparisonStatus) => {
    status = next;
    if (!disposed) onStatus(next);
  };
  const allowed = () => active && visible && !hidden && !disposed;
  const pause = () => videos.forEach(video => video.pause());
  const remember = () => {
    if (clay.readyState >= 2) position = Math.min(5, Math.max(0, clay.currentTime));
  };
  const cancel = () => {
    revision++;
    operation?.abort();
    pause();
  };
  const stop = () => {
    remember();
    active = false;
    cancel();
    if (status !== "idle" && status !== "error") report("paused");
  };
  function waitFor(video: HTMLVideoElement, event: string, ready: () => boolean, signal: AbortSignal) {
    return new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        video.removeEventListener(event, check);
        video.removeEventListener("error", failed);
        signal.removeEventListener("abort", aborted);
      };
      const check = () => { if (ready()) { cleanup(); resolve(); } };
      const failed = () => { cleanup(); reject(new Error("Media unavailable")); };
      const aborted = () => { cleanup(); reject(new DOMException("Cancelled", "AbortError")); };
      if (signal.aborted) { aborted(); return; }
      if (video.error) { failed(); return; }
      video.addEventListener(event, check);
      video.addEventListener("error", failed);
      signal.addEventListener("abort", aborted, { once: true });
      check();
    });
  }
  async function prepare(restarting = false) {
    cancel();
    const current = revision;
    operation = new AbortController();
    const { signal } = operation;
    const target = position;
    // Keep the footage and Pause control visible across ordinary loop boundaries.
    if (restarting) status = "loading";
    else report("loading");
    try {
      await Promise.all(videos.map(async (video, index) => {
        const src = index === 0 ? claySource : source;
        // preload=none protects initial page load. Once Play is requested,
        // allow data loading before waiting for readiness and seeking.
        video.preload = "auto";
        if (video.getAttribute("src") !== src || video.error) {
          video.src = src;
          video.load();
        }
        await waitFor(video, "loadeddata", () => video.readyState >= 2, signal);
        if (current !== revision || signal.aborted) return;
        if (Math.abs(video.currentTime - target) > 1 / 48) {
          // Subscribe before seeking: a cached seek can finish immediately.
          const seeked = waitFor(video, "seeked", () => !video.seeking && Math.abs(video.currentTime - target) < 1 / 48, signal);
          video.currentTime = target;
          await seeked;
        }
        if (current !== revision || signal.aborted) return;
        await waitFor(video, "canplay", () => video.readyState >= 3, signal);
      }));
      if (current !== revision || disposed) return;
      if (!allowed()) { report("paused"); return; }
      await Promise.all(videos.map(video => video.play().then(() => {
        // A late resolution must not restart an offscreen or paused player.
        if (!allowed()) video.pause();
      })));
      if (current === revision && allowed()) {
        report("playing");
        if (videos.some(video => video.readyState < 3)) onWaiting();
      }
    } catch {
      if (current !== revision || disposed) return;
      active = false;
      cancel();
      report(videos.some(video => video.error) ? "error" : "paused");
    }
  }
  const onEnded = (event: Event) => {
    if (!allowed() || status !== "playing" || !(event.currentTarget as HTMLVideoElement).ended) return;
    position = 0;
    // Restart the pair together; independent native loops could drift apart.
    void prepare(true);
  };
  const onError = (event: Event) => {
    if (!(event.currentTarget as HTMLVideoElement).error) return;
    active = false;
    cancel();
    report("error");
  };
  const onWaiting = () => {
    if (status !== "playing" || !allowed()) return;
    remember();
    void prepare();
  };
  const onPlay = () => { if (!allowed()) pause(); };
  videos.forEach(video => {
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onError);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("play", onPlay);
  });
  return {
    toggle() {
      if (active || status === "loading") { stop(); return; }
      if (!visible || hidden || disposed) return;
      active = true;
      void prepare();
    },
    select(nextSource: string) {
      if (source === nextSource || disposed) return;
      remember();
      source = nextSource;
      cancel();
      // A poster-only selection never downloads video. Once used, show the
      // new world at the held timeline position, preserving play/pause intent.
      if (visible && clay.getAttribute("src")) void prepare();
    },
    setVisible(next: boolean) { visible = next; if (!next) stop(); },
    setHidden(next: boolean) { hidden = next; if (next) stop(); },
    reduceMotion() { stop(); },
    dispose() {
      disposed = true;
      active = false;
      cancel();
      videos.forEach(video => {
        video.removeEventListener("ended", onEnded);
        video.removeEventListener("error", onError);
        video.removeEventListener("waiting", onWaiting);
        video.removeEventListener("play", onPlay);
        video.removeAttribute("src");
        video.preload = "none";
        video.load();
      });
    },
  };
}
