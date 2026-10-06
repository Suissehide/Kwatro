import { Text, View } from 'react-native'
import { Typography } from '../atoms/Typography'
import { colors, font } from '../tokens'
import { AvatarStack } from './AvatarStack'
import { ContentCard } from './ContentCard'
import { RatingBadge } from './RatingBadge'

export function RoomCard({
  label,
  title,
  meta,
  players,
  capacity,
  rating,
  wide,
  onPress,
}: {
  label: string
  title: string
  meta: string
  players: string[]
  capacity: number
  rating?: string | null
  wide?: boolean
  onPress?: () => void
}) {
  const count = (
    <Text style={{ ...font('mono', 700), fontSize: 12, color: colors.ink }}>
      {players.length}/{capacity}
    </Text>
  )
  return (
    <ContentCard kind="room" onPress={onPress} label={`${label}, ${title}`}>
      <Typography variant="label">{label}</Typography>
      <Typography variant="title">{title}</Typography>
      <Typography variant="small">{meta}</Typography>
      {wide ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AvatarStack names={players} />
            {count}
          </View>
          {rating ? <RatingBadge value={rating} /> : null}
        </View>
      ) : (
        count
      )}
    </ContentCard>
  )
}
