import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "./components/header";
import { Footer } from "./components/brand";
import "./globals.css";

const geist = localFont({ src: "../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2", variable: "--font-geist", display: "swap", weight: "100 900" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3100")),
  title: { default: "Summit Sight — Creative Production Studio", template: "%s — Summit Sight" },
  description: "Your product. Beyond ordinary. Premium product imagery, cinematic video, multi-angle visuals and creative production, built around your vision.",
  openGraph: { title: "Summit Sight — Your product. Beyond ordinary.", description: "Independent creative production. Explore product imagery, cinematic concepts and new perspectives.", siteName: "Summit Sight", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={geist.variable}><body><a className="skip-link" href="#main">Skip to content</a><Header/>{children}<Footer/></body></html>;
}
