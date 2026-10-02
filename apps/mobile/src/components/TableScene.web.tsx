import { lazy, Suspense } from 'react'

// Three.js (~150 ko) chargé à part, seulement sur navigateur desktop
const HeroScene = lazy(() => import('@kwatro/design-system/scene'))

/** Pièces 3D de la landing (dé, pion, carte, jeton) lancées sur la table, à côté du formulaire. */
export function TableScene() {
  return (
    <Suspense fallback={null}>
      <HeroScene
        style={{ position: 'absolute', inset: '-32px 0', pointerEvents: 'none', opacity: 0 }}
      />
    </Suspense>
  )
}
