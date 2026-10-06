import type { UpdateProfileInput } from '@kwatro/shared'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { useEffect } from 'react'
import { ME } from '@/constants/queryKeys'
import { api } from '@/lib/api'
import { authClient } from '@/lib/auth'
import { forgetPush } from '@/lib/push'
import { ApiError, queryClient, unwrap } from '@/lib/queryClient'

// * QUERIES

export const meQueryOptions = queryOptions({
  queryKey: [ME.GET],
  queryFn: () => unwrap(api.GET('/me')),
})

/**
 * Joueur connecté (gardé entre deux lancements, voir lib/queryClient.ts) ; null s'il n'est pas connu.
 * `required` : écran réservé aux joueurs connectés, renvoie vers /auth sans session.
 */
export function useMeQuery({ required = false } = {}) {
  const { data, error } = useQuery(meQueryOptions)
  const unauthenticated = error instanceof ApiError && error.status === 401
  useEffect(() => {
    if (!unauthenticated) return
    forgetMe()
    if (required) router.replace('/auth')
  }, [unauthenticated, required])
  return unauthenticated ? null : (data ?? null)
}

/** Oublie le joueur connecté (déconnexion, changement de compte). */
export const forgetMe = () => queryClient.removeQueries({ queryKey: [ME.GET] })

/** Déconnexion : téléphone oublié pour les push, session Better Auth fermée, cache vidé, retour à la connexion. */
export async function signOut() {
  await forgetPush().catch(() => undefined)
  await authClient.signOut().catch(() => undefined)
  queryClient.clear()
  router.replace({ pathname: '/auth', params: { signedOut: '1' } })
}

// * MUTATIONS

export function useMeMutations() {
  const client = useQueryClient()

  /** PATCH /me : seuls les champs envoyés changent. ApiError 409 si le pseudo est pris. */
  const updateProfile = useMutation({
    mutationKey: [ME.UPDATE],
    mutationFn: (body: UpdateProfileInput) => unwrap(api.PATCH('/me', { body })),
    onSuccess: (me) => client.setQueryData(meQueryOptions.queryKey, me),
  })

  /** Date de naissance après une première connexion Apple / Google. ApiError 403 : trop jeune, compte supprimé. */
  const setBirthDate = useMutation({
    mutationKey: [ME.SET_BIRTH_DATE],
    mutationFn: (birthDate: string) => unwrap(api.POST('/me/birth-date', { body: { birthDate } })),
    onSuccess: () => client.invalidateQueries({ queryKey: meQueryOptions.queryKey }),
  })

  const deleteAccount = useMutation({
    mutationKey: [ME.DELETE],
    mutationFn: () => unwrap(api.DELETE('/me')),
    // Plus rien du compte supprimé ne doit rester en cache
    onSuccess: () => client.clear(),
  })

  return { updateProfile, setBirthDate, deleteAccount }
}
