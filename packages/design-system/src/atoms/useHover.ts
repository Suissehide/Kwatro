import { useState } from 'react'

/**
 * Survol souris d'un Pressable (web ; jamais déclenché au doigt).
 * `const { hovered, hoverProps } = useHover()` puis `<Pressable {...hoverProps}>`.
 */
export function useHover() {
  const [hovered, setHovered] = useState(false)
  return {
    hovered,
    hoverProps: { onHoverIn: () => setHovered(true), onHoverOut: () => setHovered(false) },
  }
}
