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

  // ---------- Données de démo (fictives) : les vrais lieux bordelais sont saisis via le back-office ----------
  const bar = await upsertVenue(
    {
      slug: 'lieu-de-demo-bordeaux',
      name: 'Lieu de démo',
      type: 'GAME_BAR',
      address: '1 place de la Bourse',
      city: 'Bordeaux',
      latitude: 44.8412,
      longitude: -0.5697,
      isPartner: true,
      description:
        'Bar à jeux fictif pour le développement : ludothèque, tables TCG, soirées à thème.',
      playFeeCents: 300,
      minSpendCents: 500,
      kwatroPerk: 'Droit de jeu offert sur présentation du QR Kwatro',
    },
    ['magic', 'pokemon', 'lorcana', 'jeux-de-societe'],
    // Mardi → samedi 17 h - 1 h, dimanche 14 h - 20 h
    [
      ...[2, 3, 4, 5, 6].map((weekday) => ({
        weekday,
        opensAtMinute: 17 * 60,
        closesAtMinute: 60,
      })),
      { weekday: 7, opensAtMinute: 14 * 60, closesAtMinute: 20 * 60 },
    ],
  )
  const shop = await upsertVenue(
    {
      slug: 'boutique-tcg-demo-bordeaux',
      name: 'Boutique TCG de démo',
      type: 'TCG_SHOP',
      address: '10 cours Victor Hugo',
      city: 'Bordeaux',
      latitude: 44.8352,
      longitude: -0.5712,
      isPartner: false,
      acceptsUnaccompaniedMinors: true,
      description: 'Boutique fictive non partenaire (pour tester le tri : partenaires en premier).',
    },
    ['magic', 'pokemon', 'one-piece', 'yugioh'],
    [1, 2, 3, 4, 5, 6].map((weekday) => ({
      weekday,
      opensAtMinute: 10 * 60,
      closesAtMinute: 19 * 60,
    })),
  )

  // Joueurs de démo à id fixe : en dev, en-tête `x-dev-user-id: joueur-demo` (ou `admin-demo`)
  for (const user of [
    { id: 'joueur-demo', email: 'joueur@demo.kwatro.local', pseudo: 'joueur-demo', role: 'PLAYER' },
    { id: 'admin-demo', email: 'admin@demo.kwatro.local', pseudo: 'admin-demo', role: 'ADMIN' },
  ] as const) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: { ...user, birthDate: new Date('1995-06-15'), city: 'Bordeaux' },
    })
  }
  await prisma.user.update({
    where: { id: 'joueur-demo' },
    data: {
      xp: 1840,
      name: 'Joueur Démo',
      latitude: 44.8378,
      longitude: -0.5792,
      // Mardi, jeudi, vendredi soir, samedi après-midi et soir, dimanche matin et après-midi
      availability: [5, 11, 14, 16, 17, 18, 19],
      vibes: ['CHILL', 'COMPETITIVE'],
    },
  })
  for (const pseudo of ['maya', 'sam', 'theo', 'alix', 'jade']) {
    await prisma.user.upsert({
      where: { id: `demo-${pseudo}` },
      update: {},
      create: {
        id: `demo-${pseudo}`,
        email: `${pseudo}@demo.kwatro.local`,
        pseudo,
        birthDate: new Date('1998-03-02'),
        city: 'Bordeaux',
      },
    })
  }
  const format = (game: string, slug: string) =>
    prisma.gameFormat.findFirstOrThrow({ where: { slug, game: { slug: game } } })
  const commander = await format('magic', 'commander')
  const pokemon = await format('pokemon', 'standard')
  const lorcana = await format('lorcana', 'core')
  const onePiece = await format('one-piece', 'standard')
  for (const [userId, f, kwote, rankedGames] of [
    ['joueur-demo', commander, 1214, 38],
    ['joueur-demo', lorcana, 1310, 12],
    ['joueur-demo', pokemon, 1092, 21],
    // Moins de 5 parties classées : Kwote provisoire
    ['joueur-demo', onePiece, 1000, 3],
    ['demo-maya', pokemon, 1180, 8],
    ['demo-sam', pokemon, 1260, 15],
  ] as const) {
    await prisma.playerGameProfile.upsert({
      where: { userId_formatId: { userId, formatId: f.id } },
      update: { kwote, rankedGames },
      create: { userId, formatId: f.id, kwote, rankedGames },
    })
  }

  // Événements, datés par rapport au jour du seed (relancer le seed les remet dans le futur)
  const commanderSeries = 'demo-serie-commander-mardi'
  const events = [
    ...[0, 1, 2, 3].map((week) => ({
      id: `demo-commander-${week + 1}`,
      venueId: bar.id,
      type: 'GAME_NIGHT' as const,
      title: 'Soirée Commander',
      startsAt: nextWeekday(2, 19, 30, week),
      capacity: 12,
      seriesId: commanderSeries,
      games: ['magic'],
    })),
    {
      id: 'demo-tournoi-pioneer',
      venueId: shop.id,
      type: 'TOURNAMENT' as const,
      title: 'Tournoi Pioneer',
      description: 'Suisse en 4 rondes, decklist obligatoire.',
      startsAt: nextWeekday(6, 14, 0, 1),
      capacity: 16,
      priceCents: 500,
      minAge: 13,
      games: ['magic'],
    },
    {
      id: 'demo-soiree-jeux-libre',
      venueId: bar.id,
      type: 'GAME_NIGHT' as const,
      title: 'Soirée jeux de société en accès libre',
      startsAt: nextWeekday(5, 19, 0, 0),
      registrationMode: 'NONE' as const,
      games: ['jeux-de-societe'],
    },
    {
      id: 'demo-avant-premiere-lorcana',
      venueId: shop.id,
      type: 'PRERELEASE' as const,
      title: 'Avant-première Lorcana',
      startsAt: nextWeekday(7, 13, 0, 2),
      priceCents: 3000,
      registrationMode: 'EXTERNAL' as const,
      externalUrl: 'https://example.com/avant-premiere-lorcana',
      games: ['lorcana'],
    },
    // Passé (historique de Mes parties)
    {
      id: 'demo-passe-tournoi-lorcana',
      venueId: shop.id,
      type: 'TOURNAMENT' as const,
      title: 'Tournoi Core',
      startsAt: daysAgo(8, 19, 0),
      capacity: 16,
      games: ['lorcana'],
    },
    // Ce soir (accueil) : relancer le seed chaque jour pour les remettre à la date du jour
    {
      id: 'demo-ce-soir-commander',
      venueId: bar.id,
      type: 'GAME_NIGHT' as const,
      title: 'Soirée Commander',
      startsAt: today(19, 30),
      capacity: 12,
      games: ['magic'],
    },
    {
      id: 'demo-ce-soir-lorcana',
      venueId: shop.id,
      type: 'PRERELEASE' as const,
      title: 'Avant-première Lorcana',
      startsAt: today(20, 0),
      capacity: 16,
      games: ['lorcana'],
    },
    {
      id: 'demo-ce-soir-jeux-libre',
      venueId: bar.id,
      type: 'GAME_NIGHT' as const,
      title: 'Jeux de société en accès libre',
      startsAt: today(19, 0),
      registrationMode: 'NONE' as const,
      games: ['jeux-de-societe'],
    },
    {
      id: 'demo-ce-soir-pokemon',
      venueId: shop.id,
      type: 'TOURNAMENT' as const,
      title: 'Tournoi Standard',
      startsAt: today(20, 0),
      capacity: 16,
      games: ['pokemon'],
    },
  ]
  for (const { games: slugs, ...event } of events) {
    const games = { set: slugs.map((slug) => ({ slug })) }
    await prisma.event.upsert({
      where: { id: event.id },
      update: { ...event, games },
      create: { ...event, games: { connect: slugs.map((slug) => ({ slug })) } },
    })
  }
  for (const [eventId, status] of [
    ['demo-commander-1', 'REGISTERED'],
    ['demo-tournoi-pioneer', 'WAITLISTED'],
    ['demo-passe-tournoi-lorcana', 'REGISTERED'],
  ] as const) {
    await prisma.eventRegistration.upsert({
      where: { eventId_userId: { eventId, userId: 'joueur-demo' } },
      update: { status },
      create: { eventId, userId: 'joueur-demo', status },
    })
  }

  const rooms = [
    {
      id: 'demo-room-pokemon',
      hostId: 'demo-maya',
      gameId: pokemon.gameId,
      formatId: pokemon.id,
      mode: 'RANKED' as const,
      venueId: bar.id,
      startsAt: today(21, 0),
      capacity: 4,
      players: ['demo-maya', 'demo-sam', 'joueur-demo'],
    },
    {
      id: 'demo-room-commander',
      hostId: 'demo-theo',
      gameId: commander.gameId,
      formatId: commander.id,
      mode: 'CASUAL' as const,
      venueId: shop.id,
      startsAt: today(20, 30),
      capacity: 4,
      players: ['demo-theo', 'demo-alix', 'demo-jade'],
    },
    {
      id: 'demo-room-passee-commander',
      hostId: 'joueur-demo',
      gameId: commander.gameId,
      formatId: commander.id,
      mode: 'RANKED' as const,
      status: 'FINISHED' as const,
      venueId: bar.id,
      startsAt: daysAgo(3, 20, 0),
      capacity: 4,
      players: ['joueur-demo', 'demo-theo', 'demo-alix', 'demo-jade'],
    },
    {
      id: 'demo-room-passee-jeux',
      hostId: 'demo-maya',
      gameId: (await prisma.game.findUniqueOrThrow({ where: { slug: 'jeux-de-societe' } })).id,
      mode: 'CASUAL' as const,
      status: 'FINISHED' as const,
      venueId: bar.id,
      startsAt: daysAgo(12, 19, 30),
      capacity: 6,
      players: ['demo-maya', 'joueur-demo', 'demo-sam'],
    },
  ]
  for (const { players, ...room } of rooms) {
    await prisma.room.upsert({ where: { id: room.id }, update: room, create: room })
    for (const userId of players) {
      await prisma.roomParticipant.upsert({
        where: { roomId_userId: { roomId: room.id, userId } },
        update: { status: 'ACCEPTED' },
        create: { roomId: room.id, userId, status: 'ACCEPTED' },
      })
    }
  }

  console.log('Seed terminé ✔')
}

type VenueData = Parameters<typeof prisma.venue.create>[0]['data'] & { slug: string }
type Hours = { weekday: number; opensAtMinute: number; closesAtMinute: number }

/** Crée ou met à jour un lieu, ses jeux sur place et ses horaires (remplacés à chaque seed). */
async function upsertVenue(data: VenueData, gameSlugs: string[], hours: Hours[]) {
  const games = gameSlugs.map((slug) => ({ slug }))
  const venue = await prisma.venue.upsert({
    where: { slug: data.slug },
    update: { ...data, games: { set: games } },
    create: { ...data, games: { connect: games } },
  })
  await prisma.venueOpeningHours.deleteMany({ where: { venueId: venue.id } })
  await prisma.venueOpeningHours.createMany({
    data: hours.map((h) => ({ ...h, venueId: venue.id })),
  })
  return venue
}

/** Prochain jour ISO `weekday` (1 = lundi) à hh:mm, décalé de `weeksLater` semaines. Heure locale de la machine. */
function nextWeekday(weekday: number, hours: number, minutes: number, weeksLater: number) {
  const date = new Date()
  const today = date.getDay() || 7
  date.setDate(date.getDate() + ((weekday - today + 7) % 7 || 7) + weeksLater * 7)
  date.setHours(hours, minutes, 0, 0)
  return date
}

function daysAgo(days: number, hours: number, minutes: number) {
  const date = today(hours, minutes)
  date.setDate(date.getDate() - days)
  return date
}

function today(hours: number, minutes: number) {
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
