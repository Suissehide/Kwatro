import type { ReactNode } from 'react'
import { View } from 'react-native'
import { TextLink } from '../atoms/TextLink'
import { Typography } from '../atoms/Typography'

export function Section({
  title,
  link,
  onLink,
  aside,
  children,
}: {
  title: string
  link?: string
  onLink?: () => void
  /** À droite du titre à la place du lien : compteur, bascule… */
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <View style={{ gap: 14 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: aside ? 'center' : 'baseline',
          gap: 10,
        }}
      >
        <Typography variant="h2" style={{ flexShrink: 1 }}>
          {title}
        </Typography>
        {link ? <TextLink label={link} onPress={onLink} /> : aside}
      </View>
      {children}
    </View>
  )
}
