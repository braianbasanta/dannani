export interface MenuItem {
  name: string;
  description?: string;
  price: string;
  /** Precio en formato 33cm, solo para locales take away con doble tamaño (24/33cm). */
  price33?: string;
  /** URL del video corto del plato en Vercel Blob, si existe. */
  video?: string;
  /** URL del póster (frame estático) del video, si existe. */
  poster?: string;
  /** URL de una foto del producto en Vercel Blob, para platos/bebidas sin video. */
  photo?: string;
  /** Apto para vegetarianos. Se define en items de secciones "comida"; no aplica a "bebidas". */
  vegetarian?: boolean;
}

export interface MenuSection {
  id: string;
  title: string;
  /** Agrupa la sección para el selector Comida/Bebidas y el filtro vegetariano. */
  category: "comida" | "bebidas";
  /** Nota o aclaración de la sección (p.ej. disponibilidad, extras). */
  note?: string;
  items: MenuItem[];
}

/**
 * Cartas reales de los 6 locales Da Nanni, transcritas de las cartas
 * oficiales entregadas por el cliente. Los locales take away (Gòtic y
 * Raval Take Away) comparten la misma carta de pizza al corte en formato
 * 24cm/33cm (`price` / `price33`, jul. 2026). Born, Poblenou y Raval
 * (Tallers 69) comparten también una única carta de mesa (jul. 2026).
 * Gràcia mantiene su propia carta, más extensa.
 */

const pizzaTakeAway: MenuSection[] = [
  {
    id: "pizze",
    title: "Pizze",
    category: "comida",
    note: "Las pizzas más pequeñas (24 cm) solo están disponibles hasta las 16:00h.",
    items: [
      { name: "Margherita", description: "Tomate San Marzano, mozzarella FDL, albahaca y AOVE.", price: "3,50€", price33: "7,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/margherita.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/margherita.jpg", vegetarian: true },
      { name: "Marinara", description: "Tomate San Marzano, ajo, orégano y AOVE.", price: "3,00€", price33: "6,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/marinara.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/marinara.jpg", vegetarian: true },
      { name: "Cosacca Partenopea", description: "Tomate San Marzano, parmesano, salame napoletano, albahaca y AOVE.", price: "4,00€", price33: "8,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/cosacca-partenopea.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/cosacca-partenopea.jpg", vegetarian: false },
      { name: "Diavola", description: "Tomate San Marzano, mozzarella FDL y salami picante.", price: "5,00€", price33: "10,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/diavola.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/diavola.jpg", vegetarian: false },
      { name: "Verace Estiva", description: "Tomate, tomates cherry, mozzarella de búfala, orégano y albahaca.", price: "5,50€", price33: "11,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/verace-estiva.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/verace-estiva.jpg", vegetarian: true },
      { name: "Jamón Dulce", description: "Tomate San Marzano, FDL, jamón dulce y albahaca.", price: "5,50€", price33: "11,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/jamon-dulce.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/jamon-dulce.jpg", vegetarian: false },
      { name: "Vegana", description: "Tomate San Marzano, pimientos, berenjena, calabacín y champiñones.", price: "5,50€", price33: "11,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/vegana.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/vegana.jpg", vegetarian: true },
      { name: "Bufalina", description: "Tomate San Marzano, mozzarella di bufala, albahaca y AOVE.", price: "6,00€", price33: "12,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/bufalina.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/bufalina.jpg", vegetarian: true },
      { name: "Jamón Dulce y Champiñones", description: "Tomate San Marzano, FDL, jamón dulce, champiñones y albahaca.", price: "6,00€", price33: "12,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/jamon-dulce-y-champinones.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/jamon-dulce-y-champinones.jpg", vegetarian: false },
      { name: "Panceta y Champiñones", description: "Tomate San Marzano, FDL, panceta, champiñones y albahaca.", price: "6,00€", price33: "12,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/panceta-y-champinones.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/panceta-y-champinones.jpg", vegetarian: false },
      { name: "Tropea", description: "Tomates cherry, FDL, atún, cebolla y aceitunas.", price: "6,00€", price33: "12,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/tropea.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/tropea.jpg", vegetarian: false },
      { name: "Napoletana", description: "Tomate San Marzano, mozzarella FDL, anchoas, olivas y orégano.", price: "6,00€", price33: "12,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/napoletana.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/napoletana.jpg", vegetarian: false },
      { name: "Capricciosa", description: "Tomate San Marzano, FDL, jamón dulce, champiñones, aceitunas, alcachofas y albahaca.", price: "6,50€", price33: "13,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/capricciosa.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/capricciosa.jpg", vegetarian: false },
      { name: "Vegetariana", description: "Tomate San Marzano, FDL, berenjena, calabacín y champiñones.", price: "6,50€", price33: "13,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/vegetariana.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/vegetariana.jpg", vegetarian: true },
      { name: "Provola y Cabra", description: "Tomate provola, berenjena, queso de cabra, miel y albahaca.", price: "6,50€", price33: "13,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/provola-y-cabra.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/provola-y-cabra.jpg", vegetarian: true },
      { name: "4 Quesos", description: "Mozzarella, próvola ahumada, ricotta, gorgonzola, queso de cabra y albahaca.", price: "6,50€", price33: "13,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/4-quesos.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/4-quesos.jpg", vegetarian: true },
      { name: "Salsiccia e Friarielli", description: "Próvola, salchicha italiana, friarielli y albahaca.", price: "6,50€", price33: "13,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/salsiccia-e-friarielli.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/salsiccia-e-friarielli.jpg", vegetarian: false },
      { name: "Primavera", description: "Tomates cherry, mozzarella, pesto, rúcula y albahaca.", price: "6,50€", price33: "13,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/primavera.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/primavera.jpg", vegetarian: true },
      { name: "Calzone Classico", description: "Tomate, mozzarella, ricotta, salami dulce y albahaca.", price: "6,50€", price33: "13,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/calzone-classico.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/calzone-classico.jpg", vegetarian: false },
      { name: "Mortadella", description: "Mozzarella, mortadela, ricotta, pistacho y albahaca.", price: "7,00€", price33: "14,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/mortadella.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/mortadella.jpg", vegetarian: false },
      { name: "Carbonara", description: "Próvola, panceta, crema de huevo, pecorino y pimienta negra.", price: "7,00€", price33: "14,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/carbonara.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/carbonara.jpg", vegetarian: false },
      { name: "Sofia Loren", description: "Mozzarella, tomates cherry, rúcula, jamón curado y parmesano.", price: "7,50€", price33: "15,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/sofia-loren.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/sofia-loren.jpg", vegetarian: false },
      { name: "Tartufata", description: "Crema de trufa, mozzarella, salchicha italiana y champiñones.", price: "7,50€", price33: "15,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/tartufata.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/tartufata.jpg", vegetarian: false },
      { name: "Nutella", description: "Nutella, pistacho y azúcar glas.", price: "9,90€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/nutella.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/take-away/nutella.jpg", vegetarian: true },
    ],
  },
  {
    id: "bebidas",
    title: "Bebidas",
    category: "bebidas",
    items: [
      { name: "Agua", price: "2,50€" },
      { name: "Refrescos", price: "2,50€" },
      { name: "Birre Italiane", price: "3,50€" },
    ],
  },
];

const bornPoblenouTallers69: MenuSection[] = [
  {
    id: "pizze",
    title: "Pizze",
    category: "comida",
    items: [
      { name: "Margherita", description: "Tomate San Marzano, mozzarella FDL, albahaca y AOVE.", price: "10,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/margherita.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/margherita.jpg", vegetarian: true },
      { name: "Provola e Pepe", description: "Tomate San Marzano, próvola y pimienta negra.", price: "12,50€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/provola-e-pepe.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/provola-e-pepe.jpg", vegetarian: true },
      { name: "Marinara", description: "Tomate San Marzano, ajo, orégano y AOVE.", price: "8,50€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/marinara.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/marinara.jpg", vegetarian: true },
      { name: "Napoletana", description: "Tomate San Marzano, mozzarella FDL, anchoas, olivas y orégano.", price: "14,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/napoletana.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/napoletana.jpg", vegetarian: false },
      { name: "Diavola", description: "Tomate San Marzano, mozzarella FDL y salami picante.", price: "12,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/diavola.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/diavola.jpg", vegetarian: false },
      { name: "Prosciutto e funghi", description: "Tomate San Marzano, mozzarella FDL, jamón dulce y champiñones.", price: "14,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/prosciutto-e-funghi.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/prosciutto-e-funghi.jpg", vegetarian: false },
      { name: "Vegetariana", description: "Base blanca con FDL y verduras de temporada seleccionadas.", price: "14,50€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/vegetariana.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/vegetariana.jpg", vegetarian: true },
      { name: "Tropea", description: "Tomates cherry, FDL, atún, cebolla y aceitunas.", price: "15,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/tropea.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/tropea.jpg", vegetarian: false },
      { name: "Wurstel e Patatine", description: "Wurstel, FDL, patatas fritas y AOVE.", price: "16,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/wurstel-e-patatine.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/wurstel-e-patatine.jpg", vegetarian: false },
      { name: "Calzone classico", description: "Ricotta, FDL, Tomate San Marzano, Salami Napoli y pimienta negra.", price: "16,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/calzone-classico.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/calzone-classico.jpg", vegetarian: false },
      { name: "Carrettiera", description: "Próvola, butifarra napoletana y friarielli.", price: "16,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/carrettiera.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/carrettiera.jpg", vegetarian: false },
      { name: "Capricciosa", description: "Tomate San Marzano, FDL, jamón dulce, aceitunas, alcachofas y albahaca.", price: "17,50€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/capricciosa.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/capricciosa.jpg", vegetarian: false },
    ],
  },
  {
    id: "pizze-gourmet",
    title: "Pizze Gourmet",
    category: "comida",
    items: [
      { name: "Pizza fritta", description: "Tomate San Marzano, próvola, cicoli, parmesano, ricotta y pimienta.", price: "17,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/pizza-fritta.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/pizza-fritta.jpg", vegetarian: false },
      { name: "La mortadella", description: "Próvola, mortadella, burrata y pesto de pistacho.", price: "18,50€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/la-mortadella.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/la-mortadella.jpg", vegetarian: false },
      { name: "La carbonara", description: "Próvola, guanciale, huevo, queso pecorino y pimienta negra.", price: "19,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/la-carbonara.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/la-carbonara.jpg", vegetarian: false },
      { name: "Zingara", description: "FDL, tomate cherry, jamón de Parma, ensalada iceberg y mayonesa casera.", price: "20,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/zingara.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/zingara.jpg", vegetarian: false },
      { name: "Sorrento", description: "Próvola, tomatito amarillo, ricotta al limón, jamón de Parma, ralladura de limón y albahaca.", price: "20,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/sorrento.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/sorrento.jpg", vegetarian: false },
      { name: "Formaggiosa", description: "FDL, gorgonzola, queso de cabra, ricotta y crema de parmesano.", price: "18,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/formaggiosa.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/formaggiosa.jpg", vegetarian: true },
      { name: "Tartufata", description: "Crema de parmesano trufado, jamón dulce, crema trufada, chips de Parmigiano y albahaca.", price: "22,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/tartufata.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/tartufata.jpg", vegetarian: false },
    ],
  },
  {
    id: "insalate",
    title: "Insalate",
    category: "comida",
    items: [
      { name: "Burrata", description: "Burrata, tomates cherry, rúcula, jamón de Parma y AOVE.", price: "16,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/burrata.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/burrata.jpg", vegetarian: false },
      { name: "Ischitana", description: "Atún, tomates secos, aceitunas verdes, crostones de pan, cebolla morada y aceite aromatizado al tomate.", price: "16,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/ischitana.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/ischitana.jpg", vegetarian: false },
      { name: "César Salad", description: "Tiras de pechuga de pollo a la parrilla, ensalada, tomatito cherry, dados de pan crujientes y salsa César.", price: "18,50€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/cesar-salad.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/cesar-salad.jpg", vegetarian: false },
      { name: "Mediterranea", description: "Huevos cocidos, lechuga, filetes de atún, tomatito cherry, aceitunas negras, dados de pan tostado y vinagreta de mostaza.", price: "16,50€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/mediterranea.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/mediterranea.jpg", vegetarian: false },
      { name: "Puttanesca", description: "Láminas de bacalao, patatas, aceitunas taggiasche, alcaparras, tomates secos y migas de pan crujiente aromatizado.", price: "19,50€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/puttanesca.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/puttanesca.jpg", vegetarian: false },
    ],
  },
  {
    id: "antipasti",
    title: "Antipasti",
    category: "comida",
    items: [
      { name: "Parmigiana di melanzane", description: "Pastel de berenjena con tomate y próvola.", price: "15,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/parmigiana-di-melanzane.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/parmigiana-di-melanzane.jpg", vegetarian: true },
      { name: "Bruschette ai pomodorini (4 uds)", description: "Pan casero tostado al horno de leña con tomate, ajo y albahaca.", price: "14,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/bruschette-ai-pomodorini.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/bruschette-ai-pomodorini.jpg", vegetarian: true },
      { name: "Polpette al ragù", description: "Albóndigas caseras cocinadas lentamente en salsa ragú tradicional.", price: "15,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/polpette-al-ragu.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/polpette-al-ragu.jpg", vegetarian: false },
      { name: "Tagliere misto", description: "Selección de embutidos y quesos italianos con focaccia al romero.", price: "22,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/tagliere-misto.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/tagliere-misto.jpg", vegetarian: false },
    ],
  },
  {
    id: "fritti",
    title: "Fritti",
    category: "comida",
    items: [
      { name: "Crocchè di patate (1 ud)", description: "Croqueta de patata con próvola, sal, pimienta y perejil.", price: "4,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/crocche-di-patate.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/crocche-di-patate.jpg", vegetarian: true },
      { name: "Frittatina (1 ud)", description: "Pasta en tempura con bechamel, guisantes y carne picada.", price: "4,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/frittatina.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/frittatina.jpg", vegetarian: false },
      { name: "Arancino di riso (1 ud)", description: "Bola de arroz frita rellena de ragù napolitano, guisantes y próvola.", price: "4,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/arancino-di-riso.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/arancino-di-riso.jpg", vegetarian: false },
      { name: "Fiore di zucca (1 ud, según temporada)", description: "Flor de calabacín rebozada rellena de ricotta y próvola.", price: "5,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/fiore-di-zucca.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/fiore-di-zucca.jpg", vegetarian: true },
      { name: "Tris di montanarine (3 uds)", description: "Masa de pizza frita con salsa de ragù y albahaca, salsa genovese (cebolla), o ricotta, mortadela y pesto de pistacho.", price: "14,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/tris-di-montanarine.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/tris-di-montanarine.jpg", vegetarian: false },
    ],
  },
  {
    id: "i-primi",
    title: "I Primi",
    category: "comida",
    note: "Disponible también en pasta sin gluten (+2€) en Ziti Mare e Sole y Spaghetti al lo scoglio.",
    items: [
      { name: "Gnocchi alla Sorrentina", description: "Próvola, salsa de tomate, parmesano y pimienta.", price: "15,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/gnocchi-alla-sorrentina.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/gnocchi-alla-sorrentina.jpg", vegetarian: true },
      { name: "Mezzanelli alla Genovese", description: "Ragú de cebolla con carne de ternera, parmesano y pimienta.", price: "17,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/mezzanelli-alla-genovese.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/mezzanelli-alla-genovese.jpg", vegetarian: false },
      { name: "Ziti Mare e Sole", description: "Ziti con crema de tomates amarillos, bacalao y polvo de aceitunas negras.", price: "19,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/ziti-mare-e-sole.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/ziti-mare-e-sole.jpg", vegetarian: false },
      { name: "Spaghetti alla Nerano", description: "Crema de calabacín, provolone del Mónaco y chips de calabacín.", price: "16,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/spaghetti-alla-nerano.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/spaghetti-alla-nerano.jpg", vegetarian: true },
      { name: "Fettuccine alla Bolognese", description: "Pasta fresca con ragú de carne picada.", price: "16,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/fettuccine-alla-bolognese.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/fettuccine-alla-bolognese.jpg", vegetarian: false },
      { name: "Spaghetti alla carbonara", description: "Huevo, guanciale, pecorino y pimienta.", price: "17,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/spaghetti-alla-carbonara.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/spaghetti-alla-carbonara.jpg", vegetarian: false },
      { name: "Spaghetti pomodoro fresco", description: "Tomates cherry, parmesano y albahaca.", price: "14,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/spaghetti-pomodoro-fresco.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/spaghetti-pomodoro-fresco.jpg", vegetarian: true },
      { name: "Lasagna Napoletana", description: "Ragú napolitano, carne picada, huevo duro, ricotta y próvola.", price: "18,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/lasagna-napoletana.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/lasagna-napoletana.jpg", vegetarian: false },
      { name: "Spaghetti al lo scoglio", description: "Mixto de mariscos con pasta.", price: "24,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/spaghetti-al-lo-scoglio.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/spaghetti-al-lo-scoglio.jpg", vegetarian: false },
      { name: "Ziti alla Norma", description: "Salsa de tomate, berenjena frita, ricotta salata rallada y albahaca.", price: "18,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/ziti-alla-norma.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/ziti-alla-norma.jpg", vegetarian: true },
      { name: "Gnocchetti Mediterranei", description: "Gnocchetti con bisque de gambas, stracciatella y ralladura de limón.", price: "21,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/gnocchetti-mediterranei.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/gnocchetti-mediterranei.jpg", vegetarian: false },
      { name: "Paccheri Mare e orto", description: "Pasta típica campana mantecada con crema de pimientos verdes, mejillones y pecorino Romano.", price: "20,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/paccheri-mare-e-orto.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/paccheri-mare-e-orto.jpg", vegetarian: false },
      { name: "Risotto alle verdurine", description: "Arroz Carnaroli con verduras en daditos y una mantecatura al mascarpone.", price: "18,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/risotto-alle-verdurine.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/risotto-alle-verdurine.jpg", vegetarian: true },
    ],
  },
  {
    id: "i-secondi",
    title: "I Secondi",
    category: "comida",
    items: [
      { name: "Tagliata di Manzo", description: "Filete de ternera a la parrilla con mezclum fino, manzana verde crujiente, nueces y láminas de Parmigiano.", price: "23,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/tagliata-di-manzo.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/tagliata-di-manzo.jpg", vegetarian: false },
      { name: "Scaloppa di Pollo al Limone", description: "Filetes de pollo desglasados con limón y vino blanco, servidos con ensalada mixta y tomatitos cherry.", price: "18,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/scaloppa-di-pollo-al-limone.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/scaloppa-di-pollo-al-limone.jpg", vegetarian: false },
      { name: "Cotoletta alla milanese con patate", description: "Milanesa de ternera con patatas fritas.", price: "18,50€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/cotoletta-alla-milanese-con-patate.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/cotoletta-alla-milanese-con-patate.jpg", vegetarian: false },
      { name: "Baccalà in Cassuola", description: "Lomo de bacalao guisado con crema de tomates cherry, aceitunas negras y alcaparras.", price: "22,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/baccala-in-cassuola.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/baccala-in-cassuola.jpg", vegetarian: false },
      { name: "Frittura mista di pescado", description: "Fritura mixta de pescado del día acompañada de juliana de verduras de temporada.", price: "22,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/frittura-mista-di-pescado.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/frittura-mista-di-pescado.jpg", vegetarian: false },
    ],
  },
  {
    id: "dolci",
    title: "Dolci",
    category: "comida",
    items: [
      { name: "Tiramisù", price: "7,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/tiramisu.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/tiramisu.jpg", vegetarian: true },
      { name: "Pan di stelle", price: "7,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/pan-di-stelle.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/pan-di-stelle.jpg", vegetarian: true },
      { name: "Babà", price: "7,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/baba.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/baba.jpg", vegetarian: true },
      { name: "Cheesecake", price: "7,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/cheesecake.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/cheesecake.jpg", vegetarian: true },
    ],
  },
  {
    id: "vini-rossi",
    title: "Vini Rossi",
    category: "bebidas",
    items: [
      { name: "Licurti Primitivo di Manduria D.O.P.", price: "29,00€" },
      { name: "Campostellato Villa Matilde IGP", price: "23,00€", photo: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/photos/bebidas/campostellato-rosso.jpg" },
      { name: "Aglianico Irpinia DOC", price: "25,00€" },
      { name: "Lambrusco Gabriele e Margherita", price: "18,00€" },
    ],
  },
  {
    id: "vini-bianchi",
    title: "Vini Bianchi",
    category: "bebidas",
    items: [
      { name: "Pinot Grigio San Marco", price: "20,00€" },
      { name: "Campostellato Bianco Villa Matilde IGP", price: "23,00€", photo: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/photos/bebidas/campostellato-bianco.jpg" },
      { name: "Vermentino Primo Bianco", price: "25,00€" },
      { name: "Pecorino IGP BIO", price: "23,00€" },
      { name: "Passerina Vigna Madre", price: "22,00€" },
      { name: "Conca D'Oro Cuvée Nobile Brut", price: "25,00€" },
    ],
  },
  {
    id: "vini-rosato",
    title: "Rosato",
    category: "bebidas",
    items: [
      { name: "Lambrusco Rosato Gabriele e Margherita", price: "20,00€" },
      { name: "Bardolino Chiaretto di Pasqua", price: "22,00€", photo: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/photos/bebidas/chiaretto-pasqua.jpg" },
    ],
  },
  {
    id: "birre-artigianali",
    title: "Birre Artigianali",
    category: "bebidas",
    items: [
      { name: "Amarcord Lager Chiara", price: "5,00€" },
      { name: "Amarcord Sin Gluten", price: "5,50€" },
      { name: "Amarcord Red Ale", price: "5,50€" },
      { name: "Amarcord IPA", price: "5,50€" },
    ],
  },
  {
    id: "chupitos-licores",
    title: "Chupitos y Licores",
    category: "bebidas",
    items: [
      { name: "Chupitos", price: "3,00€" },
      { name: "Liquori Italiani", price: "4,50€" },
    ],
  },
  {
    id: "bibite",
    title: "Bibite",
    category: "bebidas",
    note: "Suplemento terraza +10%.",
    items: [
      { name: "Agua", price: "3,50€", photo: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/photos/bebidas/agua.jpg" },
      { name: "Agua con gas", price: "4,00€", photo: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/photos/bebidas/agua-con-gas.jpg" },
      { name: "Coca-Cola 35cl", price: "4,00€", photo: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/photos/bebidas/coca-cola.jpg" },
      { name: "Coca-Cola Zero 35cl", price: "4,00€", photo: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/photos/bebidas/coca-cola-zero.jpg" },
      { name: "Fanta Naranja 33cl", price: "4,00€", photo: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/photos/bebidas/fanta-naranja.jpg" },
      { name: "Fanta Lemon 33cl", price: "4,00€", photo: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/photos/bebidas/fanta-lemon.jpg" },
      { name: "Nestea 33cl", price: "4,00€", photo: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/photos/bebidas/nestea.jpg" },
      { name: "Aquarius 33cl", price: "4,00€", photo: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/photos/bebidas/aquarius.jpg" },
      { name: "Peroni Lemon 33cl", price: "4,00€", photo: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/photos/bebidas/peroni-lemon.jpg" },
      { name: "Peroni Mediana 33cl", price: "4,50€", photo: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/photos/bebidas/peroni-mediana.jpg" },
      { name: "Peroni Grande 50cl", price: "6,00€", photo: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/photos/bebidas/peroni-grande.jpg" },
      { name: "Peroni 00 (sin alcohol)", price: "4,50€", photo: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/photos/bebidas/peroni-00.jpg" },
      { name: "Ichnusa 33cl", price: "4,50€", photo: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/photos/bebidas/ichnusa.jpg" },
      { name: "Aperol Spritz", price: "8,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/aperol-spritz.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/aperol-spritz.jpg" },
      { name: "Sangría copa", price: "8,00€", video: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/sangria-copa.mp4", poster: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/videos/dine-in/sangria-copa.jpg" },
      { name: "Sangría jarra", price: "20,00€" },
      { name: "Sangría jarra Cava", price: "22,00€" },
      { name: "Vino blanco copa", price: "6,00€", photo: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/photos/bebidas/campostellato-bianco.jpg" },
      { name: "Vino rosado copa", price: "6,00€", photo: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/photos/bebidas/chiaretto-pasqua.jpg" },
      { name: "Vino tinto copa", price: "6,00€", photo: "https://obmqnxm4jz6jfagp.public.blob.vercel-storage.com/photos/bebidas/campostellato-rosso.jpg" },
    ],
  },
];

/**
 * Carta nueva de Gràcia (jul. 2026, PDF "meno spagnolo gracia" del cliente):
 * adopta la carta de mesa de las trattorias con menos platos — sin I Secondi,
 * sin Puttanesca ni Tagliere misto y con I Primi reducido — más un plato
 * propio (Gnocchi al pesto). Se deriva de `bornPoblenouTallers69` para heredar descripciones
 * y videos; si un nombre deja de existir allí, esto lanza en build
 * (preferimos el fallo ruidoso, como el resolver de featured.ts).
 */
const dineInSection = (id: string): MenuSection => {
  const section = bornPoblenouTallers69.find((s) => s.id === id);
  if (!section) throw new Error(`Sección dine-in no encontrada: ${id}`);
  return section;
};

const dineInItems = (
  id: string,
  names: string[],
  overrides: Record<string, Partial<MenuItem>> = {}
): MenuItem[] =>
  names.map((name) => {
    const item = dineInSection(id).items.find((i) => i.name === name);
    if (!item) throw new Error(`Plato dine-in no encontrado: ${id}/${name}`);
    return overrides[name] ? { ...item, ...overrides[name] } : item;
  });

const gracia: MenuSection[] = [
  dineInSection("pizze"),
  dineInSection("pizze-gourmet"),
  {
    id: "insalate",
    title: "Insalate",
    category: "comida",
    items: dineInItems("insalate", [
      "Burrata",
      "Ischitana",
      "César Salad",
      "Mediterranea",
    ]),
  },
  {
    id: "antipasti",
    title: "Antipasti",
    category: "comida",
    items: dineInItems("antipasti", [
      "Parmigiana di melanzane",
      "Bruschette ai pomodorini (4 uds)",
      "Polpette al ragù",
    ]),
  },
  dineInSection("fritti"),
  {
    id: "i-primi",
    title: "I Primi",
    category: "comida",
    note: "Disponible pasta sin gluten (+2€).",
    items: [
      ...dineInItems("i-primi", [
        "Gnocchi alla Sorrentina",
        "Mezzanelli alla Genovese",
        "Fettuccine alla Bolognese",
        "Spaghetti alla carbonara",
        "Spaghetti pomodoro fresco",
        "Spaghetti alla Nerano",
        "Ziti alla Norma",
      ]),
      { name: "Gnocchi al pesto", description: "Gnocchi con pesto de albahaca fresca.", price: "15,00€", vegetarian: true },
    ],
  },
  dineInSection("dolci"),
  dineInSection("vini-rossi"),
  dineInSection("vini-bianchi"),
  dineInSection("vini-rosato"),
  dineInSection("birre-artigianali"),
  dineInSection("chupitos-licores"),
  dineInSection("bibite"),
];

/** slugs de locales, todos con carta confirmada */
export const menuByLocationSlug: Record<string, MenuSection[]> = {
  gotic: pizzaTakeAway,
  "raval-take-away": pizzaTakeAway,
  gracia,
  poblenou: bornPoblenouTallers69,
  raval: bornPoblenouTallers69,
  born: bornPoblenouTallers69,
};
