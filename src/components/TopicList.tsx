import { useMemo } from 'react'
import { candidatesFor } from '../engine/generate'
import { lessonTopics, topicMatches, type Topic } from '../engine/topics'
import type { ItemState } from '../engine/srs'
import { useStore } from '../state/store'
import { navigate } from '../lib/router'
import { Icon, Mixed, ProgressBar } from './ui'

/** 0–1: how well the items behind a topic are known (unseen = 0). */
export function topicMastery(lessonId: string, topicId: string, progress: Record<string, ItemState>): number {
  const ids = [...new Set(candidatesFor(lessonId).filter((c) => !c.sneak && topicMatches(c, topicId)).map((c) => c.items[0] ?? c.id))]
  if (!ids.length) return 0
  return ids.reduce((acc, id) => acc + Math.min(progress[id]?.box ?? 0, 4) / 4, 0) / ids.length
}

export function TopicList({ lessonId, disabled = false }: { lessonId: string; disabled?: boolean }) {
  const progress = useStore((s) => s.progress)
  const topics = useMemo(() => lessonTopics(lessonId), [lessonId])
  const grammar = topics.filter((t) => t.kind === 'grammar')
  const skills = topics.filter((t) => t.kind === 'skill')

  const row = (t: Topic) => {
    const m = topicMastery(lessonId, t.id, progress)
    return (
      <button key={t.id} disabled={disabled}
        onClick={() => navigate(`/play?mode=topic&id=${lessonId}&topic=${encodeURIComponent(t.id)}`)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-soft disabled:opacity-50">
        <div className="min-w-0 flex-1">
          <div className="font-bold leading-snug"><Mixed text={t.title} ruClass="text-[1.06em]" /></div>
          {t.kind === 'skill' && <div className="text-sm text-muted">{t.desc}</div>}
          <div className="mt-1.5 flex items-center gap-2">
            <ProgressBar value={m} color="var(--gold)" className="!h-1.5 max-w-24" />
            <span className="text-xs tabular-nums text-muted">{Math.round(m * 100)}% · {t.count} ejercicios</span>
          </div>
        </div>
        <Icon name="chevron" size={18} className="shrink-0 text-muted" />
      </button>
    )
  }

  return (
    <div className="space-y-3">
      {grammar.length > 0 && (
        <div className="card divide-y divide-line overflow-hidden">
          <div className="label px-4 pt-3 pb-2">Gramática</div>
          {grammar.map(row)}
        </div>
      )}
      {skills.length > 0 && (
        <div className="card divide-y divide-line overflow-hidden">
          <div className="label px-4 pt-3 pb-2">Por tipo de ejercicio</div>
          {skills.map(row)}
        </div>
      )}
    </div>
  )
}
