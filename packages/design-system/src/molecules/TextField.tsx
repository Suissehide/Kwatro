import { type ReactNode, useState } from 'react'
import {
  Platform,
  Text,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native'
import { Typography } from '../atoms/Typography'
import { border, colors, font, radius } from '../tokens'

const focusRing: ViewStyle =
  Platform.OS === 'web'
    ? { boxShadow: `0 0 0 4px ${colors.kwote}` }
    : {
        shadowColor: colors.kwote,
        shadowOpacity: 1,
        shadowRadius: 0,
        shadowOffset: { width: 0, height: 0 },
      }

// Web : l'anneau de focus est sur le cadre ; on retire celui de :focus-visible (kwatro.css) sur le texte
const noOutline: TextStyle | null =
  Platform.OS === 'web' ? { outlineWidth: 0, boxShadow: 'none' } : null

/** Champ : libellé, aide ou erreur dessous, compteur si `multiline` + `maxLength`. */
export function TextField({
  label,
  help,
  error,
  disabled,
  right,
  multiline,
  maxLength,
  value,
  ...rest
}: {
  label?: string
  help?: string
  error?: string
  disabled?: boolean
  right?: ReactNode
} & Omit<TextInputProps, 'editable' | 'style'>) {
  const [focus, setFocus] = useState(false)
  const bg = disabled ? colors.disabledBg : error ? colors.roomSoft : colors.white
  return (
    <View style={{ gap: 6 }}>
      {label ? <Typography variant="label">{label}</Typography> : null}
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: multiline ? 'flex-start' : 'center',
            gap: 8,
            borderWidth: border.base,
            borderColor: disabled ? colors.disabledBorder : colors.ink,
            borderRadius: radius.field,
            paddingHorizontal: 12,
            paddingVertical: multiline ? 10 : 0,
            minHeight: 50,
            backgroundColor: bg,
          },
          focus ? focusRing : null,
        ]}
      >
        <TextInput
          value={value}
          placeholderTextColor={colors.placeholder}
          editable={!disabled}
          multiline={multiline}
          maxLength={maxLength}
          aria-label={label}
          aria-invalid={!!error}
          {...rest}
          onFocus={(e) => {
            setFocus(true)
            rest.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocus(false)
            rest.onBlur?.(e)
          }}
          style={[
            {
              flex: 1,
              ...font('body', 600),
              fontSize: 15,
              color: disabled ? colors.disabledText : colors.ink,
              paddingVertical: 12,
              minHeight: multiline ? 64 : undefined,
            },
            noOutline,
          ]}
        />
        {right}
      </View>
      {error || help ? (
        <Text
          style={{
            ...font('body', error ? 700 : 400),
            fontSize: 12,
            color: error ? colors.room : colors.muted,
          }}
        >
          {error || help}
        </Text>
      ) : null}
      {maxLength && multiline ? (
        <Typography variant="label" style={{ textAlign: 'right' }}>
          {(value ?? '').length} / {maxLength}
        </Typography>
      ) : null}
    </View>
  )
}
