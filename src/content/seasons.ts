// Russian (and a few Mexican) holidays and seasons. They feed the calendar card ("Fechas especiales")
// and make the word of the day lean seasonal while they're on.
import type { DailyWord } from './culture'

export interface SeasonEvent {
  id: string
  ru: string
  es: string
  desc: string
  /** Main day of the holiday (shown in the calendar). */
  day: Date
  /** Period when seasonal words show up (defaults to a week before through the day). */
  from: Date
  to: Date
  words: DailyWord[]
  /** Big holidays push their words more often. */
  big?: boolean
}

/** Orthodox Easter (Julian computus, converted to the Gregorian calendar; valid 1900–2099). */
export function orthodoxEaster(year: number): Date {
  const a = year % 4
  const b = year % 7
  const c = year % 19
  const d = (19 * c + 15) % 30
  const e = (2 * a + 4 * b - d + 34) % 7
  const month = Math.floor((d + e + 114) / 31)
  const day = ((d + e + 114) % 31) + 1
  return new Date(year, month - 1, day + 13)
}

const D = (y: number, m: number, d: number) => new Date(y, m - 1, d)
const plus = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

function eventsOfYear(y: number): SeasonEvent[] {
  const easter = orthodoxEaster(y)
  const ev = (id: string, ru: string, es: string, desc: string, day: Date, words: DailyWord[], opts: { from?: Date; to?: Date; big?: boolean } = {}): SeasonEvent =>
    ({ id: `${id}-${y}`, ru, es, desc, day, from: opts.from ?? plus(day, -7), to: opts.to ?? day, words, big: opts.big })

  return [
    ev('newyear', 'Но́вый год', 'Año Nuevo', 'La fiesta más grande del año en Rusia: ёлка, regalos de Дед Моро́з y las campanadas del Kremlin a medianoche.', D(y, 1, 1), [], { from: D(y, 1, 1), to: D(y, 1, 14), big: true }),
    ev('newyear-eve', 'Нового́дние пра́здники', 'Temporada de Año Nuevo', 'Del 31 de diciembre a mediados de enero: vacaciones, ёлка y mesa llena.', D(y, 12, 31), NEW_YEAR, { from: D(y, 12, 15), to: D(y, 12, 31), big: true }),
    ev('christmas', 'Рождество́', 'Navidad ortodoxa', 'La Iglesia ortodoxa rusa celebra la Navidad el 7 de enero, según el calendario juliano.', D(y, 1, 7), NEW_YEAR, { from: D(y, 1, 1), to: D(y, 1, 14), big: true }),
    ev('old-newyear', 'Ста́рый Но́вый год', '«Año Nuevo viejo»', 'La noche del 13 al 14 de enero se celebra otra vez el Año Nuevo, según el calendario antiguo.', D(y, 1, 14), NEW_YEAR, { from: D(y, 1, 12) }),
    ev('kreshchenie', 'Креще́ние', 'Epifanía (Bautismo)', 'El 19 de enero muchos se sumergen en agua helada a través de una про́рубь, un agujero en el hielo.', D(y, 1, 19), [
      { ru: 'про́рубь', es: 'agujero en el hielo', note: 'Para la Креще́ние se abre en forma de cruz y la gente se sumerge tres veces en el agua helada.' },
      { ru: 'морж', es: 'morsa… y quien nada en agua helada', note: 'A quien se baña en invierno en agua helada se le llama морж: «morsa».' },
    ], { from: D(y, 1, 15) }),
    ev('tatiana', 'Татья́нин день', 'Día de los estudiantes', 'El 25 de enero es el día de los estudiantes universitarios en Rusia.', D(y, 1, 25), [
      { ru: 'студе́нт', es: 'estudiante (universitario)', note: 'Para la escuela se dice шко́льник; студе́нт es solo para la universidad.' },
    ], { from: D(y, 1, 23) }),
    ev('feb23', 'День защи́тника Оте́чества', 'Día del Defensor de la Patria', 'El 23 de febrero se felicita a los hombres; en la práctica funciona como un «día del hombre».', D(y, 2, 23), [], { from: D(y, 2, 23) }),
    ev('maslenitsa', 'Ма́сленица', 'Carnaval de Máslenitsa', 'Una semana de despedida del invierno: блины́ todos los días y, al final, se quema un muñeco de paja.', plus(easter, -49), [
      { ru: 'блины́', es: 'crepas rusas', note: 'Redondas y doradas como el sol: en Ма́сленица se comen con crema, mermelada o caviar.' },
      { ru: 'Ма́сленица', es: 'la semana de despedida del invierno', note: 'Viene de ма́сло (mantequilla): la última semana antes de la Cuaresma, cuando aún se puede comer lácteos.' },
      { ru: 'чу́чело', es: 'muñeco de paja', note: 'El último día de Ма́сленица se quema el чу́чело de la Зима́ para dar la bienvenida a la primavera.' },
      { ru: 'Прощёное воскресе́нье', es: 'Domingo del Perdón', note: 'El último día de Ма́сленица la gente se pide perdón: «Прости́ меня́». Se responde: «Бог прости́т».' },
    ], { from: plus(easter, -55), to: plus(easter, -49), big: true }),
    ev('mar8', 'Междунаро́дный же́нский день', 'Día Internacional de la Mujer', 'El 8 de marzo es un gran día festivo en Rusia: se regalan flores a todas las mujeres.', D(y, 3, 8), [
      { ru: 'мимо́за', es: 'mimosa (flor amarilla)', note: 'La flor típica del 8 de marzo: ramitos amarillos que anuncian la primavera.' },
      { ru: 'тюльпа́ны', es: 'tulipanes', note: 'Junto con la мимо́за, el regalo clásico del 8 de marzo.' },
      { ru: 'поздравля́ть', es: 'felicitar', note: 'С пра́здником! = ¡Felicidades por el día festivo! Se usa en cualquier fiesta.' },
    ], { from: D(y, 3, 3) }),
    ev('easter', 'Па́сха', 'Pascua ortodoxa', 'La fiesta religiosa más importante: se pintan huevos y se hornea кули́ч.', easter, [
      { ru: 'кули́ч', es: 'pan dulce de Pascua', note: 'Alto y cilíndrico, cubierto de glaseado blanco. Se bendice en la iglesia la noche anterior.' },
      { ru: 'кра́шеные я́йца', es: 'huevos pintados', note: 'Tradicionalmente rojos, teñidos con cáscara de cebolla. Se «chocan» entre dos: gana el que no se rompe.' },
      { ru: 'Христо́с воскре́се!', es: '¡Cristo ha resucitado!', note: 'El saludo de Pascua. Se responde: «Вои́стину воскре́се!» (¡En verdad ha resucitado!).' },
    ], { from: plus(easter, -6), big: true }),
    ev('cosmonautics', 'День космона́втики', 'Día de la Cosmonáutica', 'El 12 de abril de 1961 Yuri Gagarin fue el primer ser humano en el espacio.', D(y, 4, 12), [
      { ru: 'космона́вт', es: 'cosmonauta, astronauta', note: 'En ruso se dice космона́вт; астрона́вт es para los de otros países.' },
      { ru: 'Пое́хали!', es: '¡Vámonos!', note: 'Lo que dijo Gagarin al despegar. Hoy los rusos lo dicen al empezar cualquier cosa.' },
    ], { from: D(y, 4, 9) }),
    ev('may1', 'Пра́здник Весны́ и Труда́', 'Día de la Primavera y del Trabajo', 'El 1 de mayo: puente largo, primeros días en la да́ча y шашлы́к al aire libre.', D(y, 5, 1), [
      { ru: 'шашлы́к', es: 'brochetas a la parrilla', note: 'Los primeros días cálidos de mayo, todo el mundo hace шашлы́к en la да́ча o en el parque.' },
    ], { from: D(y, 4, 28) }),
    ev('victory', 'День Побе́ды', 'Día de la Victoria', 'El 9 de mayo se recuerda el fin de la Segunda Guerra Mundial en Europa, con desfiles y fuegos artificiales.', D(y, 5, 9), [
      { ru: 'салю́т', es: 'fuegos artificiales', note: 'Por la noche del 9 de mayo hay салю́т en todas las ciudades.' },
    ], { from: D(y, 5, 5), big: true }),
    ev('russia-day', 'День Росси́и', 'Día de Rusia', 'Fiesta nacional del 12 de junio.', D(y, 6, 12), [], { from: D(y, 6, 12) }),
    ev('white-nights', 'Бе́лые но́чи', 'Noches blancas', 'De mediados de junio a principios de julio, en San Petersburgo casi no oscurece.', D(y, 6, 21), [
      { ru: 'бе́лые но́чи', es: 'noches blancas', note: 'El sol apenas se oculta y el cielo se queda claro toda la noche.' },
      { ru: 'разво́д мосто́в', es: 'la apertura de los puentes', note: 'De noche se levantan los puentes del Nevá para que pasen los barcos; mucha gente se queda a verlo.' },
    ], { from: D(y, 6, 11), to: D(y, 7, 2) }),
    ev('kupala', 'Ива́н Купа́ла', 'Noche de Iván Kupala', 'Noche del 6 al 7 de julio: hogueras, coronas de flores en el río y la búsqueda de la flor del helecho.', D(y, 7, 7), [
      { ru: 'вено́к', es: 'corona de flores', note: 'Las chicas lanzan un вено́к al río: según hacia dónde flote, adivinan su futuro.' },
      { ru: 'па́поротник', es: 'helecho', note: 'La leyenda dice que en la noche de Ива́н Купа́ла florece el па́поротник, y quien encuentra la flor halla un tesoro.' },
    ], { from: D(y, 7, 3) }),
    ev('sep1', 'День зна́ний', 'Día del Conocimiento (regreso a clases)', 'El 1 de septiembre empieza el año escolar: niños con flores y el «primer timbre».', D(y, 9, 1), [
      { ru: 'первокла́ссник', es: 'alumno de primer grado', note: 'El 1 de septiembre los первокла́ссники llegan a la escuela con un ramo de flores para la maestra.' },
      { ru: 'пе́рвый звоно́к', es: 'el primer timbre', note: 'La ceremonia del primer día de clases: un alumno mayor lleva a uno de primero tocando una campanita.' },
    ], { from: D(y, 8, 28) }),
    ev('mx-independence', 'День незави́симости Ме́ксики', 'Independencia de México', 'Para la clase: ¡Да здра́вствует Ме́ксика! = ¡Viva México!', D(y, 9, 16), [
      { ru: 'Да здра́вствует Ме́ксика!', es: '¡Viva México!', note: 'Да здра́вствует… = ¡Viva…! Lleva la misma raíz que здра́вствуйте: «que tenga salud».' },
    ], { from: D(y, 9, 13) }),
    ev('autumn', 'Ба́бье ле́то и о́сень', 'Veranillo y otoño', 'Septiembre y octubre: días tibios, hojas amarillas y temporada de hongos.', D(y, 10, 1), [
      { ru: 'листопа́д', es: 'caída de las hojas', note: 'Лист (hoja) + па́дать (caer). En ucraniano y bielorruso es también el nombre de un mes.' },
      { ru: 'собира́ть грибы́', es: 'ir a recoger hongos', note: 'Un pasatiempo nacional: en otoño familias enteras van al bosque con cestas.' },
      { ru: 'сля́коть', es: 'aguanieve, lodo de otoño', note: 'Esa mezcla de lluvia, nieve derretida y lodo de finales de otoño.' },
    ], { from: D(y, 9, 15), to: D(y, 10, 31) }),
    ev('teacher', 'День учи́теля', 'Día del Maestro', 'El 5 de octubre se felicita a los maestros con flores y tarjetas.', D(y, 10, 5), [
      { ru: 'учи́тель', es: 'maestro', note: 'Учи́тельница para una maestra. En la universidad se dice преподава́тель.' },
    ], { from: D(y, 10, 2) }),
    ev('mx-muertos', 'День мёртвых в Ме́ксике', 'Día de Muertos', 'Así se dice en ruso nuestra fiesta: la conocen como una de las tradiciones más famosas de México.', D(y, 11, 2), [
      { ru: 'День мёртвых', es: 'Día de Muertos', note: 'Мёртвый = muerto. Para explicar la ofrenda: алта́рь с фотогра́фиями и цвета́ми.' },
      { ru: 'са́харный че́реп', es: 'calavera de azúcar', note: 'Са́хар (azúcar) + че́реп (cráneo). Muchos rusos conocen el maquillaje de Catrina.' },
    ], { from: D(y, 10, 28) }),
    ev('unity', 'День наро́дного еди́нства', 'Día de la Unidad Nacional', 'Fiesta del 4 de noviembre, que recuerda la liberación de Moscú en 1612.', D(y, 11, 4), [], { from: D(y, 11, 4) }),
    ev('winter', 'Зима́', 'Llega el invierno', 'Diciembre a febrero: nieve, frío intenso y patinaje.', D(y, 12, 1), [
      { ru: 'сугро́б', es: 'montón de nieve', note: 'Los montones de nieve que se forman a los lados de las calles y pueden medir más que una persona.' },
      { ru: 'ва́ленки', es: 'botas de fieltro', note: 'Botas tradicionales de lana prensada, calientísimas. Se usan con chanclos de hule cuando hay lodo.' },
      { ru: 'сне́жная ба́ба', es: 'muñeco de nieve', note: 'Literalmente «mujer de nieve»: en ruso el muñeco de nieve es mujer.' },
      { ru: 'моро́з', es: 'helada, frío intenso', note: 'Моро́з и со́лнце — день чуде́сный! dice el famoso poema de Pushkin.' },
    ], { from: D(y, 12, 1), to: D(y, 12, 14) }),
    ev('mx-christmas', 'Католи́ческое Рождество́', 'Navidad (25 de diciembre)', 'En México es Navidad; en Rusia el 25 de diciembre es un día normal: la Navidad ortodoxa es el 7 de enero.', D(y, 12, 25), [], { from: D(y, 12, 25) }),
  ]
}

const NEW_YEAR: DailyWord[] = [
  { ru: 'ёлка', es: 'pino de Navidad', note: 'En Rusia el árbol es de Año Nuevo: se pone para el 31 de diciembre, no para Navidad.' },
  { ru: 'Дед Моро́з', es: 'el Abuelo Escarcha', note: 'El «Santa Claus» ruso: abrigo largo azul o rojo, bastón y barba hasta la cintura. Trae regalos en Año Nuevo.' },
  { ru: 'Снегу́рочка', es: 'la Doncella de Nieve', note: 'La nieta de Дед Моро́з, que lo acompaña a repartir regalos. Снег = nieve.' },
  { ru: 'оливье́', es: 'ensalada rusa', note: 'Papas, huevo, pepinillos, chícharos y mayonesa: no hay mesa de Año Nuevo sin оливье́.' },
  { ru: 'мандари́ны', es: 'mandarinas', note: 'El olor del Año Nuevo en Rusia: siempre hay un plato de мандари́ны en la mesa.' },
  { ru: 'бой куранто́в', es: 'las campanadas del reloj del Kremlin', note: 'A medianoche todo el país escucha el reloj de la Спа́сская ба́шня y pide un deseo.' },
  { ru: 'С Но́вым го́дом!', es: '¡Feliz Año Nuevo!', note: 'Literalmente «¡Con el Año Nuevo!». Se responde: «И вас то́же!» (¡Igualmente!).' },
  { ru: 'гирля́нда', es: 'serie de luces', note: 'Las luces de colores de la ёлка y de las ventanas.' },
  { ru: 'хлопу́шка', es: 'cohete de confeti', note: 'Tubo que al jalarlo truena y lanza confeti: imprescindible a medianoche.' },
  { ru: 'коля́дки', es: 'cantos de Navidad', note: 'Canciones tradicionales que se cantaban de casa en casa en la temporada navideña, a cambio de dulces.' },
]

const cache = new Map<number, SeasonEvent[]>()
function eventsAround(year: number): SeasonEvent[] {
  if (!cache.has(year)) cache.set(year, [...eventsOfYear(year - 1), ...eventsOfYear(year), ...eventsOfYear(year + 1)])
  return cache.get(year)!
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

/** Holidays whose seasonal window contains today. */
export function activeSeasons(now = new Date()): SeasonEvent[] {
  const t = startOfDay(now).getTime()
  return eventsAround(now.getFullYear()).filter((e) => e.from.getTime() <= t && t <= e.to.getTime() && e.words.length)
}

/** Upcoming holiday days (today included) within `days` days, soonest first. */
export function upcomingEvents(now = new Date(), days = 30, max = 3): SeasonEvent[] {
  const t = startOfDay(now).getTime()
  const limit = t + days * 86_400_000
  const seen = new Set<string>()
  return eventsAround(now.getFullYear())
    .filter((e) => e.day.getTime() >= t && e.day.getTime() <= limit)
    .sort((a, b) => a.day.getTime() - b.day.getTime())
    .filter((e) => (seen.has(e.ru) ? false : (seen.add(e.ru), true)))
    .slice(0, max)
}
