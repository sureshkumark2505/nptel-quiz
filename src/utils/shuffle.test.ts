import { describe, expect, it, vi } from 'vitest'
import { shuffle } from './shuffle'

describe('shuffle', () => {
  it('returns all input values exactly once without mutating the input', () => {
    const input = [1, 2, 3, 4, 5]
    const output = shuffle(input)
    expect(output).toHaveLength(input.length)
    expect([...output].sort()).toEqual(input)
    expect(input).toEqual([1, 2, 3, 4, 5])
  })

  it('uses Fisher-Yates swaps with the random index in range', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(shuffle(['A', 'B', 'C'])).toEqual(['B', 'C', 'A'])
    vi.restoreAllMocks()
  })
})
