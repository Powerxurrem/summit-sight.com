export const selectedWork = [
  { id: "amber-stone", src: "/media/concept-fragrance.webp", alt: "Amber glass fragrance bottle in a cinematic volcanic stone setting", title: "Amber & Stone", category: "PRODUCT IMAGERY / CREATIVE DIRECTION" },
  { id: "quiet-form", src: "/media/audio.webp", alt: "Sculptural charcoal headphones in cool atmospheric light", title: "Quiet Form", category: "PRODUCT CONCEPT / ATMOSPHERE" },
  { id: "daily-ritual", src: "/media/skincare.webp", alt: "Minimal ivory skincare bottle on warm sunlit limestone", title: "Daily Ritual", category: "BEAUTY / LIFESTYLE IMAGERY" },
];

export const environments = [
  { src: "/media/fragrance-obsidian.webp", alt: "Fictional amber fragrance in a warm volcanic stone environment", title: "Obsidian" },
  { src: "/media/fragrance-arctic.webp", alt: "Fictional amber fragrance surrounded by ice and cool mist", title: "Arctic" },
  { src: "/media/fragrance-inferno.webp", alt: "Fictional amber fragrance against an atmospheric ember glow", title: "Ember" },
];

export const productFrames = Array.from({ length: 12 }, (_, i) => ({ src: `/media/sequence/frame-${String(i).padStart(2,"0")}.svg`, alt: `Illustrated bottle form study, view ${i + 1} of 12` }));

export type MultiAngleStudy = {
  original: {
    label: string;
    image: { src: string; alt: string } | null;
    placeholderTitle: string;
    placeholderDescription: string;
    caption: string;
  };
  result: {
    label: string;
    studyLabel: string;
    frames: { src: string; alt: string }[];
    caption: string;
  };
  disclosure: string;
};

// Replace the source and frames together, then update the study labels and disclosure.
// A null source intentionally shows a placeholder, never a fictional customer photo.
export const multiAngleStudy: MultiAngleStudy = {
  original: {
    label: "Original",
    image: null,
    placeholderTitle: "Source photograph to be added",
    placeholderDescription: "Your product starts here.",
    caption: "The starting point: a photograph of your product.",
  },
  result: {
    label: "Multi-Angle Result",
    studyLabel: "12-view illustration · Concept study",
    frames: productFrames,
    caption: "Explore the form through twelve illustrated viewpoints.",
  },
  disclosure:
    "Concept demonstration. The illustrated views are not derived from a source photograph. This is not an actual customer result or a 3D reconstruction.",
};
