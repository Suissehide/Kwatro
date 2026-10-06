import { useState } from 'react'
import { View } from 'react-native'
import { Button, type ButtonKind } from '../atoms/Button'
import { Chip } from '../atoms/Chip'
import { Typography } from '../atoms/Typography'
import { colors } from '../tokens'
import { Banner } from './Banner'
import { TextField } from './TextField'

const MIN_REASON = 3

/**
 * Décision d'un admin à justifier : durée en option, motif (obligatoire sauf `optional`),
 * conséquence à gauche des boutons. La confirmation reste grisée tant que le motif manque.
 */
export function ReasonForm({
  label,
  placeholder,
  optional,
  durations,
  initialDuration,
  consequence,
  confirmLabel,
  confirmKind = 'room',
  busy,
  error,
  onConfirm,
  onCancel,
}: {
  label: string
  placeholder?: string
  optional?: boolean
  durations?: { key: string; label: string }[]
  initialDuration?: string
  consequence?: string
  confirmLabel: string
  confirmKind?: ButtonKind
  busy?: boolean
  error?: string
  onConfirm: (values: { text: string; duration?: string }) => void
  onCancel?: () => void
}) {
  const [text, setText] = useState('')
  const [duration, setDuration] = useState(initialDuration ?? durations?.[0]?.key)
  const ready = optional || text.trim().length >= MIN_REASON
  return (
    <View style={{ gap: 12 }}>
      {durations ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
          <Typography variant="label" style={{ color: colors.ink, marginRight: 4 }}>
            Durée
          </Typography>
          {durations.map((d) => (
            <Chip
              key={d.key}
              label={d.label}
              active={duration === d.key}
              color={colors.ink}
              onPress={() => setDuration(d.key)}
            />
          ))}
        </View>
      ) : null}
      <TextField
        label={label}
        placeholder={placeholder}
        value={text}
        onChangeText={setText}
        multiline
        maxLength={500}
      />
      {error ? <Banner tone="err" message={error} /> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <Typography variant="small" style={{ flex: 1, minWidth: 200 }}>
          {consequence ?? ''}
        </Typography>
        {onCancel ? <Button small kind="ghost" label="Annuler" onPress={onCancel} /> : null}
        <Button
          small
          kind={confirmKind}
          label={confirmLabel}
          disabled={!ready || busy}
          onPress={() => onConfirm({ text: text.trim(), duration })}
        />
      </View>
    </View>
  )
}
