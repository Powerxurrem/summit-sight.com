export type WatchTreatmentId = "creative" | "box" | "wrist" | "studio";
type WatchTreatment = {
  id: WatchTreatmentId;
  src: string;
  alt: string;
  title: string;
};

// Add future settings here only once their matching local assets are ready.
export const watchTreatments: WatchTreatment[] = [
  {
    id: "creative",
    src: "/media/watch-study/creative.webp",
    alt: "Original unbranded watch with a deep blue dial, polished steel case and gold-accented bracelet on wet dark rock in cinematic light",
    title: "Wet rock",
  },
  {
    id: "box",
    src: "/media/watch-study/presentation-box.webp",
    alt: "The same fictional blue-dial steel-and-gold watch on a navy suede cushion inside an open unbranded presentation box with warm metal trim and visible hinges",
    title: "Presentation box",
  },
  {
    id: "wrist",
    src: "/media/watch-study/business-wrist.webp",
    alt: "The same fictional unbranded blue-dial steel-and-gold watch worn on an adult man's wrist beside a charcoal business suit and crisp white shirt cuff",
    title: "Business wrist",
  },
  {
    id: "studio",
    src: "/media/watch-study/studio.webp",
    alt: "The same fictional blue-dial watch and steel-and-gold bracelet on pale limestone under soft neutral studio lighting",
    title: "Studio study",
  },
];

export type WatchPair = { left: WatchTreatmentId; right: WatchTreatmentId };
export const initialWatchPair: WatchPair = { left: "creative", right: "studio" };

// Choosing the opposite image swaps the pair, so every comparison stays useful.
export function changeWatchPair(pair: WatchPair, side: keyof WatchPair, treatment: WatchTreatmentId): WatchPair {
  const opposite = side === "left" ? "right" : "left";
  return { ...pair, [side]: treatment, [opposite]: pair[opposite] === treatment ? pair[side] : pair[opposite] };
}

export const watchDisclosure =
  "An original AI-generated luxury watch concept. Fictional and unbranded, created as an independent studio exploration. No client commission or brand affiliation.";
