#!/usr/bin/env python3
"""Check generated speech against its script: transcribe each clip locally with Whisper and score it.

    .venv-transcribe/bin/python scripts/tts/qa_check.py jobs.json results.json

jobs.json: [{"file": ".../x.mp3", "text": "Expected Russian"}]. A clip fails when the transcript
contains Latin letters (instructions read aloud in English), is much longer than the script (extra
words), or differs too much from it (missing or garbled words).
"""
import difflib
import json
import re
import subprocess
import sys
import unicodedata

import numpy as np

from faster_whisper import WhisperModel
from num2words import num2words


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s).replace("́", "").replace("̀", "")
    s = unicodedata.normalize("NFC", s).lower().replace("ё", "е")
    return re.sub(r"\s+", " ", re.sub(r"[^\w\s]", " ", s)).strip()


def load_audio(path: str) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def spell_numbers(s: str) -> str:
    """Whisper writes numbers as digits ("150"); the scripts spell them out ("сто пятьдесят")."""
    return re.sub(r"\d+", lambda m: num2words(int(m.group()), lang="ru"), s)


def align_lines(lines: list[str], words) -> list[float]:
    """Start time of each script line inside one recording, by aligning script words to Whisper's words."""
    script = [(li, w) for li, line in enumerate(lines) for w in norm(spell_numbers(line)).split()]
    heard = [norm(spell_numbers(w.word)) for w in words]
    sm = difflib.SequenceMatcher(None, [w for _, w in script], heard, autojunk=False)
    first_match: dict[int, float] = {}
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            li = script[blk.a + k][0]
            first_match.setdefault(li, words[blk.b + k].start)
    starts, prev = [], 0.0
    for li in range(len(lines)):
        t = first_match.get(li)
        t = prev if t is None or t < prev else t
        starts.append(round(max(0.0, t - 0.15), 2))
        prev = t
    return starts


def main() -> None:
    jobs = json.load(open(sys.argv[1], encoding="utf-8"))
    model = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8")
    out = []
    for i, job in enumerate(jobs):
        lines = job.get("lines")
        segs, _ = model.transcribe(load_audio(job["file"]), language="ru", beam_size=5, condition_on_previous_text=False,
                                   vad_filter=False, word_timestamps=bool(lines))
        segs = list(segs)
        heard = " ".join(s.text.strip() for s in segs).strip()
        starts = align_lines(lines, [w for s in segs for w in (s.words or [])]) if lines else None
        a, b = norm(job["text"]), norm(spell_numbers(heard))
        score = difflib.SequenceMatcher(None, a, b, autojunk=False).ratio()
        latin = bool(re.search(r"[a-z]{3,}", b))
        too_long = len(b) > len(a) * 1.35 + 8
        ok = score >= 0.78 and not latin and not too_long
        if job.get("single"):  # one word: Whisper's spelling of isolated words is unreliable; only catch artifacts
            ok = not latin and not too_long and len(b.split()) <= len(a.split()) + 2
        entry = {"file": job["file"], "heard": heard, "score": round(score, 3), "latin": latin, "tooLong": too_long, "ok": ok}
        if starts is not None:
            entry["starts"] = starts
        out.append(entry)
        print(f"{i + 1}/{len(jobs)} {'ok ' if ok else 'BAD'} {score:.2f} {heard[:60]}", flush=True)
    json.dump(out, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
