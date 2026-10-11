#!/bin/zsh
# Tells Claude when a long break has passed since the previous message, so it can check
# whether the same kid is still at the keyboard.
GAP_IN_MINUTES=20
stamp="$CLAUDE_PROJECT_DIR/.claude/last-message-time"
now=$(date +%s)
if [[ -f $stamp ]]; then
  minutes=$(( (now - $(cat "$stamp")) / 60 ))
  if (( minutes >= GAP_IN_MINUTES )); then
    echo "It has been $minutes minutes since the previous message. If this message is in Danish, start your reply by asking (in Danish, kid-friendly) whether it is still the same kid, using their name if known, e.g. \"Er det stadig dig, <navn>? 😊 Eller er det en anden?\" — and if someone new, ask their name before continuing."
  fi
fi
echo $now > "$stamp"
