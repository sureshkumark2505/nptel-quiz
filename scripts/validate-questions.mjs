import questions from '../src/data/questions.json' with { type: 'json' }

const errors = []
const ids = new Set(questions.map((question) => question.id))
if (questions.length !== 120) errors.push(`Expected 120 questions, found ${questions.length}.`)
if (ids.size !== questions.length) errors.push('Question IDs must be unique.')
for (let assignment = 1; assignment <= 12; assignment += 1) {
  const group = questions.filter((question) => question.assignment === assignment)
  if (group.length !== 10) errors.push(`Assignment ${assignment} must contain 10 questions.`)
  if (group.some((question) => question.week !== assignment)) errors.push(`Assignment ${assignment} has an invalid week mapping.`)
}
for (const question of questions) {
  if (!question.question?.trim() || question.options?.length !== 4 || question.options.some((option) => !option.text?.trim())) errors.push(`${question.id} must have a question and four nonempty options.`)
  const optionIds = question.options.map((option) => option.id)
  if (new Set(optionIds).size !== 4 || !optionIds.includes(question.correctOptionId)) errors.push(`${question.id} has an invalid correct-option reference.`)
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log('Question bank validation passed: 120 unique questions across 12 assignments.')
