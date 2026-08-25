"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./emberbound.module.css";

type HeroId = "pip" | "mira" | "rowan";
type Hero = { id: HeroId; name: string; job: string; hp: number; maxHp: number; mp: number; maxMp: number; defended: boolean };
type Phase = "ready" | "battle" | "won" | "lost";
type BattleState = { phase: Phase; party: Hero[]; enemyHp: number; enemyMaxHp: number; turn: number; potions: number; log: string; busy: boolean; flash: "enemy" | HeroId | null; round: number };

const TURN_ORDER: Array<HeroId | "enemy"> = ["pip", "enemy", "mira", "rowan"];

const freshBattle = (): BattleState => ({
  phase: "battle",
  party: [
    { id: "rowan", name: "Rowan", job: "Warden", hp: 132, maxHp: 132, mp: 24, maxMp: 24, defended: false },
    { id: "mira", name: "Mira", job: "Ember mage", hp: 84, maxHp: 84, mp: 48, maxMp: 48, defended: false },
    { id: "pip", name: "Pip", job: "Wayfinder", hp: 102, maxHp: 102, mp: 30, maxMp: 30, defended: false },
  ],
  enemyHp: 390, enemyMaxHp: 390, turn: 0, potions: 3,
  log: "A mossback wyrm blocks the old road.", busy: false, flash: null, round: 1,
});

function nextLivingTurn(state: BattleState, from: number) {
  let turn = from;
  for (let tries = 0; tries < TURN_ORDER.length; tries += 1) {
    turn = (turn + 1) % TURN_ORDER.length;
    const actor = TURN_ORDER[turn];
    if (actor === "enemy" || state.party.some((hero) => hero.id === actor && hero.hp > 0)) return turn;
  }
  return turn;
}

function PixelHero({ id }: { id: HeroId }) {
  const colors = id === "rowan" ? ["#ddd2ad", "#65796d", "#3d514b"] : id === "mira" ? ["#e0b38b", "#9d5260", "#54394e"] : ["#dfc19c", "#a77c45", "#4e665f"];
  return <svg viewBox="0 0 32 42" aria-hidden="true" shapeRendering="crispEdges">
    <rect x="11" y="4" width="11" height="10" fill={colors[0]} /><rect x="8" y="2" width="15" height="5" fill={colors[2]} />
    <rect x="9" y="15" width="15" height="16" fill={colors[1]} /><rect x="5" y="18" width="5" height="12" fill={colors[0]} />
    <rect x="24" y="18" width="4" height="12" fill={colors[0]} /><rect x="10" y="31" width="5" height="9" fill={colors[2]} /><rect x="19" y="31" width="5" height="9" fill={colors[2]} />
    {id === "rowan" && <rect x="3" y="14" width="4" height="20" fill="#b7aa83" />}{id === "mira" && <rect x="26" y="9" width="3" height="27" fill="#c38b55" />}{id === "pip" && <rect x="25" y="13" width="5" height="3" fill="#d6c18f" />}
  </svg>;
}

function Wyrm() {
  return <svg viewBox="0 0 150 110" aria-hidden="true" shapeRendering="crispEdges">
    <path d="M20 77h20V49h20V29h43v12h17v18h14v34H73V78H51v15H20z" fill="#526b5a" />
    <path d="M35 48h18V30h29V18h31v12H96v11H60v18H35z" fill="#718873" />
    <rect x="105" y="35" width="8" height="8" fill="#e5b85c" /><rect x="109" y="37" width="4" height="4" fill="#251d18" />
    <path d="M25 48L5 25h28zM71 29L82 5l13 24z" fill="#3d5147" /><rect x="42" y="92" width="18" height="10" fill="#3b4d43" /><rect x="108" y="92" width="18" height="10" fill="#3b4d43" />
  </svg>;
}

export default function EmberboundBattle() {
  const [game, setGame] = useState<BattleState>({ ...freshBattle(), phase: "ready" });
  const actor = TURN_ORDER[game.turn];
  const currentHero = actor === "enemy" ? null : game.party.find((hero) => hero.id === actor) ?? null;

  const start = useCallback(() => setGame(freshBattle()), []);

  const finishHeroAction = useCallback((current: BattleState, party: Hero[], damage: number, log: string, mpCost = 0) => {
    const actingId = TURN_ORDER[current.turn] as HeroId;
    const updatedParty = party.map((hero) => hero.id === actingId ? { ...hero, mp: Math.max(0, hero.mp - mpCost), defended: false } : hero);
    const enemyHp = Math.max(0, current.enemyHp - damage);
    if (enemyHp === 0) return { ...current, party: updatedParty, enemyHp, log, phase: "won" as const, busy: false, flash: "enemy" as const };
    const interim = { ...current, party: updatedParty, enemyHp, log, busy: false, flash: "enemy" as const };
    return { ...interim, turn: nextLivingTurn(interim, current.turn) };
  }, []);

  const command = (kind: "attack" | "skill" | "item" | "defend") => {
    setGame((current) => {
      const id = TURN_ORDER[current.turn];
      if (current.phase !== "battle" || current.busy || id === "enemy") return current;
      const hero = current.party.find((member) => member.id === id);
      if (!hero || hero.hp <= 0) return current;

      if (kind === "item") {
        if (current.potions <= 0 || hero.hp === hero.maxHp) return { ...current, log: current.potions ? `${hero.name} is already at full health.` : "The potion pouch is empty." };
        const party = current.party.map((member) => member.id === id ? { ...member, hp: Math.min(member.maxHp, member.hp + 52) } : member);
        const interim = { ...current, party, potions: current.potions - 1, log: `${hero.name} drinks a sunroot tonic.`, flash: id, busy: false };
        return { ...interim, turn: nextLivingTurn(interim, current.turn) };
      }
      if (kind === "defend") {
        const party = current.party.map((member) => member.id === id ? { ...member, defended: true } : member);
        const interim = { ...current, party, log: `${hero.name} braces for the next blow.`, flash: id, busy: false };
        return { ...interim, turn: nextLivingTurn(interim, current.turn) };
      }
      if (kind === "skill") {
        const costs: Record<HeroId, number> = { rowan: 7, mira: 12, pip: 8 };
        if (hero.mp < costs[id]) return { ...current, log: `${hero.name} does not have enough MP.` };
        if (id === "mira") return finishHeroAction(current, current.party, 58 + Math.floor(Math.random() * 14), "Mira calls down Cinderfall!", costs[id]);
        if (id === "pip") return finishHeroAction(current, current.party, 40 + Math.floor(Math.random() * 13), "Pip cuts twice with Crosswind.", costs[id]);
        return finishHeroAction(current, current.party, 48 + Math.floor(Math.random() * 10), "Rowan breaks the wyrm's guard.", costs[id]);
      }
      const base: Record<HeroId, number> = { rowan: 29, mira: 17, pip: 23 };
      return finishHeroAction(current, current.party, base[id] + Math.floor(Math.random() * 9), `${hero.name} attacks.`);
    });
  };

  useEffect(() => {
    if (game.phase !== "battle" || actor !== "enemy" || game.busy) return;
    const timer = window.setTimeout(() => {
      setGame((current) => {
        if (current.phase !== "battle" || TURN_ORDER[current.turn] !== "enemy") return current;
        const living = current.party.filter((hero) => hero.hp > 0);
        if (!living.length) return { ...current, phase: "lost", log: "The road goes quiet." };
        const target = living[Math.floor(Math.random() * living.length)];
        const rawDamage = 20 + Math.floor(Math.random() * 13) + current.round * 2;
        const damage = target.defended ? Math.ceil(rawDamage * 0.42) : rawDamage;
        const party = current.party.map((hero) => hero.id === target.id ? { ...hero, hp: Math.max(0, hero.hp - damage), defended: false } : hero);
        const anyoneAlive = party.some((hero) => hero.hp > 0);
        if (!anyoneAlive) return { ...current, party, phase: "lost", log: `The wyrm's stone breath fells ${target.name}.`, flash: target.id };
        const interim = { ...current, party, log: `The wyrm strikes ${target.name} for ${damage}.`, flash: target.id, round: current.round + 1 };
        return { ...interim, turn: nextLivingTurn(interim, current.turn) };
      });
    }, 620);
    return () => window.clearTimeout(timer);
  }, [actor, game.busy, game.phase]);

  useEffect(() => {
    if (!game.flash) return;
    const timer = window.setTimeout(() => setGame((current) => ({ ...current, flash: null })), 260);
    return () => window.clearTimeout(timer);
  }, [game.flash]);

  const skillLabel: Record<HeroId, string> = { rowan: "Guardbreak · 7 MP", mira: "Cinderfall · 12 MP", pip: "Crosswind · 8 MP" };

  return <section className={styles.shell}>
    <div className={styles.intro}><div><p>Old road · old magic · one large problem</p><h1>Emberbound</h1></div><span>A pocket-sized turn-based battle about three travellers who should probably have taken the other road.</span></div>

    <div className={styles.battleFrame}>
      <div className={styles.sky}><span className={styles.moon} /><span className={styles.cloudOne} /><span className={styles.cloudTwo} /></div>
      <div className={styles.mountains} /><div className={styles.ground} />
      <div className={`${styles.wyrm} ${game.flash === "enemy" ? styles.hit : ""}`}><Wyrm /><span>Mossback wyrm</span></div>
      <div className={styles.partySprites}>{game.party.map((hero) => <div key={hero.id} className={`${styles.sprite} ${hero.hp <= 0 ? styles.fallen : ""} ${game.flash === hero.id ? styles.hit : ""}`}><PixelHero id={hero.id} /><span>{hero.name}</span></div>)}</div>

      {game.phase === "ready" && <div className={styles.overlay}><strong>An enormous shape<br />blocks the old road.</strong><button onClick={start}>Stand your ground</button></div>}
      {game.phase === "won" && <div className={styles.overlay}><strong>The road is quiet again.</strong><p>124 EXP · 38 gil-that-is-legally-not-gil</p><button onClick={start}>Fight once more</button></div>}
      {game.phase === "lost" && <div className={styles.overlay}><strong>The ember goes out.</strong><button onClick={start}>Return to the road</button></div>}
    </div>

    <div className={styles.enemyBar}><span>Mossback wyrm</span><div><i style={{ width: `${game.enemyHp / game.enemyMaxHp * 100}%` }} /></div><strong>{game.enemyHp} / {game.enemyMaxHp}</strong></div>

    <div className={styles.interface}>
      <div className={styles.log}><span>{game.phase === "battle" && actor !== "enemy" ? `${currentHero?.name}'s turn` : actor === "enemy" ? "Enemy turn" : "Battle"}</span><p>{game.log}</p></div>
      <div className={styles.commands}>
        <button disabled={!currentHero || game.phase !== "battle"} onClick={() => command("attack")}><strong>Attack</strong><small>Reliable damage</small></button>
        <button disabled={!currentHero || game.phase !== "battle"} onClick={() => command("skill")}><strong>Skill</strong><small>{currentHero ? skillLabel[currentHero.id] : "Unique ability"}</small></button>
        <button disabled={!currentHero || game.phase !== "battle"} onClick={() => command("item")}><strong>Item</strong><small>Sunroot tonic × {game.potions}</small></button>
        <button disabled={!currentHero || game.phase !== "battle"} onClick={() => command("defend")}><strong>Defend</strong><small>Reduce the next hit</small></button>
      </div>
    </div>

    <div className={styles.partyPanel}>{game.party.map((hero) => <div key={hero.id} className={hero.hp <= 0 ? styles.ko : actor === hero.id ? styles.active : ""}><span><strong>{hero.name}</strong><small>{hero.job}</small></span><p>HP <b>{hero.hp}</b> / {hero.maxHp}</p><meter min="0" max={hero.maxHp} value={hero.hp} /><p>MP <b>{hero.mp}</b> / {hero.maxMp}</p></div>)}</div>
  </section>;
}
