import { useState } from 'react'
import { useStore } from '../state/store'
import { lessons } from '../content'
import { LessonSelect } from './Settings'

export function Onboarding() {
  const update = useStore((s) => s.updateSettings)
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [lesson, setLesson] = useState(lessons.find((l) => l.id === '3.4')?.id ?? lessons[0]?.id ?? '1.1')
  const [goal, setGoal] = useState(30)

  const finish = () => update({ name: name.trim(), focusLessons: [lesson], coveredUpTo: lesson, dailyGoal: goal, onboarded: true })

  return (
    <div className="pt-safe pb-safe mx-auto flex min-h-full max-w-md flex-col px-6 py-8">
      <div className="mb-8 flex justify-center gap-2">
        {[0, 1, 2].map((i) => <span key={i} className={`h-2 w-10 rounded-full ${i <= step ? 'bg-brand' : 'bg-line'}`} />)}
      </div>

      {step === 0 && (
        <div className="flex flex-1 flex-col">
          <div className="animate-pop text-center text-7xl">🪆</div>
          <h1 className="ru mt-4 text-center text-4xl font-extrabold"><span className="text-brand">Ру</span>Линго</h1>
          <p className="mt-2 text-center font-semibold text-muted">Practica ruso con lo que estás viendo en clase: vocabulario, gramática y las historias del libro.</p>
          <label className="mt-8 block">
            <span className="mb-1 block font-bold">¿Cómo te llamas?</span>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre"
              className="w-full rounded-2xl border-2 border-line bg-card px-4 py-3 text-lg font-semibold outline-none focus:border-brand" />
          </label>
          <button className="btn btn-primary mt-auto w-full" onClick={() => setStep(1)}>Continuar</button>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-1 flex-col">
          <div className="text-center text-6xl">📖</div>
          <h2 className="mt-4 text-center text-2xl font-extrabold">¿En qué lección vas en clase?</h2>
          <p className="mt-2 text-center text-sm font-semibold text-muted">
            Las lecciones anteriores se desbloquean para repasar. La lección diaria se enfoca en esta.
          </p>
          <LessonSelect value={lesson} onChange={setLesson} className="mt-6" />
          <div className="mt-auto flex gap-3">
            <button className="btn btn-ghost" onClick={() => setStep(0)}>←</button>
            <button className="btn btn-primary flex-1" onClick={() => setStep(2)}>Continuar</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-1 flex-col">
          <div className="text-center text-6xl">🔥</div>
          <h2 className="mt-4 text-center text-2xl font-extrabold">Elige tu meta diaria</h2>
          <div className="mt-6 space-y-3">
            {[[10, 'Relajada', '~3 min'], [30, 'Normal', '~8 min'], [50, 'Seria', '~12 min'], [100, 'Intensa', '~25 min']].map(([xp, label, time]) => (
              <button key={xp} onClick={() => setGoal(xp as number)}
                className={`tile flex w-full items-center justify-between ${goal === xp ? 'tile-selected' : ''}`}>
                <span className="font-extrabold">{label}</span>
                <span className="text-sm text-muted">{xp} XP · {time} al día</span>
              </button>
            ))}
          </div>
          <div className="mt-auto flex gap-3 pt-6">
            <button className="btn btn-ghost" onClick={() => setStep(1)}>←</button>
            <button className="btn btn-primary flex-1" onClick={finish}>¡Empezar!</button>
          </div>
        </div>
      )}
    </div>
  )
}
