import {
  AvailabilityGrid,
  Button,
  type ButtonKind,
  Chip,
  colors,
  font,
  Note,
  OptionCard,
  Slider,
  Spinner,
  TextField,
  TextLink,
  Typography,
} from '@kwatro/design-system'
import { createFormHook } from '@tanstack/react-form'
import * as Location from 'expo-location'
import { type ComponentProps, type RefObject, useState } from 'react'
import { Text, type TextInput, View } from 'react-native'
import type { CityValue } from '@/lib/city'
import { findCityAt } from '@/queries/useGeocode'
import { fieldContext, formContext, useFieldContext, useFormContext } from './formContext'

/** Premier message d'erreur d'un champ : chaîne d'un validateur, ou `{ message }` d'un schéma Zod. */
const firstError = (errors: unknown[]) => {
  const error = errors.find(Boolean)
  if (typeof error === 'string') return error
  const message = (error as { message?: unknown } | undefined)?.message
  return typeof message === 'string' ? message : undefined
}

/**
 * Champ courant, son erreur et un `onChange` qui efface l'erreur d'envoi du champ (validation à l'envoi
 * ou erreur de l'API posée par `form.setErrorMap`) : elle reviendra au prochain envoi si elle tient toujours.
 */
function useKwField<T>() {
  const field = useFieldContext<T>()
  const onChange = (value: T) => {
    field.handleChange(value)
    if (field.state.meta.errorMap.onSubmit)
      field.setMeta((meta) => ({ ...meta, errorMap: { ...meta.errorMap, onSubmit: undefined } }))
  }
  return { field, error: firstError(field.state.meta.errors), onChange }
}

// * CHAMPS

type TextProps = Omit<
  ComponentProps<typeof TextField>,
  'value' | 'onChangeText' | 'error' | 'onBlur'
>

const TextInputField = (props: TextProps) => {
  const { field, error, onChange } = useKwField<string>()
  return (
    <TextField
      {...props}
      value={field.state.value}
      onChangeText={onChange}
      onBlur={field.handleBlur}
      error={error}
    />
  )
}

/** Nombre à `length` chiffres (jour, mois, année) : garde les chiffres et passe au champ `next` une fois rempli. */
const DigitsField = ({
  length,
  next,
  ...props
}: Omit<TextProps, 'maxLength' | 'keyboardType'> & {
  length: number
  next?: RefObject<TextInput | null>
}) => {
  const { field, error, onChange } = useKwField<string>()
  return (
    <TextField
      {...props}
      value={field.state.value}
      onChangeText={(text) => {
        const digits = text.replace(/\D/g, '').slice(0, length)
        onChange(digits)
        if (digits.length === length) next?.current?.focus()
      }}
      onBlur={field.handleBlur}
      error={error}
      keyboardType="number-pad"
      maxLength={length}
      returnKeyType={next ? 'next' : 'done'}
      onSubmitEditing={next ? () => next.current?.focus() : props.onSubmitEditing}
    />
  )
}

const SliderField = ({
  label,
  min,
  max,
  unit,
  bounds,
}: {
  label: string
  min: number
  max: number
  unit: string
  bounds?: boolean
}) => {
  const { field, onChange } = useKwField<number>()
  const mono = { ...font('mono', 400), fontSize: 12, color: colors.muted }
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="label">{label}</Typography>
        <Text style={{ ...font('mono', 700), fontSize: 15, color: colors.ink }}>
          {field.state.value} {unit}
        </Text>
      </View>
      <Slider label={label} value={field.state.value} min={min} max={max} onChange={onChange} />
      {bounds ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={mono}>
            {min} {unit}
          </Text>
          <Text style={mono}>
            {max} {unit}
          </Text>
        </View>
      ) : null}
    </View>
  )
}

const AvailabilityField = ({ compact }: { compact?: boolean }) => {
  const { field, onChange } = useKwField<number[]>()
  const slots = field.state.value
  return (
    <AvailabilityGrid
      compact={compact}
      value={slots}
      onToggle={(slot) =>
        onChange(
          slots.includes(slot)
            ? slots.filter((s) => s !== slot)
            : [...slots, slot].sort((a, b) => a - b),
        )
      }
    />
  )
}

/** Choix multiple : cartes avec description (desktop) ou pastilles de 44 px (téléphone). */
const MultiChoiceField = <K extends string>({
  options,
  compact,
}: {
  options: { key: K; label: string; description?: string }[]
  compact?: boolean
}) => {
  const { field, onChange } = useKwField<K[]>()
  const selected = field.state.value
  const toggle = (key: K) =>
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key])
  if (compact)
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((o) => (
          <Chip
            key={o.key}
            tall
            label={o.label}
            active={selected.includes(o.key)}
            onPress={() => toggle(o.key)}
          />
        ))}
      </View>
    )
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {options.map((o) => (
        <View key={o.key} style={{ width: '48%', flexGrow: 1 }}>
          <OptionCard
            label={o.label}
            description={o.description}
            value={selected.includes(o.key)}
            onChange={() => toggle(o.key)}
          />
        </View>
      ))}
    </View>
  )
}

// Position arrondie à ~1 km : assez pour chercher autour, sans garder l'adresse exacte du joueur
const round = (value: number) => Math.round(value * 100) / 100

/** Ville saisie, ou trouvée par « Me localiser » (position de l'appareil puis commune). */
const CityField = ({ compact }: { compact?: boolean }) => {
  const { field, error, onChange } = useKwField<CityValue>()
  const [locating, setLocating] = useState(false)
  const [locateError, setLocateError] = useState<string>()

  const locate = async () => {
    setLocating(true)
    setLocateError(undefined)
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync()
      if (!granted) return setLocateError('Position refusée : saisis ta ville.')
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      const lat = round(coords.latitude)
      const lng = round(coords.longitude)
      const name = await findCityAt(lat, lng)
      if (!name) return setLocateError('Aucune ville trouvée à ta position : saisis-la.')
      onChange({ name, lat, lng })
    } catch {
      setLocateError('Position indisponible : saisis ta ville.')
    } finally {
      setLocating(false)
    }
  }

  return (
    <TextField
      label="Ville"
      placeholder="Ex. Bordeaux"
      value={field.state.value.name}
      onChangeText={(name) => {
        setLocateError(undefined)
        onChange({ name, lat: null, lng: null })
      }}
      onBlur={field.handleBlur}
      error={locateError ?? error}
      autoComplete="postal-address-locality"
      right={
        locating ? (
          <Spinner />
        ) : (
          <TextLink label={compact ? 'Localiser' : 'Me localiser'} onPress={() => void locate()} />
        )
      }
    />
  )
}

// * FORMULAIRE

/** Bouton d'envoi : grisé pendant l'envoi (validation asynchrone comprise). */
function SubmitButton({
  label,
  kind,
  small,
}: {
  label: string
  kind?: ButtonKind
  small?: boolean
}) {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button
          label={label}
          kind={kind}
          small={small}
          disabled={isSubmitting}
          onPress={() => void form.handleSubmit()}
        />
      )}
    </form.Subscribe>
  )
}

/** Erreur de tout le formulaire (ex. API injoignable), posée par `form.setErrorMap({ onSubmit: { form } })`. */
function FormError() {
  const form = useFormContext()
  return (
    <form.Subscribe selector={(state) => firstError(state.errors)}>
      {(error) => (error ? <Note tone="room">{error}</Note> : null)}
    </form.Subscribe>
  )
}

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    Text: TextInputField,
    Digits: DigitsField,
    Slider: SliderField,
    Availability: AvailabilityField,
    MultiChoice: MultiChoiceField,
    City: CityField,
  },
  formComponents: {
    SubmitButton,
    FormError,
  },
  fieldContext,
  formContext,
})
