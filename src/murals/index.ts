import { cap } from './cap'
import { ch1 } from './ch1'
import { ch2 } from './ch2'
import { ch3 } from './ch3'
import type { Mural } from './kit'

export type { Mural } from './kit'
export { W } from './kit'

/** One mural per chapter; their roads join at x = 200 on every seam. */
export const MURALS: Record<number, Mural> = { 1: ch1, 2: ch2, 3: ch3 }
/** The road's end so far, drawn above the newest chapter. */
export const CAP: Mural = cap
