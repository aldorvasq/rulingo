"""Voice consistency inside one recording: does each character keep the same voice from line to line?

Measures the median pitch of every line (between the aligned line starts) and flags a line whose pitch
is far from that character's usual pitch — the telltale of the model switching to "another person".

    .venv-transcribe/bin/python scripts/tts/voice_check.py   # report on all published listening pieces
"""
import numpy as np

SR = 16000


def frame_pitch(x: np.ndarray, lo: float = 70, hi: float = 500) -> np.ndarray:
    """Pitch (Hz) of voiced 40 ms frames, by normalized autocorrelation; unvoiced frames are dropped."""
    n, hop = int(0.04 * SR), int(0.01 * SR)
    if len(x) < n:
        return np.array([])
    frames = np.lib.stride_tricks.sliding_window_view(x, n)[::hop]
    frames = frames - frames.mean(axis=1, keepdims=True)
    energy = (frames ** 2).sum(axis=1)
    keep = energy > max(1e-6, np.percentile(energy, 60) * 0.3)
    frames, energy = frames[keep], energy[keep]
    if not len(frames):
        return np.array([])
    spec = np.fft.rfft(frames, 2 * n)
    ac = np.fft.irfft(spec * np.conj(spec))[:, :n] / energy[:, None]
    lmin, lmax = int(SR / hi), int(SR / lo)
    lag = lmin + ac[:, lmin:lmax].argmax(axis=1)
    peak = ac[np.arange(len(ac)), lag]
    return SR / lag[peak > 0.5]


def line_pitches(audio: np.ndarray, starts: list[float]) -> list[float | None]:
    bounds = [int(s * SR) for s in starts] + [len(audio)]
    out = []
    for a, b in zip(bounds, bounds[1:]):
        f = frame_pitch(audio[a + int(0.15 * SR):b])  # skip the 150 ms lead-in before each start
        out.append(float(np.median(f)) if len(f) >= 15 else None)
    return out


def drift(speakers: list[str], pitches: list[float | None], limit: float = 4.5) -> list[tuple[int, float]]:
    """Lines whose pitch is more than `limit` semitones from the speaker's median: [(line index, semitones)]."""
    bad = []
    for s in set(speakers):
        idx = [i for i, sp in enumerate(speakers) if sp == s and pitches[i]]
        if len(idx) < 2:
            continue
        med = float(np.median([pitches[i] for i in idx]))
        for i in idx:
            st = 12 * np.log2(pitches[i] / med)
            if abs(st) > limit:
                bad.append((i, round(float(st), 1)))
    return sorted(bad)


if __name__ == "__main__":
    import json
    import sys
    from pathlib import Path

    from qa_check import load_audio

    root = Path(__file__).resolve().parents[2]
    m = json.load(open(root / "public/audio/manifest.json"))
    limit = float(sys.argv[1]) if len(sys.argv) > 1 else 4.5
    for pid, v in sorted(m["listening"].items()):
        if "g38" not in v["file"] or not v["starts"]:
            continue
        audio = load_audio(str(root / "public/audio" / v["file"]))
        p = line_pitches(audio, v["starts"])
        d = drift(v["speakers"], p, limit)
        worst = max((abs(x) for _, x in d), default=0)
        print(f"{pid:10} {'DRIFT' if d else 'ok   '} {worst:4.1f}  " + " ".join(f"{v['speakers'][i][:8]}@{i}:{st:+}" for i, st in d))
