import type { Metadata } from 'next'
import s from './auth.module.css'
import { AuthFlow } from './auth-flow'

export const metadata: Metadata = {
  title: 'Connexion',
  robots: { index: false, follow: false },
}

/** Connexion / inscription, version web de l'écran /auth de l'app (KWT-44). */
export default function AuthPage() {
  return (
    <main className={s.page}>
      <div className={s.brand}>
        <a href="/" className={s.wordmark}>
          Kwatro
        </a>
        <p className={s.tagline}>Trouve où jouer ce soir, et avec qui.</p>
      </div>
      <div className={`kw-card kw-card--raised ${s.panel}`}>
        <AuthFlow />
      </div>
    </main>
  )
}
