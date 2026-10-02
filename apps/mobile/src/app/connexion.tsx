import {
  Button,
  colors,
  font,
  MobileScreen,
  Note,
  ProgressSteps,
  ScreenHeader,
  TextField,
  Typography,
} from '@kwatro/design-system'
import { type AgeRegime, ageRegime, emailSchema, MIN_AGE, parseBirthDate } from '@kwatro/shared'
import { router } from 'expo-router'
import { useRef, useState } from 'react'
import { Text, type TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { IntroDeck } from '@/components/IntroDeck'

type Step = 'welcome' | 'email' | 'birth' | AgeRegime

/** Accueil (A1), e-mail (A2) et date de naissance obligatoire (A3, KWT-44). */
export default function ConnexionScreen() {
  const insets = useSafeAreaInsets()
  const [step, setStep] = useState<Step>('welcome')
  const [email, setEmail] = useState('')
  const [providerSoon, setProviderSoon] = useState(false)

  if (step === 'welcome') {
    return (
      <MobileScreen
        insets={insets}
        scroll={false}
        footer={
          <>
            {/* ponytail: Apple et Google affichés pour l'aperçu, branchés par KWT-9 (Better Auth) */}
            <Button label="Continuer avec Apple" kind="ink" onPress={() => setProviderSoon(true)} />
            <Button
              label="Continuer avec Google"
              kind="ghost"
              onPress={() => setProviderSoon(true)}
            />
            <Button label="Continuer avec un e-mail" onPress={() => setStep('email')} />
            {providerSoon ? (
              <Note>
                La connexion avec Apple ou Google arrive bientôt. Utilise ton e-mail en attendant.
              </Note>
            ) : null}
            <Typography variant="small" style={{ textAlign: 'center' }}>
              En continuant, tu acceptes les conditions d'utilisation et la politique de
              confidentialité.
            </Typography>
          </>
        }
      >
        <View style={{ flex: 1, justifyContent: 'space-evenly', gap: 20, paddingTop: 12 }}>
          <View style={{ gap: 6 }}>
            <Typography variant="display">Kwatro</Typography>
            <Typography style={{ ...font('body', 600), fontSize: 17, lineHeight: 24 }}>
              Trouve où jouer ce soir, et avec qui.
            </Typography>
          </View>
          <IntroDeck />
        </View>
      </MobileScreen>
    )
  }

  if (step === 'email') {
    return (
      <EmailStep
        insets={insets}
        email={email}
        onBack={() => setStep('welcome')}
        onDone={(e) => {
          setEmail(e)
          setStep('birth')
        }}
      />
    )
  }

  if (step === 'birth') {
    return <BirthStep insets={insets} onBack={() => setStep('email')} onDone={setStep} />
  }

  return <Outcome insets={insets} regime={step} onRestart={() => setStep('welcome')} />
}

type Insets = { top: number; bottom: number }

function EmailStep({
  insets,
  email: initial,
  onBack,
  onDone,
}: {
  insets: Insets
  email: string
  onBack: () => void
  onDone: (email: string) => void
}) {
  const [email, setEmail] = useState(initial)
  const [error, setError] = useState<string>()

  const submit = () => {
    const parsed = emailSchema.safeParse(email)
    if (!parsed.success) return setError('Cette adresse e-mail ne semble pas valide. Vérifie-la.')
    // ponytail: pas encore d'envoi de lien magique, branché par KWT-9 (Better Auth)
    onDone(parsed.data)
  }

  return (
    <MobileScreen
      insets={insets}
      header={<ScreenHeader title="Ton e-mail" onBack={onBack} />}
      footer={<Button label="Continuer" onPress={submit} />}
    >
      <ProgressSteps current={1} total={2} />
      <Typography>On t'envoie un lien pour te connecter, sans mot de passe.</Typography>
      <TextField
        label="Adresse e-mail"
        placeholder="toi@exemple.fr"
        value={email}
        onChangeText={(v) => {
          setEmail(v)
          setError(undefined)
        }}
        error={error}
        autoFocus
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        returnKeyType="next"
        onSubmitEditing={submit}
      />
    </MobileScreen>
  )
}

function BirthStep({
  insets,
  onBack,
  onDone,
}: {
  insets: Insets
  onBack: () => void
  onDone: (regime: AgeRegime) => void
}) {
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [error, setError] = useState<string>()
  const monthRef = useRef<TextInput>(null)
  const yearRef = useRef<TextInput>(null)

  const submit = () => {
    const date = parseBirthDate(day, month, year)
    if (!date || date > new Date())
      return setError(
        'Cette date n’existe pas. Saisis le jour, le mois et l’année, ex. 14 07 2004.',
      )
    onDone(ageRegime(date))
  }

  // Champ à 2 ou 4 chiffres qui passe au suivant une fois rempli
  const part = (
    label: string,
    value: string,
    set: (v: string) => void,
    max: 2 | 4,
    next?: React.RefObject<TextInput | null>,
    ref?: React.RefObject<TextInput | null>,
  ) => (
    <View style={{ flex: max === 4 ? 1.6 : 1 }}>
      <TextField
        ref={ref}
        label={label}
        placeholder={max === 4 ? 'AAAA' : label === 'Jour' ? 'JJ' : 'MM'}
        value={value}
        onChangeText={(v) => {
          const digits = v.replace(/\D/g, '').slice(0, max)
          set(digits)
          setError(undefined)
          if (digits.length === max) next?.current?.focus()
        }}
        keyboardType="number-pad"
        maxLength={max}
        returnKeyType={next ? 'next' : 'done'}
        onSubmitEditing={next ? () => next.current?.focus() : submit}
      />
    </View>
  )

  return (
    <MobileScreen
      insets={insets}
      header={<ScreenHeader title="Ta date de naissance" onBack={onBack} />}
      footer={<Button label="Continuer" onPress={submit} />}
    >
      <ProgressSteps current={2} total={2} />
      <Typography>
        Kwatro est ouvert dès {MIN_AGE} ans. Ta date de naissance règle ce que ton compte permet,
        elle n’est jamais affichée.
      </Typography>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {part('Jour', day, setDay, 2, monthRef)}
        {part('Mois', month, setMonth, 2, yearRef, monthRef)}
        {part('Année', year, setYear, 4, undefined, yearRef)}
      </View>
      {error ? (
        <Text role="alert" style={{ ...font('body', 700), fontSize: 13, color: colors.room }}>
          {error}
        </Text>
      ) : null}
    </MobileScreen>
  )
}

const OUTCOMES: Record<
  AgeRegime,
  { title: string; text: string; tone: 'kwote' | 'room' | 'venue' }
> = {
  adult: {
    title: 'C’est parti',
    text: 'Encore ton pseudo, ta ville et tes jeux, et tu vois les parties près de chez toi.',
    tone: 'venue',
  },
  minor: {
    title: 'C’est parti',
    text: 'Ton compte est protégé : pas de messages privés d’adultes inconnus, pas de parties à domicile, et ta ville exacte reste cachée.',
    tone: 'venue',
  },
  'parental-consent': {
    title: 'Un parent doit valider',
    text: 'Avant 15 ans, la loi demande l’accord d’un parent pour créer ton compte. À l’étape suivante, indique son e-mail : il recevra un lien pour valider.',
    tone: 'kwote',
  },
  'too-young': {
    title: `Reviens à ${MIN_AGE} ans`,
    text: `Kwatro est réservé aux joueurs de ${MIN_AGE} ans et plus. Aucun compte n’a été créé et ta date de naissance n’est pas conservée.`,
    tone: 'room',
  },
}

function Outcome({
  insets,
  regime,
  onRestart,
}: {
  insets: Insets
  regime: AgeRegime
  onRestart: () => void
}) {
  const o = OUTCOMES[regime]
  return (
    <MobileScreen
      insets={insets}
      footer={
        regime === 'too-young' ? (
          <Button label="Revenir à l’accueil" kind="ghost" onPress={onRestart} />
        ) : (
          // ponytail: l'onboarding (A4-A6, KWT-45) et le consentement parent (A7, KWT-49) ne sont pas encore faits
          <Button label="Continuer" onPress={() => router.replace('/')} />
        )
      }
    >
      <View style={{ gap: 14, paddingTop: 40 }}>
        <Typography variant="h1">{o.title}</Typography>
        <Note tone={o.tone}>{o.text}</Note>
      </View>
    </MobileScreen>
  )
}
