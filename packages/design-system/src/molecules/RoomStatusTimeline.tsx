import { Text, View } from 'react-native'
import { Typography } from '../atoms/Typography'
import { border, colors, font } from '../tokens'

export const ROOM_STEPS = ['Ouverte', 'Complète', 'Confirmée', 'En cours', 'Terminée'] as const

/** Frise du statut d'une room ; `current` = index dans ROOM_STEPS. */
export function RoomStatusTimeline({ current }: { current: number }) {
  return (
    <View style={{ flexDirection: 'row' }} aria-label={`Statut : ${ROOM_STEPS[current] ?? ''}`}>
      {ROOM_STEPS.map((step, i) => (
        <View key={step} style={{ flex: 1, gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 7,
                borderWidth: border.thin,
                borderColor: colors.ink,
                backgroundColor:
                  i < current ? colors.ink : i === current ? colors.room : colors.white,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {i < current ? (
                <Text style={{ ...font('body', 800), color: colors.white, fontSize: 12 }}>✓</Text>
              ) : null}
            </View>
            {i < ROOM_STEPS.length - 1 ? (
              <View
                style={{
                  flex: 1,
                  height: 3,
                  backgroundColor: i < current ? colors.ink : colors.line,
                }}
              />
            ) : null}
          </View>
          <Typography
            variant="label"
            style={{ fontSize: 10, color: i === current ? colors.room : colors.ink }}
          >
            {step}
          </Typography>
        </View>
      ))}
    </View>
  )
}
