import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Award, BookOpen, CheckCircle2, CircleHelp, Home, RotateCcw, XCircle } from 'lucide-react'
import sourceQuestions from './data/questions.json'
import type { Answer, AttemptQuestion, OptionId, Question, QuizMode } from './types/quiz'
import { calculateScore } from './utils/scoring'
import { shuffle } from './utils/shuffle'
import { validateQuestionBank } from './utils/validateQuestions'

type View = 'home' | 'weeks' | 'quiz' | 'results' | 'review'
const questions = sourceQuestions as Question[]

function newAttempt(mode: QuizMode): AttemptQuestion[] {
  const chosen = mode.kind === 'week' ? questions.filter((question) => question.week === mode.week) : questions
  return shuffle(chosen).map((question) => ({ ...question, displayedOptions: shuffle(question.options) }))
}

function Button({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`rounded-xl px-4 py-3 font-semibold transition focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props}>{children}</button>
}

function App() {
  const [view, setView] = useState<View>('home')
  const [mode, setMode] = useState<QuizMode>({ kind: 'full' })
  const [attempt, setAttempt] = useState<AttemptQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [validation] = useState(() => validateQuestionBank(questions))
  const score = useMemo(() => calculateScore(attempt, answers), [attempt, answers])

  const startQuiz = (nextMode: QuizMode) => {
    setMode(nextMode)
    setAttempt(newAttempt(nextMode))
    setAnswers({})
    setCurrentIndex(0)
    setView('quiz')
  }

  const answer = (optionId: OptionId) => {
    const question = attempt[currentIndex]
    if (!question || answers[question.id]) return
    setAnswers((current) => ({ ...current, [question.id]: { selectedOptionId: optionId } }))
  }

  const submit = () => {
    if (score.unanswered > 0 && !window.confirm(`You have ${score.unanswered} unanswered question${score.unanswered === 1 ? '' : 's'}. Submit anyway?`)) return
    setView('results')
  }

  const retry = () => startQuiz(mode)
  const toHome = () => { setAttempt([]); setAnswers({}); setView('home') }

  return (
    <main className="min-h-screen bg-stone-50 text-slate-800">
      <header className="border-b border-emerald-950/10 bg-white/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <button onClick={toHome} className="flex items-center gap-3 text-left" aria-label="Return to home">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-800 text-white"><BookOpen size={21} /></span>
            <span><span className="block font-serif text-lg font-bold text-emerald-950">Biodiversity</span><span className="block text-xs text-slate-500">Sustainability quiz</span></span>
          </button>
          {view !== 'home' && <Button className="hidden border border-slate-200 bg-white text-sm text-slate-700 sm:block" onClick={toHome}><Home className="mr-2 inline" size={16} />Home</Button>}
        </div>
      </header>

      {!validation.valid && <div className="mx-auto max-w-6xl px-4 pt-5"><div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">Question bank validation failed: {validation.errors.join(' ')}</div></div>}
      {view === 'home' && <HomePage onWeeks={() => setView('weeks')} onFull={() => startQuiz({ kind: 'full' })} />}
      {view === 'weeks' && <WeekSelection onBack={() => setView('home')} onSelect={(week) => startQuiz({ kind: 'week', week })} />}
      {view === 'quiz' && <QuizPage mode={mode} attempt={attempt} answers={answers} index={currentIndex} score={score} onAnswer={answer} onIndex={setCurrentIndex} onSubmit={submit} />}
      {view === 'results' && <Results mode={mode} total={attempt.length} score={score} onReview={() => setView('review')} onRetry={retry} onHome={toHome} />}
      {view === 'review' && <Review mode={mode} attempt={attempt} answers={answers} score={score} onRetry={retry} onHome={toHome} />}
    </main>
  )
}

function HomePage({ onWeeks, onFull }: { onWeeks: () => void; onFull: () => void }) {
  return <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
    <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_.75fr]">
      <div><p className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-900"><Award size={16} /> 2026 course practice</p>
        <h1 className="max-w-3xl font-serif text-4xl font-bold tracking-tight text-emerald-950 sm:text-6xl">Biodiversity for Sustainability</h1>
        <p className="mt-5 text-xl text-slate-600">Interactive MCQ Practice</p>
        <p className="mt-4 max-w-2xl leading-7 text-slate-600">Choose a focused weekly practice set or work through the entire question bank. Questions and options are freshly shuffled for every attempt; feedback appears as soon as you answer.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button className="bg-emerald-800 text-white hover:bg-emerald-900" onClick={onWeeks}>Weekly Practice <ArrowRight className="ml-2 inline" size={17} /></Button><Button className="border border-emerald-800 bg-white text-emerald-900 hover:bg-emerald-50" onClick={onFull}>Full Randomized Quiz <ArrowRight className="ml-2 inline" size={17} /></Button></div>
      </div>
      <aside className="rounded-3xl bg-emerald-950 p-7 text-white shadow-xl"><h2 className="font-serif text-2xl font-bold">How it works</h2><ol className="mt-5 space-y-4 text-emerald-50"><li><b>1.</b> Pick one week or the complete 120-question quiz.</li><li><b>2.</b> Answer one question at a time and receive instant feedback.</li><li><b>3.</b> Submit anytime, then review every answer and retry with a new order.</li></ol><p className="mt-6 border-t border-white/20 pt-4 text-sm text-emerald-100">Answer keys are inferred from the source questions because no official marked key appears in the supplied PDF.</p></aside>
    </div>
    <div className="mt-12 grid gap-4 sm:grid-cols-3">{[['120', 'Total questions'], ['12', 'Total weeks'], ['10', 'Questions per week']].map(([value, label]) => <div key={label} className="rounded-2xl border border-stone-200 bg-white p-6"><p className="font-serif text-4xl font-bold text-emerald-800">{value}</p><p className="mt-1 text-slate-600">{label}</p></div>)}</div>
  </section>
}

function WeekSelection({ onBack, onSelect }: { onBack: () => void; onSelect: (week: number) => void }) {
  return <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6"><Button onClick={onBack} className="mb-6 px-0 text-emerald-800"><ArrowLeft className="mr-2 inline" size={17} />Back</Button><h1 className="font-serif text-4xl font-bold text-emerald-950">Weekly practice</h1><p className="mt-3 text-slate-600">Each week contains the 10 questions from its matching assignment.</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 12 }, (_, index) => index + 1).map((week) => <button key={week} onClick={() => onSelect(week)} className="rounded-2xl border border-stone-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-200"><span className="text-sm font-semibold text-emerald-700">WEEK {week}</span><span className="mt-2 block font-serif text-xl font-bold text-emerald-950">Assignment {week}</span><span className="mt-2 block text-sm text-slate-500">10 questions <ArrowRight className="ml-1 inline" size={14} /></span></button>)}</div></section>
}

function QuizPage({ mode, attempt, answers, index, score, onAnswer, onIndex, onSubmit }: { mode: QuizMode; attempt: AttemptQuestion[]; answers: Record<string, Answer>; index: number; score: ReturnType<typeof calculateScore>; onAnswer: (id: OptionId) => void; onIndex: (index: number) => void; onSubmit: () => void }) {
  const question = attempt[index]
  if (!question) return null
  const selected = answers[question.id]?.selectedOptionId
  const progress = attempt.length ? (score.attended / attempt.length) * 100 : 0
  return <section className="mx-auto max-w-6xl px-4 py-7 sm:px-6"><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-bold uppercase tracking-wider text-emerald-700">{mode.kind === 'week' ? `Week ${mode.week} / Assignment ${mode.week}` : 'Full randomized quiz'}</p><h1 className="mt-1 font-serif text-2xl font-bold text-emerald-950">Question {index + 1} of {attempt.length}</h1></div><p className="rounded-xl bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-950">Correct Answers: {score.correct} / Questions Attended: {score.attended}</p></div>
    <div className="h-3 overflow-hidden rounded-full bg-stone-200" aria-label={`${score.attended} of ${attempt.length} questions answered`}><div className="h-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} /></div>
    <div className="mt-2 flex justify-between text-xs text-slate-500"><span>{score.attended} answered</span><span>{Math.round(progress)}% complete</span></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_260px]"><article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8"><h2 className="text-xl font-semibold leading-8 text-slate-900">{question.question}</h2><div className="mt-7 space-y-3">{question.displayedOptions.map((option) => <OptionButton key={option.id} option={option} selected={selected} correct={question.correctOptionId} onClick={() => onAnswer(option.id)} />)}</div>{selected && <div className={`mt-6 rounded-xl border p-4 ${selected === question.correctOptionId ? 'border-emerald-200 bg-emerald-50 text-emerald-950' : 'border-red-200 bg-red-50 text-red-900'}`} role="status">{selected === question.correctOptionId ? <><CheckCircle2 className="mr-2 inline" size={19} />Correct.</> : <><XCircle className="mr-2 inline" size={19} />Incorrect - the correct answer is shown in green.</>}<p className="mt-2 text-sm">{question.explanation}</p></div>}
        <div className="mt-7 flex justify-between gap-3 border-t border-stone-100 pt-5"><Button disabled={index === 0} className="border border-slate-200 bg-white" onClick={() => onIndex(index - 1)}><ArrowLeft className="mr-1 inline" size={17} />Previous</Button><Button disabled={index === attempt.length - 1} className="bg-emerald-800 text-white" onClick={() => onIndex(index + 1)}>Next<ArrowRight className="ml-1 inline" size={17} /></Button></div></article>
      <aside className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"><h2 className="font-serif text-lg font-bold text-emerald-950">Question navigator</h2><div className="mt-4 grid grid-cols-5 gap-2">{attempt.map((item, itemIndex) => <button key={item.id} onClick={() => onIndex(itemIndex)} aria-label={`Go to question ${itemIndex + 1}`} className={`h-9 rounded-lg text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-200 ${itemIndex === index ? 'ring-2 ring-emerald-700 ring-offset-2' : ''} ${answers[item.id] ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-slate-700'}`}>{itemIndex + 1}</button>)}</div><p className="mt-4 text-xs leading-5 text-slate-500"><span className="font-semibold text-emerald-800">Green</span> = answered. Light = unanswered.</p><Button onClick={onSubmit} className="mt-6 w-full bg-amber-500 text-amber-950 hover:bg-amber-400">Submit quiz</Button><dl className="mt-6 space-y-2 border-t border-stone-100 pt-4 text-sm"><div className="flex justify-between"><dt>Correct</dt><dd className="font-bold">{score.correct}</dd></div><div className="flex justify-between"><dt>Incorrect</dt><dd className="font-bold">{score.incorrect}</dd></div><div className="flex justify-between"><dt>Unanswered</dt><dd className="font-bold">{score.unanswered}</dd></div><div className="flex justify-between"><dt>Accuracy</dt><dd className="font-bold">{score.accuracy.toFixed(1)}%</dd></div></dl></aside></div></section>
}

function OptionButton({ option, selected, correct, onClick }: { option: { id: OptionId; text: string }; selected?: OptionId; correct: OptionId; onClick: () => void }) {
  const answered = Boolean(selected)
  const isCorrect = answered && option.id === correct
  const isIncorrect = answered && option.id === selected && option.id !== correct
  const style = isCorrect ? 'border-emerald-600 bg-emerald-50 text-emerald-950' : isIncorrect ? 'border-red-500 bg-red-50 text-red-950' : 'border-stone-200 bg-white hover:border-emerald-400'
  return <button disabled={answered} onClick={onClick} className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition disabled:cursor-default ${style}`}><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">{option.id}</span><span className="flex-1">{option.text}</span>{isCorrect && <CheckCircle2 aria-label="Correct answer" className="shrink-0 text-emerald-700" />}{isIncorrect && <XCircle aria-label="Incorrect answer" className="shrink-0 text-red-700" />}</button>
}

function Results({ mode, total, score, onReview, onRetry, onHome }: { mode: QuizMode; total: number; score: ReturnType<typeof calculateScore>; onReview: () => void; onRetry: () => void; onHome: () => void }) {
  return <section className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-800"><Award size={34} /></span><p className="mt-5 text-sm font-bold uppercase tracking-wider text-emerald-700">Quiz submitted</p><h1 className="mt-2 font-serif text-4xl font-bold text-emerald-950">Your results</h1><p className="mt-4 text-slate-600">Final score: <b>{score.correct} / {score.attended}</b> correct answers attended.</p><div className="mt-8 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">{[['Total', total], ['Attended', score.attended], ['Correct', score.correct], ['Incorrect', score.incorrect], ['Unanswered', score.unanswered], ['Accuracy', `${score.accuracy.toFixed(1)}%`]].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-stone-200 bg-white p-4"><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 text-xl font-bold text-emerald-950">{value}</dd></div>)}</div><p className="mt-7 font-semibold text-emerald-800">{score.unanswered === 0 ? 'Complete: every question was answered.' : `Incomplete: ${score.unanswered} question${score.unanswered === 1 ? '' : 's'} left unanswered.`}</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button className="border border-emerald-800 bg-white text-emerald-900" onClick={onReview}>Review Answers</Button><Button className="bg-emerald-800 text-white" onClick={onRetry}><RotateCcw className="mr-2 inline" size={16} />Retry {mode.kind === 'week' ? 'This Week' : 'Full Quiz'}</Button><Button className="text-slate-700" onClick={onHome}>Return to Home</Button></div></section>
}

function Review({ mode, attempt, answers, score, onRetry, onHome }: { mode: QuizMode; attempt: AttemptQuestion[]; answers: Record<string, Answer>; score: ReturnType<typeof calculateScore>; onRetry: () => void; onHome: () => void }) {
  return <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-wider text-emerald-700">Answer review</p><h1 className="font-serif text-4xl font-bold text-emerald-950">{score.correct} correct of {score.attended} attended</h1></div><div className="flex gap-2"><Button className="border border-emerald-800 bg-white text-emerald-900" onClick={onHome}>Home</Button><Button className="bg-emerald-800 text-white" onClick={onRetry}>Retry</Button></div></div><div className="mt-8 space-y-5">{attempt.map((question, index) => { const chosen = answers[question.id]?.selectedOptionId; const correct = question.options.find((option) => option.id === question.correctOptionId)!; const selected = question.options.find((option) => option.id === chosen); const passed = chosen === question.correctOptionId; return <article key={question.id} className="rounded-2xl border border-stone-200 bg-white p-5"><div className="flex gap-3"><span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full ${chosen ? (passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800') : 'bg-stone-100 text-slate-600'}`}>{chosen ? (passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />) : <CircleHelp size={16} />}</span><div><p className="font-semibold">{index + 1}. {question.question}</p><p className="mt-3 text-sm">Your answer: <b>{selected ? `${selected.id}. ${selected.text}` : 'Not answered'}</b></p>{!passed && <p className="mt-1 text-sm text-emerald-800">Correct answer: <b>{correct.id}. {correct.text}</b></p>}<p className="mt-2 text-xs text-slate-500">Answer source: inferred - official key not marked in source PDF.</p></div></div></article>})}</div><div className="mt-8 text-center"><Button className="bg-emerald-800 text-white" onClick={onRetry}>Retry {mode.kind === 'week' ? 'This Week' : 'Full Quiz'}</Button></div></section>
}

export default App
