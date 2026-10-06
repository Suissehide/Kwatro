'use client'

import { CircleHelp, Plus, SlidersHorizontal } from 'lucide-react-native'
import { type ReactNode, useState } from 'react'
import { ScrollView, View } from 'react-native'
import {
  Avatar,
  Button,
  Checkbox,
  Chip,
  CountBadge,
  DateBlock,
  IconButton,
  InfoChip,
  Logo,
  Note,
  ProgressSteps,
  Radio,
  Skeleton,
  Slider,
  Spinner,
  StatusPill,
  Tag,
  TextLink,
  Toggle,
  Typography,
} from '../atoms'
import {
  AccessibilityList,
  AgendaCard,
  AgendaEventCard,
  AvailabilityGrid,
  AvatarStack,
  Banner,
  Brand,
  CardFan,
  ChatBubble,
  ChatComposer,
  ChatDivider,
  ChipGroup,
  ClosureRow,
  ContentCard,
  DayEventRow,
  EmptyState,
  EventCard,
  FactCard,
  HoursCard,
  KwoteBadge,
  LevelCard,
  ListCard,
  ListRow,
  OptionCard,
  PageTitle,
  Pagination,
  Panel,
  PerkBanner,
  ProfileCard,
  ProfileIdentity,
  RankCard,
  RankRow,
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
  ToggleGroup,
  VenueRow,
  XpBar,
} from '../molecules'
import {
  Accordion,
  BarChart,
  DataTable,
  MonthCalendar,
  type PlayerTab,
  PlayerTabBar,
  playerNavItems,
  Sidebar,
  SiteFooter,
  type Sort,
  TopNav,
  VenueTabBar,
} from '../organisms'
import { colors, space } from '../tokens'

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
  const [radiusKm, setRadiusKm] = useState(10)
  const [slots, setSlots] = useState([5, 11, 14, 17])
  const [vibe, setVibe] = useState(true)

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
          <IconButton
            label="Filtrer"
            icon={<SlidersHorizontal size={18} color={colors.ink} strokeWidth={2.5} />}
          />
          <IconButton
            label="Ajouter"
            bg={colors.kwote}
            icon={<Plus size={20} color={colors.ink} strokeWidth={2.5} />}
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
        <Slider label="Rayon" value={radiusKm} min={1} max={50} onChange={setRadiusKm} />
        <Panel title="Disponibilités">
          <AvailabilityGrid
            value={slots}
            onToggle={(s) =>
              setSlots((list) => (list.includes(s) ? list.filter((x) => x !== s) : [...list, s]))
            }
          />
        </Panel>
        <OptionCard
          label="Détente"
          description="On joue pour le plaisir, sans pression."
          value={vibe}
          onChange={setVibe}
        />
        <ProfileIdentity
          pseudo="Léa"
          place="Bordeaux · 10 km"
          vibes={['Détente', 'Compétitif']}
          xp={{ level: 4, name: 'Pilier de table', current: 340, max: 500 }}
        />
        <View style={{ width: 380 }}>
          <LevelCard level={4} name="Pilier de table" current={340} max={500} />
        </View>
        <Row>
          <View style={{ width: 240 }}>
            <RankCard
              color={colors.room}
              game="Magic"
              format="Commander"
              kwote="1 214"
              note="38 parties classées"
            />
          </View>
          <View style={{ width: 240 }}>
            <RankCard
              color={colors.venue}
              game="One Piece"
              format="Standard"
              kwote={null}
              progress="3 / 5"
              note="Encore 2 parties classées avant ta première Kwote"
            />
          </View>
        </Row>
        <ListCard>
          <RankRow
            color={colors.event}
            game="Lorcana"
            format="Core"
            kwote="1 310"
            note="12 parties"
            last
          />
        </ListCard>
        <AgendaCard
          wide
          color={colors.event}
          day="06"
          month="OCT"
          label="Soirée jeux · Magic"
          title="Soirée Commander"
          meta="Le Dé Fêlé · 19 h 30"
          count="8/12"
          status={<StatusPill label="Place réservée" tone="ok" />}
          onPress={() => {}}
        />
        <AgendaCard
          color={colors.room}
          day="04"
          month="OCT"
          label="Room classée · Pokémon"
          title="Standard à 4"
          meta="Carte Blanche · 21 h"
          count="3/4"
          status={<StatusPill label="Il manque 1 joueur" tone="warn" />}
        />
        <ContentCard kind="room" raised>
          <Typography variant="title">Pioneer du jeudi</Typography>
          <Typography variant="small">La Taverne du Dé · 20 h 30 · 3 places</Typography>
          <Row>
            <Tag label="Classée" variant="ranked" />
            <Tag label="Partenaire" variant="partner" />
          </Row>
        </ContentCard>
        <View>
          <ListRow left={<Avatar name="Léa" />} title="Léa" subtitle="Pioneer · Kwote 1 240" />
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
          <ChatBubble
            announcement
            author="Fêlé"
            time="19:02"
            text="Ronde 1 lancée, tables 1 à 6."
          />
          <ChatBubble author="Léa" time="19:40" text="Je ramène mon deck Mono-rouge !" />
          <ChatDivider label="Nouveaux messages" />
          <ChatBubble mine time="19:41" text="Parfait, on se retrouve à 20 h." onPress={() => {}} />
          <ChatBubble mine pending text="J'arrive 🃏" />
          <ChatComposer value="" onChange={() => {}} onSend={() => {}} status="Léa écrit…" />
        </View>
        <EmptyState
          icon={<CircleHelp size={28} color={colors.ink} strokeWidth={2.5} />}
          title="Aucune room ce soir"
          text="Crée la tienne : les joueurs du coin seront prévenus."
          action={<Button label="Créer une room" small />}
        />
        <SkeletonCard />
        <CardFan size="sm" />
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
        <Row>
          <FactCard label="Droit de jeu" value="5 €" note="par personne, toute la soirée" />
          <FactCard label="Âge" value="16 ans +" compact />
        </Row>
        <PerkBanner text="Droit de jeu offert sur présentation de l'app" />
        <ToggleGroup items={['Liste', 'Calendrier']} value={0} onChange={() => {}} />
        <AgendaEventCard
          wide
          kind="room"
          weekday="SAM"
          day="07"
          month="OCT"
          label="Tournoi · Pokémon"
          title="Tournoi Standard"
          meta="19 h 30 · 8 €"
          places="2 places sur 16"
          placesAlert
          action={<Button small label="S'inscrire" />}
          onPress={() => {}}
        />
        <HoursCard
          title="Horaires"
          status="Ouvert"
          rows={[
            { day: 'Lundi', value: 'Fermé', closed: true },
            { day: 'Samedi', value: '14 h – 2 h', today: true },
          ]}
        />
        <ClosureRow date="1er nov." label="Fermé (Toussaint)" note="Réouverture le 2 novembre" />
        <ClosureRow date="11 nov." label="Ouverture à 14 h" special />
        <AccessibilityList
          columns={2}
          items={[
            { label: 'Accès de plain-pied', status: 'yes' },
            { label: "Salle à l'étage", note: 'Escalier uniquement', status: 'no' },
            { label: 'Niveau sonore', note: 'Animé le samedi soir', status: 'info' },
          ]}
        />
        <Row>
          <InfoChip label="Cascadia" />
          <InfoChip label="+ 290 autres" muted />
        </Row>
      </Section>

      <Section title="Organismes">
        <MonthCalendar
          title="Octobre 2026"
          days={Array.from({ length: 35 }, (_, i) => ({
            key: String(i),
            day: i < 3 || i > 33 ? null : i - 2,
            today: i === 5,
            past: i < 5,
            closed: i % 7 === 0,
            items: i === 9 ? [{ label: 'Tournoi Pokémon', color: colors.room }] : [],
          }))}
          selected="9"
          onSelect={() => {}}
          onNext={() => {}}
          dayTitle="Mercredi 7 octobre"
          legend={[
            { label: 'Soirée', color: colors.event },
            { label: 'Tournoi', color: colors.room },
          ]}
        >
          <DayEventRow
            color={colors.room}
            label="19 h 30 · Tournoi · Pokémon"
            title="Tournoi Standard"
            meta="8 € · 2 places sur 16"
            metaAlert
          />
        </MonthCalendar>
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
          items={playerNavItems}
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
