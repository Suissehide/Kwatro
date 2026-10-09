import QRCode from 'qrcode'
import { describe, expect, it } from 'vitest'
import { qrRuns } from './qrRuns'

describe('qrRuns', () => {
  it('couvre exactement les modules noirs du QR', () => {
    const value = 'lucko:demo:jeton-signe'
    const { size, data } = QRCode.create(value, { errorCorrectionLevel: 'H' }).modules
    const { runs } = qrRuns(value)
    const painted = new Array(size * size).fill(0)
    for (const r of runs) for (let i = 0; i < r.w; i++) painted[r.y * size + r.x + i]++
    expect(painted).toEqual(Array.from(data, (d) => (d ? 1 : 0)))
  })
})
