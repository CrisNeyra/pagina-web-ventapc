export interface HeroSlide {
  mp4: string;
  webm?: string;
  poster: string;
  titulo: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    mp4: "/videos/habitacion-ciberpunk-con-pc-gamer.mp4",
    poster: "/videos/habitacion-ciberpunk-con-pc-gamer-poster.jpg",
    titulo: "Setup gamer ciberpunk",
  },
  {
    mp4: "/videos/video-con-tematica-de-videojuego.mp4",
    poster: "/videos/video-con-tematica-de-videojuego-poster.jpg",
    titulo: "Temática gaming",
  },
  {
    mp4: "/videos/habitacion-ciberpunk-con-letrero-luminoso.mp4",
    poster: "/videos/habitacion-ciberpunk-con-letrero-luminoso-poster.jpg",
    titulo: "Habitación RGB",
  },
];
