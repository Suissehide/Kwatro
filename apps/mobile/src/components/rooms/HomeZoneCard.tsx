import { border, colors, radius, Typography } from '@lucko/design-system'
import type { RoomDetail } from '@lucko/shared'
import { useQuery } from '@tanstack/react-query'
import { View } from 'react-native'
import { FuzzyZoneMap } from '@/components/explore/FuzzyZoneMap'
import { eventWhen } from '@/lib/explore'
import { roomAddressQueryOptions } from '@/queries/useRoom'

/**
 * Lieu d'une room à domicile (LKO-71) : zone floue pour tous ; l'adresse pour l'hôte, et pour les
 * joueurs acceptés à partir de 24 h avant le début, jusqu'à la fin de la partie.
 */
export function HomeZoneCard({
  roomId,
  home,
  isHost,
  accepted,
  over,
}: {
  roomId: string
  home: NonNullable<RoomDetail['home']>
  isHost: boolean
  accepted: boolean
  over: boolean
}) {
  const opened = isHost || (accepted && Date.now() >= Date.parse(home.revealAt))
  const address = useQuery({
    ...roomAddressQueryOptions(roomId),
    enabled: home.hasAddress && opened && !over,
  })
  const revealed = address.data ?? null
  const when = eventWhen(home.revealAt, null)
  // « à partir de samedi 10 octobre · 20 h »
  const from = `à partir de ${when.charAt(0).toLowerCase()}${when.slice(1)}`
  const note = over
    ? null
    : !home.hasAddress
      ? isHost
        ? 'Adresse non enregistrée : donne-la aux joueurs acceptés dans le chat de la room.'
        : 'L’hôte donne l’adresse dans le chat de la room.'
      : revealed
        ? isHost
          ? `Visible des joueurs acceptés ${from}, supprimée après la partie.`
          : null
        : accepted
          ? `Adresse visible ${from}.`
          : 'L’adresse est communiquée aux joueurs acceptés 24 h avant.'

  return (
    <View style={{ gap: 8 }}>
      <Typography variant="h2">Chez {isHost ? 'toi' : 'l’hôte'}</Typography>
      <Typography variant="small">{home.areaLabel}</Typography>
      <View
        style={{
          height: 220,
          borderWidth: border.base,
          borderColor: colors.ink,
          borderRadius: radius.card,
          overflow: 'hidden',
        }}
      >
        <FuzzyZoneMap
          // Une nouvelle carte à la révélation : centrée sur l'adresse au lieu de la zone
          key={revealed ? 'address' : 'zone'}
          center={revealed ?? home}
          radiusM={home.radiusM}
          revealed={!!revealed}
          address={revealed?.address}
        />
      </View>
      {address.isError ? (
        <Typography variant="small" color={colors.room}>
          {address.error.message}
        </Typography>
      ) : null}
      {note ? <Typography variant="small">{note}</Typography> : null}
    </View>
  )
}
