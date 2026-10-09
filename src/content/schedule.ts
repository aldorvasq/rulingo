// Class calendar and homework. Updated weekly — edit only the lists below.
// Times are written in the class's time zone (Mexico City) and shown in each user's local time.

export const CLASS_TZ = 'America/Mexico_City'

/** Recurring classes. weekday: 0 = domingo … 2 = martes, 4 = jueves. */
export const CLASSES = [
  { weekday: 2, time: '19:00', title: 'Clase de ruso' },
  { weekday: 4, time: '19:00', title: 'Clase de ruso' },
]

export interface Homework {
  /** Due date in Mexico City time, YYYY-MM-DD. */
  due: string
  /** Optional time (HH:MM, Mexico City). Without it, the homework is due at the start of that day's class. */
  time?: string
  title: string
  detail?: string
  lesson?: string
}

/** Homework, newest last. Past items disappear automatically. */
export const HOMEWORK: Homework[] = [
  {
    due: '2026-10-13',
    title: 'Descríbete en ruso',
    detail: 'Escribe una descripción de ti mismo usando los adjetivos y adverbios vistos en clase (lección 3.4).',
    lesson: '3.4',
  },
]

export interface Reminder { date?: string; text: string }

/** Short notices (no class on a holiday, bring the workbook…). Dated ones hide after their date. */
export const REMINDERS: Reminder[] = [
  { text: '¿Te perdiste una clase? Las grabaciones de clases anteriores están disponibles: pídeselas a Aldo.' },
]

// ---------------------------------------------------------------- time zone helpers

/** Offset (minutes) of `tz` from UTC at a given instant. */
function tzOffset(at: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(at)
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value)
  const asUTC = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'))
  return (asUTC - at.getTime()) / 60000
}

/** The instant when the wall clock in `tz` reads y-m-d h:min. */
export function zonedInstant(y: number, m: number, d: number, h: number, min: number, tz = CLASS_TZ): Date {
  const guess = Date.UTC(y, m - 1, d, h, min)
  const off1 = tzOffset(new Date(guess), tz)
  const t = guess - off1 * 60000
  const off2 = tzOffset(new Date(t), tz) // second pass handles DST edges
  return new Date(guess - off2 * 60000)
}

/** Calendar date (y, m, d, weekday) in `tz` for an instant. */
function zonedDate(at: Date, tz = CLASS_TZ) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short' }).formatToParts(at)
  const get = (t: string) => parts.find((p) => p.type === t)!.value
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'))
  return { y: Number(get('year')), m: Number(get('month')), d: Number(get('day')), wd }
}

export interface ClassSession { start: Date; title: string }

/** The next `n` class start times (including one that started up to 90 minutes ago). */
export function upcomingClasses(n = 3, now = new Date()): ClassSession[] {
  const out: ClassSession[] = []
  const today = zonedDate(now)
  for (let i = 0; out.length < n && i < 21; i++) {
    const day = new Date(Date.UTC(today.y, today.m - 1, today.d + i))
    const wd = day.getUTCDay()
    for (const c of CLASSES.filter((c) => c.weekday === wd)) {
      const [h, min] = c.time.split(':').map(Number)
      const start = zonedInstant(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), h, min)
      if (start.getTime() > now.getTime() - 90 * 60000) out.push({ start, title: c.title })
    }
  }
  return out.slice(0, n)
}

export function pendingHomework(now = new Date()): (Homework & { dueAt: Date })[] {
  return HOMEWORK.map((h) => {
    const [y, m, d] = h.due.split('-').map(Number)
    const [hh, mm] = (h.time ?? CLASSES.find((c) => c.weekday === new Date(Date.UTC(y, m - 1, d)).getUTCDay())?.time ?? '23:59').split(':').map(Number)
    return { ...h, dueAt: zonedInstant(y, m, d, hh, mm) }
  })
    .filter((h) => h.dueAt.getTime() > now.getTime())
    .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())
}

export function activeReminders(now = new Date()): Reminder[] {
  const t = zonedDate(now)
  const todayKey = `${t.y}-${String(t.m).padStart(2, '0')}-${String(t.d).padStart(2, '0')}`
  return REMINDERS.filter((r) => !r.date || r.date >= todayKey)
}

/** iCalendar file with the recurring classes, so users can add them to their phone's calendar. */
export function classesIcs(): string {
  const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
  const first = upcomingClasses(CLASSES.length)
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const events = CLASSES.map((c, i) => {
    const s = first.find((f) => zonedDate(f.start).wd === c.weekday)?.start ?? new Date()
    const d = zonedDate(s)
    const ymd = `${d.y}${String(d.m).padStart(2, '0')}${String(d.d).padStart(2, '0')}`
    const [h, m] = c.time.split(':')
    return [
      'BEGIN:VEVENT', `UID:ru-clase-${i}@rulingo`, `DTSTAMP:${stamp}`,
      `DTSTART;TZID=${CLASS_TZ}:${ymd}T${h}${m}00`, 'DURATION:PT1H30M',
      `RRULE:FREQ=WEEKLY;BYDAY=${days[c.weekday]}`, `SUMMARY:${c.title}`,
      'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', `DESCRIPTION:${c.title}`, 'END:VALARM',
      'END:VEVENT',
    ].join('\r\n')
  })
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ru//clases//ES', ...events, 'END:VCALENDAR'].join('\r\n')
}
