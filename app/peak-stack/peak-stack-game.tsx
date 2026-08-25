"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./peak-stack.module.css";

type Block = { x: number; width: number; level: number; color: string };

const COLORS = ["#c45c3f", "#d28a55", "#71816a", "#87958a", "#a66c55"];
const BLOCK_HEIGHT = 30;
const PERFECT_MARGIN = 7;

export default function PeakStackGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const gameRef = useRef({
    blocks: [] as Block[],
    mover: { x: 0, width: 170, level: 1, color: COLORS[0] },
    direction: 1,
    speed: 2.2,
    running: false,
    score: 0,
    combo: 0,
    lastTime: 0,
  });
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [combo, setCombo] = useState(0);
  const [status, setStatus] = useState<"ready" | "playing" | "over">("ready");

  const resetGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.clientWidth;
    gameRef.current = {
      blocks: [{ x: width / 2 - 85, width: 170, level: 0, color: "#39443b" }],
      mover: { x: 20, width: 170, level: 1, color: COLORS[0] },
      direction: 1,
      speed: 2.2,
      running: true,
      score: 0,
      combo: 0,
      lastTime: performance.now(),
    };
    setScore(0);
    setCombo(0);
    setStatus("playing");
  }, []);

  const drop = useCallback(() => {
    const game = gameRef.current;
    if (!game.running) {
      resetGame();
      return;
    }

    const previous = game.blocks[game.blocks.length - 1];
    const mover = game.mover;
    const overlapLeft = Math.max(previous.x, mover.x);
    const overlapRight = Math.min(previous.x + previous.width, mover.x + mover.width);
    const overlap = overlapRight - overlapLeft;

    if (overlap <= 12) {
      game.running = false;
      setStatus("over");
      setBest((current) => {
        const next = Math.max(current, game.score);
        localStorage.setItem("peak-stack-best", String(next));
        return next;
      });
      return;
    }

    const offset = Math.abs(mover.x - previous.x);
    const perfect = offset <= PERFECT_MARGIN;
    const nextWidth = perfect ? previous.width : overlap;
    const nextX = perfect ? previous.x : overlapLeft;
    game.combo = perfect ? game.combo + 1 : 0;
    game.score += 1 + (perfect ? Math.min(game.combo, 5) : 0);
    game.blocks.push({ ...mover, x: nextX, width: nextWidth });

    const canvasWidth = canvasRef.current?.clientWidth ?? 600;
    game.mover = {
      x: game.direction > 0 ? canvasWidth - nextWidth - 18 : 18,
      width: nextWidth,
      level: mover.level + 1,
      color: COLORS[mover.level % COLORS.length],
    };
    game.direction *= -1;
    game.speed = Math.min(5.6, game.speed + 0.12);
    setScore(game.score);
    setCombo(game.combo);
  }, [resetGame]);

  useEffect(() => {
    const restoreBest = window.setTimeout(() => {
      const saved = Number(localStorage.getItem("peak-stack-best") ?? 0);
      setBest(Number.isFinite(saved) ? saved : 0);
    }, 0);
    return () => window.clearTimeout(restoreBest);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
        drop();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drop]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

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
      const delta = Math.min(2, (time - game.lastTime) / 16.67 || 1);
      game.lastTime = time;
      if (game.running) {
        game.mover.x += game.direction * game.speed * delta;
        if (game.mover.x <= 12) {
          game.mover.x = 12;
          game.direction = 1;
        }
        if (game.mover.x + game.mover.width >= width - 12) {
          game.mover.x = width - game.mover.width - 12;
          game.direction = -1;
        }
      }

      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#dce3d3");
      gradient.addColorStop(0.6, "#e9e5d9");
      gradient.addColorStop(1, "#d3cdbd");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      context.fillStyle = "rgba(255, 245, 211, .72)";
      context.beginPath();
      context.arc(width - 72, 72, 35, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = "rgba(73, 88, 72, .13)";
      context.beginPath();
      context.moveTo(0, height * 0.7);
      context.lineTo(width * 0.23, height * 0.43);
      context.lineTo(width * 0.46, height * 0.69);
      context.lineTo(width * 0.7, height * 0.36);
      context.lineTo(width, height * 0.67);
      context.lineTo(width, height);
      context.lineTo(0, height);
      context.fill();

      const cameraLevel = Math.max(0, game.blocks.length - 9);
      const baseY = height - 48 + cameraLevel * BLOCK_HEIGHT;
      const visible = [...game.blocks, ...(game.running ? [game.mover] : [])];
      visible.forEach((block, index) => {
        const y = baseY - (block.level + 1) * BLOCK_HEIGHT;
        if (y > height || y < -BLOCK_HEIGHT) return;
        context.fillStyle = block.color;
        context.beginPath();
        context.roundRect(block.x, y, block.width, BLOCK_HEIGHT - 3, 5);
        context.fill();
        if (index > 0) {
          context.fillStyle = "rgba(255,255,255,.16)";
          context.fillRect(block.x + 5, y + 4, Math.max(0, block.width - 10), 2);
        }
      });

      frameRef.current = requestAnimationFrame(draw);
    };
    frameRef.current = requestAnimationFrame(draw);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <section className={styles.gameShell}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>One tap · one more try</p>
        <h1>Peak Stack</h1>
        <p>Drop each piece onto the last. Tiny misses shrink the mountain. Perfect landings build your streak.</p>
      </div>

      <div className={styles.scoreboard} aria-live="polite">
        <div><span>Score</span><strong>{score}</strong></div>
        <div><span>Best</span><strong>{best}</strong></div>
        <div><span>Streak</span><strong>{combo || "—"}</strong></div>
      </div>

      <button className={styles.canvasWrap} onClick={drop} aria-label={status === "playing" ? "Drop block" : "Start game"}>
        <canvas ref={canvasRef} className={styles.canvas} />
        {status !== "playing" && (
          <span className={styles.overlay}>
            <strong>{status === "over" ? "The peak slipped." : "Build your peak."}</strong>
            <span>{status === "over" ? `Score ${score} · tap to try again` : "Tap to start"}</span>
          </span>
        )}
        {status === "playing" && combo >= 2 && <span className={styles.combo}>Perfect × {combo}</span>}
      </button>

      <p className={styles.hint}>Tap anywhere on the game, or press space. Aim for the centre.</p>
    </section>
  );
}
