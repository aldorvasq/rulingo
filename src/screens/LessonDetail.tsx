import { useState } from 'react'
import { lessonById, colorFor, compareLessonIds } from '../content'
import { useStore } from '../state/store'
import { lessonMastery } from '../state/mastery'
import { mastery } from '../engine/srs'
import { navigate } from '../lib/router'
import { Header, Icon, Markdown, Mixed, ProgressBar, TopicTitle } from '../components/ui'
import { TopicList } from '../components/TopicList'
import { ExampleLine, Speak } from '../components/Speak'

type Tab = 'grammar' | 'vocab' | 'phrases' | 'readings'
const DOT: Record<string, string> = { nuevo: 'bg-line', aprendiendo: 'bg-brick', conocido: 'bg-gold', dominado: 'bg-ok' }
const hasCyrillic = (s: string) => /[а-яё]/i.test(s)

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
  const isCurrent = settings.focusLessons.includes(lesson.id)
  const m = lessonMastery(lesson, progress)
  const tabs = ([
    ['grammar', 'Gramática', lesson.grammar?.length ?? 0],
    ['vocab', 'Vocabulario', (lesson.vocab?.length ?? 0) + lesson.sneakIns.length],
    ['phrases', 'Frases', lesson.phrases?.length ?? 0],
    ['readings', 'Lecturas', lesson.readings?.length ?? 0],
  ] as [Tab, string, number][]).filter((t) => t[2] > 0)

  return (
    <div className="mx-auto max-w-xl pb-28">
      <Header title={`Lección ${lesson.id}`} back={() => (history.length > 1 ? history.back() : navigate('/path'))} />
      <div className="px-4 pt-4">
        <section className="card overflow-hidden">
          <div className="h-1.5" style={{ background: color.bg }} />
          <div className="p-5">
            <div className="text-sm font-bold text-muted">Capítulo {lesson.chapter} · Lección {lesson.id}</div>
            <h1 className="ru mt-0.5 text-[2rem] font-bold leading-tight">{lesson.title}</h1>
            {lesson.titleEs && <div className="text-muted">{lesson.titleEs}</div>}
            {lesson.summaryEs && <p className="mt-3 text-[15px] leading-relaxed"><Mixed text={lesson.summaryEs} /></p>}
            <div className="mt-4 flex items-center gap-3 text-xs text-muted">
              <span>Dominio</span>
              <ProgressBar value={m} color="var(--gold)" className="!h-1.5" />
              <span className="tabular-nums">{Math.round(m * 100)}%</span>
            </div>
            {locked ? (
              <button className="btn btn-primary mt-4 w-full" onClick={() => update({ coveredUpTo: lesson.id })}>
                <Icon name="lock" size={18} /> Ya vi esta lección en clase
              </button>
            ) : (
              <div className="mt-4 space-y-2">
                <button className="btn btn-primary w-full" onClick={() => navigate(`/play?mode=lesson&id=${lesson.id}`)}>
                  <Icon name="play" size={18} /> Repasar toda la lección
                </button>
                {!isCurrent && (
                  <button className="btn btn-ghost w-full" onClick={() => update({ focusLessons: [lesson.id] })}>
                    Es la lección que estoy viendo en clase
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {!locked && (
          <>
            <TopicList lessonId={lesson.id} />
          </>
        )}

        {lesson.story?.characters?.length ? (
          <>
            <div className="label mt-7 mb-2">La historia</div>
            <section className="card p-4">
              {lesson.story.settingEs && <p className="mb-3 text-[15px] leading-relaxed"><Mixed text={lesson.story.settingEs} /></p>}
              <ul className="space-y-2">
                {lesson.story.characters.map((c) => (
                  <li key={c.name}>
                    <span className="ru text-lg font-bold">{c.name}</span>
                    {c.descriptionEs && <span className="text-[15px] text-muted"> — <Mixed text={c.descriptionEs} /></span>}
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : null}

        <div className="label mt-7 mb-2">Material de la lección</div>
        <div className="mb-3 flex gap-1 overflow-x-auto border-b border-line">
          {tabs.map(([t, label, count]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`-mb-px shrink-0 border-b-2 px-3 py-2 text-sm font-bold ${tab === t ? 'border-brand text-brand' : 'border-transparent text-muted'}`}>
              {label} <span className="font-normal">{count}</span>
            </button>
          ))}
        </div>

        {tab === 'grammar' && (
          <div className="space-y-3">
            {lesson.grammar?.map((g) => (
              <section key={g.id} className="card space-y-3 p-4">
                <h3 className="text-xl leading-snug"><TopicTitle title={g.title} /></h3>
                {g.explanationEs && <div className="text-[15px]"><Markdown text={g.explanationEs} /></div>}
                {g.tables?.map((t, i) => (
                  <div key={i} className="overflow-x-auto">
                    {t.caption && <div className="mb-1 text-sm font-bold text-muted"><Mixed text={t.caption} /></div>}
                    <table className="w-full border-collapse text-[15px]">
                      {t.headers && (
                        <thead><tr>{t.headers.map((h, j) => <th key={j} className="border border-line bg-soft px-2 py-1.5 text-left font-bold"><Mixed text={h} /></th>)}</tr></thead>
                      )}
                      <tbody>
                        {t.rows.map((r, j) => (
                          <tr key={j}>
                            {r.map((cell, k) => (
                              <td key={k} className={`border border-line px-2 py-1.5 ${hasCyrillic(cell) ? 'ru text-[17px]' : 'text-muted'}`}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
                {g.examples?.length ? (
                  <ul className="space-y-2.5 border-t border-line pt-3">
                    {g.examples.map((e, i) => (
                      <li key={i}>
                        <div className="ru flex items-start gap-2 text-xl leading-snug"><span className="flex-1">{e.ru}</span><Speak text={e.ru} size="sm" /></div>
                        <div className="text-sm text-muted">{e.es}</div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        )}

        {tab === 'vocab' && (
          <section className="card divide-y divide-line">
            {[...(lesson.vocab ?? []), ...lesson.sneakIns].map((v) => (
              <div key={v.id} className="flex items-baseline gap-3 px-4 py-2.5">
                <span className={`h-2 w-2 shrink-0 self-center rounded-sm ${DOT[mastery(progress[v.id])]}`} title={mastery(progress[v.id])} />
                <div className="min-w-0">
                  <span className="ru text-xl">{v.ru}</span> <Speak text={v.ru} size="sm" className="ml-1 align-middle" />
                  {v.gender && <span className="ml-1.5 text-xs text-muted">{v.gender}</span>}
                  {v.sneak && <span className="ml-1.5 text-xs font-bold text-gold">extra</span>}
                  {v.antonyms?.length ? <div className="ru text-sm text-muted">↔ {v.antonyms.join(', ')}</div> : null}
                  <ExampleLine example={v.example} className="mt-1.5" />
                </div>
                <span className="ml-auto text-right text-sm text-muted">{v.es}</span>
              </div>
            ))}
          </section>
        )}

        {tab === 'phrases' && (
          <section className="card divide-y divide-line">
            {lesson.phrases?.map((p, i) => (
              <div key={i} className="px-4 py-2.5">
                <div className="ru flex items-start gap-2 text-xl leading-snug"><span className="flex-1">{p.ru}</span><Speak text={p.ru} size="sm" /></div>
                <div className="text-sm text-muted">{p.es}</div>
                {p.noteEs && <div className="text-xs text-muted/80">{p.noteEs}</div>}
              </div>
            ))}
          </section>
        )}

        {tab === 'readings' && (
          <div className="space-y-3">
            {lesson.readings?.map((r) => (
              <section key={r.id} className="card space-y-2 p-4">
                <h3 className="ru flex items-center gap-2 text-xl font-bold"><span className="flex-1">{r.title ?? 'Lectura'}</span><Speak text={r.textRu} /></h3>
                <p className="ru whitespace-pre-line text-lg leading-relaxed">{r.textRu}</p>
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
        )}
      </div>
    </div>
  )
}
