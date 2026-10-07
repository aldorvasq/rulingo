import { useEffect } from 'react'
import { useRoute, navigate } from './lib/router'
import { useStore } from './state/store'
import { Icon } from './components/ui'
import { Home } from './screens/Home'
import { Path } from './screens/Path'
import { Player } from './screens/Player'
import { LessonDetail } from './screens/LessonDetail'
import { Profile } from './screens/Profile'
import { Settings } from './screens/Settings'
import { Onboarding } from './screens/Onboarding'

const NAV = [
  { path: '/', icon: 'home', label: 'Inicio' },
  { path: '/path', icon: 'map', label: 'Ruta' },
  { path: '/profile', icon: 'profile', label: 'Progreso' },
  { path: '/settings', icon: 'settings', label: 'Ajustes' },
]

function BottomNav({ path }: { path: string }) {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-xl">
        {NAV.map((n) => {
          const active = n.path === '/' ? path === '/' : path.startsWith(n.path) || (n.path === '/path' && path.startsWith('/lesson'))
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
  const theme = useStore((s) => s.settings.theme)
  const settleStreak = useStore((s) => s.settleStreak)

  useEffect(() => {
    settleStreak()
  }, [settleStreak])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1b1d20' : '#f3f0e9')
  }, [theme])

  if (!onboarded) return <Onboarding />

  if (path === '/play') return <Player key={raw} params={params} />

  let screen
  if (path === '/path') screen = <Path />
  else if (path.startsWith('/lesson/')) screen = <LessonDetail id={decodeURIComponent(path.slice(8))} />
  else if (path === '/profile') screen = <Profile />
  else if (path === '/settings') screen = <Settings />
  else screen = <Home />

  return (
    <>
      {screen}
      <BottomNav path={path} />
    </>
  )
}
