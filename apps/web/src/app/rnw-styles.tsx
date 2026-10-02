'use client'
import { useServerInsertedHTML } from 'next/navigation'
import type { ReactNode } from 'react'
import { StyleSheet } from 'react-native'

// react-native-web n'expose pas getSheet dans les types React Native.
const { getSheet } = StyleSheet as unknown as {
  getSheet: () => { id: string; textContent: string }
}

/** Injecte au rendu serveur les styles générés par react-native-web (évite le flash sans styles). */
export function RnwStyles({ children }: { children: ReactNode }) {
  useServerInsertedHTML(() => {
    const sheet = getSheet()
    // biome-ignore lint/security/noDangerouslySetInnerHtml: CSS généré par react-native-web, pas de contenu utilisateur
    return <style id={sheet.id} dangerouslySetInnerHTML={{ __html: sheet.textContent }} />
  })
  return <>{children}</>
}
