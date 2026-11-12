// Which lessons are open. Shared by the app (src/content/index.ts) and the build (vite.config.ts), so it
// imports nothing.

export function compareLessonIds(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (d !== 0) return d
  }
  return 0
}

/** The last lesson open in the app. Later lessons are drafted ahead (so their audio and pictures are ready
 *  when the class gets there) but stay out of the app, and out of the published bundle, until this moves. */
export const RELEASED_UP_TO = '4.1'
export const released = (id: string) => compareLessonIds(id, RELEASED_UP_TO) <= 0
