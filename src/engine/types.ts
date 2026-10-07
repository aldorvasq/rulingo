// Runtime exercises: every content exercise and every generated one is normalized into these shapes,
// so the player only needs one component per `kind`.

export type Lang = 'ru' | 'es'

/** Stats bucket used for topics and badges ("100 conjugations", "50 antonyms"…). */
export type Skill = 'vocab' | 'grammar' | 'conjugation' | 'antonym' | 'writing' | 'reading' | 'syntax'

interface RunBase {
  key: string
  /** SRS ids: items[0] is the exercise's own subject (word / exercise id), the rest are grammar tags. */
  items: string[]
  lessonId: string
  instruction: string
  explanation?: string
  skill: Skill
  sneak?: boolean
  /** Context shown above the prompt (reading passage or dialogue). */
  passage?: { title?: string; text: string; textEs?: string }
  dialogue?: { speaker: string; ru: string }[]
}

export type RunExercise = RunBase & (
  | { kind: 'choice'; prompt?: string; promptLang: Lang; choices: string[]; choiceLang: Lang; answer: number }
  | { kind: 'typed'; prompt?: string; promptLang: Lang; answers: string[]; answerLang: Lang; strict: boolean; hint?: string }
  | { kind: 'conjugate'; verb: string; pronouns: string[]; answers: string[] }
  | { kind: 'word_order'; words: string[]; answer: string; translation?: string }
  | { kind: 'match'; pairs: [string, string][] }
  | { kind: 'sort'; categories: string[]; entries: { text: string; category: string }[] }
  | { kind: 'error_spot'; sentence: string; wrongWord: number; correction: string }
)

export interface AnswerResult {
  correct: boolean
  /** Accepted with a typo. */
  almost?: boolean
  /** Shown in the feedback sheet when wrong / almost. */
  correctAnswer?: string
  typed?: boolean
}

/** A candidate the session builder can choose; `make` renders a fresh instance (new distractors). */
export interface Candidate {
  id: string
  lessonId: string
  items: string[]
  /** 1 = recognition, 2 = recall, 3 = production. Matched against SRS box. */
  level: 1 | 2 | 3
  /** Hand-made exercises from the book/extras get preference over generated ones. */
  handmade?: boolean
  sneak?: boolean
  skill: Skill
  kind: RunExercise['kind']
  make: () => RunExercise
}
