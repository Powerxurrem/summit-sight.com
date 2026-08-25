import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, G, Line, Rect } from "react-native-svg";

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

export default function MazeloopScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
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
  const dragAnchor = useRef({ x: 0, y: 0 });
  const lastDragMove = useRef(0);
  const maze = useMemo(() => createMaze(level), [level]);
  const boardSize = Math.min(width - 28, height - insets.top - insets.bottom - 245, 440);
  const tile = boardSize / maze.size;
  const sentinelPositions = maze.sentinels.map((route, index) => route[sentinelSteps[index] ?? 0]);
  const sentinelNext = maze.sentinels.map((route, index) => sentinelsMoveNext ? route[((sentinelSteps[index] ?? 0) + 1) % route.length] : route[sentinelSteps[index] ?? 0]);

  useEffect(() => {
    AsyncStorage.getItem(SAVE_KEY).then((value) => {
      const saved = Math.max(1, Number(value ?? 1));
      unlockedRef.current = saved;
      setUnlocked(saved);
    });
  }, []);

  useEffect(() => {
    const steps = maze.sentinels.map((route, index) => Math.min(route.length - 1, Math.floor(route.length * (index + 1) / 3)));
    sentinelStepsRef.current = steps;
    sentinelMoveTurnRef.current = false;
    sentinelAliveRef.current = maze.sentinels.map(() => true);
    sentinelActiveRef.current = maze.sentinels.map(() => !maze.pads);
    setSentinelSteps(steps);
    setSentinelsMoveNext(false);
    setSentinelAlive(maze.sentinels.map(() => true));
    setSentinelActive(maze.sentinels.map(() => !maze.pads));
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [maze.sentinels]);

  const move = useCallback((dx: number, dy: number) => {
    if (completeRef.current || crashLockRef.current) return;
    const directionIndex = directions.findIndex((direction) => direction.dx === dx && direction.dy === dy);
    const currentPlayer = playerRef.current;
    const cell = maze.cells[indexOf(currentPlayer.x, currentPlayer.y, maze.size)];
    if (cell.walls[directionIndex]) {
      if (advanceSentinels(currentPlayer, currentPlayer)) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      return;
    }
    const stepped = { x: currentPlayer.x + dx, y: currentPlayer.y + dy };
    const crossesGate = maze.gate && ((samePoint(currentPlayer, maze.gate.a) && samePoint(stepped, maze.gate.b)) || (samePoint(currentPlayer, maze.gate.b) && samePoint(stepped, maze.gate.a)));
    if (crossesGate && !powerRef.current) {
      if (advanceSentinels(currentPlayer, currentPlayer)) return;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
    if (switchedOn) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (blinked) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else Haptics.selectionAsync();
    if (collected && samePoint(next, maze.exit)) {
      const nextUnlocked = Math.max(unlockedRef.current, Math.min(24, level + 1));
      unlockedRef.current = nextUnlocked;
      completeRef.current = true;
      setUnlocked(nextUnlocked);
      AsyncStorage.setItem(SAVE_KEY, String(nextUnlocked));
      setComplete(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [advanceSentinels, level, maze, releasePatrol]);

  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !completeRef.current,
    onMoveShouldSetPanResponder: () => !completeRef.current,
    onPanResponderGrant: () => {
      dragAnchor.current = { x: 0, y: 0 };
      lastDragMove.current = 0;
    },
    onPanResponderMove: (_, gesture) => {
      const now = Date.now();
      if (now - lastDragMove.current < 115) return;
      const threshold = Math.max(38, tile * 0.82);
      const deltaX = gesture.dx - dragAnchor.current.x;
      const deltaY = gesture.dy - dragAnchor.current.y;
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < threshold) return;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        const direction = deltaX > 0 ? 1 : -1;
        move(direction, 0);
      } else {
        const direction = deltaY > 0 ? 1 : -1;
        move(0, direction);
      }
      dragAnchor.current = { x: gesture.dx, y: gesture.dy };
      lastDragMove.current = now;
    },
  }), [move, tile]);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/maze-hub")}><Text style={styles.back}>{"< PUZZLE WING"}</Text></Pressable>
        <Text style={styles.logo}>MAZELOOP</Text>
        <Text style={styles.levelTop}>LEVEL {level}/24</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View><Text style={styles.kicker}>{maze.sentinels.length ? "THE PUZZLE WING / PATROL MAZE" : maze.gate ? "THE PUZZLE WING / CIRCUIT MAZE" : maze.pads ? "THE PUZZLE WING / BLINK MAZE" : "THE PUZZLE WING"}</Text><Text style={styles.title}>Find the way out.</Text></View>
          <View style={styles.metrics}><Text style={styles.metricLabel}>MOVES</Text><Text style={styles.metric}>{moves}</Text><Text style={styles.par}>PAR {maze.par}</Text></View>
        </View>

        <View style={[styles.board, { width: boardSize, height: boardSize }]} {...responder.panHandlers}>
          <Svg width={boardSize} height={boardSize}>
            <Rect width={boardSize} height={boardSize} fill="#121d18" />
            <Rect x={maze.exit.x * tile + tile * 0.19} y={maze.exit.y * tile + tile * 0.19} width={tile * 0.62} height={tile * 0.62} rx={tile * 0.12} fill={hasKey ? "#5f9f78" : "#38473e"} stroke={hasKey ? "#a3dab0" : "#68756d"} strokeWidth={2} />
            {!hasKey && <Rect x={maze.key.x * tile + tile * 0.34} y={maze.key.y * tile + tile * 0.34} width={tile * 0.32} height={tile * 0.32} fill="#e2b767" transform={`rotate(45 ${maze.key.x * tile + tile / 2} ${maze.key.y * tile + tile / 2})`} />}
            {maze.pads?.map((pad, index) => <G key={`pad-${index}`}>
              <Circle cx={pad.x * tile + tile / 2} cy={pad.y * tile + tile / 2} r={tile * 0.3} fill={index === 0 ? "#397c83" : "#765b91"} fillOpacity={0.28} stroke={index === 0 ? "#78c7ca" : "#bb91d2"} strokeWidth={2} />
              <Circle cx={pad.x * tile + tile / 2} cy={pad.y * tile + tile / 2} r={tile * 0.12} fill={index === 0 ? "#91e0df" : "#d2a9e4"} />
            </G>)}
            {maze.switch && <G>
              <Rect x={maze.switch.x * tile + tile * 0.24} y={maze.switch.y * tile + tile * 0.24} width={tile * 0.52} height={tile * 0.52} rx={tile * 0.12} fill={powerOn ? "#4f9369" : "#a8743f"} fillOpacity={0.42} stroke={powerOn ? "#9bdaa9" : "#efb45f"} strokeWidth={2} />
              <Circle cx={maze.switch.x * tile + tile / 2} cy={maze.switch.y * tile + tile / 2} r={tile * 0.09} fill={powerOn ? "#b9efbf" : "#ffd17b"} />
            </G>}
            {maze.gate && (() => {
              const vertical = maze.gate.a.x !== maze.gate.b.x;
              const boundaryX = Math.max(maze.gate.a.x, maze.gate.b.x) * tile;
              const boundaryY = Math.max(maze.gate.a.y, maze.gate.b.y) * tile;
              return vertical
                ? <Line x1={boundaryX} y1={maze.gate.a.y * tile + tile * 0.16} x2={boundaryX} y2={maze.gate.a.y * tile + tile * 0.84} stroke={powerOn ? "#597068" : "#75dce0"} strokeOpacity={powerOn ? 0.35 : 1} strokeWidth={powerOn ? 2 : 5} strokeDasharray={powerOn ? undefined : "5 3"} />
                : <Line x1={maze.gate.a.x * tile + tile * 0.16} y1={boundaryY} x2={maze.gate.a.x * tile + tile * 0.84} y2={boundaryY} stroke={powerOn ? "#597068" : "#75dce0"} strokeOpacity={powerOn ? 0.35 : 1} strokeWidth={powerOn ? 2 : 5} strokeDasharray={powerOn ? undefined : "5 3"} />;
            })()}
            {sentinelNext.map((sentinel, index) => sentinelAlive[index] && sentinelActive[index] && <Circle key={`next-${index}`} cx={sentinel.x * tile + tile / 2} cy={sentinel.y * tile + tile / 2} r={tile * 0.25} fill="#bd4e48" fillOpacity={0.12} stroke="#dc655b" strokeOpacity={0.62} strokeWidth={1.5} />)}
            {sentinelPositions.map((sentinel, index) => sentinelAlive[index] && <G key={`sentinel-${index}`}>
              {!sentinelActive[index] && <Circle cx={sentinel.x * tile + tile / 2} cy={sentinel.y * tile + tile / 2} r={tile * 0.3} fill="#465049" fillOpacity={0.3} stroke="#89938c" strokeWidth={2} strokeDasharray="4 3" />}
              <Circle cx={sentinel.x * tile + tile / 2} cy={sentinel.y * tile + tile / 2} r={tile * 0.2} fill={sentinelActive[index] ? "#a83f3b" : "#555e58"} stroke={sentinelActive[index] ? "#ff9a82" : "#a8b0aa"} strokeWidth={2.5} />
              <Circle cx={sentinel.x * tile + tile / 2} cy={sentinel.y * tile + tile / 2} r={tile * 0.06} fill={sentinelActive[index] ? "#ffe0c7" : "#d0d5d0"} />
            </G>)}
            {maze.cells.map((cell, index) => {
              const x = index % maze.size * tile;
              const y = Math.floor(index / maze.size) * tile;
              return <G key={index}>{cell.walls[0] && <Line x1={x} y1={y} x2={x + tile} y2={y} stroke="#607067" strokeWidth={2.2} />}{cell.walls[1] && <Line x1={x + tile} y1={y} x2={x + tile} y2={y + tile} stroke="#607067" strokeWidth={2.2} />}{cell.walls[2] && <Line x1={x} y1={y + tile} x2={x + tile} y2={y + tile} stroke="#607067" strokeWidth={2.2} />}{cell.walls[3] && <Line x1={x} y1={y} x2={x} y2={y + tile} stroke="#607067" strokeWidth={2.2} />}</G>;
            })}
            <Circle cx={player.x * tile + tile / 2} cy={player.y * tile + tile / 2} r={tile * 0.2} fill="#e7c477" stroke="#fff0bf" strokeWidth={3} />
          </Svg>
          {takedownFlash && <View pointerEvents="none" style={styles.takedown}><Text style={styles.takedownText}>PATROL DISABLED</Text></View>}
          {releaseFlash && <View pointerEvents="none" style={styles.takedown}><Text style={[styles.takedownText, styles.releaseText]}>PATROL RELEASED</Text></View>}
          {complete && <View style={styles.complete}>
            <Text style={styles.completeKicker}>{moves <= maze.par ? "PAR CLEARED" : `${moves - maze.par} OVER PAR`}</Text>
            <Text style={styles.completeTitle}>Way found.</Text>
            <Pressable style={styles.nextButton} onPress={() => reset(Math.min(24, level + 1))}><Text style={styles.nextText}>{level < 24 ? "NEXT MAZE" : "PLAY AGAIN"}</Text></Pressable>
          </View>}
        </View>

        <View style={styles.legend}><View style={styles.legendItem}><View style={styles.keyMark} /><Text style={styles.legendText}>KEY</Text></View><View style={styles.legendItem}><View style={[styles.exitMark, hasKey && styles.exitOpen]} /><Text style={styles.legendText}>EXIT</Text></View>{maze.pads && <View style={styles.legendItem}><View style={styles.blinkMark} /><Text style={styles.legendText}>BLINK</Text></View>}{maze.gate && <View style={styles.legendItem}><View style={[styles.switchMark, powerOn && styles.switchOn]} /><Text style={styles.legendText}>{powerOn ? "POWER OFF" : "SWITCH"}</Text></View>}{maze.sentinels.length > 0 && <View style={styles.legendItem}><View style={[styles.sentinelMark, !sentinelActive.some(Boolean) && styles.sentinelCaged]} /><Text style={styles.legendText}>{!sentinelActive.some(Boolean) ? "PATROL CAGED" : sentinelsMoveNext ? "MOVES NEXT" : "RESTS NEXT"}</Text></View>}<Text style={styles.swipe}>DRAG</Text></View>
        {!complete && <View style={styles.levelControls}>
          <Pressable disabled={level === 1} onPress={() => reset(level - 1)} style={[styles.levelButton, level === 1 && styles.disabled]}><Text style={styles.levelButtonText}>PREVIOUS</Text></Pressable>
          <Text style={styles.unlocked}>{unlocked}/24 UNLOCKED</Text>
          <Pressable disabled={level >= unlocked} onPress={() => reset(level + 1)} style={[styles.levelButton, level >= unlocked && styles.disabled]}><Text style={styles.levelButtonText}>NEXT</Text></Pressable>
        </View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#101714" },
  header: { height: 54, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#29362f" },
  back: { color: "#909a92", fontSize: 9, fontWeight: "800", letterSpacing: 0.7 },
  logo: { color: "#f0eadb", fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  levelTop: { color: "#7f8c83", fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
  content: { flex: 1, alignItems: "center", paddingHorizontal: 14, paddingTop: 18 },
  titleRow: { width: "100%", flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 },
  kicker: { color: "#d4774c", fontSize: 8, fontWeight: "900", letterSpacing: 1.1 },
  title: { marginTop: 5, color: "#f0eadb", fontFamily: "serif", fontSize: 31, letterSpacing: -1.2 },
  metrics: { alignItems: "flex-end" },
  metricLabel: { color: "#718077", fontSize: 7, fontWeight: "900", letterSpacing: 0.8 },
  metric: { color: "#f0eadb", fontFamily: "serif", fontSize: 27 },
  par: { color: "#718077", fontSize: 7, fontWeight: "800", letterSpacing: 0.6 },
  board: { position: "relative", overflow: "hidden", borderWidth: 1, borderColor: "#3a4941", borderRadius: 17, backgroundColor: "#121d18" },
  complete: { position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(10,17,14,.83)" },
  takedown: { position: "absolute", top: 12, left: 0, right: 0, alignItems: "center" },
  takedownText: { paddingHorizontal: 12, paddingVertical: 7, overflow: "hidden", color: "#ffe1c3", fontSize: 8, fontWeight: "900", letterSpacing: 0.9, borderWidth: 1, borderColor: "#cb7158", borderRadius: 16, backgroundColor: "rgba(111,48,38,.9)" },
  releaseText: { color: "#ffe1d8", borderColor: "#e06455", backgroundColor: "rgba(137,43,38,.94)" },
  completeKicker: { color: "#d6ad65", fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  completeTitle: { marginTop: 7, color: "#f0eadb", fontFamily: "serif", fontSize: 37 },
  nextButton: { marginTop: 17, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 21, backgroundColor: "#eee3cf" },
  nextText: { color: "#152019", fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  legend: { width: "100%", marginTop: 15, flexDirection: "row", alignItems: "center", gap: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  keyMark: { width: 9, height: 9, transform: [{ rotate: "45deg" }], backgroundColor: "#e2b767" },
  blinkMark: { width: 11, height: 11, borderWidth: 2, borderColor: "#8ed6d5", borderRadius: 6, backgroundColor: "#73598a" },
  switchMark: { width: 11, height: 11, borderWidth: 2, borderColor: "#efb45f", borderRadius: 3, backgroundColor: "#79522f" },
  switchOn: { borderColor: "#9bdaa9", backgroundColor: "#4f9369" },
  sentinelMark: { width: 11, height: 11, borderWidth: 2, borderColor: "#ff9a82", borderRadius: 6, backgroundColor: "#a83f3b" },
  sentinelCaged: { borderColor: "#a8b0aa", backgroundColor: "#555e58" },
  exitMark: { width: 11, height: 11, borderWidth: 1, borderColor: "#68756d", borderRadius: 2, backgroundColor: "#38473e" },
  exitOpen: { borderColor: "#a3dab0", backgroundColor: "#5f9f78" },
  legendText: { color: "#849087", fontSize: 7, fontWeight: "900", letterSpacing: 0.5 },
  swipe: { marginLeft: "auto", color: "#68756d", fontSize: 7, fontWeight: "800", letterSpacing: 0.5 },
  levelControls: { width: "100%", marginTop: "auto", paddingBottom: 9, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  levelButton: { paddingHorizontal: 13, paddingVertical: 10, borderWidth: 1, borderColor: "#46544c", borderRadius: 18 },
  disabled: { opacity: 0.25 },
  levelButtonText: { color: "#b2bab3", fontSize: 8, fontWeight: "900", letterSpacing: 0.6 },
  unlocked: { color: "#6d7971", fontSize: 8, fontWeight: "800", letterSpacing: 0.6 },
});
