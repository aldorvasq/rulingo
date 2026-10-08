// Shared by the app and scripts/tts/build-audio.ts: maps a Russian text to its pre-generated clip.
// Stress marks are part of the key (they change pronunciation); whitespace is not.

export const normalizeForAudio = (text: string) => text.normalize('NFC').replace(/\s+/g, ' ').trim()

/** cyrb53: small, fast, well-distributed 53-bit string hash → base36. */
export function audioKey(text: string): string {
  const str = normalizeForAudio(text)
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36)
}

/** Texts with a gap get their audio only once answered: the gap is filled with the answer. */
export const fillGap = (sentence: string, answer: string) => sentence.replace(/_{2,}/, answer)
