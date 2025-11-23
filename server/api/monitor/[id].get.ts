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

  // Find the monitoring result by message ID
  const monitoringResult = await db.query.monitoringResults.findFirst({
    where: (monitoringResults, { eq }) => eq(monitoringResults.messageId, id)
  })

  if (!monitoringResult) {
    return {
      consistency_language: null,
      consistency_semantics: null,
      consistency_nli: null,
      similarity: null,
      understandability: null,
      completed: false
    }
  }

  // Return monitoring results directly from database
  return {
    consistency_language: monitoringResult.consistency_language,
    consistency_semantics: monitoringResult.consistency_semantics,
    consistency_nli: monitoringResult.consistency_nli,
    similarity: monitoringResult.similarity,
    understandability: monitoringResult.understandability,
    completed: monitoringResult.completed,
    createdAt: monitoringResult.createdAt?.toISOString()
  }
})
