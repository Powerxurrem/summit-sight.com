const media = "/media/virtual-stage";

export const clayScene = {
  src: `${media}/clay.mp4`,
  poster: `${media}/clay-poster.webp`,
};

export const cinematicWorlds = [
  {
    id: "drowned-cathedral", number: "01", title: "Drowned Cathedral",
    description: "A world beneath the surface. Ancient stone, turquoise light and a mechanism still glowing in the deep.",
    detail: "SUBMERGED STONE / TURQUOISE LIGHT",
    src: `${media}/drowned-cathedral.mp4`, poster: `${media}/drowned-cathedral-poster.webp`,
  },
  {
    id: "forgotten-sanctuary", number: "02", title: "Forgotten Sanctuary",
    description: "Nature reclaims the architecture. Roots, emerald light and a celestial machine hidden beneath the canopy.",
    detail: "ANCIENT ROOTS / EMERALD LIGHT",
    src: `${media}/forgotten-sanctuary.mp4`, poster: `${media}/forgotten-sanctuary-poster.webp`,
  },
  {
    id: "singularity-engine", number: "03", title: "Singularity Engine",
    description: "An impossible source of energy. Dark metal, charged plasma and a machine at the edge of tomorrow.",
    detail: "DARK METAL / CONTAINED PLASMA",
    src: `${media}/singularity-engine.mp4`, poster: `${media}/singularity-engine-poster.webp`,
  },
] as const;
