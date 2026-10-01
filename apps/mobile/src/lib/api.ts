const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

/** Petit client HTTP vers l'API Kwatro. */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!response.ok) {
    throw new Error(`API ${response.status} sur ${path}`)
  }
  return response.json() as Promise<T>
}
