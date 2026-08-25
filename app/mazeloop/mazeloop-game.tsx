"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./mazeloop.module.css";

type Point = { x: number; y: number };
type Cell = { walls: [boolean, boolean, boolean, boolean] };
type Gate = { a: Point; b: Point };
type Maze = { size: number; cells: Cell[]; key: Point; exit: Point; par: number; pads: [Point, Point] | null; gate: Gate | null; switch: Point | null; sentinels: Point[][] };

const SAVE_KEY = "mazeloop-unlocked";
const directions = [
  { dx: 0, dy: -1, wall: 0, opposite: 2 },
  { dx: 1, dy: 0, wall: 1, opposite: 3 },
  { dx: 0, dy: 1, wall: 2, opposite: 0 },
  { dx: -1, dy: 0, wall: 3, opposite: 1 },
] as const;

const indexOf = (x: number, y: number, size: number) => y * size + x;
const samePoint = (a: Point, b: Point) => a.x === b.x && a.y === b.y;

const randomFor = (seed: number) => {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
};

const distancesFrom = (cells: Cell[], size: number, start: Point) => {
  const distances = Array(size * size).fill(-1) as number[];
  const queue = [start];
  distances[indexOf(start.x, start.y, size)] = 0;
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const current = queue[cursor];
    const cell = cells[indexOf(current.x, current.y, size)];
    directions.forEach((direction) => {
      const nx = current.x + direction.dx;
      const ny = current.y + direction.dy;
      const nextIndex = indexOf(nx, ny, size);
      if (!cell.walls[direction.wall] && distances[nextIndex] < 0) {
        distances[nextIndex] = distances[indexOf(current.x, current.y, size)] + 1;
        queue.push({ x: nx, y: ny });
      }
    });
  }
  return distances;
};

const addCircuit = (maze: Maze, level: number): Maze => {
  if (level < 7) return maze;
  const regionStart = maze.pads?.[1] ?? { x: 0, y: 0 };
  const startIndex = indexOf(regionStart.x, regionStart.y, maze.size);
  const keyIndex = indexOf(maze.key.x, maze.key.y, maze.size);
  const parents = Array(maze.size * maze.size).fill(-1) as number[];
  const queue = [regionStart];
  parents[startIndex] = startIndex;
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const current = queue[cursor];
    const cell = maze.cells[indexOf(current.x, current.y, maze.size)];
    directions.forEach((direction) => {
      const nx = current.x + direction.dx;
      const ny = current.y + direction.dy;
      const nextIndex = indexOf(nx, ny, maze.size);
      if (!cell.walls[direction.wall] && parents[nextIndex] < 0) {
        parents[nextIndex] = indexOf(current.x, current.y, maze.size);
        queue.push({ x: nx, y: ny });
      }
    });
  }
  if (parents[keyIndex] < 0) return maze;
  const path: Gate[] = [];
  let cursor = keyIndex;
  while (cursor !== startIndex) {
    const parent = parents[cursor];
    path.push({ a: { x: parent % maze.size, y: Math.floor(parent / maze.size) }, b: { x: cursor % maze.size, y: Math.floor(cursor / maze.size) } });
    cursor = parent;
  }
  path.reverse();
  if (path.length < 4) return maze;
  const gate = path[Math.min(path.length - 2, Math.max(1, Math.floor(path.length * 0.58)))];
  const dx = gate.b.x - gate.a.x;
  const dy = gate.b.y - gate.a.y;
  const direction = directions.find((item) => item.dx === dx && item.dy === dy)!;
  maze.cells[indexOf(gate.a.x, gate.a.y, maze.size)].walls[direction.wall] = true;
  maze.cells[indexOf(gate.b.x, gate.b.y, maze.size)].walls[direction.opposite] = true;
  const reachable = distancesFrom(maze.cells, maze.size, regionStart);
  let switchIndex = startIndex;
  reachable.forEach((distance, index) => {
    if (distance > reachable[switchIndex] && index !== indexOf(gate.a.x, gate.a.y, maze.size)) switchIndex = index;
  });
  maze.cells[indexOf(gate.a.x, gate.a.y, maze.size)].walls[direction.wall] = false;
  maze.cells[indexOf(gate.b.x, gate.b.y, maze.size)].walls[direction.opposite] = false;
  const switchPoint = { x: switchIndex % maze.size, y: Math.floor(switchIndex / maze.size) };
  const fromStart = distancesFrom(maze.cells, maze.size, { x: 0, y: 0 });
  const fromPadA = maze.pads ? distancesFrom(maze.cells, maze.size, maze.pads[0]) : fromStart;
  const fromPadB = maze.pads ? distancesFrom(maze.cells, maze.size, maze.pads[1]) : fromStart;
  const fromSwitch = distancesFrom(maze.cells, maze.size, switchPoint);
  const fromKey = distancesFrom(maze.cells, maze.size, maze.key);
  const par = maze.pads
    ? fromStart[indexOf(maze.pads[0].x, maze.pads[0].y, maze.size)]
      + fromPadB[switchIndex]
      + fromSwitch[keyIndex]
      + fromKey[indexOf(maze.pads[1].x, maze.pads[1].y, maze.size)]
      + fromPadA[indexOf(maze.exit.x, maze.exit.y, maze.size)]
    : fromStart[switchIndex] + fromSwitch[keyIndex] + fromKey[indexOf(maze.exit.x, maze.exit.y, maze.size)];
  return { ...maze, gate, switch: switchPoint, par };
};

const patrolFrom = (maze: Maze, seed: Point) => {
  const distances = distancesFrom(maze.cells, maze.size, seed);
  const farthestIndex = distances.reduce((best, distance, index) => distance > distances[best] ? index : best, indexOf(seed.x, seed.y, maze.size));
  const path: Point[] = [{ x: farthestIndex % maze.size, y: Math.floor(farthestIndex / maze.size) }];
  let currentIndex = farthestIndex;
  while (distances[currentIndex] > 0) {
    const current = { x: currentIndex % maze.size, y: Math.floor(currentIndex / maze.size) };
    const cell = maze.cells[currentIndex];
    const previous = directions.find((direction) => {
      const nx = current.x + direction.dx;
      const ny = current.y + direction.dy;
      return !cell.walls[direction.wall] && distances[indexOf(nx, ny, maze.size)] === distances[currentIndex] - 1;
    });
    if (!previous) break;
    currentIndex = indexOf(current.x + previous.dx, current.y + previous.dy, maze.size);
    path.push({ x: currentIndex % maze.size, y: Math.floor(currentIndex / maze.size) });
  }
  path.reverse();
  return path.length >= 4 ? [...path, path.at(-1)!, ...path.slice(1, -1).reverse(), path[0]] : [];
};

const addSentinels = (maze: Maze, level: number): Maze => {
  if (level < 10) return maze;
  const routes: Point[][] = [];
  const firstRoute = patrolFrom(maze, maze.pads?.[0] ?? { x: 0, y: 0 });
  if (firstRoute.length) routes.push(firstRoute);
  if (level >= 17 && maze.pads) {
    const secondRoute = patrolFrom(maze, maze.pads[1]);
    if (secondRoute.length) routes.push(secondRoute);
  }
  return { ...maze, sentinels: routes };
};

const finishMaze = (maze: Maze, level: number) => addSentinels(addCircuit(maze, level), level);

const createMaze = (level: number): Maze => {
  const size = level < 5 ? 6 : level < 9 ? 7 : level < 13 ? 8 : level < 19 ? 9 : 10;
  const random = randomFor(level * 7919 + 41);
  const cells = Array.from({ length: size * size }, () => ({ walls: [true, true, true, true] as [boolean, boolean, boolean, boolean] }));
  const visited = new Set<number>([0]);
  const stack: Point[] = [{ x: 0, y: 0 }];
  while (stack.length) {
    const current = stack.at(-1)!;
    const choices = directions
      .map((direction) => ({ ...direction, x: current.x + direction.dx, y: current.y + direction.dy }))
      .filter((choice) => choice.x >= 0 && choice.y >= 0 && choice.x < size && choice.y < size && !visited.has(indexOf(choice.x, choice.y, size)))
      .sort(() => random() - 0.5);
    const next = choices[0];
    if (!next) {
      stack.pop();
      continue;
    }
    cells[indexOf(current.x, current.y, size)].walls[next.wall] = false;
    cells[indexOf(next.x, next.y, size)].walls[next.opposite] = false;
    visited.add(indexOf(next.x, next.y, size));
    stack.push({ x: next.x, y: next.y });
  }

  if (level >= 5) {
    const edges: { a: Point; b: Point; wall: number; opposite: number }[] = [];
    for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) {
      const cell = cells[indexOf(x, y, size)];
      if (x + 1 < size && !cell.walls[1]) edges.push({ a: { x, y }, b: { x: x + 1, y }, wall: 1, opposite: 3 });
      if (y + 1 < size && !cell.walls[2]) edges.push({ a: { x, y }, b: { x, y: y + 1 }, wall: 2, opposite: 0 });
    }
    edges.sort(() => random() - 0.5);
    for (const edge of edges) {
      cells[indexOf(edge.a.x, edge.a.y, size)].walls[edge.wall] = true;
      cells[indexOf(edge.b.x, edge.b.y, size)].walls[edge.opposite] = true;
      const startDistances = distancesFrom(cells, size, { x: 0, y: 0 });
      const reachable = startDistances.filter((distance) => distance >= 0).length;
      const remote = size * size - reachable;
      if (remote >= size * size * 0.22 && remote <= size * size * 0.55) {
        const aReachable = startDistances[indexOf(edge.a.x, edge.a.y, size)] >= 0;
        const padA = aReachable ? edge.a : edge.b;
        const padB = aReachable ? edge.b : edge.a;
        const fromPadA = distancesFrom(cells, size, padA);
        const fromPadB = distancesFrom(cells, size, padB);
        const exitIndex = fromPadA.reduce((best, distance, index) => distance > fromPadA[best] ? index : best, indexOf(0, 0, size));
        const keyIndex = fromPadB.reduce((best, distance, index) => distance > fromPadB[best] ? index : best, indexOf(padB.x, padB.y, size));
        const exit = { x: exitIndex % size, y: Math.floor(exitIndex / size) };
        const key = { x: keyIndex % size, y: Math.floor(keyIndex / size) };
        const par = startDistances[indexOf(padA.x, padA.y, size)] + fromPadB[keyIndex] * 2 + fromPadA[exitIndex];
        return finishMaze({ size, cells, key, exit, par, pads: [padA, padB], gate: null, switch: null, sentinels: [] }, level);
      }
      cells[indexOf(edge.a.x, edge.a.y, size)].walls[edge.wall] = false;
      cells[indexOf(edge.b.x, edge.b.y, size)].walls[edge.opposite] = false;
    }
  }

  const fromStart = distancesFrom(cells, size, { x: 0, y: 0 });
  const exitIndex = fromStart.reduce((best, distance, index) => distance > fromStart[best] ? index : best, 0);
  const exit = { x: exitIndex % size, y: Math.floor(exitIndex / size) };
  const targetDistance = Math.max(3, Math.floor(fromStart[exitIndex] * 0.48));
  const keyIndex = fromStart.reduce((best, distance, index) => Math.abs(distance - targetDistance) < Math.abs(fromStart[best] - targetDistance) && index !== exitIndex ? index : best, 1);
  const key = { x: keyIndex % size, y: Math.floor(keyIndex / size) };
  const fromKey = distancesFrom(cells, size, key);
  return finishMaze({ size, cells, key, exit, par: fromStart[keyIndex] + fromKey[exitIndex], pads: null, gate: null, switch: null, sentinels: [] }, level);
};

export default function MazeloopGame() {
  const boardWrapRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState(0);
  const [level, setLevel] = useState(1);
  const [unlocked, setUnlocked] = useState(1);
  const [player, setPlayer] = useState<Point>({ x: 0, y: 0 });
  const [hasKey, setHasKey] = useState(false);
  const [moves, setMoves] = useState(0);
  const [complete, setComplete] = useState(false);
  const [powerOn, setPowerOn] = useState(false);
  const [sentinelSteps, setSentinelSteps] = useState<number[]>([]);
  const [sentinelsMoveNext, setSentinelsMoveNext] = useState(false);
  const [sentinelAlive, setSentinelAlive] = useState<boolean[]>([]);
  const [sentinelActive, setSentinelActive] = useState<boolean[]>([]);
  const [takedownFlash, setTakedownFlash] = useState(false);
  const [releaseFlash, setReleaseFlash] = useState(false);
  const playerRef = useRef<Point>({ x: 0, y: 0 });
  const hasKeyRef = useRef(false);
  const movesRef = useRef(0);
  const completeRef = useRef(false);
  const powerRef = useRef(false);
  const unlockedRef = useRef(1);
  const sentinelStepsRef = useRef<number[]>([]);
  const sentinelMoveTurnRef = useRef(false);
  const sentinelAliveRef = useRef<boolean[]>([]);
  const sentinelActiveRef = useRef<boolean[]>([]);
  const crashLockRef = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragAnchor = useRef({ x: 0, y: 0 });
  const lastDragMove = useRef(0);
  const maze = useMemo(() => createMaze(level), [level]);
  const tile = boardSize / maze.size;
  const sentinelPositions = maze.sentinels.map((route, index) => route[sentinelSteps[index] ?? 0]);
  const sentinelNext = maze.sentinels.map((route, index) => sentinelsMoveNext ? route[((sentinelSteps[index] ?? 0) + 1) % route.length] : route[sentinelSteps[index] ?? 0]);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const saved = Math.max(1, Number(localStorage.getItem(SAVE_KEY) ?? 1));
      unlockedRef.current = saved;
      setUnlocked(saved);
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    const node = boardWrapRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setBoardSize(Math.round(Math.min(entry.contentRect.width, entry.contentRect.height)));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const steps = maze.sentinels.map((route, index) => Math.min(route.length - 1, Math.floor(route.length * (index + 1) / 3)));
      sentinelStepsRef.current = steps;
      sentinelMoveTurnRef.current = false;
      sentinelAliveRef.current = maze.sentinels.map(() => true);
      sentinelActiveRef.current = maze.sentinels.map(() => !maze.pads);
      setSentinelSteps(steps);
      setSentinelsMoveNext(false);
      setSentinelAlive(maze.sentinels.map(() => true));
      setSentinelActive(maze.sentinels.map(() => !maze.pads));
    }, 0);
    return () => window.clearTimeout(restore);
  }, [maze]);

  const reset = useCallback((nextLevel = level) => {
    const resetSteps = nextLevel === level ? maze.sentinels.map((route, index) => Math.min(route.length - 1, Math.floor(route.length * (index + 1) / 3))) : [];
    setLevel(nextLevel);
    playerRef.current = { x: 0, y: 0 };
    hasKeyRef.current = false;
    movesRef.current = 0;
    completeRef.current = false;
    powerRef.current = false;
    sentinelStepsRef.current = resetSteps;
    sentinelMoveTurnRef.current = false;
    sentinelAliveRef.current = maze.sentinels.map(() => true);
    sentinelActiveRef.current = maze.sentinels.map(() => !maze.pads);
    crashLockRef.current = false;
    setPlayer({ x: 0, y: 0 });
    setHasKey(false);
    setMoves(0);
    setComplete(false);
    setPowerOn(false);
    setSentinelSteps(resetSteps);
    setSentinelsMoveNext(false);
    setSentinelAlive(maze.sentinels.map(() => true));
    setSentinelActive(maze.sentinels.map(() => !maze.pads));
    setTakedownFlash(false);
    setReleaseFlash(false);
  }, [level, maze]);

  const advanceSentinels = useCallback((origin: Point, destination: Point) => {
    if (!maze.sentinels.length) return false;
    const nextAlive = [...sentinelAliveRef.current];
    let takedown = false;
    maze.sentinels.forEach((route, index) => {
      if (!nextAlive[index] || !sentinelActiveRef.current[index]) return;
      const step = sentinelStepsRef.current[index] ?? 0;
      const current = route[step];
      const facing = route[(step + 1) % route.length];
      if (samePoint(destination, current) && !samePoint(origin, facing) && !samePoint(current, facing)) {
        nextAlive[index] = false;
        takedown = true;
      }
    });
    if (takedown) {
      sentinelAliveRef.current = nextAlive;
      setSentinelAlive(nextAlive);
      setTakedownFlash(true);
      setTimeout(() => setTakedownFlash(false), 850);
    }
    const shouldMove = sentinelMoveTurnRef.current;
    sentinelMoveTurnRef.current = !shouldMove;
    setSentinelsMoveNext(!shouldMove);
    const nextSteps = maze.sentinels.map((route, index) => shouldMove && nextAlive[index] && sentinelActiveRef.current[index] ? ((sentinelStepsRef.current[index] ?? 0) + 1) % route.length : (sentinelStepsRef.current[index] ?? 0));
    const collision = maze.sentinels.some((route, index) => {
      if (!nextAlive[index] || !sentinelActiveRef.current[index]) return false;
      const current = route[sentinelStepsRef.current[index] ?? 0];
      const next = route[nextSteps[index]];
      return samePoint(next, destination) || (samePoint(current, destination) && samePoint(next, origin));
    });
    sentinelStepsRef.current = nextSteps;
    setSentinelSteps(nextSteps);
    if (collision) {
      reset(level);
      crashLockRef.current = true;
      setTimeout(() => { crashLockRef.current = false; }, 180);
      return true;
    }
    return false;
  }, [level, maze, reset]);

  const releasePatrol = useCallback((index: number) => {
    if (!maze.sentinels[index] || sentinelActiveRef.current[index] || !sentinelAliveRef.current[index]) return;
    const nextActive = [...sentinelActiveRef.current];
    nextActive[index] = true;
    sentinelActiveRef.current = nextActive;
    setSentinelActive(nextActive);
    setReleaseFlash(true);
    setTimeout(() => setReleaseFlash(false), 950);
  }, [maze.sentinels]);

  const move = useCallback((dx: number, dy: number) => {
    if (completeRef.current || crashLockRef.current) return;
    const directionIndex = directions.findIndex((direction) => direction.dx === dx && direction.dy === dy);
    const currentPlayer = playerRef.current;
    const cell = maze.cells[indexOf(currentPlayer.x, currentPlayer.y, maze.size)];
    if (cell.walls[directionIndex]) {
      advanceSentinels(currentPlayer, currentPlayer);
      return;
    }
    const stepped = { x: currentPlayer.x + dx, y: currentPlayer.y + dy };
    const crossesGate = maze.gate && ((samePoint(currentPlayer, maze.gate.a) && samePoint(stepped, maze.gate.b)) || (samePoint(currentPlayer, maze.gate.b) && samePoint(stepped, maze.gate.a)));
    if (crossesGate && !powerRef.current) {
      advanceSentinels(currentPlayer, currentPlayer);
      return;
    }
    let next = stepped;
    let blinked = false;
    if (maze.pads && samePoint(stepped, maze.pads[0])) {
      next = maze.pads[1];
      blinked = true;
    } else if (maze.pads && samePoint(stepped, maze.pads[1])) {
      next = maze.pads[0];
      blinked = true;
    }
    if (advanceSentinels(currentPlayer, next)) return;
    const collected = hasKeyRef.current || samePoint(next, maze.key);
    const powered = powerRef.current || Boolean(maze.switch && samePoint(next, maze.switch));
    const switchedOn = powered && !powerRef.current;
    const nextMoves = movesRef.current + 1;
    playerRef.current = next;
    hasKeyRef.current = collected;
    powerRef.current = powered;
    movesRef.current = nextMoves;
    setPlayer(next);
    setHasKey(collected);
    setPowerOn(powered);
    setMoves(nextMoves);
    if (blinked) releasePatrol(0);
    if (switchedOn && maze.sentinels.length > 1) releasePatrol(1);
    if (collected && samePoint(next, maze.exit)) {
      const nextUnlocked = Math.max(unlockedRef.current, Math.min(24, level + 1));
      unlockedRef.current = nextUnlocked;
      completeRef.current = true;
      setUnlocked(nextUnlocked);
      localStorage.setItem(SAVE_KEY, String(nextUnlocked));
      setComplete(true);
    }
  }, [advanceSentinels, level, maze, releasePatrol]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (completeRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { x: event.clientX, y: event.clientY };
    dragAnchor.current = { x: 0, y: 0 };
    lastDragMove.current = 0;
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (completeRef.current) return;
    const now = Date.now();
    if (now - lastDragMove.current < 115) return;
    const threshold = Math.max(38, tile * 0.82);
    const gestureX = event.clientX - dragStart.current.x;
    const gestureY = event.clientY - dragStart.current.y;
    const deltaX = gestureX - dragAnchor.current.x;
    const deltaY = gestureY - dragAnchor.current.y;
    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < threshold) return;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      move(deltaX > 0 ? 1 : -1, 0);
    } else {
      move(0, deltaY > 0 ? 1 : -1);
    }
    dragAnchor.current = { x: gestureX, y: gestureY };
    lastDragMove.current = now;
  }, [move, tile]);

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [-1, 0], KeyA: [-1, 0],
        ArrowRight: [1, 0], KeyD: [1, 0],
        ArrowUp: [0, -1], KeyW: [0, -1],
        ArrowDown: [0, 1], KeyS: [0, 1],
      };
      const direction = moves[event.code];
      if (!direction) return;
      event.preventDefault();
      move(direction[0], direction[1]);
    };
    window.addEventListener("keydown", keyDown);
    return () => window.removeEventListener("keydown", keyDown);
  }, [move]);

  return (
    <section className={styles.gameShell}>
      <div className={styles.titleRow}>
        <div>
          <p className={styles.eyebrow}>Level {level} of 24 · {maze.sentinels.length ? "Patrol Maze" : maze.gate ? "Circuit Maze" : maze.pads ? "Blink Maze" : "Maze"}</p>
          <h1>Mazeloop</h1>
        </div>
        <p>Find the key, reach the exit. Later mazes add blink pads, power switches, and patrols that walk the halls with you.</p>
      </div>

      <div className={styles.scoreboard} aria-live="polite">
        <div><span>Moves</span><strong>{moves}</strong></div>
        <div><span>Par</span><strong>{maze.par}</strong></div>
        <div><span>Unlocked</span><strong>{unlocked}/24</strong></div>
      </div>

      <div className={styles.gameFrame}>
        <div className={styles.boardWrap} ref={boardWrapRef}>
          {boardSize > 0 && (
            <div
              className={styles.board}
              style={{ width: boardSize, height: boardSize }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
            >
              <svg width={boardSize} height={boardSize}>
                <rect width={boardSize} height={boardSize} fill="#121d18" />
                <rect x={maze.exit.x * tile + tile * 0.19} y={maze.exit.y * tile + tile * 0.19} width={tile * 0.62} height={tile * 0.62} rx={tile * 0.12} fill={hasKey ? "#5f9f78" : "#38473e"} stroke={hasKey ? "#a3dab0" : "#68756d"} strokeWidth={2} />
                {!hasKey && <rect x={maze.key.x * tile + tile * 0.34} y={maze.key.y * tile + tile * 0.34} width={tile * 0.32} height={tile * 0.32} fill="#e2b767" transform={`rotate(45 ${maze.key.x * tile + tile / 2} ${maze.key.y * tile + tile / 2})`} />}
                {maze.pads?.map((pad, index) => (
                  <g key={`pad-${index}`}>
                    <circle cx={pad.x * tile + tile / 2} cy={pad.y * tile + tile / 2} r={tile * 0.3} fill={index === 0 ? "#397c83" : "#765b91"} fillOpacity={0.28} stroke={index === 0 ? "#78c7ca" : "#bb91d2"} strokeWidth={2} />
                    <circle cx={pad.x * tile + tile / 2} cy={pad.y * tile + tile / 2} r={tile * 0.12} fill={index === 0 ? "#91e0df" : "#d2a9e4"} />
                  </g>
                ))}
                {maze.switch && (
                  <g>
                    <rect x={maze.switch.x * tile + tile * 0.24} y={maze.switch.y * tile + tile * 0.24} width={tile * 0.52} height={tile * 0.52} rx={tile * 0.12} fill={powerOn ? "#4f9369" : "#a8743f"} fillOpacity={0.42} stroke={powerOn ? "#9bdaa9" : "#efb45f"} strokeWidth={2} />
                    <circle cx={maze.switch.x * tile + tile / 2} cy={maze.switch.y * tile + tile / 2} r={tile * 0.09} fill={powerOn ? "#b9efbf" : "#ffd17b"} />
                  </g>
                )}
                {maze.gate && (() => {
                  const vertical = maze.gate.a.x !== maze.gate.b.x;
                  const boundaryX = Math.max(maze.gate.a.x, maze.gate.b.x) * tile;
                  const boundaryY = Math.max(maze.gate.a.y, maze.gate.b.y) * tile;
                  return vertical
                    ? <line x1={boundaryX} y1={maze.gate.a.y * tile + tile * 0.16} x2={boundaryX} y2={maze.gate.a.y * tile + tile * 0.84} stroke={powerOn ? "#597068" : "#75dce0"} strokeOpacity={powerOn ? 0.35 : 1} strokeWidth={powerOn ? 2 : 5} strokeDasharray={powerOn ? undefined : "5 3"} />
                    : <line x1={maze.gate.a.x * tile + tile * 0.16} y1={boundaryY} x2={maze.gate.a.x * tile + tile * 0.84} y2={boundaryY} stroke={powerOn ? "#597068" : "#75dce0"} strokeOpacity={powerOn ? 0.35 : 1} strokeWidth={powerOn ? 2 : 5} strokeDasharray={powerOn ? undefined : "5 3"} />;
                })()}
                {sentinelNext.map((sentinel, index) => sentinelAlive[index] && sentinelActive[index] && <circle key={`next-${index}`} cx={sentinel.x * tile + tile / 2} cy={sentinel.y * tile + tile / 2} r={tile * 0.25} fill="#bd4e48" fillOpacity={0.12} stroke="#dc655b" strokeOpacity={0.62} strokeWidth={1.5} />)}
                {sentinelPositions.map((sentinel, index) => sentinelAlive[index] && (
                  <g key={`sentinel-${index}`}>
                    {!sentinelActive[index] && <circle cx={sentinel.x * tile + tile / 2} cy={sentinel.y * tile + tile / 2} r={tile * 0.3} fill="#465049" fillOpacity={0.3} stroke="#89938c" strokeWidth={2} strokeDasharray="4 3" />}
                    <circle cx={sentinel.x * tile + tile / 2} cy={sentinel.y * tile + tile / 2} r={tile * 0.2} fill={sentinelActive[index] ? "#a83f3b" : "#555e58"} stroke={sentinelActive[index] ? "#ff9a82" : "#a8b0aa"} strokeWidth={2.5} />
                    <circle cx={sentinel.x * tile + tile / 2} cy={sentinel.y * tile + tile / 2} r={tile * 0.06} fill={sentinelActive[index] ? "#ffe0c7" : "#d0d5d0"} />
                  </g>
                ))}
                {maze.cells.map((cell, index) => {
                  const x = (index % maze.size) * tile;
                  const y = Math.floor(index / maze.size) * tile;
                  return (
                    <g key={index}>
                      {cell.walls[0] && <line x1={x} y1={y} x2={x + tile} y2={y} stroke="#607067" strokeWidth={2.2} />}
                      {cell.walls[1] && <line x1={x + tile} y1={y} x2={x + tile} y2={y + tile} stroke="#607067" strokeWidth={2.2} />}
                      {cell.walls[2] && <line x1={x} y1={y + tile} x2={x + tile} y2={y + tile} stroke="#607067" strokeWidth={2.2} />}
                      {cell.walls[3] && <line x1={x} y1={y} x2={x} y2={y + tile} stroke="#607067" strokeWidth={2.2} />}
                    </g>
                  );
                })}
                <circle cx={player.x * tile + tile / 2} cy={player.y * tile + tile / 2} r={tile * 0.2} fill="#e7c477" stroke="#fff0bf" strokeWidth={3} />
              </svg>

              {takedownFlash && <div className={styles.takedown}><span>PATROL DISABLED</span></div>}
              {releaseFlash && <div className={styles.takedown}><span className={styles.releaseText}>PATROL RELEASED</span></div>}
              {complete && (
                <div className={styles.complete}>
                  <p className={styles.completeKicker}>{moves <= maze.par ? "PAR CLEARED" : `${moves - maze.par} OVER PAR`}</p>
                  <p className={styles.completeTitle}>Way found.</p>
                  <button type="button" className={styles.nextButton} onClick={() => reset(Math.min(24, level + 1))}>
                    {level < 24 ? "Next maze" : "Play again"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}><span className={styles.keyMark} /><span>Key</span></div>
          <div className={styles.legendItem}><span className={hasKey ? styles.exitOpen : styles.exitMark} /><span>Exit</span></div>
          {maze.pads && <div className={styles.legendItem}><span className={styles.blinkMark} /><span>Blink</span></div>}
          {maze.gate && <div className={styles.legendItem}><span className={powerOn ? styles.switchOn : styles.switchMark} /><span>{powerOn ? "Power off" : "Switch"}</span></div>}
          {maze.sentinels.length > 0 && <div className={styles.legendItem}><span className={!sentinelActive.some(Boolean) ? styles.sentinelCaged : styles.sentinelMark} /><span>{!sentinelActive.some(Boolean) ? "Patrol caged" : sentinelsMoveNext ? "Moves next" : "Rests next"}</span></div>}
          <span className={styles.swipe}>Drag or arrow keys</span>
        </div>

        {!complete && (
          <div className={styles.levelControls}>
            <button type="button" disabled={level === 1} className={styles.levelButton} onClick={() => reset(level - 1)}>Previous</button>
            <span className={styles.unlockedText}>{unlocked}/24 unlocked</span>
            <button type="button" disabled={level >= unlocked} className={styles.levelButton} onClick={() => reset(level + 1)}>Next</button>
          </div>
        )}
      </div>
      <p className={styles.hint}>Drag on the board, or steer with arrow keys / WASD.</p>
    </section>
  );
}
