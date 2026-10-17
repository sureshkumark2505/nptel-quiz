import rawQuestions from '../data/questions.json'
import type { Question } from '../types/quiz'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateQuestionBank(records: Question[]): ValidationResult {
  const errors: string[] = []
  if (records.length !== 120) errors.push(`Expected 120 questions, found ${records.length}.`)
  const ids = new Set(records.map((question) => question.id))
  if (ids.size !== records.length) errors.push('Question IDs must be unique.')
  for (let assignment = 1; assignment <= 12; assignment += 1) {
    const group = records.filter((question) => question.assignment === assignment)
    if (group.length !== 10) errors.push(`Assignment ${assignment} must have 10 questions; found ${group.length}.`)
    if (group.some((question) => question.week !== assignment)) errors.push(`Assignment ${assignment} has an invalid week mapping.`)
  }
  for (const question of records) {
    if (!question.id || !question.question.trim()) errors.push(`Malformed record ${question.id || '(missing id)'}.`)
    if (question.options.length !== 4 || question.options.some((option) => !option.text.trim())) errors.push(`${question.id} must have four nonempty options.`)
    const optionIds = question.options.map((option) => option.id)
    if (new Set(optionIds).size !== 4 || !optionIds.includes(question.correctOptionId)) errors.push(`${question.id} has an invalid correct option reference.`)
  }
  return { valid: errors.length === 0, errors }
}
