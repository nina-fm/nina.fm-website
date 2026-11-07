import { describe, expect, it } from 'vitest'
import { silentWav } from './silence.ts'

describe('silentWav', () => {
  it('is a PCM WAV of the requested length, entirely on the zero line', () => {
    const wav = silentWav(2)
    const view = new DataView(wav.buffer)
    const text = (offset: number) => String.fromCharCode(...wav.subarray(offset, offset + 4))

    expect([text(0), text(8), text(12), text(36)]).toEqual(['RIFF', 'WAVE', 'fmt ', 'data'])
    expect(view.getUint32(4, true)).toBe(wav.length - 8)
    const sampleRate = view.getUint32(24, true)
    expect(view.getUint32(40, true)).toBe(sampleRate * 2)
    expect(wav.subarray(44).every((sample) => sample === 128)).toBe(true)
  })
})
