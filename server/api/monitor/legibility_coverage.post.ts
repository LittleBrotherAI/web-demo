import { z } from 'zod'
import { eq } from 'drizzle-orm'

defineRouteMeta({
  openAPI: {
    description: 'Webhook endpoint for legibility coverage monitoring results.',
    tags: ['monitoring']
  }
})

export default defineEventHandler(async (event) => {
  // Validate incoming JSON body
  const { message_id, legibility_score, coverage_score } = await readValidatedBody(
    event,
    z.object({
      message_id: z.string().max(255),
      legibility_score: z.number(),
      coverage_score: z.number()
    }).parse
  )

  const db = useDrizzle()

  // Check if message exists
  const message = await db.query.messages.findFirst({
    where: (messages, { eq }) => eq(messages.id, message_id)
  })

  if (!message) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Message not found for the given message_id'
    })
  }

  // Upsert into monitor_legibility_coverage table
  const existing = await db.query.monitorLegibilityCoverage.findFirst({
    where: (monitorLegibilityCoverage, { eq }) => eq(monitorLegibilityCoverage.messageId, message_id)
  })

  if (existing) {
    // Update existing record
    await db
      .update(tables.monitorLegibilityCoverage)
      .set({ legibility_score, coverage_score })
      .where(eq(tables.monitorLegibilityCoverage.messageId, message_id))
  } else {
    // Insert new record
    await db.insert(tables.monitorLegibilityCoverage).values({
      messageId: message_id,
      legibility_score,
      coverage_score
    })
  }

  return {
    success: true,
    message: 'Legibility coverage monitoring result saved successfully',
    message_id,
    legibility_score,
    coverage_score
  }
})
