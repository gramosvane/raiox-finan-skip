import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { calculateScores } from '@/lib/scoring'
import type { QuestionnaireAnswers } from '@/types/diagnostic'
import { ChevronRight, ChevronLeft, Check, Sparkles, AlertCircle } from 'lucide-react'

// Questions list per specification: 11 questions total
const QUESTIONS = [
  {
    id: 1,
    title: 'Qual é a sua faixa de renda mensal?',
    type: 'currency',
    field: 'income',
    helper: 'Informe seu salário líquido somado a eventuais rendas extras ou pró-labore.',
    placeholder: 'R$ 0,00',
  },
  {
    id: 2,
    title: 'Quanto você gasta por mês, aproximadamente?',
    type: 'currency',
    field: 'expenses',
    helper: 'Inclua moradia, alimentação, contas, transporte, lazer e compromissos.',
    placeholder: 'R$ 0,00',
  },
  {
    id: 3,
    title: 'Você controla seus gastos mensalmente?',
    type: 'choice',
    field: 'control_expenses',
    options: ['Sim, sempre', 'Às vezes', 'Nunca'],
  },
  {
    id: 4,
    title: 'Qual é o seu nível de endividamento?',
    type: 'choice',
    field: 'debts_level',
    options: ['Não tenho dívidas', 'Poucas dívidas', 'Muitas dívidas'],
  },
  {
    id: 5,
    title: 'Você possui uma reserva de emergência?',
    type: 'choice',
    field: 'emergency_reserve',
    options: [
      'Sim, mais de 6 meses',
      'Sim, entre 3 e 6 meses',
      'Sim, menos de 3 meses',
      'Não possuo',
    ],
  },
  {
    id: 6,
    title: 'Você costuma investir?',
    type: 'choice',
    field: 'invest_habit',
    options: ['Sim, regularmente', 'Sim, às vezes', 'Não invisto'],
  },
  {
    id: 7,
    title: 'Como você avalia sua saúde financeira hoje?',
    type: 'choice',
    field: 'health_self_rating',
    options: ['Muito boa', 'Boa', 'Regular', 'Ruim', 'Muito ruim'],
  },
  {
    id: 8,
    title: 'Você tem metas financeiras definidas?',
    type: 'choice',
    field: 'financial_goals',
    options: ['Sim, claras', 'Mais ou menos', 'Não tenho'],
  },
  {
    id: 9,
    title: 'Qual é a sua faixa de idade?',
    type: 'choice',
    field: 'age_range',
    options: ['Até 25 anos', '26 a 35 anos', '36 a 45 anos', '46 a 60 anos', 'Acima de 60 anos'],
  },
  {
    id: 10,
    title: 'Qual é o seu perfil de investidor?',
    type: 'choice',
    field: 'investor_profile',
    options: ['Conservador', 'Moderado', 'Arrojado', 'Não sei'],
  },
  {
    id: 11,
    title: 'Considerando tudo, como você se sente em relação às suas finanças?',
    type: 'choice',
    field: 'financial_feeling',
    options: [
      'Muito satisfeito(a)',
      'Satisfeito(a)',
      'Neutro(a)',
      'Insatisfeito(a)',
      'Muito insatisfeito(a)',
    ],
  },
]

function formatCurrencyBRL(valInCents: number): string {
  const amount = (valInCents / 100).toFixed(2)
  const parts = amount.split('.')
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `R$ ${intPart},${parts[1]}`
}

export const Questionnaire: React.FC = () => {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next')

  // Raw numeric input states (in cents)
  const [incomeCents, setIncomeCents] = useState<number>(0)
  const [expensesCents, setExpensesCents] = useState<number>(0)
  const [currencyError, setCurrencyError] = useState<string | null>(null)

  // Answers accumulator
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({})

  const currentQ = QUESTIONS[currentIndex]
  const progressPercent = Math.round(((currentIndex + 1) / QUESTIONS.length) * 100)

  // Currency input handler
  const handleCurrencyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'income' | 'expenses',
  ) => {
    const rawDigits = e.target.value.replace(/\D/g, '')
    const cents = parseInt(rawDigits, 10) || 0
    setCurrencyError(null)

    if (field === 'income') {
      setIncomeCents(cents)
      setAnswers((prev) => ({ ...prev, income: cents / 100 }))
    } else {
      setExpensesCents(cents)
      setAnswers((prev) => ({ ...prev, expenses: cents / 100 }))
    }
  }

  // Option select handler with auto-advance 250ms
  const handleSelectOption = (option: string) => {
    const field = currentQ.field as keyof QuestionnaireAnswers
    setAnswers((prev) => ({ ...prev, [field]: option }))

    // Delay 250ms before auto advancing
    setTimeout(() => {
      advanceStep()
    }, 250)
  }

  const advanceStep = () => {
    // Validate currency on questions 1 and 2
    if (currentQ.type === 'currency') {
      const val = currentQ.field === 'income' ? incomeCents : expensesCents
      if (val <= 0) {
        setCurrencyError('Por favor, informe um valor maior que zero para prosseguir.')
        return
      }
    }

    if (currentIndex < QUESTIONS.length - 1) {
      setSlideDirection('next')
      setCurrentIndex((prev) => prev + 1)
      setCurrencyError(null)
    } else {
      // Completed! Compute scores locally and navigate to /resultado
      finishQuestionnaire()
    }
  }

  const prevStep = () => {
    if (currentIndex > 0) {
      setSlideDirection('prev')
      setCurrentIndex((prev) => prev - 1)
      setCurrencyError(null)
    }
  }

  const finishQuestionnaire = () => {
    const fullAnswers: QuestionnaireAnswers = {
      income: answers.income || incomeCents / 100 || 3000,
      expenses: answers.expenses || expensesCents / 100 || 2500,
      control_expenses: answers.control_expenses || 'Às vezes',
      debts_level: answers.debts_level || 'Poucas dívidas',
      emergency_reserve: answers.emergency_reserve || 'Sim, menos de 3 meses',
      invest_habit: answers.invest_habit || 'Sim, às vezes',
      health_self_rating: answers.health_self_rating || 'Regular',
      financial_goals: answers.financial_goals || 'Mais ou menos',
      age_range: answers.age_range || '26 a 35 anos',
      investor_profile: answers.investor_profile || 'Moderado',
      financial_feeling: answers.financial_feeling || 'Neutro(a)',
    }

    const scores = calculateScores(fullAnswers)

    // Save state in sessionStorage and navigate
    sessionStorage.setItem('raiox_current_answers', JSON.stringify(fullAnswers))
    sessionStorage.setItem('raiox_current_scores', JSON.stringify(scores))

    navigate('/resultado', { state: { answers: fullAnswers, scores } })
  }

  // Check if current question has a valid answer
  const isCurrentValid = (): boolean => {
    if (currentQ.type === 'currency') {
      const val = currentQ.field === 'income' ? incomeCents : expensesCents
      return val > 0
    }
    const fieldVal = answers[currentQ.field as keyof QuestionnaireAnswers]
    return fieldVal !== undefined && String(fieldVal).trim().length > 0
  }

  return (
    <div id="questionnaire-container" className="w-full max-w-[620px] mx-auto scroll-mt-24">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8 text-slate-800 relative overflow-hidden">
        {/* Subtle top indicator bar */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span className="uppercase tracking-wider text-teal-600">
            Pergunta {currentIndex + 1} de {QUESTIONS.length}
          </span>
          <span className="text-slate-600 font-bold">{progressPercent}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-sky-500 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question body with slide transition effect */}
        <div
          key={currentIndex}
          className={`transition-all duration-300 transform ${
            slideDirection === 'next'
              ? 'animate-in fade-in slide-in-from-right-4'
              : 'animate-in fade-in slide-in-from-left-4'
          }`}
        >
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug mb-3">
            {currentQ.title}
          </h3>

          {currentQ.helper && (
            <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
              {currentQ.helper}
            </p>
          )}

          {/* Type: Currency Input */}
          {currentQ.type === 'currency' && (
            <div className="space-y-4 my-6">
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  placeholder="R$ 0,00"
                  value={
                    currentQ.field === 'income'
                      ? incomeCents > 0
                        ? formatCurrencyBRL(incomeCents)
                        : ''
                      : expensesCents > 0
                        ? formatCurrencyBRL(expensesCents)
                        : ''
                  }
                  onChange={(e) => handleCurrencyChange(e, currentQ.field as 'income' | 'expenses')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isCurrentValid()) {
                      e.preventDefault()
                      advanceStep()
                    }
                  }}
                  className="w-full text-2xl sm:text-3xl font-extrabold text-slate-900 px-5 py-4 rounded-xl border-2 border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all placeholder:text-slate-300"
                />
              </div>

              {currencyError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{currencyError}</span>
                </div>
              )}
            </div>
          )}

          {/* Type: Single Choice Options */}
          {currentQ.type === 'choice' && currentQ.options && (
            <div className="space-y-2.5 my-6">
              {currentQ.options.map((option) => {
                const isSelected = answers[currentQ.field as keyof QuestionnaireAnswers] === option
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 flex items-center justify-between group ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/70 text-slate-900 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-700'
                    }`}
                  >
                    <span className="font-medium text-sm sm:text-base">{option}</span>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-teal-600 bg-teal-600 text-white'
                          : 'border-slate-300 group-hover:border-slate-400 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
          {currentIndex > 0 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={prevStep}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
          ) : (
            <div />
          )}

          <Button
            type="button"
            disabled={!isCurrentValid()}
            onClick={advanceStep}
            className="bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9] hover:from-[#0FA396] hover:to-[#0284C7] text-white font-semibold shadow-md shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {currentIndex === QUESTIONS.length - 1 ? (
              <>
                <Sparkles className="w-4 h-4 mr-1.5" />
                Ver meu resultado
              </>
            ) : (
              <>
                Avançar
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
