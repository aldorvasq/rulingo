// Pictures for vocabulary: storybook paintings generated for each word (public/img/vocab, listed in
// photos.json by scripts/images/build-images.ts), the phone's colour emoji as a fallback, and
// recolourable drawings of everyday objects for the colour exercises.
import photos from './photos.json'
import colourPhotos from './colour-photos.json'

/** Plain word (no stress marks, lower case) → emoji. Every emoji is unique so a picture has one answer. */
export const EMOJI: Record<string, string> = {
  // 1.1
  'банан': '🍌', 'вино': '🍷', 'вода': '💧', 'гитара': '🎸', 'инъекция': '💉', 'карта': '🗺️', 'кот': '🐈', 'кофе': '☕',
  'лимон': '🍋', 'метро': '🚇', 'нота': '🎵', 'пиво': '🍺', 'радио': '📻', 'ракета': '🚀', 'ресторан': '🍽️', 'роза': '🌹',
  'сок': '🧃', 'стадион': '🏟️', 'суп': '🍲', 'томат': '🍅', 'торт': '🎂', 'тюльпан': '🌷', 'фильм': '🎬', 'цирк': '🎪',
  'чай': '🍵', 'чек': '🧾', 'шампанское': '🍾', 'шеф': '👨‍🍳', 'яхта': '🛥️', 'парк': '🏞️', 'экзамен': '📝',
  // 1.2
  'россия': '🇷🇺', 'швейцария': '🇨🇭', 'италия': '🇮🇹', 'франция': '🇫🇷', 'германия': '🇩🇪', 'испания': '🇪🇸',
  'америка': '🇺🇸', 'мексика': '🇲🇽', 'аргентина': '🇦🇷', 'канада': '🇨🇦', 'китай': '🇨🇳', 'паспорт': '🛂', 'ананас': '🍍',
  'португалия': '🇵🇹', 'греция': '🇬🇷', 'норвегия': '🇳🇴', 'дания': '🇩🇰',
  // 1.3
  'аптека': '💊', 'аэропорт': '🛫', 'банк': '🏦', 'бар': '🍸', 'библиотека': '📚', 'вокзал': '🚉', 'зоопарк': '🦁',
  'кино': '🎞️', 'клиника': '🏥', 'магазин': '🏪', 'музей': '🏛️', 'отель': '🏨', 'почта': '📮', 'супермаркет': '🛒',
  'театр': '🎭', 'школа': '🏫', 'церковь': '⛪', 'город': '🏙️', 'папа': '👨',
  // 1.4
  'врач': '👩‍⚕️', 'официант': '🤵', 'пилот': '👨‍✈️', 'полицейский': '👮', 'преподаватель': '👨‍🏫', 'спортсмен': '🏃',
  'студент': '🧑‍🎓', 'таксист': '🚕', 'ручка': '🖊️', 'визитка': '📇',
  // 2.1
  'микрофон': '🎤', 'фотоаппарат': '📷', 'билет': '🎫', 'газета': '🗞️', 'дверь': '🚪', 'деньги': '💵', 'зонтик': '☂️',
  'карандаш': '✏️', 'ключ': '🔑', 'книга': '📕', 'компьютер': '💻', 'косметика': '💄', 'кошелёк': '👛', 'лампа': '💡',
  'машина': '🚗', 'очки': '👓', 'письмо': '✉️', 'сумка': '👜', 'телефон': '📱', 'тетрадь': '📓', 'фотография': '📸',
  'часы': '⌚', 'окно': '🪟', 'рюкзак': '🎒', 'диплом': '🎓',
  // 2.2
  'собака': '🐕', 'пальто': '🧥', 'бабушка': '👵', 'дедушка': '👴', 'ребёнок': '👶', 'семья': '👨‍👩‍👧', 'мальчик': '👦',
  'девочка': '👧', 'мама': '👩',
  // 2.3
  'балерина': '🩰', 'карты': '🃏', 'любовь': '❤️', 'попугай': '🦜', 'новости': '📰', 'телевизор': '📺', 'диск': '💿',
  'бутерброд': '🥪', 'салат': '🥗', 'спагетти': '🍝', 'суши': '🍣', 'пицца': '🍕', 'попкорн': '🍿', 'кока-кола': '🥤',
  'баскетбол': '🏀', 'бильярд': '🎱', 'боулинг': '🎳', 'гольф': '⛳', 'дайвинг': '🤿', 'йога': '🧘', 'рыбалка': '🎣',
  'сноуборд': '🏂', 'футбол': '⚽', 'хоккей': '🏒', 'шахматы': '♟️', 'шопинг': '🛍️', 'музыка': '🎶', 'багет': '🥖',
  // 2.4
  'пельмени': '🥟', 'паэлья': '🥘', 'теннис': '🎾', 'пианино': '🎹', 'саксофон': '🎷', 'скрипка': '🎻', 'труба': '🎺',
  'волейбол': '🏐', 'танго': '💃',
  // 3.1
  'дом': '🏠', 'квартира': '🏢', 'бассейн': '🏊', 'сад': '🏡', 'растение': '🪴', 'черепаха': '🐢', 'ванная': '🛁',
  'душ': '🚿', 'зеркало': '🪞', 'картина': '🖼️', 'диван': '🛋️', 'кровать': '🛏️', 'стул': '🪑', 'лестница': '🪜',
  'ваза': '🏺', 'туалет': '🚽',
  // 3.2
  'рыба': '🐟', 'самолёт': '✈️', 'скелет': '💀', 'коктейль': '🍹', 'джинсы': '👖', 'футболка': '👕', 'наушники': '🎧',
  'чайник': '🫖', 'календарь': '📅', 'кактус': '🌵', 'дерево': '🌳',
  // 3.3
  'конфета': '🍬', 'принтер': '🖨️', 'папка': '📁', 'цветок': '🌸', 'документ': '📄', 'яблоко': '🍎', 'море': '🌊',
  // 3.4
  'гора': '⛰️', 'крокодил': '🐊',
}

/** Generated paintings (word → path under public/); a painting wins over the emoji. */
export const PHOTOS: Record<string, string> = photos
/** Generated paintings of each colour object in each colour ("object|colour" → path); else the drawing is used. */
export const COLOUR_PHOTOS: Record<string, string> = colourPhotos

// ---------------------------------------------------------------- colours

export interface Colour { word: string; hex: string; stroke?: string }
/** Colour adjectives (plain masculine form) → paint. */
export const COLOURS: Record<string, Colour> = {
  'красный': { word: 'красный', hex: '#d0343c' }, 'жёлтый': { word: 'жёлтый', hex: '#f0c030' },
  'оранжевый': { word: 'оранжевый', hex: '#ee7d2a' }, 'синий': { word: 'синий', hex: '#2b4c9b' },
  'голубой': { word: 'голубой', hex: '#86c3ea' }, 'зелёный': { word: 'зелёный', hex: '#3f9a4b' },
  'белый': { word: 'белый', hex: '#fbfaf6', stroke: '#b9b5aa' }, 'чёрный': { word: 'чёрный', hex: '#26262a' },
  'серый': { word: 'серый', hex: '#9b9c9e' }, 'фиолетовый': { word: 'фиолетовый', hex: '#7b4fa3' },
  'розовый': { word: 'розовый', hex: '#f19bbb' }, 'коричневый': { word: 'коричневый', hex: '#7a4f2f' },
  'бежевый': { word: 'бежевый', hex: '#dcc59c' },
}

export interface ColourObject { ru: string; es: string; gender: 'm' | 'f' | 'n' | 'pl'; draw: (c: string, s: string) => string }

const o = (c: string, s: string) => `fill="${c}" stroke="${s}" stroke-width="2.5" stroke-linejoin="round"`
/** Simple object drawings (viewBox 0 0 120 100) painted in any colour; the rest stays neutral. */
export const OBJECTS: ColourObject[] = [
  { ru: 'маши́на', es: 'el carro', gender: 'f', draw: (c, s) => `
    <ellipse cx="60" cy="86" rx="48" ry="5" fill="rgba(0,0,0,.15)"/>
    <path d="M10,72 v-14 q0,-6 6,-7 l12,-2 l14,-16 h34 l16,16 l14,3 q6,1 6,7 v13 z" ${o(c, s)}/>
    <path d="M46,38 h14 v15 h-24 z M66,38 h9 l12,15 h-21 z" fill="#d6e7f0" stroke="${s}" stroke-width="2"/>
    <circle cx="32" cy="74" r="10" fill="#2b2b30"/><circle cx="32" cy="74" r="4" fill="#bbb"/><circle cx="88" cy="74" r="10" fill="#2b2b30"/><circle cx="88" cy="74" r="4" fill="#bbb"/>` },
  { ru: 'дом', es: 'la casa', gender: 'm', draw: (c, s) => `
    <ellipse cx="60" cy="92" rx="44" ry="4" fill="rgba(0,0,0,.15)"/>
    <rect x="24" y="44" width="72" height="46" ${o(c, s)}/><path d="M16,46 L60,12 L104,46 Z" fill="#8a5a44" stroke="#5c3a2c" stroke-width="2.5" stroke-linejoin="round"/>
    <rect x="52" y="62" width="16" height="28" fill="#6b4a36" stroke="#4a3024" stroke-width="2"/>
    <rect x="32" y="54" width="14" height="14" fill="#d6e7f0" stroke="${s}" stroke-width="2"/><rect x="74" y="54" width="14" height="14" fill="#d6e7f0" stroke="${s}" stroke-width="2"/>` },
  { ru: 'я́блоко', es: 'la manzana', gender: 'n', draw: (c, s) => `
    <ellipse cx="60" cy="92" rx="30" ry="4" fill="rgba(0,0,0,.15)"/>
    <path d="M60,30 C40,18 18,32 22,56 C26,80 44,92 60,86 C76,92 94,80 98,56 C102,32 80,18 60,30 Z" ${o(c, s)}/>
    <path d="M60,30 q2,-14 10,-20" fill="none" stroke="#5c3a2c" stroke-width="3" stroke-linecap="round"/>
    <path d="M64,22 q14,-10 22,0 q-12,8 -22,0 z" fill="#4f8f4c" stroke="#2f5f30" stroke-width="1.5"/>
    <ellipse cx="44" cy="44" rx="6" ry="10" fill="#fff" opacity=".35"/>` },
  { ru: 'цвето́к', es: 'la flor', gender: 'm', draw: (c, s) => `
    <path d="M60,56 V94" stroke="#3f7a3c" stroke-width="4"/><path d="M60,80 q-16,-4 -20,-16 q14,0 20,16 z" fill="#4f8f4c"/>
    ${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="60" cy="30" rx="12" ry="18" transform="rotate(${a} 60 46)" ${o(c, s)}/>`).join('')}
    <circle cx="60" cy="46" r="9" fill="#f0c030" stroke="#b8902a" stroke-width="2"/>` },
  { ru: 'футбо́лка', es: 'la playera', gender: 'f', draw: (c, s) => `
    <path d="M38,14 L18,24 L8,46 L24,52 L30,40 V92 H90 V40 L96,52 L112,46 L102,24 L82,14 Q60,30 38,14 Z" ${o(c, s)}/>
    <path d="M44,16 Q60,28 76,16" fill="none" stroke="${s}" stroke-width="2"/>` },
  { ru: 'зо́нтик', es: 'el paraguas', gender: 'm', draw: (c, s) => `
    <path d="M60,46 V84 q0,8 -8,8 q-6,0 -6,-6" fill="none" stroke="#3a3a3a" stroke-width="4" stroke-linecap="round"/>
    <path d="M10,48 Q14,10 60,8 Q106,10 110,48 Q98,40 85,48 Q72,40 60,48 Q48,40 35,48 Q22,40 10,48 Z" ${o(c, s)}/>
    <path d="M60,8 V48 M35,48 Q40,20 60,8 M85,48 Q80,20 60,8" fill="none" stroke="${s}" stroke-width="1.5"/>` },
  { ru: 'су́мка', es: 'la bolsa', gender: 'f', draw: (c, s) => `
    <path d="M40,40 Q40,14 60,14 Q80,14 80,40" fill="none" stroke="#3a3a3a" stroke-width="4"/>
    <path d="M22,40 H98 L90,90 H30 Z" ${o(c, s)}/><rect x="54" y="50" width="12" height="8" rx="2" fill="#d9b15a" stroke="#a8832f"/>` },
  { ru: 'кре́сло', es: 'el sillón', gender: 'n', draw: (c, s) => `
    <ellipse cx="60" cy="94" rx="44" ry="4" fill="rgba(0,0,0,.15)"/>
    <path d="M30,62 V24 Q30,12 42,12 H78 Q90,12 90,24 V62 Z" ${o(c, s)}/>
    <rect x="14" y="44" width="20" height="38" rx="8" ${o(c, s)}/><rect x="86" y="44" width="20" height="38" rx="8" ${o(c, s)}/>
    <rect x="30" y="58" width="60" height="20" rx="4" ${o(c, s)}/><path d="M24,82 v10 M96,82 v10" stroke="#5c3a2c" stroke-width="4"/>` },
  { ru: 'джи́нсы', es: 'los jeans', gender: 'pl', draw: (c, s) => `
    <path d="M32,10 H88 L94,94 H68 L60,40 L52,94 H26 Z" ${o(c, s)}/>
    <path d="M32,20 H88 M60,20 V36" stroke="${s}" stroke-width="2"/><path d="M40,28 q6,8 14,6 M80,28 q-6,8 -14,6" fill="none" stroke="${s}" stroke-width="1.5"/>` },
]

/** The colour's form that agrees with the object (красный → красная маши́на). */
export const agree = (forms: Record<string, string>, gender: ColourObject['gender']) => forms[gender] ?? forms.m

/** The form used to answer «Како́го цве́та…?»: кра́сный → кра́сного, голубо́й → голубо́го, си́ний → си́него. */
export function colourGenitive(m: string) {
  if (m.endsWith('о́й')) return m.slice(0, -2) + 'о́го'
  if (m.endsWith('ый')) return m.slice(0, -2) + 'ого'
  if (m.endsWith('ий')) return m.slice(0, -2) + 'его'
  return m
}
