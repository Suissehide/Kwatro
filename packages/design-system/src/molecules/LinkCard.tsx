import type { LucideIcon } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { Typography } from '../atoms/Typography'
import { useHover } from '../atoms/useHover'
import { border, colors, font, motion, radius, shadow, transition } from '../tokens'

/** Carte lien : libellé, description et icône ; l'ombre apparaît au survol. `highlight` : fond jaune, ombre fixe. */
export function LinkCard({
  label,
  description,
  icon: Icon,
  highlight,
  onPress,
}: {
  label: string
  description?: string
  icon: LucideIcon
  highlight?: boolean
  onPress: () => void
}) {
  const { hovered, hoverProps } = useHover()
  return (
    <Pressable role="link" onPress={onPress} {...hoverProps} style={{ borderRadius: radius.card }}>
      {/* Ombre toujours montée, transparente hors survol : la retirer recréerait la carte sous le curseur */}
      <Raised offset={shadow.md} color={hovered || highlight ? colors.ink : 'transparent'}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 14,
            paddingHorizontal: 18,
            backgroundColor: highlight ? colors.rating : colors.white,
            borderWidth: border.base,
            borderColor: colors.ink,
            borderRadius: radius.card,
            ...transition(['transform'], motion.fast),
            transform: hovered ? [{ translateX: -1 }, { translateY: -1 }] : [],
          }}
        >
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text style={{ ...font('body', 800), fontSize: 15, color: colors.ink }}>{label}</Text>
            {description ? (
              <Typography
                variant="small"
                numberOfLines={1}
                color={highlight ? colors.ink : undefined}
              >
                {description}
              </Typography>
            ) : null}
          </View>
          <Icon size={18} color={colors.ink} strokeWidth={2.5} />
        </View>
      </Raised>
    </Pressable>
  )
}
