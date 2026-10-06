import { describe, expect, it } from 'vitest'
import { PUSH_GROUP_MS, pushRecipients, sortChats, startsBurst } from './chat.rules'

describe('startsBurst', () => {
  const now = new Date('2026-10-06T20:00:00Z')

  it('premier message de la conversation, ou après un silence : push', () => {
    expect(startsBurst(null, now)).toBe(true)
    expect(startsBurst(new Date(now.getTime() - PUSH_GROUP_MS), now)).toBe(true)
  })

  it('message rapproché du précédent : pas de nouveau push', () => {
    expect(startsBurst(new Date(now.getTime() - 30_000), now)).toBe(false)
  })
})

describe('pushRecipients', () => {
  const base = {
    memberIds: ['author', 'away', 'watching', 'muted', 'blocked'],
    authorId: 'author',
    watching: new Set(['watching']),
    blocked: new Set(['blocked']),
    muted: new Set(['muted']),
    announcement: false,
  }

  it("ni l'auteur, ni le chat ouvert, ni bloqué, ni en sourdine", () => {
    expect(pushRecipients(base)).toEqual(['away'])
  })

  it('une annonce passe la sourdine, pas le blocage', () => {
    expect(pushRecipients({ ...base, announcement: true })).toEqual(['away', 'muted'])
  })
})

describe('sortChats', () => {
  const at = (iso: string) => new Date(`2026-10-${iso}`)
  const chat = (id: string, startsAt: string, last?: string) => ({
    id,
    startsAt: at(startsAt),
    last: last ? { createdAt: at(last) } : null,
  })

  it("les chats écrits d'abord (le plus récent en tête), puis les parties sans message par date", () => {
    const sorted = sortChats([
      chat('vide-tard', '12T20:00:00Z'),
      chat('ecrit-ancien', '10T20:00:00Z', '05T10:00:00Z'),
      chat('vide-tot', '08T20:00:00Z'),
      chat('ecrit-recent', '09T20:00:00Z', '06T10:00:00Z'),
    ])
    expect(sorted.map((c) => c.id)).toEqual([
      'ecrit-recent',
      'ecrit-ancien',
      'vide-tot',
      'vide-tard',
    ])
  })
})
