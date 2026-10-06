import type { ReactNode } from 'react'
import { type StyleProp, Text, type TextProps, type TextStyle } from 'react-native'
import { colors, font, type } from '../tokens'

export type TypographyVariant = keyof typeof type

/** Texte aux styles du design system : display, hero, h1, h2, title, body, small, button, label, number. */
export function Typography({
  variant = 'body',
  color,
  weight,
  style,
  children,
  ...rest
}: {
  variant?: TypographyVariant
  color?: string
  /** Graisse à la place de celle de la variante (police Archivo, ou Space Mono pour label et number). */
  weight?: 400 | 500 | 600 | 700 | 800
  style?: StyleProp<TextStyle>
  children: ReactNode
} & Omit<TextProps, 'style'>) {
  const isHeading = ['display', 'hero', 'h1', 'h2'].includes(variant)
  return (
    <Text
      role={isHeading ? 'heading' : undefined}
      style={[
        { color: colors.ink },
        type[variant],
        color ? { color } : null,
        weight
          ? variant === 'label' || variant === 'number'
            ? font('mono', weight >= 700 ? 700 : 400)
            : font('body', weight)
          : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  )
}
