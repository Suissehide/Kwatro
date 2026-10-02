import type { ReactNode } from 'react'
import { type StyleProp, Text, type TextProps, type TextStyle } from 'react-native'
import { colors, type } from '../tokens'

export type TypographyVariant = keyof typeof type

/** Texte aux styles du design system : display, h1, h2, title, body, small, button, label, number. */
export function Typography({
  variant = 'body',
  color,
  style,
  children,
  ...rest
}: {
  variant?: TypographyVariant
  color?: string
  style?: StyleProp<TextStyle>
  children: ReactNode
} & Omit<TextProps, 'style'>) {
  const isHeading = variant === 'display' || variant === 'h1' || variant === 'h2'
  return (
    <Text
      role={isHeading ? 'heading' : undefined}
      style={[{ color: colors.ink }, type[variant], color ? { color } : null, style]}
      {...rest}
    >
      {children}
    </Text>
  )
}
