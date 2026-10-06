import { ChevronLeft, ChevronRight, X } from 'lucide-react-native'
import { type ReactNode, useRef, useState } from 'react'
import { Image, Modal, ScrollView, Text, View } from 'react-native'
import { Button } from '../atoms/Button'
import { IconButton } from '../atoms/IconButton'
import { Raised } from '../atoms/Raised'
import { border, colors, font, radius, shadow, space } from '../tokens'

export type Photo = { url: string; caption?: string | null }

function Tile({ photo, style }: { photo: Photo; style?: object }) {
  return (
    <View
      style={[
        {
          flex: 1,
          borderWidth: border.base,
          borderColor: colors.ink,
          borderRadius: radius.card,
          overflow: 'hidden',
          backgroundColor: colors.skeleton,
        },
        style,
      ]}
    >
      <Image
        source={{ uri: photo.url }}
        alt={photo.caption ?? ''}
        resizeMode="cover"
        style={{ flex: 1 }}
      />
    </View>
  )
}

/** Galerie (grand format) : photo principale sur deux lignes et jusqu'à 4 vignettes ; « Voir les N photos ». */
export function PhotoGallery({ photos, onOpen }: { photos: Photo[]; onOpen: () => void }) {
  const [main, ...rest] = photos
  if (!main) return null
  const thumbs = rest.slice(0, 4)
  const more =
    photos.length > 1 ? (
      <View style={{ position: 'absolute', right: 12, bottom: 12 }}>
        <Button small kind="ghost" label={`Voir les ${photos.length} photos`} onPress={onOpen} />
      </View>
    ) : null
  return (
    <View style={{ flexDirection: 'row', gap: 12, height: 412 }}>
      <Raised offset={shadow.card} style={{ flex: 2 }}>
        <Tile photo={main} style={{ height: 412 }} />
        {thumbs.length ? null : more}
      </Raised>
      {thumbs.length ? (
        <View style={{ flex: 2, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {thumbs.map((photo, i) => (
            <View key={photo.url} style={{ width: '48.5%', height: 200 }}>
              <Tile photo={photo} />
              {i === thumbs.length - 1 ? more : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  )
}

/**
 * Photos qui défilent une à une au doigt, avec compteur « 1 / 18 ». `arrows` : flèches pour la souris.
 * `children` se pose par-dessus (boutons retour, suivre…).
 */
export function PhotoCarousel({
  photos,
  height,
  arrows,
  rounded,
  children,
}: {
  photos: Photo[]
  height: number | `${number}%`
  arrows?: boolean
  rounded?: boolean
  children?: ReactNode
}) {
  const scroller = useRef<ScrollView>(null)
  const [width, setWidth] = useState(0)
  const [index, setIndex] = useState(0)
  const go = (i: number) => scroller.current?.scrollTo({ x: i * width, animated: true })
  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{
        height,
        backgroundColor: colors.skeleton,
        borderRadius: rounded ? radius.card : 0,
        overflow: 'hidden',
      }}
    >
      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => width && setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
      >
        {photos.map((photo) => (
          <Image
            key={photo.url}
            source={{ uri: photo.url }}
            alt={photo.caption ?? ''}
            resizeMode="cover"
            style={{ width, height: '100%' }}
          />
        ))}
      </ScrollView>
      {children}
      {arrows && photos.length > 1 ? (
        <>
          <View style={{ position: 'absolute', left: space.lg, top: '50%', marginTop: -20 }}>
            {index > 0 ? (
              <IconButton
                label="Photo précédente"
                icon={<ChevronLeft size={22} color={colors.ink} strokeWidth={2.5} />}
                onPress={() => go(index - 1)}
              />
            ) : null}
          </View>
          <View style={{ position: 'absolute', right: space.lg, top: '50%', marginTop: -20 }}>
            {index < photos.length - 1 ? (
              <IconButton
                label="Photo suivante"
                icon={<ChevronRight size={22} color={colors.ink} strokeWidth={2.5} />}
                onPress={() => go(index + 1)}
              />
            ) : null}
          </View>
        </>
      ) : null}
      {photos.length > 1 ? (
        <Text
          style={{
            ...font('mono', 700),
            position: 'absolute',
            right: space.lg,
            bottom: 14,
            fontSize: 12,
            color: colors.ink,
            backgroundColor: colors.white,
            borderWidth: border.thin,
            borderColor: colors.ink,
            borderRadius: radius.pill,
            paddingVertical: 3,
            paddingHorizontal: 10,
            overflow: 'hidden',
          }}
        >
          {index + 1} / {photos.length}
        </Text>
      ) : null}
    </View>
  )
}

/** Visionneuse plein écran des photos. */
export function PhotoViewer({
  visible,
  photos,
  onClose,
}: {
  visible: boolean
  photos: Photo[]
  onClose: () => void
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        role="dialog"
        aria-label="Photos du lieu"
        style={{ flex: 1, backgroundColor: colors.ink, padding: space.xxl, gap: space.lg }}
      >
        <View style={{ alignSelf: 'flex-end' }}>
          <IconButton
            label="Fermer"
            icon={<X size={20} color={colors.ink} strokeWidth={2.5} />}
            onPress={onClose}
          />
        </View>
        <View style={{ flex: 1 }}>
          <PhotoCarousel photos={photos} height="100%" arrows rounded />
        </View>
      </View>
    </Modal>
  )
}
