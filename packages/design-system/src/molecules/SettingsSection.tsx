import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Typography } from '../atoms/Typography'

/** Section de réglages (web) : titre, explication facultative, puis sa carte. `id` sert d'ancre. */
export function SettingsSection({
  id,
  title,
  description,
  children,
}: {
  id?: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <View id={id} style={{ gap: 14 }}>
      <View style={{ gap: 4 }}>
        <Typography variant="h2">{title}</Typography>
        {description ? <Typography variant="small">{description}</Typography> : null}
      </View>
      {children}
    </View>
  )
}
