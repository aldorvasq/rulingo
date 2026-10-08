import { useMemo, useState } from 'react'
import { useStore } from '../state/store'
import { lessonById, colorFor, lessonsUpTo, vocabById } from '../content'
import { lessonTopics } from '../engine/topics'
import { lessonMastery } from '../state/mastery'
import { dayKey, daysBetween } from '../lib/date'
import { navigate } from '../lib/router'
import { Icon, Logo, ProgressBar, Section, TopicTitle } from '../components/ui'
import { InstallBanner } from '../components/InstallPrompt'
import { DailyHero } from '../components/Culture'
import { ScheduleCard } from '../components/ScheduleCard'
import { exportProgress } from '../state/backup'
import { TopicList } from '../components/TopicList'

export function StreakBadge() {
  const streak = useStore((s) => s.streak)
  const today = streak.lastGoalDay === dayKey()
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-bold ${today ? 'text-brick' : 'text-muted'}`} title="Días seguidos repasando">
      <Icon name="flame" size={18} className={today ? 'flicker' : ''} /> {streak.current}
      {streak.freezes > 0 && <span className="ml-1 font-normal text-muted">· {streak.freezes} protector{streak.freezes > 1 ? 'es' : ''}</span>}
    </span>
  )
}

export function Home() {
  const settings = useStore((s) => s.settings)
  const stats = useStore((s) => s.stats)
  const progress = useStore((s) => s.progress)
  const lastBackup = useStore((s) => s.lastBackup)
  const today = dayKey()
  const lesson = lessonById.get(settings.focusLessons[0] ?? settings.coveredUpTo)
  const covered = lessonsUpTo(settings.coveredUpTo)
  const topics = useMemo(() => (lesson ? lessonTopics(lesson.id) : []), [lesson])

  const dueCount = useMemo(() => Object.values(progress).filter((p) => p.due <= today).length, [progress, today])
  const weakCount = useMemo(() => Object.values(progress).filter((p) => p.wrong > 0 && p.box <= 1).length, [progress])
  const knownWords = useMemo(() => Object.entries(progress).filter(([id, p]) => vocabById.has(id) && p.box >= 2).length, [progress])
  const dailyDone = stats.dailyDone.includes(today)
  const needsBackup = stats.sessions >= 3 && (!lastBackup || daysBetween(lastBackup, today) >= 7)

  return (
    <div className="mx-auto max-w-xl px-4 pb-28">
      <div className="pt-safe flex items-center justify-between py-3">
        <Logo className="text-[1.7rem] leading-none" />
        <StreakBadge />
      </div>
      <DailyHero />
      <ScheduleCard />
      <InstallBanner />

      {lesson ? (
        <>
          {/* 1. Continue the lesson from class */}
          <Section id="current" title="Continúa donde vas en clase" accent={colorFor(lesson.chapter).bg}>
          <div className="card overflow-hidden">
            <div className="h-1.5" style={{ background: colorFor(lesson.chapter).bg }} />
            <div className="p-5">
              <div className="text-sm font-bold text-muted">Lección {lesson.id}</div>
              <h1 className="ru mt-0.5 text-[2rem] font-bold leading-tight">{lesson.title}</h1>
              {lesson.titleEs && <div className="text-muted">{lesson.titleEs}</div>}

              <div className="label mt-5 mb-2">Qué vas a repasar</div>
              <ul className="space-y-1 text-[15px]">
                {topics.filter((t) => t.kind === 'grammar').map((t) => (
                  <li key={t.id} className="flex gap-2">
                    <span className="mt-[9px] h-1 w-1 shrink-0 bg-muted" />
                    <TopicTitle title={t.title} />
                  </li>
                ))}
              </ul>
              {topics.some((t) => t.kind === 'skill') && (
                <p className="mt-2 text-[15px] text-muted">
                  Con ejercicios de {joinEs(topics.filter((t) => t.kind === 'skill').map((t) => t.title.toLowerCase()))}.
                </p>
              )}

              <button className="btn btn-primary mt-5 w-full" onClick={() => navigate(`/play?mode=lesson&id=${lesson.id}`)}>
                <Icon name="play" size={18} /> Repasar la lección {lesson.id}
              </button>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                <span>Dominio</span>
                <ProgressBar value={lessonMastery(lesson, progress)} color="var(--gold)" className="!h-1.5" />
                <span className="tabular-nums">{Math.round(lessonMastery(lesson, progress) * 100)}%</span>
              </div>
            </div>
          </div>
          </Section>

          {/* 2. Or a single topic */}
          <TopicList lessonId={lesson.id} />
        </>
      ) : (
        <section className="card mt-4 p-5">
          <p className="font-bold">Elige en qué lección vas para empezar.</p>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/settings')}>Elegir lección</button>
        </section>
      )}

      {/* 3. Review everything so far */}
      <Section id="general" title="Repaso general" hint="Todo lo visto hasta ahora" accent="var(--brick)">
      <div className="card divide-y divide-line overflow-hidden">
        <Row icon="repeat" title={`Lecciones vistas (${covered[0]?.id ?? ''}–${settings.coveredUpTo})`}
          desc={dueCount ? `${dueCount} elementos para repasar hoy` : 'Mezcla de todo lo visto, según lo que más necesitas'}
          onClick={() => navigate('/play?mode=review')} />
        <Row icon="target" title="Mis errores" desc={weakCount ? `${weakCount} elementos con errores recientes` : 'Aún no hay errores registrados'}
          onClick={() => navigate('/play?mode=weak')} />
        <Row icon="map" title="Otra lección" desc="Elige cualquier lección en la ruta" onClick={() => navigate('/path')} />
      </div>
      </Section>

      {/* 4. Extra: daily practice keeps the streak */}
      <Section id="extra" title="Extra" hint="Práctica del día y racha" accent="var(--gold)">
      <div className="card p-4">
        <div className="flex items-start gap-3">
          <Icon name="flame" size={24} className="mt-0.5 shrink-0 text-brick" />
          <div className="flex-1">
            <div className="font-bold">Práctica del día</div>
            <p className="text-sm text-muted">Una mezcla corta de la lección actual, repaso y alguna palabra nueva. Cualquier repaso terminado cuenta para tu racha.</p>
          </div>
        </div>
        <button className="btn btn-ghost mt-3 w-full" onClick={() => navigate('/play?mode=daily')}>
          {dailyDone ? <><Icon name="check" size={18} className="text-ok" /> Hecha hoy · hacer otra</> : 'Hacer la práctica del día'}
        </button>
      </div>
      </Section>

      <p className="mt-4 text-center text-xs text-muted">{knownWords} palabras conocidas · {stats.sessions} repasos terminados</p>

      <BackupNote highlight={needsBackup} />
    </div>
  )
}

/** Quiet, always-there note: progress lives on this phone; one tap exports it (Drive, iCloud…). */
function BackupNote({ highlight }: { highlight: boolean }) {
  const [msg, setMsg] = useState<string | null>(null)
  return (
    <div className={`mt-3 flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-muted ${highlight ? 'border-l-[3px] border-gold bg-card' : ''}`}>
      <Icon name="cloud" size={20} className="shrink-0" />
      <span className="flex-1">
        {msg ?? <>Tu progreso se guarda en este teléfono. Puedes copiarlo a <b className="font-bold">Google Drive</b> o iCloud.</>}
      </span>
      {!msg && (
        <button className="shrink-0 font-bold text-brand underline" onClick={async () => {
          const r = await exportProgress()
          if (r !== 'cancelled') setMsg('Respaldo guardado. Elige Google Drive o Archivos al compartir.')
        }}>Exportar</button>
      )}
    </div>
  )
}

const joinEs = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs.at(-1)}`)

function Row({ icon, title, desc, onClick }: { icon: string; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-soft">
      <Icon name={icon} size={22} className="shrink-0 text-brand" />
      <div className="min-w-0 flex-1">
        <div className="font-bold">{title}</div>
        <div className="text-sm text-muted">{desc}</div>
      </div>
      <Icon name="chevron" size={18} className="shrink-0 text-muted" />
    </button>
  )
}
