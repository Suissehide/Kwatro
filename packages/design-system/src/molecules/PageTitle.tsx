import { View } from 'react-native'
import { Typography } from '../atoms/Typography'
import { font } from '../tokens'

export function PageTitle({
  eyebrow,
  title,
  hero,
  big,
  note,
}: {
  eyebrow?: string
  title: string
  hero?: boolean
  /** Titre display 44 px (en-tête de section du back-office). */
  big?: boolean
  /** Texte à droite du titre. */
  note?: string
}) {
  const heading = (
    <View style={{ gap: hero ? 12 : 6, paddingTop: hero ? 0 : 8, flexShrink: 1 }}>
      {eyebrow ? <Typography variant="label">{eyebrow}</Typography> : null}
      <Typography
        variant={hero ? 'hero' : 'h1'}
        style={
          hero
            ? { maxWidth: 640 }
            : big
              ? { ...font('display'), fontSize: 44, lineHeight: 44 }
              : null
        }
      >
        {title}
      </Typography>
    </View>
  )
  if (!note) return heading
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 16,
      }}
    >
      {heading}
      <Typography variant="small" style={{ maxWidth: 360, textAlign: 'right' }}>
        {note}
      </Typography>
    </View>
  )
}
