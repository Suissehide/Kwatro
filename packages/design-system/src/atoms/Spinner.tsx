import { ActivityIndicator } from 'react-native'
import { colors } from '../tokens'

export function Spinner({ color = colors.ink }: { color?: string }) {
  return <ActivityIndicator color={color} aria-label="Chargement" />
}
