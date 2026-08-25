"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./driftline.module.css";

type Family = "orbit" | "square" | "twin" | "echo" | "gravity" | "corner";
type Ring = { z: number; gap: number; gap2: number; gapX: number; gapY: number; gapSize: number; safeLane: number; platform: boolean; checked: boolean; color: string };
type Snapshot = { ballAngle: number; echoAngle: number; x: number; y: number; rotation: number; rings: Ring[]; score: number; shields: number; reversed: boolean; echoDelay: number; gravityActive: boolean; gravityX: number; gravityY: number; wanderX: number; wanderY: number; repulsed: boolean; lane: number; cameraRotation: number; jump: number; blinkCooldown: number };
type Panel = "levels" | "upgrades" | "achievements" | null;
type UpgradeKey = "handling" | "focus" | "salvage" | "calm" | "shield" | "core";
type Progress = {
  shards: number;
  totalClears: number;
  twinClears: number;
  reverseClears: number;
  echoClears: number;
  gravityClears: number;
  cornerClears: number;
  runs: number;
  upgrades: Record<UpgradeKey, number>;
  awards: string[];
};

const TAU = Math.PI * 2;
const PROGRESS_KEY = "driftline-progress-v1";
const BEST_KEY = "driftline-best";
const LEVEL_KEY = "driftline-level";
const DEFAULT_PROGRESS: Progress = { shards: 0, totalClears: 0, twinClears: 0, reverseClears: 0, echoClears: 0, gravityClears: 0, cornerClears: 0, runs: 0, upgrades: { handling: 0, focus: 0, salvage: 0, calm: 0, shield: 0, core: 0 }, awards: [] };

const LEVELS = [
  { id: "moss", family: "orbit" as Family, name: "Moss Orbit", unlock: 0, pace: "CALM", gaps: "WIDE", spin: "LOW", startSpeed: 0.021, cap: 0.045, gap: 1.65, minGap: 1.05, turn: 0.62, rotation: 0.0045, colors: ["#769078", "#bd8b5f"] },
  { id: "ember", family: "orbit" as Family, name: "Ember Coil", unlock: 10, pace: "QUICK", gaps: "TIGHT", spin: "MID", startSpeed: 0.025, cap: 0.052, gap: 1.47, minGap: 0.92, turn: 0.78, rotation: 0.006, colors: ["#d08a56", "#b85e45"] },
  { id: "night", family: "orbit" as Family, name: "Night Current", unlock: 25, pace: "FAST", gaps: "NARROW", spin: "HIGH", startSpeed: 0.029, cap: 0.058, gap: 1.35, minGap: 0.82, turn: 0.92, rotation: 0.008, colors: ["#7770a0", "#4f7181"] },
  { id: "frame", family: "square" as Family, name: "Quiet Frame", unlock: 0, pace: "CALM", gaps: "LARGE", spin: "LOW", startSpeed: 0.019, cap: 0.042, gap: 0.72, minGap: 0.55, turn: 0.45, rotation: 0.003, colors: ["#5b8290", "#8ea16a"] },
  { id: "parallax", family: "square" as Family, name: "Parallax Hall", unlock: 15, pace: "QUICK", gaps: "MID", spin: "MID", startSpeed: 0.023, cap: 0.049, gap: 0.63, minGap: 0.47, turn: 0.58, rotation: 0.005, colors: ["#9d6c82", "#597b91"] },
  { id: "corner", family: "square" as Family, name: "Hard Corner", unlock: 30, pace: "FAST", gaps: "SMALL", spin: "HIGH", startSpeed: 0.027, cap: 0.055, gap: 0.56, minGap: 0.4, turn: 0.7, rotation: 0.007, colors: ["#c57a55", "#6c668e"] },
  { id: "mirror", family: "twin" as Family, name: "Soft Mirror", unlock: 0, pace: "CALM", gaps: "PAIRED", spin: "LOW", startSpeed: 0.02, cap: 0.044, gap: 1.48, minGap: 1.05, turn: 0.56, rotation: 0.0035, asym: 0, reverseEvery: 8, colors: ["#578b84", "#a96f86"] },
  { id: "broken", family: "twin" as Family, name: "Broken Symmetry", unlock: 12, pace: "QUICK", gaps: "OFFSET", spin: "MID", startSpeed: 0.024, cap: 0.05, gap: 1.38, minGap: 0.96, turn: 0.7, rotation: 0.0055, asym: 0.26, reverseEvery: 6, colors: ["#5c7fa1", "#bb765b"] },
  { id: "crossed", family: "twin" as Family, name: "Crossed Wires", unlock: 28, pace: "FAST", gaps: "BROKEN", spin: "HIGH", startSpeed: 0.028, cap: 0.056, gap: 1.3, minGap: 0.9, turn: 0.84, rotation: 0.008, asym: 0.4, reverseEvery: 4, colors: ["#866aa0", "#bd695e"] },
  { id: "soft-delay", family: "echo" as Family, name: "Soft Delay", unlock: 0, pace: "CALM", gaps: "MEMORY", spin: "LOW", startSpeed: 0.019, cap: 0.042, gap: 1.58, minGap: 1.08, turn: 0.52, rotation: 0.003, echoDelay: 1450, delayDecay: 0, colors: ["#6d8f91", "#b1846f"] },
  { id: "memory-leak", family: "echo" as Family, name: "Memory Leak", unlock: 15, pace: "QUICK", gaps: "SHIFTING", spin: "MID", startSpeed: 0.023, cap: 0.049, gap: 1.48, minGap: 0.98, turn: 0.68, rotation: 0.005, echoDelay: 1550, delayDecay: 28, colors: ["#6f79a0", "#a76c73"] },
  { id: "false-memory", family: "echo" as Family, name: "False Memory", unlock: 30, pace: "FAST", gaps: "FADING", spin: "HIGH", startSpeed: 0.027, cap: 0.055, gap: 1.38, minGap: 0.9, turn: 0.82, rotation: 0.0075, echoDelay: 1250, delayDecay: 36, colors: ["#8d679a", "#bb7958"] },
  { id: "gentle-pull", family: "gravity" as Family, name: "Gentle Pull", unlock: 0, pace: "CALM", gaps: "LARGE", spin: "LOW", startSpeed: 0.018, cap: 0.04, gap: 0.76, minGap: 0.57, turn: 0.42, rotation: 0.0025, pull: 0.00145, wander: 0, repulseEvery: 0, colors: ["#628c78", "#9a8360"] },
  { id: "double-well", family: "gravity" as Family, name: "Double Well", unlock: 18, pace: "QUICK", gaps: "MID", spin: "MID", startSpeed: 0.022, cap: 0.047, gap: 0.67, minGap: 0.49, turn: 0.56, rotation: 0.0045, pull: 0.00155, wander: 0.00042, repulseEvery: 0, colors: ["#507f91", "#9e6882"] },
  { id: "event-horizon", family: "gravity" as Family, name: "Event Horizon", unlock: 35, pace: "FAST", gaps: "SMALL", spin: "HIGH", startSpeed: 0.026, cap: 0.053, gap: 0.59, minGap: 0.42, turn: 0.68, rotation: 0.0065, pull: 0.0017, wander: 0.00052, repulseEvery: 6, colors: ["#7b649c", "#c26e53"] },
  { id: "first-corner", family: "corner" as Family, name: "First Corner", unlock: 0, pace: "CALM", gaps: "ONE TURN", spin: "QUARTER", startSpeed: 0.018, cap: 0.039, gap: 1, minGap: 1, turn: 0, rotation: 0, laneShift: 1, jumpChance: 0.28, colors: ["#688b7a", "#ad805f"] },
  { id: "wallrunner", family: "corner" as Family, name: "Wallrunner", unlock: 20, pace: "QUICK", gaps: "TWO TURNS", spin: "QUARTER", startSpeed: 0.022, cap: 0.047, gap: 1, minGap: 1, turn: 0, rotation: 0, laneShift: 2, jumpChance: 0.34, colors: ["#5f7898", "#a7667c"] },
  { id: "blink-tower", family: "corner" as Family, name: "Blink Tower", unlock: 40, pace: "FAST", gaps: "ANY WALL", spin: "QUARTER", startSpeed: 0.026, cap: 0.053, gap: 1, minGap: 1, turn: 0, rotation: 0, laneShift: 2, jumpChance: 0.24, colors: ["#8668a0", "#c16c52"] },
] as const;

const LEVEL_GROUPS = [
  { id: "orbit" as Family, name: "Orbit Set", icon: "○", copy: "Roll around the rim. Left and right only." },
  { id: "square" as Family, name: "Squareflight Set", icon: "□", copy: "Fly freely while the tunnel turns around you." },
  { id: "twin" as Family, name: "Twinline Set", icon: "◎", copy: "Two mirrored runners. Either collision ends the line." },
  { id: "echo" as Family, name: "Echoline Set", icon: "◌", copy: "Steer now. Survive what your ghost remembers later." },
  { id: "gravity" as Family, name: "Gravityline Set", icon: "●", copy: "Place a well. Bend momentum. Bank the impossible shot." },
  { id: "corner" as Family, name: "Cornerhop Set", icon: "⌑", copy: "Turn the corner. Jump or blink across." },
];

const UPGRADES: { key: UpgradeKey; name: string; copy: string; costs: number[] }[] = [
  { key: "handling", name: "Soft Bearings", copy: "Settles momentum sooner after you release.", costs: [8, 20, 42] },
  { key: "focus", name: "Gap Sense", copy: "Makes every opening slightly more forgiving.", costs: [10, 24, 48] },
  { key: "salvage", name: "Shard Magnet", copy: "Find a bonus shard every 6, 5, then 4 gates.", costs: [18, 42, 78] },
  { key: "calm", name: "Gentle Launch", copy: "Keeps the opening gates slower for longer.", costs: [12, 28, 55] },
  { key: "shield", name: "Patch Kit", copy: "Survive one collision per run; higher ranks recharge sooner.", costs: [30, 68, 125] },
  { key: "core", name: "Gravity Core", copy: "Strengthens your gravity well without killing momentum.", costs: [14, 32, 62] },
];

const ACHIEVEMENTS = [
  { id: "first", name: "Found the Line", copy: "Clear your first gate.", reward: 5, test: (p: Progress) => p.totalClears >= 1 },
  { id: "ten", name: "Thread the Needle", copy: "Clear 10 gates in one run.", reward: 10, test: (_p: Progress, best: number) => best >= 10 },
  { id: "regular", name: "One More Run", copy: "Begin 10 runs.", reward: 10, test: (p: Progress) => p.runs >= 10 },
  { id: "fifty", name: "Tunnel Native", copy: "Clear 50 gates in total.", reward: 20, test: (p: Progress) => p.totalClears >= 50 },
  { id: "twinline", name: "Perfectly Opposed", copy: "Clear 10 gates in Twinline.", reward: 14, test: (p: Progress) => p.twinClears >= 10 },
  { id: "backwards", name: "Wrong Way Forward", copy: "Clear 8 gates while controls are reversed.", reward: 16, test: (p: Progress) => p.reverseClears >= 8 },
  { id: "echo", name: "Past Tense", copy: "Clear 10 gates with your delayed echo.", reward: 16, test: (p: Progress) => p.echoClears >= 10 },
  { id: "gravity", name: "Bank Shot", copy: "Clear 10 gates in Gravityline.", reward: 16, test: (p: Progress) => p.gravityClears >= 10 },
  { id: "corner", name: "Wall Logic", copy: "Clear 10 gates in Cornerhop.", reward: 18, test: (p: Progress) => p.cornerClears >= 10 },
];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const angleDistance = (a: number, b: number) => Math.abs(((a - b + Math.PI) % TAU + TAU) % TAU - Math.PI);
const point = (cx: number, cy: number, radius: number, angle: number) => ({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
const arc = (cx: number, cy: number, radius: number, start: number, end: number) => {
  const from = point(cx, cy, radius, start);
  const to = point(cx, cy, radius, end);
  return `M ${from.x} ${from.y} A ${radius} ${radius} 0 ${end - start > Math.PI ? 1 : 0} 1 ${to.x} ${to.y}`;
};

const emptySnapshot: Snapshot = { ballAngle: Math.PI / 2, echoAngle: Math.PI / 2, x: 0, y: 0, rotation: 0, rings: [], score: 0, shields: 0, reversed: false, echoDelay: 1450, gravityActive: false, gravityX: 0, gravityY: 0, wanderX: 0, wanderY: 0, repulsed: false, lane: 0, cameraRotation: 0, jump: 0, blinkCooldown: 0 };

export default function DriftlineGame() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const gameWidth = size.width;
  const gameHeight = size.height;

  const inputX = useRef(0);
  const inputY = useRef(0);
  const keysDown = useRef(new Set<string>());
  const gravityTarget = useRef({ active: false, x: 0, y: 0 });
  const touching = useRef(false);
  const drag = useRef({ active: false, pointerId: -1, startX: 0, startY: 0 });
  const frame = useRef<number | null>(null);
  const last = useRef(0);
  const lastGap = useRef(Math.PI / 2);
  const lastSquareGap = useRef({ x: 0, y: 0 });
  const lastSafeLane = useRef(0);
  const echoGapMemory = useRef<number[]>([]);
  const angleHistory = useRef<{ at: number; angle: number }[]>([]);
  const progressRef = useRef(DEFAULT_PROGRESS);
  const bestRef = useRef(0);
  const game = useRef({ ballAngle: Math.PI / 2, echoAngle: Math.PI / 2, velocity: 0, x: 0, y: 0, vx: 0, vy: 0, rotation: 0, speed: 0.025, score: 0, shields: 0, reversed: false, reverseUntil: 0, echoDelay: 1450, gravityActive: false, gravityX: 0, gravityY: 0, wanderX: 0, wanderY: 0, repulsed: false, repulseUntil: 0, lane: 0, cameraRotation: 0, cameraTarget: 0, jump: 0, jumpUntil: 0, blinkCooldown: 0, rings: [] as Ring[], running: false });
  const [view, setView] = useState<Snapshot>(emptySnapshot);
  const [best, setBest] = useState(0);
  const [status, setStatus] = useState<"ready" | "playing" | "paused" | "over">("ready");
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);
  const [levelId, setLevelId] = useState("moss");
  const [panel, setPanel] = useState<Panel>(null);
  const [openGroup, setOpenGroup] = useState<Family | null>("orbit");
  const level = LEVELS.find((item) => item.id === levelId) ?? LEVELS[0];

  const commitProgress = useCallback((next: Progress) => {
    progressRef.current = next;
    setProgress(next);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  }, []);

  const grantAchievements = useCallback((candidate: Progress, runBest: number) => {
    const newAwards = ACHIEVEMENTS.filter((achievement) => !candidate.awards.includes(achievement.id) && achievement.test(candidate, runBest));
    if (!newAwards.length) return candidate;
    return {
      ...candidate,
      shards: candidate.shards + newAwards.reduce((sum, achievement) => sum + achievement.reward, 0),
      awards: [...candidate.awards, ...newAwards.map((achievement) => achievement.id)],
    };
  }, []);

  const makeRing = useCallback((z: number, difficulty: number): Ring => {
    const focus = progressRef.current.upgrades.focus;
    const maxTurn = difficulty < 2 ? 0 : Math.min(level.turn, 0.18 + difficulty * 0.032);
    if (level.family === "orbit" || level.family === "twin" || level.family === "echo") {
      lastGap.current = (lastGap.current + (Math.random() * 2 - 1) * maxTurn + TAU) % TAU;
    } else if (difficulty >= 2) {
      lastSquareGap.current = {
        x: clamp(lastSquareGap.current.x + (Math.random() * 2 - 1) * maxTurn, -0.42, 0.42),
        y: clamp(lastSquareGap.current.y + (Math.random() * 2 - 1) * maxTurn, -0.42, 0.42),
      };
    }
    let secondGap = lastGap.current + Math.PI + (difficulty < 2 ? 0 : (Math.random() * 2 - 1) * ("asym" in level ? level.asym : 0));
    if (level.family === "echo") {
      secondGap = echoGapMemory.current.at(-1) ?? lastGap.current;
      echoGapMemory.current.push(lastGap.current);
    }
    if (level.family === "corner" && difficulty >= 2) {
      const maxShift = "laneShift" in level ? level.laneShift : 1;
      const distance = 1 + Math.floor(Math.random() * maxShift);
      const direction = Math.random() < 0.5 ? -1 : 1;
      lastSafeLane.current = (lastSafeLane.current + distance * direction + 4) % 4;
    }
    return {
      z,
      gap: lastGap.current,
      gap2: secondGap,
      gapX: lastSquareGap.current.x,
      gapY: lastSquareGap.current.y,
      gapSize: Math.max(level.minGap, level.gap - difficulty * 0.014) + focus * (level.family === "square" || level.family === "gravity" ? 0.025 : 0.055),
      safeLane: lastSafeLane.current,
      platform: level.family === "corner" && difficulty >= 3 && Math.random() < ("jumpChance" in level ? level.jumpChance : 0),
      checked: false,
      color: level.colors[difficulty % 2],
    };
  }, [level]);

  const start = useCallback(() => {
    lastGap.current = Math.PI / 2;
    lastSquareGap.current = { x: 0, y: 0 };
    lastSafeLane.current = 0;
    echoGapMemory.current = [Math.PI / 2];
    angleHistory.current = [{ at: Date.now() - 4000, angle: Math.PI / 2 }];
    gravityTarget.current = { active: false, x: 0, y: 0 };
    const initialEchoDelay = "echoDelay" in level ? level.echoDelay : 1450;
    const next = { ballAngle: Math.PI / 2, echoAngle: Math.PI / 2, velocity: 0, x: 0, y: 0, vx: 0, vy: 0, rotation: 0, speed: level.startSpeed, score: 0, shields: progressRef.current.upgrades.shield > 0 ? 1 : 0, reversed: false, reverseUntil: 0, echoDelay: initialEchoDelay, gravityActive: false, gravityX: 0, gravityY: 0, wanderX: 0, wanderY: 0, repulsed: false, repulseUntil: 0, lane: 0, cameraRotation: 0, cameraTarget: 0, jump: 0, jumpUntil: 0, blinkCooldown: 0, rings: [] as Ring[], running: true };
    game.current = next;
    for (let index = 0; index < 9; index += 1) next.rings.push(makeRing(2.8 + index * 1.65, index));
    commitProgress({ ...progressRef.current, runs: progressRef.current.runs + 1 });
    last.current = Date.now();
    setStatus("playing");
    setView({ ballAngle: next.ballAngle, echoAngle: next.echoAngle, x: 0, y: 0, rotation: next.rotation, rings: [...next.rings], score: 0, shields: next.shields, reversed: false, echoDelay: next.echoDelay, gravityActive: false, gravityX: 0, gravityY: 0, wanderX: 0, wanderY: 0, repulsed: false, lane: 0, cameraRotation: 0, jump: 0, blinkCooldown: 0 });
  }, [commitProgress, level, makeRing]);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const savedBest = Number(localStorage.getItem(BEST_KEY) ?? 0);
      bestRef.current = savedBest;
      setBest(savedBest);
      const savedProgress = localStorage.getItem(PROGRESS_KEY);
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress) as Partial<Progress>;
          const merged: Progress = { ...DEFAULT_PROGRESS, ...parsed, upgrades: { ...DEFAULT_PROGRESS.upgrades, ...parsed.upgrades } };
          commitProgress(grantAchievements(merged, savedBest));
        } catch {
          /* Start fresh if old progress is malformed. */
        }
      }
      const savedLevel = localStorage.getItem(LEVEL_KEY);
      const savedCourse = LEVELS.find((item) => item.id === savedLevel);
      if (savedCourse) {
        setLevelId(savedCourse.id);
        setOpenGroup(savedCourse.family);
      }
    }, 0);
    return () => window.clearTimeout(restore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setSize({ width: Math.round(entry.contentRect.width), height: Math.round(entry.contentRect.height) });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const releaseControl = useCallback(() => {
    touching.current = false;
    inputX.current = 0;
    inputY.current = 0;
  }, []);

  const control = useCallback((x: number, y = 0) => {
    if (!game.current.running) start();
    touching.current = true;
    inputX.current = x;
    inputY.current = y;
  }, [start]);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const delta = Math.min(2.2, (now - last.current) / 16.67 || 1);
      last.current = now;
      const current = game.current;
      if (current.running) {
        const handling = progressRef.current.upgrades.handling;
        if (level.family === "orbit" || level.family === "twin" || level.family === "echo") {
          const steering = level.family === "twin" && current.reversed ? -inputX.current : inputX.current;
          current.velocity += steering * 0.0046 * delta;
          current.velocity *= Math.pow(0.91 - handling * 0.012, delta);
          current.velocity = clamp(current.velocity, -0.065, 0.065);
          current.ballAngle = (current.ballAngle + current.velocity * delta + TAU) % TAU;
        } else if (level.family === "square") {
          current.vx += inputX.current * 0.0035 * delta;
          current.vy += inputY.current * 0.0035 * delta;
          const damping = Math.pow(0.9 - handling * 0.01, delta);
          current.vx *= damping;
          current.vy *= damping;
          current.vx = clamp(current.vx, -0.045, 0.045);
          current.vy = clamp(current.vy, -0.045, 0.045);
          current.x = clamp(current.x + current.vx * delta, -0.86, 0.86);
          current.y = clamp(current.y + current.vy * delta, -0.86, 0.86);
          if (Math.abs(current.x) >= 0.86) current.vx = 0;
          if (Math.abs(current.y) >= 0.86) current.vy = 0;
        } else if (level.family === "gravity") {
          current.gravityActive = gravityTarget.current.active;
          current.gravityX = gravityTarget.current.x;
          current.gravityY = gravityTarget.current.y;
          const core = progressRef.current.upgrades.core;
          const pull = ("pull" in level ? level.pull : 0.00145) * (1 + core * 0.16);
          if (current.gravityActive) {
            const direction = current.repulsed ? -1 : 1;
            current.vx += (current.gravityX - current.x) * pull * direction * delta;
            current.vy += (current.gravityY - current.y) * pull * direction * delta;
          }
          const wander = "wander" in level ? level.wander : 0;
          if (wander > 0) {
            current.wanderX = Math.sin(now / 1150) * 0.72;
            current.wanderY = Math.cos(now / 870) * 0.62;
            current.vx += (current.wanderX - current.x) * wander * delta;
            current.vy += (current.wanderY - current.y) * wander * delta;
          }
          const gravityDamping = Math.pow(0.994 - handling * 0.0015, delta);
          current.vx = clamp(current.vx * gravityDamping, -0.052, 0.052);
          current.vy = clamp(current.vy * gravityDamping, -0.052, 0.052);
          current.x += current.vx * delta;
          current.y += current.vy * delta;
          if (Math.abs(current.x) > 0.9) {
            current.x = Math.sign(current.x) * 0.9;
            current.vx *= -0.62;
          }
          if (Math.abs(current.y) > 0.9) {
            current.y = Math.sign(current.y) * 0.9;
            current.vy *= -0.62;
          }
        } else if (level.family === "corner") {
          current.cameraRotation += (current.cameraTarget - current.cameraRotation) * Math.min(1, 0.16 * delta);
          current.jump = clamp((current.jumpUntil - now) / 650, 0, 1);
        }
        if (level.family === "echo") {
          const baseDelay = "echoDelay" in level ? level.echoDelay : 1450;
          const decay = "delayDecay" in level ? level.delayDecay : 0;
          current.echoDelay = decay === 0
            ? Math.max(620, Math.min(baseDelay, 1.65 / current.speed * 16.67))
            : Math.max(620, baseDelay - current.score * decay);
          angleHistory.current.push({ at: now, angle: current.ballAngle });
          const targetTime = now - current.echoDelay;
          for (let index = angleHistory.current.length - 1; index >= 0; index -= 1) {
            if (angleHistory.current[index].at <= targetTime) {
              current.echoAngle = angleHistory.current[index].angle;
              break;
            }
          }
          angleHistory.current = angleHistory.current.filter((sample) => sample.at >= now - 4200);
        }
        current.rotation += level.rotation * delta;
        const rampScore = Math.max(0, current.score - progressRef.current.upgrades.calm * 3);
        current.speed = Math.min(level.cap, level.startSpeed + rampScore * 0.00065);
        for (const ring of current.rings) {
          ring.z -= current.speed * delta;
          if (!ring.checked && ring.z <= 2.08) {
            ring.checked = true;
            const cos = Math.cos(current.rotation);
            const sin = Math.sin(current.rotation);
            const localX = current.x * cos + current.y * sin;
            const localY = -current.x * sin + current.y * cos;
            const halfGap = ring.gapSize / 2 - 0.07;
            const firstBall = current.ballAngle;
            const secondBall = current.ballAngle + Math.PI;
            const firstGap = ring.gap + current.rotation;
            const secondGap = ring.gap2 + current.rotation;
            const twinFits = (angleDistance(firstBall, firstGap) <= halfGap && angleDistance(secondBall, secondGap) <= halfGap)
              || (angleDistance(firstBall, secondGap) <= halfGap && angleDistance(secondBall, firstGap) <= halfGap);
            const echoFits = angleDistance(firstBall, firstGap) <= halfGap && angleDistance(current.echoAngle, secondGap) <= halfGap;
            const missed = level.family === "corner"
              ? current.lane !== ring.safeLane && current.jump <= 0
              : level.family === "orbit"
              ? angleDistance(firstBall, firstGap) > halfGap
              : level.family === "twin"
                ? !twinFits
                : level.family === "echo"
                  ? !echoFits
                : Math.abs(localX - ring.gapX) > ring.gapSize / 2 || Math.abs(localY - ring.gapY) > ring.gapSize / 2;
            if (missed) {
              if (current.shields > 0) {
                current.shields -= 1;
              } else {
                current.running = false;
                inputX.current = 0;
                inputY.current = 0;
                setStatus("over");
                setBest((prev) => {
                  const next = Math.max(prev, current.score);
                  bestRef.current = next;
                  localStorage.setItem(BEST_KEY, String(next));
                  return next;
                });
              }
            } else {
              const clearedReversed = current.reversed;
              current.score += 1;
              if (level.family === "corner" && current.blinkCooldown > 0) current.blinkCooldown -= 1;
              const reverseEvery = "reverseEvery" in level ? level.reverseEvery : 0;
              if (current.reversed && current.score >= current.reverseUntil) {
                current.reversed = false;
              } else if (level.family === "twin" && reverseEvery > 0 && current.score % reverseEvery === 0) {
                current.reversed = true;
                current.reverseUntil = current.score + 3;
              }
              const repulseEvery = "repulseEvery" in level ? level.repulseEvery : 0;
              if (current.repulsed && current.score >= current.repulseUntil) {
                current.repulsed = false;
              } else if (level.family === "gravity" && repulseEvery > 0 && current.score % repulseEvery === 0) {
                current.repulsed = true;
                current.repulseUntil = current.score + 2;
              }
              const shieldRank = progressRef.current.upgrades.shield;
              const rechargeEvery = shieldRank === 3 ? 10 : shieldRank === 2 ? 15 : Infinity;
              if (current.score % rechargeEvery === 0) current.shields = 1;
              if (current.score > bestRef.current) {
                bestRef.current = current.score;
                setBest(current.score);
                localStorage.setItem(BEST_KEY, String(current.score));
              }
              const old = progressRef.current;
              const magnetInterval = old.upgrades.salvage > 0 ? 7 - old.upgrades.salvage : Infinity;
              const earned = 1 + (current.score % magnetInterval === 0 ? 1 : 0);
              const candidate: Progress = {
                ...old,
                shards: old.shards + earned,
                totalClears: old.totalClears + 1,
                twinClears: old.twinClears + (level.family === "twin" ? 1 : 0),
                reverseClears: old.reverseClears + (clearedReversed ? 1 : 0),
                echoClears: old.echoClears + (level.family === "echo" ? 1 : 0),
                gravityClears: old.gravityClears + (level.family === "gravity" ? 1 : 0),
                cornerClears: old.cornerClears + (level.family === "corner" ? 1 : 0),
              };
              commitProgress(grantAchievements(candidate, bestRef.current));
            }
          }
        }
        current.rings = current.rings.filter((ring) => ring.z > 0.18);
        while (current.rings.length < 9) current.rings.push(makeRing((current.rings.at(-1)?.z ?? 2.5) + 1.65, current.score));
      }
      setView({ ballAngle: current.ballAngle, echoAngle: current.echoAngle, x: current.x, y: current.y, rotation: current.rotation, rings: current.rings.map((ring) => ({ ...ring })), score: current.score, shields: current.shields, reversed: current.reversed, echoDelay: current.echoDelay, gravityActive: current.gravityActive, gravityX: current.gravityX, gravityY: current.gravityY, wanderX: current.wanderX, wanderY: current.wanderY, repulsed: current.repulsed, lane: current.lane, cameraRotation: current.cameraRotation, jump: current.jump, blinkCooldown: current.blinkCooldown });
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [commitProgress, grantAchievements, level, makeRing]);

  const resolveCornerRelease = useCallback((dx: number, dy: number) => {
    const horizontal = Math.abs(dx) > Math.abs(dy);
    if (horizontal && Math.abs(dx) > 24) {
      const direction = dx < 0 ? -1 : 1;
      game.current.lane = (game.current.lane + direction + 4) % 4;
      game.current.cameraTarget += direction * Math.PI / 2;
    } else if (dy < -24) {
      const nextGate = game.current.rings.filter((ring) => !ring.checked).sort((a, b) => a.z - b.z)[0];
      if (nextGate?.platform) game.current.jumpUntil = Date.now() + 650;
    } else if (dy > 24 && game.current.blinkCooldown === 0) {
      game.current.lane = (game.current.lane + 2) % 4;
      game.current.cameraTarget += Math.PI;
      game.current.blinkCooldown = 5;
    }
  }, []);

  const gravityFromPoint = useCallback((clientX: number, clientY: number) => {
    const node = frameRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const radius = Math.min(gameWidth * 0.47, gameHeight * 0.4) * 0.72;
    gravityTarget.current = {
      active: true,
      x: clamp((clientX - rect.left - gameWidth / 2) / radius, -1.15, 1.15),
      y: clamp((clientY - rect.top - gameHeight * 0.46) / radius, -1.15, 1.15),
    };
  }, [gameWidth, gameHeight]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { active: true, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY };
    touching.current = true;
    inputX.current = 0;
    inputY.current = 0;
    if (level.family === "gravity") gravityFromPoint(event.clientX, event.clientY);
    if (!game.current.running) start();
  }, [gravityFromPoint, level.family, start]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active || drag.current.pointerId !== event.pointerId) return;
    if (level.family === "gravity") {
      gravityFromPoint(event.clientX, event.clientY);
    } else {
      inputX.current = clamp((event.clientX - drag.current.startX) / 72, -1, 1);
      inputY.current = clamp((event.clientY - drag.current.startY) / 72, -1, 1);
    }
  }, [gravityFromPoint, level.family]);

  const endDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active || drag.current.pointerId !== event.pointerId) return;
    if (level.family === "corner") {
      resolveCornerRelease(event.clientX - drag.current.startX, event.clientY - drag.current.startY);
    }
    gravityTarget.current.active = false;
    drag.current.active = false;
    releaseControl();
  }, [level.family, releaseControl, resolveCornerRelease]);

  const openPanel = useCallback((nextPanel: Exclude<Panel, null>) => {
    if (game.current.running) {
      game.current.running = false;
      setStatus("paused");
    }
    setPanel(nextPanel);
  }, []);
  const closePanel = useCallback(() => {
    setPanel(null);
    setStatus((prevStatus) => {
      if (prevStatus !== "paused") return prevStatus;
      last.current = Date.now();
      game.current.running = true;
      return "playing";
    });
  }, []);
  const chooseLevel = useCallback((nextLevel: (typeof LEVELS)[number]) => {
    if (best < nextLevel.unlock) return;
    game.current.running = false;
    setLevelId(nextLevel.id);
    setOpenGroup(nextLevel.family);
    localStorage.setItem(LEVEL_KEY, nextLevel.id);
    setStatus("ready");
    setPanel(null);
  }, [best]);
  const buyUpgrade = useCallback((upgrade: (typeof UPGRADES)[number]) => {
    const rank = progressRef.current.upgrades[upgrade.key];
    const cost = upgrade.costs[rank];
    if (rank >= 3 || progressRef.current.shards < cost) return;
    commitProgress({ ...progressRef.current, shards: progressRef.current.shards - cost, upgrades: { ...progressRef.current.upgrades, [upgrade.key]: rank + 1 } });
  }, [commitProgress]);

  // Keyboard: orbit/twin/echo steer on one axis; square/gravity use a held direction vector; corner dispatches instantly.
  useEffect(() => {
    const axisKeys = new Set(["ArrowLeft", "KeyA", "ArrowRight", "KeyD", "ArrowUp", "KeyW", "ArrowDown", "KeyS"]);
    const heldKeys = keysDown.current;
    const recomputeAxis = () => {
      const left = heldKeys.has("ArrowLeft") || heldKeys.has("KeyA");
      const right = heldKeys.has("ArrowRight") || heldKeys.has("KeyD");
      const up = heldKeys.has("ArrowUp") || heldKeys.has("KeyW");
      const down = heldKeys.has("ArrowDown") || heldKeys.has("KeyS");
      const x = (right ? 1 : 0) - (left ? 1 : 0);
      const y = (down ? 1 : 0) - (up ? 1 : 0);
      if (level.family === "gravity") {
        gravityTarget.current = x !== 0 || y !== 0 ? { active: true, x: x * 0.9, y: y * 0.9 } : { active: false, x: 0, y: 0 };
        inputX.current = 0;
        inputY.current = 0;
      } else {
        inputX.current = x;
        inputY.current = y;
      }
      touching.current = x !== 0 || y !== 0;
    };
    const keyDown = (event: KeyboardEvent) => {
      if (axisKeys.has(event.code)) event.preventDefault();
      if (event.repeat) return;
      if (level.family === "corner") {
        if (event.code === "ArrowLeft" || event.code === "KeyA") {
          if (!game.current.running) start();
          game.current.lane = (game.current.lane - 1 + 4) % 4;
          game.current.cameraTarget -= Math.PI / 2;
        } else if (event.code === "ArrowRight" || event.code === "KeyD") {
          if (!game.current.running) start();
          game.current.lane = (game.current.lane + 1) % 4;
          game.current.cameraTarget += Math.PI / 2;
        } else if (event.code === "ArrowUp" || event.code === "KeyW") {
          if (!game.current.running) start();
          const nextGate = game.current.rings.filter((ring) => !ring.checked).sort((a, b) => a.z - b.z)[0];
          if (nextGate?.platform) game.current.jumpUntil = Date.now() + 650;
        } else if ((event.code === "ArrowDown" || event.code === "KeyS") && game.current.blinkCooldown === 0) {
          if (!game.current.running) start();
          game.current.lane = (game.current.lane + 2) % 4;
          game.current.cameraTarget += Math.PI;
          game.current.blinkCooldown = 5;
        }
        return;
      }
      if (axisKeys.has(event.code)) {
        heldKeys.add(event.code);
        if (!game.current.running) start();
        recomputeAxis();
      }
      if (event.code === "Space" && !game.current.running) start();
    };
    const keyUp = (event: KeyboardEvent) => {
      if (!axisKeys.has(event.code)) return;
      heldKeys.delete(event.code);
      recomputeAxis();
    };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      heldKeys.clear();
    };
  }, [level.family, start]);

  const centerX = gameWidth / 2;
  const centerY = gameHeight * 0.46;
  const maxRadius = Math.min(gameWidth * 0.47, gameHeight * 0.4);
  const playerRadius = maxRadius * 0.79;
  const ball = level.family === "square" || level.family === "gravity"
    ? { x: centerX + view.x * maxRadius * 0.72, y: centerY + view.y * maxRadius * 0.72 }
    : level.family === "corner"
      ? point(centerX, centerY, playerRadius - view.jump * 34, Math.PI / 2 - view.lane * Math.PI / 2 + view.cameraRotation)
    : point(centerX, centerY, playerRadius, view.ballAngle);
  const twinBall = point(centerX, centerY, playerRadius, view.ballAngle + Math.PI);
  const echoBall = point(centerX, centerY, playerRadius, view.echoAngle);
  const dragHintText = level.family === "twin"
    ? (view.reversed ? "DIRECTION FLIPPED" : "DRAG SIDEWAYS / KEYS ALSO WORK")
    : level.family === "echo"
      ? "DRAG / YOUR ECHO FOLLOWS LATER"
      : level.family === "gravity"
        ? (view.repulsed ? "TOUCH PUSHES / RELEASE TO COAST" : "HOLD TO PULL / ARROW KEYS WORK TOO")
        : level.family === "corner"
          ? "← → TURN / ↑ JUMP / ↓ BLINK"
          : "DRAG ANYWHERE TO STEER";

  return (
    <section className={styles.gameShell}>
      <div className={styles.titleRow}>
        <div>
          <p className={styles.eyebrow}>{level.name} · {level.pace} pace</p>
          <h1>Driftline</h1>
        </div>
        <p>Six ways to lose the line. Clear gates, bank shards, unlock the next set.</p>
      </div>

      <div className={styles.scoreboard} aria-live="polite">
        <div><span>Cleared</span><strong>{view.score}</strong></div>
        <div><span>Best</span><strong>{best}</strong></div>
        <div><span>Shards</span><strong>◆ {progress.shards}</strong></div>
      </div>

      <div className={styles.levelBar}>
        <button type="button" onClick={() => openPanel("levels")}>{level.name} · change level</button>
        <button type="button" onClick={() => openPanel("upgrades")}>Upgrades</button>
        <button type="button" onClick={() => openPanel("achievements")}>Awards ({progress.awards.length}/{ACHIEVEMENTS.length})</button>
      </div>

      <div className={styles.gameFrame} ref={frameRef}>
        {gameWidth > 0 && gameHeight > 0 && (
          <svg width={gameWidth} height={gameHeight} className={styles.svg}>
            <rect width={gameWidth} height={gameHeight} fill="#0d1714" />
            {level.family !== "square" && level.family !== "gravity" && level.family !== "corner" ? (
              <>
                <circle cx={centerX} cy={centerY} r={maxRadius} fill="#101b17" />
                {Array.from({ length: 16 }, (_, index) => {
                  const angle = (index / 16) * TAU + view.rotation;
                  const edge = point(centerX, centerY, maxRadius * 1.45, angle);
                  return <line key={index} x1={centerX} y1={centerY} x2={edge.x} y2={edge.y} stroke="#617269" strokeOpacity={0.12} />;
                })}
                {level.family === "orbit"
                  ? [...view.rings].sort((a, b) => b.z - a.z).map((ring, index) => {
                      const depth = clamp(1 - ring.z / 16, 0, 1);
                      const radius = 12 + Math.pow(depth, 1.75) * maxRadius;
                      const gap = ring.gap + view.rotation;
                      return <path key={index} d={arc(centerX, centerY, radius, gap + ring.gapSize / 2, gap - ring.gapSize / 2 + TAU)} fill="none" stroke={ring.color} strokeOpacity={0.15 + depth * 0.85} strokeWidth={2 + depth * 20} />;
                    })
                  : [...view.rings].sort((a, b) => b.z - a.z).map((ring, index) => {
                      const depth = clamp(1 - ring.z / 16, 0, 1);
                      const radius = 12 + Math.pow(depth, 1.75) * maxRadius;
                      const strokeWidth = 2 + depth * 20;
                      const firstGap = ring.gap + view.rotation;
                      const secondGap = ring.gap2 + view.rotation;
                      return (
                        <g key={index}>
                          <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke={ring.color} strokeOpacity={0.15 + depth * 0.85} strokeWidth={strokeWidth} />
                          <path d={arc(centerX, centerY, radius, firstGap - ring.gapSize / 2, firstGap + ring.gapSize / 2)} fill="none" stroke="#101b17" strokeWidth={strokeWidth + 3} />
                          <path d={arc(centerX, centerY, radius, secondGap - ring.gapSize / 2, secondGap + ring.gapSize / 2)} fill="none" stroke="#101b17" strokeWidth={strokeWidth + 3} />
                        </g>
                      );
                    })}
              </>
            ) : (
              <g transform={`rotate(${((level.family === "corner" ? view.cameraRotation : view.rotation) * 180) / Math.PI} ${centerX} ${centerY})`}>
                {[-1, 1].flatMap((x) => [-1, 1].map((y) => <line key={`${x}-${y}`} x1={centerX} y1={centerY} x2={centerX + x * gameWidth * 0.65} y2={centerY + y * gameHeight * 0.55} stroke="#66808a" strokeOpacity={0.13} />))}
                {[...view.rings].sort((a, b) => b.z - a.z).map((ring, index) => {
                  const depth = clamp(1 - ring.z / 16, 0, 1);
                  const sizePx = 18 + Math.pow(depth, 1.7) * Math.min(gameWidth * 0.94, gameHeight * 0.76);
                  const outerX = centerX - sizePx / 2;
                  const outerY = centerY - sizePx / 2;
                  if (level.family === "corner") {
                    const left = centerX - sizePx / 2;
                    const top = centerY - sizePx / 2;
                    const right = centerX + sizePx / 2;
                    const bottom = centerY + sizePx / 2;
                    const sides = [
                      { x1: left, y1: bottom, x2: right, y2: bottom },
                      { x1: right, y1: top, x2: right, y2: bottom },
                      { x1: left, y1: top, x2: right, y2: top },
                      { x1: left, y1: top, x2: left, y2: bottom },
                    ];
                    const safe = sides[ring.safeLane];
                    const mix = (a: number, b: number, amount: number) => a + (b - a) * amount;
                    return (
                      <g key={index}>
                        {sides.map((side, lane) =>
                          lane === ring.safeLane ? (
                            <g key={lane}>
                              <line x1={side.x1} y1={side.y1} x2={mix(side.x1, side.x2, 0.32)} y2={mix(side.y1, side.y2, 0.32)} stroke={ring.color} strokeOpacity={0.2 + depth * 0.65} strokeWidth={2 + depth * 14} />
                              <line x1={mix(side.x1, side.x2, 0.68)} y1={mix(side.y1, side.y2, 0.68)} x2={side.x2} y2={side.y2} stroke={ring.color} strokeOpacity={0.2 + depth * 0.65} strokeWidth={2 + depth * 14} />
                            </g>
                          ) : (
                            <line key={lane} x1={side.x1} y1={side.y1} x2={side.x2} y2={side.y2} stroke={ring.color} strokeOpacity={0.2 + depth * 0.65} strokeWidth={2 + depth * 14} />
                          )
                        )}
                        <circle cx={mix(safe.x1, safe.x2, 0.5)} cy={mix(safe.y1, safe.y2, 0.5)} r={ring.platform ? 5 + depth * 8 : 3 + depth * 3} fill={ring.platform ? "#f2c96f" : "#83c79f"} fillOpacity={0.35 + depth * 0.65} />
                      </g>
                    );
                  }
                  const holeSize = sizePx * ring.gapSize * 0.35;
                  const holeX = centerX + ring.gapX * sizePx * 0.35 - holeSize / 2;
                  const holeY = centerY + ring.gapY * sizePx * 0.35 - holeSize / 2;
                  const path = `M ${outerX} ${outerY} H ${outerX + sizePx} V ${outerY + sizePx} H ${outerX} Z M ${holeX} ${holeY} H ${holeX + holeSize} V ${holeY + holeSize} H ${holeX} Z`;
                  return <path key={index} d={path} fill={ring.color} fillRule="evenodd" fillOpacity={0.08 + depth * 0.42} stroke={ring.color} strokeOpacity={0.2 + depth * 0.7} strokeWidth={1 + depth * 3} />;
                })}
              </g>
            )}
            {level.family === "twin" && <line x1={ball.x} y1={ball.y} x2={twinBall.x} y2={twinBall.y} stroke="#d9a986" strokeOpacity={0.23} strokeWidth={2} />}
            {level.family === "echo" && <path d={arc(centerX, centerY, playerRadius, view.echoAngle, view.ballAngle)} fill="none" stroke="#7ec4c7" strokeOpacity={0.2} strokeWidth={2} strokeDasharray="4 7" />}
            {level.family === "gravity" && view.gravityActive && (
              <>
                <line x1={ball.x} y1={ball.y} x2={centerX + view.gravityX * maxRadius * 0.72} y2={centerY + view.gravityY * maxRadius * 0.72} stroke={view.repulsed ? "#ef6d5a" : "#73c3ac"} strokeOpacity={0.42} strokeWidth={2} strokeDasharray="5 6" />
                <circle cx={centerX + view.gravityX * maxRadius * 0.72} cy={centerY + view.gravityY * maxRadius * 0.72} r={20} fill={view.repulsed ? "#a63f36" : "#397b6b"} fillOpacity={0.22} stroke={view.repulsed ? "#ef6d5a" : "#73c3ac"} strokeWidth={2} />
                <circle cx={centerX + view.gravityX * maxRadius * 0.72} cy={centerY + view.gravityY * maxRadius * 0.72} r={5} fill={view.repulsed ? "#ff9a83" : "#9ce0c9"} />
              </>
            )}
            {level.family === "gravity" && "wander" in level && level.wander > 0 && (
              <>
                <circle cx={centerX + view.wanderX * maxRadius * 0.72} cy={centerY + view.wanderY * maxRadius * 0.72} r={16} fill="#8b659d" fillOpacity={0.18} stroke="#ba8dcc" strokeOpacity={0.65} strokeWidth={2} />
                <circle cx={centerX + view.wanderX * maxRadius * 0.72} cy={centerY + view.wanderY * maxRadius * 0.72} r={4} fill="#d6a9e3" />
              </>
            )}
            <circle cx={ball.x} cy={ball.y} r={12} fill="#f0c779" stroke="#fff0bf" strokeWidth={3} />
            {level.family === "twin" && <circle cx={twinBall.x} cy={twinBall.y} r={12} fill="#d47773" stroke="#ffd1c9" strokeWidth={3} />}
            {level.family === "echo" && <circle cx={echoBall.x} cy={echoBall.y} r={10} fill="#73aeb2" fillOpacity={0.42} stroke="#bce8e7" strokeOpacity={0.72} strokeWidth={2} />}
          </svg>
        )}

        <div className={styles.scoreHud}>
          <span className={styles.scoreHudLabel}>SHIELD {view.shields > 0 ? "◆" : "—"}</span>
          {level.family === "echo" && <span className={styles.echoTime}>ECHO {(view.echoDelay / 1000).toFixed(1)}s</span>}
          {level.family === "corner" && <span className={styles.echoTime}>{view.blinkCooldown === 0 ? "BLINK READY" : `BLINK IN ${view.blinkCooldown}`}</span>}
        </div>

        {view.reversed && <div className={styles.reverseBanner}><strong>REVERSED</strong><span>LEFT IS RIGHT / RIGHT IS LEFT</span></div>}
        {view.repulsed && <div className={styles.reverseBanner}><strong>REPULSION</strong><span>YOUR TOUCH NOW PUSHES AWAY</span></div>}

        {status !== "playing" && status !== "paused" && !panel && (
          <div className={styles.overlay}>
            <strong>{status === "over" ? "Lost the line." : level.name}</strong>
            <button type="button" onClick={start}>{status === "over" ? `Cleared ${view.score} · try again` : "Tap to begin"}</button>
            <div className={styles.overlayLinks}>
              <button type="button" onClick={() => openPanel("levels")}>Levels</button>
              <button type="button" onClick={() => openPanel("upgrades")}>Upgrades</button>
              <button type="button" onClick={() => openPanel("achievements")}>Awards</button>
            </div>
          </div>
        )}

        {level.family === "orbit" ? (
          <div className={styles.controls}>
            <button
              aria-label="Roll left"
              onPointerDown={() => control(-1)}
              onPointerUp={releaseControl}
              onPointerCancel={releaseControl}
              onPointerLeave={releaseControl}
            >
              ← <span>Hold left</span>
            </button>
            <button
              aria-label="Roll right"
              onPointerDown={() => control(1)}
              onPointerUp={releaseControl}
              onPointerCancel={releaseControl}
              onPointerLeave={releaseControl}
            >
              <span>Hold right</span> →
            </button>
          </div>
        ) : (
          status === "playing" && !panel && (
            <div
              className={styles.dragSurface}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <div className={styles.dragHint}><span className={(view.reversed || view.repulsed) ? styles.dragHintReversed : undefined}>{dragHintText}</span></div>
            </div>
          )
        )}

        {panel && (
          <div className={styles.panel}>
            <div className={styles.panelTop}>
              <div>
                <p className={styles.panelKicker}>DRIFTLINE GARAGE</p>
                <p className={styles.panelTitle}>{panel === "achievements" ? "Awards" : panel[0].toUpperCase() + panel.slice(1)}</p>
              </div>
              <button type="button" className={styles.close} onClick={closePanel}>Close</button>
            </div>
            <div className={styles.tabs}>
              {(["levels", "upgrades", "achievements"] as const).map((tab) => (
                <button key={tab} type="button" onClick={() => setPanel(tab)} className={panel === tab ? styles.tabActive : styles.tab}>
                  {tab === "achievements" ? "AWARDS" : tab.toUpperCase()}
                </button>
              ))}
            </div>
            <div className={styles.panelScroll}>
              {panel === "levels" && LEVEL_GROUPS.map((group) => {
                const expanded = openGroup === group.id;
                const courses = LEVELS.filter((item) => item.family === group.id);
                const selectedHere = courses.some((item) => item.id === levelId);
                return (
                  <div key={group.id} className={styles.levelGroup}>
                    <button type="button" onClick={() => setOpenGroup(expanded ? null : group.id)} className={selectedHere ? styles.groupHeadSelected : styles.groupHead}>
                      <span className={styles.groupIcon}>{group.icon}</span>
                      <span className={styles.groupCopy}>
                        <span className={styles.itemName}>{group.name}</span>
                        <span className={styles.itemCopy}>{group.copy}</span>
                      </span>
                      <span className={styles.groupChevron}>{expanded ? "−" : "+"}</span>
                    </button>
                    {expanded && (
                      <div className={styles.groupCourses}>
                        {courses.map((item) => {
                          const locked = best < item.unlock;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              disabled={locked}
                              onClick={() => chooseLevel(item)}
                              className={locked ? styles.itemLocked : levelId === item.id ? styles.itemSelected : styles.itemCard}
                            >
                              <span className={styles.itemHead}>
                                <span className={styles.itemName}>{item.name}</span>
                                <span className={styles.itemState}>{locked ? `BEST ${item.unlock} TO UNLOCK` : levelId === item.id ? "SELECTED" : "CHOOSE"}</span>
                              </span>
                              <span className={styles.stats}>
                                <span className={styles.stat}>PACE {item.pace}</span>
                                <span className={styles.stat}>GAPS {item.gaps}</span>
                                <span className={styles.stat}>SPIN {item.spin}</span>
                              </span>
                              {"reverseEvery" in item && <span className={styles.modifierNote}>MODIFIER / REVERSE EVERY {item.reverseEvery} CLEARS</span>}
                              {"echoDelay" in item && <span className={styles.modifierNote}>ECHO / {(item.echoDelay / 1000).toFixed(1)}s {item.delayDecay > 0 ? "/ DECAYS EACH CLEAR" : "/ TRACKS ONE GATE"}</span>}
                              {"pull" in item && <span className={styles.modifierNote}>GRAVITY / {item.wander > 0 ? "SECOND WELL" : "YOUR WELL ONLY"}{item.repulseEvery > 0 ? ` / REPULSES EVERY ${item.repulseEvery}` : ""}</span>}
                              {"laneShift" in item && <span className={styles.modifierNote}>SWIPES / UP TO {item.laneShift} TURN{item.laneShift > 1 ? "S" : ""} / GOLD MARKS A JUMP</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {panel === "upgrades" && (
                <>
                  <p className={styles.balance}>◆ {progress.shards} SHARDS AVAILABLE</p>
                  {UPGRADES.map((upgrade) => {
                    const rank = progress.upgrades[upgrade.key];
                    const cost = upgrade.costs[rank];
                    const affordable = rank < 3 && progress.shards >= cost;
                    return (
                      <div key={upgrade.key} className={styles.itemCard}>
                        <span className={styles.itemHead}>
                          <span className={styles.itemName}>{upgrade.name}</span>
                          <span className={styles.rank}>RANK {rank}/3</span>
                        </span>
                        <p className={styles.itemCopy}>{upgrade.copy}</p>
                        <button type="button" disabled={!affordable} onClick={() => buyUpgrade(upgrade)} className={affordable ? styles.buy : styles.buyDisabled}>
                          {rank === 3 ? "MAXED" : `BUY / ◆ ${cost}`}
                        </button>
                      </div>
                    );
                  })}
                </>
              )}

              {panel === "achievements" && (
                <>
                  <p className={styles.balance}>{progress.awards.length}/{ACHIEVEMENTS.length} AWARDS / {progress.totalClears} LIFETIME CLEARS</p>
                  {ACHIEVEMENTS.map((achievement) => {
                    const earned = progress.awards.includes(achievement.id);
                    return (
                      <div key={achievement.id} className={earned ? styles.awardEarned : styles.award}>
                        <span className={styles.awardMark}>{earned ? "◆" : "◇"}</span>
                        <span className={styles.awardCopy}>
                          <span className={styles.itemName}>{achievement.name}</span>
                          <span className={styles.itemCopy}>{achievement.copy}</span>
                        </span>
                        <span className={styles.reward}>{earned ? "EARNED" : `◆ ${achievement.reward}`}</span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <p className={styles.hint}>Arrow keys / WASD, or drag on the frame. Corner levels turn on tap of ← → ↑ ↓.</p>
    </section>
  );
}
