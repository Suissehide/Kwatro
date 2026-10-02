'use client'
import dynamic from 'next/dynamic'
import s from './auth.module.css'

// Même scène que le hero de la landing (dé, pion, carte, jeton), chargée après l'hydratation
const HeroScene = dynamic(() => import('../hero-scene'), { ssr: false })

export function TableScene() {
  return <HeroScene className={s.scene} />
}
