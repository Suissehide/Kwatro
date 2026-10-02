import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import '@kwatro/design-system/kwatro.css'
import { RnwStyles } from './rnw-styles'
import { siteDescription, siteUrl } from './site'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Kwatro — Soirées jeux de société et tournois TCG près de chez toi',
    template: '%s — Kwatro',
  },
  description: siteDescription,
  applicationName: 'Kwatro',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Kwatro',
    url: '/',
    title: 'Kwatro — Où jouer ce soir ?',
    description: siteDescription,
  },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = {
  themeColor: '#fff1d6',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <RnwStyles>{children}</RnwStyles>
      </body>
    </html>
  )
}
