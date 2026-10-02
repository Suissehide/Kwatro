/** Pages affichées : toutes jusqu'à 5, sinon 1, voisines de la page courante et dernière, séparées par « … ». */
export function pageList(page: number, pages: number): (number | '…')[] {
  if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1)
  const shown = [...new Set([1, page - 1, page, page + 1, pages])]
    .filter((p) => p >= 1 && p <= pages)
    .sort((a, b) => a - b)
  return shown.flatMap((p, i) => {
    const prev = shown[i - 1]
    return prev !== undefined && p - prev > 1 ? ['…' as const, p] : [p]
  })
}
