// Filtre de contenus (KWT-19) : refuse les insultes et propos haineux dans les textes publics (pseudo).
// ponytail: liste courte FR / EN, à compléter par l'équipe ; passer par un service de modération
// quand il y aura du texte libre en volume (chat de room, KWT-80).

/** Assez longs et distinctifs pour être cherchés n'importe où dans le texte (« xXconnardXx »). */
const BANNED_ANYWHERE = [
  'connard',
  'connasse',
  'salope',
  'encule',
  'putain',
  'batard',
  'bougnoul',
  'youpin',
  'hitler',
  'pedophil',
  'nigger',
  'nigga',
  'faggot',
  'porno',
  'fuck',
]

/** Courts : seulement comme mot entier, sinon « technique », « dispute » ou « violette » seraient refusés. */
const BANNED_WORDS = new Set([
  'pute',
  'pd',
  'fdp',
  'ntm',
  'nique',
  'merde',
  'viol',
  'bite',
  'chatte',
  'couille',
  'nazi',
  'pedo',
  'negre',
  'negro',
  'tapette',
  'gouine',
  'sexe',
  'shit',
  'bitch',
  'cunt',
  'whore',
  'slut',
  'rape',
  'porn',
  'dick',
])

const LEET: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '@': 'a',
  $: 's',
}

/** Minuscules, sans accents, chiffres « leet » remis en lettres (« s4l0p3 » → « salope »). */
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[0-9@$]/g, (char) => LEET[char] ?? char)

/** true si le texte contient un mot interdit. */
export function hasBannedWord(text: string): boolean {
  const normalized = normalize(text)
  if (BANNED_ANYWHERE.some((word) => normalized.includes(word))) return true
  return normalized.split(/[^a-z]+/).some((word) => BANNED_WORDS.has(word))
}
