import { Avatar, Button, StatusPill, TextField, Typography } from '@kwatro/design-system'
import { type AvatarStatus, PSEUDO_MAX } from '@kwatro/shared'
import { View } from 'react-native'
import { AVATAR_STATUS } from '@/lib/profile'

/** Avatar et sa modération, pseudo public, en option prénom et nom privés. */
export function IdentityFields({
  pseudo,
  onPseudo,
  pseudoError,
  avatarUri,
  avatarStatus,
  name,
  onName,
  compact,
  autoFocus,
  onSubmit,
}: {
  pseudo: string
  onPseudo: (value: string) => void
  pseudoError?: string
  avatarUri?: string | null
  avatarStatus?: AvatarStatus | null
  name?: string
  onName?: (value: string) => void
  compact?: boolean
  autoFocus?: boolean
  onSubmit?: () => void
}) {
  const moderation = avatarStatus ? AVATAR_STATUS[avatarStatus] : null
  // ponytail: envoi de photo branché avec le stockage S3 des avatars ; d'ici là le bouton reste grisé
  const photo = (
    <Button
      small
      kind="ghost"
      label={avatarStatus ? 'Changer la photo' : 'Ajouter une photo'}
      disabled
    />
  )
  const help = moderation
    ? moderation.help
    : 'Les autres joueurs voient ton initiale. L’ajout de photo arrive bientôt.'

  return (
    <View style={{ gap: compact ? 14 : 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: compact ? 14 : 20 }}>
        <Avatar name={pseudo || '?'} uri={avatarUri} size={compact ? 72 : 104} />
        <View style={{ flex: 1, minWidth: 0, gap: 8, alignItems: 'flex-start' }}>
          {moderation ? <StatusPill label={moderation.label} tone={moderation.tone} /> : null}
          {compact ? null : <Typography variant="small">{help}</Typography>}
          {photo}
        </View>
      </View>
      {compact ? <Typography variant="small">{help}</Typography> : null}
      <TextField
        label="Pseudo"
        value={pseudo}
        onChangeText={onPseudo}
        error={pseudoError}
        help="Visible par les autres joueurs. 3 à 20 caractères."
        maxLength={PSEUDO_MAX}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        autoFocus={autoFocus}
        returnKeyType={onSubmit ? 'done' : undefined}
        onSubmitEditing={onSubmit}
      />
      {onName ? (
        <TextField
          label="Prénom et nom"
          value={name}
          onChangeText={onName}
          help="Privé : jamais montré aux autres joueurs."
          maxLength={80}
          autoComplete="name"
        />
      ) : null}
    </View>
  )
}
