import {
  border,
  colors,
  ListCard,
  ListRow,
  radius,
  SettingRow,
  TextField,
  Typography,
} from '@lucko/design-system'
import { HOME_FUZZY_RADIUS_M } from '@lucko/shared'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { MapPin } from 'lucide-react-native'
import { useState } from 'react'
import { View } from 'react-native'
import { FuzzyZoneMap } from '@/components/explore/FuzzyZoneMap'
import type { AddressSuggestion } from '@/lib/geocode'
import { addressSearchQueryOptions } from '@/queries/useGeocode'

/**
 * « Chez moi » dans « Créer une room » (LKO-71) : adresse cherchée dans la base IGN, aperçu de la zone
 * floue montrée aux autres joueurs, et choix d'enregistrer l'adresse ou de la donner dans le chat.
 */
export function HomeAddressPicker({
  value,
  saveAddress,
  onChange,
  onSaveAddress,
  wide,
}: {
  value: AddressSuggestion | null
  saveAddress: boolean
  onChange: (value: AddressSuggestion | null) => void
  onSaveAddress: (save: boolean) => void
  wide: boolean
}) {
  const [query, setQuery] = useState(value?.label ?? '')
  const typing = query !== (value?.label ?? '')
  const suggestions = useQuery({
    ...addressSearchQueryOptions(query),
    enabled: typing && query.trim().length >= 3,
    placeholderData: keepPreviousData,
  })

  return (
    <View style={{ gap: 10 }}>
      <TextField
        label="Ton adresse"
        placeholder="Ex. 12 rue des Faures, Bordeaux"
        autoComplete="street-address"
        value={query}
        onChangeText={(text) => {
          setQuery(text)
          if (value) onChange(null)
        }}
        help="Jamais montrée telle quelle : les joueurs voient une zone d'environ 500 m."
        error={suggestions.isError ? 'Recherche d’adresse indisponible. Réessaie.' : undefined}
      />
      {typing && suggestions.data?.length ? (
        <ListCard>
          {suggestions.data.map((s, i) => (
            <ListRow
              key={`${s.lat},${s.lng},${s.label}`}
              inset={wide ? 16 : 12}
              last={i === (suggestions.data?.length ?? 0) - 1}
              onPress={() => {
                setQuery(s.label)
                onChange(s)
              }}
              left={<MapPin size={18} color={colors.ink} strokeWidth={2.5} />}
              title={s.label}
              subtitle={s.areaLabel}
            />
          ))}
        </ListCard>
      ) : null}
      {value ? (
        <>
          <View
            style={{
              height: wide ? 220 : 240,
              borderWidth: border.base,
              borderColor: colors.ink,
              borderRadius: radius.card,
              overflow: 'hidden',
            }}
          >
            <FuzzyZoneMap center={value} radiusM={HOME_FUZZY_RADIUS_M} revealed={false} />
          </View>
          <Typography variant="small">
            Aperçu : la zone est décalée au hasard autour de chez toi. Affiché : {value.areaLabel}.
          </Typography>
        </>
      ) : null}
      <View style={{ padding: 14, borderWidth: border.thin, borderRadius: radius.button }}>
        <SettingRow
          title="Enregistrer l’adresse"
          description={
            saveAddress
              ? 'Chiffrée, visible des joueurs acceptés 24 h avant, supprimée après la partie.'
              : 'Tu la donneras dans le chat de la room aux joueurs acceptés.'
          }
          value={saveAddress}
          onChange={onSaveAddress}
        />
      </View>
    </View>
  )
}
