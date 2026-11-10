/** Lo más que se acepta como importe de una compra, para cazar erratas. */
export const MAX_TRIP_TOTAL = 100_000

/**
 * Lee lo que se escribe como precio: «23,45», «23.45», «23,45 €» o «1.234,50».
 * Devuelve euros redondeados a céntimos, o null si no es un importe válido.
 */
export function parseAmount(text: string): number | null {
  let clean = text.replace(/[€\s]/g, '')
  if (!clean) return null

  // Con coma y punto, el último que aparece es el decimal: «1.234,50».
  const comma = clean.lastIndexOf(',')
  const dot = clean.lastIndexOf('.')
  if (comma !== -1 && dot !== -1) {
    const decimal = comma > dot ? ',' : '.'
    const thousands = decimal === ',' ? '.' : ','
    clean = clean.split(thousands).join('').replace(decimal, '.')
  } else {
    clean = clean.replace(',', '.')
  }

  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null

  const amount = Math.round(Number(clean) * 100) / 100
  if (amount <= 0 || amount > MAX_TRIP_TOTAL) return null
  return amount
}

/** «23,45 €», como se pinta un importe en la app. */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}
