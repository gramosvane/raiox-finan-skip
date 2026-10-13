// Hook endpoint for generating AI report summaries and recommendations using Skip AI Gateway `fast` alias
routerAdd(
  'POST',
  '/backend/v1/ai-report',
  (e) => {
    const body = e.requestInfo().body || {}
    const answers = body.answers || {}
    const totalScore = Number(body.total_score ?? 0)
    const incomeScore = Number(body.income_score ?? 0)
    const expensesScore = Number(body.expenses_score ?? 0)
    const debtsScore = Number(body.debts_score ?? 0)
    const savingsScore = Number(body.savings_score ?? 0)

    const prompt = `Você é um consultor financeiro pessoal brasileiro empático, prático e objetivo da plataforma "Raio-X Financeiro".
Com base nos dados a seguir do diagnóstico de saúde financeira do usuário, gere:
1) Um resumo de exatamente 1 frase curta sintetizando a situação financeira atual (destaque ponto forte ou o principal ponto de atenção).
2) Exatamente 3 a 4 recomendações práticas e acionáveis, em português brasileiro, curtas (1 a 2 frases cada), focadas nas categorias com menores notas e nas respostas específicas do usuário.

Dados do usuário:
- Score Geral: ${totalScore}/100
- Score de Renda: ${incomeScore}/100
- Score de Gastos: ${expensesScore}/100
- Score de Dívidas: ${debtsScore}/100
- Score de Reserva e Investimentos: ${savingsScore}/100
- Respostas detalhadas: ${JSON.stringify(answers)}

Responda APENAS em formato JSON válido, sem blocos markdown adicionais, sem preâmbulo, exatamente com as chaves:
{
  "summary": "uma frase resumindo a saúde financeira",
  "recommendations": [
    "primeira recomendação prática",
    "segunda recomendação prática",
    "terceira recomendação prática"
  ]
}`

    try {
      const aiRes = $ai.chat({
        model: 'fast',
        messages: [
          {
            role: 'system',
            content:
              'Você é um especialista em finanças pessoais e responde estritamente em JSON com as chaves summary e recommendations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      const rawContent =
        aiRes.choices && aiRes.choices[0] && aiRes.choices[0].message
          ? aiRes.choices[0].message.content
          : ''

      // Strip markdown code fences if model wrapped the JSON
      let cleaned = rawContent.trim()
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned
          .replace(/^```json\s*/i, '')
          .replace(/```$/, '')
          .trim()
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned
          .replace(/^```\s*/, '')
          .replace(/```$/, '')
          .trim()
      }

      const parsed = JSON.parse(cleaned)
      const summary =
        typeof parsed.summary === 'string' && parsed.summary.trim()
          ? parsed.summary.trim()
          : 'Seu diagnóstico financeiro foi concluído e revela pontos de oportunidade para otimizar suas finanças.'
      const recommendations =
        Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0
          ? parsed.recommendations.map((r) => String(r).trim()).filter((r) => r.length > 0)
          : []

      return e.json(200, {
        summary,
        recommendations:
          recommendations.length > 0
            ? recommendations
            : [
                'Monte um orçamento mensal detalhado acompanhando todas as suas despesas fixas e variáveis.',
                'Priorize a construção da sua reserva de emergência equivalente a 3 a 6 meses do seu custo de vida.',
                'Evite novas dívidas e renegocie eventuais pendências com juros mais altos.',
              ],
      })
    } catch (err) {
      console.log('ai-report hook error: ' + err.message)
      return e.json(503, {
        fallback: true,
        error: 'Falha ao gerar recomendações com IA; utilize o cálculo determinístico local.',
      })
    }
  },
  $apis.requireAuth(),
)
