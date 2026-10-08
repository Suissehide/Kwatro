import { describe, expect, it } from 'vitest'
import { scoreOptions } from './scoreOptions'

describe('scoreOptions', () => {
  it('BO3 : victoires, égalité, défaites puis nul', () => {
    expect(scoreOptions(3)).toEqual(['2-0', '2-1', '1-1', '1-2', '0-2', 'Nul'])
  })

  it('BO1 sans nul', () => {
    expect(scoreOptions(1, false)).toEqual(['1-0', '0-1'])
  })

  it('BO5', () => {
    expect(scoreOptions(5)).toEqual(['3-0', '3-1', '3-2', '1-1', '2-2', '2-3', '1-3', '0-3', 'Nul'])
  })
})
