import { type ReactNode, useState } from 'react'
import { Linking, Platform, Text } from 'react-native'
import { colors, transition } from '../tokens'

/** Vraie ancre `<a href>` sur le web (référencement, clic molette), `Linking` sur mobile. */
export function linkProps(href: string): { onPress?: () => void } {
  if (Platform.OS !== 'web') return { onPress: () => void Linking.openURL(href) }
  const external = href.startsWith('http')
  // `href` et `hrefAttrs` : props de react-native-web absentes des types React Native
  return {
    href,
    hrefAttrs: external ? { target: '_blank', rel: 'noopener noreferrer' } : undefined,
  } as { onPress?: () => void }
}

/** Lien dans une phrase : à placer dans un `Text` / `Typography`, dont il garde la police. */
export function InlineLink({ href, children }: { href: string; children: ReactNode }) {
  const [hovered, setHovered] = useState(false)
  // Pointer events : gérés par Text (React Native, react-native-web) mais absents de ses types TS
  const hoverProps = {
    onPointerEnter: () => setHovered(true),
    onPointerLeave: () => setHovered(false),
  } as object
  return (
    <Text
      role="link"
      {...linkProps(href)}
      {...hoverProps}
      style={{
        color: hovered ? colors.room : colors.event,
        textDecorationLine: 'underline',
        ...transition(['color']),
      }}
    >
      {children}
    </Text>
  )
}
