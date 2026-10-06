import { Check } from 'lucide-react-native'
import { Text, View } from 'react-native'
import { border, colors, font } from '../tokens'

/** Point de vérification : coché (vert) ou à surveiller (« ! » jaune), libellé et détail. */
export function ChecklistItem({
  ok,
  label,
  detail,
}: {
  ok: boolean
  label: string
  detail?: string
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 4,
          borderWidth: border.thin,
          borderColor: colors.ink,
          backgroundColor: ok ? colors.venue : colors.rating,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {ok ? (
          <Check size={13} color={colors.white} strokeWidth={3.5} />
        ) : (
          <Text style={{ ...font('body', 800), fontSize: 12, color: colors.ink }}>!</Text>
        )}
      </View>
      <Text style={{ ...font('body', 800), fontSize: 14, color: colors.ink }}>{label}</Text>
      {detail ? (
        <Text style={{ flexShrink: 1, ...font('body', 400), fontSize: 13, color: colors.muted }}>
          {detail}
        </Text>
      ) : null}
    </View>
  )
}
