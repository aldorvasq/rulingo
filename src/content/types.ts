// Mirrors content/SCHEMA.md. Content files are hand/agent-written, so most fields are optional.

export type Pos =
  | 'noun' | 'verb' | 'adj' | 'adv' | 'pron' | 'num' | 'prep'
  | 'conj' | 'particle' | 'phrase' | 'interj'

export type Gender = 'm' | 'f' | 'n' | 'pl'

export interface VocabItem {
  id: string
  ru: string
  es: string
  pos?: Pos
  gender?: Gender
  plural?: string
  forms?: Partial<Record<Gender, string>>
  conj?: { type?: string; present?: Record<string, string> }
  antonyms?: string[]
  synonyms?: string[]
  topic?: string
  fromSlovar?: boolean
  sneak?: boolean
}

export interface Example { ru: string; es: string }

export interface GrammarPoint {
  id: string
  title: string
  explanationEs?: string
  tables?: { caption?: string; headers?: string[]; rows: string[][] }[]
  examples?: Example[]
  drill?: { kind: string; items: { base: string; forms: Record<string, string> }[] }
}

export interface Reading {
  id: string
  title?: string
  textRu: string
  textEs?: string
  questions?: { q: string; qEs?: string; choices: string[]; answer: number }[]
}

interface ExBase {
  id: string
  instructionEs?: string
  explanationEs?: string
  tags?: string[]
  origin?: string
}

export type ContentExercise = ExBase & (
  | { type: 'fill_choice'; sentence: string; choices: string[]; answer: number }
  | { type: 'fill_typed'; sentence: string; answers: string[]; hint?: string }
  | { type: 'antonym' | 'synonym'; word: string; choices?: string[]; answers: string[] }
  | { type: 'conjugate'; verb: string; pronouns: string[]; answers: string[] }
  | { type: 'word_order'; words: string[]; answer: string; es?: string }
  | { type: 'translate'; direction: 'es-ru' | 'ru-es'; prompt: string; answers: string[] }
  | { type: 'match'; pairs: [string, string][] }
  | { type: 'sort'; categories: string[]; items: { text: string; category: string }[] }
  | { type: 'error_spot'; sentence: string; wrongWord: number; correction: string }
  | { type: 'transform'; prompt: string; answers: string[] }
  | { type: 'dialogue'; lines: { speaker: string; ru: string }[]; choices: string[]; answer: number }
)

export interface Lesson {
  id: string
  title: string
  titleEs?: string
  summaryEs?: string
  story?: { settingEs?: string; characters?: { name: string; descriptionEs?: string }[] }
  grammar?: GrammarPoint[]
  vocab?: VocabItem[]
  phrases?: { ru: string; es: string; noteEs?: string }[]
  sentences?: { ru: string; es: string; tags?: string[] }[]
  readings?: Reading[]
  exercises?: ContentExercise[]
}

export interface Chapter {
  chapter: number
  title: string
  titleEs?: string
  source?: { textbookPages?: string; workbookPages?: string }
  lessons: Lesson[]
  sneakIns?: VocabItem[]
}

/** Supplementary pack (content/extra/*.json): lessons are merged into the book lessons by id. */
export interface ExtraPack {
  id: string
  lessons?: (Partial<Lesson> & { id: string })[]
  sneakIns?: (VocabItem & { lessonId?: string })[]
}
