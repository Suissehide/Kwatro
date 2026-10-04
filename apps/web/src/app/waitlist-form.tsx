'use client'
import { createApiClient } from '@kwatro/api-client'
import { joinWaitlistSchema } from '@kwatro/shared'
import { type FormEvent, useState } from 'react'
import s from './landing.module.css'

const api = createApiClient(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000')

type Status = { tone: 'ok' | 'err'; message: string } | null

/** Inscription à la liste d'attente : même schéma Zod que l'API, puis POST /waitlist. */
export function WaitlistForm() {
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<Status>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const parsed = joinWaitlistSchema.safeParse({
      email: form.get('email'),
      city: form.get('city'),
      digitalMajority: form.get('digitalMajority') === 'on',
    })
    if (!parsed.success) {
      setStatus({ tone: 'err', message: parsed.error.issues[0]?.message ?? 'Données invalides' })
      return
    }
    setSending(true)
    const { error } = await api
      .POST('/waitlist', { body: parsed.data })
      .catch(() => ({ error: true }))
    setSending(false)
    setStatus(
      error
        ? { tone: 'err', message: 'Inscription impossible pour le moment, réessaie plus tard.' }
        : {
            tone: 'ok',
            message: 'C’est noté ! On te prévient dès que Kwatro arrive près de chez toi.',
          },
    )
  }

  if (status?.tone === 'ok') {
    return (
      <p className={s.success} role="status">
        {status.message}
      </p>
    )
  }

  return (
    <form className={s.form} onSubmit={submit} noValidate>
      <label className={s.field}>
        <span className="kw-label">E-mail</span>
        <input
          className="kw-field"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="toi@exemple.fr"
          required
        />
      </label>
      <label className={s.field}>
        <span className="kw-label">Ta ville (facultatif)</span>
        <input
          className="kw-field"
          name="city"
          autoComplete="address-level2"
          placeholder="Lyon, Lille, Toulouse…"
          maxLength={80}
        />
      </label>
      <label className={s.check}>
        <input type="checkbox" name="digitalMajority" />
        <span>J’ai 15 ans ou plus</span>
      </label>
      {status ? (
        <p className={s.error} role="alert">
          {status.message}
        </p>
      ) : null}
      <button className="kw-btn kw-btn--room" type="submit" disabled={sending}>
        {sending ? 'Envoi…' : 'Rejoindre la liste'}
      </button>
      <p className="kw-small">
        Ton e-mail sert uniquement à te prévenir du lancement de Kwatro (
        <a href="/privacy">confidentialité</a>).
      </p>
    </form>
  )
}
