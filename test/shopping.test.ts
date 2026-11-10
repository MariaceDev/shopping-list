import { describe, expect, it } from 'vitest'
import {
  MEMBER_COLORS,
  colorForIndex,
  initialOf,
  inkFor,
  isNameTaken,
  normalizeName,
} from '../shared/utils/members'
import {
  isValidListId,
  listIdFromLink,
  listLink,
  newListId,
  pickListId,
} from '../shared/utils/list'
import { millis, relativeTime, tripDate } from '../app/utils/time'
import { formatAmount, parseAmount } from '../shared/utils/money'

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

  it('lo de hace segundos es «ahora», y nunca «dentro de»', () => {
    expect(relativeTime(now - 14_000, now)).toBe('ahora')
    // El reloj de la app puede ir hasta 30 s por detrás del producto.
    expect(relativeTime(now + 14_000, now)).toBe('ahora')
    expect(relativeTime(now + 14_000, now)).not.toContain('dentro')
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

describe('nombres repetidos', () => {
  const members = [
    { uid: 'a', name: 'Ana' },
    { uid: 'b', name: 'Iñaki' },
  ]

  it('normalizeName ignora mayúsculas, tildes y espacios de más', () => {
    expect(normalizeName('  ÁNA   María ')).toBe('ana maria')
    expect(normalizeName('Iñaki')).toBe('iñaki')
  })

  it('detecta el mismo nombre escrito de otra forma', () => {
    expect(isNameTaken('ana', members, 'x')).toBe(true)
    expect(isNameTaken(' Aná ', members, 'x')).toBe(true)
    expect(isNameTaken('IÑAKI', members, 'x')).toBe(true)
  })

  it('deja nombres distintos, y la ñ cuenta como otra letra', () => {
    expect(isNameTaken('Anabel', members, 'x')).toBe(false)
    expect(isNameTaken('Inaki', members, 'x')).toBe(false)
  })

  it('no choca contigo mismo al cambiar tu propio nombre', () => {
    expect(isNameTaken('ANA', members, 'a')).toBe(false)
  })
})

describe('enlaces de lista', () => {
  it('el enlace manda sobre la lista guardada', () => {
    expect(pickListId('abc123', 'casa')).toBe('abc123')
    expect(pickListId(null, 'casa')).toBe('casa')
    expect(pickListId(null, null)).toBeNull()
  })

  it('ignora ids raros', () => {
    expect(pickListId('../otra', 'casa')).toBe('casa')
    expect(isValidListId('Casa')).toBe(false)
    expect(isValidListId('ab')).toBe(false)
  })

  it('los ids nuevos son válidos y distintos', () => {
    const a = newListId()
    expect(isValidListId(a)).toBe(true)
    expect(a).toHaveLength(12)
    expect(newListId()).not.toBe(a)
  })

  it('el enlace va y vuelve', () => {
    const link = listLink('https://ejemplo.app', 'k3x9mpq2wz7a')
    expect(link).toBe('https://ejemplo.app/?lista=k3x9mpq2wz7a')
    expect(listIdFromLink(link)).toBe('k3x9mpq2wz7a')
    expect(listIdFromLink('  k3x9mpq2wz7a ')).toBe('k3x9mpq2wz7a')
    expect(listIdFromLink('https://ejemplo.app/')).toBeNull()
    expect(listIdFromLink('hola que tal')).toBeNull()
  })
})

describe('parseAmount', () => {
  it('acepta coma o punto como decimal y el símbolo del euro', () => {
    expect(parseAmount('23,45')).toBe(23.45)
    expect(parseAmount('23.45')).toBe(23.45)
    expect(parseAmount(' 23,5 € ')).toBe(23.5)
    expect(parseAmount('40')).toBe(40)
  })

  it('entiende los miles cuando hay coma y punto', () => {
    expect(parseAmount('1.234,50')).toBe(1234.5)
    expect(parseAmount('1,234.50')).toBe(1234.5)
  })

  it('rechaza lo que no es un importe', () => {
    expect(parseAmount('')).toBeNull()
    expect(parseAmount('abc')).toBeNull()
    expect(parseAmount('0')).toBeNull()
    expect(parseAmount('-5')).toBeNull()
    expect(parseAmount('12,345')).toBeNull()
    expect(parseAmount('1,2,3')).toBeNull()
  })
})

describe('formatAmount', () => {
  it('pinta euros a la española', () => {
    expect(formatAmount(23.5).replace(/\s/g, ' ')).toBe('23,50 €')
  })
})
