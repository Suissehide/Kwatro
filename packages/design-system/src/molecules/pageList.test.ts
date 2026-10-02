import { describe, expect, it } from 'vitest'
import { pageList } from './pageList'

describe('pageList', () => {
  it('affiche toutes les pages jusqu’à 5', () => {
    expect(pageList(2, 4)).toEqual([1, 2, 3, 4])
  })

  it('garde la page courante visible au milieu', () => {
    expect(pageList(7, 20)).toEqual([1, '…', 6, 7, 8, '…', 20])
  })

  it('ne met pas de « … » entre pages contiguës', () => {
    expect(pageList(1, 10)).toEqual([1, 2, '…', 10])
    expect(pageList(10, 10)).toEqual([1, '…', 9, 10])
    expect(pageList(3, 10)).toEqual([1, 2, 3, 4, '…', 10])
  })
})
