import { KWOTE_START } from '@kwatro/shared'
import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { api } from '@/lib/api'

export default function HomeScreen() {
  const [apiStatus, setApiStatus] = useState('…')

  useEffect(() => {
    api
      .GET('/health')
      .then(({ data }) => setApiStatus(data?.status ?? 'injoignable'))
      .catch(() => setApiStatus('injoignable'))
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kwatro</Text>
      <Text>Où jouer ce soir ?</Text>
      <Text style={styles.small}>Kwote de départ : {KWOTE_START}</Text>
      <Text style={styles.small}>API : {apiStatus}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 32, fontWeight: '700' },
  small: { fontSize: 12, opacity: 0.6 },
})
