#!/usr/bin/env bash
# PreToolUse(Bash) — pide confirmación antes de desplegar a Firebase.
#
# `firebase deploy` publica hosting, reglas o índices en el proyecto real
# (shopping-list-mariace). Desplegar reglas de Firestore equivocadas puede
# dejar los datos abiertos o romper la app para todos, así que nunca va solo.
set -uo pipefail

payload=$(cat)
cmd=$(printf '%s' "$payload" | jq -r '.tool_input.command // ""')

if printf '%s' "$cmd" | grep -qE '(^|[;&|]|\s)(firebase\s+deploy|pnpm\s+(run\s+)?deploy)\b'; then
  jq -n --arg cmd "$cmd" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: ("Este comando despliega a Firebase (proyecto shopping-list-mariace) y afecta a lo que ven los usuarios. Comando: " + $cmd)
    }
  }'
fi

exit 0
