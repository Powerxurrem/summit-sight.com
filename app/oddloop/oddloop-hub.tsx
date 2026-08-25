"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./oddloop.module.css";

type Records = { driftline: number; peakStack: number; tinyDelve: number; mazeloop: number };

const games = [
  {
    name: "Driftline",
    type: "Arcade · Endless",
    description: "Six ways to lose the line, from a simple orbit to full corner-hopping.",
    href: "/driftline",
    className: "drift",
    record: "driftline" as const,
    recordLabel: "gates",
  },
  {
    name: "Peak Stack",
    type: "Timing · Endless",
    description: "Build upward, shave the edges, and land one more perfect piece.",
    href: "/peak-stack",
    className: "stack",
    record: "peakStack" as const,
    recordLabel: "points",
  },
  {
    name: "Tiny Delve",
    type: "Puzzle · Roguelike",
    description: "Every step moves the monsters in a seven-by-seven dungeon.",
    href: "/tiny-delve",
    className: "delve",
    record: "tinyDelve" as const,
    recordLabel: "floor",
  },
  {
    name: "Mazeloop",
    type: "Puzzle · Maze",
    description: "Find the key, dodge the patrol, and blink through the walls across 24 mazes.",
    href: "/mazeloop",
    className: "maze",
    record: "mazeloop" as const,
    recordLabel: "unlocked",
  },
];

export default function OddloopHub() {
  const [records, setRecords] = useState<Records>({ driftline: 0, peakStack: 0, tinyDelve: 1, mazeloop: 1 });
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      setRecords({
        driftline: Number(localStorage.getItem("driftline-best") ?? 0),
        peakStack: Number(localStorage.getItem("peak-stack-best") ?? 0),
        tinyDelve: Number(localStorage.getItem("tiny-delve-best") ?? 1),
        mazeloop: Number(localStorage.getItem("mazeloop-unlocked") ?? 1),
      });
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  return (
    <main className={styles.app}>
      <header className={styles.topbar}>
        <Link className={styles.logo} href="/oddloop" aria-label="Oddloop home"><span>o</span>oddloop</Link>
        <button className={styles.installButton} onClick={() => setShowInstall(true)}>Add to phone</button>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p>Today&apos;s loop</p>
          <h1>Lose yourself<br />in the line.</h1>
          <span>Driftline is simple until your sense of direction quietly leaves the room.</span>
          <Link href="/driftline">Play Driftline <b>→</b></Link>
        </div>
        <Link href="/driftline" className={styles.tunnelPreview} aria-label="Play Driftline">
          <i className={styles.ringOne} /><i className={styles.ringTwo} /><i className={styles.ringThree} /><i className={styles.ball} />
          <span>Best run <strong>{records.driftline}</strong></span>
        </Link>
      </section>

      <section className={styles.library}>
        <div className={styles.sectionTitle}><div><p>The arcade</p><h2>Pick a loop.</h2></div><span>{games.length} games · no coins required</span></div>
        <div className={styles.gameGrid}>
          {games.map((game) => (
            <Link href={game.href} className={styles.gameCard} key={game.name}>
              <div className={`${styles.art} ${styles[game.className]}`}><span>{game.name.slice(0, 1)}</span></div>
              <div className={styles.cardCopy}>
                <p>{game.type}</p><h3>{game.name}</h3><span>{game.description}</span>
                <footer>{game.record ? <small>Best {game.recordLabel}: <b>{records[game.record]}</b></small> : <small>Story battle</small>}<i>↗</i></footer>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.records}>
        <div><p>Your cabinet</p><h2>Quietly competitive.</h2></div>
        <div className={styles.recordList}>
          <p><span>Driftline</span><strong>{records.driftline}</strong><small>gates</small></p>
          <p><span>Peak Stack</span><strong>{records.peakStack}</strong><small>points</small></p>
          <p><span>Tiny Delve</span><strong>{records.tinyDelve}</strong><small>deepest floor</small></p>
          <p><span>Mazeloop</span><strong>{records.mazeloop}</strong><small>mazes unlocked</small></p>
        </div>
      </section>

      <footer className={styles.footer}><span>Tiny games. Strange loops.</span><Link href="/">Made at Summit Sight ↗</Link></footer>

      {showInstall && <div className={styles.modalBackdrop} onClick={() => setShowInstall(false)}>
        <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
          <button className={styles.close} onClick={() => setShowInstall(false)} aria-label="Close">×</button>
          <div className={styles.appIcon}>o</div>
          <p>Keep Oddloop nearby</p>
          <h2>Add it to your Home Screen.</h2>
          <ol><li><span>iPhone</span> Tap Share, then “Add to Home Screen.”</li><li><span>Android</span> Open the browser menu, then tap “Install app.”</li></ol>
          <small>Scores stay locally on this device.</small>
        </div>
      </div>}
    </main>
  );
}
