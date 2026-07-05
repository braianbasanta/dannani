export interface Review {
  author: string;
  /** Texto literal de la reseña en Google (recortado con criterio, sin reescribir). */
  text: string;
}

/**
 * Reseñas destacadas reales de Google Business por local (snapshot jul. 2026).
 * Se muestran en su idioma original: son citas literales verificables en la
 * ficha de Google de cada local.
 */
export const reviewsByLocationSlug: Record<string, Review[]> = {
  gotic: [
    {
      author: "Perico Polite",
      text: "Me adentré en Pizzeria Da Nanni con ganas de una pizza ligera pero auténtica, tras pasear por el Gòtic. Lo primero que me llamó la atención fue el ambiente sencillo: un local compacto, masa fina, horno visible y buena variedad en el menú. Pedí una pizza margherita y estaba bien resuelta: la masa tenía buen alzado, borde ligeramente ahumado, y buen sabor. Me gustó que hay opciones de pizzas de 33 cm a buen precio y también formatos más pequeños \"take away\" de 24 cm.",
    },
    {
      author: "silvia afonso ginja",
      text: "La espera no fue muy larga, pero el sitio está organizado y se espera bien en la calle. La pizza buenísima y calentita.",
    },
    {
      author: "Daniela Barreto Batlle",
      text: "Un lugar perfecto si buscas algo bueno, bonito y barato. Todo lo hacen al momento y en unos 10 minutos tienes tu pizza lista. Es un local solo para llevar, ideal si estás con prisa o tienes un presupuesto ajustado.",
    },
    {
      author: "Jana Luna",
      text: "Muy buen precio y la pizza buenísima!",
    },
    {
      author: "caisrero",
      text: "Un auténtico descubrimiento al lado del trabajo. Calidad y precio en todo el centro de Barcelona. Pizzas para llevar hechas al momento con producto de primera calidad y una masa que te invita a comerte los bordes. Mis favoritas: la trufa y la de pistacho.",
    },
    {
      author: "Katherine Belisario",
      text: "Lo he descubierto gracias a Instagram, y tal y como ponía el vídeo, unas pizzas buenísimas y baratas! Hemos comido las margheritas y de verdad hemos quedado muy contentos. Eso sí, no es para comer en el sitio, todo para llevar.",
    },
    {
      author: "Carlos Caviedes Sepulveda",
      text: "Excelente pizza si quieres algo a buen precio, pizza tradicional italiana, tiene gran variedad.",
    },
    {
      author: "Luis Quiles",
      text: "Deliciosa pizza napolitana! En Barcelona, cuentan con una excelente variedad de pizzas con varias combinaciones exquisitas. El personal es muy amable, en especial la chica que nos tomó la orden fue muy atenta y nos recomendó la pizza \"Parma\". Son rápidos, no te vayas lejos.",
    },
    {
      author: "Julia Venegas",
      text: "El sitio es pequeño pero la pizza es espectacular. Se parece a la original, que solamente he comido en Italia. Los chicos son italianos y la masa se siente suave. A veces hay que esperar porque hay muchísimas personas, pero vale la pena. Son pizzas pequeñas, a 3 y 4 euros, pero es de las mejores de toda Barcelona.",
    },
    {
      author: "Cristina G",
      text: "Sitio muy acogedor y bonito, con decoración cuidada al detalle y muy fresquito en verano. El servicio es majísimo, son napolitanos y muy agradables. Las pizzas son finitas pero la corteza gordita y muy ricas, las hacen en horno de leña. El precio muy razonable por la zona en que está.",
    },
    {
      author: "Marta V.",
      text: "Nos gustó mucho. Pizzas caseras hechas al momento en horno de leña. La masa buenísima, mucha variedad a elegir y precios baratos. El personal amable. Nosotros fuimos a la que tienen en Cl Llibreteria y no es un sitio al que ir si quieres sentarte tranquilamente con unos amigos, ya que sólo hay una barra y algunas sillas.",
    },
    {
      author: "Juan Manuel Cotolio",
      text: "Probablemente la mejor pizza de Barcelona!! Probé la diavola y la 4 formaggio, 10/10. La atención de la chica de Nápoles muy predispuesta y buena onda. La recomendaré a mis amigos que viajen a Barcelona.",
    },
    {
      author: "Maria Balmaña Gallego",
      text: "Simplemente espectacular. Se come increíble y el camarero muy amable y servicial.",
    },
    {
      author: "Iván Richuelo",
      text: "Todo espectacular, mis pizzas favoritas. El postre de Nutella también una pasada.",
    },
    {
      author: "Sebastián Marmolejo",
      text: "Si uno simplemente camina por carrer Verdi, la principal calle de restauración en el barrio de Gracia en Barcelona, sin mirar o distraído, nunca se enteraría de lo cerca que están pasando de los verdaderos sabores Napolitanos. Por una intuición he decidido entrar a este sitio, y la simple Margherita se convirtió en la más equilibrada combinación de sabores del sur de Italia. Volveré sin ninguna duda.",
    },
    {
      author: "Andrea Marrocco",
      text: "Ha sido una linda sorpresa encontrar este local de comida italiana en calle Verdi. Muy buen servicio, las pastas muy bien preparadas y presentadas, volveremos sin dudas!",
    },
    {
      author: "Gervasio Robles",
      text: "Good place to eat at Barcelona in especial this spot at Carrer dels Tallers, 69, Ciutat Vella, Barcelona. Pizzas are excellent but if you want something different, try the parmegiana and the provola al tomate. Superb!",
    },
    {
      author: "Ainhoa Andreea",
      text: "Hoy fuimos 12 personas sin reserva alguna en busca de un buen sitio en el cual comer. En nada nos montaron una mesa para todos y nos atendieron muy amablemente. La comida fue fantástica y en cuanto a calidad-precio increíble. ¡Lo recomendamos completamente!",
    },
  ],
  "raval-take-away": [
    {
      author: "Andres Plata",
      text: "Pedí la Gorgopica y fue una auténtica sorpresa. La combinación de sabores está perfectamente equilibrada.",
    },
    {
      author: "Claudia Mallea",
      text: "El local es muy acogedor y resulta muy entretenido ver el proceso de elaboración en el momento. La pizza estaba buenísima, con ingredientes frescos. Es un sitio muy cómodo, ideal tanto para un almuerzo rápido como para algo más tranquilo. ¡Muy recomendado!",
    },
    {
      author: "libardo beltran",
      text: "Excelente experiencia. La calidad de la pizza fue muy buena, con ingredientes frescos y una masa perfectamente horneada. Quiero destacar especialmente la atención del chico que me atendió: fue muy amable, atento y profesional en todo momento.",
    },
    {
      author: "Jostin Marcillo",
      text: "El local a pesar de haber estado lleno, la atención y el servicio fue rápida y amable. Lo recomiendo, no tardarás más de 10 min en espera porque las pizzas se hacen volando.",
    },
    {
      author: "Daniela Rodriguez",
      text: "Espectacular pizza… me he sentido como en Nápoles… Atención amable y rápida! Repetiré…",
    },
    {
      author: "Franceska Leguisamo",
      text: "La pizza deliziosa, en el punto correcto, súper rápido, excelente servicio, el ambiente genial con súper buena música, mucha hospitalidad!! Estuvo tan rica que ordenamos otra!!",
    },
    {
      author: "Nathalie Benítez",
      text: "Las pizzas estaban muy buenas, tardaron 5 minutos en servirnos. Tienen terraza fuera y dentro tienen un par de taburetes y una barra para comer. La masa era fina y los bordes gruesos, el queso estaba muy bueno. Sin duda repetiré!",
    },
    {
      author: "Esteban de Souza Menéndez",
      text: "Andaba buscando un lugar bueno, bonito y barato para almorzar, y aquí las pizzas artesanales en horno de leña están increíbles. Tiene precios bastante asequibles y el servicio es muy bueno. Muy recomendable.",
    },
    {
      author: "restitutio integrum",
      text: "Para nosotros fue una experiencia inigualable. Nos encantó el encanto, la calidad y la experiencia con la que fue elaborada esta pizza esencialmente italiana. Lo que nos hizo decantarnos por ello fue la masa tan esponjosa. La que triunfó en nuestro caso fue la diavola. El trato fue amabilísimo y muy profesional. Recomendadísimo!!!",
    },
    {
      author: "Alejandro Nuhacet Castro Delgado",
      text: "Excelente trato, me explicó algunos ingredientes que no conocía, como el friarielli, excelente pizza y muy buena atención.",
    },
    {
      author: "CocinaryListo",
      text: "Una pequeña Italia en Barcelona. El espacio es acogedor y apetece entrar. El producto es italiano, como se puede ver en la barra desde la bebida, la pasta y la masa napoletana de las pizzas. Escogimos una parmigiana di melanzane que estaba espectacular, unos spaghetti carbonara muy buenos, la pizza Capricciosa y, para terminar, su tiramisú. En conclusión, solo podemos decir \"che spettacolo\".",
    },
  ],
  born: [
    {
      author: "Noel Perez Fernandez",
      text: "Una de las mejores pizzerias de Barcelona. Si te gusta la pizza estilo Napoletana, te va a encantar. En la pasta tampoco fallan, espectacular con sabores caseros y frescos. Giovanni como siempre y el resto del equipo nos tratan fenomenal. Siempre que se me antoja pizza, aqui no fallo.",
    },
    {
      author: "Alba",
      text: "Muy buen restaurante italiano, probamos pizza de salchicha y lasaña de berenjenas, buena calidad de los productos, comida en su punto. Servicio muy amable. El ambiente del restaurante es muy bonito y agradable.",
    },
    {
      author: "Genesis",
      text: "Ha sido una muy buena elección recomendado. La pasta está muy buena! La carbonara también. El ambiente es muy agradable y acogedor. Auténtica pasta al dente. Personal italiano. Y relación calidad precio muy buena.",
    },
    {
      author: "Sheilita Ch. S.",
      text: "Esta pizzería sin lugar a duda la recomiendo, comes una muy buena pizza napolitana sin estar en Nápoles, los ingredientes muy frescos. Yo pedí la Margarita la cual me encantó, y en mi grupo todos pidieron pizzas variadas y estaban muy buenas. La atención un 100%, es petfriendly y esto nos encantó: llevábamos un perro pequeño y no tuvimos ningún problema al reservar con él.",
    },
    {
      author: "Kimberley Giribaldi Raluy",
      text: "Nos encanta! De nuestras pizzas favoritas en la ciudad! Napolitana con ingredientes muy buenos. Y para quien le guste el Babá… no dudéis en pedirlo! El propietario muy amable y amigable con los clientes. Siempre visitamos la pizzería!",
    },
    {
      author: "Pablo Martinez",
      text: "Buenísima experiencia en este italiano del Born, pizzas napolitanas. Servicio amable y rápido. Pizzas de calidad, el postre la tarta de queso con Nutella buenísima. Un lugar acogedor donde comer bien.",
    },
    {
      author: "Daniel Sánchez",
      text: "Comida muy buena, tomamos pizza y lasaña y todo muy rico. Buen servicio.",
    },
    {
      author: "Maria Mariezkurrena",
      text: "Era la primera vez que probábamos una carbonara y estaba tremenda!!! La atención fue súper buena, muy atentos. Sin duda si volvemos a Barcelona volveremos seguro.",
    },
    {
      author: "M. Avila",
      text: "Cena improvisada, restaurante escogido al azar pero todo un acierto. Los camareros muy atentos y resuelven tus dudas sobre el menú. Escogimos para compartir unas anchoas y una flor de calabaza, y un par de pizzas, 4 quesos y diavola, de postre un tiramisú. En resumen, local muy bien ambientado, personal todo italiano, sitio para repetir y recomendar.",
    },
  ],
  raval: [
    {
      author: "Esther CG",
      text: "Íbamos un grupo de 7 personas y nos prepararon una mesa muy rápidamente a las 14:30h de la tarde. Servicio estupendo, y la comida, calidad precio también muy bien. Me sorprendió mucho que pudiéramos comer tan bien con tan buen servicio y sin reserva.",
    },
    {
      author: "Maria Sarle Sole",
      text: "De los mejores restaurantes italianos que he probado y a muy buen precio. El local es pequeño pero súper acogedor. El servicio es muy bueno, rápidos y súper agradables. Las pizzas están espectaculares y los ñoquis riquísimos. Súper recomendable.",
    },
    {
      author: "Adriana Rubio Romero",
      text: "El mejor italiano que he probado en Barcelona, la mejor pizza diavola, y súper amable el personal. Llegamos y nos sentaron al momento porque éramos dos personas. Nos costó la cena para dos personas 33€: 2 Aquarius grandes, una pizza diavola y pasta e patata, súper bien.",
    },
    {
      author: "Diego Dalia",
      text: "Comida excelente, como si estuvieras en pleno corazón de Nápoles! Cada plato es una auténtica experiencia gastronómica, y la pizza, simplemente perfecta, tal y como debe ser. El ambiente es cálido y acogedor, acompañado de un servicio impecable y una atención al cliente de primera categoría. Un lugar al que sin duda querrás volver una y otra vez.",
    },
    {
      author: "Agustina Maza Goytia",
      text: "Muuuuuy rica la pizza, me sentí en Italia. Y la atención amorosa.",
    },
    {
      author: "Manel Rossy",
      text: "Una auténtica joya de pizzería escondida. Soy de Barcelona de toda la vida y amante eterno de la pizza, pero no conocía este lugar. Sin duda, y sin exagerar, una de las mejores pizzerías de toda la ciudad. Para colmo, los precios son increíbles y las raciones súper generosas. Volveré 200%.",
    },
  ],
  poblenou: [
    {
      author: "Agatha Vega",
      text: "Ha estado increíble, además la pasta fue espectacular, una carbonara perfecta. La atención y el servicio han sido increíbles, muy amables y carismáticos todos, me ha encantado. Mi amigo pidió la boloñesa y le ha fascinado. Pasta increíble, gracias!!",
    },
    {
      author: "Laura Garzon",
      text: "El restaurante es muy acogedor, la pizza excelente, muy ligera y con un sabor buenísimo típico napolitano. Los camareros Anna y Fabrizio nos han tratado muy amablemente y con mucha educación. Sin duda volveré.",
    },
    {
      author: "Sam Khaichoun",
      text: "Comer aquí siempre es un acierto. Ya es la tercera vez que volvemos y, como siempre, nos atienden con la misma amabilidad y profesionalidad. La comida está riquísima; por unas horas, parece que estés en Nápoles.",
    },
    {
      author: "EVA VIRGINIA MARTINEZ",
      text: "Mery, Anna y Ugo, súper majas en todos los sentidos, simpáticas y volveré por el ambiente y la simpatía total. Gracias, pizzas hacía mucho que no comía una así... brutal!!!",
    },
    {
      author: "Anna Saez",
      text: "100% recomendable. Las pizzas 100% napolitanas y los postres con bastante variedad y todo muy bueno. Servicio muy atento.",
    },
    {
      author: "fabiola alvarez",
      text: "Me encanta Da Nanni. Es primera vez que visito esta ubicación en Poblenou. Un ambiente muy agradable con una linda decoración, buena atención de los trabajadores, muy amables y atentos. Todo riquísimo como siempre. Hemos pedido una pizza Napolitana y una milanesa. Volveremos.",
    },
    {
      author: "Noemí",
      text: "Las pizzas son 100% caseras y con productos naturales. Pizzas napolitanas buenísimas! Si quieres comer la auténtica pizza, tienes que hacer una visita obligatoria.",
    },
  ],
  gracia: [
    {
      author: "Marta Presti",
      text: "Excelente pizzería frente al Cine Verdi. Pedimos una pizza de salchicha y friarielli y estaba buenísima! También probamos una croqueta de patata y queso realmente deliciosa. El servicio fue muy atento y amable. Un lugar ideal para parar a comer algo rico antes o después del cine.",
    },
    {
      author: "Ivan Navarro Amaya",
      text: "Pizzas buenísimas con una masa de 10!!! Calidad precio adecuado dado la zona! Y un muy buen servicio cordial y atento! Gracias por el servicio! Hasta pronto!!",
    },
    {
      author: "Dina",
      text: "Muy buen servicio y ambiente. Vine sola y Marta me atendió muy amablemente, además, la pizza de Luiggi estaba riquísima!!! Volveré seguro. Gracias por la atención!!",
    },
    {
      author: "Laura Lucchese",
      text: "Pizzas espectaculares, servicio rápido y personal amable. Le pedimos una pizza ruota di carro, algo muy particular y estaba súper. Pizza salsiccia e friarielli, estaba exquisita. Nos invitaron también a unos chupitos. Seguramente para volver a menudo.",
    },
    {
      author: "Maria Bastidas",
      text: "Las pizzas son auténticas italianas, deliciosas y perfectas. La atención divina y el local espléndido, sin duda un lugar muy lindo para venir con amigos, tu pareja o darte un gusto para ti. El camarero Walter ha sido muy amable. Repetiremos segurooo!!",
    },
    {
      author: "María Álvarez Villaverde",
      text: "Sitio súper acogedor y muy bonito decorado. Las pizzas estilo napolitano riquísimas, la masa espectacular y la materia prima de buena calidad y con muchísimo sabor. Sin duda es un italiano que recomendaría en el centro de Barcelona.",
    },
    {
      author: "Andrea P",
      text: "Comimos muy bien. El personal es encantador y la comida estaba riquísima y era de calidad. Se adaptaron a mis necesidades sin problema. El local es pequeñito pero muy bonito y limpio, con acústica bien trabajada porque pudimos charlar sin levantar la voz en ningún momento.",
    },
    {
      author: "Sandra BAÑEZ LUQUE",
      text: "Una gran sorpresa la verdad. Estábamos dando vueltas por la zona y pasamos por delante de este lugar, entramos y no nos defraudó. Hicimos 4 pizzas diferentes y las cuatro muy ricas, masa fina, borde grueso, muy buenas.",
    },
    {
      author: "Ainara Hernández",
      text: "Todo riquísimo! Y el personal súper amable y atento! Grazie mille! Tornerò presto!",
    },
    {
      author: "Carmen G",
      text: "Dimos con este restaurante de casualidad y nos gustaron tantísimo sus pizzas que volvimos al día siguiente a probar la pasta y la parmigiana. No sabría con qué quedarme, estaba todo delicioso, y las recomendaciones y el trato del personal fueron inmejorables. Súper recomendable!!",
    },
    {
      author: "Juan Guillermo Cervantes Gonzalez",
      text: "Giovanni nos atendió excelente! Faltan camareros así en BCN. Mezzanelli alla genovese, espectacular!",
    },
  ],
};
