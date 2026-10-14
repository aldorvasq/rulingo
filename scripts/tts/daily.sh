#!/bin/zsh -l
# Daily batch: spend today's Gemini TTS quota (Tier 1 = 100 requests/day), finish any missing vocabulary
# paintings (Nano Banana 2.1; both stop by themselves when credits run out), then deploy what's new.
# Installed as a macOS LaunchAgent (com.rulingo.daily-audio); log: scripts/tts/cache/daily.log
set -u
cd "$(dirname "$0")/../.." || exit 1
LOG=scripts/tts/cache/daily.log
mkdir -p scripts/tts/cache
{
  echo "=== $(date '+%Y-%m-%d %H:%M') ==="
  npx tsx scripts/tts/build-audio.ts --budget 95
  npx tsx scripts/images/build-images.ts --redo школа,почта,отель,магазин,клиника,аэропорт,банк,визитка,студент,кофе,чай,яхта --once
  if [[ -n "$(git status --porcelain public/audio public/img src/content/photos.json)" ]]; then
    git add public/audio public/img src/content/photos.json
    git commit -q -m "Daily batch (Gemini audio and pictures)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" && git push -q && echo "deployed"
  else
    echo "nothing new"
  fi
} >> "$LOG" 2>&1
