import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addDays, dayKey, daysBetween } from '../lib/date'
import { review, type ItemState } from '../engine/srs'
import type { AnswerResult, RunExercise, Skill } from '../engine/types'
import { evaluateBadges } from './badges'

export interface Settings {
  name: string
  onboarded: boolean
  /** "Esta semana en clase" — drives the daily lesson. */
  focusLessons: string[]
  /** Optional grammar ids inside the focus lessons to emphasise. */
  focusTopics: string[]
  /** Everything up to this lesson is unlocked and reviewed. */
  coveredUpTo: string
  dailyGoal: number
  sessionLength: number
  translit: boolean
  sound: boolean
  listening: boolean
  /** On-screen ЙЦУКЕН keyboard (suppresses the phone keyboard). */
  cyrKeyboard: boolean
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
}

export interface SessionSummary {
  xp: number
  correct: number
  total: number
  perfect: boolean
  newBadges: string[]
  streakIncreased: boolean
  streak: number
  goalReached: boolean
}

interface Actions {
  updateSettings: (s: Partial<Settings>) => void
  recordAnswer: (ex: RunExercise, r: AnswerResult) => void
  finishSession: (o: { xp: number; correct: number; total: number; mode: string; lessonId?: string }) => SessionSummary
  settleStreak: () => void
  replaceState: (s: PersistedState) => void
  markBackup: () => void
  resetAll: () => void
}

export const defaultSettings: Settings = {
  name: '',
  onboarded: false,
  focusLessons: ['3.4'],
  focusTopics: [],
  coveredUpTo: '3.4',
  dailyGoal: 30,
  sessionLength: 15,
  translit: false,
  sound: true,
  listening: true,
  cyrKeyboard: typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches,
}

const initial = (): PersistedState => ({
  settings: defaultSettings,
  progress: {},
  stats: {
    xpTotal: 0, xpByDay: {}, sessions: 0, perfect: 0, answered: 0, correct: 0, bySkill: {},
    typedCorrect: 0, sneakCorrect: 0, dailyDone: [], lessonRuns: {}, earlyBird: 0, nightOwl: 0,
  },
  streak: { current: 0, best: 0, lastGoalDay: null, freezes: 0, frozenDays: [] },
  badges: {},
  lastBackup: null,
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
        let streak = settle(st.streak, today)
        const goalReached = xpToday >= st.settings.dailyGoal
        let streakIncreased = false
        if (goalReached && streak.lastGoalDay !== today) {
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
        return { xp: gained, correct, total, perfect, newBadges: earned, streakIncreased, streak: streak.current, goalReached }
      },

      settleStreak: () => set((st) => ({ streak: settle(st.streak, dayKey()) })),

      replaceState: (s) => set({ ...initial(), ...s, settings: { ...defaultSettings, ...s.settings } }),

      markBackup: () => set({ lastBackup: dayKey() }),

      resetAll: () => set(initial()),
    }),
    {
      name: 'rulingo',
      version: 1,
      partialize: ({ settings, progress, stats, streak, badges, lastBackup }) => ({ settings, progress, stats, streak, badges, lastBackup }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PersistedState>
        return { ...current, ...p, settings: { ...defaultSettings, ...p.settings }, stats: { ...current.stats, ...p.stats } }
      },
    },
  ),
)

export const snapshot = (): PersistedState => {
  const { settings, progress, stats, streak, badges, lastBackup } = useStore.getState()
  return { settings, progress, stats, streak, badges, lastBackup }
}
