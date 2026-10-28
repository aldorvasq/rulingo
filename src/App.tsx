import { useEffect } from 'react'
import { useRoute, navigate } from './lib/router'
import { useStore } from './state/store'
import { Icon } from './components/ui'
import { stopAudio, useAudioReady } from './lib/audio'
import { Home } from './screens/Home'
import { Path } from './screens/Path'
import { Player } from './screens/Player'
import { LessonDetail } from './screens/LessonDetail'
import { Profile } from './screens/Profile'
import { Settings } from './screens/Settings'
import { Onboarding } from './screens/Onboarding'
import { ChapterReviews, Exam } from './screens/Exam'
import { MockExam } from './screens/MockExam'
import { daysUntil, upcomingExam } from './content/exams'

const NAV = [
  { path: '/', icon: 'home', label: 'Inicio' },
  { path: '/path', icon: 'map', label: 'Ruta' },
  { path: '/profile', icon: 'profile', label: 'Progreso' },
  { path: '/settings', icon: 'settings', label: 'Ajustes' },
]
/** While an exam is coming up it gets its own tab (after Ruta). */
const EXAM_TAB = { path: '/exam', icon: 'exam', label: 'Examen' }

/** The exam tab stands out: brick-red pill, a pulsing ring and the days left as a badge. */
function ExamTab({ active }: { active: boolean }) {
  const exam = upcomingExam()
  const d = exam ? daysUntil(exam) : 0
  return (
    <button onClick={() => navigate('/exam')} className="flex flex-1 flex-col items-center gap-0.5 pt-1.5 pb-1 text-[11px] font-bold text-brick">
      <span className={`exam-tab relative flex h-8 w-12 items-center justify-center rounded-full ${active ? 'bg-brick text-white' : 'bg-brick/12'}`}>
        <Icon name="exam" size={21} />
        <span className="absolute -top-1.5 -right-2 min-w-5 rounded-full border-2 border-bg bg-brick px-1 text-center text-[10px] leading-4 text-white tabular-nums">
          {d <= 0 ? '¡Hoy!' : `${d}d`}
        </span>
      </span>
      Examen
    </button>
  )
}

function BottomNav({ path }: { path: string }) {
  const nav = upcomingExam() ? [...NAV.slice(0, 2), EXAM_TAB, ...NAV.slice(2)] : NAV
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-xl">
        {nav.map((n) => {
          const active = n.path === '/' ? path === '/' : path.startsWith(n.path) || (n.path === '/path' && path.startsWith('/lesson'))
          if (n === EXAM_TAB) return <ExamTab key={n.path} active={active} />
          return (
            <button key={n.path} onClick={() => navigate(n.path)}
              className={`flex flex-1 flex-col items-center gap-0.5 pt-2 pb-1 text-[11px] font-bold ${active ? 'text-brand' : 'text-muted'}`}>
              <Icon name={n.icon} size={22} />
              {n.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default function App() {
  const { path, params, raw } = useRoute()
  const onboarded = useStore((s) => s.settings.onboarded)
  const themeMode = useStore((s) => s.settings.themeMode)
  const settleStreak = useStore((s) => s.settleStreak)
  const audioReady = useAudioReady()

  useEffect(() => {
    settleStreak()
  }, [settleStreak])

  // Leaving a screen (or the app) stops any recording that's playing.
  useEffect(() => {
    stopAudio()
  }, [raw])
  useEffect(() => {
    const onHide = () => document.visibilityState === 'hidden' && stopAudio()
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [])

  // Theme: follow the phone ('system') or the learner's explicit choice; switches live when the phone does.
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const theme = themeMode === 'system' ? (media.matches ? 'dark' : 'light') : themeMode
      document.documentElement.dataset.theme = theme
      // «only …» tells the browser this page handles its own theme: no forced darkening on top of it.
      document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', theme === 'dark' ? 'only dark' : 'only light')
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1b1d20' : '#f3f0e9')
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [themeMode])

  if (!onboarded) return <Onboarding />

  // Sessions filter listening questions by the audio manifest, so build them only once it's loaded.
  if (path === '/play') return audioReady ? <Player key={raw} params={params} /> : <div className="p-6 text-center text-muted">Cargando…</div>
  if (path === '/exam/mock') return audioReady ? <MockExam key={raw} params={params} /> : <div className="p-6 text-center text-muted">Cargando…</div>

  let screen
  if (path === '/path') screen = <Path />
  else if (path.startsWith('/lesson/')) screen = <LessonDetail id={decodeURIComponent(path.slice(8))} />
  else if (path === '/profile') screen = <Profile />
  else if (path === '/settings') screen = <Settings />
  else if (path === '/exam') screen = <Exam key={raw} params={params} />
  else if (path === '/exams') screen = <ChapterReviews />
  else screen = <Home />

  return (
    <>
      {screen}
      <BottomNav path={path} />
    </>
  )
}
