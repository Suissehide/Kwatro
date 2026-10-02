import { describe, expect, it } from 'vitest'
import { joinWaitlistSchema } from './waitlist'

describe('joinWaitlistSchema', () => {
  it("normalise l'e-mail", () => {
    const parsed = joinWaitlistSchema.parse({ email: '  Leo@Exemple.FR ', digitalMajority: true })
    expect(parsed.email).toBe('leo@exemple.fr')
  })

  it("refuse une adresse invalide ou l'absence de majorité numérique", () => {
    expect(
      joinWaitlistSchema.safeParse({ email: 'pas-un-mail', digitalMajority: true }).success,
    ).toBe(false)
    expect(joinWaitlistSchema.safeParse({ email: 'a@b.fr', digitalMajority: false }).success).toBe(
      false,
    )
  })
})
