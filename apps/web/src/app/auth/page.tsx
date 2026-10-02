import type { Metadata } from 'next'
import l from '../landing.module.css'
import s from './auth.module.css'
import { AuthFlow } from './auth-flow'
import { TableScene } from './table-scene'

export const metadata: Metadata = {
  title: 'Connexion',
  robots: { index: false, follow: false },
}

/** Connexion / inscription, version web de l'écran /auth de l'app (KWT-44). */
export default function AuthPage() {
  return (
    <div className={s.page}>
      <nav className={l.nav} aria-label="Principale">
        <a href="/" className={s.home}>
          {/* biome-ignore lint/performance/noImgElement: SVG du favicon, pas d'optimisation à faire */}
          <img src="/icon.svg" alt="" width={32} height={32} />
          <span className={l.logo}>Kwatro</span>
        </a>
      </nav>
      <main className={s.main}>
        <section className={s.intro}>
          <p className={s.headline}>Trouve où jouer ce soir, et avec qui.</p>
          <div className={s.table}>
            <TableScene />
          </div>
        </section>
        <div className={`kw-card kw-card--raised ${s.panel}`}>
          <AuthFlow />
        </div>
      </main>
    </div>
  )
}
