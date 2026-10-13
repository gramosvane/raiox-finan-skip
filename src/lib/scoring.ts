import type { QuestionnaireAnswers, CategoryScores, ScoreTier } from '@/types/diagnostic'

/**
 * Deterministic scoring algorithm according to specifications:
 * Weights:
 * - Renda: 20%
 * - Gastos: 25%
 * - Dívidas: 25%
 * - Reserva e Investimentos: 20%
 * - Percepção/Gestão: 10% (from questions 3, 7, 8, 11)
 *
 * Each category is scored on a 0–100 scale.
 */
export function calculateScores(answers: QuestionnaireAnswers): CategoryScores {
  const income = Math.max(0, Number(answers.income) || 0)
  const expenses = Math.max(0, Number(answers.expenses) || 0)

  // 1. Renda (0-100)
  // Higher income has slightly higher capacity, but baseline is positive
  let incomeScore = 50
  if (income >= 15000) incomeScore = 100
  else if (income >= 8000) incomeScore = 88
  else if (income >= 5000) incomeScore = 75
  else if (income >= 3000) incomeScore = 65
  else if (income >= 1500) incomeScore = 50
  else if (income > 0) incomeScore = 40
  else incomeScore = 20

  // 2. Gastos (0-100) - based on expense ratio relative to income
  let expensesScore = 50
  if (income > 0) {
    const expenseRatio = expenses / income
    if (expenseRatio <= 0.5) expensesScore = 100
    else if (expenseRatio <= 0.7) expensesScore = 85
    else if (expenseRatio <= 0.85) expensesScore = 65
    else if (expenseRatio <= 1.0) expensesScore = 45
    else if (expenseRatio <= 1.2) expensesScore = 25
    else expensesScore = 10
  } else {
    expensesScore = expenses === 0 ? 50 : 20
  }

  // 3. Dívidas (0-100)
  let debtsScore = 50
  switch (answers.debts_level) {
    case 'Não tenho dívidas':
      debtsScore = 100
      break
    case 'Poucas dívidas':
      debtsScore = 65
      break
    case 'Muitas dívidas':
      debtsScore = 20
      break
    default:
      debtsScore = 50
  }

  // 4. Reserva e Investimentos (0-100) - Q5 + Q6
  let reserveScore = 0
  switch (answers.emergency_reserve) {
    case 'Sim, mais de 6 meses':
      reserveScore = 100
      break
    case 'Sim, entre 3 e 6 meses':
      reserveScore = 80
      break
    case 'Sim, menos de 3 meses':
      reserveScore = 45
      break
    case 'Não possuo':
      reserveScore = 10
      break
    default:
      reserveScore = 30
  }

  let investScore = 0
  switch (answers.invest_habit) {
    case 'Sim, regularmente':
      investScore = 100
      break
    case 'Sim, às vezes':
      investScore = 60
      break
    case 'Não invisto':
      investScore = 20
      break
    default:
      investScore = 40
  }
  const savingsScore = Math.round(reserveScore * 0.65 + investScore * 0.35)

  // 5. Percepção / Gestão (0-100) - derived from Q3 (controle), Q7 (avaliação), Q8 (metas), Q11 (sentimento)
  let q3Score = 0
  if (answers.control_expenses === 'Sim, sempre') q3Score = 100
  else if (answers.control_expenses === 'Às vezes') q3Score = 60
  else q3Score = 20

  let q7Score = 0
  if (answers.health_self_rating === 'Muito boa') q7Score = 100
  else if (answers.health_self_rating === 'Boa') q7Score = 80
  else if (answers.health_self_rating === 'Regular') q7Score = 55
  else if (answers.health_self_rating === 'Ruim') q7Score = 30
  else q7Score = 15

  let q8Score = 0
  if (answers.financial_goals === 'Sim, claras') q8Score = 100
  else if (answers.financial_goals === 'Mais ou menos') q8Score = 60
  else q8Score = 20

  let q11Score = 0
  if (answers.financial_feeling === 'Muito satisfeito(a)') q11Score = 100
  else if (answers.financial_feeling === 'Satisfeito(a)') q11Score = 80
  else if (answers.financial_feeling === 'Neutro(a)') q11Score = 55
  else if (answers.financial_feeling === 'Insatisfeito(a)') q11Score = 30
  else q11Score = 15

  const perceptionScore = Math.round((q3Score + q7Score + q8Score + q11Score) / 4)

  // Weighted total: Renda 20%, Gastos 25%, Dívidas 25%, Reserva/Investimentos 20%, Percepção 10%
  const total = Math.round(
    incomeScore * 0.2 +
      expensesScore * 0.25 +
      debtsScore * 0.25 +
      savingsScore * 0.2 +
      perceptionScore * 0.1,
  )

  return {
    income: Math.min(100, Math.max(0, incomeScore)),
    expenses: Math.min(100, Math.max(0, expensesScore)),
    debts: Math.min(100, Math.max(0, debtsScore)),
    savings: Math.min(100, Math.max(0, savingsScore)),
    perception: Math.min(100, Math.max(0, perceptionScore)),
    total: Math.min(100, Math.max(0, total)),
  }
}

export function getScoreTier(score: number): {
  tier: ScoreTier
  color: string
  bgLight: string
  badgeClass: string
  description: string
} {
  if (score >= 80) {
    return {
      tier: 'Excelente',
      color: '#10B981',
      bgLight: 'rgba(16, 185, 129, 0.12)',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      description: 'Finanças sólidas, com hábitos consistentes e excelente proteção.',
    }
  }
  if (score >= 60) {
    return {
      tier: 'Bom',
      color: '#14B8A6',
      bgLight: 'rgba(20, 184, 166, 0.12)',
      badgeClass: 'bg-teal-500/15 text-teal-300 border border-teal-500/30',
      description:
        'Sua situação é positiva, mas ainda existem pontos-chave para destravar estabilidade.',
    }
  }
  if (score >= 40) {
    return {
      tier: 'Regular',
      color: '#F59E0B',
      bgLight: 'rgba(245, 158, 11, 0.12)',
      badgeClass: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
      description: 'Equilíbrio frágil. Pequenos imprevistos podem gerar descontrole financeiro.',
    }
  }
  if (score >= 20) {
    return {
      tier: 'Atenção',
      color: '#F97316',
      bgLight: 'rgba(249, 115, 22, 0.12)',
      badgeClass: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
      description: 'Sinais claros de vulnerabilidade. É hora de reorganizar despesas e dívidas.',
    }
  }
  return {
    tier: 'Crítico',
    color: '#EF4444',
    bgLight: 'rgba(239, 68, 68, 0.12)',
    badgeClass: 'bg-red-500/15 text-red-400 border border-red-500/30',
    description: 'Risco financeiro alto. Ação imediata é necessária para reverter o endividamento.',
  }
}

export function getDeterministicRecommendations(
  scores: CategoryScores,
  answers: QuestionnaireAnswers,
): { summary: string; recommendations: string[] } {
  const recs: string[] = []

  // Analyze lowest areas
  if (scores.debts < 60) {
    recs.push(
      'Priorize a quitação ou renegociação de dívidas ativas, especialmente cartão de crédito e cheque especial com juros compostos.',
    )
  }

  if (scores.savings < 50 || answers.emergency_reserve === 'Não possuo') {
    recs.push(
      'Construa sua reserva de emergência guardando de 10% a 15% da sua renda mensal em ativos de liquidez diária até atingir de 3 a 6 meses de despesas.',
    )
  }

  if (scores.expenses < 60 || answers.control_expenses !== 'Sim, sempre') {
    recs.push(
      'Implemente um controle detalhado de despesas com a regra 50/30/20 (necessidades essenciais, estilo de vida e poupança/investimento).',
    )
  }

  if (answers.invest_habit === 'Não invisto' && scores.debts >= 60) {
    recs.push(
      'Comece a investir em produtos seguros de renda fixa (como Tesouro Selic e CDBs com 100% do CDI) para combater a inflação e criar patrimônio.',
    )
  }

  if (answers.financial_goals === 'Não tenho' || answers.financial_goals === 'Mais ou menos') {
    recs.push(
      'Defina metas financeiras claras para curto (1 ano), médio (3 anos) e longo prazo (5+ anos), com valores e prazos estipulados.',
    )
  }

  // Ensure 3-5 recommendations
  if (recs.length < 3) {
    recs.push(
      'Faça uma revisão trimestral de assinaturas e custos recorrentes para eliminar desperdícios invisíveis.',
    )
  }
  if (recs.length < 3) {
    recs.push(
      'Busque fontes de renda complementar ou qualificação profissional para expandir seu potencial de ganhos mensais.',
    )
  }

  let summary = ''
  if (scores.total >= 80) {
    summary =
      'Sua saúde financeira está em nível excelente, com boa sustentabilidade e proteção para o futuro.'
  } else if (scores.total >= 60) {
    summary =
      'Sua saúde financeira está em nível bom, mas a reserva de emergência e investimentos precisam de consolidação.'
  } else if (scores.total >= 40) {
    summary =
      'Sua saúde financeira está em nível regular, exigindo atenção com controle de gastos e formação de colchão financeiro.'
  } else if (scores.total >= 20) {
    summary =
      'Sua saúde financeira acende um alerta importante; reduzir endividamento e rever despesas é indispensável.'
  } else {
    summary =
      'Sua saúde financeira está em nível crítico; adote um plano emergencial para reverter dívidas e equilibrar o caixa.'
  }

  return {
    summary,
    recommendations: recs.slice(0, 4),
  }
}
