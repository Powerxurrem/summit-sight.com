import type { Metadata } from "next";
import Link from "next/link";
import MazeloopGame from "./mazeloop-game";
import styles from "./mazeloop.module.css";

export const metadata: Metadata = {
  title: "Mazeloop — Summit Sight",
  description: "Find the key, dodge the patrol, and blink through the walls across 24 mazes.",
};

export default function MazeloopPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/">← Summit Sight</Link>
        <p>A tiny game by Romano</p>
      </header>
      <MazeloopGame />
    </main>
  );
}
