/** Pasa a milisegundos un Timestamp de Firestore, un número o nada. */
export function millis(value: unknown): number {
  if (value && typeof value === 'object' && 'toMillis' in value) {
    return (value as { toMillis(): number }).toMillis()
  }
  return Number(value ?? 0)
}

/** "hace 10 min", "ayer"… en castellano y sin dependencias. */
export function relativeTime(ms: number, now = Date.now()): string {
  if (!ms) return ''

  const seconds = Math.round((ms - now) / 1000)
  const abs = Math.abs(seconds)
  const formatter = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

  if (abs < 60) return formatter.format(Math.round(seconds), 'second')
  if (abs < 3600) return formatter.format(Math.round(seconds / 60), 'minute')
  if (abs < 86_400) return formatter.format(Math.round(seconds / 3600), 'hour')
  if (abs < 2_592_000) return formatter.format(Math.round(seconds / 86_400), 'day')

  return new Date(ms).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  })
}
