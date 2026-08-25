"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./driftline.module.css";

type Ring = {
  z: number;
  gap: number;
  gapSize: number;
  checked: boolean;
  hue: number;
};

const TAU = Math.PI * 2;

function angleDistance(a: number, b: number) {
  return Math.abs(((a - b + Math.PI) % TAU + TAU) % TAU - Math.PI);
}

export default function DriftlineGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const inputRef = useRef(0);
  const gameRef = useRef({
    running: false,
    ballAngle: Math.PI / 2,
    velocity: 0,
    rotation: 0,
    distance: 0,
    speed: 0.025,
    score: 0,
    streak: 0,
    lastTime: 0,
    lastGap: Math.PI / 2,
    rings: [] as Ring[],
  });
  const [status, setStatus] = useState<"ready" | "playing" | "over">("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [streak, setStreak] = useState(0);

  const makeRing = useCallback((z: number, difficulty: number): Ring => {
    const game = gameRef.current;
    const maxTurn = difficulty < 2 ? 0 : Math.min(0.82, 0.24 + difficulty * 0.035);
    const change = (Math.random() * 2 - 1) * maxTurn;
    game.lastGap = (game.lastGap + change + TAU) % TAU;
    return {
      z,
      gap: game.lastGap,
      gapSize: Math.max(0.88, 1.52 - difficulty * 0.018),
      checked: false,
      hue: 16 + Math.random() * 20,
    };
  }, []);

  const startGame = useCallback(() => {
    const initial = {
      running: true,
      ballAngle: Math.PI / 2,
      velocity: 0,
      rotation: 0,
      distance: 0,
      speed: 0.025,
      score: 0,
      streak: 0,
      lastTime: performance.now(),
      lastGap: Math.PI / 2,
      rings: [] as Ring[],
    };
    gameRef.current = initial;
    for (let i = 0; i < 9; i += 1) {
      initial.rings.push(makeRing(2.8 + i * 1.65, i));
    }
    setScore(0);
    setStreak(0);
    setStatus("playing");
  }, [makeRing]);

  const setInput = useCallback((value: number) => {
    if (!gameRef.current.running) startGame();
    inputRef.current = value;
  }, [startGame]);

  useEffect(() => {
    const restoreBest = window.setTimeout(() => {
      const saved = Number(localStorage.getItem("driftline-best") ?? 0);
      setBest(Number.isFinite(saved) ? saved : 0);
    }, 0);
    return () => window.clearTimeout(restoreBest);
  }, []);

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (["ArrowLeft", "KeyA", "ArrowRight", "KeyD", "Space"].includes(event.code)) {
        event.preventDefault();
      }
      if (event.code === "ArrowLeft" || event.code === "KeyA") setInput(-1);
      if (event.code === "ArrowRight" || event.code === "KeyD") setInput(1);
      if (event.code === "Space" && !gameRef.current.running) startGame();
    };
    const keyUp = (event: KeyboardEvent) => {
      if ((event.code === "ArrowLeft" || event.code === "KeyA") && inputRef.current < 0) inputRef.current = 0;
      if ((event.code === "ArrowRight" || event.code === "KeyD") && inputRef.current > 0) inputRef.current = 0;
    };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [setInput, startGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const draw = (time: number) => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
        canvas.width = width * ratio;
        canvas.height = height * ratio;
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const game = gameRef.current;
      const delta = Math.min(2.2, (time - game.lastTime) / 16.67 || 1);
      game.lastTime = time;
      if (game.running) {
        game.velocity += inputRef.current * 0.0046 * delta;
        game.velocity *= Math.pow(0.91, delta);
        game.velocity = Math.max(-0.065, Math.min(0.065, game.velocity));
        game.ballAngle = (game.ballAngle + game.velocity * delta + TAU) % TAU;
        game.rotation += (0.006 + game.score * 0.00005) * delta;
        game.distance += game.speed * delta;
        game.speed = Math.min(0.052, 0.025 + game.score * 0.00065);

        for (const ring of game.rings) {
          ring.z -= game.speed * delta;
          // This depth projects onto the same orbit as the player ball.
          // Checking here keeps visual contact and collision in agreement.
          if (!ring.checked && ring.z <= 2.08) {
            ring.checked = true;
            const ballClearance = 0.07;
            if (angleDistance(game.ballAngle, ring.gap + game.rotation) > ring.gapSize / 2 - ballClearance) {
              game.running = false;
              inputRef.current = 0;
              setStatus("over");
              setBest((current) => {
                const next = Math.max(current, game.score);
                localStorage.setItem("driftline-best", String(next));
                return next;
              });
            } else {
              game.score += 1;
              game.streak += 1;
              setScore(game.score);
              setStreak(game.streak);
            }
          }
        }

        game.rings = game.rings.filter((ring) => ring.z > 0.18);
        while (game.rings.length < 9) {
          const farthest = game.rings.at(-1)?.z ?? 2.5;
          game.rings.push(makeRing(farthest + 1.65, game.score));
        }
      }

      const cx = width / 2;
      const cy = height * 0.49;
      const maxRadius = Math.min(width, height) * 0.48;
      const background = context.createRadialGradient(cx, cy, 0, cx, cy, maxRadius * 1.5);
      background.addColorStop(0, "#182521");
      background.addColorStop(0.58, "#0d1715");
      background.addColorStop(1, "#070d0c");
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);

      context.save();
      context.translate(cx, cy);
      const tunnelRotation = game.rotation;
      for (let spoke = 0; spoke < 16; spoke += 1) {
        const angle = spoke / 16 * TAU + tunnelRotation;
        context.strokeStyle = `rgba(169, 190, 166, ${0.045 + (spoke % 2) * 0.025})`;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(Math.cos(angle) * 14, Math.sin(angle) * 14);
        context.lineTo(Math.cos(angle) * maxRadius * 1.35, Math.sin(angle) * maxRadius * 1.35);
        context.stroke();
      }

      const sortedRings = [...game.rings].sort((a, b) => b.z - a.z);
      for (const ring of sortedRings) {
        const depth = Math.max(0, Math.min(1, 1 - ring.z / 16));
        const radius = 18 + Math.pow(depth, 1.75) * maxRadius;
        const alpha = 0.12 + depth * 0.88;
        const lineWidth = 2 + depth * 24;
        const gap = ring.gap + tunnelRotation;
        context.strokeStyle = `hsla(${ring.hue}, 58%, 58%, ${alpha})`;
        context.lineWidth = lineWidth;
        context.lineCap = "butt";
        context.beginPath();
        context.arc(0, 0, radius, gap + ring.gapSize / 2, gap - ring.gapSize / 2 + TAU);
        context.stroke();
        context.strokeStyle = `rgba(238, 223, 188, ${alpha * 0.32})`;
        context.lineWidth = Math.max(1, lineWidth * 0.08);
        context.beginPath();
        context.arc(0, 0, radius - lineWidth / 2, gap + ring.gapSize / 2, gap - ring.gapSize / 2 + TAU);
        context.stroke();
      }

      const playerRadius = maxRadius * 0.79;
      const ballX = Math.cos(game.ballAngle) * playerRadius;
      const ballY = Math.sin(game.ballAngle) * playerRadius;
      context.shadowColor = "rgba(255, 218, 137, .7)";
      context.shadowBlur = 18;
      const ballGradient = context.createRadialGradient(ballX - 5, ballY - 6, 2, ballX, ballY, 16);
      ballGradient.addColorStop(0, "#fff2c8");
      ballGradient.addColorStop(0.5, "#e8bc69");
      ballGradient.addColorStop(1, "#a65a38");
      context.fillStyle = ballGradient;
      context.beginPath();
      context.arc(ballX, ballY, 13, 0, TAU);
      context.fill();
      context.restore();

      frameRef.current = requestAnimationFrame(draw);
    };
    frameRef.current = requestAnimationFrame(draw);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [makeRing]);

  return (
    <section className={styles.gameShell}>
      <div className={styles.titleRow}>
        <div>
          <p className={styles.eyebrow}>Roll the line · find the gap</p>
          <h1>Driftline</h1>
        </div>
        <p>Hold left or right. The tunnel keeps moving, whether you are ready or not.</p>
      </div>

      <div className={styles.scoreboard} aria-live="polite">
        <div><span>Cleared</span><strong>{score}</strong></div>
        <div><span>Best</span><strong>{best}</strong></div>
        <div><span>Flow</span><strong>{streak || "—"}</strong></div>
      </div>

      <div className={styles.gameFrame}>
        <canvas ref={canvasRef} className={styles.canvas} />
        {status !== "playing" && (
          <button className={styles.overlay} onClick={startGame}>
            <strong>{status === "over" ? "Lost the line." : "Enter the tunnel."}</strong>
            <span>{status === "over" ? `Cleared ${score} · try again` : "Tap to begin"}</span>
          </button>
        )}
        <div className={styles.controls}>
          <button
            aria-label="Roll left"
            onPointerDown={() => setInput(-1)}
            onPointerUp={() => { inputRef.current = 0; }}
            onPointerCancel={() => { inputRef.current = 0; }}
            onPointerLeave={() => { inputRef.current = 0; }}
          >
            ← <span>Left</span>
          </button>
          <button
            aria-label="Roll right"
            onPointerDown={() => setInput(1)}
            onPointerUp={() => { inputRef.current = 0; }}
            onPointerCancel={() => { inputRef.current = 0; }}
            onPointerLeave={() => { inputRef.current = 0; }}
          >
            <span>Right</span> →
          </button>
        </div>
      </div>
      <p className={styles.hint}>Hold A / D or the arrow keys. Gaps rotate with the tunnel.</p>
    </section>
  );
}
