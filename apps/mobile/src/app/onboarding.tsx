import { Button, Typography } from '@kwatro/design-system'
import type { Me } from '@kwatro/shared'
import { router } from 'expo-router'
import { type ReactNode, useContext, useState } from 'react'
import { useWindowDimensions, View } from 'react-native'
import { IntroDeck } from '@/components/IntroDeck'
import { IdentityFields } from '@/components/profile/IdentityFields'
import { WhereFields } from '@/components/profile/WhereFields'
import { Frame, StepAction, StepButton, StepLayout, WIDE, Wide } from '@/components/StepFrame'
import { profileBody, profileDefaults, profileFormOpts } from '@/forms/profile.form'
import { useAppForm } from '@/hooks/formConfig'
import { ApiError } from '@/lib/queryClient'
import { useMeMutations, useMeQuery } from '@/queries/useMe'

type Step = 'intro' | 'pseudo' | 'where'

// ponytail: A6 « Tes jeux » (niveau déclaré par format TCG) arrive avec KWT-46, l'onboarding s'arrête à A5
const finish = () => router.replace('/')

/**
 * Onboarding après la création du compte : cartes de présentation (téléphone), pseudo et avatar (A4),
 * ville et rayon (A5). Sur desktop, les cartes restent à gauche de chaque étape.
 */
export default function OnboardingScreen() {
  const wide = useWindowDimensions().width >= WIDE
  const me = useMeQuery({ required: true })
  const [step, setStep] = useState<Step>('intro')
  const current = wide && step === 'intro' ? 'pseudo' : step

  let content: ReactNode
  if (current === 'intro') {
    content = (
      <Frame
        title="Bienvenue"
        phoneTitle={false}
        footer={<StepButton label="C’est parti" onPress={() => setStep('pseudo')} />}
      >
        <View style={{ flex: 1, justifyContent: 'center', gap: 24 }}>
          <Typography variant="h1">Bienvenue sur Kwatro</Typography>
          <IntroDeck />
        </View>
      </Frame>
    )
  } else if (current === 'pseudo') {
    content = (
      <PseudoStep
        me={me}
        onBack={wide ? undefined : () => setStep('intro')}
        onDone={() => setStep('where')}
      />
    )
  } else {
    content = me ? <WhereStep me={me} onBack={() => setStep('pseudo')} /> : null
  }

  return (
    <Wide.Provider value={wide}>
      {wide ? (
        <StepLayout
          aside={
            <View style={{ gap: 40 }}>
              <Typography variant="hero">Bienvenue sur Kwatro</Typography>
              <IntroDeck />
            </View>
          }
        >
          {content}
        </StepLayout>
      ) : (
        content
      )}
    </Wide.Provider>
  )
}

/** A4 : pseudo public (et bientôt la photo). */
function PseudoStep({
  me,
  onBack,
  onDone,
}: {
  me: Me | null
  onBack?: () => void
  onDone: () => void
}) {
  const { updateProfile } = useMeMutations()
  const form = useAppForm({
    ...profileFormOpts,
    defaultValues: profileDefaults(me),
    onSubmit: async ({ value, formApi }) => {
      try {
        await updateProfile.mutateAsync({ pseudo: value.pseudo.trim() })
        onDone()
      } catch (error) {
        formApi.setErrorMap({
          onSubmit:
            error instanceof ApiError && error.status === 409
              ? { fields: { pseudo: 'Ce pseudo est déjà pris. Essaie une variante.' } }
              : {
                  form: 'Impossible d’enregistrer ton pseudo pour l’instant. Réessaie.',
                  fields: {},
                },
        })
      }
    },
  })

  return (
    <Frame
      title="Ton profil"
      onBack={onBack}
      progress={1}
      footer={
        <form.AppForm>
          <StepAction>
            <form.SubmitButton label="Continuer" />
          </StepAction>
        </form.AppForm>
      }
    >
      <Typography>
        Choisis le pseudo que les autres joueurs verront. Ton nom et ta date de naissance restent
        privés.
      </Typography>
      <IdentityFields form={form} compact autoFocus avatarStatus={me?.avatarStatus} />
      <form.AppForm>
        <form.FormError />
      </form.AppForm>
    </Frame>
  )
}

/** A5 : ville (saisie ou position, facultative) et rayon de recherche. */
function WhereStep({ me, onBack }: { me: Me; onBack: () => void }) {
  const wide = useContext(Wide)
  const { updateProfile } = useMeMutations()
  const form = useAppForm({
    ...profileFormOpts,
    defaultValues: profileDefaults(me),
    onSubmit: async ({ value, formApi }) => {
      try {
        const { city, latitude, longitude, searchRadiusKm } = await profileBody(value)
        await updateProfile.mutateAsync({ city, latitude, longitude, searchRadiusKm })
        finish()
      } catch {
        formApi.setErrorMap({
          onSubmit: { form: 'Impossible d’enregistrer pour l’instant. Réessaie.', fields: {} },
        })
      }
    },
  })

  return (
    <Frame
      title="Où tu joues"
      onBack={onBack}
      progress={2}
      footer={
        <View style={wide ? { flexDirection: 'row', alignItems: 'center', gap: 16 } : { gap: 10 }}>
          <form.AppForm>
            <StepAction>
              <form.SubmitButton label="Terminer" />
            </StepAction>
          </form.AppForm>
          <Button small kind="ghost" label="Plus tard" onPress={finish} />
        </View>
      }
    >
      <Typography>
        On te montre les soirées, les rooms et les lieux autour de ta ville. Ta position n’est
        jamais affichée.
      </Typography>
      <WhereFields form={form} />
      <form.AppForm>
        <form.FormError />
      </form.AppForm>
    </Frame>
  )
}
