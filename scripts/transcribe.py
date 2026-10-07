#!/usr/bin/env python3
"""Transcribe a class recording locally (nothing leaves this Mac).

    .venv-transcribe/bin/python scripts/transcribe.py class-recordings/clase.m4a --lesson 3.4

- Whisper large-v3 via faster-whisper, detecting the language per segment (classes mix
  Spanish and Russian), with silence skipping to avoid invented text.
- The lesson's vocabulary from content/ is passed as hint words so Russian is spelled right.
- Speaker turns from pyannote (needs a one-time `hf auth login`; use --no-speakers to skip).

Writes transcripts/<name>.md (readable) and transcripts/<name>.json (segments for tooling).
Recordings and transcripts are git-ignored: they contain other people's voices and names.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import time
import unicodedata
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 16_000


def load_audio(path: Path) -> np.ndarray:
    """Decode any audio/video file to 16 kHz mono float32 with ffmpeg."""
    cmd = ["ffmpeg", "-nostdin", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"]
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def strip_stress(s: str) -> str:
    return unicodedata.normalize("NFC", unicodedata.normalize("NFD", s).replace("́", "").replace("̀", ""))


def lesson_hints(lesson_id: str | None) -> tuple[str, str]:
    """(initial prompt, hotwords) built from the lesson's content files."""
    if not lesson_id:
        return "Clase de ruso para hispanohablantes. Привет, как дела?", ""
    title, words = "", []
    for f in sorted((ROOT / "content").glob("*/*.json")):
        data = json.loads(f.read_text(encoding="utf-8"))
        for lesson in data.get("lessons", []):
            if lesson.get("id") != lesson_id:
                continue
            title = title or lesson.get("title", "")
            vocab = sorted(lesson.get("vocab", []), key=lambda v: not v.get("fromSlovar"))
            words += [strip_stress(v["ru"]) for v in vocab if len(v.get("ru", "")) <= 24]
    seen, unique = set(), []
    for w in words:
        if w.lower() not in seen:
            seen.add(w.lower())
            unique.append(w)
    sample = ", ".join(unique[:12])
    # An example of Spanish with Russian words kept in Cyrillic: Whisper imitates the prompt's style,
    # so it keeps embedded Russian words instead of dropping or translating them.
    prompt = (f"Clase de ruso, lección {lesson_id}: «{strip_stress(title)}». "
              f"La profesora dice: la palabra es «{unique[0] if unique else 'привет'}», en ruso se escribe así. "
              f"Vocabulario: {sample}.")
    return prompt, ", ".join(unique[:45])


LANGS = ("es", "ru", "en")


def speech_chunks(audio: np.ndarray, max_s: float = 20.0) -> list[tuple[int, int]]:
    """Split speech at pauses into pieces of at most ~max_s seconds (samples)."""
    from faster_whisper.vad import VadOptions, get_speech_timestamps

    spans = get_speech_timestamps(audio, VadOptions(min_silence_duration_ms=350, speech_pad_ms=150))
    chunks: list[list[int]] = []
    for sp in spans:
        if chunks and sp["start"] - chunks[-1][1] < 0.3 * SR and sp["end"] - chunks[-1][0] <= max_s * SR:
            chunks[-1][1] = sp["end"]  # short gap: same utterance
        else:
            chunks.append([sp["start"], sp["end"]])
    return [(a, b) for a, b in chunks]


def transcribe_by_chunks(model, audio: np.ndarray, prompt: str, hotwords: str) -> list[dict]:
    """Classes switch between Spanish and Russian. Whisper decides one language per window and,
    when it guesses Spanish for Russian speech, it *translates*. So: split at pauses, choose the
    language of each piece among es/ru/en, then transcribe that piece in its own language."""
    out = []
    for a, b in speech_chunks(audio):
        piece = audio[a:b]
        if len(piece) < 0.4 * SR:
            continue
        _, _, probs = model.detect_language(piece)
        lang = max((p for p in probs if p[0] in LANGS), key=lambda p: p[1])[0]
        seg_iter, _ = model.transcribe(
            piece,
            language=lang,
            initial_prompt=prompt if lang == "es" else None,
            hotwords=hotwords if lang == "ru" and hotwords else None,
            condition_on_previous_text=False,
            beam_size=5,
        )
        text = " ".join(s.text.strip() for s in seg_iter).strip()
        if not text:
            continue
        seg = {"start": round(a / SR, 2), "end": round(b / SR, 2), "lang": lang, "text": text}
        out.append(seg)
        print(f"  [{stamp(seg['start'])}] ({lang}) {text}", flush=True)
    return out


def diarize(audio: np.ndarray) -> list[tuple[float, float, str]]:
    import torch
    from pyannote.audio import Pipeline

    pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization-community-1")
    if pipeline is None:
        raise RuntimeError("No access to pyannote/speaker-diarization-community-1 (accept its terms and run `hf auth login`).")
    if torch.backends.mps.is_available():
        pipeline.to(torch.device("mps"))
    out = pipeline({"waveform": torch.from_numpy(audio)[None, :], "sample_rate": SR})
    # pyannote 4 returns several views; the "exclusive" one has no overlaps, which suits transcripts.
    diar = getattr(out, "exclusive_speaker_diarization", None) or getattr(out, "speaker_diarization", None) or out
    if hasattr(diar, "itertracks"):
        return [(s.start, s.end, str(spk)) for s, _, spk in diar.itertracks(yield_label=True)]
    return [(t.start, t.end, str(spk)) for t, spk in diar]


def assign_speakers(segments: list[dict], turns: list[tuple[float, float, str]]) -> None:
    names: dict[str, str] = {}
    for seg in segments:
        best, best_overlap = None, 0.0
        for start, end, spk in turns:
            overlap = min(seg["end"], end) - max(seg["start"], start)
            if overlap > best_overlap:
                best, best_overlap = spk, overlap
        if best is not None:
            names.setdefault(best, f"Hablante {len(names) + 1}")
            seg["speaker"] = names[best]


def stamp(t: float) -> str:
    h, rem = divmod(int(t), 3600)
    m, s = divmod(rem, 60)
    return f"{h:d}:{m:02d}:{s:02d}"


def write_outputs(src: Path, segments: list[dict], meta: dict) -> Path:
    out_dir = ROOT / "transcripts"
    out_dir.mkdir(exist_ok=True)
    base = out_dir / src.stem
    base.with_suffix(".json").write_text(json.dumps({"meta": meta, "segments": segments}, ensure_ascii=False, indent=1), encoding="utf-8")

    lines = [f"# Transcripción: {src.name}", ""]
    lines += [f"- {k}: {v}" for k, v in meta.items()]
    lines += ["", "---", ""]
    # Merge consecutive segments of the same speaker into one paragraph.
    para: list[str] = []
    cur, cur_start = None, 0.0
    for seg in segments + [{"speaker": object(), "start": 0, "text": ""}]:
        spk = seg.get("speaker", "—")
        if spk != cur and para:
            lines.append(f"**[{stamp(cur_start)}] {cur}:** {' '.join(para)}")
            lines.append("")
            para = []
        if spk != cur:
            cur, cur_start = spk, seg["start"]
        if seg["text"]:
            para.append(f"{seg['text']}" + (f" _({seg['lang']})_" if seg.get("lang") not in (None, "es") else ""))
    base.with_suffix(".md").write_text("\n".join(lines), encoding="utf-8")
    return base.with_suffix(".md")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("files", nargs="+", type=Path)
    ap.add_argument("--lesson", help="lesson id for vocabulary hints, e.g. 3.4")
    ap.add_argument("--model", default="large-v3", help="large-v3 (best, default) or large-v3-turbo (≈5× faster)")
    ap.add_argument("--no-speakers", action="store_true", help="skip speaker labels")
    args = ap.parse_args()

    from faster_whisper import WhisperModel

    prompt, hotwords = lesson_hints(args.lesson)
    print(f"Cargando modelo {args.model}…", flush=True)
    model = WhisperModel(args.model, device="cpu", compute_type="int8", cpu_threads=os.cpu_count() or 8)

    for src in args.files:
        t0 = time.time()
        print(f"\n== {src.name}", flush=True)
        audio = load_audio(src)
        duration = len(audio) / SR
        print(f"Duración {stamp(duration)} · transcribiendo…", flush=True)

        segments = transcribe_by_chunks(model, audio, prompt, hotwords)

        speakers = "no"
        if not args.no_speakers:
            print("Identificando hablantes…", flush=True)
            try:
                assign_speakers(segments, diarize(audio))
                speakers = "sí (pyannote community-1)"
            except Exception as e:  # keep the transcript even if diarization isn't set up
                print(f"  ! Sin etiquetas de hablante: {e}", file=sys.stderr)

        meta = {
            "archivo": src.name,
            "duración": stamp(duration),
            "modelo": args.model,
            "lección": args.lesson or "—",
            "hablantes": speakers,
            "tiempo de proceso": f"{(time.time() - t0) / 60:.1f} min",
        }
        out = write_outputs(src, segments, meta)
        print(f"Listo → {out.relative_to(ROOT)} ({meta['tiempo de proceso']})", flush=True)


if __name__ == "__main__":
    main()
