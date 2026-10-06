import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import { launchImageLibraryAsync } from 'expo-image-picker'
import { Platform } from 'react-native'

// Assez net pour l'avatar le plus grand (104 px) sur un écran 3x, et bien sous la limite de 5 Mo de l'API
const AVATAR_PX = 512

/** Photo choisie dans la galerie, recadrée au carré et réduite, prête pour POST /me/avatar ; null si annulé. */
export async function pickAvatar() {
  const picked = await launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
  })
  const asset = picked.assets?.[0]
  if (picked.canceled || !asset) return null
  const resized = await ImageManipulator.manipulate(asset.uri)
    .resize({ width: AVATAR_PX })
    .renderAsync()
  const image = await resized.saveAsync({ compress: 0.8, format: SaveFormat.JPEG })
  const form = new FormData()
  if (Platform.OS === 'web')
    form.append('file', await (await fetch(image.uri)).blob(), 'avatar.jpg')
  // React Native lit le fichier à partir de son URI au moment de l'envoi
  else form.append('file', { uri: image.uri, name: 'avatar.jpg', type: 'image/jpeg' } as never)
  return form
}
