'use client'
import { createApiClient } from '@kwatro/api-client'
import {
  Banner,
  Button,
  breakpoints,
  Checkbox,
  ContentCard,
  type ContentKind,
  space,
  TextField,
  Typography,
} from '@kwatro/design-system'
import { joinWaitlistSchema } from '@kwatro/shared'
import { useState } from 'react'
import { View } from 'react-native'

const api = createApiClient(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000')

const pitches: { kind: ContentKind; title: string; text: string }[] = [
  {
    kind: 'event',
    title: 'Les soirées du coin',
    text: 'Soirées jeux, initiations, tournois TCG : tout l’agenda des bars à jeux, boutiques et assos près de chez toi.',
  },
  {
    kind: 'room',
    title: 'Des joueurs à ton niveau',
    text: 'Rejoins une table ou ouvre la tienne. Ta Kwote suit ton niveau pour des parties équilibrées.',
  },
  {
    kind: 'venue',
    title: 'Des avantages sur place',
    text: 'Les lieux partenaires réservent des avantages aux joueurs venus avec Kwatro.',
  },
]

type Status = { tone: 'ok' | 'err'; message: string } | null

function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [digitalMajority, setDigitalMajority] = useState(false)
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<Status>(null)

  async function submit() {
    const parsed = joinWaitlistSchema.safeParse({ email, city, digitalMajority })
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
        : { tone: 'ok', message: 'C’est noté ! On te prévient dès l’ouverture.' },
    )
  }

  if (status?.tone === 'ok') return <Banner tone="ok" message={status.message} />

  return (
    <View style={{ gap: space.lg }}>
      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        inputMode="email"
        autoComplete="email"
        placeholder="toi@exemple.fr"
        onSubmitEditing={submit}
      />
      <TextField
        label="Ville (facultatif)"
        value={city}
        onChangeText={setCity}
        placeholder="Bordeaux"
        maxLength={80}
        onSubmitEditing={submit}
      />
      <Checkbox label="J’ai 15 ans ou plus" value={digitalMajority} onChange={setDigitalMajority} />
      {status ? <Banner tone="err" message={status.message} /> : null}
      <Button
        label={sending ? 'Envoi…' : 'Rejoindre la liste'}
        disabled={sending}
        onPress={submit}
      />
      <Typography variant="small">
        Ton e-mail sert uniquement à te prévenir du lancement de Kwatro.
      </Typography>
    </View>
  )
}

/** Landing joueurs : promesse + inscription à la liste d'attente (KWT-3). */
export function Landing() {
  return (
    <View
      style={{
        width: '100%',
        maxWidth: breakpoints.maxForm,
        marginHorizontal: 'auto',
        paddingHorizontal: space.screen,
        paddingVertical: space.xxxl * 2,
        gap: space.xxxl,
      }}
    >
      <View style={{ gap: space.md }}>
        <Typography variant="label">Bordeaux · bientôt</Typography>
        <Typography variant="display" aria-level={1}>
          Où jouer ce soir&nbsp;?
        </Typography>
        <Typography>
          Kwatro te montre où jouer aux jeux de société et aux TCG près de chez toi : les soirées,
          les tournois et les joueurs qui cherchent une table.
        </Typography>
      </View>

      <View style={{ gap: space.lg }}>
        {pitches.map((p) => (
          <ContentCard key={p.title} kind={p.kind}>
            <Typography variant="title">{p.title}</Typography>
            <Typography>{p.text}</Typography>
          </ContentCard>
        ))}
      </View>

      <ContentCard kind="kwote" raised>
        <Typography variant="h2" aria-level={2}>
          Sois prévenu du lancement
        </Typography>
        <WaitlistForm />
      </ContentCard>
    </View>
  )
}
