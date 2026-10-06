import { prefersReducedMotion } from '@lucko/design-system'
import { useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'

// Une section devient active quand son titre passe cette ligne, sous le haut de la zone qui défile
const LINE = 80

// Le défilement se fait dans la ScrollView de WebScreen, pas dans la fenêtre
const scrollParent = (el: HTMLElement) => {
  let parent = el.parentElement
  while (parent && !/(auto|scroll)/.test(getComputedStyle(parent).overflowY)) {
    parent = parent.parentElement
  }
  return parent ?? document.documentElement
}

/**
 * Navigation latérale d'une page en sections (web) : l'entrée active suit le défilement,
 * `select` fait défiler jusqu'à la section. `ids` : ancres des sections, dans l'ordre.
 */
// ponytail: web seulement ; sur tablette native, brancher scrollTo sur la ScrollView
export function useSectionNav(ids: readonly string[], ready: boolean) {
  const [active, setActive] = useState(0)
  // Entrée cliquée : reste active pendant le défilement qu'elle lance, même si la section
  // ne peut pas monter jusqu'en haut (fin de page)
  const picked = useRef<number | null>(null)

  useEffect(() => {
    if (!ready || Platform.OS !== 'web') return
    const first = document.getElementById(ids[0] ?? '')
    if (!first) return
    const root = scrollParent(first)
    const onScroll = () => {
      if (picked.current !== null) return
      const top = root.getBoundingClientRect().top + LINE
      const atBottom = root.scrollTop + root.clientHeight >= root.scrollHeight - 2
      const passed = ids.findLastIndex(
        (id) => (document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= top,
      )
      setActive(atBottom ? ids.length - 1 : Math.max(passed, 0))
    }
    // Seul un geste du joueur rend la main au suivi du défilement
    const release = () => {
      picked.current = null
    }
    const gestures = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const
    root.addEventListener('scroll', onScroll, { passive: true })
    for (const g of gestures) root.addEventListener(g, release, { passive: true })
    return () => {
      root.removeEventListener('scroll', onScroll)
      for (const g of gestures) root.removeEventListener(g, release)
    }
  }, [ids, ready])

  const select = (index: number) => {
    picked.current = index
    setActive(index)
    const el = Platform.OS === 'web' ? document.getElementById(ids[index] ?? '') : null
    if (!el) return
    const root = scrollParent(el)
    // scroll() et non scrollTo() : react-native-web remplace scrollTo sur sa ScrollView ({ x, y })
    root.scroll({
      top: el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - 24,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }

  return { active, select }
}
