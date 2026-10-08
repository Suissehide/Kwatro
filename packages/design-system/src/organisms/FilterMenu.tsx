import { Check, ChevronDown, ChevronUp } from 'lucide-react-native'
import { useRef, useState } from 'react'
import { Modal, Pressable, Text, useWindowDimensions, View, type ViewProps } from 'react-native'
import { Button } from '../atoms/Button'
import { Chip } from '../atoms/Chip'
import { CountBadge } from '../atoms/CountBadge'
import { Raised } from '../atoms/Raised'
import { TextLink } from '../atoms/TextLink'
import { useHover } from '../atoms/useHover'
import { border, breakpoints, colors, font, radius, shadow, transition } from '../tokens'
import { BottomSheet } from './BottomSheet'

export type FilterOption = { value: string; label: string; count: number; swatch?: string }

const WIDTH = 260
const MARGIN = 8

/**
 * Filtre déroulant de l'agenda : popover sous le bouton (web), pilules dans un BottomSheet (téléphone).
 * Ouverture contrôlée par l'écran (`open` / `onOpenChange`) pour n'en avoir qu'un d'ouvert à la fois.
 * Échap ou clic à l'extérieur : fermeture.
 */
export function FilterMenu({
  label,
  title,
  options,
  selected,
  multiple = true,
  onChange,
  resultCount,
  open,
  onOpenChange,
}: {
  /** Libellé du bouton (« Jeux ») ; en choix unique, remplacé par la valeur choisie. */
  label: string
  title: string
  options: FilterOption[]
  selected: string[]
  multiple?: boolean
  onChange: (selected: string[]) => void
  resultCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const win = useWindowDimensions()
  const sheet = win.width < breakpoints.tablet
  const trigger = useRef<View>(null)
  const [anchor, setAnchor] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const { hovered, hoverProps } = useHover()
  const active = selected.length > 0
  const shown =
    !multiple && active ? (options.find((o) => o.value === selected[0])?.label ?? label) : label
  const fg = active ? colors.white : colors.ink
  const Chevron = open ? ChevronUp : ChevronDown

  const toggle = (value: string) =>
    onChange(
      multiple
        ? selected.includes(value)
          ? selected.filter((v) => v !== value)
          : [...selected, value]
        : selected[0] === value
          ? []
          : [value],
    )
  const show = () =>
    trigger.current?.measureInWindow((x, y, _w, h) => {
      setAnchor({ x, y: y + h + 6 })
      onOpenChange(true)
    })
  const close = () => onOpenChange(false)

  const footer = (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <TextLink label="Effacer" muted onPress={() => onChange([])} />
      <Button label={`Voir ${resultCount}`} kind="ink" small onPress={close} />
    </View>
  )

  return (
    <>
      <Pressable
        ref={trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        onPress={open ? close : show}
        {...hoverProps}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          height: 40,
          paddingHorizontal: 12,
          borderWidth: border.thin,
          borderColor: colors.ink,
          borderRadius: radius.field,
          backgroundColor: active ? colors.ink : hovered ? colors.hover : colors.white,
          ...transition(['background-color']),
        }}
      >
        <Text style={{ ...font('body', 700), fontSize: 14, color: fg }}>{shown}</Text>
        {multiple && active ? <CountBadge count={selected.length} color={colors.white} /> : null}
        <Chevron size={16} color={fg} strokeWidth={2.5} />
      </Pressable>

      {sheet ? (
        <BottomSheet visible={open} title={title} onClose={close}>
          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {options.map((o) => (
                <Chip
                  key={o.value}
                  label={o.label}
                  count={o.count}
                  tall
                  active={selected.includes(o.value)}
                  onPress={() => toggle(o.value)}
                />
              ))}
            </View>
            {footer}
          </View>
        </BottomSheet>
      ) : open ? (
        <Modal transparent visible onRequestClose={close}>
          <Pressable
            aria-label="Fermer le filtre"
            onPress={close}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, cursor: 'auto' }}
          />
          <Raised
            offset={shadow.card}
            style={{
              position: 'absolute',
              top: anchor.y,
              left: Math.min(Math.max(MARGIN, anchor.x), win.width - WIDTH - MARGIN),
              width: WIDTH,
            }}
          >
            <View
              style={{
                backgroundColor: colors.white,
                borderWidth: border.base,
                borderColor: colors.ink,
                borderRadius: radius.card,
                padding: 12,
                gap: 10,
              }}
            >
              <Text style={{ ...font('body', 800), fontSize: 14, color: colors.ink }}>{title}</Text>
              {/* listbox absent des rôles React Native, transmis tel quel par react-native-web */}
              <View
                {...({ role: 'listbox', 'aria-multiselectable': multiple } as unknown as ViewProps)}
                aria-label={title}
              >
                {options.map((o) => (
                  <OptionRow
                    key={o.value}
                    option={o}
                    multiple={multiple}
                    checked={selected.includes(o.value)}
                    onPress={() => toggle(o.value)}
                  />
                ))}
              </View>
              {footer}
            </View>
          </Raised>
        </Modal>
      ) : null}
    </>
  )
}

function OptionRow({
  option,
  multiple,
  checked,
  onPress,
}: {
  option: FilterOption
  multiple: boolean
  checked: boolean
  onPress: () => void
}) {
  const { hovered, hoverProps } = useHover()
  return (
    <Pressable
      role="option"
      aria-selected={checked}
      onPress={onPress}
      {...hoverProps}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderRadius: radius.sm,
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
          borderRadius: multiple ? 5 : 10,
          backgroundColor: checked ? colors.ink : colors.white,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked ? <Check size={13} color={colors.white} strokeWidth={3} /> : null}
      </View>
      {option.swatch ? (
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            borderWidth: border.thin,
            borderColor: colors.ink,
            backgroundColor: option.swatch,
          }}
        />
      ) : null}
      <Text style={{ flex: 1, ...font('body', 600), fontSize: 14, color: colors.ink }}>
        {option.label}
      </Text>
      <Text
        style={{
          ...font('mono', 700),
          fontSize: 12,
          color: option.count ? colors.muted : colors.inactive,
        }}
      >
        {option.count}
      </Text>
    </Pressable>
  )
}
