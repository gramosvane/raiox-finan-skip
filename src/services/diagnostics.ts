import pb from '@/lib/pocketbase/client'
import type {
  QuestionnaireAnswers,
  CategoryScores,
  DiagnosticRecord,
  AIReportResponse,
} from '@/types/diagnostic'

export const diagnosticsService = {
  /**
   * List all diagnostic records for current authenticated user (newest first)
   */
  async listUserDiagnostics(): Promise<DiagnosticRecord[]> {
    if (!pb.authStore.isValid || !pb.authStore.record?.id) {
      return []
    }

    const records = await pb.collection('diagnostics').getFullList({
      sort: '-created',
    })

    return records.map((r) => ({
      id: r.id,
      user: r.user,
      total_score: r.total_score,
      income_score: r.income_score,
      expenses_score: r.expenses_score,
      debts_score: r.debts_score,
      savings_score: r.savings_score,
      answers: typeof r.answers === 'string' ? JSON.parse(r.answers) : r.answers,
      summary: r.summary,
      recommendations: Array.isArray(r.recommendations)
        ? r.recommendations
        : typeof r.recommendations === 'string'
          ? JSON.parse(r.recommendations)
          : [],
      created: r.created,
      updated: r.updated,
    }))
  },

  /**
   * Persist a completed diagnostic record for the authenticated user
   */
  async createDiagnostic(data: {
    scores: CategoryScores
    answers: QuestionnaireAnswers
    summary?: string
    recommendations?: string[]
  }): Promise<DiagnosticRecord> {
    const currentUserId = pb.authStore.record?.id
    if (!currentUserId) {
      throw new Error('Usuário não autenticado para salvar diagnóstico.')
    }

    const payload = {
      user: currentUserId,
      total_score: data.scores.total,
      income_score: data.scores.income,
      expenses_score: data.scores.expenses,
      debts_score: data.scores.debts,
      savings_score: data.scores.savings,
      answers: data.answers,
      summary: data.summary || '',
      recommendations: data.recommendations || [],
    }

    const record = await pb.collection('diagnostics').create(payload)

    return {
      id: record.id,
      user: record.user,
      total_score: record.total_score,
      income_score: record.income_score,
      expenses_score: record.expenses_score,
      debts_score: record.debts_score,
      savings_score: record.savings_score,
      answers: data.answers,
      summary: record.summary,
      recommendations: data.recommendations,
      created: record.created,
      updated: record.updated,
    }
  },

  /**
   * Delete a diagnostic record
   */
  async deleteDiagnostic(id: string): Promise<boolean> {
    await pb.collection('diagnostics').delete(id)
    return true
  },

  /**
   * Call AI Gateway fast alias via backend hook
   */
  async requestAIReport(
    scores: CategoryScores,
    answers: QuestionnaireAnswers,
  ): Promise<AIReportResponse> {
    try {
      const res = await pb.send<AIReportResponse>('/backend/v1/ai-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          total_score: scores.total,
          income_score: scores.income,
          expenses_score: scores.expenses,
          debts_score: scores.debts,
          savings_score: scores.savings,
          answers,
        }),
      })
      return res
    } catch (err: unknown) {
      console.warn('AI report generation failed, using fallback:', err)
      return {
        summary: '',
        recommendations: [],
        fallback: true,
      }
    }
  },
}
