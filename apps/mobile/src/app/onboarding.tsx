import { Button, Note, Typography } from '@kwatro/design-system'
import { type Me, pseudoSchema, RADIUS_KM } from '@kwatro/shared'
import { router } from 'expo-router'
import { type ReactNode, useContext, useState } from 'react'
import { useWindowDimensions, View } from 'react-native'
import { IntroDeck } from '@/components/IntroDeck'
import { IdentityFields } from '@/components/profile/IdentityFields'
import { WhereFields } from '@/components/profile/WhereFields'
import { Frame, StepButton, StepLayout, WIDE, Wide } from '@/components/StepFrame'
import { ApiError } from '@/lib/queryClient'
import { useCityField } from '@/lib/useCityField'
import { useMeMutations, useMeQuery } from '@/queries/useMe'

type Step = 'intro' | 'pseudo' | 'where'

// ponytail: A6 « Tes jeux » (niveau déclaré par format TCG) arrive avec KWT-46, l'onboarding s'arrête à A5
const finish = () => router.replace('/')

/**
 * Onboarding après la création du compte : cartes de présentation (téléphone), pseudo et avatar (A4),
 * ville et rayon (A5). Sur desktop, les cartes restent à gauche de chaque étape.
 */
export default function OnboardingScreen() {
  const wide = useWindowDimensions().width >= WIDE
  const me = useMeQuery({ required: true })
  const [step, setStep] = useState<Step>('intro')
  const current = wide && step === 'intro' ? 'pseudo' : step

  let content: ReactNode
  if (current === 'intro') {
    content = (
      <Frame
        title="Bienvenue"
        phoneTitle={false}
        footer={<StepButton label="C’est parti" onPress={() => setStep('pseudo')} />}
      >
        <View style={{ flex: 1, justifyContent: 'center', gap: 24 }}>
          <Typography variant="h1">Bienvenue sur Kwatro</Typography>
          <IntroDeck />
        </View>
      </Frame>
    )
  } else if (current === 'pseudo') {
    content = (
      <PseudoStep
        me={me}
        onBack={wide ? undefined : () => setStep('intro')}
        onDone={() => setStep('where')}
      />
    )
  } else {
    content = me ? <WhereStep me={me} onBack={() => setStep('pseudo')} /> : null
  }

  return (
    <Wide.Provider value={wide}>
      {wide ? (
        <StepLayout
          aside={
            <View style={{ gap: 40 }}>
              <Typography variant="hero">Bienvenue sur Kwatro</Typography>
              <IntroDeck />
            </View>
          }
        >
          {content}
        </StepLayout>
      ) : (
        content
      )}
    </Wide.Provider>
  )
}

/** A4 : pseudo public (et bientôt la photo). */
function PseudoStep({
  me,
  onBack,
  onDone,
}: {
  me: Me | null
  onBack?: () => void
  onDone: () => void
}) {
  const { updateProfile } = useMeMutations()
  const [pseudo, setPseudo] = useState(me?.pseudo ?? '')
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    const parsed = pseudoSchema.safeParse(pseudo)
    if (!parsed.success) return setError(parsed.error.issues[0]?.message)
    setBusy(true)
    const result = await updateProfile
      .mutateAsync({ pseudo: parsed.data })
      .catch((error: unknown) => error)
    setBusy(false)
    if (result instanceof ApiError && result.status === 409)
      return setError('Ce pseudo est déjà pris. Essaie une variante.')
    if (result instanceof Error)
      return setError('Impossible d’enregistrer ton pseudo pour l’instant. Réessaie.')
    onDone()
  }

  return (
    <Frame
      title="Ton profil"
      onBack={onBack}
      progress={1}
      footer={<StepButton label="Continuer" disabled={busy} onPress={() => void submit()} />}
    >
      <Typography>
        Choisis le pseudo que les autres joueurs verront. Ton nom et ta date de naissance restent
        privés.
      </Typography>
      <IdentityFields
        compact
        autoFocus
        pseudo={pseudo}
        onPseudo={(v) => {
          setPseudo(v)
          setError(undefined)
        }}
        pseudoError={error}
        avatarStatus={me?.avatarStatus}
        onSubmit={() => void submit()}
      />
    </Frame>
  )
}

/** A5 : ville (saisie ou position, facultative) et rayon de recherche. */
function WhereStep({ me, onBack }: { me: Me; onBack: () => void }) {
  const wide = useContext(Wide)
  const { updateProfile } = useMeMutations()
  const cityField = useCityField(me)
  const [radius, setRadius] = useState(me.searchRadiusKm || RADIUS_KM.default)
  const [failed, setFailed] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    setFailed(false)
    const place = await cityField.resolve()
    if (!place) return setBusy(false)
    const saved = await updateProfile
      .mutateAsync({ ...place, searchRadiusKm: radius })
      .then(() => true)
      .catch(() => false)
    setBusy(false)
    if (!saved) return setFailed(true)
    finish()
  }

  return (
    <Frame
      title="Où tu joues"
      onBack={onBack}
      progress={2}
      footer={
        <View style={wide ? { flexDirection: 'row', alignItems: 'center', gap: 16 } : { gap: 10 }}>
          <StepButton label="Terminer" disabled={busy} onPress={() => void submit()} />
          <Button small kind="ghost" label="Plus tard" onPress={finish} />
        </View>
      }
    >
      <Typography>
        On te montre les soirées, les rooms et les lieux autour de ta ville. Ta position n’est
        jamais affichée.
      </Typography>
      <WhereFields cityField={cityField} radius={radius} onRadius={setRadius} />
      {failed ? <Note tone="room">Impossible d’enregistrer pour l’instant. Réessaie.</Note> : null}
    </Frame>
  )
}
