import { View } from 'react-native'
import { Typography } from '../atoms/Typography'

export function PageTitle({
  eyebrow,
  title,
  hero,
}: {
  eyebrow?: string
  title: string
  hero?: boolean
}) {
  return (
    <View style={{ gap: hero ? 12 : 6, paddingTop: hero ? 0 : 8 }}>
      {eyebrow ? <Typography variant="label">{eyebrow}</Typography> : null}
      <Typography variant={hero ? 'hero' : 'h1'} style={hero ? { maxWidth: 640 } : null}>
        {title}
      </Typography>
    </View>
  )
}
