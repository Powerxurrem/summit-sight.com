import type { Metadata } from "next";
import Link from "next/link";
import PeakStackGame from "./peak-stack-game";
import styles from "./peak-stack.module.css";

export const metadata: Metadata = {
  title: "Peak Stack — Summit Sight",
  description: "A tiny, calming one-tap stacking game by Romano Kreugel.",
};

export default function PeakStackPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/">← Summit Sight</Link>
        <p>A tiny game by Romano</p>
      </header>
      <PeakStackGame />
    </main>
  );
}
