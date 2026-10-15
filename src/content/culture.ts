import { activeSeasons, type SeasonEvent } from './seasons'

// Culture snippets: fun facts shown after a finished review, and the word / tongue twister of the day.
// Spanish text; Russian words carry stress marks (rendered with the Russian serif by <Mixed>).

export interface FunFact {
  tag: 'Rusia' | 'Rusia y México' | 'El idioma'
  text: string
}

export const FUN_FACTS: FunFact[] = [
  // Russia × Mexico
  { tag: 'Rusia y México', text: 'La escritura maya fue descifrada en gran parte gracias al lingüista soviético Yuri Knórozov, que en 1952 propuso que los glifos combinaban signos fonéticos (sílabas) y logogramas, trabajando desde Leningrado con copias de los códices.' },
  { tag: 'Rusia y México', text: 'En 1994 México le otorgó a Yuri Knórozov la Orden Mexicana del Águila Azteca, la máxima distinción para extranjeros, por su trabajo con la escritura maya.' },
  { tag: 'Rusia y México', text: 'Hay una estatua de Yuri Knórozov en Mérida, Yucatán. En muchas fotos aparece con su gata siamesa, Asya; según una anécdota famosa, quiso ponerla como coautora de un artículo.' },
  { tag: 'Rusia y México', text: 'Las palabras rusas шокола́д, тома́т y кака́о vienen del náhuatl (xocolatl, tomatl, cacahuatl), y llegaron al ruso a través del español.' },
  { tag: 'Rusia y México', text: 'León Trotsky vivió sus últimos años en Coyoacán, en la Ciudad de México, donde fue asesinado en 1940. Su casa es hoy un museo.' },
  { tag: 'Rusia y México', text: 'El cineasta soviético Serguéi Eisenstein filmó en México entre 1930 y 1932 la película «¡Que viva México!», que nunca pudo terminar.' },
  { tag: 'Rusia y México', text: 'La telenovela mexicana «Los ricos también lloran» («Бога́тые то́же пла́чут») fue un fenómeno en Rusia a principios de los años 90: millones de personas la veían.' },
  { tag: 'Rusia y México', text: 'Diego Rivera viajó a Moscú en 1927 para el décimo aniversario de la Revolución de Octubre y pintó escenas del desfile en la Plaza Roja.' },
  { tag: 'Rusia y México', text: 'México y el Imperio ruso establecieron relaciones diplomáticas en 1890.' },
  // Russia
  { tag: 'Rusia', text: 'Rusia tiene 11 husos horarios: cuando en Kaliningrado es mediodía, en Kamchatka ya son las 10 de la noche.' },
  { tag: 'Rusia', text: 'El lago Baikal es el más profundo del mundo (más de 1600 m) y guarda cerca de una quinta parte del agua dulce superficial no congelada del planeta.' },
  { tag: 'Rusia', text: 'El Transiberiano une Moscú con Vladivostok: más de 9000 km y alrededor de siete días de viaje en tren.' },
  { tag: 'Rusia', text: 'La primera матрёшка se hizo hacia 1890 en Rusia, inspirada en unas muñecas de madera japonesas.' },
  { tag: 'Rusia', text: 'En los trenes rusos siempre hay кипято́к (agua hirviendo) gratis para el té, y el vaso se sirve en un подста́канник metálico.' },
  { tag: 'Rusia', text: 'Yuri Gagarin fue el primer ser humano en el espacio, en 1961. Al despegar dijo: «Пое́хали!» (¡Vámonos!).' },
  { tag: 'Rusia', text: 'El Tetris lo creó en 1984 Alekséi Pázhitnov, un programador de Moscú.' },
  { tag: 'Rusia', text: 'Dmitri Mendeléyev publicó su tabla periódica en 1869 y dejó huecos para elementos que todavía no se conocían.' },
  { tag: 'Rusia', text: 'En Rusia se regalan flores en número impar; los números pares se reservan para los funerales.' },
  { tag: 'Rusia', text: 'Antes de un viaje largo, muchas familias se sientan un momento en silencio: «присе́сть на доро́жку», para que el viaje salga bien.' },
  { tag: 'Rusia', text: 'Dicen que no hay que darse la mano ni pasar cosas a través del umbral de una puerta: trae mala suerte.' },
  { tag: 'Rusia', text: 'La Navidad ortodoxa se celebra el 7 de enero, y el 13–14 de enero hay un «Año Nuevo viejo» (Ста́рый Но́вый год).' },
  { tag: 'Rusia', text: 'En Año Nuevo los regalos los trae Дед Моро́з (el Abuelo Escarcha), acompañado de su nieta Снегу́рочка.' },
  { tag: 'Rusia', text: 'En San Petersburgo los puentes del río Nevá se levantan de noche para que pasen los barcos: si te quedas del lado equivocado, ¡esperas hasta la madrugada!' },
  { tag: 'Rusia', text: 'En verano San Petersburgo tiene «бе́лые но́чи»: el sol apenas se oculta y el cielo nunca oscurece del todo.' },
  { tag: 'Rusia', text: 'La palabra кремль significa «fortaleza», y muchas ciudades rusas antiguas tienen el suyo, no solo Moscú.' },
  { tag: 'Rusia', text: 'El poeta Aleksandr Pushkin tenía un bisabuelo africano, Abram Gannibal, que llegó a ser general del ejército ruso.' },
  { tag: 'Rusia', text: 'En la fiesta de Ма́сленица, que despide el invierno, se comen montañas de блины́ (crepas) y se quema un muñeco de paja.' },
  // Language
  { tag: 'El idioma', text: 'Здра́вствуйте viene del verbo «estar sano»: literalmente le deseas salud a la otra persona.' },
  { tag: 'El idioma', text: 'Спаси́бо viene de «спаси́ Бог», «que Dios te salve».' },
  { tag: 'El idioma', text: 'El ruso no tiene artículos: дом puede ser «una casa» o «la casa» según el contexto.' },
  { tag: 'El idioma', text: 'El ruso distingue dos azules como colores distintos: си́ний (azul oscuro) y голубо́й (azul claro).' },
  { tag: 'El idioma', text: 'El acento puede cambiar el significado: за́мок es «castillo» y замо́к es «candado».' },
  { tag: 'El idioma', text: 'El alfabeto cirílico lleva el nombre de San Cirilo, que con su hermano Metodio creó en el siglo IX la escritura de la que deriva.' },
  { tag: 'El idioma', text: 'La letra ё se popularizó a finales del siglo XVIII; hoy muchos textos escriben е en su lugar, pero siempre se pronuncia «yo» y siempre lleva el acento.' },
  { tag: 'El idioma', text: 'Para decir «tengo», el ruso dice «junto a mí hay»: у меня́ есть.' },
  { tag: 'El idioma', text: 'Los nombres rusos llevan patronímico: si tu papá se llama Iván, eres Ива́нович (hombre) o Ива́новна (mujer).' },
]

export interface DailyWord { ru: string; es: string; note: string }

export const WORDS: DailyWord[] = [
  { ru: 'тоска́', es: 'añoranza, angustia, melancolía', note: 'Una tristeza honda, a veces sin causa clara: anhelo de algo que no sabes nombrar. Nabokov decía que ninguna palabra en inglés la traduce del todo.' },
  { ru: 'почему́чка', es: 'el niño (o adulto) que siempre pregunta «¿por qué?»', note: 'Viene de почему́ (¿por qué?). Se dice con cariño de quien no para de preguntar.' },
  { ru: 'аво́сь', es: '«a ver si sale», confiar en la suerte', note: 'Actitud de dejarlo todo al azar y esperar que salga bien. Una bolsa de red para las compras se llamaba аво́ська: «por si acaso encuentro algo».' },
  { ru: 'по́шлость', es: 'vulgaridad, cursilería, banalidad pretenciosa', note: 'Lo falsamente bonito o profundo, de mal gusto. Nabokov le dedicó páginas enteras.' },
  { ru: 'стушева́ться', es: 'pasar a segundo plano, encogerse', note: 'Dostoievski presumía de haber introducido esta palabra en la literatura rusa.' },
  { ru: 'су́тки', es: 'un día completo de 24 horas', note: 'El español necesita «día y noche» o «24 horas»; el ruso lo dice con una sola palabra: Я рабо́тал дво́е су́ток.' },
  { ru: 'быт', es: 'la vida cotidiana, lo doméstico', note: 'Las tareas, la casa, la rutina de todos los días. «Меня́ заел быт» = la rutina me consumió.' },
  { ru: 'да́ча', es: 'casa de campo', note: 'Muchísimas familias rusas tienen una дача donde pasan los fines de semana de verano cultivando papas, tomates y frutas.' },
  { ru: 'недосы́п', es: 'falta de sueño acumulada', note: 'Ese cansancio de dormir poco varios días seguidos. Muy útil en época de exámenes.' },
  { ru: 'ёлки-па́лки', es: '¡caramba!, ¡ay, caray!', note: 'Literalmente «abetos y palos». Una exclamación suave de sorpresa o fastidio.' },
  { ru: 'заку́ска', es: 'botana, entremés', note: 'Lo que se come para acompañar una bebida: pepinillos, pan negro, arenque… Nunca se bebe sin заку́ска.' },
  { ru: 'напосошо́к', es: 'la del estribo', note: 'El último brindis antes de que los invitados se vayan. Igual que «la del estribo» en México.' },
  { ru: 'ба́бье ле́то', es: 'veranillo de San Juan, días cálidos de otoño', note: 'Literalmente «verano de las abuelas»: unos días tibios a principios del otoño.' },
  { ru: 'соску́читься', es: 'extrañar a alguien, echar de menos', note: 'Я по тебе́ соску́чился = te extrañé. También puede ser aburrirse de tanto esperar.' },
  { ru: 'ничего́', es: 'nada… pero también «está bien», «no pasa nada»', note: '—Как дела́? —Ничего́. Aquí no significa «nada», sino «regular, bien». Depende mucho del tono.' },
  { ru: 'тусо́вка', es: 'reunión, fiesta, el ambiente social', note: 'Palabra coloquial para una fiesta o un grupo de gente que se junta. Тусова́ться = salir, «andar de fiesta».' },
  { ru: 'блат', es: 'palancas, conexiones', note: 'Conseguir algo por conocidos. En la época soviética era casi la única forma de obtener ciertas cosas.' },
  { ru: 'душа́', es: 'alma', note: 'Palabra central en la cultura rusa: «по душа́м» = hablar de corazón a corazón, con total sinceridad.' },
  { ru: 'обнима́шки', es: 'abrazos (con cariño)', note: 'Diminutivo juguetón de объя́тия. Se usa entre amigos y pareja.' },
  { ru: 'о́ттепель', es: 'deshielo', note: 'El momento en que el invierno afloja. También el nombre del periodo de apertura en la URSS tras la muerte de Stalin.' },
  { ru: 'подста́канник', es: 'portavasos metálico para el té', note: 'El soporte decorado donde se sirve el vaso de té en los trenes rusos. Un símbolo de los viajes largos.' },
  { ru: 'ша́пка-уша́нка', es: 'gorro con orejeras', note: 'El clásico gorro de piel con orejeras que se pueden atar arriba o abajo. Уши = orejas.' },
  { ru: 'ую́т', es: 'calidez y comodidad del hogar', note: 'Esa sensación de estar a gusto en casa: luz suave, té caliente, una manta. Ую́тно = acogedor.' },
  { ru: 'хандра́', es: 'bajón, desgana', note: 'Tristeza perezosa sin motivo claro. Pushkin la describe en «Eugenio Oneguin» como la enfermedad de su héroe.' },
  { ru: 'лень', es: 'pereza', note: 'Dicho popular: «Лень — дви́гатель прогре́сса» (la pereza es el motor del progreso): inventamos cosas para no trabajar.' },
  { ru: 'халя́ва', es: 'algo gratis, conseguido sin esfuerzo', note: 'Muy coloquial. Los estudiantes, antes de un examen, «llaman» a la халя́ва por la ventana para que les toque una pregunta fácil.' },
  { ru: 'ба́ня', es: 'baño de vapor ruso', note: 'Con ramas de abedul (ве́ник) y agua fría después. Al salir se felicita: «С лёгким па́ром!» (¡que el vapor te haya sentado bien!).' },
  { ru: 'самова́р', es: 'samovar (tetera tradicional)', note: 'Само (sí mismo) + вари́ть (hervir): «el que hierve solo». Símbolo del té en familia.' },
  { ru: 'матрёшка', es: 'matrioshka', note: 'Viene del nombre Матрёна. La primera se talló en 1890; hoy existen matrioshkas de todo tipo, ¡también de futbolistas!' },
  { ru: 'ва́ленки', es: 'botas de fieltro', note: 'Botas de lana prensada, calientísimas para la nieve seca. Se dice «одни́ ва́ленки» (un par).' },
  { ru: 'кефи́р', es: 'kéfir', note: 'Bebida láctea agria que en Rusia se toma a diario, sobre todo antes de dormir.' },
  { ru: 'квас', es: 'kvas (bebida de pan fermentado)', note: 'Bebida dulce-agria de pan de centeno. En verano se vendía en la calle desde barriles amarillos.' },
  { ru: 'блины́', es: 'crepas rusas', note: 'Refrán: «Пе́рвый блин ко́мом» (la primera crepa sale fea): el primer intento casi nunca sale bien.' },
  { ru: 'кварти́рник', es: 'concierto en un departamento', note: 'En la época soviética, los músicos de rock prohibidos tocaban en casas particulares para sus amigos.' },
  { ru: 'земля́к', es: 'paisano', note: 'Alguien de tu misma ciudad o región: Он мой земля́к, то́же из Гвадалаха́ры.' },
  { ru: 'тёзка', es: 'tocayo', note: 'Alguien con tu mismo nombre: Ты то́же Ми́ша? Мы тёзки!' },
  { ru: 'Чебура́шка', es: 'Cheburashka', note: 'Personaje de dibujos animados soviético con orejas enormes, mascota olímpica rusa. Nadie sabe qué animal es.' },
  { ru: 'закады́чный друг', es: 'amigo del alma', note: 'Un amigo íntimo de toda la vida. Antes se decía de quien bebía contigo: кады́к es la manzana de Adán.' },
  { ru: 'вдохнове́ние', es: 'inspiración', note: 'De дохну́ть (soplar, respirar): algo que «te sopla dentro». Pushkin: «Не продаётся вдохнове́нье».' },
  { ru: 'любопы́тство', es: 'curiosidad', note: 'Любо́вь (amor) + пыта́ть (indagar): «amor por averiguar». Любопы́тно = curioso, interesante.' },
  { ru: 'тишина́', es: 'silencio, calma', note: 'Ти́хо = en silencio. En las bibliotecas rusas verás el letrero: «Соблюда́йте тишину́!».' },
  { ru: 'мечта́', es: 'sueño (anhelo)', note: 'Ojo: мечта́ es un deseo («mi sueño es viajar»); сон es lo que sueñas al dormir. Моя́ мечта́ — уви́деть Байка́л.' },
  { ru: 'сон', es: 'sueño (al dormir)', note: 'Мне сни́лся стра́нный сон = tuve un sueño raro. Para un anhelo se usa мечта́.' },
  { ru: 'ла́дно', es: 'está bien, ok, va', note: 'La forma más común de aceptar algo: — Пойдём в кино́? — Ла́дно! También para cerrar una discusión.' },
  { ru: 'кста́ти', es: 'por cierto', note: 'Para cambiar de tema: Кста́ти, ты зна́ешь, что за́втра экза́мен?' },
  { ru: 'наконе́ц-то', es: '¡por fin!', note: 'Con -то suena aliviado y emocionado: Наконе́ц-то пя́тница!' },
  { ru: 'вообще́', es: 'en general; de plano', note: 'Muy usado en conversación: Я вообще́ не люблю́ хо́лод. Sola, «Вообще́!» expresa asombro.' },
  { ru: 'пожа́луй', es: 'quizá, tal vez (suave)', note: 'Para aceptar sin mucho entusiasmo: — Ко́фе? — Пожа́луй. No confundir con пожа́луйста.' },
  { ru: 'моро́з', es: 'helada, frío intenso', note: 'Pushkin: «Моро́з и со́лнце; день чуде́сный!». Дед Моро́з es el «Abuelo Helada», el Santa Claus ruso.' },
  { ru: 'пе́рвый снег', es: 'la primera nevada', note: 'Un día especial: la gente sale a fotografiarla y en las ciudades todo se vuelve silencioso.' },
  { ru: 'тайга́', es: 'taiga', note: 'El bosque boreal de coníferas que cubre gran parte de Siberia. Es el bosque más grande del mundo.' },
  { ru: 'степь', es: 'estepa', note: 'Llanura inmensa con hierba y sin árboles, al sur de Rusia. Muchas canciones hablan de ella.' },
  { ru: 'берёза', es: 'abedul', note: 'El árbol símbolo de Rusia, de tronco blanco con manchas negras. Aparece en poemas, canciones y pinturas.' },
  { ru: 'электри́чка', es: 'tren suburbano', note: 'El tren eléctrico que une la ciudad con las dachas y los pueblos cercanos. En verano va lleno de jardineros.' },
  { ru: 'маршру́тка', es: 'microbús (pesero)', note: 'Una camioneta con ruta fija: se para donde pidas. Igualito que un pesero.' },
  { ru: 'подъе́зд', es: 'entrada del edificio', note: 'Cada edificio de departamentos tiene varios подъе́зды (entradas) con su escalera. «Встре́тимся у подъе́зда».' },
  { ru: 'хрущёвка', es: 'edificio de departamentos de los años 60', note: 'Edificios de cinco pisos sin elevador construidos con Jrushchov para dar vivienda rápida a millones de familias.' },
  { ru: 'коммуна́лка', es: 'departamento compartido', note: 'Departamento donde varias familias compartían cocina y baño. Muy común en la época soviética.' },
  { ru: 'дру́жба', es: 'amistad', note: 'Друг (amigo) + -жба. Дружи́ть = ser amigos. El estadio de Luzhnikí fue sede de los «Juegos de la Amistad».' },
  { ru: 'спаси́бо', es: 'gracias', note: 'Viene de «Спаси́ Бог» (que Dios te salve). Respuesta: пожа́луйста o не за что.' },
  { ru: 'здра́вствуйте', es: 'buenos días, hola (formal)', note: 'Literalmente «que esté usted sano». La primera в no se pronuncia: [зДРА́ствуйте].' },
  { ru: 'прия́тного аппети́та', es: '¡buen provecho!', note: 'Se dice al empezar a comer. Muchos lo acortan a «Прия́тного!».' },
  { ru: 'будь здоро́в', es: '¡salud! (al estornudar)', note: 'A una mujer: будь здоро́ва; formal: бу́дьте здоро́вы. Se responde спаси́бо.' },
  { ru: 'ни пу́ха ни пера́', es: '¡mucha suerte!', note: 'Literalmente «ni pelusa ni pluma», antes de un examen. La respuesta tradicional es «К чёрту!» (¡al diablo!).' },
  { ru: 'присе́сть на доро́жку', es: 'sentarse antes de un viaje', note: 'Costumbre: antes de salir de viaje, todos se sientan un momento en silencio para que el viaje salga bien.' },
  { ru: 'с днём рожде́ния', es: '¡feliz cumpleaños!', note: 'Literalmente «con el día de nacimiento». Ojo: felicitar antes del día trae mala suerte en Rusia.' },
  { ru: 'уда́чи', es: '¡suerte!', note: 'Forma corta de «Жела́ю уда́чи!». Уда́ча = suerte, éxito.' },
  { ru: 'молоде́ц', es: '¡bien hecho!', note: 'Para elogiar a alguien, hombre o mujer: Ты молоде́ц! Los maestros lo dicen mucho.' },
  { ru: 'ура́', es: '¡hurra!', note: 'El grito de alegría ruso, también de los soldados al atacar. «Ура́! Пя́тница!».' },
  { ru: 'чепуха́', es: 'tontería', note: 'Algo sin sentido o sin importancia: Э́то чепуха́! Sinónimo coloquial: ерунда́.' },
  { ru: 'безде́льник', es: 'flojo, vago', note: 'Без (sin) + де́ло (asunto): quien no hace nada. Безде́льничать = holgazanear.' },
  { ru: 'поня́тно', es: 'entendido, ya veo', note: 'Muy útil en clase: — Поня́тно? — Да, поня́тно! Если нет: «Непоня́тно».' },
  { ru: 'сканда́л', es: 'pleito, escándalo', note: 'En ruso se usa también para una pelea en casa: Сосе́ди опя́ть устро́или сканда́л!' },
  { ru: 'бутербро́д', es: 'pan con algo encima', note: 'Del alemán Butterbrot (pan con mantequilla), pero en ruso es cualquier pan abierto: с сы́ром, с колбасо́й.' },
  { ru: 'ча́ша терпе́ния', es: 'la gota que derrama el vaso', note: '«Ча́ша терпе́ния перепо́лнилась» = se llenó la copa de la paciencia: ya no se aguanta más.' },
  { ru: 'глуби́нка', es: 'provincia profunda', note: 'Los pueblos lejos de las grandes ciudades, donde la vida es tranquila y tradicional.' },
  { ru: 'ру́сская речь', es: 'el habla rusa', note: 'Речь = habla, discurso. Turgénev llamó al ruso «вели́кий, могу́чий, правди́вый и свобо́дный ру́сский язы́к».' },
  { ru: 'скоморо́х', es: 'juglar, bufón', note: 'Los artistas ambulantes de la Rusia medieval: cantaban, bailaban y hacían reír en las plazas.' },
  { ru: 'коля́дки', es: 'cantos navideños', note: 'En Navidad, grupos de jóvenes iban de casa en casa cantando y recibían dulces, como en las posadas.' },
  { ru: 'часту́шка', es: 'copla popular', note: 'Una canción corta, rápida y chistosa de cuatro versos, a menudo con acordeón. Se improvisan sobre cualquier tema.' },
]

export interface TongueTwister { ru: string; es: string; tip: string }

export const TWISTERS: TongueTwister[] = [
  { ru: 'Шла Са́ша по шоссе́ и соса́ла су́шку.', es: 'Sasha caminaba por la carretera y chupaba una galletita.', tip: 'Distingue ш y с.' },
  { ru: 'Карл у Кла́ры укра́л кора́ллы, а Кла́ра у Ка́рла укра́ла кларне́т.', es: 'Karl le robó los corales a Klara, y Klara le robó el clarinete a Karl.', tip: 'La r rusa y la l dura.' },
  { ru: 'На дворе́ трава́, на траве́ дрова́.', es: 'En el patio hay pasto; sobre el pasto, leña.', tip: 'Cuidado con el acento: трава́ / траве́.' },
  { ru: 'Е́хал Гре́ка че́рез ре́ку, ви́дит Гре́ка — в ре́ке рак. Су́нул Гре́ка ру́ку в ре́ку, рак за ру́ку Гре́ку цап!', es: 'Un griego cruzaba el río, ve un cangrejo en el río. Metió la mano en el río, ¡y el cangrejo le pellizcó la mano!', tip: 'Practica la r vibrante.' },
  { ru: 'От то́пота копы́т пыль по по́лю лети́т.', es: 'Por el golpeteo de los cascos, el polvo vuela por el campo.', tip: 'Imita el ritmo de un caballo al galope.' },
  { ru: 'Шесть мыша́т в шалаше́ шурша́т.', es: 'Seis ratoncitos susurran en la cabaña.', tip: 'Muchas ш seguidas.' },
  { ru: 'У ежа́ ежа́та, у ужа́ ужа́та.', es: 'El erizo tiene erizitos, la culebra tiene culebritas.', tip: 'La ж suena como la «j» francesa.' },
  { ru: 'Четы́ре чёрненьких чума́зеньких чертёнка черти́ли чёрными черни́лами чертёж.', es: 'Cuatro diablitos negritos y mugrosos dibujaban un plano con tinta negra.', tip: 'Una avalancha de ч.' },
  { ru: 'Корабли́ лави́ровали, лави́ровали, да не вы́лавировали.', es: 'Los barcos maniobraban y maniobraban, pero no lograron salir.', tip: 'Palabras largas: no pierdas el acento.' },
  { ru: 'Сшит колпа́к не по-колпако́вски, вы́лит ко́локол не по-колоколо́вски.', es: 'El gorro no está cosido como gorro, la campana no está fundida como campana.', tip: 'Ojo con las o sin acento: suenan como «a».' },
  { ru: 'Ткёт ткач тка́ни на плато́к Та́не.', es: 'El tejedor teje telas para el pañuelo de Tania.', tip: 'El grupo тк al inicio.' },
  { ru: 'Бык тупогу́б, тупогу́бенький бычо́к, у быка́ бела́ губа́ была́ тупа́.', es: 'El toro de labio romo, el torito de labio romito: el toro tenía el labio blanco y romo.', tip: 'Practica la diferencia entre б y п, y entre ы e и.' },
  { ru: 'Ку́кушка кукушо́нку купи́ла капюшо́н.', es: 'La cuca le compró una capucha al cuquito.', tip: 'Muchas к y у seguidas: empieza despacio.' },
  { ru: 'Ма́ма мы́ла Ми́лу мы́лом, Ми́ла мы́ло не люби́ла.', es: 'Mamá lavó a Mila con jabón; a Mila no le gustaba el jabón.', tip: 'La clásica para la ы: мы́ла vs Ми́лу.' },
  { ru: 'Расскажи́те про поку́пки. — Про каки́е про поку́пки? — Про поку́пки, про поку́пки, про поку́почки мои́.', es: '—Cuéntenme de las compras. —¿Cuáles compras? —De las compras, de las compras, de mis compritas.', tip: 'Ritmo de canción: marca la sílaba acentuada de поку́пки.' },
  { ru: 'Три соро́ки-тарато́рки тарато́рили на го́рке.', es: 'Tres urracas parlanchinas parloteaban en la colina.', tip: 'Para la р rusa: hazla vibrar sin miedo.' },
  { ru: 'Се́ня везёт теле́жку се́на.', es: 'Senia lleva una carretilla de heno.', tip: 'Се́ня y се́на suenan casi igual: cuida la última vocal.' },
  { ru: 'Жужжи́т жужели́ца, жужжи́т, да не кру́жится.', es: 'El escarabajo zumba y zumba, pero no da vueltas.', tip: 'La ж suena como la «j» francesa de «je», con zumbido.' },
  { ru: 'Сла́вный пода́рок Сла́ве — сла́дкие сли́вы в сла́вной опра́ве.', es: 'Un gran regalo para Slava: dulces ciruelas en un buen estuche.', tip: 'Encadena сл- sin perder el ritmo.' },
  { ru: 'В Гре́ции всё есть.', es: 'En Grecia hay de todo.', tip: 'Muy corta: perfecta para practicar ц y ш (всё).' },
  { ru: 'Ёжик в ёлке, ёлка в и́глах.', es: 'El erizo en el abeto, el abeto lleno de agujas.', tip: 'Para la ё: siempre acentuada y suena «yo».' },
]

/** Days since 1970 in local time — the same "of the day" item for everyone on a given day. */
export function dayNumber(d = new Date()) {
  return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / 86_400_000)
}

export type Daily =
  | { kind: 'word'; item: DailyWord; season?: SeasonEvent }
  | { kind: 'twister'; item: TongueTwister }

/**
 * Every third day is a tongue twister; the rest are words. During a holiday season words lean
 * seasonal: about 2 of 3 word days for big holidays (New Year, Maslenitsa, Easter…), every other
 * word day for smaller ones. Everyone sees the same item on a given day.
 */
/** Day `m` (as from dayNumber) back to a local calendar date at noon. */
const dateOf = (m: number) => { const u = new Date(m * 86_400_000); return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate(), 12) }

/** Every third day a tongue twister; otherwise a word, with seasonal words on part of the days. */
function pickFor(m: number, recent: Map<string, number>): Daily {
  const fresh = (ru: string, days: number) => { const last = recent.get(ru); return last === undefined || m - last > days }
  if (m % 3 === 2) {
    const i = Math.floor(m / 3) % TWISTERS.length
    const t = TWISTERS.map((_, k) => TWISTERS[(i + k) % TWISTERS.length]).find((x) => fresh(x.ru, 60)) ?? TWISTERS[i]
    return { kind: 'twister', item: t }
  }
  const seasons = activeSeasons(dateOf(m))
  const big = seasons.some((s) => s.big)
  if (seasons.length && (big ? m % 3 !== 1 : m % 2 === 0)) {
    const pick = seasons.flatMap((s) => s.words.map((w) => ({ w, s }))).find((p) => fresh(p.w.ru, 90))
    if (pick) return { kind: 'word', item: pick.w, season: pick.s }
  }
  const i = (m - Math.floor(m / 3)) % WORDS.length
  const w = WORDS.map((_, k) => WORDS[(i + k) % WORDS.length]).find((x) => fresh(x.ru, 90)) ?? WORDS[i]
  return { kind: 'word', item: w }
}

const dailyCache = new Map<number, Daily>()
/**
 * The day's word or tongue twister. Replays the previous months so nothing repeats within ~3 months:
 * each seasonal word shows once per season and the general list rotates around what was just shown.
 */
export function dailyItem(d = new Date()): Daily {
  const n = dayNumber(d)
  const hit = dailyCache.get(n)
  if (hit) return hit
  const recent = new Map<string, number>()
  let today!: Daily
  for (let m = n - 180; m <= n; m++) {
    const pick = pickFor(m, recent)
    recent.set(pick.item.ru, m)
    if (m === n) today = pick
  }
  dailyCache.set(n, today)
  return today
}

/** A fun fact not shown recently on this device. */
export function nextFunFact(): FunFact {
  let seen: number[] = []
  try { seen = JSON.parse(localStorage.getItem('rulingo-facts-seen') ?? '[]') } catch { /* ignore */ }
  const fresh = FUN_FACTS.map((_, i) => i).filter((i) => !seen.includes(i))
  const pool = fresh.length ? fresh : FUN_FACTS.map((_, i) => i)
  const i = pool[Math.floor(Math.random() * pool.length)]
  try {
    localStorage.setItem('rulingo-facts-seen', JSON.stringify(fresh.length ? [...seen, i] : [i]))
  } catch { /* ignore */ }
  return FUN_FACTS[i]
}

/**
 * First run of the memory: what the original rules (before 14 Oct 2026) showed from the app's launch, so those
 * items don't come back right away. Old rules: the first 11 twisters every third day, the first 22 words otherwise.
 */
function seenUnderOldRules(today: number): Record<string, number> {
  const out: Record<string, number> = {}
  const from = dayNumber(new Date(2026, 9, 1)), to = Math.min(today - 1, dayNumber(new Date(2026, 9, 13)))
  for (let m = from; m <= to; m++) {
    if (m % 3 === 2) out[TWISTERS[Math.floor(m / 3) % 11].ru] = m
    else out[WORDS[(m - Math.floor(m / 3)) % 22].ru] = m
  }
  return out
}

/**
 * Today's item for this device. The schedule above is shared, but each phone also remembers what it has actually
 * shown (so a change in the schedule, or an item shown under older rules, never repeats too soon): if today's
 * scheduled item was seen here recently, the next unseen one of the same kind is shown instead. Fixed for the day.
 */
export function todaysDaily(d = new Date()): Daily {
  const n = dayNumber(d)
  const scheduled = dailyItem(d)
  let seen: Record<string, number> = {}
  let pinned: { day: number; ru: string } | null = null
  try {
    seen = JSON.parse(localStorage.getItem('rulingo-daily-seen') ?? 'null') ?? seenUnderOldRules(n)
    pinned = JSON.parse(localStorage.getItem('rulingo-daily-today') ?? 'null')
  } catch { /* private mode: just use the schedule */ }
  const list: (DailyWord | TongueTwister)[] = scheduled.kind === 'twister' ? TWISTERS : [...WORDS, ...(scheduled.season ? scheduled.season.words : [])]
  const find = (ru: string) => list.find((x) => x.ru === ru)
  if (pinned?.day === n && find(pinned.ru)) {
    const item = find(pinned.ru)!
    return scheduled.kind === 'twister' ? { kind: 'twister', item: item as TongueTwister } : { ...scheduled, item: item as DailyWord }
  }
  const window = scheduled.kind === 'twister' ? 60 : 90
  const fresh = (ru: string) => seen[ru] === undefined || n - seen[ru] > window
  const start = Math.max(0, list.findIndex((x) => x.ru === scheduled.item.ru))
  const pick = fresh(scheduled.item.ru) ? scheduled.item : list.map((_, k) => list[(start + k) % list.length]).find((x) => fresh(x.ru)) ?? scheduled.item
  try {
    localStorage.setItem('rulingo-daily-seen', JSON.stringify({ ...seen, [pick.ru]: n }))
    localStorage.setItem('rulingo-daily-today', JSON.stringify({ day: n, ru: pick.ru }))
  } catch { /* ignore */ }
  return scheduled.kind === 'twister' ? { kind: 'twister', item: pick as TongueTwister } : { ...scheduled, item: pick as DailyWord, season: pick === scheduled.item ? scheduled.season : undefined }
}
