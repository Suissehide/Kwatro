import {
  AvailabilityGrid,
  Banner,
  Button,
  Chip,
  ConfirmDialog,
  OptionCard,
  Panel,
  ScreenHeader,
  SkeletonCard,
  TextLink,
  Typography,
} from '@kwatro/design-system'
import { type Me, PLAY_VIBE_LABELS, PLAY_VIBES, type PlayVibe, pseudoSchema } from '@kwatro/shared'
import { router, useNavigation } from 'expo-router'
import { usePreventRemove } from 'expo-router/react-navigation'
import { type ReactNode, useEffect, useState } from 'react'
import { useWindowDimensions, View } from 'react-native'
import { PlayerScreen } from '@/components/PlayerScreen'
import { IdentityFields } from '@/components/profile/IdentityFields'
import { WhereFields } from '@/components/profile/WhereFields'
import { visibleAvatar } from '@/lib/profile'
import { ApiError } from '@/lib/queryClient'
import { useCityField } from '@/lib/useCityField'
import { useMeMutations, useMeQuery } from '@/queries/useMe'

const WIDE = 900

const backToProfile = () => (router.canGoBack() ? router.back() : router.replace('/profile'))

/** Modifier le profil (F3) : pseudo, prénom et nom privés, ville et rayon, disponibilités, ambiance. */
export default function EditProfileScreen() {
  const wide = useWindowDimensions().width >= WIDE
  const me = useMeQuery({ required: true })
  if (me) return <EditForm me={me} wide={wide} />
  return (
    <PlayerScreen
      tab="profil"
      wide={wide}
      pushed
      header={<ScreenHeader title="Modifier" onBack={backToProfile} />}
    >
      <SkeletonCard />
    </PlayerScreen>
  )
}

function EditForm({ me, wide }: { me: Me; wide: boolean }) {
  const navigation = useNavigation()
  const { updateProfile } = useMeMutations()
  const initial = {
    pseudo: me.pseudo ?? '',
    name: me.name,
    city: me.city ?? '',
    radius: me.searchRadiusKm,
    availability: me.availability,
    vibes: me.vibes,
  }
  const [saved, setSaved] = useState(JSON.stringify(initial))
  const [pseudo, setPseudo] = useState(initial.pseudo)
  const [name, setName] = useState(initial.name)
  const cityField = useCityField(me)
  const [radius, setRadius] = useState(initial.radius)
  const [availability, setAvailability] = useState(initial.availability)
  const [vibes, setVibes] = useState(initial.vibes)
  const [pseudoError, setPseudoError] = useState<string>()
  const [failed, setFailed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [leaving, setLeaving] = useState<(() => void) | null>(null)

  const draft = { pseudo, name, city: cityField.city, radius, availability, vibes }
  const dirty = JSON.stringify(draft) !== saved

  usePreventRemove(dirty, ({ data }) => setLeaving(() => () => navigation.dispatch(data.action)))
  // Une fois enregistré (dirty repassé à false), on peut revenir au profil
  useEffect(() => {
    if (done) backToProfile()
  }, [done])

  const toggleSlot = (slot: number) =>
    setAvailability((slots) =>
      slots.includes(slot)
        ? slots.filter((s) => s !== slot)
        : [...slots, slot].sort((a, b) => a - b),
    )
  const toggleVibe = (vibe: PlayVibe) =>
    setVibes((list) => (list.includes(vibe) ? list.filter((v) => v !== vibe) : [...list, vibe]))

  const save = async () => {
    const parsed = pseudoSchema.safeParse(pseudo)
    if (!parsed.success) return setPseudoError(parsed.error.issues[0]?.message)
    setBusy(true)
    setFailed(false)
    const place = await cityField.resolve()
    if (!place) return setBusy(false)
    const result = await updateProfile
      .mutateAsync({
        pseudo: parsed.data,
        name,
        ...place,
        searchRadiusKm: radius,
        availability,
        vibes,
      })
      .catch((error: unknown) => error)
    setBusy(false)
    if (result instanceof ApiError && result.status === 409)
      return setPseudoError('Ce pseudo est déjà pris.')
    if (result instanceof Error) return setFailed(true)
    const data = result as Me
    setSaved(JSON.stringify({ ...draft, pseudo: data.pseudo ?? '', city: data.city ?? '' }))
    setDone(true)
  }

  const identity = (
    <IdentityFields
      compact={!wide}
      pseudo={pseudo}
      onPseudo={(v) => {
        setPseudo(v)
        setPseudoError(undefined)
      }}
      pseudoError={pseudoError}
      avatarUri={visibleAvatar(me)}
      avatarStatus={me.avatarStatus}
      name={name}
      onName={setName}
    />
  )
  const where = (
    <WhereFields compact={!wide} cityField={cityField} radius={radius} onRadius={setRadius} />
  )
  const slotCount = (
    <Typography variant="label">
      {availability.length} créneau{availability.length > 1 ? 'x' : ''}
    </Typography>
  )
  const error = failed ? (
    <Banner tone="err" message="L’enregistrement a échoué. Réessaie dans un instant." />
  ) : null
  const confirm = (
    <ConfirmDialog
      visible={!!leaving}
      title={'Quitter sans enregistrer\u00a0?'}
      message="Tes modifications seront perdues."
      confirmLabel="Quitter"
      cancelLabel="Rester"
      onConfirm={() => {
        const go = leaving
        setLeaving(null)
        go?.()
      }}
      onCancel={() => setLeaving(null)}
    />
  )

  if (!wide) {
    return (
      <PlayerScreen
        tab="profil"
        wide={false}
        pushed
        header={
          <ScreenHeader
            title="Modifier"
            onBack={backToProfile}
            right={
              <Button
                small
                kind={dirty ? 'room' : 'ghost'}
                label="Enregistrer"
                disabled={busy}
                onPress={() => void save()}
              />
            }
          />
        }
      >
        {error}
        <Panel compact>{identity}</Panel>
        <Typography variant="h2">Où tu joues</Typography>
        <Panel compact>{where}</Panel>
        <Heading title="Disponibilités" right={slotCount} />
        <AvailabilityGrid compact value={availability} onToggle={toggleSlot} />
        <Typography variant="h2">Ambiance</Typography>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {PLAY_VIBES.map((vibe) => (
            <Chip
              key={vibe}
              tall
              label={PLAY_VIBE_LABELS[vibe].label}
              active={vibes.includes(vibe)}
              onPress={() => toggleVibe(vibe)}
            />
          ))}
        </View>
        {confirm}
      </PlayerScreen>
    )
  }

  return (
    <PlayerScreen tab="profil" wide pseudo={me.pseudo}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 24 }}>
        <View style={{ flex: 1, minWidth: 0, gap: 12, alignItems: 'flex-start' }}>
          <TextLink label="← Profil" onPress={backToProfile} />
          <Typography variant="hero">Modifier le profil</Typography>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          {dirty ? <Typography variant="small">Modifications non enregistrées</Typography> : null}
          <Button label="Enregistrer" disabled={busy} onPress={() => void save()} />
        </View>
      </View>
      {error}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 40 }}>
        <View style={{ flex: 5, minWidth: 0, gap: 40 }}>
          <Panel title="Identité">{identity}</Panel>
          <Panel title="Où tu joues">{where}</Panel>
        </View>
        <View style={{ flex: 7, minWidth: 0, gap: 40 }}>
          <Panel title="Disponibilités" right={slotCount}>
            <Typography variant="small">
              Touche les créneaux où tu peux jouer. On te propose les rooms et soirées qui tombent
              dedans.
            </Typography>
            <AvailabilityGrid value={availability} onToggle={toggleSlot} />
            <Typography variant="label">
              Matin 9 h – 12 h · Après-midi 12 h – 18 h · Soir 18 h – minuit
            </Typography>
          </Panel>
          <Panel title="Ambiance">
            <Typography variant="small">
              Comment tu aimes jouer. Affiché sur ton profil et utilisé pour te proposer des tables.
            </Typography>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {PLAY_VIBES.map((vibe) => (
                <View key={vibe} style={{ width: '48%', flexGrow: 1 }}>
                  <OptionCard
                    {...PLAY_VIBE_LABELS[vibe]}
                    value={vibes.includes(vibe)}
                    onChange={() => toggleVibe(vibe)}
                  />
                </View>
              ))}
            </View>
          </Panel>
        </View>
      </View>
      {confirm}
    </PlayerScreen>
  )
}

function Heading({ title, right }: { title: string; right: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Typography variant="h2">{title}</Typography>
      {right}
    </View>
  )
}
