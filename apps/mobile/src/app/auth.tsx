import {
  Button,
  border,
  colors,
  font,
  Logo,
  MobileScreen,
  Note,
  ProgressSteps,
  Raised,
  radius,
  ScreenHeader,
  Segmented,
  TextField,
  TopNav,
  Typography,
  WebScreen,
} from '@kwatro/design-system'
import {
  type AgeRegime,
  ageRegime,
  emailSchema,
  MIN_AGE,
  PASSWORD_MIN,
  parseBirthDate,
  passwordSchema,
} from '@kwatro/shared'
import { router } from 'expo-router'
import { createContext, type ReactNode, useContext, useRef, useState } from 'react'
import { Text, type TextInput, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TableScene } from '@/components/TableScene'

type Step = 'welcome' | 'email' | 'birth' | AgeRegime

/** Largeur à partir de laquelle l'écran passe en deux colonnes (navigateur desktop, tablette paysage). */
const WIDE = 900
const Wide = createContext(false)

/** Accueil (A1), e-mail (A2) et date de naissance obligatoire (A3, KWT-44). Téléphone et navigateur desktop. */
export default function AuthScreen() {
  const { width } = useWindowDimensions()
  const [step, setStep] = useState<Step>('welcome')
  const [email, setEmail] = useState('')
  const [mode, setMode] = useState<AccountMode>('login')
  const [providerSoon, setProviderSoon] = useState(false)
  const wide = width >= WIDE

  let content: ReactNode
  if (step === 'welcome') {
    content = (
      <Frame
        title="Connexion"
        phoneTitle={false}
        footer={
          <>
            {/* Desktop : le trio prend la largeur du plus long bouton, pas toute la carte */}
            <View style={wide ? { alignSelf: 'flex-start', gap: 12 } : { gap: 10 }}>
              {/* ponytail: Apple et Google affichés pour l'aperçu, branchés par KWT-9 (Better Auth) */}
              <Button
                label="Continuer avec Apple"
                kind="ink"
                onPress={() => setProviderSoon(true)}
              />
              <Button
                label="Continuer avec Google"
                kind="ghost"
                onPress={() => setProviderSoon(true)}
              />
              <Button label="Continuer avec un e-mail" onPress={() => setStep('email')} />
            </View>
            {providerSoon ? (
              <Note>
                La connexion avec Apple ou Google arrive bientôt. Utilise ton e-mail en attendant.
              </Note>
            ) : null}
            <Typography variant="small" style={wide ? null : { textAlign: 'center' }}>
              En continuant, tu acceptes les conditions d'utilisation et la politique de
              confidentialité.
            </Typography>
          </>
        }
      >
        {wide ? (
          <Typography>Connecte-toi ou crée ton compte Kwatro.</Typography>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', gap: 12 }}>
            <Logo size={44} />
            <Typography variant="display">Kwatro</Typography>
            <Typography style={{ ...font('body', 600), fontSize: 17, lineHeight: 24 }}>
              Trouve où jouer ce soir et avec qui.
            </Typography>
          </View>
        )}
      </Frame>
    )
  } else if (step === 'email') {
    content = (
      <AccountStep
        email={email}
        mode={mode}
        onMode={setMode}
        onBack={() => setStep('welcome')}
        onCreate={(e) => {
          setEmail(e)
          setStep('birth')
        }}
      />
    )
  } else if (step === 'birth') {
    content = <BirthStep onBack={() => setStep('email')} onDone={setStep} />
  } else {
    content = <Outcome regime={step} onRestart={() => setStep('welcome')} />
  }

  return (
    <Wide.Provider value={wide}>
      {wide ? <WideLayout>{content}</WideLayout> : content}
    </Wide.Provider>
  )
}

/** Navigateur desktop : barre du site (favicon + Kwatro), accroche et pièces 3D à gauche, étape à droite. */
function WideLayout({ children }: { children: ReactNode }) {
  return (
    <WebScreen
      nav={<TopNav />}
      contentStyle={{ flexDirection: 'row', alignItems: 'center', gap: 72, paddingBottom: 48 }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Typography variant="hero" style={{ maxWidth: 560 }}>
          Trouve où jouer ce soir et avec qui.
        </Typography>
        <View style={{ height: 300, marginTop: 56 }}>
          <TableScene />
        </View>
      </View>
      <View style={{ width: 440 }}>{children}</View>
    </WebScreen>
  )
}

/**
 * Cadre d'une étape. Téléphone : écran plein (en-tête, contenu, pied fixe).
 * Desktop : carte blanche relevée, titre de l'étape, contenu puis actions.
 */
function Frame({
  title,
  onBack,
  progress,
  phoneTitle = true,
  footer,
  children,
}: {
  title: string
  /** Téléphone, étape sans retour : affiche le titre en tête du contenu (l'accueil a son propre bloc). */
  phoneTitle?: boolean
  onBack?: () => void
  /** Étape courante sur 2 (e-mail, date de naissance). */
  progress?: number
  footer: ReactNode
  children: ReactNode
}) {
  const wide = useContext(Wide)
  const insets = useSafeAreaInsets()
  const bar = progress ? <ProgressSteps current={progress} total={2} /> : null

  if (!wide) {
    return (
      <MobileScreen
        insets={insets}
        scroll={!!onBack}
        header={onBack ? <ScreenHeader title={title} onBack={onBack} /> : undefined}
        footer={footer}
      >
        {!onBack && phoneTitle ? (
          <Typography variant="h1" style={{ paddingTop: 40 }}>
            {title}
          </Typography>
        ) : null}
        {bar}
        {children}
      </MobileScreen>
    )
  }

  return (
    <Raised offset={5} r={radius.card}>
      <View
        style={{
          backgroundColor: colors.white,
          borderWidth: border.base,
          borderColor: colors.ink,
          borderRadius: radius.card,
          padding: 28,
          gap: 16,
        }}
      >
        {onBack ? (
          // ScreenHeader a ses marges d'écran : on les annule dans la carte
          <View style={{ marginHorizontal: -16, marginVertical: -6 }}>
            <ScreenHeader title={title} onBack={onBack} />
          </View>
        ) : (
          <Typography variant="h1">{title}</Typography>
        )}
        {bar}
        {children}
        {footer}
      </View>
    </Raised>
  )
}

/** Bouton d'étape : pleine largeur sur téléphone (pied d'écran), à sa taille sur desktop. */
function StepButton(props: { label: string; kind?: 'room' | 'ghost'; onPress: () => void }) {
  const wide = useContext(Wide)
  return (
    <View style={wide ? { alignSelf: 'flex-start' } : null}>
      <Button {...props} />
    </View>
  )
}

type AccountMode = 'login' | 'create'

/** E-mail + mot de passe : connexion à un compte existant, ou début de la création (suivie de la date de naissance). */
function AccountStep({
  email: initial,
  mode,
  onMode,
  onBack,
  onCreate,
}: {
  email: string
  mode: AccountMode
  onMode: (mode: AccountMode) => void
  onBack: () => void
  onCreate: (email: string) => void
}) {
  const [email, setEmail] = useState(initial)
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const passwordRef = useRef<TextInput>(null)
  const create = mode === 'create'

  const submit = () => {
    const parsedEmail = emailSchema.safeParse(email)
    const passwordError = create
      ? passwordSchema.safeParse(password).error?.issues[0]?.message
      : password
        ? undefined
        : 'Saisis ton mot de passe.'
    if (!parsedEmail.success || passwordError)
      return setErrors({
        email: parsedEmail.success
          ? undefined
          : 'Cette adresse e-mail ne semble pas valide. Vérifie-la.',
        password: passwordError,
      })
    // ponytail: ni connexion ni création côté API pour l'instant, branchées par KWT-9 (Better Auth)
    if (create) onCreate(parsedEmail.data)
    else router.replace('/')
  }

  return (
    <Frame
      title={create ? 'Créer un compte' : 'Se connecter'}
      onBack={onBack}
      progress={create ? 1 : undefined}
      footer={<StepButton label={create ? 'Continuer' : 'Se connecter'} onPress={submit} />}
    >
      <Segmented
        items={['Se connecter', 'Créer un compte']}
        value={create ? 1 : 0}
        onChange={(i) => {
          onMode(i ? 'create' : 'login')
          setErrors({})
        }}
      />
      <TextField
        label="Adresse e-mail"
        placeholder="toi@exemple.fr"
        value={email}
        onChangeText={(v) => {
          setEmail(v)
          setErrors((e) => ({ ...e, email: undefined }))
        }}
        error={errors.email}
        autoFocus
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextField
        ref={passwordRef}
        label="Mot de passe"
        value={password}
        onChangeText={(v) => {
          setPassword(v)
          setErrors((e) => ({ ...e, password: undefined }))
        }}
        error={errors.password}
        help={create ? `${PASSWORD_MIN} caractères minimum` : undefined}
        secureTextEntry
        autoCapitalize="none"
        autoComplete={create ? 'new-password' : 'current-password'}
        returnKeyType="done"
        onSubmitEditing={submit}
      />
    </Frame>
  )
}

function BirthStep({
  onBack,
  onDone,
}: {
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
    <Frame
      title="Ta date de naissance"
      onBack={onBack}
      progress={2}
      footer={<StepButton label="Continuer" onPress={submit} />}
    >
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
    </Frame>
  )
}

const OUTCOMES: Record<
  AgeRegime,
  { title: string; text: string; tone: 'kwote' | 'room' | 'venue' }
> = {
  adult: {
    title: 'C’est parti',
    text: 'Il reste ton pseudo, ta ville et tes jeux. Ensuite, tu vois les parties près de chez toi.',
    tone: 'venue',
  },
  minor: {
    title: 'C’est parti',
    text: 'Ton compte est protégé : pas de messages privés d’adultes inconnus, pas de parties à domicile et ta ville exacte reste cachée.',
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

function Outcome({ regime, onRestart }: { regime: AgeRegime; onRestart: () => void }) {
  const o = OUTCOMES[regime]
  return (
    <Frame
      title={o.title}
      footer={
        regime === 'too-young' ? (
          <StepButton label="Revenir à l’accueil" kind="ghost" onPress={onRestart} />
        ) : (
          // ponytail: l'onboarding (A4-A6, KWT-45) et le consentement parent (A7, KWT-49) ne sont pas encore faits
          <StepButton label="Continuer" onPress={() => router.replace('/')} />
        )
      }
    >
      <Note tone={o.tone}>{o.text}</Note>
    </Frame>
  )
}
