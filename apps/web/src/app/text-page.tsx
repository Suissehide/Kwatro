import { CONTACT_EMAIL } from '@kwatro/design-system'
import type { ReactNode } from 'react'
import { Footer } from './site-footer'
import s from './text-page.module.css'

/** Page de texte du site (légal, aide, à propos) : retour à l'accueil, titre, contenu, contact, pied de page. */
export function TextPage({
  title,
  updated,
  children,
}: {
  title: string
  /** Date de dernière mise à jour, affichée sous le titre (pages légales). */
  updated?: string
  children: ReactNode
}) {
  return (
    <div className={s.page}>
      <main className={s.main}>
        <a className="kw-small" href="/">
          ← Kwatro
        </a>
        <h1 className="kw-h1">{title}</h1>
        {updated ? <p className="kw-small">Dernière mise à jour : {updated}</p> : null}
        <div className={s.content}>{children}</div>
        <p>
          Une question ? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </main>
      <Footer />
    </div>
  )
}

/** Information à fournir avant la mise en ligne publique, surlignée pour ne pas passer inaperçue. */
export function ToFill({ children }: { children: ReactNode }) {
  return <mark className={s.toFill}>{children} : à compléter</mark>
}
