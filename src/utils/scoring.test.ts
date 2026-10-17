import { describe, expect, it } from 'vitest'
import type { AttemptQuestion } from '../types/quiz'
import { calculateScore } from './scoring'

const questions: AttemptQuestion[] = [
  { id: 'a1q1', assignment: 1, week: 1, question: 'One', options: [{ id: 'A', text: 'A' }, { id: 'B', text: 'B' }, { id: 'C', text: 'C' }, { id: 'D', text: 'D' }], displayedOptions: [], correctOptionId: 'B', answerSource: 'inferred' },
  { id: 'a1q2', assignment: 1, week: 1, question: 'Two', options: [{ id: 'A', text: 'A' }, { id: 'B', text: 'B' }, { id: 'C', text: 'C' }, { id: 'D', text: 'D' }], displayedOptions: [], correctOptionId: 'C', answerSource: 'inferred' },
]

describe('calculateScore', () => {
  it('keeps unanswered questions out of incorrect and returns a safe zero accuracy', () => {
    expect(calculateScore(questions, {})).toEqual({ attended: 0, correct: 0, incorrect: 0, unanswered: 2, accuracy: 0 })
  })

  it('maps selections to original option IDs, not displayed positions', () => {
    expect(calculateScore(questions, { a1q1: { selectedOptionId: 'B' }, a1q2: { selectedOptionId: 'A' } })).toEqual({ attended: 2, correct: 1, incorrect: 1, unanswered: 0, accuracy: 50 })
  })
})
