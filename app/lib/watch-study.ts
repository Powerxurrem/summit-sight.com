type WatchTreatment = {
  id: string;
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
    title: "Creative treatment",
  },
  {
    id: "studio",
    src: "/media/watch-study/studio.webp",
    alt: "The same fictional blue-dial watch and steel-and-gold bracelet on pale limestone under soft neutral studio lighting",
    title: "Studio study",
  },
];

export const watchComparison = {
  before: watchTreatments[1].src,
  after: watchTreatments[0].src,
  beforeAlt: watchTreatments[1].alt,
  afterAlt: watchTreatments[0].alt,
};

export const watchDisclosure =
  "An original AI-generated luxury watch concept. Fictional and unbranded, created as an independent studio exploration. No client commission or brand affiliation.";
