import type { Me } from '@kwatro/shared'
import { useEffect, useState } from 'react'
import { api } from './api'

export function useMe() {
  const [me, setMe] = useState<Me | null>(null)
  useEffect(() => {
    api.GET('/me').then(
      ({ data }) => setMe(data ?? null),
      () => setMe(null),
    )
  }, [])
  return me
}
