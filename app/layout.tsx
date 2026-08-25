import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Summit Sight — Useful software, guides & experiments",
  description:
    "Independent product studio building practical software, research tools, browser utilities, and field guides.",
  openGraph: {
    title: "Summit Sight — Useful software, guides & experiments",
    description:
      "Independent product studio building practical software, research tools, browser utilities, and field guides.",
    siteName: "Summit Sight",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
