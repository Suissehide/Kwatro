import { prefersReducedMotion } from '@lucko/design-system'
import { useEffect, useState } from 'react'
import { Platform } from 'react-native'

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

  useEffect(() => {
    if (!ready || Platform.OS !== 'web') return
    const sections = ids.map((id) => document.getElementById(id))
    if (!sections[0]) return
    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        const last = ids.findLastIndex((id) => visible.has(id))
        if (last >= 0) setActive(last)
      },
      // Section active : la dernière entrée dans le haut de l'écran
      { root: scrollParent(sections[0]), rootMargin: '0px 0px -60% 0px' },
    )
    for (const section of sections) if (section) observer.observe(section)
    return () => observer.disconnect()
  }, [ids, ready])

  const select = (index: number) => {
    setActive(index)
    const el = Platform.OS === 'web' ? document.getElementById(ids[index] ?? '') : null
    if (!el) return
    const root = scrollParent(el)
    root.scrollTo({
      top: el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - 24,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }

  return { active, select }
}
