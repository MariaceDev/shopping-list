/** Cada cuánto avanza el reloj. «hace 2 min» no necesita más precisión. */
const TICK_MS = 30_000

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

/**
 * La hora actual como ref reactiva, para los «hace X min». Un solo
 * temporizador para toda la app, por muchas filas que lo usen.
 */
export function useNow(): Readonly<Ref<number>> {
  if (!timer) {
    timer = setInterval(() => { now.value = Date.now() }, TICK_MS)
    // Al volver a la app (móvil bloqueado, otra pestaña) se pone al día ya.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') now.value = Date.now()
    })
  }
  return readonly(now)
}
