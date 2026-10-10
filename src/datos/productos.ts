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

function asegurarDescripcionCuatroLineas(
  descripcion: string,
  nombre: string,
  categoria: string
): string {
  const lineasBase = descripcion
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);

  const lineasFallback = [
    `${nombre}.`,
    `Categoría: ${categoria} con enfoque en rendimiento y calidad.`,
    "Componentes y terminaciones seleccionadas para uso intensivo diario.",
    "Incluye garantía oficial y soporte postventa especializado.",
  ];

  const lineasFinales = [...lineasBase, ...lineasFallback].slice(0, 4);
  return lineasFinales.join("\n");
}

function asegurarTresImagenes(imagenes: string[] | undefined, id: string): string[] {
  const imagenesBase =
    imagenes && imagenes.length > 0 ? imagenes.filter(Boolean) : crearImagenesProducto(id);
  const imagenesDefecto = crearImagenesProducto(id);
  const primera = imagenesBase[0] ?? imagenesDefecto[0];
  const segunda = imagenesBase[1] ?? imagenesDefecto[1];
  const tercera = imagenesBase[2] ?? imagenesDefecto[2];
  return [primera, segunda, tercera];
}

function normalizarProducto(producto: ProductoBase): Producto {
  const imagenesNormalizadas = asegurarTresImagenes(producto.imagenes, producto.id);

  return {
    id: producto.id,
    nombre: producto.nombre,
    descripcion: asegurarDescripcionCuatroLineas(
      producto.descripcion,
      producto.nombre,
      producto.categoria
    ),
    precio: producto.precio,
    precioAnterior: producto.precioAnterior,
    categoria: producto.categoria,
    enStock: producto.enStock,
    etiqueta: producto.etiqueta,
    imagenes: imagenesNormalizadas,
  };
}

function obtenerIdDesdeEnlaceProducto(enlace: string): string {
  return enlace.replace("/producto/", "").trim();
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

  // Mothers
  {
    id: "mother-001",
    nombre: "Mother ASUS Prime B660M-A",
    descripcion:
      "Motherboard mATX Intel B660 con socket LGA1700 para 12va y 13va Gen.\nSoporta memoria DDR4 hasta 128GB y perfiles XMP para mejor rendimiento.\nIncluye ranura M.2 PCIe 4.0, HDMI, DisplayPort y USB 3.2 de alta velocidad.\nIdeal para equipos gaming y productividad con excelente estabilidad térmica.",
    precio: 214999,
    imagenes: [
      "/productos/mother-001-principal.jpg",
      "/productos/mother-001-img2.jpg",
      "/productos/mother-001-img3.jpg",
    ],
    categoria: "Mothers",
    enStock: true,
  },
  {
    id: "mother-002",
    nombre: "Mother Gigabyte B650M DS3H",
    descripcion:
      "Placa madre AM5 con chipset B650 preparada para Ryzen serie 7000.\nCompatible con DDR5 y almacenamiento NVMe PCIe 4.0 para cargas ultrarrápidas.\nCuenta con VRM reforzado, LAN Gigabit y múltiples puertos USB para periféricos.\nExcelente opción para armar una PC moderna con gran relación precio/rendimiento.",
    precio: 289999,
    imagenes: [
      "/productos/mother-002-principal.jpg",
      "/productos/mother-002-img2.jpg",
      "/productos/mother-002-img3.jpg",
    ],
    categoria: "Mothers",
    enStock: true,
  },
  {
    id: "mother-003",
    nombre: "Mother MSI MAG B550 Tomahawk",
    descripcion:
      "Motherboard ATX AM4 con diseño robusto para procesadores Ryzen de alto desempeño.\nDispone de doble M.2, LAN 2.5G y audio premium para una experiencia completa.\nSistema de disipación extendida que mantiene temperaturas estables bajo carga.\nRecomendada para setups gamer exigentes y estaciones de trabajo avanzadas.",
    precio: 254999,
    imagenes: [
      "/productos/mother-003-principal.jpg",
      "/productos/mother-003-img2.jpg",
      "/productos/mother-003-img3.jpg",
    ],
    categoria: "Mothers",
    enStock: true,
  },

  // Fuentes
  {
    id: "fuente-001",
    nombre: "Fuente Corsair CV550 550W 80+ Bronze",
    descripcion:
      "Fuente ATX de 550W con certificación 80 Plus Bronze para mayor eficiencia.\nVentilador silencioso de 120mm con control térmico para menor ruido.\nProtecciones eléctricas completas contra sobrecarga, sobretensión y cortocircuitos.\nIdeal para PCs gamer de entrada y equipos de oficina de alto uso.",
    precio: 119999,
    imagenes: [
      "/productos/fuente-001-principal.jpg",
      "/productos/fuente-001-img2.jpg",
      "/productos/fuente-001-img3.jpg",
    ],
    categoria: "Fuentes",
    enStock: true,
  },
  {
    id: "fuente-002",
    nombre: "Fuente XPG Core Reactor 750W 80+ Gold",
    descripcion:
      "PSU de 750W full modular con certificación 80 Plus Gold de alta eficiencia.\nCapacitores japoneses y topología premium para voltajes estables y durabilidad.\nIncluye cables mallados y múltiples conectores para GPUs de nueva generación.\nPerfecta para builds de gama media/alta con margen para futuras actualizaciones.",
    precio: 214999,
    imagenes: [
      "/productos/fuente-002-principal.jpg",
      "/productos/fuente-002-img2.jpg",
      "/productos/fuente-002-img3.jpg",
    ],
    categoria: "Fuentes",
    enStock: true,
  },
  {
    id: "fuente-003",
    nombre: "Fuente Cooler Master MWE 850 V2 80+ Gold",
    descripcion:
      "Fuente de alimentación 850W diseñada para configuraciones gamer de alto consumo.\nCertificación Gold y línea de 12V estable para sostener CPU y GPU exigentes.\nModo de operación silencioso con ventilador HDB y excelente flujo térmico.\nCompatible con equipos de última generación y upgrades de largo plazo.",
    precio: 279999,
    imagenes: [
      "/productos/fuente-003-principal.jpg",
      "/productos/fuente-003-img2.jpg",
      "/productos/fuente-003-img3.jpg",
    ],
    categoria: "Fuentes",
    enStock: true,
  },

  {
    id: "cooler-001",
    nombre: "Cooler CPU ID-Cooling SE-214-XT",
    descripcion:
      "Disipador por aire de torre con ventilador de 120 mm.\nCubre sockets AM5, AM4 y LGA1700.\nBase de contacto directo y altura contenida para la mayoría de los gabinetes.\nOpción silenciosa para procesadores de hasta 180 W.",
    precio: 34999,
    imagenes: [
      "/productos/cooler-001-principal.jpg",
      "/productos/cooler-001-img2.jpg",
      "/productos/cooler-001-img3.jpg",
    ],
    categoria: "Coolers",
    enStock: true,
  },
  {
    id: "cooler-002",
    nombre: "Cooler líquido Deepcool LS520 240 mm",
    descripcion:
      "AIO de 240 mm con dos ventiladores.\nCubre sockets AM5 y LGA1700.\nRadiador para procesadores de alto consumo.\nBomba silenciosa y tubos con funda.",
    precio: 89999,
    imagenes: [
      "/productos/cooler-002-principal.jpg",
      "/productos/cooler-002-img2.jpg",
      "/productos/cooler-002-img3.jpg",
    ],
    categoria: "Coolers",
    enStock: true,
  },

  // Sillas Gamers
  {
    id: "silla-001",
    nombre: "Silla Gamer Corsair T3 Rush",
    descripcion:
      "Silla ergonómica premium con respaldo reclinable y almohadas cervical/lumbar.\nTapizado transpirable de alta calidad para sesiones largas de juego o trabajo.\nApoyabrazos 4D ajustables y base metálica reforzada para máxima estabilidad.\nPensada para confort prolongado con estética gamer profesional.",
    precio: 539999,
    imagenes: [
      "/productos/silla-001-principal.jpg",
      "/productos/silla-001-img2.jpg",
      "/productos/silla-001-img3.jpg",
    ],
    categoria: "Sillas Gamers",
    enStock: true,
  },
  {
    id: "silla-002",
    nombre: "Silla Gamer Redragon Metis Pro",
    descripcion:
      "Diseño deportivo con estructura robusta y espuma de alta densidad.\nRespaldo reclinable hasta 180 grados para descanso entre partidas intensas.\nIncluye apoyabrazos regulables y mecanismo de balanceo suave y estable.\nExcelente elección para escritorios gamer con gran relación costo-beneficio.",
    precio: 349999,
    imagenes: [
      "/productos/silla-002-principal.jpg",
      "/productos/silla-002-img2.jpg",
      "/productos/silla-002-img3.jpg",
    ],
    categoria: "Sillas Gamers",
    enStock: true,
  },
  {
    id: "silla-003",
    nombre: "Silla Gamer DXRacer Formula Series",
    descripcion:
      "Silla gamer icónica con estructura de acero y acabado premium duradero.\nSoporte lumbar ajustable y cabecera acolchada para postura saludable.\nRuedas silenciosas y pistón de clase 4 para ajuste de altura preciso.\nIdeal para streamers y usuarios que priorizan ergonomía y estilo.",
    precio: 589999,
    imagenes: [
      "/productos/silla-003-principal.jpg",
      "/productos/silla-003-img2.jpg",
      "/productos/silla-003-img3.jpg",
    ],
    categoria: "Sillas Gamers",
    enStock: true,
  },

  // Periféricos
  {
    id: "periferico-001",
    nombre: "Combo Periféricos Logitech MK345",
    descripcion:
      "Combo inalámbrico de teclado y mouse con conexión estable de largo alcance.\nTeclado tamaño completo con descanso para manos y teclas multimedia dedicadas.\nMouse ergonómico con sensor preciso para uso diario y productividad.\nSolución completa para oficina y home setup con gran autonomía de batería.",
    precio: 89999,
    imagenes: [
      "/productos/periferico-001-principal.jpg",
      "/productos/periferico-001-img2.jpg",
      "/productos/periferico-001-img3.jpg",
    ],
    categoria: "Periféricos",
    enStock: true,
  },
  {
    id: "periferico-002",
    nombre: "Teclado Mecánico HyperX Alloy Origins",
    descripcion:
      "Teclado mecánico compacto con switches lineales de respuesta rápida.\nEstructura de aluminio aeronáutico y retroiluminación RGB personalizable.\nCuenta con anti-ghosting completo y perfiles onboard para torneos.\nRecomendado para jugadores competitivos que buscan precisión y durabilidad.",
    precio: 164999,
    imagenes: [
      "/productos/periferico-002-principal.jpg",
      "/productos/periferico-002-img2.jpg",
      "/productos/periferico-002-img3.jpg",
    ],
    categoria: "Periféricos",
    enStock: true,
  },
  {
    id: "periferico-003",
    nombre: "Mouse Logitech G502 HERO",
    descripcion:
      "Mouse gamer con sensor HERO de alta precisión y peso configurable.\nIncluye 11 botones programables para macros en juegos y productividad.\nIluminación RGB LIGHTSYNC y switches mecánicos de larga vida útil.\nAgarre cómodo y control total para FPS, MOBA y uso intensivo.",
    precio: 129999,
    imagenes: [
      "/productos/periferico-003-principal.jpg",
      "/productos/periferico-003-img2.jpg",
      "/productos/periferico-003-img3.jpg",
    ],
    categoria: "Periféricos",
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

export const productosDestacados: Producto[] =
  productosDestacadosBase.map(normalizarProducto);

export const productosRebajados: Producto[] =
  productosRebajadosBase.map(normalizarProducto);

// ── Últimas novedades ──
export const ultimasNovedades: Novedad[] = [
  {
    id: "nov-001",
    categoria: "PLACAS DE VIDEO RADEON AMD",
    titulo: "RX 9070 XT 16GB Ultra Power",
    precio: 1187300,
    imagen: "/productos/rx-9070xt-principal.jpg",
    enlace: "/producto/rx-9070xt",
  },
  {
    id: "nov-002",
    categoria: "PLACAS DE RED INALÁMBRICAS",
    titulo: "AX3000: Velocidad real",
    precio: 45800,
    imagen: "/productos/placa-red-ax3000-principal.jpg",
    enlace: "/producto/placa-red-ax3000",
  },
  {
    id: "nov-003",
    categoria: "MONITORES Y PANTALLAS",
    titulo: 'Samsung G9 49" Potencia Total',
    precio: 1758600,
    imagen: "/productos/samsung-g9-49-principal.jpg",
    enlace: "/producto/samsung-g9-49",
  },
  {
    id: "nov-004",
    categoria: "NOTEBOOKS",
    titulo: "Vivobook 15 R7 Potencia PRO",
    precio: 1372400,
    imagen: "/productos/vivobook-15-r7-principal.jpg",
    enlace: "/producto/vivobook-15-r7",
  },
  {
    id: "nov-005",
    categoria: "CONSOLAS",
    titulo: "Jugá donde quieras",
    precio: 1106800,
    imagen: "/productos/consola-ps5-principal.jpg",
    enlace: "/producto/consola-ps5",
  },
];

const productosDesdeNovedades: Producto[] = ultimasNovedades.map((novedad) => {
  const idProducto = obtenerIdDesdeEnlaceProducto(novedad.enlace);
  return {
    id: idProducto,
    nombre: novedad.titulo,
    descripcion: asegurarDescripcionCuatroLineas(
      `Producto destacado en novedades (${novedad.categoria}).`,
      novedad.titulo,
      novedad.categoria
    ),
    precio: novedad.precio,
    categoria: novedad.categoria,
    enStock: true,
    imagenes: asegurarTresImagenes([novedad.imagen], idProducto),
  };
});

const mapaCatalogo = new Map<string, Producto>();
[...productosDestacados, ...productosRebajados, ...productosDesdeNovedades].forEach(
  (producto) => {
    if (!mapaCatalogo.has(producto.id)) {
      mapaCatalogo.set(producto.id, producto);
    }
  }
);

export const catalogoCompleto: Producto[] = Array.from(mapaCatalogo.values());
