import { Avatar, Button, StatusPill, Typography } from '@kwatro/design-system'
import { type AvatarStatus, PSEUDO_MAX, pseudoSchema } from '@kwatro/shared'
import { View } from 'react-native'
import { profileFormOpts } from '@/forms/profile.form'
import { withForm } from '@/hooks/formConfig'
import { AVATAR_STATUS } from '@/lib/profile'

/** Avatar et sa modération, pseudo public, en option prénom et nom privés. */
export const IdentityFields = withForm({
  ...profileFormOpts,
  props: {} as {
    avatarUri?: string | null
    avatarStatus?: AvatarStatus | null
    withName?: boolean
    compact?: boolean
    autoFocus?: boolean
  },
  render: function Render({ form, avatarUri, avatarStatus, withName, compact, autoFocus }) {
    const moderation = avatarStatus ? AVATAR_STATUS[avatarStatus] : null
    const help = moderation
      ? moderation.help
      : 'Les autres joueurs voient ton initiale. L’ajout de photo arrive bientôt.'
    return (
      <View style={{ gap: compact ? 14 : 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: compact ? 14 : 20 }}>
          <form.Subscribe selector={(state) => state.values.pseudo}>
            {(pseudo) => <Avatar name={pseudo || '?'} uri={avatarUri} size={compact ? 72 : 104} />}
          </form.Subscribe>
          <View style={{ flex: 1, minWidth: 0, gap: 8, alignItems: 'flex-start' }}>
            {moderation ? <StatusPill label={moderation.label} tone={moderation.tone} /> : null}
            {compact ? null : <Typography variant="small">{help}</Typography>}
            {/* ponytail: envoi de photo branché avec le stockage S3 des avatars ; d'ici là le bouton reste grisé */}
            <Button
              small
              kind="ghost"
              label={avatarStatus ? 'Changer la photo' : 'Ajouter une photo'}
              disabled
            />
          </View>
        </View>
        {compact ? <Typography variant="small">{help}</Typography> : null}
        <form.AppField name="pseudo" validators={{ onSubmit: pseudoSchema }}>
          {(field) => (
            <field.Text
              label="Pseudo"
              help="Visible par les autres joueurs. 3 à 20 caractères."
              maxLength={PSEUDO_MAX}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              autoFocus={autoFocus}
              returnKeyType="done"
              onSubmitEditing={() => void form.handleSubmit()}
            />
          )}
        </form.AppField>
        {withName ? (
          <form.AppField name="name">
            {(field) => (
              <field.Text
                label="Prénom et nom"
                help="Privé : jamais montré aux autres joueurs."
                maxLength={80}
                autoComplete="name"
              />
            )}
          </form.AppField>
        ) : null}
      </View>
    )
  },
})
