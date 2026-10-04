import {
  Button,
  border,
  colors,
  MobileScreen,
  ProgressSteps,
  Raised,
  radius,
  ScreenHeader,
  TopNav,
  Typography,
  WebScreen,
} from '@kwatro/design-system'
import { createContext, type ReactNode, useContext } from 'react'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { openHome } from '@/lib/navigation'

/** Largeur à partir de laquelle un parcours en étapes passe en deux colonnes (navigateur desktop, tablette paysage). */
export const WIDE = 900
export const Wide = createContext(false)

/** Navigateur desktop : barre du site, `aside` à gauche, l'étape à droite. */
export function StepLayout({ aside, children }: { aside: ReactNode; children: ReactNode }) {
  return (
    <WebScreen
      siteFooter={false}
      nav={<TopNav onHome={openHome} />}
      contentStyle={{ flexDirection: 'row', alignItems: 'center', gap: 72, paddingBottom: 48 }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>{aside}</View>
      <View style={{ width: 440 }}>{children}</View>
    </WebScreen>
  )
}

/**
 * Cadre d'une étape. Téléphone : écran plein (en-tête, contenu, pied fixe).
 * Desktop : carte blanche relevée, titre de l'étape, contenu puis actions.
 */
export function Frame({
  title,
  onBack,
  progress,
  total = 2,
  phoneTitle = true,
  footer,
  children,
}: {
  title: string
  /** Téléphone, étape sans retour : affiche le titre en tête du contenu (l'accueil a son propre bloc). */
  phoneTitle?: boolean
  onBack?: () => void
  /** Étape courante sur `total`. */
  progress?: number
  total?: number
  footer: ReactNode
  children: ReactNode
}) {
  const wide = useContext(Wide)
  const insets = useSafeAreaInsets()
  const bar = progress ? <ProgressSteps current={progress} total={total} /> : null

  if (!wide) {
    return (
      <MobileScreen
        siteFooter={false}
        insets={insets}
        scroll={!!onBack}
        header={onBack ? <ScreenHeader title={title} onBack={onBack} /> : undefined}
        footer={footer}
      >
        {!onBack && phoneTitle ? (
          <Typography variant="h1" style={{ paddingTop: 40 }}>
            {title}
          </Typography>
        ) : null}
        {bar}
        {children}
      </MobileScreen>
    )
  }

  return (
    <Raised offset={5} r={radius.card}>
      <View
        style={{
          backgroundColor: colors.white,
          borderWidth: border.base,
          borderColor: colors.ink,
          borderRadius: radius.card,
          padding: 28,
          gap: 16,
        }}
      >
        {onBack ? (
          // ScreenHeader a ses marges d'écran : on les annule dans la carte
          <View style={{ marginHorizontal: -16, marginVertical: -6 }}>
            <ScreenHeader title={title} onBack={onBack} />
          </View>
        ) : (
          <Typography variant="h1">{title}</Typography>
        )}
        {bar}
        {children}
        {footer}
      </View>
    </Raised>
  )
}

/** Bouton d'étape : pleine largeur sur téléphone (pied d'écran), à sa taille sur desktop. */
export function StepButton(props: {
  label: string
  kind?: 'room' | 'ghost'
  disabled?: boolean
  onPress: () => void
}) {
  return (
    <StepAction>
      <Button {...props} />
    </StepAction>
  )
}

/** Action d'étape (bouton, `form.SubmitButton`) : pleine largeur sur téléphone, à sa taille sur desktop. */
export function StepAction({ children }: { children: ReactNode }) {
  const wide = useContext(Wide)
  return <View style={wide ? { alignSelf: 'flex-start' } : null}>{children}</View>
}
