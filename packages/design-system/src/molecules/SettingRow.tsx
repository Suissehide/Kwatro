import { Text, View } from 'react-native'
import { Toggle } from '../atoms/Toggle'
import { colors, font } from '../tokens'

/** Réglage à bascule : titre, explication, interrupteur à droite. */
export function SettingRow({
  title,
  description,
  value,
  onChange,
}: {
  title: string
  description?: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ ...font('body', 800), fontSize: 15, color: colors.ink }}>{title}</Text>
        {description ? (
          <Text style={{ ...font('body', 400), fontSize: 12, lineHeight: 16, color: colors.muted }}>
            {description}
          </Text>
        ) : null}
      </View>
      <Toggle label={title} value={value} onChange={onChange} />
    </View>
  )
}
