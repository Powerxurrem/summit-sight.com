"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./tiny-delve.module.css";

type Point = { x: number; y: number };
type Phase = "ready" | "playing" | "upgrade" | "over";
type RelicId = "heart" | "thorns" | "ember" | "purse" | "ward" | "step";
type Relic = { id: RelicId; name: string; description: string; icon: string };

type GameState = {
  phase: Phase;
  floor: number;
  player: Point;
  exit: Point;
  enemies: Point[];
  walls: Point[];
  runes: Point[];
  coinTiles: Point[];
  potions: Point[];
  hp: number;
  maxHp: number;
  coins: number;
  runeCount: number;
  turns: number;
  relics: RelicId[];
  shield: number;
  message: string;
  choices: Relic[];
};

const SIZE = 7;
const START: Point = { x: 0, y: 6 };
const EXIT: Point = { x: 6, y: 0 };
const RELICS: Relic[] = [
  { id: "heart", name: "Deep Heart", description: "+2 maximum health and heal fully.", icon: "♥" },
  { id: "thorns", name: "Briar Mail", description: "Hits still hurt, but destroy the attacker.", icon: "✣" },
  { id: "ember", name: "Fifth Ember", description: "Every fifth turn burns adjacent enemies.", icon: "✦" },
  { id: "purse", name: "Kindly Purse", description: "Every third coin restores one health.", icon: "●" },
  { id: "ward", name: "Quiet Ward", description: "Block the first hit on every floor.", icon: "◇" },
  { id: "step", name: "Light Step", description: "A one-in-five chance to evade a hit.", icon: "≈" },
];

const key = (point: Point) => `${point.x},${point.y}`;
const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y;
const adjacent = (a: Point, b: Point) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;

function sampleRelics(owned: RelicId[]) {
  const available = RELICS.filter((relic) => !owned.includes(relic.id));
  const pool = available.length >= 3 ? available : RELICS;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
}

function buildFloor(base: Pick<GameState, "floor" | "hp" | "maxHp" | "coins" | "relics">): GameState {
  const occupied = new Set([key(START), key(EXIT)]);
  const isConnected = (walls: Point[]) => {
    const blocked = new Set(walls.map(key));
    const visited = new Set([key(START)]);
    const queue = [START];
    while (queue.length) {
      const point = queue.shift()!;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const next = { x: point.x + dx, y: point.y + dy };
        if (next.x < 0 || next.x >= SIZE || next.y < 0 || next.y >= SIZE || blocked.has(key(next)) || visited.has(key(next))) continue;
        visited.add(key(next));
        queue.push(next);
      }
    }
    return visited.size === SIZE * SIZE - walls.length;
  };
  const takeEmpty = () => {
    let point: Point;
    do point = { x: Math.floor(Math.random() * SIZE), y: Math.floor(Math.random() * SIZE) };
    while (occupied.has(key(point)));
    occupied.add(key(point));
    return point;
  };
  const makeMany = (count: number) => Array.from({ length: count }, takeEmpty);
  const floor = base.floor;
  const walls: Point[] = [];
  const wallTarget = floor === 1 ? 0 : Math.min(3 + floor, 8);
  let attempts = 0;
  while (walls.length < wallTarget && attempts < 200) {
    attempts += 1;
    const candidate = { x: Math.floor(Math.random() * SIZE), y: Math.floor(Math.random() * SIZE) };
    if (occupied.has(key(candidate)) || walls.some((wall) => same(wall, candidate))) continue;
    if (isConnected([...walls, candidate])) walls.push(candidate);
  }
  walls.forEach((wall) => occupied.add(key(wall)));
  const runes = makeMany(3);
  const coinTiles = makeMany(3 + Math.min(floor, 3));
  const potions = makeMany(floor % 2 === 0 ? 1 : 0);
  const enemies = makeMany(Math.min(2 + floor, 9));
  return {
    ...base,
    phase: "playing",
    player: START,
    exit: EXIT,
    walls,
    runes,
    coinTiles,
    potions,
    enemies,
    runeCount: 0,
    turns: 0,
    shield: base.relics.includes("ward") ? 1 : 0,
    message: "Find the three runes. Then reach the stairs.",
    choices: [],
  };
}

const initialState: GameState = {
  phase: "ready", floor: 1, player: START, exit: EXIT, enemies: [], walls: [], runes: [],
  coinTiles: [], potions: [], hp: 5, maxHp: 5, coins: 0, runeCount: 0, turns: 0,
  relics: [], shield: 0, message: "A very small dungeon waits below.", choices: [],
};

export default function TinyDelveGame() {
  const [game, setGame] = useState<GameState>(initialState);
  const [bestFloor, setBestFloor] = useState(1);

  const startRun = useCallback(() => {
    setGame(buildFloor({ floor: 1, hp: 5, maxHp: 5, coins: 0, relics: [] }));
  }, []);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const saved = Number(localStorage.getItem("tiny-delve-best") ?? 1);
      setBestFloor(Number.isFinite(saved) ? saved : 1);
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  const move = useCallback((dx: number, dy: number) => {
    setGame((current) => {
      if (current.phase !== "playing") return current;
      const target = { x: current.player.x + dx, y: current.player.y + dy };
      if (target.x < 0 || target.x >= SIZE || target.y < 0 || target.y >= SIZE) return current;
      if (current.walls.some((wall) => same(wall, target))) return { ...current, message: "Cold stone. Try another way." };

      let enemies = [...current.enemies];
      const enemyIndex = enemies.findIndex((enemy) => same(enemy, target));
      let player = current.player;
      let message = "The dungeon shifts.";
      if (enemyIndex >= 0) {
        enemies.splice(enemyIndex, 1);
        message = "You strike first.";
      } else {
        player = target;
      }

      const runes = current.runes.filter((rune) => !same(rune, player));
      let coinTiles = current.coinTiles;
      let potions = current.potions;
      const runeCount = current.runeCount + (runes.length < current.runes.length ? 1 : 0);
      let coins = current.coins;
      let hp = current.hp;
      let shield = current.shield;

      if (current.coinTiles.some((coin) => same(coin, player))) {
        coinTiles = current.coinTiles.filter((coin) => !same(coin, player));
        coins += 1;
        message = "A dungeon coin. Still warm.";
        if (current.relics.includes("purse") && coins % 3 === 0) hp = Math.min(current.maxHp, hp + 1);
      }
      if (current.potions.some((potion) => same(potion, player))) {
        potions = current.potions.filter((potion) => !same(potion, player));
        hp = Math.min(current.maxHp, hp + 2);
        message = "The red flask restores you.";
      }
      if (runes.length < current.runes.length) message = runeCount === 3 ? "The stairs wake." : `Rune ${runeCount} of 3 hums in your hand.`;

      if (same(player, current.exit)) {
        if (runeCount < 3) return { ...current, message: `${3 - runeCount} rune${runeCount === 2 ? "" : "s"} still missing.` };
        return { ...current, player, runes, coinTiles, potions, coins, hp, runeCount, phase: "upgrade", choices: sampleRelics(current.relics), message: "Choose what follows you deeper." };
      }

      const turns = current.turns + 1;
      const walls = new Set(current.walls.map(key));
      const claimed = new Set<string>();
      const survivors: Point[] = [];
      for (const enemy of enemies) {
        const horizontal = player.x - enemy.x;
        const vertical = player.y - enemy.y;
        const preferHorizontal = Math.random() > 0.5;
        const steps: Point[] = preferHorizontal
          ? [{ x: Math.sign(horizontal), y: 0 }, { x: 0, y: Math.sign(vertical) }]
          : [{ x: 0, y: Math.sign(vertical) }, { x: Math.sign(horizontal), y: 0 }];
        let next = enemy;
        for (const step of steps) {
          const candidate = { x: enemy.x + step.x, y: enemy.y + step.y };
          if ((step.x || step.y) && !walls.has(key(candidate)) && !claimed.has(key(candidate))) { next = candidate; break; }
        }
        if (same(next, player)) {
          if (shield > 0) { shield -= 1; message = "Your ward catches the blow."; survivors.push(enemy); claimed.add(key(enemy)); continue; }
          if (current.relics.includes("step") && Math.random() < 0.2) { message = "You slip past the blow."; survivors.push(enemy); claimed.add(key(enemy)); continue; }
          hp -= 1;
          if (current.relics.includes("thorns")) { message = "The blow hurts. The briars answer."; continue; }
          message = "Something sharp finds you.";
          survivors.push(enemy);
          claimed.add(key(enemy));
        } else {
          survivors.push(next);
          claimed.add(key(next));
        }
      }
      enemies = survivors;

      if (current.relics.includes("ember") && turns % 5 === 0) {
        const before = enemies.length;
        enemies = enemies.filter((enemy) => !adjacent(enemy, player));
        if (enemies.length < before) message = "The fifth ember flares.";
      }

      if (hp <= 0) {
        const deepest = Math.max(bestFloor, current.floor);
        localStorage.setItem("tiny-delve-best", String(deepest));
        setBestFloor(deepest);
        return { ...current, player, enemies, runes, coinTiles, potions, coins, runeCount, turns, hp: 0, shield, phase: "over", message: "The dungeon keeps what it takes." };
      }

      return { ...current, player, enemies, runes, coinTiles, potions, coins, runeCount, turns, hp, shield, message };
    });
  }, [bestFloor]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const directions: Record<string, [number, number]> = {
        ArrowUp: [0, -1], KeyW: [0, -1], ArrowDown: [0, 1], KeyS: [0, 1],
        ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0],
      };
      const direction = directions[event.code];
      if (direction) { event.preventDefault(); move(...direction); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  const chooseRelic = (relic: Relic) => {
    setGame((current) => {
      const alreadyOwned = current.relics.includes(relic.id);
      const relics = alreadyOwned ? current.relics : [...current.relics, relic.id];
      let maxHp = current.maxHp;
      let hp = current.hp;
      if (relic.id === "heart") { maxHp += 2; hp = maxHp; }
      const nextFloor = current.floor + 1;
      setBestFloor((best) => {
        const next = Math.max(best, nextFloor);
        localStorage.setItem("tiny-delve-best", String(next));
        return next;
      });
      return buildFloor({ floor: nextFloor, hp, maxHp, coins: current.coins, relics });
    });
  };

  const buy = (item: "heal" | "heart" | "reroll") => {
    setGame((current) => {
      if (current.phase !== "upgrade") return current;
      if (item === "heal") {
        if (current.coins < 3 || current.hp >= current.maxHp) return current;
        return { ...current, coins: current.coins - 3, hp: Math.min(current.maxHp, current.hp + 2), message: "Warm soup. Questionable bowl." };
      }
      if (item === "heart") {
        if (current.coins < 7) return current;
        return { ...current, coins: current.coins - 7, maxHp: current.maxHp + 1, hp: current.hp + 1, message: "A little more life for the road." };
      }
      if (current.coins < 2) return current;
      return { ...current, coins: current.coins - 2, choices: sampleRelics(current.relics), message: "The merchant reaches beneath the table." };
    });
  };

  const tileContent = (point: Point) => {
    if (same(game.player, point)) return <span className={styles.hero}>◆</span>;
    if (game.enemies.some((enemy) => same(enemy, point))) return <span className={styles.enemy}>♟</span>;
    if (game.runes.some((rune) => same(rune, point))) return <span className={styles.rune}>✦</span>;
    if (game.coinTiles.some((coin) => same(coin, point))) return <span className={styles.coin}>●</span>;
    if (game.potions.some((potion) => same(potion, point))) return <span className={styles.potion}>♥</span>;
    if (same(game.exit, point)) return <span className={game.runeCount === 3 ? styles.exitOpen : styles.exit}>▤</span>;
    if (game.walls.some((wall) => same(wall, point))) return <span className={styles.wall}>■</span>;
    return null;
  };

  const tapTile = (point: Point) => {
    const dx = point.x - game.player.x;
    const dy = point.y - game.player.y;
    if (Math.abs(dx) + Math.abs(dy) === 1) move(dx, dy);
  };

  return (
    <section className={styles.gameShell}>
      <div className={styles.intro}>
        <div><p className={styles.eyebrow}>Seven by seven · one move at a time</p><h1>Tiny Delve</h1></div>
        <p>Gather three runes, reach the stairs, and make something strange of the relics you find below.</p>
      </div>

      <div className={styles.hud}>
        <div><span>Floor</span><strong>{game.floor}</strong></div>
        <div><span>Health</span><strong>{"♥".repeat(game.hp)}<i>{"♡".repeat(Math.max(0, game.maxHp - game.hp))}</i></strong></div>
        <div><span>Runes</span><strong>{game.runeCount} / 3</strong></div>
        <div><span>Coins</span><strong>{game.coins}</strong></div>
        <div><span>Deepest</span><strong>{bestFloor}</strong></div>
      </div>

      <div className={styles.boardWrap}>
        <div className={styles.board} role="grid" aria-label="Tiny Delve dungeon">
          {Array.from({ length: SIZE * SIZE }, (_, index) => {
            const point = { x: index % SIZE, y: Math.floor(index / SIZE) };
            return <button key={index} className={styles.tile} onClick={() => tapTile(point)} aria-label={`Tile ${point.x + 1}, ${point.y + 1}`}>{tileContent(point)}</button>;
          })}
        </div>

        {game.phase === "ready" && <div className={styles.overlay}><strong>A small dungeon.<br />A short life.</strong><button onClick={startRun}>Descend</button></div>}
        {game.phase === "over" && <div className={styles.overlay}><strong>You reached floor {game.floor}.</strong><p>{game.coins} coins travelled nowhere.</p><button onClick={startRun}>Delve again</button></div>}
        {game.phase === "upgrade" && <div className={styles.upgradeOverlay}>
          <p>Choose a relic</p>
          <div className={styles.choices}>{game.choices.map((relic) => <button key={relic.id} onClick={() => chooseRelic(relic)}><span>{relic.icon}</span><strong>{relic.name}</strong><small>{relic.description}</small></button>)}</div>
          <div className={styles.shop}>
            <span>Spend your coins</span>
            <button disabled={game.coins < 3 || game.hp >= game.maxHp} onClick={() => buy("heal")}><strong>Warm soup</strong><small>Heal 2 · 3 coins</small></button>
            <button disabled={game.coins < 7} onClick={() => buy("heart")}><strong>Red thread</strong><small>+1 max health · 7 coins</small></button>
            <button disabled={game.coins < 2} onClick={() => buy("reroll")}><strong>Look again</strong><small>New relics · 2 coins</small></button>
          </div>
        </div>}
      </div>

      <div className={styles.bottomBar}>
        <p>{game.message}</p>
        <div className={styles.dpad}>
          <button onClick={() => move(0, -1)} aria-label="Move up">↑</button>
          <button onClick={() => move(-1, 0)} aria-label="Move left">←</button>
          <button onClick={() => move(0, 1)} aria-label="Move down">↓</button>
          <button onClick={() => move(1, 0)} aria-label="Move right">→</button>
        </div>
      </div>
    </section>
  );
}
