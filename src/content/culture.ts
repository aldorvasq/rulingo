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
export function dailyItem(d = new Date()): Daily {
  const n = dayNumber(d)
  if (n % 3 === 2) return { kind: 'twister', item: TWISTERS[Math.floor(n / 3) % TWISTERS.length] }
  const seasons = activeSeasons(d)
  const big = seasons.some((s) => s.big)
  if (seasons.length && (big ? n % 3 !== 1 : n % 2 === 0)) {
    const pool = seasons.flatMap((s) => s.words.map((w) => ({ w, s })))
    const pick = pool[n % pool.length]
    return { kind: 'word', item: pick.w, season: pick.s }
  }
  return { kind: 'word', item: WORDS[(n - Math.floor(n / 3)) % WORDS.length] }
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
