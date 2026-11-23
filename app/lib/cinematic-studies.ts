export const cinematicStudies = [
  {
    id: "ignition",
    title: "Ignition",
    subtitle: "Cinematic camera movement / Automotive",
    description: "A supercar in red studio haze. The camera moves toward its illuminated headlamp.",
    src: "/media/cinematic-studies/ignition.mp4",
    poster: "/media/cinematic-studies/ignition-poster.webp",
    loop: true,
  },
  {
    id: "universe-within",
    title: "A Universe Within",
    subtitle: "Surreal transformation / Visual storytelling",
    description: "An eye fills the frame. A passage through its pupil opens into a blue and gold galaxy, then returns to the eye.",
    src: "/media/cinematic-studies/universe-within-ping-pong-v1.mp4",
    poster: "/media/cinematic-studies/universe-within-poster.webp",
    loop: true,
  },
] as const;

export type CinematicStudy = (typeof cinematicStudies)[number];
