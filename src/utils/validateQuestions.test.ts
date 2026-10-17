import { describe, expect, it } from 'vitest'
import rawQuestions from '../data/questions.json'
import type { Question } from '../types/quiz'
import { validateQuestionBank } from './validateQuestions'

describe('question-bank validation', () => {
  it('accepts the complete extracted 120-question bank', () => {
    expect(validateQuestionBank(rawQuestions as Question[])).toEqual({ valid: true, errors: [] })
  })

  it('rejects a malformed record', () => {
    const broken = (rawQuestions as Question[]).slice(0, 119)
    expect(validateQuestionBank(broken).valid).toBe(false)
  })
})
