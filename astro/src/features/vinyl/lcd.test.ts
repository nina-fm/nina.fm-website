import { describe, expect, it } from 'vitest'
import { lcdDigits, lcdTooltip } from './lcd.ts'

describe('lcdDigits', () => {
  it('should pad the whole audience to three digits when it is smaller', () => {
    expect(lcdDigits(7)).toEqual({ padding: '00', value: '7' })
    expect(lcdDigits(42)).toEqual({ padding: '0', value: '42' })
    expect(lcdDigits(123)).toEqual({ padding: '', value: '123' })
  })

  it('should not pad when the audience outgrows the display', () => {
    expect(lcdDigits(1234)).toEqual({ padding: '', value: '1234' })
  })
})

describe('lcdTooltip', () => {
  it('should count the other listeners when the tooltip shows', () => {
    expect(lcdTooltip(2)).toBe("Vous partagez l'écoute de Nina.fm avec 1 autre !")
    expect(lcdTooltip(5)).toBe("Vous partagez l'écoute de Nina.fm avec 4 autres !")
  })
})
