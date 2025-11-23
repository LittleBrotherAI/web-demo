import { z } from 'zod'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    description: 'Webhook endpoint for consistency NLI monitoring results.',
    tags: ['monitoring']
  }
})

export default defineEventHandler(async (event) => {
  console.log('received POST request at /api/monitor/consistency_nli: ', event)

  // Validate incoming JSON body
  const { label, message_id } = await readValidatedBody(
    event,
    z.object({
      label: z.string(),
      message_id: z.string()
    }).parse
  )

  const db = useDrizzle()

  // Find the monitoring result record by message_id
  const monitoringRecord = await db.query.monitoringResults.findFirst({
    where: (monitoringResults, { eq }) => eq(monitoringResults.messageId, message_id)
  })

  if (!monitoringRecord) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Monitoring record not found for the given message_id'
    })
  }

  // Update the monitoring_results table with the consistency_nli label
  await db
    .update(tables.monitoringResults)
    .set({
      consistency_nli: label
    })
    .where(eq(tables.monitoringResults.messageId, message_id))

  // Check if all monitoring fields are populated to mark as completed
  // const updatedRecord =
  await db.query.monitoringResults.findFirst({
    where: (monitoringResults, { eq }) => eq(monitoringResults.messageId, message_id)
  })

  // If all expected fields are filled, mark as completed
  // Based on the schema, we expect: consistency_language, consistency_semantics, consistency_nli, similarity, understandability
  // if (
  //   updatedRecord &&
  //   updatedRecord.consistency_language !== null &&
  //   updatedRecord.consistency_semantics !== null &&
  //   updatedRecord.consistency_nli !== null &&
  //   updatedRecord.similarity !== null &&
  //   updatedRecord.understandability !== null
  // ) {
  //   await db
  //     .update(tables.monitoringResults)
  //     .set({ completed: true })
  //     .where(eq(tables.monitoringResults.messageId, message_id))
  // }

  console.log('   good life.')
  return {
    success: true,
    message: 'Consistency NLI result saved successfully',
    message_id,
    label
  }
})
