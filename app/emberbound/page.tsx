import type { Metadata } from "next";
import Link from "next/link";
import EmberboundBattle from "./emberbound-battle";
import styles from "./emberbound.module.css";

export const metadata: Metadata = {
  title: "Emberbound — Summit Sight",
  description: "A tiny old-school turn-based RPG battle in the browser.",
};

export default function EmberboundPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/">← Summit Sight</Link>
        <p>A tiny game by Romano</p>
      </header>
      <EmberboundBattle />
    </main>
  );
}
