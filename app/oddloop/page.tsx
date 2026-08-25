import type { Metadata } from "next";
import OddloopHub from "./oddloop-hub";

export const metadata: Metadata = {
  title: "Oddloop — Tiny Games, Strange Loops",
  description: "A small arcade of curious, replayable games by Summit Sight.",
  applicationName: "Oddloop",
  appleWebApp: {
    capable: true,
    title: "Oddloop",
    statusBarStyle: "black-translucent",
  },
};

export default function OddloopPage() {
  return <OddloopHub />;
}
