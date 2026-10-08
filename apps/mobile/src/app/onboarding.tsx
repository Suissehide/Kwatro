import {
  Button,
  colors,
  font,
  GameTile,
  MobileScreen,
  Note,
  RadiusMap,
  Segmented,
  SkeletonCard,
  StepHeader,
  StepsAside,
  TextField,
  TextLink,
  Typography,
} from '@lucko/design-system'
import { DEFAULT_CITY, type Game, type Me, RADIUS_KM } from '@lucko/shared'
import { useStore } from '@tanstack/react-form'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { type ReactNode, useEffect, useState } from 'react'
import { ScrollView, Text, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { IdentityFields } from '@/components/profile/IdentityFields'
import { WIDE } from '@/components/StepFrame'
import { profileBody, profileDefaults, profileFormOpts } from '@/forms/profile.form'
import { useAppForm } from '@/hooks/formConfig'
import { track } from '@/lib/analytics'
import { type CityValue, validateCity } from '@/lib/city'
import { nearbyLabel, onboarding, splitCatalog } from '@/lib/onboarding'
import { gameColor } from '@/lib/profile'
import { ApiError } from '@/lib/queryClient'
import { nearbyCountQueryOptions } from '@/queries/useExplore'
import { useGamesQuery } from '@/queries/useGames'
import { citySearchQueryOptions } from '@/queries/useGeocode'
import { useMeMutations, useMeQuery } from '@/queries/useMe'
import { useMyGamesMutations, useMyGamesQuery } from '@/queries/useMyGames'

const STEPS = ['Tes jeux', 'Ta ville', 'Ton pseudo']
type Step = 0 | 1 | 2

const TEXTS = [
  {
    title: 'À quoi tu joues ?',
    subtitle:
      'Choisis un ou plusieurs jeux. On te montre d’abord les rooms et soirées qui y correspondent.',
  },
  { title: 'Tu joues où ?', subtitle: 'Une ville et un rayon suffisent.' },
  {
    title: 'Ton pseudo',
    subtitle: 'Dernière question. C’est le nom que verront les autres joueurs.',
  },
] as const
const RADII = [3, 10, 25, 50]

const useWide = () => useWindowDimensions().width >= WIDE

const finish = () => {
  track('onboarding_done')
  router.replace('/')
}

/**
 * Onboarding après la création du compte (LKO-47) : jeux, ville et rayon, pseudo. Chaque étape est
 * enregistrée en la quittant : à la réouverture, on reprend à la première étape non faite.
 */
export default function OnboardingScreen() {
  const me = useMeQuery({ required: true })
  const myGames = useMyGamesQuery()
  const [step, setStep] = useState<Step | null>(null)

  useEffect(() => {
    if (step !== null || !me || !myGames.isFetched) return
    const start = !myGames.data?.gameIds.length ? 0 : me.city ? 2 : 1
    track('onboarding_start', { step: start + 1 })
    setStep(start)
  }, [step, me, myGames.isFetched, myGames.data])

  useEffect(() => {
    if (step !== null) track('onboarding_step', { step: step + 1 })
  }, [step])

  // Le panneau desktop ne rouvre que des étapes déjà faites (0 à 2)
  const goTo = (i: number) => setStep(i as Step)

  if (!me || step === null) return <View style={{ flex: 1, backgroundColor: colors.cream }} />
  if (step === 0) return <GamesStep onDone={() => setStep(1)} />
  if (step === 1)
    return <WhereStep me={me} onBack={() => setStep(0)} goTo={goTo} onDone={() => setStep(2)} />
  return <PseudoStep me={me} onBack={() => setStep(1)} goTo={goTo} />
}

/** Cadre d'une étape. Téléphone : en-tête, contenu défilant, pied fixe. Desktop : panneau noir à gauche. */
function StepShell({
  step,
  onBack,
  goTo,
  cta,
  skip,
  children,
}: {
  step: Step
  onBack?: () => void
  goTo?: (step: number) => void
  cta: { label: string; disabled?: boolean; onPress: () => void }
  skip?: { label: string; onPress: () => void }
  children: ReactNode
}) {
  const wide = useWide()
  const insets = useSafeAreaInsets()
  const { title, subtitle } = TEXTS[step]
  const button = <Button label={cta.label} disabled={cta.disabled} onPress={cta.onPress} />
  const skipLink = skip ? <TextLink muted label={skip.label} onPress={skip.onPress} /> : null

  if (!wide)
    return (
      <MobileScreen
        siteFooter={false}
        insets={insets}
        header={
          <StepHeader
            current={step + 1}
            total={STEPS.length}
            title={title}
            subtitle={subtitle}
            onBack={onBack}
          />
        }
        footer={
          <>
            {button}
            {skipLink ? <View style={{ alignSelf: 'center' }}>{skipLink}</View> : null}
          </>
        }
      >
        {children}
      </MobileScreen>
    )

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.cream }}>
      <StepsAside
        title="Trois questions et on te montre où jouer ce soir."
        subtitle="Tu pourras tout changer plus tard dans ton profil."
        steps={STEPS}
        current={step}
        onSelect={goTo}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 56, paddingHorizontal: 64, gap: 22 }}
      >
        <Typography variant="label">
          {step + 1} / {STEPS.length}
        </Typography>
        <Text
          role="heading"
          style={{
            ...font('display'),
            fontSize: 40,
            lineHeight: 40,
            textTransform: 'uppercase',
            color: colors.ink,
          }}
        >
          {title}
        </Text>
        <Text style={{ ...font('body', 400), fontSize: 17, lineHeight: 25, color: colors.muted }}>
          {subtitle}
        </Text>
        {children}
        <View style={{ flex: 1 }} />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {skipLink ?? <View />}
          {button}
        </View>
      </ScrollView>
    </View>
  )
}

/** Grille de `columns` colonnes égales ; la dernière ligne garde la largeur des autres. */
function Grid({ columns, children }: { columns: number; children: ReactNode[] }) {
  const rows: ReactNode[][] = []
  for (let i = 0; i < children.length; i += columns) rows.push(children.slice(i, i + columns))
  const gap = columns > 2 ? 12 : 10
  return (
    <View style={{ gap }}>
      {rows.map((row, r) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: lignes recalculées, sans identité propre
        <View key={r} style={{ flexDirection: 'row', gap }}>
          {Array.from({ length: columns }, (_, c) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: case à position fixe dans la ligne
            <View key={c} style={{ flex: 1 }}>
              {row[c] ?? null}
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}

/** 1 / 3 : jeux joués, sans niveau (il se règle plus tard dans le profil). */
function GamesStep({ onDone }: { onDone: () => void }) {
  const wide = useWide()
  const catalog = useGamesQuery().data
  const saved = useMyGamesQuery().data
  const { setMyGames } = useMyGamesMutations()
  const [selected, setSelected] = useState<string[]>(() => saved?.gameIds ?? [])
  const [search, setSearch] = useState<string | null>(null)
  const [error, setError] = useState<string>()

  const toggle = (id: string) =>
    setSelected((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))

  const save = async () => {
    if (!catalog) return
    setError(undefined)
    // Niveaux déjà déclarés (profil) : gardés pour les jeux toujours cochés
    const formatIds = new Set(
      catalog.filter((g) => selected.includes(g.id)).flatMap((g) => g.formats.map((f) => f.id)),
    )
    try {
      await setMyGames.mutateAsync({
        gameIds: selected,
        formats: (saved?.formats ?? []).filter((f) => formatIds.has(f.formatId)),
      })
      onDone()
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 400
          ? e.message
          : 'Impossible d’enregistrer tes jeux pour l’instant. Réessaie.',
      )
    }
  }

  const later = () => {
    onboarding.deferred = true
    track('onboarding_later')
    router.replace('/')
  }

  const { featured, others } = splitCatalog(catalog ?? [])
  const query = search?.trim().toLowerCase() ?? ''
  // Un jeu coché depuis la recherche rejoint la grille
  const shown = [...featured, ...others.filter((g) => selected.includes(g.id))]
  const found = others.filter(
    (g) => !selected.includes(g.id) && g.name.toLowerCase().includes(query),
  )
  const tile = (g: Game) => (
    <GameTile
      key={g.id}
      large={wide}
      label={g.name}
      color={gameColor(g.slug)}
      selected={selected.includes(g.id)}
      onPress={() => toggle(g.id)}
    />
  )
  const columns = wide ? 3 : 2

  return (
    <StepShell
      step={0}
      cta={{
        label: selected.length ? 'Continuer' : 'Choisis au moins un jeu',
        disabled: !selected.length || setMyGames.isPending,
        onPress: () => void save(),
      }}
      skip={{ label: 'Je regarde d’abord', onPress: later }}
    >
      {catalog ? (
        <Grid columns={columns}>
          {[
            ...shown.map(tile),
            <GameTile
              key="other"
              large={wide}
              label="Autre jeu…"
              color={colors.white}
              selected={search !== null}
              onPress={() => setSearch((s) => (s === null ? '' : null))}
            />,
          ]}
        </Grid>
      ) : (
        <SkeletonCard />
      )}
      {search !== null ? (
        <>
          <TextField
            label="Chercher un jeu"
            placeholder="Nom du jeu"
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
          {found.length ? (
            <Grid columns={columns}>{found.map(tile)}</Grid>
          ) : (
            <Typography variant="small">Aucun autre jeu ne correspond.</Typography>
          )}
        </>
      ) : null}
      {error ? <Note tone="room">{error}</Note> : null}
    </StepShell>
  )
}

const requireCity = ({ value }: { value: CityValue }) =>
  value.name.trim() ? undefined : 'Saisis ta ville, ou passe cette étape.'

/** 2 / 3 : ville (saisie ou position) et rayon. « Passer » garde Bordeaux et 10 km. */
function WhereStep({
  me,
  onBack,
  goTo,
  onDone,
}: {
  me: Me
  onBack: () => void
  goTo: (step: number) => void
  onDone: () => void
}) {
  const wide = useWide()
  const { updateProfile } = useMeMutations()
  const form = useAppForm({
    ...profileFormOpts,
    defaultValues: profileDefaults(me),
    onSubmit: async ({ value, formApi }) => {
      try {
        const { city, latitude, longitude, searchRadiusKm } = await profileBody(value)
        await updateProfile.mutateAsync({ city, latitude, longitude, searchRadiusKm })
        onDone()
      } catch {
        formApi.setErrorMap({
          onSubmit: { form: 'Impossible d’enregistrer pour l’instant. Réessaie.', fields: {} },
        })
      }
    },
  })
  const submitting = useStore(form.store, (s) => s.isSubmitting)
  const city = useStore(form.store, (s) => s.values.city)
  const radiusKm = useStore(form.store, (s) => s.values.searchRadiusKm)

  const skip = async () => {
    if (!me.city)
      await updateProfile
        .mutateAsync({
          city: DEFAULT_CITY.name,
          latitude: DEFAULT_CITY.lat,
          longitude: DEFAULT_CITY.lng,
          searchRadiusKm: RADIUS_KM.default,
        })
        .catch(() => undefined)
    onDone()
  }

  return (
    <StepShell
      step={1}
      onBack={onBack}
      goTo={goTo}
      cta={{
        label: 'Continuer',
        disabled: submitting || updateProfile.isPending,
        onPress: () => void form.handleSubmit(),
      }}
      skip={{ label: 'Passer', onPress: () => void skip() }}
    >
      <form.AppField
        name="city"
        validators={{ onSubmit: requireCity, onSubmitAsync: validateCity }}
      >
        {(field) => <field.City locateButton={!wide} />}
      </form.AppField>
      <form.AppField name="searchRadiusKm">
        {(field) => (
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Typography variant="label">Rayon</Typography>
              <Text style={{ ...font('mono', 700), fontSize: 15, color: colors.ink }}>
                {field.state.value} km
              </Text>
            </View>
            <Segmented
              items={RADII.map((r) => `${r} km`)}
              value={RADII.indexOf(field.state.value)}
              onChange={(i) => field.handleChange(RADII[i] ?? RADIUS_KM.default)}
              color={colors.rating}
            />
          </View>
        )}
      </form.AppField>
      <Nearby city={city} radiusKm={radiusKm} wide={wide} />
      <Typography variant="small">
        Ta position exacte n’est jamais montrée aux autres joueurs.
      </Typography>
      <form.AppForm>
        <form.FormError />
      </form.AppForm>
    </StepShell>
  )
}

/** Lieux et soirées dans le rayon : carte sur téléphone, simple ligne sur desktop. */
function Nearby({ city, radiusKm, wide }: { city: CityValue; radiusKm: number; wide: boolean }) {
  const [name, setName] = useState(city.name.trim())
  useEffect(() => {
    const timer = setTimeout(() => setName(city.name.trim()), 400)
    return () => clearTimeout(timer)
  }, [city.name])

  const typed = useQuery({
    ...citySearchQueryOptions(name),
    enabled: city.lat === null && name.length >= 2,
  })
  const center =
    city.lat !== null && city.lng !== null
      ? { lat: city.lat, lng: city.lng }
      : name
        ? (typed.data ?? null)
        : DEFAULT_CITY
  const count = useQuery({
    ...nearbyCountQueryOptions(center?.lat ?? 0, center?.lng ?? 0, radiusKm),
    enabled: center !== null,
    placeholderData: keepPreviousData,
  })
  const label = center && count.data ? nearbyLabel(count.data) : null

  if (!wide) return <RadiusMap radiusKm={radiusKm} label={label} />
  return label ? (
    <Text style={{ ...font('body', 600), fontSize: 14, color: colors.ink }}>{label}</Text>
  ) : null
}

/** 3 / 3 : pseudo public (photo facultative). */
function PseudoStep({
  me,
  onBack,
  goTo,
}: {
  me: Me
  onBack: () => void
  goTo: (step: number) => void
}) {
  const { updateProfile } = useMeMutations()
  const form = useAppForm({
    ...profileFormOpts,
    defaultValues: profileDefaults(me),
    onSubmit: async ({ value, formApi }) => {
      try {
        await updateProfile.mutateAsync({ pseudo: value.pseudo.trim() })
        finish()
      } catch (error) {
        formApi.setErrorMap({
          onSubmit:
            error instanceof ApiError && error.status === 409
              ? { fields: { pseudo: 'Ce pseudo est déjà pris. Essaie une variante.' } }
              : {
                  form: 'Impossible d’enregistrer ton pseudo pour l’instant. Réessaie.',
                  fields: {},
                },
        })
      }
    },
  })
  const submitting = useStore(form.store, (s) => s.isSubmitting)

  return (
    <StepShell
      step={2}
      onBack={onBack}
      goTo={goTo}
      cta={{
        label: 'Voir où jouer ce soir',
        disabled: submitting,
        onPress: () => void form.handleSubmit(),
      }}
    >
      <IdentityFields
        form={form}
        compact
        autoFocus
        avatarUri={me.avatarUrl}
        avatarStatus={me.avatarStatus}
      />
      <form.AppForm>
        <form.FormError />
      </form.AppForm>
    </StepShell>
  )
}
