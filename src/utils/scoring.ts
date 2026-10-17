import type { Answer, AttemptQuestion } from '../types/quiz'

export interface Score {
  attended: number
  correct: number
  incorrect: number
  unanswered: number
  accuracy: number
}

export function calculateScore(questions: AttemptQuestion[], answers: Record<string, Answer>): Score {
  const attended = Object.keys(answers).length
  const correct = questions.filter((question) => answers[question.id]?.selectedOptionId === question.correctOptionId).length
  return {
    attended,
    correct,
    incorrect: attended - correct,
    unanswered: questions.length - attended,
    accuracy: attended === 0 ? 0 : (correct / attended) * 100,
  }
}
