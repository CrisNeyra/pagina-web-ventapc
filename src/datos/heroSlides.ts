export interface HeroSlide {
  mp4: string;
  webm?: string;
  poster: string;
  titulo: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    mp4: "/videos/habitacion-ciberpunk-con-pc-gamer.mp4",
    webm: "/videos/habitacion-ciberpunk-con-pc-gamer.webm",
    poster: "/productos/pc-001-principal.jpg",
    titulo: "Setup gamer ciberpunk",
  },
  {
    mp4: "/videos/video-con-tematica-de-videojuego.mp4",
    webm: "/videos/video-con-tematica-de-videojuego.webm",
    poster: "/productos/gpu-001-principal.jpg",
    titulo: "Temática gaming",
  },
  {
    mp4: "/videos/habitacion-ciberpunk-con-letrero-luminoso.mp4",
    webm: "/videos/habitacion-ciberpunk-con-letrero-luminoso.webm",
    poster: "/productos/mon-001-principal.jpg",
    titulo: "Habitación RGB",
  },
];
