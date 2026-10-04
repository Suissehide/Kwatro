import { describe, expect, it } from 'vitest'
import {
  formatDayMonth,
  formatDistance,
  formatHour,
  formatHourBand,
  formatKwote,
  formatMinuteOfDay,
  formatPrice,
  formatTime,
  metersBetween,
} from './format'

describe('formats d’affichage', () => {
  it('distance', () => {
    expect(formatDistance(783)).toBe('780 m')
    expect(formatDistance(1234)).toBe('1,2 km')
    expect(formatDistance(12_400)).toBe('12 km')
    // Place de la Bourse → cours Victor Hugo, Bordeaux : environ 700 m
    const d = metersBetween(
      { latitude: 44.8412, longitude: -0.5697 },
      { latitude: 44.8352, longitude: -0.5712 },
    )
    expect(d).toBeGreaterThan(650)
    expect(d).toBeLessThan(700)
  })

  it('prix', () => {
    expect(formatPrice(null)).toBeNull()
    expect(formatPrice(0)).toBe('Gratuit')
    expect(formatPrice(800)).toBe('8 €')
    expect(formatPrice(750)).toBe('7,50 €')
  })

  it('heure et date à l’heure de Paris, changement d’heure compris', () => {
    expect(formatTime('2026-10-06T17:30:00Z')).toBe('19:30') // heure d'été (UTC+2)
    expect(formatTime('2026-10-27T18:30:00Z')).toBe('19:30') // heure d'hiver (UTC+1)
    expect(formatDayMonth('2026-10-06T17:30:00Z')).toEqual({ day: '06', month: 'OCT' })
    expect(formatDayMonth('2026-12-31T23:30:00Z')).toEqual({ day: '01', month: 'JAN' })
  })

  it('heure de fermeture', () => {
    expect(formatMinuteOfDay(60)).toBe('1 h')
    expect(formatMinuteOfDay(19 * 60 + 30)).toBe('19 h 30')
    expect(formatMinuteOfDay(0)).toBe('minuit')
  })

  it('heure', () => {
    // 19:30 UTC = 21:30 à Paris en octobre (heure d'été)
    expect(formatHour('2026-10-03T19:30:00Z')).toBe('21 h 30')
    expect(formatHour('2026-10-03T19:00:00Z')).toBe('21 h')
    expect(formatHourBand('2026-10-03T19:00:00Z')).toBe('21H')
    expect(formatHourBand('2026-10-03T17:30:00Z')).toBe('19H30')
  })

  it('kwote', () => {
    expect(formatKwote(1214).replace(/\s/g, ' ')).toBe('1 214')
  })
})
