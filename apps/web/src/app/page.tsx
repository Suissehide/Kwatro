import { Landing } from './landing'
import { siteDescription, siteUrl } from './site'

// Données structurées : le site et l'organisation (https://schema.org)
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Kwatro',
      inLanguage: 'fr-FR',
      publisher: { '@id': `${siteUrl}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Kwatro',
      url: siteUrl,
      description: siteDescription,
      areaServed: 'FR',
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD statique, `<` échappé
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Landing />
    </>
  )
}
