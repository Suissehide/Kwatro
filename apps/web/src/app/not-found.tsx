import type { Metadata } from 'next'
import { NotFoundPage } from './not-found-page'

export const metadata: Metadata = { title: 'Page introuvable', robots: { index: false } }

export default function NotFound() {
  return <NotFoundPage />
}
