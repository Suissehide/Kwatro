import { Image, Pressable, Text, View } from 'react-native'
import { Button } from '../atoms/Button'
import { useHover } from '../atoms/useHover'
import { border, colors, font, radius } from '../tokens'

/** Photo à valider : image carrée, auteur (lien vers sa fiche), approuver ou refuser. */
export function PhotoReviewCard({
  uri,
  name,
  age,
  badge,
  busy,
  onOpen,
  onApprove,
  onReject,
}: {
  uri: string
  name: string
  age: string
  badge?: string
  busy?: boolean
  onOpen: () => void
  onApprove: () => void
  onReject: () => void
}) {
  const { hovered, hoverProps } = useHover()
  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: radius.card,
        overflow: 'hidden',
      }}
    >
      <View style={{ aspectRatio: 1, borderBottomWidth: border.base, borderColor: colors.ink }}>
        <Image
          source={{ uri }}
          accessibilityLabel={`Photo de ${name}`}
          style={{ width: '100%', height: '100%', backgroundColor: colors.hatch }}
        />
        {badge ? (
          <Text
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              ...font('mono', 700),
              fontSize: 10,
              textTransform: 'uppercase',
              color: colors.ink,
              backgroundColor: colors.white,
              borderWidth: border.thin,
              borderColor: colors.ink,
              borderRadius: radius.tag,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            {badge}
          </Text>
        ) : null}
      </View>
      <View style={{ padding: 12, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable role="link" onPress={onOpen} {...hoverProps} style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={{
                ...font('body', 800),
                fontSize: 16,
                color: hovered ? colors.room : colors.ink,
              }}
            >
              {name}
            </Text>
          </Pressable>
          <Text style={{ ...font('mono', 400), fontSize: 12, color: colors.muted }}>{age}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Button small kind="venue" label="Approuver" disabled={busy} onPress={onApprove} />
          </View>
          <View style={{ flex: 1 }}>
            <Button small kind="danger" label="Refuser…" disabled={busy} onPress={onReject} />
          </View>
        </View>
      </View>
    </View>
  )
}
