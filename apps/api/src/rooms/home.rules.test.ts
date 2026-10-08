import { HOME_FUZZY_RADIUS_M } from '@lucko/shared'
import { describe, expect, it } from 'vitest'
import {
  addressKey,
  addressRefusal,
  distanceMeters,
  fuzzyCenter,
  openAddress,
  purgeBefore,
  revealAt,
  sealAddress,
} from './home.rules'

const now = new Date('2026-10-05T12:00:00Z')
const home = { lat: 44.8378, lng: -0.5792 }

describe('fuzzyCenter', () => {
  it('le cercle de 500 m contient toujours le point réel, même au bord du tirage', () => {
    for (const r of [0, 0.25, 0.5, 0.75, 0.999]) {
      for (const a of [0, 0.125, 0.375, 0.6, 0.875]) {
        const draws = [r, a]
        const center = fuzzyCenter(home.lat, home.lng, () => draws.shift() ?? 0)
        expect(distanceMeters(center, home)).toBeLessThan(HOME_FUZZY_RADIUS_M)
      }
    }
  })

  it('arrondi au millième : pas de coordonnées précises', () => {
    const center = fuzzyCenter(home.lat, home.lng)
    expect(center.lat * 1000).toBeCloseTo(Math.round(center.lat * 1000), 6)
    expect(center.lng * 1000).toBeCloseTo(Math.round(center.lng * 1000), 6)
  })
})

describe('addressRefusal', () => {
  const startsAt = new Date('2026-10-06T18:00:00Z')
  const room = {
    hostId: 'host',
    status: 'OPEN' as const,
    startsAt,
    participants: [
      { userId: 'host', status: 'ACCEPTED' as const },
      { userId: 'ok', status: 'ACCEPTED' as const },
      { userId: 'wait', status: 'PENDING' as const },
      { userId: 'gone', status: 'LEFT' as const },
      { userId: 'out', status: 'DECLINED' as const },
    ],
  }
  const after = new Date(revealAt(startsAt).getTime() + 1)

  it('un accepté l’obtient à partir de 24 h avant le début', () => {
    expect(revealAt(startsAt)).toEqual(new Date('2026-10-05T18:00:00Z'))
    expect(addressRefusal(room, 'ok', now)).toMatch(/24 h/)
    expect(addressRefusal(room, 'ok', after)).toBeNull()
  })

  it('jamais un non-accepté (en attente, parti, retiré, inconnu)', () => {
    for (const id of ['wait', 'gone', 'out', 'stranger'])
      expect(addressRefusal(room, id, after)).toMatch(/acceptés/)
  })

  it('l’hôte toujours ; personne après une annulation ni une fois la room finie', () => {
    expect(addressRefusal(room, 'host', now)).toBeNull()
    expect(addressRefusal({ ...room, status: 'CANCELLED' }, 'ok', after)).toMatch(/annulée/)
    const finished = new Date('2026-10-06T21:00:00Z')
    expect(addressRefusal(room, 'host', finished)).toMatch(/terminée/)
    expect(addressRefusal(room, 'ok', finished)).toMatch(/terminée/)
  })
})

describe('purgeBefore', () => {
  it('supprime les adresses des rooms finies depuis plus de 6 h', () => {
    // 3 h de partie + 6 h de marge
    expect(purgeBefore(now)).toEqual(new Date('2026-10-05T03:00:00Z'))
  })
})

describe('sealAddress / openAddress', () => {
  const key = addressKey()
  const address = { address: '12 rue des Faures, 33000 Bordeaux', ...home }

  it('chiffre puis déchiffre, sans l’adresse en clair dans la base', () => {
    const sealed = sealAddress(key, address)
    expect(Buffer.from(sealed.ciphertext).toString('utf8')).not.toContain('Faures')
    expect(openAddress(key, sealed)).toEqual(address)
  })

  it('refuse une donnée altérée ou une autre clé', () => {
    const sealed = sealAddress(key, address)
    const tampered = Buffer.from(sealed.ciphertext)
    tampered[0] = (tampered[0] ?? 0) ^ 1
    expect(() => openAddress(key, { ...sealed, ciphertext: tampered })).toThrow()
    expect(() => openAddress(addressKey(Buffer.alloc(32, 7).toString('base64')), sealed)).toThrow()
    expect(() => openAddress(key, { ...sealed, keyVersion: 2 })).toThrow()
  })
})
