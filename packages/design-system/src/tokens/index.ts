// Kwatro — design tokens « Plateau pop » (partagés mobile + web)
import { Platform, type TextStyle } from 'react-native'

export const colors = {
  // Neutres
  cream: '#FFF1D6', // fond des écrans
  white: '#FFFFFF', // surfaces, cartes, champs
  ink: '#16130F', // texte, traits, ombres
  muted: '#4B4339', // texte secondaire
  line: '#E6D3AE', // séparateurs internes
  creamDark: '#FBE7C2', // en-têtes de tableau
  disabledBg: '#EFE4CF',
  disabledText: '#8A7F70',
  disabledBorder: '#C9BBA1',
  placeholder: '#776B5C', // 5,2:1 sur blanc (l'ancien #8A7F70 échouait)
  hover: '#FFF8EA', // ligne de tableau survolée
  skeleton: '#F3DFB8',
  skeletonSoft: '#FBEACB',
  scrim: 'rgba(22,19,15,0.55)',

  // Couleurs de contenu (une par type)
  room: '#CF3A22', // rooms, action principale, danger
  event: '#2747D6', // événements, XP
  venue: '#157A55', // lieux, partenaire, mode lieu, succès
  kwote: '#F5B800', // Kwote, mise en avant, bouton « + »

  // Tons clairs
  roomSoft: '#FFDCD3',
  eventSoft: '#DCE3FF',
  venueSoft: '#CFEFE0',
  kwoteSoft: '#FFE8A3',
} as const

// Texte à poser sur chaque couleur pleine
export const onColor = {
  room: colors.white,
  event: colors.white,
  venue: colors.white,
  kwote: colors.ink, // jamais de blanc sur le jaune
  ink: colors.white,
  white: colors.ink,
} as const

/** Couleur de texte lisible sur un fond donné (ink sur les fonds clairs, blanc sinon). */
export function textOn(bg: string): string {
  const dark: string[] = [colors.room, colors.event, colors.venue, colors.ink]
  return dark.includes(bg) ? colors.white : colors.ink
}

// Polices : une famille par graisse, noms des paquets @expo-google-fonts.
// Sur le web (Next.js), les polices Google sont chargées par kwatro.css sous leur nom
// d'origine : la pile `Archivo_800ExtraBold, Archivo` + fontWeight couvre Expo web et Next.
const families = {
  display: { 400: 'ArchivoBlack_400Regular' },
  body: {
    400: 'Archivo_400Regular',
    600: 'Archivo_600SemiBold',
    700: 'Archivo_700Bold',
    800: 'Archivo_800ExtraBold',
  },
  mono: { 400: 'SpaceMono_400Regular', 700: 'SpaceMono_700Bold' },
} as const
const webFamilies = { display: "'Archivo Black'", body: 'Archivo', mono: "'Space Mono'" } as const

type Families = typeof families
export type FontFamily = keyof Families
export type FontWeight<F extends FontFamily> = keyof Families[F]

/** Style de police multiplateforme : `font('body', 800)`, `font('mono', 700)`, `font('display')`. */
export function font<F extends FontFamily>(family: F, weight?: FontWeight<F>): TextStyle {
  const byWeight: Record<number, string> = families[family]
  const w = Number(weight ?? 400)
  const name = byWeight[w] ?? byWeight[400] ?? ''
  if (Platform.OS !== 'web') return { fontFamily: name }
  return {
    fontFamily: `${name}, ${webFamilies[family]}, sans-serif`,
    fontWeight: String(w) as TextStyle['fontWeight'],
  }
}

export const type = {
  display: { ...font('display'), fontSize: 52, lineHeight: 52, textTransform: 'uppercase' },
  h1: { ...font('display'), fontSize: 28, lineHeight: 29, textTransform: 'uppercase' },
  h2: { ...font('display'), fontSize: 22, lineHeight: 23, textTransform: 'uppercase' },
  title: { ...font('body', 800), fontSize: 17, lineHeight: 20 },
  body: { ...font('body', 400), fontSize: 15, lineHeight: 22 },
  small: { ...font('body', 400), fontSize: 13, lineHeight: 18, color: colors.muted },
  button: { ...font('body', 800), fontSize: 15, textTransform: 'uppercase' },
  label: {
    ...font('mono', 700),
    fontSize: 11,
    letterSpacing: 0.44,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  number: { ...font('mono', 700), fontSize: 13 },
} satisfies Record<string, TextStyle>

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  screen: 20,
} as const

export const radius = {
  tag: 4,
  sm: 8,
  field: 10,
  button: 12,
  card: 14,
  sheet: 18,
  pill: 999,
} as const

export const border = { thin: 2, base: 3 } as const // 3 px conteneurs, 2 px petits éléments

// Ombres pleines, sans flou (décalage x = y). Rendu via <Raised> (Android n'a pas d'ombre dure).
export const shadow = { sm: 3, md: 4, card: 5, lg: 6, xl: 8 } as const

export const contentColor = {
  room: colors.room,
  event: colors.event,
  venue: colors.venue,
  kwote: colors.kwote,
} as const
export type ContentKind = keyof typeof contentColor

// Couleurs sémantiques (alias des couleurs de contenu)
export const semantic = {
  success: colors.venue,
  successSoft: colors.venueSoft,
  danger: colors.room,
  dangerSoft: colors.roomSoft,
  warning: colors.kwote,
  warningSoft: colors.kwoteSoft,
  warningDot: '#B88700',
  info: colors.event,
  infoSoft: colors.eventSoft,
  neutralSoft: '#F1E6D0',
} as const

export const motion = {
  instant: 80,
  fast: 160,
  normal: 240,
  slow: 400,
  easing: [0.2, 0.8, 0.2, 1] as const, // cubic-bezier
} as const

export const z = { base: 0, sticky: 10, popover: 20, sheet: 30, dialog: 40, toast: 50 } as const

export const breakpoints = { tablet: 768, desktop: 1200, maxContent: 1280, maxForm: 640 } as const
export const grid = {
  mobile: { columns: 4, margin: 20, gutter: 12 },
  tablet: { columns: 8, margin: 32, gutter: 16 },
  desktop: { columns: 12, margin: 40, gutter: 24 },
  sidebar: 240,
} as const

export const sizes = {
  touch: 44,
  buttonLg: 48,
  buttonSm: 36,
  iconBtn: 40,
  iconBtnSm: 32,
  rowComfort: 56,
  rowCompact: 40,
  avatar: { xs: 24, s: 32, m: 40, l: 56, xl: 72 },
  icon: { s: 20, m: 24 },
} as const

export const table = {
  headerBg: colors.creamDark,
  rowBorder: colors.line,
  rowHover: colors.hover,
  rowSelected: colors.kwoteSoft,
  paddingComfort: { v: 13, h: 16 },
  paddingCompact: { v: 8, h: 14 },
  bulkBarBg: colors.ink,
} as const

export type Tone = 'ok' | 'warn' | 'err' | 'info'
/** Fond doux, couleur pleine et pictogramme de chaque ton de retour (toast, bandeau). */
export const toneStyles: Record<Tone, { soft: string; solid: string; icon: string }> = {
  ok: { soft: colors.venueSoft, solid: colors.venue, icon: '✓' },
  err: { soft: colors.roomSoft, solid: colors.room, icon: '!' },
  warn: { soft: colors.kwoteSoft, solid: colors.kwote, icon: '⇅' },
  info: { soft: colors.eventSoft, solid: colors.event, icon: 'i' },
}
