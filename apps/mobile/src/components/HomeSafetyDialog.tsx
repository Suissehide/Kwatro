import { ConfirmDialog, colors, Typography } from '@lucko/design-system'
import { ShieldCheck } from 'lucide-react-native'
import { View } from 'react-native'
import { useMeMutations } from '@/queries/useMe'

const TIPS = [
  'Préviens un proche : où tu vas, avec qui et quand tu comptes rentrer.',
  'Pour une première partie avec quelqu’un, préfère un lieu public.',
  'Tu peux partir à tout moment, sans te justifier.',
  'Un comportement inapproprié ? Signale-le depuis le chat de la room, même après la partie.',
]

/**
 * Avertissement sécurité des rooms à domicile (LKO-72), à accepter avant d'en créer une et avant d'en
 * rejoindre une la première fois. `onAccepted` : l'action reprend une fois l'acceptation enregistrée.
 */
export function HomeSafetyDialog({
  visible,
  sheet,
  onAccepted,
  onCancel,
}: {
  visible: boolean
  sheet: boolean
  onAccepted: () => void
  onCancel: () => void
}) {
  const { acceptHomeSafety } = useMeMutations()
  return (
    <ConfirmDialog
      visible={visible}
      sheet={sheet}
      destructive={false}
      title="Jouer chez quelqu’un"
      message="Quelques règles pour que les parties à domicile se passent bien."
      confirmLabel="J’ai compris"
      cancelLabel="Annuler"
      confirmDisabled={acceptHomeSafety.isPending}
      onConfirm={() => acceptHomeSafety.mutate(undefined, { onSuccess: onAccepted })}
      onCancel={onCancel}
    >
      <View style={{ gap: 10 }}>
        {TIPS.map((tip) => (
          <View key={tip} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
            <ShieldCheck size={18} color={colors.venue} strokeWidth={2.5} />
            <Typography style={{ flex: 1 }}>{tip}</Typography>
          </View>
        ))}
        {acceptHomeSafety.isError ? (
          <Typography color={colors.room}>
            Impossible d’enregistrer pour l’instant. Réessaie.
          </Typography>
        ) : null}
      </View>
    </ConfirmDialog>
  )
}
