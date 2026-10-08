import { Check } from 'lucide-react-native'
import { useRef, useState } from 'react'
import { Modal, Pressable, Text, useWindowDimensions, View } from 'react-native'
import { Button } from '../atoms/Button'
import { FilterButton } from '../atoms/FilterButton'
import { Raised } from '../atoms/Raised'
import { useHover } from '../atoms/useHover'
import { border, colors, font, radius, shadow, transition } from '../tokens'
import type { MenuAnchor } from './ContextMenu'

export type FilterOption = {
  value: string
  label: string
  /** Résultats si on coche cette option (les autres filtres comptent, pas celui-ci). */
  count: number
  selected: boolean
  /** Pastille de couleur avant le libellé (type de contenu). */
  swatch?: string
}

const WIDTH = 260
const MARGIN = 8

/**
 * Menu déroulant d'une barre de filtres (web) : bouton foncé avec le nombre de valeurs quand il filtre,
 * options avec leur compteur, « Effacer » et « Voir N ». `single` : choix unique (cases rondes).
 * Clic à l'extérieur ou Échap : fermé.
 */
export function FilterMenu({
  label,
  options,
  single,
  results,
  onToggle,
  onClear,
}: {
  label: string
  options: FilterOption[]
  single?: boolean
  results: number
  onToggle: (value: string) => void
  onClear: () => void
}) {
  const win = useWindowDimensions()
  const ref = useRef<View>(null)
  const [anchor, setAnchor] = useState<MenuAnchor | null>(null)
  const selected = options.filter((o) => o.selected).length
  const close = () => setAnchor(null)
  const open = () =>
    ref.current?.measureInWindow((x, y, width, height) => setAnchor({ x, y, width, height }))

  return (
    <View ref={ref} collapsable={false}>
      <FilterButton
        label={label}
        count={single ? 0 : selected}
        active={selected > 0}
        caret={anchor ? 'up' : 'down'}
        onPress={anchor ? close : open}
      />
      {anchor ? (
        <Modal transparent visible onRequestClose={close}>
          <Pressable
            aria-label="Fermer le menu"
            onPress={close}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, cursor: 'auto' }}
          />
          <Raised
            offset={shadow.card}
            r={radius.card}
            style={{
              position: 'absolute',
              top: anchor.y + anchor.height + 8,
              left: Math.min(anchor.x, win.width - WIDTH - MARGIN),
              width: WIDTH,
            }}
          >
            <View
              role="menu"
              style={{
                backgroundColor: colors.white,
                borderWidth: border.base,
                borderColor: colors.ink,
                borderRadius: radius.card,
                overflow: 'hidden',
              }}
            >
              <View style={{ paddingVertical: 6 }}>
                {options.map((o) => (
                  <OptionRow
                    key={o.value}
                    {...o}
                    single={single}
                    onPress={() => onToggle(o.value)}
                  />
                ))}
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderTopWidth: border.thin,
                  borderColor: colors.line,
                }}
              >
                <ClearLink onPress={onClear} />
                <Button small kind="ink" label={`Voir ${results}`} onPress={close} />
              </View>
            </View>
          </Raised>
        </Modal>
      ) : null}
    </View>
  )
}

function OptionRow({
  label,
  count,
  selected,
  swatch,
  single,
  onPress,
}: FilterOption & { single?: boolean; onPress: () => void }) {
  const { hovered, hoverProps } = useHover()
  return (
    <Pressable
      role={single ? 'radio' : 'checkbox'}
      aria-checked={selected}
      onPress={onPress}
      {...hoverProps}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 9,
        paddingHorizontal: 14,
        backgroundColor: hovered ? colors.hover : 'transparent',
        ...transition(['background-color']),
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderWidth: border.thin,
          borderColor: colors.ink,
          borderRadius: single ? 10 : 5,
          backgroundColor: selected ? colors.ink : colors.white,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected ? (
          single ? (
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.white }} />
          ) : (
            <Check size={13} color={colors.white} strokeWidth={3.5} />
          )
        ) : null}
      </View>
      {swatch ? (
        <View
          style={{
            width: 10,
            height: 10,
            borderWidth: border.thin,
            borderColor: colors.ink,
            borderRadius: 3,
            backgroundColor: swatch,
          }}
        />
      ) : null}
      <Text
        style={{ ...font('body', selected ? 800 : 600), fontSize: 14, color: colors.ink, flex: 1 }}
      >
        {label}
      </Text>
      <Text
        style={{
          ...font('mono', 400),
          fontSize: 12,
          color: count ? colors.muted : colors.inkMuted,
        }}
      >
        {count}
      </Text>
    </Pressable>
  )
}

function ClearLink({ onPress }: { onPress: () => void }) {
  const { hovered, hoverProps } = useHover()
  return (
    <Pressable role="button" onPress={onPress} {...hoverProps}>
      <Text
        style={{
          ...font('body', 800),
          fontSize: 12,
          color: hovered ? colors.room : colors.muted,
          ...transition(['color']),
        }}
      >
        Effacer
      </Text>
    </Pressable>
  )
}
