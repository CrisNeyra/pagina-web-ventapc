export interface RedSocial {
  id: string;
  label: string;
  href: string;
}

/** URLs públicas de Aura Pro (portfolio). Configurables vía env en el futuro. */
export const REDES_SOCIALES: RedSocial[] = [
  {
    id: "twitter",
    label: "Twitter / X",
    href: "https://x.com/aurapro_hardware",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/aurapro.hardware",
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/aurapro.hardware",
  },
  {
    id: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@auraprohardware",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/aura-pro-hardware",
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@aurapro.hardware",
  },
  {
    id: "twitch",
    label: "Twitch",
    href: "https://www.twitch.tv/auraprohardware",
  },
];
