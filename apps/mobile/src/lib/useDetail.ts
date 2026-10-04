import { useCallback, useEffect, useState } from 'react'

/** Charge une fiche ; `setData` remplace le contenu (ex. réponse d'une inscription). */
export function useDetail<T>(load: () => Promise<{ data?: T }>) {
  const [data, setData] = useState<T | null>(null)
  const [failed, setFailed] = useState(false)

  const retry = useCallback(() => {
    setFailed(false)
    load().then(
      ({ data }) => (data ? setData(data) : setFailed(true)),
      () => setFailed(true),
    )
  }, [load])

  useEffect(retry, [retry])

  return { data, setData, failed, retry }
}

/** Message d'erreur renvoyé par l'API (`{ message }` de NestJS), sinon un message générique. */
export function apiMessage(error: unknown) {
  const message = (error as { message?: unknown } | undefined)?.message
  return typeof message === 'string' ? message : 'Une erreur est survenue, réessaie.'
}
