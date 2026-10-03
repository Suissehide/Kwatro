import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { DateBlock } from '../atoms/DateBlock'
import { Tag } from '../atoms/Tag'
import { Typography } from '../atoms/Typography'
import { colors, font } from '../tokens'
import { ContentCard } from './ContentCard'

export function EventCard({
  day,
  time,
  label,
  title,
  meta,
  places,
  partner,
  action,
  wide,
  raised,
  onPress,
}: {
  day: string
  time: string
  label: string
  title: string
  meta: string
  places?: string | null
  partner?: boolean
  action?: ReactNode
  wide?: boolean
  raised?: boolean
  onPress?: () => void
}) {
  const tag = partner ? <Tag label="Partenaire" variant="partner" /> : null
  return (
    <ContentCard kind="event" raised={raised} onPress={wide ? undefined : onPress} label={title}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: wide ? 'center' : 'flex-start',
          gap: wide ? 16 : 12,
        }}
      >
        <DateBlock day={day} month={time} />
        <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <Typography variant="label">{label}</Typography>
            {wide ? tag : null}
          </View>
          <Typography variant="title">{title}</Typography>
          <Typography variant="small">{wide && places ? `${meta} · ${places}` : meta}</Typography>
          {wide ? null : (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 2,
              }}
            >
              <Text style={{ ...font('mono', 700), fontSize: 12, color: colors.ink }}>
                {places}
              </Text>
              {tag}
            </View>
          )}
        </View>
        {wide ? action : null}
      </View>
    </ContentCard>
  )
}
