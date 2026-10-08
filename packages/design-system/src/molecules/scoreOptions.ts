/** Scores possibles d'une manche au meilleur de `bestOf` : victoires de A, égalités, victoires de B, puis « Nul ». */
export function scoreOptions(bestOf: 1 | 3 | 5, allowDraw = true): string[] {
  const wins = Math.ceil(bestOf / 2)
  const below = Array.from({ length: wins }, (_, i) => i)
  return [
    ...below.map((b) => `${wins}-${b}`),
    ...below.slice(1).map((k) => `${k}-${k}`),
    ...below.reverse().map((a) => `${a}-${wins}`),
    ...(allowDraw ? ['Nul'] : []),
  ]
}
