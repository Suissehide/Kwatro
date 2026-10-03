/** URL publique du site (canonique, sitemap, Open Graph). Figée au build comme toute variable NEXT_PUBLIC_*. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kwatro.fr').replace(/\/$/, '')

export const siteDescription =
  'Soirées jeux de société, tournois TCG (Magic, Pokémon, Lorcana…) et joueurs près de chez toi : Kwatro réunit bars à jeux, boutiques et associations dans une seule app.'
