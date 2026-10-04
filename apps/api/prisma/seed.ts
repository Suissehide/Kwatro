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
      quarter: 'Saint-Pierre',
      phone: '05 56 00 00 00',
      website: 'https://example.com',
      transitInfo: 'Tram C · Place de la Bourse, 2 min à pied',
      accessibility: [
        { label: 'Accès de plain-pied', status: 'YES', note: "Pas de marche à l'entrée" },
        { label: 'Toilettes adaptées', status: 'YES', note: 'Au rez-de-chaussée' },
        { label: "Salle TCG à l'étage", status: 'NO', note: 'Accès par escalier uniquement' },
        { label: 'Chaises avec dossier', status: 'YES', note: 'Sur toutes les tables' },
        { label: 'Niveau sonore', status: 'INFO', note: 'Calme en semaine, animé le samedi soir' },
        { label: "Chiens d'assistance", status: 'YES', note: 'Acceptés' },
      ],
      tcgNote:
        'Salle TCG de 12 tables. Apporte ton deck ; tapis et sleeves disponibles au comptoir.',
      boardGames: ['Cascadia', 'Codenames', 'Azul', 'Les Aventuriers du Rail', 'Dixit', 'Skyjo'],
      boardGameCount: 300,
      boardGameNote:
        "Ludothèque en libre accès, comprise dans le droit de jeu. Demande conseil à l'équipe.",
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
    {
      photos: ['salle', 'ludotheque', 'comptoir', 'tournoi', 'terrasse'].map((name, order) => ({
        url: `https://picsum.photos/seed/kwatro-${name}/1200/800`,
        caption: name,
        order,
      })),
      closures: [
        {
          startsOn: nextWeekday(3, 0, 0, 1),
          label: 'Fermé (inventaire)',
          note: 'Réouverture le lendemain à 17 h',
        },
        {
          startsOn: nextWeekday(3, 0, 0, 2),
          kind: 'SPECIAL_HOURS',
          label: 'Ouverture à 14 h',
          note: 'Horaires du samedi',
          opensAtMinute: 14 * 60,
          closesAtMinute: 60,
        },
        {
          startsOn: nextWeekday(2, 0, 0, 6),
          endsOn: nextWeekday(6, 0, 0, 6),
          label: 'Congés',
          note: 'Fermé 5 jours',
        },
      ],
    },
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
  await prisma.user.update({ where: { id: 'joueur-demo' }, data: { xp: 1840 } })
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
  for (const [userId, f, kwote, rankedGames] of [
    ['joueur-demo', commander, 1214, 12],
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
    // Pas de soirée pendant les congés (semaine 6)
    ...[0, 1, 2, 3, 4, 5, 7, 8, 9, 10].map((week) => ({
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
    ...[
      ['TOURNAMENT', 'Tournoi Standard', 6, 1, 'pokemon', 800],
      ['INITIATION', 'Découvrir Lorcana', 4, 1, 'lorcana', 0],
      ['TOURNAMENT', 'Tournoi mensuel', 6, 3, 'one-piece', 1000],
      ['INITIATION', 'Apprendre Magic en 1 h', 5, 4, 'magic', 0],
      ['THEMED', "Soirée Halloween : jeux d'enquête", 5, 5, 'jeux-de-societe', null],
      ['TOURNAMENT', 'Tournoi Standard', 6, 7, 'pokemon', 800],
      ['PRERELEASE', 'Avant-première Lorcana', 5, 9, 'lorcana', 2800],
      ['THEMED', 'Soirée de Noël', 5, 11, 'jeux-de-societe', null],
    ].map(([type, title, weekday, week, game, priceCents], i) => ({
      id: `demo-agenda-${i + 1}`,
      venueId: bar.id,
      type: type as 'TOURNAMENT' | 'INITIATION' | 'THEMED' | 'PRERELEASE',
      title: title as string,
      startsAt: nextWeekday(weekday as number, type === 'INITIATION' ? 18 : 19, 30, week as number),
      capacity: type === 'THEMED' ? 40 : type === 'INITIATION' ? 8 : 16,
      priceCents: priceCents as number | null,
      games: [game as string],
    })),
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
  await prisma.eventRegistration.upsert({
    where: { eventId_userId: { eventId: 'demo-commander-1', userId: 'joueur-demo' } },
    update: {},
    create: { eventId: 'demo-commander-1', userId: 'joueur-demo' },
  })

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
      players: ['demo-maya', 'demo-sam'],
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
type Closure = {
  startsOn: Date
  endsOn?: Date
  kind?: 'CLOSED' | 'SPECIAL_HOURS'
  label: string
  note?: string
  opensAtMinute?: number
  closesAtMinute?: number
}

/** Crée ou met à jour un lieu, ses jeux sur place, horaires, photos et fermetures (remplacés à chaque seed). */
async function upsertVenue(
  data: VenueData,
  gameSlugs: string[],
  hours: Hours[],
  {
    photos = [],
    closures = [],
  }: { photos?: { url: string; caption: string; order: number }[]; closures?: Closure[] } = {},
) {
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
  await prisma.venuePhoto.deleteMany({ where: { venueId: venue.id } })
  await prisma.venuePhoto.createMany({ data: photos.map((p) => ({ ...p, venueId: venue.id })) })
  await prisma.venueClosure.deleteMany({ where: { venueId: venue.id } })
  await prisma.venueClosure.createMany({
    data: closures.map((c) => ({
      ...c,
      startsOn: localDate(c.startsOn),
      endsOn: localDate(c.endsOn ?? c.startsOn),
      venueId: venue.id,
    })),
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

/** Colonne `@db.Date` : la date locale de la machine, à minuit UTC. */
function localDate(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
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
