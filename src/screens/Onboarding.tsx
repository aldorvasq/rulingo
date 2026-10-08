import { useState } from 'react'
import { useStore } from '../state/store'
import { lessons } from '../content'
import { LessonSelect } from './Settings'
import { Logo } from '../components/ui'

export function Onboarding() {
  const update = useStore((s) => s.updateSettings)
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [lesson, setLesson] = useState(lessons.find((l) => l.id === '3.4')?.id ?? lessons[0]?.id ?? '1.1')

  const finish = () => update({ name: name.trim(), focusLessons: [lesson], coveredUpTo: lesson, onboarded: true })

  return (
    <div className="pt-safe pb-safe mx-auto flex min-h-full max-w-md flex-col px-6 py-10">
      {step === 0 && (
        <div className="flex flex-1 flex-col">
          <h1 className="rise"><Logo className="text-7xl" /></h1>
          <p className="mt-3 text-lg leading-relaxed text-ink/80">
            Repasa y refuerza lo que ves en clase con <span className="ru">«Точка Ру»</span>: vocabulario, gramática y las historias de cada lección.
          </p>
          <label className="mt-10 block">
            <span className="mb-1 block font-bold">¿Cómo te llamas?</span>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre"
              className="w-full rounded-md border-[1.5px] border-line bg-card px-4 py-3 text-lg outline-none focus:border-brand" />
          </label>
          <button className="btn btn-primary mt-auto w-full" onClick={() => setStep(1)}>Continuar</button>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-1 flex-col">
          <div className="label">Paso 2 de 2</div>
          <h2 className="mt-1 text-3xl font-bold">¿En qué lección vas?</h2>
          <p className="mt-2 text-ink/80">
            La pantalla de inicio abrirá esta lección para repasarla. Las lecciones anteriores quedan desbloqueadas para el repaso general.
          </p>
          <LessonSelect value={lesson} onChange={setLesson} className="mt-6" />
          <div className="mt-auto flex gap-2">
            <button className="btn btn-ghost" onClick={() => setStep(0)}>Atrás</button>
            <button className="btn btn-primary flex-1" onClick={finish}>Empezar</button>
          </div>
        </div>
      )}
    </div>
  )
}
