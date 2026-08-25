import type { Metadata } from "next";
import Link from "next/link";
import DriftlineGame from "./driftline-game";
import styles from "./driftline.module.css";

export const metadata: Metadata = {
  title: "Driftline — Summit Sight",
  description: "Roll the line. Find the gap. A tiny endless tunnel game.",
};

export default function DriftlinePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/">← Summit Sight</Link>
        <p>A tiny game by Romano</p>
      </header>
      <DriftlineGame />
    </main>
  );
}
