#!/bin/zsh -l
# Daily audio batch: spend today's Gemini quota (Tier 1 = 100 requests/day), then deploy the new audio.
# Installed as a macOS LaunchAgent (com.rulingo.daily-audio); log: scripts/tts/cache/daily.log
set -u
cd "$(dirname "$0")/../.." || exit 1
LOG=scripts/tts/cache/daily.log
mkdir -p scripts/tts/cache
{
  echo "=== $(date '+%Y-%m-%d %H:%M') ==="
  npx tsx scripts/tts/build-audio.ts --budget 95
  if [[ -n "$(git status --porcelain public/audio)" ]]; then
    git add public/audio
    git commit -q -m "Daily audio batch (Gemini 3.8 TTS)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" && git push -q && echo "deployed"
  else
    echo "nothing new"
  fi
} >> "$LOG" 2>&1
