import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useHover } from '../atoms/useHover'
import { border, colors, font, radius, transition } from '../tokens'

/**
 * Élément d'une file à traiter (back-office : signalement, lieu à valider, photo, jeu) :
 * titre et pastilles, ligne de contexte, texte, puis les actions. `onPress` ouvre le détail.
 */
export function ReviewCard({
  left,
  title,
  tags,
  meta,
  body,
  actions,
  onPress,
  children,
}: {
  left?: ReactNode
  title: string
  tags?: ReactNode
  /** Contexte en police mono : auteur, date, adresse. */
  meta?: string
  body?: string
  actions?: ReactNode
  onPress?: () => void
  /** Contenu libre sous le texte (horaires, réglages). */
  children?: ReactNode
}) {
  const { hovered, hoverProps } = useHover()
  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: radius.card,
        overflow: 'hidden',
      }}
    >
      <Pressable
        role={onPress ? 'link' : undefined}
        aria-label={onPress ? title : undefined}
        disabled={!onPress}
        onPress={onPress}
        {...hoverProps}
        style={{
          flexDirection: 'row',
          gap: 12,
          padding: 14,
          backgroundColor: onPress && hovered ? colors.hover : 'transparent',
          ...transition(['background-color']),
        }}
      >
        {left}
        <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <Text style={{ ...font('body', 800), fontSize: 16, color: colors.ink }}>{title}</Text>
            {tags}
          </View>
          {meta ? (
            <Text style={{ ...font('mono', 400), fontSize: 12, color: colors.muted }}>{meta}</Text>
          ) : null}
          {body ? (
            <Text style={{ ...font('body', 400), fontSize: 14, lineHeight: 20, color: colors.ink }}>
              {body}
            </Text>
          ) : null}
          {children}
        </View>
      </Pressable>
      {actions ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderTopWidth: border.thin,
            borderColor: colors.line,
          }}
        >
          {actions}
        </View>
      ) : null}
    </View>
  )
}
