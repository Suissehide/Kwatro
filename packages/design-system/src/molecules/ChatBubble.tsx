import { Text, View } from 'react-native'
import { Typography } from '../atoms/Typography'
import { border, colors, font } from '../tokens'

export function ChatBubble({
  text,
  mine,
  author,
}: {
  text: string
  mine?: boolean
  author?: string
}) {
  return (
    <View style={{ alignItems: mine ? 'flex-end' : 'flex-start', gap: 3 }}>
      {author ? (
        <Typography variant="label" style={{ fontSize: 10 }}>
          {author}
        </Typography>
      ) : null}
      <View
        style={{
          maxWidth: '78%',
          backgroundColor: mine ? colors.room : colors.white,
          borderWidth: border.thin,
          borderColor: colors.ink,
          borderRadius: 14,
          borderBottomRightRadius: mine ? 4 : 14,
          borderBottomLeftRadius: mine ? 14 : 4,
          paddingVertical: 8,
          paddingHorizontal: 12,
        }}
      >
        <Text
          style={{
            ...font('body', 400),
            fontSize: 14,
            lineHeight: 19,
            color: mine ? colors.white : colors.ink,
          }}
        >
          {text}
        </Text>
      </View>
    </View>
  )
}
