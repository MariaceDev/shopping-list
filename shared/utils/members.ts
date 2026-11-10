import type { ListMember } from '../types/ListMember.type'

/** Colores de avatar que se reparten entre los miembros, por orden de llegada. */
export const MEMBER_COLORS = [
  '#1DD3B0', // turquesa
  '#AFFC41', // verde lima
  '#B2FF9E', // verde claro
  '#086375', // teal tormentoso
  '#3C1642', // amatista oscuro
] as const

/** La inicial que se pinta en el avatar. */
export function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?'
}

/** Color estable para un miembro, a partir de cuántos había antes. */
export function colorForIndex(index: number): string {
  return MEMBER_COLORS[index % MEMBER_COLORS.length]!
}

/** Tinta legible (amatista o blanco) encima de un color de la paleta. */
export function inkFor(color: string): string {
  const hex = color.replace('#', '')
  const full = hex.length === 3 ? hex.replace(/./g, (c) => c + c) : hex

  const toLinear = (value: number) =>
    value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4

  const r = toLinear(parseInt(full.slice(0, 2), 16) / 255)
  const g = toLinear(parseInt(full.slice(2, 4), 16) / 255)
  const b = toLinear(parseInt(full.slice(4, 6), 16) / 255)

  // Luminancia relativa (WCAG 2.1).
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? '#3C1642' : '#FFFFFF'
}

/**
 * Forma de comparar nombres: sin mayúsculas, sin tildes y sin espacios de
 * más. Así «Ana», «ana» y « Aná » cuentan como el mismo nombre. La ñ se
 * respeta: es otra letra, no una n con tilde.
 */
export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/n\u0303/gi, (n) => (n[0] === 'N' ? 'Ñ' : 'ñ'))
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('es')
    .trim()
    .replace(/\s+/g, ' ')
}

/** Si otro miembro (que no sea `uid`) ya usa ese nombre. */
export function isNameTaken(
  name: string,
  members: readonly Pick<ListMember, 'uid' | 'name'>[],
  uid: string,
): boolean {
  const wanted = normalizeName(name)
  return members.some((m) => m.uid !== uid && normalizeName(m.name) === wanted)
}
