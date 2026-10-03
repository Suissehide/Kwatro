/** XP par niveau : l'XP récompense l'assiduité (parties jouées, soirées), jamais la victoire. */
export const XP_PER_LEVEL = 500

// ponytail: paliers provisoires (un nom par niveau, le dernier se répète), à valider avec l'équipe
export const XP_LEVEL_NAMES = [
  'Recrue',
  'Visage connu',
  'Régulier',
  'Pilier de table',
  'Figure du coin',
  'Légende',
] as const

/** Niveau, nom du palier et progression dans le niveau : 1 840 XP → niv. 4, 340 / 500. */
export function xpLevel(xp: number) {
  const level = Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1
  return {
    level,
    name: XP_LEVEL_NAMES[Math.min(level, XP_LEVEL_NAMES.length) - 1] ?? XP_LEVEL_NAMES[0],
    current: Math.max(0, xp) % XP_PER_LEVEL,
    max: XP_PER_LEVEL,
  }
}
