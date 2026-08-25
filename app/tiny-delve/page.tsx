import type { Metadata } from "next";
import Link from "next/link";
import TinyDelveGame from "./tiny-delve-game";
import styles from "./tiny-delve.module.css";

export const metadata: Metadata = {
  title: "Tiny Delve — Summit Sight",
  description: "A seven-by-seven pocket roguelike. Gather the runes and go deeper.",
};

export default function TinyDelvePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/">← Summit Sight</Link>
        <p>A tiny game by Romano</p>
      </header>
      <TinyDelveGame />
    </main>
  );
}
