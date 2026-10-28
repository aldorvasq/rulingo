import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addDays, dayKey, daysBetween } from '../lib/date'
import { review, type ItemState } from '../engine/srs'
import type { AnswerResult, RunExercise, Skill } from '../engine/types'
import { evaluateBadges } from './badges'

export interface Settings {
  name: string
  onboarded: boolean
  /** The lesson the learner is on in class — Home opens on it. */
  focusLessons: string[]
  /** Everything up to this lesson is unlocked and reviewed. */
  coveredUpTo: string
  sessionLength: number
  translit: boolean
  /** On-screen ЙЦУКЕН keyboard (suppresses the phone keyboard). */
  cyrKeyboard: boolean
  /** Legacy explicit choice; kept so older backups still load. */
  theme: 'light' | 'dark'
  /** 'system' follows the phone's light/dark setting. */
  themeMode: 'system' | 'light' | 'dark'
  /** The skill the learner chose to strengthen (suggested from their weakest), and since when. */
  goal: Skill | null
  goalSince: string | null
  /** The class position (CLASS_AT) last applied to these settings. */
  classAt?: string
}

export interface Stats {
  xpTotal: number
  xpByDay: Record<string, number>
  sessions: number
  perfect: number
  answered: number
  correct: number
  bySkill: Partial<Record<Skill, number>>
  typedCorrect: number
  sneakCorrect: number
  dailyDone: string[]
  lessonRuns: Record<string, number>
  earlyBird: number
  nightOwl: number
  /** First-attempt answers per day and skill: [attempts, correct without a hint]. Drives the weakness analysis. */
  skillLog: Record<string, Partial<Record<Skill, [number, number]>>>
}

export interface Streak {
  current: number
  best: number
  lastGoalDay: string | null
  freezes: number
  frozenDays: string[]
}

export interface PersistedState {
  settings: Settings
  progress: Record<string, ItemState>
  stats: Stats
  streak: Streak
  badges: Record<string, string>
  lastBackup: string | null
  /** Hints spent today (the count resets each day). */
  hints: { day: string; used: number }
  /** Mock exam results per chapter ('3') or lesson ('3.2'), oldest first. */
  mocks: Record<string, MockRecord[]>
}

export interface MockRecord {
  day: string
  correct: number
  total: number
  /** Section id → [correct, total]. */
  sections: Record<string, [number, number]>
  /** Seconds taken. */
  seconds: number
}

export const HINTS_PER_DAY = 3

export interface SessionSummary {
  xp: number
  correct: number
  total: number
  perfect: boolean
  newBadges: string[]
  streakIncreased: boolean
  streak: number
}

interface Actions {
  updateSettings: (s: Partial<Settings>) => void
  recordAnswer: (ex: RunExercise, r: AnswerResult) => void
  finishSession: (o: { xp: number; correct: number; total: number; mode: string; lessonId?: string }) => SessionSummary
  settleStreak: () => void
  replaceState: (s: PersistedState) => void
  markBackup: () => void
  /** Spend one of today's hints; false when none are left. */
  spendHint: () => boolean
  /** Keyed by chapter number ('3') or lesson id ('3.2'). */
  saveMock: (key: string, r: MockRecord) => void
  resetAll: () => void
}

/** Where the class is now. When this moves on, everyone who was behind it is moved up once (they can change it back in Ajustes). */
export const CLASS_AT = '4.1'
const lessonBefore = (a: string, b: string) => {
  const [x, y] = [a, b].map((id) => id.split('.').map(Number))
  return x[0] !== y[0] ? x[0] < y[0] : (x[1] ?? 0) < (y[1] ?? 0)
}

export const defaultSettings: Settings = {
  name: '',
  onboarded: false,
  focusLessons: [CLASS_AT],
  coveredUpTo: CLASS_AT,
  classAt: CLASS_AT,
  sessionLength: 15,
  translit: false,
  theme: 'light',
  themeMode: 'system',
  goal: null,
  goalSince: null,
  cyrKeyboard: typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches,
}

const initial = (): PersistedState => ({
  settings: defaultSettings,
  progress: {},
  stats: {
    xpTotal: 0, xpByDay: {}, sessions: 0, perfect: 0, answered: 0, correct: 0, bySkill: {},
    typedCorrect: 0, sneakCorrect: 0, dailyDone: [], lessonRuns: {}, earlyBird: 0, nightOwl: 0, skillLog: {},
  },
  streak: { current: 0, best: 0, lastGoalDay: null, freezes: 0, frozenDays: [] },
  badges: {},
  lastBackup: null,
  hints: { day: '', used: 0 },
  mocks: {},
})

/** Apply missed days: spend streak freezes if there are enough, otherwise the streak resets. */
export function settle(st: Streak, today: string): Streak {
  if (!st.lastGoalDay || st.current === 0) return st
  const gap = daysBetween(st.lastGoalDay, today)
  if (gap <= 1) return st
  const missed = gap - 1
  if (st.freezes >= missed) {
    const days = Array.from({ length: missed }, (_, i) => addDays(st.lastGoalDay!, i + 1))
    return { ...st, freezes: st.freezes - missed, lastGoalDay: addDays(today, -1), frozenDays: [...st.frozenDays, ...days].slice(-60) }
  }
  return { ...st, current: 0 }
}

export const useStore = create<PersistedState & Actions>()(
  persist(
    (set, get) => ({
      ...initial(),

      updateSettings: (s) => set((st) => ({ settings: { ...st.settings, ...s } })),

      recordAnswer: (ex, r) => {
        const today = dayKey()
        set((st) => {
          const progress = { ...st.progress }
          for (const id of ex.items) progress[id] = review(progress[id], r.correct, today)
          const stats = { ...st.stats, answered: st.stats.answered + 1 }
          // Honest per-skill accuracy: a hinted answer counts as an attempt but not as correct.
          const day = { ...(st.stats.skillLog[today] ?? {}) }
          const [a, c] = day[ex.skill] ?? [0, 0]
          day[ex.skill] = [a + 1, c + (r.correct && !r.hinted ? 1 : 0)]
          const keep = Object.keys(st.stats.skillLog).filter((d) => d >= addDays(today, -180))
          stats.skillLog = { ...Object.fromEntries(keep.map((d) => [d, st.stats.skillLog[d]])), [today]: day }
          if (r.correct) {
            stats.correct += 1
            stats.bySkill = { ...stats.bySkill, [ex.skill]: (stats.bySkill[ex.skill] ?? 0) + 1 }
            if (r.typed) stats.typedCorrect += 1
            if (ex.sneak) stats.sneakCorrect += 1
          }
          return { progress, stats }
        })
      },

      finishSession: ({ xp, correct, total, mode, lessonId }) => {
        const today = dayKey()
        const hour = new Date().getHours()
        const st = get()
        const perfect = total > 0 && correct === total
        const bonus = (perfect ? 20 : 0) + (mode === 'daily' && !st.stats.dailyDone.includes(today) ? 10 : 0)
        const gained = xp + bonus
        const xpToday = (st.stats.xpByDay[today] ?? 0) + gained
        const stats: Stats = {
          ...st.stats,
          xpTotal: st.stats.xpTotal + gained,
          xpByDay: { ...st.stats.xpByDay, [today]: xpToday },
          sessions: st.stats.sessions + 1,
          perfect: st.stats.perfect + (perfect ? 1 : 0),
          dailyDone: mode === 'daily' && !st.stats.dailyDone.includes(today) ? [...st.stats.dailyDone, today].slice(-400) : st.stats.dailyDone,
          lessonRuns: lessonId ? { ...st.stats.lessonRuns, [lessonId]: (st.stats.lessonRuns[lessonId] ?? 0) + 1 } : st.stats.lessonRuns,
          earlyBird: st.stats.earlyBird + (hour < 8 ? 1 : 0),
          nightOwl: st.stats.nightOwl + (hour >= 23 ? 1 : 0),
        }
        // Any finished review counts for the day's streak — there is no minimum time or XP.
        let streak = settle(st.streak, today)
        let streakIncreased = false
        if (streak.lastGoalDay !== today) {
          const current = streak.current + 1
          streak = {
            ...streak,
            current,
            best: Math.max(streak.best, current),
            lastGoalDay: today,
            freezes: current % 5 === 0 ? Math.min(2, streak.freezes + 1) : streak.freezes,
          }
          streakIncreased = true
        }
        const next = { ...st, stats, streak }
        const earned = evaluateBadges(next).filter((id) => !st.badges[id])
        const badges = { ...st.badges }
        earned.forEach((id) => (badges[id] = today))
        set({ stats, streak, badges })
        return { xp: gained, correct, total, perfect, newBadges: earned, streakIncreased, streak: streak.current }
      },

      settleStreak: () => set((st) => ({ streak: settle(st.streak, dayKey()) })),

      replaceState: (s) => set({ ...initial(), ...s, settings: { ...defaultSettings, ...s.settings,
        themeMode: s.settings.themeMode ?? (s.settings.theme === 'dark' ? 'dark' : 'system') } }),

      markBackup: () => set({ lastBackup: dayKey() }),

      spendHint: () => {
        const today = dayKey()
        const used = get().hints.day === today ? get().hints.used : 0
        if (used >= HINTS_PER_DAY) return false
        set({ hints: { day: today, used: used + 1 } })
        return true
      },

      saveMock: (key, r) => set((st) => ({ mocks: { ...st.mocks, [key]: [...(st.mocks[key] ?? []), r].slice(-20) } })),

      resetAll: () => set(initial()),
    }),
    {
      name: 'rulingo',
      version: 1,
      partialize: ({ settings, progress, stats, streak, badges, lastBackup, hints, mocks }) => ({ settings, progress, stats, streak, badges, lastBackup, hints, mocks }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PersistedState>
        const settings = { ...defaultSettings, ...p.settings }
        // Before themeMode existed, light was just the default: only an explicit dark choice is kept.
        const saved = p.settings as Partial<Settings> | undefined
        if (saved && saved.themeMode === undefined) settings.themeMode = saved.theme === 'dark' ? 'dark' : 'system'
        // The class moved on: unlock the new lesson and make it the focus, once per move.
        if (saved && saved.classAt !== CLASS_AT) {
          if (lessonBefore(settings.coveredUpTo, CLASS_AT)) {
            settings.coveredUpTo = CLASS_AT
            settings.focusLessons = [CLASS_AT]
          }
          settings.classAt = CLASS_AT
        }
        return { ...current, ...p, settings, stats: { ...current.stats, ...p.stats } }
      },
    },
  ),
)

export const snapshot = (): PersistedState => {
  const { settings, progress, stats, streak, badges, lastBackup, hints, mocks } = useStore.getState()
  return { settings, progress, stats, streak, badges, lastBackup, hints, mocks }
}

/** Hints still available today. */
export const hintsLeft = (h: PersistedState['hints']) => HINTS_PER_DAY - (h.day === dayKey() ? h.used : 0)
