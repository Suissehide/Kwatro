import {
  Banner,
  PageTitle,
  Panel,
  ScreenHeader,
  SkeletonCard,
  Typography,
} from '@lucko/design-system'
import type { Game, MyGames } from '@lucko/shared'
import { router } from 'expo-router'
import { useWindowDimensions, View } from 'react-native'
import { PlayerScreen } from '@/components/PlayerScreen'
import { gamesBody, gamesDefaults, gamesFormOpts, validateGames } from '@/forms/games.form'
import { useAppForm } from '@/hooks/formConfig'
import { ApiError } from '@/lib/queryClient'
import { useGamesQuery } from '@/queries/useGames'
import { useMeQuery } from '@/queries/useMe'
import { useMyGamesMutations, useMyGamesQuery } from '@/queries/useMyGames'

const WIDE = 900

const backToProfile = () => (router.canGoBack() ? router.back() : router.replace('/profile'))

/** Mes jeux (F3, LKO-46) : jeux joués et niveau déclaré par format TCG, depuis le profil. */
export default function MyGamesScreen() {
  const wide = useWindowDimensions().width >= WIDE
  useMeQuery({ required: true })
  const catalog = useGamesQuery()
  const saved = useMyGamesQuery()

  const content =
    catalog.data && saved.data ? (
      <GamesForm catalog={catalog.data} saved={saved.data} wide={wide} />
    ) : catalog.isError || saved.isError ? (
      <Banner
        tone="err"
        message="Impossible de charger tes jeux."
        action="Réessayer"
        onAction={() => {
          void catalog.refetch()
          void saved.refetch()
        }}
      />
    ) : (
      <SkeletonCard />
    )

  return (
    <PlayerScreen
      tab="profil"
      wide={wide}
      pushed
      header={<ScreenHeader title="Mes jeux" onBack={backToProfile} />}
    >
      {wide ? (
        <View style={{ width: '100%', maxWidth: 720, alignSelf: 'center', gap: 20 }}>
          <PageTitle title="Mes jeux" />
          {content}
        </View>
      ) : (
        content
      )}
    </PlayerScreen>
  )
}

function GamesForm({ catalog, saved, wide }: { catalog: Game[]; saved: MyGames; wide: boolean }) {
  const { setMyGames } = useMyGamesMutations()
  const form = useAppForm({
    ...gamesFormOpts,
    defaultValues: gamesDefaults(saved),
    onSubmit: async ({ value, formApi }) => {
      try {
        await setMyGames.mutateAsync(gamesBody(value))
        backToProfile()
      } catch (error) {
        formApi.setErrorMap({
          onSubmit: {
            form:
              error instanceof ApiError && error.status === 400
                ? error.message
                : 'L’enregistrement a échoué. Réessaie dans un instant.',
            fields: {},
          },
        })
      }
    },
  })

  return (
    <View style={{ gap: 16 }}>
      <Panel compact={!wide}>
        <Typography variant="small">
          Pour chaque format TCG, réponds aux 3 questions pour situer ton niveau. Il fixe tes LK de
          départ tant que tu n’as pas joué de partie classée ; ensuite, seules les parties les font
          bouger.
        </Typography>
        <form.AppField name="games" validators={{ onSubmit: validateGames }}>
          {(field) => <field.Games catalog={catalog} />}
        </form.AppField>
      </Panel>
      <form.AppForm>
        <form.FormError />
        <View style={wide ? { alignSelf: 'flex-start' } : null}>
          <form.SubmitButton label="Enregistrer" />
        </View>
      </form.AppForm>
    </View>
  )
}
