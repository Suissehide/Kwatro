import { CONTACT_EMAIL } from '@kwatro/design-system'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Footer } from '../site-footer'

// ponytail: pages provisoires du pied de page, à remplacer par leur contenu (ticket CGU / confidentialité / mentions légales)
const PAGES: Record<string, { title: string; text: string }> = {
  'a-propos': {
    title: 'À propos',
    text: 'Kwatro aide les joueurs à trouver une table près de chez eux, ce soir.',
  },
  aide: { title: 'Aide', text: 'La foire aux questions arrive avec le lancement de l’app.' },
  bordeaux: {
    title: 'Où jouer ce soir à Bordeaux',
    text: 'Les bars à jeux, boutiques et associations de Bordeaux arrivent bientôt sur Kwatro.',
  },
  cgu: { title: 'Conditions d’utilisation', text: 'Page en cours de rédaction.' },
  confidentialite: {
    title: 'Politique de confidentialité',
    text: 'Kwatro ne dépose aucun cookie ni traceur publicitaire : la mesure d’audience (Umami) est anonyme. La politique complète est en cours de rédaction.',
  },
  'mentions-legales': { title: 'Mentions légales', text: 'Page en cours de rédaction.' },
}

type Props = { params: Promise<{ page: string }> }

export const dynamicParams = false
export const generateStaticParams = () => Object.keys(PAGES).map((page) => ({ page }))

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = PAGES[(await params).page]
  return { title: page?.title, robots: { index: false } }
}

export default async function FooterPage({ params }: Props) {
  const page = PAGES[(await params).page]
  if (!page) notFound()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main
        style={{ flex: 1, width: '100%', maxWidth: 720, margin: '0 auto', padding: '64px 16px' }}
      >
        <a className="kw-small" href="/">
          ← Kwatro
        </a>
        <h1 className="kw-h1" style={{ marginBlock: 24 }}>
          {page.title}
        </h1>
        <p>{page.text}</p>
        <p>
          Une question ? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </main>
      <Footer />
    </div>
  )
}
