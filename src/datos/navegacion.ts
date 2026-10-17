// Navegación principal de la tienda (estilo Compra Gamer)
export const enlacesNavegacion = [
  { nombre: "Productos", href: "/productos" },
  { nombre: "Notebooks", href: "/notebooks" },
  { nombre: "Armá tu PC", href: "/arma-tu-pc" },
  { nombre: "Ayuda", href: "/ayuda" },
];

// Categorías para la grilla de exploración
export const categorias = [
  { nombre: "PC de Escritorio", href: "/categoria/pc-escritorio", imagen: "/categorias/pc-escritorio.jpg", grande: true },
  { nombre: "Placas de Video", href: "/categoria/placas-video", imagen: "/categorias/placas-video.jpg" },
  { nombre: "Monitores", href: "/categoria/monitores", imagen: "/categorias/monitores.jpg" },
  { nombre: "Notebooks", href: "/categoria/notebooks", imagen: "/categorias/notebooks.jpg" },
  { nombre: "Memorias RAM", href: "/categoria/memorias-ram", imagen: "/categorias/memorias-ram.jpg" },
  { nombre: "Mothers", href: "/categoria/mothers", imagen: "/categorias/mothers.jpg" },
  { nombre: "Fuentes", href: "/categoria/fuentes", imagen: "/categorias/fuentes.jpg" },
  { nombre: "Sillas Gamers", href: "/categoria/sillas-gamers", imagen: "/categorias/sillas-gamers.jpg" },
  { nombre: "Periféricos", href: "/categoria/perifericos", imagen: "/categorias/perifericos.jpg" },
  { nombre: "Almacenamiento", href: "/categoria/almacenamiento", imagen: "/categorias/almacenamiento.jpg" },
];

export type MarcaDestacada = {
  nombre: string;
  logo: string;
  officialUrl: string;
};

// Marcas destacadas
export const marcas: MarcaDestacada[] = [
  { nombre: "ASUS", logo: "/marcas/asus.svg", officialUrl: "https://www.asus.com/" },
  { nombre: "AMD", logo: "/marcas/amd.svg", officialUrl: "https://www.amd.com/" },
  { nombre: "Intel", logo: "/marcas/intel.svg", officialUrl: "https://www.intel.com/" },
  {
    nombre: "Corsair",
    logo: "/marcas/corsair.svg",
    officialUrl: "https://www.corsair.com/",
  },
  {
    nombre: "ASRock",
    logo: "/marcas/asrock.svg",
    officialUrl: "https://www.asrock.com/",
  },
  { nombre: "MSI", logo: "/marcas/msi.svg", officialUrl: "https://www.msi.com/" },
  {
    nombre: "Gigabyte",
    logo: "/marcas/gigabyte.svg",
    officialUrl: "https://www.gigabyte.com/",
  },
  {
    nombre: "Kingston",
    logo: "/marcas/kingston.svg",
    officialUrl: "https://www.kingston.com/",
  },
];
