import { Pressable, Text, View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { border, colors, font, shadow } from '../tokens'

export type PlayerTab = 'explorer' | 'parties' | 'messages' | 'profil'
export type VenueTab = 'ce-soir' | 'scanner' | 'evenements' | 'lieu'

// ponytail: pictogrammes = formes des maquettes (rond / carré) ; passer à Phosphor « bold » quand le jeu d'icônes est choisi.
type Item<K extends string> = { key: K; label: string; round: boolean }
const playerItems: Item<PlayerTab>[] = [
  { key: 'explorer', label: 'Explorer', round: true },
  { key: 'parties', label: 'Mes parties', round: false },
  { key: 'messages', label: 'Messages', round: false },
  { key: 'profil', label: 'Profil', round: true },
]
const venueItems: Item<VenueTab>[] = [
  { key: 'ce-soir', label: 'Ce soir', round: true },
  { key: 'scanner', label: 'Scanner', round: false },
  { key: 'evenements', label: 'Événements', round: true },
  { key: 'lieu', label: 'Mon lieu', round: true },
]

function Tab<K extends string>({
  item,
  active,
  activeColor,
  bottomInset,
  onPress,
}: {
  item: Item<K>
  active: boolean
  activeColor: string
  bottomInset: number
  onPress: () => void
}) {
  return (
    <Pressable
      role="tab"
      aria-selected={active}
      aria-label={item.label}
      onPress={onPress}
      style={{ flex: 1, alignItems: 'center', gap: 4, paddingTop: 10, paddingBottom: bottomInset }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: item.round ? 11 : 4,
          backgroundColor: active ? activeColor : 'transparent',
          borderWidth: border.thin,
          borderColor: active ? colors.ink : colors.muted,
        }}
      />
      <Text
        style={{
          ...font('body', active ? 800 : 600),
          fontSize: 11,
          color: active ? colors.ink : colors.muted,
        }}
      >
        {item.label}
      </Text>
    </Pressable>
  )
}

const barStyle = {
  flexDirection: 'row',
  borderTopWidth: border.base,
  borderColor: colors.ink,
} as const

/** Barre d'onglets joueur : 4 onglets + bouton central « + » (créer une room). */
export function PlayerTabBar({
  active,
  onSelect,
  onCreate,
  bottomInset = 22,
}: {
  active: PlayerTab
  onSelect: (tab: PlayerTab) => void
  onCreate: () => void
  /** Marge basse (zone de sécurité de l'appareil). */
  bottomInset?: number
}) {
  const tab = (item: Item<PlayerTab>) => (
    <Tab
      key={item.key}
      item={item}
      active={item.key === active}
      activeColor={colors.room}
      bottomInset={bottomInset}
      onPress={() => onSelect(item.key)}
    />
  )
  return (
    <View
      role="tablist"
      style={[barStyle, { backgroundColor: colors.white, paddingHorizontal: 8 }]}
    >
      {playerItems.slice(0, 2).map(tab)}
      <View style={{ width: 70, alignItems: 'center' }}>
        <Pressable
          role="button"
          aria-label="Créer une room"
          onPress={onCreate}
          style={{ marginTop: -20 }}
        >
          <Raised offset={shadow.sm} r={27}>
            <View
              style={{
                width: 54,
                height: 54,
                borderRadius: 27,
                backgroundColor: colors.kwote,
                borderWidth: border.base,
                borderColor: colors.ink,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ ...font('display'), fontSize: 28, color: colors.ink }}>+</Text>
            </View>
          </Raised>
        </Pressable>
      </View>
      {playerItems.slice(2).map(tab)}
    </View>
  )
}

/** Barre d'onglets du mode lieu (fond venueSoft). */
export function VenueTabBar({
  active,
  onSelect,
  bottomInset = 22,
}: {
  active: VenueTab
  onSelect: (tab: VenueTab) => void
  bottomInset?: number
}) {
  return (
    <View
      role="tablist"
      style={[barStyle, { backgroundColor: colors.venueSoft, paddingHorizontal: 8 }]}
    >
      {venueItems.map((item) => (
        <Tab
          key={item.key}
          item={item}
          active={item.key === active}
          activeColor={colors.venue}
          bottomInset={bottomInset}
          onPress={() => onSelect(item.key)}
        />
      ))}
    </View>
  )
}
