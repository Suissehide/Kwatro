import { ArrowLeft } from 'lucide-react-native'
import { Text, View } from 'react-native'
import { IconButton } from '../atoms/IconButton'
import { ProgressSteps } from '../atoms/ProgressSteps'
import { colors, font, space } from '../tokens'

/** En-tête d'un parcours en étapes sur téléphone : retour, barre d'étapes et « n / total », puis titre et sous-titre. */
export function StepHeader({
  current,
  total,
  title,
  subtitle,
  onBack,
}: {
  current: number
  total: number
  title: string
  subtitle?: string
  onBack?: () => void
}) {
  return (
    <View style={{ paddingTop: 6, paddingHorizontal: space.screen, paddingBottom: 14, gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {onBack ? (
          <IconButton
            label="Retour"
            size={40}
            icon={<ArrowLeft size={18} color={colors.ink} strokeWidth={2.5} />}
            onPress={onBack}
          />
        ) : null}
        <View style={{ flex: 1 }}>
          <ProgressSteps current={current} total={total} />
        </View>
        <Text style={{ ...font('mono', 700), fontSize: 12, color: colors.ink }}>
          {current} / {total}
        </Text>
      </View>
      <Text
        role="heading"
        style={{
          ...font('display'),
          fontSize: 30,
          lineHeight: 31,
          textTransform: 'uppercase',
          color: colors.ink,
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ ...font('body', 400), fontSize: 15, lineHeight: 22, color: colors.muted }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  )
}
