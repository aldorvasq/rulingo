import { useState } from 'react'
import { lessonById, colorFor, compareLessonIds } from '../content'
import { useStore } from '../state/store'
import { lessonMastery } from '../state/mastery'
import { mastery } from '../engine/srs'
import { navigate } from '../lib/router'
import { speak } from '../lib/tts'
import { Header, Markdown, ProgressBar, SpeakButton } from '../components/ui'

type Tab = 'grammar' | 'vocab' | 'phrases' | 'readings'
const GENDER: Record<string, string> = { m: 'm', f: 'f', n: 'n', pl: 'pl' }
const DOT: Record<string, string> = { nuevo: 'bg-line', aprendiendo: 'bg-coral', conocido: 'bg-gold', dominado: 'bg-ok' }

export function LessonDetail({ id }: { id: string }) {
  const lesson = lessonById.get(id)
  const progress = useStore((s) => s.progress)
  const settings = useStore((s) => s.settings)
  const update = useStore((s) => s.updateSettings)
  const [tab, setTab] = useState<Tab>('grammar')
  const [openReading, setOpenReading] = useState<string | null>(null)

  if (!lesson) return <Header title="Lección no encontrada" back={() => navigate('/path')} />
  const color = colorFor(lesson.chapter)
  const locked = compareLessonIds(lesson.id, settings.coveredUpTo) > 0
  const m = lessonMastery(lesson, progress)
  const tabs: [Tab, string, number][] = (
    [
      ['grammar', 'Gramática', lesson.grammar?.length ?? 0],
      ['vocab', 'Vocabulario', (lesson.vocab?.length ?? 0) + lesson.sneakIns.length],
      ['phrases', 'Frases', lesson.phrases?.length ?? 0],
      ['readings', 'Lecturas', lesson.readings?.length ?? 0],
    ] as [Tab, string, number][]
  ).filter((t) => t[2] > 0)

  return (
    <div className="mx-auto max-w-xl pb-28">
      <Header title={`${lesson.id} · ${lesson.title}`} back={() => history.length > 1 ? history.back() : navigate('/path')} />
      <div className="space-y-4 px-4 pt-4">
        <section className="rounded-3xl p-5" style={{ background: color.bg, color: color.fg }}>
          <div className="ru text-2xl font-extrabold">{lesson.title}</div>
          {lesson.titleEs && <div className="font-semibold opacity-90">{lesson.titleEs}</div>}
          {lesson.summaryEs && <p className="mt-2 text-sm font-semibold opacity-90">{lesson.summaryEs}</p>}
          <div className="mt-3 flex items-center gap-3 text-sm font-extrabold">
            <ProgressBar value={m} color="var(--gold)" className="!h-3 bg-white/30" />
            <span>{Math.round(m * 100)}%</span>
          </div>
          {locked ? (
            <button className="btn mt-4 w-full bg-white !text-[#1f2a2e]" onClick={() => update({ coveredUpTo: lesson.id })}>
              🔓 Ya vi esta lección en clase
            </button>
          ) : (
            <div className="mt-4 flex gap-2">
              <button className="btn flex-1 bg-white !text-[#1f2a2e]" onClick={() => navigate(`/play?mode=lesson&id=${lesson.id}`)}>▶ Practicar</button>
              {!settings.focusLessons.includes(lesson.id) && (
                <button className="btn bg-black/15 text-white" onClick={() => update({ focusLessons: [lesson.id], focusTopics: [] })}>★ Esta semana</button>
              )}
            </div>
          )}
        </section>

        {lesson.story?.characters?.length ? (
          <section className="card p-4">
            <h3 className="mb-1 font-extrabold">🎭 Personajes</h3>
            {lesson.story.settingEs && <p className="mb-2 text-sm text-muted">{lesson.story.settingEs}</p>}
            <ul className="space-y-1 text-sm">
              {lesson.story.characters.map((c) => (
                <li key={c.name}><span className="ru font-bold">{c.name}</span>{c.descriptionEs && ` — ${c.descriptionEs}`}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map(([t, label, count]) => (
            <button key={t} onClick={() => setTab(t)} className={`chip shrink-0 ${tab === t ? 'tile-selected' : ''}`}>
              {label} <span className="text-muted">{count}</span>
            </button>
          ))}
        </div>

        {tab === 'grammar' && lesson.grammar?.map((g) => (
          <section key={g.id} className="card space-y-3 p-4">
            <h3 className="text-lg font-extrabold">{g.title}</h3>
            {g.explanationEs && <Markdown text={g.explanationEs} />}
            {g.tables?.map((t, i) => (
              <div key={i} className="overflow-x-auto">
                {t.caption && <div className="mb-1 text-sm font-bold text-muted">{t.caption}</div>}
                <table className="ru w-full border-collapse text-sm">
                  {t.headers && (
                    <thead><tr>{t.headers.map((h, j) => <th key={j} className="border-2 border-line bg-soft px-2 py-1 text-left">{h}</th>)}</tr></thead>
                  )}
                  <tbody>
                    {t.rows.map((r, j) => <tr key={j}>{r.map((cell, k) => <td key={k} className="border-2 border-line px-2 py-1">{cell}</td>)}</tr>)}
                  </tbody>
                </table>
              </div>
            ))}
            {g.examples?.length ? (
              <ul className="space-y-2">
                {g.examples.map((e, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <SpeakButton text={e.ru} />
                    <div><div className="ru font-bold">{e.ru}</div><div className="text-sm text-muted">{e.es}</div></div>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        {tab === 'vocab' && (
          <section className="card divide-y-2 divide-line">
            {[...(lesson.vocab ?? []), ...lesson.sneakIns].map((v) => {
              const level = mastery(progress[v.id])
              return (
                <div key={v.id} className="flex items-center gap-3 px-3 py-2">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT[level]}`} title={level} />
                  <button onClick={() => speak(v.ru)} className="ru text-left font-bold">
                    {v.ru}{v.sneak && ' ✨'}
                  </button>
                  {v.gender && <span className="text-xs font-bold text-muted">{GENDER[v.gender]}</span>}
                  <span className="ml-auto text-right text-sm text-muted">
                    {v.es}
                    {v.antonyms?.length ? <span className="ru block text-xs">↔ {v.antonyms.join(', ')}</span> : null}
                  </span>
                </div>
              )
            })}
          </section>
        )}

        {tab === 'phrases' && (
          <section className="card divide-y-2 divide-line">
            {lesson.phrases?.map((p, i) => (
              <div key={i} className="flex items-start gap-3 px-3 py-2">
                <SpeakButton text={p.ru} />
                <div>
                  <div className="ru font-bold">{p.ru}</div>
                  <div className="text-sm text-muted">{p.es}</div>
                  {p.noteEs && <div className="text-xs text-muted/80">{p.noteEs}</div>}
                </div>
              </div>
            ))}
          </section>
        )}

        {tab === 'readings' && lesson.readings?.map((r) => (
          <section key={r.id} className="card space-y-2 p-4">
            <div className="flex items-center gap-2">
              <h3 className="ru flex-1 font-extrabold">{r.title ?? 'Lectura'}</h3>
              <SpeakButton text={r.textRu} />
            </div>
            <p className="ru whitespace-pre-line leading-relaxed">{r.textRu}</p>
            {r.textEs && (
              <>
                <button className="text-sm font-bold text-brand" onClick={() => setOpenReading(openReading === r.id ? null : r.id)}>
                  {openReading === r.id ? 'Ocultar traducción' : 'Ver traducción'}
                </button>
                {openReading === r.id && <p className="whitespace-pre-line text-sm text-muted">{r.textEs}</p>}
              </>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
