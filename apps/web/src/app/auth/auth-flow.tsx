'use client'
import { type AgeRegime, ageRegime, emailSchema, MIN_AGE, parseBirthDate } from '@kwatro/shared'
import { type FormEvent, useState } from 'react'
import s from './auth.module.css'

type Step = 'welcome' | 'email' | 'birth' | AgeRegime

const OUTCOMES: Record<AgeRegime, { title: string; text: string; tone: string }> = {
  adult: {
    title: 'C’est parti',
    text: 'Encore ton pseudo, ta ville et tes jeux, et tu vois les parties près de chez toi.',
    tone: 'var(--kw-venue-soft)',
  },
  minor: {
    title: 'C’est parti',
    text: 'Ton compte est protégé : pas de messages privés d’adultes inconnus, pas de parties à domicile, et ta ville exacte reste cachée.',
    tone: 'var(--kw-venue-soft)',
  },
  'parental-consent': {
    title: 'Un parent doit valider',
    text: 'Avant 15 ans, la loi demande l’accord d’un parent pour créer ton compte. À l’étape suivante, indique son e-mail : il recevra un lien pour valider.',
    tone: 'var(--kw-kwote-soft)',
  },
  'too-young': {
    title: `Reviens à ${MIN_AGE} ans`,
    text: `Kwatro est réservé aux joueurs de ${MIN_AGE} ans et plus. Aucun compte n’a été créé et ta date de naissance n’est pas conservée.`,
    tone: 'var(--kw-room-soft)',
  },
}

/** Mêmes étapes que l'écran /auth de l'app : accueil, e-mail, date de naissance, résultat selon l'âge. */
export function AuthFlow() {
  const [step, setStep] = useState<Step>('welcome')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>()
  const [providerSoon, setProviderSoon] = useState(false)

  const go = (next: Step) => {
    setError(undefined)
    setStep(next)
  }

  function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = emailSchema.safeParse(new FormData(event.currentTarget).get('email'))
    if (!parsed.success) return setError('Cette adresse e-mail ne semble pas valide. Vérifie-la.')
    // ponytail: pas encore d'envoi de lien magique, branché par KWT-9 (Better Auth)
    setEmail(parsed.data)
    go('birth')
  }

  function submitBirth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const date = parseBirthDate(
      String(form.get('day') ?? ''),
      String(form.get('month') ?? ''),
      String(form.get('year') ?? ''),
    )
    if (!date || date > new Date())
      return setError(
        'Cette date n’existe pas. Saisis le jour, le mois et l’année, ex. 14 07 2004.',
      )
    go(ageRegime(date))
  }

  if (step === 'welcome') {
    return (
      <div className={s.stack}>
        <h1 className={s.title}>Connexion</h1>
        <p className={s.lead}>Un seul compte pour l’app et le site. Pas de mot de passe.</p>
        {/* ponytail: Apple et Google affichés pour l'aperçu, branchés par KWT-9 (Better Auth) */}
        <button type="button" className="kw-btn kw-btn--ink" onClick={() => setProviderSoon(true)}>
          Continuer avec Apple
        </button>
        <button
          type="button"
          className="kw-btn kw-btn--ghost"
          onClick={() => setProviderSoon(true)}
        >
          Continuer avec Google
        </button>
        <button type="button" className="kw-btn kw-btn--room" onClick={() => go('email')}>
          Continuer avec un e-mail
        </button>
        {providerSoon ? (
          <p className="kw-note" role="status">
            La connexion avec Apple ou Google arrive bientôt. Utilise ton e-mail en attendant.
          </p>
        ) : null}
        <p className="kw-small">
          En continuant, tu acceptes les conditions d’utilisation et la politique de
          confidentialité.
        </p>
      </div>
    )
  }

  if (step === 'email') {
    return (
      <form className={s.stack} onSubmit={submitEmail} noValidate>
        <Header title="Ton e-mail" current={1} onBack={() => go('welcome')} />
        <p className={s.lead}>On t’envoie un lien pour te connecter, sans mot de passe.</p>
        <label className={s.field}>
          <span className="kw-label">Adresse e-mail</span>
          <input
            className="kw-field"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="toi@exemple.fr"
            defaultValue={email}
            aria-invalid={!!error}
            aria-describedby={error ? 'auth-error' : undefined}
            // biome-ignore lint/a11y/noAutofocus: seul champ de l'étape, ouverte par l'utilisateur
            autoFocus
          />
        </label>
        <ErrorText error={error} />
        <button type="submit" className="kw-btn kw-btn--room">
          Continuer
        </button>
      </form>
    )
  }

  if (step === 'birth') {
    return (
      <form className={s.stack} onSubmit={submitBirth} noValidate>
        <Header title="Ta date de naissance" current={2} onBack={() => go('email')} />
        <p className={s.lead}>
          Kwatro est ouvert dès {MIN_AGE} ans. Ta date de naissance règle ce que ton compte permet,
          elle n’est jamais affichée.
        </p>
        <fieldset className={s.date} aria-describedby={error ? 'auth-error' : undefined}>
          <legend className={s.srOnly}>Date de naissance</legend>
          <DatePart
            name="day"
            label="Jour"
            placeholder="JJ"
            max={2}
            auto="bday-day"
            invalid={!!error}
          />
          <DatePart
            name="month"
            label="Mois"
            placeholder="MM"
            max={2}
            auto="bday-month"
            invalid={!!error}
          />
          <DatePart
            name="year"
            label="Année"
            placeholder="AAAA"
            max={4}
            auto="bday-year"
            invalid={!!error}
          />
        </fieldset>
        <ErrorText error={error} />
        <button type="submit" className="kw-btn kw-btn--room">
          Continuer
        </button>
      </form>
    )
  }

  const o = OUTCOMES[step]
  return (
    <div className={s.stack}>
      <h1 className={s.title}>{o.title}</h1>
      <p className="kw-note" style={{ background: o.tone }}>
        {o.text}
      </p>
      {step === 'too-young' ? (
        <button type="button" className="kw-btn kw-btn--ghost" onClick={() => go('welcome')}>
          Revenir à l’accueil
        </button>
      ) : (
        // ponytail: l'onboarding (KWT-45) et le consentement parent (KWT-49) ne sont pas encore faits
        <a href="/" className="kw-btn kw-btn--room">
          Continuer
        </a>
      )}
    </div>
  )
}

function Header({
  title,
  current,
  onBack,
}: {
  title: string
  current: number
  onBack: () => void
}) {
  return (
    <>
      <div className={s.header}>
        <button type="button" className={s.back} onClick={onBack} aria-label="Retour">
          ←
        </button>
        <h1 className={s.title}>{title}</h1>
      </div>
      <div
        className={s.progress}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={2}
        aria-valuenow={current}
        aria-label={`Étape ${current} sur 2`}
      >
        <span data-done />
        <span data-done={current >= 2 || undefined} />
      </div>
    </>
  )
}

function DatePart(props: {
  name: string
  label: string
  placeholder: string
  max: 2 | 4
  auto: string
  invalid: boolean
}) {
  return (
    <label className={s.field} data-wide={props.max === 4 || undefined}>
      <span className="kw-label">{props.label}</span>
      <input
        className="kw-field"
        name={props.name}
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={props.max}
        autoComplete={props.auto}
        placeholder={props.placeholder}
        aria-invalid={props.invalid}
        // Passe au champ suivant une fois rempli
        onInput={(e) => {
          const input = e.currentTarget
          input.value = input.value.replace(/\D/g, '')
          if (input.value.length === props.max)
            (
              input
                .closest('label')
                ?.nextElementSibling?.querySelector('input') as HTMLInputElement | null
            )?.focus()
        }}
      />
    </label>
  )
}

function ErrorText({ error }: { error?: string }) {
  return error ? (
    <p id="auth-error" className={s.error} role="alert">
      {error}
    </p>
  ) : null
}
