import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Accelerometer } from "expo-sensors";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, G, Line, Path, Rect } from "react-native-svg";

type Family = "orbit" | "square" | "twin" | "echo" | "gravity" | "corner";
type Ring = { z: number; gap: number; gap2: number; gapX: number; gapY: number; gapSize: number; safeLane: number; platform: boolean; checked: boolean; color: string };
type Snapshot = { ballAngle: number; echoAngle: number; x: number; y: number; rotation: number; rings: Ring[]; score: number; shields: number; reversed: boolean; echoDelay: number; gravityActive: boolean; gravityX: number; gravityY: number; wanderX: number; wanderY: number; repulsed: boolean; lane: number; cameraRotation: number; jump: number; blinkCooldown: number };
type Panel = "levels" | "upgrades" | "achievements" | null;
type UpgradeKey = "handling" | "focus" | "salvage" | "calm" | "shield" | "core";
type Progress = {
  shards: number;
  totalClears: number;
  tiltClears: number;
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
const DEFAULT_PROGRESS: Progress = { shards: 0, totalClears: 0, tiltClears: 0, twinClears: 0, reverseClears: 0, echoClears: 0, gravityClears: 0, cornerClears: 0, runs: 0, upgrades: { handling: 0, focus: 0, salvage: 0, calm: 0, shield: 0, core: 0 }, awards: [] };

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
  { id: "orbit" as Family, name: "Orbit Set", copy: "Roll around the rim. Left and right only." },
  { id: "square" as Family, name: "Squareflight Set", copy: "Fly freely while the tunnel turns around you." },
  { id: "twin" as Family, name: "Twinline Set", copy: "Two mirrored runners. Either collision ends the line." },
  { id: "echo" as Family, name: "Echoline Set", copy: "Steer now. Survive what your ghost remembers later." },
  { id: "gravity" as Family, name: "Gravityline Set", copy: "Place a well. Bend momentum. Bank the impossible shot." },
  { id: "corner" as Family, name: "Cornerhop Set", copy: "Swipe walls. Turn the camera. Jump or blink across." },
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
  { id: "first", name: "Found the Line", copy: "Clear your first gate.", reward: 5, test: (p: Progress, best: number) => p.totalClears >= 1 },
  { id: "ten", name: "Thread the Needle", copy: "Clear 10 gates in one run.", reward: 10, test: (p: Progress, best: number) => best >= 10 },
  { id: "tilt", name: "No Hands", copy: "Clear 10 gates using tilt.", reward: 12, test: (p: Progress, best: number) => p.tiltClears >= 10 },
  { id: "regular", name: "One More Run", copy: "Begin 10 runs.", reward: 10, test: (p: Progress, best: number) => p.runs >= 10 },
  { id: "fifty", name: "Tunnel Native", copy: "Clear 50 gates in total.", reward: 20, test: (p: Progress, best: number) => p.totalClears >= 50 },
  { id: "twinline", name: "Perfectly Opposed", copy: "Clear 10 gates in Twinline.", reward: 14, test: (p: Progress, best: number) => p.twinClears >= 10 },
  { id: "backwards", name: "Wrong Way Forward", copy: "Clear 8 gates while controls are reversed.", reward: 16, test: (p: Progress, best: number) => p.reverseClears >= 8 },
  { id: "echo", name: "Past Tense", copy: "Clear 10 gates with your delayed echo.", reward: 16, test: (p: Progress, best: number) => p.echoClears >= 10 },
  { id: "gravity", name: "Bank Shot", copy: "Clear 10 gates in Gravityline.", reward: 16, test: (p: Progress, best: number) => p.gravityClears >= 10 },
  { id: "corner", name: "Wall Logic", copy: "Clear 10 gates in Cornerhop.", reward: 18, test: (p: Progress, best: number) => p.cornerClears >= 10 },
];

const angleDistance = (a: number, b: number) => Math.abs(((a - b + Math.PI) % TAU + TAU) % TAU - Math.PI);
const point = (cx: number, cy: number, radius: number, angle: number) => ({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
const arc = (cx: number, cy: number, radius: number, start: number, end: number) => {
  const from = point(cx, cy, radius, start);
  const to = point(cx, cy, radius, end);
  return `M ${from.x} ${from.y} A ${radius} ${radius} 0 ${end - start > Math.PI ? 1 : 0} 1 ${to.x} ${to.y}`;
};

export default function DriftlineScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const gameWidth = width - 16;
  const gameHeight = height - insets.top - insets.bottom - 62;
  const inputX = useRef(0);
  const inputY = useRef(0);
  const gravityTarget = useRef({ active: false, x: 0, y: 0 });
  const touching = useRef(false);
  const frame = useRef<number | null>(null);
  const last = useRef(0);
  const lastGap = useRef(Math.PI / 2);
  const lastSquareGap = useRef({ x: 0, y: 0 });
  const lastSafeLane = useRef(0);
  const echoGapMemory = useRef<number[]>([]);
  const angleHistory = useRef<{ at: number; angle: number }[]>([]);
  const tiltBaseline = useRef<{ x: number; y: number } | null>(null);
  const tiltSteering = useRef({ x: 0, y: 0 });
  const tiltEnabledRef = useRef(false);
  const progressRef = useRef(DEFAULT_PROGRESS);
  const bestRef = useRef(0);
  const game = useRef({ ballAngle: Math.PI / 2, echoAngle: Math.PI / 2, velocity: 0, x: 0, y: 0, vx: 0, vy: 0, rotation: 0, speed: 0.025, score: 0, shields: 0, reversed: false, reverseUntil: 0, echoDelay: 1450, gravityActive: false, gravityX: 0, gravityY: 0, wanderX: 0, wanderY: 0, repulsed: false, repulseUntil: 0, lane: 0, cameraRotation: 0, cameraTarget: 0, jump: 0, jumpUntil: 0, blinkCooldown: 0, rings: [] as Ring[], running: false });
  const [view, setView] = useState<Snapshot>({ ballAngle: Math.PI / 2, echoAngle: Math.PI / 2, x: 0, y: 0, rotation: 0, rings: [], score: 0, shields: 0, reversed: false, echoDelay: 1450, gravityActive: false, gravityX: 0, gravityY: 0, wanderX: 0, wanderY: 0, repulsed: false, lane: 0, cameraRotation: 0, jump: 0, blinkCooldown: 0 });
  const [best, setBest] = useState(0);
  const [status, setStatus] = useState<"ready" | "playing" | "paused" | "over">("ready");
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [sensorAvailable, setSensorAvailable] = useState(true);
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);
  const [levelId, setLevelId] = useState("moss");
  const [panel, setPanel] = useState<Panel>(null);
  const [openGroup, setOpenGroup] = useState<Family | null>("orbit");
  const level = LEVELS.find((item) => item.id === levelId) ?? LEVELS[0];

  const commitProgress = useCallback((next: Progress) => {
    progressRef.current = next;
    setProgress(next);
    AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
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
        x: Math.max(-0.42, Math.min(0.42, lastSquareGap.current.x + (Math.random() * 2 - 1) * maxTurn)),
        y: Math.max(-0.42, Math.min(0.42, lastSquareGap.current.y + (Math.random() * 2 - 1) * maxTurn)),
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
    const runProgress = grantAchievements({ ...progressRef.current, runs: progressRef.current.runs + 1 }, best);
    commitProgress(runProgress);
    last.current = Date.now();
    setStatus("playing");
    setView({ ballAngle: next.ballAngle, echoAngle: next.echoAngle, x: 0, y: 0, rotation: next.rotation, rings: [...next.rings], score: 0, shields: next.shields, reversed: false, echoDelay: next.echoDelay, gravityActive: false, gravityX: 0, gravityY: 0, wanderX: 0, wanderY: 0, repulsed: false, lane: 0, cameraRotation: 0, jump: 0, blinkCooldown: 0 });
  }, [best, commitProgress, grantAchievements, level, makeRing]);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem("driftline-best"), AsyncStorage.getItem(PROGRESS_KEY), AsyncStorage.getItem("driftline-level")]).then(([savedBest, savedProgress, savedLevel]) => {
      const loadedBest = Number(savedBest ?? 0);
      bestRef.current = loadedBest;
      setBest(loadedBest);
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress) as Partial<Progress>;
          const merged: Progress = { ...DEFAULT_PROGRESS, ...parsed, upgrades: { ...DEFAULT_PROGRESS.upgrades, ...parsed.upgrades } };
          const rewarded = grantAchievements(merged, loadedBest);
          commitProgress(rewarded);
        } catch { /* Start fresh if old progress is malformed. */ }
      }
      const savedCourse = LEVELS.find((item) => item.id === savedLevel);
      if (savedCourse) {
        setLevelId(savedCourse.id);
        setOpenGroup(savedCourse.family);
      }
    });
    Accelerometer.isAvailableAsync().then(setSensorAvailable);
  }, [commitProgress, grantAchievements]);

  useEffect(() => {
    tiltEnabledRef.current = tiltEnabled;
    if (!tiltEnabled) {
      tiltBaseline.current = null;
      tiltSteering.current = { x: 0, y: 0 };
      if (!touching.current) {
        inputX.current = 0;
        inputY.current = 0;
      }
      return;
    }
    Accelerometer.setUpdateInterval(50);
    const subscription = Accelerometer.addListener(({ x, y }) => {
      if (tiltBaseline.current === null) tiltBaseline.current = { x, y };
      if (!touching.current) {
        const soften = (offset: number) => Math.max(-0.65, Math.min(0.65, Math.sign(offset) * Math.max(0, Math.abs(offset) - 0.035) * 1.35));
        const targetX = soften(x - tiltBaseline.current.x);
        const targetY = soften(-(y - tiltBaseline.current.y));
        tiltSteering.current.x += (targetX - tiltSteering.current.x) * 0.18;
        tiltSteering.current.y += (targetY - tiltSteering.current.y) * 0.18;
        inputX.current = tiltSteering.current.x;
        inputY.current = tiltSteering.current.y;
      }
    });
    return () => subscription.remove();
  }, [tiltEnabled]);

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
          current.velocity = Math.max(-0.065, Math.min(0.065, current.velocity));
          current.ballAngle = (current.ballAngle + current.velocity * delta + TAU) % TAU;
        } else if (level.family === "square") {
          current.vx += inputX.current * 0.0035 * delta;
          current.vy += inputY.current * 0.0035 * delta;
          const damping = Math.pow(0.9 - handling * 0.01, delta);
          current.vx *= damping;
          current.vy *= damping;
          current.vx = Math.max(-0.045, Math.min(0.045, current.vx));
          current.vy = Math.max(-0.045, Math.min(0.045, current.vy));
          current.x = Math.max(-0.86, Math.min(0.86, current.x + current.vx * delta));
          current.y = Math.max(-0.86, Math.min(0.86, current.y + current.vy * delta));
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
          } else if (tiltEnabledRef.current) {
            current.vx += inputX.current * 0.0011 * delta;
            current.vy += inputY.current * 0.0011 * delta;
          }
          const wander = "wander" in level ? level.wander : 0;
          if (wander > 0) {
            current.wanderX = Math.sin(now / 1150) * 0.72;
            current.wanderY = Math.cos(now / 870) * 0.62;
            current.vx += (current.wanderX - current.x) * wander * delta;
            current.vy += (current.wanderY - current.y) * wander * delta;
          }
          const gravityDamping = Math.pow(0.994 - handling * 0.0015, delta);
          current.vx = Math.max(-0.052, Math.min(0.052, current.vx * gravityDamping));
          current.vy = Math.max(-0.052, Math.min(0.052, current.vy * gravityDamping));
          current.x += current.vx * delta;
          current.y += current.vy * delta;
          if (Math.abs(current.x) > 0.9) {
            current.x = Math.sign(current.x) * 0.9;
            current.vx *= -0.62;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          }
          if (Math.abs(current.y) > 0.9) {
            current.y = Math.sign(current.y) * 0.9;
            current.vy *= -0.62;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          }
        } else if (level.family === "corner") {
          current.cameraRotation += (current.cameraTarget - current.cameraRotation) * Math.min(1, 0.16 * delta);
          current.jump = Math.max(0, Math.min(1, (current.jumpUntil - now) / 650));
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
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              } else {
                current.running = false;
                inputX.current = 0;
                inputY.current = 0;
                setStatus("over");
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              }
            } else {
              const clearedReversed = current.reversed;
              current.score += 1;
              if (level.family === "corner" && current.blinkCooldown > 0) current.blinkCooldown -= 1;
              const reverseEvery = "reverseEvery" in level ? level.reverseEvery : 0;
              if (current.reversed && current.score >= current.reverseUntil) {
                current.reversed = false;
                Haptics.selectionAsync();
              } else if (level.family === "twin" && reverseEvery > 0 && current.score % reverseEvery === 0) {
                current.reversed = true;
                current.reverseUntil = current.score + 3;
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              }
              const repulseEvery = "repulseEvery" in level ? level.repulseEvery : 0;
              if (current.repulsed && current.score >= current.repulseUntil) {
                current.repulsed = false;
                Haptics.selectionAsync();
              } else if (level.family === "gravity" && repulseEvery > 0 && current.score % repulseEvery === 0) {
                current.repulsed = true;
                current.repulseUntil = current.score + 2;
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              }
              const shieldRank = progressRef.current.upgrades.shield;
              const rechargeEvery = shieldRank === 3 ? 10 : shieldRank === 2 ? 15 : Infinity;
              if (current.score % rechargeEvery === 0) current.shields = 1;
              const nextBest = Math.max(bestRef.current, current.score);
              if (nextBest !== bestRef.current) {
                bestRef.current = nextBest;
                setBest(nextBest);
                AsyncStorage.setItem("driftline-best", String(nextBest));
              }
              const old = progressRef.current;
              const magnetInterval = old.upgrades.salvage > 0 ? 7 - old.upgrades.salvage : Infinity;
              const earned = 1 + (current.score % magnetInterval === 0 ? 1 : 0);
              const candidate = {
                ...old,
                shards: old.shards + earned,
                totalClears: old.totalClears + 1,
                tiltClears: old.tiltClears + (tiltEnabledRef.current ? 1 : 0),
                twinClears: old.twinClears + (level.family === "twin" ? 1 : 0),
                reverseClears: old.reverseClears + (clearedReversed ? 1 : 0),
                echoClears: old.echoClears + (level.family === "echo" ? 1 : 0),
                gravityClears: old.gravityClears + (level.family === "gravity" ? 1 : 0),
                cornerClears: old.cornerClears + (level.family === "corner" ? 1 : 0),
              };
              commitProgress(grantAchievements(candidate, nextBest));
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    return () => { if (frame.current) cancelAnimationFrame(frame.current); };
  }, [commitProgress, grantAchievements, level, makeRing]);

  const control = (x: number, y = 0) => {
    if (!game.current.running) start();
    touching.current = true;
    inputX.current = x;
    inputY.current = y;
  };
  const releaseControl = useCallback(() => {
    touching.current = false;
    if (!tiltEnabled) {
      inputX.current = 0;
      inputY.current = 0;
    }
  }, [tiltEnabled]);
  const dragResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      touching.current = true;
      inputX.current = 0;
      inputY.current = 0;
      if (level.family === "gravity") {
        const radius = Math.min(gameWidth * 0.47, gameHeight * 0.4) * 0.72;
        gravityTarget.current = {
          active: true,
          x: Math.max(-1.15, Math.min(1.15, (event.nativeEvent.locationX - gameWidth / 2) / radius)),
          y: Math.max(-1.15, Math.min(1.15, (event.nativeEvent.locationY - gameHeight * 0.46) / radius)),
        };
      }
    },
    onPanResponderMove: (event, gesture) => {
      if (level.family === "gravity") {
        const radius = Math.min(gameWidth * 0.47, gameHeight * 0.4) * 0.72;
        gravityTarget.current = {
          active: true,
          x: Math.max(-1.15, Math.min(1.15, (event.nativeEvent.locationX - gameWidth / 2) / radius)),
          y: Math.max(-1.15, Math.min(1.15, (event.nativeEvent.locationY - gameHeight * 0.46) / radius)),
        };
      } else {
        inputX.current = Math.max(-1, Math.min(1, gesture.dx / 72));
        inputY.current = Math.max(-1, Math.min(1, gesture.dy / 72));
      }
    },
    onPanResponderRelease: (_, gesture) => {
      if (level.family === "corner") {
        const horizontal = Math.abs(gesture.dx) > Math.abs(gesture.dy);
        if (horizontal && Math.abs(gesture.dx) > 24) {
          const direction = gesture.dx < 0 ? -1 : 1;
          game.current.lane = (game.current.lane + direction + 4) % 4;
          game.current.cameraTarget += direction * Math.PI / 2;
          Haptics.selectionAsync();
        } else if (gesture.dy < -24) {
          const nextGate = game.current.rings.filter((ring) => !ring.checked).sort((a, b) => a.z - b.z)[0];
          if (nextGate?.platform) {
            game.current.jumpUntil = Date.now() + 650;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        } else if (gesture.dy > 24 && game.current.blinkCooldown === 0) {
          game.current.lane = (game.current.lane + 2) % 4;
          game.current.cameraTarget += Math.PI;
          game.current.blinkCooldown = 5;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
      gravityTarget.current.active = false;
      releaseControl();
    },
    onPanResponderTerminate: () => {
      gravityTarget.current.active = false;
      releaseControl();
    },
  }), [gameHeight, gameWidth, level.family, releaseControl]);
  const toggleTilt = () => {
    if (!sensorAvailable) return;
    tiltBaseline.current = null;
    tiltSteering.current = { x: 0, y: 0 };
    setTiltEnabled((enabled) => !enabled);
    Haptics.selectionAsync();
  };
  const openPanel = (nextPanel: Exclude<Panel, null>) => {
    if (game.current.running) {
      game.current.running = false;
      setStatus("paused");
    }
    setPanel(nextPanel);
  };
  const closePanel = () => {
    setPanel(null);
    if (status === "paused") {
      last.current = Date.now();
      game.current.running = true;
      setStatus("playing");
    }
  };
  const chooseLevel = (nextLevel: typeof LEVELS[number]) => {
    if (best < nextLevel.unlock) return;
    game.current.running = false;
    setLevelId(nextLevel.id);
    setOpenGroup(nextLevel.family);
    AsyncStorage.setItem("driftline-level", nextLevel.id);
    setStatus("ready");
    setPanel(null);
    Haptics.selectionAsync();
  };
  const buyUpgrade = (upgrade: typeof UPGRADES[number]) => {
    const rank = progress.upgrades[upgrade.key];
    const cost = upgrade.costs[rank];
    if (rank >= 3 || progress.shards < cost) return;
    commitProgress({ ...progress, shards: progress.shards - cost, upgrades: { ...progress.upgrades, [upgrade.key]: rank + 1 } });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

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

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/")}><Text style={styles.back}>{"< ODDLOOP"}</Text></Pressable>
        <Text style={styles.logo}>DRIFTLINE</Text>
        <View style={styles.headerRight}>
          <Text style={styles.wallet}>◆ {progress.shards}</Text>
          <Pressable onPress={() => openPanel("levels")} style={styles.menuButton}><Text style={styles.menuText}>MENU</Text></Pressable>
        </View>
      </View>

      <View style={[styles.game, { width: gameWidth, height: gameHeight }]}>
        <Svg width={gameWidth} height={gameHeight}>
          <Rect width={gameWidth} height={gameHeight} fill="#0d1714" />
          {level.family !== "square" && level.family !== "gravity" && level.family !== "corner" ? <>
            <Circle cx={centerX} cy={centerY} r={maxRadius} fill="#101b17" />
            {Array.from({ length: 16 }, (_, index) => {
              const angle = index / 16 * TAU + view.rotation;
              const edge = point(centerX, centerY, maxRadius * 1.45, angle);
              return <Line key={index} x1={centerX} y1={centerY} x2={edge.x} y2={edge.y} stroke="#617269" strokeOpacity={0.12} />;
            })}
            {level.family === "orbit" ? [...view.rings].sort((a, b) => b.z - a.z).map((ring, index) => {
              const depth = Math.max(0, Math.min(1, 1 - ring.z / 16));
              const radius = 12 + Math.pow(depth, 1.75) * maxRadius;
              const gap = ring.gap + view.rotation;
              return <Path key={index} d={arc(centerX, centerY, radius, gap + ring.gapSize / 2, gap - ring.gapSize / 2 + TAU)} fill="none" stroke={ring.color} strokeOpacity={0.15 + depth * 0.85} strokeWidth={2 + depth * 20} />;
            }) : [...view.rings].sort((a, b) => b.z - a.z).map((ring, index) => {
              const depth = Math.max(0, Math.min(1, 1 - ring.z / 16));
              const radius = 12 + Math.pow(depth, 1.75) * maxRadius;
              const strokeWidth = 2 + depth * 20;
              const firstGap = ring.gap + view.rotation;
              const secondGap = ring.gap2 + view.rotation;
              return <G key={index}>
                <Circle cx={centerX} cy={centerY} r={radius} fill="none" stroke={ring.color} strokeOpacity={0.15 + depth * 0.85} strokeWidth={strokeWidth} />
                <Path d={arc(centerX, centerY, radius, firstGap - ring.gapSize / 2, firstGap + ring.gapSize / 2)} fill="none" stroke="#101b17" strokeWidth={strokeWidth + 3} />
                <Path d={arc(centerX, centerY, radius, secondGap - ring.gapSize / 2, secondGap + ring.gapSize / 2)} fill="none" stroke="#101b17" strokeWidth={strokeWidth + 3} />
              </G>;
            })}
          </> : <>
            <G rotation={(level.family === "corner" ? view.cameraRotation : view.rotation) * 180 / Math.PI} origin={`${centerX}, ${centerY}`}>
              {[-1, 1].flatMap((x) => [-1, 1].map((y) => <Line key={`${x}-${y}`} x1={centerX} y1={centerY} x2={centerX + x * gameWidth * 0.65} y2={centerY + y * gameHeight * 0.55} stroke="#66808a" strokeOpacity={0.13} />))}
              {[...view.rings].sort((a, b) => b.z - a.z).map((ring, index) => {
                const depth = Math.max(0, Math.min(1, 1 - ring.z / 16));
                const size = 18 + Math.pow(depth, 1.7) * Math.min(gameWidth * 0.94, gameHeight * 0.76);
                const outerX = centerX - size / 2;
                const outerY = centerY - size / 2;
                if (level.family === "corner") {
                  const left = centerX - size / 2;
                  const top = centerY - size / 2;
                  const right = centerX + size / 2;
                  const bottom = centerY + size / 2;
                  const sides = [
                    { x1: left, y1: bottom, x2: right, y2: bottom },
                    { x1: right, y1: top, x2: right, y2: bottom },
                    { x1: left, y1: top, x2: right, y2: top },
                    { x1: left, y1: top, x2: left, y2: bottom },
                  ];
                  const safe = sides[ring.safeLane];
                  const mix = (a: number, b: number, amount: number) => a + (b - a) * amount;
                  return <G key={index}>
                    {sides.map((side, lane) => lane === ring.safeLane ? <G key={lane}>
                      <Line x1={side.x1} y1={side.y1} x2={mix(side.x1, side.x2, 0.32)} y2={mix(side.y1, side.y2, 0.32)} stroke={ring.color} strokeOpacity={0.2 + depth * 0.65} strokeWidth={2 + depth * 14} />
                      <Line x1={mix(side.x1, side.x2, 0.68)} y1={mix(side.y1, side.y2, 0.68)} x2={side.x2} y2={side.y2} stroke={ring.color} strokeOpacity={0.2 + depth * 0.65} strokeWidth={2 + depth * 14} />
                    </G> : <Line key={lane} {...side} stroke={ring.color} strokeOpacity={0.2 + depth * 0.65} strokeWidth={2 + depth * 14} />)}
                    <Circle cx={mix(safe.x1, safe.x2, 0.5)} cy={mix(safe.y1, safe.y2, 0.5)} r={ring.platform ? 5 + depth * 8 : 3 + depth * 3} fill={ring.platform ? "#f2c96f" : "#83c79f"} fillOpacity={0.35 + depth * 0.65} />
                  </G>;
                }
                const holeSize = size * ring.gapSize * 0.35;
                const holeX = centerX + ring.gapX * size * 0.35 - holeSize / 2;
                const holeY = centerY + ring.gapY * size * 0.35 - holeSize / 2;
                const path = `M ${outerX} ${outerY} H ${outerX + size} V ${outerY + size} H ${outerX} Z M ${holeX} ${holeY} H ${holeX + holeSize} V ${holeY + holeSize} H ${holeX} Z`;
                return <Path key={index} d={path} fill={ring.color} fillRule="evenodd" fillOpacity={0.08 + depth * 0.42} stroke={ring.color} strokeOpacity={0.2 + depth * 0.7} strokeWidth={1 + depth * 3} />;
              })}
            </G>
          </>}
          {level.family === "twin" && <Line x1={ball.x} y1={ball.y} x2={twinBall.x} y2={twinBall.y} stroke="#d9a986" strokeOpacity={0.23} strokeWidth={2} />}
          {level.family === "echo" && <Path d={arc(centerX, centerY, playerRadius, view.echoAngle, view.ballAngle)} fill="none" stroke="#7ec4c7" strokeOpacity={0.2} strokeWidth={2} strokeDasharray="4 7" />}
          {level.family === "gravity" && view.gravityActive && <>
            <Line x1={ball.x} y1={ball.y} x2={centerX + view.gravityX * maxRadius * 0.72} y2={centerY + view.gravityY * maxRadius * 0.72} stroke={view.repulsed ? "#ef6d5a" : "#73c3ac"} strokeOpacity={0.42} strokeWidth={2} strokeDasharray="5 6" />
            <Circle cx={centerX + view.gravityX * maxRadius * 0.72} cy={centerY + view.gravityY * maxRadius * 0.72} r={20} fill={view.repulsed ? "#a63f36" : "#397b6b"} fillOpacity={0.22} stroke={view.repulsed ? "#ef6d5a" : "#73c3ac"} strokeWidth={2} />
            <Circle cx={centerX + view.gravityX * maxRadius * 0.72} cy={centerY + view.gravityY * maxRadius * 0.72} r={5} fill={view.repulsed ? "#ff9a83" : "#9ce0c9"} />
          </>}
          {level.family === "gravity" && "wander" in level && level.wander > 0 && <>
            <Circle cx={centerX + view.wanderX * maxRadius * 0.72} cy={centerY + view.wanderY * maxRadius * 0.72} r={16} fill="#8b659d" fillOpacity={0.18} stroke="#ba8dcc" strokeOpacity={0.65} strokeWidth={2} />
            <Circle cx={centerX + view.wanderX * maxRadius * 0.72} cy={centerY + view.wanderY * maxRadius * 0.72} r={4} fill="#d6a9e3" />
          </>}
          <Circle cx={ball.x} cy={ball.y} r={12} fill="#f0c779" stroke="#fff0bf" strokeWidth={3} />
          {level.family === "twin" && <Circle cx={twinBall.x} cy={twinBall.y} r={12} fill="#d47773" stroke="#ffd1c9" strokeWidth={3} />}
          {level.family === "echo" && <Circle cx={echoBall.x} cy={echoBall.y} r={10} fill="#73aeb2" fillOpacity={0.42} stroke="#bce8e7" strokeOpacity={0.72} strokeWidth={2} />}
        </Svg>

        <View style={styles.titleHud}><Text style={styles.kicker}>{level.name.toUpperCase()} / {level.family === "corner" ? "SWIPE" : tiltEnabled ? "TILT" : "TOUCH"}</Text><Text style={styles.title}>Driftline</Text></View>
        <View style={styles.scoreHud}><Text style={styles.scoreLabel}>CLEARED</Text><Text style={styles.scoreValue}>{view.score}</Text><Text style={styles.best}>BEST {best}{view.shields > 0 ? " / SHIELD" : ""}</Text>{level.family === "echo" && <Text style={styles.echoTime}>ECHO {(view.echoDelay / 1000).toFixed(1)}s</Text>}{level.family === "corner" && <Text style={styles.echoTime}>{view.blinkCooldown === 0 ? "BLINK READY" : `BLINK IN ${view.blinkCooldown}`}</Text>}</View>
        {tiltEnabled && level.family !== "corner" && <View style={styles.tiltHint}><Text style={styles.tiltHintText}>TILT CONTROL / RECALIBRATE IN MENU</Text></View>}
        {view.reversed && <View pointerEvents="none" style={styles.reverseBanner}><Text style={styles.reverseTitle}>REVERSED</Text><Text style={styles.reverseCopy}>LEFT IS RIGHT / RIGHT IS LEFT</Text></View>}
        {view.repulsed && <View pointerEvents="none" style={styles.reverseBanner}><Text style={styles.reverseTitle}>REPULSION</Text><Text style={styles.reverseCopy}>YOUR TOUCH NOW PUSHES AWAY</Text></View>}

        {status !== "playing" && status !== "paused" && !panel && (
          <View style={styles.overlay}>
            <Text style={styles.overlayTitle}>{status === "over" ? "Lost the line." : level.name}</Text>
            <Pressable onPress={start}><Text style={styles.overlayButton}>{status === "over" ? `CLEARED ${view.score} / TRY AGAIN` : "TAP TO BEGIN"}</Text></Pressable>
            <View style={styles.overlayLinks}>
              <Pressable onPress={() => openPanel("levels")}><Text style={styles.overlayLink}>LEVELS</Text></Pressable>
              <Pressable onPress={() => openPanel("upgrades")}><Text style={styles.overlayLink}>UPGRADES</Text></Pressable>
              <Pressable onPress={() => openPanel("achievements")}><Text style={styles.overlayLink}>AWARDS</Text></Pressable>
            </View>
          </View>
        )}

        {level.family === "orbit" ? <View style={styles.controls}>
            <Pressable style={({ pressed }) => [styles.control, pressed && styles.controlDown]} onPressIn={() => control(-1)} onPressOut={releaseControl}><Text style={styles.arrow}>{"<"}</Text><Text style={styles.controlText}>HOLD LEFT</Text></Pressable>
            <Pressable style={({ pressed }) => [styles.control, pressed && styles.controlDown]} onPressIn={() => control(1)} onPressOut={releaseControl}><Text style={styles.controlText}>HOLD RIGHT</Text><Text style={styles.arrow}>{">"}</Text></Pressable>
          </View> : status === "playing" && !panel && <View style={styles.dragSurface} {...dragResponder.panHandlers}>
            <View pointerEvents="none" style={styles.dragHint}><Text style={[styles.dragHintText, (view.reversed || view.repulsed) && styles.dragHintReversed]}>{level.family === "twin" ? (view.reversed ? "DIRECTION FLIPPED" : "DRAG SIDEWAYS / MOVE BOTH") : level.family === "echo" ? "DRAG / YOUR ECHO FOLLOWS LATER" : level.family === "gravity" ? (view.repulsed ? "TOUCH PUSHES / RELEASE TO COAST" : "HOLD TO PULL / RELEASE TO COAST") : level.family === "corner" ? "← → TURN / ↑ JUMP / ↓ BLINK" : "DRAG ANYWHERE TO STEER"}</Text></View>
          </View>}

        {panel && (
          <View style={styles.panel}>
            <View style={styles.panelTop}>
              <View><Text style={styles.panelKicker}>DRIFTLINE GARAGE</Text><Text style={styles.panelTitle}>{panel === "achievements" ? "Awards" : panel[0].toUpperCase() + panel.slice(1)}</Text></View>
              <Pressable onPress={closePanel} style={styles.close}><Text style={styles.closeText}>CLOSE</Text></Pressable>
            </View>
            <View style={styles.tabs}>
              {(["levels", "upgrades", "achievements"] as const).map((tab) => <Pressable key={tab} onPress={() => setPanel(tab)} style={[styles.tab, panel === tab && styles.tabActive]}><Text style={[styles.tabText, panel === tab && styles.tabTextActive]}>{tab === "achievements" ? "AWARDS" : tab.toUpperCase()}</Text></Pressable>)}
            </View>
            <ScrollView contentContainerStyle={styles.panelScroll} showsVerticalScrollIndicator={false}>
              {panel === "levels" && <>
                <View style={styles.settingRow}>
                  <View><Text style={styles.itemName}>Motion control</Text><Text style={styles.itemCopy}>Calibrates when switched on.</Text></View>
                  <Pressable disabled={!sensorAvailable || level.family === "corner"} onPress={toggleTilt} style={[styles.toggle, tiltEnabled && level.family !== "corner" && styles.toggleOn]}><Text style={[styles.toggleText, tiltEnabled && level.family !== "corner" && styles.toggleTextOn]}>{level.family === "corner" ? "SWIPE ONLY" : sensorAvailable ? (tiltEnabled ? "TILT ON" : "TOUCH") : "NO SENSOR"}</Text></Pressable>
                </View>
                {LEVEL_GROUPS.map((group) => {
                  const expanded = openGroup === group.id;
                  const courses = LEVELS.filter((item) => item.family === group.id);
                  const selectedHere = courses.some((item) => item.id === levelId);
                  return <View key={group.id} style={styles.levelGroup}>
                    <Pressable onPress={() => setOpenGroup(expanded ? null : group.id)} style={[styles.groupHead, selectedHere && styles.groupSelected]}>
                      <View style={styles.groupIcon}><Text style={styles.groupIconText}>{group.id === "orbit" ? "○" : group.id === "square" ? "□" : group.id === "twin" ? "◎" : group.id === "echo" ? "◌" : group.id === "gravity" ? "●" : "⌑"}</Text></View>
                      <View style={styles.groupCopy}><Text style={styles.itemName}>{group.name}</Text><Text style={styles.itemCopy}>{group.copy}</Text></View>
                      <Text style={styles.groupChevron}>{expanded ? "−" : "+"}</Text>
                    </Pressable>
                    {expanded && <View style={styles.groupCourses}>{courses.map((item) => {
                      const locked = best < item.unlock;
                      return <Pressable key={item.id} disabled={locked} onPress={() => chooseLevel(item)} style={[styles.itemCard, levelId === item.id && styles.itemSelected, locked && styles.itemLocked]}>
                        <View style={styles.itemHead}><Text style={styles.itemName}>{item.name}</Text><Text style={styles.itemState}>{locked ? `BEST ${item.unlock} TO UNLOCK` : levelId === item.id ? "SELECTED" : "CHOOSE"}</Text></View>
                        <View style={styles.stats}><Text style={styles.stat}>PACE {item.pace}</Text><Text style={styles.stat}>GAPS {item.gaps}</Text><Text style={styles.stat}>SPIN {item.spin}</Text></View>
                        {"reverseEvery" in item && <Text style={styles.modifierNote}>MODIFIER / REVERSE EVERY {item.reverseEvery} CLEARS</Text>}
                        {"echoDelay" in item && <Text style={styles.modifierNote}>ECHO / {(item.echoDelay / 1000).toFixed(1)}s {item.delayDecay > 0 ? "/ DECAYS EACH CLEAR" : "/ TRACKS ONE GATE"}</Text>}
                        {"pull" in item && <Text style={styles.modifierNote}>GRAVITY / {item.wander > 0 ? "SECOND WELL" : "YOUR WELL ONLY"}{item.repulseEvery > 0 ? ` / REPULSES EVERY ${item.repulseEvery}` : ""}</Text>}
                        {"laneShift" in item && <Text style={styles.modifierNote}>SWIPES / UP TO {item.laneShift} TURN{item.laneShift > 1 ? "S" : ""} / GOLD MARKS A JUMP</Text>}
                      </Pressable>;
                    })}</View>}
                  </View>;
                })}
              </>}

              {panel === "upgrades" && <>
                <Text style={styles.balance}>◆ {progress.shards} SHARDS AVAILABLE</Text>
                {UPGRADES.map((upgrade) => {
                  const rank = progress.upgrades[upgrade.key];
                  const cost = upgrade.costs[rank];
                  const affordable = rank < 3 && progress.shards >= cost;
                  return <View key={upgrade.key} style={styles.itemCard}>
                    <View style={styles.itemHead}><Text style={styles.itemName}>{upgrade.name}</Text><Text style={styles.rank}>RANK {rank}/3</Text></View>
                    <Text style={styles.itemCopy}>{upgrade.copy}</Text>
                    <Pressable disabled={!affordable} onPress={() => buyUpgrade(upgrade)} style={[styles.buy, !affordable && styles.buyDisabled]}><Text style={styles.buyText}>{rank === 3 ? "MAXED" : `BUY / ◆ ${cost}`}</Text></Pressable>
                  </View>;
                })}
              </>}

              {panel === "achievements" && <>
                <Text style={styles.balance}>{progress.awards.length}/{ACHIEVEMENTS.length} AWARDS / {progress.totalClears} LIFETIME CLEARS</Text>
                {ACHIEVEMENTS.map((achievement) => {
                  const earned = progress.awards.includes(achievement.id);
                  return <View key={achievement.id} style={[styles.award, earned && styles.awardEarned]}>
                    <Text style={styles.awardMark}>{earned ? "◆" : "◇"}</Text>
                    <View style={styles.awardCopy}><Text style={styles.itemName}>{achievement.name}</Text><Text style={styles.itemCopy}>{achievement.copy}</Text></View>
                    <Text style={styles.reward}>{earned ? "EARNED" : `◆ ${achievement.reward}`}</Text>
                  </View>;
                })}
              </>}
            </ScrollView>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, alignItems: "center", backgroundColor: "#101714" },
  header: { width: "100%", height: 54, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#29362f" },
  back: { color: "#909a92", fontSize: 9, fontWeight: "800", letterSpacing: 0.7 },
  logo: { color: "#f0eadb", fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  wallet: { color: "#e6b969", fontSize: 9, fontWeight: "900" },
  menuButton: { paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: "#3c4b43", borderRadius: 16 },
  menuText: { color: "#a9b1aa", fontSize: 8, fontWeight: "900", letterSpacing: 0.6 },
  game: { position: "relative", overflow: "hidden", borderWidth: 1, borderColor: "#324039", borderRadius: 18, backgroundColor: "#0d1714" },
  titleHud: { position: "absolute", top: 18, left: 17 },
  kicker: { color: "#d4774c", fontSize: 7, fontWeight: "900", letterSpacing: 1.1 },
  title: { marginTop: 3, color: "#f0eadb", fontFamily: "serif", fontSize: 31, letterSpacing: -1.5 },
  scoreHud: { position: "absolute", top: 17, right: 17, alignItems: "flex-end" },
  scoreLabel: { color: "#718077", fontSize: 7, fontWeight: "800", letterSpacing: 1 },
  scoreValue: { color: "#f0eadb", fontFamily: "serif", fontSize: 27 },
  best: { color: "#718077", fontSize: 7, fontWeight: "700", letterSpacing: 0.7 },
  echoTime: { marginTop: 3, color: "#79b7ba", fontSize: 7, fontWeight: "900", letterSpacing: 0.7 },
  tiltHint: { position: "absolute", left: 0, right: 0, bottom: 80, alignItems: "center" },
  tiltHintText: { color: "#769080", fontSize: 7, fontWeight: "800", letterSpacing: 0.8 },
  reverseBanner: { position: "absolute", zIndex: 2, top: 82, left: 0, right: 0, alignItems: "center" },
  reverseTitle: { paddingHorizontal: 15, paddingVertical: 7, color: "#fff1dc", fontSize: 11, fontWeight: "900", letterSpacing: 2, borderWidth: 1, borderColor: "#e06455", borderRadius: 18, overflow: "hidden", backgroundColor: "rgba(150,48,42,.86)" },
  reverseCopy: { marginTop: 6, color: "#e99482", fontSize: 7, fontWeight: "900", letterSpacing: 0.9 },
  overlay: { position: "absolute", inset: 0, zIndex: 2, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(9,16,13,.5)" },
  overlayTitle: { color: "#f0eadb", fontFamily: "serif", fontSize: 31, letterSpacing: -1 },
  overlayButton: { marginTop: 12, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: "#77837b", borderRadius: 20, overflow: "hidden", backgroundColor: "rgba(16,23,20,.9)", color: "#f0eadb", fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  overlayLinks: { marginTop: 20, flexDirection: "row", gap: 22 },
  overlayLink: { color: "#b5beb6", fontSize: 8, fontWeight: "900", letterSpacing: 0.9 },
  controls: { position: "absolute", zIndex: 1, left: 10, right: 10, bottom: 10, flexDirection: "row", gap: 8 },
  control: { flex: 1, height: 58, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, borderWidth: 1, borderColor: "#425149", borderRadius: 12, backgroundColor: "rgba(16,23,20,.86)" },
  controlDown: { backgroundColor: "rgba(176,91,64,.52)", transform: [{ scale: 0.985 }] },
  arrow: { color: "#f0eadb", fontSize: 20 },
  controlText: { color: "#a9b1aa", fontSize: 8, fontWeight: "800", letterSpacing: 0.8 },
  dragSurface: { position: "absolute", inset: 0, zIndex: 1 },
  dragHint: { position: "absolute", left: 0, right: 0, bottom: 18, alignItems: "center" },
  dragHintText: { paddingHorizontal: 13, paddingVertical: 8, color: "#9aa9a0", fontSize: 8, fontWeight: "900", letterSpacing: 0.9, borderWidth: 1, borderColor: "#3c4b43", borderRadius: 18, overflow: "hidden", backgroundColor: "rgba(16,23,20,.78)" },
  dragHintReversed: { color: "#ffe1d0", borderColor: "#c95d4e", backgroundColor: "rgba(117,39,34,.86)" },
  panel: { position: "absolute", inset: 0, zIndex: 5, paddingTop: 22, backgroundColor: "#111a16" },
  panelTop: { paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  panelKicker: { color: "#d4774c", fontSize: 8, fontWeight: "900", letterSpacing: 1.1 },
  panelTitle: { marginTop: 3, color: "#f0eadb", fontFamily: "serif", fontSize: 35, letterSpacing: -1.2 },
  close: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "#3c4b43", borderRadius: 18 },
  closeText: { color: "#a9b1aa", fontSize: 8, fontWeight: "900", letterSpacing: 0.7 },
  tabs: { marginTop: 18, paddingHorizontal: 14, flexDirection: "row", gap: 6 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#354139" },
  tabActive: { borderBottomColor: "#d4774c" },
  tabText: { color: "#68756d", fontSize: 8, fontWeight: "900", letterSpacing: 0.7 },
  tabTextActive: { color: "#e8c5ab" },
  panelScroll: { padding: 14, paddingBottom: 35, gap: 10 },
  settingRow: { padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#2f3b34", borderRadius: 14, backgroundColor: "#17211d" },
  toggle: { paddingHorizontal: 13, paddingVertical: 9, borderWidth: 1, borderColor: "#45534b", borderRadius: 18 },
  toggleOn: { borderColor: "#d4774c", backgroundColor: "rgba(212,119,76,.13)" },
  toggleText: { color: "#a8b0aa", fontSize: 8, fontWeight: "900", letterSpacing: 0.6 },
  toggleTextOn: { color: "#efad82" },
  itemCard: { padding: 16, borderWidth: 1, borderColor: "#2f3b34", borderRadius: 14, backgroundColor: "#17211d" },
  levelGroup: { borderWidth: 1, borderColor: "#2f3b34", borderRadius: 15, overflow: "hidden", backgroundColor: "#131d18" },
  groupHead: { minHeight: 78, padding: 13, flexDirection: "row", alignItems: "center", gap: 12 },
  groupSelected: { backgroundColor: "#19231e" },
  groupIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#59675f", borderRadius: 10 },
  groupIconText: { color: "#e8c5ab", fontSize: 25 },
  groupCopy: { flex: 1 },
  groupChevron: { color: "#a9b1aa", fontSize: 22 },
  groupCourses: { padding: 8, paddingTop: 0, gap: 7 },
  itemSelected: { borderColor: "#b56d4d", backgroundColor: "#1d241e" },
  itemLocked: { opacity: 0.43 },
  itemHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  itemName: { color: "#f0eadb", fontFamily: "serif", fontSize: 19 },
  itemCopy: { marginTop: 4, color: "#89958d", fontSize: 10, lineHeight: 15 },
  itemState: { color: "#cf865f", fontSize: 7, fontWeight: "900", letterSpacing: 0.7 },
  stats: { marginTop: 14, flexDirection: "row", gap: 7 },
  stat: { flex: 1, paddingVertical: 7, textAlign: "center", color: "#849087", fontSize: 7, fontWeight: "800", borderRadius: 8, overflow: "hidden", backgroundColor: "#101713" },
  modifierNote: { marginTop: 9, color: "#d9816b", fontSize: 7, fontWeight: "900", letterSpacing: 0.7 },
  balance: { marginBottom: 3, color: "#e6b969", fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
  rank: { color: "#8a968d", fontSize: 8, fontWeight: "800" },
  buy: { marginTop: 13, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: "#e9dfca" },
  buyDisabled: { opacity: 0.25 },
  buyText: { color: "#152019", fontSize: 8, fontWeight: "900", letterSpacing: 0.6 },
  award: { padding: 14, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "#2d3932", borderRadius: 13, opacity: 0.48 },
  awardEarned: { opacity: 1, borderColor: "#6e664a", backgroundColor: "#1d2119" },
  awardMark: { color: "#e6b969", fontSize: 22 },
  awardCopy: { flex: 1 },
  reward: { color: "#d7ad66", fontSize: 7, fontWeight: "900", letterSpacing: 0.5 },
});
