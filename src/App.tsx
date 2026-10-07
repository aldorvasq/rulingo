import { useEffect } from 'react'
import { useRoute, navigate } from './lib/router'
import { useStore } from './state/store'
import { Home } from './screens/Home'
import { Path } from './screens/Path'
import { Player } from './screens/Player'
import { LessonDetail } from './screens/LessonDetail'
import { Profile } from './screens/Profile'
import { Settings } from './screens/Settings'
import { Onboarding } from './screens/Onboarding'

const NAV = [
  { path: '/', icon: '🏠', label: 'Inicio' },
  { path: '/path', icon: '🗺️', label: 'Ruta' },
  { path: '/profile', icon: '🏅', label: 'Perfil' },
  { path: '/settings', icon: '⚙️', label: 'Ajustes' },
]

function BottomNav({ path }: { path: string }) {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t-2 border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-xl">
        {NAV.map((n) => {
          const active = n.path === '/' ? path === '/' : path.startsWith(n.path)
          return (
            <button key={n.path} onClick={() => navigate(n.path)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-extrabold ${active ? 'text-brand' : 'text-muted'}`}>
              <span className={`text-2xl ${active ? '' : 'opacity-60 grayscale'}`}>{n.icon}</span>
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
  const settleStreak = useStore((s) => s.settleStreak)

  useEffect(() => {
    settleStreak()
  }, [settleStreak])

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
