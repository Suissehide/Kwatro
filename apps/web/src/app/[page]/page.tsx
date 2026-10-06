import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TextPage } from '../text-page'

// ponytail: pages provisoires du pied de page, à remplacer par leur contenu
const PAGES: Record<string, { title: string; text: string }> = {
  about: {
    title: 'À propos',
    text: 'Lucko aide les joueurs à trouver une table près de chez eux, ce soir.',
  },
  help: { title: 'Aide', text: 'La foire aux questions arrive avec le lancement de l’app.' },
  bordeaux: {
    title: 'Où jouer ce soir à Bordeaux',
    text: 'Les bars à jeux, boutiques et associations de Bordeaux arrivent bientôt sur Lucko.',
  },
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
    <TextPage title={page.title}>
      <p>{page.text}</p>
    </TextPage>
  )
}
