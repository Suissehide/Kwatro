import QRCode from 'qrcode'

/** Modules noirs d'un QR (correction H), regroupés en segments horizontaux : une View par segment. */
export function qrRuns(value: string): {
  size: number
  runs: { x: number; y: number; w: number }[]
} {
  const { size, data } = QRCode.create(value, { errorCorrectionLevel: 'H' }).modules
  const runs: { x: number; y: number; w: number }[] = []
  for (let y = 0; y < size; y++) {
    let x = 0
    while (x < size) {
      if (!data[y * size + x]) {
        x++
        continue
      }
      const start = x
      while (x < size && data[y * size + x]) x++
      runs.push({ x: start, y, w: x - start })
    }
  }
  return { size, runs }
}
