import { describe, expect, it } from 'vitest'
import {
  MEMBER_COLORS,
  colorForIndex,
  initialOf,
  inkFor,
} from '../shared/types/shopping'
import { millis, relativeTime, tripDate } from '../app/utils/time'

describe('initialOf', () => {
  it('devuelve la primera letra en mayúscula', () => {
    expect(initialOf('ana')).toBe('A')
    expect(initialOf('  manfred ')).toBe('M')
  })

  it('aguanta un nombre vacío', () => {
    expect(initialOf('')).toBe('?')
    expect(initialOf('   ')).toBe('?')
  })
})

describe('colorForIndex', () => {
  it('usa la paleta acordada en el orden establecido', () => {
    expect(MEMBER_COLORS).toEqual([
      '#1DD3B0',
      '#AFFC41',
      '#B2FF9E',
      '#086375',
      '#3C1642',
    ])
  })

  it('reparte colores y da la vuelta al llegar al final', () => {
    expect(colorForIndex(0)).toBe(MEMBER_COLORS[0])
    expect(colorForIndex(MEMBER_COLORS.length)).toBe(MEMBER_COLORS[0])
  })
})

describe('millis', () => {
  it('acepta Timestamp de Firestore, número o nada', () => {
    expect(millis({ toMillis: () => 1234 })).toBe(1234)
    expect(millis(99)).toBe(99)
    expect(millis(undefined)).toBe(0)
    expect(millis(null)).toBe(0)
  })
})

describe('relativeTime', () => {
  const now = new Date('2026-11-05T12:00:00Z').getTime()

  it('devuelve cadena vacía si no hay fecha', () => {
    expect(relativeTime(0, now)).toBe('')
  })

  it('cuenta en minutos, horas y días', () => {
    expect(relativeTime(now - 10 * 60_000, now)).toContain('10')
    expect(relativeTime(now - 2 * 3_600_000, now)).toContain('2')
    expect(relativeTime(now - 86_400_000, now)).toBe('ayer')
  })
})

describe('inkFor', () => {
  it('pone tinta blanca encima de los colores oscuros de la paleta', () => {
    expect(inkFor('#3C1642')).toBe('#FFFFFF')
    expect(inkFor('#086375')).toBe('#FFFFFF')
  })

  it('pone tinta oscura encima de los claros', () => {
    expect(inkFor('#1DD3B0')).toBe('#3C1642')
    expect(inkFor('#AFFC41')).toBe('#3C1642')
    expect(inkFor('#B2FF9E')).toBe('#3C1642')
  })
})

describe('tripDate', () => {
  it('escribe la fecha como el diseño, con la inicial en mayúscula', () => {
    expect(tripDate(new Date('2026-11-01T10:00:00').getTime())).toBe('Domingo, 1 nov')
  })

  it('aguanta una fecha vacía', () => {
    expect(tripDate(0)).toBe('')
  })
})
