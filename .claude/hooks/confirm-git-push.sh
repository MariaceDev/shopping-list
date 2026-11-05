#!/usr/bin/env bash
# PreToolUse(Bash) — fuerza confirmación explícita ante `git push`.
#
# CLAUDE.md dice "nunca hacer git push sin confirmación", pero eso solo es
# prosa: se cumple si el modelo se acuerda. Con permissionDecision=ask el
# prompt lo pone el arnés, no la buena voluntad.
#
# Se busca el patrón en TODO el comando (no solo al principio) para cubrir
# compuestos tipo `git commit -m ... && git push`, que es justo como suele salir.
set -uo pipefail

payload=$(cat)
cmd=$(printf '%s' "$payload" | jq -r '.tool_input.command // ""')

if printf '%s' "$cmd" | grep -qE '(^|[;&|]|\s)git\s+push\b'; then
  jq -n --arg cmd "$cmd" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: ("Este comando hace `git push` — publica en el remoto y CLAUDE.md exige confirmación explícita. Comando: " + $cmd)
    }
  }'
fi

exit 0
