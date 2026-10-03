import type { MetadataRoute } from 'next'
import { siteUrl } from './site'

// Pages ville, lieux et événements à ajouter ici quand elles existeront
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteUrl, changeFrequency: 'weekly', priority: 1 }]
}
