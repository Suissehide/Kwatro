import { ArrowLeft } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { IconButton } from '../atoms/IconButton'
import { colors, font } from '../tokens'

/** En-tête d'écran mobile : retour (si `onBack`), titre tronqué, actions à droite. */
export function ScreenHeader({
  title,
  onBack,
  right,
}: {
  title: string
  onBack?: () => void
  right?: ReactNode
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingTop: 6,
        paddingBottom: 10,
        paddingHorizontal: 16,
      }}
    >
      {onBack ? (
        <IconButton
          size={36}
          label="Retour"
          onPress={onBack}
          icon={<ArrowLeft size={20} color={colors.ink} strokeWidth={2.5} />}
        />
      ) : null}
      <Text
        role="heading"
        numberOfLines={1}
        style={{ flex: 1, minWidth: 0, ...font('body', 800), fontSize: 17, color: colors.ink }}
      >
        {title}
      </Text>
      {right}
    </View>
  )
}
