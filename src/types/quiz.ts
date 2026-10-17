export type OptionId = 'A' | 'B' | 'C' | 'D'

export interface QuizOption {
  id: OptionId
  text: string
}

export interface Question {
  id: string
  assignment: number
  week: number
  question: string
  options: QuizOption[]
  correctOptionId: OptionId
  answerSource: 'inferred' | 'official'
  explanation?: string
}

export interface AttemptQuestion extends Question {
  displayedOptions: QuizOption[]
}

export interface Answer {
  selectedOptionId: OptionId
}

export type QuizMode = { kind: 'week'; week: number } | { kind: 'full' }
