export interface QuestionnaireAnswers {
  income: number // Q1: Faixa de renda mensal
  expenses: number // Q2: Gasto mensal
  control_expenses: 'Sim, sempre' | 'Às vezes' | 'Nunca' // Q3
  debts_level: 'Não tenho dívidas' | 'Poucas dívidas' | 'Muitas dívidas' // Q4
  emergency_reserve:
    | 'Sim, mais de 6 meses'
    | 'Sim, entre 3 e 6 meses'
    | 'Sim, menos de 3 meses'
    | 'Não possuo' // Q5
  invest_habit: 'Sim, regularmente' | 'Sim, às vezes' | 'Não invisto' // Q6
  health_self_rating: 'Muito boa' | 'Boa' | 'Regular' | 'Ruim' | 'Muito ruim' // Q7
  financial_goals: 'Sim, claras' | 'Mais ou menos' | 'Não tenho' // Q8
  age_range: 'Até 25 anos' | '26 a 35 anos' | '36 a 45 anos' | '46 a 60 anos' | 'Acima de 60 anos' // Q9
  investor_profile: 'Conservador' | 'Moderado' | 'Arrojado' | 'Não sei' // Q10
  financial_feeling:
    | 'Muito satisfeito(a)'
    | 'Satisfeito(a)'
    | 'Neutro(a)'
    | 'Insatisfeito(a)'
    | 'Muito insatisfeito(a)' // Q11
}

export interface CategoryScores {
  income: number
  expenses: number
  debts: number
  savings: number
  perception: number
  total: number
}

export type ScoreTier = 'Excelente' | 'Bom' | 'Regular' | 'Atenção' | 'Crítico'

export interface DiagnosticRecord {
  id: string
  user: string
  total_score: number
  income_score: number
  expenses_score: number
  debts_score: number
  savings_score: number
  answers: QuestionnaireAnswers
  summary?: string
  recommendations?: string[]
  created: string
  updated: string
}

export interface AIReportResponse {
  summary: string
  recommendations: string[]
  fallback?: boolean
}
