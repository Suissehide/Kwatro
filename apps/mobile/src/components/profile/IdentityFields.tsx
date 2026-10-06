import { Avatar, Button, colors, StatusPill, Typography } from '@lucko/design-system'
import { type AvatarStatus, PSEUDO_MAX, pseudoSchema } from '@lucko/shared'
import { useState } from 'react'
import { View } from 'react-native'
import { profileFormOpts } from '@/forms/profile.form'
import { withForm } from '@/hooks/formConfig'
import { pickAvatar } from '@/lib/avatar'
import { AVATAR_STATUS } from '@/lib/profile'
import { ApiError } from '@/lib/queryClient'
import { useMeMutations } from '@/queries/useMe'

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
    const { setAvatar } = useMeMutations()
    const [avatarError, setAvatarError] = useState<string | null>(null)
    const moderation = avatarStatus ? AVATAR_STATUS[avatarStatus] : null
    const help = avatarError ?? moderation?.help ?? 'Les autres joueurs voient ton initiale.'
    const helpColor = avatarError ? colors.room : undefined

    const changeAvatar = async () => {
      setAvatarError(null)
      try {
        const file = await pickAvatar()
        if (file) await setAvatar.mutateAsync(file)
      } catch (error) {
        setAvatarError(
          error instanceof ApiError && (error.status === 400 || error.status === 422)
            ? `${error.message}. Choisis-en une autre.`
            : 'L’envoi a échoué. Réessaie dans un instant.',
        )
      }
    }
    return (
      <View style={{ gap: compact ? 14 : 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: compact ? 14 : 20 }}>
          <form.Subscribe selector={(state) => state.values.pseudo}>
            {(pseudo) => <Avatar name={pseudo || '?'} uri={avatarUri} size={compact ? 72 : 104} />}
          </form.Subscribe>
          <View style={{ flex: 1, minWidth: 0, gap: 8, alignItems: 'flex-start' }}>
            {moderation ? <StatusPill label={moderation.label} tone={moderation.tone} /> : null}
            {compact ? null : (
              <Typography variant="small" color={helpColor}>
                {help}
              </Typography>
            )}
            <Button
              small
              kind="ghost"
              label={
                setAvatar.isPending
                  ? 'Envoi…'
                  : avatarStatus
                    ? 'Changer la photo'
                    : 'Ajouter une photo'
              }
              disabled={setAvatar.isPending}
              onPress={() => void changeAvatar()}
            />
          </View>
        </View>
        {compact ? (
          <Typography variant="small" color={helpColor}>
            {help}
          </Typography>
        ) : null}
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
