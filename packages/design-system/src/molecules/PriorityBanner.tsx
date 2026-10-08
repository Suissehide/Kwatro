import { Text, View } from 'react-native'
import { Button } from '../atoms/Button'
import { Raised } from '../atoms/Raised'
import { Tag } from '../atoms/Tag'
import { border, colors, font, radius, shadow } from '../tokens'

/** Alerte en tête de page : étiquette, message et action, sur fond room. */
export function PriorityBanner({
  tag,
  message,
  action,
  onAction,
}: {
  tag: string
  message: string
  action: string
  onAction: () => void
}) {
  return (
    <Raised offset={shadow.card} r={radius.card}>
      <View
        role="alert"
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 14,
          paddingVertical: 14,
          paddingHorizontal: 18,
          backgroundColor: colors.room,
          borderWidth: border.base,
          borderColor: colors.ink,
          borderRadius: radius.card,
        }}
      >
        <Tag label={tag} variant="tonight" />
        <Text
          style={{
            flex: 1,
            minWidth: 200,
            ...font('body', 800),
            fontSize: 16,
            color: colors.white,
          }}
        >
          {message}
        </Text>
        <Button small kind="ghost" label={action} onPress={onAction} />
      </View>
    </Raised>
  )
}
