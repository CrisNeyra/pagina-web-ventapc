import { Producto, Banner, Novedad } from "@/tipos/producto";

type ProductoBase = Omit<Producto, "imagenes"> & {
  imagen?: string;
  imagenes?: string[];
};

function crearImagenesProducto(id: string): string[] {
  return [
    `/productos/${id}-principal.jpg`,
    `/productos/${id}-img2.jpg`,
    `/productos/${id}-img3.jpg`,
  ];
}

function normalizarProducto(producto: ProductoBase): Producto {
  const imagenesNormalizadas =
    producto.imagenes && producto.imagenes.length > 0
      ? producto.imagenes.slice(0, 3)
      : crearImagenesProducto(producto.id);

  return {
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: producto.precio,
    precioAnterior: producto.precioAnterior,
    categoria: producto.categoria,
    enStock: producto.enStock,
    etiqueta: producto.etiqueta,
    imagenes: imagenesNormalizadas,
  };
}

// ── Banners del carrusel principal ──
export const banners: Banner[] = [
  {
    id: "banner-1",
    imagen: "/banners/banner-ofertas.jpg",
    titulo: "Ofertas de Temporada",
    subtitulo: "Hasta 40% OFF en placas de video",
    enlace: "/ofertas",
  },
  {
    id: "banner-2",
    imagen: "/banners/banner-notebooks.jpg",
    titulo: "Notebooks Gamer",
    subtitulo: "Los mejores equipos para gaming",
    enlace: "/notebooks",
  },
  {
    id: "banner-3",
    imagen: "/banners/banner-arma-tu-pc.jpg",
    titulo: "Armá tu PC",
    subtitulo: "Configurá tu equipo a medida",
    enlace: "/arma-tu-pc",
  },
  {
    id: "banner-4",
    imagen: "/banners/banner-perifericos.jpg",
    titulo: "Periféricos",
    subtitulo: "Teclados, mouses y auriculares",
    enlace: "/perifericos",
  },
];

// ── Categorías de productos ──
export const categoriasDestacadas = [
  "Monitores",
  "Procesadores",
  "Placas de Video",
  "Memorias RAM",
  "Almacenamiento",
];

// ── Productos mock ──
const productosDestacadosBase: ProductoBase[] = [
  // Monitores
  {
    id: "mon-001",
    nombre: 'Monitor Gamer Curvo 27" 165Hz 1ms QHD',
    descripcion: "Panel VA, 2560x1440, FreeSync Premium, HDR400",
    precio: 389999,
    precioAnterior: 449999,
    imagen: "/productos/monitor-curvo-27.jpg",
    categoria: "Monitores",
    enStock: true,
  },
  {
    id: "mon-002",
    nombre: 'Monitor IPS 24" 144Hz Full HD',
    descripcion: "Panel IPS, 1920x1080, 1ms, AMD FreeSync",
    precio: 219999,
    imagen: "/productos/monitor-ips-24.jpg",
    categoria: "Monitores",
    enStock: true,
  },
  {
    id: "mon-003",
    nombre: 'Monitor 4K 28" IPS 60Hz',
    descripcion: "Panel IPS, 3840x2160, 99% sRGB, HDR",
    precio: 329999,
    imagen: "/productos/monitor-4k-28.jpg",
    categoria: "Monitores",
    enStock: false,
  },
  {
    id: "note-001",
    nombre: 'Notebook Lenovo Legion 5 15.6" Ryzen 7 RTX 4060',
    descripcion: "16GB RAM, 1TB SSD NVMe, panel 165Hz y teclado RGB.",
    precio: 2199999,
    precioAnterior: 2399999,
    categoria: "Notebooks",
    enStock: true,
  },
  {
    id: "note-002",
    nombre: 'Notebook ASUS TUF Gaming F15 15.6" Intel i7 RTX 4050',
    descripcion: "16GB RAM, 512GB SSD, chasis reforzado y pantalla 144Hz.",
    precio: 1999999,
    categoria: "Notebooks",
    enStock: true,
  },

  // Procesadores
  {
    id: "proc-001",
    nombre: "Procesador AMD Ryzen 7 7800X3D",
    descripcion: "8 Núcleos, 16 Hilos, 5.0GHz, AM5, 3D V-Cache",
    precio: 459999,
    precioAnterior: 529999,
    imagen: "/productos/ryzen-7-7800x3d.jpg",
    categoria: "Procesadores",
    enStock: true,
  },
  {
    id: "proc-002",
    nombre: "Procesador Intel Core i7-14700K",
    descripcion: "20 Núcleos, 28 Hilos, 5.6GHz, LGA1700",
    precio: 489999,
    imagen: "/productos/intel-i7-14700k.jpg",
    categoria: "Procesadores",
    enStock: true,
  },
  {
    id: "proc-003",
    nombre: "Procesador AMD Ryzen 5 7600X",
    descripcion: "6 Núcleos, 12 Hilos, 5.3GHz, AM5",
    precio: 269999,
    precioAnterior: 319999,
    imagen: "/productos/ryzen-5-7600x.jpg",
    categoria: "Procesadores",
    enStock: true,
  },
  {
    id: "proc-004",
    nombre: "Procesador Intel Core i5-14600KF",
    descripcion: "14 Núcleos, 20 Hilos, 5.3GHz, LGA1700",
    precio: 349999,
    imagen: "/productos/intel-i5-14600kf.jpg",
    categoria: "Procesadores",
    enStock: true,
  },

  // Placas de Video
  {
    id: "gpu-001",
    nombre: "Placa de Video RX 7800 XT 16GB",
    descripcion: "GDDR6, FSR 3, Ray Tracing, Dual Fan",
    precio: 749999,
    imagen: "/productos/rx-7800xt.jpg",
    categoria: "Placas de Video",
    enStock: true,
  },
  {
    id: "gpu-002",
    nombre: "Placa de Video RTX 4060 8GB",
    descripcion: "GDDR6, DLSS 3, Ray Tracing, Dual Fan",
    precio: 499999,
    precioAnterior: 579999,
    imagen: "/productos/rtx-4060.jpg",
    categoria: "Placas de Video",
    enStock: true,
  },
  {
    id: "gpu-003",
    nombre: "Placa de Video RTX 4090 24GB",
    descripcion: "GDDR6X, DLSS 3.5, Ray Tracing, ADA Lovelace",
    precio: 2499999,
    imagen: "/productos/rtx-4090.jpg",
    categoria: "Placas de Video",
    enStock: false,
  },

  // Memorias RAM
  {
    id: "ram-001",
    nombre: "Memoria RAM DDR5 32GB (2x16) 6000MHz RGB",
    descripcion: "CL30, XMP 3.0, Disipador Aluminio",
    precio: 129999,
    precioAnterior: 159999,
    imagen: "/productos/ram-ddr5-32gb.jpg",
    categoria: "Memorias RAM",
    enStock: true,
  },
  {
    id: "ram-002",
    nombre: "Memoria RAM DDR5 16GB (2x8) 5600MHz",
    descripcion: "CL36, XMP 3.0, Perfil Bajo",
    precio: 79999,
    imagen: "/productos/ram-ddr5-16gb.jpg",
    categoria: "Memorias RAM",
    enStock: true,
  },
  {
    id: "ram-003",
    nombre: "Memoria RAM DDR4 32GB (2x16) 3600MHz",
    descripcion: "CL18, XMP 2.0, RGB, Disipador",
    precio: 89999,
    imagen: "/productos/ram-ddr4-32gb.jpg",
    categoria: "Memorias RAM",
    enStock: true,
  },
  {
    id: "ram-004",
    nombre: "Memoria RAM DDR5 64GB (2x32) 5200MHz",
    descripcion: "CL40, ECC, Para Workstation",
    precio: 249999,
    precioAnterior: 299999,
    imagen: "/productos/ram-ddr5-64gb.jpg",
    categoria: "Memorias RAM",
    enStock: true,
  },

  // Almacenamiento
  {
    id: "ssd-001",
    nombre: "SSD NVMe M.2 1TB Gen4 7000MB/s",
    descripcion: "PCIe 4.0, TLC NAND, Disipador incluido",
    precio: 109999,
    precioAnterior: 139999,
    imagen: "/productos/ssd-nvme-1tb.jpg",
    categoria: "Almacenamiento",
    enStock: true,
  },
  {
    id: "ssd-002",
    nombre: "SSD NVMe M.2 2TB Gen4 7400MB/s",
    descripcion: "PCIe 4.0, TLC NAND, PS5 Compatible",
    precio: 199999,
    imagen: "/productos/ssd-nvme-2tb.jpg",
    categoria: "Almacenamiento",
    enStock: true,
  },
  {
    id: "ssd-003",
    nombre: "SSD SATA 1TB 560MB/s",
    descripcion: 'SATA III, 2.5", TLC NAND, 600 TBW',
    precio: 69999,
    imagen: "/productos/ssd-sata-1tb.jpg",
    categoria: "Almacenamiento",
    enStock: true,
  },
  {
    id: "ssd-004",
    nombre: "SSD NVMe M.2 4TB Gen5 12400MB/s",
    descripcion: "PCIe 5.0, TLC NAND, Tope de gama",
    precio: 549999,
    precioAnterior: 649999,
    imagen: "/productos/ssd-nvme-4tb.jpg",
    categoria: "Almacenamiento",
    enStock: true,
  },
];

// ── Productos con precios rebajados (PCs armadas, combos) ──
const productosRebajadosBase: ProductoBase[] = [
  {
    id: "pc-001",
    nombre: "PC AMD Ryzen 5 5600GT 16GB 512GB SSD WIFI",
    descripcion: "Ideal para oficina y gaming liviano",
    precio: 651116,
    precioAnterior: 689050,
    imagen: "/productos/pc-ryzen5-5600gt.jpg",
    categoria: "PC Armadas",
    etiqueta: "PC ARMADA",
    enStock: true,
  },
  {
    id: "pc-002",
    nombre: "PC AMD Ryzen 7 5700G 16GB 512GB SSD WIFI",
    descripcion: "Potencia para multitarea y gaming",
    precio: 702266,
    precioAnterior: 740200,
    imagen: "/productos/pc-ryzen7-5700g.jpg",
    categoria: "PC Armadas",
    etiqueta: "PC ARMADA",
    enStock: true,
  },
  {
    id: "pc-003",
    nombre: "PC Gamer AMD Ryzen 7 5700 RTX 3050 6GB 16GB 1TB SSD",
    descripcion: "Gaming 1080p en ultra, 4x Fans RGB",
    precio: 1140317,
    precioAnterior: 1253850,
    imagen: "/productos/pc-gamer-rtx3050.jpg",
    categoria: "PC Armadas",
    etiqueta: "PC ARMADA",
    enStock: true,
  },
  {
    id: "combo-001",
    nombre: "Gabinete Antec VCX200 ELITE RGB + Mouse Corsair M75",
    descripcion: "Mesh 5x120mm RGB, Vidrio Templado + Mouse Gaming",
    precio: 218607,
    precioAnterior: 240200,
    imagen: "/productos/combo-gabinete-mouse.jpg",
    categoria: "Combos",
    etiqueta: "COMBO",
    enStock: true,
  },
];

// ── Últimas novedades ──
export const ultimasNovedades: Novedad[] = [
  {
    id: "nov-001",
    categoria: "PLACAS DE VIDEO RADEON AMD",
    titulo: "RX 9070 XT 16GB Ultra Power",
    precio: 1187300,
    imagen: "/productos/rx-9070xt.jpg",
    enlace: "/producto/rx-9070xt",
  },
  {
    id: "nov-002",
    categoria: "PLACAS DE RED INALÁMBRICAS",
    titulo: "AX3000: Velocidad real",
    precio: 45800,
    imagen: "/productos/placa-red-ax3000.jpg",
    enlace: "/producto/placa-red-ax3000",
  },
  {
    id: "nov-003",
    categoria: "MONITORES Y PANTALLAS",
    titulo: 'Samsung G9 49" Potencia Total',
    precio: 1758600,
    imagen: "/productos/samsung-g9-49.jpg",
    enlace: "/producto/samsung-g9-49",
  },
  {
    id: "nov-004",
    categoria: "NOTEBOOKS",
    titulo: "Vivobook 15 R7 Potencia PRO",
    precio: 1372400,
    imagen: "/productos/vivobook-15-r7.jpg",
    enlace: "/producto/vivobook-15-r7",
  },
  {
    id: "nov-005",
    categoria: "CONSOLAS",
    titulo: "Jugá donde quieras",
    precio: 1106800,
    imagen: "/productos/consola-ps5.jpg",
    enlace: "/producto/consola-ps5",
  },
];

// ── Catálogo inicial extendido (3 productos por categoría visual) ──
const catalogoInicialExtendidoBase: ProductoBase[] = [
  // Placas de Video
  {
    id: "cat-gpu-001",
    nombre: "NVIDIA GeForce RTX 4060 8GB",
    descripcion: "Arquitectura Ada Lovelace, DLSS 3 y Ray Tracing para 1080p/1440p.",
    precio: 589999,
    imagen: "/img/productos/placeholder-gpu-1.png",
    categoria: "Placas de Video",
    enStock: true,
  },
  {
    id: "cat-gpu-002",
    nombre: "AMD Radeon RX 7600 8GB",
    descripcion: "Excelente rendimiento en eSports y gaming en 1080p alto.",
    precio: 479999,
    imagen: "/img/productos/placeholder-gpu-2.png",
    categoria: "Placas de Video",
    enStock: true,
  },
  {
    id: "cat-gpu-003",
    nombre: "NVIDIA GeForce RTX 3050 8GB",
    descripcion: "Entrada sólida al ecosistema RTX para gaming Full HD.",
    precio: 399999,
    imagen: "/img/productos/placeholder-gpu-3.png",
    categoria: "Placas de Video",
    enStock: true,
  },

  // Monitores
  {
    id: "cat-mon-001",
    nombre: 'LG UltraGear 24" 144Hz',
    descripcion: "Panel IPS Full HD con 1ms y compatibilidad FreeSync.",
    precio: 269999,
    imagen: "/img/productos/placeholder-monitor-1.png",
    categoria: "Monitores",
    enStock: true,
  },
  {
    id: "cat-mon-002",
    nombre: 'Samsung Odyssey G5 27" QHD',
    descripcion: "Curvo 1000R, 144Hz, ideal para inmersión en juegos competitivos.",
    precio: 389999,
    imagen: "/img/productos/placeholder-monitor-2.png",
    categoria: "Monitores",
    enStock: true,
  },
  {
    id: "cat-mon-003",
    nombre: 'Gigabyte G27Q 27" IPS 144Hz',
    descripcion: "Resolución QHD, color preciso y tiempo de respuesta optimizado.",
    precio: 409999,
    imagen: "/img/productos/placeholder-monitor-3.png",
    categoria: "Monitores",
    enStock: true,
  },

  // Notebooks
  {
    id: "cat-not-001",
    nombre: "Lenovo Legion 5",
    descripcion: "Ryzen 7, RTX 4060 y pantalla de alta tasa de refresco.",
    precio: 2199999,
    imagen: "/img/productos/placeholder-notebook-1.png",
    categoria: "Notebooks",
    enStock: true,
  },
  {
    id: "cat-not-002",
    nombre: "ASUS TUF Gaming F15",
    descripcion: "Intel Core i7, gráfica dedicada y chasis reforzado.",
    precio: 2049999,
    imagen: "/img/productos/placeholder-notebook-2.png",
    categoria: "Notebooks",
    enStock: true,
  },
  {
    id: "cat-not-003",
    nombre: "Acer Nitro 5",
    descripcion: "Laptop gamer balanceada para estudio, trabajo y gaming.",
    precio: 1899999,
    imagen: "/img/productos/placeholder-notebook-3.png",
    categoria: "Notebooks",
    enStock: true,
  },

  // Memorias RAM
  {
    id: "cat-ram-001",
    nombre: "Kingston FURY Beast 16GB DDR4 3200MHz",
    descripcion: "Módulo de alta compatibilidad para upgrades de rendimiento.",
    precio: 59999,
    imagen: "/img/productos/placeholder-ram-1.png",
    categoria: "Memorias RAM",
    enStock: true,
  },
  {
    id: "cat-ram-002",
    nombre: "Corsair Vengeance RGB 32GB DDR5 6000MHz",
    descripcion: "Kit 2x16GB con iluminación RGB y perfil XMP.",
    precio: 199999,
    imagen: "/img/productos/placeholder-ram-2.png",
    categoria: "Memorias RAM",
    enStock: true,
  },
  {
    id: "cat-ram-003",
    nombre: "XPG Spectrix D41 16GB DDR4 3200MHz",
    descripcion: "Diseño gamer con disipación térmica y estabilidad sostenida.",
    precio: 64999,
    imagen: "/img/productos/placeholder-ram-3.png",
    categoria: "Memorias RAM",
    enStock: true,
  },

  // PC de Escritorio
  {
    id: "cat-pce-001",
    nombre: "PC Armada Gamer AMD Ryzen 5",
    descripcion: "Equipo equilibrado para juegos en 1080p y productividad.",
    precio: 1099999,
    imagen: "/img/productos/placeholder-pc-1.png",
    categoria: "PC de Escritorio",
    enStock: true,
    etiqueta: "PC ARMADA",
  },
  {
    id: "cat-pce-002",
    nombre: "PC Armada Intel Core i7",
    descripcion: "Configuración premium para streaming, edición y gaming.",
    precio: 1549999,
    imagen: "/img/productos/placeholder-pc-2.png",
    categoria: "PC de Escritorio",
    enStock: true,
    etiqueta: "PC ARMADA",
  },
  {
    id: "cat-pce-003",
    nombre: "PC Oficina AMD Athlon",
    descripcion: "Solución económica y confiable para tareas diarias.",
    precio: 549999,
    imagen: "/img/productos/placeholder-pc-3.png",
    categoria: "PC de Escritorio",
    enStock: true,
    etiqueta: "PC ARMADA",
  },

  // Mothers
  {
    id: "cat-mot-001",
    nombre: "ASUS Prime B550M-A",
    descripcion: "Plataforma AM4 con soporte para Ryzen y PCIe 4.0.",
    precio: 169999,
    imagen: "/img/productos/placeholder-mother-1.png",
    categoria: "Mothers",
    enStock: true,
  },
  {
    id: "cat-mot-002",
    nombre: "Gigabyte B660M DS3H",
    descripcion: "Chipset Intel B660, DDR4 y excelente relación precio/rendimiento.",
    precio: 189999,
    imagen: "/img/productos/placeholder-mother-2.png",
    categoria: "Mothers",
    enStock: true,
  },
  {
    id: "cat-mot-003",
    nombre: "MSI MAG B650 Tomahawk",
    descripcion: "AM5, DDR5 y VRM robusto para builds avanzadas.",
    precio: 319999,
    imagen: "/img/productos/placeholder-mother-3.png",
    categoria: "Mothers",
    enStock: true,
  },

  // Fuentes
  {
    id: "cat-fue-001",
    nombre: "Corsair CX650M 650W",
    descripcion: "Fuente semimodular 80 Plus Bronze de alta confiabilidad.",
    precio: 149999,
    imagen: "/img/productos/placeholder-fuente-1.png",
    categoria: "Fuentes",
    enStock: true,
  },
  {
    id: "cat-fue-002",
    nombre: "XPG Core Reactor 750W 80+ Gold",
    descripcion: "Eficiencia superior para equipos de consumo medio/alto.",
    precio: 219999,
    imagen: "/img/productos/placeholder-fuente-2.png",
    categoria: "Fuentes",
    enStock: true,
  },
  {
    id: "cat-fue-003",
    nombre: "Redragon 500W 80+ Bronze",
    descripcion: "Opción accesible para PCs de entrada y oficina.",
    precio: 99999,
    imagen: "/img/productos/placeholder-fuente-3.png",
    categoria: "Fuentes",
    enStock: true,
  },

  // Sillas Gamers
  {
    id: "cat-sil-001",
    nombre: "Corsair T3 Rush",
    descripcion: "Tapizado premium, ergonomía y soporte lumbar ajustable.",
    precio: 499999,
    imagen: "/img/productos/placeholder-silla-1.png",
    categoria: "Sillas Gamers",
    enStock: true,
  },
  {
    id: "cat-sil-002",
    nombre: "Redragon Metis",
    descripcion: "Diseño deportivo, apoyabrazos regulables y base metálica.",
    precio: 329999,
    imagen: "/img/productos/placeholder-silla-2.png",
    categoria: "Sillas Gamers",
    enStock: true,
  },
  {
    id: "cat-sil-003",
    nombre: "DXRacer Formula",
    descripcion: "Silla gamer icónica con respaldo reclinable de alto confort.",
    precio: 569999,
    imagen: "/img/productos/placeholder-silla-3.png",
    categoria: "Sillas Gamers",
    enStock: true,
  },

  // Periféricos
  {
    id: "cat-per-001",
    nombre: "Teclado Mecánico Redragon Kumara",
    descripcion: "Switches mecánicos, formato compacto y retroiluminación.",
    precio: 79999,
    imagen: "/img/productos/placeholder-periferico-1.png",
    categoria: "Periféricos",
    enStock: true,
  },
  {
    id: "cat-per-002",
    nombre: "Mouse Logitech G203",
    descripcion: "Sensor preciso, liviano y excelente para FPS.",
    precio: 45999,
    imagen: "/img/productos/placeholder-periferico-2.png",
    categoria: "Periféricos",
    enStock: true,
  },
  {
    id: "cat-per-003",
    nombre: "Auriculares HyperX Cloud II",
    descripcion: "Sonido envolvente 7.1 y micrófono desmontable.",
    precio: 119999,
    imagen: "/img/productos/placeholder-periferico-3.png",
    categoria: "Periféricos",
    enStock: true,
  },

  // Almacenamiento
  {
    id: "cat-alm-001",
    nombre: "SSD NVMe WD Black SN850X 1TB",
    descripcion: "Rendimiento extremo PCIe 4.0 para gaming y creación.",
    precio: 184999,
    imagen: "/img/productos/placeholder-almacenamiento-1.png",
    categoria: "Almacenamiento",
    enStock: true,
  },
  {
    id: "cat-alm-002",
    nombre: "SSD SATA Kingston A400 480GB",
    descripcion: "Mejora inmediata de arranque y tiempos de carga.",
    precio: 54999,
    imagen: "/img/productos/placeholder-almacenamiento-2.png",
    categoria: "Almacenamiento",
    enStock: true,
  },
  {
    id: "cat-alm-003",
    nombre: "Disco Duro Seagate Barracuda 2TB",
    descripcion: "Gran capacidad para archivos, backups y biblioteca multimedia.",
    precio: 89999,
    imagen: "/img/productos/placeholder-almacenamiento-3.png",
    categoria: "Almacenamiento",
    enStock: true,
  },
];

export const productosDestacados: Producto[] = productosDestacadosBase.map(
  normalizarProducto
);
export const productosRebajados: Producto[] = productosRebajadosBase.map(
  normalizarProducto
);
export const catalogoInicialExtendido: Producto[] =
  catalogoInicialExtendidoBase.map(normalizarProducto);
