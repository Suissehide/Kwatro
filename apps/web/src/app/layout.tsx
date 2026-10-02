import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@kwatro/design-system/kwatro.css'
import './globals.css'
import { RnwStyles } from './rnw-styles'

export const metadata: Metadata = {
  title: 'Kwatro — Où jouer ce soir ?',
  description:
    'Trouve des joueurs et des lieux pour jouer aux TCG et aux jeux de société près de chez toi.',
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
