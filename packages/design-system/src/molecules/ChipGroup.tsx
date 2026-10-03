import { View } from 'react-native'
import { Chip } from '../atoms/Chip'
import { Carousel } from './Carousel'

export type ChipItem<K> = { key: K; label: string }

export function ChipGroup<K>({
  items,
  value,
  onChange,
  scroll,
}: {
  items: ChipItem<K>[]
  value: K
  onChange: (key: K) => void
  scroll?: boolean
}) {
  const chips = items.map((item) => (
    <Chip
      key={item.label}
      label={item.label}
      active={item.key === value}
      onPress={() => onChange(item.key)}
    />
  ))
  return scroll ? (
    <Carousel gap={8}>{chips}</Carousel>
  ) : (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{chips}</View>
  )
}
