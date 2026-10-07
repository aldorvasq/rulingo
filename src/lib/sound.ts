// Tiny synthesized sound effects — no audio assets to ship or cache.
let ctx: AudioContext | null = null

function tone(freqs: number[], dur = 0.12, type: OscillatorType = 'sine', gain = 0.08) {
  try {
    ctx ??= new AudioContext()
    const t0 = ctx.currentTime
    freqs.forEach((f, i) => {
      const osc = ctx!.createOscillator()
      const g = ctx!.createGain()
      osc.type = type
      osc.frequency.value = f
      const start = t0 + i * dur
      g.gain.setValueAtTime(gain, start)
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur * 1.6)
      osc.connect(g).connect(ctx!.destination)
      osc.start(start)
      osc.stop(start + dur * 1.7)
    })
  } catch {
    /* audio unavailable */
  }
}

export const sfx = {
  correct: () => tone([660, 880], 0.09, 'triangle'),
  wrong: () => tone([220, 180], 0.14, 'sawtooth', 0.04),
  finish: () => tone([523, 659, 784, 1046], 0.11, 'triangle'),
  tap: () => tone([440], 0.03, 'sine', 0.03),
}
