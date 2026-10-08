import {
  CalendarDays,
  Compass,
  Dices,
  type LucideIcon,
  MessageCircle,
  Moon,
  Plus,
  ScanLine,
  Store,
  User,
} from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { CountBadge } from '../atoms/CountBadge'
import { Raised } from '../atoms/Raised'
import { useHover } from '../atoms/useHover'
import { border, colors, font, motion, shadow, transition } from '../tokens'

export type PlayerTab = 'explorer' | 'parties' | 'messages' | 'profil'
export type VenueTab = 'ce-soir' | 'scanner' | 'evenements' | 'lieu'

export type TabItem<K extends string> = { key: K; label: string; icon: LucideIcon }
export const playerItems: TabItem<PlayerTab>[] = [
  { key: 'explorer', label: 'Explorer', icon: Compass },
  { key: 'parties', label: 'Mes parties', icon: Dices },
  { key: 'messages', label: 'Messages', icon: MessageCircle },
  { key: 'profil', label: 'Profil', icon: User },
]
/** Barre du site (desktop) : le profil s'ouvre par l'avatar à droite, pas par un onglet ; l'agenda n'a de place que là. */
export const playerNavItems: TabItem<PlayerTab | 'agenda'>[] = [
  ...playerItems.slice(0, 1),
  { key: 'agenda', label: 'Agenda', icon: CalendarDays },
  ...playerItems.slice(1, 3),
]
const venueItems: TabItem<VenueTab>[] = [
  { key: 'ce-soir', label: 'Ce soir', icon: Moon },
  { key: 'scanner', label: 'Scanner', icon: ScanLine },
  { key: 'evenements', label: 'Événements', icon: CalendarDays },
  { key: 'lieu', label: 'Mon lieu', icon: Store },
]

function Tab<K extends string>({
  item,
  badge,
  active,
  activeColor,
  bottomInset,
  onPress,
}: {
  item: TabItem<K>
  badge?: number
  active: boolean
  activeColor: string
  bottomInset: number
  onPress: () => void
}) {
  const { hovered, hoverProps } = useHover()
  const strong = active || hovered
  return (
    <Pressable
      role="tab"
      aria-selected={active}
      aria-label={badge ? `${item.label}, ${badge} non lus` : item.label}
      onPress={onPress}
      {...hoverProps}
      style={{ flex: 1, alignItems: 'center', gap: 4, paddingTop: 10, paddingBottom: bottomInset }}
    >
      <View style={{ width: 24, height: 24 }}>
        <item.icon
          size={24}
          color={active ? activeColor : strong ? colors.ink : colors.muted}
          strokeWidth={active ? 2.5 : 2}
        />
        {badge ? (
          <View style={{ position: 'absolute', top: -9, left: 12 }}>
            <CountBadge count={badge} />
          </View>
        ) : null}
      </View>
      <Text
        style={{
          ...font('body', active ? 800 : 600),
          fontSize: 11,
          color: strong ? colors.ink : colors.muted,
          ...transition(['color']),
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
  badges,
  onSelect,
  onCreate,
  bottomInset = 22,
}: {
  active?: PlayerTab
  /** Pastilles de compte par onglet (messages non lus). */
  badges?: Partial<Record<PlayerTab, number>>
  onSelect: (tab: PlayerTab) => void
  onCreate: () => void
  /** Marge basse (zone de sécurité de l'appareil). */
  bottomInset?: number
}) {
  const tab = (item: TabItem<PlayerTab>) => (
    <Tab
      key={item.key}
      item={item}
      badge={badges?.[item.key]}
      active={item.key === active}
      activeColor={colors.room}
      bottomInset={bottomInset}
      onPress={() => onSelect(item.key)}
    />
  )
  const create = useHover()
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
          {...create.hoverProps}
          style={{ marginTop: -20 }}
        >
          <Raised offset={shadow.sm} r={27}>
            <View
              style={{
                width: 54,
                height: 54,
                borderRadius: 27,
                backgroundColor: colors.rating,
                borderWidth: border.base,
                borderColor: colors.ink,
                alignItems: 'center',
                justifyContent: 'center',
                transform: create.hovered ? [{ translateX: -1 }, { translateY: -1 }] : [],
                ...transition(['transform'], motion.fast),
              }}
            >
              <Plus size={28} color={colors.ink} strokeWidth={3} />
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
