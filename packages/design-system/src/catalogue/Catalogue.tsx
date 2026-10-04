'use client'
import { type ReactNode, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import {
  Avatar,
  Button,
  Checkbox,
  Chip,
  CountBadge,
  DateBlock,
  IconButton,
  Logo,
  Note,
  ProgressSteps,
  Radio,
  Skeleton,
  Spinner,
  StatusPill,
  Tag,
  TextLink,
  Toggle,
  Typography,
} from '../atoms'
import {
  AvatarStack,
  Banner,
  Brand,
  ChatBubble,
  ChipGroup,
  ContentCard,
  EmptyState,
  EventCard,
  KwoteBadge,
  ListCard,
  ListRow,
  PageTitle,
  Pagination,
  ProfileCard,
  RoomCard,
  RoomStatusTimeline,
  ScreenHeader,
  Segmented,
  ShareBar,
  SkeletonCard,
  StatCard,
  Stepper,
  TextField,
  Section as TitledSection,
  Toast,
  VenueRow,
  XpBar,
} from '../molecules'
import {
  Accordion,
  BarChart,
  DataTable,
  type PlayerTab,
  PlayerTabBar,
  playerItems,
  Sidebar,
  SiteFooter,
  type Sort,
  TopNav,
  VenueTabBar,
} from '../organisms'
import { colors, font, space } from '../tokens'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 14 }}>
      <Typography variant="h2">{title}</Typography>
      {children}
    </View>
  )
}

function Row({ children }: { children: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      {children}
    </View>
  )
}

type Event = { id: string; name: string; date: string; seats: string; status: string }
const events: Event[] = [
  { id: '1', name: 'Tournoi Pioneer', date: 'ven. 18 oct.', seats: '12 / 16', status: 'ok' },
  { id: '2', name: 'Soirée Commander', date: 'sam. 19 oct.', seats: '8 / 8', status: 'warn' },
  { id: '3', name: 'Draft Duskmourn', date: 'mer. 23 oct.', seats: '3 / 8', status: 'info' },
]
const statusLabel: Record<string, string> = { ok: 'Ouvert', warn: 'Complet', info: 'Brouillon' }

/** Vitrine de tous les composants, utilisée par les routes /design-system du web et du mobile. */
export function Catalogue() {
  const [seg, setSeg] = useState(0)
  const [game, setGame] = useState<string | null>(null)
  const [chip, setChip] = useState(true)
  const [toggle, setToggle] = useState(true)
  const [check, setCheck] = useState(true)
  const [radio, setRadio] = useState(0)
  const [players, setPlayers] = useState(4)
  const [name, setName] = useState('')
  const [page, setPage] = useState(7)
  const [sort, setSort] = useState<Sort>({ key: 'date', dir: 'desc' })
  const [selected, setSelected] = useState<string[]>([])
  const [tab, setTab] = useState<PlayerTab>('explorer')

  return (
    <ScrollView
      style={{ flex: 1, width: '100%', backgroundColor: colors.cream }}
      contentContainerStyle={{ padding: space.screen, gap: 36, maxWidth: 1000 }}
    >
      <View style={{ gap: 8 }}>
        <Typography variant="display">Plateau pop</Typography>
        <Typography variant="small">
          Design system Kwatro : atomes, molécules, organismes, templates.
        </Typography>
      </View>

      <Section title="Atomes">
        <Row>
          <Typography variant="h1">Titre H1</Typography>
          <Typography variant="title">Titre de carte</Typography>
          <Typography variant="label">Label</Typography>
        </Row>
        <Row>
          <Button label="Rejoindre" />
          <Button label="Événement" kind="event" />
          <Button label="Lieu" kind="venue" />
          <Button label="Kwote" kind="kwote" />
          <Button label="Ink" kind="ink" />
          <Button label="Annuler" kind="ghost" />
          <Button label="Désactivé" disabled />
          <Button label="Petit" small />
        </Row>
        <Row>
          <Tag label="Classée" variant="ranked" />
          <Tag label="Normale" />
          <Tag label="Partenaire" variant="partner" />
          <Tag label="Ce soir" variant="tonight" />
          <Tag label="Event" variant="event" />
        </Row>
        <Row>
          <Chip label="Pioneer" active={chip} onPress={() => setChip(!chip)} />
          <Chip label="Commander" />
          <StatusPill label="Confirmée" tone="ok" />
          <StatusPill label="En attente" tone="warn" />
          <StatusPill label="Refusée" tone="err" />
          <StatusPill label="Brouillon" />
          <CountBadge count={3} />
          <CountBadge count={140} />
        </Row>
        <Row>
          <Avatar name="Léa" />
          <Avatar name="Max" color={colors.kwote} size={56} badge={<CountBadge count={2} />} />
          <IconButton label="Filtrer" icon={<Text style={font('body', 800)}>≡</Text>} />
          <IconButton
            label="Ajouter"
            bg={colors.kwote}
            icon={<Text style={font('body', 800)}>+</Text>}
          />
          <DateBlock day="18" month="OCT" />
          <DateBlock day="23" month="OCT" color={colors.room} />
          <Spinner />
        </Row>
        <Row>
          <Toggle label="Notifications" value={toggle} onChange={setToggle} />
          <Checkbox label="J'accepte les règles" value={check} onChange={setCheck} />
          <Radio label="Lieu partenaire" value={radio === 0} onPress={() => setRadio(0)} />
          <Radio label="Domicile" value={radio === 1} onPress={() => setRadio(1)} />
        </Row>
        <ProgressSteps current={2} total={4} />
        <Note>Les résultats sont comptés à la majorité des présents.</Note>
        <Note tone="room">Ce lieu est fermé ce soir : impossible d'y créer une room.</Note>
        <View style={{ gap: 8 }}>
          <Skeleton width="70%" />
          <Skeleton width="40%" height={10} />
        </View>
      </Section>

      <Section title="Molécules">
        <ScreenHeader title="Fiche room" onBack={() => {}} />
        <Segmented items={['Rooms', 'Événements', 'Lieux']} value={seg} onChange={setSeg} />
        <TextField
          label="Nom de la room"
          placeholder="Ex. Pioneer du jeudi"
          value={name}
          onChangeText={setName}
          help="Visible par les autres joueurs"
        />
        <TextField label="E-mail" value="lea@" error="Adresse e-mail incomplète" />
        <Row>
          <Stepper value={players} min={2} max={8} onChange={setPlayers} />
          <KwoteBadge value="1 184" reliability={96} />
          <KwoteBadge value="1 184" large />
        </Row>
        <XpBar level={7} name="Habitué" current={340} max={500} />
        <ContentCard kind="room" raised>
          <Typography variant="title">Pioneer du jeudi</Typography>
          <Typography variant="small">La Taverne du Dé · 20 h 30 · 3 places</Typography>
          <Row>
            <Tag label="Classée" variant="ranked" />
            <Tag label="Partenaire" variant="partner" />
          </Row>
        </ContentCard>
        <View>
          <ListRow left={<Avatar name="Léa" />} title="Léa" subtitle="Pioneer · ◆ 1 240" />
          <ListRow
            left={<Avatar name="Max" color={colors.venue} />}
            title="Max"
            subtitle="Commander"
            last
          />
        </View>
        <RoomStatusTimeline current={2} />
        <Row>
          <View style={{ flex: 1, minWidth: 160 }}>
            <StatCard value="42" label="Joueurs ce soir" delta={{ text: '12 %', up: true }} />
          </View>
          <View style={{ flex: 1, minWidth: 160 }}>
            <StatCard value="7" label="Événements" bg={colors.event} />
          </View>
        </Row>
        <ShareBar label="Pioneer" percent={46} color={colors.room} />
        <Banner message="Ta room commence dans 1 h." action="Voir" onClose={() => {}} />
        <Toast message="Candidature envoyée" action="Annuler" />
        <View style={{ gap: 8 }}>
          <ChatBubble author="Léa" text="Je ramène mon deck Mono-rouge !" />
          <ChatBubble mine text="Parfait, on se retrouve à 20 h." />
        </View>
        <EmptyState
          icon={<Text style={{ ...font('display'), fontSize: 24 }}>?</Text>}
          title="Aucune room ce soir"
          text="Crée la tienne : les joueurs du coin seront prévenus."
          action={<Button label="Créer une room" small />}
        />
        <SkeletonCard />
        <Brand />
        <PageTitle eyebrow="Samedi 3 octobre · Bordeaux" title="Ce soir près de toi" />
        <ChipGroup
          items={[
            { key: null, label: 'Tous' },
            { key: 'magic', label: 'Magic' },
            { key: 'pokemon', label: 'Pokémon' },
          ]}
          value={game}
          onChange={setGame}
        />
        <TitledSection title="Soirées ce soir" link="Tout le programme" onLink={() => {}}>
          <EventCard
            wide
            raised
            day="03"
            time="19H30"
            label="Soirée jeux · Magic"
            title="Soirée Commander"
            meta="Le Dé Fêlé · 1,2 km"
            places="4 places sur 12"
            partner
            action={<Button small label="S'inscrire" />}
          />
          <EventCard
            day="03"
            time="20H"
            label="Tournoi · Pokémon"
            title="Tournoi Standard"
            meta="Carte Blanche · 800 m"
            places="2 places sur 16"
            onPress={() => {}}
          />
        </TitledSection>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
          <View style={{ width: 300 }}>
            <RoomCard
              wide
              label="Partie classée · Pokémon"
              title="Il manque 2 joueurs"
              meta="Le Dé Fêlé · 21 h"
              players={['M', 'S']}
              capacity={4}
              kwote="1 180 – 1 260"
              onPress={() => {}}
            />
          </View>
          <View style={{ width: 300 }}>
            <ProfileCard
              pseudo="Léa"
              format="Commander"
              kwote="1 214"
              xp={{ level: 4, name: 'Pilier de table', current: 340, max: 500 }}
            />
          </View>
        </View>
        <AvatarStack names={['T', 'A', 'J']} />
        <ListCard>
          <VenueRow
            inset={16}
            name="Le Dé Fêlé"
            subtitle="Bar à jeux · jusqu'à 1 h"
            distance="1,2 km"
            partner
            perk="Droit de jeu offert avec Kwatro"
            onPress={() => {}}
          />
          <VenueRow
            inset={16}
            last
            name="Carte Blanche"
            subtitle="Boutique TCG · jusqu'à 22 h"
            distance="800 m"
            onPress={() => {}}
          />
        </ListCard>
      </Section>

      <Section title="Organismes">
        <DataTable<Event>
          columns={[
            { key: 'name', label: 'Événement', flex: 2 },
            { key: 'date', label: 'Date', sortable: true },
            { key: 'seats', label: 'Places', mono: true, align: 'right' },
            {
              key: 'status',
              label: 'Statut',
              render: (r) => (
                <StatusPill
                  label={statusLabel[r.status] ?? r.status}
                  tone={r.status as 'ok' | 'warn' | 'info'}
                />
              ),
            },
          ]}
          rows={events}
          sort={sort}
          onSort={setSort}
          selectable
          selected={selected}
          onSelect={setSelected}
          bulkActions={<Button label="Publier" kind="kwote" small />}
          footer={<Pagination page={page} pages={20} total={58} perPage={3} onChange={setPage} />}
        />
        <BarChart
          data={[
            { label: 'Lun', value: 4 },
            { label: 'Mar', value: 7 },
            { label: 'Mer', value: 5 },
            { label: 'Jeu', value: 12 },
            { label: 'Ven', value: 9 },
          ]}
          highlight={[3]}
        />
        <Accordion
          items={[
            { q: 'Comment marche la Kwote ?', a: 'Elle mesure ta force par format TCG.' },
            { q: "Et l'XP ?", a: "Elle récompense l'assiduité, pas la victoire." },
          ]}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Logo size={44} />
          <TextLink label="Tout le programme" onPress={() => {}} />
        </View>
        <TopNav
          items={playerItems}
          active={tab}
          onSelect={(key) => setTab(key as PlayerTab)}
          right={<Button small kind="kwote" label="+ Créer une room" />}
        />
        <View style={{ maxWidth: 420, width: '100%', gap: 12 }}>
          <PlayerTabBar active={tab} onSelect={setTab} onCreate={() => {}} bottomInset={10} />
          <VenueTabBar active="scanner" onSelect={() => {}} bottomInset={10} />
        </View>
        <View style={{ height: 320, flexDirection: 'row' }}>
          <Sidebar
            title="Espace lieu"
            active="ce-soir"
            onSelect={() => {}}
            items={[
              { key: 'ce-soir', label: 'Ce soir', badge: '3' },
              { key: 'evenements', label: 'Événements' },
              { key: 'pointage', label: 'Pointage' },
              { key: 'factures', label: 'Factures', later: true },
            ]}
          />
        </View>
        <SiteFooter compact={false} />
        <View style={{ maxWidth: 420, width: '100%' }}>
          <SiteFooter compact />
        </View>
      </Section>

      <Section title="Templates">
        <Typography variant="small">
          MobileScreen (écran mobile : en-tête, contenu, pied, onglets), WebScreen (web à barre du
          haut : accueil, connexion) et WebSidebarLayout (espace lieu, admin) : voir
          packages/design-system/README.md.
        </Typography>
      </Section>
    </ScrollView>
  )
}
