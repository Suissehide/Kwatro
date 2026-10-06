import { X } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { View } from 'react-native'
import { IconButton } from '../atoms/IconButton'
import { Raised } from '../atoms/Raised'
import { Typography } from '../atoms/Typography'
import { border, colors, radius, shadow } from '../tokens'

export type DetailSection = {
  key: string
  /** Titre en étiquette (« Décision », « Horaires »). */
  label?: string
  /** Fond doux (liste de vérification). */
  tinted?: boolean
  /** Sans marge intérieure (bandeau de compteurs). */
  flush?: boolean
  /** Sections posées côte à côte, séparées par un trait vertical. */
  columns?: ReactNode[]
  children?: ReactNode
}

/** Fiche détaillée (dossier, lieu, joueur) : sections séparées par un trait, fermeture en option. */
export function DetailCard({
  sections,
  onClose,
}: {
  sections: (DetailSection | null | false)[]
  onClose?: () => void
}) {
  const shown = sections.filter((s): s is DetailSection => !!s)
  return (
    <Raised offset={shadow.card} r={radius.card}>
      <View
        style={{
          backgroundColor: colors.white,
          borderWidth: border.base,
          borderColor: colors.ink,
          borderRadius: radius.card,
          overflow: 'hidden',
        }}
      >
        {onClose ? (
          <View style={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
            <IconButton
              icon={<X size={18} color={colors.ink} strokeWidth={2.5} />}
              label="Fermer"
              size={32}
              onPress={onClose}
            />
          </View>
        ) : null}
        {shown.map((section, i) => (
          <View
            key={section.key}
            style={{
              flexDirection: section.columns ? 'row' : 'column',
              flexWrap: section.columns ? 'wrap' : 'nowrap',
              borderTopWidth: i ? (i === 1 ? border.base : border.thin) : 0,
              borderColor: i === 1 ? colors.ink : colors.line,
              backgroundColor: section.tinted ? colors.hover : colors.white,
            }}
          >
            {section.columns ? (
              section.columns.map((column, c) => (
                <View
                  // biome-ignore lint/suspicious/noArrayIndexKey: colonnes fixes d'une section
                  key={c}
                  style={{
                    flex: 1,
                    minWidth: 240,
                    padding: 18,
                    gap: 8,
                    borderLeftWidth: c ? border.thin : 0,
                    borderColor: colors.line,
                  }}
                >
                  {column}
                </View>
              ))
            ) : (
              <View style={{ padding: section.flush ? 0 : 18, gap: 10 }}>
                {section.label ? (
                  <Typography variant="label" style={{ color: colors.ink }}>
                    {section.label}
                  </Typography>
                ) : null}
                {section.children}
              </View>
            )}
          </View>
        ))}
      </View>
    </Raised>
  )
}
