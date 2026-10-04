import {
  colors,
  font,
  Slider,
  Spinner,
  TextField,
  TextLink,
  Typography,
} from '@kwatro/design-system'
import { RADIUS_KM } from '@kwatro/shared'
import { Text, View } from 'react-native'
import type { useCityField } from '@/lib/useCityField'

/** Ville (saisie ou « Me localiser ») et rayon de recherche. */
export function WhereFields({
  cityField,
  radius,
  onRadius,
  compact,
}: {
  cityField: ReturnType<typeof useCityField>
  radius: number
  onRadius: (value: number) => void
  compact?: boolean
}) {
  const { city, setCity, error, locating, locate } = cityField
  return (
    <View style={{ gap: compact ? 16 : 20 }}>
      <TextField
        label="Ville"
        placeholder="Ex. Bordeaux"
        value={city}
        onChangeText={setCity}
        error={error}
        autoComplete="postal-address-locality"
        right={
          locating ? (
            <Spinner />
          ) : (
            <TextLink
              label={compact ? 'Localiser' : 'Me localiser'}
              onPress={() => void locate()}
            />
          )
        }
      />
      <View style={{ gap: 8 }}>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="label">{compact ? 'Rayon' : 'Rayon de recherche'}</Typography>
          <Text style={{ ...font('mono', 700), fontSize: 15, color: colors.ink }}>{radius} km</Text>
        </View>
        <Slider
          label="Rayon de recherche en kilomètres"
          value={radius}
          min={RADIUS_KM.min}
          max={RADIUS_KM.max}
          onChange={onRadius}
        />
        {compact ? null : (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ ...font('mono', 400), fontSize: 12, color: colors.muted }}>
              {RADIUS_KM.min} km
            </Text>
            <Text style={{ ...font('mono', 400), fontSize: 12, color: colors.muted }}>
              {RADIUS_KM.max} km
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}
