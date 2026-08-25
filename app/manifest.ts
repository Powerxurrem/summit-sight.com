import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Oddloop — Tiny Games, Strange Loops",
    short_name: "Oddloop",
    description: "A small arcade of curious, replayable browser games.",
    start_url: "/oddloop",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#101714",
    theme_color: "#101714",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
