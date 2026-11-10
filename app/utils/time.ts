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

  // Lo de los últimos segundos es «ahora», y nunca «dentro de…»: el reloj de
  // la app (useNow) avanza cada 30 s y puede ir un poco por detrás de un
  // producto recién añadido.
  const seconds = Math.min(0, Math.round((ms - now) / 1000))
  const abs = Math.abs(seconds)
  // 'short' da "hace 3 min" en vez de "hace 3 minutos": cabe en la fila.
  const formatter = new Intl.RelativeTimeFormat('es', { numeric: 'auto', style: 'short' })

  if (abs < 60) return 'ahora'
  if (abs < 3600) return formatter.format(Math.round(seconds / 60), 'minute')
  if (abs < 86_400) return formatter.format(Math.round(seconds / 3600), 'hour')
  if (abs < 2_592_000) return formatter.format(Math.round(seconds / 86_400), 'day')

  return new Date(ms).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  })
}

/** "Sábado, 1 nov": la fecha de una compra, como la pinta el historial. */
export function tripDate(ms: number): string {
  if (!ms) return ''

  const text = new Date(ms).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })
  return text.charAt(0).toUpperCase() + text.slice(1)
}
