import { lazy, Suspense } from 'react'

// Three.js (~150 ko) chargé à part, seulement sur navigateur desktop
const HeroScene = lazy(() => import('@lucko/design-system/scene'))

/** Pièces 3D de la landing (dé, pion, carte, jeton) lancées sur la table, à côté du formulaire. */
export function TableScene() {
  return (
    <Suspense fallback={null}>
      {/* bleed : les pièces tombent d'au-dessus de la table, le canvas déborde pour ne pas les couper */}
      <HeroScene
        bleed={140}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0 }}
      />
    </Suspense>
  )
}
