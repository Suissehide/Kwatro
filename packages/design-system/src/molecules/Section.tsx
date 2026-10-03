import type { ReactNode } from 'react'
import { View } from 'react-native'
import { TextLink } from '../atoms/TextLink'
import { Typography } from '../atoms/Typography'

/** Section titrée (h2) avec un lien optionnel à droite (« Tout le programme », « Carte »). */
export function Section({
  title,
  link,
  onLink,
  children,
}: {
  title: string
  link?: string
  onLink?: () => void
  children: ReactNode
}) {
  return (
    <View style={{ gap: 14 }}>
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}
      >
        <Typography variant="h2">{title}</Typography>
        {link ? <TextLink label={link} onPress={onLink} /> : null}
      </View>
      {children}
    </View>
  )
}
