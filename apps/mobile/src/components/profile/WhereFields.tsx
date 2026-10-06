import { RADIUS_KM } from '@lucko/shared'
import { View } from 'react-native'
import { profileFormOpts } from '@/forms/profile.form'
import { withForm } from '@/hooks/formConfig'
import { validateCity } from '@/lib/city'

/** Ville (saisie ou « Me localiser ») et rayon de recherche. */
export const WhereFields = withForm({
  ...profileFormOpts,
  props: {} as { compact?: boolean },
  render: function Render({ form, compact }) {
    return (
      <View style={{ gap: compact ? 16 : 20 }}>
        <form.AppField name="city" validators={{ onSubmitAsync: validateCity }}>
          {(field) => <field.City compact={compact} />}
        </form.AppField>
        <form.AppField name="searchRadiusKm">
          {(field) => (
            <field.Slider
              label={compact ? 'Rayon' : 'Rayon de recherche'}
              min={RADIUS_KM.min}
              max={RADIUS_KM.max}
              unit="km"
              bounds={!compact}
            />
          )}
        </form.AppField>
      </View>
    )
  },
})
