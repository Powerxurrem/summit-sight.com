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

export type ProductFrame = { src: string; alt: string; angle: number };

// Angles describe curated, approximate viewpoints, not measured camera positions.
export const productFrames: ProductFrame[] = [
  { angle: 0, src: "/media/milk-turnaround/view-000.webp", alt: "Summit Sight whole milk carton, branded front with mountain illustration and one-litre label" },
  { angle: 45, src: "/media/milk-turnaround/view-045.webp", alt: "Milk carton, branded front at left and The Daily Details nutrition panel at right" },
  { angle: 90, src: "/media/milk-turnaround/view-090.webp", alt: "Milk carton, right side with The Daily Details heading and nutrition table" },
  { angle: 135, src: "/media/milk-turnaround/view-135.webp", alt: "Milk carton, nutrition panel at left and A Fresh Perspective back panel at right" },
  { angle: 180, src: "/media/milk-turnaround/view-180.webp", alt: "Milk carton back, A Fresh Perspective headline, large orange sunrise and a short story" },
  { angle: 225, src: "/media/milk-turnaround/view-225.webp", alt: "Milk carton, sunrise back panel at left and Keep It Fresh storage panel at right" },
  { angle: 270, src: "/media/milk-turnaround/view-270.webp", alt: "Milk carton left side, Keep It Fresh heading, ingredients, storage instructions and barcode" },
  { angle: 315, src: "/media/milk-turnaround/view-315.webp", alt: "Milk carton, storage panel at left and Summit Sight branded front at right" },
];

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
    frames: ProductFrame[];
    caption: string;
  };
  disclosure: string;
};

// Replace the source and frames together, then update the study labels and disclosure.
// A null source shows a placeholder; a concept reference must be labelled honestly.
export const multiAngleStudy: MultiAngleStudy = {
  original: {
    label: "Reference image",
    image: { src: "/media/milk-turnaround/reference.webp", alt: "Front-facing reference of the fictional Summit Sight one-litre whole milk carton" },
    placeholderTitle: "Source photograph to be added",
    placeholderDescription: "Your product starts here.",
    caption: "The starting point. Summit Sight Whole Milk, a fictional product reference with original packaging artwork.",
  },
  result: {
    label: "Interactive result",
    studyLabel: "Summit Sight Milk · Fictional concept",
    frames: productFrames,
    caption: "One carton. Four distinct faces. Explore the branding, nutrition panel, sunrise story and storage details. Drag, select an angle, or use the arrow keys.",
  },
  disclosure:
    "Original AI-generated packaging concept, not commissioned customer work. The milk product, label copy and nutrition values are fictional. Views are conditioned on the reference and packaging artwork; unseen surfaces are artistic approximations. Angles are approximate. This is a visual presentation concept, not a measured scan or exact 3D reconstruction.",
};

export type TurnaroundStudy = {
  id: string;
  label: string;
  description: string;
  study: MultiAngleStudy;
};

export const soapFrames: ProductFrame[] = [
  { angle: 0, src: "/media/soap-turnaround/view-000.webp", alt: "Good Hands liquid hand soap, oxblood bottle with ivory front label and a black pump" },
  { angle: 45, src: "/media/soap-turnaround/view-045.webp", alt: "Good Hands soap, botanical front label and narrow right side, pump pointing toward the front" },
  { angle: 90, src: "/media/soap-turnaround/view-090.webp", alt: "Good Hands soap, narrow opaque right side with the pump nozzle pointing left" },
  { angle: 135, src: "/media/soap-turnaround/view-135.webp", alt: "Good Hands soap, narrow right side and detailed back label" },
  { angle: 180, src: "/media/soap-turnaround/view-180.webp", alt: "Good Hands soap back label with product story, directions, ingredients, care text and barcode" },
  { angle: 225, src: "/media/soap-turnaround/view-225.webp", alt: "Good Hands soap, detailed back label and narrow left side" },
  { angle: 270, src: "/media/soap-turnaround/view-270.webp", alt: "Good Hands soap, narrow opaque left side with the pump nozzle pointing right" },
  { angle: 315, src: "/media/soap-turnaround/view-315.webp", alt: "Good Hands soap, narrow left side and botanical front label" },
];

export const soapStudy: MultiAngleStudy = {
  original: {
    label: "Reference image",
    image: { src: "/media/soap-turnaround/reference.webp", alt: "Front reference of the fictional Summit Sight Good Hands bergamot and cedar hand soap" },
    placeholderTitle: "Source photograph to be added",
    placeholderDescription: "Your product starts here.",
    caption: "Good Hands. An original, fictional soap bottle with a distinctive front and a detailed back label.",
  },
  result: {
    label: "Interactive result",
    studyLabel: "Good Hands Soap · Fictional concept",
    frames: soapFrames,
    caption: "A closer look at the packaging. Explore the botanical front, curved sides and detailed back label. Drag, select an angle, or use the arrow keys.",
  },
  disclosure: "Original AI-generated packaging concept, not commissioned customer work. The product, formula and label copy are fictional. Views are conditioned on the reference and label artwork; unseen surfaces are artistic approximations. Fine print and illustration details may vary between views. Angles are approximate. This is a visual presentation concept, not a measured scan or exact 3D reconstruction.",
};

// Preserve both studies for reuse. Work currently renders soapStudy directly.
export const turnaroundStudies: TurnaroundStudy[] = [
  { id: "milk", label: "Milk carton", description: "One carton, four distinct faces. Our Summit Sight milk packaging concept.", study: multiAngleStudy },
  { id: "soap", label: "Soap bottle", description: "Good Hands. Premium hand soap with a bold front, curved sides and a detailed back label.", study: soapStudy },
];
