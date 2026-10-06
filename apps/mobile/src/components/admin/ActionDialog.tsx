import { ConfirmDialog } from '@lucko/design-system'
import { adminReasonSchema } from '@lucko/shared'
import { useAppForm } from '@/hooks/formConfig'
import { SUSPENSION_DURATIONS, suspensionDays } from '@/lib/admin'

export type ActionDialogValues = { text: string; days: number | null }

/**
 * Action d'un admin à justifier (avertir, suspendre, refuser une photo, annuler un événement) :
 * motif obligatoire, durée pour une suspension. Le dialogue se ferme quand `onConfirm` réussit
 * (le parent repasse `visible` à faux) ; une erreur de l'API s'affiche dedans.
 */
export function ActionDialog({
  visible,
  title,
  message,
  confirmLabel,
  label = 'Motif',
  placeholder,
  initial = '',
  optional,
  duration,
  destructive = true,
  onConfirm,
  onCancel,
}: {
  visible: boolean
  title: string
  message: string
  confirmLabel: string
  label?: string
  placeholder?: string
  initial?: string
  /** Texte facultatif (classer sans motif, avantage partenaire). */
  optional?: boolean
  /** Choix de la durée (suspension). */
  duration?: boolean
  destructive?: boolean
  onConfirm: (values: ActionDialogValues) => Promise<unknown>
  onCancel: () => void
}) {
  const form = useAppForm({
    defaultValues: { text: initial, duration: '7' },
    onSubmit: async ({ value, formApi }) => {
      try {
        await onConfirm({ text: value.text.trim(), days: suspensionDays(value.duration) })
        formApi.reset()
      } catch (error) {
        formApi.setErrorMap({
          onSubmit: { form: error instanceof Error ? error.message : 'Réessaie.', fields: {} },
        })
      }
    },
  })
  const cancel = () => {
    form.reset()
    onCancel()
  }

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(submitting) => (
        <ConfirmDialog
          visible={visible}
          title={title}
          message={message}
          confirmLabel={confirmLabel}
          cancelLabel="Annuler"
          destructive={destructive}
          confirmDisabled={submitting}
          onConfirm={() => void form.handleSubmit()}
          onCancel={cancel}
        >
          <form.AppField
            name="text"
            validators={optional ? undefined : { onSubmit: adminReasonSchema.shape.reason }}
          >
            {(field) => (
              <field.Text label={label} placeholder={placeholder} multiline maxLength={500} />
            )}
          </form.AppField>
          {duration ? (
            <form.AppField name="duration">
              {(field) => <field.Choice label="Durée" options={SUSPENSION_DURATIONS} />}
            </form.AppField>
          ) : null}
          <form.AppForm>
            <form.FormError />
          </form.AppForm>
        </ConfirmDialog>
      )}
    </form.Subscribe>
  )
}
