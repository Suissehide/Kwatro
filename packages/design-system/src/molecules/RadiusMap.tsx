import { Text, View } from 'react-native'
import { border, colors, font, radius } from '../tokens'

const LINES = [1, 2, 3, 4, 5, 6, 7, 8, 9]

/**
 * Carte schématique du rayon de recherche : quadrillage, cercle en pointillés dont la taille suit
 * `radiusKm` et point central. `label` en bas à droite (ex. « 14 lieux · 23 soirées cette semaine »).
 */
export function RadiusMap({ radiusKm, label }: { radiusKm: number; label?: string | null }) {
  const ring = 30 + radiusKm * 2.6
  return (
    <View
      style={{
        height: 180,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: radius.card,
        backgroundColor: colors.hatch,
      }}
    >
      {LINES.map((i) => (
        <View
          key={`v${i}`}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${i * 10}%`,
            width: 1,
            backgroundColor: colors.disabledBg,
          }}
        />
      ))}
      {LINES.map((i) => (
        <View
          key={`h${i}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${i * 10}%`,
            height: 1,
            backgroundColor: colors.disabledBg,
          }}
        />
      ))}
      <View
        style={{
          width: ring,
          height: ring,
          borderRadius: ring / 2,
          borderWidth: border.base,
          borderStyle: 'dashed',
          borderColor: colors.event,
          backgroundColor: colors.eventSoft,
          opacity: 0.9,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 16,
          height: 16,
          borderRadius: 8,
          borderWidth: border.base,
          borderColor: colors.ink,
          backgroundColor: colors.room,
        }}
      />
      {label ? (
        <Text
          style={{
            position: 'absolute',
            right: 10,
            bottom: 8,
            paddingVertical: 2,
            paddingHorizontal: 7,
            borderWidth: border.thin,
            borderColor: colors.ink,
            borderRadius: radius.tag,
            backgroundColor: colors.white,
            ...font('mono', 700),
            fontSize: 11,
            color: colors.ink,
          }}
        >
          {label}
        </Text>
      ) : null}
    </View>
  )
}
