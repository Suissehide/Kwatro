import { ImageResponse } from 'next/og'

// Image de partage (réseaux sociaux, messageries), générée au build aux couleurs « Plateau pop »
export const alt = 'Lucko : où jouer ce soir ? Soirées jeux et tournois TCG près de chez toi.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const title = 'Où jouer ce soir ?'
const tagline = 'Soirées jeux, tournois TCG et joueurs près de chez toi'

/** Polices du design system depuis Google Fonts ; police par défaut si le service est injoignable. */
async function googleFont(family: string) {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}`)).text()
    const url = css.match(/src: url\((.+?)\) format/)?.[1]
    return url ? await (await fetch(url)).arrayBuffer() : null
  } catch {
    return null
  }
}

const pips = [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
]

export default async function Image() {
  const [black, body] = await Promise.all([
    googleFont('Archivo+Black'),
    googleFont('Archivo:wght@600'),
  ])
  const fonts = [
    ...(black ? [{ name: 'Archivo Black', data: black, weight: 400 as const }] : []),
    ...(body ? [{ name: 'Archivo', data: body, weight: 600 as const }] : []),
  ]

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: '#fff1d6',
        color: '#16130f',
        border: '14px solid #16130f',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        {/* Dé sur la face 4, comme le favicon */}
        <div
          style={{
            width: 96,
            height: 96,
            display: 'flex',
            flexWrap: 'wrap',
            alignContent: 'space-between',
            justifyContent: 'space-between',
            padding: 18,
            background: '#f5b800',
            border: '6px solid #16130f',
            borderRadius: 20,
            boxShadow: '6px 6px 0 #16130f',
          }}
        >
          {pips.map(([x, y]) => (
            <div
              key={`${x}${y}`}
              style={{ width: 20, height: 20, borderRadius: 10, background: '#16130f' }}
            />
          ))}
        </div>
        <div style={{ fontFamily: 'Archivo Black', fontSize: 64, textTransform: 'uppercase' }}>
          Lucko
        </div>
      </div>
      <div
        style={{
          fontFamily: 'Archivo Black',
          fontSize: 120,
          lineHeight: 0.95,
          textTransform: 'uppercase',
          maxWidth: 900,
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: 'flex',
          fontFamily: 'Archivo',
          fontSize: 38,
          fontWeight: 600,
          color: '#4b4339',
        }}
      >
        {tagline}
      </div>
    </div>,
    {
      ...size,
      fonts: fonts.length ? fonts : undefined,
    },
  )
}
