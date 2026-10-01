import { config } from 'dotenv'

// Lit apps/api/.env s'il existe, sinon le .env à la racine du monorepo
config({ path: ['.env', '../../.env'], quiet: true })

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

const games = [
  {
    slug: 'magic',
    name: 'Magic: The Gathering',
    kind: 'TCG',
    formats: [
      ['commander', 'Commander'],
      ['modern', 'Modern'],
      ['pioneer', 'Pioneer'],
      ['draft', 'Draft'],
    ],
  },
  {
    slug: 'pokemon',
    name: 'Pokémon JCC',
    kind: 'TCG',
    formats: [
      ['standard', 'Standard'],
      ['expanded', 'Étendu'],
    ],
  },
  {
    slug: 'one-piece',
    name: 'One Piece Card Game',
    kind: 'TCG',
    formats: [['standard', 'Standard']],
  },
  { slug: 'lorcana', name: 'Disney Lorcana', kind: 'TCG', formats: [['core', 'Core']] },
  { slug: 'yugioh', name: 'Yu-Gi-Oh!', kind: 'TCG', formats: [['advanced', 'Advanced']] },
  { slug: 'riftbound', name: 'Riftbound', kind: 'TCG', formats: [['standard', 'Standard']] },
  { slug: 'jeux-de-societe', name: 'Jeux de société', kind: 'BOARD_GAME', formats: [] },
] as const

async function main() {
  for (const { formats, ...game } of games) {
    const saved = await prisma.game.upsert({
      where: { slug: game.slug },
      update: { name: game.name, kind: game.kind },
      create: game,
    })
    for (const [slug, name] of formats) {
      await prisma.gameFormat.upsert({
        where: { gameId_slug: { gameId: saved.id, slug } },
        update: { name },
        create: { slug, name, gameId: saved.id },
      })
    }
  }

  // Lieu fictif pour le développement (les vrais lieux bordelais sont saisis via le back-office)
  await prisma.venue.upsert({
    where: { slug: 'lieu-de-demo-bordeaux' },
    update: {},
    create: {
      slug: 'lieu-de-demo-bordeaux',
      name: 'Lieu de démo',
      type: 'GAME_BAR',
      address: '1 place de la Bourse',
      city: 'Bordeaux',
      latitude: 44.8412,
      longitude: -0.5697,
      isPartner: true,
    },
  })

  console.log('Seed terminé ✔')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
