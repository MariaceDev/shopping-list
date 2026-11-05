import { describe, expect, it } from 'vitest'
import {
  MEMBER_COLORS,
  colorForIndex,
  initialOf,
} from '../shared/types/shopping'
import { millis, relativeTime } from '../app/utils/time'

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
