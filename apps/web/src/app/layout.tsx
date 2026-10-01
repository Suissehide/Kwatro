import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kwatro — Où jouer ce soir ?',
  description:
    'Trouve des joueurs et des lieux pour jouer aux TCG et aux jeux de société près de chez toi.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
