import { z } from 'zod'

defineRouteMeta({
  openAPI: {
    description: 'Get monitoring results for a specific message.',
    tags: ['monitoring']
  }
})

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(
    event,
    z.object({
      id: z.string()
    }).parse
  )

  const db = useDrizzle()

  // Query all 9 monitor tables in parallel
  const [
    language,
    semantics,
    entailment,
    surprisal,
    reproducibility,
    legibilityCoverage,
    adversarial,
    consistency,
    factcheck
  ] = await Promise.all([
    db.query.monitorLanguage.findFirst({
      where: (monitorLanguage, { eq }) => eq(monitorLanguage.messageId, id)
    }),
    db.query.monitorSemantics.findFirst({
      where: (monitorSemantics, { eq }) => eq(monitorSemantics.messageId, id)
    }),
    db.query.monitorEntailment.findFirst({
      where: (monitorEntailment, { eq }) => eq(monitorEntailment.messageId, id)
    }),
    db.query.monitorSurprisal.findFirst({
      where: (monitorSurprisal, { eq }) => eq(monitorSurprisal.messageId, id)
    }),
    db.query.monitorReproducibility.findFirst({
      where: (monitorReproducibility, { eq }) => eq(monitorReproducibility.messageId, id)
    }),
    db.query.monitorLegibilityCoverage.findFirst({
      where: (monitorLegibilityCoverage, { eq }) => eq(monitorLegibilityCoverage.messageId, id)
    }),
    db.query.monitorAdversarial.findFirst({
      where: (monitorAdversarial, { eq }) => eq(monitorAdversarial.messageId, id)
    }),
    db.query.monitorConsistency.findFirst({
      where: (monitorConsistency, { eq }) => eq(monitorConsistency.messageId, id)
    }),
    db.query.monitorFactcheck.findFirst({
      where: (monitorFactcheck, { eq }) => eq(monitorFactcheck.messageId, id)
    })
  ])

  // Return aggregated monitoring results
  return {
    language: language?.score ?? null,
    semantics: semantics?.score ?? null,
    entailment: entailment?.score ?? null,
    surprisal: surprisal?.surprisal_score ?? null,
    reproducibility: reproducibility?.score ?? null,
    legibility_score: legibilityCoverage?.legibility_score ?? null,
    coverage_score: legibilityCoverage?.coverage_score ?? null,
    adversarial: adversarial
      ? {
          is_adversarial: adversarial.isAdversarial,
          explanation: adversarial.explanation,
          severity: adversarial.severity
        }
      : null,
    consistency: consistency
      ? {
          is_consistent: consistency.isConsistent,
          confidence: consistency.confidence,
          explanation: consistency.explanation
        }
      : null,
    factcheck: factcheck
      ? {
          correctness_score: factcheck.correctness_score,
          explanation: factcheck.explanation
        }
      : null
  }
})
